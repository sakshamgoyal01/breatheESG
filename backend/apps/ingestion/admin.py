from django.contrib import admin

from apps.ingestion.models import (
    DataSource,
    ParseError,
)


@admin.register(DataSource)
class DataSourceAdmin(
    admin.ModelAdmin
):

    list_display = (
        "id",
        "company",
        "source_type",
        "status",
        "uploaded_at",
        "parsed_rows",
        "failed_rows",
    )

    list_filter = (
        "source_type",
        "status",
    )

    search_fields = (
        "original_filename",
    )

    ordering = (
        "-uploaded_at",
    )


@admin.register(ParseError)
class ParseErrorAdmin(
    admin.ModelAdmin
):

    list_display = (
        "source",
        "error_type",
        "row_number",
    )

    list_filter = (
        "error_type",
    )