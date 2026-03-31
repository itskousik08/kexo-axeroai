// Debounce
export function debounce(fn, delay) {
  let timer;
  return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), delay); };
}

// Format seconds → MM:SS
export function formatTime(secs) {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

// Extract YouTube video ID
export function extractVideoId(url) {
  const m = url.match(/(?:youtu\.be\/|v=|embed\/)([A-Za-z0-9_-]{11})/);
  return m ? m[1] : null;
}

// Escape HTML
export function escHtml(s) {
  return (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// Build cubic bezier SVG path between two connector points
export function buildPath(x1, y1, x2, y2, fromSide, toSide) {
  const dist = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
  const curve = Math.min(dist * 0.45, 120);
  let c1x = x1, c1y = y1, c2x = x2, c2y = y2;
  if (fromSide === 'bottom') c1y += curve;
  else if (fromSide === 'top') c1y -= curve;
  else if (fromSide === 'right') c1x += curve;
  else if (fromSide === 'left') c1x -= curve;
  else c1y += curve;
  if (toSide === 'top') c2y -= curve;
  else if (toSide === 'bottom') c2y += curve;
  else if (toSide === 'left') c2x -= curve;
  else if (toSide === 'right') c2x += curve;
  else c2y -= curve;
  return `M ${x1} ${y1} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${x2} ${y2}`;
}

// Get connector dot position for a node
export function getConnectorPos(node, side, nodeEl) {
  const h = nodeEl ? nodeEl.offsetHeight : 100;
  switch (side) {
    case 'top': return { x: node.x + node.w / 2, y: node.y };
    case 'bottom': return { x: node.x + node.w / 2, y: node.y + h };
    case 'left': return { x: node.x, y: node.y + h / 2 };
    case 'right': return { x: node.x + node.w, y: node.y + h / 2 };
    default: return { x: node.x + node.w / 2, y: node.y + h };
  }
}

// Generate random project/share IDs
export function genId() {
  return Math.random().toString(36).substr(2, 9);
}

// Time ago string
export function timeAgo(ts) {
  if (!ts) return 'never';
  const secs = Math.floor((Date.now() - ts) / 1000);
  if (secs < 5) return 'just now';
  if (secs < 60) return `${secs}s ago`;
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return new Date(ts).toLocaleDateString();
}

// Stop event propagation helper
export function stopProp(e) { e.stopPropagation(); }

// All available node colors
export const NODE_COLORS = ['default', 'blue', 'green', 'amber', 'rose', 'violet'];

// All available tags with colors
export const TAG_COLOR_MAP = {
  important: '#f25f7a',
  review: '#f5a623',
  question: '#9b74f5',
  idea: '#4f8ef7',
  done: '#2dd4a0',
  todo: '#a09fad',
};
