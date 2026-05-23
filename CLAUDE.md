# CLAUDE.md — Data Engineering Challenge

## Project Overview

This is a **Data Engineering Challenge** project covering three sections:

| Section | File(s) | Topic |
|---------|---------|-------|
| 1 | `section1_DAG.py` | Apache Airflow ETL DAG |
| 2 | `section2_create_tables.sql`, `section2_carsales.sql`, `section2_ERD.png` | PostgreSQL schema & queries |
| 3 | `section_3_system_design.pdf` | System design architecture |

**Stack**: Python (Apache Airflow), PostgreSQL, Docker, Pandas, NumPy

---

## Repository Structure

```
DE/
├── Dockerfile                    # PostgreSQL image with auto-schema init
├── README.md                     # Minimal project title
├── section1_DAG.py               # Airflow DAG: CSV ingestion & transformation
├── section2_ERD.png              # Entity Relationship Diagram
├── section2_create_tables.sql    # DDL: table definitions with FK constraints
├── section2_carsales.sql         # Analytical queries on the car sales schema
└── section_3_system_design.pdf   # System design documentation
```

---

## Section 1 — Airflow DAG (`section1_DAG.py`)

### DAG: `01_daily`

Runs on a `@daily` schedule. The pipeline reads two CSVs, transforms each, merges them, and writes output.

**Task sequence:**
```
transform_data1_task >> transform_data2_task >> append_data_task >> save_data_task
```

**Input paths (hardcoded in PythonOperator op_kwargs):**
- `/dataset1.csv`
- `/dataset2.csv`

**Output path:** passed via `output_path` kwarg to `save_data`

### Transformation logic (per dataset)

1. Read CSV with comma separator and header row
2. Drop rows where `name` is null
3. Strip leading zeros from `price`, convert to float
4. Add boolean column `above_100` (`price > 100`)
5. Extract `first_name` / `last_name` via regex (handles middle names by capturing first and last word)
6. Join extracted names back with `price` and `above_100`

### Known Bugs (as of last commit)

These bugs exist in the current source and should be fixed before the DAG can run:

| # | Location | Issue |
|---|----------|-------|
| 1 | Line 1–4 | Missing imports: `import datetime as dt` and `from datetime import datetime, timedelta` |
| 2 | Lines 7, 27, 48, 53 | Function signatures use `*args, **kargs` but access `kwargs` (typo: `kargs` → `kwargs`) |
| 3 | Lines 16, 36 | Price cleaning is not assigned back: `names_data1['price'] = names_data1['price'].astype(str).str.replace(...)...` |
| 4 | Lines 50 | `names_data1` and `names_data2` are local to their functions — not accessible in `append_data()`; use XCom or return values |
| 5 | Line 50 | `DataFrame.append()` is removed in Pandas ≥ 2.0; replace with `pd.concat([names_data1, names_data2], ignore_index=True)` |
| 6 | Line 55 | `names_data` is undefined in `save_data()`; same scoping issue as above |
| 7 | Lines 62–63 | `default_args` uses `datetime(...)` and `timedelta(...)` directly — requires the missing imports |

---

## Section 2 — PostgreSQL Schema & Queries

### Database: `carsales`

**Tables and relationships:**

```
Customer (cust_id PK, cust_name, phone_no)
    │
    └──< CarSales (trans_id PK, trans_datetime, cust_id FK, sales_per_id FK)
                                                                    │
SalesPerson (sales_per_id PK, sales_per_name) ─────────────────────┘
                │
                └──< Car (car_serial_id PK, car_weight, price, manufac_model_id FK, trans_id FK)
                                                                │
ManufacturerCarModel (manufac_model_id PK, model_name, manufac_name) ─┘
```

**Naming conventions:**
- Table names: `PascalCase`, double-quoted in SQL (e.g., `"Customer"`)
- Column names: `snake_case`
- Foreign key constraints: `{entity}_{ref}_FK` pattern (e.g., `trans_cust_FK`, `car_model_FK`)
- Primary keys: `serial` (auto-increment integer)

### Queries (`section2_carsales.sql`)

1. **Customer spending ranking** — total spend per customer, descending
2. **Top 3 manufacturers this month** — by transaction count, filtered to `CURRENT_DATE` month

### Known Bug in SQL

Line 15–16 in `section2_carsales.sql`: a misplaced semicolon terminates the query before `GROUP BY`, causing a syntax error:

```sql
-- BUG: semicolon on line 15 ends the WHERE clause prematurely
where date_trunc('month', cs.trans_datetime)= date_trunc('month', CURRENT_DATE);  -- ← remove this semicolon
group by cm.manufac_model_id, cm.manufac_name
```

Fix: move the semicolon to after `limit 3;`.

---

## Section 3 — System Design

Documented in `section_3_system_design.pdf`. No code artifacts in the repo for this section.

---

## Docker Setup

### Build and run the PostgreSQL database

```bash
# Build the image (auto-runs DDL on first start)
docker build -t carsales-db .

# Run the container
docker run -d -p 5432:5432 --name carsales-db carsales-db

# Connect
psql -h localhost -U postgres -d carsales
```

**Credentials (from Dockerfile):**
- Database: `carsales`
- Password: `docker`
- User: `postgres` (default)

The `section2_create_tables.sql` DDL is automatically executed at container startup via `/docker-entrypoint-initdb.d/`.

### Running Airflow (not yet configured)

There is no Docker Compose for Airflow. To run the DAG, a full Airflow setup is needed:

```bash
# Minimal local setup example (requires the bugs above to be fixed first)
pip install apache-airflow pandas numpy
export AIRFLOW_HOME=~/airflow
airflow db init
airflow users create --username admin --password admin --role Admin --email admin@example.com --firstname A --lastname B
airflow scheduler &
airflow webserver &
# Copy section1_DAG.py to ~/airflow/dags/
```

---

## Development Conventions

### Python
- Function names: `snake_case`
- Airflow tasks use `PythonOperator` with `op_kwargs` for parameter passing
- DAG-level config goes in `default_args` dict
- Task dependencies declared with `>>` operator

### SQL
- Keywords: lowercase preferred
- Table aliases: 2–3 letter abbreviations matching table initials (`cs` = CarSales, `cu` = Customer, `c` = Car, `cm` = ManufacturerCarModel)
- All table names must be double-quoted in queries due to PascalCase

### Files
- Section prefix in all filenames: `section1_`, `section2_`, `section_3_`
- No test files, no CI/CD pipeline currently in the repo

---

## What's Missing / Out of Scope

- No `requirements.txt` or `pyproject.toml` — dependencies (airflow, pandas, numpy) are not pinned
- No sample data files (`dataset1.csv`, `dataset2.csv`) — referenced but not committed
- No Docker Compose for full Airflow stack (webserver + scheduler + worker + PostgreSQL)
- No tests
- No CI/CD configuration
