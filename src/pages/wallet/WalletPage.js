import React, { useState, useEffect, useCallback } from 'react';
import { getWallet, fundWallet, getWalletLedger } from '../../api/wallet';
import toast from 'react-hot-toast';
import { Wallet, ArrowDownCircle, ArrowUpCircle, Plus, ExternalLink, RefreshCw } from 'lucide-react';
import './Wallet.css';

const FUND_PRESETS = [1000, 2000, 5000, 10000, 20000, 50000];
const PAYMENT_METHODS = [
  { value: 'card', label: '💳 Card', desc: 'Visa / Mastercard / Verve' },
  { value: 'bank_transfer', label: '🏦 Bank Transfer', desc: 'Direct bank transfer' },
  { value: 'ussd', label: '📱 USSD', desc: 'Dial code on your phone' },
  { value: 'mobile_money', label: '💰 Mobile Money', desc: 'MTN MoMo, etc.' },
];

export default function WalletPage() {
  const [wallet, setWallet] = useState(null);
  const [ledger, setLedger] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFund, setShowFund] = useState(false);
  const [fundAmount, setFundAmount] = useState('');
  const [payMethod, setPayMethod] = useState('card');
  const [funding, setFunding] = useState(false);
  const [tab, setTab] = useState('overview');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [wr, lr] = await Promise.all([getWallet(), getWalletLedger()]);
      setWallet(wr.data.data);
      setLedger(lr.data.data || []);
    } catch (err) {
      toast.error('Failed to load wallet data');
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // Check if returned from Flutterwave redirect
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const status = params.get('status');
    const txRef = params.get('tx_ref');
    if (txRef) {
      if (status === 'successful') {
        toast.success('Wallet funded successfully! 🎉');
        loadData();
      } else if (status === 'cancelled') {
        toast.error('Payment was cancelled.');
      } else if (status === 'failed') {
        toast.error('Payment failed. Please try again.');
      }
      // Clean URL
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [loadData]);

  const handleFund = async () => {
    if (!fundAmount || parseFloat(fundAmount) < 100) {
      toast.error('Minimum funding amount is ₦100');
      return;
    }
    setFunding(true);
    try {
      const redirectUrl = window.location.origin + '/wallet';
      const res = await fundWallet({
        amount: fundAmount,
        payment_method: payMethod,
        redirect_url: redirectUrl,
      });
      const data = res.data.data;
      const paymentLink = data?.payment_link;
      if (paymentLink) {
        toast.success('Redirecting to Flutterwave...');
        setShowFund(false);
        // Redirect in same tab so callback URL works
        window.location.href = paymentLink;
      } else {
        toast.success('Funding initiated! Reference: ' + data?.reference);
        setShowFund(false);
        loadData();
      }
    } catch (err) {
      const msg = err.response?.data?.error?.message || err.response?.data?.message || 'Failed to initiate funding';
      toast.error(msg);
    } finally { setFunding(false); }
  };

  if (loading) return (
    <div style={{ textAlign: 'center', padding: 80 }}>
      <div className="spinner spinner-dark" style={{ margin: '0 auto' }} />
    </div>
  );

  return (
    <div className="wallet-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
        <div className="page-title" style={{ marginBottom: 0 }}>Wallet</div>
        <button onClick={loadData} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--green)', display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, fontWeight: 600 }}>
          <RefreshCw size={14} /> Refresh
        </button>
      </div>
      <div className="page-subtitle">Manage your balance and funding</div>

      {/* Balance card */}
      <div className="wallet-bal-card">
        <div className="wb-label">Total Balance</div>
        <div className="wb-amount">
          ₦{parseFloat(wallet?.balance || 0).toLocaleString('en-NG', { minimumFractionDigits: 2 })}
        </div>
        <div className="wb-avail">
          Available: ₦{parseFloat(wallet?.available_balance || 0).toLocaleString('en-NG', { minimumFractionDigits: 2 })}
          {wallet?.reserved_balance > 0 && (
            <span style={{ marginLeft: 10, opacity: 0.75 }}>
              · Reserved: ₦{parseFloat(wallet.reserved_balance).toLocaleString()}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 20, flexWrap: 'wrap' }}>
          <button className="btn btn-primary" onClick={() => setShowFund(true)}>
            <Plus size={16} /> Fund Wallet
          </button>
          {wallet?.is_locked && (
            <span style={{ background: '#fed7d7', color: '#c53030', padding: '8px 14px', borderRadius: 8, fontSize: 13, fontWeight: 600 }}>
              🔒 Wallet Locked
            </span>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="wallet-stats-grid">
        <div className="wstat-card credit">
          <ArrowDownCircle size={22} />
          <div>
            <div className="wstat-label">Total Credited</div>
            <div className="wstat-val">₦{parseFloat(wallet?.total_credited || 0).toLocaleString()}</div>
          </div>
        </div>
        <div className="wstat-card debit">
          <ArrowUpCircle size={22} />
          <div>
            <div className="wstat-label">Total Debited</div>
            <div className="wstat-val">₦{parseFloat(wallet?.total_debited || 0).toLocaleString()}</div>
          </div>
        </div>
        <div className="wstat-card neutral">
          <Wallet size={22} />
          <div>
            <div className="wstat-label">Transactions</div>
            <div className="wstat-val">{wallet?.transaction_count || 0}</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="wallet-tabs">
        <button className={`tab-btn ${tab === 'overview' ? 'active' : ''}`} onClick={() => setTab('overview')}>Overview</button>
        <button className={`tab-btn ${tab === 'ledger' ? 'active' : ''}`} onClick={() => setTab('ledger')}>Ledger</button>
      </div>

      {tab === 'overview' && (
        <div className="card">
          <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Wallet Details</h3>
          <div className="detail-row"><span>Status</span><span className={`badge ${wallet?.is_active ? 'badge-success' : 'badge-danger'}`}>{wallet?.is_active ? 'Active' : 'Inactive'}</span></div>
          <div className="detail-row"><span>Lock Status</span><span className={`badge ${wallet?.is_locked ? 'badge-danger' : 'badge-success'}`}>{wallet?.is_locked ? '🔒 Locked' : '🔓 Unlocked'}</span></div>
          <div className="detail-row"><span>Daily Limit</span><span>₦{parseFloat(wallet?.daily_limit || 0).toLocaleString()}</span></div>
          <div className="detail-row"><span>Monthly Limit</span><span>₦{parseFloat(wallet?.monthly_limit || 0).toLocaleString()}</span></div>
          <div className="detail-row"><span>Reserved Balance</span><span>₦{parseFloat(wallet?.reserved_balance || 0).toLocaleString()}</span></div>
          <div className="detail-row"><span>Email</span><span>{wallet?.user_email}</span></div>
        </div>
      )}

      {tab === 'ledger' && (
        <div className="ledger-list">
          {ledger.length === 0 ? (
            <div className="empty-state"><p>No ledger entries yet</p></div>
          ) : ledger.map(entry => (
            <div key={entry.id} className="ledger-row">
              <div className={`ledger-icon ${entry.entry_type}`}>
                {entry.entry_type === 'credit' ? <ArrowDownCircle size={16} /> : <ArrowUpCircle size={16} />}
              </div>
              <div className="ledger-info">
                <div className="ledger-desc">{entry.description}</div>
                <div className="ledger-ref">{entry.reference} · {new Date(entry.created_at).toLocaleDateString('en-NG')}</div>
              </div>
              <div className="ledger-right">
                <div className={`ledger-amount ${entry.entry_type}`}>
                  {entry.entry_type === 'credit' ? '+' : '-'}₦{parseFloat(entry.amount).toLocaleString()}
                </div>
                <div className="ledger-bal">Bal: ₦{parseFloat(entry.balance_after).toLocaleString()}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Fund Modal */}
      {showFund && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999, padding: 20 }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowFund(false); }}>
          <div style={{ background: 'white', borderRadius: 20, padding: 32, width: '100%', maxWidth: 420 }}>
            <h3 style={{ fontWeight: 800, marginBottom: 6 }}>Fund Wallet</h3>
            <p style={{ fontSize: 13, color: 'var(--gray-500)', marginBottom: 24 }}>
              Powered by Flutterwave — secure, instant payment
            </p>

            <div className="form-group">
              <label className="form-label">Amount (₦)</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
                {FUND_PRESETS.map(a => (
                  <button key={a} type="button"
                    style={{
                      padding: '6px 12px', borderRadius: 20, cursor: 'pointer', fontSize: 13, fontWeight: 600,
                      border: `1.5px solid ${fundAmount === String(a) ? 'var(--green)' : 'var(--gray-300)'}`,
                      background: fundAmount === String(a) ? 'var(--green-light)' : 'white',
                      color: fundAmount === String(a) ? 'var(--green)' : 'inherit',
                    }}
                    onClick={() => setFundAmount(String(a))}>
                    ₦{a.toLocaleString()}
                  </button>
                ))}
              </div>
              <input className="form-input" type="number" placeholder="Or enter custom amount (min ₦100)"
                value={fundAmount} onChange={e => setFundAmount(e.target.value)} min="100" />
            </div>

            <div className="form-group">
              <label className="form-label">Payment Method</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {PAYMENT_METHODS.map(m => (
                  <button key={m.value} type="button"
                    style={{
                      padding: '12px 16px', borderRadius: 10, cursor: 'pointer', textAlign: 'left',
                      border: `2px solid ${payMethod === m.value ? 'var(--green)' : 'var(--gray-200)'}`,
                      background: payMethod === m.value ? 'var(--green-light)' : 'white',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    }}
                    onClick={() => setPayMethod(m.value)}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>{m.label}</div>
                      <div style={{ fontSize: 12, color: 'var(--gray-500)' }}>{m.desc}</div>
                    </div>
                    {payMethod === m.value && <span style={{ color: 'var(--green)', fontWeight: 700 }}>✓</span>}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ background: '#f0fff8', border: '1px solid #b2f5d8', borderRadius: 10, padding: 12, marginBottom: 20, fontSize: 13, color: '#276749' }}>
              💡 You'll be redirected to Flutterwave to complete payment. Your wallet updates automatically on success.
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-secondary btn-full" onClick={() => setShowFund(false)}>Cancel</button>
              <button className="btn btn-primary btn-full" onClick={handleFund} disabled={funding}>
                {funding ? <span className="spinner" /> : <><ExternalLink size={14} /> Proceed to Pay</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
