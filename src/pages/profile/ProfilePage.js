import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { updateProfile } from '../../api/auth';
import toast from 'react-hot-toast';
import { User, Shield, Phone, Mail, CheckCircle, Clock } from 'lucide-react';

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [form, setForm] = useState({ first_name: user?.first_name || '', last_name: user?.last_name || '', phone: user?.phone || '' });
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState('profile');

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile(form);
      await refreshUser();
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally { setSaving(false); }
  };

  return (
    <div style={{ maxWidth: 560 }}>
      <div className="page-title">Profile & Settings</div>
      <div className="page-subtitle">Manage your account information</div>

      {/* Profile summary */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, background: 'white', borderRadius: 16, padding: 20, marginBottom: 20, boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, fontWeight: 800, color: 'white', flexShrink: 0 }}>
          {user?.first_name?.[0]}{user?.last_name?.[0]}
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 18 }}>{user?.first_name} {user?.last_name}</div>
          <div style={{ color: 'var(--gray-500)', fontSize: 13, marginTop: 2 }}>{user?.email}</div>
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <span className={`badge ${user?.is_verified ? 'badge-success' : 'badge-warning'}`}>
              {user?.is_verified ? <><CheckCircle size={11} /> Verified</> : <><Clock size={11} /> Unverified</>}
            </span>
            <span className={`badge ${user?.kyc_status === 'approved' ? 'badge-success' : 'badge-warning'}`}>
              KYC: {user?.kyc_status || 'pending'}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, background: 'var(--gray-200)', borderRadius: 12, padding: 4, marginBottom: 20 }}>
        {[{ k: 'profile', label: 'Profile', Icon: User }, { k: 'security', label: 'Security', Icon: Shield }].map(({ k, label, Icon }) => (
          <button key={k} onClick={() => setTab(k)}
            style={{ flex: 1, padding: '9px', borderRadius: 9, border: 'none', background: tab === k ? 'white' : 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600, color: tab === k ? 'var(--text)' : 'var(--gray-500)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, transition: 'all 0.2s', boxShadow: tab === k ? 'var(--shadow-sm)' : 'none' }}>
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>

      {tab === 'profile' && (
        <div className="card">
          <h3 style={{ fontWeight: 700, marginBottom: 20 }}>Personal Information</h3>
          <form onSubmit={handleSave}>
            <div className="grid-2" style={{ gap: 12, marginBottom: 18 }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">First Name</label>
                <input className="form-input" value={form.first_name} onChange={e => setForm(p => ({ ...p, first_name: e.target.value }))} />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Last Name</label>
                <input className="form-input" value={form.last_name} onChange={e => setForm(p => ({ ...p, last_name: e.target.value }))} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <input className="form-input" value={user?.email} disabled style={{ paddingLeft: 40, background: 'var(--gray-100)', cursor: 'not-allowed' }} />
                <Mail size={16} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-500)' }} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <div style={{ position: 'relative' }}>
                <input className="form-input" type="tel" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} style={{ paddingLeft: 40 }} />
                <Phone size={16} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-500)' }} />
              </div>
            </div>
            <button className="btn btn-primary" type="submit" disabled={saving}>
              {saving ? <span className="spinner" /> : 'Save Changes'}
            </button>
          </form>
        </div>
      )}

      {tab === 'security' && (
        <div className="card">
          <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Security Settings</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid var(--gray-100)' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>Password</div>
                <div style={{ fontSize: 12, color: 'var(--gray-500)' }}>Change your account password</div>
              </div>
              <a href="/forgot-password" style={{ color: 'var(--green)', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>Change →</a>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid var(--gray-100)' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>Two-Factor Auth</div>
                <div style={{ fontSize: 12, color: 'var(--gray-500)' }}>Extra layer of account security</div>
              </div>
              <span className="badge badge-warning">Coming soon</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>Transaction PIN</div>
                <div style={{ fontSize: 12, color: 'var(--gray-500)' }}>Required for all purchases</div>
              </div>
              <span className="badge badge-success">Active</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
