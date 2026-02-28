'use client';
import { useState } from 'react';
import { useApp } from '../../lib/AppContext';

interface Props { onClose: () => void; }

export default function RegistrationModal({ onClose }: Props) {
  const { addMember } = useApp();
  const [form, setForm] = useState({ name: '', phone: '', address: '', socmed: '' });
  const set = (k: keyof typeof form, v: string) => setForm(f => ({ ...f, [k]: v }));
  const valid = form.name.trim() && form.phone.trim();

  const handleSave = () => {
    addMember(form);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal">
        <div className="modal-head">
          <div className="modal-title">👤 Daftar Member Baru</div>
          <button className="btn-icon" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div style={{ background: 'var(--accent-bg)', border: '1px solid var(--accent)', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: 'var(--accent)' }}>
            ✨ Daftar member sekarang & dapatkan berbagai keuntungan eksklusif!
          </div>
          <div className="form-group">
            <label className="form-label">Nama Lengkap *</label>
            <input className="form-input" placeholder="Nama lengkap" value={form.name} onChange={e => set('name', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Nomor Handphone *</label>
            <input className="form-input" placeholder="08xxxxxxxxxx" value={form.phone} onChange={e => set('phone', e.target.value)} type="tel" />
          </div>
          <div className="form-group">
            <label className="form-label">Alamat</label>
            <input className="form-input" placeholder="Alamat lengkap" value={form.address} onChange={e => set('address', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Social Media</label>
            <input className="form-input" placeholder="@username" value={form.socmed} onChange={e => set('socmed', e.target.value)} />
          </div>
        </div>
        <div className="modal-foot">
          <button className="btn btn-ghost" onClick={onClose}>Batal</button>
          <button className="btn btn-primary" disabled={!valid} onClick={handleSave}>
            💾 Simpan Member
          </button>
        </div>
      </div>
    </div>
  );
}
