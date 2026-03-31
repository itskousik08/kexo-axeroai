import React, { useState } from 'react';
import { useApp } from '../../store/AppContext';
import { genId } from '../../utils/helpers';

export default function SharePanel() {
  const { state, actions } = useApp();
  const [copied, setCopied] = useState(false);
  const shareUrl = `https://kexo.ai/canvas/${genId()}`;

  const copy = () => {
    navigator.clipboard?.writeText(shareUrl).catch(() => {});
    setCopied(true);
    actions.showToast('Link copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="modal-overlay" onClick={actions.toggleSharePanel}>
      <div className="modal-box" style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">Share Canvas</span>
          <button className="modal-close" onClick={actions.toggleSharePanel}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ background: 'var(--bg3)', border: '1px solid var(--border2)', borderRadius: 10, padding: '12px 14px' }}>
            <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 6, fontFamily: 'Syne, sans-serif', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px' }}>Share Link</div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{ flex: 1, fontSize: 12, color: 'var(--text2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{shareUrl}</span>
              <button
                onClick={copy}
                style={{ display: 'flex', alignItems: 'center', gap: 6, background: copied ? 'rgba(45,212,160,0.15)' : 'var(--accent)', border: 'none', borderRadius: 7, padding: '6px 14px', color: copied ? 'var(--green)' : '#000', fontSize: 12, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s', flexShrink: 0 }}
              >
                {copied
                  ? <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg> Copied!</>
                  : <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg> Copy Link</>}
              </button>
            </div>
          </div>

          <div style={{ background: 'rgba(245,166,35,0.06)', border: '1px solid rgba(245,166,35,0.2)', borderRadius: 10, padding: '12px 14px', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" style={{ flexShrink: 0, marginTop: 1 }}>
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>Coming Soon: Live Sharing</div>
              <div style={{ fontSize: 11.5, color: 'var(--text3)', lineHeight: 1.6 }}>Real-time collaboration and canvas sharing are planned for a future release. This link is a preview of the sharing UI.</div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', fontFamily: 'Syne, sans-serif' }}>Access Level</div>
            {['View only (default)', 'Can comment', 'Can edit'].map((opt, i) => (
              <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', padding: '8px 12px', background: i === 0 ? 'var(--surface)' : 'none', border: `1px solid ${i === 0 ? 'var(--border2)' : 'var(--border)'}`, borderRadius: 8, transition: 'all 0.15s' }}>
                <input type="radio" name="access" defaultChecked={i === 0} style={{ accentColor: 'var(--accent)' }} readOnly />
                <span style={{ fontSize: 12.5, color: 'var(--text2)' }}>{opt}</span>
                {i > 0 && <span style={{ marginLeft: 'auto', fontSize: 10, background: 'rgba(155,116,245,0.12)', border: '1px solid rgba(155,116,245,0.3)', color: 'var(--violet)', padding: '2px 7px', borderRadius: 100, fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>Pro</span>}
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
