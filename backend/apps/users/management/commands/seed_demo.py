"""
Наполнение БД демо-данными для разработки/демонстрации.

    python manage.py seed_demo
"""
import datetime as dt

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.utils import timezone

from apps.behavior.models import BehaviorLog
from apps.cards.models import CommunicationCard
from apps.children.models import ChildProfile
from apps.schedule.models import Schedule, ScheduleItem

User = get_user_model()


SCHEDULE_TEMPLATE = [
    ("Ояну", "Подъём", "☀️", "07:30", 15),
    ("Тіс тазалау", "Чистим зубы", "🪥", "07:45", 10),
    ("Таңғы ас", "Завтрак", "🥣", "08:00", 30),
    ("Ойын", "Игра", "🧩", "09:00", 45),
    ("Сабақ", "Занятие", "📚", "10:00", 30),
    ("Серуен", "Прогулка", "🌳", "11:00", 60),
    ("Түскі ас", "Обед", "🍲", "13:00", 40),
    ("Демалу", "Тихий час", "😴", "14:00", 90),
]

CARDS_TEMPLATE = [
    ("Су ішкім келеді", "Хочу пить", "💧", "NEEDS"),
    ("Қарным ашты", "Я голоден", "🍎", "NEEDS"),
    ("Дәретханаға", "В туалет", "🚽", "NEEDS"),
    ("Қуаныштымын", "Мне радостно", "😄", "EMOTIONS"),
    ("Қорқam", "Мне страшно", "😨", "EMOTIONS"),
    ("Шаршадым", "Я устал", "😴", "EMOTIONS"),
    ("Ойнағым келеді", "Хочу играть", "🧸", "ACTIONS"),
    ("Үйге", "Домой", "🏠", "PLACES"),
]


class Command(BaseCommand):
    help = "Заполнить БД демо-данными (родитель + ребёнок + расписание + карточки)"

    def handle(self, *args, **options):
        parent, created = User.objects.get_or_create(
            email="parent@arna.kz",
            defaults={"full_name": "Айгерім Қасымова", "role": User.Role.PARENT},
        )
        if created:
            parent.set_password("arna1234")
            parent.save()
            self.stdout.write(self.style.SUCCESS("Создан родитель parent@arna.kz / arna1234"))

        child, _ = ChildProfile.objects.get_or_create(
            parent=parent,
            name="Алихан",
            defaults={
                "age": 6,
                "communication_level": ChildProfile.CommunicationLevel.MEDIUM,
                "notes": "Любит динозавров и пазлы.",
            },
        )

        today = timezone.localdate()
        schedule, _ = Schedule.objects.get_or_create(
            child=child, date=today, defaults={"created_by": parent}
        )
        if not schedule.items.exists():
            for order, (kk, ru, emoji, start, dur) in enumerate(SCHEDULE_TEMPLATE):
                ScheduleItem.objects.create(
                    schedule=schedule,
                    title_kk=kk,
                    title_ru=ru,
                    emoji=emoji,
                    start_time=dt.time.fromisoformat(start),
                    duration_minutes=dur,
                    order=order,
                )
            self.stdout.write(self.style.SUCCESS(f"Создано расписание на {today}"))

        for kk, ru, emoji, category in CARDS_TEMPLATE:
            CommunicationCard.objects.get_or_create(
                child=child,
                title_ru=ru,
                defaults={
                    "title_kk": kk,
                    "emoji": emoji,
                    "category": category,
                    "created_by": parent,
                },
            )

        # Дневник поведения за последнюю неделю
        for i in range(7):
            day = today - dt.timedelta(days=i)
            BehaviorLog.objects.get_or_create(
                child=child,
                date=day,
                defaults={
                    "logged_by": parent,
                    "mood": (i % 5) + 1,
                    "notes": "Хороший день.",
                    "positive_moments": "Сам собрал пазл.",
                },
            )

        self.stdout.write(self.style.SUCCESS("Демо-данные готовы! 🎉"))
        self.stdout.write(f"Ребёнок ID: {child.id}")
