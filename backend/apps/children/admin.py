from django.contrib import admin

from .models import ChildProfile


@admin.register(ChildProfile)
class ChildProfileAdmin(admin.ModelAdmin):
    list_display = ("name", "age", "communication_level", "parent", "created_at")
    list_filter = ("communication_level",)
    search_fields = ("name", "parent__email")
