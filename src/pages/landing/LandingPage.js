import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, Shield, Lock, Clock, CreditCard, CheckCircle, Globe } from 'lucide-react';
import './LandingPage.css';

/* ─── Data ─── */
const SERVICES = [
  {
    icon: '📱', color: '#e6f9f0', iconColor: '#00b96b',
    title: 'Airtime Top-Up',
    desc: 'Instantly recharge any Nigerian mobile number across all networks. No delays, no downtime.',
    features: [
      'Supports MTN, Airtel, Glo & 9Mobile',
      'Minimum ₦50, maximum ₦50,000 per transaction',
      'Delivered within 5 seconds on average',
      'Automated retry on failed attempts',
    ],
    link: '/register',
  },
  {
    icon: '📶', color: '#ebf8ff', iconColor: '#4299e1',
    title: 'Data Bundles',
    desc: 'Buy affordable data plans for all networks. Daily, weekly, and monthly plans available.',
    features: [
      'Over 50+ active data plans across 4 networks',
      'Discounted selling prices vs retail',
      'Plans from 100MB to 100GB+',
      'Validity from 1 day to 30 days',
    ],
    link: '/register',
  },
  {
    icon: '📺', color: '#faf5ff', iconColor: '#9f7aea',
    title: 'Cable TV Subscriptions',
    desc: 'Renew your DSTV, GOtv, Startimes or Showmax subscription instantly without leaving home.',
    features: [
      'DSTV, GOtv, Startimes, Showmax supported',
      'Padi, Compact, Premium & all bouquets',
      'Renew before or after expiry',
      'IUC number validation before payment',
    ],
    link: '/register',
  },
  {
    icon: '⚡', color: '#fffbeb', iconColor: '#f6ad55',
    title: 'Electricity Bills',
    desc: 'Pay electricity bills for all DISCOs in Nigeria. Prepaid and postpaid meters supported.',
    features: [
      'All 11 DISCOs supported (EKEDC, IKEDC, AEDC…)',
      'Prepaid & postpaid meter types',
      'Instant token generation for prepaid meters',
      'Real-time bill validation',
    ],
    link: '/register',
  },
];

const NETWORKS = [
  { name: 'MTN Nigeria', color: '#f6d800' },
  { name: 'Airtel Nigeria', color: '#e4002b' },
  { name: 'Glo Mobile', color: '#00b140' },
  { name: '9Mobile', color: '#006b3f' },
];

const STEPS = [
  { num: '1', title: 'Create Your Account', desc: 'Sign up with your email and phone number in under 60 seconds. No paperwork, no verification delays.' },
  { num: '2', title: 'Fund Your Wallet', desc: 'Add money to your QuickTopUp wallet via bank transfer. Your balance is instantly available.' },
  { num: '3', title: 'Pick a Service', desc: 'Choose from Airtime, Data, Cable TV, or Electricity. Enter the details and set your 4-digit PIN.' },
  { num: '4', title: 'Done in Seconds', desc: 'Your transaction is processed instantly. A receipt and notification land in your inbox right away.' },
];

const SECURITY = [
  { icon: '🔒', title: '4-Digit Transaction PIN', desc: 'Every purchase requires your personal 4-digit PIN. Even if someone has your password, they cannot make transactions.' },
  { icon: '🛡️', title: 'Token Authentication', desc: 'All API sessions are secured with rotating Bearer tokens. Tokens are invalidated immediately on logout.' },
  { icon: '⚡', title: 'Idempotency Protection', desc: 'Unique idempotency keys on every request prevent duplicate charges — even if you tap "Buy" twice.' },
  { icon: '📊', title: 'Spending Limits', desc: 'Configurable daily (₦50,000) and monthly (₦200,000) wallet limits protect you from unauthorized large transactions.' },
  { icon: '🔍', title: 'Input Validation', desc: 'Every request is validated server-side — phone format, amount range, required fields — before any charge is attempted.' },
  { icon: '🔔', title: 'Real-Time Notifications', desc: 'Instant email and in-app notifications for every transaction. You always know what\'s happening in your account.' },
];

