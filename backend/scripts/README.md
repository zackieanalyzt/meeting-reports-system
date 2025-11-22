# Database Scripts

## Overview

This folder contains Node.js scripts for inspecting and exporting database schema and sample data.

## Scripts

### 1. dump_schema_node.js

**Purpose:** Export complete database schema to JSON and Markdown formats

**Usage:**
```bash
# From project root
node backend/scripts/dump_schema_node.js
```

**Output Files:**
- `backend/db_schema.json` - Complete schema in JSON format
- `backend/db_schema.md` - Human-readable Markdown summary

**What it exports:**
- All table names
- Column definitions (name, type, nullable, default, max_length)
- Primary keys
- Foreign keys with referenced tables
- Indexes with definitions

**Environment Variables Required:**
```bash
DB_HOST=localhost
DB_PORT=5432
DB_NAME=meeting_mgmt
DB_USER=postgres
DB_PASS=your_password
```

**Example Output:**
```json
{
  "meeting_reports": {
    "columns": [...],
    "primary_keys": [...],
    "foreign_keys": [...],
    "indexes": [...]
  }
}
```

---

### 2. dump_samples.js

**Purpose:** Export sample data from all tables

**Usage:**
```bash
# From project root
node backend/scripts/dump_samples.js
```

**Output File:**
- `backend/db_samples.json` - Sample data from all tables

**What it exports:**
- 5 rows from `meeting_reports`
- 5 rows from `meeting_agendas`
- 5 rows from `meeting_files`
- 5 rows from `agenda_files`
- 5 rows from `users`
- 10 rows from `audit_logs`

**Example Output:**
```json
{
  "meeting_reports": [
    {
      "id": 1,
      "meeting_number": "1/2568",
      "meeting_title": "รายงานการประชุม...",
      ...
    }
  ],
  "meeting_agendas": [...],
  ...
}
```

---

## Setup

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Database connection configured in `backend/.env`

### Install Dependencies
```bash
cd backend
npm install
```

### Configure Environment
```bash
# Create .env file if not exists
cp .env.example .env

# Edit .env with your database credentials
nano .env
```

**Required variables:**
```bash
DB_HOST=localhost
DB_PORT=5432
DB_NAME=meeting_mgmt
DB_USER=postgres
DB_PASS=your_password
```

---

## Running Scripts

### Option 1: From Project Root
```bash
# Export schema
node backend/scripts/dump_schema_node.js

# Export samples
node backend/scripts/dump_samples.js
```

### Option 2: From Backend Directory
```bash
cd backend

# Export schema
node scripts/dump_schema_node.js

# Export samples
node scripts/dump_samples.js
```

### Option 3: Using npm scripts (if configured)
```bash
cd backend

# Add to package.json:
# "scripts": {
#   "dump:schema": "node scripts/dump_schema_node.js",
#   "dump:samples": "node scripts/dump_samples.js"
# }

npm run dump:schema
npm run dump:samples
```

---

## Output Files

### db_schema.json
Complete database schema in JSON format. Useful for:
- Documentation
- Schema comparison
- Automated tools
- API generation

### db_schema.md
Human-readable Markdown summary. Useful for:
- Documentation
- Code reviews
- Team onboarding
- Quick reference

### db_samples.json
Sample data from all tables. Useful for:
- Testing
- Development
- Data analysis
- Documentation

---

## Troubleshooting

### Connection Failed
```bash
# Error: connect ECONNREFUSED
# Solution: Check database is running
pg_isready -h localhost -U postgres

# Start PostgreSQL if not running
sudo systemctl start postgresql
```

### Authentication Failed
```bash
# Error: password authentication failed
# Solution: Check credentials in .env
cat backend/.env | grep DB_

# Test connection manually
psql -h localhost -U postgres -d meeting_mgmt
```

### Permission Denied
```bash
# Error: permission denied for schema public
# Solution: Grant permissions
psql -h localhost -U postgres -d meeting_mgmt -c "GRANT ALL ON SCHEMA public TO your_user;"
```

### Module Not Found
```bash
# Error: Cannot find module 'pg'
# Solution: Install dependencies
cd backend
npm install
```

---

## Advanced Usage

### Export to Different Location
```javascript
// Modify output path in script
const outputPath = path.join(__dirname, '../../docs/db_schema.json');
```

### Filter Specific Tables
```javascript
// In dump_samples.js, modify queries
const meetings = await client.query(
  'SELECT * FROM meeting_reports WHERE meeting_date > $1 LIMIT 5',
  ['2025-01-01']
);
```

### Export to CSV
```javascript
// Add CSV export
const { Parser } = require('json2csv');
const csv = new Parser().parse(result.rows);
fs.writeFileSync('output.csv', csv);
```

---

## Integration with CI/CD

### GitHub Actions Example
```yaml
name: Export Schema

on:
  push:
    branches: [main]

jobs:
  export:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm ci
        working-directory: ./backend
      - run: node scripts/dump_schema_node.js
        working-directory: ./backend
        env:
          DB_HOST: ${{ secrets.DB_HOST }}
          DB_USER: ${{ secrets.DB_USER }}
          DB_PASS: ${{ secrets.DB_PASS }}
      - uses: actions/upload-artifact@v2
        with:
          name: schema
          path: backend/db_schema.json
```

---

## Best Practices

1. **Run regularly** - Export schema after each migration
2. **Version control** - Commit schema files to track changes
3. **Automate** - Add to CI/CD pipeline
4. **Document** - Keep README updated
5. **Secure** - Don't commit sensitive data in samples

---

## See Also

- [MEETING_MGMT_PROJECT_SPEC.md](../../MEETING_MGMT_PROJECT_SPEC.md) - Complete project specification
- [DEPLOYMENT_GUIDE.md](../../DEPLOYMENT_GUIDE.md) - Deployment instructions
- [README.md](../../README.md) - Project overview

---

**Last Updated:** November 22, 2025
