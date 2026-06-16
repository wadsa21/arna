from rest_framework import serializers

from apps.children.models import ChildProfile

from .models import BehaviorLog


class BehaviorLogSerializer(serializers.ModelSerializer):
    child_name = serializers.CharField(source="child.name", read_only=True)

    class Meta:
        model = BehaviorLog
        fields = (
            "id",
            "child",
            "child_name",
            "date",
            "mood",
            "notes",
            "triggers",
            "positive_moments",
            "ai_insights",
            "created_at",
        )
        read_only_fields = ("id", "created_at", "ai_insights")

    def validate_child(self, value: ChildProfile):
        request = self.context.get("request")
        if request and value.parent != request.user and request.user.role != "ADMIN":
            raise serializers.ValidationError("Это не ваш ребёнок.")
        return value
