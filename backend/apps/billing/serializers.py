from rest_framework import serializers

from .models import Payment, Plan, ReferralCode, Subscription


class PlanSerializer(serializers.ModelSerializer):
    display_name = serializers.CharField(source="get_name_display", read_only=True)

    class Meta:
        model = Plan
        fields = (
            "id",
            "name",
            "display_name",
            "price_monthly",
            "price_yearly",
            "max_children",
            "max_cards",
            "schedule_any_date",
            "has_behavior_log",
            "has_realtime",
            "has_pdf_export",
            "has_ai",
            "has_api_access",
            "has_white_label",
            "has_priority_support",
            "multi_admin",
            "is_featured",
            "is_contact_sales",
            "sort_order",
        )


class SubscriptionSerializer(serializers.ModelSerializer):
    plan = PlanSerializer(read_only=True)
    is_active = serializers.BooleanField(read_only=True)
    days_left = serializers.IntegerField(read_only=True)
    usage = serializers.SerializerMethodField()

    class Meta:
        model = Subscription
        fields = (
            "id",
            "plan",
            "status",
            "billing_cycle",
            "started_at",
            "expires_at",
            "cancelled_at",
            "auto_renew",
            "is_active",
            "days_left",
            "usage",
        )

    def get_usage(self, obj):
        from .services import get_usage

        return get_usage(obj.user)


class PaymentSerializer(serializers.ModelSerializer):
    plan_name = serializers.CharField(source="subscription.plan.name", read_only=True)

    class Meta:
        model = Payment
        fields = (
            "id",
            "amount",
            "currency",
            "status",
            "payment_method",
            "transaction_id",
            "plan_name",
            "created_at",
        )


class UpgradeSerializer(serializers.Serializer):
    plan_id = serializers.UUIDField()
    billing_cycle = serializers.ChoiceField(
        choices=Subscription.BillingCycle.choices,
        default=Subscription.BillingCycle.MONTHLY,
    )
    payment_method = serializers.ChoiceField(choices=Payment.Method.choices)
    referral_code = serializers.CharField(required=False, allow_blank=True)


class ReferralCodeSerializer(serializers.ModelSerializer):
    earned = serializers.SerializerMethodField()

    class Meta:
        model = ReferralCode
        fields = (
            "id",
            "code",
            "discount_percent",
            "commission_percent",
            "uses_count",
            "earned",
            "created_at",
        )

    def get_earned(self, obj):
        # Сумма комиссий по успешным платежам с этим кодом
        from django.db.models import Sum

        from .models import Payment

        agg = Payment.objects.filter(
            status=Payment.Status.SUCCESS, meta__referral_code=obj.code
        ).aggregate(total=Sum("amount"))
        total = agg["total"] or 0
        return round(float(total) * obj.commission_percent / 100, 2)
