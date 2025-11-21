import { useState, useEffect } from 'react';
import { updateAgendaWithFiles } from '../../services/api';
import MultipleFileUpload from '../MultipleFileUpload';

const DEPARTMENTS = [
  'กลุ่มงานบริหาร',
  'กลุ่มงานพยาบาล',
  'กลุ่มงานเภสัชกรรม',
  'กลุ่มงานทันตกรรม',
  'กลุ่มงานเวชกรรมฟื้นฟู',
  'กลุ่มงานบริการปฐมภูมิ',
  'กลุ่มงานเทคนิคการแพทย์',
  'กลุ่มงานรังสีการแพทย์',
  'กลุ่มงานการแพทย์',
  'กลุ่มงานประกันสุขภาพ',
  'กลุ่มงานการแพทย์แผนไทย',
  'กลุ่มงานสุขภาพจิต',
  'กลุ่มงานโภชนศาสตร์',
  'กลุ่มงานสุขภาพดิจิทัล',
  'งานควบคุมโรค',
  'งานอาชีวอนามัย',
  'PCU ใน',
  'Home Ward',
  'ตึกผู้ป่วยในชาย',
  'ตึกผู้ป่วยในหญิง',
  'งานพยาบาลอุบัติเหตุ',
  'งานพยาบาลผู้ป่วยนอก',
  'งานพยาบาลควบคุมการติดเชื้อ'
];

const AGENDA_TYPES = [
  'วาระที่ 3',
  'วาระที่ 4',
  'วาระที่ 5'
];

