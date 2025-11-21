---
title: "3-2-1 Backup Summary"
date: 2025-11-01
tags: [backup, docker, debian, google-drive, portainer, superset]
author: "พี่แซค"
---

# 🧭 ระบบ 3-2-1 Backup (Debian + Docker + PostgreSQL + Google Drive)

## ✅ สิ่งที่ทำสำเร็จในวันนี้

### 🔧 ปรับปรุงระบบสำรองข้อมูล (Backup System)
- ตรวจสอบและอัปเดต **Docker / Portainer Environment**
- สร้างและทดสอบสคริปต์สำรองข้อมูลหลัก 2 ตัว:
  - `backup_superset.sh`  
  - `backup_portainer.sh`

### 💾 ระบบสำรองแบบหลายชั้น (Multi-Layer Backup)
1. **Local Backup:** `/var/backups/superset`, `/backup_docker`  
2. **Off-site (SFTP):** `192.168.100.170`  
3. **Cloud (Google Drive):** โฟลเดอร์ `3-2-1 Backup` ผ่าน `rclone`

### ☁️ การเชื่อมต่อ Google Drive
- Remote: `gdrive_offsite`
- Authorized แบบ manual (ไม่มี GUI)
- Upload Path:
  - `3-2-1 Backup/superset`
  - `3-2-1 Backup/docker`

### 📦 สรุปการอัปโหลด
- Superset Backup → ~3.4 GB, 12 นาที
- Docker + Portainer Backup → ~7.5 GB, 19 นาที
- ทั้งคู่ขึ้น Drive สำเร็จ `[✓]`

### 🧮 การจัดการพื้นที่
- Local retention: 3 วัน  
- Cloud retention: ไม่ลบไฟล์เก่า (copy-only)  
- สคริปต์ล้างไฟล์เก่าบน Drive:
```bash
rclone delete gdrive_offsite:"3-2-1 Backup/docker" --min-age 7d
```

### 🕐 Cron Job
```bash
0 2 * * * /usr/local/sbin/backup_superset.sh
20 2 * * * /usr/local/sbin/backup_portainer.sh
```

## 🎯 ผลลัพธ์สุดท้าย
- ระบบสำรองครบวงจร 3 ชั้น (Local + Off-site + Cloud)  
- ทำงานอัตโนมัติ, มี log + checksum ครบ  
- พร้อมใช้งานในภาวะ disaster recovery  
- ✅ **Self‑healing & disaster‑resilient system**
