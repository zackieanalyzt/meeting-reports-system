import React, { useState, useEffect } from 'react';
import { getManagementMeetings, bulkDeleteMeetings } from '../../services/managementApi';
import { deleteMeeting } from '../../services/api';

function MeetingsManager() {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    loadMeetings();
  }, []);

  const loadMeetings = async () => {
    try {
      setLoading(true);
      const response = await getManagementMeetings({ search });
      setMeetings(response.data);
    } catch (error) {
      console.error('Error loading meetings:', error);
      alert('เกิดข้อผิดพลาดในการโหลดข้อมูล');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadMeetings();
  };

  const handleDelete = async (id) => {
    setDeleteTarget(id);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteMeeting(deleteTarget);
      alert('ลบการประชุมสำเร็จ');
      setShowDeleteConfirm(false);
      setDeleteTarget(null);
      loadMeetings();
    } catch (error) {
      console.error('Error deleting meeting:', error);
      alert('เกิดข้อผิดพลาดในการลบ');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) {
      alert('กรุณาเลือกรายการที่ต้องการลบ');
      return;
    }

    if (!confirm(`ต้องการลบการประชุม ${selectedIds.length} รายการ?`)) {
      return;
    }

    try {
      await bulkDeleteMeetings(selectedIds);
      alert(`ลบการประชุม ${selectedIds.length} รายการสำเร็จ`);
      setSelectedIds([]);
      loadMeetings();
    } catch (error) {
      console.error('Error bulk deleting:', error);
      alert('เกิดข้อผิดพลาดในการลบ');
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) 
        ? prev.filter(i => i !== id)
        : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === meetings.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(meetings.map(m => m.id));
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return <div className="loading">กำลังโหลด...</div>;
  }

  return (
    <div className="meetings-manager">
      <div className="manager-header">
        <h3>📋 จัดการรายการประชุม</h3>
        <div className="actions">
          <form onSubmit={handleSearch} className="search-form">
            <input
              type="text"
              placeholder="ค้นหาการประชุม..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button type="submit">🔍 ค้นหา</button>
          </form>
          {selectedIds.length > 0 && (
            <button onClick={handleBulkDelete} className="btn-danger">
              🗑️ ลบที่เลือก ({selectedIds.length})
            </button>
          )}
        </div>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  checked={selectedIds.length === meetings.length && meetings.length > 0}
                  onChange={toggleSelectAll}
                />
              </th>
              <th>เลขที่</th>
              <th>ชื่อการประชุม</th>
              <th>วันที่</th>
              <th>สถานที่</th>
              <th>วาระ</th>
              <th>รายงาน</th>
              <th>จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {meetings.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '40px' }}>
                  ไม่พบข้อมูล
                </td>
              </tr>
            ) : (
              meetings.map(meeting => (
                <tr key={meeting.id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(meeting.id)}
                      onChange={() => toggleSelect(meeting.id)}
                    />
                  </td>
                  <td>{meeting.meeting_number}</td>
                  <td>{meeting.meeting_title}</td>
                  <td>{formatDate(meeting.meeting_date)}</td>
                  <td>{meeting.location || '-'}</td>
                  <td>
                    <span className="badge">{meeting.agenda_count} วาระ</span>
                  </td>
                  <td>
                    {meeting.has_report ? (
                      <span className="badge success">มีรายงาน</span>
                    ) : (
                      <span className="badge warning">รอรายงาน</span>
                    )}
                  </td>
                  <td>
                    <button
                      onClick={() => handleDelete(meeting.id)}
                      className="btn-icon btn-danger"
                      title="ลบ"
                    >
                      🗑️
                    </button>
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
            <h3>⚠️ ยืนยันการลบ</h3>
            <p>ต้องการลบการประชุมนี้หรือไม่?</p>
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
        .meetings-manager {
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

        .actions {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .search-form {
          display: flex;
          gap: 10px;
        }

        .search-form input {
          padding: 8px 12px;
          border: 1px solid #cbd5e1;
          border-radius: 4px;
          min-width: 250px;
        }

        .search-form button {
          padding: 8px 16px;
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }

        .search-form button:hover {
          background: #2563eb;
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

        .badge {
          display: inline-block;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 0.85em;
          background: #e2e8f0;
          color: #475569;
        }

        .badge.success {
          background: #d1fae5;
          color: #065f46;
        }

        .badge.warning {
          background: #fef3c7;
          color: #92400e;
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
          max-width: 400px;
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

          .search-form input {
            min-width: 100%;
          }

          .actions {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
}

export default MeetingsManager;
