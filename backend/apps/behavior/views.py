from rest_framework import permissions, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.common.permissions import IsParent
from apps.billing.permissions import RequirePlanFeature
from apps.billing.services import get_subscription, require_feature
from kafka.producer import publish_behavior_logged

from .analysis import analyze_behavior
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

        # На тарифах с ИИ — сразу считаем инсайты и сохраняем в запись
        if get_subscription(self.request.user).plan.has_ai:
            try:
                log.ai_insights = analyze_behavior(log.child)
                log.save(update_fields=["ai_insights"])
            except Exception:  # noqa: BLE001
                pass

        # Событие в Kafka (поток для ИИ-анализа паттернов)
        publish_behavior_logged(
            child_id=log.child_id,
            log_id=log.id,
            mood=log.mood,
            date=log.date.isoformat(),
        )

    @action(detail=False, methods=["get"])
    def insights(self, request):
        """
        GET /api/behavior-logs/insights/?child=<id>
        ИИ-анализ паттернов поведения. Доступно на тарифах с has_ai (PRO).
        """
        require_feature(request.user, "has_ai")  # 403 upgrade_required если нет

        child_id = request.query_params.get("child")
        qs = self.get_queryset()
        if child_id:
            qs = qs.filter(child_id=child_id)
        logs = list(qs.order_by("-date")[:30])
        if not logs:
            return Response(
                {"data_points": 0, "recommendations": ["Нет записей для анализа."]}
            )
        return Response(analyze_behavior(logs[0].child, logs=logs))