const FAQS = [
  { q: 'How fast is airtime delivery?', a: 'Airtime is delivered within 5 seconds on average. Our API connects directly to VTU providers with automated retry logic for any failed attempts.' },
  { q: 'What happens if my transaction fails?', a: 'If a transaction fails, your wallet balance is not deducted. You receive a failed status notification and a full refund is automatic. You can retry immediately.' },
  { q: 'How do I fund my wallet?', a: 'Go to the Wallet page, click "Fund Wallet", enter an amount, and you\'ll receive our bank account details for a direct transfer. Your balance updates as soon as the transfer is confirmed.' },
  { q: 'Is my money safe in the wallet?', a: 'Yes. Wallet funds are held securely with daily and monthly spending limits. Your wallet can also be locked if suspicious activity is detected.' },
  { q: 'Which electricity DISCOs are supported?', a: 'All major DISCOs are supported including EKEDC (Eko), IKEDC (Ikeja), AEDC (Abuja), PHED (Port Harcourt), EEDC (Enugu), KEDCO, IBEDC, BEDC, JED, KAEDC, and YEDC.' },
  { q: 'Can I use QuickTopUp for my business?', a: 'Absolutely. Many resellers and small businesses use QuickTopUp. The wallet system with high daily limits and full transaction history makes it ideal for business use.' },
];

