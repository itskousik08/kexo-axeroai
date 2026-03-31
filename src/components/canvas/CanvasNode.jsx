import React, { useRef, useCallback, useState } from 'react';
import { useApp } from '../../store/AppContext';
import { formatTime } from '../../utils/helpers';

const TAG_COLORS = {
  important: '#f25f7a', review: '#f5a623', question: '#9b74f5',
  idea: '#4f8ef7', done: '#2dd4a0', todo: '#a09fad',
};

export default function CanvasNode({ node, isSelected, isBulkSelected, isUnlinkSource, extraClass, onConnectorDown }) {
  const { state, actions } = useApp();
  const elRef = useRef(null);
  const [colorPickerPos, setColorPickerPos] = useState(null);
  const [tagInput, setTagInput] = useState('');
  const [showTagInput, setShowTagInput] = useState(false);

  const n = node;
  const isMedia = n.isFreeImage || n.isPdfNode;

  // ── Drag ───────────────────────────────────────────────────────────────────
  const dragRef = useRef({});
  const onMouseDown = useCallback((e) => {
    if (e.button !== 0) return;
    if (e.target.closest('[contenteditable],[data-resize],.node-btn,.connector-dot,.node-tag,.node-audio')) return;
    e.preventDefault();
    actions.selectNode(n.id);
    const startX = n.x, startY = n.y, startMX = e.clientX, startMY = e.clientY;
    dragRef.current = { startX, startY, startMX, startMY };
    elRef.current?.classList.add('dragging');
    elRef.current && (elRef.current.style.zIndex = '100');

    const mv = (ev) => {
      const nx = startX + (ev.clientX - startMX) / state.zoom;
      const ny = startY + (ev.clientY - startMY) / state.zoom;
      actions.updateNode(n.id, { x: nx, y: ny });
    };
    const up = () => {
      elRef.current?.classList.remove('dragging');
      elRef.current && (elRef.current.style.zIndex = '');
      window.removeEventListener('mousemove', mv);
      window.removeEventListener('mouseup', up);
      window.dispatchEvent(new Event('kexo:minimapUpdate'));
    };
    window.addEventListener('mousemove', mv);
    window.addEventListener('mouseup', up);
  }, [n.x, n.y, state.zoom, n.id]);

  // Touch drag
  const onTouchStart = useCallback((e) => {
    if (e.target.closest('[contenteditable],[data-resize],.node-btn,.connector-dot,.node-tag')) return;
    const t = e.touches[0];
    const startX = n.x, startY = n.y, startMX = t.clientX, startMY = t.clientY;
    const mv = (ev) => {
      const t2 = ev.touches[0];
      actions.updateNode(n.id, { x: startX + (t2.clientX - startMX) / state.zoom, y: startY + (t2.clientY - startMY) / state.zoom });
    };
    const up = () => { window.removeEventListener('touchmove', mv); window.removeEventListener('touchend', up); };
    window.addEventListener('touchmove', mv, { passive: false });
    window.addEventListener('touchend', up);
  }, [n.x, n.y, state.zoom, n.id]);

  // ── Resize ─────────────────────────────────────────────────────────────────
  const onResizeDown = useCallback((e) => {
    e.stopPropagation(); e.preventDefault();
    const startW = n.w, startX = e.clientX;
    const mv = (ev) => {
      const newW = Math.max(180, startW + (ev.clientX - startX) / state.zoom);
      actions.updateNode(n.id, { w: newW });
    };
    const up = () => { window.removeEventListener('mousemove', mv); window.removeEventListener('mouseup', up); };
    window.addEventListener('mousemove', mv); window.addEventListener('mouseup', up);
  }, [n.w, state.zoom, n.id]);

  const onResizeBothDown = useCallback((e) => {
    e.stopPropagation(); e.preventDefault();
    const startW = n.w, startH = n.h || elRef.current?.offsetHeight || 200, startX = e.clientX;
    const ratio = startW / startH;
    const mv = (ev) => {
      const newW = Math.max(100, startW + (ev.clientX - startX) / state.zoom);
      actions.updateNode(n.id, { w: newW, h: Math.round(newW / ratio) });
    };
    const up = () => { window.removeEventListener('mousemove', mv); window.removeEventListener('mouseup', up); };
    window.addEventListener('mousemove', mv); window.addEventListener('mouseup', up);
  }, [n.w, n.h, state.zoom, n.id]);

  // ── Click ──────────────────────────────────────────────────────────────────
  const onClick = (e) => {
    if (e.target.closest('[contenteditable],.node-btn,.connector-dot,[data-resize],.node-tag')) return;
    if (state.connectMode && state.connectSource) {
      if (state.connectSource !== n.id) actions.createConnection(state.connectSource, 'bottom', n.id, 'top');
      actions.cancelConnect();
      return;
    }
    if (state.unlinkFirstNode && state.unlinkFirstNode !== n.id) {
      actions.enterUnlinkMode(n.id); return;
    }
    actions.selectNode(n.id);
  };

  // ── Audio upload ───────────────────────────────────────────────────────────
  const handleAudioUpload = (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => { actions.updateNode(n.id, { audioData: ev.target.result, audioName: file.name }); };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const nodeClasses = [
    'node',
    isMedia ? 'node-media' : '',
    n.color !== 'default' ? `color-${n.color}` : '',
    isSelected ? 'selected' : '',
    isBulkSelected ? 'bulk-selected' : '',
    isUnlinkSource ? 'unlink-source' : '',
    extraClass || '',
  ].filter(Boolean).join(' ');

  const sizeButtons = isMedia ? (
    <>
      <button className="node-btn" onClick={() => { const d = -40; const r = n.h ? n.w / n.h : 1.33; const nw = Math.max(120, n.w + d); actions.updateNode(n.id, { w: nw, h: Math.round(nw / r) }); }} title="Shrink">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="5" y1="12" x2="19" y2="12"/></svg>
      </button>
      <button className="node-btn" onClick={() => { const d = 40; const r = n.h ? n.w / n.h : 1.33; const nw = Math.min(1200, n.w + d); actions.updateNode(n.id, { w: nw, h: Math.round(nw / r) }); }} title="Grow">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
      </button>
    </>
  ) : null;

  const nodeHeader = (
    <div className="node-header">
      <span className={`node-type ${n.type}`}>{n.isPdfNode ? 'PDF' : n.type}</span>
      {n.timestamp > 0 && (
        <span className="node-timestamp" onClick={() => window.dispatchEvent(new CustomEvent('kexo:jumpTimestamp', { detail: n.timestamp }))} title={`Jump to ${formatTime(n.timestamp)}`}>
          ⏱ {formatTime(n.timestamp)}
        </span>
      )}
      <div className="node-actions-top">
        {sizeButtons}
        <button className="node-btn connect-btn" onClick={(e) => { e.stopPropagation(); actions.startConnect(n.id); }} title="Connect">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
        </button>
        <button className="node-btn unlink-btn" onClick={(e) => { e.stopPropagation(); actions.enterUnlinkMode(n.id); }} title="Unlink">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
        </button>
        <button className="node-btn" onClick={(e) => { e.stopPropagation(); setColorPickerPos({ x: e.clientX, y: e.clientY }); }} title="Color">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/></svg>
        </button>
        <button className="node-btn dup-btn" onClick={(e) => { e.stopPropagation(); actions.duplicateNode(n.id); }} title="Duplicate">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
        </button>
        <button className="node-btn danger" onClick={(e) => { e.stopPropagation(); actions.deleteNode(n.id); }} title="Delete">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>
        </button>
      </div>
    </div>
  );

  const connectors = (
    <div className="node-connectors">
      {['top','bottom','left','right'].map(side => (
        <div
          key={side}
          className={`connector-dot ${side}`}
          data-node={n.id}
          data-side={side}
          onMouseDown={(e) => { e.stopPropagation(); onConnectorDown(e, n.id, side); }}
        />
      ))}
    </div>
  );

  const tagsSection = (
    <div className="node-tags">
      {(n.tags || []).map(tag => (
        <span
          key={tag}
          className="node-tag"
          style={{ background: (TAG_COLORS[tag] || '#6b6a7a') + '22', color: TAG_COLORS[tag] || '#6b6a7a', border: `1px solid ${(TAG_COLORS[tag] || '#6b6a7a')}44` }}
          onClick={(e) => { e.stopPropagation(); actions.removeTagFromNode(n.id, tag); }}
          title={`Remove tag: ${tag}`}
        >
          {tag}
        </span>
      ))}
      {showTagInput ? (
        <input
          className="node-tag-input"
          style={{ background: 'var(--bg3)', border: '1px solid var(--border2)', borderRadius: 100, fontSize: 9, padding: '2px 6px', color: 'var(--text)', outline: 'none', width: 70 }}
          autoFocus placeholder="tag…" value={tagInput}
          onChange={e => setTagInput(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') { actions.addTagToNode(n.id, tagInput); setTagInput(''); setShowTagInput(false); }
            if (e.key === 'Escape') { setShowTagInput(false); setTagInput(''); }
          }}
          onBlur={() => { if (tagInput.trim()) actions.addTagToNode(n.id, tagInput); setTagInput(''); setShowTagInput(false); }}
          onClick={e => e.stopPropagation()}
        />
      ) : (
        <button className="node-tag-add" onClick={(e) => { e.stopPropagation(); setShowTagInput(true); }}>+ tag</button>
      )}
    </div>
  );

  return (
    <>
      <div
        ref={elRef}
        id={n.id}
        className={nodeClasses}
        style={{
          left: n.x, top: n.y, width: n.w,
          ...(isMedia && n.h ? { height: n.h } : {}),
        }}
        onMouseDown={onMouseDown}
        onTouchStart={onTouchStart}
        onClick={onClick}
      >
        {nodeHeader}

        {isMedia ? (
          <div className="node-media-body">
            <img className="node-media-img" src={n.imageUrl} alt={n.isPdfNode ? 'PDF' : 'image'} draggable={false} />
          </div>
        ) : (
          <>
            {n.imageUrl && !n.isFreeImage && <img className="node-img" src={n.imageUrl} alt="" draggable={false} />}
            <div className="node-body">
              <div
                className="node-title"
                contentEditable suppressContentEditableWarning
                placeholder="Node title…"
                onInput={(e) => actions.updateNode(n.id, { title: e.currentTarget.innerText })}
                onMouseDown={(e) => e.stopPropagation()}
              >{n.title}</div>
              <div
                className="node-desc"
                contentEditable suppressContentEditableWarning
                placeholder="Add notes…"
                onInput={(e) => actions.updateNode(n.id, { desc: e.currentTarget.innerText })}
                onMouseDown={(e) => e.stopPropagation()}
              >{n.desc}</div>
            </div>
            {tagsSection}
            {/* Audio */}
            <div className="node-audio" onMouseDown={e => e.stopPropagation()}>
              {n.audioData ? (
                <>
                  <div className="node-audio-label">🎙 Voice Note</div>
                  <audio controls src={n.audioData} style={{ width: '100%', height: 28 }} />
                </>
              ) : (
                <label className="node-audio-upload" title="Attach voice note">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/></svg>
                  <span>Attach audio</span>
                  <input type="file" accept="audio/*" style={{ display: 'none' }} onChange={handleAudioUpload} />
                </label>
              )}
            </div>
          </>
        )}

        {connectors}
        {isMedia
          ? <div className="node-resize-both" data-resize={n.id} onMouseDown={onResizeBothDown} />
          : <div className="node-resize" data-resize={n.id} onMouseDown={onResizeDown} />}
      </div>

      {/* Inline color picker */}
      {colorPickerPos && (
        <InlineColorPicker
          nodeId={n.id}
          pos={colorPickerPos}
          onClose={() => setColorPickerPos(null)}
        />
      )}
    </>
  );
}

function InlineColorPicker({ nodeId, pos, onClose }) {
  const { actions } = useApp();
  const colors = ['default','blue','green','amber','rose','violet'];
  React.useEffect(() => {
    const h = () => onClose();
    setTimeout(() => document.addEventListener('click', h, { once: true }), 10);
  }, []);
  return (
    <div className="color-popup visible" style={{ top: pos.y - 44, left: pos.x - 10 }} onClick={e => e.stopPropagation()}>
      {colors.map(c => (
        <div key={c} className={`color-swatch ${c !== 'default' ? c : ''}`} title={c}
          onClick={() => { actions.setNodeColor(nodeId, c); onClose(); }} />
      ))}
    </div>
  );
}
