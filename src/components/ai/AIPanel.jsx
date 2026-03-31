import React, { useState, useRef } from 'react';
import { useApp } from '../../store/AppContext';
import './AIPanel.css';

const DUMMY_RESPONSES = [
  "Based on your canvas, I can see you're exploring interconnected concepts. The nodes suggest a structured approach to learning. Consider linking your 'Question' nodes back to relevant 'Concept' nodes to create a feedback loop.",
  "Your canvas has {count} nodes with rich content. Key themes emerging: {themes}. I recommend adding a summary node that connects all major concepts.",
  "Interesting structure! Your snapshot nodes capture key moments. I'd suggest grouping related snapshots under a parent concept node to improve navigation.",
  "The canvas shows good coverage of the topic. To deepen understanding, consider adding 'Question' nodes for each major concept — this forces active recall.",
  "I notice some isolated nodes that could benefit from connections. Try linking your note nodes to the nearest concept node to build a stronger knowledge graph.",
];

const SUGGESTION_PAIRS = [
  ['concept', 'question', 'These two nodes share related themes'],
  ['note', 'snapshot', 'Your note references this timestamp'],
  ['question', 'note', 'This note may answer your question'],
];

export default function AIPanel() {
  const { state, actions } = useApp();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { role: 'ai', text: "👋 Hi! I'm your AI assistant for this canvas. I can summarize your nodes, answer questions about your content, or suggest connections. What would you like to do?" }
  ]);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const bottomRef = useRef(null);

  const nodes = Object.values(state.nodes);

  const summarizeNodes = () => {
    if (nodes.length === 0) { actions.showToast('No nodes to summarize'); return; }
    setLoading(true);
    const themes = [...new Set(nodes.map(n => n.type))].join(', ');
    const titles = nodes.slice(0, 5).map(n => n.title).filter(Boolean).join('; ');
    setTimeout(() => {
      const resp = DUMMY_RESPONSES[1]
        .replace('{count}', nodes.length)
        .replace('{themes}', titles || themes);
      addMessage('user', '📊 Summarize my canvas nodes');
      addMessage('ai', resp);
      setLoading(false);
    }, 1200);
  };

  const suggestConnections = () => {
    if (nodes.length < 2) { actions.showToast('Need at least 2 nodes'); return; }
    setLoading(true);
    setTimeout(() => {
      const pairs = [];
      const nodeList = [...nodes];
      for (let i = 0; i < Math.min(3, nodeList.length - 1); i++) {
        const a = nodeList[i], b = nodeList[i + 1];
        const alreadyConnected = state.connections.some(c =>
          (c.from === a.id && c.to === b.id) || (c.from === b.id && c.to === a.id));
        if (!alreadyConnected) pairs.push({ a, b, reason: SUGGESTION_PAIRS[i % 3][2] });
      }
      setSuggestions(pairs);
      addMessage('user', '🔗 Suggest connections');
      addMessage('ai', pairs.length
        ? `I found ${pairs.length} potential connection${pairs.length > 1 ? 's' : ''} between your nodes. Review them below and click "Connect" to add them.`
        : 'All nearby nodes are already connected! Your canvas looks well-linked.');
      setLoading(false);
    }, 1000);
  };

  const askAI = () => {
    if (!input.trim()) return;
    const q = input.trim();
    setInput('');
    addMessage('user', q);
    setLoading(true);
    setTimeout(() => {
      const resp = pickResponse(q, nodes);
      addMessage('ai', resp);
      setLoading(false);
    }, 800 + Math.random() * 800);
  };

  const addMessage = (role, text) => {
    setMessages(m => [...m, { role, text }]);
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
  };

  const pickResponse = (q, nodes) => {
    const ql = q.toLowerCase();
    if (ql.includes('summar')) return `Your canvas has ${nodes.length} nodes covering: ${nodes.slice(0, 4).map(n => n.title).join(', ')}. The content spans ${[...new Set(nodes.map(n => n.type))].join(', ')} node types.`;
    if (ql.includes('connect') || ql.includes('link')) return "To connect nodes, drag from the connector dots on the edges of any node. Or click the chain icon in the node header and then click another node.";
    if (ql.includes('export')) return "You can export the canvas as PNG using the Export button in the header, or download the full project as JSON using the Download button.";
    if (ql.includes('tag')) return "Tags help you organise and filter nodes. Click '+ tag' on any node to add a tag. Use the tag filter in the header to show only tagged nodes.";
    if (ql.includes('template')) return "Templates are available from the Dashboard. Click 'From Template' to start with Student, Project, or Brainstorm layouts pre-built for you.";
    const idx = Math.floor(Math.random() * DUMMY_RESPONSES.length);
    return DUMMY_RESPONSES[idx].replace('{count}', nodes.length).replace('{themes}', nodes.slice(0, 3).map(n => n.title).join(', ') || 'various topics');
  };

  const applyConnection = (pair) => {
    actions.createConnection(pair.a.id, 'right', pair.b.id, 'left');
    setSuggestions(s => s.filter(p => p !== pair));
    actions.showToast('Connection added!');
  };

  return (
    <div className="ai-panel">
      <div className="ai-panel-header">
        <div className="ai-panel-title">
          <div className="ai-avatar">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2a10 10 0 1 0 10 10H12V2z"/><path d="M21.18 8.02c-1-2.3-2.85-4.17-5.16-5.18"/>
            </svg>
          </div>
          AI Assistant
          <span className="ai-badge">UI Preview</span>
        </div>
        <button className="ai-close" onClick={actions.toggleAIPanel}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      {/* Quick Actions */}
      <div className="ai-quick-actions">
        <button className="ai-action-btn" onClick={summarizeNodes} disabled={loading}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
            <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
          </svg>
          Summarize Nodes
        </button>
        <button className="ai-action-btn" onClick={suggestConnections} disabled={loading}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
          </svg>
          Suggest Connections
        </button>
      </div>

      {/* Messages */}
      <div className="ai-messages">
        {messages.map((m, i) => (
          <div key={i} className={`ai-msg ai-msg-${m.role}`}>
            {m.role === 'ai' && (
              <div className="ai-msg-avatar">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 2a10 10 0 1 0 10 10H12V2z"/>
                </svg>
              </div>
            )}
            <div className="ai-msg-bubble">{m.text}</div>
          </div>
        ))}
        {loading && (
          <div className="ai-msg ai-msg-ai">
            <div className="ai-msg-avatar">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2a10 10 0 1 0 10 10H12V2z"/></svg>
            </div>
            <div className="ai-loading">
              <span/><span/><span/>
            </div>
          </div>
        )}

        {/* Suggestions */}
        {suggestions.length > 0 && (
          <div className="ai-suggestions">
            {suggestions.map((pair, i) => (
              <div key={i} className="ai-suggestion-card">
                <div className="sug-nodes">
                  <span className="sug-node">{pair.a.title}</span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                  <span className="sug-node">{pair.b.title}</span>
                </div>
                <div className="sug-reason">{pair.reason}</div>
                <button className="sug-connect-btn" onClick={() => applyConnection(pair)}>Connect</button>
              </div>
            ))}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="ai-input-row">
        <input
          className="ai-input"
          placeholder="Ask anything about your canvas…"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && askAI()}
          disabled={loading}
        />
        <button className="ai-send" onClick={askAI} disabled={loading || !input.trim()}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
