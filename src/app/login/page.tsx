'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!email || !password) {
      setError('Please enter both email and password');
      setIsLoading(false);
      return;
    }

    setTimeout(() => {
      if (email === 'admin@healthyyummy.com' && password === 'admin123') {
        router.push('/admin');
      } else if (email && password) {
        router.push('/admin');
      } else {
        setError('Invalid email or password');
        setIsLoading(false);
      }
    }, 1000);
  };

  return (
    <div className="login-page">
      {/* Green Accent Decorations */}
      <div className="login-accent-1"></div>
      <div className="login-accent-2"></div>

      <div className="login-container">
        {/* Logo and Title */}
        <div className="login-header">
          <div className="login-logo">
            <img src="/logo/hy-logo.jpg" alt="Healthy Yummy Logo" className="logo-icon" />
          </div>
          <h1 className="login-title">
            Healthy Yummy
          </h1>
          <p className="login-subtitle">
            POS Dashboard Login
          </p>
        </div>

        {/* Login Form */}
        <div className="login-card">
          <form onSubmit={handleSubmit} className="login-form">
            {error && (
              <div className="login-error">
                {error}
              </div>
            )}

            <div className="form-group">
              <label className="form-label">
                Email Address
              </label>
              <input
                type="email"
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@healthyyummy.com"
                disabled={isLoading}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Password
              </label>
              <input
                type="password"
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                disabled={isLoading}
              />
            </div>

            <div className="login-options">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  className="form-checkbox"
                />
                <span>Remember me</span>
              </label>
            </div>

            <button
              type="submit"
              className="btn btn-primary login-btn"
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="login-demo">
            <p>Demo: admin@healthyyummy.com / admin123</p>
          </div>
        </div>

        <p className="login-footer">
          © 2026 Healthy Yummy POS. All rights reserved.
        </p>
      </div>
    </div>
  );
}
