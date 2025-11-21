import { useState } from 'react';
import { createMeetingOnly } from '../services/api';

function MeetingForm({ onSuccess, onCancel }) {
  const [formData, setFormData] = useState({
    meeting_number: '',
    meeting_title: '',
    meeting_date: '',
    meeting_time: '09:30',
    location: 'ห้องประชุมชั้นสอง อาคารอุบัติเหตุ',
    department: 'โรงพยาบาลลี้'
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      // Validate
      if (!formData.meeting_number || !formData.meeting_title || !formData.meeting_date) {
        throw new Error('กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน');
      }

      // Create meeting
      const result = await createMeetingOnly(formData);

      if (result.success) {
        alert('✅ สร้างการประชุมสำเร็จ\n\nขั้นตอนถัดไป:\n1. ไปที่แท็บ "วาระการประชุม" เพื่อเพิ่มวาระ\n2. หลังการประชุมเสร็จ ไปที่แท็บ "รายงานการประชุม" เพื่ออัพโหลดรายงาน');
        if (onSuccess) onSuccess();
      }
    } catch (err) {
      setError(err.message || 'เกิดข้อผิดพลาดในการสร้างการประชุม');
      console.error('Submit failed:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="upload-form-container">
      <div className="upload-form-card">
        <h2 className="upload-form-title">📅 สร้างการประชุมใหม่</h2>
        
        <div className="info-box">
          <p>📌 <strong>ขั้นตอนการทำงาน:</strong></p>
          <ol style={{ marginLeft: '1.5rem', marginTop: '0.5rem' }}>
            <li>สร้างการประชุม (ขั้นตอนนี้)</li>
            <li>เพิ่มวาระการประชุม</li>
            <li>อัพโหลดรายงานการประชุม (หลังการประชุมเสร็จ)</li>
          </ol>
        </div>

        {error && (
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="upload-form">
          <div className="form-group">
            <label htmlFor="meeting_number">เลขที่การประชุม *</label>
            <input
              type="text"
              id="meeting_number"
              name="meeting_number"
              value={formData.meeting_number}
              onChange={handleChange}
              placeholder="เช่น 5/2568"
              required
            />
            <small>เลขที่การประชุมต้องไม่ซ้ำกับที่มีอยู่</small>
          </div>

          <div className="form-group">
            <label htmlFor="meeting_title">ชื่อการประชุม *</label>
            <textarea
              id="meeting_title"
              name="meeting_title"
              value={formData.meeting_title}
              onChange={handleChange}
              placeholder="ระบุชื่อการประชุมแบบเต็ม"
              rows="3"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="meeting_date">วันที่ประชุม *</label>
              <input
                type="date"
                id="meeting_date"
                name="meeting_date"
                value={formData.meeting_date}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="meeting_time">เวลา *</label>
              <input
                type="time"
                id="meeting_time"
                name="meeting_time"
                value={formData.meeting_time}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="location">สถานที่ *</label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="สถานที่จัดการประชุม"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="department">หน่วยงาน *</label>
            <input
              type="text"
              id="department"
              name="department"
              value={formData.department}
              onChange={handleChange}
              placeholder="ชื่อหน่วยงาน"
              required
            />
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn-cancel"
              onClick={onCancel}
              disabled={submitting}
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="btn-submit"
              disabled={submitting}
            >
              {submitting ? '⏳ กำลังสร้าง...' : '💾 สร้างการประชุม'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default MeetingForm;
