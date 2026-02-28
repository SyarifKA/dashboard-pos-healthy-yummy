'use client';
import { useState } from 'react';
import { ADMIN_PIN } from '../../lib/constants';

interface Props {
  onSuccess: () => void;
  onClose: () => void;
}

export default function PinModal({ onSuccess, onClose }: Props) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  const press = (d: string) => {
    if (pin.length >= 4) return;
    const next = pin + d;
    setError(false);
    setPin(next);
    if (next.length === 4) {
      setTimeout(() => {
        if (next === ADMIN_PIN) {
          onSuccess();
        } else {
          setError(true);
          setTimeout(() => { setPin(''); setError(false); }, 700);
        }
      }, 120);
    }
  };

  const del = () => { setPin(p => p.slice(0, -1)); setError(false); };

  const keys = ['1','2','3','4','5','6','7','8','9','','0','⌫'];

  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal" style={{ maxWidth: 340 }}>
        <div className="modal-head">
          <div className="modal-title">🔒 Masuk Admin</div>
          <button className="btn-icon" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body" style={{ alignItems: 'center', gap: 20 }}>
          <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text2)' }}>
            Masukkan PIN untuk mengakses panel admin
          </p>

          {/* PIN dots */}
          <div className="pin-wrap">
            {[0,1,2,3].map(i => (
              <div key={i} className={`pin-dot ${pin.length > i ? 'filled' : ''} ${error ? 'error' : ''}`}>
                {pin.length > i ? '●' : ''}
              </div>
            ))}
          </div>

          {error && (
            <p style={{ color: 'var(--red)', fontSize: 13, fontWeight: 700, textAlign: 'center', marginTop: -8 }}>
              PIN salah, coba lagi
            </p>
          )}

          {/* Numpad */}
          <div className="numpad">
            {keys.map((k, i) =>
              k === '' ? (
                <div key={i} />
              ) : (
                <button
                  key={i}
                  className={`numpad-btn ${k === '⌫' ? 'del' : ''}`}
                  onClick={() => k === '⌫' ? del() : press(k)}
                >
                  {k}
                </button>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
