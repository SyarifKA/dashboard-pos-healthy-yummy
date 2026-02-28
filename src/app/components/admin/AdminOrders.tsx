'use client';
import { useState } from 'react';
import { useApp } from '../../lib/AppContext';
import { formatCurrency, orderTypeLabel, getStatusLabel, getStatusColor } from '../../lib/constants';
import type { Order, OrderStatus } from '../../types';
import OrderDetailModal from './OrderDetailModal';

const STATUS_FILTERS: { val: OrderStatus | 'all'; label: string }[] = [
  { val: 'all', label: 'Semua' },
  { val: 'waiting_payment', label: 'Menunggu Bayar' },
  { val: 'paid', label: 'Lunas' },
  { val: 'processing', label: 'Diproses' },
  { val: 'ready', label: 'Siap' },
  { val: 'picked_up', label: 'Diambil' },
  { val: 'completed', label: 'Selesai' },
];

export default function AdminOrders() {
  const { orders, updateOrderStatus, updateOrderEvidence } = useApp();
  const [detail, setDetail] = useState<Order | null>(null);
  const [filter, setFilter] = useState<OrderStatus | 'all'>('all');
  const [search, setSearch] = useState('');

  const waitingPayment = orders.filter(o => o.status === 'waiting_payment' || o.status === 'pending');

  const filtered = orders.filter(o =>
    (filter === 'all' || o.status === filter) &&
    (o.code.toLowerCase().includes(search.toLowerCase()) ||
     o.customerName.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <>
      <div className="topbar">
        <div className="topbar-title">📋 Manajemen Pesanan</div>
        <div className="topbar-right">
          <div className="search-wrap">
            <input className="search-input" placeholder="Cari kode / nama…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
      </div>

      <div className="page-content">
        {waitingPayment.length > 0 && (
          <div className="warn-bar">
            <span style={{ fontSize: 20 }}>⚠️</span>
            <div>
              <strong style={{ color: 'var(--amber)' }}>{waitingPayment.length} pesanan membutuhkan perhatian</strong>
              <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 2 }}>
                Konfirmasi pembayaran atau lanjutkan ke proses selanjutnya
              </div>
            </div>
          </div>
        )}

        {/* Status filter */}
        <div className="filter-tabs" style={{ marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
          {STATUS_FILTERS.map(f => (
            <button 
              key={f.val} 
              className={`filter-tab ${filter === f.val ? 'active' : ''}`} 
              onClick={() => setFilter(f.val as typeof filter)}
            >
              {f.val === 'all' 
                ? `${f.label} (${orders.length})` 
                : `${f.label} (${orders.filter(o => o.status === f.val).length})`
              }
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state"><div className="empty-state-icon">📋</div><div>Tidak ada pesanan</div></div>
        ) : (
          <div className="tbl-wrap">
            <table className="data-tbl">
              <thead>
                <tr>
                  <th>Kode Booking</th>
                  <th>Pelanggan</th>
                  <th>Tipe Order</th>
                  <th>Pembayaran</th>
                  <th>Total</th>
                  <th>Waktu</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(o => (
                  <tr key={o.id} className={o.status === 'pending' || o.status === 'waiting_payment' ? 'row-pending' : ''}>
                    <td>
                      <span style={{ fontFamily: 'Playfair Display,serif', fontWeight: 800, color: 'var(--accent)', fontSize: 14 }}>
                        {o.code}
                      </span>
                    </td>
                    <td><span style={{ fontWeight: 700 }}>{o.customerName}</span></td>
                    <td><span style={{ fontSize: 12 }}>{orderTypeLabel(o.orderType, o.tableNo)}</span></td>
                    <td><span style={{ fontSize: 12, textTransform: 'uppercase', fontWeight: 700 }}>{o.payment}</span></td>
                    <td><span style={{ fontFamily: 'Playfair Display,serif', fontWeight: 800 }}>{formatCurrency(o.total)}</span></td>
                    <td style={{ fontSize: 11, color: 'var(--text2)', whiteSpace: 'nowrap' }}>
                      {new Date(o.createdAt).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })}
                    </td>
                    <td>
                      <span 
                        className="badge" 
                        style={{ 
                          background: getStatusColor(o.status),
                          color: 'white',
                          padding: '4px 8px',
                          borderRadius: 6,
                          fontSize: 11,
                          fontWeight: 600
                        }}
                      >
                        {getStatusLabel(o.status)}
                      </span>
                    </td>
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
                          <button className="btn btn-green btn-sm" onClick={() => updateOrderStatus(o.id, 'ready')}>✓ Siap</button>
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

      {detail && (
        <OrderDetailModal
          order={detail}
          onClose={() => setDetail(null)}
          onUpdateStatus={(id, status) => { updateOrderStatus(id, status); setDetail(null); }}
          onUpdateEvidence={(id, photo) => { updateOrderEvidence(id, photo); }}
        />
      )}
    </>
  );
}
