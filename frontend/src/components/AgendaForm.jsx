import { useState, useEffect } from 'react';
import { createAgenda, uploadFile, getMeetings } from '../services/api';

const DEPARTMENTS = [
  'กลุ่มงานบริหาร',
  'กลุ่มงานพยาบาล',
  'กลุ่มงานเภสัชกรรม',
  'กลุ่มงานทันตกรรม',
  'กลุ่มงานสาธารณสุข',
  'กลุ่มงานเวชกรรมสังคม',
  'กลุ่มงานควบคุมโรค',
  'กลุ่มงานสุขภาพจิต',
  'กลุ่มงานโภชนาการ',
  'กลุ่มงานสารสนเทศ'
];

const AGENDA_TYPES = [
  'วาระที่ 3',
  'วาระที่ 4',
  'วาระที่ 5'
];

function AgendaForm({ onSuccess, onCancel }) {
  const [formData, setFormData] = useState({
    meeting_number: '',
    agenda_number: '',
    agenda_topic: '',
    agenda_type: 'วาระที่ 3',
    submitting_department: 'กลุ่มงานบริหาร',
    description: ''
  });
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [meetings, setMeetings] = useState([]);

  useEffect(() => {
    loadMeetings();
  }, []);

  const loadMeetings = async () => {
    try {
      const response = await getMeetings();
      setMeetings(response.data || []);
    } catch (err) {
      console.error('Failed to load meetings:', err);
    }
  };

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
      if (!formData.meeting_number) {
        throw new Error('กรุณาเลือกเลขที่การประชุม');
      }
      if (!formData.agenda_number) {
        throw new Error('กรุณาระบุหมายเลขวาระ');
      }

      let agendaData = { ...formData };

      // Upload file if provided
      if (file) {
        const uploadResult = await uploadFile(file);
        if (uploadResult.success) {
          agendaData.file_path = uploadResult.filePath;
          agendaData.file_size = uploadResult.fileSize;
        }
      }

      // Create agenda record
      const result = await createAgenda(agendaData);

      if (result.success) {
        alert('✅ บันทึกวาระการประชุมสำเร็จ');
        if (onSuccess) onSuccess();
      }
    } catch (err) {
      setError(err.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
      console.error('Submit failed:', err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="upload-form-container">
      <div className="upload-form-card">
        <h2 className="upload-form-title">📑 เพิ่มวาระการประชุม</h2>

        {error && (
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="upload-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="meeting_number">เลขที่การประชุม *</label>
              <select
                id="meeting_number"
                name="meeting_number"
                value={formData.meeting_number}
                onChange={handleChange}
                required
              >
                <option value="">-- เลือกการประชุม --</option>
                {meetings.map(meeting => (
                  <option key={meeting.id} value={meeting.meeting_number}>
                    {meeting.meeting_number} - {meeting.meeting_title}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="agenda_type">ประเภทวาระ *</label>
              <select
                id="agenda_type"
                name="agenda_type"
                value={formData.agenda_type}
                onChange={handleChange}
                required
              >
                {AGENDA_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="agenda_number">หมายเลขวาระ *</label>
              <input
                type="text"
                id="agenda_number"
                name="agenda_number"
                value={formData.agenda_number}
                onChange={handleChange}
                placeholder="เช่น 3, 4.1, 4.2, 5"
                required
              />
              <small>ระบุหมายเลขวาระ เช่น 3, 4.1, 5</small>
            </div>

            <div className="form-group">
              <label htmlFor="submitting_department">กลุ่มงานผู้เสนอ *</label>
              <select
                id="submitting_department"
                name="submitting_department"
                value={formData.submitting_department}
                onChange={handleChange}
                required
              >
                {DEPARTMENTS.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="agenda_topic">ชื่อเรื่องในวาระ *</label>
            <textarea
              id="agenda_topic"
              name="agenda_topic"
              value={formData.agenda_topic}
              onChange={handleChange}
              placeholder="ระบุชื่อเรื่องในวาระ"
              rows="2"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">รายละเอียดวาระ</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="ระบุรายละเอียดเพิ่มเติม (ถ้ามี)"
              rows="3"
            />
          </div>

          <div className="form-group">
            <label htmlFor="pdfFile">ไฟล์เอกสารวาระ (PDF)</label>
            <div className="file-input-wrapper">
              <input
                type="file"
                id="pdfFile"
                accept=".pdf"
                onChange={handleFileChange}
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
            <small>ไฟล์ PDF ขนาดไม่เกิน 10 MB (ไม่บังคับ)</small>
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
              {uploading ? '⏳ กำลังบันทึก...' : '💾 บันทึกวาระ'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AgendaForm;
