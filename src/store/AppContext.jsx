import React, { createContext, useContext, useReducer, useCallback, useEffect, useRef } from 'react';
import { debounce } from '../utils/helpers';

// ─── INITIAL STATE ───────────────────────────────────────────────────────────
const mkInitialState = () => ({
  // Canvas data
  nodes: {},
  connections: [],
  nextNodeId: 1,
  nextConnId: 1,
  notes: '',

  // Canvas UI
  zoom: 1,
  gridVisible: true,
  selectedNode: null,
  selectedConnection: null,
  connectMode: false,
  connectSource: null,
  unlinkFirstNode: null,
  searchQuery: '',
  selectedNodes: [], // bulk select

  // Undo/Redo
  undoStack: [],
  redoStack: [],

  // Save status
  saveStatus: 'saved', // 'saving' | 'saved'
  lastSavedAt: null,

  // Projects
  projects: [],
  activeProjectId: null,

  // Theme
  theme: 'dark',

  // Tags filter
  activeTagFilter: null,

  // AI panel
  aiPanelOpen: false,

  // Share panel
  sharePanelOpen: false,
});

// ─── REDUCER ─────────────────────────────────────────────────────────────────
function reducer(state, action) {
  switch (action.type) {

    case 'SET_THEME':
      return { ...state, theme: action.theme };

    case 'SET_PROJECT':
      return { ...state, activeProjectId: action.id, ...action.canvasData };

    case 'SET_PROJECTS':
      return { ...state, projects: action.projects };

    case 'SET_NODES':
      return { ...state, nodes: action.nodes };

    case 'SET_CONNECTIONS':
      return { ...state, connections: action.connections };

    case 'SET_NOTES':
      return { ...state, notes: action.notes };

    case 'PUSH_UNDO': {
      const snap = JSON.stringify({ nodes: state.nodes, connections: state.connections });
      return {
        ...state,
        undoStack: [...state.undoStack.slice(-49), snap],
        redoStack: [],
      };
    }

    case 'UNDO': {
      if (!state.undoStack.length) return state;
      const snap = JSON.parse(state.undoStack[state.undoStack.length - 1]);
      const currentSnap = JSON.stringify({ nodes: state.nodes, connections: state.connections });
      return {
        ...state,
        nodes: snap.nodes,
        connections: snap.connections,
        undoStack: state.undoStack.slice(0, -1),
        redoStack: [...state.redoStack, currentSnap],
      };
    }

    case 'REDO': {
      if (!state.redoStack.length) return state;
      const snap = JSON.parse(state.redoStack[state.redoStack.length - 1]);
      const currentSnap = JSON.stringify({ nodes: state.nodes, connections: state.connections });
      return {
        ...state,
        nodes: snap.nodes,
        connections: snap.connections,
        redoStack: state.redoStack.slice(0, -1),
        undoStack: [...state.undoStack, currentSnap],
      };
    }

    case 'ADD_NODE': {
      const { node } = action;
      return { ...state, nodes: { ...state.nodes, [node.id]: node } };
    }

    case 'UPDATE_NODE': {
      const existing = state.nodes[action.id];
      if (!existing) return state;
      return { ...state, nodes: { ...state.nodes, [action.id]: { ...existing, ...action.patch } } };
    }

    case 'DELETE_NODE': {
      const nodes = { ...state.nodes };
      delete nodes[action.id];
      const connections = state.connections.filter(c => c.from !== action.id && c.to !== action.id);
      return {
        ...state, nodes, connections,
        selectedNode: state.selectedNode === action.id ? null : state.selectedNode,
      };
    }

    case 'ADD_CONNECTION':
      return { ...state, connections: [...state.connections, action.conn] };

    case 'DELETE_CONNECTION':
      return { ...state, connections: state.connections.filter(c => c.id !== action.id), selectedConnection: null };

    case 'SET_ZOOM':
      return { ...state, zoom: Math.max(0.25, Math.min(2, action.zoom)) };

    case 'SET_SELECTED_NODE':
      return { ...state, selectedNode: action.id };

    case 'SET_SELECTED_CONNECTION':
      return { ...state, selectedConnection: action.id };

    case 'DESELECT_ALL':
      return { ...state, selectedNode: null, selectedConnection: null };

    case 'SET_CONNECT_MODE':
      return { ...state, connectMode: action.active, connectSource: action.source || null };

    case 'SET_UNLINK_FIRST':
      return { ...state, unlinkFirstNode: action.id };

    case 'TOGGLE_GRID':
      return { ...state, gridVisible: !state.gridVisible };

    case 'SET_SEARCH':
      return { ...state, searchQuery: action.query };

    case 'SET_TAG_FILTER':
      return { ...state, activeTagFilter: action.tag };

    case 'SET_SELECTED_NODES':
      return { ...state, selectedNodes: action.ids };

    case 'SET_SAVE_STATUS':
      return { ...state, saveStatus: action.status, lastSavedAt: action.status === 'saved' ? Date.now() : state.lastSavedAt };

    case 'TOGGLE_AI_PANEL':
      return { ...state, aiPanelOpen: !state.aiPanelOpen };

    case 'TOGGLE_SHARE_PANEL':
      return { ...state, sharePanelOpen: !state.sharePanelOpen };

    case 'SET_NEXT_IDS':
      return { ...state, nextNodeId: action.nodeId, nextConnId: action.connId };

    default:
      return state;
  }
}

