'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useI18n } from '@/context/I18nContext';
import { useCart } from '@/context/CartContext';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import styles from './Navbar.module.css';
import {
 Search, ShoppingBag, Sun, Moon, Menu, X, Tag, ChevronRight,
 User, LogOut, Shield, Package, UserPlus,
} from 'lucide-react';

interface SearchProduct {
 id: string; name: string; nameFr: string; nameAr: string;
 price: number; category: { icon: string; name: string };
}

export default function Navbar() {
 const { t, locale, setLocale } = useI18n();
 const { totalItems, setIsCartOpen } = useCart();
 const { theme, toggleTheme } = useTheme();
 const { user, isAdmin, logout } = useAuth();
 const router = useRouter();
 const [scrolled, setScrolled] = useState(false);
 const [searchOpen, setSearchOpen] = useState(false);
 const [searchQuery, setSearchQuery] = useState('');
 const [searchResults, setSearchResults] = useState<SearchProduct[]>([]);
 const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
 const [userMenuOpen, setUserMenuOpen] = useState(false);
 const searchRef = useRef<HTMLDivElement>(null);
 const userMenuRef = useRef<HTMLDivElement>(null);

 useEffect(() => {
 const handleScroll = () => setScrolled(window.scrollY > 20);
 window.addEventListener('scroll', handleScroll);
 return () => window.removeEventListener('scroll', handleScroll);
 }, []);

 useEffect(() => {
 if (searchQuery.length < 2) { setSearchResults([]); return; }
 const timeout = setTimeout(async () => {
 try {
 const res = await fetch(`/api/products?search=${encodeURIComponent(searchQuery)}&limit=5`);
 const data = await res.json();
 setSearchResults(data.products || []);
 } catch {
 setSearchResults([]);
 }
 }, 300);
 return () => clearTimeout(timeout);
 }, [searchQuery]);

 useEffect(() => {
 const handleClickOutside = (e: MouseEvent) => {
 if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
 setSearchOpen(false);
 setSearchQuery('');
 }
 if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
 setUserMenuOpen(false);
 }
 };
 document.addEventListener('mousedown', handleClickOutside);
 return () => document.removeEventListener('mousedown', handleClickOutside);
 }, []);

 const locales = [
 { code: 'fr' as const, label: 'FR', flag: '' },
 { code: 'en' as const, label: 'EN', flag: '' },
 { code: 'ar' as const, label: 'AR', flag: '' },
 { code: 'es' as const, label: 'ES', flag: '🇪🇸' },
 { code: 'pt' as const, label: 'PT', flag: '🇵🇹' },
 ];

 const getName = (p: SearchProduct) =>
 locale === 'fr' ? p.nameFr : locale === 'ar' ? p.nameAr : p.name;

 const handleSearchKeyDown = (e: React.KeyboardEvent) => {
 if (e.key === 'Enter' && searchQuery.length > 0) {
 setSearchOpen(false);
 router.push(`/catalogue?search=${encodeURIComponent(searchQuery)}`);
 }
 };

 const handleLogout = () => {
 logout();
 setUserMenuOpen(false);
 router.push('/');
 };

 const initials = user ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2) : '';

 return (
 <nav className={`${styles.navbar} ${scrolled ? styles.scrolled : ''}`}>
 <div className={styles.container}>
 {/* Logo */}
 <Link href="/" className={styles.logo}>
 <Image
 src="/logo-wiw.png"
 alt="WIWISHOP Logo"
 width={280}
 height={90}
 className={styles.logoImg}
 priority
 unoptimized
 />
 </Link>

 {/* Desktop Nav Links */}
 <div className={styles.navLinks}>
 <Link href="/" className={styles.navLink}>{t('nav.home')}</Link>
 <Link href="/catalogue" className={styles.navLink}>{t('nav.categories')}</Link>
 <Link href="/cart" className={styles.navLink}>{t('nav.cart') || 'Cart'}</Link>
 <Link href="/tracking" className={styles.navLink}>{t('nav.tracking')}</Link>
 {isAdmin && (
 <Link href="/admin" className={styles.navLink}>{t('nav.admin')}</Link>
 )}
 </div>

 {/* Right Actions */}
 <div className={styles.actions}>
 {/* Search */}
 <div className={styles.searchWrapper} ref={searchRef}>
 <button
 className={`btn-icon ${styles.searchToggle}`}
 onClick={() => setSearchOpen(!searchOpen)}
 aria-label="Search"
 >
 <Search size={18} />
 </button>
 {searchOpen && (
 <div className={styles.searchDropdown}>
 <input
 type="text"
 placeholder={t('nav.search')}
 value={searchQuery}
 onChange={e => setSearchQuery(e.target.value)}
 onKeyDown={handleSearchKeyDown}
 className={styles.searchInput}
 autoFocus
 />
 {searchResults.length > 0 && (
 <div className={styles.searchResults}>
 {searchResults.map(p => (
 <Link
 key={p.id}
 href={`/products/${p.id}`}
 className={styles.searchResult}
 onClick={() => { setSearchOpen(false); setSearchQuery(''); }}
 >
 <span className={styles.searchResultIcon}><Tag size={14} /></span>
 <div>
 <div className={styles.searchResultName}>{getName(p)}</div>
 <div className={styles.searchResultPrice}>${p.price.toFixed(2)}</div>
 </div>
 </Link>
 ))}
 <Link
 href={`/catalogue?search=${encodeURIComponent(searchQuery)}`}
 className={styles.searchViewAll}
 onClick={() => { setSearchOpen(false); setSearchQuery(''); }}
 >
 {t('view_all') || 'View all results'} <ChevronRight size={14} />
 </Link>
 </div>
 )}
 </div>
 )}
 </div>

 {/* Theme Toggle */}
 <button className={`btn-icon`} onClick={toggleTheme} aria-label="Toggle theme">
 {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
 </button>

 {/* Language Selector */}
 <div className={styles.langSelector}>
 {locales.map(l => (
 <button
 key={l.code}
 className={`${styles.langBtn} ${locale === l.code ? styles.langActive : ''}`}
 onClick={() => setLocale(l.code)}
 >
 {l.flag}
 </button>
 ))}
 </div>

 {/* Cart */}
 <button
 className={`btn-icon ${styles.cartBtn}`}
 onClick={() => setIsCartOpen(true)}
 aria-label="Cart"
 >
 <ShoppingBag size={20} />
 {totalItems > 0 && (
 <span className={styles.cartBadge}>{totalItems}</span>
 )}
 </button>

 {/* User Menu */}
 {user ? (
 <div className={styles.userMenuWrapper} ref={userMenuRef}>
 <button
 className={styles.userBtn}
 onClick={() => setUserMenuOpen(!userMenuOpen)}
 aria-label="User menu"
 >
 <span className={styles.userName}>{user.name.split(' ')[0]}</span>
 <span className={styles.userAvatar}>{initials}</span>
 </button>

 {userMenuOpen && (
 <div className={styles.userDropdown}>
 <div className={styles.userDropdownHeader}>
 <div className={styles.userDropdownName}>{user.name}</div>
 <div className={styles.userDropdownEmail}>{user.email}</div>
 </div>

 <Link
 href="/account"
 className={styles.userDropdownItem}
 onClick={() => setUserMenuOpen(false)}
 >
 <User size={16} /> {t('nav.my_account')}
 </Link>

 <Link
 href="/account"
 className={styles.userDropdownItem}
 onClick={() => setUserMenuOpen(false)}
 >
 <Package size={16} /> {t('nav.my_orders')}
 </Link>

 {isAdmin && (
 <Link
 href="/admin"
 className={styles.userDropdownItem}
 onClick={() => setUserMenuOpen(false)}
 >
 <Shield size={16} /> Admin
 </Link>
 )}

 <div className={styles.userDropdownDivider} />

 <button
 className={`${styles.userDropdownItem} ${styles.userDropdownLogout}`}
 onClick={handleLogout}
 >
 <LogOut size={16} /> {t('nav.logout')}
 </button>
 </div>
 )}
 </div>
 ) : (
 <Link href="/auth" className={styles.loginBtn}>
 <UserPlus size={14} />
 {t('nav.login')}
 </Link>
 )}

 {/* Mobile Menu Toggle */}
 <button
 className={`btn-icon ${styles.menuToggle}`}
 onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
 aria-label="Menu"
 >
 {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
 </button>
 </div>
 </div>

 {/* Mobile Menu */}
 {mobileMenuOpen && (
 <div className={styles.mobileMenu}>
 <Link href="/" className={styles.mobileLink} onClick={() => setMobileMenuOpen(false)}>{t('nav.home')}</Link>
 <Link href="/catalogue" className={styles.mobileLink} onClick={() => setMobileMenuOpen(false)}>{t('nav.categories')}</Link>
 <Link href="/cart" className={styles.mobileLink} onClick={() => setMobileMenuOpen(false)}>{t('nav.cart') || 'Cart'}</Link>
 <Link href="/tracking" className={styles.mobileLink} onClick={() => setMobileMenuOpen(false)}>{t('nav.tracking')}</Link>
 {user ? (
 <>
 <Link href="/account" className={styles.mobileLink} onClick={() => setMobileMenuOpen(false)}>{t('nav.my_account')}</Link>
 {isAdmin && (
 <Link href="/admin" className={styles.mobileLink} onClick={() => setMobileMenuOpen(false)}>{t('nav.admin')}</Link>
 )}
 <button
 className={styles.mobileLink}
 onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
 style={{ background: 'transparent', border: 'none', textAlign: 'left', color: 'var(--color-error)', cursor: 'pointer', width: '100%' }}
 >
 {t('nav.logout')}
 </button>
 </>
 ) : (
 <Link href="/auth" className={styles.mobileLink} onClick={() => setMobileMenuOpen(false)}>{t('nav.login_register')}</Link>
 )}
 </div>
 )}
 </nav>
 );
}
