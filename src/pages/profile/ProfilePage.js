import React, { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { updateProfile, setPin, pinResetRequest, pinResetConfirm, phoneChangeRequest, phoneChangeConfirm, uploadAvatar } from '../../api/auth';
import toast from 'react-hot-toast';
import { User, Shield, Phone, Mail, CheckCircle, Clock, Key, Lock, Camera, RefreshCw, Send, Image } from 'lucide-react';

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [form, setForm] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    phone: user?.phone || '',
  });
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState('profile');
  const fileRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  // PIN set state
  const [pinForm, setPinForm] = useState({ new_pin: '', pin_confirm: '' });
  const [settingPin, setSettingPin] = useState(false);
  const [showPin, setShowPin] = useState(false);

  // PIN reset state
  const [pinResetStep, setPinResetStep] = useState('idle'); // idle | code_sent | done
  const [pinResetCode, setPinResetCode] = useState('');
  const [newPinReset, setNewPinReset] = useState({ new_pin: '', pin_confirm: '' });
  const [pinResetting, setPinResetting] = useState(false);

  // Phone change state
  const [newPhone, setNewPhone] = useState('');
  const [phoneChangeStep, setPhoneChangeStep] = useState('idle'); // idle | code_sent | done
  const [phoneChangeCode, setPhoneChangeCode] = useState('');
  const [phoneChanging, setPhoneChanging] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile({ first_name: form.first_name, last_name: form.last_name, phone: form.phone });
      await refreshUser();
      toast.success('Profile updated!', { duration: 5000 });
    } catch (err) {
      const d = err.response?.data;
      toast.error(d?.error?.message || d?.message || d?.detail || 'Update failed');
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
      toast.success('Transaction PIN set successfully!', { duration: 5000 });
      setPinForm({ new_pin: '', pin_confirm: '' });
      await refreshUser();
    } catch (err) {
      const d = err.response?.data;
      toast.error(d?.error?.message || d?.message || d?.detail || 'Failed to set PIN');
    } finally { setSettingPin(false); }
  };

  const handlePinResetRequest = async () => {
    setPinResetting(true);
    try {
      await pinResetRequest();
      toast.success('Verification code sent to your email', { duration: 6000 });
      setPinResetStep('code_sent');
      setPinResetCode('');
      setNewPinReset({ new_pin: '', pin_confirm: '' });
    } catch (err) {
      const d = err.response?.data;
      toast.error(d?.error?.message || d?.message || d?.detail || 'Failed to send code');
    } finally { setPinResetting(false); }
  };

  const handlePinResetConfirm = async (e) => {
    e.preventDefault();
    if (newPinReset.new_pin.length !== 4 || !/^\d{4}$/.test(newPinReset.new_pin)) {
      toast.error('PIN must be exactly 4 digits');
      return;
    }
    if (newPinReset.new_pin !== newPinReset.pin_confirm) {
      toast.error('PINs do not match');
      return;
    }
    if (pinResetCode.length !== 6) {
      toast.error('Enter the 6-digit code sent to your email');
      return;
    }
    setPinResetting(true);
    try {
      await pinResetConfirm({ code: pinResetCode, new_pin: newPinReset.new_pin, pin_confirm: newPinReset.pin_confirm });
      toast.success('PIN reset successfully!', { duration: 5000 });
      setPinResetStep('done');
      await refreshUser();
    } catch (err) {
      const d = err.response?.data;
      toast.error(d?.error?.message || d?.message || d?.detail || 'Failed to reset PIN');
    } finally { setPinResetting(false); }
  };

  const handlePhoneChangeRequest = async () => {
    if (!newPhone || newPhone.trim().length < 10) {
      toast.error('Enter a valid phone number');
      return;
    }
    setPhoneChanging(true);
    try {
      await phoneChangeRequest({ new_phone: newPhone });
      toast.success('Verification code sent to your email', { duration: 6000 });
      setPhoneChangeStep('code_sent');
      setPhoneChangeCode('');
    } catch (err) {
      const d = err.response?.data;
      toast.error(d?.error?.message || d?.message || d?.detail || 'Failed to send code');
    } finally { setPhoneChanging(false); }
  };

  const handlePhoneChangeConfirm = async (e) => {
    e.preventDefault();
    if (phoneChangeCode.length !== 6) {
      toast.error('Enter the 6-digit code sent to your email');
      return;
    }
    setPhoneChanging(true);
    try {
      await phoneChangeConfirm({ code: phoneChangeCode, new_phone: newPhone });
      toast.success('Phone number updated successfully!', { duration: 5000 });
      setPhoneChangeStep('done');
      setForm(p => ({ ...p, phone: newPhone }));
      await refreshUser();
    } catch (err) {
      const d = err.response?.data;
      toast.error(d?.error?.message || d?.message || d?.detail || 'Failed to update phone');
    } finally { setPhoneChanging(false); }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be under 2MB');
      return;
    }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('avatar', file);
      await uploadAvatar(fd);
      toast.success('Profile picture updated!', { duration: 5000 });
      await refreshUser();
    } catch (err) {
      const d = err.response?.data;
      toast.error(d?.error?.message || d?.message || d?.detail || 'Failed to upload image');
    } finally { setUploading(false); }
  };

  const hasPin = user?.has_transaction_pin;

  return (
    <div style={{ maxWidth: 640 }}>
      <div className="page-title">Profile & Settings</div>
      <div className="page-subtitle">Manage your account information</div>

      {/* Profile summary card with avatar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 20, background: 'var(--bg-card)', borderRadius: 16, padding: 20, marginBottom: 20, boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <div style={{
            width: 72, height: 72, borderRadius: '50%', overflow: 'hidden',
            background: 'var(--gray-200)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '3px solid var(--green)',
          }}>
            {user?.avatar ? (
              <img src={user.avatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span style={{ fontSize: 28, fontWeight: 800, color: 'var(--green)' }}>
                {user?.first_name?.[0]}{user?.last_name?.[0]}
              </span>
            )}
          </div>
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            style={{
              position: 'absolute', bottom: 0, right: 0, width: 28, height: 28, borderRadius: '50%',
              background: 'var(--green)', color: 'white', border: '2px solid var(--bg-card)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
              fontSize: 13,
            }}
            title="Change profile picture"
          >
            {uploading ? <span className="spinner" style={{ width: 14, height: 14 }} /> : <Camera size={14} />}
          </button>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarChange} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 18 }}>{user?.first_name} {user?.last_name}</div>
          <div style={{ color: 'var(--gray-500)', fontSize: 13, marginTop: 2 }}>{user?.email}</div>
          <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
            <span className={`badge ${user?.is_verified ? 'badge-success' : 'badge-warning'}`}>
              {user?.is_verified ? <><CheckCircle size={11} /> Verified</> : <><Clock size={11} /> Unverified</>}
            </span>
            <span className={`badge ${hasPin ? 'badge-success' : 'badge-warning'}`}>
              <Key size={11} /> {hasPin ? 'PIN Set' : 'No PIN'}
            </span>
            <span className={`badge ${
              user?.kyc_status === 'approved' ? 'badge-success'
              : user?.kyc_status === 'unverified' ? 'badge-danger'
              : 'badge-warning'
            }`}>
              KYC: {user?.kyc_status || 'unverified'}
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

          <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '24px 0' }} />

          {/* Phone Number Change Section */}
          <h3 style={{ fontWeight: 700, marginBottom: 12 }}>Change Phone Number</h3>
          <p style={{ fontSize: 13, color: 'var(--gray-500)', marginBottom: 16 }}>
            A verification code will be sent to your email to confirm the change.
          </p>
          {phoneChangeStep === 'done' ? (
            <div style={{ textAlign: 'center', padding: 16 }}>
              <CheckCircle size={32} color="var(--green)" style={{ marginBottom: 8 }} />
              <p style={{ fontWeight: 600, color: 'var(--green)' }}>Phone number updated to {newPhone}</p>
              <button className="btn btn-secondary" style={{ marginTop: 12 }} onClick={() => {
                setPhoneChangeStep('idle'); setNewPhone(''); setPhoneChangeCode('');
              }}>
                Change Again
              </button>
            </div>
          ) : phoneChangeStep === 'code_sent' ? (
            <form onSubmit={handlePhoneChangeConfirm}>
              <div className="form-group">
                <label className="form-label">New Phone Number</label>
                <input className="form-input" value={newPhone} disabled
                  style={{ opacity: 0.6, cursor: 'not-allowed' }} />
              </div>
              <div className="form-group">
                <label className="form-label">Verification Code</label>
                <input className="form-input" value={phoneChangeCode}
                  onChange={e => setPhoneChangeCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="6-digit code from email"
                  maxLength={6} inputMode="numeric" />
                <small style={{ color: 'var(--gray-400)', fontSize: 12 }}>
                  Didn't get it? <button type="button" onClick={handlePhoneChangeRequest}
                    style={{ background: 'none', border: 'none', color: 'var(--green)', cursor: 'pointer', fontSize: 12, fontWeight: 600, textDecoration: 'underline' }}>
                    Resend code
                  </button>
                </small>
              </div>
              <button className="btn btn-primary btn-full" type="submit" disabled={phoneChanging}>
                {phoneChanging ? <span className="spinner" /> : 'Confirm & Update Phone'}
              </button>
            </form>
          ) : (
            <div style={{ display: 'flex', gap: 12 }}>
              <input className="form-input" value={newPhone}
                onChange={e => setNewPhone(e.target.value)}
                placeholder="+2348012345678" style={{ flex: 1 }} />
              <button className="btn btn-primary" onClick={handlePhoneChangeRequest} disabled={phoneChanging}
                style={{ whiteSpace: 'nowrap' }}>
                {phoneChanging ? <span className="spinner" /> : <><Send size={16} /> Send Code</>}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Security tab */}
      {tab === 'security' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Set / Change Transaction PIN */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <Key size={20} color={hasPin ? 'var(--green)' : 'var(--gray-400)'} />
              <h3 style={{ fontWeight: 700, margin: 0 }}>Transaction PIN</h3>
              <span className={`badge ${hasPin ? 'badge-success' : 'badge-warning'}`}>
                {hasPin ? 'Active' : 'Not Set'}
              </span>
            </div>
            <p style={{ fontSize: 13, color: 'var(--gray-500)', marginBottom: 20 }}>
              {hasPin
                ? 'Your transaction PIN is active. You can reset it below.'
                : 'Set a 4-digit PIN required for all purchases.'}
            </p>

            {/* Set PIN (only when no PIN) */}
            {!hasPin && (
              <form onSubmit={handleSetPin}>
                <div className="form-group">
                  <label className="form-label">New PIN</label>
                  <input className="form-input" type={showPin ? 'text' : 'password'}
                    placeholder="Enter 4-digit PIN" maxLength={4} inputMode="numeric" pattern="[0-9]{4}"
                    value={pinForm.new_pin}
                    onChange={e => setPinForm(p => ({ ...p, new_pin: e.target.value.replace(/\D/g, '').slice(0, 4) }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Confirm PIN</label>
                  <input className="form-input" type={showPin ? 'text' : 'password'}
                    placeholder="Repeat PIN" maxLength={4} inputMode="numeric" pattern="[0-9]{4}"
                    value={pinForm.pin_confirm}
                    onChange={e => setPinForm(p => ({ ...p, pin_confirm: e.target.value.replace(/\D/g, '').slice(0, 4) }))} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                  <input type="checkbox" id="showPinChk" checked={showPin} onChange={e => setShowPin(e.target.checked)} />
                  <label htmlFor="showPinChk" style={{ fontSize: 13, color: 'var(--gray-500)', cursor: 'pointer' }}>Show PIN</label>
                </div>
                <button className="btn btn-primary btn-full" type="submit" disabled={settingPin}>
                  {settingPin ? <span className="spinner" /> : <><Lock size={16} /> Set Transaction PIN</>}
                </button>
              </form>
            )}

            {/* Reset PIN (only when PIN is set) */}
            {hasPin && pinResetStep === 'idle' && (
              <div>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', background: 'var(--gray-100)', padding: '12px 16px', borderRadius: 10, marginBottom: 16 }}>
                  <RefreshCw size={14} style={{ verticalAlign: 'middle', marginRight: 6 }} />
                  Forgot your PIN? Reset it below. A verification code will be sent to your email.
                </p>
                <button className="btn btn-secondary" onClick={handlePinResetRequest} disabled={pinResetting}
                  style={{ width: '100%' }}>
                  {pinResetting ? <span className="spinner spinner-dark" /> : <><RefreshCw size={16} /> Reset Transaction PIN</>}
                </button>
              </div>
            )}

            {hasPin && pinResetStep === 'done' && (
              <div style={{ textAlign: 'center', padding: 16 }}>
                <CheckCircle size={40} color="var(--green)" style={{ marginBottom: 8 }} />
                <p style={{ fontWeight: 600, color: 'var(--green)', fontSize: 16 }}>PIN Reset Successful!</p>
                <p style={{ fontSize: 13, color: 'var(--gray-500)', marginTop: 4 }}>Your new transaction PIN is active.</p>
                <button className="btn btn-secondary" style={{ marginTop: 16 }} onClick={() => {
                  setPinResetStep('idle'); setPinResetCode(''); setNewPinReset({ new_pin: '', pin_confirm: '' });
                }}>
                  Done
                </button>
              </div>
            )}

            {/* PIN reset code entry form */}
            {hasPin && pinResetStep === 'code_sent' && (
              <form onSubmit={handlePinResetConfirm}>
                <div className="form-group">
                  <label className="form-label">Verification Code</label>
                  <input className="form-input" value={pinResetCode}
                    onChange={e => setPinResetCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="6-digit code from email"
                    maxLength={6} inputMode="numeric" />
                  <small style={{ color: 'var(--gray-400)', fontSize: 12 }}>
                    Sent to {user?.email}.{' '}
                    <button type="button" onClick={handlePinResetRequest}
                      style={{ background: 'none', border: 'none', color: 'var(--green)', cursor: 'pointer', fontSize: 12, fontWeight: 600, textDecoration: 'underline' }}>
                      Resend
                    </button>
                  </small>
                </div>
                <div className="form-group">
                  <label className="form-label">New PIN</label>
                  <input className="form-input" type="password"
                    placeholder="Enter 4-digit PIN" maxLength={4} inputMode="numeric" pattern="[0-9]{4}"
                    value={newPinReset.new_pin}
                    onChange={e => setNewPinReset(p => ({ ...p, new_pin: e.target.value.replace(/\D/g, '').slice(0, 4) }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Confirm New PIN</label>
                  <input className="form-input" type="password"
                    placeholder="Repeat PIN" maxLength={4} inputMode="numeric" pattern="[0-9]{4}"
                    value={newPinReset.pin_confirm}
                    onChange={e => setNewPinReset(p => ({ ...p, pin_confirm: e.target.value.replace(/\D/g, '').slice(0, 4) }))} />
                </div>
                <button className="btn btn-primary btn-full" type="submit" disabled={pinResetting}>
                  {pinResetting ? <span className="spinner" /> : <><RefreshCw size={16} /> Confirm Reset</>}
                </button>
              </form>
            )}
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
            <div className="detail-row">
              <span>Phone</span>
              <span>{user?.phone || 'Not set'}</span>
            </div>
            <div className="detail-row">
              <span>Transaction PIN</span>
              <span className={`badge ${hasPin ? 'badge-success' : 'badge-warning'}`}>
                {hasPin ? 'Set' : 'Not Set'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}