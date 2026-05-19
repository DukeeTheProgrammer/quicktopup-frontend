import React, { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import AuthLayout from './AuthLayout';
import { passwordResetConfirm } from '../../api/auth';
import toast from 'react-hot-toast';
import { Eye, EyeOff } from 'lucide-react';

export default function ResetPasswordPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ new_password: '', new_password_confirm: '' });
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.new_password !== form.new_password_confirm) { toast.error('Passwords do not match'); return; }
    if (form.new_password.length < 8) { toast.error('Password must be at least 8 characters'); return; }
    setLoading(true);
    try {
      await passwordResetConfirm({
        uid: params.get('uid') || params.get('uidb64'),
        token: params.get('token'),
        new_password: form.new_password,
        new_password_confirm: form.new_password_confirm,
      });
      toast.success('Password reset! Please log in.');
      navigate('/login');
    } catch (err) {
      const msg = err.response?.data?.error?.message
        || err.response?.data?.message
        || err.response?.data?.detail
        || (typeof err.response?.data === 'string' ? err.response.data : null)
        || 'Reset failed. The link may have expired.';
      toast.error(msg);
      console.error('[Reset Password]', err.response?.data);
    } finally { setLoading(false); }
  };

  return (
    <AuthLayout title="Set new password" subtitle="Choose a strong new password for your account">
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">New Password</label>
          <div className="password-wrapper">
            <input className="form-input" type={showPw ? 'text' : 'password'} placeholder="Min. 8 characters"
              style={{ paddingRight: 44 }}
              value={form.new_password} onChange={e => setForm(p => ({ ...p, new_password: e.target.value }))} required />
            <button type="button" className="password-toggle" onClick={() => setShowPw(p => !p)}>
              {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Confirm New Password</label>
          <div className="password-wrapper">
            <input className="form-input" type={showPw ? 'text' : 'password'} placeholder="Repeat password"
              style={{ paddingRight: 44 }}
              value={form.new_password_confirm} onChange={e => setForm(p => ({ ...p, new_password_confirm: e.target.value }))} required />
            <button type="button" className="password-toggle" onClick={() => setShowPw(p => !p)}>
              {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>
        <button className="btn btn-primary btn-full btn-lg" type="submit" disabled={loading}>
          {loading ? <span className="spinner" /> : 'Reset Password'}
        </button>
      </form>
      <div className="auth-footer"><Link to="/login">← Back to login</Link></div>
    </AuthLayout>
  );
}
