"""
Сервисный слой биллинга: доступ к подписке, подсчёт использования,
проверка лимитов и mock-платёжный шлюз (Kaspi Pay).
"""
import uuid
from datetime import timedelta

from django.utils import timezone
from rest_framework.exceptions import APIException
from rest_framework import status

from .models import Payment, PaymentEvent, Plan, ReferralCode, Subscription


class UpgradeRequired(APIException):
    """403 с машинно-читаемым телом для фронта (показываем UpgradePrompt)."""

    status_code = status.HTTP_403_FORBIDDEN
    default_code = "upgrade_required"

    def __init__(self, message, current_plan=None, required_plan=None):
        super().__init__(
            {
                "error": "upgrade_required",
                "detail": message,
                "current_plan": current_plan,
                "required_plan": required_plan,
            }
        )


def get_subscription(user) -> Subscription:
    """Вернуть подписку пользователя; если её нет — лениво создать FREE."""
    sub = Subscription.objects.filter(user=user).select_related("plan").first()
    if sub:
        return sub
    free = Plan.objects.filter(name=Plan.Name.FREE).first()
    sub, _ = Subscription.objects.get_or_create(
        user=user,
        defaults={"plan": free} if free else {},
    )
    return sub


def get_usage(user) -> dict:
    """Текущее использование лимитов пользователем."""
    from apps.cards.models import CommunicationCard
    from apps.children.models import ChildProfile

    return {
        "children": ChildProfile.objects.filter(parent=user).count(),
        "cards": CommunicationCard.objects.filter(child__parent=user).count(),
    }


def _plan_for_feature(feature: str) -> str:
    """Минимальный план, в котором фича появляется (для текста апгрейда)."""
    mapping = {
        "has_behavior_log": "OTBASY",
        "has_realtime": "OTBASY",
        "has_pdf_export": "OTBASY",
        "has_ai": "PRO",
        "has_api_access": "ENTERPRISE",
    }
    return mapping.get(feature, "OTBASY")


def require_feature(user, feature: str):
    """Бросает UpgradeRequired, если у плана пользователя нет фичи."""
    sub = get_subscription(user)
    if not sub.is_active or not getattr(sub.plan, feature, False):
        raise UpgradeRequired(
            message=f"Функция доступна на платном тарифе.",
            current_plan=sub.plan.name if sub.plan else "FREE",
            required_plan=_plan_for_feature(feature),
        )


def enforce_child_limit(user):
    sub = get_subscription(user)
    limit = sub.plan.max_children if sub.plan else 1
    if limit is not None and get_usage(user)["children"] >= limit:
        raise UpgradeRequired(
            message=f"Лимит детей на тарифе {sub.plan.name}: {limit}.",
            current_plan=sub.plan.name,
            required_plan="OTBASY" if sub.plan.name == "FREE" else "PRO",
        )


def enforce_card_limit(user):
    sub = get_subscription(user)
    limit = sub.plan.max_cards if sub.plan else 10
    if limit is not None and get_usage(user)["cards"] >= limit:
        raise UpgradeRequired(
            message=f"Лимит карточек на тарифе {sub.plan.name}: {limit}.",
            current_plan=sub.plan.name,
            required_plan="OTBASY" if sub.plan.name == "FREE" else "PRO",
        )


# --------------------------------------------------------------------------
# Mock платёжный шлюз. Реальный SDK (Kaspi/банк) подключается позже —
# интерфейс initiate_payment / verify_payment остаётся прежним.
# --------------------------------------------------------------------------
class PaymentService:
    @staticmethod
    def _log(event_type, payment=None, **payload):
        PaymentEvent.objects.create(
            payment=payment, event_type=event_type, payload=payload
        )

    @classmethod
    def initiate_payment(cls, payment: Payment) -> str:
        """Создаёт платёж и возвращает (фейковую) ссылку на оплату."""
        fake_txn = f"mock_{uuid.uuid4().hex[:16]}"
        payment.transaction_id = fake_txn
        payment.status = Payment.Status.PENDING
        payment.save(update_fields=["transaction_id", "status"])
        cls._log("initiated", payment, transaction_id=fake_txn)
        # В реале — редирект на платёжную страницу банка/Kaspi
        return f"https://pay.mock.arna.kz/checkout/{fake_txn}"

    @classmethod
    def verify_payment(cls, transaction_id: str) -> str:
        """Проверка статуса платежа. Mock: всегда SUCCESS."""
        cls._log("verified", None, transaction_id=transaction_id, result="SUCCESS")
        return Payment.Status.SUCCESS


def compute_amount(plan: Plan, billing_cycle: str, referral: ReferralCode | None):
    """Итоговая сумма с учётом цикла и реферальной скидки."""
    base = (
        plan.price_yearly
        if billing_cycle == Subscription.BillingCycle.YEARLY
        else plan.price_monthly
    )
    discount = 0
    if referral and referral.is_active:
        discount = base * referral.discount_percent / 100
    return base - discount, discount


def activate_subscription(subscription: Subscription, plan: Plan, billing_cycle: str):
    """Перевести подписку на новый план после успешной оплаты."""
    now = timezone.now()
    period = (
        timedelta(days=365)
        if billing_cycle == Subscription.BillingCycle.YEARLY
        else timedelta(days=30)
    )
    subscription.plan = plan
    subscription.billing_cycle = billing_cycle
    subscription.status = Subscription.Status.ACTIVE
    subscription.started_at = now
    subscription.expires_at = now + period if plan.is_paid else None
    subscription.cancelled_at = None
    subscription.auto_renew = True
    subscription.save()
    return subscription
