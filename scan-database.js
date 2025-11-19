const { Pool } = require('./backend/node_modules/pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: 'grespost',
  database: 'meeting_mgmt'
});

const tables = ['users', 'meetings', 'meeting_agendas', 'meeting_reports', 'meeting_files', 'audit_logs'];

async function scanDatabase() {
  console.log('='.repeat(80));
  console.log('การสแกนฐานข้อมูล PostgreSQL: meeting_mgmt');
  console.log('='.repeat(80));
  console.log();

  for (const tableName of tables) {
    try {
      console.log(`📋 ตาราง: ${tableName}`);
      console.log('-'.repeat(80));

      // ตรวจสอบว่าตารางมีอยู่หรือไม่
      const tableExists = await pool.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = $1
        );
      `, [tableName]);

      if (!tableExists.rows[0].exists) {
        console.log(`❌ ปัญหา: ตารางไม่มีอยู่ในฐานข้อมูล`);
        console.log();
        continue;
      }

      // ดึงข้อมูล columns
      const columnsQuery = await pool.query(`
        SELECT 
          column_name,
          data_type,
          character_maximum_length,
          is_nullable,
          column_default
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = $1
        ORDER BY ordinal_position;
      `, [tableName]);

      console.log(`Columns (${columnsQuery.rows.length}):`);
      columnsQuery.rows.forEach(col => {
        const nullable = col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL';
        const maxLength = col.character_maximum_length ? `(${col.character_maximum_length})` : '';
        const defaultVal = col.column_default ? ` DEFAULT ${col.column_default}` : '';
        console.log(`  - ${col.column_name}: ${col.data_type}${maxLength} ${nullable}${defaultVal}`);
      });

      // ตรวจสอบ role column สำหรับตาราง users
      if (tableName === 'users') {
        const hasRole = columnsQuery.rows.some(col => col.column_name === 'role');
        console.log(`\n✓ มี role column: ${hasRole ? 'ใช่' : 'ไม่'}`);
      }

      // นับจำนวนข้อมูล
      const countQuery = await pool.query(`SELECT COUNT(*) FROM ${tableName};`);
      console.log(`\nจำนวนข้อมูล: ${countQuery.rows[0].count} แถว`);

      // ตรวจสอบ Primary Key
      const pkQuery = await pool.query(`
        SELECT a.attname
        FROM pg_index i
        JOIN pg_attribute a ON a.attrelid = i.indrelid AND a.attnum = ANY(i.indkey)
        WHERE i.indrelid = $1::regclass AND i.indisprimary;
      `, [tableName]);

      if (pkQuery.rows.length > 0) {
        console.log(`Primary Key: ${pkQuery.rows.map(r => r.attname).join(', ')}`);
      }

      // ตรวจสอบ Foreign Keys
      const fkQuery = await pool.query(`
        SELECT
          kcu.column_name,
          ccu.table_name AS foreign_table_name,
          ccu.column_name AS foreign_column_name
        FROM information_schema.table_constraints AS tc
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
          AND ccu.table_schema = tc.table_schema
        WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_name = $1;
      `, [tableName]);

      if (fkQuery.rows.length > 0) {
        console.log(`Foreign Keys:`);
        fkQuery.rows.forEach(fk => {
          console.log(`  - ${fk.column_name} → ${fk.foreign_table_name}(${fk.foreign_column_name})`);
        });
      }

      // ตรวจสอบปัญหา
      const issues = [];
      
      // ตรวจสอบว่ามี created_at/updated_at หรือไม่
      const hasCreatedAt = columnsQuery.rows.some(col => col.column_name === 'created_at');
      const hasUpdatedAt = columnsQuery.rows.some(col => col.column_name === 'updated_at');
      if (!hasCreatedAt) issues.push('ไม่มี created_at column');
      if (!hasUpdatedAt) issues.push('ไม่มี updated_at column');

      // ตรวจสอบว่ามี id column หรือไม่
      const hasId = columnsQuery.rows.some(col => col.column_name === 'id');
      if (!hasId) issues.push('ไม่มี id column');

      if (issues.length > 0) {
        console.log(`\n⚠️  ปัญหาที่พบ:`);
        issues.forEach(issue => console.log(`  - ${issue}`));
      } else {
        console.log(`\n✅ ไม่พบปัญหา`);
      }

      console.log();

    } catch (error) {
      console.log(`❌ ข้อผิดพลาด: ${error.message}`);
      console.log();
    }
  }

  await pool.end();
  console.log('='.repeat(80));
  console.log('สแกนเสร็จสิ้น');
  console.log('='.repeat(80));
}

scanDatabase().catch(err => {
  console.error('เกิดข้อผิดพลาดในการเชื่อมต่อฐานข้อมูล:', err.message);
  process.exit(1);
});
