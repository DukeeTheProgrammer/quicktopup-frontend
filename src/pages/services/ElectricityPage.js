import React, { useState, useEffect } from 'react';
import { getElectricityBillers } from '../../api/services';
import { purchaseElectricity } from '../../api/transactions';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { Zap, AlertCircle } from 'lucide-react';
import PinModal from './PinModal';
import './ServicePage.css';

const PRESETS = [1000, 2000, 5000, 10000, 20000, 50000];
const METER_TYPES = [
  { value: 'prepaid', label: '⚡ Prepaid' },
  { value: 'postpaid', label: '📋 Postpaid' },
];
// Meter numbers are typically 11 digits for Nigerian DISCOs
const METER_REGEX = /^\d{11,13}$/;

function FieldError({ msg }) {
  if (!msg) return null;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#e53e3e', fontSize: 12, marginTop: 4 }}>
      <AlertCircle size={12} /> {msg}
    </div>
  );
}

export default function ElectricityPage() {
  const { user, refreshUser } = useAuth();
  const [billers, setBillers] = useState([]);
  const [billersLoading, setBillersLoading] = useState(true);
  const [form, setForm] = useState({ provider: '', meter_number: '', meter_type: 'prepaid', amount: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPin, setShowPin] = useState(false);

  useEffect(() => {
    setBillersLoading(true);
    getElectricityBillers()
      .then(r => {
        const raw = r.data?.data;
        setBillers(raw?.results || (Array.isArray(raw) ? raw : []));
      })
      .catch(() => {})
      .finally(() => setBillersLoading(false));
  }, []);

  const setField = (k, v) => {
    setForm(p => ({ ...p, [k]: v }));
    setErrors(p => ({ ...p, [k]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.provider) e.provider = 'Please select an electricity company';
    if (!form.meter_number.trim()) {
      e.meter_number = 'Meter number is required';
    } else if (!METER_REGEX.test(form.meter_number.trim())) {
      e.meter_number = 'Meter number must be 11–13 digits';
    }
    const amt = parseFloat(form.amount);
    if (!form.amount || isNaN(amt)) {
      e.amount = 'Amount is required';
    } else if (amt < 100) {
      e.amount = 'Minimum electricity purchase is ₦100';
    } else if (amt > parseFloat(user?.wallet_balance || 0)) {
      e.amount = `Insufficient balance (you have ₦${parseFloat(user?.wallet_balance || 0).toLocaleString()})`;
    }
    return e;
  };

  const handleBuy = () => {
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0) return;
    setShowPin(true);
  };

  const confirmPurchase = async (pin) => {
    setLoading(true);
    try {
      await purchaseElectricity({
        provider: form.provider,       // API confirmed field: "provider" (not "biller")
        meter_number: form.meter_number.trim(),
        meter_type: form.meter_type,
        amount: form.amount,
        pin,
      });
      toast.success(`₦${parseFloat(form.amount).toLocaleString()} electricity units purchased! ✓`);
      setForm(p => ({ ...p, meter_number: '', amount: '' }));
      setShowPin(false);
      refreshUser();
    } catch (err) {
      const e = err.response?.data;
      toast.error(e?.error?.message || e?.message || 'Purchase failed');
      if (e?.error?.code === 'INSUFFICIENT_FUNDS') setErrors(p => ({ ...p, amount: 'Insufficient wallet balance' }));
    } finally { setLoading(false); }
  };

  const selectedBiller = billers.find(b => b.code === form.provider);

  return (
    <div className="service-page">
      <div className="page-title">Pay Electricity Bill</div>
      <div className="page-subtitle">Buy prepaid or postpaid units for any Nigerian DISCO — paid from your wallet</div>

      <div className="service-form-card">

        {/* DISCO — loaded from backend */}
        <div className="form-group">
          <label className="form-label">
            Select Electricity Company (DISCO)
            {billersLoading && <span style={{ fontSize: 12, color: 'var(--gray-400)', marginLeft: 8 }}>Loading…</span>}
          </label>
          {billersLoading ? (
            <div style={{ textAlign: 'center', padding: 16 }}>
              <div className="spinner spinner-dark" style={{ margin: '0 auto' }} />
            </div>
          ) : (
            <select
              className={`form-input ${errors.provider ? 'input-error' : ''}`}
              value={form.provider}
              onChange={e => setField('provider', e.target.value)}
            >
              <option value="">-- Select your distributor --</option>
              {billers.filter(b => b.is_active).map(b => (
                <option key={b.id} value={b.code}>{b.name}</option>
              ))}
            </select>
          )}
          <FieldError msg={errors.provider} />
        </div>

        {/* Meter type */}
        <div className="form-group">
          <label className="form-label">Meter Type</label>
          <div style={{ display: 'flex', gap: 10 }}>
            {METER_TYPES.map(mt => (
              <button key={mt.value} type="button"
                className={`preset-btn ${form.meter_type === mt.value ? 'selected' : ''}`}
                style={{ flex: 1 }}
                onClick={() => setField('meter_type', mt.value)}>
                {mt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Meter number */}
        <div className="form-group">
          <label className="form-label">Meter Number</label>
          <input
            className={`form-input ${errors.meter_number ? 'input-error' : ''}`}
            placeholder="11–13 digit meter number"
            value={form.meter_number}
            inputMode="numeric"
            maxLength={13}
            onChange={e => setField('meter_number', e.target.value.replace(/\D/g, ''))}
          />
          <FieldError msg={errors.meter_number} />
          <small style={{ fontSize: 12, color: 'var(--gray-400)', marginTop: 4, display: 'block' }}>
            Found on your meter or electricity bill
          </small>
        </div>

        {/* Amount */}
        <div className="form-group">
          <label className="form-label">Amount (₦)</label>
          <div className="amount-presets">
            {PRESETS.map(a => (
              <button key={a} type="button"
                className={`preset-btn ${form.amount === String(a) ? 'selected' : ''}`}
                onClick={() => setField('amount', String(a))}>
                ₦{a.toLocaleString()}
              </button>
            ))}
          </div>
          <input
            className={`form-input ${errors.amount ? 'input-error' : ''}`}
            type="number" placeholder="Or enter custom amount (min ₦100)"
            value={form.amount} min="100"
            onChange={e => setField('amount', e.target.value)}
          />
          <FieldError msg={errors.amount} />
        </div>

        {/* Summary */}
        {form.provider && form.meter_number && form.amount && Object.keys(errors).length === 0 && (
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
          Wallet balance: ₦{parseFloat(user?.wallet_balance || 0).toLocaleString()} · Deducted instantly
        </p>
      </div>

      {showPin && <PinModal loading={loading} onConfirm={confirmPurchase} onClose={() => setShowPin(false)} />}
    </div>
  );
}
