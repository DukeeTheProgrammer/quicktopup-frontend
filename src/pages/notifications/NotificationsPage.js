import React, { useState, useEffect } from 'react';
import { getNotifications, markNotificationRead } from '../../api/notifications';
import { Bell, Mail, MessageSquare, Check } from 'lucide-react';
import toast from 'react-hot-toast';

const CHANNEL_ICONS = { email: Mail, sms: MessageSquare, push: Bell };

export default function NotificationsPage() {
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await getNotifications();
      const raw = res.data?.data || res.data;
      setNotifs(raw?.results || (Array.isArray(raw) ? raw : []));
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const markRead = async (id) => {
    try {
      await markNotificationRead(id);
      setNotifs(prev => prev.map(n => n.id === id ? { ...n, status: 'read' } : n));
      toast.success('Marked as read');
    } catch { toast.error('Failed'); }
  };

  return (
    <div style={{ maxWidth: 640 }}>
      <div className="page-title">Notifications</div>
      <div className="page-subtitle">Your recent alerts and updates</div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60 }}><div className="spinner spinner-dark" style={{ margin: '0 auto' }} /></div>
      ) : notifs.length === 0 ? (
        <div className="empty-state"><Bell size={48} /><p>No notifications yet</p></div>
      ) : (
        <div style={{ background: 'white', borderRadius: 16, overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
          {notifs.map(n => {
            const Icon = CHANNEL_ICONS[n.channel] || Bell;
            const isRead = n.status === 'read';
            return (
              <div key={n.id} style={{ display: 'flex', gap: 14, padding: '18px 20px', borderBottom: '1px solid var(--gray-100)', background: isRead ? 'white' : 'var(--green-light)', transition: 'background 0.2s' }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: isRead ? 'var(--gray-200)' : 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: isRead ? 'var(--gray-500)' : 'white' }}>
                  <Icon size={16} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: isRead ? 600 : 700, fontSize: 14, color: 'var(--text)', marginBottom: 2 }}>{n.title}</div>
                  <div style={{ fontSize: 13, color: 'var(--gray-500)', marginBottom: 6 }}>{n.message}</div>
                  <div style={{ fontSize: 11, color: 'var(--gray-500)' }}>
                    {n.sent_at ? new Date(n.sent_at).toLocaleString('en-NG') : ''} · {n.channel}
                  </div>
                </div>
                {!isRead && (
                  <button onClick={() => markRead(n.id)} title="Mark as read"
                    style={{ background: 'var(--green)', border: 'none', borderRadius: 8, color: 'white', cursor: 'pointer', padding: '6px 10px', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 600 }}>
                    <Check size={13} /> Read
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
