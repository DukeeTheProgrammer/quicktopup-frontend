import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { logout } from '../api/auth';
import toast from 'react-hot-toast';
import { getUserCurrency } from '../utils/currency';
import {
  LayoutDashboard, Phone, Wifi, Tv, Zap, Wallet, ClipboardList,
  Bell, User, LogOut, Menu, X, ChevronRight, Sun, Moon
} from 'lucide-react';
import './Layout.css';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/airtime', icon: Phone, label: 'Airtime' },
  { to: '/data', icon: Wifi, label: 'Data Bundle' },
  { to: '/cable', icon: Tv, label: 'Cable TV' },
  { to: '/electricity', icon: Zap, label: 'Electricity' },
  { to: '/wallet', icon: Wallet, label: 'Wallet' },
  { to: '/transactions', icon: ClipboardList, label: 'Transactions' },
  { to: '/notifications', icon: Bell, label: 'Notifications' },
  { to: '/profile', icon: User, label: 'Profile' },
];

export default function Layout({ children }) {
  const { user, logoutUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const cur = getUserCurrency(user);

  const handleLogout = async () => {
    try { await logout(); } catch {}
    logoutUser();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const initials = user ? `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`.toUpperCase() : 'U';

  return (
    <div className="layout">
      {/* Mobile overlay */}
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="logo">
            <div className="logo-icon">Q</div>
            <div>
              <div className="logo-name">QuickTopUp</div>
              <div className="logo-sub">.ng</div>
            </div>
          </div>
          <button className="close-btn" onClick={() => setSidebarOpen(false)}><X size={20} /></button>
        </div>

        <nav className="sidebar-nav">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}>
              <Icon size={18} />
              <span>{label}</span>
              <ChevronRight size={14} className="nav-arrow" />
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="avatar">{initials}</div>
            <div>
              <div className="user-name">{user?.first_name} {user?.last_name}</div>
              <div className="user-email">{user?.email}</div>
            </div>
          </div>
          <div className="theme-toggle-wrap" style={{ marginBottom: 10, paddingLeft: 2 }}>
            {theme === 'dark' ? <Moon size={14} /> : <Sun size={14} />}
            <span style={{ flex: 1, fontSize: 13 }}>{theme === 'dark' ? 'Dark mode' : 'Light mode'}</span>
            <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme" />
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="main-wrapper">
        <header className="topbar">
          <button className="menu-btn" onClick={() => setSidebarOpen(true)}><Menu size={22} /></button>
          <div className="topbar-right">
            <button
              onClick={toggleTheme}
              style={{ background: 'none', border: 'none', cursor: 'pointer',
                fontSize: 18, padding: '4px 6px', borderRadius: 8,
                color: 'var(--text-muted)', transition: 'background 0.15s' }}
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <div className="wallet-chip">
              <Wallet size={14} />
              <span>{cur.symbol}{parseFloat(user?.wallet_balance || 0).toLocaleString()}</span>
            </div>
            <div className="avatar sm">{initials}</div>
          </div>
        </header>
        <main className="main-content page-enter">{children}</main>
      </div>
    </div>
  );
}
