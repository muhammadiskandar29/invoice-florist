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
    if (typeof window !== 'undefined' && sessionStorage.getItem('isLoggedIn') === 'true') {
      router.replace('/invoice');
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
        sessionStorage.setItem('isLoggedIn', 'true');
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
            <span>🌹</span>
          </div>
          <h1 className={`${styles.brandName} font-script`}>Toko Bunga</h1>
          <p className={styles.brandTagline}>Invoice Generator</p>
        </div>

        <div className={styles.cardDivider} />

        <form className={styles.loginForm} onSubmit={handleLogin} noValidate>
          <h2 className={styles.formTitle}>Selamat Datang</h2>
          <p className={styles.formSubtitle}>Masuk untuk membuat invoice</p>

          {error && (
            <div className={styles.errorAlert} role="alert">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="username">Username</label>
            <div className={styles.inputWrapper}>
              <span className={styles.inputIcon}>👤</span>
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
              <span className={styles.inputIcon}>🔒</span>
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
                onClick={() => setShowPass(!showPass)}
                aria-label={showPass ? 'Sembunyikan password' : 'Tampilkan password'}
              >
                {showPass ? '🙈' : '👁️'}
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
              <><span>🌸</span><span>Masuk</span></>
            )}
          </button>

          <p className={styles.hint}>
            <span className={styles.hintIcon}>💡</span>
            Demo: <code>admin</code> / <code>bunga123</code>
          </p>
        </form>
      </div>
    </div>
  );
}
