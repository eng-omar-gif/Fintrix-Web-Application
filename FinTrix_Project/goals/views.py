from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from .models import Goal
from .forms import GoalForm

@login_required
def goals_page(request):
    goals = Goal.objects.filter(user=request.user)

    if request.method == "POST":
        form = GoalForm(request.POST)
        if form.is_valid():
            goal = form.save(commit=False)
            goal.user = request.user
            goal.save()
            return redirect("goals_page")
    else:
        form = GoalForm()

    return render(request, "goals/goals.html", {"goals": goals, "form": form})


@login_required
def delete_goal(request, goal_id):
    goal = get_object_or_404(Goal, id=goal_id, user=request.user)
    goal.delete()
    return redirect("goals_page")


@login_required
def edit_goal(request, goal_id):
    goal = get_object_or_404(Goal, id=goal_id, user=request.user)

    if request.method == "POST":
        form = GoalForm(request.POST, instance=goal)
        if form.is_valid():
            form.save()
            return redirect("goals_page")
    else:
        form = GoalForm(instance=goal)

    goals = Goal.objects.filter(user=request.user)

    return render(request, "goals/goals.html", {
        "goals": goals,
        "form": form,
        "edit_mode": True,
        "edit_goal_id": goal.id
    })