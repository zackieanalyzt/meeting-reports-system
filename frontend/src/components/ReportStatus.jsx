import { useState, useEffect } from 'react';
import { getMeetings } from '../services/api';

function ReportStatus({ onUploadClick }) {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMeetings();
  }, []);

  const loadMeetings = async () => {
    try {
      setLoading(true);
      const response = await getMeetings();
      setMeetings(response.data || []);
    } catch (error) {
      console.error('Failed to load meetings:', error);
    } finally {
      setLoading(false);
    }
  };

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

  const formatFileSize = (bytes) => {
    if (!bytes) return 'N/A';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  const meetingsWithReport = meetings.filter(m => m.file_size > 0);
  const meetingsWithoutReport = meetings.filter(m => !m.file_size || m.file_size === 0);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p className="loading-text">กำลังโหลดข้อมูล...</p>
      </div>
    );
  }

  return (
    <div className="report-status">
      {/* Section: มีรายงานแล้ว */}
      <div className="reports-section">
        <h3 className="section-title">
          ✅ การประชุมที่มีรายงานแล้ว ({meetingsWithReport.length})
        </h3>
        {meetingsWithReport.length > 0 ? (
          <div className="meetings-list">
            {meetingsWithReport.map(meeting => (
              <div key={meeting.id} className="report-card has-report">
                <div className="report-header">
                  <strong className="report-number">{meeting.meeting_number}</strong>
                  <span className="status-badge success">📋 มีรายงานแล้ว</span>
                </div>
                <div className="report-title">{meeting.meeting_title}</div>
                <div className="report-meta">
                  <span>📅 {formatThaiDate(meeting.meeting_date)}</span>
                  {meeting.file_size && (
                    <span>📊 {formatFileSize(meeting.file_size)}</span>
                  )}
                  {meeting.agenda_count > 0 && (
                    <span>📑 {meeting.agenda_count} วาระ</span>
                  )}
                </div>
                {meeting.file_path && (
                  <a
                    href={meeting.file_path}
                    className="download-btn"
                    target="_blank"
                    rel="noopener noreferrer"
                    download
                  >
                    📥 ดาวน์โหลดรายงาน
                  </a>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <p>ยังไม่มีรายงานการประชุม</p>
          </div>
        )}
      </div>

      {/* Section: รอรายงาน */}
      <div className="reports-section">
        <h3 className="section-title">
          ⏳ การประชุมที่รอรายงาน ({meetingsWithoutReport.length})
        </h3>
        {meetingsWithoutReport.length > 0 ? (
          <div className="meetings-list">
            {meetingsWithoutReport.map(meeting => (
              <div key={meeting.id} className="report-card waiting-report">
                <div className="report-header">
                  <strong className="report-number">{meeting.meeting_number}</strong>
                  <span className="status-badge warning">⏳ ยังไม่มีรายงาน</span>
                </div>
                <div className="report-title">{meeting.meeting_title}</div>
                <div className="report-meta">
                  <span>📅 {formatThaiDate(meeting.meeting_date)}</span>
                  {meeting.agenda_count > 0 && (
                    <span>📑 มี {meeting.agenda_count} วาระ</span>
                  )}
                </div>
                <p className="help-text">
                  💡 กรุณาอัพโหลดรายงานหลังการประชุมเสร็จสิ้น
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state success-state">
            <div className="empty-icon">✅</div>
            <p>ทุกการประชุมมีรายงานครบถ้วนแล้ว</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ReportStatus;
