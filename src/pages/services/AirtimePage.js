import React, { useState, useEffect } from 'react';
import { getNetworks } from '../../api/services';
import { purchaseAirtime } from '../../api/transactions';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import PinModal from './PinModal';
import { Phone, AlertCircle } from 'lucide-react';
import './ServicePage.css';

// Colours keyed on UPPERCASE code
const NET_COLORS = {
  MTN: '#f6ad55', AIRTEL: '#e53e3e', GLO: '#00b96b',
  '9MOBILE': '#38a169', ETISALAT: '#38a169',
  VODAFONE: '#e53e3e', AIRTELTIGO: '#e53e3e',
};

const COUNTRIES = [
  { code: 'NG', label: '🇳🇬 Nigeria', prefix: '+234', currency: '₦', minAmount: 50,
    placeholder: '+2348012345678', phoneRegex: /^\+234[7-9][01]\d{8}$/ },
  { code: 'GH', label: '🇬🇭 Ghana', prefix: '+233', currency: 'GH₵', minAmount: 1,
    placeholder: '+233241234567', phoneRegex: /^\+233[235]\d{8}$/ },
];
const NG_PRESETS = [50, 100, 200, 500, 1000, 2000];
const GH_PRESETS = [1, 2, 5, 10, 20, 50];

// Ghana network codes from Hubtel
const GH_CODES = ['vodafone', 'airteltigo'];
const isGhanaNetwork = (code) => {
  const c = (code || '').toLowerCase();
  return GH_CODES.includes(c);
};

function FieldError({ msg }) {
  if (!msg) return null;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#e53e3e', fontSize: 12, marginTop: 4 }}>
      <AlertCircle size={12} /> {msg}
    </div>
  );
}

