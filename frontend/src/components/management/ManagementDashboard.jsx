import React, { useState, useEffect } from 'react';
import { getStatistics } from '../../services/managementApi';
import StatisticsPanel from './StatisticsPanel';
import MeetingsManager from './MeetingsManager';
import AgendasManager from './AgendasManager';
import FilesManager from './FilesManager';
import ActivityLog from './ActivityLog';

function ManagementDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('overview');

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    try {
      setLoading(true);
      const response = await getStatistics();
      setStats(response.data);
    } catch (error) {
      console.error('Error loading statistics:', error);
      alert('เกิดข้อผิดพลาดในการโหลดสถิติ');
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    switch(activeSection) {
      case 'overview':
        return (
          <>
            <StatisticsPanel stats={stats} loading={loading} />
            <ActivityLog />
          </>
        );
      case 'meetings':
        return <MeetingsManager />;
      case 'agendas':
        return <AgendasManager />;
      case 'files':
        return <FilesManager />;
      default:
        return null;
    }
  };

  return (
    <div className="management-dashboard">
      <div className="dashboard-header">
        <h2>🛠️ จัดการระบบ</h2>
        <p className="subtitle">ระบบจัดการสำหรับเลขานุการ</p>
      </div>

      <div className="section-tabs">
        <button
          className={`tab ${activeSection === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveSection('overview')}
        >
          📊 ภาพรวม
        </button>
        <button
          className={`tab ${activeSection === 'meetings' ? 'active' : ''}`}
          onClick={() => setActiveSection('meetings')}
        >
          📋 จัดการการประชุม
        </button>
        <button
          className={`tab ${activeSection === 'agendas' ? 'active' : ''}`}
          onClick={() => setActiveSection('agendas')}
        >
          📝 จัดการวาระ
        </button>
        <button
          className={`tab ${activeSection === 'files' ? 'active' : ''}`}
          onClick={() => setActiveSection('files')}
        >
          📁 จัดการไฟล์
        </button>
      </div>

      <div className="dashboard-content">
        {renderContent()}
      </div>

      <style jsx>{`
        .management-dashboard {
          padding: 20px;
          max-width: 1400px;
          margin: 0 auto;
        }

        .dashboard-header {
          margin-bottom: 30px;
        }

        .dashboard-header h2 {
          margin: 0 0 5px 0;
          color: #2c5aa0;
          font-size: 2em;
        }

        .subtitle {
          margin: 0;
          color: #64748b;
          font-size: 1.1em;
        }

        .section-tabs {
          display: flex;
          gap: 10px;
          margin-bottom: 20px;
          border-bottom: 2px solid #e2e8f0;
          overflow-x: auto;
          padding-bottom: 0;
        }

        .tab {
          padding: 12px 20px;
          background: transparent;
          border: none;
          border-bottom: 3px solid transparent;
          cursor: pointer;
          font-size: 1em;
          color: #64748b;
          transition: all 0.2s;
          white-space: nowrap;
        }

        .tab:hover {
          color: #2c5aa0;
          background: #f8fafc;
        }

        .tab.active {
          color: #2c5aa0;
          border-bottom-color: #2c5aa0;
          font-weight: 600;
        }

        .dashboard-content {
          animation: fadeIn 0.3s ease-in;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (max-width: 768px) {
          .management-dashboard {
            padding: 15px;
          }

          .dashboard-header h2 {
            font-size: 1.5em;
          }

          .subtitle {
            font-size: 0.95em;
          }

          .section-tabs {
            gap: 5px;
          }

          .tab {
            padding: 10px 15px;
            font-size: 0.9em;
          }
        }
      `}</style>
    </div>
  );
}

export default ManagementDashboard;
