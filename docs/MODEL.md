
## The Core Idea

Every piece of data in this system needs to answer three questions:

1. **Where did it come from?** — which company, which file, which row
2. **What does it mean?** — what emission, what scope, what unit
3. **Who touched it?** — who uploaded, who reviewed, who approved

The entire database is built around these three questions.

---

## Tables

### 1. Company

Represents one enterprise client — for example Tata Steel or Infosys.

| Field | Type | What it does |
|-------|------|-------------|
| id | UUID | Unique ID — not a simple number, explained below |
| name | text | Company display name |
| slug | text | URL-safe version e.g. "tata-steel" |
| is_active | true/false | Disable a company without deleting their data |
| created_at | timestamp | When they were onboarded |

**Why UUID and not 1, 2, 3?**
If company IDs are sequential numbers, a user who knows their ID is 5 could try changing the URL to 6 and see another company's data. UUID is a random 32-character string — impossible to guess.

---

### 2. User

Anyone who logs into the system.

| Field | Type | What it does |
|-------|------|-------------|
| id | UUID | Unique ID |
| company | link → Company | Which company this person belongs to |
| email | text | Used to log in |
| role | choice | One of three roles below |
| is_active | true/false | Disable without deleting |

**Three roles:**

- `CLIENT_UPLOADER` — works at the client company. Can upload files. Cannot see the review dashboard.
- `ANALYST` — works at Breathe ESG. Can see all companies' data. Can approve, flag, reject records.
- `ADMIN` — can create companies and manage users.

---

### 3. DataSource

Every time someone uploads a file, we create one DataSource record. Think of it as a receipt for the upload.

| Field | Type | What it does |
|-------|------|-------------|
| id | UUID | Unique ID |
| company | link → Company | Which client this file belongs to |
| source_type | choice | SAP, UTILITY, or TRAVEL |
| ingestion_mode | choice | FILE_UPLOAD or API_PULL |
| uploaded_by | link → User | Who uploaded it |
| uploaded_at | timestamp | When |
| original_filename | text | e.g. "MB51_Q1_2024.csv" |
| file_hash | text | SHA-256 fingerprint of the file |
| raw_file | file | The actual uploaded file, never modified |
| status | choice | PENDING / PROCESSING / COMPLETE / FAILED / PARTIAL |
| total_rows | number | How many rows were in the file |
| parsed_rows | number | How many parsed successfully |
| failed_rows | number | How many failed |
| error_log | JSON | List of row-level errors |
| reporting_period_start | date | What period this data covers |
| reporting_period_end | date | What period this data covers |

**Why store the raw file?**
If our parser has a bug, we can re-run it on the original file without asking the client to upload again.

**Why store file_hash?**
Clients sometimes upload the same file twice by mistake. The hash lets us detect duplicates and warn them instead of creating double records.

---

### 4. EmissionRecord

This is the main table. One row = one emission event — one fuel consumption, one electricity bill, one flight.

**Raw fields — never changed after ingestion:**

| Field | What it stores |
|-------|---------------|
| raw_quantity | The original number from the file — e.g. 2500 |
| raw_unit | The original unit — e.g. "L" or "GAL" or "KWH" |
| raw_date | The original date string — e.g. "01.03.2024" |

**Why keep raw values?**
Because 2500 litres of diesel and 2500 gallons of diesel are very different amounts. If we only stored the normalized value, we'd lose the proof of what the original data actually said. Auditors need this.

**Normalized fields — calculated at ingestion:**

| Field | What it stores |
|-------|---------------|
| normalized_quantity_kgco2e | Everything converted to kg of CO2 equivalent |
| emission_factor | The factor used — e.g. 2.68 for diesel |
| emission_factor_source | Where the factor came from — e.g. "DEFRA 2023" |

**Why normalize to kgCO2e?**
You can't add litres of diesel + kWh of electricity + km of flight. They're different units. Converting everything to kgCO2e means analysts can compare and total across all sources.

**Classification fields:**

| Field | What it stores |
|-------|---------------|
| scope | SCOPE_1, SCOPE_2, or SCOPE_3 |
| category | FUEL, ELECTRICITY, FLIGHT, HOTEL, GROUND_TRANSPORT |
| subcategory | More detail — e.g. "diesel", "economy_flight" |

**Scope logic:**
- Fuel (diesel, petrol) → Scope 1 — your company burns it directly
- Electricity → Scope 2 — you bought it, someone else generated it
- Flights, hotels, taxis → Scope 3 — indirect, employee activities

