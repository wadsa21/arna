from django.db import transaction
from django.utils import timezone
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from kafka.producer import publish_schedule_completed

from .models import Schedule, ScheduleItem
from .serializers import (
    ScheduleCopySerializer,
    ScheduleItemSerializer,
    ScheduleSerializer,
)


class ScheduleViewSet(viewsets.ModelViewSet):
    serializer_class = ScheduleSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ["child", "date"]

    def get_queryset(self):
        user = self.request.user
        qs = (
            Schedule.objects.select_related("child")
            .prefetch_related("items")
            .all()
        )
        if user.role == "ADMIN":
            return qs
        # Родитель видит расписания своих детей, ребёнок — переданные ему
        return qs.filter(child__parent=user) if user.is_parent else qs

    def perform_create(self, serializer):
        # FREE-тариф: расписание можно создавать только на сегодня
        from django.utils import timezone

        from apps.billing.services import UpgradeRequired, get_subscription

        target_date = serializer.validated_data.get("date")
        sub = get_subscription(self.request.user)
        if (
            target_date
            and target_date != timezone.localdate()
            and not sub.plan.schedule_any_date
        ):
            raise UpgradeRequired(
                message="На бесплатном тарифе расписание доступно только на сегодня.",
                current_plan=sub.plan.name,
                required_plan="OTBASY",
            )
        serializer.save(created_by=self.request.user)

    @action(detail=True, methods=["get", "post"])
    def items(self, request, pk=None):
        schedule = self.get_object()
        if request.method == "GET":
            serializer = ScheduleItemSerializer(
                schedule.items.all(), many=True
            )
            return Response(serializer.data)

        serializer = ScheduleItemSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(schedule=schedule)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["post"])
    def copy(self, request, pk=None):
        """Скопировать набор активностей этого расписания на другие даты."""
        source = self.get_object()
        serializer = ScheduleCopySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        created = []
        with transaction.atomic():
            for target_date in serializer.validated_data["target_dates"]:
                schedule, _ = Schedule.objects.update_or_create(
                    child=source.child,
                    date=target_date,
                    defaults={"created_by": request.user},
                )
                schedule.items.all().delete()
                ScheduleItem.objects.bulk_create(
                    [
                        ScheduleItem(
                            schedule=schedule,
                            title_kk=item.title_kk,
                            title_ru=item.title_ru,
                            emoji=item.emoji,
                            start_time=item.start_time,
                            duration_minutes=item.duration_minutes,
                            order=item.order,
                        )
                        for item in source.items.all()
                    ]
                )
                created.append(str(schedule.id))
        return Response({"created_schedules": created}, status=status.HTTP_201_CREATED)


class ScheduleItemViewSet(viewsets.ModelViewSet):
    serializer_class = ScheduleItemSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ["status", "schedule"]

    def get_queryset(self):
        user = self.request.user
        qs = ScheduleItem.objects.select_related("schedule__child").all()
        if user.role == "ADMIN":
            return qs
        if user.is_parent:
            return qs.filter(schedule__child__parent=user)
        return qs

    @action(detail=True, methods=["post"])
    def complete(self, request, pk=None):
        """
        Ребёнок нажимает «Готово!».
        Помечаем активность выполненной, уведомляем родителя в реальном
        времени (синхронно — работает всегда) и публикуем событие в Kafka
        для аналитики/ИИ (асинхронный поток).
        """
        from apps.billing.services import get_subscription
        from apps.notifications.models import Notification
        from apps.notifications.services import notify

        item = self.get_object()
        item.mark_done()

        child = item.schedule.child
        parent = child.parent
        title = item.title_ru or item.title_kk

        # Реалтайм-уведомление родителю — только если тариф поддерживает
        if get_subscription(parent).plan.has_realtime:
            notify(
                parent,
                title="Активность завершена 🎉",
                body=f"{child.name} завершил(а): «{title}»",
                type=Notification.Type.SCHEDULE_DONE,
                data={"child_id": str(child.id), "item_id": str(item.id)},
            )

        # Событие в Kafka — для аналитики и будущего ИИ (consumer не обязателен)
        publish_schedule_completed(
            child_id=child.id,
            item_id=item.id,
            completed_at=item.completed_at.isoformat()
            if item.completed_at
            else timezone.now().isoformat(),
        )
        return Response(ScheduleItemSerializer(item).data)
