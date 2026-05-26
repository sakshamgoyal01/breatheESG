import uuid

from django.conf import settings
from django.db import models

from apps.core.models import BaseModel, Company


class DataSource(BaseModel):

    class SourceTypes(models.TextChoices):
        SAP = "SAP", "SAP"
        UTILITY = "UTILITY", "Utility"
        TRAVEL = "TRAVEL", "Travel"

    class IngestionModes(models.TextChoices):
        FILE_UPLOAD = "FILE_UPLOAD", "File Upload"
        API_PULL = "API_PULL", "API Pull"

    class StatusChoices(models.TextChoices):
        PENDING = "PENDING", "Pending"
        PROCESSING = "PROCESSING", "Processing"
        PARTIAL = "PARTIAL", "Partial"
        COMPLETE = "COMPLETE", "Complete"
        FAILED = "FAILED", "Failed"

    company = models.ForeignKey(
        Company,
        on_delete=models.CASCADE,
        related_name="data_sources"
    )

    source_type = models.CharField(
        max_length=50,
        choices=SourceTypes.choices
    )

    ingestion_mode = models.CharField(
        max_length=50,
        choices=IngestionModes.choices,
        default=IngestionModes.FILE_UPLOAD
    )

    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name="uploaded_sources"
    )

    uploaded_at = models.DateTimeField(
        auto_now_add=True
    )

    original_filename = models.CharField(
        max_length=255
    )

    file_hash = models.CharField(
        max_length=64
    )

    raw_file = models.FileField(
        upload_to="datasources/"
    )

    status = models.CharField(
        max_length=50,
        choices=StatusChoices.choices,
        default=StatusChoices.PENDING
    )

    total_rows = models.IntegerField(
        default=0
    )

    parsed_rows = models.IntegerField(
        default=0
    )

    failed_rows = models.IntegerField(
        default=0
    )

    error_log = models.JSONField(
        default=list,
        blank=True
    )

    reporting_period_start = models.DateField(
        null=True,
        blank=True
    )

    reporting_period_end = models.DateField(
        null=True,
        blank=True
    )

    is_deleted = models.BooleanField(
        default=False
    )

    parser_version = models.CharField(
        max_length=100,
        default="v1"
    )

    def __str__(self):
        return f"{self.source_type} - {self.original_filename}"


class ParseError(BaseModel):

    class ErrorTypes(models.TextChoices):
        MISSING_FIELD = "MISSING_FIELD", "Missing Field"
        BAD_DATE = "BAD_DATE", "Bad Date"
        UNKNOWN_UNIT = "UNKNOWN_UNIT", "Unknown Unit"
        UNKNOWN_MATERIAL = "UNKNOWN_MATERIAL", "Unknown Material"
        BAD_FORMAT = "BAD_FORMAT", "Bad Format"

    source = models.ForeignKey(
        DataSource,
        on_delete=models.CASCADE,
        related_name="parse_errors"
    )

    company = models.ForeignKey(
        Company,
        on_delete=models.CASCADE,
        related_name="parse_errors"
    )

    row_number = models.IntegerField()

    raw_row = models.TextField()

    error_type = models.CharField(
        max_length=50,
        choices=ErrorTypes.choices
    )

    error_message = models.TextField()

    def __str__(self):
        return f"Row {self.row_number} - {self.error_type}"