from django.conf import settings
from django.db import models

from apps.core.models import BaseModel, Company
from apps.ingestion.models import DataSource


class EmissionRecord(BaseModel):

    class ScopeChoices(models.TextChoices):
        SCOPE_1 = "SCOPE_1", "Scope 1"
        SCOPE_2 = "SCOPE_2", "Scope 2"
        SCOPE_3 = "SCOPE_3", "Scope 3"

    class CategoryChoices(models.TextChoices):
        FUEL = "FUEL", "Fuel"
        ELECTRICITY = "ELECTRICITY", "Electricity"
        FLIGHT = "FLIGHT", "Flight"
        HOTEL = "HOTEL", "Hotel"
        GROUND_TRANSPORT = "GROUND_TRANSPORT", "Ground Transport"

    class StatusChoices(models.TextChoices):
        PENDING = "PENDING", "Pending"
        APPROVED = "APPROVED", "Approved"
        FLAGGED = "FLAGGED", "Flagged"
        REJECTED = "REJECTED", "Rejected"

    company = models.ForeignKey(
        Company,
        on_delete=models.CASCADE,
        related_name="emission_records"
    )

    source = models.ForeignKey(
        DataSource,
        on_delete=models.CASCADE,
        related_name="emission_records"
    )

    scope = models.CharField(
        max_length=50,
        choices=ScopeChoices.choices
    )

    category = models.CharField(
        max_length=50,
        choices=CategoryChoices.choices
    )

    subcategory = models.CharField(
        max_length=100
    )

    raw_quantity = models.DecimalField(
        max_digits=15,
        decimal_places=4
    )

    raw_unit = models.CharField(
        max_length=50
    )

    raw_date = models.CharField(
        max_length=50
    )

    activity_date = models.DateField(
        null=True,
        blank=True
    )

    location = models.CharField(
        max_length=255,
        blank=True
    )

    vendor = models.CharField(
        max_length=255,
        blank=True
    )

    origin_code = models.CharField(
        max_length=10,
        blank=True
    )

    destination_code = models.CharField(
        max_length=10,
        blank=True
    )

    distance_km = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True
    )

    travel_class = models.CharField(
        max_length=50,
        blank=True
    )

    hotel_nights = models.IntegerField(
        null=True,
        blank=True
    )

    normalized_quantity_kgco2e = models.DecimalField(
        max_digits=15,
        decimal_places=4
    )

    emission_factor = models.DecimalField(
        max_digits=15,
        decimal_places=6
    )

    emission_factor_source = models.CharField(
        max_length=255
    )

    status = models.CharField(
        max_length=50,
        choices=StatusChoices.choices,
        default=StatusChoices.PENDING
    )

    flag_reason = models.TextField(
        blank=True
    )

    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="reviewed_records"
    )

    reviewed_at = models.DateTimeField(
        null=True,
        blank=True
    )

    is_locked = models.BooleanField(
        default=False
    )

    is_deleted = models.BooleanField(
        default=False
    )

    is_suspicious = models.BooleanField(
        default=False
    )

    suspicious_reason = models.TextField(
        blank=True
    )

    normalization_version = models.CharField(
        max_length=100,
        default="DEFRA_2023_v1"
    )

    row_number = models.IntegerField()

    class Meta:
        indexes = [
            models.Index(fields=["company", "status"]),
            models.Index(fields=["scope"]),
            models.Index(fields=["activity_date"]),
        ]

    def __str__(self):
        return f"{self.category} - {self.normalized_quantity_kgco2e} kgCO2e"


class AuditLog(BaseModel):

    class ActionChoices(models.TextChoices):
        CREATED = "CREATED", "Created"
        EDITED = "EDITED", "Edited"
        APPROVED = "APPROVED", "Approved"
        FLAGGED = "FLAGGED", "Flagged"
        REJECTED = "REJECTED", "Rejected"
        LOCKED = "LOCKED", "Locked"

    record = models.ForeignKey(
        EmissionRecord,
        on_delete=models.CASCADE,
        related_name="audit_logs"
    )

    company = models.ForeignKey(
        Company,
        on_delete=models.CASCADE,
        related_name="audit_logs"
    )

    action = models.CharField(
        max_length=50,
        choices=ActionChoices.choices
    )

    changed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True
    )

    changed_at = models.DateTimeField(
        auto_now_add=True
    )

    old_value = models.JSONField(
        default=dict,
        blank=True
    )

    new_value = models.JSONField(
        default=dict,
        blank=True
    )

    note = models.TextField(
        blank=True
    )

    def __str__(self):
        return f"{self.action} - {self.record_id}"