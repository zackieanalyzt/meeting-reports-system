import { useState, useEffect } from 'react';
import { getMeetings, uploadMeetingReport } from '../services/api';
import MultipleFileUpload from './MultipleFileUpload';

function UploadForm({ onSuccess, onCancel }) {
  const [selectedMeetingId, setSelectedMeetingId] = useState('');
  const [meetings, setMeetings] = useState([]);
  const [files, setFiles] = useState([]);
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

  const handleFilesChange = (selectedFiles) => {
    setFiles(selectedFiles);
    setError(null);
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
      if (!files || files.length === 0) {
        throw new Error('กรุณาเลือกไฟล์อย่างน้อย 1 ไฟล์');
      }

      // Upload multiple files
      if (files.length === 1) {
        // Single file upload
        const result = await uploadMeetingReport(selectedMeetingId, files[0]);
        if (result.success) {
          alert('✅ อัพโหลดรายงานสำเร็จ');
          if (onSuccess) onSuccess();
        }
      } else {
        // Multiple files upload
        const formData = new FormData();
        files.forEach(file => {
          formData.append('files', file);
        });

        const response = await fetch(`http://localhost:3001/api/meetings/${selectedMeetingId}/reports-multiple`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: formData
        });

        const result = await response.json();
        
        if (result.success) {
          alert(`✅ อัพโหลด ${files.length} ไฟล์สำเร็จ`);
          if (onSuccess) onSuccess();
        } else {
          throw new Error(result.message || 'อัพโหลดไม่สำเร็จ');
        }
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
            <label>ไฟล์รายงาน *</label>
            <MultipleFileUpload
              maxFiles={10}
              maxSizePerFile={10 * 1024 * 1024}
              acceptedTypes={['.pdf', '.jpg', '.jpeg', '.docx', '.xlsx', '.md']}
              onFilesChange={handleFilesChange}
              label="อัพโหลดรายงานการประชุม"
            />
            <small>รองรับ: PDF, JPG, DOCX, XLSX, MD (สูงสุด 10 ไฟล์, 10MB/ไฟล์)</small>
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
