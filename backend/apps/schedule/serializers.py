from rest_framework import serializers

from apps.children.models import ChildProfile

from .models import Schedule, ScheduleItem


class ScheduleItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = ScheduleItem
        fields = (
            "id",
            "schedule",
            "title_kk",
            "title_ru",
            "emoji",
            "icon",
            "start_time",
            "duration_minutes",
            "status",
            "order",
            "completed_at",
            "ai_suggested",
        )
        read_only_fields = ("id", "completed_at")
        extra_kwargs = {"schedule": {"required": False}}


class ScheduleSerializer(serializers.ModelSerializer):
    items = ScheduleItemSerializer(many=True, read_only=True)
    child_name = serializers.CharField(source="child.name", read_only=True)
    progress = serializers.SerializerMethodField()

    class Meta:
        model = Schedule
        fields = (
            "id",
            "child",
            "child_name",
            "date",
            "items",
            "progress",
            "created_at",
        )
        read_only_fields = ("id", "created_at")

    def get_progress(self, obj):
        items = obj.items.all()
        total = len(items)
        if not total:
            return {"done": 0, "total": 0, "percent": 0}
        done = sum(1 for i in items if i.status == ScheduleItem.Status.DONE)
        return {
            "done": done,
            "total": total,
            "percent": round(done / total * 100),
        }

    def validate_child(self, value: ChildProfile):
        request = self.context.get("request")
        if request and value.parent != request.user and request.user.role != "ADMIN":
            raise serializers.ValidationError("Это не ваш ребёнок.")
        return value


class ScheduleCopySerializer(serializers.Serializer):
    """Копирование расписания на другие даты."""

    target_dates = serializers.ListField(
        child=serializers.DateField(), allow_empty=False
    )
