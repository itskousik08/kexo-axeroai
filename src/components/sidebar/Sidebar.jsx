import React, { useState, useEffect } from 'react';
import { useApp } from '../../store/AppContext';
import { TEMPLATES } from '../../utils/templates';
import './Sidebar.css';

export default function Sidebar() {
  const { state, actions } = useApp();
  const [collapsed, setCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('nodes'); // 'nodes' | 'templates'

  // Listen for toggle event from header
  useEffect(() => {
    const handler = () => setCollapsed(c => !c);
    window.addEventListener('kexo:toggleSidebar', handler);
    return () => window.removeEventListener('kexo:toggleSidebar', handler);
  }, []);

  const nodes = Object.values(state.nodes);
  const q = state.searchQuery.toLowerCase().trim();
  const filtered = q
    ? nodes.filter(n => n.title?.toLowerCase().includes(q) || n.desc?.toLowerCase().includes(q))
    : nodes;

  const typeColors = {
    note: 'var(--green)', concept: 'var(--accent)', question: 'var(--violet)',
    image: 'var(--blue)', code: 'var(--rose)', link: 'var(--blue)',
    voice: 'var(--violet)', snapshot: 'var(--accent)',
  };

  const typeIcons = {
    note: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>,
    concept: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="4"/><path d="M12 8v8M8 12h8"/></svg>,
    question: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
    image: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>,
    code: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>,
    link: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>,
    voice: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/></svg>,
  };

  const scrollToNode = (id) => {
    actions.selectNode(id);
    const el = document.getElementById(id);
    const scroll = document.getElementById('canvasScroll');
    if (el && scroll) {
      const n = state.nodes[id];
      scroll.scrollTo({ left: Math.max(0, n.x * state.zoom - 200), top: Math.max(0, n.y * state.zoom - 100), behavior: 'smooth' });
    }
  };

  return (
    <aside className={`sidebar${collapsed ? ' sidebar--collapsed' : ''}`} id="kexo-sidebar">
      <div className="sidebar-toggle" onClick={() => setCollapsed(c => !c)}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          {collapsed
            ? <><path d="M9 18l6-6-6-6"/></>
            : <><path d="M15 18l-6-6 6-6"/></>}
        </svg>
      </div>

      {!collapsed && (
        <>
          <div className="sidebar-tabs">
            <button className={`sb-tab${activeTab === 'nodes' ? ' active' : ''}`} onClick={() => setActiveTab('nodes')}>
              Nodes <span className="sb-count">{nodes.length}</span>
            </button>
            <button className={`sb-tab${activeTab === 'templates' ? ' active' : ''}`} onClick={() => setActiveTab('templates')}>
              Templates
            </button>
          </div>

          {activeTab === 'nodes' && (
            <div className="sidebar-nodes">
              {filtered.length === 0 && (
                <div className="sb-empty">
                  {q ? 'No matches' : 'No nodes yet — add some from the bar below'}
                </div>
              )}
              {filtered.map(n => (
                <button key={n.id} className={`sb-node${state.selectedNode === n.id ? ' sb-node--selected' : ''}`} onClick={() => scrollToNode(n.id)}>
                  <span className="sb-node-type" style={{ color: typeColors[n.type] || 'var(--text3)' }}>
                    {typeIcons[n.type] || typeIcons.note}
                  </span>
                  <span className="sb-node-title">{n.title || 'Untitled'}</span>
                  <button className="sb-node-del" onClick={(e) => { e.stopPropagation(); actions.deleteNode(n.id); }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                </button>
              ))}
            </div>
          )}

          {activeTab === 'templates' && (
            <div className="sidebar-templates">
              <p className="sb-template-hint">Load a pre-built template into your canvas</p>
              {TEMPLATES.map(t => (
                <button key={t.id} className="sb-template-btn" onClick={() => actions.loadTemplate(t)}>
                  <span className="sb-template-icon">{t.icon}</span>
                  <div>
                    <div className="sb-template-name">{t.name}</div>
                    <div className="sb-template-meta">{Object.keys(t.nodes).length} nodes</div>
                  </div>
                </button>
              ))}
            </div>
          )}

          <div className="sidebar-footer">
            <div className="sb-stats">
              <span>{nodes.length} node{nodes.length !== 1 ? 's' : ''}</span>
              <span>·</span>
              <span>{state.connections.length} link{state.connections.length !== 1 ? 's' : ''}</span>
            </div>
          </div>
        </>
      )}
    </aside>
  );
}
