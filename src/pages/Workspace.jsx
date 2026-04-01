import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useApp } from '../store/AppContext';
import WorkspaceHeader from '../components/canvas/WorkspaceHeader';
import Sidebar from '../components/sidebar/Sidebar';
import CanvasArea from '../components/canvas/CanvasArea';
import FloatingBar from '../components/canvas/FloatingBar';
import ConnectIndicator from '../components/canvas/ConnectIndicator';
import AIPanel from '../components/ai/AIPanel';
import SharePanel from '../components/ui/SharePanel';
import TraditionalCanvas from '../components/canvas/TraditionalCanvas';
import FreeCanvas from '../components/canvas/FreeCanvas';
import Toast from '../components/ui/Toast';
import './Workspace.css';

export default function Workspace() {
  const { state, actions } = useApp();
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('project') || localStorage.getItem('kexo_active_project') || 'default';
  const theme = state.activeProjectTheme || 'signature';

  useEffect(() => {
    document.body.classList.add('workspace-page');
    actions.loadProject(projectId);
    return () => document.body.classList.remove('workspace-page');
  }, [projectId]);

  // Global keyboard shortcuts
  useEffect(() => {
    const down = (e) => {
      const inInput = e.target.closest('[contenteditable],input,textarea');
      if (e.code === 'KeyT' && !inInput) { e.preventDefault(); window.dispatchEvent(new CustomEvent('kexo:captureTimestamp')); }
      if ((e.ctrlKey||e.metaKey) && e.key==='z' && !e.shiftKey) { e.preventDefault(); actions.undo(); }
      if ((e.ctrlKey||e.metaKey) && (e.key==='y'||(e.shiftKey&&e.key==='z'))) { e.preventDefault(); actions.redo(); }
      if ((e.key==='Delete'||e.key==='Backspace') && !inInput) {
        if (state.selectedNode) actions.deleteNode(state.selectedNode);
        else if (state.selectedConnection) actions.deleteConnection(state.selectedConnection);
      }
      if (e.key==='Escape') { actions.cancelConnect(); actions.exitUnlinkMode(); }
    };
    window.addEventListener('keydown', down);
    return () => window.removeEventListener('keydown', down);
  }, [state.selectedNode, state.selectedConnection]);

  // Signature (Flow Canvas)
  if (theme === 'signature') {
    return (
      <div className="workspace">
        <WorkspaceHeader projectId={projectId} theme={theme} />
        <div className="workspace-body">
          <Sidebar />
          <div className="workspace-canvas-wrap">
            <CanvasArea />
            {/* BUG FIX: FloatingBar hidden when AI panel is open on mobile */}
            <FloatingBar hidden={state.aiPanelOpen} />
            <ConnectIndicator />
          </div>
        </div>
        {state.aiPanelOpen && <AIPanel />}
        {state.sharePanelOpen && <SharePanel />}
        <Toast />
      </div>
    );
  }

  // Traditional
  if (theme === 'traditional') {
    return (
      <div className="workspace">
        <WorkspaceHeader projectId={projectId} theme={theme} />
        <div className="workspace-body workspace-body--full">
          {/* TraditionalCanvas includes its own FloatingBar + VoiceModal + AIPanel */}
          <TraditionalCanvas />
        </div>
        {state.sharePanelOpen && <SharePanel />}
        <Toast />
      </div>
    );
  }

  // Free Canvas
  if (theme === 'freecanvas') {
    return (
      <div className="workspace">
        <WorkspaceHeader projectId={projectId} theme={theme} />
        <div className="workspace-body workspace-body--full">
          {/* FreeCanvas includes its own FloatingBar + AIPanel */}
          <FreeCanvas />
        </div>
        {state.sharePanelOpen && <SharePanel />}
        <Toast />
      </div>
    );
  }

  return null;
}
