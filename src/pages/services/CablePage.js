import React, { useState, useEffect } from 'react';
import { getCablePlans } from '../../api/services';
import { purchaseCable } from '../../api/transactions';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { Tv, AlertCircle } from 'lucide-react';
import PinModal from './PinModal';
import './ServicePage.css';

const PROVIDERS = [
  { code: 'dstv',      label: 'DSTV',      color: '#003087' },
  { code: 'gotv',      label: 'GOtv',      color: '#e30613' },
  { code: 'startimes', label: 'Startimes', color: '#0069b4' },
  { code: 'showmax',   label: 'Showmax',   color: '#6c3483' },
];

// Smart card number: 10–11 digits
const SMARTCARD_REGEX = /^\d{10,11}$/;

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
  const [allPlans, setAllPlans] = useState([]);
  const [provider, setProvider] = useState('');
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [smartCard, setSmartCard] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [plansLoading, setPlansLoading] = useState(false);
  const [showPin, setShowPin] = useState(false);

  const handleProviderSelect = async (code) => {
    setProvider(code);
    setSelectedPlan(null);
    setErrors(p => ({ ...p, provider: '', plan: '' }));
    setPlansLoading(true);
    try {
      const r = await getCablePlans(code); // API: ?provider=dstv (lowercase)
      const raw = r.data?.data;
      setAllPlans(raw?.results || (Array.isArray(raw) ? raw : []));
    } catch { setAllPlans([]); }
    finally { setPlansLoading(false); }
  };

  // Also load all on mount (for initial display if plans exist without filter)
  useEffect(() => {
    getCablePlans()
      .then(r => { const raw = r.data?.data; setAllPlans(raw?.results || (Array.isArray(raw) ? raw : [])); })
      .catch(() => {});
  }, []);

  const activePlans = allPlans.filter(p => p.is_active &&
    (provider ? (p.provider || '').toLowerCase() === provider : true)
  );

  const validate = () => {
    const e = {};
    if (!provider) e.provider = 'Please select a provider';
    if (!smartCard.trim()) {
      e.smartCard = 'Smart card / decoder number is required';
    } else if (!SMARTCARD_REGEX.test(smartCard.trim())) {
      e.smartCard = 'Smart card number must be 10 or 11 digits';
    }
    if (!selectedPlan) e.plan = 'Please select a package';
    else if (parseFloat(selectedPlan.selling_price) > parseFloat(user?.wallet_balance || 0)) {
      e.plan = `Insufficient balance (need ₦${parseFloat(selectedPlan.selling_price).toLocaleString()})`;
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
        smart_card: smartCard.trim(), // confirmed API field name
        provider,
        plan_id: selectedPlan.id,
        pin,
      });
      toast.success(`${selectedPlan.name} subscription successful! ✓`);
      setSmartCard('');
      setSelectedPlan(null);
      setShowPin(false);
      refreshUser();
    } catch (err) {
      const e = err.response?.data;
      toast.error(e?.error?.message || e?.message || 'Purchase failed');
      if (e?.error?.code === 'INSUFFICIENT_FUNDS') setErrors(p => ({ ...p, plan: 'Insufficient wallet balance' }));
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
            value={smartCard}
            maxLength={11}
            inputMode="numeric"
            onChange={e => { setSmartCard(e.target.value.replace(/\D/g, '')); setErrors(p => ({ ...p, smartCard: '' })); }}
          />
          <FieldError msg={errors.smartCard} />
          <small style={{ fontSize: 12, color: 'var(--gray-400)', marginTop: 4, display: 'block' }}>
            Found on your decoder or smart card (10–11 digits)
          </small>
        </div>

        {/* Plans — loaded from backend per provider */}
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
            ) : activePlans.length === 0 ? (
              <div style={{ padding: 16, background: 'var(--gray-100)', borderRadius: 10, fontSize: 14, color: 'var(--gray-500)', textAlign: 'center' }}>
                No packages available for {provider.toUpperCase()} yet
              </div>
            ) : (
              <div className="plan-grid">
                {activePlans.map(plan => (
                  <button key={plan.id} type="button"
                    className={`plan-btn ${selectedPlan?.id === plan.id ? 'selected' : ''}`}
                    onClick={() => { setSelectedPlan(plan); setErrors(p => ({ ...p, plan: '' })); }}>
                    <div className="plan-name">{plan.name}</div>
                    <div className="plan-validity">{plan.validity_days} days</div>
                    <div className="plan-price">₦{parseFloat(plan.selling_price).toLocaleString()}</div>
                  </button>
                ))}
              </div>
            )}
            <FieldError msg={errors.plan} />
          </div>
        )}

        {/* Summary */}
        {selectedPlan && smartCard && Object.keys(errors).length === 0 && (
          <div className="summary-box">
            <div className="summary-row"><span>Provider</span><span>{provider.toUpperCase()}</span></div>
            <div className="summary-row"><span>Package</span><span>{selectedPlan.name}</span></div>
            <div className="summary-row"><span>Duration</span><span>{selectedPlan.validity_days} days</span></div>
            <div className="summary-row"><span>Smart Card</span><span>{smartCard}</span></div>
            <div className="summary-row"><span>Total</span><span><strong>₦{parseFloat(selectedPlan.selling_price).toLocaleString()}</strong></span></div>
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
