import React, { useState, useEffect, useCallback } from 'react';
import { getNetworks, getDataPlans } from '../../api/services';
import { purchaseData } from '../../api/transactions';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import PinModal from './PinModal';
import { Wifi, AlertCircle, RefreshCw, XCircle, Lock, KeyRound, AlertTriangle } from 'lucide-react';
import './ServicePage.css';

const NET_COLORS = {
  MTN: '#f6ad55', AIRTEL: '#e53e3e', GLO: '#00b96b',
  '9MOBILE': '#38a169', ETISALAT: '#38a169',
  VODAFONE: '#e53e3e', AIRTELTIGO: '#e53e3e',
};
// ── Phone validation regexes ─────────────────────────────
// Nigeria: 080/081/090/070/091 (11 digits) OR +234 prefix (13 digits)
const NG_REGEX = /^(?:0[7-9]\d{9}|\+234[7-9]\d{9})$/;
// Ghana MTN: +23324/055/059 | Vodafone: +23320/050 | AirtelTigo: +23326/027/057
const GH_REGEX = /^\+233(?:2[0-46-9]|5[0-79])\d{7}$/;

function validatePhone(phone, countryCode) {
  const p = phone.trim();
  if (!p) return 'Phone number is required';
  if (countryCode === 'NG') {
    if (!NG_REGEX.test(p)) {
      if (p.startsWith('+233')) return 'Switch country to Ghana for +233 numbers';
      return 'Enter a valid Nigerian number — 0801..., 0901..., or +2348...';
    }
  } else if (countryCode === 'GH') {
    if (!GH_REGEX.test(p)) {
      if (!p.startsWith('+')) return 'Ghana numbers must start with +233 (e.g. +233241234567)';
      if (p.startsWith('+234')) return 'Switch country to Nigeria for +234 numbers';
      return 'Enter a valid Ghana number — +233241234567, +233201234567, etc.';
    }
  }
  return null; // valid
}

const COUNTRIES = [
  { code: 'NG', label: 'Nigeria', currency: '₦',
    placeholder: '08012345678 or +2348012345678' },
  { code: 'GH', label: 'Ghana', currency: 'GH₵',
    placeholder: '+233241234567' },
];
const GH_CODES = ['vodafone', 'airteltigo'];
const isGhanaNetwork = (code) => GH_CODES.includes((code || '').toLowerCase());

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
    DUPLICATE_REQUEST: 'Duplicate transaction detected. Please wait before retrying.',
    TRANSACTION_FAILED: 'Transaction rejected by the network provider. Please try again.',
    PAYMENT_INIT_FAILED: 'Payment initiation failed. Try a different method.',
    FETCH_FAILED: 'Could not load service data. Please retry.',
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

