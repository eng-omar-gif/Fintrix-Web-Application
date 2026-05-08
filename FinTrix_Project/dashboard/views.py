from django.contrib.auth.decorators import login_required
from django.shortcuts import render

from .services import dashboard_json_payload, financial_snapshot


@login_required
def dashboard(request):
    """
    Displays the main financial dashboard for the authenticated user.

    Retrieves financial summary data and chart information
    for visualization on the dashboard page.

    Args:
        request (HttpRequest): Incoming HTTP request.

    Returns:
        HttpResponse: Rendered dashboard page with financial data.
    """
    snap = financial_snapshot(request.user)
    chart_data = dashboard_json_payload(snap)
    return render(
        request,
        "dashboard.html",
        {
            "snap": snap,
            "chart_data": chart_data,
            "page_title": "Dashboard Overview",
        },
    )