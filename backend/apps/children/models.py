import uuid

from django.conf import settings
from django.db import models


class ChildProfile(models.Model):
    class CommunicationLevel(models.TextChoices):
        LOW = "LOW", "Низкий"
        MEDIUM = "MEDIUM", "Средний"
        HIGH = "HIGH", "Высокий"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    parent = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="children",
    )
    name = models.CharField(max_length=120)
    age = models.PositiveSmallIntegerField(null=True, blank=True)
    avatar = models.ImageField(upload_to="children/", null=True, blank=True)
    communication_level = models.CharField(
        max_length=6,
        choices=CommunicationLevel.choices,
        default=CommunicationLevel.MEDIUM,
    )
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Профиль ребёнка"
        verbose_name_plural = "Профили детей"
        ordering = ["name"]

    def __str__(self):
        return self.name
