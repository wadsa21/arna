from rest_framework import permissions, viewsets

from apps.common.permissions import IsParent
from apps.billing.permissions import RequirePlanFeature
from kafka.producer import publish_behavior_logged

from .models import BehaviorLog
from .serializers import BehaviorLogSerializer


class BehaviorLogViewSet(viewsets.ModelViewSet):
    serializer_class = BehaviorLogSerializer
    # Дневник поведения — фича платных тарифов (has_behavior_log)
    permission_classes = [
        permissions.IsAuthenticated,
        IsParent,
        RequirePlanFeature.for_("has_behavior_log"),
    ]
    filterset_fields = ["child", "date", "mood"]
    ordering_fields = ["date", "created_at", "mood"]

    def get_queryset(self):
        user = self.request.user
        qs = BehaviorLog.objects.select_related("child").all()
        if user.role == "ADMIN":
            return qs
        return qs.filter(child__parent=user)

    def perform_create(self, serializer):
        log = serializer.save(logged_by=self.request.user)
        # Публикуем событие в Kafka (задел под ИИ-анализ паттернов)
        publish_behavior_logged(
            child_id=log.child_id,
            log_id=log.id,
            mood=log.mood,
            date=log.date.isoformat(),
        )
