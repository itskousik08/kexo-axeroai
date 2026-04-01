import React, { useRef, useState, useEffect } from 'react';
import { useApp } from '../../store/AppContext';
import FloatingBar from '../canvas/FloatingBar';
import { useApp as useAppAlias } from '../../store/AppContext';
import AIPanel from '../ai/AIPanel';
import './TraditionalCanvas.css';

export default function TraditionalCanvas() {
  const { state, actions } = useApp();
  const editorRef = useRef(null);
  const [blocks, setBlocks] = useState(() => {
    const saved = state.notes;
    return saved ? JSON.parse(saved || '[]') : [{ id: 1, type: 'text', content: '' }];
  });
  const nextIdRef = useRef(100);

  // Persist
  useEffect(() => {
    try { actions.setNotes(JSON.stringify(blocks)); } catch {}
  }, [blocks]);

  // Load
  useEffect(() => {
    if (state.notes) {
      try { const b = JSON.parse(state.notes); if (Array.isArray(b)) setBlocks(b); } catch {}
    }
  }, [state.activeProjectId]);

  const addBlock = (type = 'text', afterId = null) => {
    const newBlock = { id: ++nextIdRef.current, type, content: '' };
    setBlocks(prev => {
      if (!afterId) return [...prev, newBlock];
      const idx = prev.findIndex(b => b.id === afterId);
      const next = [...prev];
      next.splice(idx + 1, 0, newBlock);
      return next;
    });
    setTimeout(() => document.getElementById(`block-${newBlock.id}`)?.focus(), 30);
  };

  const updateBlock = (id, content) => {
    setBlocks(prev => prev.map(b => b.id === id ? { ...b, content } : b));
  };

  const deleteBlock = (id) => {
    setBlocks(prev => prev.length > 1 ? prev.filter(b => b.id !== id) : prev);
  };

  const handleKeyDown = (e, block) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      addBlock('text', block.id);
    }
    if (e.key === 'Backspace' && block.content === '') {
      e.preventDefault();
      deleteBlock(block.id);
    }
  };

  const handleImageUpload = (e, afterId) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const newBlock = { id: ++nextIdRef.current, type: 'image', content: ev.target.result, caption: file.name };
      setBlocks(prev => {
        const idx = prev.findIndex(b => b.id === afterId);
        const next = [...prev];
        next.splice(idx + 1, 0, newBlock);
        return next;
      });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleVoiceUpload = (e, afterId) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const newBlock = { id: ++nextIdRef.current, type: 'audio', content: ev.target.result, caption: file.name };
      setBlocks(prev => {
        const idx = prev.findIndex(b => b.id === afterId);
        const next = [...prev];
        next.splice(idx + 1, 0, newBlock);
        return next;
      });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  return (
    <div className="trad-canvas">
      <div className="trad-page" ref={editorRef}>
        <div className="trad-header">
          <div className="trad-date">{new Date().toLocaleDateString('en-US', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}</div>
        </div>

        <div className="trad-blocks">
          {blocks.map((block, idx) => (
            <div key={block.id} className="trad-block">
              <div className="trad-block__line-num">{idx + 1}</div>

              {block.type === 'text' && (
                <div
                  id={`block-${block.id}`}
                  className="trad-block__text"
                  contentEditable suppressContentEditableWarning
                  onInput={e => updateBlock(block.id, e.currentTarget.innerText)}
                  onKeyDown={e => handleKeyDown(e, block)}
                  data-placeholder="Start writing…"
                >
                </div>
              )}

              {block.type === 'heading' && (
                <div
                  id={`block-${block.id}`}
                  className="trad-block__heading"
                  contentEditable suppressContentEditableWarning
                  onInput={e => updateBlock(block.id, e.currentTarget.innerText)}
                  onKeyDown={e => handleKeyDown(e, block)}
                  data-placeholder="Heading…"
                />
              )}

              {block.type === 'image' && (
                <div className="trad-block__image">
                  <img src={block.content} alt={block.caption} />
                  <div
                    className="trad-block__caption"
                    contentEditable suppressContentEditableWarning
                    onInput={e => setBlocks(prev => prev.map(b => b.id === block.id ? { ...b, caption: e.currentTarget.innerText } : b))}
                  >{block.caption}</div>
                </div>
              )}

              {block.type === 'audio' && (
                <div className="trad-block__audio">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/></svg>
                  <span className="trad-block__audio-name">{block.caption}</span>
                  <audio controls src={block.content} />
                </div>
              )}

              <div className="trad-block__actions">
                <label className="trad-act-btn" title="Add image">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                  <input type="file" accept="image/*" style={{ display:'none' }} onChange={e => handleImageUpload(e, block.id)} />
                </label>
                <label className="trad-act-btn" title="Add audio">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/></svg>
                  <input type="file" accept="audio/*" style={{ display:'none' }} onChange={e => handleVoiceUpload(e, block.id)} />
                </label>
                <button className="trad-act-btn" title="Add heading" onClick={() => addBlock('heading', block.id)}>H</button>
                <button className="trad-act-btn trad-act-btn--del" title="Delete line" onClick={() => deleteBlock(block.id)}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
            </div>
          ))}

          <button className="trad-add-line" onClick={() => addBlock('text')}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Add line
          </button>
        </div>
      </div>

      <FloatingBar hidden={state.aiPanelOpen} />
      {state.aiPanelOpen && <AIPanel />}
    </div>
  );
}