function EditAgendaModal({ agenda, onSuccess, onCancel }) {
  const [formData, setFormData] = useState({
    meeting_number: '',
    agenda_number: '',
    agenda_topic: '',
    agenda_type: 'วาระที่ 3',
    submitting_department: 'กลุ่มงานบริหาร',
    description: ''
  });
  const [existingFiles, setExistingFiles] = useState([]);
  const [filesToDelete, setFilesToDelete] = useState([]);
  const [newFiles, setNewFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (agenda) {
      setFormData({
        meeting_number: agenda.meeting_number || '',
        agenda_number: agenda.agenda_number || '',
        agenda_topic: agenda.agenda_topic || '',
        agenda_type: agenda.agenda_type || 'วาระที่ 3',
        submitting_department: agenda.submitting_department || 'กลุ่มงานบริหาร',
        description: agenda.description || ''
      });
      setExistingFiles(agenda.files || []);
    }
  }, [agenda]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDeleteExistingFile = (fileId) => {
    setFilesToDelete(prev => [...prev, fileId]);
    setExistingFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const handleNewFilesChange = (files) => {
    setNewFiles(files);
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'N/A';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      // Validate
      if (!formData.agenda_number || !formData.agenda_topic) {
        throw new Error('กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน');
      }

      // Prepare FormData
      const formDataToSend = new FormData();
      
      // Append form fields
      Object.keys(formData).forEach(key => {
        formDataToSend.append(key, formData[key]);
      });

      // Append files to delete
      if (filesToDelete.length > 0) {
        formDataToSend.append('deleteFileIds', JSON.stringify(filesToDelete));
      }

      // Append new files
      newFiles.forEach(file => {
        formDataToSend.append('files', file);
      });

      const result = await updateAgendaWithFiles(agenda.id, formDataToSend);

      if (result.success) {
        alert('✅ แก้ไขวาระสำเร็จ');
        if (onSuccess) onSuccess();
      }
    } catch (err) {
      setError(err.message || 'เกิดข้อผิดพลาดในการแก้ไขวาระ');
      console.error('Submit failed:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">✏️ แก้ไขวาระการประชุม</h2>

        {error && (
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="edit-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="meeting_number">เลขที่การประชุม *</label>
              <input
                type="text"
                id="meeting_number"
                name="meeting_number"
                value={formData.meeting_number}
                onChange={handleChange}
                disabled
                className="disabled-input"
              />
              <small>ไม่สามารถแก้ไขเลขที่การประชุมได้</small>
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

          {/* Existing Files */}
          {existingFiles.length > 0 && (
            <div className="form-group">
              <label>ไฟล์เอกสารปัจจุบัน</label>
              <div className="existing-files-list">
                {existingFiles.map(file => (
                  <div key={file.id} className="file-item">
                    <span className="file-icon">📄</span>
                    <span className="file-name">{file.file_name}</span>
                    <span className="file-size">({formatFileSize(file.file_size)})</span>
                    <button
                      type="button"
                      onClick={() => handleDeleteExistingFile(file.id)}
                      className="btn-delete-file"
                      title="ลบไฟล์นี้"
                    >
                      🗑️
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* New Files Upload */}
          <div className="form-group">
            <label>เพิ่มไฟล์เอกสารใหม่ (ถ้ามี)</label>
            <MultipleFileUpload
              maxFiles={5}
              maxSizePerFile={20 * 1024 * 1024}
              acceptedTypes={['.pdf', '.jpg', '.jpeg', '.docx', '.xlsx', '.xls', '.png', '.md']}
              onFilesChange={handleNewFilesChange}
              label="อัพโหลดเอกสารเพิ่มเติม"
            />
            <small>รองรับ: PDF, JPG, DOCX, XLSX, MD, PNG, XLS (สูงสุด 5 ไฟล์, 20MB/ไฟล์)</small>
          </div>

          <div className="modal-actions">
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
              {submitting ? '⏳ กำลังบันทึก...' : '💾 บันทึกการแก้ไข'}
            </button>
          </div>
        </form>

        <style jsx>{`
          .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.6);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 2000;
            padding: 20px;
          }

          .modal-content {
            background: white;
            border-radius: 12px;
            max-width: 800px;
            width: 100%;
            max-height: 90vh;
            overflow-y: auto;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
          }

          .modal-title {
            margin: 0;
            padding: 24px 24px 16px;
            color: #2c5aa0;
            font-size: 1.5em;
            border-bottom: 2px solid #e2e8f0;
          }

          .edit-form {
            padding: 24px;
          }

          .error-message {
            background: #fee2e2;
            border: 1px solid #ef4444;
            color: #dc2626;
            padding: 12px 16px;
            border-radius: 6px;
            margin-bottom: 20px;
            display: flex;
            align-items: center;
            gap: 10px;
          }

          .error-icon {
            font-size: 1.2em;
          }

          .form-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
            margin-bottom: 16px;
          }

          .form-group {
            margin-bottom: 16px;
          }

          .form-group label {
            display: block;
            margin-bottom: 6px;
            font-weight: 600;
            color: #475569;
            font-size: 0.95em;
          }

          .form-group input,
          .form-group select,
          .form-group textarea {
            width: 100%;
            padding: 10px 12px;
            border: 1px solid #cbd5e1;
            border-radius: 6px;
            font-size: 1em;
            font-family: inherit;
            transition: border-color 0.2s;
          }

          .form-group input:focus,
          .form-group select:focus,
          .form-group textarea:focus {
            outline: none;
            border-color: #3b82f6;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
          }

          .form-group textarea {
            resize: vertical;
            min-height: 60px;
          }

          .form-group small {
            display: block;
            margin-top: 4px;
            color: #94a3b8;
            font-size: 0.85em;
          }

          .disabled-input {
            background: #f1f5f9;
            color: #64748b;
            cursor: not-allowed;
          }

          .existing-files-list {
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            padding: 12px;
            background: #f8fafc;
          }

          .file-item {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 10px;
            background: white;
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            margin-bottom: 8px;
          }

          .file-item:last-child {
            margin-bottom: 0;
          }

          .file-icon {
            font-size: 1.3em;
            flex-shrink: 0;
          }

          .file-name {
            flex: 1;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            color: #475569;
            font-size: 0.95em;
          }

          .file-size {
            color: #94a3b8;
            font-size: 0.85em;
            flex-shrink: 0;
          }

          .btn-delete-file {
            padding: 6px 10px;
            background: transparent;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 1.1em;
            transition: background 0.2s;
            flex-shrink: 0;
          }

          .btn-delete-file:hover {
            background: #fee2e2;
          }

          .modal-actions {
            display: flex;
            gap: 12px;
            justify-content: flex-end;
            margin-top: 24px;
            padding-top: 20px;
            border-top: 1px solid #e2e8f0;
          }

          .btn-cancel,
          .btn-submit {
            padding: 10px 24px;
            border: none;
            border-radius: 6px;
            font-size: 1em;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s;
          }

          .btn-cancel {
            background: #e2e8f0;
            color: #475569;
          }

          .btn-cancel:hover:not(:disabled) {
            background: #cbd5e1;
          }

          .btn-submit {
            background: #3b82f6;
            color: white;
          }

          .btn-submit:hover:not(:disabled) {
            background: #2563eb;
          }

          .btn-cancel:disabled,
          .btn-submit:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }

          @media (max-width: 768px) {
            .modal-content {
              max-width: 100%;
              max-height: 100vh;
              border-radius: 0;
            }

            .form-row {
              grid-template-columns: 1fr;
            }

            .modal-actions {
              flex-direction: column-reverse;
            }

            .btn-cancel,
            .btn-submit {
              width: 100%;
            }
          }
        `}</style>
      </div>
    </div>
  );
}

export default EditAgendaModal;
