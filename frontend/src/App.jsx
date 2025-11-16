import { useState, useEffect, useCallback } from 'react';
import MeetingList from './components/MeetingList';
import UploadForm from './components/UploadForm';
import AgendaList from './components/AgendaList';
import AgendaForm from './components/AgendaForm';
import { getMeetings, healthCheck } from './services/api';

function App() {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [dbStatus, setDbStatus] = useState({ status: 'checking', database: 'unknown' });
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [showAgendaForm, setShowAgendaForm] = useState(false);
  const [activeTab, setActiveTab] = useState('reports'); // 'reports' or 'agendas'

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

  const handleUploadSuccess = () => {
    setShowUploadForm(false);
    loadMeetings(''); // Reload meetings
  };

  const handleAgendaSuccess = () => {
    setShowAgendaForm(false);
    // Reload agendas if needed
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
              className={`tab-button ${activeTab === 'reports' ? 'active' : ''}`}
              onClick={() => setActiveTab('reports')}
            >
              <span className="tab-icon">📋</span>
              <span>รายงานการประชุม</span>
            </button>
            <button
              className={`tab-button ${activeTab === 'agendas' ? 'active' : ''}`}
              onClick={() => setActiveTab('agendas')}
            >
              <span className="tab-icon">📑</span>
              <span>วาระการประชุม</span>
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
                placeholder={
                  activeTab === 'reports'
                    ? "ค้นหาจากชื่อการประชุม, เลขที่, หรือสถานที่..."
                    : "ค้นหาจากชื่อวาระ, เลขที่ประชุม, หรือกลุ่มงาน..."
                }
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
          {activeTab === 'reports' && (
            <MeetingList 
              meetings={meetings} 
              loading={loading}
              searchTerm={searchTerm}
            />
          )}

          {activeTab === 'agendas' && (
            <AgendaList searchTerm={searchTerm} />
          )}
        </div>
      </main>

      <footer className="footer">
        <div className="container">
          <p>© 2024 ระบบจัดการการประชุม | พัฒนาด้วย React + Node.js</p>
        </div>
      </footer>

      {/* Upload Buttons */}
      {activeTab === 'reports' && (
        <button
          className="upload-button"
          onClick={() => setShowUploadForm(true)}
          title="อัพโหลดรายงานการประชุม"
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

      {/* Upload Form Modals */}
      {showUploadForm && (
        <UploadForm
          onSuccess={handleUploadSuccess}
          onCancel={() => setShowUploadForm(false)}
        />
      )}

      {showAgendaForm && (
        <AgendaForm
          onSuccess={handleAgendaSuccess}
          onCancel={() => setShowAgendaForm(false)}
        />
      )}
    </div>
  );
}

export default App;
