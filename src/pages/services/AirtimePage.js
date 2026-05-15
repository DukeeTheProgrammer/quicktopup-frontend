import React, { useState, useEffect } from 'react';
import { getNetworks } from '../../api/services';
import { purchaseAirtime } from '../../api/transactions';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import PinModal from './PinModal';
import { Phone } from 'lucide-react';
import './ServicePage.css';

const NET_COLORS = { MTN: '#f6ad55', AIRTEL: '#e53e3e', GLO: '#00b96b', '9MOBILE': '#38a169', ETISALAT: '#38a169' };
const PRESETS = [100, 200, 500, 1000, 2000, 5000];

export default function AirtimePage() {
  const { user, refreshUser } = useAuth();
  const [networks, setNetworks] = useState([]);
  const [form, setForm] = useState({ phone: '', network: '', amount: '' });
  const [loading, setLoading] = useState(false);
  const [showPin, setShowPin] = useState(false);

  useEffect(() => {
    getNetworks().then(r => setNetworks(r.data.data || [])).catch(() => {});
  }, []);

  const handleBuy = () => {
    if (!form.phone || !form.network || !form.amount) { toast.error('Please fill all fields'); return; }
    setShowPin(true);
  };

  const confirmPurchase = async (pin) => {
    setLoading(true);
    try {
      await purchaseAirtime({ phone: form.phone, network: form.network, amount: form.amount, pin });
      toast.success(`₦${form.amount} airtime sent to ${form.phone} ✓`);
      setForm(p => ({ ...p, amount: '' }));
      setShowPin(false);
      refreshUser();
    } catch (err) {
      const e = err.response?.data;
      toast.error(e?.error?.message || e?.message || 'Purchase failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="service-page">
      <div className="page-title">Buy Airtime</div>
      <div className="page-subtitle">Recharge any Nigerian network instantly</div>

      <div className="service-form-card">
        <div className="form-group">
          <label className="form-label">Select Network</label>
          <div className="network-grid">
            {networks.map(net => (
              <button key={net.id} type="button"
                className={`network-btn ${form.network === net.code ? 'selected' : ''}`}
                onClick={() => setForm(p => ({ ...p, network: net.code }))}>
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

        <div className="form-group">
          <label className="form-label">Amount</label>
          <div className="amount-presets">
            {PRESETS.map(a => (
              <button key={a} type="button"
                className={`preset-btn ${form.amount == a ? 'selected' : ''}`}
                onClick={() => setForm(p => ({ ...p, amount: String(a) }))}>
                ₦{a.toLocaleString()}
              </button>
            ))}
          </div>
          <input className="form-input" type="number" placeholder="Or enter custom amount"
            value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} />
        </div>

        {form.phone && form.network && form.amount && (
          <div className="summary-box">
            <div className="summary-row"><span>Network</span><span>{form.network}</span></div>
            <div className="summary-row"><span>Phone</span><span>{form.phone}</span></div>
            <div className="summary-row"><span>Total</span><span>₦{parseFloat(form.amount || 0).toLocaleString()}</span></div>
          </div>
        )}

        <button className="btn btn-primary btn-full btn-lg" onClick={handleBuy}>
          <Phone size={16} /> Buy Airtime
        </button>

        <p style={{ fontSize: 12, color: 'var(--gray-500)', textAlign: 'center', marginTop: 12 }}>
          Wallet balance: ₦{parseFloat(user?.wallet_balance || 0).toLocaleString()}
        </p>
      </div>

      {showPin && <PinModal loading={loading} onConfirm={confirmPurchase} onClose={() => setShowPin(false)} />}
    </div>
  );
}
