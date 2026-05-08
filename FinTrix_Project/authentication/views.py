import json

from django.contrib.auth import login, logout
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.shortcuts import redirect, render
from django.views.decorators.csrf import ensure_csrf_cookie
from django.views.decorators.http import require_GET, require_http_methods

from .services import AuthenticationService, RegistrationInput


def _parse_json_body(request):
    if not request.body:
        return {}
    try:
        return json.loads(request.body.decode('utf-8'))
    except (json.JSONDecodeError, UnicodeDecodeError):
        return None


@ensure_csrf_cookie
@require_GET
def home(request):
    return render(request, 'home.html')


@ensure_csrf_cookie
@require_GET
def login_page(request):
    return render(request, 'login.html')


@ensure_csrf_cookie
@require_GET
def signup_page(request):
    return render(request, 'signup.html')


@require_http_methods(['POST'])
def register_api(request):
    payload = _parse_json_body(request)
    if payload is None:
        return JsonResponse({'success': False, 'message': 'Invalid JSON body.'}, status=400)

    name = payload.get('full_name') or payload.get('fullName') or ''
    email = payload.get('email') or ''
    password = payload.get('password') or ''

    service = AuthenticationService()
    data = RegistrationInput(name=name, email=email, password=password)
    try:
        user = service.register_user(data)
    except ValueError as e:
        return JsonResponse({'success': False, 'message': str(e)}, status=400)

    login(request, user)
    return JsonResponse({
        'success': True,
        'message': 'Account created successfully.',
        'redirect': '/dashboard/',
    })


@require_http_methods(['POST'])
def login_api(request):
    payload = _parse_json_body(request)
    if payload is None:
        return JsonResponse({'success': False, 'message': 'Invalid JSON body.'}, status=400)

    email = payload.get('email') or ''
    password = payload.get('password') or ''

    service = AuthenticationService()
    err = service.validate_login(email, password)
    if err:
        return JsonResponse({'success': False, 'message': err}, status=400)

    user = service.login_user(email, password)
    if user is None:
        return JsonResponse(
            {'success': False, 'message': 'Invalid email or password.'},
            status=401,
        )

    login(request, user)
    return JsonResponse({
        'success': True,
        'message': 'Signed in successfully.',
        'redirect': '/dashboard/',
    })


@require_GET
@login_required
def logout_view(request):
    logout(request)
    return redirect('home')
