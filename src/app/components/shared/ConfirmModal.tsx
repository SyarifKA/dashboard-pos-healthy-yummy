'use client';
import { useState } from 'react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: (reason?: string) => void;
  onCancel: () => void;
  requireReason?: boolean;
}

export default function ConfirmModal({
  isOpen,
  title,
  message,
  confirmLabel = 'Konfirmasi',
  cancelLabel = 'Batal',
  onConfirm,
  onCancel,
  requireReason = false
}: ConfirmModalProps) {
  const [reason, setReason] = useState('');

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (requireReason && !reason.trim()) {
      return;
    }
    onConfirm(reason);
    setReason('');
  };

  const handleCancel = () => {
    setReason('');
    onCancel();
  };

  return (
    <div className="modal-overlay" onClick={handleCancel}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 400 }}>
        <div className="modal-head">
          <div className="modal-title">{title}</div>
          <button className="btn-icon" onClick={handleCancel}>✕</button>
        </div>
        <div className="modal-body">
          <p style={{ marginBottom: 16, color: 'var(--text2)' }}>{message}</p>
          
          {requireReason && (
            <div>
              <label className="form-label">Alasan</label>
              <textarea
                className="form-input"
                rows={3}
                placeholder="Masukkan alasan..."
                value={reason}
                onChange={e => setReason(e.target.value)}
                style={{ resize: 'none' }}
              />
            </div>
          )}
        </div>
        <div className="modal-foot">
          <button className="btn btn-ghost" onClick={handleCancel}>
            {cancelLabel}
          </button>
          <button 
            className="btn btn-primary" 
            onClick={handleConfirm}
            disabled={requireReason && !reason.trim()}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
