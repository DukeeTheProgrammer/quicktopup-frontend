import React, { useState, useEffect, useCallback } from 'react';
import { getWallet, fundWallet, getWalletLedger, getFundingStatus } from '../../api/wallet';
import toast from 'react-hot-toast';
import { Wallet, ArrowDownCircle, ArrowUpCircle, Plus, RefreshCw, AlertCircle } from 'lucide-react';
import './Wallet.css';

const FUND_PRESETS = [1000, 2000, 5000, 10000, 20000, 50000];
const PAYMENT_METHODS = [
  { value: 'card', label: '💳 Card', desc: 'Visa / Mastercard / Verve' },
  { value: 'bank_transfer', label: '🏦 Bank Transfer', desc: 'Direct bank transfer' },
  { value: 'ussd', label: '📱 USSD', desc: 'Dial code on your phone' },
  { value: 'mobile_money', label: '💰 Mobile Money', desc: 'MTN MoMo, etc.' },
];

function parseError(err) {
  if (!err) return 'Something went wrong';
  if (err.response) {
    const d = err.response.data;
    // Try all known error shapes from the API docs
    return (
      d?.error?.message ||
      d?.message ||
      d?.detail ||
      (typeof d === 'string' ? d : null) ||
      `Server error (${err.response.status})`
    );
  }
  if (err.request) return 'No response from server. Is the backend running?';
  return err.message || 'Unknown error';
}

