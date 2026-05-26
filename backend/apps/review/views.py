from django.db.models import (
    Sum,
    Q
)

from django.utils import timezone

from django.shortcuts import (
    get_object_or_404
)

from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import (
    IsAuthenticated
)

from apps.review.models import (
    EmissionRecord,
    AuditLog,
)

from apps.review.permissions import (
    IsAnalystOrAdmin
)

from apps.review.serializers import (
    EmissionRecordSerializer
)


class RecordListView(APIView):

    permission_classes = [
        IsAuthenticated
    ]

    def get(self, request):

        queryset = (
            EmissionRecord.objects
            .select_related(
                "company",
                "source"
            )
            .prefetch_related(
                "audit_logs"
            )
        )

        # Restrict data access
        if request.user.role not in [
            "ANALYST",
            "ADMIN"
        ]:

            queryset = queryset.filter(
                company=request.user.company
            )

        # Status filtering
        status_filter = request.GET.get(
            "status"
        )

        if status_filter:

            queryset = queryset.filter(
                status=status_filter
            )

        # Scope filtering
        scope_filter = request.GET.get(
            "scope"
        )

        if scope_filter:

            queryset = queryset.filter(
                scope=scope_filter
            )

        # Category filtering
        category_filter = request.GET.get(
            "category"
        )

        if category_filter:

            queryset = queryset.filter(
                category=category_filter
            )

        # Enterprise search
        search = request.GET.get(
            "search"
        )

        if search:

            queryset = queryset.filter(

                Q(category__icontains=search)

                |

                Q(vendor__icontains=search)

                |

                Q(subcategory__icontains=search)

                |

                Q(origin_code__icontains=search)

                |

                Q(destination_code__icontains=search)

                |

                Q(
                    source__original_filename__icontains=search
                )
            )

        # Ordering
        ordering = request.GET.get(
            "ordering",
            "-created_at"
        )

        queryset = queryset.order_by(
            ordering
        )

        serializer = (
            EmissionRecordSerializer(
                queryset,
                many=True
            )
        )

        return Response(serializer.data)


class RecordDetailView(APIView):

    permission_classes = [
        IsAuthenticated
    ]

    def get(self, request, record_id):

        record = get_object_or_404(
            EmissionRecord.objects
            .select_related(
                "company",
                "source"
            )
            .prefetch_related(
                "audit_logs"
            ),
            id=record_id
        )

        serializer = (
            EmissionRecordSerializer(
                record
            )
        )

        return Response(serializer.data)


class ApproveRecordView(APIView):

    permission_classes = [
        IsAuthenticated,
        IsAnalystOrAdmin
    ]

    def post(self, request, record_id):

        record = get_object_or_404(
            EmissionRecord,
            id=record_id
        )

        if record.is_locked:

            return Response({
                "error":
                "Record locked"
            }, status=400)

        old_status = record.status

        record.status = "APPROVED"

        record.reviewed_by = request.user

        record.reviewed_at = timezone.now()

        record.save()

        AuditLog.objects.create(
            company=record.company,
            record=record,
            action="APPROVED",
            changed_by=request.user,
            old_value={
                "status": old_status
            },
            new_value={
                "status": "APPROVED"
            }
        )

        return Response({
            "message":
            "Record approved"
        })


class RejectRecordView(APIView):

    permission_classes = [
        IsAuthenticated,
        IsAnalystOrAdmin
    ]

    def post(self, request, record_id):

        record = get_object_or_404(
            EmissionRecord,
            id=record_id
        )

        if record.is_locked:

            return Response({
                "error":
                "Record locked"
            }, status=400)

        reason = request.data.get(
            "reason",
            ""
        )

        old_status = record.status

        record.status = "REJECTED"

        record.flag_reason = reason

        record.reviewed_by = request.user

        record.reviewed_at = timezone.now()

        record.save()

        AuditLog.objects.create(
            company=record.company,
            record=record,
            action="REJECTED",
            changed_by=request.user,
            old_value={
                "status": old_status
            },
            new_value={
                "status": "REJECTED"
            },
            note=reason
        )

        return Response({
            "message":
            "Record rejected"
        })


