function AgendaCard({ agenda }) {
  const getAgendaTypeColor = (type) => {
    switch (type) {
      case 'วาระที่ 3':
        return 'agenda-type-3';
      case 'วาระที่ 4':
        return 'agenda-type-4';
      case 'วาระที่ 5':
        return 'agenda-type-5';
      default:
        return 'agenda-type-default';
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'N/A';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  return (
    <div className="agenda-card">
      <div className="agenda-card-header">
        <span className={`agenda-type-badge ${getAgendaTypeColor(agenda.agenda_type)}`}>
          {agenda.agenda_type}
        </span>
        <span className="agenda-number-badge">
          วาระที่ {agenda.agenda_number}
        </span>
      </div>

      <h4 className="agenda-topic">{agenda.agenda_topic}</h4>

      <div className="agenda-info">
        <div className="info-item">
          <span className="info-icon">🏢</span>
          <span className="info-text">{agenda.submitting_department}</span>
        </div>

        {agenda.description && (
          <div className="info-item">
            <span className="info-icon">📝</span>
            <span className="info-text agenda-description">{agenda.description}</span>
          </div>
        )}

        {agenda.file_path && (
          <div className="info-item">
            <span className="info-icon">📄</span>
            <span className="info-text">{agenda.file_path.split('/').pop()}</span>
          </div>
        )}

        {agenda.file_size && (
          <div className="info-item">
            <span className="info-icon">💾</span>
            <span className="info-text">{formatFileSize(agenda.file_size)}</span>
          </div>
        )}
      </div>

      {agenda.file_path && (
        <div className="agenda-actions">
          <a
            href={agenda.file_path}
            download
            className="download-button agenda-download"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="button-icon">⬇️</span>
            <span>ดาวน์โหลดเอกสาร</span>
          </a>
        </div>
      )}
    </div>
  );
}

export default AgendaCard;
