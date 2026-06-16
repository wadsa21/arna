from rest_framework import permissions, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.billing.services import enforce_card_limit

from .models import CommunicationCard
from .serializers import CommunicationCardSerializer


class CommunicationCardViewSet(viewsets.ModelViewSet):
    serializer_class = CommunicationCardSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ["child", "category", "is_active"]

    def get_queryset(self):
        user = self.request.user
        qs = CommunicationCard.objects.select_related("child").all()
        if user.role == "ADMIN":
            return qs
        if user.is_parent:
            return qs.filter(child__parent=user)
        return qs

    def perform_create(self, serializer):
        enforce_card_limit(self.request.user)
        serializer.save(created_by=self.request.user)

    @action(detail=False, methods=["get"])
    def categories(self, request):
        return Response(
            [
                {"value": value, "label": label}
                for value, label in CommunicationCard.Category.choices
            ]
        )
