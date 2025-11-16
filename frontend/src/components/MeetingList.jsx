function MeetingList({ meetings, loading, searchTerm }) {
  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p className="loading-text">กำลังโหลดข้อมูล...</p>
      </div>
    );
  }

  if (meetings.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">📭</div>
        <h3 className="empty-title">
          {searchTerm ? 'ไม่พบข้อมูลที่ค้นหา' : 'ยังไม่มีรายงานการประชุม'}
        </h3>
        <p className="empty-description">
          {searchTerm 
            ? `ไม่พบรายงานการประชุมที่ตรงกับ "${searchTerm}"`
            : 'ยังไม่มีรายงานการประชุมในระบบ'}
        </p>
      </div>
    );
  }

  return (
    <div className="meeting-list">
      <div className="meeting-count">
        <span className="count-badge">
          📊 พบทั้งหมด {meetings.length} รายการ
        </span>
      </div>

      <div className="meeting-grid">
        {meetings.map((meeting) => (
          <div key={meeting.id} className="meeting-card">
            <div className="meeting-header">
              <span className="meeting-number">{meeting.meeting_number}</span>
              <span className="meeting-date">📅 {meeting.meeting_date_thai}</span>
            </div>
            
            <h3 className="meeting-title">{meeting.meeting_title}</h3>
            
            <div className="meeting-info">
              <div className="info-item">
                <span className="info-icon">📍</span>
                <span className="info-text">{meeting.location}</span>
              </div>
              
              {meeting.file_name && (
                <div className="info-item">
                  <span className="info-icon">📄</span>
                  <span className="info-text">{meeting.file_name}</span>
                </div>
              )}
              
              {meeting.file_size_formatted && (
                <div className="info-item">
                  <span className="info-icon">💾</span>
                  <span className="info-text">{meeting.file_size_formatted}</span>
                </div>
              )}
            </div>

            <div className="meeting-actions">
              <a
                href={meeting.file_path}
                download
                className="download-button"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="button-icon">⬇️</span>
                <span>ดาวน์โหลดรายงาน</span>
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MeetingList;
