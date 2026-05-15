import React from 'react';
import './Auth.css';

export default function AuthLayout({ children, title, subtitle }) {
  return (
    <div className="auth-bg">
      <div className="auth-container">
        <div className="auth-brand">
          <div className="auth-logo">Q</div>
          <div className="auth-brand-text">
            <span className="auth-brand-name">QuickTopUp</span>
            <span className="auth-brand-ng">.ng</span>
          </div>
        </div>
        <div className="auth-card">
          <h1 className="auth-title">{title}</h1>
          {subtitle && <p className="auth-subtitle">{subtitle}</p>}
          {children}
        </div>
      </div>
    </div>
  );
}
