from PIL import Image
from rest_framework import serializers

from apps.children.models import ChildProfile

from .models import CommunicationCard

MAX_IMAGE_SIDE = 800  # px — ужимаем большие загрузки


class CommunicationCardSerializer(serializers.ModelSerializer):
    class Meta:
        model = CommunicationCard
        fields = (
            "id",
            "child",
            "title_kk",
            "title_ru",
            "image",
            "emoji",
            "category",
            "is_active",
            "created_at",
        )
        read_only_fields = ("id", "created_at")

    def validate_child(self, value: ChildProfile):
        request = self.context.get("request")
        if request and value.parent != request.user and request.user.role != "ADMIN":
            raise serializers.ValidationError("Это не ваш ребёнок.")
        return value

    def _process_image(self, card):
        """Сжимаем изображение карточки через Pillow."""
        if not card.image:
            return
        try:
            img = Image.open(card.image.path)
            if max(img.size) > MAX_IMAGE_SIDE:
                img.thumbnail((MAX_IMAGE_SIDE, MAX_IMAGE_SIDE))
                img.save(card.image.path, optimize=True, quality=85)
        except (FileNotFoundError, OSError):
            pass

    def create(self, validated_data):
        card = super().create(validated_data)
        self._process_image(card)
        return card

    def update(self, instance, validated_data):
        card = super().update(instance, validated_data)
        if "image" in validated_data:
            self._process_image(card)
        return card
