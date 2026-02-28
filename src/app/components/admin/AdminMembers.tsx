'use client';
import { useState } from 'react';
import { useApp } from '../../lib/AppContext';
import RegistrationModal from '../shared/RegistrationModal';

export default function AdminMembers() {
  const { members } = useApp();
  const [regOpen, setRegOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filtered = members.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.phone.includes(search)
  );

  return (
    <>
      <div className="topbar">
        <div className="topbar-title">👥 Data Pelanggan</div>
        <div className="topbar-right">
          <div className="search-wrap">
            <input className="search-input" placeholder="Cari member…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => setRegOpen(true)}>+ Tambah Member</button>
        </div>
      </div>

      <div className="page-content">
        <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div className="section-title" style={{ marginBottom: 0 }}>Total {filtered.length} Member</div>
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">👥</div>
            <div style={{ fontSize: 15, fontWeight: 700 }}>Tidak ada member</div>
            <button className="btn btn-primary" style={{ marginTop: 14 }} onClick={() => setRegOpen(true)}>+ Tambah Member</button>
          </div>
        ) : (
          <div className="tbl-wrap">
            <table className="data-tbl">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Nama</th>
                  <th>No. HP</th>
                  <th>Alamat</th>
                  <th>Social Media</th>
                  <th>Bergabung</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((m, i) => (
                  <tr key={m.id}>
                    <td>
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg,var(--accent),var(--accent2))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: 14 }}>
                        {m.name[0].toUpperCase()}
                      </div>
                    </td>
                    <td><span style={{ fontWeight: 700 }}>{m.name}</span></td>
                    <td>{m.phone}</td>
                    <td style={{ fontSize: 12, color: 'var(--text2)' }}>{m.address || '—'}</td>
                    <td style={{ fontSize: 12 }}>{m.socmed || '—'}</td>
                    <td>
                      <span className="badge" style={{ background: 'var(--accent-bg)', color: 'var(--accent)' }}>
                        {m.joinedAt}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {regOpen && <RegistrationModal onClose={() => setRegOpen(false)} />}
    </>
  );
}
