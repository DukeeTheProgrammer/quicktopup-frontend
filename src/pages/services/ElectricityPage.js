import React, { useState, useEffect, useCallback } from 'react';
import { getElectricityBillers } from '../../api/services';
import { purchaseElectricity } from '../../api/transactions';
import { useAuth } from '../../context/AuthContext';
import { getUserCurrency } from '../../utils/currency';
import toast from 'react-hot-toast';
import { Zap, AlertCircle, RefreshCw } from 'lucide-react';
import PinModal from './PinModal';
import './ServicePage.css';

const PRESETS = { NGN: [1000, 2000, 5000, 10000, 20000, 50000], GHS: [50, 100, 200, 500, 1000, 2000], USD: [10, 20, 50, 100, 200, 500] };
const METER_TYPES = [
  { value: 'prepaid', label: 'Prepaid' },
  { value: 'postpaid', label: 'Postpaid' },
];
const METER_REGEX = /^\d{11,13}$/;

function parseServiceList(r, key) {
  const d = r.data?.data;
  if (d && Array.isArray(d[key])) return d[key];
  if (d && Array.isArray(d.results)) return d.results;
  if (Array.isArray(d)) return d;
  if (Array.isArray(r.data)) return r.data;
  return [];
}

function getErrorMsg(err) {
  const code = err.response?.data?.error?.code;
  const msg = err.response?.data?.error?.message
    || err.response?.data?.message
    || err.response?.data?.detail
    || (typeof err.response?.data === 'string' ? err.response.data : null);
  const MAP = {
    INSUFFICIENT_FUNDS: 'Wallet balance too low. Please fund your wallet first.',
    INVALID_PIN: 'Wrong transaction PIN. Please try again.',
    WALLET_LOCKED: 'Your wallet is locked. Contact support.',
    PIN_REQUIRED: 'Set a transaction PIN first — go to Profile → Security.',
    DUPLICATE_REQUEST: 'Duplicate transaction detected. Please wait.',
    TRANSACTION_FAILED: 'Payment rejected by the electricity provider. Please try again.',
    FETCH_FAILED: 'Could not load electricity billers right now.',
  };
  return MAP[code] || msg || 'Something went wrong. Please try again.';
}

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
  const cur = getUserCurrency(user);
  const presets = PRESETS[cur.code] || PRESETS.NGN;
  const minAmt = cur.code === 'NGN' ? 100 : 10;
  const [billers, setBillers] = useState([]);
  const [billersLoading, setBillersLoading] = useState(true);
  const [billersError, setBillersError] = useState(null);
  const [form, setForm] = useState({ provider: '', meter_number: '', meter_type: 'prepaid', amount: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPin, setShowPin] = useState(false);

  const loadBillers = useCallback(() => {
    setBillersLoading(true);
    setBillersError(null);
    getElectricityBillers()
      .then(r => {
        if (r.data?.error?.code === 'FETCH_FAILED') {
          setBillersError('Could not load electricity billers. Please retry.');
          setBillers([]);
        } else {
          setBillers(parseServiceList(r, 'billers'));
        }
      })
      .catch(() => { setBillersError('Could not load billers. Please retry.'); setBillers([]); })
      .finally(() => setBillersLoading(false));
  }, []);

  useEffect(() => { loadBillers(); }, [loadBillers]);

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
    } else if (amt < minAmt) {
      e.amount = `Minimum electricity purchase is ${cur.symbol}${minAmt}`;
    } else if (amt > parseFloat(user?.wallet_balance || 0)) {
      e.amount = `Insufficient balance (you have ${cur.symbol}${parseFloat(user?.wallet_balance || 0).toLocaleString()})`;
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
        provider: form.provider,
        meter_number: form.meter_number.trim(),
        meter_type: form.meter_type,
        amount: parseFloat(form.amount),
        pin,
      });
      toast.success(`${cur.symbol}${parseFloat(form.amount).toLocaleString()} electricity units purchased`);
      setForm(p => ({ ...p, meter_number: '', amount: '' }));
      setShowPin(false);
      refreshUser();
    } catch (err) {
      toast.error(getErrorMsg(err));
      const code = err.response?.data?.error?.code;
      if (code === 'INSUFFICIENT_FUNDS') setErrors(p => ({ ...p, amount: 'Insufficient wallet balance' }));
      console.error('[Electricity Purchase]', err.response?.data);
    } finally { setLoading(false); }
  };

  const selectedBiller = billers.find(b => b.code === form.provider);

  return (
    <div className="service-page">
      <div className="page-title">Pay Electricity Bill</div>
      <div className="page-subtitle">Buy prepaid or postpaid units for any Nigerian DISCO — paid from your wallet</div>

      <div className="service-form-card">
        {/* DISCO */}
        <div className="form-group">
          <label className="form-label">
            Select Electricity Company (DISCO)
            {billersLoading && <span style={{ fontSize: 12, color: 'var(--gray-400)', marginLeft: 8 }}>Loading…</span>}
          </label>
          {billersLoading ? (
            <div style={{ textAlign: 'center', padding: 16 }}>
              <div className="spinner spinner-dark" style={{ margin: '0 auto' }} />
            </div>
          ) : billersError ? (
            <div className="fetch-error-box">
              <AlertCircle size={16} />
              <span>{billersError}</span>
              <button className="retry-btn" onClick={loadBillers}><RefreshCw size={12} /> Retry</button>
            </div>
          ) : (
            <select
              className={`form-input ${errors.provider ? 'input-error' : ''}`}
              value={form.provider}
              onChange={e => setField('provider', e.target.value)}
            >
              <option value="">-- Select your distributor --</option>
              {billers.filter(b => b.is_active !== false).map(b => (
                <option key={b.id || b.code} value={b.code}>{b.name}</option>
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
            value={form.meter_number} inputMode="numeric" maxLength={13}
            onChange={e => setField('meter_number', e.target.value.replace(/\D/g, ''))}
          />
          <FieldError msg={errors.meter_number} />
          <small style={{ fontSize: 12, color: 'var(--gray-400)', marginTop: 4, display: 'block' }}>
            Found on your meter or electricity bill
          </small>
        </div>

        {/* Amount */}
        <div className="form-group">
          <label className="form-label">Amount ({cur.symbol})</label>
          <div className="amount-presets">
            {presets.map(a => (
              <button key={a} type="button"
                className={`preset-btn ${form.amount === String(a) ? 'selected' : ''}`}
                onClick={() => setField('amount', String(a))}>
                {cur.symbol}{a.toLocaleString()}
              </button>
            ))}
          </div>
          <input
            className={`form-input ${errors.amount ? 'input-error' : ''}`}
            type="number" placeholder={`Or enter custom amount (min ${cur.symbol}${minAmt})`}
            value={form.amount} min={minAmt}
            onChange={e => setField('amount', e.target.value)}
          />
          <FieldError msg={errors.amount} />
        </div>

        {form.provider && form.meter_number && form.amount && Object.keys(errors).length === 0 && (
          <div className="summary-box">
            <div className="summary-row"><span>DISCO</span><span>{selectedBiller?.name || form.provider}</span></div>
            <div className="summary-row"><span>Meter</span><span>{form.meter_number} ({form.meter_type})</span></div>
            <div className="summary-row"><span>Amount</span><span><strong>{cur.symbol}{parseFloat(form.amount || 0).toLocaleString()}</strong></span></div>
          </div>
        )}

        <button className="btn btn-primary btn-full btn-lg" onClick={handleBuy} disabled={loading || billersLoading}>
          {loading ? <span className="spinner" /> : <><Zap size={16} /> Pay Now</>}
        </button>
        <p style={{ fontSize: 12, color: 'var(--gray-500)', textAlign: 'center', marginTop: 12 }}>
          Wallet balance: {cur.symbol}{parseFloat(user?.wallet_balance || 0).toLocaleString()} · Deducted instantly
        </p>
      </div>

      {showPin && <PinModal loading={loading} onConfirm={confirmPurchase} onClose={() => setShowPin(false)} />}
    </div>
  );
}