// ─── CONTEXT ─────────────────────────────────────────────────────────────────
const AppCtx = createContext(null);
export const useApp = () => useContext(AppCtx);

// ─── STORAGE HELPERS ─────────────────────────────────────────────────────────
function storageKey(k, projectId) { return `kexo_${k}_${projectId}`; }

function loadProjects() {
  try { return JSON.parse(localStorage.getItem('kexo_projects') || '[]'); } catch { return []; }
}

function saveProjects(projects) {
  try { localStorage.setItem('kexo_projects', JSON.stringify(projects)); } catch {}
}

function loadCanvasData(projectId) {
  try {
    const nodes = JSON.parse(localStorage.getItem(storageKey('nodes', projectId)) || '{}');
    const connections = JSON.parse(localStorage.getItem(storageKey('connections', projectId)) || '[]');
    const notes = localStorage.getItem(storageKey('notes', projectId)) || '';
    const nextNodeId = parseInt(localStorage.getItem(storageKey('nextNodeId', projectId)) || '1');
    const nextConnId = parseInt(localStorage.getItem(storageKey('nextConnId', projectId)) || '1');
    return { nodes, connections, notes, nextNodeId, nextConnId };
  } catch { return { nodes: {}, connections: [], notes: '', nextNodeId: 1, nextConnId: 1 }; }
}

function persistCanvasData(projectId, state) {
  try {
    localStorage.setItem(storageKey('nodes', projectId), JSON.stringify(state.nodes));
    localStorage.setItem(storageKey('connections', projectId), JSON.stringify(state.connections));
    localStorage.setItem(storageKey('notes', projectId), state.notes);
    localStorage.setItem(storageKey('nextNodeId', projectId), String(state.nextNodeId));
    localStorage.setItem(storageKey('nextConnId', projectId), String(state.nextConnId));

    // update project timestamp
    const projects = loadProjects();
    const p = projects.find(x => x.id === projectId);
    if (p) { p.updatedAt = Date.now(); p.nodeCount = Object.keys(state.nodes).length; saveProjects(projects); }
  } catch {}
}

