'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useI18n } from '@/context/I18nContext';
import { products } from '@/data/products';
import styles from './ChatBot.module.css';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
  time: string;
}

type Locale = 'en' | 'fr' | 'ar' | 'es' | 'pt';

function getProductResponse(query: string, locale: Locale, t: (k: string) => string): string | null {
  const q = query.toLowerCase();
  const matched = products.filter(p =>
    p.name.toLowerCase().includes(q) ||
    p.nameFr.toLowerCase().includes(q) ||
    p.category.toLowerCase().includes(q)
  );
  if (matched.length === 0) return null;

  const items = matched.slice(0, 3).map(p => {
    const name = locale === 'fr' ? p.nameFr : locale === 'ar' ? p.nameAr : p.name;
    return `• ${name} - $${p.price.toFixed(2)}${p.badge ? ` (${p.badge})` : ''}`;
  }).join('\n');

  return `🔍 ${matched.length} ${t('chat.found')}\n\n${items}`;
}

function getBotResponse(input: string, locale: Locale, t: (k: string) => string): string {
  const q = input.toLowerCase();

  if (q.includes('hi') || q.includes('hello') || q.includes('bonjour') || q.includes('salut') ||
      q.includes('hola') || q.includes('olá') || q.includes('oi') || q.includes('مرحب')) {
    return t('chat.greeting');
  }
  if (q.includes('return') || q.includes('retour') || q.includes('refund') || q.includes('rembours') ||
      q.includes('devoluc') || q.includes('devolu') || q.includes('إرجاع')) {
    return t('chat.returns');
  }
  if (q.includes('pay') || q.includes('card') || q.includes('paie') || q.includes('carte') ||
      q.includes('pago') || q.includes('pagamento') || q.includes('دفع') || q.includes('بطاق')) {
    return t('chat.payment');
  }
  if (q.includes('ship') || q.includes('deliver') || q.includes('livr') || q.includes('expéd') ||
      q.includes('envio') || q.includes('envío') || q.includes('frete') || q.includes('شحن') || q.includes('توصيل')) {
    return t('chat.shipping_info');
  }
  if (q.includes('track') || q.includes('order') || q.includes('suiv') || q.includes('command') ||
      q.includes('rastr') || q.includes('pedido') || q.includes('تتبع') || q.includes('طلب')) {
    return t('chat.tracking');
  }

  const productResult = getProductResponse(q, locale, t);
  if (productResult) return productResult;

  return t('chat.default');
}

export default function ChatBot() {
  const { t, locale } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{
        id: 1,
        text: t('chat.greeting'),
        sender: 'bot',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }]);
    }
  }, [isOpen, messages.length, t]);

  // Reset messages when locale changes
  useEffect(() => {
    if (messages.length > 0) {
      setMessages([{
        id: 1,
        text: t('chat.greeting'),
        sender: 'bot',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locale]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim()) return;
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg: Message = { id: Date.now(), text: input, sender: 'user', time: now };
    setMessages(prev => [...prev, userMsg]);
    const query = input;
    setInput('');

    setTimeout(() => {
      const response = getBotResponse(query, locale as Locale, t);
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        text: response,
        sender: 'bot',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }]);
    }, 800);
  };

  return (
    <>
      <button className={styles.toggle} onClick={() => setIsOpen(!isOpen)} aria-label="Chat">
        {isOpen ? '✕' : '💬'}
      </button>

      {isOpen && (
        <div className={styles.window}>
          <div className={styles.header}>
            <div className={styles.headerInfo}>
              <div className={styles.avatar}>✦</div>
              <div>
                <h3 className={styles.headerTitle}>{t('chat.title')}</h3>
                <span className={styles.status}>● {t('chat.online')}</span>
              </div>
            </div>
            <button className={styles.minimize} onClick={() => setIsOpen(false)}>—</button>
          </div>

          <div className={styles.messages}>
            {messages.map(msg => (
              <div key={msg.id} className={`${styles.message} ${msg.sender === 'user' ? styles.userMsg : styles.botMsg}`}>
                <div className={styles.msgBubble}>
                  <p className={styles.msgText}>{msg.text}</p>
                  <span className={styles.msgTime}>{msg.time}</span>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className={styles.inputArea}>
            <input
              type="text"
              placeholder={t('chat.placeholder')}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
              className={styles.input}
            />
            <button className={styles.sendBtn} onClick={sendMessage}>➤</button>
          </div>
        </div>
      )}
    </>
  );
}
