from rest_framework import serializers

from apps.ingestion.models import (
    DataSource,
    ParseError,
)


class DataSourceSerializer(serializers.ModelSerializer):

    class Meta:
        model = DataSource

        fields = "__all__"


class ParseErrorSerializer(serializers.ModelSerializer):

    class Meta:
        model = ParseError

        fields = "__all__"