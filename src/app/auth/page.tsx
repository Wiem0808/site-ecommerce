'use client';

import React, { useState, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { useI18n } from '@/context/I18nContext';
import {
  Mail, Lock, User, Phone, Eye, EyeOff, ArrowRight,
  AlertCircle, Shield, Truck, CreditCard,
} from 'lucide-react';
import styles from './page.module.css';

function getPasswordStrength(pw: string, weak: string, medium: string, strong: string): { score: number; label: string } {
  if (!pw) return { score: 0, label: '' };
  let score = 0;
  if (pw.length >= 6) score++;
  if (pw.length >= 10) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (score <= 1) return { score: 1, label: weak };
  if (score <= 3) return { score: 2, label: medium };
  return { score: 3, label: strong };
}

function AuthPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/';
  const { login, register } = useAuth();
  const { t } = useI18n();

  const [mode, setMode] = useState<'login' | 'register'>(
    searchParams.get('mode') === 'register' ? 'register' : 'login'
  );
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', phone: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const pwStrength = useMemo(
    () => getPasswordStrength(formData.password, t('auth.pw_weak'), t('auth.pw_medium'), t('auth.pw_strong')),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [formData.password, t]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'login') {
        const result = await login(formData.email, formData.password);
        if (result.success) {
          router.push(redirectTo);
        } else {
          setError(result.error || t('auth.err_invalid'));
        }
      } else {
        if (!formData.name.trim()) { setError(t('auth.err_name')); setLoading(false); return; }
        if (formData.password.length < 6) { setError(t('auth.err_pw_length')); setLoading(false); return; }

        const result = await register(formData.name, formData.email, formData.password, formData.phone || undefined);
        if (result.success) {
          router.push(redirectTo);
        } else {
          setError(result.error || t('auth.err_email_used'));
        }
      }
    } catch {
      setError(t('auth.err_generic'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authPage}>
      <div className={styles.authContainer}>
        <div className={styles.authCard}>
          {/* Logo */}
          <div className={styles.logoWrapper}>
            <Image src="/logo-wiw.png" alt="WIWISHOP" width={160} height={50} unoptimized />
          </div>

          {/* Header */}
          <div className={styles.authHeader}>
            <h1 className={styles.authTitle}>
              {mode === 'login' ? t('auth.login_title') : t('auth.register_title')}
            </h1>
            <p className={styles.authSubtitle}>
              {mode === 'login' ? t('auth.login_sub') : t('auth.register_sub')}
            </p>
          </div>

          {/* Tab Switcher */}
          <div className={styles.tabSwitcher}>
            <button
              className={`${styles.tab} ${mode === 'login' ? styles.tabActive : ''}`}
              onClick={() => { setMode('login'); setError(''); }}
            >
              {t('auth.login_tab')}
            </button>
            <button
              className={`${styles.tab} ${mode === 'register' ? styles.tabActive : ''}`}
              onClick={() => { setMode('register'); setError(''); }}
            >
              {t('auth.register_tab')}
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className={styles.errorMsg}>
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          {/* Form */}
          <form className={styles.authForm} onSubmit={handleSubmit}>
            {/* Name (register only) */}
            {mode === 'register' && (
              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>{t('auth.name_label')}</label>
                <div className={styles.inputWrapper}>
                  <span className={styles.inputIcon}><User size={18} /></span>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder={t('auth.name_placeholder')}
                    required
                    autoComplete="name"
                  />
                </div>
              </div>
            )}

            {/* Email */}
            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>{t('email')}</label>
              <div className={styles.inputWrapper}>
                <span className={styles.inputIcon}><Mail size={18} /></span>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder={t('footer.email_placeholder')}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>{t('auth.password_label')}</label>
              <div className={styles.inputWrapper}>
                <span className={styles.inputIcon}><Lock size={18} /></span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                />
                <button
                  type="button"
                  className={styles.togglePassword}
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {mode === 'register' && formData.password && (
                <>
                  <div className={styles.passwordStrength}>
                    {[1, 2, 3].map(i => (
                      <div
                        key={i}
                        className={`${styles.strengthBar} ${
                          pwStrength.score >= i ? styles.active : ''
                        } ${pwStrength.score === 2 && i <= 2 ? styles.medium : ''} ${
                          pwStrength.score === 3 ? styles.strong : ''
                        }`}
                      />
                    ))}
                  </div>
                  <div className={styles.strengthText}>{pwStrength.label}</div>
                </>
              )}
            </div>

            {/* Phone (register only) */}
            {mode === 'register' && (
              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>
                  {t('auth.phone_label')} <span style={{ opacity: 0.5 }}>({t('auth.optional')})</span>
                </label>
                <div className={styles.inputWrapper}>
                  <span className={styles.inputIcon}><Phone size={18} /></span>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+213 XX XX XX XX"
                    autoComplete="tel"
                  />
                </div>
              </div>
            )}

            {/* Submit */}
            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? (
                <span className={styles.spinner} />
              ) : (
                <>
                  {mode === 'login' ? t('auth.login_btn') : t('auth.register_btn')}
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className={styles.authFooter}>
            {mode === 'login' ? (
              <p>
                {t('auth.no_account')}{' '}
                <button onClick={() => { setMode('register'); setError(''); }}>
                  {t('auth.create_account')}
                </button>
              </p>
            ) : (
              <p>
                {t('auth.have_account')}{' '}
                <button onClick={() => { setMode('login'); setError(''); }}>
                  {t('auth.login_btn')}
                </button>
              </p>
            )}
          </div>
        </div>

        {/* Features */}
        <div className={styles.features}>
          <div className={styles.feature}>
            <div className={styles.featureIcon}><Shield size={18} /></div>
            <span className={styles.featureText}>{t('trust.secure')}</span>
          </div>
          <div className={styles.feature}>
            <div className={styles.featureIcon}><Truck size={18} /></div>
            <span className={styles.featureText}>{t('trust.fast_delivery')}</span>
          </div>
          <div className={styles.feature}>
            <div className={styles.featureIcon}><CreditCard size={18} /></div>
            <span className={styles.featureText}>{t('trust.returns')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }} />}>
      <AuthPageContent />
    </Suspense>
  );
}
