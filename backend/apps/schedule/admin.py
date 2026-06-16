from django.contrib import admin

from .models import Schedule, ScheduleItem


class ScheduleItemInline(admin.TabularInline):
    model = ScheduleItem
    extra = 1


@admin.register(Schedule)
class ScheduleAdmin(admin.ModelAdmin):
    list_display = ("child", "date", "created_by", "created_at")
    list_filter = ("date",)
    inlines = [ScheduleItemInline]


@admin.register(ScheduleItem)
class ScheduleItemAdmin(admin.ModelAdmin):
    list_display = ("title_ru", "emoji", "status", "start_time", "schedule")
    list_filter = ("status", "ai_suggested")
