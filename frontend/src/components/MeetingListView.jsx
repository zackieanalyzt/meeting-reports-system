import { useState, useEffect } from 'react';
import { getMeetings } from '../services/api';

function MeetingListView({ searchTerm }) {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadMeetings();
  }, []);

  const loadMeetings = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getMeetings();
      setMeetings(response.data || []);
    } catch (err) {
      setError('ไม่สามารถโหลดข้อมูลการประชุมได้');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Filter by search term
  const filteredMeetings = meetings.filter(meeting => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      meeting.meeting_title?.toLowerCase().includes(search) ||
      meeting.meeting_number?.toLowerCase().includes(search) ||
      meeting.location?.toLowerCase().includes(search)
    );
  });

  const formatThaiDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const months = [
      'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
      'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
    ];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear() + 543;
    return `${day} ${month} ${year}`;
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p className="loading-text">กำลังโหลดข้อมูลการประชุม...</p>
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

  if (filteredMeetings.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">📭</div>
        <h3 className="empty-title">
          {searchTerm ? 'ไม่พบการประชุมที่ค้นหา' : 'ยังไม่มีการประชุม'}
        </h3>
        <p className="empty-description">
          {searchTerm 
            ? `ไม่พบการประชุมที่ตรงกับ "${searchTerm}"`
            : 'คลิกปุ่ม ➕ ด้านล่างเพื่อสร้างการประชุมใหม่'}
        </p>
      </div>
    );
  }

  return (
    <div className="meeting-list">
      <div className="meeting-count">
        <span className="count-badge">
          📊 พบทั้งหมด {filteredMeetings.length} การประชุม
        </span>
      </div>

      <div className="meeting-grid">
        {filteredMeetings.map((meeting) => {
          const hasReport = meeting.file_size > 0;
          const hasAgendas = meeting.agenda_count > 0;
          const isUpcoming = new Date(meeting.meeting_date) > new Date();

          return (
            <div key={meeting.id} className="meeting-card">
              <div className="meeting-header">
                <span className="meeting-number">{meeting.meeting_number}</span>
                <div className="status-badges">
                  {hasAgendas && (
                    <span className="badge agenda-badge">
                      📑 มีวาระ {meeting.agenda_count} เรื่อง
                    </span>
                  )}
                  {!hasReport && (
                    <span className="badge waiting-badge">⏳ รอรายงาน</span>
                  )}
                </div>
              </div>

              <h3 className="meeting-title">{meeting.meeting_title}</h3>

              <div className="meeting-meta">
                <span>📅 {formatThaiDate(meeting.meeting_date)}</span>
                {meeting.meeting_time && (
                  <span>🕐 {meeting.meeting_time}</span>
                )}
                <span>📍 {meeting.location}</span>
              </div>


            </div>
          );
        })}
      </div>
    </div>
  );
}

export default MeetingListView;
