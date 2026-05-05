from django.urls import include, path

from . import views

urlpatterns = [
    path('', views.home, name='home'),
    path('login/', views.login_page, name='login'),
    path('signup/', views.signup_page, name='signup'),
    path('api/auth/register/', views.register_api, name='api_auth_register'),
    path('api/auth/login/', views.login_api, name='api_auth_login'),
    path('logout/', views.logout_view, name='logout'),
    path('budgets/', include('budgets.urls')),
]
