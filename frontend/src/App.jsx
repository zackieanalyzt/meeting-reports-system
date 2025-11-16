import { useState, useEffect, useCallback } from 'react';
import MeetingListView from './components/MeetingListView';
import MeetingForm from './components/MeetingForm';
import UploadForm from './components/UploadForm';
import AgendaList from './components/AgendaList';
import AgendaForm from './components/AgendaForm';
import ReportStatus from './components/ReportStatus';
import { getMeetings, healthCheck } from './services/api';

function App() {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [dbStatus, setDbStatus] = useState({ status: 'checking', database: 'unknown' });
  const [showMeetingForm, setShowMeetingForm] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [showAgendaForm, setShowAgendaForm] = useState(false);
  const [activeTab, setActiveTab] = useState('meetings'); // 'meetings', 'agendas', 'reports'

  // Health check
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const health = await healthCheck();
        setDbStatus(health);
      } catch (err) {
        setDbStatus({ status: 'error', database: 'disconnected' });
      }
    };
    
    checkHealth();
    const interval = setInterval(checkHealth, 30000); // Check every 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  // Load meetings with debounce
  const loadMeetings = useCallback(async (search) => {
    try {
      setLoading(true);
      setError(null);
      const response = await getMeetings(search);
      setMeetings(response.data || []);
    } catch (err) {
      setError('ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่อีกครั้ง');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadMeetings('');
  }, [loadMeetings]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      loadMeetings(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm, loadMeetings]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleMeetingSuccess = () => {
    setShowMeetingForm(false);
    loadMeetings(''); // Reload meetings
  };

  const handleUploadSuccess = () => {
    setShowUploadForm(false);
    loadMeetings(''); // Reload meetings
  };

  const handleAgendaSuccess = () => {
    setShowAgendaForm(false);
    // Reload agendas if needed
  };

  const getPlaceholder = () => {
    switch (activeTab) {
      case 'meetings':
        return "ค้นหาจากชื่อการประชุม, เลขที่, หรือสถานที่...";
      case 'agendas':
        return "ค้นหาจากชื่อวาระ, เลขที่ประชุม, หรือกลุ่มงาน...";
      case 'reports':
        return "ค้นหาจากชื่อการประชุม, เลขที่, หรือสถานที่...";
      default:
        return "ค้นหา...";
    }
  };

  return (
    <div className="app">
      <header className="header">
        <div className="container">
          <h1 className="title">📋 ระบบจัดการการประชุม</h1>
          <div className="status-bar">
            <span className={`status-badge ${dbStatus.status === 'ok' ? 'status-ok' : 'status-error'}`}>
              {dbStatus.status === 'ok' ? '🟢 เชื่อมต่อฐานข้อมูลสำเร็จ' : '🔴 ไม่สามารถเชื่อมต่อฐานข้อมูล'}
            </span>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <div className="container">
          <div className="tab-buttons">
            <button
              className={`tab-button ${activeTab === 'meetings' ? 'active' : ''}`}
              onClick={() => setActiveTab('meetings')}
            >
              <span className="tab-icon">📅</span>
              <span>การประชุม</span>
            </button>
            <button
              className={`tab-button ${activeTab === 'agendas' ? 'active' : ''}`}
              onClick={() => setActiveTab('agendas')}
            >
              <span className="tab-icon">📑</span>
              <span>วาระการประชุม</span>
            </button>
            <button
              className={`tab-button ${activeTab === 'reports' ? 'active' : ''}`}
              onClick={() => setActiveTab('reports')}
            >
              <span className="tab-icon">📋</span>
              <span>รายงานการประชุม</span>
            </button>
          </div>
        </div>
      </div>

      <main className="main">
        <div className="container">
          {/* Search Section */}
          <div className="search-section">
            <div className="search-box">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                className="search-input"
                placeholder={getPlaceholder()}
                value={searchTerm}
                onChange={handleSearchChange}
              />
              {searchTerm && (
                <button 
                  className="clear-button"
                  onClick={() => setSearchTerm('')}
                  aria-label="Clear search"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* Content based on active tab */}
          {activeTab === 'meetings' && (
            <MeetingListView searchTerm={searchTerm} />
          )}

          {activeTab === 'agendas' && (
            <AgendaList searchTerm={searchTerm} />
          )}

          {activeTab === 'reports' && (
            <div className="reports-tab">
              <div className="tab-header">
                <h2>📋 รายงานการประชุม</h2>
                <p className="tab-description">
                  จัดการรายงานการประชุมหลังการประชุมเสร็จสิ้น
                </p>
              </div>
              <ReportStatus />
            </div>
          )}
        </div>
      </main>

      <footer className="footer">
        <div className="container">
          <p>© 2024 ระบบจัดการการประชุม | พัฒนาด้วย React + Node.js</p>
        </div>
      </footer>

      {/* Upload Buttons */}
      {activeTab === 'meetings' && (
        <button
          className="upload-button"
          onClick={() => setShowMeetingForm(true)}
          title="สร้างการประชุมใหม่"
        >
          ➕
        </button>
      )}

      {activeTab === 'agendas' && (
        <button
          className="upload-button agenda-upload-button"
          onClick={() => setShowAgendaForm(true)}
          title="เพิ่มวาระการประชุม"
        >
          ➕
        </button>
      )}

      {activeTab === 'reports' && (
        <button
          className="upload-button"
          onClick={() => setShowUploadForm(true)}
          title="อัพโหลดรายงานการประชุม"
        >
          ➕
        </button>
      )}

      {/* Form Modals */}
      {showMeetingForm && (
        <MeetingForm
          onSuccess={handleMeetingSuccess}
          onCancel={() => setShowMeetingForm(false)}
        />
      )}

      {showAgendaForm && (
        <AgendaForm
          onSuccess={handleAgendaSuccess}
          onCancel={() => setShowAgendaForm(false)}
        />
      )}

      {showUploadForm && (
        <UploadForm
          onSuccess={handleUploadSuccess}
          onCancel={() => setShowUploadForm(false)}
        />
      )}
    </div>
  );
}

export default App;