/* ─── Component ─── */
export default function LandingPage() {
  return (
    <div className="lp">

      {/* ── NAV ── */}
      <nav className="lp-nav">
        <Link to="/" className="lp-logo">
          <div className="lp-logo-icon">
            <Zap size={18} />
          </div>
          <span className="lp-logo-text">Quick<span>TopUp</span>.ng</span>
        </Link>
        <div className="lp-nav-links">
          <a href="#services">Services</a>
          <a href="#how-it-works">How It Works</a>
          <a href="#security">Security</a>
          <a href="#faq">FAQ</a>
        </div>
        <div className="lp-nav-cta">
          <Link to="/login" className="btn-outline">Log In</Link>
          <Link to="/register" className="btn-solid">Get Started</Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="lp-hero">
        <div className="lp-hero-badge">
          <span></span> Live & Processing Transactions
        </div>
        <h1>Nigeria's Fastest<br /><em>VTU Platform</em> for<br />Every Nigerian</h1>
        <p>
          Buy airtime, data, cable TV subscriptions, and pay electricity bills in seconds — all from one secure wallet. No queues, no agents, no stress.
        </p>
        <div className="lp-hero-actions">
          <Link to="/register" className="btn-hero-primary">Create Free Account →</Link>
          <Link to="/login" className="btn-hero-secondary">I Already Have an Account</Link>
        </div>
        <div className="lp-hero-stats">
          <div className="lp-stat">
            <span className="lp-stat-num">4</span>
            <span className="lp-stat-label">Services</span>
          </div>
          <div className="lp-stat">
            <span className="lp-stat-num">50+</span>
            <span className="lp-stat-label">Data Plans</span>
          </div>
          <div className="lp-stat">
            <span className="lp-stat-num">11</span>
            <span className="lp-stat-label">DISCOs Supported</span>
          </div>
          <div className="lp-stat">
            <span className="lp-stat-num">&lt;5s</span>
            <span className="lp-stat-label">Avg. Delivery</span>
          </div>
          <div className="lp-stat">
            <span className="lp-stat-num">24/7</span>
            <span className="lp-stat-label">Always Online</span>
          </div>
        </div>
      </section>

      {/* ── NETWORKS ── */}
      <section className="lp-section lp-section-alt" id="networks">
        <div className="section-header">
          <span className="section-tag">Supported Networks</span>
          <h2 className="section-title">All 4 Major Networks Covered</h2>
          <p className="section-sub">Whether you're on MTN, Airtel, Glo, or 9Mobile — we've got you. Airtime and data for every Nigerian number.</p>
        </div>
        <div className="lp-networks">
          {NETWORKS.map(n => (
            <div className="lp-network-badge" key={n.name}>
              <span className="lp-network-dot" style={{ background: n.color }}></span>
              {n.name}
              <CheckCircle size={16} color="#00b96b" />
            </div>
          ))}
        </div>
      </section>

      {/* ── SERVICES ── */}
      <section className="lp-section" id="services">
        <div className="section-header">
          <span className="section-tag">What We Offer</span>
          <h2 className="section-title">Four Essential Services,<br />One Wallet</h2>
          <p className="section-sub">Everything you need to stay connected, entertained, and powered — without leaving the app.</p>
        </div>
        <div className="lp-services-grid">
          {SERVICES.map(s => (
            <div className="lp-service-card" key={s.title}>
              <div className="lp-service-icon" style={{ background: s.color }}>
                {s.icon}
              </div>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
              <ul>
                {s.features.map(f => <li key={f}>{f}</li>)}
              </ul>
              <Link to={s.link} className="lp-service-link">Get started →</Link>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="lp-section lp-section-alt" id="how-it-works">
        <div className="section-header">
          <span className="section-tag">How It Works</span>
          <h2 className="section-title">Up and Running in 4 Steps</h2>
          <p className="section-sub">From zero to your first transaction in under 3 minutes.</p>
        </div>
        <div className="lp-steps">
          {STEPS.map(s => (
            <div className="lp-step" key={s.num}>
              <div className="lp-step-num">{s.num}</div>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── WALLET FEATURES ── */}
      <section className="lp-section" id="wallet">
        <div className="section-header">
          <span className="section-tag">Smart Wallet</span>
          <h2 className="section-title">Your Money, Fully in Control</h2>
          <p className="section-sub">The QuickTopUp wallet is built for speed, safety, and full transparency.</p>
        </div>
        <div className="lp-security-grid" style={{ '--card-bg': '#f7fafc' }}>
          {[
            { icon: <CreditCard size={22} color="#00b96b" />, title: 'Real-Time Balance', desc: 'Your available balance updates instantly after every transaction. No delays, no reconciliation required.' },
            { icon: <Globe size={22} color="#4299e1" />, title: 'Bank Transfer Funding', desc: 'Fund your wallet via direct bank transfer to our First Bank account. No card required, no POS fees.' },
            { icon: <Clock size={22} color="#9f7aea" />, title: 'Full Transaction Ledger', desc: 'Every credit and debit is logged with timestamp, reference, and balance-after. Export your history anytime.' },
            { icon: <Shield size={22} color="#f6ad55" />, title: 'Spending Limits', desc: 'Daily limit of ₦50,000 and monthly limit of ₦200,000 protect your wallet from runaway charges.' },
            { icon: <Lock size={22} color="#e53e3e" />, title: 'Wallet Lock', desc: 'Your wallet can be locked instantly if you suspect unauthorized access. All transactions are blocked until unlocked.' },
            { icon: <CheckCircle size={22} color="#00b96b" />, title: 'Reserved Balance', desc: 'Pending transactions hold a reserved balance to prevent double-spending. Released immediately on failure.' },
          ].map(w => (
            <div className="lp-service-card" key={w.title}>
              <div style={{ marginBottom: 4 }}>{w.icon}</div>
              <h3>{w.title}</h3>
              <p style={{ fontSize: '0.88rem', color: '#718096', lineHeight: 1.65 }}>{w.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── SECURITY ── */}
      <section className="lp-section lp-section-dark" id="security">
        <div className="section-header">
          <span className="section-tag section-tag-dark">Security</span>
          <h2 className="section-title" style={{ color: '#fff' }}>Built Secure From the Ground Up</h2>
          <p className="section-sub section-sub-white">We don't bolt on security as an afterthought. Every layer of QuickTopUp is designed to protect your money and data.</p>
        </div>
        <div className="lp-security-grid">
          {SECURITY.map(s => (
            <div className="lp-security-card" key={s.title}>
              <h3><span className="sec-icon">{s.icon}</span>{s.title}</h3>
              <p>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── PAYMENT OPTIONS ── */}
      <section className="lp-section lp-section-alt" id="payments">
        <div className="section-header">
          <span className="section-tag">Payment</span>
          <h2 className="section-title">Powered by Flutterwave</h2>
          <p className="section-sub">QuickTopUp uses Flutterwave — Africa's leading payment infrastructure — to process all wallet funding. Your payment data never touches our servers.</p>
        </div>
        <div className="lp-services-grid" style={{ maxWidth: 860 }}>
          {[
            { icon: '🏦', color: '#e6f9f0', title: 'Bank Transfer', desc: 'Fund your wallet directly from your bank account. Works with any Nigerian bank. No card details needed.' },
            { icon: '🔗', color: '#ebf8ff', title: 'Payment Links', desc: 'Initiate payments via Flutterwave-hosted checkout. Secure, PCI-DSS compliant, and mobile-friendly.' },
            { icon: '🔔', color: '#faf5ff', title: 'Webhook Confirmations', desc: 'Every payment is confirmed via Flutterwave webhooks before your wallet is credited. No false credits, ever.' },
          ].map(p => (
            <div className="lp-service-card" key={p.title}>
              <div className="lp-service-icon" style={{ background: p.color }}>{p.icon}</div>
              <h3>{p.title}</h3>
              <p>{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="lp-section" id="faq">
        <div className="section-header">
          <span className="section-tag">FAQ</span>
          <h2 className="section-title">Common Questions</h2>
          <p className="section-sub">Everything you might want to know before signing up.</p>
        </div>
        <div className="lp-faq">
          {FAQS.map(f => (
            <div className="lp-faq-item" key={f.q}>
              <div className="lp-faq-q">{f.q}</div>
              <div className="lp-faq-a">{f.a}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <div className="lp-cta-banner">
        <h2>Ready to Never Visit a Recharge Card Seller Again?</h2>
        <p>Join thousands of Nigerians who pay bills, buy data, and recharge airtime in seconds from their phone.</p>
        <Link to="/register" className="btn-cta-white">Create Your Free Account →</Link>
      </div>

      {/* ── FOOTER ── */}
      <footer className="lp-footer">
        <div className="lp-footer-top">
          <div className="lp-footer-brand">
            <Link to="/" className="lp-logo">
              <div className="lp-logo-icon">
                <Zap size={16} />
              </div>
              <span className="lp-logo-text" style={{ color: '#fff' }}>Quick<span>TopUp</span>.ng</span>
            </Link>
            <p>Nigeria's fastest VTU platform. Airtime, data, cable TV, and electricity bills — all in one wallet.</p>
          </div>
          <div className="lp-footer-col">
            <h4>Services</h4>
            <ul>
              <li><Link to="/register">Airtime Top-Up</Link></li>
              <li><Link to="/register">Data Bundles</Link></li>
              <li><Link to="/register">Cable TV</Link></li>
              <li><Link to="/register">Electricity Bills</Link></li>
            </ul>
          </div>
          <div className="lp-footer-col">
            <h4>Account</h4>
            <ul>
              <li><Link to="/register">Sign Up</Link></li>
              <li><Link to="/login">Log In</Link></li>
              <li><Link to="/forgot-password">Reset Password</Link></li>
            </ul>
          </div>
          <div className="lp-footer-col">
            <h4>Support</h4>
            <ul>
              <li><a href="mailto:quicktopup.it.com@gmail.com">Email Support</a></li>
              <li><a href="https://docs.quicktopup.it.com" target="_blank" rel="noreferrer">Documentation</a></li>
              <li><a href="https://status.quicktopup.it.com" target="_blank" rel="noreferrer">System Status</a></li>
            </ul>
          </div>
        </div>
        <div className="lp-footer-bottom">
          <span>© 2026 QuickTopUp.ng · All rights reserved</span>
          <span>
            <Link to="/privacy">Privacy Policy</Link> &nbsp;·&nbsp;
            <Link to="/terms">Terms of Service</Link> &nbsp;·&nbsp;
            <a href="https://status.quicktopup.it.com" target="_blank" rel="noreferrer">System Status</a>
          </span>
        </div>
      </footer>

    </div>
  );
}
