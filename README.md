
# Breathe ESG — Enterprise ESG Data Ingestion Platform

Live Frontend URL:
https://breathe-esg-coral.vercel.app/

Backend API:
https://breatheesg.duckdns.org/api

---

## Overview

Breathe ESG ingests emissions and operational activity data from multiple enterprise systems, normalizes inconsistent source formats, and provides an analyst review workflow before audit lock.

This prototype was built using:

- Django REST Framework
- React + Vite
- PostgreSQL
- Nginx
- Gunicorn
- AWS EC2
- Vercel

---

## Key Features

### Multi-Source ESG Ingestion

Supports:

- SAP fuel and procurement uploads
- Utility electricity ingestion
- Corporate travel ingestion

### Data Normalization

Normalizes:

- units
- dates
- emission categories
- Scope 1 / 2 / 3 mapping
- vendor naming

### Analyst Review Queue

Analysts can:

- review uploaded records
- approve records
- reject records
- flag suspicious rows
- audit ingestion quality

### Enterprise Features

- Multi-tenant architecture
- Company-scoped uploads
- JWT authentication
- Role-based access
- Audit trail
- Parse error tracking
- Source-of-truth preservation

---

## User Roles

| Role | Capabilities |
|---|---|
| CLIENT_UPLOADER | Upload company ESG datasets |
| ANALYST | Review and approve emissions |
| ADMIN | Platform management |

---

## Demo Credentials

### Admin

Username:
admin

Password:
Admin123!

---

### Analyst

Username:
analyst

Password:
Analyst123!

---

### Client Uploaders

| Company | Username | Password |
|---|---|---|
| Tata Steel | tata_uploader | Uploader123! |
| Infosys | infosys_uploader | Uploader123! |
| Unilever | unilever_uploader | Uploader123! |

---

## Local Development

### Backend

```bash
cd backend

python3 -m venv venv

source venv/bin/activate

pip install -r requirements.txt

python3 manage.py migrate

python3 manage.py seed_data

python3 manage.py runserver
````

---

### Frontend

```bash
cd frontend

npm install

npm run dev
```

---

## Environment Variables

### Frontend

```env
VITE_API_BASE_URL=https://YOUR_BACKEND_DOMAIN/api
```

---

### Backend

```env
SECRET_KEY=django-secret

DB_NAME=breathe_esg
DB_USER=postgres
DB_PASSWORD=password
DB_HOST=localhost
DB_PORT=5432
```

---

## Deployment

### Frontend

Hosted on:

* Vercel

### Backend

Hosted on:

* AWS EC2
* Nginx
* Gunicorn
* PostgreSQL

---

## Tech Stack

| Layer          | Technology              |
| -------------- | ----------------------- |
| Frontend       | React + Vite + Tailwind |
| Backend        | Django REST Framework   |
| Database       | PostgreSQL              |
| Authentication | JWT                     |
| Deployment     | AWS EC2 + Vercel        |
| Web Server     | Nginx                   |
| App Server     | Gunicorn                |

---

## ESG Data Sources

| Source                 | Ingestion Method |
| ---------------------- | ---------------- |
| SAP Fuel & Procurement | CSV Upload       |
| Utility Electricity    | CSV Upload       |
| Corporate Travel       | CSV Upload       |

---

## Future Improvements

* Real SAP OData integration
* Utility bill OCR pipeline
* Concur API ingestion
* Automated emission factor lookup
* AI anomaly detection
* Audit lock workflow
* Role-based RBAC permissions
* S3 object storage
* Kafka ingestion pipeline

---

## Author

Saksham Goyal