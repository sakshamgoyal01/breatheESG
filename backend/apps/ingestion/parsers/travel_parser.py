import csv
from datetime import datetime
from io import StringIO

import airportsdata
from math import radians, sin, cos, sqrt, atan2


airports = airportsdata.load("IATA")


def haversine(lat1, lon1, lat2, lon2):

    r = 6371

    dlat = radians(lat2 - lat1)

    dlon = radians(lon2 - lon1)

    a = (
        sin(dlat / 2) ** 2
        + cos(radians(lat1))
        * cos(radians(lat2))
        * sin(dlon / 2) ** 2
    )

    c = 2 * atan2(sqrt(a), sqrt(1 - a))

    return r * c


def parse_travel_csv(file_content):

    parsed_rows = []

    errors = []

    reader = csv.DictReader(
        StringIO(file_content)
    )

    for row_number, row in enumerate(reader, start=2):

        try:

            expense_type = (
                row["expense_type"]
                .strip()
                .upper()
            )

            travel_date = datetime.strptime(
                row["travel_date"],
                "%Y-%m-%d"
            ).date()

            distance_km = row.get("distance_km")

            if (
                expense_type == "AIRFARE"
                and not distance_km
            ):

                origin = airports[
                    row["origin_iata"]
                ]

                destination = airports[
                    row["dest_iata"]
                ]

                distance_km = haversine(
                    origin["lat"],
                    origin["lon"],
                    destination["lat"],
                    destination["lon"],
                )

            parsed_rows.append({
                "employee_id": row["employee_id"],
                "employee_name": row["employee_name"],
                "trip_id": row["trip_id"],
                "expense_type": expense_type,
                "travel_date": travel_date,
                "origin": row["origin"],
                "destination": row["destination"],
                "origin_iata": row["origin_iata"],
                "dest_iata": row["dest_iata"],
                "travel_class": row["travel_class"],
                "vendor": row["vendor"],
                "amount": row["amount"],
                "currency": row["currency"],
                "hotel_nights": row["hotel_nights"],
                "distance_km": distance_km,
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