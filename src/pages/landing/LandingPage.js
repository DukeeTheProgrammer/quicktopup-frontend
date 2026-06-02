import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Link } from 'react-router-dom';
import { Zap, Shield, CheckCircle, Menu, X, Phone, Wifi, Tv, Bolt, UserPlus, Wallet, ShoppingCart, Rocket, Lock, ShieldCheck, KeyRound, LineChart, Search, Bell, Sun, Moon } from 'lucide-react';
import './LandingPage.css';

/* ─── Data ─── */
const SERVICES = [
  {
    icon: Phone, gradient: 'linear-gradient(135deg,#00b96b,#00d97e)',
    title: 'Airtime Top-Up',
    desc: 'Recharge any Nigerian or Ghanaian number across all networks in under 5 seconds.',
    badge: 'Most Popular',
    link: '/register',
  },
  {
    icon: Wifi, gradient: 'linear-gradient(135deg,#4299e1,#63b3ed)',
    title: 'Data Bundles',
    desc: '50+ plans from 100MB to 100GB+ across all networks. Daily, weekly, and monthly.',
    badge: '50+ Plans',
    link: '/register',
  },
  {
    icon: Tv, gradient: 'linear-gradient(135deg,#9f7aea,#b794f4)',
    title: 'Cable TV',
    desc: 'DSTV, GOtv, Startimes & Showmax — renew any bouquet instantly. IUC validated.',
    badge: '4 Providers',
    link: '/register',
  },
  {
    icon: Bolt, gradient: 'linear-gradient(135deg,#f6ad55,#fc8181)',
    title: 'Electricity',
    desc: 'All 11 Nigerian DISCOs supported. Prepaid tokens generated in real-time.',
    badge: '11 DISCOs',
    link: '/register',
  },
];

const NETWORKS = [
  { name: 'MTN', full: 'MTN Nigeria', color: '#f6d800', flag: 'NG' },
  { name: 'Airtel', full: 'Airtel Nigeria', color: '#e4002b', flag: 'NG' },
  { name: 'Glo', full: 'Glo Mobile', color: '#00b140', flag: 'NG' },
  { name: '9Mobile', full: '9Mobile', color: '#006b3f', flag: 'NG' },
  { name: 'MTN GH', full: 'MTN Ghana', color: '#f6d800', flag: 'GH' },
  { name: 'Vodafone', full: 'Vodafone Ghana', color: '#e4002b', flag: 'GH' },
  { name: 'AirtelTigo', full: 'AirtelTigo Ghana', color: '#e07b39', flag: 'GH' },
];

const STEPS = [
  { num: '01', icon: UserPlus, title: 'Create Account', desc: 'Sign up in 60 seconds — email and phone, that\'s it.' },
  { num: '02', icon: Wallet, title: 'Fund Wallet', desc: 'Bank transfer or card. Balance available instantly.' },
  { num: '03', icon: ShoppingCart, title: 'Pick a Service', desc: 'Airtime, data, cable, or electricity. Enter details + PIN.' },
  { num: '04', icon: Rocket, title: 'Done!', desc: 'Transaction processed. Receipt in your inbox.' },
];

const SECURITY = [
  { icon: Lock, title: '4-Digit PIN', desc: 'Every purchase needs your PIN. Password alone can\'t authorise transactions.' },
  { icon: ShieldCheck, title: 'Token Auth', desc: 'Bearer tokens on all sessions. Invalidated instantly on logout.' },
  { icon: KeyRound, title: 'Idempotency', desc: 'Unique keys per request — tap "Buy" twice, charged once.' },
  { icon: LineChart, title: 'Spend Limits', desc: '₦50k daily / ₦200k monthly caps protect against unauthorised use.' },
  { icon: Search, title: 'Validation', desc: 'Phone format, amount range, required fields — all checked server-side.' },
  { icon: Bell, title: 'Alerts', desc: 'Instant email + in-app notification on every transaction.' },
];

