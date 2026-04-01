import React, { createContext, useContext, useReducer, useCallback, useEffect, useRef } from 'react';
import { debounce } from '../utils/helpers';

const mkInitialState = () => ({
  nodes: {}, connections: [], nextNodeId: 1, nextConnId: 1, notes: '',
  zoom: 1, gridVisible: true,
  selectedNode: null, selectedConnection: null,
  connectMode: false, connectSource: null,
  unlinkFirstNode: null,
  searchQuery: '',
  selectedNodes: [],
  undoStack: [], redoStack: [],
  saveStatus: 'saved', lastSavedAt: null,
  projects: [],
  activeProjectId: null,
  activeProjectTheme: 'signature', // 'traditional' | 'signature' | 'freecanvas'
  theme: 'auto', // 'auto' | 'dark' | 'light'
  resolvedTheme: 'dark', // actual applied theme
  aiPanelOpen: false,
  sharePanelOpen: false,
  voiceModalOpen: false,
});

function reducer(state, action) {
  switch (action.type) {
    case 'SET_THEME': return { ...state, theme: action.theme, resolvedTheme: action.resolved };
    case 'SET_PROJECT': return { ...state, activeProjectId: action.id, activeProjectTheme: action.theme || 'signature', ...action.canvasData };
    case 'SET_PROJECTS': return { ...state, projects: action.projects };
    case 'SET_NODES': return { ...state, nodes: action.nodes };
    case 'SET_CONNECTIONS': return { ...state, connections: action.connections };
    case 'SET_NOTES': return { ...state, notes: action.notes };
    case 'PUSH_UNDO': {
      const snap = JSON.stringify({ nodes: state.nodes, connections: state.connections });
      return { ...state, undoStack: [...state.undoStack.slice(-49), snap], redoStack: [] };
    }
    case 'UNDO': {
      if (!state.undoStack.length) return state;
      const snap = JSON.parse(state.undoStack[state.undoStack.length - 1]);
      const cur = JSON.stringify({ nodes: state.nodes, connections: state.connections });
      return { ...state, nodes: snap.nodes, connections: snap.connections, undoStack: state.undoStack.slice(0,-1), redoStack: [...state.redoStack, cur] };
    }
    case 'REDO': {
      if (!state.redoStack.length) return state;
      const snap = JSON.parse(state.redoStack[state.redoStack.length - 1]);
      const cur = JSON.stringify({ nodes: state.nodes, connections: state.connections });
      return { ...state, nodes: snap.nodes, connections: snap.connections, redoStack: state.redoStack.slice(0,-1), undoStack: [...state.undoStack, cur] };
    }
    case 'ADD_NODE': return { ...state, nodes: { ...state.nodes, [action.node.id]: action.node } };
    case 'UPDATE_NODE': {
      const ex = state.nodes[action.id]; if (!ex) return state;
      return { ...state, nodes: { ...state.nodes, [action.id]: { ...ex, ...action.patch } } };
    }
    case 'DELETE_NODE': {
      const nodes = { ...state.nodes }; delete nodes[action.id];
      return { ...state, nodes, connections: state.connections.filter(c => c.from !== action.id && c.to !== action.id), selectedNode: state.selectedNode === action.id ? null : state.selectedNode };
    }
    case 'ADD_CONNECTION': return { ...state, connections: [...state.connections, action.conn] };
    case 'DELETE_CONNECTION': return { ...state, connections: state.connections.filter(c => c.id !== action.id), selectedConnection: null };
    case 'SET_ZOOM': return { ...state, zoom: Math.max(0.25, Math.min(2, action.zoom)) };
    case 'SET_SELECTED_NODE': return { ...state, selectedNode: action.id };
    case 'SET_SELECTED_CONNECTION': return { ...state, selectedConnection: action.id };
    case 'DESELECT_ALL': return { ...state, selectedNode: null, selectedConnection: null };
    case 'SET_CONNECT_MODE': return { ...state, connectMode: action.active, connectSource: action.source || null };
    case 'SET_UNLINK_FIRST': return { ...state, unlinkFirstNode: action.id };
    case 'TOGGLE_GRID': return { ...state, gridVisible: !state.gridVisible };
    case 'SET_SEARCH': return { ...state, searchQuery: action.query };
    case 'SET_SELECTED_NODES': return { ...state, selectedNodes: action.ids };
    case 'SET_SAVE_STATUS': return { ...state, saveStatus: action.status, lastSavedAt: action.status === 'saved' ? Date.now() : state.lastSavedAt };
    case 'TOGGLE_AI_PANEL': return { ...state, aiPanelOpen: !state.aiPanelOpen };
    case 'TOGGLE_SHARE_PANEL': return { ...state, sharePanelOpen: !state.sharePanelOpen };
    case 'TOGGLE_VOICE_MODAL': return { ...state, voiceModalOpen: !state.voiceModalOpen };
    case 'SET_NEXT_IDS': return { ...state, nextNodeId: action.nodeId, nextConnId: action.connId };
    default: return state;
  }
}

