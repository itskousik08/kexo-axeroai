import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import BrandLogo from '../components/ui/BrandLogo';
import './Pricing.css';

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: '$0',
    period: '/month',
    storage: '100 MB',
    credits: null,
    creditsLabel: 'No AI credits',
    tag: null,
    popular: false,
    desc: 'Everything you need to start thinking visually.',
    cta: 'Start Free',
    ctaTo: '/dashboard',
    ctaHref: null,
    accentColor: '#a09fad',
    features: [
      'All 3 canvas themes (basic)',
      'Basic canvas access',
      'Unlimited projects*',
      'Auto-save to browser',
      'Export PNG & JSON',
      'Node search & filter',
      'Undo / Redo (50 steps)',
    ],
    footnote: '* Storage limit applies — new projects blocked when full',
  },
  {
    id: 'starter',
    name: 'Starter',
    price: '$4',
    originalPrice: '$9',
    period: '/month',
    storage: '1 GB',
    credits: '5,000',
    creditsLabel: '5,000 AI credits / mo',
    tag: 'Best Deal',
    popular: false,
    desc: 'Great for students and solo learners.',
    cta: 'Get Starter',
    ctaTo: null,
    ctaHref: '#waitlist',
    accentColor: '#4f8ef7',
    features: [
      'Everything in Free',
      'Basic AI access',
      'Limited image generation',
      'All 3 themes unlocked',
      'Pre-built templates',
      'Unlimited projects',
    ],
  },
  {
    id: 'standard',
    name: 'Standard',
    price: '$20',
    period: '/month',
    storage: '5 GB',
    credits: '50,000',
    creditsLabel: '50,000 AI credits / mo',
    tag: 'Most Popular',
    popular: true,
    desc: 'Full AI power for everyday creators.',
    cta: 'Get Standard',
    ctaTo: null,
    ctaHref: '#waitlist',
    accentColor: '#f5a623',
    features: [
      'Everything in Starter',
      'Full AI access (medium usage)',
      'Image generation',
      'All themes unlocked',
      'Pre-built templates',
      'Better performance',
      'Unlimited projects',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$40',
    period: '/month',
    storage: '15 GB',
    credits: '150,000',
    creditsLabel: '150,000 AI credits / mo',
    tag: null,
    popular: false,
    desc: 'Advanced AI for power users.',
    cta: 'Get Pro',
    ctaTo: null,
    ctaHref: '#waitlist',
    accentColor: '#9b74f5',
    features: [
      'Everything in Standard',
      'Advanced AI usage',
      'Faster AI responses',
      'High-quality image gen',
      'Priority processing',
      'Unlimited projects',
    ],
  },
  {
    id: 'team',
    name: 'Team',
    price: 'Custom',
    period: '',
    storage: '50 GB+',
    credits: '500,000+',
    creditsLabel: '500,000+ AI credits / mo',
    tag: null,
    popular: false,
    desc: 'For teams who build and think together.',
    cta: 'Contact Us',
    ctaTo: null,
    ctaHref: 'mailto:hello@kexo.ai',
    accentColor: '#2dd4a0',
    features: [
      'Everything in Pro',
      'Team collaboration',
      'Shared canvas workspace',
      'Admin controls',
      'Priority support',
      'Unlimited projects',
    ],
  },
];

const COMPARISON = [
  { label: 'Storage',          vals: ['100 MB',  '1 GB',    '5 GB',    '15 GB',   '50 GB+'] },
  { label: 'AI Credits / mo',  vals: ['—',        '5,000',   '50,000',  '150,000', '500K+'] },
  { label: 'All Themes',       vals: [true, true, true, true, true] },
  { label: 'Pre-built Temp.', vals: [false, true, true, true, true] },
  { label: 'Image Generation', vals: [false, 'Limited', true, 'High-quality', true] },
  { label: 'AI Access',        vals: [false, 'Basic', 'Full', 'Advanced', 'Custom'] },
  { label: 'Performance',      vals: ['Standard', 'Standard', 'Better', 'Priority', 'Priority'] },
  { label: 'Team Features',    vals: [false, false, false, false, true] },
  { label: 'Priority Support', vals: [false, false, false, false, true] },
  { label: 'Unlimited Projects', vals: [true, true, true, true, true] },
];