export default function AirtimePage() {
  const { user, refreshUser } = useAuth();
  const [networks, setNetworks] = useState([]);
  const [country, setCountry] = useState('NG');
  const [form, setForm] = useState({ phone: '', network: '', amount: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPin, setShowPin] = useState(false);

  const selectedCountry = COUNTRIES.find(c => c.code === country);
  const presets = country === 'GH' ? GH_PRESETS : NG_PRESETS;

  useEffect(() => {
    getNetworks()
      .then(r => {
        const raw = r.data?.data;
        setNetworks(raw?.results || (Array.isArray(raw) ? raw : []));
      })
      .catch(() => {});
  }, []);

  const filteredNetworks = networks.filter(n => {
    const code = (n.code || '').toLowerCase();
    if (country === 'GH') return code === 'mtn' || isGhanaNetwork(code);
    // Nigeria: exclude Ghana-only networks
    return !isGhanaNetwork(code) && code !== 'hubtel';
  });

  const displayCode = (code) => (code || '').toUpperCase();

  // Auto-detect country from phone prefix
  const handlePhoneChange = (e) => {
    const val = e.target.value;
    setForm(p => ({ ...p, phone: val, network: '' }));
    setErrors(p => ({ ...p, phone: '' }));
    if (val.startsWith('+233') || val.startsWith('00233')) setCountry('GH');
    else if (val.startsWith('+234') || val.startsWith('00234')) setCountry('NG');
  };

  // Validate all fields client-side before opening PIN
  const validate = () => {
    const e = {};
    if (!form.network) e.network = 'Please select a network';
    if (!form.phone.trim()) {
      e.phone = 'Phone number is required';
    } else if (!selectedCountry.phoneRegex.test(form.phone.trim())) {
      e.phone = `Enter a valid ${selectedCountry.label} number (e.g. ${selectedCountry.placeholder})`;
    }
    const amt = parseFloat(form.amount);
    if (!form.amount || isNaN(amt)) {
      e.amount = 'Amount is required';
    } else if (amt < selectedCountry.minAmount) {
      e.amount = `Minimum amount is ${selectedCountry.currency}${selectedCountry.minAmount}`;
    } else if (amt > parseFloat(user?.wallet_balance || 0)) {
      e.amount = 'Insufficient wallet balance';
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
      await purchaseAirtime({
        phone: form.phone.trim(),
        network: form.network.toUpperCase(), // API expects uppercase e.g. MTN
        amount: form.amount,
        pin,
      });
      toast.success(`${selectedCountry.currency}${parseFloat(form.amount).toLocaleString()} airtime sent to ${form.phone} ✓`);
      setForm(p => ({ ...p, amount: '' }));
      setShowPin(false);
      refreshUser();
    } catch (err) {
      const e = err.response?.data;
      const msg = e?.error?.message || e?.message || 'Purchase failed';
      toast.error(msg);
      // Surface backend validation errors inline
      if (e?.error?.code === 'INSUFFICIENT_FUNDS') setErrors(p => ({ ...p, amount: 'Insufficient wallet balance' }));
      if (e?.error?.code === 'INVALID_PIN') toast.error('Wrong PIN — try again');
    } finally { setLoading(false); }
  };

  return (
    <div className="service-page">
      <div className="page-title">Buy Airtime</div>
      <div className="page-subtitle">Recharge any Nigerian or Ghanaian number instantly from your wallet</div>

      <div className="service-form-card">

        {/* Country */}
        <div className="form-group">
          <label className="form-label">Country</label>
          <div style={{ display: 'flex', gap: 10 }}>
            {COUNTRIES.map(c => (
              <button key={c.code} type="button"
                className={`cable-provider-btn ${country === c.code ? 'selected' : ''}`}
                onClick={() => { setCountry(c.code); setForm({ phone: '', network: '', amount: '' }); setErrors({}); }}>
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
                onClick={() => { setForm(p => ({ ...p, network: net.code })); setErrors(p => ({ ...p, network: '' })); }}>
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
          <small style={{ color: 'var(--gray-400)', fontSize: 12, marginTop: 4, display: 'block' }}>
            Must start with {selectedCountry.prefix}
          </small>
        </div>

        {/* Amount */}
        <div className="form-group">
          <label className="form-label">Amount ({selectedCountry.currency})</label>
          <div className="amount-presets">
            {presets.map(a => (
              <button key={a} type="button"
                className={`preset-btn ${form.amount === String(a) ? 'selected' : ''}`}
                onClick={() => { setForm(p => ({ ...p, amount: String(a) })); setErrors(p => ({ ...p, amount: '' })); }}>
                {selectedCountry.currency}{a.toLocaleString()}
              </button>
            ))}
          </div>
          <input className={`form-input ${errors.amount ? 'input-error' : ''}`}
            type="number" placeholder={`Min ${selectedCountry.currency}${selectedCountry.minAmount}`}
            value={form.amount}
            onChange={e => { setForm(p => ({ ...p, amount: e.target.value })); setErrors(p => ({ ...p, amount: '' })); }} />
          <FieldError msg={errors.amount} />
        </div>

        {/* Summary */}
        {form.phone && form.network && form.amount && Object.keys(errors).length === 0 && (
          <div className="summary-box">
            <div className="summary-row"><span>Country</span><span>{selectedCountry.label}</span></div>
            <div className="summary-row"><span>Network</span><span>{displayCode(form.network)}</span></div>
            <div className="summary-row"><span>Phone</span><span>{form.phone}</span></div>
            <div className="summary-row"><span>Total</span>
              <span><strong>{selectedCountry.currency}{parseFloat(form.amount || 0).toLocaleString()}</strong></span>
            </div>
          </div>
        )}

        <button className="btn btn-primary btn-full btn-lg" onClick={handleBuy} disabled={loading}>
          {loading ? <span className="spinner" /> : <><Phone size={16} /> Buy Airtime</>}
        </button>

        <p style={{ fontSize: 12, color: 'var(--gray-500)', textAlign: 'center', marginTop: 12 }}>
          Wallet balance: ₦{parseFloat(user?.wallet_balance || 0).toLocaleString()}
        </p>
      </div>

      {showPin && <PinModal loading={loading} onConfirm={confirmPurchase} onClose={() => setShowPin(false)} />}
    </div>
  );
}
