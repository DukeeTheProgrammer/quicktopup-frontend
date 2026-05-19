import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { updateProfile, setPin } from '../../api/auth';
import toast from 'react-hot-toast';
import { User, Shield, Phone, Mail, CheckCircle, Clock, Key, Lock } from 'lucide-react';

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [form, setForm] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    phone: user?.phone || '',
  });
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState('profile');

  // PIN state
  const [pinForm, setPinForm] = useState({ new_pin: '', pin_confirm: '' });
  const [settingPin, setSettingPin] = useState(false);
  const [showPin, setShowPin] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile({ first_name: form.first_name, last_name: form.last_name, phone: form.phone });
      await refreshUser();
      toast.success('Profile updated!');
    } catch (err) {
      const d = err.response?.data;
      toast.error(d?.error?.message || d?.message || 'Update failed');
    } finally { setSaving(false); }
  };

  const handleSetPin = async (e) => {
    e.preventDefault();
    if (pinForm.new_pin.length !== 4 || !/^\d{4}$/.test(pinForm.new_pin)) {
      toast.error('PIN must be exactly 4 digits');
      return;
    }
    if (pinForm.new_pin !== pinForm.pin_confirm) {
      toast.error('PINs do not match');
      return;
    }
    setSettingPin(true);
    try {
      await setPin({ new_pin: pinForm.new_pin, pin_confirm: pinForm.pin_confirm });
      toast.success('Transaction PIN set successfully!');
      setPinForm({ new_pin: '', pin_confirm: '' });
    } catch (err) {
      const d = err.response?.data;
      toast.error(d?.error?.message || d?.message || 'Failed to set PIN');
    } finally { setSettingPin(false); }
  };

  return (
    <div style={{ maxWidth: 560 }}>
      <div className="page-title">Profile &amp; Settings</div>
      <div className="page-subtitle">Manage your account information</div>

      {/* Profile summary card */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, background: 'var(--bg-card)', borderRadius: 16, padding: 20, marginBottom: 20, boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, fontWeight: 800, color: 'white', flexShrink: 0 }}>
          {user?.first_name?.[0]}{user?.last_name?.[0]}
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 18 }}>{user?.first_name} {user?.last_name}</div>
          <div style={{ color: 'var(--gray-500)', fontSize: 13, marginTop: 2 }}>{user?.email}</div>
          <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
            <span className={`badge ${user?.is_verified ? 'badge-success' : 'badge-warning'}`}>
              {user?.is_verified ? <><CheckCircle size={11} /> Verified</> : <><Clock size={11} /> Unverified</>}
            </span>
            <span className={`badge ${
              user?.kyc_status === 'approved' ? 'badge-success'
              : user?.kyc_status === 'unverified' ? 'badge-danger'
              : 'badge-warning'
            }`}>
              KYC: {user?.kyc_status || 'unverified'}
            </span>
            <span style={{ fontSize: 12, background: 'var(--gray-100)', borderRadius: 20, padding: '3px 10px', color: 'var(--gray-500)' }}>
              KYC Level {user?.kyc_level ?? 0}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, background: 'var(--gray-200)', borderRadius: 12, padding: 4, marginBottom: 20 }}>
        {[
          { k: 'profile', label: 'Profile', Icon: User },
          { k: 'security', label: 'Security', Icon: Shield },
        ].map(({ k, label, Icon }) => (
          <button key={k} onClick={() => setTab(k)}
            style={{
              flex: 1, padding: '9px', borderRadius: 9, border: 'none',
              background: tab === k ? 'var(--bg-card)' : 'none', cursor: 'pointer',
              fontSize: 14, fontWeight: 600,
              color: tab === k ? 'var(--text)' : 'var(--gray-500)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              transition: 'all 0.2s', boxShadow: tab === k ? 'var(--shadow-sm)' : 'none',
            }}>
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>

      {/* Profile tab */}
      {tab === 'profile' && (
        <div className="card">
          <h3 style={{ fontWeight: 700, marginBottom: 20 }}>Personal Information</h3>
          <form onSubmit={handleSave}>
            <div className="grid-2" style={{ gap: 12, marginBottom: 18 }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">First Name</label>
                <input className="form-input" value={form.first_name}
                  onChange={e => setForm(p => ({ ...p, first_name: e.target.value }))} />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Last Name</label>
                <input className="form-input" value={form.last_name}
                  onChange={e => setForm(p => ({ ...p, last_name: e.target.value }))} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <input className="form-input" value={user?.email} disabled
                  style={{ paddingLeft: 40, background: 'var(--bg-input)', cursor: 'not-allowed', opacity: 0.6 }} />
                <Mail size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
              </div>
              <small style={{ color: 'var(--gray-400)', fontSize: 12 }}>Email cannot be changed</small>
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <div style={{ position: 'relative' }}>
                <input className="form-input" value={form.phone} style={{ paddingLeft: 40 }}
                  onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                  placeholder="+2348012345678" />
                <Phone size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
              </div>
            </div>

            <button className="btn btn-primary btn-full" type="submit" disabled={saving}>
              {saving ? <span className="spinner" /> : 'Save Changes'}
            </button>
          </form>
        </div>
      )}

      {/* Security tab */}
      {tab === 'security' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Set Transaction PIN */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <Key size={20} color="var(--green)" />
              <h3 style={{ fontWeight: 700, margin: 0 }}>Transaction PIN</h3>
            </div>
            <p style={{ fontSize: 13, color: 'var(--gray-500)', marginBottom: 20 }}>
              Set a 4-digit PIN required for all purchases. You must set this before buying any services.
            </p>
            <form onSubmit={handleSetPin}>
              <div className="form-group">
                <label className="form-label">New PIN</label>
                <input
                  className="form-input"
                  type={showPin ? 'text' : 'password'}
                  placeholder="Enter 4-digit PIN"
                  maxLength={4}
                  inputMode="numeric"
                  pattern="[0-9]{4}"
                  value={pinForm.new_pin}
                  onChange={e => setPinForm(p => ({ ...p, new_pin: e.target.value.replace(/\D/g, '').slice(0, 4) }))}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Confirm PIN</label>
                <input
                  className="form-input"
                  type={showPin ? 'text' : 'password'}
                  placeholder="Repeat PIN"
                  maxLength={4}
                  inputMode="numeric"
                  pattern="[0-9]{4}"
                  value={pinForm.pin_confirm}
                  onChange={e => setPinForm(p => ({ ...p, pin_confirm: e.target.value.replace(/\D/g, '').slice(0, 4) }))}
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <input type="checkbox" id="showPinChk" checked={showPin} onChange={e => setShowPin(e.target.checked)} />
                <label htmlFor="showPinChk" style={{ fontSize: 13, color: 'var(--gray-500)', cursor: 'pointer' }}>
                  Show PIN
                </label>
              </div>
              <button className="btn btn-primary btn-full" type="submit" disabled={settingPin}>
                {settingPin ? <span className="spinner" /> : <><Lock size={16} /> Set Transaction PIN</>}
              </button>
            </form>
          </div>

          {/* Account info */}
          <div className="card">
            <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Account Security</h3>
            <div className="detail-row">
              <span>Verification Status</span>
              <span className={`badge ${user?.is_verified ? 'badge-success' : 'badge-warning'}`}>
                {user?.is_verified ? 'Verified' : 'Unverified'}
              </span>
            </div>
            <div className="detail-row">
              <span>KYC Status</span>
              <span className={`badge ${
                user?.kyc_status === 'approved' ? 'badge-success'
                : user?.kyc_status === 'unverified' ? 'badge-danger'
                : 'badge-warning'
              }`}>
                {user?.kyc_status || 'unverified'}
              </span>
            </div>
            <div className="detail-row">
              <span>KYC Level</span>
              <span style={{ fontWeight: 600 }}>Level {user?.kyc_level ?? 0}</span>
            </div>
            <div className="detail-row">
              <span>Email</span>
              <span style={{ wordBreak: 'break-all' }}>{user?.email}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