const FAQS = [
  { q: 'How fast is airtime delivery?', a: 'Under 5 seconds on average. Direct API connection to VTU providers with automatic retry on failure.' },
  { q: 'What if my transaction fails?', a: 'Your wallet is not debited on failure. You get a notification and can retry immediately.' },
  { q: 'How do I fund my wallet?', a: 'Wallet page → Fund Wallet → enter amount → receive our bank details for direct transfer. Updates instantly.' },
  { q: 'Which electricity DISCOs are supported?', a: 'All 11: EKEDC, IKEDC, AEDC, PHED, EEDC, KEDCO, IBEDC, BEDC, JED, KAEDC, and YEDC.' },
  { q: 'Does QuickTopUp support Ghana?', a: 'Yes! MTN Ghana, Vodafone, and AirtelTigo via Hubtel. Numbers starting with +233 auto-detected.' },
  { q: 'Can I use this for my business?', a: 'Absolutely — high limits, full transaction history, and wallet management make it ideal for resellers.' },
];

const STATS = [
  { num: '4', label: 'Services' },
  { num: '<5s', label: 'Avg. Delivery' },
  { num: '2', label: 'Countries' },
  { num: '24/7', label: 'Always Online' },
];

/* ─── Hooks ─── */
function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setInView(true); obs.disconnect(); } }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, inView];
}

/* ─── Animated number counter ─── */
function useCountUp(target, inView, duration = 1800) {
  const [val, setVal] = React.useState(0);
  React.useEffect(() => {
    if (!inView) return;
    let start = null;
    const numeric = parseFloat(String(target).replace(/[^0-9.]/g, ''));
    const suffix = String(target).replace(/[0-9.]/g, '');
    const step = (ts) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setVal(Math.floor(eased * numeric) + suffix);
      if (progress < 1) requestAnimationFrame(step);
      else setVal(target);
    };
    requestAnimationFrame(step);
  }, [inView, target, duration]);
  return val;
}

/* ─── Typewriter effect ─── */
function Typewriter({ words, speed = 90, pause = 1800 }) {
  const [idx, setIdx] = React.useState(0);
  const [text, setText] = React.useState('');
  const [deleting, setDeleting] = React.useState(false);
  React.useEffect(() => {
    const word = words[idx % words.length];
    const timeout = setTimeout(() => {
      if (!deleting) {
        setText(word.slice(0, text.length + 1));
        if (text.length + 1 === word.length) setTimeout(() => setDeleting(true), pause);
      } else {
        setText(word.slice(0, text.length - 1));
        if (text.length - 1 === 0) { setDeleting(false); setIdx(i => i + 1); }
      }
    }, deleting ? speed / 2 : speed);
    return () => clearTimeout(timeout);
  }, [text, deleting, idx, words, speed, pause]);
  return (
    <em style={{ borderRight: '3px solid', paddingRight: 2, animation: 'typewriterBlink 0.8s step-end infinite' }}>
      {text || ' '}
    </em>
  );
}

/* ─── Animated stat ─── */
function AnimStat({ num, label, inView }) {
  const val = useCountUp(num, inView);
  return (
    <div className="lp-stat">
      <span className="lp-stat-num">{inView ? val : '0'}</span>
      <span className="lp-stat-label">{label}</span>
    </div>
  );
}



/* ─── FAQ Item ─── */
function FaqItem({ q, a, i }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`lp-faq-item ${open ? 'open' : ''}`} style={{ '--i': i }}>
      <button className="lp-faq-q" onClick={() => setOpen(p => !p)}>
        {q}
        <span className="faq-chevron">{open ? '−' : '+'}</span>
      </button>
      <div className="lp-faq-a-wrap" style={{ maxHeight: open ? 200 : 0 }}>
        <div className="lp-faq-a">{a}</div>
      </div>
    </div>
  );
}

