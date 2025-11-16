import { useState } from 'react';
import { createMeeting, uploadFile } from '../services/api';

function UploadForm({ onSuccess, onCancel }) {
  const [formData, setFormData] = useState({
    meeting_number: '',
    meeting_title: '',
    meeting_date: '',
    meeting_time: '',
    location: 'ห้องประชุมดอกปีบ สำนักงานสาธารณสุขจังหวัดลำพูน',
    department: 'สำนักงานสาธารณสุขจังหวัดลำพูน'
  });
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.type !== 'application/pdf') {
        setError('กรุณาเลือกไฟล์ PDF เท่านั้น');
        return;
      }
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError('ขนาดไฟล์ต้องไม่เกิน 10 MB');
        return;
      }
      setFile(selectedFile);
      setError(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setUploading(true);

    try {
      // Validate
      if (!file) {
        throw new Error('กรุณาเลือกไฟล์ PDF');
      }

      // Upload file first
      const uploadResult = await uploadFile(file);

      if (uploadResult.success) {
        // Create meeting record
        const meetingData = {
          ...formData,
          file_path: uploadResult.filePath,
          file_size: uploadResult.fileSize
        };

        const meetingResult = await createMeeting(meetingData);

        if (meetingResult.success) {
          alert('✅ บันทึกข้อมูลสำเร็จ');
          if (onSuccess) onSuccess();
        }
      }
    } catch (err) {
      setError(err.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
      console.error('Upload failed:', err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="upload-form-container">
      <div className="upload-form-card">
        <h2 className="upload-form-title">📤 อัพโหลดรายงานการประชุม</h2>

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
              placeholder="เช่น 1/2568"
              required
            />
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
              <label htmlFor="meeting_time">เวลา</label>
              <input
                type="time"
                id="meeting_time"
                name="meeting_time"
                value={formData.meeting_time}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="location">สถานที่</label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="สถานที่จัดการประชุม"
            />
          </div>

          <div className="form-group">
            <label htmlFor="department">หน่วยงาน</label>
            <input
              type="text"
              id="department"
              name="department"
              value={formData.department}
              onChange={handleChange}
              placeholder="ชื่อหน่วยงาน"
            />
          </div>

          <div className="form-group">
            <label htmlFor="pdfFile">ไฟล์ PDF *</label>
            <div className="file-input-wrapper">
              <input
                type="file"
                id="pdfFile"
                accept=".pdf"
                onChange={handleFileChange}
                required
              />
              {file && (
                <div className="file-info">
                  <span>📄 {file.name}</span>
                  <span className="file-size">
                    ({(file.size / 1024 / 1024).toFixed(2)} MB)
                  </span>
                </div>
              )}
            </div>
            <small>ไฟล์ PDF ขนาดไม่เกิน 10 MB</small>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn-cancel"
              onClick={onCancel}
              disabled={uploading}
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="btn-submit"
              disabled={uploading}
            >
              {uploading ? '⏳ กำลังบันทึก...' : '💾 บันทึกข้อมูล'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default UploadForm;
