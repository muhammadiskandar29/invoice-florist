'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import styles from './SidebarLayout.module.css';

const ICONS = {
  dashboard: (
    <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <rect x="3" y="3" width="7" height="9"></rect>
      <rect x="14" y="3" width="7" height="5"></rect>
      <rect x="14" y="12" width="7" height="9"></rect>
      <rect x="3" y="16" width="7" height="5"></rect>
    </svg>
  ),
  form: (
    <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
      <polyline points="14 2 14 8 20 8"></polyline>
      <line x1="16" y1="13" x2="8" y2="13"></line>
      <line x1="16" y1="17" x2="8" y2="17"></line>
    </svg>
  ),
  history: (
    <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <line x1="8" y1="6" x2="21" y2="6"></line>
      <line x1="8" y1="12" x2="21" y2="12"></line>
      <line x1="8" y1="18" x2="21" y2="18"></line>
      <line x1="3" y1="6" x2="3.01" y2="6"></line>
      <line x1="3" y1="12" x2="3.01" y2="12"></line>
      <line x1="3" y1="18" x2="3.01" y2="18"></line>
    </svg>
  ),
  produk: (
    <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
      <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
      <line x1="12" y1="22.08" x2="12" y2="12"></line>
    </svg>
  ),
  pelanggan: (
    <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
      <circle cx="9" cy="7" r="4"></circle>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
    </svg>
  ),
  laporan: (
    <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <line x1="18" y1="20" x2="18" y2="10"></line>
      <line x1="12" y1="20" x2="12" y2="4"></line>
      <line x1="6" y1="20" x2="6" y2="14"></line>
    </svg>
  ),
  pengaturan: (
    <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <circle cx="12" cy="12" r="3"></circle>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
    </svg>
  ),
  logout: (
    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
      <polyline points="16 17 21 12 16 7"></polyline>
      <line x1="21" y1="12" x2="9" y2="12"></line>
    </svg>
  ),
  brand: (
    <svg viewBox="0 0 24 24" width="20" height="20" stroke="var(--green-500)" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
      <path d="M2 17l10 5 10-5"></path>
      <path d="M2 12l10 5 10-5"></path>
    </svg>
  ),
  close: (
    <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  )
};

export default function SidebarLayout({ children, currentView, onViewChange, onNewInvoice }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('loginExpiry');
    router.replace('/');
  };

  const navItems = [
    { id: 'dashboard', name: 'Dashboard', iconKey: 'dashboard', active: currentView === 'dashboard' },
    { id: 'form', name: 'Invoice Generator', iconKey: 'form', active: currentView === 'form' || currentView === 'preview' },
    { id: 'history', name: 'Riwayat Invoice', iconKey: 'history', active: currentView === 'history' },
    { id: 'produk', name: 'Kelola Produk', iconKey: 'produk', disabled: true, badge: 'Coming Soon' },
    { id: 'pelanggan', name: 'Data Pelanggan', iconKey: 'pelanggan', disabled: true, badge: 'Coming Soon' },
    { id: 'laporan', name: 'Laporan Penjualan', iconKey: 'laporan', disabled: true, badge: 'Coming Soon' },
    { id: 'pengaturan', name: 'Pengaturan', iconKey: 'pengaturan', disabled: true, badge: 'Coming Soon' },
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
        <div className={styles.mobileBrand} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {ICONS.brand}
          <span className="font-script" style={{ fontSize: '18px', fontWeight: 'bold' }}>RiaFlorist</span>
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
          <div className={styles.brand} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {ICONS.brand}
            <span className={`${styles.brandText} font-script`} style={{ fontWeight: 'bold' }}>RiaFlorist</span>
          </div>
          <button 
            className={styles.closeBtn} 
            onClick={() => setIsOpen(false)}
            aria-label="Tutup Menu"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            {ICONS.close}
          </button>
        </div>

        <nav className={styles.navigation}>
          {navItems.map((item, idx) => (
            <div key={idx} className={styles.navItemWrapper}>
              {item.disabled ? (
                <div className={`${styles.navItem} ${styles.disabled}`} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {ICONS[item.iconKey]}
                  <span className={styles.navLinkText}>{item.name}</span>
                  {item.badge && <span className={styles.badge}>{item.badge}</span>}
                </div>
              ) : (
                <button
                  className={`${styles.navItem} ${item.active ? styles.active : ''}`}
                  style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', textAlign: 'left' }}
                  onClick={() => {
                    if (item.id === 'form' && onNewInvoice) {
                      onNewInvoice();
                    } else if (onViewChange) {
                      onViewChange(item.id);
                    }
                    setIsOpen(false);
                  }}
                >
                  {ICONS[item.iconKey]}
                  <span className={styles.navLinkText}>{item.name}</span>
                </button>
              )}
            </div>
          ))}
        </nav>

        <div className={styles.sidebarFooter}>
          <button className={styles.logoutBtn} onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', justifyContent: 'center' }}>
            {ICONS.logout} Keluar
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
