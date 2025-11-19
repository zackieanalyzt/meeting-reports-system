import React, { useState, useEffect } from 'react';
import { getRecentActivities } from '../../services/managementApi';

function ActivityLog() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [limit, setLimit] = useState(10);

  useEffect(() => {
    loadActivities();
  }, [limit]);

  const loadActivities = async () => {
    try {
      setLoading(true);
      const response = await getRecentActivities(limit);
      setActivities(response.data);
    } catch (error) {
      console.error('Error loading activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (action) => {
    switch(action) {
      case 'login': return '🔐';
      case 'logout': return '🚪';
      case 'create_meeting': return '➕';
      case 'update_meeting': return '✏️';
      case 'delete_meeting': return '🗑️';
      case 'create_agenda': return '📝';
      case 'update_agenda': return '✏️';
      case 'delete_agenda': return '🗑️';
      case 'upload_report': return '📤';
      case 'view_meeting': return '👁️';
      case 'view_agenda': return '👁️';
      case 'delete_file': return '🗑️';
      case 'view_statistics': return '📊';
      default: return '📌';
    }
  };

  const getActionColor = (action) => {
    if (action.includes('delete')) return '#ef4444';
    if (action.includes('create')) return '#10b981';
    if (action.includes('update')) return '#f59e0b';
    if (action.includes('view')) return '#3b82f6';
    return '#64748b';
  };

  if (loading) {
    return (
      <div className="activity-log">
        <h3>📜 กิจกรรมล่าสุด</h3>
        <div className="loading">กำลังโหลด...</div>
      </div>
    );
  }

  return (
    <div className="activity-log">
      <div className="log-header">
        <h3>📜 กิจกรรมล่าสุด</h3>
        <select value={limit} onChange={(e) => setLimit(Number(e.target.value))}>
          <option value={10}>10 รายการ</option>
          <option value={20}>20 รายการ</option>
          <option value={50}>50 รายการ</option>
        </select>
      </div>

      <div className="activities-list">
        {activities.length === 0 ? (
          <div className="no-activities">ไม่มีกิจกรรม</div>
        ) : (
          activities.map((activity) => (
            <div key={activity.id} className="activity-item">
              <div 
                className="activity-icon" 
                style={{ background: getActionColor(activity.action) }}
              >
                {getActionIcon(activity.action)}
              </div>
              <div className="activity-content">
                <div className="activity-main">
                  <span className="activity-user">{activity.username}</span>
                  <span className="activity-description">{activity.description}</span>
                  {activity.resource_type && (
                    <span className="activity-resource">
                      ({activity.resource_type} #{activity.resource_id})
                    </span>
                  )}
                </div>
                <div className="activity-meta">
                  <span className="activity-time">{activity.time_ago}</span>
                  {activity.ip_address && (
                    <span className="activity-ip">IP: {activity.ip_address}</span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {activities.length > 0 && (
        <div className="log-footer">
          <button onClick={loadActivities} className="btn-refresh">
            🔄 รีเฟรช
          </button>
        </div>
      )}

      <style jsx>{`
        .activity-log {
          background: white;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .log-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .log-header h3 {
          margin: 0;
          color: #2c5aa0;
        }

        .log-header select {
          padding: 6px 12px;
          border: 1px solid #cbd5e1;
          border-radius: 4px;
          background: white;
          cursor: pointer;
        }

        .activities-list {
          max-height: 500px;
          overflow-y: auto;
        }

        .activity-item {
          display: flex;
          gap: 15px;
          padding: 15px;
          border-bottom: 1px solid #e2e8f0;
          transition: background 0.2s;
        }

        .activity-item:hover {
          background: #f8fafc;
        }

        .activity-item:last-child {
          border-bottom: none;
        }

        .activity-icon {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.2em;
          flex-shrink: 0;
        }

        .activity-content {
          flex: 1;
          min-width: 0;
        }

        .activity-main {
          margin-bottom: 5px;
        }

        .activity-user {
          font-weight: 600;
          color: #2c5aa0;
          margin-right: 8px;
        }

        .activity-description {
          color: #475569;
        }

        .activity-resource {
          color: #94a3b8;
          font-size: 0.85em;
          margin-left: 5px;
        }

        .activity-meta {
          display: flex;
          gap: 15px;
          font-size: 0.85em;
          color: #94a3b8;
        }

        .activity-time {
          color: #64748b;
        }

        .activity-ip {
          color: #94a3b8;
        }

        .no-activities {
          text-align: center;
          padding: 40px;
          color: #94a3b8;
        }

        .log-footer {
          margin-top: 15px;
          text-align: center;
        }

        .btn-refresh {
          padding: 8px 16px;
          background: #f8fafc;
          color: #475569;
          border: 1px solid #cbd5e1;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-refresh:hover {
          background: #e2e8f0;
        }

        .loading {
          text-align: center;
          padding: 40px;
          color: #64748b;
        }

        /* Scrollbar styling */
        .activities-list::-webkit-scrollbar {
          width: 8px;
        }

        .activities-list::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 4px;
        }

        .activities-list::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
        }

        .activities-list::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }

        @media (max-width: 768px) {
          .activity-item {
            flex-direction: column;
            gap: 10px;
          }

          .activity-icon {
            width: 35px;
            height: 35px;
            font-size: 1em;
          }

          .activity-meta {
            flex-direction: column;
            gap: 5px;
          }
        }
      `}</style>
    </div>
  );
}

export default ActivityLog;
