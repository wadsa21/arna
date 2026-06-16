from rest_framework import serializers

from .models import ChildProfile


class ChildProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChildProfile
        fields = (
            "id",
            "name",
            "age",
            "avatar",
            "communication_level",
            "notes",
            "created_at",
        )
        read_only_fields = ("id", "created_at")