/* ─── Component ─── */
export default function LandingPage() {
  const [navOpen, setNavOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const [heroRef, heroIn] = useInView(0.1);
  const [statsRef, statsIn] = useInView(0.2);
  const [svcRef, svcIn] = useInView(0.1);
  const [netRef, netIn] = useInView(0.15);
  const [stepsRef, stepsIn] = useInView(0.1);
  const [secRef, secIn] = useInView(0.1);
  const [faqRef, faqIn] = useInView(0.1);
  const [ctaRef, ctaIn] = useInView(0.2);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="lp">

      {/* ── NAV ── */}
      <nav className={`lp-nav ${scrolled ? 'lp-nav-scrolled' : ''}`}>
        <Link to="/" className="lp-logo" onClick={() => setNavOpen(false)}>
          <div className="lp-logo-icon"><Zap size={18} /></div>
          <span className="lp-logo-text">Quick<span>TopUp</span>.ng</span>
        </Link>
        <div className={`lp-nav-links ${navOpen ? 'open' : ''}`}>
          <a href="#services" onClick={() => setNavOpen(false)}>Services</a>
          <a href="#how-it-works" onClick={() => setNavOpen(false)}>How It Works</a>
          <a href="#security" onClick={() => setNavOpen(false)}>Security</a>
          <a href="#faq" onClick={() => setNavOpen(false)}>FAQ</a>
          <div className="lp-nav-cta-mobile">
            <button className="lp-theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
              {theme === 'dark' ? <><Sun size={16} /> Light Mode</> : <><Moon size={16} /> Dark Mode</>}
            </button>
            <Link to="/login" className="btn-outline" onClick={() => setNavOpen(false)}>Log In</Link>
            <Link to="/register" className="btn-solid" onClick={() => setNavOpen(false)}>Get Started</Link>
          </div>
        </div>
        <div className="lp-nav-cta lp-nav-cta-desktop">
          <button className="lp-theme-toggle" onClick={toggleTheme} aria-label="Toggle theme" title={theme === 'dark' ? 'Light mode' : 'Dark mode'}>
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <Link to="/login" className="btn-outline">Log In</Link>
          <Link to="/register" className="btn-solid">Get Started</Link>
        </div>
        <button className="lp-hamburger" onClick={() => setNavOpen(p => !p)} aria-label="Menu">
          {navOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>
      {navOpen && <div className="lp-nav-overlay" onClick={() => setNavOpen(false)} />}

      {/* ── HERO ── */}
      <section className="lp-hero" ref={heroRef}>
        <div className="hero-bg-blob blob-1" />
        <div className="hero-bg-blob blob-2" />
        <div className="hero-bg-blob blob-3" />

        <div className={`lp-hero-inner ${heroIn ? 'fade-up-in' : 'fade-up-out'}`}>
          <div className="lp-hero-badge">
            <span className="pulse-dot" /> Live & Processing Transactions
          </div>
          <h1>
            Nigeria <span className="amp">&amp;</span> Ghana's<br />
            <Typewriter words={["Fastest VTU", "Airtime & Data", "Cable & Power", "Secure Wallet"]} /><br />Platform
          </h1>
          <p>
            Airtime, data, cable TV, and electricity — all from one secure wallet.
            No queues, no agents, under 5 seconds.
          </p>
          <div className="lp-hero-actions">
            <Link to="/register" className="btn-hero-primary">
              Create Free Account <span className="btn-arrow">→</span>
            </Link>
            <Link to="/login" className="btn-hero-secondary">Sign In</Link>
          </div>
        </div>

        {/* ── Stats strip ── */}
        <div className={`lp-hero-stats ${statsIn ? 'fade-up-in' : 'fade-up-out'}`} ref={statsRef}>
          {STATS.map((s, i) => (
            <AnimStat key={s.label} num={s.num} label={s.label} inView={statsIn} delay={i * 120} />
          ))}
        </div>

        <div className="hero-scroll-hint">
          <span />
        </div>
      </section>

      {/* ── SERVICES ── */}
      <section className="lp-section" id="services" ref={svcRef}>
        <div className={`section-header ${svcIn ? 'fade-up-in' : 'fade-up-out'}`}>
          <span className="section-tag">What We Offer</span>
          <h2 className="section-title">Four Services, One Wallet</h2>
          <p className="section-sub">Stay connected, entertained, and powered — without leaving the app.</p>
        </div>
        <div className="lp-services-grid">
          {SERVICES.map((s, i) => (
            <div
              key={s.title}
              className={`lp-service-card ${svcIn ? 'fade-up-in' : 'fade-up-out'}`}
              style={{ '--i': i }}
            >
              <div className="lp-svc-top">
              <div className="lp-service-icon" style={{ background: s.gradient }}>
                <s.icon size={32} color="white" />
              </div>
                <span className="lp-svc-badge">{s.badge}</span>
              </div>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
              <Link to={s.link} className="lp-service-link">
                Get started <span>→</span>
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ── NETWORKS ── */}
      <section className="lp-section lp-section-alt" id="networks" ref={netRef}>
        <div className={`section-header ${netIn ? 'fade-up-in' : 'fade-up-out'}`}>
          <span className="section-tag">Coverage</span>
          <h2 className="section-title">7 Networks, 2 Countries</h2>
          <p className="section-sub">Nigeria and Ghana covered. Every major network, one platform.</p>
        </div>
        <div className="lp-networks">
          {NETWORKS.map((n, i) => (
            <div
              key={n.name}
              className={`lp-network-badge ${netIn ? 'pop-in' : 'pop-out'}`}
              style={{ '--i': i }}
            >
              <span className="lp-network-dot" style={{ background: n.color }} />
              <span className="network-flag-badge">{n.flag}</span> {n.full}
              <CheckCircle size={15} color="#00b96b" />
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="lp-section" id="how-it-works" ref={stepsRef}>
        <div className={`section-header ${stepsIn ? 'fade-up-in' : 'fade-up-out'}`}>
          <span className="section-tag">How It Works</span>
          <h2 className="section-title">Up and Running in 4 Steps</h2>
          <p className="section-sub">From zero to your first transaction in under 3 minutes.</p>
        </div>
        <div className="lp-steps">
          {STEPS.map((s, i) => (
            <div
              key={s.num}
              className={`lp-step ${stepsIn ? 'fade-up-in' : 'fade-up-out'}`}
              style={{ '--i': i }}
            >
              <div className="lp-step-icon"><s.icon size={28} /></div>
              <div className="lp-step-num-badge">{s.num}</div>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
              {i < STEPS.length - 1 && <div className="lp-step-connector" />}
            </div>
          ))}
        </div>
      </section>

      {/* ── SECURITY ── */}
      <section className="lp-section lp-section-dark" id="security" ref={secRef}>
        <div className={`section-header ${secIn ? 'fade-up-in' : 'fade-up-out'}`}>
          <span className="section-tag section-tag-dark">
            <Shield size={12} style={{ marginRight: 5 }} />Security
          </span>
          <h2 className="section-title" style={{ color: '#fff' }}>Built Secure From Day One</h2>
          <p className="section-sub section-sub-white">Multiple layers of protection on every transaction.</p>
        </div>
        <div className="lp-security-grid">
          {SECURITY.map((s, i) => (
            <div
              key={s.title}
              className={`lp-security-card ${secIn ? 'fade-up-in' : 'fade-up-out'}`}
              style={{ '--i': i }}
            >
              <div className="sec-icon"><s.icon size={28} /></div>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="lp-section lp-section-alt" id="faq" ref={faqRef}>
        <div className={`section-header ${faqIn ? 'fade-up-in' : 'fade-up-out'}`}>
          <span className="section-tag">FAQ</span>
          <h2 className="section-title">Common Questions</h2>
          <p className="section-sub">Everything you need to know before getting started.</p>
        </div>
        <div className="lp-faq">
          {FAQS.map((f, i) => <FaqItem key={f.q} q={f.q} a={f.a} i={i} />)}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="lp-cta" ref={ctaRef}>
        <div className="cta-bg-blob" />
        <div className={`lp-cta-inner ${ctaIn ? 'fade-up-in' : 'fade-up-out'}`}>
          <h2>Ready to Top Up in Seconds?</h2>
          <p>Join thousands across Nigeria and Ghana who never visit a recharge card seller again.</p>
          <div className="lp-cta-actions">
            <Link to="/register" className="btn-hero-primary">Create Free Account →</Link>
            <Link to="/login" className="btn-hero-secondary">Sign In</Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="lp-footer">
        <div className="lp-footer-inner">
          <Link to="/" className="lp-logo">
            <div className="lp-logo-icon"><Zap size={16} /></div>
            <span className="lp-logo-text">Quick<span>TopUp</span>.ng</span>
          </Link>
          <p className="lp-footer-tagline">Fast VTU services for Nigeria &amp; Ghana — one wallet, every service.</p>
          <div className="lp-footer-links">
            <a href="#services">Services</a>
            <a href="#how-it-works">How It Works</a>
            <a href="#security">Security</a>
            <a href="#faq">FAQ</a>
            <a href="mailto:quicktopup.it.com@gmail.com">Support</a>
          </div>
          <p className="lp-footer-copy">© {new Date().getFullYear()} QuickTopUp.ng — All rights reserved.</p>
        </div>
      </footer>

    </div>
  );
}