import React, { useState, useEffect } from 'react';
import { getManagementAgendas, bulkDeleteAgendas } from '../../services/managementApi';
import { deleteAgenda, getAgendaWithFiles } from '../../services/api';
import EditAgendaModal from './EditAgendaModal';

function AgendasManager() {
  const [agendas, setAgendas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterMeeting, setFilterMeeting] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);

  useEffect(() => {
    loadAgendas();
  }, []);

  const loadAgendas = async () => {
    try {
      setLoading(true);
      const filters = {};
      if (filterMeeting) filters.meeting_number = filterMeeting;
      if (filterDepartment) filters.department = filterDepartment;
      
      const response = await getManagementAgendas(filters);
      setAgendas(response.data);
    } catch (error) {
      console.error('Error loading agendas:', error);
      alert('เกิดข้อผิดพลาดในการโหลดข้อมูล');
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = () => {
    loadAgendas();
  };

  const handleEdit = async (agenda) => {
    try {
      // Load full agenda data with files
      const response = await getAgendaWithFiles(agenda.id);
      setEditTarget(response.data);
      setShowEditModal(true);
    } catch (error) {
      console.error('Error loading agenda for edit:', error);
      alert('เกิดข้อผิดพลาดในการโหลดข้อมูลวาระ');
    }
  };

  const handleDelete = async (id) => {
    setDeleteTarget(id);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteAgenda(deleteTarget);
      alert('ลบวาระสำเร็จ');
      setShowDeleteConfirm(false);
      setDeleteTarget(null);
      loadAgendas();
    } catch (error) {
      console.error('Error deleting agenda:', error);
      alert('เกิดข้อผิดพลาดในการลบ');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) {
      alert('กรุณาเลือกรายการที่ต้องการลบ');
      return;
    }

    if (!confirm(`ต้องการลบวาระ ${selectedIds.length} รายการ?`)) {
      return;
    }

    try {
      await bulkDeleteAgendas(selectedIds);
      alert(`ลบวาระ ${selectedIds.length} รายการสำเร็จ`);
      setSelectedIds([]);
      loadAgendas();
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
    if (selectedIds.length === agendas.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(agendas.map(a => a.id));
    }
  };

  const getAgendaTypeColor = (type) => {
    switch(type) {
      case 'วาระที่ 3': return '#3b82f6';
      case 'วาระที่ 4': return '#f59e0b';
      case 'วาระที่ 5': return '#8b5cf6';
      default: return '#64748b';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
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
    <div className="agendas-manager">
      <div className="manager-header">
        <h3>📝 จัดการวาระการประชุม</h3>
        <div className="actions">
          <div className="filters">
            <input
              type="text"
              placeholder="เลขที่การประชุม..."
              value={filterMeeting}
              onChange={(e) => setFilterMeeting(e.target.value)}
            />
            <input
              type="text"
              placeholder="กลุ่มงาน..."
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
            />
            <button onClick={handleFilter}>🔍 กรอง</button>
          </div>
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
                  checked={selectedIds.length === agendas.length && agendas.length > 0}
                  onChange={toggleSelectAll}
                />
              </th>
              <th>เลขที่การประชุม</th>
              <th>วาระที่</th>
              <th>หัวข้อ</th>
              <th>ประเภท</th>
              <th>กลุ่มงาน</th>
              <th>วันที่ประชุม</th>
              <th>จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {agendas.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '40px' }}>
                  ไม่พบข้อมูล
                </td>
              </tr>
            ) : (
              agendas.map(agenda => (
                <tr key={agenda.id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(agenda.id)}
                      onChange={() => toggleSelect(agenda.id)}
                    />
                  </td>
                  <td>{agenda.meeting_number}</td>
                  <td>{agenda.agenda_number}</td>
                  <td className="agenda-topic">{agenda.agenda_topic}</td>
                  <td>
                    <span 
                      className="badge" 
                      style={{ 
                        background: getAgendaTypeColor(agenda.agenda_type),
                        color: 'white'
                      }}
                    >
                      {agenda.agenda_type}
                    </span>
                  </td>
                  <td className="department">{agenda.submitting_department}</td>
                  <td>{formatDate(agenda.meeting_date)}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        onClick={() => handleEdit(agenda)}
                        className="btn-icon btn-edit"
                        title="แก้ไข"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(agenda.id)}
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

      {showEditModal && editTarget && (
        <EditAgendaModal
          agenda={editTarget}
          onSuccess={() => {
            setShowEditModal(false);
            setEditTarget(null);
            loadAgendas();
          }}
          onCancel={() => {
            setShowEditModal(false);
            setEditTarget(null);
          }}
        />
      )}

      {showDeleteConfirm && (
        <div className="modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>⚠️ ยืนยันการลบ</h3>
            <p>ต้องการลบวาระนี้หรือไม่?</p>
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
        .agendas-manager {
          background: white;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          margin-bottom: 20px;
          max-width: 100%;
          width: 100%;
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

        .filters {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .filters input {
          padding: 8px 12px;
          border: 1px solid #cbd5e1;
          border-radius: 4px;
          min-width: 150px;
        }

        .filters button {
          padding: 8px 16px;
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }

        .filters button:hover {
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
          width: 100%;
        }

        table {
          width: 100%;
          min-width: 1000px;
          border-collapse: collapse;
        }

        th, td {
          padding: 12px;
          text-align: left;
          border-bottom: 1px solid #e2e8f0;
        }

        /* Column widths */
        th:nth-child(1), td:nth-child(1) { width: 50px; }
        th:nth-child(2), td:nth-child(2) { width: 120px; }
        th:nth-child(3), td:nth-child(3) { width: 80px; }
        th:nth-child(4), td:nth-child(4) { width: auto; min-width: 250px; }
        th:nth-child(5), td:nth-child(5) { width: 100px; }
        th:nth-child(6), td:nth-child(6) { width: 150px; }
        th:nth-child(7), td:nth-child(7) { width: 120px; }
        th:nth-child(8), td:nth-child(8) { width: 120px; text-align: center; }

        th {
          background: #f8fafc;
          font-weight: 600;
          color: #475569;
        }

        tr:hover {
          background: #f8fafc;
        }

        .agenda-topic {
          overflow: visible;
          text-overflow: clip;
          white-space: normal;
          word-break: break-word;
          line-height: 1.4;
        }

        .action-buttons {
          display: flex;
          gap: 5px;
          justify-content: center;
          align-items: center;
        }

        .department {
          font-size: 0.9em;
          color: #64748b;
        }

        .badge {
          display: inline-block;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 0.85em;
        }

        .btn-icon {
          padding: 6px 10px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          background: transparent;
          font-size: 1.2em;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .btn-icon:hover {
          background: #f1f5f9;
          transform: scale(1.1);
        }

        .btn-icon.btn-edit:hover {
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

          .filters {
            flex-direction: column;
          }

          .filters input {
            min-width: 100%;
          }
        }
      `}</style>
    </div>
  );
}

export default AgendasManager;
