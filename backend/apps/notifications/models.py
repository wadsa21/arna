import uuid

from django.conf import settings
from django.db import models


class Notification(models.Model):
    class Type(models.TextChoices):
        SCHEDULE_DONE = "SCHEDULE_DONE", "Активность завершена"
        BEHAVIOR_LOG = "BEHAVIOR_LOG", "Запись в дневнике"
        SYSTEM = "SYSTEM", "Системное"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="notifications",
    )
    title = models.CharField(max_length=200)
    body = models.TextField(blank=True)
    type = models.CharField(
        max_length=16, choices=Type.choices, default=Type.SYSTEM
    )
    data = models.JSONField(default=dict, blank=True)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Уведомление"
        verbose_name_plural = "Уведомления"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.title} → {self.user}"
