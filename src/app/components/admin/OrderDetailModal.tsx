'use client';
import { useState, useRef } from 'react';
import { formatCurrency, orderTypeLabel, getStatusLabel, getStatusColor } from '../../lib/constants';
import type { Order, OrderStatus } from '../../types';

interface Props {
  order: Order;
  onClose: () => void;
  onUpdateStatus: (id: number, status: OrderStatus) => void;
  onUpdateEvidence?: (id: number, evidencePhoto: string) => void;
}

export default function OrderDetailModal({ order, onClose, onUpdateStatus, onUpdateEvidence }: Props) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const nextStatus: Record<OrderStatus, OrderStatus | null> = {
    pending: 'paid',
    waiting_payment: 'paid',
    // Untuk pickup: paid -> processing -> ready -> picked_up
    // Untuk dine-in/takeaway: paid -> processing -> ready
    paid: 'processing',
    processing: 'ready',
    ready: order.orderType === 'pickup' ? 'picked_up' : 'completed',
    picked_up: 'completed',
    out_for_delivery: 'picked_up',
    completed: null,
    cancelled: null,
  };

  const nextLabel = nextStatus[order.status];

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onUpdateEvidence) return;

    setUploading(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      onUpdateEvidence(order.id, reader.result as string);
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal">
        <div className="modal-head">
          <div className="modal-title">📋 Detail Pesanan</div>
          <button className="btn-icon" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          {/* Code + status */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="booking-code" style={{ fontSize: 22, padding: '10px 18px' }}>{order.code}</div>
            <span 
              style={{ 
                background: getStatusColor(order.status),
                color: 'white',
                padding: '6px 12px',
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 600
              }}
            >
              {getStatusLabel(order.status)}
            </span>
          </div>

          {/* Info */}
          <div style={{ background: 'var(--surface2)', borderRadius: 12, padding: 14, border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 9 }}>
            {[
              { l: 'Pelanggan',   v: order.customerName },
              { l: 'Tipe',        v: orderTypeLabel(order.orderType, order.tableNo) },
              { l: 'Pembayaran',  v: order.payment.toUpperCase() },
              { l: 'Waktu',       v: new Date(order.createdAt).toLocaleString('id-ID') },
              ...(order.notes ? [{ l: 'Catatan', v: order.notes }] : []),
            ].map(r => (
              <div key={r.l} style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                <span style={{ color: 'var(--text2)', fontSize: 13 }}>{r.l}</span>
                <span style={{ fontWeight: 700, fontSize: 13, textAlign: 'right' }}>{r.v}</span>
              </div>
            ))}
          </div>

          {/* Items */}
          <div>
            <div className="form-label" style={{ marginBottom: 10 }}>Item Pesanan ({order.items.length})</div>
            {order.items.map(item => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontSize: 13 }}>{item.emoji} {item.name} ×{item.qty}</span>
                <span style={{ fontSize: 13, fontWeight: 700 }}>{formatCurrency(item.price * item.qty)}</span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 12, alignItems: 'center' }}>
              <span style={{ fontWeight: 800, fontSize: 14 }}>Total</span>
              <span style={{ fontFamily: 'Playfair Display,serif', fontSize: 22, fontWeight: 800, color: 'var(--accent)' }}>
                {formatCurrency(order.total)}
              </span>
            </div>
          </div>

          {/* Evidence Photo for Pickup Orders - show when order is ready or picked_up */}
          {(order.orderType === 'pickup' && (order.status === 'ready' || order.status === 'picked_up' || order.status === 'completed')) && (
            <div style={{ marginTop: 16 }}>
              <div className="form-label" style={{ marginBottom: 10 }}>📸 Foto Bukti Pengantaran</div>
              {order.evidencePhoto ? (
                <div style={{ textAlign: 'center' }}>
                  <img 
                    src={order.evidencePhoto} 
                    alt="Bukti Pengantaran" 
                    style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: 8 }}
                  />
                  {order.status !== 'completed' && onUpdateEvidence && (
                    <button 
                      className="btn btn-ghost btn-sm" 
                      style={{ marginTop: 8 }}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Ganti Foto
                    </button>
                  )}
                </div>
              ) : (
                <div 
                  style={{ 
                    border: '2px dashed var(--border)', 
                    borderRadius: 12, 
                    padding: 20, 
                    textAlign: 'center',
                    cursor: onUpdateEvidence ? 'pointer' : 'default'
                  }}
                  onClick={() => onUpdateEvidence && fileInputRef.current?.click()}
                >
                  <div style={{ fontSize: 32, marginBottom: 8 }}>📷</div>
                  <div style={{ color: 'var(--text2)', fontSize: 13 }}>
                    {uploading ? 'Mengupload...' : 'Klik untuk upload foto bukti'}
                  </div>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handlePhotoUpload}
              />
            </div>
          )}
        </div>
        <div className="modal-foot">
          <button className="btn btn-ghost" onClick={onClose}>Tutup</button>
          {nextLabel && (
            <button 
              className="btn btn-green" 
              onClick={() => onUpdateStatus(order.id, nextLabel)}
            >
              {nextLabel === 'paid' ? '✓ Tandai Lunas' : 
               nextLabel === 'processing' ? '👨‍🍳 Proses Sekarang' : 
               nextLabel === 'ready' ? '✓ Tandai Siap' :
               nextLabel === 'picked_up' ? '✓ Tandai Diambil' :
               nextLabel === 'completed' ? '✓ Selesai' :
               'Lanjut'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
