import uuid

from django.contrib.auth.models import AbstractUser
from django.db import models


class BaseModel(models.Model):
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    class Meta:
        abstract = True


class Company(BaseModel):
    name = models.CharField(
        max_length=255
    )

    slug = models.SlugField(
        unique=True
    )

    is_active = models.BooleanField(
        default=True
    )

    def __str__(self):
        return self.name


class User(AbstractUser):
    class Roles(models.TextChoices):
        CLIENT_UPLOADER = "CLIENT_UPLOADER", "Client Uploader"
        ANALYST = "ANALYST", "Analyst"
        ADMIN = "ADMIN", "Admin"

    company = models.ForeignKey(
        Company,
        on_delete=models.CASCADE,
        related_name="users",
        null=True,
        blank=True
    )

    role = models.CharField(
        max_length=50,
        choices=Roles.choices,
        default=Roles.CLIENT_UPLOADER
    )

    def __str__(self):
        return self.username