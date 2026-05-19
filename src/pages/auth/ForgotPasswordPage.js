import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthLayout from './AuthLayout';
import { passwordReset } from '../../api/auth';
import toast from 'react-hot-toast';
import { Mail } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await passwordReset({ email });
      setSent(true);
      toast.success('Reset email sent! Check your inbox.');
    } catch (err) {
      const msg = err.response?.data?.error?.message
        || err.response?.data?.message
        || err.response?.data?.detail
        || (typeof err.response?.data === 'string' ? err.response.data : null)
        || 'Could not send reset link. Please try again.';
      toast.error(msg);
      console.error('[Forgot Password]', err.response?.data);
    } finally { setLoading(false); }
  };

  return (
    <AuthLayout title="Forgot password?" subtitle="Enter your email and we'll send you a reset link">
      {sent ? (
        <div className="success-box">
          <Mail size={32} style={{ color: 'var(--green)', margin: '0 auto 8px', display: 'block' }} />
          <p>We sent a reset link to <strong>{email}</strong>. Check your inbox!</p>
          <p style={{ marginTop: 8, fontSize: 12, color: 'var(--gray-500)' }}>The link expires in 1 hour.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input className="form-input" type="email" placeholder="you@example.com"
              value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <button className="btn btn-primary btn-full btn-lg" type="submit" disabled={loading}>
            {loading ? <span className="spinner" /> : 'Send Reset Link'}
          </button>
        </form>
      )}
      <div className="auth-footer"><Link to="/login">← Back to login</Link></div>
    </AuthLayout>
  );
}
