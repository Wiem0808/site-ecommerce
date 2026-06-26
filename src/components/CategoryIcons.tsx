/**
 * WIWISHOP Premium Category Icons
 * Professional SVG icon components for each product category.
 * Each icon has a unique design matching real e-commerce platforms
 * (inspired by Apple App Store, Shopify, Amazon-style category tiles).
 */

'use client';
import React from 'react';

export interface CatIconDef {
  id: string;
  label: string;
  gradient: string;
  shadowColor: string;
  icon: React.ReactNode;
}

// ─────────── SVG Icons ───────────

const SVGBox = ({ children }: { children: React.ReactNode }) => (
  <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" width="22" height="22">
    {children}
  </svg>
);

// Tech / Electronics
export const IconTech = () => <SVGBox>
  <rect x="3" y="5" width="26" height="18" rx="2.5" fill="white" fillOpacity="0.18"/>
  <rect x="5" y="7" width="22" height="14" rx="1.5" fill="white" fillOpacity="0.12"/>
  <rect x="7" y="9" width="18" height="10" rx="1" fill="white" fillOpacity="0.22"/>
  <rect x="11" y="23" width="10" height="2.5" rx="1.2" fill="white" fillOpacity="0.5"/>
  <rect x="9" y="25.5" width="14" height="1.5" rx="0.7" fill="white" fillOpacity="0.35"/>
  <circle cx="16" cy="14" r="2.5" fill="white" fillOpacity="0.7"/>
</SVGBox>;

// Fashion / Clothing
export const IconFashion = () => <SVGBox>
  <path d="M10 5L6 9.5l3.5 2V27h13V11.5L26 9.5 22 5h-3.5a2.5 2.5 0 01-5 0H10z" fill="white" fillOpacity="0.2"/>
  <path d="M10 5L6 9.5l3.5 2" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  <path d="M22 5l4 4.5-3.5 2" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  <path d="M9.5 11.5V27h13V11.5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
  <path d="M13 10a3 3 0 006 0" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
</SVGBox>;

// Home & Living
export const IconHome = () => <SVGBox>
  <path d="M4 14L16 4l12 10v14a1 1 0 01-1 1H5a1 1 0 01-1-1V14z" fill="white" fillOpacity="0.18"/>
  <path d="M4 14L16 4l12 10" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  <path d="M5 13v14a1 1 0 001 1h7v-7h6v7h7a1 1 0 001-1V13" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  <rect x="13" y="19" width="6" height="9" rx="0.8" fill="white" fillOpacity="0.25"/>
</SVGBox>;

// Beauty / Cosmetics
export const IconBeauty = () => <SVGBox>
  <ellipse cx="16" cy="20" rx="7" ry="9" fill="white" fillOpacity="0.18"/>
  <rect x="13" y="6" width="6" height="6" rx="1.5" fill="white" fillOpacity="0.2"/>
  <rect x="14.5" y="4" width="3" height="3" rx="1" fill="white" fillOpacity="0.4"/>
  <ellipse cx="16" cy="20" rx="7" ry="9" stroke="white" strokeWidth="1.5"/>
  <path d="M16 13v4M14 15h4" stroke="white" strokeWidth="1.4" strokeLinecap="round"/>
</SVGBox>;

// Sports & Fitness
export const IconSports = () => <SVGBox>
  <circle cx="16" cy="16" r="12" fill="white" fillOpacity="0.15" stroke="white" strokeWidth="1.5"/>
  <path d="M8 10c2 1.5 5 2 8 2s6-.5 8-2" stroke="white" strokeWidth="1.4" strokeLinecap="round"/>
  <path d="M8 22c2-1.5 5-2 8-2s6 .5 8 2" stroke="white" strokeWidth="1.4" strokeLinecap="round"/>
  <path d="M16 4v24M10.5 7l-4 18M21.5 7l4 18" stroke="white" strokeWidth="1.3" strokeLinecap="round" opacity="0.7"/>
</SVGBox>;

// Gaming
export const IconGaming = () => <SVGBox>
  <rect x="3" y="9" width="26" height="16" rx="7" fill="white" fillOpacity="0.15" stroke="white" strokeWidth="1.5"/>
  <path d="M10 15v4M8 17h4" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
  <circle cx="21" cy="15.5" r="1.2" fill="white"/>
  <circle cx="24" cy="17.5" r="1.2" fill="white"/>
  <circle cx="21" cy="19.5" r="1.2" fill="white"/>
  <circle cx="18" cy="17.5" r="1.2" fill="white"/>
  <path d="M12 8l-2 1M20 8l2 1" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
