from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.shortcuts import get_object_or_404, redirect, render
from django.views.decorators.http import require_GET, require_http_methods

from .forms import GoalForm
from .models import Goal


def _active_goal_count(goals_iterable):
    return sum(1 for g in goals_iterable if g.progress < 100)


def _goals_list(user):
    return list(Goal.objects.filter(user=user).order_by('deadline'))


@login_required
@require_http_methods(['GET', 'POST'])
def goals_page(request):
    goals = _goals_list(request.user)

    if request.method == 'POST':
        form = GoalForm(request.POST)
        if form.is_valid():
            goal = form.save(commit=False)
            goal.user = request.user
            goal.save()
            messages.success(request, 'Goal created successfully.')
            return redirect('goals_page')
    else:
        form = GoalForm()

    return render(
        request,
        'goals.html',
        {
            'goals': goals,
            'form': form,
            'edit_mode': False,
            'edit_goal_id': None,
            'active_count': _active_goal_count(goals),
        },
    )


@login_required
@require_http_methods(['POST'])
def delete_goal(request, goal_id):
    goal = get_object_or_404(Goal, id=goal_id, user=request.user)
    goal.delete()
    messages.success(request, 'Goal deleted.')
    return redirect('goals_page')


@login_required
@require_http_methods(['GET', 'POST'])
def edit_goal(request, goal_id):
    goal = get_object_or_404(Goal, id=goal_id, user=request.user)

    if request.method == 'POST':
        form = GoalForm(request.POST, instance=goal)
        if form.is_valid():
            form.save()
            messages.success(request, 'Goal updated successfully.')
            return redirect('goals_page')
    else:
        form = GoalForm(instance=goal)

    goals = _goals_list(request.user)

    return render(
        request,
        'goals.html',
        {
            'goals': goals,
            'form': form,
            'edit_mode': True,
            'edit_goal_id': goal.id,
            'active_count': _active_goal_count(goals),
        },
    )
