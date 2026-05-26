import hashlib

from django.db import transaction

from rest_framework import status

from rest_framework.parsers import (
    MultiPartParser,
    FormParser,
)

from rest_framework.permissions import (
    IsAuthenticated
)

from rest_framework.response import (
    Response
)

from rest_framework.views import (
    APIView
)

from apps.core.models import (
    Company
)

from apps.ingestion.models import (
    DataSource,
    ParseError,
)

from apps.ingestion.normalizer import (
    normalize
)

from apps.ingestion.parsers.sap_parser import (
    parse_sap_csv,
)

from apps.ingestion.parsers.utility_parser import (
    parse_utility_csv,
)

from apps.ingestion.parsers.travel_parser import (
    parse_travel_csv,
)

from apps.ingestion.serializers import (
    DataSourceSerializer,
    ParseErrorSerializer,
)

from apps.review.models import (
    EmissionRecord,
    AuditLog,
)


class FileUploadView(APIView):

    permission_classes = [
        IsAuthenticated
    ]

    parser_classes = [
        MultiPartParser,
        FormParser,
    ]

    @transaction.atomic
    def post(self, request):

        source_type = request.data.get(
            "source_type"
        )

        uploaded_file = request.FILES.get(
            "file"
        )

        # ENTERPRISE MULTI-TENANT COMPANY LOGIC

        if request.user.role in [
            "ANALYST",
            "ADMIN"
        ]:

            company_id = request.data.get(
                "company_id"
            )

            if not company_id:

                return Response(
                    {
                        "error":
                        "Company is required"
                    },
                    status=400
                )

            try:

                company = Company.objects.get(
                    id=company_id
                )

            except Company.DoesNotExist:

                return Response(
                    {
                        "error":
                        "Invalid company"
                    },
                    status=400
                )

        else:

            company = request.user.company

            if not company:

                return Response(
                    {
                        "error":
                        "User has no company assigned"
                    },
                    status=400
                )

        if not uploaded_file:

            return Response(
                {
                    "error":
                    "File required"
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        file_content = uploaded_file.read()

        file_hash = hashlib.sha256(
            file_content
        ).hexdigest()

        duplicate_exists = (
            DataSource.objects.filter(
                company=company,
                file_hash=file_hash
            ).exists()
        )

        datasource = (
            DataSource.objects.create(

                company=company,

                source_type=source_type,

                uploaded_by=request.user,

                original_filename=
                    uploaded_file.name,

                file_hash=file_hash,

                raw_file=uploaded_file,

                status=
                    DataSource
                    .StatusChoices
                    .PROCESSING
            )
        )

        if duplicate_exists:

            datasource.error_log.append(
                "Duplicate file detected"
            )

        file_string = file_content.decode(
            "utf-8"
        )

        parsed_rows = []

        parse_errors = []

        try:

            if source_type == "SAP":

                parsed_rows, parse_errors = (
                    parse_sap_csv(
                        file_string
                    )
                )

            elif source_type == "UTILITY":

                parsed_rows, parse_errors = (
                    parse_utility_csv(
                        file_string
                    )
                )

            elif source_type == "TRAVEL":

                parsed_rows, parse_errors = (
                    parse_travel_csv(
                        file_string
                    )
                )

            else:

                return Response(
                    {
                        "error":
                        "Invalid source type"
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

            datasource.total_rows = (
                len(parsed_rows)
                + len(parse_errors)
            )

            datasource.parsed_rows = len(
                parsed_rows
            )

            datasource.failed_rows = len(
                parse_errors
            )

            # SAVE PARSE ERRORS

            for error in parse_errors:

                ParseError.objects.create(

                    source=datasource,

                    company=company,

                    row_number=error[
                        "row_number"
                    ],

                    raw_row=error[
                        "raw_row"
                    ],

                    error_type=error[
                        "error_type"
                    ],

                    error_message=error[
                        "error_message"
                    ],
                )

            # CREATE EMISSION RECORDS

            for row in parsed_rows:

                self.create_emission_record(
                    source_type,
                    datasource,
                    request,
                    row,
                    company
                )

            datasource.status = (

                DataSource
                .StatusChoices
                .COMPLETE

                if not parse_errors

                else

                DataSource
                .StatusChoices
                .PARTIAL
            )

            datasource.save()

            return Response({

                "datasource_id":
                    str(datasource.id),

                "total_rows":
                    datasource.total_rows,

                "parsed_rows":
                    datasource.parsed_rows,

                "failed_rows":
                    datasource.failed_rows,

                "duplicate_detected":
                    duplicate_exists,
            })

        except Exception as e:

            datasource.status = (
                DataSource
                .StatusChoices
                .FAILED
            )

            datasource.error_log.append(
                str(e)
            )

            datasource.save()

            return Response(
                {
                    "error":
                    str(e)
                },
                status=
                    status
                    .HTTP_500_INTERNAL_SERVER_ERROR
            )

    def create_emission_record(
        self,
        source_type,
        datasource,
        request,
        row,
        company
    ):

        # SAP RECORDS

        if source_type == "SAP":

            normalization = normalize(

                category="FUEL",

                subcategory=row[
                    "fuel_type"
                ],

                quantity=row[
                    "quantity"
                ],

                unit=row["unit"],
            )

            record = (
                EmissionRecord.objects.create(

                    company=company,

                    source=datasource,

                    scope="SCOPE_1",

                    category="FUEL",

                    subcategory=row[
                        "fuel_type"
                    ],

                    raw_quantity=row[
                        "quantity"
                    ],

                    raw_unit=row[
                        "unit"
                    ],

                    raw_date=str(
                        row["posting_date"]
                    ),

                    activity_date=row[
                        "posting_date"
                    ],

                    location=row[
                        "plant"
                    ],

                    normalized_quantity_kgco2e=
                        normalization[
                            "normalized_kgco2e"
                        ],

                    emission_factor=
                        normalization[
                            "emission_factor"
                        ],

                    emission_factor_source=
                        normalization[
                            "emission_factor_source"
                        ],

                    row_number=row[
                        "row_number"
                    ],
                )
            )

        # UTILITY RECORDS

        elif source_type == "UTILITY":

            normalization = normalize(

                category="ELECTRICITY",

                subcategory="electricity",

                quantity=row[
                    "usage_kwh"
                ],

                unit="KWH",
            )

            record = (
                EmissionRecord.objects.create(

                    company=company,

                    source=datasource,

                    scope="SCOPE_2",

                    category="ELECTRICITY",

                    subcategory=
                        "grid_electricity",

                    raw_quantity=row[
                        "usage_kwh"
                    ],

                    raw_unit="KWH",

                    raw_date=str(
                        row["bill_start"]
                    ),

                    activity_date=row[
                        "bill_start"
                    ],

                    location=row[
                        "site_name"
                    ],

                    vendor=row[
                        "utility_name"
                    ],

                    normalized_quantity_kgco2e=
                        normalization[
                            "normalized_kgco2e"
                        ],

                    emission_factor=
                        normalization[
                            "emission_factor"
                        ],

                    emission_factor_source=
                        normalization[
                            "emission_factor_source"
                        ],

                    row_number=row[
                        "row_number"
                    ],
                )
            )

        # TRAVEL RECORDS

        elif source_type == "TRAVEL":

            expense_type = row[
                "expense_type"
            ]

            quantity = 1

            if expense_type == "AIRFARE":

                category = "FLIGHT"

                scope = "SCOPE_3"

                quantity = row[
                    "distance_km"
                ]

                normalization = normalize(

                    category="FLIGHT",

                    subcategory="flight",

                    quantity=quantity,

                    unit="KM",

                    travel_class=row[
                        "travel_class"
                    ],
                )

            elif expense_type == "HOTEL":

                category = "HOTEL"

                scope = "SCOPE_3"

                quantity = (
                    row["hotel_nights"]
                    or 1
                )

                normalization = normalize(

                    category="HOTEL",

                    subcategory="hotel",

                    quantity=quantity,

                    unit="NIGHT",
                )

            else:

                category = (
                    "GROUND_TRANSPORT"
                )

                scope = "SCOPE_3"

                normalization = normalize(

                    category=
                        "GROUND_TRANSPORT",

                    subcategory="ground",

                    quantity=1,

                    unit="TRIP",
                )

            record = (
                EmissionRecord.objects.create(

                    company=company,

                    source=datasource,

                    scope=scope,

                    category=category,

                    subcategory=
                        expense_type,

                    raw_quantity=
                        quantity,

                    raw_unit="KM",

                    raw_date=str(
                        row[
                            "travel_date"
                        ]
                    ),

                    activity_date=row[
                        "travel_date"
                    ],

                    vendor=row[
                        "vendor"
                    ],

                    origin_code=row[
                        "origin_iata"
                    ],

                    destination_code=row[
                        "dest_iata"
                    ],

                    distance_km=row[
                        "distance_km"
                    ],

                    travel_class=row[
                        "travel_class"
                    ],

                    hotel_nights=row[
                        "hotel_nights"
                    ],

                    normalized_quantity_kgco2e=
                        normalization[
                            "normalized_kgco2e"
                        ],

                    emission_factor=
                        normalization[
                            "emission_factor"
                        ],

                    emission_factor_source=
                        normalization[
                            "emission_factor_source"
                        ],

                    row_number=row[
                        "row_number"
                    ],
                )
            )

        # AUDIT LOG

        AuditLog.objects.create(

            company=company,

            record=record,

            action="CREATED",

            changed_by=request.user,

            new_value={
                "status":
                "PENDING"
            }
        )


class DataSourceListView(APIView):

    permission_classes = [
        IsAuthenticated
    ]

    def get(self, request):

        if request.user.role in [
            "ANALYST",
            "ADMIN"
        ]:

            sources = (
                DataSource.objects.all()
                .order_by("-created_at")
            )

        else:

            sources = (
                DataSource.objects.filter(
                    company=request.user.company
                )
                .order_by("-created_at")
            )

        serializer = (
            DataSourceSerializer(
                sources,
                many=True
            )
        )

        return Response(
            serializer.data
        )


class ParseErrorListView(APIView):

    permission_classes = [
        IsAuthenticated
    ]

    def get(
        self,
        request,
        source_id
    ):

        errors = (
            ParseError.objects.filter(
                source_id=source_id
            )
        )

        serializer = (
            ParseErrorSerializer(
                errors,
                many=True
            )
        )

        return Response(
            serializer.data
        )