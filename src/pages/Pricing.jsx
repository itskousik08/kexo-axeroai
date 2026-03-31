import React from 'react';
import { Link } from 'react-router-dom';
import BrandLogo from '../components/ui/BrandLogo';
import './Pricing.css';

const FREE = [
  'Unlimited nodes', 'All 4 node types', 'Visual connections', 'YouTube timestamp capture',
  'T-key quick capture', 'Node search & filtering', 'Node tags system',
  'Bulk select & move', 'Voice notes (audio)', '3 canvas templates',
  'AI panel (UI preview)', 'Export PNG', 'Download JSON', 'Dark & light mode',
  'Auto-save to browser', 'Minimap', 'Undo / Redo (50 steps)', 'Drawing & annotation',
];

const PRO = [
  'Everything in Free', 'Real AI integration (GPT/Gemini)', 'Cloud sync across devices',
  'Live collaboration', 'Unlimited templates', 'PDF & doc import with AI extraction',
  'Custom AI prompts', 'Export to PDF / Markdown', 'Share with access control',
  'Priority support', 'Early access to new features', 'Remove Kexo branding',
];

const CHECK = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

export default function Pricing() {
  return (
    <div className="pricing-page">
      <nav className="pricing-nav">
        <Link to="/" className="nav-brand">
          <BrandLogo size={34} />
          <span className="brand-name">kexo <em>AI</em></span>
        </Link>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 10 }}>
          <Link to="/dashboard" className="btn-ghost">Dashboard</Link>
          <Link to="/settings" className="btn-ghost">Settings</Link>
        </div>
      </nav>

      <div className="pricing-body">
        <div className="pricing-header">
          <div className="section-label">Pricing</div>
          <h1>Simple, transparent pricing</h1>
          <p>Start free. Upgrade when you're ready.</p>
        </div>

        <div className="pricing-grid">
          {/* FREE */}
          <div className="pricing-card">
            <div className="plan-top">
              <div className="plan-name">Free</div>
              <div className="plan-price">$0<span>/month</span></div>
              <div className="plan-desc">Everything you need to think visually. No credit card required.</div>
              <Link to="/dashboard" className="btn-primary" style={{ justifyContent: 'center', marginTop: 24 }}>
                Start Free Now
              </Link>
            </div>
            <div className="plan-features">
              {FREE.map(f => (
                <div key={f} className="plan-feature">
                  <span className="feature-check green"><CHECK /></span>
                  {f}
                </div>
              ))}
            </div>
          </div>

          {/* PRO */}
          <div className="pricing-card pricing-card-pro">
            <div className="pro-badge">Coming Soon</div>
            <div className="plan-top">
              <div className="plan-name">Pro</div>
              <div className="plan-price">$9<span>/month</span></div>
              <div className="plan-desc">For power users who want real AI, cloud sync, and collaboration.</div>
              <button className="btn-outline" style={{ justifyContent: 'center', marginTop: 24, width: '100%', opacity: 0.6, cursor: 'not-allowed' }}>
                Join Waitlist
              </button>
            </div>
            <div className="plan-features">
              {PRO.map(f => (
                <div key={f} className="plan-feature">
                  <span className="feature-check amber"><CHECK /></span>
                  {f}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Comparison Table */}
        <div className="comparison-section">
          <h2>Feature Comparison</h2>
          <div className="comparison-table">
            <div className="comp-header">
              <div>Feature</div>
              <div>Free</div>
              <div>Pro</div>
            </div>
            {COMPARISON.map(row => (
              <div key={row[0]} className="comp-row">
                <div className="comp-feature">{row[0]}</div>
                <div className="comp-val">{row[1] === true ? <span className="tick green">✓</span> : row[1] === false ? <span className="cross">—</span> : <span className="comp-text">{row[1]}</span>}</div>
                <div className="comp-val">{row[2] === true ? <span className="tick amber">✓</span> : row[2] === false ? <span className="cross">—</span> : <span className="comp-text">{row[2]}</span>}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="pricing-faq">
          <h2>Questions</h2>
          {[
            ['Is it really free?', 'Yes, 100%. Kexo AI runs entirely in your browser with no account required. We monetize via the Pro tier, not ads or data.'],
            ['Where is my data stored?', 'All your data is saved to your browser\'s localStorage. Nothing is sent to any server. You own your data completely.'],
            ['When will Pro be available?', 'We\'re building Pro features now. Join the waitlist to be notified when it launches.'],
            ['Can I export my data?', 'Yes, you can download your full canvas as JSON at any time from the workspace header. Import it back at any time.'],
          ].map(([q, a]) => (
            <div key={q} className="faq-item">
              <div className="faq-q">{q}</div>
              <div className="faq-a">{a}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const COMPARISON = [
  ['Nodes', 'Unlimited', 'Unlimited'],
  ['Projects', 'Unlimited', 'Unlimited'],
  ['Node types', '4 types', '4 types + custom'],
  ['YouTube timestamps', true, true],
  ['T-key capture', true, true],
  ['AI panel', 'UI preview', 'Real AI (GPT/Gemini)'],
  ['Custom AI prompts', false, true],
  ['Cloud sync', false, true],
  ['Collaboration', false, true],
  ['Templates', '3 built-in', 'Unlimited custom'],
  ['Export formats', 'PNG, JSON', 'PNG, JSON, PDF, MD'],
  ['Storage', 'Browser only', 'Cloud (unlimited)'],
  ['Support', 'Community', 'Priority email'],
];
