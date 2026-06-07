import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getWallet } from '../../api/wallet';
import { getTransactions } from '../../api/transactions';
import { useAuth } from '../../context/AuthContext';
import { getWalletCurrency } from '../../utils/currency';
import { Phone, Wifi, Tv, Zap, Plus, ArrowUpRight, ArrowDownLeft, RefreshCw, Eye, EyeOff, Hand, Key, HelpCircle, Shield, BadgeCheck, ChevronRight } from 'lucide-react';
import './Dashboard.css';

const services = [
  { to: '/airtime', icon: Phone, label: 'Airtime', color: '#00b96b', bg: '#e6f9f0' },
  { to: '/data', icon: Wifi, label: 'Data', color: '#4299e1', bg: '#ebf8ff' },
  { to: '/cable', icon: Tv, label: 'Cable TV', color: '#9f7aea', bg: '#faf5ff' },
  { to: '/electricity', icon: Zap, label: 'Electricity', color: '#f6ad55', bg: '#fffbeb' },
];

const statusBadge = (s) => {
  const map = { success: 'badge-success', failed: 'badge-danger', pending: 'badge-warning', processing: 'badge-info' };
  return map[s] || 'badge-gray';
};

const serviceLabel = (s) => {
  const map = { airtime: 'Airtime', data: 'Data', cable: 'Cable TV', electricity: 'Electricity' };
  return map[s] || s;
};

