from rest_framework import viewsets

from apps.common.permissions import IsParent

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
        serializer.save(parent=self.request.user)
