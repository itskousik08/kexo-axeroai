import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../store/AppContext';
import BrandLogo from '../components/ui/BrandLogo';
import Toast from '../components/ui/Toast';
import './Settings.css';

export default function Settings() {
  const { state, actions } = useApp();
  const navigate = useNavigate();
  const [confirmClear, setConfirmClear] = useState(false);

  const clearAllData = () => {
    if (!confirmClear) { setConfirmClear(true); return; }
    const keys = Object.keys(localStorage).filter(k => k.startsWith('kexo_'));
    keys.forEach(k => localStorage.removeItem(k));
    actions.showToast('All data cleared');
    setTimeout(() => navigate('/'), 1000);
  };

  const totalNodes = () => {
    try {
      const projects = JSON.parse(localStorage.getItem('kexo_projects') || '[]');
      return projects.reduce((sum, p) => {
        const nodes = JSON.parse(localStorage.getItem(`kexo_nodes_${p.id}`) || '{}');
        return sum + Object.keys(nodes).length;
      }, 0);
    } catch { return 0; }
  };

  const storageUsed = () => {
    let total = 0;
    Object.keys(localStorage).filter(k => k.startsWith('kexo_')).forEach(k => { total += (localStorage.getItem(k) || '').length; });
    return (total / 1024).toFixed(1);
  };

  return (
    <div className="settings-page">
      <header className="dash-header">
        <Link to="/" className="header-brand">
          <BrandLogo size={34} />
          <span className="brand-name" style={{ fontSize: 16 }}>kexo <em>AI</em></span>
        </Link>
        <div className="header-sep" />
        <span className="header-page-label">Settings</span>
        <div className="header-right" style={{ marginLeft: 'auto' }}>
          <Link to="/dashboard" className="btn-ghost">← Dashboard</Link>
        </div>
      </header>

      <div className="settings-body">
        <div className="settings-title-section">
          <h1>Settings</h1>
          <p>Manage your preferences, data and account.</p>
        </div>

        {/* Appearance */}
        <div className="settings-section">
          <div className="settings-section-title">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/></svg>
            Appearance
          </div>
          <div className="settings-card">
            <div className="settings-row">
              <div>
                <div className="settings-row-label">Theme</div>
                <div className="settings-row-sub">Switch between dark and light mode</div>
              </div>
              <div className="theme-toggle-group">
                {['dark', 'light'].map(t => (
                  <button
                    key={t}
                    className={`theme-btn${state.theme === t ? ' active' : ''}`}
                    onClick={() => state.theme !== t && actions.toggleTheme()}
                  >
                    {t === 'dark'
                      ? <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg> Dark</>
                      : <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/></svg> Light</>}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Data */}
        <div className="settings-section">
          <div className="settings-section-title">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>
            Storage
          </div>
          <div className="settings-card">
            <div className="settings-row">
              <div>
                <div className="settings-row-label">Total Nodes</div>
                <div className="settings-row-sub">Across all projects</div>
              </div>
              <span className="settings-badge">{totalNodes()}</span>
            </div>
            <div className="settings-divider" />
            <div className="settings-row">
              <div>
                <div className="settings-row-label">Storage Used</div>
                <div className="settings-row-sub">Browser localStorage</div>
              </div>
              <span className="settings-badge">{storageUsed()} KB</span>
            </div>
            <div className="settings-divider" />
            <div className="settings-row">
              <div>
                <div className="settings-row-label">Projects</div>
                <div className="settings-row-sub">Saved to this browser</div>
              </div>
              <span className="settings-badge">{JSON.parse(localStorage.getItem('kexo_projects') || '[]').length}</span>
            </div>
          </div>
        </div>

        {/* Keyboard Shortcuts */}
        <div className="settings-section">
          <div className="settings-section-title">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M8 8h.01M12 8h.01M16 8h.01M8 12h.01M12 12h.01M16 12h.01M8 16h8"/></svg>
            Keyboard Shortcuts
          </div>
          <div className="settings-card">
            {[
              ['T', 'Capture current video timestamp'],
              ['Ctrl + Z', 'Undo'],
              ['Ctrl + Y', 'Redo'],
              ['Delete / Backspace', 'Delete selected node or connection'],
              ['Space + Drag', 'Pan the canvas'],
              ['Ctrl + Scroll', 'Zoom in / out'],
              ['Esc', 'Cancel current action'],
            ].map(([key, desc]) => (
              <React.Fragment key={key}>
                <div className="settings-row">
                  <div className="settings-row-sub">{desc}</div>
                  <kbd className="kbd">{key}</kbd>
                </div>
                <div className="settings-divider" />
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Danger Zone */}
        <div className="settings-section">
          <div className="settings-section-title" style={{ color: 'var(--rose)' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            Danger Zone
          </div>
          <div className="settings-card" style={{ borderColor: 'rgba(242,95,122,0.2)' }}>
            <div className="settings-row">
              <div>
                <div className="settings-row-label" style={{ color: 'var(--rose)' }}>Clear All Data</div>
                <div className="settings-row-sub">Permanently delete all projects, nodes, and notes. Cannot be undone.</div>
              </div>
              <button
                className={`danger-btn${confirmClear ? ' confirm' : ''}`}
                onClick={clearAllData}
              >
                {confirmClear ? '⚠️ Click again to confirm' : 'Clear All Data'}
              </button>
            </div>
          </div>
        </div>

        {/* About */}
        <div className="settings-section">
          <div className="settings-card" style={{ textAlign: 'center', padding: '24px' }}>
            <BrandLogo size={44} />
            <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 18, fontWeight: 800, color: 'var(--text)', marginTop: 12 }}>kexo <span style={{ color: 'var(--accent)' }}>AI</span></div>
            <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 4 }}>Version 2.0 · React Edition</div>
            <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 8 }}>Built by <strong style={{ color: 'var(--text2)' }}>Kousik Debnath</strong> · AxeroAI</div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 16 }}>
              <Link to="/pricing" className="btn-ghost" style={{ fontSize: 12 }}>View Pricing</Link>
              <Link to="/" className="btn-ghost" style={{ fontSize: 12 }}>Landing Page</Link>
            </div>
          </div>
        </div>
      </div>
      <Toast />
    </div>
  );
}
