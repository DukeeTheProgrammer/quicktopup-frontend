import React, { useState, useEffect } from 'react';
import { getTransactions } from '../../api/transactions';
import { ClipboardList, Search } from 'lucide-react';

const STATUS_MAP = { success: 'badge-success', failed: 'badge-danger', pending: 'badge-warning', processing: 'badge-info' };
const SERVICE_ICONS = { airtime: '📱', data: '📶', cable: '📺', electricity: '⚡' };

export default function TransactionsPage() {
  const [txns, setTxns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: '', service_type: '', date_from: '', date_to: '' });
  const [page, setPage] = useState(1);

  const load = async (f = filters, p = page) => {
    setLoading(true);
    try {
      const params = { page: p, page_size: 20, ...Object.fromEntries(Object.entries(f).filter(([, v]) => v)) };
      const res = await getTransactions(params);
      const raw = res.data?.data;
      setTxns(raw?.results || (Array.isArray(raw) ? raw : []));
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const applyFilters = () => { setPage(1); load(filters, 1); };
  const clearFilters = () => { const f = { status: '', service_type: '', date_from: '', date_to: '' }; setFilters(f); setPage(1); load(f, 1); };

  return (
    <div style={{ maxWidth: 800 }}>
      <div className="page-title">Transaction History</div>
      <div className="page-subtitle">View all your past transactions</div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12, marginBottom: 16 }}>
          <div>
            <label className="form-label">Status</label>
            <select className="form-input" value={filters.status} onChange={e => setFilters(p => ({ ...p, status: e.target.value }))}>
              <option value="">All</option>
              <option value="success">Success</option>
              <option value="failed">Failed</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
            </select>
          </div>
          <div>
            <label className="form-label">Service Type</label>
            <select className="form-input" value={filters.service_type} onChange={e => setFilters(p => ({ ...p, service_type: e.target.value }))}>
              <option value="">All</option>
              <option value="airtime">Airtime</option>
              <option value="data">Data</option>
              <option value="cable">Cable TV</option>
              <option value="electricity">Electricity</option>
            </select>
          </div>
          <div>
            <label className="form-label">Date From</label>
            <input className="form-input" type="date" value={filters.date_from} onChange={e => setFilters(p => ({ ...p, date_from: e.target.value }))} />
          </div>
          <div>
            <label className="form-label">Date To</label>
            <input className="form-input" type="date" value={filters.date_to} onChange={e => setFilters(p => ({ ...p, date_to: e.target.value }))} />
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-primary" onClick={applyFilters}><Search size={15} /> Apply</button>
          <button className="btn btn-secondary" onClick={clearFilters}>Clear</button>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 60 }}><div className="spinner spinner-dark" style={{ margin: '0 auto' }} /></div>
      ) : txns.length === 0 ? (
        <div className="empty-state"><ClipboardList size={48} /><p>No transactions found</p></div>
      ) : (
        <div style={{ background: 'white', borderRadius: 16, overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
          {txns.map(txn => (
            <div key={txn.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 20px', borderBottom: '1px solid var(--gray-100)' }}>
              <div style={{ fontSize: 24, flexShrink: 0 }}>{SERVICE_ICONS[txn.service_type] || '💳'}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>
                  {txn.service_type?.charAt(0).toUpperCase() + txn.service_type?.slice(1)} 
                  {txn.network ? ` · ${txn.network}` : ''}
                  {txn.phone ? ` → ${txn.phone}` : ''}
                </div>
                <div style={{ fontSize: 12, color: 'var(--gray-500)', marginTop: 2 }}>
                  {txn.reference} · {new Date(txn.created_at).toLocaleString('en-NG')}
                </div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 15 }}>₦{parseFloat(txn.total_amount).toLocaleString()}</div>
                <span className={`badge ${STATUS_MAP[txn.status] || 'badge-gray'}`}>{txn.status}</span>
              </div>
            </div>
          ))}
          {/* Pagination */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 10, padding: 16 }}>
            <button className="btn btn-secondary" disabled={page === 1} onClick={() => { setPage(p => p-1); load(filters, page-1); }}>← Prev</button>
            <span style={{ display: 'flex', alignItems: 'center', fontSize: 14, color: 'var(--gray-500)' }}>Page {page}</span>
            <button className="btn btn-secondary" onClick={() => { setPage(p => p+1); load(filters, page+1); }}>Next →</button>
          </div>
        </div>
      )}
    </div>
  );
}
