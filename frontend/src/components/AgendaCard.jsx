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

  const getFileIcon = (fileName) => {
    const ext = fileName.split('.').pop().toLowerCase();
    const icons = {
      pdf: '📄',
      doc: '📝', docx: '📝',
      xls: '📊', xlsx: '📊',
      ppt: '📊', pptx: '📊',
      jpg: '🖼️', jpeg: '🖼️', png: '🖼️', gif: '🖼️', bmp: '🖼️', webp: '🖼️',
      zip: '📦', rar: '📦', '7z': '📦',
      mp4: '🎥', avi: '🎥', mov: '🎥', mpeg: '🎥',
      mp3: '🎵', wav: '🎵', ogg: '🎵',
      txt: '📃', md: '📃', csv: '📃'
    };
    return icons[ext] || '📎';
  };

  // Check if agenda has files array (new format)
  const hasFiles = agenda.files && agenda.files.length > 0;
  // Check if agenda has single file (legacy format)
  const hasSingleFile = agenda.file_path && !hasFiles;

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

        {/* Show multiple files count */}
        {hasFiles && (
          <div className="info-item">
            <span className="info-icon">📎</span>
            <span className="info-text">{agenda.files.length} ไฟล์แนบ</span>
          </div>
        )}

        {/* Show single file (legacy) */}
        {hasSingleFile && (
          <>
            <div className="info-item">
              <span className="info-icon">📄</span>
              <span className="info-text">{agenda.file_path.split('/').pop()}</span>
            </div>
            {agenda.file_size && (
              <div className="info-item">
                <span className="info-icon">💾</span>
                <span className="info-text">{formatFileSize(agenda.file_size)}</span>
              </div>
            )}
          </>
        )}
      </div>

      {/* Multiple files download section */}
      {hasFiles && (
        <div className="agenda-files">
          <div className="files-header">📎 ไฟล์แนบ:</div>
          {agenda.files.map((file, index) => (
            <div key={file.id || index} className="file-item">
              <span className="file-icon">{getFileIcon(file.file_name)}</span>
              <span className="file-name" title={file.file_name}>
                {file.file_name.length > 30 
                  ? file.file_name.substring(0, 27) + '...' 
                  : file.file_name}
              </span>
              <span className="file-size">({formatFileSize(file.file_size)})</span>
              <a
                href={file.file_path}
                download
                className="file-download-btn"
                target="_blank"
                rel="noopener noreferrer"
                title={`ดาวน์โหลด: ${file.file_name}`}
              >
                ⬇️
              </a>
            </div>
          ))}
        </div>
      )}

      {/* Single file download (legacy) */}
      {hasSingleFile && (
        <div className="agenda-actions">
          <a
            href={agenda.file_path}
            download
            className="download-button agenda-download"
            target="_blank"
            rel="noopener noreferrer"
            title={`ดาวน์โหลด: ${agenda.agenda_topic || 'เอกสารวาระ'}`}
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
