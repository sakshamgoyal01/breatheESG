from django.db.models import Sum

from django.shortcuts import (
    get_object_or_404
)

from django.contrib.auth import (
    get_user_model
)

from rest_framework.permissions import (
    IsAuthenticated
)

from rest_framework.response import (
    Response
)

from rest_framework.views import (
    APIView
)

from rest_framework.parsers import (
    JSONParser
)

from apps.ingestion.models import (
    DataSource
)

from apps.review.models import (
    EmissionRecord
)

from slugify import slugify

from .models import Company

User = get_user_model()


class CompanyListView(APIView):

    permission_classes = [
        IsAuthenticated
    ]

    def get(self, request):

        companies = (
            Company.objects.all()
        )

        data = []

        for company in companies:

            uploads_count = (
                DataSource.objects.filter(
                    company=company
                ).count()
            )

            pending_reviews = (
                EmissionRecord.objects.filter(
                    company=company,
                    status="PENDING"
                ).count()
            )

            emissions_total = (
                EmissionRecord.objects.filter(
                    company=company,
                    status="APPROVED"
                ).aggregate(
                    total=Sum(
                        "normalized_quantity_kgco2e"
                    )
                )["total"]
                or 0
            )

            data.append({

                "id":
                str(company.id),

                "name":
                company.name,

                "pending_reviews":
                pending_reviews,

                "uploads":
                uploads_count,

                "emissions":
                round(
                    emissions_total,
                    2
                ),
            })

        return Response(data)


class CompanyCreateView(APIView):

    permission_classes = [
        IsAuthenticated
    ]

    def post(self, request):

        if request.user.role != "ADMIN":

            return Response(
                {
                    "error":
                    "Unauthorized"
                },
                status=403
            )

        name = request.data.get(
            "name"
        )

        if not name:

            return Response(
                {
                    "error":
                    "Company name required"
                },
                status=400
            )

        company = Company.objects.create(

            name=name,

            slug=slugify(name),
        )

        return Response({

            "id":
            str(company.id),

            "name":
            company.name,
        })


class CompanyDetailView(APIView):

    permission_classes = [
        IsAuthenticated
    ]

    def get(
        self,
        request,
        company_id
    ):

        company = get_object_or_404(
            Company,
            id=company_id
        )

        return Response({

            "id":
            str(company.id),

            "name":
            company.name,
        })


class UserListView(APIView):

    permission_classes = [
        IsAuthenticated
    ]

    def get(self, request):

        users = User.objects.all()

        data = []

        for user in users:

            data.append({

                "id":
                user.id,

                "username":
                user.username,

                "email":
                user.email,

                "role":
                user.role,

                "company_name":
                (
                    user.company.name
                    if user.company
                    else "-"
                ),

                "company_id":
                (
                    str(user.company.id)
                    if user.company
                    else ""
                )
            })

        return Response(data)


class UserManagementView(APIView):

    permission_classes = [
        IsAuthenticated
    ]

    parser_classes = [
        JSONParser
    ]

    def post(self, request):

        if request.user.role != "ADMIN":

            return Response(
                {
                    "error":
                    "Unauthorized"
                },
                status=403
            )

        data = request.data

        try:

            company = Company.objects.get(
                id=data.get("company_id")
            )

        except Company.DoesNotExist:

            return Response(
                {
                    "error":
                    "Invalid company"
                },
                status=400
            )

        user = User.objects.create_user(

            username=
            data.get("username"),

            email=
            data.get("email"),

            password=
            data.get("password"),
        )

        user.role = data.get("role")

        user.company = company

        user.save()

        return Response({

            "message":
            "User created successfully"
        })

    def patch(
        self,
        request,
        user_id
    ):

        if request.user.role != "ADMIN":

            return Response(
                {
                    "error":
                    "Unauthorized"
                },
                status=403
            )

        user = get_object_or_404(
            User,
            id=user_id
        )

        data = request.data

        if "email" in data:

            user.email = (
                data["email"]
            )

        if "role" in data:

            user.role = (
                data["role"]
            )

        if (
            "password" in data
            and data["password"]
        ):

            user.set_password(
                data["password"]
            )

        if "company_id" in data:

            try:

                company = (
                    Company.objects.get(
                        id=data["company_id"]
                    )
                )

                user.company = company

            except Company.DoesNotExist:

                return Response(
                    {
                        "error":
                        "Invalid company"
                    },
                    status=400
                )

        user.save()

        return Response({

            "message":
            "User updated successfully"
        })

    def delete(
        self,
        request,
        user_id
    ):

        if request.user.role != "ADMIN":

            return Response(
                {
                    "error":
                    "Unauthorized"
                },
                status=403
            )

        user = get_object_or_404(
            User,
            id=user_id
        )

        if user.role == "ADMIN":

            return Response(
                {
                    "error":
                    "Admin users cannot be deleted"
                },
                status=400
            )

        user.delete()

        return Response({

            "message":
            "User deleted successfully"
        })


class CurrentUserView(APIView):

    permission_classes = [
        IsAuthenticated
    ]

    def get(self, request):

        user = request.user

        return Response({

            "id":
            str(user.id),

            "username":
            user.username,

            "email":
            user.email,

            "role":
            user.role,

            "company":
            (
                user.company.name
                if user.company
                else None
            )
        })