from django.urls import path

from apps.ingestion.views import (
    FileUploadView,
    DataSourceListView,
    ParseErrorListView,
)

urlpatterns = [
    path(
        "upload/",
        FileUploadView.as_view()
    ),

    path(
        "sources/",
        DataSourceListView.as_view()
    ),

    path(
        "sources/<uuid:source_id>/errors/",
        ParseErrorListView.as_view()
    ),
]