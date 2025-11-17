import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import MeetingListView from './components/MeetingListView';
import MeetingForm from './components/MeetingForm';
import UploadForm from './components/UploadForm';
import AgendaList from './components/AgendaList';
import AgendaForm from './components/AgendaForm';
import ReportStatus from './components/ReportStatus';
import RestrictedFeature from './components/RestrictedFeature';
import { useAuth } from './contexts/AuthContext';
import { getMeetings, healthCheck } from './services/api';

function AppContent() {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [dbStatus, setDbStatus] = useState({ status: 'checking', database: 'unknown' });
  const [showMeetingForm, setShowMeetingForm] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [showAgendaForm, setShowAgendaForm] = useState(false);
  const [activeTab, setActiveTab] = useState('meetings');
  
  const { user, logout } = useAuth();
  const navigate = useNavigate();

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
    const interval = setInterval(checkHealth, 30000);
    
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
    loadMeetings('');
  };

  const handleUploadSuccess = () => {
    setShowUploadForm(false);
    loadMeetings('');
  };

  const handleAgendaSuccess = () => {
    setShowAgendaForm(false);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getRoleBadge = (role) => {
    const badges = {
      secretary: { text: 'เจ้าหน้าที่ธุรการ', color: 'bg-purple-100 text-purple-800' },
      manager: { text: 'หัวหน้ากลุ่มงาน', color: 'bg-blue-100 text-blue-800' },
      user: { text: 'ผู้ใช้ทั่วไป', color: 'bg-gray-100 text-gray-800' }
    };
    return badges[role] || badges.user;
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

  const roleBadge = getRoleBadge(user?.role);

  return (
    <div className="app">
      <header className="header">
        <div className="container">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="title">📋 ระบบจัดการการประชุม</h1>
              <div className="status-bar">
                <span className={`status-badge ${dbStatus.status === 'ok' ? 'status-ok' : 'status-error'}`}>
                  {dbStatus.status === 'ok' ? '🟢 เชื่อมต่อฐานข้อมูลสำเร็จ' : '🔴 ไม่สามารถเชื่อมต่อฐานข้อมูล'}
                </span>
              </div>
            </div>
            
            {/* User Info */}
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user?.fullname}</p>
                <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${roleBadge.color}`}>
                  {roleBadge.text}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
              >
                ออกจากระบบ
              </button>
            </div>
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
          <p>© 2025 ระบบจัดการการประชุม | สำนักงานสาธารณสุขจังหวัดลำพูน</p>
        </div>
      </footer>

      {/* Upload Buttons - Role-based visibility */}
      <RestrictedFeature roles="secretary">
        {activeTab === 'meetings' && (
          <button
            className="upload-button"
            onClick={() => setShowMeetingForm(true)}
            title="สร้างการประชุมใหม่"
          >
            ➕
          </button>
        )}
      </RestrictedFeature>

      <RestrictedFeature roles={['secretary', 'manager']}>
        {activeTab === 'agendas' && (
          <button
            className="upload-button agenda-upload-button"
            onClick={() => setShowAgendaForm(true)}
            title="เพิ่มวาระการประชุม"
          >
            ➕
          </button>
        )}
      </RestrictedFeature>

      <RestrictedFeature roles="secretary">
        {activeTab === 'reports' && (
          <button
            className="upload-button"
            onClick={() => setShowUploadForm(true)}
            title="อัพโหลดรายงานการประชุม"
          >
            ➕
          </button>
        )}
      </RestrictedFeature>

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

export default AppContent;