**Travel-specific fields (empty for non-travel rows):**

| Field | What it stores |
|-------|---------------|
| origin_code | Airport code e.g. "BOM" |
| destination_code | Airport code e.g. "DEL" |
| distance_km | Calculated using Haversine formula if not in source |
| travel_class | ECONOMY, BUSINESS, or FIRST |
| hotel_nights | Number of nights for hotel records |

**Review fields:**

| Field | What it stores |
|-------|---------------|
| status | PENDING → APPROVED / FLAGGED / REJECTED |
| flag_reason | What the analyst wrote when flagging |
| reviewed_by | Which analyst reviewed it |
| reviewed_at | When they reviewed it |
| is_locked | Once locked, no more edits — sent to auditors |

---

### 5. AuditLog

Every time an EmissionRecord changes, we write one entry here. This table is never edited — only added to.

| Field | What it stores |
|-------|---------------|
| record | Which EmissionRecord changed |
| action | CREATED / APPROVED / FLAGGED / REJECTED / LOCKED |
| changed_by | Who did it |
| changed_at | When |
| old_value | JSON snapshot of the record before the change |
| new_value | JSON snapshot after the change |
| note | Optional comment from the analyst |

**Why JSON snapshots?**
Different actions change different fields. Rather than having 20 separate columns for "old status", "old flag reason" etc., we just save the whole record state as JSON. An auditor can see exactly what changed and when.

**Example of what one log entry looks like:**
```
action: APPROVED
changed_by: analyst@breatheesg.com
changed_at: 2024-02-15 14:32:00
old_value: {"status": "PENDING"}
new_value: {"status": "APPROVED", "reviewed_by": "analyst@breatheesg.com"}
```

---

### 6. ParseError

When a row in an uploaded file can't be parsed, we store it here so analysts can see what went wrong.

| Field | What it stores |
|-------|---------------|
| source | Which DataSource this came from |
| row_number | Which row in the file failed |
| raw_row | The exact content of the failing row |
| error_type | MISSING_FIELD / BAD_DATE / UNKNOWN_UNIT / BAD_FORMAT |
| error_message | Plain English explanation of what went wrong |

**Example:**
```
row_number: 7
raw_row: "5000012307,32.13.2024,IN01,MAT-DIESEL,261,,L"
error_type: BAD_DATE
error_message: "Could not parse date '32.13.2024' — day 32 does not exist"
```

---

## How The Tables Connect

```
Company
  └── Users (people who belong to this company)
  └── DataSources (files uploaded for this company)
        └── EmissionRecords (rows parsed from the file)
        │       └── AuditLogs (every change to each record)
        └── ParseErrors (rows that failed to parse)
```

---

## Emission Factors Used

All conversions use DEFRA 2023 published factors.

| Activity | Factor | Source |
|----------|--------|--------|
| Diesel (per litre) | 2.68 kgCO2e | DEFRA 2023 |
| Petrol (per litre) | 2.31 kgCO2e | DEFRA 2023 |
| LPG (per litre) | 1.51 kgCO2e | DEFRA 2023 |
| Natural gas (per m³) | 2.04 kgCO2e | DEFRA 2023 |
| Electricity — India grid (per kWh) | 0.716 kgCO2e | IEA 2023 |
| Flight economy (per km) | 0.255 kgCO2e | DEFRA 2023 |
| Flight business (per km) | 0.510 kgCO2e | DEFRA 2023 |
| Hotel (per night) | 31.0 kgCO2e | DEFRA 2023 |

DEFRA factors reference: https://www.gov.uk/government/publications/greenhouse-gas-reporting-conversion-factors-2023

---

## Multi-Tenancy — How We Keep Data Separate

Every table that holds client data has a `company` field. Every database query filters by company automatically.

- A CLIENT_UPLOADER from Tata Steel can only ever see Tata Steel's records
- An ANALYST from Breathe ESG can see all companies
- An ADMIN can manage everything

This is enforced in the Django ORM layer — not just in the UI. Even if someone bypasses the frontend, the query itself will only return their company's data.

---

## What This Model Does Not Handle

Three things were deliberately left out:

1. **Emission factor versioning** — factors are hardcoded as DEFRA 2023 constants. A production system would need a separate table tracking factors by year.

2. **Live API connections** — DataSource has an `API_PULL` mode defined, but this prototype only uses file upload. The model supports it without schema changes.

3. **Currency conversion** — travel amounts are stored as-is in original currency. They don't affect emission calculations but a production system would normalize these too.