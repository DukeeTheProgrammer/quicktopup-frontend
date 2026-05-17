import React, { useState, useEffect } from 'react';
import { getNetworks } from '../../api/services';
import { purchaseAirtime } from '../../api/transactions';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import PinModal from './PinModal';
import { Phone } from 'lucide-react';
import './ServicePage.css';

const NET_COLORS = {
  MTN: '#f6ad55', AIRTEL: '#e53e3e', GLO: '#00b96b',
  '9MOBILE': '#38a169', ETISALAT: '#38a169',
  VODAFONE: '#e53e3e', AIRTELTIGO: '#e53e3e',
};

const NG_PRESETS = [50, 100, 200, 500, 1000, 2000, 5000];
const GH_PRESETS = [1, 2, 5, 10, 20, 50];

const COUNTRIES = [
  { code: 'NG', label: '🇳🇬 Nigeria', prefix: '+234', currency: '₦', placeholder: '+2348012345678' },
  { code: 'GH', label: '🇬🇭 Ghana', prefix: '+233', currency: 'GH₵', placeholder: '+233241234567' },
];

export default function AirtimePage() {
  const { user, refreshUser } = useAuth();
  const [networks, setNetworks] = useState([]);
  const [country, setCountry] = useState('NG');
  const [form, setForm] = useState({ phone: '', network: '', amount: '' });
  const [loading, setLoading] = useState(false);
  const [showPin, setShowPin] = useState(false);

  const selectedCountry = COUNTRIES.find(c => c.code === country);
  const presets = country === 'GH' ? GH_PRESETS : NG_PRESETS;

  useEffect(() => {
    getNetworks()
      .then(r => { const raw = r.data?.data; setNetworks(raw?.results || (Array.isArray(raw) ? raw : [])); })
      .catch(() => {});
  }, []);

  // Auto-detect country from phone prefix
  const handlePhoneChange = (e) => {
    const val = e.target.value;
    setForm(p => ({ ...p, phone: val, network: '' }));
    if (val.startsWith('+233') || val.startsWith('233')) setCountry('GH');
    else if (val.startsWith('+234') || val.startsWith('234')) setCountry('NG');
  };

  const filteredNetworks = networks.filter(n => {
    if (country === 'GH') return ['MTN', 'VODAFONE', 'AIRTELTIGO'].includes(n.code);
    return !['VODAFONE', 'AIRTELTIGO', 'HUBTEL'].includes(n.code);
  });

  const handleBuy = () => {
    if (!form.phone || !form.network || !form.amount) {
      toast.error('Please fill all fields');
      return;
    }
    setShowPin(true);
  };

  const confirmPurchase = async (pin) => {
    setLoading(true);
    try {
      await purchaseAirtime({
        phone: form.phone,
        network: form.network,
        amount: form.amount,
        pin,
        country: country === 'GH' ? 'ghana' : 'nigeria',
      });
      toast.success(`${selectedCountry.currency}${form.amount} airtime sent to ${form.phone} ✓`);
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
      <div className="page-subtitle">Recharge any Nigerian or Ghanaian number instantly</div>

      <div className="service-form-card">

        {/* Country selector */}
        <div className="form-group">
          <label className="form-label">Country</label>
          <div style={{ display: 'flex', gap: 10 }}>
            {COUNTRIES.map(c => (
              <button key={c.code} type="button"
                className={`cable-provider-btn ${country === c.code ? 'selected' : ''}`}
                onClick={() => { setCountry(c.code); setForm(p => ({ ...p, network: '', phone: '' })); }}>
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
                onClick={() => setForm(p => ({ ...p, network: net.code }))}>
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
            value={form.phone}
            onChange={handlePhoneChange} />
          <small style={{ color: 'var(--gray-400)', fontSize: 12, marginTop: 4, display: 'block' }}>
            Starts with {selectedCountry.prefix}
          </small>
        </div>

        {/* Amount */}
        <div className="form-group">
          <label className="form-label">Amount ({selectedCountry.currency})</label>
          <div className="amount-presets">
            {presets.map(a => (
              <button key={a} type="button"
                className={`preset-btn ${form.amount === String(a) ? 'selected' : ''}`}
                onClick={() => setForm(p => ({ ...p, amount: String(a) }))}>
                {selectedCountry.currency}{a.toLocaleString()}
              </button>
            ))}
          </div>
          <input className="form-input" type="number" placeholder="Or enter custom amount"
            value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} />
        </div>

        {/* Summary */}
        {form.phone && form.network && form.amount && (
          <div className="summary-box">
            <div className="summary-row"><span>Country</span><span>{selectedCountry.label}</span></div>
            <div className="summary-row"><span>Network</span><span>{form.network}</span></div>
            <div className="summary-row"><span>Phone</span><span>{form.phone}</span></div>
            <div className="summary-row"><span>Total</span>
              <span><strong>{selectedCountry.currency}{parseFloat(form.amount || 0).toLocaleString()}</strong></span>
            </div>
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
