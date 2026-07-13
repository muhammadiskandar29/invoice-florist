'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './login.module.css';



export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
      const expiry = parseInt(localStorage.getItem('loginExpiry') || '0', 10);
      if (isLoggedIn && Date.now() < expiry) {
        router.replace('/invoice');
      } else {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('loginExpiry');
      }
    }
  }, [router]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: username.trim(), password }),
      });

      const json = await response.json();
      if (json.success) {
        localStorage.setItem('isLoggedIn', 'true');
        // Set expiry to 24 hours from now
        localStorage.setItem('loginExpiry', String(Date.now() + 24 * 60 * 60 * 1000));
        router.push('/invoice');
      } else {
        setError(json.error || 'Username atau password salah. Coba lagi.');
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      setError('Gagal menghubungi server. Silakan coba lagi.');
      setLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className={styles.loginPage}>
      <div className={styles.bgDecor} aria-hidden="true">
        <div className={styles.bgOrb1} />
        <div className={styles.bgOrb2} />
        <div className={styles.bgOrb3} />
        <div className={styles.floatingPetal} style={{ top: '15%', left: '10%', animationDelay: '0s' }}>🌸</div>
        <div className={styles.floatingPetal} style={{ top: '70%', left: '5%', animationDelay: '1.5s' }}>🌹</div>
        <div className={styles.floatingPetal} style={{ top: '20%', right: '8%', animationDelay: '0.8s' }}>🌺</div>
        <div className={styles.floatingPetal} style={{ top: '60%', right: '6%', animationDelay: '2s' }}>🌷</div>
        <div className={styles.floatingPetal} style={{ top: '85%', right: '15%', animationDelay: '1s' }}>🌸</div>
      </div>

      <div className={`${styles.loginCard} animate-fade-in`}>
        <div className={styles.logoSection}>
          <div className={styles.logoIcon}>
            <svg viewBox="0 0 24 24" width="28" height="28" stroke="var(--green-500)" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
              <path d="M2 17l10 5 10-5"></path>
              <path d="M2 12l10 5 10-5"></path>
            </svg>
          </div>
          <h1 className={`${styles.brandName} font-script`}>Toko Bunga</h1>
          <p className={styles.brandTagline}>Invoice Generator</p>
        </div>

        <div className={styles.cardDivider} />

        <form className={styles.loginForm} onSubmit={handleLogin} noValidate>
          <h2 className={styles.formTitle}>Selamat Datang</h2>
          <p className={styles.formSubtitle}>Masuk untuk membuat invoice</p>

          {error && (
            <div className={styles.errorAlert} role="alert" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
              <span>{error}</span>
            </div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="username">Username</label>
            <div className={styles.inputWrapper}>
              <span className={styles.inputIcon} style={{ display: 'flex', alignItems: 'center' }}>
                <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </span>
              <input
                id="username"
                type="text"
                className={`form-input ${styles.paddedInput}`}
                placeholder="Masukkan username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <div className={styles.inputWrapper}>
              <span className={styles.inputIcon} style={{ display: 'flex', alignItems: 'center' }}>
                <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
              </span>
              <input
                id="password"
                type={showPass ? 'text' : 'password'}
                className={`form-input ${styles.paddedInput} ${styles.paddedInputRight}`}
                placeholder="Masukkan password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
                disabled={loading}
              />
              <button
                type="button"
                className={styles.togglePass}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                onClick={() => setShowPass(!showPass)}
                aria-label={showPass ? 'Sembunyikan password' : 'Tampilkan password'}
              >
                {showPass ? (
                  <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button
            id="btn-login"
            type="submit"
            className={`btn btn-primary btn-lg w-full ${styles.loginBtn}`}
            disabled={loading}
          >
            {loading ? (
              <><span className={styles.spinner} /><span>Memproses...</span></>
            ) : (
              <span>Masuk</span>
            )}
          </button>


        </form>
      </div>
    </div>
  );
}