export default function WalletPage() {
  const [wallet, setWallet] = useState(null);
  const [ledger, setLedger] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFund, setShowFund] = useState(false);
  const [fundAmount, setFundAmount] = useState('');
  const [payMethod, setPayMethod] = useState('card');
  const [funding, setFunding] = useState(false);
  const [tab, setTab] = useState('overview');

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Load wallet and ledger in parallel; if either fails, surface the real error
      const [wr, lr] = await Promise.allSettled([
        getWallet(),
        getWalletLedger(),
      ]);

      if (wr.status === 'fulfilled') {
        // Handle both res.data.data and res.data shapes
        const walletData = wr.value?.data?.data || wr.value?.data;
        setWallet(walletData);
      } else {
        const msg = parseError(wr.reason);
        setError(`Wallet: ${msg}`);
        toast.error(`Wallet error: ${msg}`);
      }

      if (lr.status === 'fulfilled') {
        const ledgerRaw = lr.value?.data?.data;
        const ledgerData = ledgerRaw?.results || (Array.isArray(ledgerRaw) ? ledgerRaw : []);
        setLedger(Array.isArray(ledgerData) ? ledgerData : []);
      } else {
        // Ledger failure is non-fatal — just show empty
        console.warn('Ledger load failed:', parseError(lr.reason));
      }
    } catch (err) {
      const msg = parseError(err);
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // Handle Flutterwave redirect callback + poll funding status (API doc 3.a)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const status = params.get('status');
    const txRef = params.get('tx_ref');
    if (!txRef) return;
    window.history.replaceState({}, '', window.location.pathname);

    if (status === 'cancelled') { toast.error('Payment was cancelled.'); return; }
    if (status === 'failed')    { toast.error('Payment failed. Please try again.'); return; }

    // status === 'successful' — poll backend to confirm wallet was credited
    if (status === 'successful') {
      toast.loading('Verifying payment…', { id: 'fund-poll' });
      let attempts = 0;
      const maxAttempts = 12; // poll up to ~60 seconds
      const interval = setInterval(async () => {
        attempts++;
        try {
          const r = await getFundingStatus(txRef);
          const fundStatus = r.data?.data?.funding?.status;
          if (fundStatus === 'completed') {
            clearInterval(interval);
            toast.success('Wallet funded successfully! 🎉', { id: 'fund-poll' });
            loadData();
          } else if (fundStatus === 'failed') {
            clearInterval(interval);
            toast.error('Payment verification failed. Contact support.', { id: 'fund-poll' });
          } else if (attempts >= maxAttempts) {
            clearInterval(interval);
            toast('Payment received — balance may take a moment to update.', { id: 'fund-poll', icon: 'ℹ️' });
            loadData();
          }
        } catch {
          if (attempts >= maxAttempts) {
            clearInterval(interval);
            toast('Could not verify payment. Check your balance shortly.', { id: 'fund-poll', icon: 'ℹ️' });
            loadData();
          }
        }
      }, 5000); // poll every 5 seconds
      // Cleanup if component unmounts
      return () => clearInterval(interval);
    }
  }, [loadData]);

  const handleFund = async () => {
    const amount = parseFloat(fundAmount);
    if (!fundAmount || isNaN(amount) || amount < 100) {
      toast.error('Minimum funding amount is ₦100');
      return;
    }
    setFunding(true);
    try {
      // redirect_url = where Flutterwave sends the user after payment
      const redirectUrl = `${window.location.origin}/wallet`;
      const res = await fundWallet({
        amount: String(amount),          // API expects string decimal
        payment_method: payMethod,
        redirect_url: redirectUrl,
      });
      // Normalise response shape
      const data = res.data?.data || res.data;
      const paymentLink = data?.payment_link;

      if (paymentLink) {
        toast.success('Redirecting to Flutterwave...');
        setShowFund(false);
        window.location.href = paymentLink;
      } else {
        // Some payment methods (e.g. bank_transfer) may not return a link
        toast.success(`Funding initiated! Reference: ${data?.reference || 'N/A'}`);
        setShowFund(false);
        loadData();
      }
    } catch (err) {
      toast.error(parseError(err));
    } finally {
      setFunding(false);
    }
  };

  if (loading) return (
    <div style={{ textAlign: 'center', padding: 80 }}>
      <div className="spinner spinner-dark" style={{ margin: '0 auto' }} />
      <p style={{ marginTop: 16, color: 'var(--gray-500)', fontSize: 14 }}>Loading wallet…</p>
    </div>
  );

  if (error && !wallet) return (
    <div style={{ textAlign: 'center', padding: 60 }}>
      <AlertCircle size={40} color="#e53e3e" style={{ margin: '0 auto 16px' }} />
      <h3 style={{ fontWeight: 700, marginBottom: 8, color: '#e53e3e' }}>Failed to Load Wallet</h3>
      <p style={{ color: 'var(--gray-500)', fontSize: 14, marginBottom: 24, maxWidth: 360, margin: '0 auto 24px' }}>{error}</p>
      <button className="btn btn-primary" onClick={loadData}>Try Again</button>
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
          {parseFloat(wallet?.reserved_balance || 0) > 0 && (
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
          <div className="detail-row"><span>Reserved</span><span>₦{parseFloat(wallet?.reserved_balance || 0).toLocaleString()}</span></div>
          <div className="detail-row"><span>Email</span><span style={{ wordBreak: 'break-all' }}>{wallet?.user_email}</span></div>
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
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999, padding: 20 }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowFund(false); }}
        >
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
              <input
                className="form-input"
                type="number"
                placeholder="Or enter custom amount"
                value={fundAmount}
                min="100"
                onChange={e => setFundAmount(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Payment Method</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {PAYMENT_METHODS.map(m => (
                  <label key={m.value}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
                      borderRadius: 12, cursor: 'pointer',
                      border: `1.5px solid ${payMethod === m.value ? 'var(--green)' : 'var(--gray-200)'}`,
                      background: payMethod === m.value ? 'var(--green-light)' : '#fff',
                    }}>
                    <input type="radio" name="payMethod" value={m.value}
                      checked={payMethod === m.value}
                      onChange={() => setPayMethod(m.value)}
                      style={{ accentColor: 'var(--green)' }} />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{m.label}</div>
                      <div style={{ fontSize: 12, color: 'var(--gray-500)' }}>{m.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
              <button className="btn btn-outline btn-full" onClick={() => setShowFund(false)} disabled={funding}>
                Cancel
              </button>
              <button className="btn btn-primary btn-full" onClick={handleFund} disabled={funding}>
                {funding ? <span className="spinner" /> : `Pay ₦${parseFloat(fundAmount || 0).toLocaleString()}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
