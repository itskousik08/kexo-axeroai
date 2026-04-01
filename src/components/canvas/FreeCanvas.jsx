import React, { useState, useRef, useCallback } from 'react';
import { useApp } from '../../store/AppContext';
import FloatingBar from '../canvas/FloatingBar';
import AIPanel from '../ai/AIPanel';
import './FreeCanvas.css';

let nextFreeId = 1;

const mkNote = (x, y, type = 'text') => ({
  id: ++nextFreeId,
  type,
  x, y,
  w: type === 'text' ? 220 : 300,
  h: type === 'text' ? 80 : 200,
  content: '',
  src: null,
  audioData: null,
  fontSize: 14,
  bold: false,
  italic: false,
  color: 'var(--text)',
  bg: 'transparent',
});

export default function FreeCanvas() {
  const { state, actions } = useApp();
  const [notes, setNotes] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const canvasRef = useRef(null);

  // Double-click on canvas → add text note
  const onCanvasDblClick = useCallback((e) => {
    if (e.target !== canvasRef.current && !e.target.classList.contains('free-canvas__bg')) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - 110;
    const y = e.clientY - rect.top - 40;
    const note = mkNote(x, y, 'text');
    setNotes(prev => [...prev, note]);
    setSelectedId(note.id);
    setTimeout(() => document.getElementById(`fn-${note.id}`)?.focus(), 30);
  }, []);

  // Drag note
  const startDrag = useCallback((e, id) => {
    if (e.target.closest('[contenteditable],.fn-resize,.fn-toolbar')) return;
    e.preventDefault();
    const note = notes.find(n => n.id === id);
    if (!note) return;
    const startX = note.x, startY = note.y, mx = e.clientX, my = e.clientY;
    setSelectedId(id);
    const mv = (ev) => {
      setNotes(prev => prev.map(n => n.id === id ? { ...n, x: startX + ev.clientX - mx, y: startY + ev.clientY - my } : n));
    };
    const up = () => { window.removeEventListener('mousemove', mv); window.removeEventListener('mouseup', up); };
    window.addEventListener('mousemove', mv);
    window.addEventListener('mouseup', up);
  }, [notes]);

  // Resize note
  const startResize = useCallback((e, id) => {
    e.stopPropagation(); e.preventDefault();
    const note = notes.find(n => n.id === id);
    if (!note) return;
    const sw = note.w, sh = note.h, mx = e.clientX, my = e.clientY;
    const mv = (ev) => {
      setNotes(prev => prev.map(n => n.id === id ? { ...n, w: Math.max(120, sw + ev.clientX - mx), h: Math.max(40, sh + ev.clientY - my) } : n));
    };
    const up = () => { window.removeEventListener('mousemove', mv); window.removeEventListener('mouseup', up); };
    window.addEventListener('mousemove', mv);
    window.addEventListener('mouseup', up);
  }, [notes]);

  const deleteNote = (id) => setNotes(prev => prev.filter(n => n.id !== id));
  const updateNote = (id, patch) => setNotes(prev => prev.map(n => n.id === id ? { ...n, ...patch } : n));

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const rect = canvasRef.current?.getBoundingClientRect();
      const note = mkNote(rect ? (rect.width/2 - 150) : 200, 150, 'image');
      note.src = ev.target.result;
      setNotes(prev => [...prev, note]);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Listen to floating bar voice add
  // (voice adds to notes as audio block)
  const handleVoiceAdd = useCallback((audioData, name) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    const note = mkNote(rect ? (rect.width/2 - 110) : 200, rect ? 200 : 200, 'audio');
    note.audioData = audioData;
    note.content = name || 'Voice Note';
    setNotes(prev => [...prev, note]);
  }, []);

  return (
    <div className="free-canvas-wrap">
      <div
        ref={canvasRef}
        className="free-canvas__bg"
        onDoubleClick={onCanvasDblClick}
        onClick={() => setSelectedId(null)}
      >
        <div className="free-canvas__hint">Double-click anywhere to start writing</div>

        {notes.map(note => (
          <div
            key={note.id}
            className={`fn${selectedId === note.id ? ' fn--selected' : ''} fn--${note.type}`}
            style={{ left: note.x, top: note.y, width: note.w, minHeight: note.h }}
            onMouseDown={(e) => startDrag(e, note.id)}
            onClick={(e) => { e.stopPropagation(); setSelectedId(note.id); }}
          >
            {/* Toolbar (only when selected) */}
            {selectedId === note.id && (
              <div className="fn-toolbar" onMouseDown={e => e.stopPropagation()}>
                {note.type === 'text' && <>
                  <button className={`fn-tb-btn${note.bold ? ' fn-tb-btn--on' : ''}`} onClick={() => updateNote(note.id, { bold: !note.bold })}><b>B</b></button>
                  <button className={`fn-tb-btn${note.italic ? ' fn-tb-btn--on' : ''}`} onClick={() => updateNote(note.id, { italic: !note.italic })}><em>I</em></button>
                  <select className="fn-tb-select" value={note.fontSize} onChange={e => updateNote(note.id, { fontSize: +e.target.value })}>
                    {[11,13,15,18,22,28,36].map(s => <option key={s} value={s}>{s}px</option>)}
                  </select>
                </>}
                <div className="fn-tb-sep" />
                <button className="fn-tb-btn fn-tb-btn--del" onClick={() => deleteNote(note.id)}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
            )}

            {note.type === 'text' && (
              <div
                id={`fn-${note.id}`}
                className="fn-text"
                contentEditable suppressContentEditableWarning
                style={{ fontSize: note.fontSize, fontWeight: note.bold ? 700 : 400, fontStyle: note.italic ? 'italic' : 'normal' }}
                onInput={e => updateNote(note.id, { content: e.currentTarget.innerText })}
                onMouseDown={e => e.stopPropagation()}
                data-placeholder="Type here…"
              />
            )}

            {note.type === 'image' && note.src && (
              <img className="fn-img" src={note.src} alt="" draggable={false} />
            )}

            {note.type === 'audio' && (
              <div className="fn-audio" onMouseDown={e => e.stopPropagation()}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/></svg>
                <span>{note.content}</span>
                <audio controls src={note.audioData} />
              </div>
            )}

            <div className="fn-resize" onMouseDown={e => startResize(e, note.id)} />
          </div>
        ))}
      </div>

      <FloatingBar hidden={state.aiPanelOpen} />
      {state.aiPanelOpen && <AIPanel />}
    </div>
  );
}
