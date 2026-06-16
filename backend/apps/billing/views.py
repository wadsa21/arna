import secrets

from django.db import transaction
from rest_framework import generics, permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Payment, Plan, ReferralCode, Subscription
from .serializers import (
    PaymentSerializer,
    PlanSerializer,
    ReferralCodeSerializer,
    SubscriptionSerializer,
    UpgradeSerializer,
)
from .services import (
    PaymentService,
    activate_subscription,
    compute_amount,
    get_subscription,
)


class PlanListView(generics.ListAPIView):
    """GET /api/plans/ — публичный список активных тарифов."""

    serializer_class = PlanSerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = None

    def get_queryset(self):
        return Plan.objects.filter(is_active=True)


class SubscriptionViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def list(self, request):
        """GET /api/subscription/ — текущая подписка пользователя."""
        sub = get_subscription(request.user)
        return Response(SubscriptionSerializer(sub).data)

    @action(detail=False, methods=["get"])
    def history(self, request):
        """GET /api/subscription/history/ — история платежей."""
        sub = get_subscription(request.user)
        payments = sub.payments.all()
        return Response(PaymentSerializer(payments, many=True).data)

    @action(detail=False, methods=["post"])
    def cancel(self, request):
        """POST /api/subscription/cancel/ — отключить автопродление."""
        from django.utils import timezone

        sub = get_subscription(request.user)
        sub.auto_renew = False
        sub.cancelled_at = timezone.now()
        if sub.status == Subscription.Status.ACTIVE and sub.plan.is_paid:
            sub.status = Subscription.Status.CANCELLED
        sub.save(update_fields=["auto_renew", "cancelled_at", "status"])
        return Response(SubscriptionSerializer(sub).data)

    @action(detail=False, methods=["post"])
    def upgrade(self, request):
        """
        POST /api/subscription/upgrade/
        body: {plan_id, billing_cycle, payment_method, referral_code?}
        Создаёт платёж (mock), сразу верифицирует и активирует план.
        """
        serializer = UpgradeSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        plan = generics.get_object_or_404(Plan, id=data["plan_id"], is_active=True)
        if plan.is_contact_sales:
            return Response(
                {"error": "contact_sales", "detail": "Свяжитесь с нами по Enterprise."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        sub = get_subscription(request.user)
        referral = None
        code = (data.get("referral_code") or "").strip()
        if code:
            referral = ReferralCode.objects.filter(code=code, is_active=True).first()
            if not referral:
                return Response(
                    {"error": "invalid_referral", "detail": "Код не найден."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        amount, discount = compute_amount(plan, data["billing_cycle"], referral)

        with transaction.atomic():
            payment = Payment.objects.create(
                subscription=sub,
                amount=amount,
                payment_method=data["payment_method"],
                status=Payment.Status.PENDING,
                meta={
                    "plan": plan.name,
                    "billing_cycle": data["billing_cycle"],
                    "referral_code": code or None,
                    "discount": float(discount),
                },
            )
            pay_url = PaymentService.initiate_payment(payment)

            # Mock-шлюз: подтверждаем платёж сразу
            result = PaymentService.verify_payment(payment.transaction_id)
            payment.status = result
            payment.save(update_fields=["status"])

            if result == Payment.Status.SUCCESS:
                activate_subscription(sub, plan, data["billing_cycle"])
                if referral:
                    ReferralCode.objects.filter(pk=referral.pk).update(
                        uses_count=referral.uses_count + 1
                    )

        return Response(
            {
                "payment_url": pay_url,
                "payment": PaymentSerializer(payment).data,
                "subscription": SubscriptionSerializer(sub).data,
            },
            status=status.HTTP_200_OK,
        )


class PaymentInitiateView(APIView):
    """POST /api/payments/initiate/ — создать платёж, вернуть ссылку на оплату."""

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = UpgradeSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        plan = generics.get_object_or_404(Plan, id=data["plan_id"], is_active=True)
        sub = get_subscription(request.user)
        referral = None
        code = (data.get("referral_code") or "").strip()
        if code:
            referral = ReferralCode.objects.filter(code=code, is_active=True).first()
        amount, discount = compute_amount(plan, data["billing_cycle"], referral)

        payment = Payment.objects.create(
            subscription=sub,
            amount=amount,
            payment_method=data["payment_method"],
            meta={
                "plan": plan.name,
                "billing_cycle": data["billing_cycle"],
                "referral_code": code or None,
            },
        )
        url = PaymentService.initiate_payment(payment)
        return Response({"payment_url": url, "payment_id": str(payment.id)})


class PaymentWebhookView(APIView):
    """POST /api/payments/webhook/ — вебхук платёжной системы (Kaspi/банк)."""

    permission_classes = [permissions.AllowAny]

    def post(self, request):
        from .models import PaymentEvent

        txn = request.data.get("transaction_id")
        PaymentEvent.objects.create(
            event_type="webhook", payload=dict(request.data)
        )
        payment = Payment.objects.filter(transaction_id=txn).first()
        if not payment:
            return Response({"detail": "unknown transaction"}, status=404)

        result = PaymentService.verify_payment(txn)
        payment.status = result
        payment.save(update_fields=["status"])
        if result == Payment.Status.SUCCESS:
            meta = payment.meta or {}
            plan = Plan.objects.filter(name=meta.get("plan")).first()
            if plan:
                activate_subscription(
                    payment.subscription, plan, meta.get("billing_cycle", "MONTHLY")
                )
        return Response({"status": "ok"})


class PaymentHistoryView(generics.ListAPIView):
    serializer_class = PaymentSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = None

    def get_queryset(self):
        sub = get_subscription(self.request.user)
        return sub.payments.all()


class ReferralViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=["get"], url_path="my-code")
    def my_code(self, request):
        """GET /api/referral/my-code/ — получить/создать свой код."""
        ref = ReferralCode.objects.filter(owner=request.user).first()
        if not ref:
            ref = ReferralCode.objects.create(
                owner=request.user,
                code=f"ARNA{secrets.token_hex(3).upper()}",
            )
        return Response(ReferralCodeSerializer(ref).data)

    @action(detail=False, methods=["get"])
    def stats(self, request):
        """GET /api/referral/stats/ — статистика по коду."""
        ref = ReferralCode.objects.filter(owner=request.user).first()
        if not ref:
            return Response({"detail": "Код ещё не создан."}, status=404)
        return Response(ReferralCodeSerializer(ref).data)

    @action(detail=False, methods=["post"])
    def validate(self, request):
        """POST /api/referral/validate/ — проверить код при регистрации/оплате."""
        code = (request.data.get("code") or "").strip()
        ref = ReferralCode.objects.filter(code=code, is_active=True).first()
        if not ref:
            return Response({"valid": False}, status=200)
        return Response(
            {
                "valid": True,
                "discount_percent": ref.discount_percent,
                "code": ref.code,
            }
        )
