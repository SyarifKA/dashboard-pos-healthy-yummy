'use client';
import Sidebar from '../..../../components/shared/Sidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main">
        {children}
      </div>
    </div>
  );
}
