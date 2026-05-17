import React, { useState, useEffect } from 'react';
import { getCablePlans } from '../../api/services';
import { initiatePayment } from '../../api/transactions';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { Tv, ExternalLink } from 'lucide-react';
import './ServicePage.css';

const PROVIDERS = ['DSTV', 'GOTV', 'STARTIMES', 'SHOWMAX'];
const PROV_COLORS = { DSTV: '#003087', GOTV: '#e30613', STARTIMES: '#0069b4', SHOWMAX: '#6c3483' };

export default function CablePage() {
  const { user } = useAuth();
  const [plans, setPlans] = useState([]);
  const [provider, setProvider] = useState('');
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [smartcard, setSmartcard] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getCablePlans().then(r => { const raw = r.data?.data; setPlans(raw?.results || (Array.isArray(raw) ? raw : [])); }).catch(() => {});
  }, []);

  const filteredPlans = plans.filter(p => p.provider === provider && p.is_active);

  const handleBuy = async () => {
    if (!provider || !selectedPlan || !smartcard) { toast.error('Fill all fields'); return; }
    setLoading(true);
    try {
      const res = await initiatePayment({
        amount: parseFloat(selectedPlan.selling_price),
        currency: 'NGN',
        service_type: 'cable',
        phone: user?.phone,
        plan_id: selectedPlan.id,
        redirect_url: window.location.origin + '/transactions'
      });
      const link = res.data.data?.payment_link;
      if (link) { window.open(link, '_blank'); toast.success('Redirecting to payment...'); }
      else toast.success('Cable subscription initiated!');
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to initiate');
    } finally { setLoading(false); }
  };

  return (
    <div className="service-page">
      <div className="page-title">Cable TV Subscription</div>
      <div className="page-subtitle">Subscribe to DSTV, GOtv, Startimes & more</div>

      <div className="service-form-card">
        <div className="form-group">
          <label className="form-label">Select Provider</label>
          <div className="cable-provider-grid">
            {PROVIDERS.map(p => (
              <button key={p} type="button"
                className={`cable-provider-btn ${provider === p ? 'selected' : ''}`}
                style={provider === p ? { borderColor: PROV_COLORS[p], background: PROV_COLORS[p] + '15', color: PROV_COLORS[p] } : {}}
                onClick={() => { setProvider(p); setSelectedPlan(null); }}>
                {p}
              </button>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Smart Card / Decoder Number</label>
          <input className="form-input" placeholder="Enter smartcard number"
            value={smartcard} onChange={e => setSmartcard(e.target.value)} />
        </div>

        {provider && (
          <div className="form-group">
            <label className="form-label">Select Package</label>
            {filteredPlans.length === 0 ? (
              <p style={{ color: 'var(--gray-500)', fontSize: 14 }}>No plans available for {provider}</p>
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

        {selectedPlan && smartcard && (
          <div className="summary-box">
            <div className="summary-row"><span>Provider</span><span>{provider}</span></div>
            <div className="summary-row"><span>Package</span><span>{selectedPlan.name}</span></div>
            <div className="summary-row"><span>Smartcard</span><span>{smartcard}</span></div>
            <div className="summary-row"><span>Total</span><span>₦{parseFloat(selectedPlan.selling_price).toLocaleString()}</span></div>
          </div>
        )}

        <button className="btn btn-primary btn-full btn-lg" onClick={handleBuy} disabled={loading}>
          {loading ? <span className="spinner" /> : <><Tv size={16} /> Subscribe <ExternalLink size={14} /></>}
        </button>
      </div>
    </div>
  );
}
