'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useI18n } from '@/context/I18nContext';
import styles from './Footer.module.css';
import {
  Music2, ShoppingBag, Grid3x3, MapPin, Info, Phone, RotateCcw,
  Shield, FileText, CreditCard, Mail, ArrowRight,
} from 'lucide-react';

const InstagramIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
  </svg>
);
const TwitterIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);
const FacebookIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

export default function Footer() {
  const { t } = useI18n();

  return (
    <footer className={styles.footer}>
      <div className={styles.glow} />
      <div className={`container ${styles.container}`}>
        <div className={styles.top}>
          {/* Brand */}
          <div className={styles.brand}>
            <Link href="/" className={styles.logoLink}>
              <Image src="/logo-wiw.png" alt="WIWISHOP" width={130} height={40} className={styles.logoImg} unoptimized />
            </Link>
            <p className={styles.tagline}>{t('footer.tagline')}</p>
            <div className={styles.socials}>
              <a href="#" className={styles.social} aria-label="Instagram"><InstagramIcon /></a>
              <a href="#" className={styles.social} aria-label="Twitter"><TwitterIcon /></a>
              <a href="#" className={styles.social} aria-label="Facebook"><FacebookIcon /></a>
              <a href="#" className={styles.social} aria-label="TikTok"><Music2 size={18} /></a>
            </div>
          </div>

          {/* Links */}
          <div className={styles.links}>
            <div className={styles.linkGroup}>
              <h4 className={styles.linkTitle}>{t('footer.shop')}</h4>
              <Link href="/#featured" className={styles.link}><ShoppingBag size={13} /> {t('nav.products')}</Link>
              <Link href="/#categories" className={styles.link}><Grid3x3 size={13} /> {t('nav.categories')}</Link>
              <Link href="/tracking" className={styles.link}><MapPin size={13} /> {t('nav.tracking')}</Link>
            </div>
            <div className={styles.linkGroup}>
              <h4 className={styles.linkTitle}>Info</h4>
              <Link href="#" className={styles.link}><Info size={13} /> {t('footer.about')}</Link>
              <Link href="#" className={styles.link}><Phone size={13} /> {t('footer.contact')}</Link>
              <Link href="#" className={styles.link}><RotateCcw size={13} /> {t('footer.returns')}</Link>
            </div>
            <div className={styles.linkGroup}>
              <h4 className={styles.linkTitle}>{t('footer.legal')}</h4>
              <Link href="#" className={styles.link}><Shield size={13} /> {t('footer.privacy')}</Link>
              <Link href="#" className={styles.link}><FileText size={13} /> {t('footer.terms')}</Link>
            </div>
          </div>
        </div>

        {/* Newsletter */}
        <div className={styles.newsletter}>
          <h3 className={styles.newsletterTitle}>
            <Mail size={18} /> {t('section.newsletter')}
          </h3>
          <div className={styles.newsletterForm}>
            <input type="email" placeholder={t('footer.email_placeholder')} className={styles.emailInput} />
            <button className="btn btn-primary"><ArrowRight size={16} /></button>
          </div>
        </div>

        {/* Bottom */}
        <div className={styles.bottom}>
          <p className={styles.copyright}>{t('footer.copyright')}</p>
          <div className={styles.payments}>
            <CreditCard size={16} />
            <span>Visa</span>
            <span>Mastercard</span>
            <span>PayPal</span>
            <span>COD</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
