import React from 'react';
import { Link } from 'react-router-dom';
import BrandLogo from '../components/ui/BrandLogo';
import './Landing.css';

export default function Landing() {
  return (
    <div className="landing">
      {/* NAV */}
      <nav className="landing-nav">
        <Link to="/" className="nav-brand">
          <BrandLogo size={36} />
          <span className="brand-name">kexo <em>AI</em></span>
        </Link>
        <div className="nav-links">
          <a href="#features" className="nav-link">Features</a>
          <a href="#roadmap" className="nav-link">Roadmap</a>
          <Link to="/pricing" className="nav-link">Pricing</Link>
          <Link to="/dashboard" className="btn-nav-cta">
            Start Free
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
            </svg>
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-glow" /><div className="hero-glow2" />
        <div className="hero-badge">
          <div className="badge-dot" />
          Now in Early Access — Free to Use
        </div>
        <h1>The <span className="gradient-text">Next Generation</span><br />Thinking System</h1>
        <p className="hero-sub">
          Kexo AI turns scattered ideas into a structured visual canvas. Build mind maps, capture video moments, and link your thinking — all in one place.
        </p>
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
        <p className="hero-note">No credit card • No account • Runs in your browser</p>

        {/* Canvas Preview */}
        <div className="hero-visual">
          <div className="hero-visual-frame">
            <div className="frame-titlebar">
              <div className="frame-dot red"/><div className="frame-dot yellow"/><div className="frame-dot green"/>
              <div className="frame-url"/>
            </div>
            <div className="canvas-preview">
              <svg width="100%" height="100%" viewBox="0 0 960 340" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
                <path d="M 230 120 C 280 120, 320 160, 370 160" stroke="rgba(255,255,255,0.18)" strokeWidth="1.5" fill="none"/>
                <path d="M 370 210 C 420 210, 460 250, 510 250" stroke="rgba(79,142,247,0.4)" strokeWidth="1.5" fill="none"/>
                <path d="M 590 155 C 640 140, 680 130, 730 120" stroke="rgba(245,166,35,0.35)" strokeWidth="1.5" fill="none"/>
                <rect x="80" y="90" width="150" height="90" rx="10" fill="#1a2540" stroke="rgba(79,142,247,0.5)" strokeWidth="1"/>
                <text x="104" y="109" fontFamily="Syne,sans-serif" fontSize="8" fontWeight="700" fill="#4f8ef7" letterSpacing="0.8">CONCEPT</text>
                <text x="92" y="132" fontFamily="Syne,sans-serif" fontSize="11" fontWeight="700" fill="#f0eff4">Getting Started</text>
                <text x="92" y="148" fontFamily="sans-serif" fontSize="9" fill="#a09fad">Paste a YouTube URL to begin.</text>
                <rect x="370" y="130" width="160" height="92" rx="10" fill="#1d1630" stroke="rgba(155,116,245,0.5)" strokeWidth="1"/>
                <text x="393" y="149" fontFamily="Syne,sans-serif" fontSize="8" fontWeight="700" fill="#9b74f5" letterSpacing="0.8">QUESTION</text>
                <text x="382" y="172" fontFamily="Syne,sans-serif" fontSize="11" fontWeight="700" fill="#f0eff4">What to Learn?</text>
                <text x="382" y="188" fontFamily="sans-serif" fontSize="9" fill="#a09fad">Define your learning goal</text>
                <rect x="510" y="215" width="160" height="92" rx="10" fill="#2a1f08" stroke="rgba(245,166,35,0.5)" strokeWidth="1"/>
                <text x="533" y="234" fontFamily="Syne,sans-serif" fontSize="8" fontWeight="700" fill="#f5a623" letterSpacing="0.8">SNAPSHOT</text>
                <text x="536" y="258" fontFamily="Syne,sans-serif" fontSize="8" fontWeight="700" fill="#f5a623">⏱ 04:32</text>
                <text x="522" y="275" fontFamily="Syne,sans-serif" fontSize="11" fontWeight="700" fill="#f0eff4">Key Insight</text>
                <rect x="730" y="85" width="150" height="88" rx="10" fill="#122820" stroke="rgba(45,212,160,0.5)" strokeWidth="1"/>
                <text x="752" y="103" fontFamily="Syne,sans-serif" fontSize="8" fontWeight="700" fill="#2dd4a0" letterSpacing="0.8">NOTE</text>
                <text x="742" y="124" fontFamily="Syne,sans-serif" fontSize="11" fontWeight="700" fill="#f0eff4">Summary</text>
                <circle cx="910" cy="300" r="22" fill="url(#fabG)" opacity="0.9"/>
                <text x="910" y="307" fontSize="20" textAnchor="middle" fill="#000">+</text>
                <defs><radialGradient id="fabG" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#f5a623"/><stop offset="100%" stopColor="#ff6b35"/></radialGradient></defs>
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* PROBLEM */}
      <section className="problem-section" id="how-it-works">
        <div className="section-inner">
          <div className="section-label">The Problem</div>
          <div className="section-divider"/>
          <h2 className="section-title">Thinking is scattered.<br/>Learning is broken.</h2>
          <p className="section-sub">You consume content constantly — but nothing sticks. Ideas get lost. Connections never form.</p>
          <div className="problem-grid">
            {[
              { title: 'Notes Without Structure', desc: 'Linear walls of text with no hierarchy or visual overview.' },
              { title: 'Lost Video Insights', desc: 'A great insight at minute 23. But you can never find it again.' },
              { title: 'Ideas Never Connect', desc: 'Your notes, timestamps, thoughts — they live in silos.' },
            ].map((c) => (
              <div key={c.title} className="problem-card">
                <div className="problem-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                </div>
                <h3>{c.title}</h3>
                <p>{c.desc}</p>
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
              <div key={f.title} className="feature-card">
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

      {/* ROADMAP */}
      <section className="coming-section" id="roadmap">
        <div className="section-inner">
          <div className="section-label">Coming Soon</div>
          <div className="section-divider"/>
          <h2 className="section-title">The roadmap is<br/>just getting started.</h2>
          <div className="coming-grid">
            {[
              { badge: 'In App Now', title: 'AI Assistant (UI)', desc: 'Ask your canvas questions. Summarize nodes. Suggest connections.' },
              { badge: 'Planned', title: 'Real AI Integration', desc: 'Connect your own Gemini or OpenAI key for live AI responses.' },
              { badge: 'Planned', title: 'Collaboration', desc: 'Share canvases with teammates. Work together in real time.' },
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
          <Link to="/" className="footer-brand">
            <BrandLogo size={30} />
            <span className="brand-name" style={{ fontSize: 15 }}>kexo <em>AI</em></span>
          </Link>
          <div className="footer-info">
            <p>A product by <strong>AxeroAI</strong></p>
            <p>Next Generation Thinking System</p>
          </div>
          <div className="footer-right">
            <p>Built by <a href="#">Kousik Debnath</a></p>
            <p>© 2025 AxeroAI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

const FEATURES = [
  { title: '4 Node Types', desc: 'Concept, Question, Note, Snapshot — each with purpose.', color: 'blue', icon: '<rect x="2" y="2" width="20" height="20" rx="4"/><path d="M12 8v8M8 12h8"/>' },
  { title: 'Visual Connections', desc: 'Drag connector dots to link nodes with smooth bezier curves.', color: 'amber', icon: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>' },
  { title: 'YouTube Timestamps', desc: 'Capture exact moments as nodes. Click to jump back instantly.', color: 'green', icon: '<circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/>' },
  { title: 'T-Key Capture', desc: 'Press T on keyboard to instantly capture the current timestamp.', color: 'violet', icon: '<polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/>' },
  { title: 'Node Search', desc: 'Real-time search highlights matching nodes across your canvas.', color: 'blue', icon: '<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>' },
  { title: 'AI Panel', desc: 'Summarize nodes, ask questions, get AI-powered suggestions.', color: 'amber', icon: '<path d="M12 2a10 10 0 1 0 10 10H12V2z"/><path d="M21.18 8.02c-1-2.3-2.85-4.17-5.16-5.18"/>' },
  { title: 'Templates', desc: 'Student, Project, and Brainstorm templates to start fast.', color: 'green', icon: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>' },
  { title: 'Bulk Select', desc: 'Select multiple nodes and move them together.', color: 'rose', icon: '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>' },
  { title: 'Voice Notes', desc: 'Attach audio recordings to any node for richer context.', color: 'violet', icon: '<path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/>' },
];
