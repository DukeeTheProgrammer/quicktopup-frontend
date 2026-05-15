import React, { useState, useEffect } from 'react';
import { getNetworks, getDataPlans } from '../../api/services';
import { purchaseData } from '../../api/transactions';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import PinModal from './PinModal';
import { Wifi } from 'lucide-react';
import './ServicePage.css';

const NET_COLORS = { MTN: '#f6ad55', AIRTEL: '#e53e3e', GLO: '#00b96b', '9MOBILE': '#38a169', ETISALAT: '#38a169' };

export default function DataPage() {
  const { user, refreshUser } = useAuth();
  const [networks, setNetworks] = useState([]);
  const [plans, setPlans] = useState([]);
  const [form, setForm] = useState({ phone: '', network: '', plan_id: null });
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [plansLoading, setPlansLoading] = useState(false);
  const [showPin, setShowPin] = useState(false);

  useEffect(() => {
    getNetworks().then(r => setNetworks(r.data.data || [])).catch(() => {});
  }, []);

  const selectNetwork = async (code) => {
    setForm(p => ({ ...p, network: code, plan_id: null }));
    setSelectedPlan(null);
    setPlansLoading(true);
    try {
      const r = await getDataPlans(code);
      setPlans(r.data.data || []);
    } catch {} finally { setPlansLoading(false); }
  };

  const handleBuy = () => {
    if (!form.phone || !form.network || !form.plan_id) { toast.error('Please fill all fields'); return; }
    setShowPin(true);
  };

  const confirmPurchase = async (pin) => {
    setLoading(true);
    try {
      await purchaseData({ phone: form.phone, network: form.network, plan_id: form.plan_id, pin });
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
      <div className="page-subtitle">Get internet data for any network</div>

      <div className="service-form-card">
        <div className="form-group">
          <label className="form-label">Select Network</label>
          <div className="network-grid">
            {networks.map(net => (
              <button key={net.id} type="button"
                className={`network-btn ${form.network === net.code ? 'selected' : ''}`}
                onClick={() => selectNetwork(net.code)}>
                <div className="net-icon" style={{ background: NET_COLORS[net.code] || '#ccc', color: 'white' }}>
                  {net.code?.slice(0, 3)}
                </div>
                {net.name?.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Phone Number</label>
          <input className="form-input" type="tel" placeholder="+2348012345678"
            value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
        </div>

        {form.network && (
          <div className="form-group">
            <label className="form-label">Select Data Plan</label>
            {plansLoading ? (
              <div style={{ textAlign: 'center', padding: 20 }}>
                <div className="spinner spinner-dark" style={{ margin: '0 auto' }} />
              </div>
            ) : (
              <div className="plan-grid">
                {plans.filter(p => p.is_active).map(plan => (
                  <button key={plan.id} type="button"
                    className={`plan-btn ${form.plan_id === plan.id ? 'selected' : ''}`}
                    onClick={() => { setForm(p => ({ ...p, plan_id: plan.id })); setSelectedPlan(plan); }}>
                    <div className="plan-name">{plan.name}</div>
                    <div className="plan-size">{plan.data_size}</div>
                    <div className="plan-price">₦{parseFloat(plan.selling_price).toLocaleString()}</div>
                    <div className="plan-validity">{plan.validity_days} days</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {selectedPlan && form.phone && (
          <div className="summary-box">
            <div className="summary-row"><span>Plan</span><span>{selectedPlan.name}</span></div>
            <div className="summary-row"><span>Data</span><span>{selectedPlan.data_size} / {selectedPlan.validity_days} days</span></div>
            <div className="summary-row"><span>Phone</span><span>{form.phone}</span></div>
            <div className="summary-row"><span>Total</span><span>₦{parseFloat(selectedPlan.selling_price).toLocaleString()}</span></div>
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
