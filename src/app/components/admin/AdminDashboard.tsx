'use client';
import { useApp } from '../../lib/AppContext';
import { formatCurrency, orderTypeLabel, getStatusLabel, getStatusColor } from '../../lib/constants';
import OrderDetailModal from './OrderDetailModal';
import { useState } from 'react';
import type { Order, OrderStatus } from '../../types';

export default function AdminDashboard() {
  const { orders, members, updateOrderStatus, updateOrderEvidence } = useApp();
  const [detail, setDetail] = useState<Order | null>(null);

  const paid    = orders?.filter(o => o.status === 'paid' || o.status === 'processing' || o.status === 'ready');
  const pending = orders?.filter(o => o.status === 'waiting_payment');
  const processing = orders?.filter(o => o.status === 'processing');
  const ready = orders?.filter(o => o.status === 'ready');
  const revenue = orders?.filter(o => o.status !== 'cancelled' && o.status !== 'waiting_payment').reduce((s, o) => s + o.total, 0);
  const recent  = orders?.slice(0, 6);

  const stats = [
    { label: 'Total Pesanan', val: orders?.length ?? 0,   sub: 'Semua waktu',       color: 'var(--accent)' },
    { label: 'Menunggu',      val: pending?.length ?? 0,  sub: 'Perlu konfirmasi',  color: 'var(--amber)'  },
    { label: 'Diproses',      val: processing?.length ?? 0, sub: 'Sedang dibuat',    color: 'var(--blue)'   },
    { label: 'Siap',         val: ready?.length ?? 0,      sub: 'Siap disajikan',   color: 'var(--green)'  },
  ];

  return (
    <>
      <div className="topbar">
        <div className="topbar-title">📊 Dashboard</div>
        <div className="topbar-right" style={{ fontSize: 13, color: 'var(--text2)' }}>
          Revenue: <strong style={{ color: 'var(--green)', marginLeft: 4 }}>{formatCurrency(revenue)}</strong>
        </div>
      </div>

      <div className="page-content">
        {/* Stats */}
        <div className="stats-grid">
          {stats.map(s => (
            <div key={s.label} className="stat-card">
              <div className="stat-label">{s.label}</div>
              <div className="stat-val" style={{ color: s.color }}>{s.val}</div>
              <div className="stat-sub">{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Revenue card */}
        <div style={{
          background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
          borderRadius: 16, padding: '18px 22px', marginBottom: 22,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <div>
            <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>Total Revenue (Lunas)</div>
            <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 30, fontWeight: 800, color: 'white', marginTop: 4 }}>
              {formatCurrency(revenue)}
            </div>
          </div>
          <div style={{ fontSize: 48 }}>💰</div>
        </div>

        {/* Recent orders */}
        <div className="section-title">Pesanan Terbaru</div>
        {recent?.length === 0 ? (
          <div className="empty-state"><div className="empty-state-icon">📋</div><div>Belum ada pesanan</div></div>
        ) : (
          <div className="tbl-wrap">
            <table className="data-tbl">
              <thead>
                <tr>
                  <th>Kode</th>
                  <th>Pelanggan</th>
                  <th>Tipe</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {recent?.map(o => (
                  <tr key={o.id} className={o.status === 'pending' || o.status === 'waiting_payment' ? 'row-pending' : ''}>
                    <td><span style={{ fontFamily: 'Playfair Display,serif', fontWeight: 800, color: 'var(--accent)' }}>{o.code}</span></td>
                    <td><span style={{ fontWeight: 700 }}>{o.customerName}</span></td>
                    <td style={{ fontSize: 12 }}>{orderTypeLabel(o.orderType, o.tableNo)}</td>
                    <td><span style={{ fontFamily: 'Playfair Display,serif', fontWeight: 800 }}>{formatCurrency(o.total)}</span></td>
                    <td><span style={{ background: getStatusColor(o.status), color: 'white', padding: '4px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600 }}>{getStatusLabel(o.status)}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: 5 }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => setDetail(o)}>Detail</button>
                        {(o.status === 'pending' || o.status === 'waiting_payment') && (
                          <button className="btn btn-green btn-sm" onClick={() => updateOrderStatus(o.id, 'paid')}>✓ Bayar</button>
                        )}
                        {/* Untuk semua tipe pesanan setelah paid -> processing */}
                        {o.status === 'paid' && (
                          <button className="btn btn-blue btn-sm" onClick={() => updateOrderStatus(o.id, 'processing')}>👨‍🍳 Proses</button>
                        )}
                        {o.status === 'processing' && (
                          <button className="btn btn-blue btn-sm" onClick={() => updateOrderStatus(o.id, 'ready')}>✓ Siap</button>
                        )}
                        {/* Untuk pickup: setelah ready -> picked_up */}
                        {o.status === 'ready' && o.orderType === 'pickup' && (
                          <button className="btn btn-green btn-sm" onClick={() => updateOrderStatus(o.id, 'picked_up')}>✓ Diambil</button>
                        )}
                        {(o.status === 'ready' || o.status === 'picked_up') && (
                          <button className="btn btn-green btn-sm" onClick={() => updateOrderStatus(o.id, 'completed')}>✓ Selesai</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {detail && <OrderDetailModal order={detail} onClose={() => setDetail(null)} onUpdateStatus={(id, status) => { updateOrderStatus(id, status); setDetail(null); }} onUpdateEvidence={(id, photo) => { updateOrderEvidence(id, photo); }} />}
    </>
  );
}
