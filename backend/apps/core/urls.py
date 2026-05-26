from django.urls import path

from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

from .views import (
    CompanyListView,
    CompanyCreateView,
    CompanyDetailView,
    CurrentUserView,
    UserListView,
    UserManagementView,
)

urlpatterns = [

    # COMPANIES

    path(
        "companies/",
        CompanyListView.as_view()
    ),

    path(
        "companies/create/",
        CompanyCreateView.as_view()
    ),

    path(
        "companies/<uuid:company_id>/",
        CompanyDetailView.as_view()
    ),

    # USERS

    path(
        "users/",
        UserListView.as_view()
    ),

    path(
        "users/create/",
        UserManagementView.as_view()
    ),

    path(
        "users/<int:user_id>/",
        UserManagementView.as_view()
    ),

    # AUTH

    path(
        "login/",
        TokenObtainPairView.as_view()
    ),

    path(
        "refresh/",
        TokenRefreshView.as_view()
    ),

    path(
        "me/",
        CurrentUserView.as_view()
    ),
]