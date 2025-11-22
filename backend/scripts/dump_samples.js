// ========================================
// Database Sample Data Dumper
// ========================================
// Usage: node backend/scripts/dump_samples.js
// Output: backend/db_samples.json

require('dotenv').config({ path: './backend/.env' });
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

(async () => {
  const client = new Client({
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT || 5432),
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME || 'meeting_mgmt'
  });

  try {
    console.log('🔌 Connecting to PostgreSQL...');
    await client.connect();
    console.log('✅ Connected successfully!');

    const samples = {};

    // Sample from meeting_reports
    console.log('📊 Fetching meeting_reports samples...');
    const meetings = await client.query('SELECT * FROM meeting_reports ORDER BY meeting_date DESC LIMIT 5');
    samples.meeting_reports = meetings.rows;

    // Sample from meeting_agendas
    console.log('📊 Fetching meeting_agendas samples...');
    const agendas = await client.query('SELECT * FROM meeting_agendas ORDER BY created_at DESC LIMIT 5');
    samples.meeting_agendas = agendas.rows;

    // Sample from meeting_files
    console.log('📊 Fetching meeting_files samples...');
    const meetingFiles = await client.query('SELECT * FROM meeting_files ORDER BY created_at DESC LIMIT 5');
    samples.meeting_files = meetingFiles.rows;

    // Sample from agenda_files
    console.log('📊 Fetching agenda_files samples...');
    const agendaFiles = await client.query('SELECT * FROM agenda_files ORDER BY created_at DESC LIMIT 5');
    samples.agenda_files = agendaFiles.rows;

    // Sample from users
    console.log('📊 Fetching users samples...');
    const users = await client.query('SELECT id, username, role, is_active, created_at FROM users LIMIT 5');
    samples.users = users.rows;

    // Sample from audit_logs
    console.log('📊 Fetching audit_logs samples...');
    const logs = await client.query('SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 10');
    samples.audit_logs = logs.rows;

    // Write to JSON file
    const outputPath = path.join(__dirname, '../db_samples.json');
    fs.writeFileSync(outputPath, JSON.stringify(samples, null, 2), 'utf8');
    console.log(`\n✅ Sample data dumped successfully to: ${outputPath}`);

    // Print summary
    console.log('\n📈 Summary:');
    for (const [table, rows] of Object.entries(samples)) {
      console.log(`  - ${table}: ${rows.length} rows`);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await client.end();
    console.log('🔌 Connection closed');
  }
})();
