'use client';
import { useState, useMemo } from 'react';
import { useApp } from '../../lib/AppContext';
import { formatCurrency, orderTypeLabel, getStatusLabel, getStatusColor } from '../../lib/constants';
import type { Order } from '../../types';
import OrderDetailModal from './OrderDetailModal';
import ConfirmModal from '../shared/ConfirmModal';

export default function AdminDashboard() {
  const { orders, members, menuItems, updateOrderStatus } = useApp();
  const [detail, setDetail] = useState<Order | null>(null);

  // Confirm modal state
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    onConfirm: () => void;
    requireReason: boolean;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    requireReason: false
  });

  // Stats
  const stats = useMemo(() => {
    const today = new Date().toDateString();
    const todayOrders = orders.filter(o => new Date(o.createdAt).toDateString() === today);
    const todayRevenue = todayOrders
      .filter(o => o.status !== 'cancelled' && o.status !== 'preorder_rejected')
      .reduce((sum, o) => sum + o.total, 0);
    const pendingOrders = orders.filter(o => 
      o.status === 'waiting_payment' || 
      o.status === 'pending' || 
      o.status === 'preorder_pending'
    ).length;
    const activeMembers = members.length;
    const menuCount = menuItems.filter(m => m.isAvailable).length;
    return { todayOrders: todayOrders.length, todayRevenue, pendingOrders, activeMembers, menuCount };
  }, [orders, members, menuItems]);

  // Recent orders (last 10)
  const recentOrders = useMemo(() => {
    return [...orders]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10);
  }, [orders]);

  const isMember = (customerName: string, memberId: number | null) => {
    if (memberId) return true;
    return members.some(m => m.name.toLowerCase() === customerName.toLowerCase());
  };

  // Handler for reject preorder
  const handleRejectPreorder = (order: Order) => {
    setConfirmModal({
      isOpen: true,
      title: 'Tolak Pre-Order',
      message: `Apakah Anda yakin ingin menolak pre-order ${order.code}?`,
      confirmLabel: 'Tolak',
      requireReason: true,
      onConfirm: () => {
        updateOrderStatus(order.id, 'preorder_rejected');
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  return (
    <>
      <div className="topbar">
        <div className="topbar-title">📊 Dashboard</div>
      </div>

      <div className="page-content">
        {/* Stats Cards */}
        <div className="stats-grid" style={{ marginBottom: 24 }}>
          <div className="stat-card">
            <div className="stat-label">📋 Pesanan Hari Ini</div>
            <div className="stat-value">{stats.todayOrders}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">💰 Pendapatan Hari Ini</div>
            <div className="stat-value" style={{ color: 'var(--green)' }}>{formatCurrency(stats.todayRevenue)}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">⏳ Menunggu Pembayaran</div>
            <div className="stat-value" style={{ color: 'var(--amber)' }}>{stats.pendingOrders}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">👥 Member Aktif</div>
            <div className="stat-value" style={{ color: 'var(--blue)' }}>{stats.activeMembers}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">🍽️ Menu Tersedia</div>
            <div className="stat-value" style={{ color: 'var(--purple)' }}>{stats.menuCount}</div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="section">
          <div className="section-title">📋 Pesanan Terbaru</div>
          
          {recentOrders.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📋</div>
              <div>Belum ada pesanan</div>
            </div>
          ) : (
            <div className="orders-card-grid">
              {recentOrders.map(o => {
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
                          </>
                        )}
                        {o.status === 'paid' && (
                          <button className="btn btn-blue btn-sm" onClick={() => updateOrderStatus(o.id, 'processing')}>👨‍🍳 Proses</button>
                        )}
                        {o.status === 'processing' && (
                          <button className="btn btn-green btn-sm" onClick={() => updateOrderStatus(o.id, 'ready')}>🍽️ Siap</button>
                        )}
                        {o.status === 'ready' && (
                          <button className="btn btn-green btn-sm" onClick={() => updateOrderStatus(o.id, 'completed')}>🎉 Selesai</button>
                        )}
                        {o.status === 'preorder_pending' && (
                          <>
                            <button className="btn btn-green btn-sm" onClick={() => updateOrderStatus(o.id, 'preorder_confirmed')}>✔️ Konfirmasi</button>
                            <button className="btn btn-danger btn-sm" onClick={() => handleRejectPreorder(o)}>❌ Tolak</button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {detail && (
        <OrderDetailModal
          order={detail}
          onClose={() => setDetail(null)}
          onUpdateStatus={(id, status) => { updateOrderStatus(id, status); setDetail(null); }}
          onUpdateEvidence={(id, photo) => { }}
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
