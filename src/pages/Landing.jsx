import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import BrandLogo from '../components/ui/BrandLogo';
import './Landing.css';

const PLANS_PREVIEW = [
  { name: 'Free', price: '$0', storage: '100 MB', credits: '—', color: '#a09fad' },
  { name: 'Starter', price: '$4', originalPrice: '$9', storage: '1 GB', credits: '5,000', color: '#4f8ef7', badge: 'Best Deal' },
  { name: 'Standard', price: '$20', storage: '5 GB', credits: '50,000', color: '#f5a623', popular: true },
  { name: 'Pro', price: '$40', storage: '15 GB', credits: '150,000', color: '#9b74f5' },
  { name: 'Team', price: 'Custom', storage: '50 GB+', credits: '500K+', color: '#2dd4a0' },
];

const TESTIMONIALS = [
  { name: 'Priya Sharma', role: 'CS Student, IIT Delhi', text: 'Kexo replaced all my study apps. The flow canvas makes linking lecture concepts so natural I actually understand the material now.', rating: 5 },
  { name: 'Marcus Webb', role: 'Product Manager', text: 'I use the Flow Canvas for sprint planning and it completely changed how I structure work. The connection lines make dependencies obvious.', rating: 5 },
  { name: 'Aiko Tanaka', role: 'UX Researcher', text: 'Free Canvas is my go-to for research synthesis. I can drop anywhere and restructure my thinking without rigid boxes getting in the way.', rating: 5 },
  { name: 'Daniel Reyes', role: 'Startup Founder', text: 'Traditional mode is perfect for meeting notes. Clean, fast, and the AI can summarize everything when I\'m done. Game changer.', rating: 5 },
];

