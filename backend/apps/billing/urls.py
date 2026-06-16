from django.urls import path

from .views import (
    PaymentHistoryView,
    PaymentInitiateView,
    PaymentWebhookView,
    PlanListView,
    ReferralViewSet,
    SubscriptionViewSet,
)

subscription_list = SubscriptionViewSet.as_view({"get": "list"})
subscription_history = SubscriptionViewSet.as_view({"get": "history"})
subscription_cancel = SubscriptionViewSet.as_view({"post": "cancel"})
subscription_upgrade = SubscriptionViewSet.as_view({"post": "upgrade"})

referral_my_code = ReferralViewSet.as_view({"get": "my_code"})
referral_stats = ReferralViewSet.as_view({"get": "stats"})
referral_validate = ReferralViewSet.as_view({"post": "validate"})

urlpatterns = [
    path("plans/", PlanListView.as_view(), name="plans"),

    path("subscription/", subscription_list, name="subscription"),
    path("subscription/history/", subscription_history, name="subscription-history"),
    path("subscription/cancel/", subscription_cancel, name="subscription-cancel"),
    path("subscription/upgrade/", subscription_upgrade, name="subscription-upgrade"),

    path("payments/initiate/", PaymentInitiateView.as_view(), name="payment-initiate"),
    path("payments/webhook/", PaymentWebhookView.as_view(), name="payment-webhook"),
    path("payments/history/", PaymentHistoryView.as_view(), name="payment-history"),

    path("referral/my-code/", referral_my_code, name="referral-my-code"),
    path("referral/stats/", referral_stats, name="referral-stats"),
    path("referral/validate/", referral_validate, name="referral-validate"),
]
