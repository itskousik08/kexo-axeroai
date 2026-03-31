import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useApp } from '../../store/AppContext';
import { extractVideoId, formatTime, debounce } from '../../utils/helpers';
import './Sidebar.css';

export default function Sidebar() {
  const { state, actions } = useApp();
  const [collapsed, setCollapsed] = useState(false);
  const [ytUrl, setYtUrl] = useState('');
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoHidden, setVideoHidden] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [npTool, setNpTool] = useState('text');
  const [npColor, setNpColor] = useState('#f5a623');
  const [hlColor, setHlColor] = useState('rgba(255,220,0,0.55)');
  const [eraserSize, setEraserSize] = useState(20);
  const notepadRef = useRef(null);
  const drawCanvasRef = useRef(null);
  const drawCtxRef = useRef(null);
  const isDrawingRef = useRef(false);
  const drawSnapshotRef = useRef(null);
  const drawStartRef = useRef({ x: 0, y: 0 });
  const ytPlayerRef = useRef(null);
  const ytTimerRef = useRef(null);

  // Sidebar toggle
  useEffect(() => {
    const h = () => setCollapsed(c => !c);
    window.addEventListener('kexo:toggleSidebar', h);
    return () => window.removeEventListener('kexo:toggleSidebar', h);
  }, []);

  // T-key timestamp capture
  useEffect(() => {
    const h = () => captureTimestamp();
    window.addEventListener('kexo:captureTimestamp', h);
    return () => window.removeEventListener('kexo:captureTimestamp', h);
  }, [ytPlayerRef.current, videoLoaded]);

  // Jump timestamp
  useEffect(() => {
    const h = (e) => {
      if (ytPlayerRef.current?.seekTo) {
        ytPlayerRef.current.seekTo(e.detail, true);
        ytPlayerRef.current.playVideo?.();
      }
    };
    window.addEventListener('kexo:jumpTimestamp', h);
    return () => window.removeEventListener('kexo:jumpTimestamp', h);
  }, []);

  // Load notes from state
  useEffect(() => {
    if (notepadRef.current && state.notes !== undefined) {
      if (notepadRef.current.innerHTML !== state.notes) {
        notepadRef.current.innerHTML = state.notes;
      }
    }
  }, [state.activeProjectId]);

  // Init drawing canvas
  useEffect(() => {
    initDrawing();
    const wrap = document.getElementById('notepadWrap');
    if (wrap && typeof ResizeObserver !== 'undefined') {
      const ro = new ResizeObserver(resizeDrawCanvas);
      ro.observe(wrap);
      return () => ro.disconnect();
    }
  }, [collapsed, videoHidden]);

  const initDrawing = () => {
    const c = drawCanvasRef.current;
    const wrap = document.getElementById('notepadWrap');
    if (!c || !wrap) return;
    c.width = wrap.clientWidth || 320;
    c.height = wrap.clientHeight || 500;
    const ctx = c.getContext('2d');
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    drawCtxRef.current = ctx;
  };

  const resizeDrawCanvas = () => {
    const c = drawCanvasRef.current;
    const wrap = document.getElementById('notepadWrap');
    if (!c || !wrap) return;
    const tmp = document.createElement('canvas');
    tmp.width = c.width; tmp.height = c.height;
    if (c.width > 0 && c.height > 0) tmp.getContext('2d').drawImage(c, 0, 0);
    c.width = wrap.clientWidth || 320;
    c.height = wrap.clientHeight || 500;
    drawCtxRef.current = c.getContext('2d');
    drawCtxRef.current.lineCap = 'round'; drawCtxRef.current.lineJoin = 'round';
    if (tmp.width > 0) drawCtxRef.current.drawImage(tmp, 0, 0);
  };

  // YT Player init
  const loadVideo = () => {
    const vid = extractVideoId(ytUrl.trim());
    if (!vid) { actions.showToast('Invalid YouTube URL'); return; }
    setVideoLoaded(true);
    const onReady = () => {
      ytTimerRef.current = setInterval(() => {
        if (ytPlayerRef.current?.getCurrentTime) setCurrentTime(Math.floor(ytPlayerRef.current.getCurrentTime()));
      }, 500);
    };
    if (typeof YT === 'undefined') {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      document.head.appendChild(tag);
      window.onYouTubeIframeAPIReady = () => createPlayer(vid, onReady);
    } else {
      createPlayer(vid, onReady);
    }
  };

  const createPlayer = (vid, onReady) => {
    if (ytPlayerRef.current?.loadVideoById) {
      ytPlayerRef.current.loadVideoById(vid); return;
    }
    ytPlayerRef.current = new YT.Player('ytPlayerEl', {
      height: '100%', width: '100%', videoId: vid,
      playerVars: { rel: 0, modestbranding: 1 },
      events: { onReady },
    });
  };

  const captureTimestamp = useCallback(() => {
    const t = ytPlayerRef.current?.getCurrentTime ? Math.floor(ytPlayerRef.current.getCurrentTime()) : 0;
    const vidId = ytPlayerRef.current?.getVideoData?.()?.video_id;
    const thumb = vidId ? `https://img.youtube.com/vi/${vidId}/mqdefault.jpg` : null;
    actions.addNode('snapshot', 'Video Snapshot', 'Captured from video. Click timestamp to jump back.', t, thumb);
    actions.showToast('⏱ Snapshot captured!');
  }, []);

  // Drawing
  const getPos = (e) => {
    const c = drawCanvasRef.current;
    const rect = c.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const applyStyle = (tool) => {
    const ctx = drawCtxRef.current; if (!ctx) return;
    ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
    if (tool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.strokeStyle = 'rgba(0,0,0,1)'; ctx.lineWidth = eraserSize; ctx.lineCap = 'round';
    } else if (tool === 'highlight') {
      ctx.strokeStyle = hlColor; ctx.lineWidth = 18; ctx.lineCap = 'square';
    } else {
      ctx.strokeStyle = npColor; ctx.lineWidth = 2.5; ctx.lineCap = 'round';
    }
  };

  const drawStart = (e) => {
    if (!drawCtxRef.current) return;
    isDrawingRef.current = true;
    const pos = getPos(e);
    drawStartRef.current = pos;
    if (npTool === 'arrow') {
      drawSnapshotRef.current = drawCtxRef.current.getImageData(0, 0, drawCanvasRef.current.width, drawCanvasRef.current.height);
    } else {
      applyStyle(npTool);
      drawCtxRef.current.beginPath();
      drawCtxRef.current.moveTo(pos.x, pos.y);
    }
  };

  const drawMove = (e) => {
    if (!isDrawingRef.current || !drawCtxRef.current) return;
    const pos = getPos(e);
    if (npTool === 'arrow') {
      drawCtxRef.current.putImageData(drawSnapshotRef.current, 0, 0);
      drawArrow(drawStartRef.current.x, drawStartRef.current.y, pos.x, pos.y);
    } else {
      applyStyle(npTool);
      drawCtxRef.current.lineTo(pos.x, pos.y);
      drawCtxRef.current.stroke();
      drawCtxRef.current.beginPath();
      drawCtxRef.current.moveTo(pos.x, pos.y);
    }
  };

  const drawEnd = (e) => {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;
    if (npTool === 'arrow' && e) {
      const pos = getPos(e);
      if (drawSnapshotRef.current) drawCtxRef.current.putImageData(drawSnapshotRef.current, 0, 0);
      drawArrow(drawStartRef.current.x, drawStartRef.current.y, pos.x, pos.y);
      drawSnapshotRef.current = null;
    }
    if (drawCtxRef.current) { drawCtxRef.current.globalCompositeOperation = 'source-over'; drawCtxRef.current.globalAlpha = 1; drawCtxRef.current.beginPath(); }
  };

  const drawArrow = (x1, y1, x2, y2) => {
    const ctx = drawCtxRef.current; if (!ctx) return;
    ctx.save(); ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
    ctx.strokeStyle = npColor; ctx.fillStyle = npColor; ctx.lineWidth = 2.5; ctx.lineCap = 'round';
    const angle = Math.atan2(y2 - y1, x2 - x1), hLen = 14;
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - hLen * Math.cos(angle - Math.PI / 6), y2 - hLen * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(x2 - hLen * Math.cos(angle + Math.PI / 6), y2 - hLen * Math.sin(angle + Math.PI / 6));
    ctx.closePath(); ctx.fill(); ctx.restore();
  };

  const clearDrawing = () => {
    const c = drawCanvasRef.current;
    if (c && drawCtxRef.current) drawCtxRef.current.clearRect(0, 0, c.width, c.height);
  };

  const applyFormat = (cmd) => {
    if (npTool !== 'text') setNpTool('text');
    notepadRef.current?.focus();
    document.execCommand(cmd === 'heading' ? 'formatBlock' : cmd, false, cmd === 'heading' ? 'h4' : null);
  };

  const addSelectionToCanvas = () => {
    const sel = window.getSelection();
    let text = '';
    if (sel?.rangeCount > 0) {
      const r = sel.getRangeAt(0);
      if (notepadRef.current?.contains(r.commonAncestorContainer)) text = sel.toString().trim();
    }
    if (!text) text = notepadRef.current?.innerText?.trim() || '';
    if (!text) { actions.showToast('Select some text first'); return; }
    actions.addNode('note', 'Note', text);
    actions.showToast('Added to canvas');
  };

  const isDrawActive = npTool !== 'text';

  return (
    <aside className={`sidebar${collapsed ? ' collapsed' : ''}`} id="kexo-sidebar">
      {/* VIDEO SECTION */}
      <div className={`video-section${videoHidden ? ' video-hidden' : ''}`}>
        <div className="video-url-row">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--text3)', flexShrink: 0 }}>
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
          </svg>
          <input type="text" className="video-url-input" placeholder="Paste YouTube URL…" value={ytUrl} onChange={e => setYtUrl(e.target.value)} onKeyDown={e => e.key === 'Enter' && loadVideo()} />
          <button className="btn-load-sm" onClick={loadVideo}>Load</button>
        </div>
        <div className="video-wrapper">
          {videoLoaded
            ? <div id="ytPlayerEl" style={{ width: '100%', height: '100%' }} />
            : (
              <div className="video-empty">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.54C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/>
                  <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"/>
                </svg>
                <p>Paste a YouTube URL above</p>
              </div>
            )}
        </div>
        {videoLoaded && (
          <div className="video-controls">
            <span className="timestamp-display">{formatTime(currentTime)}</span>
            <button className="btn-capture" onClick={captureTimestamp}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M6.3 6.3A8 8 0 1 0 17.7 17.7M6.3 17.7A8 8 0 0 1 17.7 6.3"/></svg>
              Capture Timestamp
            </button>
            <span style={{ fontSize: 10, color: 'var(--text3)' }}>or press T</span>
          </div>
        )}
      </div>

      {/* NOTEPAD */}
      <div className="notepad-section">
        <div className="notepad-title-row">
          <span className="section-label">Study Notes</span>
          <div className="notepad-title-actions">
            <button className="np-icon-btn" onClick={() => setVideoHidden(v => !v)}>
              {videoHidden
                ? <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg> Show Video</>
                : <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><line x1="1" y1="1" x2="23" y2="23"/></svg> Hide Video</>}
            </button>
            <button className="notepad-add-btn" onClick={addSelectionToCanvas}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Add to Canvas
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="notepad-toolbar">
          <button className={`fmt-btn tool-btn${npTool === 'text' ? ' active' : ''}`} onClick={() => setNpTool('text')} title="Text">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></svg>
          </button>
          <div className="toolbar-divider"/>
          {npTool === 'text' && (
            <div className="fmt-group">
              {[['bold','B'],['italic','I'],['underline','U'],['heading','H']].map(([cmd, label]) => (
                <button key={cmd} className="fmt-btn" onClick={() => applyFormat(cmd)}><span style={cmd === 'bold' ? { fontWeight: 700 } : cmd === 'italic' ? { fontStyle: 'italic' } : cmd === 'underline' ? { textDecoration: 'underline' } : {}}>{label}</span></button>
              ))}
              <button className="fmt-btn" onClick={() => applyFormat('insertUnorderedList')}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="9" y1="6" x2="20" y2="6"/><line x1="9" y1="12" x2="20" y2="12"/><line x1="9" y1="18" x2="20" y2="18"/><circle cx="4" cy="6" r="1" fill="currentColor"/><circle cx="4" cy="12" r="1" fill="currentColor"/><circle cx="4" cy="18" r="1" fill="currentColor"/></svg>
              </button>
            </div>
          )}
          <div className="toolbar-divider"/>
          {[
            { tool: 'pen', icon: '<path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>' },
            { tool: 'highlight', icon: '<path d="M9 11l-6 6v3h3l6-6"/><path d="M22 4l-3 3L9 17l-1 1-3-3 1-1L16 5l3-3 3 2z"/>' },
            { tool: 'eraser', icon: '<path d="M20 20H7L3 16l10-10 7 7-3.5 3.5"/><path d="M6.5 17.5l3-3"/>' },
            { tool: 'arrow', icon: '<line x1="5" y1="19" x2="19" y2="5"/><polyline points="12 5 19 5 19 12"/>' },
          ].map(({ tool, icon }) => (
            <button key={tool} className={`fmt-btn tool-btn${npTool === tool ? ' active' : ''}`} onClick={() => setNpTool(tool)}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" dangerouslySetInnerHTML={{ __html: icon }}/>
            </button>
          ))}
          <div className="toolbar-divider"/>
          <label className="np-color-wrap" title="Draw color">
            <input type="color" value={npColor} onChange={e => setNpColor(e.target.value)} />
            <span className="np-color-dot" style={{ background: npColor }}/>
          </label>
          {npTool === 'highlight' && (
            <div className="hl-presets">
              {[['rgba(255,220,0,0.55)','#ffd700'],['rgba(60,220,100,0.5)','#3cdc64'],['rgba(255,80,150,0.5)','#ff5096']].map(([col, bg]) => (
                <span key={col} className="hl-dot" style={{ background: bg }} onClick={() => setHlColor(col)} />
              ))}
            </div>
          )}
          {npTool === 'eraser' && (
            <div className="eraser-size-row visible">
              <label>Size</label>
              <input type="range" min="6" max="60" value={eraserSize} onChange={e => setEraserSize(+e.target.value)} />
              <span className="eraser-size-label">{eraserSize}px</span>
            </div>
          )}
          <div className="toolbar-divider"/>
          <button className="fmt-btn" onClick={clearDrawing} title="Clear drawings">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 20H7L3 16l10-10 7 7-3.5 3.5"/></svg>
          </button>
          <button className="fmt-btn danger" onClick={() => { if (confirm('Clear all notes?')) { notepadRef.current.innerHTML = ''; clearDrawing(); actions.setNotes(''); } }} title="Clear all">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
          </button>
        </div>

        {/* Notepad + drawing canvas */}
        <div className="notepad-content-wrap" id="notepadWrap">
          <div
            ref={notepadRef}
            className={`notepad-body${isDrawActive ? ' draw-active' : ''}`}
            id="notepad"
            contentEditable={!isDrawActive}
            suppressContentEditableWarning
            spellCheck
            onInput={debounce(() => actions.setNotes(notepadRef.current?.innerHTML || ''), 800)}
          >
            <h3>Welcome to kexo AI 🎯</h3>
            <p>Load a YouTube video above, then start taking notes here. Your notes are <strong>auto-saved</strong>.</p>
            <ul>
              <li>Use the canvas to build a visual mind map</li>
              <li>Capture video timestamps as nodes</li>
              <li>Press <strong>T</strong> to capture the current timestamp</li>
              <li>Connect ideas by dragging connector dots</li>
              <li>Select text → "Add to Canvas"</li>
            </ul>
          </div>
          <canvas
            ref={drawCanvasRef}
            id="drawingCanvas"
            className={`drawing-canvas${isDrawActive ? ' draw-active' : ''}${npTool === 'eraser' ? ' eraser-active' : ''}${npTool === 'arrow' ? ' arrow-active' : ''}`}
            onMouseDown={drawStart}
            onMouseMove={drawMove}
            onMouseUp={drawEnd}
            onMouseLeave={drawEnd}
          />
        </div>
      </div>
    </aside>
  );
}
