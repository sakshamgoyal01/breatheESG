from django.conf import settings
from django.conf.urls.static import static

from django.contrib import admin
from django.urls import path, include

urlpatterns = [

    path(
        "admin/",
        admin.site.urls
    ),

    path(
        "api/auth/",
        include("apps.core.urls")
    ),
path(
    "api/core/",
    include("apps.core.urls")
),

    path(
        "api/ingestion/",
        include("apps.ingestion.urls")
    ),

    path(
        "api/review/",
        include("apps.review.urls")
    ),
]

if settings.DEBUG:

    urlpatterns += static(
        settings.MEDIA_URL,
        document_root=settings.MEDIA_ROOT
    )