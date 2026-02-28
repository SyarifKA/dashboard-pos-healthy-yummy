'use client';
import { useState, useRef } from 'react';
import { useApp } from '../../lib/AppContext';
import type { MenuItem, Category } from '../../types';

export default function AdminMenu() {
  const { menuItems, addMenuItem, updateMenuItem, deleteMenuItem } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<MenuItem | null>(null);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<Category | 'all'>('all');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    category: 'food' as Exclude<Category, 'all'>,
    price: '',
    emoji: '',
    desc: '',
    stock: '10',
    isAvailable: true,
    image: '',
  });

  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const openAddModal = () => {
    setEditItem(null);
    setFormData({
      name: '',
      category: 'food',
      price: '',
      emoji: '',
      desc: '',
      stock: '10',
      isAvailable: true,
      image: '',
    });
    setShowModal(true);
  };

  const openEditModal = (item: MenuItem) => {
    setEditItem(item);
    setFormData({
      name: item.name,
      category: item.category,
      price: item.price.toString(),
      emoji: item.emoji,
      desc: item.desc,
      stock: item.stock.toString(),
      isAvailable: item.isAvailable ?? true,
      image: item.image ?? '',
    });
    setShowModal(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setFormData({ ...formData, image: '' });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const price = parseInt(formData.price);
    const stock = parseInt(formData.stock);

    if (editItem) {
      updateMenuItem(editItem.id, {
        name: formData.name,
        category: formData.category,
        price,
        emoji: formData.emoji,
        desc: formData.desc,
        stock,
        isAvailable: formData.isAvailable,
        image: formData.image || undefined,
      });
    } else {
      addMenuItem({
        name: formData.name,
        category: formData.category,
        price,
        emoji: formData.emoji,
        desc: formData.desc,
        stock,
        isAvailable: formData.isAvailable,
        image: formData.image || undefined,
      });
    }
    setShowModal(false);
  };

  const handleDelete = (id: number) => {
    if (confirm('Apakah Anda yakin ingin menghapus menu ini?')) {
      deleteMenuItem(id);
    }
  };

  const toggleAvailability = (item: MenuItem) => {
    updateMenuItem(item.id, { isAvailable: !item.isAvailable });
  };

  return (
    <>
      <div className="topbar">
        <div className="topbar-title">🍜 Kelola Menu</div>
        <div className="topbar-right admin-menu-filters">
          <div className="search-wrap">
            <input 
              className="search-input" 
              placeholder="Cari menu..." 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
            />
          </div>
          <select
            className="select-input"
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value as Category | 'all')}
            style={{ width: 'auto', minWidth: 140 }}
          >
            <option value="all">Semua</option>
            <option value="food">Makanan</option>
            <option value="drink">Minuman</option>
          </select>
          <button className="btn btn-primary btn-sm" onClick={openAddModal}>+ Tambah Menu</button>
        </div>
      </div>

      <div className="page-content">
        <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div className="section-title" style={{ marginBottom: 0 }}>Total {filteredItems.length} Menu</div>
        </div>

        {filteredItems.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🍜</div>
            <div style={{ fontSize: 15, fontWeight: 700 }}>Tidak ada menu</div>
            <button className="btn btn-primary" style={{ marginTop: 14 }} onClick={openAddModal}>+ Tambah Menu</button>
          </div>
        ) : (
          <div className="menu-grid2">
            {filteredItems.map(item => (
              <AdminMenuCard 
                key={item.id} 
                item={item} 
                onEdit={() => openEditModal(item)}
                onToggle={() => toggleAvailability(item)}
                onDelete={() => handleDelete(item.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowModal(false); }}>
          <div className="modal" style={{ maxWidth: 480 }}>
            <div className="modal-head">
              <div className="modal-title">{editItem ? '✏️ Edit Menu' : '➕ Tambah Menu Baru'}</div>
              <button className="btn-icon" onClick={() => setShowModal(false)}>✕</button>
            </div>
            
            <form onSubmit={handleSubmit} className="modal-body">
              {/* Image Upload */}
              <div className="form-group">
                <label className="form-label">Foto Menu</label>
                <div className="menu-image-upload">
                  {formData.image ? (
                    <div className="menu-image-preview">
                      <img src={formData.image} alt="Preview" />
                      <button type="button" className="menu-image-remove" onClick={handleRemoveImage}>✕</button>
                    </div>
                  ) : (
                    <div className="menu-image-placeholder" onClick={() => fileInputRef.current?.click()}>
                      <span className="menu-image-icon">📷</span>
                      <span className="menu-image-text">Klik untuk upload foto</span>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    style={{ display: 'none' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Nama Menu *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="form-input"
                    placeholder="Contoh: Nasi Goreng"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Emoji *</label>
                  <input
                    type="text"
                    required
                    value={formData.emoji}
                    onChange={e => setFormData({ ...formData, emoji: e.target.value })}
                    className="form-input"
                    placeholder="🍜"
                    style={{ textAlign: 'center', fontSize: 20 }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Kategori *</label>
                  <select
                    required
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value as 'food' | 'drink' })}
                    className="form-select"
                  >
                    <option value="food">🍔 Makanan</option>
                    <option value="drink">🥤 Minuman</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Harga (Rp) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.price}
                    onChange={e => setFormData({ ...formData, price: e.target.value })}
                    className="form-input"
                    placeholder="25000"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Deskripsi</label>
                <textarea
                  value={formData.desc}
                  onChange={e => setFormData({ ...formData, desc: e.target.value })}
                  className="form-textarea"
                  rows={2}
                  placeholder="Deskripsi menu..."
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Stok</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.stock}
                    onChange={e => setFormData({ ...formData, stock: e.target.value })}
                    className="form-input"
                    placeholder="10"
                  />
                </div>

                <div className="form-group" style={{ display: 'flex', alignItems: 'center', paddingTop: 24 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={formData.isAvailable}
                      onChange={e => setFormData({ ...formData, isAvailable: e.target.checked })}
                      style={{ width: 'auto' }}
                    />
                    <span style={{ fontWeight: 500 }}>Tersedia</span>
                  </label>
                </div>
              </div>

              <div className="modal-foot">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setShowModal(false)}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  {editItem ? '💾 Simpan Perubahan' : '➕ Tambah Menu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        .menu-image-upload {
          position: relative;
        }
        .menu-image-preview {
          position: relative;
          width: 100%;
          height: 160px;
          border-radius: 8px;
          overflow: hidden;
          border: 2px dashed var(--border-color, #e5e7eb);
        }
        .menu-image-preview img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .menu-image-remove {
          position: absolute;
          top: 8px;
          right: 8px;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: rgba(220, 38, 38, 0.9);
          color: white;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          font-family: 'Plus Jakarta Sans', sans-serif;
        }
        .menu-image-placeholder {
          width: 100%;
          height: 120px;
          border: 2px dashed var(--border-color, #e5e7eb);
          border-radius: 8px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
          background: var(--bg-secondary, #f9fafb);
          font-family: 'Plus Jakarta Sans', sans-serif;
        }
        .menu-image-placeholder:hover {
          border-color: var(--primary-color, #16a34a);
          background: var(--accent-bg, #f0fdf4);
        }
        .menu-image-icon {
          font-size: 32px;
          margin-bottom: 8px;
        }
        .menu-image-text {
          font-size: 13px;
          color: #6b7280;
        }
      `}</style>
    </>
  );
}

// Admin Menu Card Component - using same styles as POS MenuCard
function AdminMenuCard({ 
  item, 
  onEdit, 
  onToggle, 
  onDelete 
}: { 
  item: MenuItem; 
  onEdit: () => void;
  onToggle: () => void;
  onDelete: () => void;
}) {
  const isUnavailable = item.isAvailable === false;

  return (
    <div className={`menu-card2${isUnavailable ? ' unavailable' : ''}`}>
      <div className="menu-photo-area">
        {item.image ? (
          <div className="menu-img-wrap">
            <img 
              src={item.image} 
              alt={item.name} 
              className="menu-img"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
        ) : (
          <div className="menu-img-placeholder">
            <span className="menu-img-emoji">{item.emoji}</span>
          </div>
        )}
        {isUnavailable && <div className="menu-unavail-overlay"><span>Habis</span></div>}
      </div>

      <div className="menu-card2-body">
        <div className="menu-card2-name">{item.name}</div>
        <div className="menu-card2-desc">{item.desc}</div>
        <div className="menu-card2-footer">
          <div className="menu-card2-price">Rp {item.price.toLocaleString('id-ID')}</div>
          <span className={`badge badge-${item.category === 'food' ? 'orange' : 'blue'}`}>
            {item.category === 'food' ? 'Makanan' : 'Minuman'}
          </span>
        </div>
        <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 8, marginTop: 4, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Stok: {item.stock}</div>
        
        {/* Action Buttons */}
        <div className="admin-card-actions">
          <button
            className="admin-action-btn admin-edit-btn"
            onClick={(e) => { e.stopPropagation(); onEdit(); }}
          >
            ✏️
          </button>
          <button
            className={`admin-action-btn ${isUnavailable ? 'admin-enable-btn' : 'admin-disable-btn'}`}
            onClick={(e) => { e.stopPropagation(); onToggle(); }}
          >
            {isUnavailable ? '✓' : '⏸'}
          </button>
          <button
            className="admin-action-btn admin-delete-btn"
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
          >
            🗑️
          </button>
        </div>
      </div>
    </div>
  );
}
