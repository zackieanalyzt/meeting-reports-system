// ========================================
// Database Schema Dumper - Node.js Version
// ========================================
// Usage: node backend/scripts/dump_schema_node.js
// Output: backend/db_schema.json

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

    // Get all tables
    const tablesRes = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema='public' AND table_type='BASE TABLE'
      ORDER BY table_name;
    `);

    const result = {};

    for (const row of tablesRes.rows) {
      const tableName = row.table_name;
      console.log(`📊 Processing table: ${tableName}`);

      // Get columns
      const cols = await client.query(`
        SELECT column_name, data_type, is_nullable, column_default, character_maximum_length
        FROM information_schema.columns
        WHERE table_name = $1
        ORDER BY ordinal_position;
      `, [tableName]);

      // Get foreign keys
      const fks = await client.query(`
        SELECT
          kcu.column_name,
          ccu.table_name AS foreign_table_name,
          ccu.column_name AS foreign_column_name,
          tc.constraint_name
        FROM
          information_schema.table_constraints AS tc
          JOIN information_schema.key_column_usage AS kcu
            ON tc.constraint_name = kcu.constraint_name
          JOIN information_schema.constraint_column_usage AS ccu
            ON ccu.constraint_name = tc.constraint_name
        WHERE constraint_type = 'FOREIGN KEY' AND tc.table_name=$1;
      `, [tableName]);

      // Get primary keys
      const pks = await client.query(`
        SELECT kcu.column_name
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu
          ON tc.constraint_name = kcu.constraint_name
        WHERE tc.table_name = $1 AND tc.constraint_type = 'PRIMARY KEY';
      `, [tableName]);

      // Get indexes
      const indexes = await client.query(`
        SELECT indexname, indexdef
        FROM pg_indexes
        WHERE tablename = $1;
      `, [tableName]);

      result[tableName] = {
        columns: cols.rows,
        primary_keys: pks.rows,
        foreign_keys: fks.rows,
        indexes: indexes.rows
      };
    }

    // Write to JSON file
    const outputPath = path.join(__dirname, '../db_schema.json');
    fs.writeFileSync(outputPath, JSON.stringify(result, null, 2), 'utf8');
    console.log(`\n✅ Schema dumped successfully to: ${outputPath}`);

    // Generate Markdown summary
    let markdown = '# Database Schema Summary\n\n';
    markdown += `Generated: ${new Date().toISOString()}\n\n`;
    markdown += `## Tables (${Object.keys(result).length})\n\n`;

    for (const [tableName, tableInfo] of Object.entries(result)) {
      markdown += `### ${tableName}\n\n`;
      markdown += `**Columns:** ${tableInfo.columns.length}\n\n`;
      markdown += '| Column | Type | Nullable | Default |\n';
      markdown += '|--------|------|----------|----------|\n';
      
      tableInfo.columns.forEach(col => {
        const type = col.character_maximum_length 
          ? `${col.data_type}(${col.character_maximum_length})`
          : col.data_type;
        markdown += `| ${col.column_name} | ${type} | ${col.is_nullable} | ${col.column_default || '-'} |\n`;
      });

      if (tableInfo.primary_keys.length > 0) {
        markdown += `\n**Primary Keys:** ${tableInfo.primary_keys.map(pk => pk.column_name).join(', ')}\n`;
      }

      if (tableInfo.foreign_keys.length > 0) {
        markdown += '\n**Foreign Keys:**\n';
        tableInfo.foreign_keys.forEach(fk => {
          markdown += `- ${fk.column_name} → ${fk.foreign_table_name}.${fk.foreign_column_name}\n`;
        });
      }

      markdown += '\n---\n\n';
    }

    const mdPath = path.join(__dirname, '../db_schema.md');
    fs.writeFileSync(mdPath, markdown, 'utf8');
    console.log(`✅ Markdown summary created: ${mdPath}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await client.end();
    console.log('🔌 Connection closed');
  }
})();
