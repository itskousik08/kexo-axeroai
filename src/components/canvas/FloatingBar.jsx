import React, { useState, useRef } from 'react';
import { useApp } from '../../store/AppContext';
import VoiceModal from './VoiceModal';
import './FloatingBar.css';

/* Icon components — clean SVGs, no emoji */
const icons = {
  note: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
  concept: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="4"/><path d="M12 8v8M8 12h8"/></svg>,
  question: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  image: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>,
  code: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>,
  link: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>,
  unlink: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/><line x1="1" y1="1" x2="23" y2="23"/></svg>,
  voice: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>,
  ai: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2a10 10 0 1 0 10 10H12V2z"/><path d="M21.18 8.02c-1-2.3-2.85-4.17-5.16-5.18"/></svg>,
};

const BAR_ITEMS = [
  { id: 'note',     label: 'Note',     icon: icons.note,     action: 'add' },
  { id: 'concept',  label: 'Concept',  icon: icons.concept,  action: 'add' },
  { id: 'question', label: 'Question', icon: icons.question, action: 'add' },
  { id: 'image',    label: 'Image',    icon: icons.image,    action: 'upload-image' },
  { id: 'code',     label: 'Code',     icon: icons.code,     action: 'add' },
  { id: 'link',     label: 'Link',     icon: icons.link,     action: 'add' },
  { id: 'unlink',   label: 'Unlink',   icon: icons.unlink,   action: 'unlink' },
  { id: 'voice',    label: 'Voice',    icon: icons.voice,    action: 'voice' },
  { id: 'ai',       label: 'AI',       icon: icons.ai,       action: 'ai' },
];

export default function FloatingBar({ hidden }) {
  const { state, actions } = useApp();
  const [activeId, setActiveId] = useState(null);
  const imageInputRef = useRef(null);

  const handleItem = (item) => {
    setActiveId(item.id);
    setTimeout(() => setActiveId(null), 300);

    switch (item.action) {
      case 'add':
        actions.addNode(item.id);
        break;
      case 'upload-image':
        imageInputRef.current?.click();
        break;
      case 'unlink':
        if (state.selectedNode) actions.enterUnlinkMode(state.selectedNode);
        else actions.showToast('Select a node first, then tap Unlink');
        break;
      case 'voice':
        actions.toggleVoiceModal();
        break;
      case 'ai':
        actions.toggleAIPanel();
        break;
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const w = 300, h = Math.round(w / (img.naturalWidth / img.naturalHeight));
        actions.addNode('image', 'Image', '', 0, ev.target.result, { isFreeImage: true, w, h });
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  return (
    <>
      <div className={`floating-bar${hidden ? ' floating-bar--hidden' : ''}`}>
        <div className="floating-bar__track">
          {BAR_ITEMS.map(item => (
            <button
              key={item.id}
              className={`fb-btn${activeId === item.id ? ' fb-btn--active' : ''}${item.id === 'ai' && state.aiPanelOpen ? ' fb-btn--on' : ''}${item.id === 'unlink' && state.unlinkFirstNode ? ' fb-btn--on' : ''}`}
              onClick={() => handleItem(item)}
              title={item.label}
            >
              <span className="fb-btn__icon">{item.icon}</span>
              <span className="fb-btn__label">{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Hidden image input */}
      <input ref={imageInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageUpload} />

      {/* Voice Modal */}
      {state.voiceModalOpen && <VoiceModal />}
    </>
  );
}
