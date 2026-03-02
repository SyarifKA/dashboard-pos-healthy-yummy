'use client';
import { useState, useMemo } from 'react';
import { useApp } from '../../lib/AppContext';
import { formatCurrency, orderTypeLabel, getStatusLabel, getStatusColor } from '../../lib/constants';
import type { Order, OrderStatus } from '../../types';
import OrderDetailModal from './OrderDetailModal';
import ConfirmModal from '../shared/ConfirmModal';

const STATUS_FILTERS: { val: OrderStatus | 'all'; label: string; icon: string }[] = [
  { val: 'all', label: 'Semua', icon: '📋' },
  { val: 'waiting_payment', label: 'Menunggu Bayar', icon: '💳' },
  { val: 'paid', label: 'Lunas', icon: '✅' },
  { val: 'processing', label: 'Diproses', icon: '👨‍🍳' },
  { val: 'ready', label: 'Siap', icon: '🍽️' },
  { val: 'picked_up', label: 'Diambil', icon: '📦' },
  { val: 'completed', label: 'Selesai', icon: '🎉' },
  { val: 'cancelled', label: 'Dibatalkan', icon: '🚫' },
  // Pre-order filters
  { val: 'preorder_pending', label: 'Pre-Order', icon: '📦' },
  { val: 'preorder_confirmed', label: 'PO Dikonfirmasi', icon: '✔️' },
  { val: 'preorder_rejected', label: 'PO Ditolak', icon: '❌' },
];

const ITEMS_PER_PAGE = 10;

export default function AdminOrders() {
  const { orders, members, updateOrderStatus, updateOrderEvidence } = useApp();
  const [detail, setDetail] = useState<Order | null>(null);
  const [filter, setFilter] = useState<OrderStatus | 'all'>('all');
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  
  // Confirm modal state
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    onConfirm: (reason?: string) => void;
    requireReason: boolean;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    requireReason: false
  });

  const waitingPayment = orders.filter(o => o.status === 'waiting_payment' || o.status === 'pending' || o.status === 'preorder_pending');

  const filtered = useMemo(() => {
    return orders.filter(o =>
      (filter === 'all' || o.status === filter) &&
      (o.code.toLowerCase().includes(search.toLowerCase()) ||
       o.customerName.toLowerCase().includes(search.toLowerCase()))
    );
  }, [orders, filter, search]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filtered.slice(start, start + ITEMS_PER_PAGE);
  }, [filtered, currentPage]);

  const handleFilterChange = (newFilter: OrderStatus | 'all') => {
    setFilter(newFilter);
    setCurrentPage(1);
  };

  const isMember = (customerName: string, memberId: number | null) => {
    if (memberId) return true;
    return members.some(m => m.name.toLowerCase() === customerName.toLowerCase());
  };

  // Handlers for cancel/reject actions
  const handleCancelOrder = (order: Order) => {
    setConfirmModal({
      isOpen: true,
      title: 'Batalkan Pesanan',
      message: `Apakah Anda yakin ingin membatalkan pesanan ${order.code}?`,
      confirmLabel: 'Batal',
      requireReason: true,
      onConfirm: (reason) => {
        updateOrderStatus(order.id, 'cancelled');
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const handleRejectPreorder = (order: Order) => {
    setConfirmModal({
      isOpen: true,
      title: 'Tolak Pre-Order',
      message: `Apakah Anda yakin ingin menolak pre-order ${order.code}?`,
      confirmLabel: 'Tolak',
      requireReason: true,
      onConfirm: (reason) => {
        updateOrderStatus(order.id, 'preorder_rejected');
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

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
              onClick={() => handleFilterChange(f.val as typeof filter)}
            >
              <span>{f.icon}</span>
              <span>{f.val === 'all' 
                ? `${f.label} (${orders.length})` 
                : `${f.label} (${orders.filter(o => o.status === f.val).length})`
              }</span>
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📋</div>
            <div>Tidak ada pesanan</div>
          </div>
        ) : (
          <>
            {/* Orders as Cards */}
            <div className="orders-card-grid">
              {paginatedOrders.map(o => {
                const member = isMember(o.customerName, o.memberId);
                return (
                  <div 
                    key={o.id} 
                    className="order-card"
                    onClick={() => setDetail(o)}
                  >
                    <div className="order-card-header">
                      <span className="order-card-code">{o.code}</span>
                      <span 
                        className="order-card-status"
                        style={{ background: getStatusColor(o.status) }}
                      >
                        {getStatusLabel(o.status)}
                      </span>
                    </div>
                    
                    <div className="order-card-customer">
                      <span className="order-card-name">{o.customerName}</span>
                      {member && <span className="order-card-badge-member">MEMBER</span>}
                    </div>
                    
                    <div className="order-card-details">
                      <div className="order-card-type">
                        {orderTypeLabel(o.orderType, o.tableNo)}
                        {o.isPreOrder && <span className="order-card-badge-preorder">PRE-ORDER</span>}
                      </div>
                      <div className="order-card-time">
                        {new Date(o.createdAt).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })}
                      </div>
                    </div>
                    
                    <div className="order-card-footer">
                      <div className="order-card-total">{formatCurrency(o.total)}</div>
                      <div className="order-card-actions" onClick={e => e.stopPropagation()}>
                        {(o.status === 'pending' || o.status === 'waiting_payment') && (
                          <>
                            <button className="btn btn-green btn-sm" onClick={() => updateOrderStatus(o.id, 'paid')}>💳 Bayar</button>
                            <button className="btn btn-danger btn-sm" onClick={() => handleCancelOrder(o)}>❌ Batal</button>
                          </>
                        )}
                        {o.status === 'paid' && (
                          <button className="btn btn-blue btn-sm" onClick={() => updateOrderStatus(o.id, 'processing')}>👨‍🍳 Proses</button>
                        )}
                        {o.status === 'processing' && (
                          <button className="btn btn-green btn-sm" onClick={() => updateOrderStatus(o.id, 'ready')}>🍽️ Siap</button>
                        )}
                        {o.status === 'ready' && o.orderType === 'pickup' && (
                          <button className="btn btn-green btn-sm" onClick={() => updateOrderStatus(o.id, 'picked_up')}>📦 Ambil</button>
                        )}
                        {(o.status === 'ready' || o.status === 'picked_up') && (
                          <button className="btn btn-green btn-sm" onClick={() => updateOrderStatus(o.id, 'completed')}>🎉 Selesai</button>
                        )}
                        {o.status === 'preorder_pending' && (
                          <>
                            <button className="btn btn-green btn-sm" onClick={() => updateOrderStatus(o.id, 'preorder_confirmed')}>✔️ Konfirmasi</button>
                            <button className="btn btn-danger btn-sm" onClick={() => handleRejectPreorder(o)}>❌ Tolak</button>
                          </>
                        )}
                        {o.status === 'preorder_confirmed' && (
                          <button className="btn btn-green btn-sm" onClick={() => updateOrderStatus(o.id, 'completed')}>🎉 Selesai</button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
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

      {detail && (
        <OrderDetailModal
          order={detail}
          onClose={() => setDetail(null)}
          onUpdateStatus={(id, status) => { updateOrderStatus(id, status); setDetail(null); }}
          onUpdateEvidence={(id, photo) => { updateOrderEvidence(id, photo); }}
        />
      )}

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmLabel={confirmModal.confirmLabel}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        requireReason={confirmModal.requireReason}
      />
    </>
  );
}
