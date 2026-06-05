import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthLayout from './AuthLayout';
import { register, googleAuth } from '../../api/auth';
import { useAuth } from '../../context/AuthContext';
import GoogleSignInButton from '../../components/GoogleSignInButton';
import toast from 'react-hot-toast';
import { Eye, EyeOff } from 'lucide-react';

export default function RegisterPage() {
  const { loginUser } = useAuth();
  const [form, setForm] = useState({
    email: '', phone: '', first_name: '', last_name: '',
    password: '', password_confirm: ''
  });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const set = (key) => (e) => setForm(p => ({ ...p, [key]: e.target.value }));

  const handleGoogleResponse = async (credential) => {
    if (!credential) {
      toast.error('Google sign in failed. Please try again.');
      return;
    }

    if (!form.phone) {
      toast.error('Please enter your phone number before using Google sign up.');
      return;
    }

    setGoogleLoading(true);
    try {
      const res = await googleAuth({
        id_token: credential,
        phone: form.phone,
        first_name: form.first_name,
        last_name: form.last_name,
      });
      const payload = res.data?.data || res.data;
      const user = payload?.user;
      const token = payload?.token;

      if (!token) {
        toast.success(res.data?.message || 'Google authentication successful.');
        window.location.href = '/dashboard';
        return;
      }

      localStorage.setItem('auth_token', token);
      localStorage.setItem('user', JSON.stringify(user));
      loginUser(user, token);
      toast.success(`Welcome, ${user?.first_name || 'there'}!`, { duration: 5000 });
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
        console.error('Google auth error:', err);
        toast.error('Something went wrong. Please try again.');
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.password_confirm) {
      toast.error('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      const res = await register(form);
      // Handle both { data: { user, token } } and flat { user, token }
      const payload = res.data?.data || res.data;
      const user = payload?.user;
      const token = payload?.token;

      if (!token) {
        // Server returned 2xx but no token — show raw message
        toast.success(res.data?.message || 'Account created! Please log in.');
        window.location.href = '/login';
        return;
      }

      // Persist to localStorage FIRST, then update context, then navigate
      localStorage.setItem('auth_token', token);
      localStorage.setItem('user', JSON.stringify(user));
      loginUser(user, token);
      toast.success('Account created! Welcome!', { duration: 5000 });
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
        console.error('Register runtime error:', err);
        toast.error('Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Create account" subtitle="Join QuickTopUp and enjoy fast VTU services">
      <div style={{ marginBottom: 24 }}>
        <GoogleSignInButton onSuccess={handleGoogleResponse} onError={(message) => toast.error(message)} />
        {googleLoading && <div style={{ marginTop: 12, color: 'var(--gray)' }}>Signing in with Google...</div>}
        <div style={{ display: 'flex', alignItems: 'center', margin: '20px 0' }}>
          <div style={{ flex: 1, height: 1, background: '#e1e1e1' }} />
          <div style={{ margin: '0 12px', color: '#999', fontSize: 13 }}>or</div>
          <div style={{ flex: 1, height: 1, background: '#e1e1e1' }} />
        </div>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="grid-2" style={{ gap: 12, marginBottom: 18 }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">First Name</label>
            <input className="form-input" placeholder="John"
              value={form.first_name} onChange={set('first_name')} required />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Last Name</label>
            <input className="form-input" placeholder="Doe"
              value={form.last_name} onChange={set('last_name')} required />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Email Address</label>
          <input className="form-input" type="email" placeholder="you@example.com"
            value={form.email} onChange={set('email')} required />
        </div>
        <div className="form-group">
          <label className="form-label">Phone Number</label>
          <input className="form-input" type="tel" placeholder="+2348012345678 or +233241234567"
            value={form.phone} onChange={set('phone')} required />
        </div>
        <div className="form-group">
          <label className="form-label">Password</label>
          <div className="password-wrapper">
            <input className="form-input" type={showPw ? 'text' : 'password'}
              placeholder="Min. 8 characters" style={{ paddingRight: 44 }}
              value={form.password} onChange={set('password')} required />
            <button type="button" className="password-toggle" onClick={() => setShowPw(p => !p)}>
              {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Confirm Password</label>
          <input className="form-input" type="password" placeholder="Repeat password"
            value={form.password_confirm} onChange={set('password_confirm')} required />
        </div>
        <button className="btn btn-primary btn-full btn-lg" type="submit" disabled={loading}>
          {loading ? <span className="spinner" /> : 'Create Account'}
        </button>
      </form>
      <div className="auth-footer">
        Already have an account? <Link to="/login">Sign in</Link>
      </div>
    </AuthLayout>
  );
}
