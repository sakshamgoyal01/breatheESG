# TRADEOFFS.md — Three Things We Deliberately Did Not Build

---

## 1. Live API Integrations (Concur OAuth, SAP OData, Green Button)

**What we built instead:** File upload (CSV/Excel) for all three sources.

**What we deliberately skipped:**
- Concur REST API with OAuth 2.0 token flow
- SAP S/4HANA OData service polling
- Green Button XML API for utility data

**Why this was the right call:**

Live API integrations would require: (a) client IT teams to grant API credentials — a multi-week procurement process, (b) OAuth token refresh logic and credential storage, (c) error handling for API rate limits, downtime, and schema changes, (d) scheduled polling infrastructure (Celery beat or cron).

None of this is feasible in 4 days. More importantly, the **core value of this prototype is the data model, parsing logic, and review workflow** — not the transport layer. The architecture is explicitly designed so that replacing a file upload with an API pull only changes the ingestion layer, not the models or the review dashboard.

In a real deployment, the file upload approach is also genuinely used by clients — a Concur admin exports monthly, an SAP admin runs MB51 quarterly. File upload is not a toy approximation; it's a real ingestion pattern.

**What breaks in production:**
A real deployment would need live API pulls for high-frequency data, automated ingestion scheduling, and webhook-based triggers. File upload creates a manual step that could cause reporting delays.

---

## 2. Emission Factor Versioning and a Factor Library

**What we built instead:** Hardcoded DEFRA 2023 constants, stored per-record at ingestion time.

**What we deliberately skipped:**
- An `EmissionFactor` table with effective date ranges (valid_from, valid_to)
- Factor versioning — re-normalizing all records when a new factor release comes out
- Country-specific grid factors for electricity (we use India grid only)
- Client-specific factors (e.g. a company with a renewable PPA might have a 0 kgCO2e/kWh electricity factor)
- Automatic DEFRA/EPA factor updates

**Why this was the right call:**

Emission factor versioning is a significant domain problem. Factors change once a year. A full versioning system requires: a factor library database, effective date logic, a re-normalization job that recalculates all historical records when factors update, and a UI for analysts to manage factors.

This is a separate product feature — arguably the foundation of a proper carbon accounting engine. Building it in 4 days would mean building it badly.

Our mitigation: storing `emission_factor` and `emission_factor_source` on every `EmissionRecord` means a production system could add versioning later without data loss. Every record already knows which factor it used and where it came from.

**What breaks in production:**
When DEFRA releases updated 2024 factors, historical records calculated with 2023 factors will be wrong unless re-normalized. Without a versioning system, this is a manual process.

---

## 3. Client-Facing Portal (Upload UI + Status Tracking for Client Companies)

**What we built instead:** A single analyst-facing dashboard. File uploads are done directly through the analyst interface.

**What we deliberately skipped:**
- A separate login experience for client company users
- A client portal where the client uploads their own files and sees ingestion status
- Email notifications to clients when their upload fails or is flagged
- A client response workflow (client replies to a flagged row with clarification)

**Why this was the right call:**

A client-facing portal is essentially a second product. It requires: separate authentication flows by role, a different UI with different permissions, email notification infrastructure, and a back-and-forth communication layer between client and analyst.

The assignment asks for a prototype that lets **analysts review and sign off** on data. The core workflow is: data comes in → analyst reviews → analyst approves → locked for audit. The client upload mechanism is a detail of the ingestion layer, not the review workflow.

In a real deployment, clients would need their own portal. But building that before the analyst workflow is correct would be building on an unstable foundation.

**What breaks in production:**
Without a client portal, the analyst team has to receive files by email and upload them manually. This doesn't scale beyond a handful of clients and creates a process dependency on the Breathe ESG team rather than the client.
