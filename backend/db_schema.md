# Database Schema Summary

Generated: 2025-11-22T08:37:08.712Z

## Tables (6)

### agenda_files

**Columns:** 10

| Column | Type | Nullable | Default |
|--------|------|----------|----------|
| id | integer | NO | nextval('agenda_files_id_seq'::regclass) |
| agenda_id | integer | YES | - |
| file_name | character varying(255) | NO | - |
| file_path | character varying(500) | NO | - |
| file_size | bigint | YES | - |
| file_type | character varying(255) | YES | - |
| uploaded_by | character varying(50) | NO | - |
| created_at | timestamp without time zone | YES | now() |
| is_active | boolean | YES | true |
| deleted_at | timestamp without time zone | YES | - |

**Primary Keys:** id

**Foreign Keys:**
- agenda_id → meeting_agendas.id

---

### audit_logs

**Columns:** 17

| Column | Type | Nullable | Default |
|--------|------|----------|----------|
| id | integer | NO | nextval('audit_logs_id_seq'::regclass) |
| username | character varying(50) | YES | - |
| actiontype | character varying(50) | YES | - |
| table_name | character varying(50) | YES | - |
| record_id | integer | YES | - |
| old_values | jsonb | YES | - |
| new_values | jsonb | YES | - |
| reason | text | YES | - |
| ip_address | character varying(45) | YES | - |
| action | character varying(50) | YES | - |
| created_at | timestamp without time zone | YES | now() |
| resource_type | character varying(100) | YES | - |
| resource_id | integer | YES | - |
| user_id | integer | YES | - |
| user_agent | text | YES | - |
| description | text | YES | - |
| details | character varying(255) | YES | - |

**Primary Keys:** id

---

### meeting_agendas

**Columns:** 15

| Column | Type | Nullable | Default |
|--------|------|----------|----------|
| id | integer | NO | nextval('meeting_agendas_id_seq'::regclass) |
| meeting_number | character varying(50) | NO | - |
| agenda_number | character varying(255) | NO | - |
| agenda_topic | character varying(500) | NO | - |
| agenda_type | character varying(20) | NO | - |
| submitting_department | character varying(200) | NO | - |
| description | text | YES | - |
| file_path | character varying(500) | YES | - |
| file_size | integer | YES | - |
| created_at | timestamp without time zone | YES | CURRENT_TIMESTAMP |
| updated_at | timestamp without time zone | YES | CURRENT_TIMESTAMP |
| created_by | character varying(50) | YES | - |
| is_active | boolean | YES | true |
| deleted_at | timestamp without time zone | YES | - |
| updated_by | character varying(255) | YES | - |

**Primary Keys:** id

**Foreign Keys:**
- meeting_number → meeting_reports.meeting_number

---

### meeting_files

**Columns:** 8

| Column | Type | Nullable | Default |
|--------|------|----------|----------|
| id | integer | NO | nextval('meeting_files_id_seq'::regclass) |
| meeting_id | integer | YES | - |
| file_name | character varying(255) | NO | - |
| file_path | character varying(500) | NO | - |
| file_size | bigint | YES | - |
| file_type | character varying(255) | YES | - |
| uploaded_by | character varying(50) | NO | - |
| created_at | timestamp without time zone | YES | now() |

**Primary Keys:** id

**Foreign Keys:**
- meeting_id → meeting_reports.id

---

### meeting_reports

**Columns:** 15

| Column | Type | Nullable | Default |
|--------|------|----------|----------|
| id | integer | NO | nextval('meeting_reports_id_seq'::regclass) |
| meeting_number | character varying(50) | NO | - |
| meeting_title | character varying(500) | NO | - |
| meeting_date | date | NO | - |
| meeting_time | time without time zone | YES | - |
| location | character varying(300) | YES | - |
| department | character varying(200) | YES | - |
| file_path | character varying(500) | YES | - |
| file_size | integer | YES | - |
| created_at | timestamp without time zone | YES | CURRENT_TIMESTAMP |
| updated_at | timestamp without time zone | YES | CURRENT_TIMESTAMP |
| created_by | character varying(50) | YES | - |
| updated_by | integer | YES | - |
| is_active | boolean | YES | true |
| deleted_at | timestamp without time zone | YES | - |

**Primary Keys:** id

---

### users

**Columns:** 6

| Column | Type | Nullable | Default |
|--------|------|----------|----------|
| id | integer | NO | nextval('users_id_seq'::regclass) |
| username | character varying(50) | NO | - |
| role | character varying(20) | NO | - |
| department | character varying(100) | YES | - |
| created_at | timestamp without time zone | YES | now() |
| is_active | boolean | YES | true |

**Primary Keys:** id

---

