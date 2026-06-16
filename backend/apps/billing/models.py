import uuid

from django.conf import settings
from django.db import models
from django.utils import timezone


class Plan(models.Model):
    """Тарифный план. Все цены и лимиты хранятся в БД, не в коде."""

    class Name(models.TextChoices):
        FREE = "FREE", "Бесплатный"
        OTBASY = "OTBASY", "Отбасы"
        PRO = "PRO", "Pro"
        ENTERPRISE = "ENTERPRISE", "Enterprise"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=12, choices=Name.choices, unique=True)
    price_monthly = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    price_yearly = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    # null = безлимит
    max_children = models.IntegerField(null=True, blank=True)
    max_cards = models.IntegerField(null=True, blank=True)
    # FREE: расписание только на сегодня
    schedule_any_date = models.BooleanField(default=False)

    has_behavior_log = models.BooleanField(default=False)
    has_realtime = models.BooleanField(default=False)
    has_pdf_export = models.BooleanField(default=False)
    has_ai = models.BooleanField(default=False)
    has_api_access = models.BooleanField(default=False)
    has_white_label = models.BooleanField(default=False)
    has_priority_support = models.BooleanField(default=False)
    multi_admin = models.BooleanField(default=False)

    is_active = models.BooleanField(default=True)
    # Порядок отображения и «выделенность» (PRO) на странице тарифов
    sort_order = models.PositiveSmallIntegerField(default=0)
    is_featured = models.BooleanField(default=False)
    is_contact_sales = models.BooleanField(default=False)

    class Meta:
        verbose_name = "Тариф"
        verbose_name_plural = "Тарифы"
        ordering = ["sort_order"]

    def __str__(self):
        return self.get_name_display()

    @property
    def is_paid(self):
        return self.price_monthly > 0


class Subscription(models.Model):
    class Status(models.TextChoices):
        ACTIVE = "ACTIVE", "Активна"
        CANCELLED = "CANCELLED", "Отменена"
        EXPIRED = "EXPIRED", "Истекла"
        TRIAL = "TRIAL", "Пробный период"

    class BillingCycle(models.TextChoices):
        MONTHLY = "MONTHLY", "Ежемесячно"
        YEARLY = "YEARLY", "Ежегодно"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="subscription",
    )
    plan = models.ForeignKey(
        Plan, on_delete=models.PROTECT, related_name="subscriptions"
    )
    status = models.CharField(
        max_length=10, choices=Status.choices, default=Status.ACTIVE
    )
    billing_cycle = models.CharField(
        max_length=8, choices=BillingCycle.choices, default=BillingCycle.MONTHLY
    )
    started_at = models.DateTimeField(default=timezone.now)
    expires_at = models.DateTimeField(null=True, blank=True)  # null = бессрочно (FREE)
    cancelled_at = models.DateTimeField(null=True, blank=True)
    auto_renew = models.BooleanField(default=True)

    class Meta:
        verbose_name = "Подписка"
        verbose_name_plural = "Подписки"

    def __str__(self):
        return f"{self.user} · {self.plan.name} ({self.status})"

    @property
    def is_active(self):
        if self.status not in (self.Status.ACTIVE, self.Status.TRIAL):
            return False
        if self.expires_at and self.expires_at < timezone.now():
            return False
        return True

    @property
    def days_left(self):
        if not self.expires_at:
            return None
        delta = self.expires_at - timezone.now()
        return max(delta.days, 0)


class Payment(models.Model):
    class Status(models.TextChoices):
        PENDING = "PENDING", "Ожидает"
        SUCCESS = "SUCCESS", "Успешно"
        FAILED = "FAILED", "Ошибка"
        REFUNDED = "REFUNDED", "Возврат"

    class Method(models.TextChoices):
        KASPI = "KASPI", "Kaspi Pay"
        CARD = "CARD", "Карта"
        TRANSFER = "TRANSFER", "Перевод"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    subscription = models.ForeignKey(
        Subscription, on_delete=models.CASCADE, related_name="payments"
    )
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=3, default="KZT")
    status = models.CharField(
        max_length=10, choices=Status.choices, default=Status.PENDING
    )
    payment_method = models.CharField(max_length=10, choices=Method.choices)
    transaction_id = models.CharField(max_length=128, null=True, blank=True)
    # Снимок параметров заказа (план, цикл, реферал) на момент платежа
    meta = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Платёж"
        verbose_name_plural = "Платежи"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.amount} {self.currency} · {self.status}"


class PaymentEvent(models.Model):
    """Audit-лог всех платёжных событий — для безопасности и дебага."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    payment = models.ForeignKey(
        Payment,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="events",
    )
    event_type = models.CharField(max_length=64)  # initiated, webhook, verified…
    payload = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Платёжное событие"
        verbose_name_plural = "Платёжные события (audit)"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.event_type} @ {self.created_at:%Y-%m-%d %H:%M}"


class ReferralCode(models.Model):
    """Реферальный код логопеда/психолога: скидка клиенту + комиссия владельцу."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="referral_codes",
    )
    code = models.CharField(max_length=32, unique=True)
    discount_percent = models.PositiveSmallIntegerField(default=10)
    commission_percent = models.PositiveSmallIntegerField(default=20)
    uses_count = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Реферальный код"
        verbose_name_plural = "Реферальные коды"

    def __str__(self):
        return f"{self.code} (-{self.discount_percent}%)"
