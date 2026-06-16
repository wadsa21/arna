from rest_framework.routers import DefaultRouter

from .views import BehaviorLogViewSet

router = DefaultRouter()
router.register("behavior-logs", BehaviorLogViewSet, basename="behavior-logs")

urlpatterns = router.urls
