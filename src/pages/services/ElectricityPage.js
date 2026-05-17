import React, { useState, useEffect } from 'react';
import { getElectricityBillers } from '../../api/services';
import { purchaseElectricity } from '../../api/transactions';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { Zap } from 'lucide-react';
import PinModal from './PinModal';
import './ServicePage.css';

const PRESETS = [1000, 2000, 5000, 10000, 20000, 50000];
const METER_TYPES = [
  { value: 'prepaid', label: 'Prepaid' },
  { value: 'postpaid', label: 'Postpaid' },
];

export default function ElectricityPage() {
  const { user, refreshUser } = useAuth();
  const [billers, setBillers] = useState([]);
  const [form, setForm] = useState({
    provider: '',     // API confirmed field name is "provider" (not "biller")
    meter_number: '',
    meter_type: 'prepaid',
    amount: '',
  });
  const [loading, setLoading] = useState(false);
  const [showPin, setShowPin] = useState(false);

  useEffect(() => {
    getElectricityBillers()
      .then(r => {
        const raw = r.data?.data;
        setBillers(raw?.results || (Array.isArray(raw) ? raw : []));
      })
      .catch(() => {});
  }, []);

  const handleBuy = () => {
    if (!form.provider || !form.meter_number.trim() || !form.amount) {
      toast.error('Please fill all fields');
      return;
    }
    if (parseFloat(form.amount) < 100) {
      toast.error('Minimum electricity purchase is ₦100');
      return;
    }
    setShowPin(true);
  };

  const confirmPurchase = async (pin) => {
    setLoading(true);
    try {
      // API confirmed: field is "provider" (not "biller")
      await purchaseElectricity({
        provider: form.provider,
        meter_number: form.meter_number.trim(),
        meter_type: form.meter_type,
        amount: form.amount,
        phone: user?.phone,
        pin,
      });
      toast.success(`₦${parseFloat(form.amount).toLocaleString()} electricity units purchased! ✓`);
      setForm(p => ({ ...p, meter_number: '', amount: '' }));
      setShowPin(false);
      refreshUser();
    } catch (err) {
      const e = err.response?.data;
      toast.error(e?.error?.message || e?.message || 'Purchase failed');
    } finally {
      setLoading(false);
    }
  };

  const selectedBiller = billers.find(b => b.code === form.provider);

  return (
    <div className="service-page">
      <div className="page-title">Pay Electricity Bill</div>
      <div className="page-subtitle">Buy prepaid or postpaid units — paid from your wallet</div>

      <div className="service-form-card">

        {/* DISCO selector */}
        <div className="form-group">
          <label className="form-label">Select Electricity Company (DISCO)</label>
          <select
            className="form-input"
            value={form.provider}
            onChange={e => setForm(p => ({ ...p, provider: e.target.value }))}
          >
            <option value="">-- Select distributor --</option>
            {billers.filter(b => b.is_active).map(b => (
              <option key={b.id} value={b.code}>{b.name}</option>
            ))}
          </select>
        </div>

        {/* Meter type */}
        <div className="form-group">
          <label className="form-label">Meter Type</label>
          <div style={{ display: 'flex', gap: 10 }}>
            {METER_TYPES.map(mt => (
              <button key={mt.value} type="button"
                className={`preset-btn ${form.meter_type === mt.value ? 'selected' : ''}`}
                style={{ flex: 1 }}
                onClick={() => setForm(p => ({ ...p, meter_type: mt.value }))}>
                {mt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Meter number */}
        <div className="form-group">
          <label className="form-label">Meter Number</label>
          <input
            className="form-input"
            placeholder="Enter your meter number"
            value={form.meter_number}
            onChange={e => setForm(p => ({ ...p, meter_number: e.target.value }))}
          />
        </div>

        {/* Amount */}
        <div className="form-group">
          <label className="form-label">Amount (₦)</label>
          <div className="amount-presets">
            {PRESETS.map(a => (
              <button key={a} type="button"
                className={`preset-btn ${form.amount === String(a) ? 'selected' : ''}`}
                onClick={() => setForm(p => ({ ...p, amount: String(a) }))}>
                ₦{a.toLocaleString()}
              </button>
            ))}
          </div>
          <input
            className="form-input"
            type="number"
            placeholder="Or enter custom amount"
            value={form.amount}
            min="100"
            onChange={e => setForm(p => ({ ...p, amount: e.target.value }))}
          />
        </div>

        {/* Summary */}
        {form.provider && form.meter_number && form.amount && (
          <div className="summary-box">
            <div className="summary-row"><span>DISCO</span><span>{selectedBiller?.name || form.provider.toUpperCase()}</span></div>
            <div className="summary-row"><span>Meter</span><span>{form.meter_number} ({form.meter_type})</span></div>
            <div className="summary-row"><span>Amount</span><span><strong>₦{parseFloat(form.amount || 0).toLocaleString()}</strong></span></div>
          </div>
        )}

        <button className="btn btn-primary btn-full btn-lg" onClick={handleBuy} disabled={loading}>
          {loading ? <span className="spinner" /> : <><Zap size={16} /> Pay Now</>}
        </button>

        <p style={{ fontSize: 12, color: 'var(--gray-500)', textAlign: 'center', marginTop: 12 }}>
          Wallet balance: ₦{parseFloat(user?.wallet_balance || 0).toLocaleString()} · Deducted instantly from wallet
        </p>
      </div>

      {showPin && <PinModal loading={loading} onConfirm={confirmPurchase} onClose={() => setShowPin(false)} />}
    </div>
  );
}
