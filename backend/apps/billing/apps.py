from django.apps import AppConfig


class BillingConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.billing"
    label = "billing"
    verbose_name = "Монетизация"

    def ready(self):
        # Регистрируем сигнал автосоздания FREE-подписки
        from . import signals  # noqa: F401
