import { useState, useEffect } from 'react';
import { getMeetings, uploadMeetingReport } from '../services/api';

function UploadForm({ onSuccess, onCancel }) {
  const [selectedMeetingId, setSelectedMeetingId] = useState('');
  const [meetings, setMeetings] = useState([]);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadMeetings();
  }, []);

  const loadMeetings = async () => {
    try {
      const response = await getMeetings();
      // Filter meetings without reports
      const meetingsWithoutReports = (response.data || []).filter(m => !m.file_size || m.file_size === 0);
      setMeetings(meetingsWithoutReports);
    } catch (err) {
      console.error('Failed to load meetings:', err);
    }
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
      if (!selectedMeetingId) {
        throw new Error('กรุณาเลือกการประชุม');
      }
      if (!file) {
        throw new Error('กรุณาเลือกไฟล์ PDF');
      }

      // Upload report to existing meeting
      const result = await uploadMeetingReport(selectedMeetingId, file);

      if (result.success) {
        alert('✅ อัพโหลดรายงานสำเร็จ');
        if (onSuccess) onSuccess();
      }
    } catch (err) {
      setError(err.message || 'เกิดข้อผิดพลาดในการอัพโหลดรายงาน');
      console.error('Upload failed:', err);
    } finally {
      setUploading(false);
    }
  };

  const selectedMeeting = meetings.find(m => m.id === parseInt(selectedMeetingId));

  return (
    <div className="upload-form-container">
      <div className="upload-form-card">
        <h2 className="upload-form-title">📤 อัพโหลดรายงานการประชุม</h2>

        <div className="info-box">
          <p>📌 <strong>หมายเหตุ:</strong> อัพโหลดรายงานให้กับการประชุมที่สร้างไว้แล้ว</p>
        </div>

        {error && (
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {meetings.length === 0 && (
          <div className="warning-message">
            <span className="warning-icon">⚠️</span>
            <span>ไม่มีการประชุมที่ยังไม่มีรายงาน กรุณาสร้างการประชุมใหม่ก่อน</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="upload-form">
          <div className="form-group">
            <label htmlFor="meeting_id">เลือกการประชุม *</label>
            <select
              id="meeting_id"
              value={selectedMeetingId}
              onChange={(e) => setSelectedMeetingId(e.target.value)}
              required
              disabled={meetings.length === 0}
            >
              <option value="">-- เลือกการประชุมที่ต้องการอัพโหลดรายงาน --</option>
              {meetings.map(meeting => (
                <option key={meeting.id} value={meeting.id}>
                  {meeting.meeting_number} - {meeting.meeting_title}
                </option>
              ))}
            </select>
            {meetings.length === 0 && (
              <small style={{ color: '#ef4444' }}>
                ไม่มีการประชุมที่ยังไม่มีรายงาน
              </small>
            )}
          </div>

          {selectedMeeting && (
            <div className="selected-meeting-info">
              <h4>ข้อมูลการประชุมที่เลือก:</h4>
              <div className="info-grid">
                <div><strong>เลขที่:</strong> {selectedMeeting.meeting_number}</div>
                <div><strong>วันที่:</strong> {selectedMeeting.meeting_date_thai || new Date(selectedMeeting.meeting_date).toLocaleDateString('th-TH')}</div>
                <div><strong>สถานที่:</strong> {selectedMeeting.location}</div>
              </div>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="pdfFile">ไฟล์รายงาน PDF *</label>
            <div className="file-input-wrapper">
              <input
                type="file"
                id="pdfFile"
                accept=".pdf"
                onChange={handleFileChange}
                required
                disabled={!selectedMeetingId}
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
              disabled={uploading || meetings.length === 0}
            >
              {uploading ? '⏳ กำลังอัพโหลด...' : '📤 อัพโหลดรายงาน'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default UploadForm;
