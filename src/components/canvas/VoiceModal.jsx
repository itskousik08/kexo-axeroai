import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../store/AppContext';
import './VoiceModal.css';

export default function VoiceModal() {
  const { actions } = useApp();
  const [mode, setMode] = useState(null); // null | 'record' | 'upload'
  const [recording, setRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [duration, setDuration] = useState(0);
  const [title, setTitle] = useState('Voice Note');
  const mediaRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);

  useEffect(() => () => {
    clearInterval(timerRef.current);
    mediaRef.current?.stop?.();
    if (audioUrl) URL.revokeObjectURL(audioUrl);
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      mediaRef.current = mr;
      chunksRef.current = [];
      mr.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        stream.getTracks().forEach(t => t.stop());
      };
      mr.start();
      setRecording(true);
      setDuration(0);
      timerRef.current = setInterval(() => setDuration(d => d + 1), 1000);
    } catch {
      actions.showToast('Microphone access denied');
    }
  };

  const stopRecording = () => {
    clearInterval(timerRef.current);
    mediaRef.current?.stop?.();
    setRecording(false);
  };

  const handleUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setAudioBlob(new Blob([ev.target.result]));
      setAudioUrl(URL.createObjectURL(file));
      setTitle(file.name.replace(/\.[^.]+$/, '') || 'Voice Note');
    };
    reader.readAsArrayBuffer(file);
  };

  const confirmAdd = () => {
    if (!audioBlob) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      actions.addNode('voice', title, '', 0, null, { audioData: ev.target.result, audioName: title });
      actions.showToast('Voice note added to canvas');
      actions.toggleVoiceModal();
    };
    reader.readAsDataURL(audioBlob);
  };

  const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2,'0')}:${String(s % 60).padStart(2,'0')}`;

  return (
    <div className="modal-overlay" onClick={actions.toggleVoiceModal}>
      <div className="modal-box voice-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">Voice Note</span>
          <button className="modal-close" onClick={actions.toggleVoiceModal}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {!mode && (
          <div className="voice-options">
            <button className="voice-opt" onClick={() => setMode('record')}>
              <div className="voice-opt__icon voice-opt__icon--record">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                  <line x1="12" y1="19" x2="12" y2="23"/>
                  <line x1="8" y1="23" x2="16" y2="23"/>
                </svg>
              </div>
              <span className="voice-opt__title">Record Voice</span>
              <span className="voice-opt__sub">Use your microphone</span>
            </button>
            <button className="voice-opt" onClick={() => setMode('upload')}>
              <div className="voice-opt__icon voice-opt__icon--upload">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="17 8 12 3 7 8"/>
                  <line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
              </div>
              <span className="voice-opt__title">Upload Audio</span>
              <span className="voice-opt__sub">MP3, WAV, M4A, WebM</span>
            </button>
          </div>
        )}

        {mode === 'record' && (
          <div className="voice-recorder">
            <div className={`rec-indicator${recording ? ' rec-indicator--active' : ''}`}>
              <div className="rec-dot" />
              <span className="rec-timer">{fmt(duration)}</span>
            </div>

            {!audioUrl ? (
              <button
                className={`rec-btn${recording ? ' rec-btn--stop' : ''}`}
                onClick={recording ? stopRecording : startRecording}
              >
                {recording
                  ? <><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="6" width="12" height="12" rx="2"/></svg> Stop Recording</>
                  : <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/></svg> Start Recording</>}
              </button>
            ) : (
              <div className="rec-preview">
                <audio controls src={audioUrl} style={{ width: '100%' }} />
                <div className="rec-actions">
                  <button className="btn-ghost" onClick={() => { setAudioBlob(null); setAudioUrl(null); setDuration(0); }}>Re-record</button>
                </div>
              </div>
            )}
          </div>
        )}

        {mode === 'upload' && (
          <div className="voice-upload">
            {!audioUrl ? (
              <label className="upload-zone">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                </svg>
                <span>Click to upload audio file</span>
                <small>MP3, WAV, M4A, WebM, OGG</small>
                <input type="file" accept="audio/*" style={{ display: 'none' }} onChange={handleUpload} />
              </label>
            ) : (
              <div className="rec-preview">
                <audio controls src={audioUrl} style={{ width: '100%' }} />
              </div>
            )}
          </div>
        )}

        {audioUrl && (
          <div className="voice-confirm">
            <input
              className="modal-input"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Voice note title…"
              style={{ marginBottom: 0 }}
            />
            <div className="modal-footer" style={{ marginTop: 12 }}>
              <button className="btn-ghost" onClick={actions.toggleVoiceModal}>Cancel</button>
              <button className="btn-primary" style={{ padding: '10px 22px' }} onClick={confirmAdd}>
                Add to Canvas
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
