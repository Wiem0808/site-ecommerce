'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { ThemeProvider } from '@/context/ThemeContext';
import { I18nProvider } from '@/context/I18nContext';
import { CartProvider } from '@/context/CartContext';
import { AuthProvider } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CartDrawer from '@/components/CartDrawer';
import ChatBot from '@/components/ChatBot';
import WhatsAppButton from '@/components/WhatsAppButton';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <I18nProvider>
        <AuthProvider>
          <CartProvider>
            <InnerLayout>{children}</InnerLayout>
          </CartProvider>
        </AuthProvider>
      </I18nProvider>
    </ThemeProvider>
  );
}

function InnerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Pages that have their own full-screen layout (no shared Navbar/Footer)
  const isStandalonePage =
    pathname === '/admin' ||
    pathname.startsWith('/admin/') ||
    pathname === '/auth' ||
    pathname.startsWith('/auth/');

  if (isStandalonePage) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar />
      <main style={{ paddingTop: 'var(--nav-height)' }}>
        {children}
      </main>
      <Footer />
      <CartDrawer />
      <ChatBot />
      <WhatsAppButton />
    </>
  );
}