const FEATURES = [
  { title: 'Three Canvas Modes', desc: 'Flow Canvas for visual thinkers, Traditional for note-takers, Free Canvas for creative souls.', color: 'amber', icon: '<rect x="2" y="2" width="20" height="20" rx="4"/><path d="M12 8v8M8 12h8"/>' },
  { title: 'Visual Connections', desc: 'Draw bezier curves between nodes to map your thinking in a spatial, connected way.', color: 'blue', icon: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>' },
  { title: 'Floating Control Bar', desc: 'One premium bar holds everything — add notes, images, code, links, voice and AI without cluttering the screen.', color: 'violet', icon: '<rect x="3" y="11" width="18" height="10" rx="4"/><circle cx="7" cy="16" r="1"/><circle cx="12" cy="16" r="1"/><circle cx="17" cy="16" r="1"/>' },
  { title: 'Voice Notes', desc: 'Record live or upload audio files. Voice elements live as first-class nodes on your canvas.', color: 'green', icon: '<path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/>' },
  { title: 'AI Assistant', desc: 'Summarize nodes, suggest connections, ask questions about your canvas. AI lives in a side panel.', color: 'amber', icon: '<path d="M12 2a10 10 0 1 0 10 10H12V2z"/><path d="M21.18 8.02c-1-2.3-2.85-4.17-5.16-5.18"/>' },
  { title: 'Pre-built Templates', desc: 'Jump-start with Student, Project, or Brainstorm templates. Full layouts you just fill in.', color: 'rose', icon: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>' },
  { title: 'Node Search', desc: 'Real-time search highlights matching nodes across your entire canvas instantly.', color: 'blue', icon: '<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>' },
  { title: 'Auto Save', desc: 'Everything saves automatically as you type. Your work is never lost.', color: 'green', icon: '<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>' },
];

export default function Landing() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activePlan, setActivePlan] = useState(2);

  return (
    <div className="landing">
      {/* NAV */}
      <nav className="landing-nav">
        <Link to="/" className="nav-brand">
          <BrandLogo size={36} />
          <span className="brand-name">kexo <em>AI</em></span>
        </Link>
        <div className="nav-links nav-links--desktop">
          <a href="#features" className="nav-link">Features</a>
          <a href="#pricing" className="nav-link">Pricing</a>
          <a href="#roadmap" className="nav-link">Roadmap</a>
          <Link to="/settings" className="nav-link">Settings</Link>
          <Link to="/dashboard" className="btn-nav-cta">
            Start Free
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </Link>
        </div>
        <button className="nav-hamburger" onClick={() => setMenuOpen(m => !m)} aria-label="Open menu">
          {menuOpen
            ? <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            : <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="8" x2="21" y2="8"/><line x1="3" y1="16" x2="21" y2="16"/></svg>}
        </button>
        {menuOpen && (
          <div className="nav-drawer" onClick={() => setMenuOpen(false)}>
            <a href="#features" className="nav-drawer-link">Features</a>
            <a href="#pricing" className="nav-drawer-link">Pricing</a>
            <a href="#roadmap" className="nav-drawer-link">Roadmap</a>
            <Link to="/settings" className="nav-drawer-link">Settings</Link>
            <Link to="/dashboard" className="btn-primary" style={{ marginTop: 12 }}>Start Free</Link>
          </div>
        )}
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-glow" /><div className="hero-glow2" />
        <div className="hero-badge"><div className="badge-dot" /> Now in Early Access — Free to Use</div>
        <h1>The <span className="gradient-text">Next Generation</span><br />Thinking System</h1>
        <p className="hero-sub">Kexo AI turns scattered ideas into a structured visual canvas. Three canvas modes, AI assistant, voice notes, and visual connections — all in one place.</p>
        <div className="hero-actions">
          <Link to="/dashboard" className="btn-primary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
            Start Free — No Signup
          </Link>
          <a href="#how-it-works" className="btn-outline">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/></svg>
            See How It Works
          </a>
        </div>
        <p className="hero-note">No credit card &nbsp;&bull;&nbsp; No account &nbsp;&bull;&nbsp; Runs in your browser</p>

        {/* Canvas Preview */}
        <div className="hero-visual">
          <div className="hero-visual-frame">
            <div className="frame-titlebar">
              <div className="frame-dot red"/><div className="frame-dot yellow"/><div className="frame-dot green"/>
              <div className="frame-url">kexo.ai/canvas</div>
            </div>
            <div className="canvas-preview">
              <svg width="100%" height="100%" viewBox="0 0 960 320" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
                <path d="M 230 120 C 280 120, 320 160, 370 160" stroke="rgba(255,255,255,0.18)" strokeWidth="1.5" fill="none"/>
                <path d="M 370 210 C 420 210, 460 250, 510 250" stroke="rgba(79,142,247,0.4)" strokeWidth="1.5" fill="none"/>
                <path d="M 590 155 C 640 140, 680 130, 730 120" stroke="rgba(245,166,35,0.35)" strokeWidth="1.5" fill="none"/>
                <rect x="80" y="90" width="150" height="90" rx="10" fill="#1a2540" stroke="rgba(79,142,247,0.5)" strokeWidth="1"/>
                <text x="104" y="109" fontFamily="Syne,sans-serif" fontSize="8" fontWeight="700" fill="#4f8ef7" letterSpacing="0.8">CONCEPT</text>
                <text x="92" y="132" fontFamily="Syne,sans-serif" fontSize="11" fontWeight="700" fill="#f0eff4">Visual Thinking</text>
                <text x="92" y="148" fontFamily="sans-serif" fontSize="9" fill="#a09fad">Connect your ideas spatially</text>
                <rect x="370" y="130" width="160" height="92" rx="10" fill="#1d1630" stroke="rgba(155,116,245,0.5)" strokeWidth="1"/>
                <text x="393" y="149" fontFamily="Syne,sans-serif" fontSize="8" fontWeight="700" fill="#9b74f5" letterSpacing="0.8">QUESTION</text>
                <text x="382" y="172" fontFamily="Syne,sans-serif" fontSize="11" fontWeight="700" fill="#f0eff4">What to Learn?</text>
                <text x="382" y="188" fontFamily="sans-serif" fontSize="9" fill="#a09fad">Define your learning goal</text>
                <rect x="510" y="215" width="160" height="75" rx="10" fill="#122820" stroke="rgba(45,212,160,0.5)" strokeWidth="1"/>
                <text x="533" y="234" fontFamily="Syne,sans-serif" fontSize="8" fontWeight="700" fill="#2dd4a0" letterSpacing="0.8">NOTE</text>
                <text x="522" y="257" fontFamily="Syne,sans-serif" fontSize="11" fontWeight="700" fill="#f0eff4">Key Insight</text>
                <rect x="730" y="85" width="150" height="88" rx="10" fill="#1d1a08" stroke="rgba(245,166,35,0.5)" strokeWidth="1"/>
                <text x="752" y="103" fontFamily="Syne,sans-serif" fontSize="8" fontWeight="700" fill="#f5a623" letterSpacing="0.8">CONCEPT</text>
                <text x="742" y="124" fontFamily="Syne,sans-serif" fontSize="11" fontWeight="700" fill="#f0eff4">Summary</text>
                {/* Floating Bar */}
                <rect x="340" y="275" width="280" height="36" rx="18" fill="rgba(15,15,17,0.85)" stroke="rgba(255,255,255,0.1)" strokeWidth="1"/>
                <circle cx="365" cy="293" r="7" fill="rgba(45,212,160,0.3)"/>
                <circle cx="390" cy="293" r="7" fill="rgba(245,166,35,0.3)"/>
                <circle cx="415" cy="293" r="7" fill="rgba(155,116,245,0.3)"/>
                <circle cx="440" cy="293" r="7" fill="rgba(79,142,247,0.3)"/>
                <circle cx="465" cy="293" r="7" fill="rgba(242,95,122,0.3)"/>
                <circle cx="490" cy="293" r="7" fill="rgba(79,142,247,0.3)"/>
                <circle cx="515" cy="293" r="7" fill="rgba(245,166,35,0.3)"/>
                <circle cx="540" cy="293" r="7" fill="rgba(155,116,245,0.3)"/>
                <circle cx="565" cy="293" r="7" fill="rgba(245,166,35,0.4)"/>
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* THREE THEMES */}
      <section className="themes-section" id="how-it-works">
        <div className="section-inner">
          <div className="section-label">Three Canvas Modes</div>
          <div className="section-divider"/>
          <h2 className="section-title">One tool, three ways<br/>to think.</h2>
          <div className="themes-grid">
            {[
              { name: 'Flow Canvas', desc: 'Box-based system with drag & drop, bezier connections, and YouTube timestamps. For structured visual thinkers.', color: '#f5a623', features: ['Drag & drop nodes', 'Connection lines', 'Node types', 'AI panel'], icon: '<rect x="2" y="4" width="8" height="6" rx="2"/><rect x="14" y="4" width="8" height="6" rx="2"/><rect x="8" y="14" width="8" height="6" rx="2"/><line x1="6" y1="10" x2="12" y2="14"/><line x1="18" y1="10" x2="12" y2="14"/>' },
              { name: 'Traditional', desc: 'Line-by-line notepad. Clean, distraction-free. Add images, voice, and AI assistance without visual clutter.', color: '#2dd4a0', features: ['Line-by-line notes', 'Image blocks', 'Voice blocks', 'AI support'], icon: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>' },
              { name: 'Free Canvas', desc: 'Click anywhere to write. No boxes, no rules. Fully free-form spatial canvas for creative flow.', color: '#9b74f5', features: ['Click to write', 'Free positioning', 'Resize freely', 'Rich text'], icon: '<path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/><path d="M15 5l4 4"/>' },
            ].map(t => (
              <div key={t.name} className="theme-card" style={{ '--tc': t.color }}>
                <div className="theme-card__icon" style={{ color: t.color, background: t.color + '15', borderColor: t.color + '30' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" dangerouslySetInnerHTML={{ __html: t.icon }} />
                </div>
                <div className="theme-card__name" style={{ color: t.color }}>{t.name}</div>
                <div className="theme-card__desc">{t.desc}</div>
                <ul className="theme-card__features">
                  {t.features.map(f => <li key={f}><span style={{ color: t.color }}>›</span> {f}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="features-section" id="features">
        <div className="section-inner">
          <div className="section-label">Features</div>
          <div className="section-divider"/>
          <h2 className="section-title">Everything you need to<br/>think more clearly.</h2>
          <div className="features-grid">
            {FEATURES.map(f => (
              <div key={f.title} className={`feature-card fi-${f.color}`}>
                <div className={`feature-icon fi-${f.color}`}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" dangerouslySetInnerHTML={{ __html: f.icon }} />
                </div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING PREVIEW */}
      <section className="pricing-section" id="pricing">
        <div className="section-inner">
          <div className="section-label">Pricing</div>
          <div className="section-divider"/>
          <h2 className="section-title">Start free.<br/>Upgrade when you're ready.</h2>
          <div className="landing-plans-slider">
            {PLANS_PREVIEW.map((p, i) => (
              <div
                key={p.name}
                className={`lp-card${activePlan === i ? ' lp-card--active' : ''}`}
                style={activePlan === i ? { borderColor: p.color + '44', background: p.color + '0e' } : {}}
                onClick={() => setActivePlan(i)}
              >
                {p.popular && <div className="lp-pop" style={{ background: p.color }}>Popular</div>}
                {p.badge && <div className="lp-badge" style={{ color: p.color, borderColor: p.color + '44' }}>{p.badge}</div>}
                <div className="lp-name" style={activePlan === i ? { color: p.color } : {}}>{p.name}</div>
                <div className="lp-price-row">
                  {p.originalPrice && <span className="lp-orig">{p.originalPrice}</span>}
                  <span className="lp-price" style={activePlan === i ? { color: p.color } : {}}>{p.price}</span>
                  {p.price !== 'Custom' && <span className="lp-mo">/mo</span>}
                </div>
                <div className="lp-meta"><span>{p.storage}</span><span>{p.credits !== '—' ? p.credits + ' credits' : 'No AI'}</span></div>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: 32 }}>
            <Link to="/pricing" className="btn-outline">
              See full pricing details
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </Link>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="testimonials-section">
        <div className="section-inner">
          <div className="section-label">Testimonials</div>
          <div className="section-divider"/>
          <h2 className="section-title">Loved by thinkers<br/>everywhere.</h2>
          <div className="testimonials-grid">
            {TESTIMONIALS.map(t => (
              <div key={t.name} className="testimonial-card">
                <div className="testimonial-stars">
                  {[...Array(t.rating)].map((_, i) => (
                    <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill="var(--accent)" stroke="var(--accent)" strokeWidth="1">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                    </svg>
                  ))}
                </div>
                <p className="testimonial-text">"{t.text}"</p>
                <div className="testimonial-author">
                  <div className="testimonial-avatar">{t.name[0]}</div>
                  <div>
                    <div className="testimonial-name">{t.name}</div>
                    <div className="testimonial-role">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ROADMAP */}
      <section className="coming-section" id="roadmap">
        <div className="section-inner">
          <div className="section-label">Coming Soon</div>
          <div className="section-divider"/>
          <h2 className="section-title">The roadmap is<br/>just getting started.</h2>
          <div className="coming-grid">
            {[
              { badge: 'In App Now', title: 'AI Assistant', desc: 'Ask your canvas questions. Summarize nodes. Suggest connections.' },
              { badge: 'Planned', title: 'Real AI Integration', desc: 'Connect your own API key for live GPT/Gemini responses.' },
              { badge: 'Planned', title: 'Live Collaboration', desc: 'Share canvases with teammates. Work together in real time.' },
            ].map(c => (
              <div key={c.title} className="coming-card">
                <div className="coming-badge">{c.badge}</div>
                <h3>{c.title}</h3>
                <p>{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="cta-inner">
          <h2>Start thinking more clearly today.</h2>
          <p>Free to use. No account required. Runs entirely in your browser.</p>
          <Link to="/dashboard" className="btn-primary" style={{ margin: '0 auto' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
            Start Free Now
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="landing-footer">
        <div className="footer-inner">
          <div className="footer-brand-col">
            <Link to="/" className="footer-brand">
              <BrandLogo size={30} />
              <span className="brand-name" style={{ fontSize: 15 }}>kexo <em>AI</em></span>
            </Link>
            <p className="footer-tagline">Next Generation Thinking System</p>
          </div>
          <div className="footer-links-col">
            <div className="footer-link-group">
              <div className="footer-link-label">Product</div>
              <a href="#features" className="footer-link">Features</a>
              <Link to="/pricing" className="footer-link">Pricing</Link>
              <a href="#roadmap" className="footer-link">Roadmap</a>
            </div>
            <div className="footer-link-group">
              <div className="footer-link-label">App</div>
              <Link to="/dashboard" className="footer-link">Dashboard</Link>
              <Link to="/settings" className="footer-link">Settings</Link>
            </div>
          </div>
          <div className="footer-right-col">
            <p>Built by <strong>Kousik Debnath</strong></p>
            <p>A product by <strong>AxeroAI</strong></p>
            <p style={{ marginTop: 8, color: 'var(--text3)', fontSize: 12 }}>© 2025 AxeroAI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
