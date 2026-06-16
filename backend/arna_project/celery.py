import os

from celery import Celery
from celery.schedules import crontab

os.environ.setdefault(
    "DJANGO_SETTINGS_MODULE", "arna_project.settings.development"
)

app = Celery("arna")
app.config_from_object("django.conf:settings", namespace="CELERY")
app.autodiscover_tasks()

# Периодические задачи биллинга (celery beat)
app.conf.beat_schedule = {
    "check-expired-subscriptions": {
        "task": "apps.billing.tasks.check_expired_subscriptions",
        "schedule": crontab(hour=0, minute=0),  # ежедневно в 00:00
    },
    "send-expiry-reminders": {
        "task": "apps.billing.tasks.send_expiry_reminder",
        "schedule": crontab(hour=9, minute=0),  # ежедневно в 09:00
    },
}


@app.task(bind=True)
def debug_task(self):
    print(f"Request: {self.request!r}")
