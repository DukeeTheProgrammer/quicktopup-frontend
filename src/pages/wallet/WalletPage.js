import React, { useState, useEffect } from 'react';
import { getWallet, fundWallet, getWalletLedger } from '../../api/wallet';
import toast from 'react-hot-toast';
import { Wallet, ArrowDownCircle, ArrowUpCircle, Plus, Copy } from 'lucide-react';
import './Wallet.css';

export default function WalletPage() {
  const [wallet, setWallet] = useState(null);
  const [ledger, setLedger] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFund, setShowFund] = useState(false);
  const [fundData, setFundData] = useState(null);
  const [fundAmount, setFundAmount] = useState('');
  const [funding, setFunding] = useState(false);
  const [tab, setTab] = useState('overview');
  const FUND_PRESETS = [1000, 2000, 5000, 10000, 20000, 50000];

  useEffect(() => {
    const load = async () => {
      try {
        const [wr, lr] = await Promise.all([getWallet(), getWalletLedger()]);
        setWallet(wr.data.data);
        setLedger(lr.data.data || []);
      } catch {} finally { setLoading(false); }
    };
    load();
  }, []);

  const handleFund = async () => {
    if (!fundAmount) { toast.error('Enter amount'); return; }
    setFunding(true);
    try {
      const res = await fundWallet({ amount: fundAmount, payment_method: 'bank_transfer' });
      setFundData(res.data.data);
      toast.success('Funding initiated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to initiate funding');
    } finally { setFunding(false); }
  };

  const copy = (text) => { navigator.clipboard.writeText(text); toast.success('Copied!'); };

  if (loading) return <div style={{ textAlign: 'center', padding: 80 }}><div className="spinner spinner-dark" style={{ margin: '0 auto' }} /></div>;

  return (
    <div className="wallet-page">
      <div className="page-title">Wallet</div>
      <div className="page-subtitle">Manage your balance and transactions</div>

      {/* Balance card */}
      <div className="wallet-bal-card">
        <div className="wb-label">Total Balance</div>
        <div className="wb-amount">₦{parseFloat(wallet?.balance || 0).toLocaleString('en-NG', { minimumFractionDigits: 2 })}</div>
        <div className="wb-avail">Available: ₦{parseFloat(wallet?.available_balance || 0).toLocaleString('en-NG', { minimumFractionDigits: 2 })}</div>
        <button className="btn btn-primary" style={{ marginTop: 20 }} onClick={() => setShowFund(true)}>
          <Plus size={16} /> Fund Wallet
        </button>
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
        <button className={`tab-btn ${tab === 'ledger' ? 'active' : ''}`} onClick={() => setTab('ledger')}>Transaction Ledger</button>
      </div>

      {tab === 'overview' && (
        <div className="card">
          <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Wallet Details</h3>
          <div className="detail-row"><span>Daily Limit</span><span>₦{parseFloat(wallet?.daily_limit || 0).toLocaleString()}</span></div>
          <div className="detail-row"><span>Monthly Limit</span><span>₦{parseFloat(wallet?.monthly_limit || 0).toLocaleString()}</span></div>
          <div className="detail-row"><span>Status</span><span className={`badge ${wallet?.is_active ? 'badge-success' : 'badge-danger'}`}>{wallet?.is_active ? 'Active' : 'Inactive'}</span></div>
          <div className="detail-row"><span>Locked</span><span className={`badge ${wallet?.is_locked ? 'badge-danger' : 'badge-success'}`}>{wallet?.is_locked ? 'Locked' : 'Unlocked'}</span></div>
          <div className="detail-row"><span>Reserved Balance</span><span>₦{parseFloat(wallet?.reserved_balance || 0).toLocaleString()}</span></div>
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

      {/* Fund modal */}
      {showFund && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999, padding: 20 }}>
          <div style={{ background: 'white', borderRadius: 20, padding: 32, width: '100%', maxWidth: 400 }}>
            {!fundData ? (
              <>
                <h3 style={{ fontWeight: 700, marginBottom: 20 }}>Fund Wallet</h3>
                <div className="form-group">
                  <label className="form-label">Amount</label>
                  <div className="amount-presets" style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
                    {FUND_PRESETS.map(a => (
                      <button key={a} type="button"
                        style={{ padding: '6px 12px', borderRadius: 20, border: `1.5px solid ${fundAmount === String(a) ? 'var(--green)' : 'var(--gray-300)'}`,
                          background: fundAmount === String(a) ? 'var(--green-light)' : 'white', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}
                        onClick={() => setFundAmount(String(a))}>
                        ₦{a.toLocaleString()}
                      </button>
                    ))}
                  </div>
                  <input className="form-input" type="number" placeholder="Enter amount"
                    value={fundAmount} onChange={e => setFundAmount(e.target.value)} />
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button className="btn btn-secondary btn-full" onClick={() => setShowFund(false)}>Cancel</button>
                  <button className="btn btn-primary btn-full" onClick={handleFund} disabled={funding}>
                    {funding ? <span className="spinner" /> : 'Continue'}
                  </button>
                </div>
              </>
            ) : (
              <>
                <h3 style={{ fontWeight: 700, marginBottom: 8 }}>Payment Details</h3>
                <p style={{ fontSize: 13, color: 'var(--gray-500)', marginBottom: 20 }}>Transfer ₦{parseFloat(fundAmount).toLocaleString()} to the account below</p>
                {Object.entries(fundData.payment_details || {}).map(([k, v]) => (
                  <div key={k} className="detail-row">
                    <span style={{ textTransform: 'capitalize' }}>{k.replace(/_/g, ' ')}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontWeight: 700 }}>{v}</span>
                      <button onClick={() => copy(v)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--green)' }}>
                        <Copy size={14} />
                      </button>
                    </div>
                  </div>
                ))}
                <div style={{ background: 'var(--green-light)', borderRadius: 10, padding: 12, margin: '16px 0', fontSize: 13, color: 'var(--green-dark)' }}>
                  ⚡ Reference: <strong>{fundData.reference}</strong>
                </div>
                <button className="btn btn-primary btn-full" onClick={() => { setShowFund(false); setFundData(null); setFundAmount(''); }}>Done</button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