</SVGBox>;

// Mobile / Phone
export const IconPhone = () => <SVGBox>
  <rect x="8" y="2" width="16" height="28" rx="3" fill="white" fillOpacity="0.15" stroke="white" strokeWidth="1.5"/>
  <rect x="11" y="6" width="10" height="16" rx="0.8" fill="white" fillOpacity="0.2"/>
  <circle cx="16" cy="26" r="1.5" fill="white" fillOpacity="0.6"/>
  <rect x="14" y="3.5" width="4" height="1" rx="0.5" fill="white" fillOpacity="0.5"/>
</SVGBox>;

// Shoes / Footwear
export const IconShoes = () => <SVGBox>
  <path d="M4 22c2-4 5-9 8-11l4.5 3 6-6.5 3 2.5-8 10.5H6.5L4 22z" fill="white" fillOpacity="0.18"/>
  <path d="M4 22c2-4 5-9 8-11l4.5 3 6-6.5 3 2.5-8 10.5H6.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  <path d="M4 22c0 1.5 1.2 2.5 2.5 2.5h20c1 0 1.7-.8 1.5-1.8L27 21" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
</SVGBox>;

// Bags / Accessories
export const IconBag = () => <SVGBox>
  <rect x="4" y="12" width="24" height="16" rx="2" fill="white" fillOpacity="0.15" stroke="white" strokeWidth="1.5"/>
  <path d="M11 12V9a5 5 0 0110 0v3" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
  <path d="M4 19h24" stroke="white" strokeWidth="1.2" strokeLinecap="round" opacity="0.5"/>
  <ellipse cx="16" cy="19" rx="2.5" ry="1.5" fill="white" fillOpacity="0.4"/>
</SVGBox>;

// Jewelry / Luxury
export const IconJewelry = () => <SVGBox>
  <path d="M8 8l-5 6h26l-5-6H8z" fill="white" fillOpacity="0.2" stroke="white" strokeWidth="1.4" strokeLinejoin="round"/>
  <path d="M3 14l13 14L29 14" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
  <path d="M11 8l5 6 5-6" stroke="white" strokeWidth="1.2" strokeLinecap="round" opacity="0.6"/>
</SVGBox>;

// Food & Kitchen
export const IconFood = () => <SVGBox>
  <circle cx="16" cy="18" r="11" fill="white" fillOpacity="0.12" stroke="white" strokeWidth="1.5"/>
  <path d="M12 4v7a3 3 0 006 0V4" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
  <path d="M9 4v6c0 2.5 1.5 4 3.5 4.5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
  <path d="M23 4v5.5c0 1.5-.8 2.8-2 3.5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
</SVGBox>;

// Art & Decor
export const IconArt = () => <SVGBox>
  <circle cx="16" cy="16" r="13" fill="white" fillOpacity="0.12" stroke="white" strokeWidth="1.5"/>
  <circle cx="11" cy="11" r="2.5" fill="white" fillOpacity="0.6"/>
  <circle cx="21" cy="10" r="2" fill="white" fillOpacity="0.5"/>
  <circle cx="22" cy="20" r="2.5" fill="white" fillOpacity="0.55"/>
  <circle cx="12" cy="21" r="2" fill="white" fillOpacity="0.45"/>
  <circle cx="16.5" cy="16" r="3" fill="white" fillOpacity="0.7"/>
</SVGBox>;

// Kids & Toys
export const IconToys = () => <SVGBox>
  <circle cx="9" cy="22" r="5" fill="white" fillOpacity="0.15" stroke="white" strokeWidth="1.5"/>
  <circle cx="23" cy="22" r="5" fill="white" fillOpacity="0.15" stroke="white" strokeWidth="1.5"/>
  <rect x="11" y="12" width="10" height="14" rx="1" fill="white" fillOpacity="0.2" stroke="white" strokeWidth="1.4"/>
  <path d="M14 8h4M16 6v4" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
</SVGBox>;

// Tools / DIY
export const IconTools = () => <SVGBox>
  <path d="M20.5 4.5a6 6 0 00-6 8.5L5 22.5a2.5 2.5 0 003.5 3.5l9.5-9.5a6 6 0 008.5-6 6 6 0 00-1.2-3.5L21.5 10 19 9l-.5-2.5 1.5-2z" fill="white" fillOpacity="0.18" stroke="white" strokeWidth="1.4" strokeLinejoin="round"/>
  <circle cx="7.5" cy="24.5" r="1.5" fill="white" fillOpacity="0.6"/>
