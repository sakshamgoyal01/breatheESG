from django.urls import path

from apps.review.views import (
    RecordListView,
    RecordDetailView,
    ApproveRecordView,
    RejectRecordView,
    FlagRecordView,
    BulkApproveView,
    DashboardStatsView,
DeleteRecordView,
)

urlpatterns = [

    path(
        "records/",
        RecordListView.as_view()
    ),

    path(
        "records/<uuid:record_id>/",
        RecordDetailView.as_view()
    ),

    path(
        "records/<uuid:record_id>/approve/",
        ApproveRecordView.as_view()
    ),

    path(
        "records/<uuid:record_id>/reject/",
        RejectRecordView.as_view()
    ),

    path(
        "records/<uuid:record_id>/flag/",
        FlagRecordView.as_view()
    ),

    path(
        "records/bulk-approve/",
        BulkApproveView.as_view()
    ),

    path(
        "dashboard/",
        DashboardStatsView.as_view()
    ),
path(
    "records/<uuid:record_id>/delete/",
    DeleteRecordView.as_view()
),
]