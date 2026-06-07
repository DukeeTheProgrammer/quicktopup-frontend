import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Phone, Wifi, Tv, Zap, Wallet, ClipboardList,
  User, Bell, Shield, ChevronRight, Check, ArrowRight,
  LayoutDashboard
} from 'lucide-react';
import './WelcomePage.css';

const steps = [
  {
    title: 'Welcome to QuickTopUp!',
    subtitle: 'Your one-stop platform for airtime, data, cable TV, and electricity bills.',
    icon: LayoutDashboard,
    color: '#00b96b',
    illustration: '🎉',
  },
  {
    title: 'Buy Airtime',
    subtitle: 'Select your country, network, enter the phone number, choose an amount, and confirm with your PIN.',
    icon: Phone,
    color: '#00b96b',
    link: '/airtime',
  },
  {
    title: 'Data Bundles',
    subtitle: 'Browse data plans by network, pick the one you need, enter the number, and activate instantly.',
    icon: Wifi,
    color: '#4299e1',
    link: '/data',
  },
  {
    title: 'Cable TV & Electricity',
    subtitle: 'Pay for DSTV, GOtv, Startimes or your electricity bill. Just enter your smart card or meter number.',
    icon: Tv,
    color: '#9f7aea',
    link: '/cable',
  },
  {
    title: 'Wallet & Funding',
    subtitle: 'Fund your wallet via card, bank transfer, or USSD. Track your balance and spending.',
    icon: Wallet,
    color: '#f6ad55',
    link: '/wallet',
  },
  {
    title: 'Transactions & History',
    subtitle: 'View all your past purchases, filter by status or date, and track every transaction.',
    icon: ClipboardList,
    color: '#fc8181',
    link: '/transactions',
  },
  {
    title: 'Profile & Security',
    subtitle: 'Set your transaction PIN, update your profile, change your phone number, and manage security.',
    icon: User,
    color: '#00b96b',
    link: '/profile',
  },
  {
    title: 'Notifications',
    subtitle: 'Stay updated with transaction alerts, promotions, and security notifications.',
    icon: Bell,
    color: '#4299e1',
    link: '/notifications',
  },
  {
    title: 'You\'re All Set!',
    subtitle: 'Start exploring QuickTopUp. You can always come back here from your profile settings.',
    icon: Shield,
    color: '#00b96b',
    isLast: true,
  },
];

export default function WelcomePage() {
  const [step, setStep] = useState(0);
  const navigate = useNavigate();
  const { user } = useAuth();
  const current = steps[step];
  const Icon = current.icon;

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(s => s + 1);
    }
  };

  const handleSkip = () => {
    navigate('/dashboard');
  };

  const handleGetStarted = () => {
    navigate('/dashboard');
  };

  const handleGoTo = (path) => {
    navigate(path);
  };

  const progress = ((step) / (steps.length - 1)) * 100;

  return (
    <div className="welcome-page">
      {/* Progress bar */}
      <div className="welcome-progress">
        <div className="welcome-progress-track">
          <div className="welcome-progress-fill" style={{ width: `${progress}%` }} />
        </div>
        <span className="welcome-step-count">{step + 1} / {steps.length}</span>
      </div>

      <div className="welcome-content">
        {/* Illustration area */}
        <div className="welcome-icon-wrap" style={{ background: `${current.color}15` }}>
          {current.isLast ? (
            <span style={{ fontSize: 64 }}>🚀</span>
          ) : (
            <Icon size={48} color={current.color} />
          )}
        </div>

        <h1 className="welcome-title">{current.title}</h1>
        <p className="welcome-subtitle">{current.subtitle}</p>

        {/* Quick action buttons for service steps */}
        {current.link && (
          <button className="welcome-action-btn" onClick={() => handleGoTo(current.link)}>
            Go to {current.title.split(' ').slice(-1)} <ArrowRight size={16} />
          </button>
        )}

        {/* Bullet indicators */}
        <div className="welcome-dots">
          {steps.map((_, i) => (
            <button key={i}
              className={`welcome-dot ${i === step ? 'active' : ''} ${i < step ? 'done' : ''}`}
              onClick={() => setStep(i)}
              aria-label={`Go to step ${i + 1}`}
            >
              {i < step ? <Check size={10} /> : null}
            </button>
          ))}
        </div>
      </div>

      {/* Bottom navigation */}
      <div className="welcome-footer">
        <button className="btn btn-secondary" onClick={handleSkip}>
          Skip
        </button>

        {current.isLast ? (
          <button className="btn btn-primary btn-lg" onClick={handleGetStarted}
            style={{ padding: '12px 32px', borderRadius: 12 }}>
            Get Started <ArrowRight size={18} />
          </button>
        ) : (
          <button className="btn btn-primary btn-lg" onClick={handleNext}
            style={{ padding: '12px 32px', borderRadius: 12 }}>
            Next <ChevronRight size={18} />
          </button>
        )}
      </div>
    </div>
  );
}
