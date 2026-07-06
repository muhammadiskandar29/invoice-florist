'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import styles from './SidebarLayout.module.css';

export default function SidebarLayout({ children, currentView, onViewChange, onNewInvoice }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    sessionStorage.removeItem('isLoggedIn');
    router.replace('/');
  };

  const navItems = [
    { id: 'dashboard', name: '📊 Dashboard', active: currentView === 'dashboard' },
    { id: 'form', name: '📋 Invoice Generator', active: currentView === 'form' || currentView === 'preview' },
    { id: 'history', name: '📜 Riwayat Invoice', active: currentView === 'history' },
    { id: 'produk', name: '🌸 Kelola Produk', disabled: true, badge: 'Nanti' },
    { id: 'pelanggan', name: '👥 Data Pelanggan', disabled: true, badge: 'Nanti' },
    { id: 'laporan', name: '📊 Laporan Penjualan', disabled: true, badge: 'Nanti' },
    { id: 'pengaturan', name: '⚙️ Pengaturan', disabled: true, badge: 'Nanti' },
  ];

  return (
    <div className={styles.layoutContainer}>
      {/* ── MOBILE HEADER ── */}
      <header className={styles.mobileHeader}>
        <button 
          className={styles.hamburgerBtn} 
          onClick={() => setIsOpen(true)}
          aria-label="Buka Menu"
        >
          ☰
        </button>
        <div className={styles.mobileBrand}>
          <span>🌹</span>
          <span className="font-script">RiaFlorist</span>
        </div>
      </header>

      {/* ── BACKDROP (MOBILE ONLY) ── */}
      {isOpen && (
        <div 
          className={styles.backdrop} 
          onClick={() => setIsOpen(false)} 
          aria-hidden="true"
        />
      )}

      {/* ── SIDEBAR ── */}
      <aside className={`${styles.sidebar} ${isOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.sidebarHeader}>
          <div className={styles.brand}>
            <span className={styles.brandIcon}>🌹</span>
            <span className={`${styles.brandText} font-script`}>RiaFlorist</span>
          </div>
          <button 
            className={styles.closeBtn} 
            onClick={() => setIsOpen(false)}
            aria-label="Tutup Menu"
          >
            ✕
          </button>
        </div>

        <nav className={styles.navigation}>
          {navItems.map((item, idx) => (
            <div key={idx} className={styles.navItemWrapper}>
              {item.disabled ? (
                <div className={`${styles.navItem} ${styles.disabled}`}>
                  <span className={styles.navLinkText}>{item.name}</span>
                  {item.badge && <span className={styles.badge}>{item.badge}</span>}
                </div>
              ) : (
                <button
                  className={`${styles.navItem} ${item.active ? styles.active : ''}`}
                  onClick={() => {
                    if (item.id === 'form' && onNewInvoice) {
                      onNewInvoice();
                    } else if (onViewChange) {
                      onViewChange(item.id);
                    }
                    setIsOpen(false);
                  }}
                >
                  <span className={styles.navLinkText}>{item.name}</span>
                </button>
              )}
            </div>
          ))}
        </nav>

        <div className={styles.sidebarFooter}>
          <button className={styles.logoutBtn} onClick={handleLogout}>
            <span>🚪</span> Keluar
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <main className={styles.mainContent}>
        {children}
      </main>
    </div>
  );
}
