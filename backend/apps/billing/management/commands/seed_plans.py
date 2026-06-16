"""
Создаёт/обновляет 4 тарифа с ценами и лимитами.

    python manage.py seed_plans
"""
from django.core.management.base import BaseCommand

from apps.billing.models import Plan

PLANS = [
    {
        "name": Plan.Name.FREE,
        "price_monthly": 0,
        "price_yearly": 0,
        "max_children": 1,
        "max_cards": 10,
        "schedule_any_date": False,
        "has_behavior_log": False,
        "has_realtime": False,
        "has_pdf_export": False,
        "has_ai": False,
        "has_api_access": False,
        "sort_order": 1,
    },
    {
        "name": Plan.Name.OTBASY,
        "price_monthly": 2500,
        "price_yearly": 25000,
        "max_children": 3,
        "max_cards": None,
        "schedule_any_date": True,
        "has_behavior_log": True,
        "has_realtime": True,
        "has_pdf_export": True,
        "has_ai": False,
        "has_api_access": False,
        "sort_order": 2,
    },
    {
        "name": Plan.Name.PRO,
        "price_monthly": 5000,
        "price_yearly": 50000,
        "max_children": None,
        "max_cards": None,
        "schedule_any_date": True,
        "has_behavior_log": True,
        "has_realtime": True,
        "has_pdf_export": True,
        "has_ai": True,
        "has_api_access": False,
        "has_white_label": True,
        "has_priority_support": True,
        "is_featured": True,
        "sort_order": 3,
    },
    {
        "name": Plan.Name.ENTERPRISE,
        "price_monthly": 0,
        "price_yearly": 0,
        "max_children": None,
        "max_cards": None,
        "schedule_any_date": True,
        "has_behavior_log": True,
        "has_realtime": True,
        "has_pdf_export": True,
        "has_ai": True,
        "has_api_access": True,
        "has_white_label": True,
        "has_priority_support": True,
        "multi_admin": True,
        "is_contact_sales": True,
        "sort_order": 4,
    },
]


class Command(BaseCommand):
    help = "Создать/обновить тарифные планы"

    def handle(self, *args, **options):
        for data in PLANS:
            plan, created = Plan.objects.update_or_create(
                name=data["name"], defaults=data
            )
            verb = "создан" if created else "обновлён"
            self.stdout.write(
                self.style.SUCCESS(f"Тариф {plan.name} {verb}")
            )
        self.stdout.write(self.style.SUCCESS("Тарифы готовы 💳"))
