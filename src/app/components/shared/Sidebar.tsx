'use client';
import { useRouter, usePathname } from 'next/navigation';
import { useTheme } from '../../lib/ThemeContext';
import { useApp } from '../../lib/AppContext';

const ADMIN_NAV = [
  { key: '/admin',          icon: '📊', label: 'Dashboard' },
  { key: '/admin/orders',   icon: '📋', label: 'Pesanan' },
  { key: '/admin/menu',     icon: '🍜', label: 'Menu' },
  { key: '/admin/members',  icon: '👥', label: 'Pelanggan' },
  { key: '/admin/settings',  icon: '⚙️', label: 'Pengaturan' },
];

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { theme, toggle } = useTheme();
  const { orders } = useApp();

  const pendingCount = orders?.filter(o => o.status === 'pending')?.length ?? 0;

  return (
    <nav className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="logo-icon">🥗</div>
        <div className="logo-text">
          <div className="logo-name">Healthy Yummy</div>
          <div className="logo-tagline">Admin Panel</div>
        </div>
      </div>

      <div className="sidebar-section">Admin</div>

      {ADMIN_NAV.map(item => (
        <button
          key={item.key}
          className={`nav-btn ${pathname === item.key ? 'active' : ''}`}
          onClick={() => router.push(item.key)}
        >
          <span className="nicon">{item.icon}</span>
          <span>{item.label}</span>
          {item.key === '/admin/orders' && pendingCount > 0 && (
            <span className="nav-badge">{pendingCount}</span>
          )}
        </button>
      ))}

      {/* Footer */}
      <div className="sidebar-footer">
        <button className="theme-toggle-btn" onClick={toggle}>
          <span>{theme === 'dark' ? '☀️' : '🌙'}</span>
          <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
        </button>
      </div>
    </nav>
  );
}
