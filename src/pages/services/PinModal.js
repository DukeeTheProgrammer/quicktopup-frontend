import React, { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';

export default function PinModal({ onConfirm, onClose, loading }) {
  const [pin, setPin] = useState(['', '', '', '']);
  const refs = [useRef(), useRef(), useRef(), useRef()];

  useEffect(() => { refs[0].current?.focus(); }, []);

  const handleChange = (i, val) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...pin]; next[i] = val;
    setPin(next);
    if (val && i < 3) refs[i + 1].current?.focus();
  };
  const handleKey = (i, e) => {
    if (e.key === 'Backspace' && !pin[i] && i > 0) refs[i - 1].current?.focus();
  };
  const pinStr = pin.join('');

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999, padding: 20 }}>
      <div style={{ background: 'white', borderRadius: 20, padding: 32, width: '100%', maxWidth: 360 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ fontSize: 18, fontWeight: 700 }}>Enter Transaction PIN</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-500)' }}><X size={20} /></button>
        </div>
        <p style={{ fontSize: 13, color: 'var(--gray-500)', marginBottom: 24, textAlign: 'center' }}>
          Enter your 4-digit PIN to confirm this transaction
        </p>
        <div className="pin-inputs">
          {pin.map((v, i) => (
            <input key={i} ref={refs[i]} className="pin-input" type="password" inputMode="numeric"
              maxLength={1} value={v}
              onChange={e => handleChange(i, e.target.value)}
              onKeyDown={e => handleKey(i, e)} />
          ))}
        </div>
        <button className="btn btn-primary btn-full" onClick={() => onConfirm(pinStr)}
          disabled={pinStr.length < 4 || loading}>
          {loading ? <span className="spinner" /> : 'Confirm Payment'}
        </button>
      </div>
    </div>
  );
}
