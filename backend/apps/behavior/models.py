import uuid

from django.conf import settings
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models

from apps.children.models import ChildProfile


class BehaviorLog(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    child = models.ForeignKey(
        ChildProfile, on_delete=models.CASCADE, related_name="behavior_logs"
    )
    logged_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name="behavior_logs",
    )
    date = models.DateField()
    mood = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        help_text="Настроение от 1 (плохо) до 5 (отлично)",
    )
    notes = models.TextField(blank=True)
    triggers = models.TextField(blank=True, help_text="Что вызвало стресс")
    positive_moments = models.TextField(blank=True, help_text="Позитивные моменты")
    created_at = models.DateTimeField(auto_now_add=True)

    # --- Задел под ИИ: сюда consumer arna.ai.analyze будет писать инсайты ---
    ai_insights = models.JSONField(null=True, blank=True)

    class Meta:
        verbose_name = "Запись дневника поведения"
        verbose_name_plural = "Дневник поведения"
        ordering = ["-date", "-created_at"]

    def __str__(self):
        return f"{self.child.name} — {self.date} (настроение {self.mood})"
