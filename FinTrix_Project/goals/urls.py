from django.urls import path
from . import views

urlpatterns = [
    path("", views.goals_page, name="goals_page"),
    path("delete/<int:goal_id>/", views.delete_goal, name="delete_goal"),
    path("edit/<int:goal_id>/", views.edit_goal, name="edit_goal"),
]