const Tick = ({ color }) => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={color || 'currentColor'} strokeWidth="2.5">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

export default function Pricing() {
  const [active, setActive] = useState(2);

  return (
    <div className="pricing-page">
      {/* NAV — same style as landing, no dark override */}
      <nav className="pricing-nav">
        <Link to="/" className="nav-brand">
          <BrandLogo size={34} />
          <span className="brand-name">kexo <em>AI</em></span>
        </Link>
        <div className="pricing-nav-right">
          <a href="#plans" className="nav-link">Plans</a>
          <a href="#compare" className="nav-link">Compare</a>
          <Link to="/dashboard" className="btn-ghost">Dashboard</Link>
          <Link to="/settings" className="btn-ghost">Settings</Link>
        </div>
        {/* Mobile hamburger placeholder — nav-drawer handled by Landing-style drawer */}
      </nav>

      <div className="pricing-body">

        {/* HEADER */}
        <div className="pricing-hero">
          <div className="section-label">Pricing</div>
          <div className="section-divider" />
          <h1>Simple, transparent pricing</h1>
          <p>Start free. No credit card. Upgrade only when you need more.</p>
        </div>

        {/* PLAN CARDS — Horizontal Slider */}
        <div className="plans-wrapper" id="plans">
          <div className="plans-track">
            {PLANS.map((plan, i) => (
              <div
                key={plan.id}
                className={'plan-card' + (active === i ? ' plan-card--active' : '') + (plan.popular ? ' plan-card--popular' : '')}
                style={active === i ? {
                  borderColor: plan.accentColor + '55',
                  background: `linear-gradient(160deg, ${plan.accentColor}12, ${plan.accentColor}04)`,
                  boxShadow: `0 20px 60px ${plan.accentColor}22`,
                } : {}}
                onClick={() => setActive(i)}
              >
                {plan.popular && (
                  <div className="plan-pop-badge" style={{ background: plan.accentColor }}>Most Popular</div>
                )}
                {plan.tag && !plan.popular && (
                  <div className="plan-tag-badge" style={{ color: plan.accentColor, borderColor: plan.accentColor + '44', background: plan.accentColor + '14' }}>
                    {plan.tag}
                  </div>
                )}

                {/* Color indicator dot */}
                <div className="plan-dot" style={{ background: plan.accentColor }} />

                <div className="plan-name" style={active === i ? { color: plan.accentColor } : {}}>{plan.name}</div>

                <div className="plan-price-row">
                  {plan.originalPrice && <span className="plan-orig">{plan.originalPrice}</span>}
                  <span className="plan-price">{plan.price}</span>
                  {plan.period && <span className="plan-period">{plan.period}</span>}
                </div>

                <p className="plan-desc">{plan.desc}</p>

                {/* Key stats */}
                <div className="plan-stats">
                  <div className="plan-stat-item">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <ellipse cx="12" cy="5" rx="9" ry="3"/>
                      <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/>
                      <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
                    </svg>
                    {plan.storage} storage
                  </div>
                  <div className="plan-stat-item">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 2a10 10 0 1 0 10 10H12V2z"/>
                    </svg>
                    {plan.creditsLabel}
                  </div>
                  <div className="plan-stat-item" style={{ color: plan.accentColor }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                      <polyline points="14 2 14 8 20 8"/>
                    </svg>
                    Unlimited projects
                  </div>
                </div>

                <ul className="plan-feature-list">
                  {plan.features.map(f => (
                    <li key={f}>
                      <span className="plan-feat-tick"><Tick color={plan.accentColor} /></span>
                      {f}
                    </li>
                  ))}
                  {plan.footnote && <li className="plan-footnote">{plan.footnote}</li>}
                </ul>

                <div className="plan-cta-wrap">
                  {plan.ctaTo ? (
                    <Link
                      to={plan.ctaTo}
                      className="plan-cta-btn"
                      style={active === i
                        ? { background: plan.accentColor, color: '#000', borderColor: plan.accentColor }
                        : { borderColor: plan.accentColor + '55', color: plan.accentColor }}
                    >
                      {plan.cta}
                    </Link>
                  ) : (
                    <a
                      href={plan.ctaHref}
                      className="plan-cta-btn"
                      style={active === i
                        ? { background: plan.accentColor, color: '#000', borderColor: plan.accentColor }
                        : { borderColor: plan.accentColor + '55', color: plan.accentColor }}
                    >
                      {plan.cta}
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Dot navigation */}
          <div className="plans-dots">
            {PLANS.map((p, i) => (
              <button
                key={i}
                className={'plans-dot' + (active === i ? ' plans-dot--active' : '')}
                style={active === i ? { background: PLANS[i].accentColor, width: 24 } : {}}
                onClick={() => setActive(i)}
                aria-label={p.name}
              />
            ))}
          </div>
        </div>

        {/* STORAGE RULE */}
        <div className="storage-note">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <div>
            <strong>Storage Rule:</strong> You can create unlimited projects on every plan — but once your storage limit is reached, new projects will be blocked until you upgrade or delete old data.
          </div>
        </div>

        {/* COMPARISON TABLE */}
        <div className="compare-section" id="compare">
          <h2>Compare All Plans</h2>
          <div className="compare-wrap">
            <table className="compare-table">
              <thead>
                <tr>
                  <th className="compare-feature-col">Feature</th>
                  {PLANS.map(p => (
                    <th key={p.id} style={{ color: p.accentColor }}>{p.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMPARISON.map(row => (
                  <tr key={row.label}>
                    <td className="compare-feature-name">{row.label}</td>
                    {row.vals.map((v, i) => (
                      <td key={i} className="compare-val">
                        {v === true
                          ? <span className="cmp-tick" style={{ color: PLANS[i].accentColor }}><Tick color={PLANS[i].accentColor} /></span>
                          : v === false
                            ? <span className="cmp-dash">—</span>
                            : <span className="cmp-text">{v}</span>}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ */}
        <div className="pricing-faq">
          <h2>Questions</h2>
          {[
            ['Is the Free plan really free forever?', 'Yes. The Free plan is free permanently. No credit card, no trial period, no hidden charges. It runs entirely in your browser.'],
            ['What happens when storage is full?', 'You\'ll still be able to access and edit existing projects. However, creating new projects will be blocked until you upgrade your plan or delete data to free up space.'],
            ['What are AI Credits?', 'AI Credits are consumed each time you use an AI feature — like summarizing canvas nodes, generating content, or chatting with the AI assistant. Credits reset every month.'],
            ['Can I switch plans anytime?', 'Yes. You can upgrade or downgrade at any time. When you upgrade, the new storage and credits are available immediately.'],
            ['Where is my data stored?', 'On the Free plan, all data lives in your browser\'s localStorage. On paid plans, data syncs to our secure cloud. Nothing is shared with third parties.'],
            ['When do paid plans launch?', 'Paid plans are currently in development. Click "Join Waitlist" on any paid plan to get notified the moment they launch.'],
          ].map(([q, a]) => (
            <div key={q} className="faq-item">
              <div className="faq-q">{q}</div>
              <div className="faq-a">{a}</div>
            </div>
          ))}
        </div>

        {/* BOTTOM CTA */}
        <div className="pricing-cta">
          <h2>Not sure? Start free.</h2>
          <p>No signup. No card. Just open and start building your canvas.</p>
          <Link to="/dashboard" className="btn-primary" style={{ margin: '0 auto' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
            </svg>
            Start Free Now
          </Link>
        </div>

      </div>
    </div>
  );
}
