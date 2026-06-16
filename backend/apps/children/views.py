from rest_framework import viewsets

from apps.common.permissions import IsParent
from apps.billing.services import enforce_child_limit

from .models import ChildProfile
from .serializers import ChildProfileSerializer


class ChildProfileViewSet(viewsets.ModelViewSet):
    serializer_class = ChildProfileSerializer
    permission_classes = [IsParent]

    def get_queryset(self):
        user = self.request.user
        qs = ChildProfile.objects.all()
        if user.role != "ADMIN":
            qs = qs.filter(parent=user)
        return qs

    def perform_create(self, serializer):
        # Проверка лимита тарифа (бросит 403 upgrade_required при превышении)
        enforce_child_limit(self.request.user)
        serializer.save(parent=self.request.user)
