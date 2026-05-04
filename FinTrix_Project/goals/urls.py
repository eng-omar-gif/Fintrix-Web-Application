from django.urls import path
from goals import views

urlpatterns = [
    path("", views.goals_page, name="goals_page"),
]

