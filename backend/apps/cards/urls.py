from rest_framework.routers import DefaultRouter

from .views import CommunicationCardViewSet

router = DefaultRouter()
router.register("cards", CommunicationCardViewSet, basename="cards")

urlpatterns = router.urls
