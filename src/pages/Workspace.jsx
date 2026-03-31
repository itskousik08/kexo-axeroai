import React, { useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useApp } from '../store/AppContext';
import WorkspaceHeader from '../components/canvas/WorkspaceHeader';
import Sidebar from '../components/sidebar/Sidebar';
import CanvasArea from '../components/canvas/CanvasArea';
import ColorPickerPopup from '../components/canvas/ColorPickerPopup';
import ConnectIndicator from '../components/canvas/ConnectIndicator';
import AIPanel from '../components/ai/AIPanel';
import SharePanel from '../components/ui/SharePanel';
import Toast from '../components/ui/Toast';
import './Workspace.css';

export default function Workspace() {
  const { state, actions } = useApp();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const projectId = searchParams.get('project') || localStorage.getItem('kexo_active_project') || 'default';

  useEffect(() => {
    document.body.classList.add('workspace-page');
    actions.loadProject(projectId);
    return () => document.body.classList.remove('workspace-page');
  }, [projectId]);

  // Global keyboard shortcuts
  useEffect(() => {
    const down = (e) => {
      const inInput = e.target.closest('[contenteditable], input, textarea');
      if (e.code === 'KeyT' && !inInput && state.activeProjectId) {
        e.preventDefault();
        // Trigger T-key timestamp capture via custom event
        window.dispatchEvent(new CustomEvent('kexo:captureTimestamp'));
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) { e.preventDefault(); actions.undo(); }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.shiftKey && e.key === 'z'))) { e.preventDefault(); actions.redo(); }
      if ((e.key === 'Delete' || e.key === 'Backspace') && !inInput) {
        if (state.selectedNode) actions.deleteNode(state.selectedNode);
        else if (state.selectedConnection) actions.deleteConnection(state.selectedConnection);
      }
      if (e.key === 'Escape') {
        actions.cancelConnect();
        actions.exitUnlinkMode();
      }
    };
    window.addEventListener('keydown', down);
    return () => window.removeEventListener('keydown', down);
  }, [state.selectedNode, state.selectedConnection]);

  return (
    <div className="workspace">
      <WorkspaceHeader projectId={projectId} />
      <div className="workspace-body" id="appBody">
        <Sidebar />
        <CanvasArea />
      </div>
      <ColorPickerPopup />
      <ConnectIndicator />
      {state.aiPanelOpen && <AIPanel />}
      {state.sharePanelOpen && <SharePanel />}
      <Toast />
    </div>
  );
}
