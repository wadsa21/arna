from django.contrib import admin

from .models import BehaviorLog


@admin.register(BehaviorLog)
class BehaviorLogAdmin(admin.ModelAdmin):
    list_display = ("child", "date", "mood", "logged_by", "created_at")
    list_filter = ("mood", "date")
    search_fields = ("child__name", "notes")