const AppCtx = createContext(null);
export const useApp = () => useContext(AppCtx);

function storageKey(k, pid) { return `kexo_${k}_${pid}`; }
function loadProjects() { try { return JSON.parse(localStorage.getItem('kexo_projects') || '[]'); } catch { return []; } }
function saveProjects(p) { try { localStorage.setItem('kexo_projects', JSON.stringify(p)); } catch {} }

function loadCanvasData(pid) {
  try {
    return {
      nodes: JSON.parse(localStorage.getItem(storageKey('nodes', pid)) || '{}'),
      connections: JSON.parse(localStorage.getItem(storageKey('connections', pid)) || '[]'),
      notes: localStorage.getItem(storageKey('notes', pid)) || '',
      nextNodeId: parseInt(localStorage.getItem(storageKey('nextNodeId', pid)) || '1'),
      nextConnId: parseInt(localStorage.getItem(storageKey('nextConnId', pid)) || '1'),
    };
  } catch { return { nodes: {}, connections: [], notes: '', nextNodeId: 1, nextConnId: 1 }; }
}

function persistCanvas(pid, state) {
  try {
    localStorage.setItem(storageKey('nodes', pid), JSON.stringify(state.nodes));
    localStorage.setItem(storageKey('connections', pid), JSON.stringify(state.connections));
    localStorage.setItem(storageKey('notes', pid), state.notes);
    localStorage.setItem(storageKey('nextNodeId', pid), String(state.nextNodeId));
    localStorage.setItem(storageKey('nextConnId', pid), String(state.nextConnId));
    const ps = loadProjects();
    const p = ps.find(x => x.id === pid);
    if (p) { p.updatedAt = Date.now(); p.nodeCount = Object.keys(state.nodes).length; saveProjects(ps); }
  } catch {}
}

