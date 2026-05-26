from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand

from apps.core.models import Company

User = get_user_model()


class Command(BaseCommand):

    help = "Seed enterprise ESG demo data"

    def handle(self, *args, **kwargs):

        companies_data = [

            {
                "name": "Tata Steel",
                "slug": "tata-steel",
                "username": "tata_uploader",
                "email": "tata@demo.com",
            },

            {
                "name": "Infosys",
                "slug": "infosys",
                "username": "infosys_uploader",
                "email": "infosys@demo.com",
            },

            {
                "name": "Unilever",
                "slug": "unilever",
                "username": "unilever_uploader",
                "email": "unilever@demo.com",
            },
        ]

        # CREATE CLIENT COMPANIES

        for company_data in companies_data:

            company, _ = (
                Company.objects.get_or_create(
                    slug=company_data["slug"],

                    defaults={
                        "name":
                        company_data["name"]
                    }
                )
            )

            uploader, _ = (
                User.objects.get_or_create(
                    username=
                    company_data["username"]
                )
            )

            uploader.email = (
                company_data["email"]
            )

            uploader.role = (
                "CLIENT_UPLOADER"
            )

            uploader.company = company

            uploader.set_password(
                "Uploader123!"
            )

            uploader.save()

        # CREATE ANALYST

        analyst_company = (
            Company.objects.first()
        )

        analyst, _ = (
            User.objects.get_or_create(
                username="analyst"
            )
        )

        analyst.email = (
            "analyst@breatheesg.com"
        )

        analyst.role = (
            "ANALYST"
        )

        analyst.company = (
            analyst_company
        )

        analyst.set_password(
            "Analyst123!"
        )

        analyst.save()

        # CREATE ADMIN

        admin, _ = (
            User.objects.get_or_create(
                username="admin"
            )
        )

        admin.email = (
            "admin@breatheesg.com"
        )

        admin.role = (
            "ADMIN"
        )

        admin.company = (
            analyst_company
        )

        admin.is_staff = True

        admin.is_superuser = True

        admin.set_password(
            "Admin123!"
        )

        admin.save()

        self.stdout.write(

            self.style.SUCCESS(
                "Enterprise ESG demo data seeded successfully"
            )
        )