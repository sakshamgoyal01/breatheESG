from rest_framework.permissions import (
    BasePermission
)


class IsAnalystOrAdmin(BasePermission):

    def has_permission(
        self,
        request,
        view
    ):

        return (
            request.user.role
            in [
                "ANALYST",
                "ADMIN"
            ]
        )