import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../store/AppContext';
import BrandLogo from '../components/ui/BrandLogo';
import Toast from '../components/ui/Toast';
import { TEMPLATES } from '../utils/templates';
import { genId, timeAgo } from '../utils/helpers';
import './Dashboard.css';

export default function Dashboard() {
  const { state, actions } = useApp();
  const navigate = useNavigate();
  const [newProjectModal, setNewProjectModal] = useState(false);
  const [templateModal, setTemplateModal] = useState(false);
  const [renameModal, setRenameModal] = useState(null);
  const [newName, setNewName] = useState('');

  useEffect(() => {
    document.body.classList.remove('workspace-page');
    // Load projects from localStorage
    const projects = JSON.parse(localStorage.getItem('kexo_projects') || '[]');
    actions.saveProject && null; // ensure context is up
    if (projects.length === 0) {
      // seed default project
      const p = { id: 'default', name: 'My First Canvas', createdAt: Date.now(), updatedAt: Date.now(), nodeCount: 0, color: 'amber' };
      localStorage.setItem('kexo_projects', JSON.stringify([p]));
    }
    const ps = JSON.parse(localStorage.getItem('kexo_projects') || '[]');
    actions.saveProject && ps.forEach(p => actions.saveProject(p));
    // refresh
    import('../store/AppContext').then(() => {
      const fresh = JSON.parse(localStorage.getItem('kexo_projects') || '[]');
      import('../store/AppContext').catch(() => {});
    });
  }, []);

  // Read projects directly from localStorage for freshness
  const [projects, setProjects] = useState([]);
  useEffect(() => {
    const refresh = () => {
      const ps = JSON.parse(localStorage.getItem('kexo_projects') || '[]');
      setProjects(ps.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0)));
    };
    refresh();
    window.addEventListener('focus', refresh);
    return () => window.removeEventListener('focus', refresh);
  }, [state.projects]);

  const openProject = (id) => {
    localStorage.setItem('kexo_active_project', id);
    navigate(`/workspace?project=${id}`);
  };

  const createProject = (name) => {
    const id = genId();
    const p = { id, name: name || 'Untitled Canvas', createdAt: Date.now(), updatedAt: Date.now(), nodeCount: 0, color: ['amber','blue','green','violet','rose'][Math.floor(Math.random()*5)] };
    const ps = JSON.parse(localStorage.getItem('kexo_projects') || '[]');
    ps.push(p);
    localStorage.setItem('kexo_projects', JSON.stringify(ps));
    setProjects(ps.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0)));
    setNewProjectModal(false);
    openProject(id);
  };

  const createFromTemplate = (template) => {
    const id = genId();
    const p = { id, name: template.name, createdAt: Date.now(), updatedAt: Date.now(), nodeCount: Object.keys(template.nodes).length, color: 'amber' };
    const ps = JSON.parse(localStorage.getItem('kexo_projects') || '[]');
    ps.push(p);
    localStorage.setItem('kexo_projects', JSON.stringify(ps));
    // Pre-seed canvas data
    localStorage.setItem(`kexo_nodes_${id}`, JSON.stringify(template.nodes));
    localStorage.setItem(`kexo_connections_${id}`, JSON.stringify(template.connections));
    localStorage.setItem(`kexo_nextNodeId_${id}`, String(template.nextNodeId));
    localStorage.setItem(`kexo_nextConnId_${id}`, String(template.nextConnId));
    setProjects(ps.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0)));
    setTemplateModal(false);
    openProject(id);
  };

  const deleteProject = (id, e) => {
    e.stopPropagation();
    if (!confirm('Delete this project? This cannot be undone.')) return;
    const ps = JSON.parse(localStorage.getItem('kexo_projects') || '[]').filter(p => p.id !== id);
    localStorage.setItem('kexo_projects', JSON.stringify(ps));
    ['nodes','connections','notes','nextNodeId','nextConnId','drawing'].forEach(k => {
      try { localStorage.removeItem(`kexo_${k}_${id}`); } catch {}
    });
    setProjects(ps);
  };

  const renameProject = (id, name) => {
    const ps = JSON.parse(localStorage.getItem('kexo_projects') || '[]');
    const p = ps.find(x => x.id === id);
    if (p) { p.name = name; localStorage.setItem('kexo_projects', JSON.stringify(ps)); }
    setProjects(ps.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0)));
    setRenameModal(null);
  };

  const getNodeCount = (id) => {
    try { return Object.keys(JSON.parse(localStorage.getItem(`kexo_nodes_${id}`) || '{}')).length; } catch { return 0; }
  };

  const PROJECT_COLORS = { amber: '#f5a623', blue: '#4f8ef7', green: '#2dd4a0', violet: '#9b74f5', rose: '#f25f7a', default: '#6b6a7a' };

  return (
    <div className="dash-page">
      {/* HEADER */}
      <header className="dash-header">
        <Link to="/" className="header-brand">
          <BrandLogo size={34} />
          <span className="brand-name" style={{ fontSize: 16 }}>kexo <em>AI</em></span>
        </Link>
        <div className="header-sep" />
        <span className="header-page-label">Dashboard</span>
        <div className="header-right">
          <button className="btn-icon" onClick={actions.toggleTheme} title="Toggle theme">
            {state.theme === 'dark'
              ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/></svg>
              : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>}
          </button>
          <Link to="/settings" className="btn-ghost" style={{ fontSize: 13 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
            Settings
          </Link>
          <Link to="/pricing" className="btn-ghost" style={{ fontSize: 13 }}>Pricing</Link>
        </div>
      </header>

      {/* BODY */}
      <div className="dash-body">
        <div className="dash-topbar">
          <div>
            <h1>Your Projects</h1>
            <p>{projects.length} canvas{projects.length !== 1 ? 'es' : ''} · Auto-saved to browser</p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn-outline" style={{ padding: '10px 18px' }} onClick={() => setTemplateModal(true)}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              From Template
            </button>
            <button className="btn-new" onClick={() => setNewProjectModal(true)}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              New Project
            </button>
          </div>
        </div>

        {/* Projects Grid */}
        {projects.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            </div>
            <h3>No projects yet</h3>
            <p>Create your first canvas or start from a template</p>
            <button className="btn-primary" style={{ margin: '0 auto', marginTop: 16 }} onClick={() => setNewProjectModal(true)}>Create First Canvas</button>
          </div>
        ) : (
          <div className="projects-grid">
            {projects.map(p => {
              const nodeCount = getNodeCount(p.id);
              const color = PROJECT_COLORS[p.color] || PROJECT_COLORS.amber;
              return (
                <div key={p.id} className="project-card" onClick={() => openProject(p.id)}>
                  <div className="project-thumb" style={{ background: `linear-gradient(135deg, ${color}18, ${color}08)`, borderBottom: `1px solid ${color}22` }}>
                    <div className="project-thumb-dot" style={{ background: color }} />
                    <div className="project-thumb-lines">
                      <div className="thumb-line" style={{ width: '60%', background: `${color}40` }} />
                      <div className="thumb-line" style={{ width: '40%', background: `${color}25` }} />
                      <div className="thumb-line" style={{ width: '75%', background: `${color}18` }} />
                    </div>
                    {nodeCount > 0 && (
                      <div className="thumb-nodes">
                        {Array.from({ length: Math.min(nodeCount, 4) }).map((_, i) => (
                          <div key={i} className="thumb-node" style={{ background: `${color}30`, border: `1px solid ${color}50`, left: 20 + i * 28, top: 20 + (i % 2) * 18 }} />
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="project-info">
                    <div className="project-name-row">
                      <span className="project-name">{p.name}</span>
                      <div className="project-actions" onClick={e => e.stopPropagation()}>
                        <button className="proj-btn" title="Rename" onClick={() => { setRenameModal(p.id); setNewName(p.name); }}>
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>
                        </button>
                        <button className="proj-btn danger" title="Delete" onClick={(e) => deleteProject(p.id, e)}>
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
                        </button>
                      </div>
                    </div>
                    <div className="project-meta">
                      <span className="meta-pill">{nodeCount} node{nodeCount !== 1 ? 's' : ''}</span>
                      <span className="meta-sep">·</span>
                      <span className="meta-time">{timeAgo(p.updatedAt)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
            {/* New Project tile */}
            <div className="project-card project-card-new" onClick={() => setNewProjectModal(true)}>
              <div className="new-project-inner">
                <div className="new-project-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                </div>
                <span>New Project</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* NEW PROJECT MODAL */}
      {newProjectModal && (
        <div className="modal-overlay" onClick={() => setNewProjectModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">New Project</span>
              <button className="modal-close" onClick={() => setNewProjectModal(false)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <input
              className="modal-input" placeholder="Project name…" autoFocus
              value={newName} onChange={e => setNewName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && createProject(newName)}
            />
            <div className="modal-footer">
              <button className="btn-ghost" onClick={() => setNewProjectModal(false)}>Cancel</button>
              <button className="btn-primary" style={{ padding: '10px 22px' }} onClick={() => createProject(newName)}>Create</button>
            </div>
          </div>
        </div>
      )}

      {/* RENAME MODAL */}
      {renameModal && (
        <div className="modal-overlay" onClick={() => setRenameModal(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Rename Project</span>
              <button className="modal-close" onClick={() => setRenameModal(null)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <input className="modal-input" value={newName} onChange={e => setNewName(e.target.value)} autoFocus onKeyDown={e => e.key === 'Enter' && renameProject(renameModal, newName)} />
            <div className="modal-footer">
              <button className="btn-ghost" onClick={() => setRenameModal(null)}>Cancel</button>
              <button className="btn-primary" style={{ padding: '10px 22px' }} onClick={() => renameProject(renameModal, newName)}>Save</button>
            </div>
          </div>
        </div>
      )}

      {/* TEMPLATE MODAL */}
      {templateModal && (
        <div className="modal-overlay" onClick={() => setTemplateModal(false)}>
          <div className="modal-box" style={{ maxWidth: 600 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Choose a Template</span>
              <button className="modal-close" onClick={() => setTemplateModal(false)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div className="template-grid">
              {TEMPLATES.map(t => (
                <button key={t.id} className="template-card" onClick={() => createFromTemplate(t)}>
                  <div className="template-icon">{t.icon}</div>
                  <div className="template-name">{t.name}</div>
                  <div className="template-desc">{t.description}</div>
                  <div className="template-meta">{Object.keys(t.nodes).length} nodes pre-built</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <Toast />
    </div>
  );
}
