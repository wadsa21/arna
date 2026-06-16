from rest_framework.routers import DefaultRouter

from .views import ChildProfileViewSet

router = DefaultRouter()
router.register("children", ChildProfileViewSet, basename="children")

urlpatterns = router.urls
