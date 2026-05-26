# DECISIONS.md — Every Ambiguity Resolved

This document records every design decision made during this project, what was chosen, why, and what we would ask the PM if we could.

---

## Source 1: SAP — Format Choice

**Ambiguity:** SAP can export data in many formats — IDoc flat files, XML, OData API (S/4HANA), BAPI function calls, or simple MB51/ME2M report exports.

**Decision:** We handle the **MB51 Material Document List CSV export**.

**Why:**
- IDoc format is a fixed-width flat file with segment headers like `EDI_DC40` and `E1MARAM` — extremely complex to parse and requires deep SAP knowledge to interpret segment types
- OData API (SAP S/4HANA) requires live system access, OAuth, and the client to be on S/4HANA (many are still on ECC 6.0)
- MB51 is the transaction a sustainability lead or SAP admin would realistically run and email as a CSV — it's the "export to spreadsheet" button in SAP
- Movement Type 261 (goods issue to cost center) captures fuel consumption; 101 captures goods receipt

**What we handle:**
- Movement types: 261 (consumption), 101 (receipt)
- Materials: fuel types (diesel, petrol, natural gas, LPG)
- Units: L (litres), KG (kilograms), M3 (cubic metres), GAL (gallons)
- Date format: DD.MM.YYYY (European — SAP default)
- Plant codes: stored as-is, mapped to location names via a lookup table seeded at onboarding

**What we ignore:**
- Procurement data (purchase orders, vendor invoices) — scope creep for a 4-day prototype
- Cost center allocations — not needed for emission calculation
- Batch numbers, storage locations — not relevant to carbon

**What we'd ask the PM:**
- Does the client use SAP ECC or S/4HANA? (affects what export formats are available)
- Can we get a sample file from the client before onboarding? Every SAP config is different.
- What plant codes does this client use, and what do they map to geographically?

---

## Source 2: Utility — Format Choice

**Ambiguity:** Utilities provide data as PDF bills, portal CSV exports, EDI 810 transactions, or (rarely) Green Button XML APIs.

**Decision:** We handle **portal CSV exports** (the "Download My Data" / "Download Usage History" format).

**Why:**
- PDF bills require OCR — significant complexity, error-prone, out of scope for prototype
- EDI 810 requires the utility to support it and the client to have an EDI gateway — rare for most facilities teams
- Green Button XML is only available from certain US utilities (PG&E, ComEd) — not globally applicable
- Portal CSV is what a facilities manager actually does: logs into the utility portal, clicks "Export Usage History", gets a CSV. This is the most common real-world workflow.

**What we handle:**
- Single electricity commodity (not gas or water)
- kWh and MWh units
- One row per billing period per meter
- Billing periods that don't align with calendar months (e.g. Oct 2 – Nov 3)
- Multiple meters per site (one DataSource can produce multiple EmissionRecords)

**What we ignore:**
- Demand charges (kW peak demand) — relevant for cost but not emission calculation
- Tiered/time-of-use rate details — not needed for carbon
- Net metering / solar export credits — not in scope

**What we'd ask the PM:**
- Which utility providers do the client's sites use? Some portals export in non-standard formats.
- Are there multiple sites/meters, or one building?
- What country are the sites in? (determines which grid emission factor to use)

---

## Source 3: Travel — Format Choice

**Ambiguity:** Concur offers a live REST API, but also allows batch CSV exports. Navan has a similar setup. Some companies use neither and track travel in spreadsheets.

**Decision:** We handle **Concur-style CSV batch export** (not live API).

**Why:**
- Live Concur API requires OAuth 2.0, client credentials, and the client to grant API access — a multi-week procurement/IT process, not feasible in 4 days
- Concur CSV exports are what finance/travel managers actually produce for monthly reporting
- The CSV structure mirrors what the API returns — building for CSV now means upgrading to live API later is just swapping the ingestion layer
- Navan, TravelPerk, and other platforms export in similar columnar formats — our parser handles the column mapping layer separately from the business logic

**What we handle:**
- Expense types: AIRFARE, HOTEL, CAR_RENTAL, TAXI/RIDESHARE
- Flights: origin + destination airport codes (IATA), travel class (economy/business/first)
- Distance: calculated via Haversine formula from IATA codes when not provided
- Hotels: check-in date, check-out date, number of nights derived from dates
- Ground transport: treated as flat per-trip emission estimate when distance unavailable

**What we ignore:**
- Rail travel — not in standard Concur export, would need separate handling
- Personal vehicle mileage claims — different emission factor model
- International vs domestic flight classification for factor selection — we use a single DEFRA factor for now

**What we'd ask the PM:**
- Does the client use Concur, Navan, TravelPerk, or something else?
- Do they track travel class? (business class is ~2x the emission factor of economy)
- How often do they export? Monthly? Quarterly?

---

## Multi-Tenancy Approach

**Decision:** Row-level tenancy using a `company` foreign key on every data table, enforced via a custom Django ORM manager.

**Rejected alternative:** Separate database per client (schema-per-tenant).

**Why row-level:**
- Simpler to operate — one database, one migration, one deployment
- Schema-per-tenant requires dynamic database routing and makes cross-company analytics harder (Breathe ESG analysts need to see all clients)
- Sufficient for a prototype; a production system serving 1000+ clients might revisit this

---

## Review Status Model

**Decision:** Four statuses: `PENDING → APPROVED / FLAGGED / REJECTED`

- `PENDING`: Just ingested, not yet reviewed
- `APPROVED`: Analyst confirmed this row is correct, ready for audit
- `FLAGGED`: Analyst has a question — needs follow-up with client
- `REJECTED`: Row is wrong and should not be included in emissions totals

**Why not just APPROVED/REJECTED?**
`FLAGGED` is important — in real ESG workflows, analysts often need to ask the client "was this really 50,000 litres of diesel in one month?" before approving or rejecting. Flagged rows are visible to the client uploader who can respond.

---

## Emission Factors

**Decision:** Hardcoded DEFRA 2023 factors as constants in the codebase, with the factor and its source stored on each EmissionRecord.

**Rejected alternative:** A separate EmissionFactor database table with versioning.

**Why hardcoded for now:**
- Emission factors change once a year at most
- A full factor versioning system is significant scope
- Storing the factor value AND source on each record means we can always reproduce the calculation, even if the constants change later
- DEFRA (UK) factors are the most commonly used internationally for corporate carbon accounting

**What we'd ask the PM:**
- Which emission factor standard does Breathe ESG use? DEFRA, EPA, GHG Protocol, custom?
- Are client-specific factors ever used (e.g. a client has a Power Purchase Agreement with a renewable provider)?

---

## Date Handling

**Decision:** Store the raw date string in `raw_date` AND the parsed DATE in `activity_date`.

**Why:** SAP dates come as `01.03.2024` (European), Concur dates come as `2024-03-01` (ISO), utility bills come as `03/01/2024` (US) or `01/03/2024` (UK — ambiguous!). Storing the raw string means we can debug parsing failures. Storing the parsed DATE means queries work correctly.

---

## Airport Distance Calculation

**Decision:** Calculate great-circle distance using the Haversine formula from a static IATA airport coordinates lookup table.

**Why:** Concur exports give airport codes (BOM, DEL) but not distances. We need distance to calculate flight emissions. The Haversine formula gives straight-line distance — actual flight paths are longer, but DEFRA's emission factors already account for this with a Radiative Forcing Index multiplier. We use the `airportsdata` Python package for IATA coordinates.
