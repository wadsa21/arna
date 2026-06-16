import uuid

from django.conf import settings
from django.db import models
from django.utils import timezone

from apps.children.models import ChildProfile


class Schedule(models.Model):
    """Расписание на конкретный день для конкретного ребёнка."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    child = models.ForeignKey(
        ChildProfile, on_delete=models.CASCADE, related_name="schedules"
    )
    date = models.DateField()
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name="created_schedules",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Расписание"
        verbose_name_plural = "Расписания"
        ordering = ["-date"]
        unique_together = ("child", "date")

    def __str__(self):
        return f"{self.child.name} — {self.date}"


class ScheduleItem(models.Model):
    class Status(models.TextChoices):
        PENDING = "PENDING", "Ожидает"
        IN_PROGRESS = "IN_PROGRESS", "В процессе"
        DONE = "DONE", "Выполнено"
        SKIPPED = "SKIPPED", "Пропущено"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    schedule = models.ForeignKey(
        Schedule, on_delete=models.CASCADE, related_name="items"
    )
    title_kk = models.CharField(max_length=200)
    title_ru = models.CharField(max_length=200)
    # Эмодзи-строка или загруженная иконка — поддерживаем оба варианта
    emoji = models.CharField(max_length=16, blank=True, default="📌")
    icon = models.ImageField(upload_to="schedule_icons/", null=True, blank=True)
    start_time = models.TimeField(null=True, blank=True)
    duration_minutes = models.PositiveIntegerField(default=30)
    status = models.CharField(
        max_length=12, choices=Status.choices, default=Status.PENDING
    )
    order = models.PositiveIntegerField(default=0)
    completed_at = models.DateTimeField(null=True, blank=True)

    # --- Задел под ИИ ---
    ai_suggested = models.BooleanField(default=False)

    class Meta:
        verbose_name = "Элемент расписания"
        verbose_name_plural = "Элементы расписания"
        ordering = ["order", "start_time"]

    def __str__(self):
        return f"{self.emoji} {self.title_ru}"

    def mark_done(self):
        self.status = self.Status.DONE
        self.completed_at = timezone.now()
        self.save(update_fields=["status", "completed_at"])
