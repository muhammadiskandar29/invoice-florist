'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import styles from './SidebarLayout.module.css';

export default function SidebarLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    sessionStorage.removeItem('isLoggedIn');
    router.replace('/');
  };

  const navItems = [
    { name: '📋 Invoice Generator', path: '/invoice', active: pathname === '/invoice' },
    { name: '🌸 Kelola Produk', path: '#', active: false, disabled: true, badge: 'Nanti' },
    { name: '👥 Data Pelanggan', path: '#', active: false, disabled: true, badge: 'Nanti' },
    { name: '📊 Laporan Penjualan', path: '#', active: false, disabled: true, badge: 'Nanti' },
    { name: '⚙️ Pengaturan', path: '#', active: false, disabled: true, badge: 'Nanti' },
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
                    router.push(item.path);
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
