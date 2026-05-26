from rest_framework import serializers

from apps.review.models import (
    EmissionRecord,
    AuditLog,
)


class AuditLogSerializer(
    serializers.ModelSerializer
):

    changed_by_email = (
        serializers.EmailField(
            source="changed_by.email",
            read_only=True
        )
    )

    class Meta:
        model = AuditLog

        fields = "__all__"


class EmissionRecordSerializer(
    serializers.ModelSerializer
):

    source_filename = serializers.CharField(
        source="source.original_filename",
        read_only=True
    )

    company_name = serializers.CharField(
        source="company.name",
        read_only=True
    )

    audit_logs = AuditLogSerializer(
        many=True,
        read_only=True
    )

    class Meta:
        model = EmissionRecord

        fields = "__all__"