from django.contrib import admin

from .models import (
    Payment,
    PaymentEvent,
    Plan,
    ReferralCode,
    Subscription,
)


@admin.register(Plan)
class PlanAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "price_monthly",
        "price_yearly",
        "max_children",
        "max_cards",
        "is_featured",
        "is_active",
    )
    list_editable = ("is_active",)


@admin.register(Subscription)
class SubscriptionAdmin(admin.ModelAdmin):
    list_display = ("user", "plan", "status", "billing_cycle", "expires_at", "auto_renew")
    list_filter = ("status", "plan", "billing_cycle")
    search_fields = ("user__email",)


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ("amount", "currency", "status", "payment_method", "created_at")
    list_filter = ("status", "payment_method")
    readonly_fields = ("transaction_id", "meta")


@admin.register(PaymentEvent)
class PaymentEventAdmin(admin.ModelAdmin):
    list_display = ("event_type", "payment", "created_at")
    list_filter = ("event_type",)
    readonly_fields = ("payload",)


@admin.register(ReferralCode)
class ReferralCodeAdmin(admin.ModelAdmin):
    list_display = ("code", "owner", "discount_percent", "commission_percent", "uses_count")
    search_fields = ("code", "owner__email")
