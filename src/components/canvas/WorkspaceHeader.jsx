import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../store/AppContext';
import BrandLogo from '../ui/BrandLogo';
import { timeAgo } from '../../utils/helpers';

export default function WorkspaceHeader({ projectId }) {
  const { state, actions } = useApp();
  const [projectName, setProjectName] = useState('');

  useEffect(() => {
    const ps = JSON.parse(localStorage.getItem('kexo_projects') || '[]');
    const p = ps.find(x => x.id === projectId);
    setProjectName(p?.name || '');
  }, [projectId, state.activeProjectId]);

  const handleDownload = () => {
    try {
      const ps = JSON.parse(localStorage.getItem('kexo_projects') || '[]');
      const p = ps.find(x => x.id === projectId);
      const data = {
        version: '2.0', exportedAt: new Date().toISOString(),
        project: p || { id: projectId, name: projectName },
        nodes: state.nodes, connections: state.connections,
        nextNodeId: state.nextNodeId, nextConnId: state.nextConnId,
        notes: state.notes,
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `kexo-${(p?.name || 'project').replace(/[^a-z0-9]/gi, '-').toLowerCase()}.json`;
      a.click(); URL.revokeObjectURL(url);
      actions.showToast('Project downloaded!');
    } catch (e) { actions.showToast('Export failed'); }
  };

  const saveStatusLabel = state.saveStatus === 'saving'
    ? '● Saving…'
    : state.lastSavedAt ? `✓ Saved ${timeAgo(state.lastSavedAt)}` : '✓ Saved';

  return (
    <header className="app-header">
      <div className="header-brand">
        <BrandLogo size={32} />
        <span className="brand-name">kexo <em>AI</em></span>
      </div>
      {projectName && <span className="header-project-name">{projectName}</span>}

      {/* Search */}
      <div className="header-search">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input
          type="text" placeholder="Search nodes…"
          value={state.searchQuery}
          onChange={e => actions.setSearch(e.target.value)}
          className="search-input"
        />
        {state.searchQuery && (
          <button className="search-clear" onClick={() => actions.setSearch('')}>×</button>
        )}
      </div>

      {/* Autosave */}
      <span className={`save-status ${state.saveStatus === 'saving' ? 'saving' : 'saved'}`}>
        {saveStatusLabel}
      </span>

      <div className="header-actions">
        <button className="btn-download" onClick={handleDownload} title="Download project as JSON">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          <span>Download</span>
        </button>
        <button className="btn-secondary" onClick={actions.toggleSharePanel} title="Share canvas">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
          Share
        </button>
        <button className="btn-secondary" onClick={actions.toggleAIPanel} title="AI Assistant">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2a10 10 0 1 0 10 10H12V2z"/><path d="M21.18 8.02c-1-2.3-2.85-4.17-5.16-5.18"/></svg>
          AI
        </button>
        <button className="btn-theme-toggle" onClick={actions.toggleTheme} title="Toggle theme" id="themeToggleBtn">
          {state.theme === 'dark'
            ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
            : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>}
        </button>
        <button className="btn-secondary" onClick={() => window.dispatchEvent(new Event('kexo:toggleSidebar'))} title="Toggle Panel">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18"/></svg>
        </button>
        <button className="btn-secondary" onClick={() => window.dispatchEvent(new Event('kexo:exportCanvas'))} title="Export canvas as image">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
          <span>Export</span>
        </button>
        <Link to="/dashboard" className="btn-dashboard" title="Back to Dashboard">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
          Dashboard
        </Link>
      </div>
    </header>
  );
}
