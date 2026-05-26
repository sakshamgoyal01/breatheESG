from django.contrib import admin

from apps.review.models import (
    EmissionRecord,
    AuditLog,
)


@admin.register(EmissionRecord)
class EmissionRecordAdmin(
    admin.ModelAdmin
):

    list_display = (
        "id",
        "company",
        "category",
        "scope",
        "status",
        "normalized_quantity_kgco2e",
        "activity_date",
    )

    list_filter = (
        "status",
        "scope",
        "category",
    )

    search_fields = (
        "vendor",
        "subcategory",
        "origin_code",
        "destination_code",
    )

    ordering = (
        "-created_at",
    )


@admin.register(AuditLog)
class AuditLogAdmin(
    admin.ModelAdmin
):

    list_display = (
        "record",
        "action",
        "changed_by",
        "changed_at",
    )

    list_filter = (
        "action",
    )