</SVGBox>;

// Nature & Plants
export const IconNature = () => <SVGBox>
  <path d="M16 28V16" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
  <path d="M16 16C16 16 8 13 7 6c5.5.5 9 4 9 10z" fill="white" fillOpacity="0.25" stroke="white" strokeWidth="1.3" strokeLinejoin="round"/>
  <path d="M16 20C16 20 22 16 24 9c-5.5.5-8.5 5-8 11z" fill="white" fillOpacity="0.2" stroke="white" strokeWidth="1.3" strokeLinejoin="round"/>
  <path d="M13 25c1-.5 2-1 3-1s2 .5 3 1" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
</SVGBox>;

// Books & Education
export const IconBooks = () => <SVGBox>
  <rect x="5" y="5" width="16" height="22" rx="1.5" fill="white" fillOpacity="0.2" stroke="white" strokeWidth="1.5"/>
  <rect x="9" y="5" width="16" height="22" rx="1.5" fill="white" fillOpacity="0.1" stroke="white" strokeWidth="1.5"/>
  <path d="M8 10h9M8 14h7M8 18h5" stroke="white" strokeWidth="1.3" strokeLinecap="round" opacity="0.6"/>
</SVGBox>;

// Music & Audio
export const IconMusic = () => <SVGBox>
  <circle cx="9" cy="23" r="4" fill="white" fillOpacity="0.25" stroke="white" strokeWidth="1.5"/>
  <circle cx="23" cy="21" r="4" fill="white" fillOpacity="0.25" stroke="white" strokeWidth="1.5"/>
  <path d="M13 23V9l14-4v14" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  <path d="M13 13l14-4" stroke="white" strokeWidth="1.2" strokeLinecap="round"/>
</SVGBox>;

// Automotive
export const IconCar = () => <SVGBox>
  <path d="M5 17L8 10h16l3 7v5H5v-5z" fill="white" fillOpacity="0.18" stroke="white" strokeWidth="1.5" strokeLinejoin="round"/>
  <path d="M9 10l2-5h10l2 5" stroke="white" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" opacity="0.7"/>
  <circle cx="9" cy="22" r="3" fill="white" fillOpacity="0.3" stroke="white" strokeWidth="1.5"/>
  <circle cx="23" cy="22" r="3" fill="white" fillOpacity="0.3" stroke="white" strokeWidth="1.5"/>
  <path d="M5 18h22" stroke="white" strokeWidth="1.2" opacity="0.5"/>
</SVGBox>;

// Travel & Luggage
export const IconTravel = () => <SVGBox>
  <circle cx="16" cy="16" r="13" fill="white" fillOpacity="0.12" stroke="white" strokeWidth="1.5"/>
  <path d="M3 16h26M16 3c-4 3-6.5 7.5-6.5 13S12 26 16 29c4-3 6.5-7.5 6.5-13S20 6 16 3z" stroke="white" strokeWidth="1.4" strokeLinecap="round" fill="none"/>
  <path d="M7 9h18M7 23h18" stroke="white" strokeWidth="1.2" strokeLinecap="round" opacity="0.5"/>
</SVGBox>;

// Watches & Accessories
export const IconWatch = () => <SVGBox>
  <rect x="10" y="8" width="12" height="16" rx="3.5" fill="white" fillOpacity="0.18" stroke="white" strokeWidth="1.5"/>
  <rect x="12" y="4" width="8" height="5" rx="1.2" fill="white" fillOpacity="0.3"/>
  <rect x="12" y="23" width="8" height="5" rx="1.2" fill="white" fillOpacity="0.3"/>
  <path d="M16 12v4l2.5 1.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  <circle cx="16" cy="16" r="1" fill="white"/>
</SVGBox>;

// Health & Wellness
export const IconHealth = () => <SVGBox>
  <path d="M16 27S4 20 4 12a6 6 0 0112-1 6 6 0 0112 1C28 20 16 27 16 27z" fill="white" fillOpacity="0.2" stroke="white" strokeWidth="1.5" strokeLinejoin="round"/>
  <path d="M12 14h8M16 10v8" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
</SVGBox>;

// ─────────── Icon Registry ───────────

