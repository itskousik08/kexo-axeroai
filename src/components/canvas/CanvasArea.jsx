import React, { useRef, useEffect, useCallback, useState } from 'react';
import { useApp } from '../../store/AppContext';
import CanvasNode from './CanvasNode';
import Minimap from './Minimap';
import { buildPath, getConnectorPos } from '../../utils/helpers';
import './Canvas.css';

export default function CanvasArea() {
  const { state, actions } = useApp();
  const scrollRef = useRef(null);
  const svgRef = useRef(null);
  const [fabOpen, setFabOpen] = useState(false);
  const [spaceDown, setSpaceDown] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const panRef = useRef({});
  const [tempPath, setTempPath] = useState(null);
  const [connDragSrc, setConnDragSrc] = useState(null);
  const connDragRef = useRef(null);
  const [selectedConnId, setSelectedConnId] = useState(null);
  const [connDeleteBtn, setConnDeleteBtn] = useState(null);
  // Bulk select
  const [dragBox, setDragBox] = useState(null);
  const dragBoxRef = useRef(null);

  // Forward scroll ref to window for minimap
  useEffect(() => { window._kexoScrollRef = scrollRef; }, []);

  // Space key for panning
  useEffect(() => {
    const dn = (e) => {
      if (e.code === 'Space' && !e.target.closest('[contenteditable],input,textarea')) {
        e.preventDefault(); setSpaceDown(true);
        if (scrollRef.current) scrollRef.current.style.cursor = 'grab';
      }
    };
    const up = (e) => {
      if (e.code === 'Space') {
        setSpaceDown(false);
        if (scrollRef.current) scrollRef.current.style.cursor = '';
      }
    };
    window.addEventListener('keydown', dn);
    window.addEventListener('keyup', up);
    return () => { window.removeEventListener('keydown', dn); window.removeEventListener('keyup', up); };
  }, []);

  // Export canvas event
  useEffect(() => {
    const handler = async () => {
      actions.showToast('Preparing export…');
      try {
        const { default: html2canvas } = await import('html2canvas');
        const target = document.getElementById('canvasInfinite');
        const canvas = await html2canvas(target, { backgroundColor: '#0f0f11', scale: 1.5, useCORS: true, allowTaint: true, logging: false });
        const a = document.createElement('a');
        a.download = `kexo-canvas-${Date.now()}.png`; a.href = canvas.toDataURL('image/png'); a.click();
        actions.showToast('Canvas exported!');
      } catch (e) { actions.showToast('Export failed'); }
    };
    window.addEventListener('kexo:exportCanvas', handler);
    return () => window.removeEventListener('kexo:exportCanvas', handler);
  }, []);

  // Sidebar toggle event
  useEffect(() => {
    const handler = () => {
      const sb = document.getElementById('kexo-sidebar');
      if (sb) sb.classList.toggle('collapsed');
    };
    window.addEventListener('kexo:toggleSidebar', handler);
    return () => window.removeEventListener('kexo:toggleSidebar', handler);
  }, []);

  // Scroll → minimap
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const h = () => window.dispatchEvent(new Event('kexo:minimapUpdate'));
    el.addEventListener('scroll', h);
    return () => el.removeEventListener('scroll', h);
  }, []);

  // Pan handlers
  const onScrollMouseDown = (e) => {
    if (!spaceDown) return;
    setIsPanning(true);
    panRef.current = { startX: e.clientX, startY: e.clientY, scrollLeft: scrollRef.current.scrollLeft, scrollTop: scrollRef.current.scrollTop };
    scrollRef.current.style.cursor = 'grabbing';
    e.preventDefault();
  };
  useEffect(() => {
    const mv = (e) => {
      if (!isPanning || !scrollRef.current) return;
      const { startX, startY, scrollLeft, scrollTop } = panRef.current;
      scrollRef.current.scrollLeft = scrollLeft - (e.clientX - startX);
      scrollRef.current.scrollTop  = scrollTop  - (e.clientY - startY);
    };
    const up = () => {
      if (isPanning) { setIsPanning(false); if (scrollRef.current) scrollRef.current.style.cursor = spaceDown ? 'grab' : ''; }
    };
    window.addEventListener('mousemove', mv);
    window.addEventListener('mouseup', up);
    return () => { window.removeEventListener('mousemove', mv); window.removeEventListener('mouseup', up); };
  }, [isPanning, spaceDown]);

  // Ctrl+wheel zoom
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const handler = (e) => {
      if (e.ctrlKey || e.metaKey) { e.preventDefault(); actions.setZoom(state.zoom - e.deltaY * 0.001); }
    };
    el.addEventListener('wheel', handler, { passive: false });
    return () => el.removeEventListener('wheel', handler);
  }, [state.zoom]);

  // Apply zoom transform
  useEffect(() => {
    const t = document.getElementById('canvasTransform');
    if (t) t.style.transform = `scale(${state.zoom})`;
    window.dispatchEvent(new Event('kexo:minimapUpdate'));
  }, [state.zoom]);

  // ── Connector drag (SVG temp path) ────────────────────────────────────────
  const onConnectorDown = useCallback((e, nodeId, side) => {
    e.stopPropagation(); e.preventDefault();
    connDragRef.current = { nodeId, side };
    setConnDragSrc({ nodeId, side });
    const mv = (ev) => {
      const inf = document.getElementById('canvasInfinite');
      if (!inf) return;
      const rect = inf.getBoundingClientRect();
      const tx = (ev.clientX - rect.left) / state.zoom;
      const ty = (ev.clientY - rect.top) / state.zoom;
      const n = state.nodes[nodeId];
      if (!n) return;
      const el = document.getElementById(nodeId);
      const sp = getConnectorPos(n, side, el);
      setTempPath(buildPath(sp.x, sp.y, tx, ty, side, 'auto'));
    };
    const up = (ev) => {
      window.removeEventListener('mousemove', mv);
      window.removeEventListener('mouseup', up);
      setTempPath(null); setConnDragSrc(null);
      const target = document.elementFromPoint(ev.clientX, ev.clientY);
      if (target?.classList.contains('connector-dot')) {
        const toNode = target.dataset.node, toSide = target.dataset.side;
        if (toNode && toNode !== nodeId) actions.createConnection(nodeId, side, toNode, toSide);
      }
      connDragRef.current = null;
    };
    window.addEventListener('mousemove', mv);
    window.addEventListener('mouseup', up);
  }, [state.nodes, state.zoom]);

  // ── Canvas click deselect ─────────────────────────────────────────────────
  const onCanvasClick = (e) => {
    if (e.target === e.currentTarget || e.target.id === 'connectionsSvg' || e.target.closest('.connections-svg')) {
      actions.deselectAll();
      if (state.connectMode) actions.cancelConnect();
      if (state.unlinkFirstNode) actions.exitUnlinkMode();
      setSelectedConnId(null);
      setConnDeleteBtn(null);
    }
  };

  // ── Build connections SVG ─────────────────────────────────────────────────
  const renderConnections = () => {
    return state.connections
      .filter(c => state.nodes[c.from] && state.nodes[c.to])
      .map(c => {
        const nFrom = state.nodes[c.from], nTo = state.nodes[c.to];
        const elFrom = document.getElementById(c.from), elTo = document.getElementById(c.to);
        const sp = getConnectorPos(nFrom, c.fromSide, elFrom);
        const ep = getConnectorPos(nTo, c.toSide, elTo);
        const isHl = state.unlinkFirstNode && (c.from === state.unlinkFirstNode || c.to === state.unlinkFirstNode);
        return (
          <path
            key={c.id}
            className={`connection-path${selectedConnId === c.id ? ' selected' : ''}${isHl ? ' unlink-hl' : ''}`}
            d={buildPath(sp.x, sp.y, ep.x, ep.y, c.fromSide, c.toSide)}
            data-conn-id={c.id}
            onClick={(e) => { e.stopPropagation(); setSelectedConnId(c.id); setConnDeleteBtn({ id: c.id, x: e.clientX, y: e.clientY }); }}
            onDoubleClick={(e) => { e.stopPropagation(); actions.deleteConnection(c.id); setConnDeleteBtn(null); setSelectedConnId(null); }}
          />
        );
      });
  };

  // Visible node ids based on search
  const getNodeClass = (n) => {
    const q = state.searchQuery.toLowerCase().trim();
    if (!q) return '';
    const matches = n.title?.toLowerCase().includes(q) || n.desc?.toLowerCase().includes(q) || (n.tags || []).some(t => t.toLowerCase().includes(q));
    return matches ? 'search-match' : 'search-hidden';
  };

  // Tag filter
  const isTagFiltered = (n) => {
    if (!state.activeTagFilter) return false;
    return !(n.tags || []).includes(state.activeTagFilter);
  };

  const addNode = (type) => { actions.addNode(type); setFabOpen(false); };

  return (
    <main className="canvas-area">
      {/* Canvas Controls */}
      <div className="canvas-controls">
        <button onClick={actions.zoomIn} className="ctrl-btn" title="Zoom In">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
        </button>
        <span className="zoom-label">{Math.round(state.zoom * 100)}%</span>
        <button onClick={actions.zoomOut} className="ctrl-btn" title="Zoom Out">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
        </button>
        <div className="ctrl-divider"/>
        <button onClick={actions.resetZoom} className="ctrl-btn" title="Reset View">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
        </button>
        <button onClick={actions.toggleGrid} className={`ctrl-btn${state.gridVisible ? ' active-ctrl' : ''}`} title="Toggle Grid">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
        </button>
      </div>

      {/* Undo/Redo */}
      <div className="undo-controls">
        <button onClick={actions.undo} className="ctrl-btn" disabled={!state.undoStack.length} title="Undo (Ctrl+Z)">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/></svg>
        </button>
        <button onClick={actions.redo} className="ctrl-btn" disabled={!state.redoStack.length} title="Redo (Ctrl+Y)">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 7v6h-6"/><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3L21 13"/></svg>
        </button>
      </div>

      {/* Scrollable canvas */}
      <div
        className="canvas-scroll" id="canvasScroll" ref={scrollRef}
        onMouseDown={onScrollMouseDown}
      >
        <div className="canvas-transform" id="canvasTransform">
          <div
            className={`canvas-infinite${state.gridVisible ? ' grid-lines' : ''}`}
            id="canvasInfinite"
            onClick={onCanvasClick}
          >
            <svg className="connections-svg connections-layer" id="connectionsSvg" ref={svgRef} xmlns="http://www.w3.org/2000/svg">
              {renderConnections()}
              {tempPath && <path className="connection-path temp" d={tempPath} />}
            </svg>
            <div id="nodesLayer">
              {Object.values(state.nodes).map(n => (
                <CanvasNode
                  key={n.id}
                  node={n}
                  isSelected={state.selectedNode === n.id}
                  isBulkSelected={state.selectedNodes.includes(n.id)}
                  isUnlinkSource={state.unlinkFirstNode === n.id}
                  extraClass={`${getNodeClass(n)}${isTagFiltered(n) ? ' search-hidden' : ''}`}
                  onConnectorDown={onConnectorDown}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* FAB removed — controls now in FloatingBar */}

      {/* Conn delete btn */}
      {connDeleteBtn && (
        <button
          className="conn-delete-btn"
          style={{ left: connDeleteBtn.x, top: connDeleteBtn.y }}
          onClick={() => { actions.deleteConnection(connDeleteBtn.id); setConnDeleteBtn(null); setSelectedConnId(null); }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      )}

      <Minimap scrollRef={scrollRef} />

    </main>
  );
}

// ── Image upload helper ───────────────────────────────────────────────────────
function handleImageUpload(e, actions, state) {
  const file = e.target.files?.[0]; if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => {
    const img = new Image();
    img.onload = () => {
      const w = 300, h = Math.round(w / (img.naturalWidth / img.naturalHeight));
      const scroll = document.getElementById('canvasScroll');
      const x = scroll ? (scroll.scrollLeft / state.zoom) + 60 + Math.random() * 140 : 200;
      const y = scroll ? (scroll.scrollTop / state.zoom) + 60 + Math.random() * 140 : 200;
      const id = actions.addNode('image', 'Image', '', 0, ev.target.result, { isFreeImage: true, w, h, x, y });
    };
    img.src = ev.target.result;
  };
  reader.readAsDataURL(file);
  e.target.value = '';
}

// ── PDF upload helper ─────────────────────────────────────────────────────────
async function handlePdfUpload(e, actions, state) {
  const file = e.target.files?.[0]; if (!file) return;
  const reader = new FileReader();
  reader.onload = async (ev) => {
    try {
      if (typeof pdfjsLib === 'undefined') { actions.showToast('PDF.js not loaded'); return; }
      const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(ev.target.result) }).promise;
      const page = await pdf.getPage(1);
      const viewport = page.getViewport({ scale: 1.5 });
      const canvas = document.createElement('canvas');
      canvas.width = viewport.width; canvas.height = viewport.height;
      await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
      const src = canvas.toDataURL('image/png');
      const w = 300, h = Math.round(300 / (viewport.width / viewport.height));
      const scroll = document.getElementById('canvasScroll');
      const x = scroll ? (scroll.scrollLeft / state.zoom) + 60 + Math.random() * 140 : 200;
      const y = scroll ? (scroll.scrollTop / state.zoom) + 60 + Math.random() * 140 : 200;
      actions.addNode('pdf', file.name, '', 0, src, { isPdfNode: true, w, h, x, y });
    } catch (err) { actions.showToast('PDF error: ' + err.message); }
  };
  reader.readAsArrayBuffer(file);
  e.target.value = '';
}