function resolveTheme(theme) {
  if (theme === 'auto') return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  return theme;
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, mkInitialState());
  const stateRef = useRef(state);
  stateRef.current = state;
  const [toast, setToast] = React.useState({ msg: '', show: false });
  const toastTimer = useRef(null);

  const showToast = useCallback((msg) => {
    setToast({ msg, show: true });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(t => ({ ...t, show: false })), 2400);
  }, []);

  // Bootstrap
  useEffect(() => {
    const savedTheme = localStorage.getItem('kexo_theme') || 'auto';
    const resolved = resolveTheme(savedTheme);
    dispatch({ type: 'SET_THEME', theme: savedTheme, resolved });
    const ps = loadProjects();
    if (ps.length === 0) {
      const p = { id: 'default', name: 'My First Canvas', theme: 'signature', createdAt: Date.now(), updatedAt: Date.now(), nodeCount: 0, color: 'amber' };
      saveProjects([p]);
      dispatch({ type: 'SET_PROJECTS', projects: [p] });
    } else {
      dispatch({ type: 'SET_PROJECTS', projects: ps });
    }
    // Listen for system theme changes
    const mq = window.matchMedia?.('(prefers-color-scheme: dark)');
    const onMqChange = () => {
      if (stateRef.current.theme === 'auto') {
        dispatch({ type: 'SET_THEME', theme: 'auto', resolved: mq.matches ? 'dark' : 'light' });
      }
    };
    mq?.addEventListener('change', onMqChange);
    return () => mq?.removeEventListener('change', onMqChange);
  }, []);

  // Apply theme class
  useEffect(() => {
    document.body.classList.toggle('light-mode', state.resolvedTheme === 'light');
    localStorage.setItem('kexo_theme', state.theme);
  }, [state.resolvedTheme, state.theme]);

  const debouncedSave = useCallback(debounce((pid, s) => {
    persistCanvas(pid, s);
    dispatch({ type: 'SET_SAVE_STATUS', status: 'saved' });
  }, 800), []);

  useEffect(() => {
    if (!state.activeProjectId) return;
    dispatch({ type: 'SET_SAVE_STATUS', status: 'saving' });
    debouncedSave(state.activeProjectId, state);
  }, [state.nodes, state.connections, state.notes, state.activeProjectId]);

  const actions = {
    loadProject: useCallback((pid) => {
      const data = loadCanvasData(pid);
      const ps = loadProjects();
      const p = ps.find(x => x.id === pid);
      dispatch({ type: 'SET_PROJECT', id: pid, theme: p?.theme || 'signature', canvasData: { ...data, activeProjectId: pid } });
      dispatch({ type: 'SET_NEXT_IDS', nodeId: data.nextNodeId, connId: data.nextConnId });
    }, []),

    saveProject: useCallback((project) => {
      const ps = loadProjects();
      const idx = ps.findIndex(p => p.id === project.id);
      if (idx >= 0) ps[idx] = { ...ps[idx], ...project };
      else ps.push(project);
      saveProjects(ps);
      dispatch({ type: 'SET_PROJECTS', projects: ps });
    }, []),

    deleteProject: useCallback((id) => {
      const ps = loadProjects().filter(p => p.id !== id);
      saveProjects(ps);
      ['nodes','connections','notes','nextNodeId','nextConnId'].forEach(k => {
        try { localStorage.removeItem(storageKey(k, id)); } catch {}
      });
      dispatch({ type: 'SET_PROJECTS', projects: ps });
    }, []),

    setTheme: useCallback((theme) => {
      const resolved = resolveTheme(theme);
      dispatch({ type: 'SET_THEME', theme, resolved });
      showToast(resolved === 'light' ? '☀️ Light mode' : '🌙 Dark mode');
    }, [showToast]),

    addNode: useCallback((type = 'concept', title = '', desc = '', timestamp = 0, imageUrl = null, extraProps = {}) => {
      const s = stateRef.current;
      dispatch({ type: 'PUSH_UNDO' });
      const id = 'node_' + s.nextNodeId;
      const scroll = document.getElementById('canvasScroll');
      const x = extraProps.x ?? (scroll ? (scroll.scrollLeft / s.zoom) + 60 + Math.random()*140 : 200);
      const y = extraProps.y ?? (scroll ? (scroll.scrollTop / s.zoom) + 60 + Math.random()*140 : 200);
      const defaultTitles = { concept:'New Concept', question:'New Question', note:'New Note', snapshot:'Video Snapshot', code:'Code Block', link:'Web Link', voice:'Voice Note', image:'Image' };
      const node = { id, type, title: title || defaultTitles[type] || 'Node', desc, x, y, w: 240, timestamp, imageUrl, color: 'default', audioData: null, ...extraProps };
      dispatch({ type: 'ADD_NODE', node });
      dispatch({ type: 'SET_NEXT_IDS', nodeId: s.nextNodeId + 1, connId: s.nextConnId });
      return id;
    }, []),

    duplicateNode: useCallback((id) => {
      const s = stateRef.current;
      const src = s.nodes[id]; if (!src) return;
      dispatch({ type: 'PUSH_UNDO' });
      const newId = 'node_' + s.nextNodeId;
      dispatch({ type: 'ADD_NODE', node: { ...src, id: newId, x: src.x+30, y: src.y+30 } });
      dispatch({ type: 'SET_NEXT_IDS', nodeId: s.nextNodeId+1, connId: s.nextConnId });
      showToast('Node duplicated');
    }, [showToast]),

    updateNode: useCallback((id, patch) => dispatch({ type: 'UPDATE_NODE', id, patch }), []),
    deleteNode: useCallback((id) => { dispatch({ type: 'PUSH_UNDO' }); dispatch({ type: 'DELETE_NODE', id }); showToast('Node deleted'); }, [showToast]),
    setNodeColor: useCallback((id, color) => { dispatch({ type: 'PUSH_UNDO' }); dispatch({ type: 'UPDATE_NODE', id, patch: { color } }); }, []),

    createConnection: useCallback((fromId, fromSide, toId, toSide) => {
      const s = stateRef.current;
      const dup = s.connections.find(c => (c.from===fromId&&c.to===toId)||(c.from===toId&&c.to===fromId));
      if (dup) { showToast('Already connected'); return; }
      dispatch({ type: 'PUSH_UNDO' });
      const connId = 'conn_' + s.nextConnId;
      dispatch({ type: 'ADD_CONNECTION', conn: { id: connId, from: fromId, fromSide, to: toId, toSide } });
      dispatch({ type: 'SET_NEXT_IDS', nodeId: s.nextNodeId, connId: s.nextConnId+1 });
    }, [showToast]),

    deleteConnection: useCallback((id) => { dispatch({ type: 'PUSH_UNDO' }); dispatch({ type: 'DELETE_CONNECTION', id }); showToast('Connection removed'); }, [showToast]),
    undo: useCallback(() => { dispatch({ type: 'UNDO' }); showToast('Undo'); }, [showToast]),
    redo: useCallback(() => { dispatch({ type: 'REDO' }); showToast('Redo'); }, [showToast]),
    setZoom: useCallback((z) => dispatch({ type: 'SET_ZOOM', zoom: z }), []),
    zoomIn: useCallback(() => dispatch({ type: 'SET_ZOOM', zoom: stateRef.current.zoom+0.1 }), []),
    zoomOut: useCallback(() => dispatch({ type: 'SET_ZOOM', zoom: stateRef.current.zoom-0.1 }), []),
    resetZoom: useCallback(() => dispatch({ type: 'SET_ZOOM', zoom: 1 }), []),
    selectNode: useCallback((id) => dispatch({ type: 'SET_SELECTED_NODE', id }), []),
    deselectAll: useCallback(() => dispatch({ type: 'DESELECT_ALL' }), []),
    selectConnection: useCallback((id) => dispatch({ type: 'SET_SELECTED_CONNECTION', id }), []),
    startConnect: useCallback((id) => {
      const s = stateRef.current;
      if (s.connectMode && s.connectSource===id) dispatch({ type: 'SET_CONNECT_MODE', active: false });
      else dispatch({ type: 'SET_CONNECT_MODE', active: true, source: id });
    }, []),
    cancelConnect: useCallback(() => dispatch({ type: 'SET_CONNECT_MODE', active: false }), []),
    enterUnlinkMode: useCallback((nodeId) => {
      const s = stateRef.current;
      if (s.unlinkFirstNode === nodeId) { dispatch({ type: 'SET_UNLINK_FIRST', id: null }); return; }
      if (s.unlinkFirstNode) {
        const conn = s.connections.find(c => (c.from===s.unlinkFirstNode&&c.to===nodeId)||(c.from===nodeId&&c.to===s.unlinkFirstNode));
        if (!conn) showToast('Not connected');
        else { dispatch({ type: 'PUSH_UNDO' }); dispatch({ type: 'DELETE_CONNECTION', id: conn.id }); showToast('Connection removed'); }
        dispatch({ type: 'SET_UNLINK_FIRST', id: null }); return;
      }
      const nc = s.connections.filter(c => c.from===nodeId||c.to===nodeId);
      if (!nc.length) { showToast('No connections on this node'); return; }
      dispatch({ type: 'SET_UNLINK_FIRST', id: nodeId });
      showToast('Click Unlink on a connected node');
    }, [showToast]),
    exitUnlinkMode: useCallback(() => dispatch({ type: 'SET_UNLINK_FIRST', id: null }), []),
    toggleGrid: useCallback(() => dispatch({ type: 'TOGGLE_GRID' }), []),
    setSearch: useCallback((q) => dispatch({ type: 'SET_SEARCH', query: q }), []),
    setSelectedNodes: useCallback((ids) => dispatch({ type: 'SET_SELECTED_NODES', ids }), []),
    toggleAIPanel: useCallback(() => dispatch({ type: 'TOGGLE_AI_PANEL' }), []),
    toggleSharePanel: useCallback(() => dispatch({ type: 'TOGGLE_SHARE_PANEL' }), []),
    toggleVoiceModal: useCallback(() => dispatch({ type: 'TOGGLE_VOICE_MODAL' }), []),
    setNotes: useCallback((notes) => dispatch({ type: 'SET_NOTES', notes }), []),
    loadTemplate: useCallback((t) => {
      dispatch({ type: 'PUSH_UNDO' });
      dispatch({ type: 'SET_NODES', nodes: t.nodes });
      dispatch({ type: 'SET_CONNECTIONS', connections: t.connections });
      dispatch({ type: 'SET_NEXT_IDS', nodeId: t.nextNodeId, connId: t.nextConnId });
      showToast(`Loaded: ${t.name}`);
    }, [showToast]),
    showToast,
  };

  return (
    <AppCtx.Provider value={{ state, dispatch, actions, toast }}>
      {children}
    </AppCtx.Provider>
  );
}