export const CATEGORY_ICONS: CatIconDef[] = [
  { id: 'tech',    label: 'Electronics',   gradient: 'linear-gradient(135deg, #667eea, #764ba2)', shadowColor: 'rgba(102,126,234,0.5)', icon: <IconTech /> },
  { id: 'fashion', label: 'Fashion',        gradient: 'linear-gradient(135deg, #f093fb, #f5576c)', shadowColor: 'rgba(245,87,108,0.5)', icon: <IconFashion /> },
  { id: 'home',    label: 'Home & Living',  gradient: 'linear-gradient(135deg, #4facfe, #00f2fe)', shadowColor: 'rgba(79,172,254,0.5)', icon: <IconHome /> },
  { id: 'beauty',  label: 'Beauty',         gradient: 'linear-gradient(135deg, #f6d365, #fda085)', shadowColor: 'rgba(253,160,133,0.5)', icon: <IconBeauty /> },
  { id: 'sports',  label: 'Sports',         gradient: 'linear-gradient(135deg, #43e97b, #38f9d7)', shadowColor: 'rgba(67,233,123,0.5)', icon: <IconSports /> },
  { id: 'gaming',  label: 'Gaming',         gradient: 'linear-gradient(135deg, #4facfe, #6C5CE7)', shadowColor: 'rgba(108,92,231,0.5)', icon: <IconGaming /> },
  { id: 'phone',   label: 'Mobile',         gradient: 'linear-gradient(135deg, #30cfd0, #330867)', shadowColor: 'rgba(48,207,208,0.4)', icon: <IconPhone /> },
  { id: 'shoes',   label: 'Footwear',       gradient: 'linear-gradient(135deg, #a18cd1, #fbc2eb)', shadowColor: 'rgba(161,140,209,0.5)', icon: <IconShoes /> },
  { id: 'bag',     label: 'Bags',           gradient: 'linear-gradient(135deg, #ffecd2, #fcb69f)', shadowColor: 'rgba(252,182,159,0.5)', icon: <IconBag /> },
  { id: 'jewelry', label: 'Jewelry',        gradient: 'linear-gradient(135deg, #ffd34f, #da5a44)', shadowColor: 'rgba(218,90,68,0.5)', icon: <IconJewelry /> },
  { id: 'food',    label: 'Food & Kitchen', gradient: 'linear-gradient(135deg, #f7971e, #ffd200)', shadowColor: 'rgba(255,210,0,0.5)', icon: <IconFood /> },
  { id: 'art',     label: 'Art & Decor',    gradient: 'linear-gradient(135deg, #ee9ca7, #ffdde1)', shadowColor: 'rgba(238,156,167,0.5)', icon: <IconArt /> },
  { id: 'toys',    label: 'Kids & Toys',    gradient: 'linear-gradient(135deg, #6a11cb, #2575fc)', shadowColor: 'rgba(37,117,252,0.5)', icon: <IconToys /> },
  { id: 'tools',   label: 'Tools & DIY',    gradient: 'linear-gradient(135deg, #636e72, #b2bec3)', shadowColor: 'rgba(99,110,114,0.5)', icon: <IconTools /> },
  { id: 'nature',  label: 'Nature',         gradient: 'linear-gradient(135deg, #56ab2f, #a8e063)', shadowColor: 'rgba(86,171,47,0.5)', icon: <IconNature /> },
  { id: 'books',   label: 'Books',          gradient: 'linear-gradient(135deg, #f7971e, #e74c3c)', shadowColor: 'rgba(231,76,60,0.5)', icon: <IconBooks /> },
  { id: 'music',   label: 'Music',          gradient: 'linear-gradient(135deg, #1a1a2e, #6C5CE7)', shadowColor: 'rgba(108,92,231,0.6)', icon: <IconMusic /> },
  { id: 'car',     label: 'Automotive',     gradient: 'linear-gradient(135deg, #2c3e50, #4ca1af)', shadowColor: 'rgba(76,161,175,0.5)', icon: <IconCar /> },
  { id: 'travel',  label: 'Travel',         gradient: 'linear-gradient(135deg, #0072ff, #00c6ff)', shadowColor: 'rgba(0,198,255,0.5)', icon: <IconTravel /> },
  { id: 'watch',   label: 'Watches',        gradient: 'linear-gradient(135deg, #c6ea8d, #fe90af)', shadowColor: 'rgba(198,234,141,0.5)', icon: <IconWatch /> },
  { id: 'health',  label: 'Health',         gradient: 'linear-gradient(135deg, #f43b47, #453a94)', shadowColor: 'rgba(244,59,71,0.5)', icon: <IconHealth /> },
];

export const CATEGORY_ICONS_MAP = Object.fromEntries(CATEGORY_ICONS.map(i => [i.id, i]));
