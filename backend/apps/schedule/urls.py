from rest_framework.routers import DefaultRouter

from .views import ScheduleItemViewSet, ScheduleViewSet

router = DefaultRouter()
router.register("schedules", ScheduleViewSet, basename="schedules")
router.register("schedule-items", ScheduleItemViewSet, basename="schedule-items")

urlpatterns = router.urls
