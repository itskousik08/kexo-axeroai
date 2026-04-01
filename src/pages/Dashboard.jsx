import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../store/AppContext';
import BrandLogo from '../components/ui/BrandLogo';
import Toast from '../components/ui/Toast';
import { TEMPLATES } from '../utils/templates';
import { genId, timeAgo } from '../utils/helpers';
import './Dashboard.css';

const THEMES = [
  {
    id: 'signature',
    name: 'Flow Canvas',
    desc: 'Box-based system with drag & drop, connections, and YouTube capture.',
    icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="4" width="8" height="6" rx="2"/><rect x="14" y="4" width="8" height="6" rx="2"/><rect x="8" y="14" width="8" height="6" rx="2"/><line x1="6" y1="10" x2="12" y2="14"/><line x1="18" y1="10" x2="12" y2="14"/></svg>,
    color: 'var(--accent)',
    gradient: 'linear-gradient(135deg, rgba(245,166,35,0.12), rgba(255,107,53,0.06))',
    border: 'rgba(245,166,35,0.3)',
    features: ['Drag & drop boxes', 'Connection lines', 'YouTube timestamps', 'AI panel'],
  },
  {
    id: 'traditional',
    name: 'Traditional',
    desc: 'Simple line-by-line notepad. Clean, distraction-free writing.',
    icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>,
    color: 'var(--green)',
    gradient: 'linear-gradient(135deg, rgba(45,212,160,0.10), rgba(45,212,160,0.04))',
    border: 'rgba(45,212,160,0.3)',
    features: ['Line-by-line notes', 'Image & audio blocks', 'AI support', 'Clean layout'],
  },
  {
    id: 'freecanvas',
    name: 'Free Canvas',
    desc: 'Click anywhere to write. No boxes. Full creative freedom.',
    icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/><path d="M15 5l4 4"/></svg>,
    color: 'var(--violet)',
    gradient: 'linear-gradient(135deg, rgba(155,116,245,0.10), rgba(155,116,245,0.04))',
    border: 'rgba(155,116,245,0.3)',
    features: ['Click anywhere to write', 'Free positioning', 'Image upload', 'Rich text'],
  },
];

