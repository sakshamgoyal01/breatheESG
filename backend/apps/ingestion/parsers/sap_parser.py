import csv
from datetime import datetime
from io import StringIO


FUEL_MAPPINGS = {
    "diesel": "diesel",
    "petrol": "petrol",
    "lpg": "lpg",
    "natural gas": "natural_gas",
}


def parse_sap_csv(file_content):
    parsed_rows = []

    errors = []

    reader = csv.DictReader(
        StringIO(file_content)
    )

    for row_number, row in enumerate(reader, start=2):

        try:
            movement_type = row.get("MvtType")

            if movement_type not in ["261", "101"]:
                continue

            quantity = row.get("Qty")

            if not quantity:
                raise ValueError(
                    "Missing quantity"
                )

            posting_date = datetime.strptime(
                row["PostDate"],
                "%d.%m.%Y"
            ).date()

            material_desc = (
                row.get("MaterialDesc", "")
                .strip()
                .lower()
            )

            fuel_type = None

            for key in FUEL_MAPPINGS:
                if key in material_desc:
                    fuel_type = FUEL_MAPPINGS[key]
                    break

            if not fuel_type:
                raise ValueError(
                    "Unknown fuel material"
                )

            parsed_rows.append({
                "material_doc": row["MatDoc"],
                "posting_date": posting_date,
                "plant": row["Plant"],
                "material_code": row["Material"],
                "fuel_type": fuel_type,
                "quantity": float(quantity),
                "unit": row["UoM"],
                "amount": row["AmountLC"],
                "currency": row["Currency"],
                "cost_center": row["CostCenter"],
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