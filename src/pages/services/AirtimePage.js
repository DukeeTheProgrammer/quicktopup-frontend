import React, { useState, useEffect, useCallback } from 'react';
import { getNetworks } from '../../api/services';
import { purchaseAirtime } from '../../api/transactions';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import PinModal from './PinModal';
import { Phone, AlertCircle, RefreshCw } from 'lucide-react';
import './ServicePage.css';

const NET_COLORS = {
  MTN: '#f6ad55', AIRTEL: '#e53e3e', GLO: '#00b96b',
  '9MOBILE': '#38a169', ETISALAT: '#38a169',
  VODAFONE: '#e53e3e', AIRTELTIGO: '#e53e3e',
};
const COUNTRIES = [
  { code: 'NG', label: '🇳🇬 Nigeria', prefix: '+234', currency: '₦', minAmount: 50,
    placeholder: '08012345678 or +2348012345678' },
  { code: 'GH', label: '🇬🇭 Ghana', prefix: '+233', currency: 'GH₵', minAmount: 1,
    placeholder: '+233241234567', phoneRegex: /^\+233[235]\d{8}$/ },
];
const NG_PRESETS = [50, 100, 200, 500, 1000, 2000];
const GH_PRESETS = [1, 2, 5, 10, 20, 50];
const GH_CODES = ['vodafone', 'airteltigo'];
const isGhanaNetwork = (code) => GH_CODES.includes((code || '').toLowerCase());

// Parse the service list from any API response shape (new or old)
function parseServiceList(r, key) {
  const d = r.data?.data;
  if (d && Array.isArray(d[key])) return d[key];
  if (d && Array.isArray(d.results)) return d.results;
  if (Array.isArray(d)) return d;
  if (Array.isArray(r.data)) return r.data;
  return [];
}

// Map all backend error codes to user-friendly messages
function getErrorMsg(err) {
  const e = err.response?.data;
  const code = e?.error?.code;
  const msg = e?.error?.message || e?.message;
  const MAP = {
    INSUFFICIENT_FUNDS: '❌ Your wallet balance is too low. Please fund your wallet first.',
    INVALID_PIN: '🔐 Wrong transaction PIN. Please try again.',
    WALLET_LOCKED: '🔒 Your wallet is currently locked. Contact support to unlock it.',
    PIN_REQUIRED: '🔑 You need to set a transaction PIN first. Go to Profile → Security.',
    DUPLICATE_REQUEST: '⚠️ This looks like a duplicate transaction. Please wait before retrying.',
    TRANSACTION_FAILED: '❌ Transaction was rejected by the provider. Please try again.',
    PAYMENT_INIT_FAILED: '❌ Could not initiate payment. Please try a different method.',
    FETCH_FAILED: '⚠️ Service data could not be loaded. Please refresh and try again.',
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

export default function AirtimePage() {
  const { user, refreshUser } = useAuth();
  const [networks, setNetworks] = useState([]);
  const [country, setCountry] = useState('NG');
  const [form, setForm] = useState({ phone: '', network: '', amount: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [networksLoading, setNetworksLoading] = useState(true);
  const [networksError, setNetworksError] = useState(null);
  const [showPin, setShowPin] = useState(false);

  const selectedCountry = COUNTRIES.find(c => c.code === country);
  const presets = country === 'GH' ? GH_PRESETS : NG_PRESETS;

  const loadNetworks = useCallback(() => {
    setNetworksLoading(true);
    setNetworksError(null);
    getNetworks()
      .then(r => {
        const list = parseServiceList(r, 'networks');
        if (list.length === 0 && r.data?.error?.code === 'FETCH_FAILED') {
          setNetworksError('Could not load networks from provider. Please retry.');
        } else {
          setNetworks(list);
        }
      })
      .catch(() => setNetworksError('Could not load networks. Check your connection and retry.'))
      .finally(() => setNetworksLoading(false));
  }, []);

  useEffect(() => { loadNetworks(); }, [loadNetworks]);

  const filteredNetworks = networks.filter(n => {
    const code = (n.code || '').toLowerCase();
    if (country === 'GH') return code === 'mtn' || isGhanaNetwork(code);
    return !isGhanaNetwork(code) && code !== 'hubtel';
  });

  const displayCode = (code) => (code || '').toUpperCase();

  const handlePhoneChange = (e) => {
    const val = e.target.value;
    setForm(p => ({ ...p, phone: val, network: '' }));
    setErrors(p => ({ ...p, phone: '' }));
    if (val.startsWith('+233') || val.startsWith('00233')) setCountry('GH');
    else if (val.startsWith('+234') || val.startsWith('00234')) setCountry('NG');
  };

  const validate = () => {
    const e = {};
    if (!form.network) e.network = 'Please select a network';
    if (!form.phone.trim()) {
      e.phone = 'Phone number is required';
    } else if (country === 'GH' && selectedCountry.phoneRegex && !selectedCountry.phoneRegex.test(form.phone.trim())) {
      // Ghana regex still validated; Nigeria format accepted by backend as-is
      e.phone = `Enter a valid Ghana number (e.g. ${selectedCountry.placeholder})`;
    } else if (form.phone.trim().length < 7) {
      e.phone = 'Phone number is too short';
    }
    const amt = parseFloat(form.amount);
    if (!form.amount || isNaN(amt)) {
      e.amount = 'Amount is required';
    } else if (amt < selectedCountry.minAmount) {
      e.amount = `Minimum amount is ${selectedCountry.currency}${selectedCountry.minAmount}`;
    } else if (amt > parseFloat(user?.wallet_balance || 0)) {
      e.amount = `Insufficient wallet balance (you have ${selectedCountry.currency}${parseFloat(user?.wallet_balance || 0).toLocaleString()})`;
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
        network: form.network.toLowerCase(),
        amount: parseFloat(form.amount),
        pin,
      });
      toast.success(`${selectedCountry.currency}${parseFloat(form.amount).toLocaleString()} airtime sent to ${form.phone} ✓`);
      setForm(p => ({ ...p, amount: '' }));
      setShowPin(false);
      refreshUser();
    } catch (err) {
      const msg = getErrorMsg(err);
      toast.error(msg);
      const code = err.response?.data?.error?.code;
      if (code === 'INSUFFICIENT_FUNDS') setErrors(p => ({ ...p, amount: 'Insufficient wallet balance' }));
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
          {networksLoading ? (
            <div style={{ textAlign: 'center', padding: 16 }}>
              <div className="spinner spinner-dark" style={{ margin: '0 auto' }} />
              <p style={{ fontSize: 12, color: 'var(--gray-400)', marginTop: 8 }}>Loading networks…</p>
            </div>
          ) : networksError ? (
            <div className="fetch-error-box">
              <AlertCircle size={16} />
              <span>{networksError}</span>
              <button className="retry-btn" onClick={loadNetworks}><RefreshCw size={12} /> Retry</button>
            </div>
          ) : (
            <div className="network-grid">
              {filteredNetworks.map(net => (
                <button key={net.id || net.code} type="button"
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
          )}
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
            Nigerian numbers: local (08012...) or international (+23480...) format accepted
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

        <button className="btn btn-primary btn-full btn-lg" onClick={handleBuy} disabled={loading || networksLoading}>
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
