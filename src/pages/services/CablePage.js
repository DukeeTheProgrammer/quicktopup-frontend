import React, { useState, useEffect } from 'react';
import { getCablePlans } from '../../api/services';
import { purchaseCable } from '../../api/transactions';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { Tv } from 'lucide-react';
import PinModal from './PinModal';
import './ServicePage.css';

// Provider codes must match what the API returns (lowercase)
const PROVIDERS = [
  { code: 'dstv', label: 'DSTV', color: '#003087' },
  { code: 'gotv', label: 'GOtv', color: '#e30613' },
  { code: 'startimes', label: 'Startimes', color: '#0069b4' },
  { code: 'showmax', label: 'Showmax', color: '#6c3483' },
];

export default function CablePage() {
  const { user, refreshUser } = useAuth();
  const [allPlans, setAllPlans] = useState([]);
  const [provider, setProvider] = useState('');
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [smartCard, setSmartCard] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPin, setShowPin] = useState(false);

  // Load all plans once; filter client-side by provider
  useEffect(() => {
    getCablePlans()
      .then(r => {
        const raw = r.data?.data;
        setAllPlans(raw?.results || (Array.isArray(raw) ? raw : []));
      })
      .catch(() => {});
  }, []);

  // Also fetch when provider changes to apply server-side filter
  const handleProviderSelect = async (code) => {
    setProvider(code);
    setSelectedPlan(null);
    try {
      const r = await getCablePlans(code);
      const raw = r.data?.data;
      setAllPlans(raw?.results || (Array.isArray(raw) ? raw : []));
    } catch {}
  };

  // Filter plans: normalise provider to lowercase for comparison
  const filteredPlans = allPlans.filter(
    p => p.is_active && (provider ? p.provider?.toLowerCase() === provider : true)
  );

  const handleBuy = () => {
    if (!provider || !selectedPlan || !smartCard.trim()) {
      toast.error('Please fill all fields');
      return;
    }
    setShowPin(true);
  };

  const confirmPurchase = async (pin) => {
    setLoading(true);
    try {
      // API confirmed: field is "smart_card" (not "smartcard_number")
      await purchaseCable({
        smart_card: smartCard.trim(),
        provider: provider,
        plan_id: selectedPlan.id,
        phone: user?.phone,
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
    } finally {
      setLoading(false);
    }
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
        </div>

        {/* Smart card */}
        <div className="form-group">
          <label className="form-label">Smart Card / Decoder Number</label>
          <input
            className="form-input"
            placeholder="Enter your smart card / decoder number"
            value={smartCard}
            onChange={e => setSmartCard(e.target.value)}
          />
        </div>

        {/* Plans */}
        {provider && (
          <div className="form-group">
            <label className="form-label">Select Package</label>
            {filteredPlans.length === 0 ? (
              <p style={{ color: 'var(--gray-500)', fontSize: 14, padding: '12px 0' }}>
                No plans available for {provider.toUpperCase()} yet
              </p>
            ) : (
              <div className="plan-grid">
                {filteredPlans.map(plan => (
                  <button key={plan.id} type="button"
                    className={`plan-btn ${selectedPlan?.id === plan.id ? 'selected' : ''}`}
                    onClick={() => setSelectedPlan(plan)}>
                    <div className="plan-name">{plan.name}</div>
                    <div className="plan-validity">{plan.validity_days} days</div>
                    <div className="plan-price">₦{parseFloat(plan.selling_price).toLocaleString()}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Summary */}
        {selectedPlan && smartCard && (
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
          Wallet balance: ₦{parseFloat(user?.wallet_balance || 0).toLocaleString()} · Deducted instantly from wallet
        </p>
      </div>

      {showPin && <PinModal loading={loading} onConfirm={confirmPurchase} onClose={() => setShowPin(false)} />}
    </div>
  );
}
