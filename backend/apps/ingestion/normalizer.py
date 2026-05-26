from decimal import Decimal


EMISSION_FACTORS = {
    "diesel": Decimal("2.68"),
    "petrol": Decimal("2.31"),
    "lpg": Decimal("1.51"),
    "natural_gas": Decimal("2.04"),

    "electricity_india": Decimal("0.716"),

    "flight_economy": Decimal("0.255"),
    "flight_business": Decimal("0.510"),
    "flight_first": Decimal("0.765"),

    "hotel_night": Decimal("31.0"),

    "ground_transport_estimate": Decimal("2.1"),
}


def normalize(
    category,
    subcategory,
    quantity,
    unit,
    travel_class=None
):
    quantity = Decimal(str(quantity))

    unit = unit.upper()

    if unit == "MWH":
        quantity = quantity * Decimal("1000")
        unit = "KWH"

    if unit == "GAL":
        quantity = quantity * Decimal("3.785")
        unit = "L"

    if category == "FUEL":
        factor = EMISSION_FACTORS[subcategory]

        normalized = quantity * factor

        return {
            "normalized_kgco2e": round(normalized, 4),
            "emission_factor": factor,
            "emission_factor_source": "DEFRA_2023"
        }

    if category == "ELECTRICITY":
        factor = EMISSION_FACTORS["electricity_india"]

        normalized = quantity * factor

        return {
            "normalized_kgco2e": round(normalized, 4),
            "emission_factor": factor,
            "emission_factor_source": "DEFRA_2023"
        }

    if category == "FLIGHT":
        if travel_class == "BUSINESS":
            factor = EMISSION_FACTORS["flight_business"]

        elif travel_class == "FIRST":
            factor = EMISSION_FACTORS["flight_first"]

        else:
            factor = EMISSION_FACTORS["flight_economy"]

        normalized = quantity * factor

        return {
            "normalized_kgco2e": round(normalized, 4),
            "emission_factor": factor,
            "emission_factor_source": "DEFRA_2023"
        }

    if category == "HOTEL":
        factor = EMISSION_FACTORS["hotel_night"]

        normalized = quantity * factor

        return {
            "normalized_kgco2e": round(normalized, 4),
            "emission_factor": factor,
            "emission_factor_source": "DEFRA_2023"
        }

    if category == "GROUND_TRANSPORT":
        factor = EMISSION_FACTORS[
            "ground_transport_estimate"
        ]

        return {
            "normalized_kgco2e": factor,
            "emission_factor": factor,
            "emission_factor_source": "DEFRA_2023"
        }

    raise ValueError(
        f"Unsupported category: {category}"
    )