class FlagRecordView(APIView):

    permission_classes = [
        IsAuthenticated,
        IsAnalystOrAdmin
    ]

    def post(self, request, record_id):

        record = get_object_or_404(
            EmissionRecord,
            id=record_id
        )

        if record.is_locked:

            return Response({
                "error":
                "Record locked"
            }, status=400)

        reason = request.data.get(
            "reason",
            ""
        )

        old_status = record.status

        record.status = "FLAGGED"

        record.flag_reason = reason

        record.reviewed_by = request.user

        record.reviewed_at = timezone.now()

        record.save()

        AuditLog.objects.create(
            company=record.company,
            record=record,
            action="FLAGGED",
            changed_by=request.user,
            old_value={
                "status": old_status
            },
            new_value={
                "status": "FLAGGED"
            },
            note=reason
        )

        return Response({
            "message":
            "Record flagged"
        })


class BulkApproveView(APIView):

    permission_classes = [
        IsAuthenticated,
        IsAnalystOrAdmin
    ]

    def post(self, request):

        ids = request.data.get(
            "record_ids",
            []
        )

        records = (
            EmissionRecord.objects.filter(
                id__in=ids,
                is_locked=False
            )
        )

        updated_count = 0

        for record in records:

            old_status = record.status

            record.status = "APPROVED"

            record.reviewed_by = (
                request.user
            )

            record.reviewed_at = (
                timezone.now()
            )

            record.save()

            AuditLog.objects.create(
                company=record.company,
                record=record,
                action="APPROVED",
                changed_by=request.user,
                old_value={
                    "status": old_status
                },
                new_value={
                    "status": "APPROVED"
                }
            )

            updated_count += 1

        return Response({
            "updated_records":
            updated_count
        })

class DeleteRecordView(APIView):

    permission_classes = [
        IsAuthenticated,
        IsAnalystOrAdmin
    ]

    def delete(self, request, record_id):

        record = get_object_or_404(
            EmissionRecord,
            id=record_id
        )

        AuditLog.objects.create(
            company=record.company,
            record=record,
            action="DELETED",
            changed_by=request.user,
            old_value={
                "status": record.status
            },
            new_value={}
        )

        record.delete()

        return Response({
            "message":
            "Record deleted"
        })
class DashboardStatsView(APIView):

    permission_classes = [
        IsAuthenticated
    ]

    def get(self, request):
        queryset = (
            EmissionRecord.objects
            .exclude(status="REJECTED")
        )

        if request.user.role not in [
            "ANALYST",
            "ADMIN"
        ]:

            queryset = queryset.filter(
                company=request.user.company
            )

        total_records = queryset.count()

        pending_reviews = queryset.filter(
            status="PENDING"
        ).count()

        approved_records = queryset.filter(
            status="APPROVED"
        ).count()

        flagged_records = queryset.filter(
            status="FLAGGED"
        ).count()

        total_emissions = (
            queryset.aggregate(
                total=Sum(
                    "normalized_quantity_kgco2e"
                )
            )["total"]
            or 0
        )

        scope_breakdown = {
            "scope_1":
            queryset.filter(
                scope="SCOPE_1"
            ).count(),

            "scope_2":
            queryset.filter(
                scope="SCOPE_2"
            ).count(),

            "scope_3":
            queryset.filter(
                scope="SCOPE_3"
            ).count(),
        }

        return Response({
            "total_records":
                total_records,

            "pending_reviews":
                pending_reviews,

            "approved_records":
                approved_records,

            "flagged_records":
                flagged_records,

            "total_emissions_kgco2e":
                total_emissions,

            "scope_breakdown":
                scope_breakdown,
        })