export default function DataPage() {
  const { user, refreshUser } = useAuth();
  const [networks, setNetworks] = useState([]);
  const [plans, setPlans] = useState([]);
  const [country, setCountry] = useState('NG');
  const [form, setForm] = useState({ phone: '', network: '', plan_id: null });
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [networksLoading, setNetworksLoading] = useState(true);
  const [networksError, setNetworksError] = useState(null);
  const [plansLoading, setPlansLoading] = useState(false);
  const [plansError, setPlansError] = useState(null);
  const [showPin, setShowPin] = useState(false);

  const selectedCountry = COUNTRIES.find(c => c.code === country);

  const loadNetworks = useCallback(() => {
    setNetworksLoading(true);
    setNetworksError(null);
    getNetworks()
      .then(r => {
        const list = parseServiceList(r, 'networks');
        if (list.length === 0 && r.data?.error?.code === 'FETCH_FAILED') {
          setNetworksError('Could not load networks from provider. Please retry.');
        } else { setNetworks(list); }
      })
      .catch(() => setNetworksError('Could not load networks. Please retry.'))
      .finally(() => setNetworksLoading(false));
  }, []);

  useEffect(() => { loadNetworks(); }, [loadNetworks]);

  const filteredNetworks = networks.filter(n => {
    const code = (n.code || '').toLowerCase();
    if (country === 'GH') return code === 'mtn' || isGhanaNetwork(code);
    return !isGhanaNetwork(code) && code !== 'hubtel';
  });

  const displayCode = (code) => (code || '').toUpperCase();

  const handlePhoneChange = (e) => {
    const val = e.target.value;
    setForm(p => ({ ...p, phone: val }));
    // Auto-switch country from prefix
    let newCountry = country;
    if (val.startsWith('+233')) newCountry = 'GH';
    else if (val.startsWith('+234')) newCountry = 'NG';
    if (newCountry !== country) setCountry(newCountry);
    // Live validation (only if user has typed enough to evaluate)
    if (val.length >= 10) {
      const err = validatePhone(val, newCountry);
      setErrors(p => ({ ...p, phone: err || '' }));
    } else {
      setErrors(p => ({ ...p, phone: '' }));
    }
  };

  const selectNetwork = async (code) => {
    setForm(p => ({ ...p, network: code, plan_id: null }));
    setSelectedPlan(null);
    setErrors(p => ({ ...p, network: '', plan: '' }));
    setPlansLoading(true);
    setPlansError(null);
    try {
      const r = await getDataPlans(code.toLowerCase());
      if (r.data?.error?.code === 'FETCH_FAILED') {
        setPlansError('Could not load data plans right now. Please retry.');
        setPlans([]);
      } else {
        setPlans(parseServiceList(r, 'plans'));
      }
    } catch { setPlansError('Could not load data plans. Please retry.'); setPlans([]); }
    finally { setPlansLoading(false); }
  };

  const validate = () => {
    const e = {};
    if (!form.network) e.network = 'Please select a network';
    const phoneErr = validatePhone(form.phone, country);
    if (phoneErr) e.phone = phoneErr;
    if (!form.plan_id) e.plan = 'Please select a data plan';
    if (selectedPlan) {
      const price = parseFloat(selectedPlan.amount || selectedPlan.selling_price || 0);
      if (price > parseFloat(user?.wallet_balance || 0)) {
        e.plan = `Insufficient balance (need ${selectedCountry.currency}${price.toLocaleString()})`;
      }
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
      await purchaseData({
        phone: form.phone.trim(),
        network: form.network.toLowerCase(),
        plan_code: selectedPlan?.plan_code || form.plan_id,
        amount: parseFloat(selectedPlan?.amount || selectedPlan?.selling_price || 0),
        pin,
      });
      toast.success(`${selectedPlan?.name} sent to ${form.phone}`);
      setForm(p => ({ ...p, plan_id: null }));
      setSelectedPlan(null);
      setShowPin(false);
      refreshUser();
    } catch (err) {
      toast.error(getErrorMsg(err));
      const code = err.response?.data?.error?.code;
      if (code === 'INSUFFICIENT_FUNDS') setErrors(p => ({ ...p, plan: 'Insufficient wallet balance' }));
      console.error('[Data Purchase]', err.response?.data);
    } finally { setLoading(false); }
  };

  const planPrice = (plan) => parseFloat(plan.amount || plan.selling_price || 0);

  return (
    <div className="service-page">
      <div className="page-title">Buy Data Bundle</div>
      <div className="page-subtitle">Get internet data for any Nigerian or Ghanaian network from your wallet</div>

      <div className="service-form-card">
        {/* Country */}
        <div className="form-group">
          <label className="form-label">Country</label>
          <div style={{ display: 'flex', gap: 10 }}>
            {COUNTRIES.map(c => (
              <button key={c.code} type="button"
                className={`cable-provider-btn ${country === c.code ? 'selected' : ''}`}
                onClick={() => { setCountry(c.code); setForm({ phone: '', network: '', plan_id: null }); setPlans([]); setSelectedPlan(null); setErrors({}); }}>
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Network */}
        <div className="form-group">
          <label className="form-label">Select Network</label>
          {networksLoading ? (
            <div style={{ textAlign: 'center', padding: 16 }}>
              <div className="spinner spinner-dark" style={{ margin: '0 auto' }} />
              <p style={{ fontSize: 12, color: 'var(--gray-400)', marginTop: 8 }}>Loading networks…</p>
            </div>
          ) : networksError ? (
            <div className="fetch-error-box">
              <AlertCircle size={16} />
              <span>{networksError}</span>
              <button className="retry-btn" onClick={loadNetworks}><RefreshCw size={12} /> Retry</button>
            </div>
          ) : (
            <div className="network-grid">
              {filteredNetworks.map(net => (
                <button key={net.id || net.code} type="button"
                  className={`network-btn ${form.network === net.code ? 'selected' : ''}`}
                  onClick={() => selectNetwork(net.code)}>
                  <div className="net-icon"
                    style={{ background: NET_COLORS[displayCode(net.code)] || '#718096', color: 'white' }}>
                    {displayCode(net.code).slice(0, 3)}
                  </div>
                  {net.name?.split(' ')[0]}
                </button>
              ))}
            </div>
          )}
          <FieldError msg={errors.network} />
        </div>

        {/* Phone */}
        <div className="form-group">
          <label className="form-label">Phone Number</label>
          <input className={`form-input ${errors.phone ? 'input-error' : ''}`}
            type="tel" placeholder={selectedCountry.placeholder}
            value={form.phone} onChange={handlePhoneChange} />
          <FieldError msg={errors.phone} />
        </div>

        {/* Plans */}
        {form.network && (
          <div className="form-group">
            <label className="form-label">
              Select Data Plan
              {plansLoading && <span style={{ fontSize: 12, color: 'var(--gray-400)', marginLeft: 8 }}>Loading…</span>}
            </label>
            {plansLoading ? (
              <div style={{ textAlign: 'center', padding: 20 }}>
                <div className="spinner spinner-dark" style={{ margin: '0 auto' }} />
              </div>
            ) : plansError ? (
              <div className="fetch-error-box">
                <AlertCircle size={16} />
                <span>{plansError}</span>
                <button className="retry-btn" onClick={() => selectNetwork(form.network)}><RefreshCw size={12} /> Retry</button>
              </div>
            ) : plans.filter(p => p.is_active !== false).length === 0 ? (
              <div style={{ padding: 16, background: 'var(--gray-100)', borderRadius: 10, fontSize: 14, color: 'var(--gray-500)', textAlign: 'center' }}>
                No plans available for {displayCode(form.network)} right now
              </div>
            ) : (
              <div className="plan-grid">
                {plans.filter(p => p.is_active !== false).map(plan => (
                  <button key={plan.id || plan.plan_code} type="button"
                    className={`plan-btn ${form.plan_id === (plan.id || plan.plan_code) ? 'selected' : ''}`}
                    onClick={() => { setForm(p => ({ ...p, plan_id: plan.id || plan.plan_code })); setSelectedPlan(plan); setErrors(p => ({ ...p, plan: '' })); }}>
                    <div className="plan-name">{plan.name}</div>
                    <div className="plan-size">{plan.data_size}</div>
                    <div className="plan-price">{selectedCountry.currency}{planPrice(plan).toLocaleString()}</div>
                    {plan.validity_days && <div className="plan-validity">{plan.validity_days} days</div>}
                  </button>
                ))}
              </div>
            )}
            <FieldError msg={errors.plan} />
          </div>
        )}

        {selectedPlan && form.phone && Object.keys(errors).length === 0 && (
          <div className="summary-box">
            <div className="summary-row"><span>Country</span><span>{selectedCountry.label} ({selectedCountry.code})</span></div>
            <div className="summary-row"><span>Plan</span><span>{selectedPlan.name}</span></div>
            {selectedPlan.data_size && <div className="summary-row"><span>Data</span><span>{selectedPlan.data_size}{selectedPlan.validity_days ? ` / ${selectedPlan.validity_days} days` : ''}</span></div>}
            <div className="summary-row"><span>Phone</span><span>{form.phone}</span></div>
            <div className="summary-row"><span>Total</span><span><strong>{selectedCountry.currency}{planPrice(selectedPlan).toLocaleString()}</strong></span></div>
          </div>
        )}

        <button className="btn btn-primary btn-full btn-lg" onClick={handleBuy} disabled={loading || networksLoading}>
          {loading ? <span className="spinner" /> : <><Wifi size={16} /> Buy Data</>}
        </button>
        <p style={{ fontSize: 12, color: 'var(--gray-500)', textAlign: 'center', marginTop: 12 }}>
          Wallet balance: ₦{parseFloat(user?.wallet_balance || 0).toLocaleString()}
        </p>
      </div>

      {showPin && <PinModal loading={loading} onConfirm={confirmPurchase} onClose={() => setShowPin(false)} />}
    </div>
  );
}
