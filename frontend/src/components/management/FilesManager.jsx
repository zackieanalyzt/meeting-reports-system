import React, { useState, useEffect } from 'react';
import { getManagementFiles, deleteFile } from '../../services/managementApi';

function FilesManager() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = async () => {
    try {
      setLoading(true);
      const response = await getManagementFiles();
      setFiles(response.data);
    } catch (error) {
      console.error('Error loading files:', error);
      alert('เกิดข้อผิดพลาดในการโหลดข้อมูล');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (file) => {
    setDeleteTarget(file);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteFile(deleteTarget.file_type, deleteTarget.id);
      alert('ลบไฟล์สำเร็จ');
      setShowDeleteConfirm(false);
      setDeleteTarget(null);
      loadFiles();
    } catch (error) {
      console.error('Error deleting file:', error);
      alert('เกิดข้อผิดพลาดในการลบไฟล์');
    }
  };

  const handleDownload = (filePath) => {
    const baseUrl = import.meta.env.VITE_API_URL || 'http://192.168.105.202:3001';
    const downloadUrl = `${baseUrl}${filePath}`;
    window.open(downloadUrl, '_blank');
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getFileTypeLabel = (type) => {
    return type === 'meeting_report' ? 'รายงานการประชุม' : 'ไฟล์เพิ่มเติม';
  };

  if (loading) {
    return <div className="loading">กำลังโหลด...</div>;
  }

  return (
    <div className="files-manager">
      <div className="manager-header">
        <h3>📁 จัดการไฟล์รายงาน</h3>
        <div className="summary">
          <span>ไฟล์ทั้งหมด: {files.length} ไฟล์</span>
        </div>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>ประเภท</th>
              <th>เลขที่การประชุม</th>
              <th>ชื่อการประชุม</th>
              <th>ชื่อไฟล์</th>
              <th>ขนาด</th>
              <th>อัพโหลดโดย</th>
              <th>วันที่</th>
              <th>จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {files.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '40px' }}>
                  ไม่พบไฟล์
                </td>
              </tr>
            ) : (
              files.map((file, index) => (
                <tr key={`${file.file_type}-${file.id}-${index}`}>
                  <td>
                    <span className={`badge ${file.file_type === 'meeting_report' ? 'primary' : 'secondary'}`}>
                      {getFileTypeLabel(file.file_type)}
                    </span>
                  </td>
                  <td>{file.meeting_number}</td>
                  <td className="meeting-title">{file.meeting_title}</td>
                  <td className="file-name">{file.file_name}</td>
                  <td>{file.file_size_formatted}</td>
                  <td>{file.uploaded_by}</td>
                  <td>{formatDate(file.created_at)}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        onClick={() => handleDownload(file.file_path)}
                        className="btn-icon btn-primary"
                        title="ดาวน์โหลด"
                      >
                        ⬇️
                      </button>
                      <button
                        onClick={() => handleDelete(file)}
                        className="btn-icon btn-danger"
                        title="ลบ"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showDeleteConfirm && (
        <div className="modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>⚠️ ยืนยันการลบไฟล์</h3>
            <p>ต้องการลบไฟล์นี้หรือไม่?</p>
            <p className="file-info">
              <strong>ไฟล์:</strong> {deleteTarget?.file_name}<br/>
              <strong>การประชุม:</strong> {deleteTarget?.meeting_number}
            </p>
            <p className="warning-text">การลบจะไม่สามารถกู้คืนได้</p>
            <div className="modal-actions">
              <button onClick={() => setShowDeleteConfirm(false)} className="btn-secondary">
                ยกเลิก
              </button>
              <button onClick={confirmDelete} className="btn-danger">
                ยืนยันการลบ
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .files-manager {
          background: white;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          margin-bottom: 20px;
        }

        .manager-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          flex-wrap: wrap;
          gap: 15px;
        }

        .manager-header h3 {
          margin: 0;
          color: #2c5aa0;
        }

        .summary {
          color: #64748b;
          font-size: 0.95em;
        }

        .table-container {
          overflow-x: auto;
        }

        table {
          width: 100%;
          border-collapse: collapse;
        }

        th, td {
          padding: 12px;
          text-align: left;
          border-bottom: 1px solid #e2e8f0;
        }

        th {
          background: #f8fafc;
          font-weight: 600;
          color: #475569;
        }

        tr:hover {
          background: #f8fafc;
        }

        .meeting-title {
          max-width: 250px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .file-name {
          max-width: 200px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          font-family: monospace;
          font-size: 0.9em;
        }

        .badge {
          display: inline-block;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 0.85em;
        }

        .badge.primary {
          background: #dbeafe;
          color: #1e40af;
        }

        .badge.secondary {
          background: #e2e8f0;
          color: #475569;
        }

        .action-buttons {
          display: flex;
          gap: 5px;
        }

        .btn-icon {
          padding: 6px 10px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          background: transparent;
          font-size: 1.2em;
        }

        .btn-icon:hover {
          background: #f1f5f9;
        }

        .btn-icon.btn-primary:hover {
          background: #dbeafe;
        }

        .btn-icon.btn-danger:hover {
          background: #fee2e2;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal {
          background: white;
          padding: 30px;
          border-radius: 8px;
          max-width: 500px;
          width: 90%;
        }

        .modal h3 {
          margin: 0 0 15px 0;
          color: #ef4444;
        }

        .modal p {
          margin: 10px 0;
          color: #475569;
        }

        .file-info {
          background: #f8fafc;
          padding: 15px;
          border-radius: 4px;
          font-size: 0.9em;
        }

        .warning-text {
          color: #ef4444;
          font-weight: 500;
        }

        .modal-actions {
          display: flex;
          gap: 10px;
          margin-top: 20px;
          justify-content: flex-end;
        }

        .btn-secondary {
          padding: 8px 16px;
          background: #e2e8f0;
          color: #475569;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }

        .btn-secondary:hover {
          background: #cbd5e1;
        }

        .btn-danger {
          padding: 8px 16px;
          background: #ef4444;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }

        .btn-danger:hover {
          background: #dc2626;
        }

        .loading {
          text-align: center;
          padding: 40px;
          color: #64748b;
        }

        @media (max-width: 768px) {
          .manager-header {
            flex-direction: column;
            align-items: stretch;
          }

          .meeting-title,
          .file-name {
            max-width: 150px;
          }
        }
      `}</style>
    </div>
  );
}

export default FilesManager;