export default function DashboardPage() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [wallet, setWallet] = useState(null);
  const [txns, setTxns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBal, setShowBal] = useState(true);
  const cur = getWalletCurrency(wallet, user);
  const hasPin = user?.has_transaction_pin;

  useEffect(() => {
    const load = async () => {
      try {
        const [wRes, tRes] = await Promise.all([getWallet(), getTransactions({ page_size: 5 })]);
        setWallet(wRes.data?.data || wRes.data);
        const tRaw = tRes.data?.data; setTxns(tRaw?.results || (Array.isArray(tRaw) ? tRaw : []));
        refreshUser();
      } catch {} finally { setLoading(false); }
    };
    load();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="dashboard">
      <div className="dash-greeting">
        Good {getGreeting()}, <span>{user?.first_name}!</span> <Hand size={18} style={{ display: 'inline', verticalAlign: 'middle' }} />
      </div>

      {/* PIN not set prompt */}
      {!hasPin && (
        <div style={{
          background: 'linear-gradient(135deg, #fef3cd 0%, #fff8ec 100%)',
          borderRadius: 14, padding: '14px 18px', marginBottom: 20,
          display: 'flex', alignItems: 'center', gap: 12,
          border: '1px solid #f6ad55',
        }}>
          <Key size={20} color="#b7791f" style={{ flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: '#92400e' }}>Set Up Transaction PIN</div>
            <div style={{ fontSize: 12, color: '#a16207', marginTop: 1 }}>
              You need a 4-digit PIN before you can make purchases
            </div>
          </div>
          <Link to="/profile" style={{
            background: '#b7791f', color: 'white', padding: '8px 14px', borderRadius: 8,
            fontWeight: 600, fontSize: 12, textDecoration: 'none', whiteSpace: 'nowrap',
          }}>
            Set PIN
          </Link>
        </div>
      )}

      {/* Take tour prompt */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginBottom: 4, marginTop: -8,
      }}>
        <button
          onClick={() => navigate('/welcome')}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 6,
            fontSize: 12, color: 'var(--gray-500)', fontWeight: 500,
          }}
        >
          <HelpCircle size={14} /> Take a quick tour
        </button>
      </div>

      {/* Wallet card */}
      <div className="wallet-hero">
        <div className="wallet-hero-top">
          <div>
            <div className="wallet-label">Available Balance</div>
            <div className="wallet-balance">
              {showBal
                ? `${cur.symbol}${parseFloat(wallet?.available_balance || user?.wallet_balance || 0).toLocaleString(cur.locale, { minimumFractionDigits: 2 })}`
                : `${cur.symbol} ••••••`
              }
            </div>
          </div>
          <button className="eye-btn" onClick={() => setShowBal(p => !p)}>
            {showBal ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {wallet && (
          <div className="wallet-stats">
            <div><span className="ws-label">Total Credited</span><span className="ws-val credit">↑ {cur.symbol}{parseFloat(wallet.total_credited).toLocaleString()}</span></div>
            <div><span className="ws-label">Total Debited</span><span className="ws-val debit">↓ {cur.symbol}{parseFloat(wallet.total_debited).toLocaleString()}</span></div>
            <div><span className="ws-label">Transactions</span><span className="ws-val">{wallet.transaction_count}</span></div>
          </div>
        )}
        <Link to="/wallet" className="fund-btn">
          <Plus size={16} /> Fund Wallet
        </Link>
      </div>

      {/* KYC status card */}
      <div className="kyc-dash-card" onClick={() => navigate('/kyc')}
        style={{ cursor: 'pointer', marginBottom: 24 }}>
        <div className="kyc-dash-left">
          <div className="kyc-dash-icon" style={{
            background: user?.kyc_level >= 2 ? '#e6f9f0' : user?.kyc_level >= 1 ? '#fffbeb' : 'var(--gray-100)',
          }}>
            {user?.kyc_level >= 2 ? <BadgeCheck size={22} color="#00b96b" /> :
             user?.kyc_level >= 1 ? <Shield size={22} color="#b7791f" /> :
             <Shield size={22} color="var(--gray-400)" />}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>
              {user?.kyc_level >= 2 ? 'Identity Verified' :
               user?.kyc_level >= 1 ? 'KYC Pending Review' :
               'Verify Your Identity'}
            </div>
            <div style={{ fontSize: 12, color: 'var(--gray-500)', marginTop: 1 }}>
              {user?.kyc_level >= 2 ? 'Level 2 — All features unlocked' :
               user?.kyc_level >= 1 ? 'Level 1 — Submitted for review' :
               'Complete KYC to unlock higher limits'}
            </div>
          </div>
        </div>
        <ChevronRight size={18} color="var(--gray-400)" />
      </div>

      {/* Quick services */}
      <h2 className="section-title">Quick Services</h2>
      <div className="service-grid">
        {services.map(({ to, icon: Icon, label, color, bg }) => (
          <Link key={to} to={to} className="service-card">
            <div className="service-icon" style={{ background: bg, color }}>
              <Icon size={24} />
            </div>
            <span>{label}</span>
          </Link>
        ))}
      </div>

      {/* Recent transactions */}
      <div className="section-header">
        <h2 className="section-title" style={{ marginBottom: 0 }}>Recent Transactions</h2>
        <Link to="/transactions" className="see-all">See all →</Link>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40 }}>
          <div className="spinner spinner-dark" style={{ margin: '0 auto' }} />
        </div>
      ) : txns.length === 0 ? (
        <div className="empty-state">
          <RefreshCw size={40} />
          <p>No transactions yet. Make your first purchase!</p>
        </div>
      ) : (
        <div className="txn-list">
          {txns.map(txn => (
            <div key={txn.id} className="txn-row">
              <div className={`txn-icon-wrap ${txn.status === 'success' ? 'success' : txn.status === 'failed' ? 'failed' : 'pending'}`}>
                {txn.status === 'success' ? <ArrowUpRight size={16} /> : <ArrowDownLeft size={16} />}
              </div>
              <div className="txn-info">
                <div className="txn-desc">{serviceLabel(txn.service_type)} — {txn.phone || txn.reference}</div>
                <div className="txn-date">{new Date(txn.created_at).toLocaleDateString(cur.locale, { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
              </div>
              <div className="txn-right">
                <div className="txn-amount">-{cur.symbol}{parseFloat(txn.total_amount).toLocaleString()}</div>
                <span className={`badge ${statusBadge(txn.status)}`}>{txn.status}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}
