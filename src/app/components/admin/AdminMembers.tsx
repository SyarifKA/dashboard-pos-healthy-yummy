'use client';
import { useState, useMemo } from 'react';
import { useApp } from '../../lib/AppContext';
import RegistrationModal from '../shared/RegistrationModal';

const ITEMS_PER_PAGE = 12;

export default function AdminMembers() {
  const { members } = useApp();
  const [regOpen, setRegOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const filtered = useMemo(() => {
    return members.filter(m =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.phone.includes(search)
    );
  }, [members, search]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginatedMembers = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filtered.slice(start, start + ITEMS_PER_PAGE);
  }, [filtered, currentPage]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setCurrentPage(1);
  };

  return (
    <>
      <div className="topbar">
        <div className="topbar-title">👥 Data Pelanggan</div>
        <div className="topbar-right" style={{ flexWrap: 'wrap', gap: 8 }}>
          <div className="search-wrap">
            <input className="search-input" placeholder="Cari member…" value={search} onChange={e => handleSearchChange(e.target.value)} style={{ width: 140 }} />
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => setRegOpen(true)}>+ Tambah</button>
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
          <>
            {/* Members as Cards */}
            <div className="members-card-grid">
              {paginatedMembers.map(m => (
                <div key={m.id} className="member-card">
                  <div className="member-card-avatar">
                    {m.name[0].toUpperCase()}
                  </div>
                  <div className="member-card-info">
                    <div className="member-card-name">{m.name}</div>
                    <div className="member-card-phone">📱 {m.phone}</div>
                    {m.address && (
                      <div className="member-card-address">📍 {m.address}</div>
                    )}
                    {m.socmed && (
                      <div className="member-card-socmed">📘 {m.socmed}</div>
                    )}
                    <div className="member-card-joined">
                      📅 Bergabung: {m.joinedAt}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination">
                <button 
                  className="pagination-btn"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  ← Prev
                </button>
                <div className="pagination-info">
                  Page {currentPage} of {totalPages}
                </div>
                <button 
                  className="pagination-btn"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {regOpen && <RegistrationModal onClose={() => setRegOpen(false)} />}
    </>
  );
}
