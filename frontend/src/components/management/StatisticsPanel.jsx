import React from 'react';

function StatisticsPanel({ stats, loading }) {
  if (loading) {
    return (
      <div className="statistics-panel">
        <h3>📊 สถิติระบบ</h3>
        <div className="loading">กำลังโหลด...</div>
      </div>
    );
  }

  if (!stats) return null;

  const storagePercentage = (stats.storage_used_bytes / (10 * 1024 * 1024 * 1024)) * 100;

  return (
    <div className="statistics-panel">
      <h3>📊 สถิติระบบ</h3>
      
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📋</div>
          <div className="stat-value">{stats.meetings_total}</div>
          <div className="stat-label">การประชุมทั้งหมด</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📝</div>
          <div className="stat-value">{stats.agendas_total}</div>
          <div className="stat-label">วาระทั้งหมด</div>
        </div>

        <div className="stat-card success">
          <div className="stat-icon">✅</div>
          <div className="stat-value">{stats.reports_uploaded}</div>
          <div className="stat-label">รายงานที่อัพโหลด</div>
        </div>

        <div className="stat-card warning">
          <div className="stat-icon">⏳</div>
          <div className="stat-value">{stats.reports_pending}</div>
          <div className="stat-label">รอการอัพโหลด</div>
        </div>
      </div>

      <div className="storage-section">
        <h4>💾 พื้นที่ใช้สอย</h4>
        <div className="storage-info">
          <span className="storage-used">{stats.storage_used_formatted}</span>
          <span className="storage-total"> / 10 GB</span>
          <span className="storage-percentage"> ({storagePercentage.toFixed(2)}%)</span>
        </div>
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${Math.min(storagePercentage, 100)}%` }}
          />
        </div>
        <div className="storage-details">
          <span>📁 ไฟล์ทั้งหมด: {stats.files_total} ไฟล์</span>
        </div>
      </div>

      <style jsx>{`
        .statistics-panel {
          background: white;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          margin-bottom: 20px;
        }

        .statistics-panel h3 {
          margin: 0 0 20px 0;
          color: #2c5aa0;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 15px;
          margin-bottom: 20px;
        }

        .stat-card {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 20px;
          border-radius: 8px;
          text-align: center;
          transition: transform 0.2s;
        }

        .stat-card:hover {
          transform: translateY(-5px);
        }

        .stat-card.success {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        }

        .stat-card.warning {
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
        }

        .stat-icon {
          font-size: 2em;
          margin-bottom: 10px;
          filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));
        }

        .stat-value {
          font-size: 2.5em;
          font-weight: bold;
          margin-bottom: 5px;
          color: #ffffff;
          text-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }

        .stat-label {
          font-size: 0.9em;
          opacity: 1;
          color: #ffffff;
          font-weight: 500;
          text-shadow: 0 1px 2px rgba(0,0,0,0.15);
        }

        .storage-section {
          background: #f8fafc;
          padding: 20px;
          border-radius: 8px;
          margin-top: 20px;
        }

        .storage-section h4 {
          margin: 0 0 15px 0;
          color: #2c5aa0;
        }

        .storage-info {
          margin-bottom: 10px;
          font-size: 1.1em;
        }

        .storage-used {
          font-weight: bold;
          color: #2c5aa0;
        }

        .storage-total {
          color: #64748b;
        }

        .storage-percentage {
          color: #64748b;
          font-size: 0.9em;
        }

        .progress-bar {
          width: 100%;
          height: 30px;
          background: #e2e8f0;
          border-radius: 15px;
          overflow: hidden;
          margin-bottom: 10px;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #3b82f6 0%, #2563eb 100%);
          transition: width 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: flex-end;
          padding-right: 10px;
          color: white;
          font-weight: bold;
        }

        .storage-details {
          color: #64748b;
          font-size: 0.9em;
        }

        .loading {
          text-align: center;
          padding: 40px;
          color: #64748b;
        }

        @media (max-width: 768px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .stat-value {
            font-size: 2em;
          }
        }
      `}</style>
    </div>
  );
}

export default StatisticsPanel;