export default function Dashboard() {
  const { state, actions } = useApp();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [step, setStep] = useState(null); // null | 'name' | 'theme'
  const [newName, setNewName] = useState('');
  const [newTheme, setNewTheme] = useState('signature');
  const [templateModal, setTemplateModal] = useState(false);
  const [renameTarget, setRenameTarget] = useState(null);
  const [renameVal, setRenameVal] = useState('');

  useEffect(() => {
    document.body.classList.remove('workspace-page');
    refreshProjects();
    window.addEventListener('focus', refreshProjects);
    return () => window.removeEventListener('focus', refreshProjects);
  }, []);

  const refreshProjects = () => {
    const ps = JSON.parse(localStorage.getItem('kexo_projects') || '[]');
    if (ps.length === 0) {
      const p = { id: 'default', name: 'My First Canvas', theme: 'signature', createdAt: Date.now(), updatedAt: Date.now(), nodeCount: 0, color: 'amber' };
      localStorage.setItem('kexo_projects', JSON.stringify([p]));
      setProjects([p]);
    } else {
      setProjects(ps.sort((a, b) => (b.updatedAt||0) - (a.updatedAt||0)));
    }
  };

  const openProject = (id) => {
    localStorage.setItem('kexo_active_project', id);
    navigate(`/workspace?project=${id}`);
  };

  const startCreate = () => { setNewName(''); setStep('name'); };

  const proceedToTheme = () => {
    if (!newName.trim()) return;
    setStep('theme');
  };

  const createProject = () => {
    const id = genId();
    const colors = ['amber','blue','green','violet','rose'];
    const p = { id, name: newName.trim() || 'Untitled', theme: newTheme, createdAt: Date.now(), updatedAt: Date.now(), nodeCount: 0, color: colors[Math.floor(Math.random()*5)] };
    const ps = JSON.parse(localStorage.getItem('kexo_projects') || '[]');
    ps.push(p);
    localStorage.setItem('kexo_projects', JSON.stringify(ps));
    setProjects(ps.sort((a,b) => (b.updatedAt||0) - (a.updatedAt||0)));
    setStep(null);
    openProject(id);
  };

  const createFromTemplate = (t) => {
    const id = genId();
    const p = { id, name: t.name, theme: 'signature', createdAt: Date.now(), updatedAt: Date.now(), nodeCount: Object.keys(t.nodes).length, color: 'amber' };
    const ps = JSON.parse(localStorage.getItem('kexo_projects') || '[]');
    ps.push(p);
    localStorage.setItem('kexo_projects', JSON.stringify(ps));
    localStorage.setItem(`kexo_nodes_${id}`, JSON.stringify(t.nodes));
    localStorage.setItem(`kexo_connections_${id}`, JSON.stringify(t.connections));
    localStorage.setItem(`kexo_nextNodeId_${id}`, String(t.nextNodeId));
    localStorage.setItem(`kexo_nextConnId_${id}`, String(t.nextConnId));
    setProjects(ps.sort((a,b) => (b.updatedAt||0) - (a.updatedAt||0)));
    setTemplateModal(false);
    openProject(id);
  };

  const deleteProject = (id, e) => {
    e.stopPropagation();
    if (!confirm('Delete this project?')) return;
    const ps = JSON.parse(localStorage.getItem('kexo_projects') || '[]').filter(p => p.id !== id);
    localStorage.setItem('kexo_projects', JSON.stringify(ps));
    ['nodes','connections','notes','nextNodeId','nextConnId'].forEach(k => {
      try { localStorage.removeItem(`kexo_${k}_${id}`); } catch {}
    });
    setProjects(ps);
  };

  const renameProject = () => {
    const ps = JSON.parse(localStorage.getItem('kexo_projects') || '[]');
    const p = ps.find(x => x.id === renameTarget);
    if (p) { p.name = renameVal; localStorage.setItem('kexo_projects', JSON.stringify(ps)); }
    setProjects(ps.sort((a,b) => (b.updatedAt||0) - (a.updatedAt||0)));
    setRenameTarget(null);
  };

  const getNodeCount = (id) => {
    try { return Object.keys(JSON.parse(localStorage.getItem(`kexo_nodes_${id}`) || '{}')).length; } catch { return 0; }
  };

  const PCOLORS = { amber: '#f5a623', blue: '#4f8ef7', green: '#2dd4a0', violet: '#9b74f5', rose: '#f25f7a' };
  const themeOf = (id) => THEMES.find(t => t.id === id) || THEMES[0];

  return (
    <div className="dash-page">
      <header className="dash-header">
        <Link to="/" className="header-brand"><BrandLogo size={32} /><span className="brand-name" style={{ fontSize: 16 }}>kexo <em>AI</em></span></Link>
        <div className="header-sep"/>
        <span className="header-page-label">Dashboard</span>
        <div className="header-right">
          <button className="btn-icon" onClick={() => actions.setTheme(state.theme === 'dark' ? 'light' : state.theme === 'light' ? 'auto' : 'dark')} title="Toggle theme">
            {state.resolvedTheme === 'dark'
              ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
              : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/></svg>}
          </button>
          <Link to="/settings" className="btn-ghost" style={{ fontSize: 13 }}>Settings</Link>
          <Link to="/pricing" className="btn-ghost" style={{ fontSize: 13 }}>Pricing</Link>
        </div>
      </header>

      <div className="dash-body">
        <div className="dash-topbar">
          <div>
            <h1>Your Projects</h1>
            <p>{projects.length} project{projects.length !== 1 ? 's' : ''} · Auto-saved to browser</p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn-outline" style={{ padding: '10px 18px' }} onClick={() => setTemplateModal(true)}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              Pre-built Template
            </button>
            <button className="btn-new" onClick={startCreate}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              New Project
            </button>
          </div>
        </div>

        {projects.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg></div>
            <h3>No projects yet</h3>
            <p>Create your first canvas or start from a template</p>
            <button className="btn-primary" style={{ margin: '16px auto 0' }} onClick={startCreate}>Create First Canvas</button>
          </div>
        ) : (
          <div className="projects-grid">
            {projects.map(p => {
              const nc = getNodeCount(p.id);
              const clr = PCOLORS[p.color] || PCOLORS.amber;
              const th = themeOf(p.theme);
              return (
                <div key={p.id} className="project-card" onClick={() => openProject(p.id)}>
                  <div className="project-thumb" style={{ background: `linear-gradient(135deg, ${clr}18, ${clr}06)`, borderBottom: `1px solid ${clr}22` }}>
                    <div className="project-thumb-inner">
                      <div style={{ color: th.color, opacity: 0.4 }}>{th.icon}</div>
                      <div className="project-thumb-lines">
                        <div className="thumb-line" style={{ width: '60%', background: `${clr}40` }}/>
                        <div className="thumb-line" style={{ width: '40%', background: `${clr}25` }}/>
                        <div className="thumb-line" style={{ width: '75%', background: `${clr}18` }}/>
                      </div>
                    </div>
                    <span className="project-theme-label" style={{ color: th.color, background: th.color + '18', borderColor: th.color + '33' }}>{th.name}</span>
                  </div>
                  <div className="project-info">
                    <div className="project-name-row">
                      <span className="project-name">{p.name}</span>
                      <div className="project-actions" onClick={e => e.stopPropagation()}>
                        <button className="proj-btn" onClick={() => { setRenameTarget(p.id); setRenameVal(p.name); }}>
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>
                        </button>
                        <button className="proj-btn danger" onClick={(e) => deleteProject(p.id, e)}>
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
                        </button>
                      </div>
                    </div>
                    <div className="project-meta">
                      <span className="meta-pill">{nc} node{nc !== 1 ? 's' : ''}</span>
                      <span className="meta-sep">·</span>
                      <span className="meta-time">{timeAgo(p.updatedAt)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
            <div className="project-card project-card-new" onClick={startCreate}>
              <div className="new-project-inner">
                <div className="new-project-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg></div>
                <span>New Project</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* STEP 1: Name */}
      {step === 'name' && (
        <div className="modal-overlay" onClick={() => setStep(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">New Project</span>
              <button className="modal-close" onClick={() => setStep(null)}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
            </div>
            <div style={{ marginBottom: 6, fontSize: 12, color: 'var(--text3)', fontFamily: 'Syne, sans-serif', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px' }}>Step 1 of 2 — Project Name</div>
            <input className="modal-input" placeholder="Enter project name…" autoFocus value={newName} onChange={e => setNewName(e.target.value)} onKeyDown={e => e.key === 'Enter' && newName.trim() && proceedToTheme()} />
            <div className="modal-footer">
              <button className="btn-ghost" onClick={() => setStep(null)}>Cancel</button>
              <button className="btn-primary" style={{ padding: '10px 24px' }} onClick={proceedToTheme} disabled={!newName.trim()}>Next: Choose Theme</button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: Theme */}
      {step === 'theme' && (
        <div className="modal-overlay" onClick={() => setStep(null)}>
          <div className="modal-box" style={{ maxWidth: 680 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Choose Theme</span>
              <button className="modal-close" onClick={() => setStep(null)}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
            </div>
            <div style={{ marginBottom: 20, fontSize: 12, color: 'var(--text3)', fontFamily: 'Syne, sans-serif', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px' }}>Step 2 of 2 — Canvas Style for "{newName}"</div>
            <div className="theme-pick-grid">
              {THEMES.map(t => (
                <button
                  key={t.id}
                  className={`theme-pick-card${newTheme === t.id ? ' theme-pick-card--active' : ''}`}
                  style={newTheme === t.id ? { background: t.gradient, borderColor: t.border } : {}}
                  onClick={() => setNewTheme(t.id)}
                >
                  <div className="theme-pick-icon" style={{ color: t.color, background: t.color + '14', borderColor: t.color + '30' }}>{t.icon}</div>
                  <div className="theme-pick-name" style={newTheme === t.id ? { color: t.color } : {}}>{t.name}</div>
                  <div className="theme-pick-desc">{t.desc}</div>
                  <ul className="theme-pick-features">
                    {t.features.map(f => <li key={f}><span style={{ color: t.color }}>✓</span> {f}</li>)}
                  </ul>
                  {newTheme === t.id && <div className="theme-pick-check" style={{ background: t.color }}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg></div>}
                </button>
              ))}
            </div>
            <div className="modal-footer" style={{ marginTop: 20 }}>
              <button className="btn-ghost" onClick={() => setStep('name')}>Back</button>
              <button className="btn-primary" style={{ padding: '11px 28px' }} onClick={createProject}>Create Project</button>
            </div>
          </div>
        </div>
      )}

      {/* RENAME */}
      {renameTarget && (
        <div className="modal-overlay" onClick={() => setRenameTarget(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Rename Project</span>
              <button className="modal-close" onClick={() => setRenameTarget(null)}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
            </div>
            <input className="modal-input" autoFocus value={renameVal} onChange={e => setRenameVal(e.target.value)} onKeyDown={e => e.key === 'Enter' && renameProject()} />
            <div className="modal-footer">
              <button className="btn-ghost" onClick={() => setRenameTarget(null)}>Cancel</button>
              <button className="btn-primary" style={{ padding: '10px 22px' }} onClick={renameProject}>Save</button>
            </div>
          </div>
        </div>
      )}

      {/* PRE-BUILT TEMPLATE */}
      {templateModal && (
        <div className="modal-overlay" onClick={() => setTemplateModal(false)}>
          <div className="modal-box" style={{ maxWidth: 600 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Pre-built Template</span>
              <button className="modal-close" onClick={() => setTemplateModal(false)}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
            </div>
            <p style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 20 }}>Pre-created canvases with boxes and layout — just edit the content.</p>
            <div className="template-grid">
              {TEMPLATES.map(t => (
                <button key={t.id} className="template-card" onClick={() => createFromTemplate(t)}>
                  <div className="template-icon">{t.icon}</div>
                  <div className="template-name">{t.name}</div>
                  <div className="template-desc">{t.description}</div>
                  <div className="template-meta">{Object.keys(t.nodes).length} pre-built nodes</div>
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
