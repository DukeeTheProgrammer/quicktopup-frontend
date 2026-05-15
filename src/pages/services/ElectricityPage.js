import React, { useState, useEffect } from 'react';
import { getElectricityBillers } from '../../api/services';
import { initiatePayment } from '../../api/transactions';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { Zap, ExternalLink } from 'lucide-react';
import './ServicePage.css';

const PRESETS = [1000, 2000, 5000, 10000, 20000, 50000];
const METER_TYPES = [{ value: 'prepaid', label: 'Prepaid' }, { value: 'postpaid', label: 'Postpaid' }];

export default function ElectricityPage() {
  const { user } = useAuth();
  const [billers, setBillers] = useState([]);
  const [form, setForm] = useState({ biller: '', meter_number: '', meter_type: 'prepaid', amount: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getElectricityBillers().then(r => setBillers(r.data.data || [])).catch(() => {});
  }, []);

  const handleBuy = async () => {
    if (!form.biller || !form.meter_number || !form.amount) { toast.error('Fill all fields'); return; }
    setLoading(true);
    try {
      const res = await initiatePayment({
        amount: parseFloat(form.amount),
        currency: 'NGN',
        service_type: 'electricity',
        phone: user?.phone,
        redirect_url: window.location.origin + '/transactions'
      });
      const link = res.data.data?.payment_link;
      if (link) { window.open(link, '_blank'); toast.success('Redirecting to payment...'); }
      else toast.success('Electricity payment initiated!');
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to initiate');
    } finally { setLoading(false); }
  };

  return (
    <div className="service-page">
      <div className="page-title">Pay Electricity Bill</div>
      <div className="page-subtitle">Pay for electricity units instantly</div>

      <div className="service-form-card">
        <div className="form-group">
          <label className="form-label">Select Disco (Electricity Company)</label>
          <select className="form-input"
            value={form.biller} onChange={e => setForm(p => ({ ...p, biller: e.target.value }))}>
            <option value="">-- Select distributor --</option>
            {billers.filter(b => b.is_active).map(b => (
              <option key={b.id} value={b.code}>{b.name}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Meter Type</label>
          <div style={{ display: 'flex', gap: 10 }}>
            {METER_TYPES.map(mt => (
              <button key={mt.value} type="button"
                className={`preset-btn ${form.meter_type === mt.value ? 'selected' : ''}`}
                style={{ flex: 1 }}
                onClick={() => setForm(p => ({ ...p, meter_type: mt.value }))}>
                {mt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Meter Number</label>
          <input className="form-input" placeholder="Enter meter number"
            value={form.meter_number} onChange={e => setForm(p => ({ ...p, meter_number: e.target.value }))} />
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

        {form.biller && form.meter_number && form.amount && (
          <div className="summary-box">
            <div className="summary-row"><span>Distributor</span><span>{form.biller}</span></div>
            <div className="summary-row"><span>Meter</span><span>{form.meter_number} ({form.meter_type})</span></div>
            <div className="summary-row"><span>Amount</span><span>₦{parseFloat(form.amount || 0).toLocaleString()}</span></div>
          </div>
        )}

        <button className="btn btn-primary btn-full btn-lg" onClick={handleBuy} disabled={loading}>
          {loading ? <span className="spinner" /> : <><Zap size={16} /> Pay Now <ExternalLink size={14} /></>}
        </button>
      </div>
    </div>
  );
}
