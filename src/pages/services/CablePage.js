import React, { useState, useCallback } from 'react';
import { getCablePlans } from '../../api/services';
import { purchaseCable } from '../../api/transactions';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { Tv, AlertCircle, RefreshCw } from 'lucide-react';
import PinModal from './PinModal';
import './ServicePage.css';

const PROVIDERS = [
  { code: 'dstv',      label: 'DSTV',      color: '#003087' },
  { code: 'gotv',      label: 'GOtv',      color: '#e30613' },
  { code: 'startimes', label: 'Startimes', color: '#0069b4' },
  { code: 'showmax',   label: 'Showmax',   color: '#6c3483' },
];
const SMARTCARD_REGEX = /^\d{10,11}$/;

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
  const msg = err.response?.data?.error?.message || err.response?.data?.message;
  const MAP = {
    INSUFFICIENT_FUNDS: '❌ Wallet balance too low. Please fund your wallet first.',
    INVALID_PIN: '🔐 Wrong transaction PIN. Please try again.',
    WALLET_LOCKED: '🔒 Your wallet is locked. Contact support.',
    PIN_REQUIRED: '🔑 Set a transaction PIN first — go to Profile → Security.',
    DUPLICATE_REQUEST: '⚠️ Duplicate transaction detected. Please wait.',
    TRANSACTION_FAILED: '❌ Subscription rejected by the provider. Please try again.',
    FETCH_FAILED: '⚠️ Could not load cable plans right now.',
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

export default function CablePage() {
  const { user, refreshUser } = useAuth();
  const [plans, setPlans] = useState([]);
  const [provider, setProvider] = useState('');
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [smartCard, setSmartCard] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [plansLoading, setPlansLoading] = useState(false);
  const [plansError, setPlansError] = useState(null);
  const [showPin, setShowPin] = useState(false);

  const loadPlans = useCallback(async (code) => {
    setPlansLoading(true);
    setPlansError(null);
    setPlans([]);
    try {
      const r = await getCablePlans(code);
      if (r.data?.error?.code === 'FETCH_FAILED') {
        setPlansError('Could not load cable plans right now. Please retry.');
      } else {
        setPlans(parseServiceList(r, 'plans'));
      }
    } catch { setPlansError('Could not load cable plans. Please retry.'); }
    finally { setPlansLoading(false); }
  }, []);

  const handleProviderSelect = (code) => {
    setProvider(code);
    setSelectedPlan(null);
    setErrors(p => ({ ...p, provider: '', plan: '' }));
    loadPlans(code);
  };

  const planAmount = (plan) => parseFloat(plan.amount || plan.selling_price || 0);

  const validate = () => {
    const e = {};
    if (!provider) e.provider = 'Please select a provider';
    if (!smartCard.trim()) {
      e.smartCard = 'Smart card / decoder number is required';
    } else if (!SMARTCARD_REGEX.test(smartCard.trim())) {
      e.smartCard = 'Smart card number must be 10 or 11 digits';
    }
    if (!selectedPlan) e.plan = 'Please select a package';
    else if (planAmount(selectedPlan) > parseFloat(user?.wallet_balance || 0)) {
      e.plan = `Insufficient balance (need ₦${planAmount(selectedPlan).toLocaleString()})`;
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
      await purchaseCable({
        smart_card: smartCard.trim(),
        provider,
        plan_id: selectedPlan.id || selectedPlan.plan_code,
        pin,
      });
      toast.success(`${selectedPlan.name} subscription successful! ✓`);
      setSmartCard('');
      setSelectedPlan(null);
      setShowPin(false);
      refreshUser();
    } catch (err) {
      toast.error(getErrorMsg(err));
      const code = err.response?.data?.error?.code;
      if (code === 'INSUFFICIENT_FUNDS') setErrors(p => ({ ...p, plan: 'Insufficient wallet balance' }));
    } finally { setLoading(false); }
  };

  return (
    <div className="service-page">
      <div className="page-title">Cable TV Subscription</div>
      <div className="page-subtitle">Subscribe to DSTV, GOtv, Startimes &amp; more — paid from your wallet</div>

      <div className="service-form-card">
        {/* Provider */}
        <div className="form-group">
          <label className="form-label">Select Provider</label>
          <div className="cable-provider-grid">
            {PROVIDERS.map(p => (
              <button key={p.code} type="button"
                className={`cable-provider-btn ${provider === p.code ? 'selected' : ''}`}
                style={provider === p.code
                  ? { borderColor: p.color, background: p.color + '18', color: p.color, fontWeight: 700 }
                  : {}}
                onClick={() => handleProviderSelect(p.code)}>
                {p.label}
              </button>
            ))}
          </div>
          <FieldError msg={errors.provider} />
        </div>

        {/* Smart Card */}
        <div className="form-group">
          <label className="form-label">Smart Card / Decoder Number</label>
          <input
            className={`form-input ${errors.smartCard ? 'input-error' : ''}`}
            placeholder="10 or 11 digit decoder number"
            value={smartCard} maxLength={11} inputMode="numeric"
            onChange={e => { setSmartCard(e.target.value.replace(/\D/g, '')); setErrors(p => ({ ...p, smartCard: '' })); }}
          />
          <FieldError msg={errors.smartCard} />
          <small style={{ fontSize: 12, color: 'var(--gray-400)', marginTop: 4, display: 'block' }}>
            Found on your decoder box or subscription card (10–11 digits)
          </small>
        </div>

        {/* Plans */}
        {provider && (
          <div className="form-group">
            <label className="form-label">
              Select Package
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
                <button className="retry-btn" onClick={() => loadPlans(provider)}><RefreshCw size={12} /> Retry</button>
              </div>
            ) : plans.filter(p => p.is_active !== false).length === 0 ? (
              <div style={{ padding: 16, background: 'var(--gray-100)', borderRadius: 10, fontSize: 14, color: 'var(--gray-500)', textAlign: 'center' }}>
                No packages available for {provider.toUpperCase()} right now
              </div>
            ) : (
              <div className="plan-grid">
                {plans.filter(p => p.is_active !== false).map(plan => (
                  <button key={plan.id || plan.plan_code} type="button"
                    className={`plan-btn ${selectedPlan?.id === plan.id || selectedPlan?.plan_code === plan.plan_code ? 'selected' : ''}`}
                    onClick={() => { setSelectedPlan(plan); setErrors(p => ({ ...p, plan: '' })); }}>
                    <div className="plan-name">{plan.name}</div>
                    {plan.validity_days && <div className="plan-validity">{plan.validity_days} days</div>}
                    <div className="plan-price">₦{planAmount(plan).toLocaleString()}</div>
                  </button>
                ))}
              </div>
            )}
            <FieldError msg={errors.plan} />
          </div>
        )}

        {selectedPlan && smartCard && Object.keys(errors).length === 0 && (
          <div className="summary-box">
            <div className="summary-row"><span>Provider</span><span>{provider.toUpperCase()}</span></div>
            <div className="summary-row"><span>Package</span><span>{selectedPlan.name}</span></div>
            {selectedPlan.validity_days && <div className="summary-row"><span>Duration</span><span>{selectedPlan.validity_days} days</span></div>}
            <div className="summary-row"><span>Smart Card</span><span>{smartCard}</span></div>
            <div className="summary-row"><span>Total</span><span><strong>₦{planAmount(selectedPlan).toLocaleString()}</strong></span></div>
          </div>
        )}

        <button className="btn btn-primary btn-full btn-lg" onClick={handleBuy} disabled={loading}>
          {loading ? <span className="spinner" /> : <><Tv size={16} /> Subscribe Now</>}
        </button>
        <p style={{ fontSize: 12, color: 'var(--gray-500)', textAlign: 'center', marginTop: 12 }}>
          Wallet balance: ₦{parseFloat(user?.wallet_balance || 0).toLocaleString()} · Deducted instantly
        </p>
      </div>

      {showPin && <PinModal loading={loading} onConfirm={confirmPurchase} onClose={() => setShowPin(false)} />}
    </div>
  );
}
