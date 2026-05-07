from django.urls import path
from . import views

urlpatterns = [
    # Notification center — NotificationUI.requestNotifications()
    path("", views.notification_center, name="notification_center"),

    # markAsRead(notificationId) — SD2
    path("<int:notification_id>/read/",
         views.mark_as_read, name="mark_as_read"),

    # Mark all as read — NotificationUI button
    path("read-all/",
         views.mark_all_as_read, name="mark_all_as_read"),

    # Dismiss / archive
    path("<int:notification_id>/archive/",
         views.archive_notification, name="archive_notification"),

    # Navigate to related budget — SD2 opt block
    path("<int:notification_id>/budget/",
         views.navigate_to_budget, name="navigate_to_budget"),
]