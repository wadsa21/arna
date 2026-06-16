from django.contrib import admin

from .models import CommunicationCard


@admin.register(CommunicationCard)
class CommunicationCardAdmin(admin.ModelAdmin):
    list_display = ("title_ru", "emoji", "category", "child", "is_active")
    list_filter = ("category", "is_active")
    search_fields = ("title_ru", "title_kk")