// ─── PROVIDER ────────────────────────────────────────────────────────────────
export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, mkInitialState());
  const stateRef = useRef(state);
  stateRef.current = state;

  // Toast system
  const [toast, setToast] = React.useState({ msg: '', show: false });
  const toastTimerRef = useRef(null);
  const showToast = useCallback((msg) => {
    setToast({ msg, show: true });
    clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToast(t => ({ ...t, show: false })), 2400);
  }, []);

  // ── Bootstrap ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const savedTheme = localStorage.getItem('kexo_theme') || 'dark';
    dispatch({ type: 'SET_THEME', theme: savedTheme });
    document.body.classList.toggle('light-mode', savedTheme === 'light');

    const projects = loadProjects();
    dispatch({ type: 'SET_PROJECTS', projects });
  }, []);

  // ── Apply theme class ──────────────────────────────────────────────────────
  useEffect(() => {
    document.body.classList.toggle('light-mode', state.theme === 'light');
    localStorage.setItem('kexo_theme', state.theme);
  }, [state.theme]);

  // ── Debounced save ─────────────────────────────────────────────────────────
  const debouncedSave = useCallback(
    debounce((projectId, s) => {
      persistCanvasData(projectId, s);
      dispatch({ type: 'SET_SAVE_STATUS', status: 'saved' });
    }, 800),
    []
  );

  useEffect(() => {
    if (!state.activeProjectId) return;
    dispatch({ type: 'SET_SAVE_STATUS', status: 'saving' });
    debouncedSave(state.activeProjectId, state);
  }, [state.nodes, state.connections, state.notes, state.activeProjectId]);

  // ── Actions ────────────────────────────────────────────────────────────────
  const actions = {

    // Projects
    loadProject: useCallback((projectId) => {
      const data = loadCanvasData(projectId);
      dispatch({ type: 'SET_PROJECT', id: projectId, canvasData: { ...data, activeProjectId: projectId } });
      dispatch({ type: 'SET_NEXT_IDS', nodeId: data.nextNodeId, connId: data.nextConnId });
    }, []),

    saveProject: useCallback((project) => {
      const projects = loadProjects();
      const idx = projects.findIndex(p => p.id === project.id);
      if (idx >= 0) projects[idx] = { ...projects[idx], ...project };
      else projects.push(project);
      saveProjects(projects);
      dispatch({ type: 'SET_PROJECTS', projects });
    }, []),

    deleteProject: useCallback((id) => {
      const projects = loadProjects().filter(p => p.id !== id);
      saveProjects(projects);
      // clean up storage keys
      ['nodes','connections','notes','nextNodeId','nextConnId','drawing'].forEach(k => {
        try { localStorage.removeItem(storageKey(k, id)); } catch {}
      });
      dispatch({ type: 'SET_PROJECTS', projects });
    }, []),

    // Theme
    toggleTheme: useCallback(() => {
      const next = stateRef.current.theme === 'dark' ? 'light' : 'dark';
      dispatch({ type: 'SET_THEME', theme: next });
      showToast(next === 'light' ? '☀️ Light mode' : '🌙 Dark mode');
    }, [showToast]),

    // Nodes
    addNode: useCallback((type = 'concept', title = '', desc = '', timestamp = 0, imageUrl = null, extraProps = {}) => {
      const s = stateRef.current;
      dispatch({ type: 'PUSH_UNDO' });
      const id = 'node_' + s.nextNodeId;
      const scroll = document.getElementById('canvasScroll');
      const x = scroll ? (scroll.scrollLeft / s.zoom) + 60 + Math.random() * 140 : 200;
      const y = scroll ? (scroll.scrollTop / s.zoom) + 60 + Math.random() * 140 : 200;
      const node = {
        id, type,
        title: title || ({ concept: 'New Concept', question: 'New Question', note: 'New Note', snapshot: 'Video Snapshot' }[type] || 'Node'),
        desc, x, y, w: 240, timestamp, imageUrl, color: 'default',
        tags: [], audioData: null,
        ...extraProps,
      };
      dispatch({ type: 'ADD_NODE', node });
      dispatch({ type: 'SET_NEXT_IDS', nodeId: s.nextNodeId + 1, connId: s.nextConnId });
      return id;
    }, []),

    duplicateNode: useCallback((id) => {
      const s = stateRef.current;
      const src = s.nodes[id];
      if (!src) return;
      dispatch({ type: 'PUSH_UNDO' });
      const newId = 'node_' + s.nextNodeId;
      const node = { ...src, id: newId, x: src.x + 30, y: src.y + 30 };
      dispatch({ type: 'ADD_NODE', node });
      dispatch({ type: 'SET_NEXT_IDS', nodeId: s.nextNodeId + 1, connId: s.nextConnId });
      showToast('Node duplicated');
    }, [showToast]),

    updateNode: useCallback((id, patch) => {
      dispatch({ type: 'UPDATE_NODE', id, patch });
    }, []),

    deleteNode: useCallback((id) => {
      dispatch({ type: 'PUSH_UNDO' });
      dispatch({ type: 'DELETE_NODE', id });
      showToast('Node deleted');
    }, [showToast]),

    setNodeColor: useCallback((id, color) => {
      dispatch({ type: 'PUSH_UNDO' });
      dispatch({ type: 'UPDATE_NODE', id, patch: { color } });
    }, []),

    addTagToNode: useCallback((id, tag) => {
      const s = stateRef.current;
      const node = s.nodes[id];
      if (!node) return;
      const tags = [...new Set([...(node.tags || []), tag.trim()])].filter(Boolean);
      dispatch({ type: 'UPDATE_NODE', id, patch: { tags } });
    }, []),

    removeTagFromNode: useCallback((id, tag) => {
      const s = stateRef.current;
      const node = s.nodes[id];
      if (!node) return;
      dispatch({ type: 'UPDATE_NODE', id, patch: { tags: (node.tags || []).filter(t => t !== tag) } });
    }, []),

    // Connections
    createConnection: useCallback((fromId, fromSide, toId, toSide) => {
      const s = stateRef.current;
      const dup = s.connections.find(c =>
        (c.from === fromId && c.to === toId) || (c.from === toId && c.to === fromId));
      if (dup) { showToast('Already connected'); return; }
      dispatch({ type: 'PUSH_UNDO' });
      const connId = 'conn_' + s.nextConnId;
      dispatch({ type: 'ADD_CONNECTION', conn: { id: connId, from: fromId, fromSide, to: toId, toSide } });
      dispatch({ type: 'SET_NEXT_IDS', nodeId: s.nextNodeId, connId: s.nextConnId + 1 });
    }, [showToast]),

    deleteConnection: useCallback((id) => {
      dispatch({ type: 'PUSH_UNDO' });
      dispatch({ type: 'DELETE_CONNECTION', id });
      showToast('Connection removed');
    }, [showToast]),

    // Undo/Redo
    undo: useCallback(() => {
      dispatch({ type: 'UNDO' });
      showToast('Undo');
    }, [showToast]),
    redo: useCallback(() => {
      dispatch({ type: 'REDO' });
      showToast('Redo');
    }, [showToast]),

    // Zoom
    setZoom: useCallback((z) => dispatch({ type: 'SET_ZOOM', zoom: z }), []),
    zoomIn: useCallback(() => dispatch({ type: 'SET_ZOOM', zoom: stateRef.current.zoom + 0.1 }), []),
    zoomOut: useCallback(() => dispatch({ type: 'SET_ZOOM', zoom: stateRef.current.zoom - 0.1 }), []),
    resetZoom: useCallback(() => dispatch({ type: 'SET_ZOOM', zoom: 1 }), []),

    // Selection
    selectNode: useCallback((id) => dispatch({ type: 'SET_SELECTED_NODE', id }), []),
    deselectAll: useCallback(() => dispatch({ type: 'DESELECT_ALL' }), []),
    selectConnection: useCallback((id) => dispatch({ type: 'SET_SELECTED_CONNECTION', id }), []),

    // Connect mode
    startConnect: useCallback((id) => {
      const s = stateRef.current;
      if (s.connectMode && s.connectSource === id) {
        dispatch({ type: 'SET_CONNECT_MODE', active: false });
      } else {
        dispatch({ type: 'SET_CONNECT_MODE', active: true, source: id });
      }
    }, []),
    cancelConnect: useCallback(() => dispatch({ type: 'SET_CONNECT_MODE', active: false }), []),

    // Unlink
    enterUnlinkMode: useCallback((nodeId) => {
      const s = stateRef.current;
      if (s.unlinkFirstNode === nodeId) {
        dispatch({ type: 'SET_UNLINK_FIRST', id: null });
        return;
      }
      if (s.unlinkFirstNode) {
        const conn = s.connections.find(c =>
          (c.from === s.unlinkFirstNode && c.to === nodeId) ||
          (c.from === nodeId && c.to === s.unlinkFirstNode));
        if (!conn) { showToast('These nodes are not connected'); }
        else {
          dispatch({ type: 'PUSH_UNDO' });
          dispatch({ type: 'DELETE_CONNECTION', id: conn.id });
          showToast('Connection removed');
        }
        dispatch({ type: 'SET_UNLINK_FIRST', id: null });
        return;
      }
      const nodeConns = s.connections.filter(c => c.from === nodeId || c.to === nodeId);
      if (!nodeConns.length) { showToast('No connections on this node'); return; }
      dispatch({ type: 'SET_UNLINK_FIRST', id: nodeId });
      showToast('Click "Unlink" on a connected node');
    }, [showToast]),

    exitUnlinkMode: useCallback(() => dispatch({ type: 'SET_UNLINK_FIRST', id: null }), []),

    // Grid
    toggleGrid: useCallback(() => dispatch({ type: 'TOGGLE_GRID' }), []),

    // Search
    setSearch: useCallback((q) => dispatch({ type: 'SET_SEARCH', query: q }), []),

    // Tag filter
    setTagFilter: useCallback((tag) => dispatch({ type: 'SET_TAG_FILTER', tag }), []),

    // Bulk select
    setSelectedNodes: useCallback((ids) => dispatch({ type: 'SET_SELECTED_NODES', ids }), []),

    // AI Panel
    toggleAIPanel: useCallback(() => dispatch({ type: 'TOGGLE_AI_PANEL' }), []),

    // Share Panel
    toggleSharePanel: useCallback(() => dispatch({ type: 'TOGGLE_SHARE_PANEL' }), []),

    // Notes
    setNotes: useCallback((notes) => dispatch({ type: 'SET_NOTES', notes }), []),

    // Load from template
    loadTemplate: useCallback((template) => {
      dispatch({ type: 'PUSH_UNDO' });
      dispatch({ type: 'SET_NODES', nodes: template.nodes });
      dispatch({ type: 'SET_CONNECTIONS', connections: template.connections });
      dispatch({ type: 'SET_NEXT_IDS', nodeId: template.nextNodeId, connId: template.nextConnId });
      showToast(`Loaded template: ${template.name}`);
    }, [showToast]),

    showToast,
  };

  return (
    <AppCtx.Provider value={{ state, dispatch, actions, toast }}>
      {children}
    </AppCtx.Provider>
  );
}
