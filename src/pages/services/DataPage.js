import React, { useState, useEffect } from 'react';
import { getNetworks, getDataPlans } from '../../api/services';
import { purchaseData } from '../../api/transactions';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import PinModal from './PinModal';
import { Wifi } from 'lucide-react';
import './ServicePage.css';

const NET_COLORS = {
  MTN: '#f6ad55', AIRTEL: '#e53e3e', GLO: '#00b96b',
  '9MOBILE': '#38a169', ETISALAT: '#38a169',
  VODAFONE: '#e53e3e', AIRTELTIGO: '#e53e3e',
};

const COUNTRIES = [
  { code: 'NG', label: '🇳🇬 Nigeria', currency: '₦', placeholder: '+2348012345678' },
  { code: 'GH', label: '🇬🇭 Ghana', currency: 'GH₵', placeholder: '+233241234567' },
];

export default function DataPage() {
  const { user, refreshUser } = useAuth();
  const [networks, setNetworks] = useState([]);
  const [plans, setPlans] = useState([]);
  const [country, setCountry] = useState('NG');
  const [form, setForm] = useState({ phone: '', network: '', plan_id: null });
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [plansLoading, setPlansLoading] = useState(false);
  const [showPin, setShowPin] = useState(false);

  const selectedCountry = COUNTRIES.find(c => c.code === country);

  useEffect(() => {
    getNetworks().then(r => { const raw = r.data?.data; setNetworks(raw?.results || (Array.isArray(raw) ? raw : [])); }).catch(() => {});
  }, []);

  const handlePhoneChange = (e) => {
    const val = e.target.value;
    setForm(p => ({ ...p, phone: val }));
    if (val.startsWith('+233') || val.startsWith('233')) setCountry('GH');
    else if (val.startsWith('+234') || val.startsWith('234')) setCountry('NG');
  };

  const filteredNetworks = networks.filter(n => {
    if (country === 'GH') return ['MTN', 'VODAFONE', 'AIRTELTIGO'].includes(n.code);
    return !['VODAFONE', 'AIRTELTIGO'].includes(n.code);
  });

  const selectNetwork = async (code) => {
    setForm(p => ({ ...p, network: code, plan_id: null }));
    setSelectedPlan(null);
    setPlansLoading(true);
    try {
      const r = await getDataPlans(code);
      const raw = r.data?.data; setPlans(raw?.results || (Array.isArray(raw) ? raw : []));
    } catch { setPlans([]); } finally { setPlansLoading(false); }
  };

  const handleBuy = () => {
    if (!form.phone || !form.network || !form.plan_id) { toast.error('Please fill all fields'); return; }
    setShowPin(true);
  };

  const confirmPurchase = async (pin) => {
    setLoading(true);
    try {
      await purchaseData({
        phone: form.phone,
        network: form.network,
        plan_id: form.plan_id,
        pin,
        country: country === 'GH' ? 'ghana' : 'nigeria',
      });
      toast.success(`Data bundle sent to ${form.phone} ✓`);
      setForm(p => ({ ...p, plan_id: null }));
      setSelectedPlan(null);
      setShowPin(false);
      refreshUser();
    } catch (err) {
      const e = err.response?.data;
      toast.error(e?.error?.message || e?.message || 'Purchase failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="service-page">
      <div className="page-title">Buy Data Bundle</div>
      <div className="page-subtitle">Get internet data for any Nigerian or Ghanaian network</div>

      <div className="service-form-card">

        {/* Country */}
        <div className="form-group">
          <label className="form-label">Country</label>
          <div style={{ display: 'flex', gap: 10 }}>
            {COUNTRIES.map(c => (
              <button key={c.code} type="button"
                className={`cable-provider-btn ${country === c.code ? 'selected' : ''}`}
                onClick={() => { setCountry(c.code); setForm({ phone: '', network: '', plan_id: null }); setPlans([]); setSelectedPlan(null); }}>
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Network */}
        <div className="form-group">
          <label className="form-label">Select Network</label>
          <div className="network-grid">
            {(filteredNetworks.length > 0 ? filteredNetworks : networks).map(net => (
              <button key={net.id} type="button"
                className={`network-btn ${form.network === net.code ? 'selected' : ''}`}
                onClick={() => selectNetwork(net.code)}>
                <div className="net-icon" style={{ background: NET_COLORS[net.code] || '#718096', color: 'white' }}>
                  {net.code?.slice(0, 3)}
                </div>
                {net.name?.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Phone */}
        <div className="form-group">
          <label className="form-label">Phone Number</label>
          <input className="form-input" type="tel"
            placeholder={selectedCountry.placeholder}
            value={form.phone} onChange={handlePhoneChange} />
        </div>

        {/* Plans */}
        {form.network && (
          <div className="form-group">
            <label className="form-label">Select Data Plan</label>
            {plansLoading ? (
              <div style={{ textAlign: 'center', padding: 20 }}>
                <div className="spinner spinner-dark" style={{ margin: '0 auto' }} />
              </div>
            ) : plans.filter(p => p.is_active).length === 0 ? (
              <div style={{ padding: '16px', background: 'var(--gray-100)', borderRadius: 10, fontSize: 14, color: 'var(--gray-500)', textAlign: 'center' }}>
                No plans found for {form.network}. Try selecting another network.
              </div>
            ) : (
              <div className="plan-grid">
                {plans.filter(p => p.is_active).map(plan => (
                  <button key={plan.id} type="button"
                    className={`plan-btn ${form.plan_id === plan.id ? 'selected' : ''}`}
                    onClick={() => { setForm(p => ({ ...p, plan_id: plan.id })); setSelectedPlan(plan); }}>
                    <div className="plan-name">{plan.name}</div>
                    <div className="plan-size">{plan.data_size}</div>
                    <div className="plan-price">{selectedCountry.currency}{parseFloat(plan.selling_price).toLocaleString()}</div>
                    <div className="plan-validity">{plan.validity_days} days</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {selectedPlan && form.phone && (
          <div className="summary-box">
            <div className="summary-row"><span>Country</span><span>{selectedCountry.label}</span></div>
            <div className="summary-row"><span>Plan</span><span>{selectedPlan.name}</span></div>
            <div className="summary-row"><span>Data</span><span>{selectedPlan.data_size} / {selectedPlan.validity_days} days</span></div>
            <div className="summary-row"><span>Phone</span><span>{form.phone}</span></div>
            <div className="summary-row"><span>Total</span><span><strong>{selectedCountry.currency}{parseFloat(selectedPlan.selling_price).toLocaleString()}</strong></span></div>
          </div>
        )}

        <button className="btn btn-primary btn-full btn-lg" onClick={handleBuy}>
          <Wifi size={16} /> Buy Data
        </button>

        <p style={{ fontSize: 12, color: 'var(--gray-500)', textAlign: 'center', marginTop: 12 }}>
          Wallet balance: ₦{parseFloat(user?.wallet_balance || 0).toLocaleString()}
        </p>
      </div>

      {showPin && <PinModal loading={loading} onConfirm={confirmPurchase} onClose={() => setShowPin(false)} />}
    </div>
  );
}
