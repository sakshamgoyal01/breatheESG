import csv
from datetime import datetime
from io import StringIO


def parse_utility_csv(file_content):

    parsed_rows = []

    errors = []

    reader = csv.DictReader(
        StringIO(file_content)
    )

    for row_number, row in enumerate(reader, start=2):

        try:

            usage_kwh = row.get("usage_kwh")

            if not usage_kwh:
                raise ValueError(
                    "Missing usage_kwh"
                )

            usage_kwh = float(usage_kwh)

            if usage_kwh <= 0:
                continue

            bill_start = datetime.strptime(
                row["bill_start"],
                "%Y-%m-%d"
            ).date()

            bill_end = datetime.strptime(
                row["bill_end"],
                "%Y-%m-%d"
            ).date()

            parsed_rows.append({
                "account_number": row["account_number"],
                "meter_id": row["meter_id"],
                "site_name": row["site_name"],
                "bill_start": bill_start,
                "bill_end": bill_end,
                "days_in_period": row["days"],
                "usage_kwh": usage_kwh,
                "total_cost": row["total_cost_inr"],
                "tariff_code": row["tariff_code"],
                "utility_name": row["utility"],
                "row_number": row_number,
            })

        except Exception as e:

            errors.append({
                "row_number": row_number,
                "raw_row": str(row),
                "error_type": "BAD_FORMAT",
                "error_message": str(e),
            })

    return parsed_rows, errors