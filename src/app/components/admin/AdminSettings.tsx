'use client';
import { useApp } from '../../lib/AppContext';
import { useTheme } from '../../lib/ThemeContext';

export default function AdminSettings() {
  const { tableCount, setTableCount } = useApp();
  const { theme, toggle } = useTheme();

  return (
    <>
      <div className="topbar">
        <div className="topbar-title">⚙️ Pengaturan</div>
      </div>

      <div className="page-content">
        <div style={{ maxWidth: 520, display: 'flex', flexDirection: 'column', gap: 18 }}>

          {/* Table settings */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
              <div style={{ fontSize: 24 }}>🪑</div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 15, color: 'var(--text)' }}>Pengaturan Meja Dine In</div>
                <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 2 }}>Atur jumlah meja yang tersedia</div>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Jumlah Meja</label>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <button className="btn btn-ghost" onClick={() => setTableCount(Math.max(1, tableCount - 1))}>−</button>
                <span style={{ fontFamily: 'Playfair Display,serif', fontSize: 32, fontWeight: 800, width: 60, textAlign: 'center', color: 'var(--text)' }}>
                  {tableCount}
                </span>
                <button className="btn btn-ghost" onClick={() => setTableCount(tableCount + 1)}>+</button>
                <span style={{ color: 'var(--text2)', fontSize: 13 }}>meja</span>
              </div>
            </div>
            <div style={{ marginTop: 16 }}>
              <div className="form-label" style={{ marginBottom: 10 }}>Preview Layout Meja</div>
              <div className="table-grid">
                {Array.from({ length: tableCount }, (_, i) => i + 1).map(n => (
                  <div key={n} style={{
                    padding: '8px 4px', background: 'var(--surface2)',
                    borderRadius: 8, textAlign: 'center',
                    fontSize: 11, border: '1px solid var(--border)',
                    fontWeight: 700, color: 'var(--text2)',
                  }}>
                    🪑 {n}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Appearance */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{ fontSize: 24 }}>🎨</div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 15, color: 'var(--text)'}}>Tampilan</div>
                <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 2 }}>Sesuaikan tema aplikasi</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>Mode {theme === 'dark' ? 'Gelap (Dark)' : 'Terang (Light – Pink)'}</div>
                <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 2 }}>
                  {theme === 'dark' ? 'Tampilan gelap untuk penggunaan malam' : 'Tampilan pink cerah yang segar'}
                </div>
              </div>
              <button className="btn btn-ghost" onClick={toggle}>
                {theme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode'}
              </button>
            </div>
          </div>

          {/* Info */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{ fontSize: 24 }}>🏪</div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 15, color: 'var(--text)' }}>Info Merchant</div>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, color: 'var(--text)' }}>
              {[
                { l: 'Nama Merchant', v: 'Healthy Yummy' },
                { l: 'Admin PIN', v: '••••  (1234)' },
                { l: 'Versi App', v: '1.0.0' },
              ].map(r => (
                <div key={r.l} style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text2)', fontSize: 13 }}>{r.l}</span>
                  <span style={{ fontWeight: 700, fontSize: 13 }}>{r.v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
