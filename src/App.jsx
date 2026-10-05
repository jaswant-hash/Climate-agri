import React, { useState } from 'react';
import './index.css';
import Dashboard from './components/dashboard/Dashboard';
import AgriculturalAdvisory from './components/advisory/AgriculturalAdvisory';
import AIPrediction from './components/prediction/AIPrediction';
import Settings from './components/settings/Settings';
import FarmerChatbot from './components/chat/FarmerChatbot';
import Login from './components/auth/Login';
import History from './components/history/History';
import { useLanguage } from './context/LanguageContext';
import { useTheme } from './context/ThemeContext';

function App() {
  const { t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const [user, setUser] = useState(null);          // null = not logged in
  const [activeMenu, setActiveMenu] = useState('Dashboard');
  const [activeFilter, setActiveFilter] = useState('12m');

  const isAuthenticated = !!user;


  const menus = [
    { id: 'Dashboard', title: t('menu.dashboard'), icon: 'dashboard' },
    { id: 'AI Prediction', title: t('menu.aiPrediction'), icon: 'psychology' },
    { id: 'Agri Advisory', title: t('menu.advisory'), icon: 'eco' },
    { id: 'History', title: t('menu.history'), icon: 'history' },
    { id: 'Settings', title: t('menu.settings'), icon: 'settings' }
  ];

  return (
    <>
      {/* Main App Container - Blurred if not authenticated */}
      <div style={{
        display: 'flex',
        width: '100vw',
        minHeight: '100vh',
        filter: !isAuthenticated ? 'blur(12px) brightness(0.6)' : 'none',
        pointerEvents: !isAuthenticated ? 'none' : 'auto',
        transition: 'all 0.5s ease-out'
      }}>
        {/* Sidebar */}
        <aside className="sidebar">
          <div className="logo-container">
            <span className="material-symbols-rounded logo-icon">eco</span>
            <span className="logo-text">{t('app.logo')}</span>
          </div>

          <nav className="main-nav">
            {menus.map((item, index) => (
              <div
                key={index}
                className={`nav-item ${activeMenu === item.id ? 'active' : ''}`}
                onClick={() => setActiveMenu(item.id)}
              >
                <span className="material-symbols-rounded">{item.icon}</span>
                <span>{item.title}</span>
              </div>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="main-content">
          <header className="top-header">

            <div className="header-actions" style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button className="icon-btn" onClick={toggleTheme} title="Toggle Theme">
                <span className="material-symbols-rounded">
                  {theme === 'dark' ? 'light_mode' : 'dark_mode'}
                </span>
              </button>

              {user && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 8px' }}>
                  <span className="material-symbols-rounded" style={{ fontSize: '20px', color: 'var(--text-muted, #94a3b8)' }}>account_circle</span>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-main, #f8fafc)' }}>{user.name || user.email}</span>
                </div>
              )}
            </div>
          </header>

          {activeMenu === 'Dashboard' ? (
            <Dashboard activeFilter={activeFilter} />
          ) : activeMenu === 'AI Prediction' ? (
            <AIPrediction />
          ) : activeMenu === 'Agri Advisory' ? (
            <AgriculturalAdvisory />
          ) : activeMenu === 'History' ? (
            <History />
          ) : activeMenu === 'Settings' ? (
            <Settings user={user} setUser={setUser} />
          ) : (
            <div className="dashboard-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
              <h2 style={{ color: 'var(--text-muted)' }}>{t('dashboard.inDev')}</h2>
            </div>
          )}

          {/* Global Chatbot Widget */}
          <FarmerChatbot />
        </main>
      </div>

      {/* Login Overlay */}
      {!isAuthenticated && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 9999 }}>
          <Login onLogin={(userData) => setUser(userData)} />
        </div>
      )}
    </>
  );
}

export default App;
