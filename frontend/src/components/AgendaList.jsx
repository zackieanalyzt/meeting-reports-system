import { useState, useEffect } from 'react';
import { getAgendas } from '../services/api';
import AgendaCard from './AgendaCard';

function AgendaList({ searchTerm }) {
  const [agendas, setAgendas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterMeeting, setFilterMeeting] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [filterType, setFilterType] = useState('');

  useEffect(() => {
    loadAgendas();
  }, [filterMeeting, filterDepartment, filterType]);

  const loadAgendas = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAgendas({
        meeting_number: filterMeeting,
        department: filterDepartment,
        type: filterType
      });
      setAgendas(response.data || []);
    } catch (err) {
      setError('ไม่สามารถโหลดข้อมูลวาระการประชุมได้');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Filter by search term
  const filteredAgendas = agendas.filter(agenda => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      agenda.agenda_topic?.toLowerCase().includes(search) ||
      agenda.meeting_number?.toLowerCase().includes(search) ||
      agenda.submitting_department?.toLowerCase().includes(search) ||
      agenda.description?.toLowerCase().includes(search)
    );
  });

  // Group agendas by meeting number
  const groupedAgendas = filteredAgendas.reduce((acc, agenda) => {
    const key = agenda.meeting_number;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(agenda);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p className="loading-text">กำลังโหลดวาระการประชุม...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-message">
        <span className="error-icon">⚠️</span>
        <span>{error}</span>
      </div>
    );
  }

  if (filteredAgendas.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">📭</div>
        <h3 className="empty-title">
          {searchTerm ? 'ไม่พบวาระที่ค้นหา' : 'ยังไม่มีวาระการประชุม'}
        </h3>
        <p className="empty-description">
          {searchTerm 
            ? `ไม่พบวาระการประชุมที่ตรงกับ "${searchTerm}"`
            : 'ยังไม่มีวาระการประชุมในระบบ'}
        </p>
      </div>
    );
  }

  return (
    <div className="agenda-list">
      {/* Filters */}
      <div className="agenda-filters">
        <div className="filter-group">
          <label>🔍 กรองตามเลขที่ประชุม:</label>
          <select 
            value={filterMeeting} 
            onChange={(e) => setFilterMeeting(e.target.value)}
            className="filter-select"
          >
            <option value="">ทั้งหมด</option>
            {[...new Set(agendas.map(a => a.meeting_number))].map(num => (
              <option key={num} value={num}>{num}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>🏢 กรองตามกลุ่มงาน:</label>
          <select 
            value={filterDepartment} 
            onChange={(e) => setFilterDepartment(e.target.value)}
            className="filter-select"
          >
            <option value="">ทั้งหมด</option>
            {[...new Set(agendas.map(a => a.submitting_department))].map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>📑 กรองตามประเภท:</label>
          <select 
            value={filterType} 
            onChange={(e) => setFilterType(e.target.value)}
            className="filter-select"
          >
            <option value="">ทั้งหมด</option>
            <option value="วาระที่ 3">วาระที่ 3</option>
            <option value="วาระที่ 4">วาระที่ 4</option>
            <option value="วาระที่ 5">วาระที่ 5</option>
          </select>
        </div>
      </div>

      {/* Count Badge */}
      <div className="meeting-count">
        <span className="count-badge">
          📊 พบทั้งหมด {filteredAgendas.length} วาระ
        </span>
      </div>

      {/* Grouped Agendas */}
      {Object.entries(groupedAgendas).map(([meetingNumber, meetingAgendas]) => (
        <div key={meetingNumber} className="agenda-group">
          <h3 className="agenda-group-title">
            📋 การประชุมครั้งที่ {meetingNumber}
            <span className="agenda-group-count">({meetingAgendas.length} วาระ)</span>
          </h3>
          <div className="agenda-grid">
            {meetingAgendas
              .sort((a, b) => a.agenda_number.localeCompare(b.agenda_number))
              .map(agenda => (
                <AgendaCard key={agenda.id} agenda={agenda} />
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default AgendaList;
