import React, { useState, useEffect } from 'react';
import { getNetworks, getDataPlans } from '../../api/services';
import { purchaseData } from '../../api/transactions';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import PinModal from './PinModal';
import { Wifi, AlertCircle } from 'lucide-react';
import './ServicePage.css';

const NET_COLORS = {
  MTN: '#f6ad55', AIRTEL: '#e53e3e', GLO: '#00b96b',
  '9MOBILE': '#38a169', ETISALAT: '#38a169',
  VODAFONE: '#e53e3e', AIRTELTIGO: '#e53e3e',
};
const COUNTRIES = [
  { code: 'NG', label: '🇳🇬 Nigeria', currency: '₦',
    placeholder: '+2348012345678', phoneRegex: /^\+234[7-9][01]\d{8}$/ },
  { code: 'GH', label: '🇬🇭 Ghana', currency: 'GH₵',
    placeholder: '+233241234567', phoneRegex: /^\+233[235]\d{8}$/ },
];
const GH_CODES = ['vodafone', 'airteltigo'];
const isGhanaNetwork = (code) => GH_CODES.includes((code || '').toLowerCase());

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
  const [plansLoading, setPlansLoading] = useState(false);
  const [showPin, setShowPin] = useState(false);

  const selectedCountry = COUNTRIES.find(c => c.code === country);

  useEffect(() => {
    getNetworks()
      .then(r => { const raw = r.data?.data; setNetworks(raw?.results || (Array.isArray(raw) ? raw : [])); })
      .catch(() => {});
  }, []);

  const filteredNetworks = networks.filter(n => {
    const code = (n.code || '').toLowerCase();
    if (country === 'GH') return code === 'mtn' || isGhanaNetwork(code);
    return !isGhanaNetwork(code) && code !== 'hubtel';
  });

  const displayCode = (code) => (code || '').toUpperCase();

  const handlePhoneChange = (e) => {
    const val = e.target.value;
    setForm(p => ({ ...p, phone: val }));
    setErrors(p => ({ ...p, phone: '' }));
    if (val.startsWith('+233')) setCountry('GH');
    else if (val.startsWith('+234')) setCountry('NG');
  };

  const selectNetwork = async (code) => {
    setForm(p => ({ ...p, network: code, plan_id: null }));
    setSelectedPlan(null);
    setErrors(p => ({ ...p, network: '', plan: '' }));
    setPlansLoading(true);
    try {
      // API docs: filter param is lowercase network code e.g. "mtn"
      const r = await getDataPlans(code.toLowerCase());
      const raw = r.data?.data;
      setPlans(raw?.results || (Array.isArray(raw) ? raw : []));
    } catch { setPlans([]); }
    finally { setPlansLoading(false); }
  };

  const validate = () => {
    const e = {};
    if (!form.network) e.network = 'Please select a network';
    if (!form.phone.trim()) {
      e.phone = 'Phone number is required';
    } else if (!selectedCountry.phoneRegex.test(form.phone.trim())) {
      e.phone = `Enter a valid ${selectedCountry.label} number (e.g. ${selectedCountry.placeholder})`;
    }
    if (!form.plan_id) e.plan = 'Please select a data plan';
    if (selectedPlan) {
      const price = parseFloat(selectedPlan.selling_price);
      if (price > parseFloat(user?.wallet_balance || 0)) {
        e.plan = `Insufficient wallet balance (need ${selectedCountry.currency}${price.toLocaleString()})`;
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
        network: form.network.toUpperCase(),
        plan_id: form.plan_id,
        pin,
      });
      toast.success(`${selectedPlan?.name} sent to ${form.phone} ✓`);
      setForm(p => ({ ...p, plan_id: null }));
      setSelectedPlan(null);
      setShowPin(false);
      refreshUser();
    } catch (err) {
      const e = err.response?.data;
      const msg = e?.error?.message || e?.message || 'Purchase failed';
      toast.error(msg);
      if (e?.error?.code === 'INSUFFICIENT_FUNDS') setErrors(p => ({ ...p, plan: 'Insufficient wallet balance' }));
    } finally { setLoading(false); }
  };

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
          <div className="network-grid">
            {filteredNetworks.map(net => (
              <button key={net.id} type="button"
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

        {/* Plans — fetched from backend after network selection */}
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
            ) : plans.filter(p => p.is_active).length === 0 ? (
              <div style={{ padding: 16, background: 'var(--gray-100)', borderRadius: 10, fontSize: 14, color: 'var(--gray-500)', textAlign: 'center' }}>
                No plans available for {displayCode(form.network)} right now
              </div>
            ) : (
              <div className="plan-grid">
                {plans.filter(p => p.is_active).map(plan => (
                  <button key={plan.id} type="button"
                    className={`plan-btn ${form.plan_id === plan.id ? 'selected' : ''}`}
                    onClick={() => { setForm(p => ({ ...p, plan_id: plan.id })); setSelectedPlan(plan); setErrors(p => ({ ...p, plan: '' })); }}>
                    <div className="plan-name">{plan.name}</div>
                    <div className="plan-size">{plan.data_size}</div>
                    <div className="plan-price">{selectedCountry.currency}{parseFloat(plan.selling_price).toLocaleString()}</div>
                    <div className="plan-validity">{plan.validity_days} days</div>
                  </button>
                ))}
              </div>
            )}
            <FieldError msg={errors.plan} />
          </div>
        )}

        {/* Summary */}
        {selectedPlan && form.phone && Object.keys(errors).length === 0 && (
          <div className="summary-box">
            <div className="summary-row"><span>Country</span><span>{selectedCountry.label}</span></div>
            <div className="summary-row"><span>Plan</span><span>{selectedPlan.name}</span></div>
            <div className="summary-row"><span>Data</span><span>{selectedPlan.data_size} / {selectedPlan.validity_days} days</span></div>
            <div className="summary-row"><span>Phone</span><span>{form.phone}</span></div>
            <div className="summary-row"><span>Total</span>
              <span><strong>{selectedCountry.currency}{parseFloat(selectedPlan.selling_price).toLocaleString()}</strong></span>
            </div>
          </div>
        )}

        <button className="btn btn-primary btn-full btn-lg" onClick={handleBuy} disabled={loading}>
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
