import React, { useEffect, useRef } from 'react';
import { useApp } from '../../store/AppContext';

const CANVAS_W = 4000, CANVAS_H = 3000;

export default function Minimap({ scrollRef }) {
  const { state } = useApp();
  const canvasRef = useRef(null);
  const vpRef = useRef(null);

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    const sx = W / CANVAS_W, sy = H / CANVAS_H;

    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#17171a'; ctx.fillRect(0, 0, W, H);

    // connections
    ctx.strokeStyle = 'rgba(255,255,255,0.15)'; ctx.lineWidth = 0.5;
    state.connections.forEach(c => {
      const nf = state.nodes[c.from], nt = state.nodes[c.to];
      if (!nf || !nt) return;
      ctx.beginPath();
      ctx.moveTo((nf.x + nf.w / 2) * sx, (nf.y + (document.getElementById(c.from)?.offsetHeight || 80) / 2) * sy);
      ctx.lineTo((nt.x + nt.w / 2) * sx, (nt.y + (document.getElementById(c.to)?.offsetHeight || 80) / 2) * sy);
      ctx.stroke();
    });

    // nodes
    const colors = { default: '#22222a', blue: '#1a2540', green: '#122820', amber: '#2a1f08', rose: '#2a0f15', violet: '#1d1630' };
    Object.values(state.nodes).forEach(n => {
      const el = document.getElementById(n.id);
      const h = el ? el.offsetHeight : 80;
      ctx.fillStyle = colors[n.color] || '#22222a';
      ctx.strokeStyle = n.id === state.selectedNode ? '#f5a623' : 'rgba(255,255,255,0.1)';
      ctx.lineWidth = n.id === state.selectedNode ? 1.5 : 0.5;
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(n.x * sx, n.y * sy, n.w * sx, h * sy, 2);
      else ctx.rect(n.x * sx, n.y * sy, n.w * sx, h * sy);
      ctx.fill(); ctx.stroke();
    });

    // viewport
    const scroll = scrollRef.current;
    if (scroll && vpRef.current) {
      const vp = vpRef.current;
      const vx = (scroll.scrollLeft / state.zoom) * sx;
      const vy = (scroll.scrollTop / state.zoom) * sy;
      const vw = (scroll.clientWidth / state.zoom) * sx;
      const vh = (scroll.clientHeight / state.zoom) * sy;
      vp.style.left = vx + 'px'; vp.style.top = vy + 'px';
      vp.style.width = Math.min(vw, W - vx) + 'px';
      vp.style.height = Math.min(vh, H - vy) + 'px';
    }
  };

  useEffect(() => {
    draw();
    const h = () => draw();
    window.addEventListener('kexo:minimapUpdate', h);
    const interval = setInterval(draw, 2000);
    return () => { window.removeEventListener('kexo:minimapUpdate', h); clearInterval(interval); };
  }, [state.nodes, state.connections, state.selectedNode, state.zoom]);

  return (
    <div className="minimap">
      <canvas ref={canvasRef} id="minimapCanvas" width={160} height={100} />
      <div className="minimap-viewport" ref={vpRef} />
    </div>
  );
}
