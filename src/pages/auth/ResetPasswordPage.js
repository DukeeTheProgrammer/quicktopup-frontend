import React, { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import AuthLayout from './AuthLayout';
import { passwordResetConfirm } from '../../api/auth';
import toast from 'react-hot-toast';

export default function ResetPasswordPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ new_password: '', new_password_confirm: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.new_password !== form.new_password_confirm) { toast.error('Passwords do not match'); return; }
    setLoading(true);
    try {
      await passwordResetConfirm({ uid: params.get('uid'), token: params.get('token'), ...form });
      toast.success('Password reset! Please log in.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset failed');
    } finally { setLoading(false); }
  };

  return (
    <AuthLayout title="Set new password" subtitle="Choose a strong new password for your account">
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">New Password</label>
          <input className="form-input" type="password" placeholder="Min. 8 characters"
            value={form.new_password} onChange={e => setForm(p => ({ ...p, new_password: e.target.value }))} required />
        </div>
        <div className="form-group">
          <label className="form-label">Confirm New Password</label>
          <input className="form-input" type="password" placeholder="Repeat password"
            value={form.new_password_confirm} onChange={e => setForm(p => ({ ...p, new_password_confirm: e.target.value }))} required />
        </div>
        <button className="btn btn-primary btn-full btn-lg" type="submit" disabled={loading}>
          {loading ? <span className="spinner" /> : 'Reset Password'}
        </button>
      </form>
      <div className="auth-footer"><Link to="/login">← Back to login</Link></div>
    </AuthLayout>
  );
}
