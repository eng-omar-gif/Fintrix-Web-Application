from django.shortcuts import render, redirect, get_object_or_404
from django.contrib import messages
from django.utils.timesince import timesince
from django.utils import timezone

from budgets.models import CategoryBudget
from .models import Notification, NotificationController


# ─────────────────────────────────────────────
#  Helper — attach human-readable "time ago" to each notification
# ─────────────────────────────────────────────
def _annotate_time(notifications):
    now = timezone.now()
    result = []
    for n in notifications:
        delta = now - n.created_at
        if delta.total_seconds() < 3600:
            time_label = f"{int(delta.total_seconds() // 60)} MIN AGO"
        elif delta.total_seconds() < 86400:
            time_label = f"{int(delta.total_seconds() // 3600)} HOURS AGO"
        elif delta.days == 1:
            time_label = "YESTERDAY"
        else:
            time_label = f"{delta.days} DAYS AGO"
        n.time_label = time_label
    return notifications


# ─────────────────────────────────────────────
#  notification_center
#  NotificationUI: requestNotifications()
#  NotificationController: checkThreshold() for all active CBs
#  SD2 alt/else: has_notifications drives template branching
# ─────────────────────────────────────────────
def notification_center(request):
    # Re-run checkThreshold for all CategoryBudgets (keeps list fresh)
    for cb in CategoryBudget.objects.select_related("category").all():
        NotificationController.check_threshold(cb)

    tab = request.GET.get("tab", "all")   # all | unread | archived

    all_qs      = Notification.objects.select_related("category_budget__category")
    unread_qs   = all_qs.filter(is_read=False, is_archived=False)
    archived_qs = all_qs.filter(is_archived=True)

    if tab == "unread":
        notifications = list(unread_qs)
    elif tab == "archived":
        notifications = list(archived_qs)
    else:
        notifications = list(all_qs.filter(is_archived=False))

    _annotate_time(notifications)

    context = {
        "notifications":    notifications,
        "has_notifications": len(notifications) > 0,
        "unread_count":     unread_qs.count(),
        "archived_count":   archived_qs.count(),
        "active_tab":       tab,
    }
    return render(request, "notifications.html", context)


# ─────────────────────────────────────────────
#  mark_as_read
#  NotificationController.markAsRead(notificationId)
# ─────────────────────────────────────────────
def mark_as_read(request, notification_id):
    if request.method == "POST":
        NotificationController.mark_as_read(notification_id)
    return redirect(request.META.get("HTTP_REFERER", "notification_center"))


# ─────────────────────────────────────────────
#  mark_all_as_read
#  "Mark All as Read" button in NotificationUI
# ─────────────────────────────────────────────
def mark_all_as_read(request):
    if request.method == "POST":
        NotificationController.mark_all_as_read()
        messages.success(request, "All notifications marked as read.")
    return redirect("notification_center")


# ─────────────────────────────────────────────
#  archive_notification
#  Dismiss button on budget notifications
# ─────────────────────────────────────────────
def archive_notification(request, notification_id):
    if request.method == "POST":
        NotificationController.archive(notification_id)
    return redirect(request.META.get("HTTP_REFERER", "notification_center"))


# ─────────────────────────────────────────────
#  navigate_to_budget
#  SD2 opt [Navigate to related screen]:
#  fetchRelatedBudget(notificationId) → navigateToBudget()
# ─────────────────────────────────────────────
def navigate_to_budget(request, notification_id):
    notification = get_object_or_404(Notification, id=notification_id)

    # Mark as read on navigation
    NotificationController.mark_as_read(notification_id)

    # Traverse: Notification → CategoryBudget → Budget
    if notification.category_budget:
        budget_id = notification.category_budget.budget_id
        return redirect("budget_detail", budget_id=budget_id)

    return redirect("notification_center")