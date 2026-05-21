import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthLayout from './AuthLayout';
import { login } from '../../api/auth';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Hand } from 'lucide-react';

export default function LoginPage() {
  const { loginUser } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await login(form);
      // Handle both { data: { user, token } } and flat { user, token }
      const payload = res.data?.data || res.data;
      const user = payload?.user;
      const token = payload?.token;

      if (!token) {
        toast.success(res.data?.message || 'Login successful! Please wait...');
        window.location.href = '/dashboard';
        return;
      }

      // Persist to localStorage FIRST, then update context, then navigate
      localStorage.setItem('auth_token', token);
      localStorage.setItem('user', JSON.stringify(user));
      loginUser(user, token);
      toast.success(`Welcome back, ${user?.first_name || 'there'}!`, { duration: 5000 });
      window.location.href = '/dashboard';
    } catch (err) {
      if (err.response) {
        const d = err.response.data;
        const msg = d?.error?.message
          || d?.message
          || (typeof d === 'string' ? d : null)
          || `Error ${err.response.status}`;
        toast.error(msg);
      } else if (err.request) {
        toast.error('No response from server. Check your connection.');
      } else {
        console.error('Login runtime error:', err);
        toast.error('Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title={<span>Welcome back <Hand size={20} style={{ display: 'inline', verticalAlign: 'middle' }} /></span>} subtitle="Sign in to your QuickTopUp account">
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Email Address</label>
          <input className="form-input" type="email" placeholder="you@example.com"
            value={form.email}
            onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required />
        </div>
        <div className="form-group">
          <label className="form-label">Password</label>
          <div className="password-wrapper">
            <input className="form-input" type={showPw ? 'text' : 'password'}
              placeholder="Your password" style={{ paddingRight: 44 }}
              value={form.password}
              onChange={e => setForm(p => ({ ...p, password: e.target.value }))} required />
            <button type="button" className="password-toggle" onClick={() => setShowPw(p => !p)}>
              {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>
        <div style={{ textAlign: 'right', marginBottom: 20 }}>
          <Link to="/forgot-password"
            style={{ fontSize: 13, color: 'var(--green)', textDecoration: 'none', fontWeight: 600 }}>
            Forgot password?
          </Link>
        </div>
        <button className="btn btn-primary btn-full btn-lg" type="submit" disabled={loading}>
          {loading ? <span className="spinner" /> : 'Sign In'}
        </button>
      </form>
      <div className="auth-footer">
        Don't have an account? <Link to="/register">Create one</Link>
      </div>
    </AuthLayout>
  );
}
