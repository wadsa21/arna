from django.http import HttpResponse
from rest_framework import viewsets
from rest_framework.decorators import action

from apps.common.permissions import IsParent
from apps.billing.services import enforce_child_limit, require_feature

from .models import ChildProfile
from .reports import build_report_html
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

    @action(detail=True, methods=["get"])
    def report(self, request, pk=None):
        """
        GET /api/children/{id}/report/
        Печатный HTML-отчёт для врача/логопеда. Фича has_pdf_export.
        """
        require_feature(request.user, "has_pdf_export")  # 403 upgrade_required если нет
        child = self.get_object()
        return HttpResponse(build_report_html(child), content_type="text/html")
