import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getWallet } from '../../api/wallet';
import { getTransactions } from '../../api/transactions';
import { useAuth } from '../../context/AuthContext';
import { Phone, Wifi, Tv, Zap, Plus, ArrowUpRight, ArrowDownLeft, RefreshCw, Eye, EyeOff } from 'lucide-react';
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
  const [wallet, setWallet] = useState(null);
  const [txns, setTxns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBal, setShowBal] = useState(true);

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
        Good {getGreeting()}, <span>{user?.first_name}! 👋</span>
      </div>

      {/* Wallet card */}
      <div className="wallet-hero">
        <div className="wallet-hero-top">
          <div>
            <div className="wallet-label">Available Balance</div>
            <div className="wallet-balance">
              {showBal
                ? `₦${parseFloat(wallet?.available_balance || user?.wallet_balance || 0).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`
                : '₦ ••••••'
              }
            </div>
          </div>
          <button className="eye-btn" onClick={() => setShowBal(p => !p)}>
            {showBal ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {wallet && (
          <div className="wallet-stats">
            <div><span className="ws-label">Total Credited</span><span className="ws-val credit">↑ ₦{parseFloat(wallet.total_credited).toLocaleString()}</span></div>
            <div><span className="ws-label">Total Debited</span><span className="ws-val debit">↓ ₦{parseFloat(wallet.total_debited).toLocaleString()}</span></div>
            <div><span className="ws-label">Transactions</span><span className="ws-val">{wallet.transaction_count}</span></div>
          </div>
        )}
        <Link to="/wallet" className="fund-btn">
          <Plus size={16} /> Fund Wallet
        </Link>
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
                <div className="txn-date">{new Date(txn.created_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
              </div>
              <div className="txn-right">
                <div className="txn-amount">-₦{parseFloat(txn.total_amount).toLocaleString()}</div>
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
