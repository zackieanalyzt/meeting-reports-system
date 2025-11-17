-- ========================================
-- Sample Users for Testing
-- ========================================

-- เพิ่มผู้ใช้ตัวอย่างสำหรับทดสอบระบบ
-- แทนที่ 'username' ด้วย username จริงจากตาราง personnel ใน MariaDB

-- เจ้าหน้าที่ธุรการ (Secretary) - สิทธิ์เต็ม
INSERT INTO users (username, role, is_active) VALUES
('admin', 'secretary', true),
('secretary1', 'secretary', true)
ON CONFLICT (username) DO UPDATE 
SET role = EXCLUDED.role, is_active = EXCLUDED.is_active;

-- หัวหน้ากลุ่มงาน (Manager) - จัดการวาระได้
INSERT INTO users (username, role, is_active) VALUES
('manager1', 'manager', true),
('manager2', 'manager', true),
('head_dept', 'manager', true)
ON CONFLICT (username) DO UPDATE 
SET role = EXCLUDED.role, is_active = EXCLUDED.is_active;

-- ผู้ใช้ทั่วไป (User) - ดูอย่างเดียว
-- ไม่ต้องเพิ่มในตาราง users เพราะจะได้ role 'user' อัตโนมัติ
-- แต่ถ้าต้องการระบุชัดเจน:
INSERT INTO users (username, role, is_active) VALUES
('user1', 'user', true),
('user2', 'user', true)
ON CONFLICT (username) DO UPDATE 
SET role = EXCLUDED.role, is_active = EXCLUDED.is_active;

-- ตรวจสอบผู้ใช้ที่เพิ่มเข้าไป
SELECT 
    id,
    username,
    role,
    is_active,
    created_at
FROM users
ORDER BY 
    CASE role
        WHEN 'secretary' THEN 1
        WHEN 'manager' THEN 2
        WHEN 'user' THEN 3
    END,
    username;

-- แสดงจำนวนผู้ใช้แต่ละ role
SELECT 
    role,
    COUNT(*) as user_count,
    COUNT(CASE WHEN is_active THEN 1 END) as active_count
FROM users
GROUP BY role
ORDER BY 
    CASE role
        WHEN 'secretary' THEN 1
        WHEN 'manager' THEN 2
        WHEN 'user' THEN 3
    END;
