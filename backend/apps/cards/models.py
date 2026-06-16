import uuid

from django.conf import settings
from django.db import models

from apps.children.models import ChildProfile


class CommunicationCard(models.Model):
    class Category(models.TextChoices):
        NEEDS = "NEEDS", "Потребности"
        EMOTIONS = "EMOTIONS", "Эмоции"
        ACTIONS = "ACTIONS", "Действия"
        FOOD = "FOOD", "Еда"
        PLACES = "PLACES", "Места"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    child = models.ForeignKey(
        ChildProfile, on_delete=models.CASCADE, related_name="cards"
    )
    title_kk = models.CharField(max_length=120)
    title_ru = models.CharField(max_length=120)
    image = models.ImageField(upload_to="cards/", null=True, blank=True)
    emoji = models.CharField(max_length=16, blank=True, default="🗣️")
    category = models.CharField(
        max_length=10, choices=Category.choices, default=Category.NEEDS
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name="created_cards",
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Карточка коммуникации"
        verbose_name_plural = "Карточки коммуникации"
        ordering = ["category", "title_ru"]

    def __str__(self):
        return f"{self.emoji} {self.title_ru}"
