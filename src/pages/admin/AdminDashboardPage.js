import React, { useState, useEffect, useCallback, useRef } from 'react';
import { getAdminDashboard } from '../../api/admin';
import {
  Users, Activity, DollarSign, TrendingUp, TrendingDown,
  CheckCircle, XCircle, Database, RefreshCw, AlertTriangle
} from 'lucide-react';

const REFRESH_INTERVAL = 30000;

const formatCurrency = (val, digits = 2) =>
  `₦${parseFloat(val || 0).toLocaleString('en-NG', { minimumFractionDigits: digits, maximumFractionDigits: digits })}`;

const statusColor = (s) => {
  const map = {
    healthy: '#00b96b', degraded: '#f6ad55', down: '#e53e3e',
    unknown: 'var(--gray-400)', success: '#00b96b', failed: '#e53e3e',
    pending: '#f6ad55', processing: '#4299e1',
  };
  return map[s] || 'var(--gray-400)';
};

export default function AdminDashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const intervalRef = useRef(null);

  const fetchDashboard = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await getAdminDashboard();
      setData(res.data?.data || res.data);
      setError(null);
    } catch (err) {
      if (!silent) setError(err.response?.data?.error?.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
    intervalRef.current = setInterval(() => fetchDashboard(true), REFRESH_INTERVAL);
    return () => clearInterval(intervalRef.current);
  }, [fetchDashboard]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboard(true);
  };

  if (loading && !data) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', padding: 40 }}>
        <div className="spinner spinner-dark" />
      </div>
    );
  }

  if (error && !data) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <AlertTriangle size={48} color="#e53e3e" style={{ marginBottom: 16 }} />
        <h2 style={{ marginBottom: 8 }}>Access Denied</h2>
        <p style={{ color: 'var(--gray-500)', marginBottom: 24 }}>{error}</p>
        <button onClick={handleRefresh} className="btn btn-primary">Retry</button>
      </div>
    );
  }

  const { summary = {}, wallet = {}, providers = [], system_health = {}, charts = {}, historical_summaries = [], health_history = [] } = data || {};
  const { daily_trend = [], service_breakdown = [] } = charts;

  return (
    <div style={{ padding: '24px 32px', maxWidth: 1400, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700 }}>Admin Dashboard</h1>
          <p style={{ margin: '4px 0 0', color: 'var(--gray-500)', fontSize: 13 }}>
            {summary.date} · Auto-refreshes every 30s
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px',
            background: 'var(--primary)', color: 'white', border: 'none', borderRadius: 10,
            fontWeight: 600, fontSize: 13, cursor: 'pointer', opacity: refreshing ? 0.7 : 1,
          }}
        >
          <RefreshCw size={16} className={refreshing ? 'spin' : ''} />
          {refreshing ? 'Refreshing...' : 'Refresh Now'}
        </button>
      </div>

      {/* System Health Banner */}
      <div style={{
        display: 'flex', gap: 16, marginBottom: 28, padding: 16, borderRadius: 12,
        background: '#f8fafc', border: '1px solid #e2e8f0', flexWrap: 'wrap',
      }}>
        <HealthBadge label="Database" value={system_health.database} />
        <HealthBadge label="Cache" value={system_health.cache} />
        <HealthBadge label="Celery" value={system_health.celery} />
        <HealthBadge label="Provider API" value={system_health.provider_api} />
        <HealthBadge label="CPU" value={`${system_health.cpu_usage || 0}%`} />
        <HealthBadge label="Memory" value={`${system_health.memory_usage || 0}%`} />
        <HealthBadge label="Disk" value={`${system_health.disk_usage || 0}%`} />
        <HealthBadge label="Pending Tasks" value={system_health.pending_tasks || 0} />
        <HealthBadge label="Failed Tasks" value={system_health.failed_tasks || 0} />
      </div>

      {/* KPI Cards */}
      <div className="dashboard" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16, marginBottom: 28 }}>
        <KpiCard icon={<Users size={20} />} label="Total Users" value={summary.total_users} sub={`+${summary.new_users_today} today`} color="#4299e1" />
        <KpiCard icon={<CheckCircle size={20} />} label="Successful Txns" value={summary.successful_transactions} sub={`${summary.success_rate_today}% today`} color="#00b96b" />
        <KpiCard icon={<XCircle size={20} />} label="Failed Txns" value={summary.failed_transactions} sub={`${summary.reversed_transactions} reversed`} color="#e53e3e" />
        <KpiCard icon={<Activity size={20} />} label="Pending/Processing" value={summary.pending_transactions} sub={`${summary.processing_transactions} processing`} color="#f6ad55" />
        <KpiCard icon={<DollarSign size={20} />} label="Total Volume" value={formatCurrency(summary.total_volume)} sub={`Revenue: ${formatCurrency(summary.total_revenue)}`} color="#00b96b" />
        <KpiCard icon={<TrendingUp size={20} />} label="Funding (Month)" value={formatCurrency(summary.total_wallet_funding_month)} sub={`Today: ${formatCurrency(summary.total_wallet_funding_today)}`} color="#4299e1" />
        <KpiCard icon={<TrendingDown size={20} />} label="Withdrawals" value={formatCurrency(summary.total_withdrawals_month)} sub={`Pending: ${formatCurrency(summary.pending_withdrawals)}`} color="#9f7aea" />
        <KpiCard icon={<Database size={20} />} label="Wallet Balance" value={formatCurrency(wallet.total_balance)} sub={`${wallet.wallet_count} wallets`} color="#f6ad55" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 28 }}>
        {/* Daily Trend Chart */}
        <div style={{ background: 'white', borderRadius: 14, padding: 20, border: '1px solid #e2e8f0' }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 600 }}>Daily Transaction Trend (7 days)</h3>
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', height: 160 }}>
            {daily_trend.map((d) => {
              const max = Math.max(...daily_trend.map(x => x.total), 1);
              const s = d.successful;
              const f = d.failed;
              return (
                <div key={d.date} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <div style={{ fontSize: 10, color: 'var(--gray-400)' }}>{(d.volume / 1000).toFixed(1)}k</div>
                  <div style={{ width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', height: 140 }}>
                    <div style={{ width: '100%', background: '#e53e3e', borderRadius: '3px 3px 0 0', height: `${(f / max) * 140}px`, minHeight: f > 0 ? 3 : 0 }} />
                    <div style={{ width: '100%', background: '#00b96b', borderRadius: '3px 3px 0 0', height: `${(s / max) * 140}px`, minHeight: s > 0 ? 3 : 0 }} />
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--gray-500)', marginTop: 4 }}>
                    {new Date(d.date + 'T00:00:00').toLocaleDateString('en', { weekday: 'short', day: 'numeric' })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Service Breakdown */}
        <div style={{ background: 'white', borderRadius: 14, padding: 20, border: '1px solid #e2e8f0' }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 600 }}>Service Breakdown</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {service_breakdown.map((s) => {
              const total = service_breakdown.reduce((a, b) => a + b.count, 0);
              const pct = total > 0 ? ((s.count / total) * 100).toFixed(1) : 0;
              return (
                <div key={s.service_type}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                    <span style={{ fontWeight: 500, textTransform: 'capitalize' }}>{s.service_type.replace(/_/g, ' ')}</span>
                    <span>{s.count} · {formatCurrency(s.total)}</span>
                  </div>
                  <div style={{ height: 8, background: '#edf2f7', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: 'var(--primary)', borderRadius: 4, transition: 'width 0.3s' }} />
                  </div>
                </div>
              );
            })}
            {service_breakdown.length === 0 && (
              <p style={{ color: 'var(--gray-400)', fontSize: 13 }}>No transactions yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Provider Metrics */}
      <div style={{ background: 'white', borderRadius: 14, padding: 20, border: '1px solid #e2e8f0', marginBottom: 28 }}>
        <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 600 }}>Provider Metrics</h3>
        {providers.length === 0 ? (
          <p style={{ color: 'var(--gray-400)', fontSize: 13 }}>No provider data yet</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                  <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600 }}>Provider</th>
                  <th style={{ textAlign: 'right', padding: '10px 12px', fontWeight: 600 }}>Requests</th>
                  <th style={{ textAlign: 'right', padding: '10px 12px', fontWeight: 600 }}>Successful</th>
                  <th style={{ textAlign: 'right', padding: '10px 12px', fontWeight: 600 }}>Failed</th>
                  <th style={{ textAlign: 'right', padding: '10px 12px', fontWeight: 600 }}>Success Rate</th>
                  <th style={{ textAlign: 'right', padding: '10px 12px', fontWeight: 600 }}>Volume</th>
                </tr>
              </thead>
              <tbody>
                {providers.map((p) => (
                  <tr key={p.provider} style={{ borderBottom: '1px solid #edf2f7' }}>
                    <td style={{ padding: '10px 12px', fontWeight: 500, textTransform: 'capitalize' }}>{p.provider}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right' }}>{p.total_requests}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: '#00b96b' }}>{p.successful_requests}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: p.failed_requests > 0 ? '#e53e3e' : 'inherit' }}>{p.failed_requests}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right' }}>
                      <span style={{
                        color: p.success_rate >= 90 ? '#00b96b' : p.success_rate >= 70 ? '#f6ad55' : '#e53e3e',
                        fontWeight: 600,
                      }}>
                        {p.success_rate}%
                      </span>
                    </td>
                    <td style={{ padding: '10px 12px', textAlign: 'right' }}>{formatCurrency(p.total_volume)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Historical Summaries */}
        <div style={{ background: 'white', borderRadius: 14, padding: 20, border: '1px solid #e2e8f0' }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 600 }}>Daily Summaries (14 days)</h3>
          {historical_summaries.length === 0 ? (
            <p style={{ color: 'var(--gray-400)', fontSize: 13 }}>No historical data yet</p>
          ) : (
            <div style={{ overflowX: 'auto', maxHeight: 300, overflowY: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #e2e8f0', position: 'sticky', top: 0, background: 'white' }}>
                    <th style={{ textAlign: 'left', padding: '8px 10px' }}>Date</th>
                    <th style={{ textAlign: 'right', padding: '8px 10px' }}>Users</th>
                    <th style={{ textAlign: 'right', padding: '8px 10px' }}>Txns</th>
                    <th style={{ textAlign: 'right', padding: '8px 10px' }}>Volume</th>
                    <th style={{ textAlign: 'right', padding: '8px 10px' }}>Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {historical_summaries.map((h) => (
                    <tr key={h.id} style={{ borderBottom: '1px solid #edf2f7' }}>
                      <td style={{ padding: '8px 10px' }}>{h.date}</td>
                      <td style={{ padding: '8px 10px', textAlign: 'right' }}>{h.total_users}</td>
                      <td style={{ padding: '8px 10px', textAlign: 'right' }}>{h.total_transactions}</td>
                      <td style={{ padding: '8px 10px', textAlign: 'right' }}>{formatCurrency(h.total_volume)}</td>
                      <td style={{ padding: '8px 10px', textAlign: 'right' }}>{formatCurrency(h.total_revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Health History */}
        <div style={{ background: 'white', borderRadius: 14, padding: 20, border: '1px solid #e2e8f0' }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 600 }}>System Health History</h3>
          {health_history.length === 0 ? (
            <p style={{ color: 'var(--gray-400)', fontSize: 13 }}>No health records yet</p>
          ) : (
            <div style={{ overflowX: 'auto', maxHeight: 300, overflowY: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #e2e8f0', position: 'sticky', top: 0, background: 'white' }}>
                    <th style={{ textAlign: 'left', padding: '8px 10px' }}>Time</th>
                    <th style={{ textAlign: 'center', padding: '8px 10px' }}>DB</th>
                    <th style={{ textAlign: 'center', padding: '8px 10px' }}>Cache</th>
                    <th style={{ textAlign: 'center', padding: '8px 10px' }}>API</th>
                    <th style={{ textAlign: 'right', padding: '8px 10px' }}>CPU</th>
                    <th style={{ textAlign: 'right', padding: '8px 10px' }}>Mem</th>
                  </tr>
                </thead>
                <tbody>
                  {health_history.map((h) => (
                    <tr key={h.id} style={{ borderBottom: '1px solid #edf2f7' }}>
                      <td style={{ padding: '8px 10px', whiteSpace: 'nowrap' }}>
                        {new Date(h.timestamp).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                        <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: statusColor(h.database_status) }} />
                      </td>
                      <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                        <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: statusColor(h.cache_status) }} />
                      </td>
                      <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                        <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: statusColor(h.provider_api_status) }} />
                      </td>
                      <td style={{ padding: '8px 10px', textAlign: 'right' }}>{h.cpu_usage}%</td>
                      <td style={{ padding: '8px 10px', textAlign: 'right' }}>{h.memory_usage}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function KpiCard({ icon, label, value, sub, color }) {
  return (
    <div style={{
      background: 'white', borderRadius: 14, padding: 20,
      border: '1px solid #e2e8f0',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color }}>{icon}</div>
      </div>
      <div style={{ fontSize: 13, color: 'var(--gray-500)', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)' }}>{value}</div>
      <div style={{ fontSize: 12, color: 'var(--gray-400)', marginTop: 4 }}>{sub}</div>
    </div>
  );
}

function HealthBadge({ label, value }) {
  const isStatus = ['healthy', 'degraded', 'down', 'unknown'].includes(value);
  const color = isStatus ? statusColor(value) : 'var(--text)';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
      {isStatus && <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: color }} />}
      <span style={{ color: 'var(--gray-500)' }}>{label}:</span>
      <span style={{ fontWeight: 600, color }}>{value}</span>
    </div>
  );
}
