from django.contrib import admin

from apps.core.models import Company, User


admin.site.register(Company)
admin.site.register(User)