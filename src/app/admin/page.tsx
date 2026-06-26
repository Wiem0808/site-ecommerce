'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import styles from './page.module.css';
import { useI18n } from '@/context/I18nContext';
import { useApi, apiCall } from '@/hooks/useApi';
import {
 LayoutDashboard, ShoppingBag, Tag, Package, BarChart3,
 LogOut, Plus, Pencil, Edit, Trash2, Check, X, Search, ChevronLeft, ChevronRight,
 AlertTriangle, TrendingUp, TrendingDown, RefreshCw, Eye, EyeOff,
 Lock, Mail, ArrowRight, Zap, Star, ShoppingCart, Upload, Save,
 PackagePlus, PackageCheck, PackageX, Truck, Clock, RotateCcw,
 Home, CreditCard, Banknote, MapPin, Camera, Palette, Shield, User,
 Ban, DollarSign, ChevronDown, Undo2,
} from 'lucide-react';
import { CategoryIconPicker, CategoryIconTile } from '@/components/CategoryIconPicker';
import { CATEGORY_ICONS } from '@/components/CategoryIcons';


interface Stat { label: string; value: string; change: string; icon: string; positive: boolean }
interface RecentOrder { id: string; orderNumber: string; status: string; total: number; paymentMethod: string; createdAt: string; user: { name: string; email: string }; items: { quantity: number; totalPrice: number }[] }
interface StatsResponse { stats: Stat[]; recentOrders: RecentOrder[]; weeklyChart: { day: string; count: number }[] }
interface StockAlert { product: { id: string; name: string; nameFr: string; nameAr: string; price: number; category: { icon: string; name: string } }; totalStock: number; variants: { name: string; stock: number }[] }
interface StockProduct {
 id: string; name: string; nameFr: string; nameAr: string;
 price: number; active: boolean; totalStock: number;
 category: { id: string; icon: string; name: string; nameFr: string; nameAr: string };
 variants: ProductVariant[];
 images: { url: string; alt: string | null }[];
}
interface OrdersResponse { orders: RecentOrder[]; pagination: { total: number; totalPages: number } }
interface Category { id: string; name: string; nameFr: string; nameAr: string; icon: string; gradient: string }
interface ProductImage { id: string; url: string; alt: string | null; sortOrder: number }
interface ProductVariant { id: string; type: string; name: string; value: string; stock: number }
interface Product {
 id: string; name: string; nameFr: string; nameAr: string;
 description: string; descriptionFr: string; descriptionAr: string;
 price: number; originalPrice: number | null; badge: string | null;
 categoryId: string; featured: boolean; active: boolean;
 countdownEnd: string | null;
 category: Category;
 images: ProductImage[]; variants: ProductVariant[];
}
interface ProductsResponse { products: Product[]; pagination: { total: number; totalPages: number } }

type Tab = 'overview' | 'products' | 'orders' | 'stock' | 'categories' | 'flash' | 'team';

interface StaffMember {
 id: string;
 name: string;
 email: string;
 phone: string | null;
 role: string;
 permissions: string | null; // JSON string of allowed tab IDs
 createdAt: string;
}

// All tabs that can be assigned to staff
const STAFF_TABS = [
 { id: 'overview', labelFr: "Vue d'ensemble", labelEn: 'Overview', labelEs: 'Resumen', labelAr: 'نظرة عامة', labelPt: 'Visão geral' },
 { id: 'products', labelFr: 'Produits', labelEn: 'Products', labelEs: 'Productos', labelAr: 'المنتجات', labelPt: 'Produtos' },
 { id: 'flash', labelFr: 'Vente Flash', labelEn: 'Flash Sale', labelEs: 'Venta Flash', labelAr: 'تخفيض فلاش', labelPt: 'Venda Flash' },
 { id: 'orders', labelFr: 'Commandes', labelEn: 'Orders', labelEs: 'Pedidos', labelAr: 'الطلبات', labelPt: 'Pedidos' },
 { id: 'stock', labelFr: 'Stock', labelEn: 'Stock Alerts', labelEs: 'Stock', labelAr: 'المخزون', labelPt: 'Estoque' },
];

const emptyForm = {
 name: '', nameFr: '', nameAr: '',
 description: '', descriptionFr: '', descriptionAr: '',
 price: 0, originalPrice: null as number | null, categoryId: '',
 badge: '', featured: false, active: true, countdownEnd: '',
 images: [] as { url: string; alt: string }[],
 variants: [] as { type: string; name: string; value: string; stock: number }[],
};

export default function AdminPage() {
 const { t, locale } = useI18n();
 const [activeTab, setActiveTab] = useState<Tab>('overview');
 const [orderPage, setOrderPage] = useState(1);
 const [productPage, setProductPage] = useState(1);
 const [productFilter, setProductFilter] = useState<'all' | 'visible' | 'hidden'>('all');
 const [showForm, setShowForm] = useState(false);
 const [editingId, setEditingId] = useState<string | null>(null);
 const [form, setForm] = useState({ ...emptyForm });
 const [uploading, setUploading] = useState(false);
 const [saving, setSaving] = useState(false);
 const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
 const fileInputRef = useRef<HTMLInputElement>(null);

 // Category management state
 const [showCatForm, setShowCatForm] = useState(false);
 const [editingCatId, setEditingCatId] = useState<string | null>(null);
 const [catForm, setCatForm] = useState({ name: '', nameFr: '', nameAr: '', icon: 'package', gradient: 'linear-gradient(135deg, #6C5CE7, #a29bfe)' });
 const [savingCat, setSavingCat] = useState(false);

 // Custom variant type input
 const [customVariantType, setCustomVariantType] = useState('');

 // Flash Sale state
 const [flashAddProductId, setFlashAddProductId] = useState('');
 const [flashDiscount, setFlashDiscount] = useState(20);
 const [flashEnd, setFlashEnd] = useState('');
 const [flashSaving, setFlashSaving] = useState(false);

 // Auth state
 const [isAuthenticated, setIsAuthenticated] = useState(false);
 const [adminRole, setAdminRole] = useState<'admin' | 'staff'>('admin');
 const [staffAllowedTabs, setStaffAllowedTabs] = useState<string[]>([]); // permissions for staff
 const [authLoading, setAuthLoading] = useState(true);
 const [loginForm, setLoginForm] = useState({ email: '', password: '' });
 const [loginError, setLoginError] = useState('');
 const [loginLoading, setLoginLoading] = useState(false);

 // Staff management state (admin only)
 const [staffForm, setStaffForm] = useState({ name: '', email: '', password: '', phone: '' });
 const [staffPermissions, setStaffPerms] = useState<string[]>(['overview','products','flash','orders','stock']);
 const [staffSaving, setStaffSaving] = useState(false);
 const [showStaffForm, setShowStaffForm] = useState(false);

 // Edit staff state
 const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
 const [editForm, setEditForm] = useState({ name: '', phone: '', password: '' });
 const [editPermissions, setEditPerms] = useState<string[]>([]);
 const [editSaving, setEditSaving] = useState(false);
 const [showEditPass, setShowEditPass] = useState(false);
 const [showNewPass, setShowNewPass] = useState(false);

 // Helper: check if current user can access a tab
 const canAccess = (tabId: string): boolean => {
 if (adminRole === 'admin') return true;
 return staffAllowedTabs.includes(tabId);
 };

 // Check auth on mount
 useEffect(() => {
 const token = localStorage.getItem('admin_token');
 const user = localStorage.getItem('admin_user');
 if (token && user) {
 try {
 const parsed = JSON.parse(user);
 if (parsed.role === 'admin' || parsed.role === 'staff') {
 setIsAuthenticated(true);
 setAdminRole(parsed.role as 'admin' | 'staff');
 // Load staff permissions
 if (parsed.role === 'staff' && parsed.permissions) {
 try {
 const perms = typeof parsed.permissions === 'string'
 ? JSON.parse(parsed.permissions)
 : parsed.permissions;
 setStaffAllowedTabs(Array.isArray(perms) ? perms : []);
 } catch { setStaffAllowedTabs([]); }
 }
 }
 } catch { /* invalid */ }
 }
 setAuthLoading(false);
 }, []);

 const handleLogin = async (e: React.FormEvent) => {
 e.preventDefault();
 setLoginLoading(true);
 setLoginError('');
 try {
 const res = await fetch('/api/auth', {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({ action: 'login', ...loginForm }),
 });
 const data = await res.json();
 if (!res.ok) throw new Error(data.error || 'Login failed');
 if (data.user.role !== 'admin' && data.user.role !== 'staff') {
 throw new Error(locale === 'fr' ? 'Accès refusé. Compte non autorisé.' : locale === 'ar' ? 'تم رفض الوصول.' : locale === 'es' ? 'Acceso denegado.' : locale === 'pt' ? 'Acesso negado.' : 'Access denied.');
 }
 localStorage.setItem('admin_token', data.token);
 localStorage.setItem('admin_user', JSON.stringify(data.user));
 setIsAuthenticated(true);
 setAdminRole(data.user.role as 'admin' | 'staff');
 // Load staff permissions immediately after login
 if (data.user.role === 'staff' && data.user.permissions) {
 try {
 const perms = typeof data.user.permissions === 'string'
 ? JSON.parse(data.user.permissions)
 : data.user.permissions;
 setStaffAllowedTabs(Array.isArray(perms) ? perms : []);
 } catch { setStaffAllowedTabs([]); }
 }
 } catch (err) {
 setLoginError(err instanceof Error ? err.message : 'Login failed');
 } finally {
 setLoginLoading(false);
 }
 };

 const handleLogout = () => {
 localStorage.removeItem('admin_token');
 localStorage.removeItem('admin_user');
 setIsAuthenticated(false);
 };

 // Stock management state
 const [stockView, setStockView] = useState<'all' | 'alerts'>('all');
 const [stockSearch, setStockSearch] = useState('');
 const [stockEdits, setStockEdits] = useState<Record<string, number>>({});
 const [expandedProduct, setExpandedProduct] = useState<string | null>(null);
 const [savingStock, setSavingStock] = useState(false);
 const [addingVariant, setAddingVariant] = useState<string | null>(null);
 const [newVariant, setNewVariant] = useState({ type: 'size', name: '', value: '', stock: 10 });

 const { data: statsData, loading: statsLoading, refetch: refetchStats } = useApi<StatsResponse>(isAuthenticated ? '/api/admin/stats' : null);
 const { data: stockAlerts, refetch: refetchStockAlerts } = useApi<StockAlert[]>(isAuthenticated ? '/api/stock?threshold=50' : null);
 const { data: allStockProducts, refetch: refetchAllStock } = useApi<StockProduct[]>(isAuthenticated ? `/api/stock?mode=all${stockSearch ? `&search=${stockSearch}` : ''}` : null);
 const { data: ordersData, refetch: refetchOrders } = useApi<OrdersResponse>(isAuthenticated ? `/api/orders?page=${orderPage}&limit=10` : null);
 const { data: productsData, refetch: refetchProducts } = useApi<ProductsResponse>(isAuthenticated ? `/api/products?page=${productPage}&limit=12&sort=createdAt&order=desc` : null);
 const { data: categories, refetch: refetchCategories } = useApi<Category[]>(isAuthenticated ? '/api/categories' : null);
 // Flash sale — all products for picker + current flash items
 const { data: allProductsForFlash, refetch: refetchAllProducts } = useApi<{ products: Product[] }>(isAuthenticated ? '/api/products?limit=200&sort=name&order=asc' : null);
 const { data: flashProducts, refetch: refetchFlash } = useApi<Product[]>(isAuthenticated ? '/api/flash-sale' : null);
 // Staff — admin only
 const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
 const { data: staffList, refetch: refetchStaff } = useApi<StaffMember[]>(isAuthenticated && adminRole === 'admin' ? '/api/admin/staff' : null);

 // Auto-refresh stats every 30s
 useEffect(() => {
 if (!isAuthenticated) return;
 const interval = setInterval(() => {
 if (activeTab === 'overview') refetchStats();
 }, 30000);
 return () => clearInterval(interval);
 }, [isAuthenticated, activeTab, refetchStats]);

 const getName = (item: { name: string; nameFr: string; nameAr: string }) =>
 locale === 'ar' ? item.nameAr : locale === 'fr' ? item.nameFr : item.name;

 const showToast = (msg: string, type: 'success' | 'error') => {
 setToast({ msg, type });
 setTimeout(() => setToast(null), 3000);
 };

 // Category CRUD 
 const defaultCatIcon = CATEGORY_ICONS[0];
 const emptyCatForm = { name: '', nameFr: '', nameAr: '', icon: defaultCatIcon.id, gradient: defaultCatIcon.gradient };

 const saveCat = async () => {
 setSavingCat(true);
 try {
 if (editingCatId) {
 await apiCall(`/api/categories/${editingCatId}`, 'PUT', catForm);
 showToast(locale === 'fr' ? 'Catégorie modifiée !' : 'Category updated!', 'success');
 } else {
 await apiCall('/api/categories', 'POST', catForm);
 showToast(locale === 'fr' ? 'Catégorie créée !' : 'Category created!', 'success');
 }
 setCatForm({ ...emptyCatForm });
 setShowCatForm(false);
 setEditingCatId(null);
 refetchCategories();
 } catch (err) {
 showToast(err instanceof Error ? err.message : 'Error', 'error');
 } finally { setSavingCat(false); }
 };

 const deleteCat = async (id: string, name: string) => {
 if (!confirm(locale === 'fr' ? `Supprimer la catégorie "${name}" ?` : `Delete category "${name}"?`)) return;
 try {
 await apiCall(`/api/categories/${id}`, 'DELETE');
 showToast(locale === 'fr' ? 'Catégorie supprimée' : 'Category deleted', 'success');
 refetchCategories();
 } catch (err) {
 showToast(err instanceof Error ? err.message : 'Error', 'error');
 }
 };

 const editCat = (cat: Category) => {
 setCatForm({ name: cat.name, nameFr: cat.nameFr, nameAr: cat.nameAr, icon: cat.icon, gradient: cat.gradient });
 setEditingCatId(cat.id);
 setShowCatForm(true);
 };

 // Order status update 
 const updateOrderStatus = async (orderId: string, status: string) => {
 try {
 await apiCall(`/api/orders/${orderId}`, 'PATCH', { status });
 refetchOrders();
 showToast('Order status updated', 'success');
 } catch (err) {
 showToast(err instanceof Error ? err.message : 'Failed to update', 'error');
 }
 };

 // Image upload 
 const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
 const files = e.target.files;
 if (!files || files.length === 0) return;
 setUploading(true);
 try {
 for (const file of Array.from(files)) {
 const formData = new FormData();
 formData.append('file', file);
 const res = await fetch('/api/upload', { method: 'POST', body: formData });
 const data = await res.json();
 if (!res.ok) throw new Error(data.error || 'Upload failed');
 setForm(prev => ({
 ...prev,
 images: [...prev.images, { url: data.url, alt: prev.name || file.name }],
 }));
 }
 showToast('Image(s) uploaded!', 'success');
 } catch (err) {
 showToast(err instanceof Error ? err.message : 'Erreur upload', 'error');
 } finally {
 setUploading(false);
 if (fileInputRef.current) fileInputRef.current.value = '';
 }
 };

 const removeImage = (idx: number) => {
 setForm(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }));
 };

 // ——— Variant management ———
 const addVariant = (type: string) => {
 setForm(prev => ({
 ...prev,
 variants: [...prev.variants, { type, name: '', value: type === 'color' ? '#6C5CE7' : '', stock: 10 }],
 }));
 };

 const updateVariant = (idx: number, field: string, value: string | number) => {
 setForm(prev => ({
 ...prev,
 variants: prev.variants.map((v, i) => i === idx ? { ...v, [field]: value } : v),
 }));
 };

 const removeVariant = (idx: number) => {
 setForm(prev => ({ ...prev, variants: prev.variants.filter((_, i) => i !== idx) }));
 };

 // ——— Load product for editing ———
 const editProduct = (product: Product) => {
 setEditingId(product.id);
 setForm({
 name: product.name,
 nameFr: product.nameFr,
 nameAr: product.nameAr,
 description: product.description,
 descriptionFr: product.descriptionFr,
 descriptionAr: product.descriptionAr,
 price: product.price,
 originalPrice: product.originalPrice,
 categoryId: product.categoryId,
 badge: product.badge || '',
 featured: product.featured,
 active: product.active,
 countdownEnd: product.countdownEnd ? product.countdownEnd.substring(0, 16) : '',
 images: product.images.map(img => ({ url: img.url, alt: img.alt || '' })),
 variants: product.variants.map(v => ({ type: v.type, name: v.name, value: v.value, stock: v.stock })),
 });
 setShowForm(true);
 };

 // ——— Create new product ———
 const newProduct = () => {
 setEditingId(null);
 setForm({ ...emptyForm, categoryId: categories?.[0]?.id || '' });
 setShowForm(true);
 };

 // ——— Save product (create or update) ———
 const saveProduct = async () => {
 if (!form.name || !form.price || !form.categoryId) {
 showToast('Please fill required fields (name, price, category)', 'error');
 return;
 }
 setSaving(true);
 try {
 const payload = {
 ...form,
 price: Number(form.price),
 originalPrice: form.originalPrice ? Number(form.originalPrice) : null,
 badge: form.badge || null,
 countdownEnd: form.countdownEnd || null,
 };

 if (editingId) {
 await apiCall(`/api/products/${editingId}`, 'PUT', payload);
 showToast('Product updated!', 'success');
 } else {
 await apiCall('/api/products', 'POST', payload);
 showToast('Product created!', 'success');
 }
 setShowForm(false);
 setEditingId(null);
 refetchProducts();
 } catch (err) {
 showToast(err instanceof Error ? err.message : 'Save failed', 'error');
 } finally {
 setSaving(false);
 }
 };

 // ——— Delete product ———
 const deleteProduct = async (id: string, name: string) => {
 if (!confirm(`Are you sure you want to delete "${name}"?`)) return;
 try {
 await apiCall(`/api/products/${id}?hard=true`, 'DELETE');
 showToast('Product deleted!', 'success');
 refetchProducts();
 } catch (err) {
 showToast(err instanceof Error ? err.message : 'Delete failed', 'error');
 }
 };

 // ——— Toggle active/featured ———
 const toggleField = async (id: string, field: 'active' | 'featured', current: boolean) => {
 try {
 await apiCall(`/api/products/${id}`, 'PUT', { [field]: !current });
 refetchProducts();
 } catch (err) {
 showToast(err instanceof Error ? err.message : 'Update failed', 'error');
 }
 };

 // ——— Flash Sale: Add/Remove ———
 const addToFlashSale = async () => {
 if (!flashAddProductId || !flashEnd) {
 showToast(locale === 'fr' ? 'Choisissez un produit et une date de fin' : 'Choose a product and end date', 'error');
 return;
 }
 setFlashSaving(true);
 try {
 await apiCall('/api/flash-sale', 'POST', {
 productId: flashAddProductId,
 countdownEnd: flashEnd,
 discountPercent: flashDiscount,
 });
 showToast(locale === 'fr' ? 'Produit ajouté à la vente flash !' : 'Product added to flash sale!', 'success');
 setFlashAddProductId('');
 setFlashEnd('');
 setFlashDiscount(20);
 refetchFlash();
 refetchAllProducts();
 refetchProducts();
 } catch (err) {
 showToast(err instanceof Error ? err.message : 'Error', 'error');
 } finally { setFlashSaving(false); }
 };

 const removeFromFlashSale = async (productId: string, name: string) => {
 if (!confirm(locale === 'fr' ? `Retirer "${name}" de la vente flash ?` : `Remove "${name}" from flash sale?`)) return;
 try {
 await apiCall('/api/flash-sale', 'DELETE', { productId });
 showToast(locale === 'fr' ? 'Produit retiré de la vente flash' : 'Product removed from flash sale', 'success');
 refetchFlash();
 refetchAllProducts();
 refetchProducts();
 } catch (err) {
 showToast(err instanceof Error ? err.message : 'Error', 'error');
 }
 };

 const statusColor = (status: string) => {
 const colors: Record<string, string> = {
 pending: '#fdcb6e', confirmed: '#6C5CE7', processing: '#0984e3',
 shipped: '#00b894', out_for_delivery: '#e17055', delivered: '#00b894', cancelled: '#d63031',
 };
 return colors[status] || '#636e72';
 };

 // Staff CRUD (admin only) 
 const createStaff = async () => {
 if (!staffForm.name || !staffForm.email || !staffForm.password) {
 showToast(locale === 'fr' ? 'Nom, email et mot de passe requis' : 'Name, email and password required', 'error');
 return;
 }
 setStaffSaving(true);
 try {
 const res = await fetch('/api/admin/staff', {
 method: 'POST',
 headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
 body: JSON.stringify({ ...staffForm, permissions: staffPermissions }),
 });
 const data = await res.json();
 if (!res.ok) throw new Error(data.error || 'Error');
 showToast(locale === 'fr' ? 'Employé créé avec succès' : 'Employee created', 'success');
 setStaffForm({ name: '', email: '', password: '', phone: '' });
 setStaffPerms(['overview','products','flash','orders','stock']);
 setShowStaffForm(false);
 refetchStaff();
 } catch (err) {
 showToast(err instanceof Error ? err.message : 'Error', 'error');
 } finally { setStaffSaving(false); }
 };

 const openEditStaff = (staff: StaffMember) => {
 setEditingStaff(staff);
 setEditForm({ name: staff.name, phone: staff.phone || '', password: '' });
 try {
 setEditPerms(staff.permissions ? JSON.parse(staff.permissions) : ['overview','products','flash','orders','stock']);
 } catch { setEditPerms(['overview','products','flash','orders','stock']); }
 };

 const saveEditStaff = async () => {
 if (!editingStaff) return;
 setEditSaving(true);
 try {
 const res = await fetch('/api/admin/staff', {
 method: 'PATCH',
 headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
 body: JSON.stringify({
 staffId: editingStaff.id,
 name: editForm.name || undefined,
 phone: editForm.phone,
 password: editForm.password || undefined,
 permissions: editPermissions,
 }),
 });
 const data = await res.json();
 if (!res.ok) throw new Error(data.error || 'Error');
 showToast(locale === 'fr' ? 'Employé modifié' : 'Employee updated', 'success');
 setEditingStaff(null);
 refetchStaff();
 } catch (err) {
 showToast(err instanceof Error ? err.message : 'Error', 'error');
 } finally { setEditSaving(false); }
 };

 const toggleEditPerm = (tabId: string) => {
 setEditPerms(prev =>
 prev.includes(tabId) ? prev.filter(p => p !== tabId) : [...prev, tabId]
 );
 };

 const toggleNewPerm = (tabId: string) => {
 setStaffPerms(prev =>
 prev.includes(tabId) ? prev.filter(p => p !== tabId) : [...prev, tabId]
 );
 };

 const deleteStaff = async (staffId: string, name: string) => {
 if (!confirm(locale === 'fr' ? `Supprimer l'employé "${name}" ?` : `Delete employee "${name}"?`)) return;
 try {
 const res = await fetch('/api/admin/staff', {
 method: 'DELETE',
 headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
 body: JSON.stringify({ staffId }),
 });
 const data = await res.json();
 if (!res.ok) throw new Error(data.error || 'Error');
 showToast(locale === 'fr' ? 'Employé supprimé' : 'Employee deleted', 'success');
 refetchStaff();
 } catch (err) {
 showToast(err instanceof Error ? err.message : 'Error', 'error');
 }
 };

 const chartMax = Math.max(...(statsData?.weeklyChart.map(d => d.count) || [1]));

 // Auth Loading 
 if (authLoading) {
 return (
 <main className={styles.main}>
 <div className={styles.authLoading}>
 <div className={styles.authSpinner} />
 <p>{locale === 'fr' ? 'Chargement...' : 'Loading...'}</p>
 </div>
 </main>
 );
 }

 // Login Screen 
 if (!isAuthenticated) {
 return (
 <main className={styles.main}>
 <div className={styles.loginWrapper}>
 <form className={styles.loginCard} onSubmit={handleLogin}>
 <div className={styles.loginHeader}>
 <Image
 src="/logo-wiw.png"
 alt="WIWISHOP"
 width={180}
 height={56}
 className={styles.loginLogoImg}
 priority
 unoptimized
 />
 <p className={styles.loginSubtitle}>{locale === 'fr' ? 'Connectez-vous pour gérer votre boutique' : 'Sign in to manage your store'}</p>
 </div>
 {loginError && (
 <div className={styles.loginError}>
 <X size={14} /> {loginError}
 </div>
 )}
 <div className={styles.loginField}>
 <label>{locale === 'fr' ? 'Email' : 'Email'}</label>
 <input
 type="email"
 required
 value={loginForm.email}
 onChange={e => setLoginForm(p => ({ ...p, email: e.target.value }))}
 placeholder="admin@wiwishop.com"
 />
 </div>
 <div className={styles.loginField}>
 <label>{t('admin.login_password')}</label>
 <input
 type="password"
 required
 value={loginForm.password}
 onChange={e => setLoginForm(p => ({ ...p, password: e.target.value }))}
 placeholder="••••••••"
 />
 </div>
 <button type="submit" className={styles.loginBtn} disabled={loginLoading}>
 {loginLoading ? <RefreshCw size={16} className={styles.spin} /> : <Lock size={16} />}
 {locale === 'fr' ? t('admin.login_btn') : t('admin.login_btn')}
 {!loginLoading && <ArrowRight size={16} />}
 </button>
 </form>
 </div>
 </main>
 );
 }

 return (
 <main className={styles.main}>
 {/* Toast */}
 {toast && (
 <div className={`${styles.toast} ${styles[toast.type]}`}>
 {toast.type === 'success' ? <Check size={15} /> : <X size={15} />} {toast.msg}
 </div>
 )}

 <div className={styles.adminLayout}>
 {/* Sidebar */}
 <aside className={styles.sidebar}>
 <div className={styles.sidebarLogo}>
 <Image src="/logo-wiw.png" alt="WIWISHOP" width={100} height={32} className={styles.sidebarLogoImg} unoptimized />
 <span className={`${styles.adminBadge} ${adminRole === 'staff' ? styles.staffBadge : ''}`}>
 {adminRole === 'admin' ? 'ADMIN' : 'STAFF'}
 </span>
 </div>
 <nav className={styles.sidebarNav}>
 {([
 { id: 'overview' as const, icon: <LayoutDashboard size={17} />, label: t('overview') || 'Overview', adminOnly: false },
 { id: 'products' as const, icon: <ShoppingBag size={17} />, label: t('products_mgmt') || 'Products', adminOnly: false },
 { id: 'flash' as const, icon: <Zap size={17} />, label: t('admin.flash_sale'), adminOnly: false },
 { id: 'orders' as const, icon: <Package size={17} />, label: t('orders') || 'Orders', adminOnly: false },
 { id: 'stock' as const, icon: <BarChart3 size={17} />, label: t('stock') || 'Stock Alerts', adminOnly: false },
 { id: 'categories' as const, icon: <Tag size={17} />, label: t('admin.categories'), adminOnly: true },
 { id: 'team' as const, icon: <Star size={17} />, label: t('admin.team'), adminOnly: true },
 ] as { id: Tab; icon: React.ReactNode; label: string; adminOnly: boolean }[])
 .filter(item => {
 // Admin-only tabs hidden from staff
 if (item.adminOnly && adminRole !== 'admin') return false;
 // For staff: only show tabs they have permission for
 if (adminRole === 'staff' && !canAccess(item.id)) return false;
 return true;
 })
 .map(item => (
 <button
 key={item.id}
 className={`${styles.navItem} ${activeTab === item.id ? styles.navActive : ''}`}
 onClick={() => { setActiveTab(item.id); setShowForm(false); }}
 >
 {item.icon} {item.label}
 </button>
 ))}
 </nav>

 {/* ——— Site Links ——— */}
 <div className={styles.sidebarDivider} />
 <div className={styles.siteLinks}>
 <p className={styles.siteLinksLabel}>
 {t('admin.view_site')}
 </p>
 <a href="/" target="_blank" rel="noreferrer" className={styles.siteLinkItem}>
 <Home size={15} /> {t('nav.home')}
 </a>
 <a href="/catalogue" target="_blank" rel="noreferrer" className={styles.siteLinkItem}>
 <ShoppingBag size={15} /> Catalogue
 </a>
 <a href="/tracking" target="_blank" rel="noreferrer" className={styles.siteLinkItem}>
 <MapPin size={15} /> {t('admin.tracking_lbl')}
 </a>
 </div>

 <div className={styles.sidebarDivider} />
 <button className={styles.logoutBtn} onClick={handleLogout}>
 <LogOut size={16} /> {t('admin.logout')}
 </button>
 </aside>

 {/* Content */}
 <div className={styles.content}>
 <header className={styles.header}>
 <h1>{
 activeTab === 'overview' ? (t('dashboard') || 'Dashboard')
 : activeTab === 'products' ? (t('products_mgmt') || 'Product Management')
 : activeTab === 'flash' ? t('admin.flash_title')
 : activeTab === 'categories' ? t('admin.cat_title')
 : activeTab === 'orders' ? (t('all_orders') || 'All Orders')
 : activeTab === 'team' ? t('admin.team_title')
 : (t('low_stock') || 'Stock Alerts')
 }</h1>
 <span className={styles.headerDate}>{new Date().toLocaleDateString(
 locale === 'fr' ? 'fr-FR' : locale === 'ar' ? 'ar-DZ' : locale === 'es' ? 'es-ES' : locale === 'pt' ? 'pt-BR' : 'en-US',
 { dateStyle: 'long' }
 )}</span>
 </header>

 {/* OVERVIEW TAB */}
 {activeTab === 'overview' && (
 <>
 <div className={styles.statsGrid}>
 {statsLoading ? (
 [1, 2, 3, 4].map(i => <div key={i} className={styles.statCardSkeleton} />)
 ) : (
 statsData?.stats.map(stat => (
 <div key={stat.label} className={styles.statCard}>
 <span className={styles.statIcon}>{stat.icon}</span>
 <div className={styles.statInfo}>
 <span className={styles.statValue}>{stat.value}</span>
 <span className={styles.statLabel}>{t(stat.label) || stat.label}</span>
 </div>
 <span className={`${styles.statChange} ${stat.positive ? styles.positive : styles.negative}`}>
 {stat.change}
 </span>
 </div>
 ))
 )}
 </div>
 <div className={styles.overviewGrid}>
 <div className={styles.card}>
 <h3>{t('weekly_orders') || 'Weekly Orders'}</h3>
 <div className={styles.chart}>
 {statsData?.weeklyChart.map(bar => (
 <div key={bar.day} className={styles.chartBar}>
 <div className={styles.barFill} style={{ height: `${(bar.count / chartMax) * 100}%` }}>
 <span className={styles.barValue}>{bar.count}</span>
 </div>
 <span className={styles.barLabel}>{bar.day}</span>
 </div>
 ))}
 </div>
 </div>
 <div className={styles.card}>
 <h3>{t('recent_orders') || 'Recent Orders'}</h3>
 <div className={styles.recentList}>
 {statsData?.recentOrders.map(order => (
 <div key={order.id} className={styles.recentItem}>
 <div className={styles.recentAvatar}>{order.user.name[0]}</div>
 <div className={styles.recentInfo}>
 <strong>{order.user.name}</strong>
 <small>{order.orderNumber}</small>
 </div>
 <span className={styles.recentAmount}>${order.total.toFixed(2)}</span>
 <span className={styles.statusDot} style={{ backgroundColor: statusColor(order.status) }} title={order.status} />
 </div>
 ))}
 {(!statsData?.recentOrders || statsData.recentOrders.length === 0) && (
 <p className={styles.empty}>{t('no_orders') || 'No orders yet'}</p>
 )}
 </div>
 </div>
 </div>
 </>
 )}

 {/* ••• TEAM TAB (admin only) ••• */}
 {activeTab === 'team' && adminRole === 'admin' && (
 <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

 {/* Edit Staff Modal */}
 {editingStaff && (
 <div style={{
 position: 'fixed', inset: 0, zIndex: 1000,
 background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(12px)',
 display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
 animation: 'fadeIn 0.2s ease',
 }}>
 <div style={{
 background: 'linear-gradient(160deg, rgba(30,26,60,0.98) 0%, rgba(20,18,46,0.99) 100%)',
 borderRadius: 24,
 border: '1px solid rgba(108,92,231,0.25)',
 padding: 32, maxWidth: 560, width: '100%',
 boxShadow: '0 32px 100px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04) inset',
 }}>
 {/* Modal Header */}
 <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28 }}>
 <div style={{
 width: 46, height: 46, borderRadius: 14, flexShrink: 0,
 background: 'linear-gradient(135deg, #6C5CE7, #a29bfe)',
 display: 'flex', alignItems: 'center', justifyContent: 'center',
 color: 'white', fontWeight: 800, fontSize: '1rem',
 boxShadow: '0 4px 16px rgba(108,92,231,0.4)',
 }}>
 {editingStaff.name.split(' ').map((n: string) => n[0]).join('').slice(0,2).toUpperCase()}
 </div>
 <div style={{ flex: 1 }}>
 <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
 {t('admin.edit_profile')}
 </h3>
 <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>{editingStaff.email}</p>
 </div>
 <button onClick={() => setEditingStaff(null)} style={{
 background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
 borderRadius: 10, width: 36, height: 36, cursor: 'pointer',
 color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center',
 transition: 'all 0.2s',
 }} onMouseEnter={e => (e.currentTarget.style.background='rgba(214,48,49,0.15)')} onMouseLeave={e => (e.currentTarget.style.background='rgba(255,255,255,0.06)')}>
 <X size={16} />
 </button>
 </div>

 {/* Divider */}
 <div style={{ height: 1, background: 'linear-gradient(90deg, rgba(108,92,231,0.4), transparent)', marginBottom: 24 }} />

 {/* Edit fields */}
 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
 <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
 <label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'rgba(162,155,254,0.8)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
 {t('admin.full_name')}
 </label>
 <input
 value={editForm.name}
 onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))}
 style={{
 padding: '11px 14px', background: 'rgba(255,255,255,0.05)',
 border: '1px solid rgba(108,92,231,0.3)', borderRadius: 12,
 color: 'var(--text-primary)', fontSize: '0.9rem', outline: 'none',
 transition: 'all 0.2s',
 }}
 onFocus={e => { e.target.style.borderColor='#6C5CE7'; e.target.style.boxShadow='0 0 0 3px rgba(108,92,231,0.15)'; }}
 onBlur={e => { e.target.style.borderColor='rgba(108,92,231,0.3)'; e.target.style.boxShadow='none'; }}
 />
 </div>
 <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
 <label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'rgba(162,155,254,0.8)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Email</label>
 <input
 value={editingStaff.email} disabled
 style={{
 padding: '11px 14px', background: 'rgba(255,255,255,0.02)',
 border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12,
 color: 'var(--text-muted)', fontSize: '0.9rem', outline: 'none', cursor: 'not-allowed',
 }}
 />
 </div>
 <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
 <label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'rgba(162,155,254,0.8)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
 {t('admin.phone')}
 </label>
 <input
 type="tel" value={editForm.phone}
 onChange={e => setEditForm(p => ({ ...p, phone: e.target.value }))}
 placeholder="+213 XX XX XX XX"
 style={{
 padding: '11px 14px', background: 'rgba(255,255,255,0.05)',
 border: '1px solid rgba(108,92,231,0.3)', borderRadius: 12,
 color: 'var(--text-primary)', fontSize: '0.9rem', outline: 'none',
 transition: 'all 0.2s',
 }}
 onFocus={e => { e.target.style.borderColor='#6C5CE7'; e.target.style.boxShadow='0 0 0 3px rgba(108,92,231,0.15)'; }}
 onBlur={e => { e.target.style.borderColor='rgba(108,92,231,0.3)'; e.target.style.boxShadow='none'; }}
 />
 </div>
 <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
 <label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'rgba(162,155,254,0.8)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
 {t('admin.new_password')} <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>({t('admin.optional')})</span>
 </label>
 <div style={{ position: 'relative' }}>
 <input
 type={showEditPass ? 'text' : 'password'} value={editForm.password}
 onChange={e => setEditForm(p => ({ ...p, password: e.target.value }))}
 placeholder="••••••••" minLength={6}
 style={{
 width: '100%', padding: '11px 44px 11px 14px', background: 'rgba(255,255,255,0.05)',
 border: '1px solid rgba(108,92,231,0.3)', borderRadius: 12,
 color: 'var(--text-primary)', fontSize: '0.9rem', outline: 'none',
 transition: 'all 0.2s', boxSizing: 'border-box',
 }}
 onFocus={e => { e.target.style.borderColor='#6C5CE7'; e.target.style.boxShadow='0 0 0 3px rgba(108,92,231,0.15)'; }}
 onBlur={e => { e.target.style.borderColor='rgba(108,92,231,0.3)'; e.target.style.boxShadow='none'; }}
 />
 <button
 type="button"
 onClick={() => setShowEditPass(p => !p)}
 style={{
 position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
 background: 'transparent', border: 'none', cursor: 'pointer',
 color: showEditPass ? '#a29bfe' : 'var(--text-muted)',
 display: 'flex', alignItems: 'center', padding: 4,
 transition: 'color 0.2s',
 }}
 title={showEditPass ? (locale === 'fr' ? 'Masquer' : 'Hide') : (locale === 'fr' ? 'Afficher' : 'Show')}
 >
 {showEditPass ? <EyeOff size={16} /> : <Eye size={16} />}
 </button>
 </div>
 </div>

 </div>

 {/* Permissions */}
 <div style={{
 background: 'rgba(108,92,231,0.06)', borderRadius: 16,
 border: '1px solid rgba(108,92,231,0.15)', padding: '18px 20px', marginBottom: 24
 }}>
 <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
 <div style={{
 width: 28, height: 28, borderRadius: 8,
 background: 'linear-gradient(135deg, rgba(108,92,231,0.3), rgba(162,155,254,0.2))',
 display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem',
 }}><Shield size={14} /></div>
 <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>
 {t('admin.permissions')}
 </span>
 </div>
 <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
 {STAFF_TABS.map((tab, idx) => {
 const allowed = editPermissions.includes(tab.id);
 const colors = [
 { on: '#6C5CE7', bg: 'rgba(108,92,231,0.15)', border: 'rgba(108,92,231,0.4)' },
 { on: '#00b894', bg: 'rgba(0,184,148,0.15)', border: 'rgba(0,184,148,0.4)' },
 { on: '#e17055', bg: 'rgba(225,112,85,0.15)', border: 'rgba(225,112,85,0.4)' },
 { on: '#fdcb6e', bg: 'rgba(253,203,110,0.15)', border: 'rgba(253,203,110,0.4)' },
 { on: '#a29bfe', bg: 'rgba(162,155,254,0.15)', border: 'rgba(162,155,254,0.4)' },
 ];
 const c = colors[idx % colors.length];
 return (
 <button key={tab.id} onClick={() => toggleEditPerm(tab.id)} style={{
 padding: '7px 16px', borderRadius: 20, border: '1.5px solid',
 cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700,
 transition: 'all 0.2s',
 background: allowed ? c.bg : 'rgba(255,255,255,0.04)',
 borderColor: allowed ? c.border : 'rgba(255,255,255,0.1)',
 color: allowed ? c.on : 'rgba(255,255,255,0.35)',
 transform: allowed ? 'scale(1.02)' : 'scale(1)',
 boxShadow: allowed ? `0 2px 8px ${c.bg}` : 'none',
 }}>
 {allowed ? '' : ''} {locale === 'ar' ? tab.labelAr : locale === 'es' ? tab.labelEs : locale === 'pt' ? tab.labelPt : locale === 'fr' ? tab.labelFr : tab.labelEn}
 </button>
 );
 })}
 </div>
 </div>

 {/* Actions */}
 <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
 <button onClick={() => setEditingStaff(null)} style={{
 padding: '10px 20px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.12)',
 background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)',
 fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
 display: 'flex', alignItems: 'center', gap: 6,
 }} onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.09)'}
 onMouseLeave={e => e.currentTarget.style.background='rgba(255,255,255,0.05)'}>
 <X size={14} /> {t('admin.cancel')}
 </button>
 <button onClick={saveEditStaff} disabled={editSaving} style={{
 padding: '10px 22px', borderRadius: 12, border: 'none',
 background: 'linear-gradient(135deg, #6C5CE7, #a29bfe)',
 color: 'white', fontSize: '0.85rem', fontWeight: 700,
 cursor: 'pointer', transition: 'all 0.2s',
 display: 'flex', alignItems: 'center', gap: 6,
 boxShadow: '0 4px 16px rgba(108,92,231,0.4)',
 opacity: editSaving ? 0.7 : 1,
 }} onMouseEnter={e => { if (!editSaving) e.currentTarget.style.transform='translateY(-2px)'; }}
 onMouseLeave={e => e.currentTarget.style.transform='translateY(0)'}>
 {editSaving ? <RefreshCw size={14} className={styles.spin} /> : <Check size={14} />}
 {t('admin.save_changes')}
 </button>
 </div>
 </div>
 </div>
 )}

 {/* Create Staff Card */}
 <div style={{
 background: 'var(--surface-container)',
 border: '1px solid var(--border-subtle)',
 borderRadius: 20, padding: 24, marginBottom: 0,
 transition: 'all 0.3s',
 }}>
 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
 <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
 <div style={{
 width: 40, height: 40, borderRadius: 12,
 background: 'linear-gradient(135deg, rgba(108,92,231,0.2), rgba(162,155,254,0.1))',
 border: '1px solid rgba(108,92,231,0.25)',
 display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem'
 }}><User size={18} /></div>
 <div>
 <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
 {t('admin.new_employee')}
 </h3>
 <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>
 {locale === 'fr' ? t('admin.new_employee') : t('admin.new_employee')}
 </p>
 </div>
 </div>
 <button onClick={() => setShowStaffForm(p => !p)} style={{
 padding: '9px 18px', borderRadius: 12, border: 'none',
 background: showStaffForm ? 'rgba(255,255,255,0.08)' : 'linear-gradient(135deg, #6C5CE7, #a29bfe)',
 color: 'white', fontSize: '0.83rem', fontWeight: 700,
 cursor: 'pointer', transition: 'all 0.2s',
 display: 'flex', alignItems: 'center', gap: 7,
 boxShadow: showStaffForm ? 'none' : '0 4px 15px rgba(108,92,231,0.35)',
 }}>
 {showStaffForm ? <X size={14} /> : <Plus size={14} />}
 {showStaffForm ? t('admin.cancel') : t('admin.new_employee')}
 </button>
 </div>

 {showStaffForm && (
 <div style={{ marginTop: 24 }}>
 <div style={{ height: 1, background: 'linear-gradient(90deg, rgba(108,92,231,0.4), transparent)', marginBottom: 24 }} />
 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
 {[
 { label: `${t('admin.full_name')} *`, type: 'text', key: 'name', placeholder: locale === 'fr' ? 'Sophie Martin' : 'John Smith' },
 { label: 'Email *', type: 'email', key: 'email', placeholder: 'employe@wiwishop.com' },
 { label: t('admin.phone'), type: 'tel', key: 'phone', placeholder: '+213 XX XX XX XX' },
 { label: `${t('admin.login_password')} *`, type: 'password', key: 'password', placeholder: '••••••••' },
 ].map(({ label, type, key, placeholder }) => (
 <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
 <label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'rgba(162,155,254,0.8)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</label>
 {key === 'password' ? (
 <div style={{ position: 'relative' }}>
 <input
 type={showNewPass ? 'text' : 'password'} placeholder={placeholder}
 value={(staffForm as Record<string, string>)[key]}
 onChange={e => setStaffForm(p => ({ ...p, [key]: e.target.value }))}
 style={{
 width: '100%', padding: '11px 44px 11px 14px', background: 'rgba(255,255,255,0.05)',
 border: '1px solid rgba(108,92,231,0.25)', borderRadius: 12,
 color: 'var(--text-primary)', fontSize: '0.9rem', outline: 'none',
 transition: 'all 0.2s', boxSizing: 'border-box',
 }}
 onFocus={e => { e.target.style.borderColor='#6C5CE7'; e.target.style.boxShadow='0 0 0 3px rgba(108,92,231,0.15)'; }}
 onBlur={e => { e.target.style.borderColor='rgba(108,92,231,0.25)'; e.target.style.boxShadow='none'; }}
 />
 <button
 type="button"
 onClick={() => setShowNewPass(p => !p)}
 style={{
 position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
 background: 'transparent', border: 'none', cursor: 'pointer',
 color: showNewPass ? '#a29bfe' : 'var(--text-muted)',
 display: 'flex', alignItems: 'center', padding: 4,
 transition: 'color 0.2s',
 }}
 title={showNewPass ? (locale === 'fr' ? 'Masquer' : 'Hide') : (locale === 'fr' ? 'Afficher' : 'Show')}
 >
 {showNewPass ? <EyeOff size={16} /> : <Eye size={16} />}
 </button>
 </div>
 ) : (
 <input
 type={type} placeholder={placeholder}
 value={(staffForm as Record<string, string>)[key]}
 onChange={e => setStaffForm(p => ({ ...p, [key]: e.target.value }))}
 style={{
 padding: '11px 14px', background: 'rgba(255,255,255,0.05)',
 border: '1px solid rgba(108,92,231,0.25)', borderRadius: 12,
 color: 'var(--text-primary)', fontSize: '0.9rem', outline: 'none', transition: 'all 0.2s',
 }}
 onFocus={e => { e.target.style.borderColor='#6C5CE7'; e.target.style.boxShadow='0 0 0 3px rgba(108,92,231,0.15)'; }}
 onBlur={e => { e.target.style.borderColor='rgba(108,92,231,0.25)'; e.target.style.boxShadow='none'; }}
 />
 )}
 </div>
 ))}
 </div>

 {/* Permissions for new staff */}
 <div style={{
 background: 'rgba(108,92,231,0.06)', borderRadius: 16,
 border: '1px solid rgba(108,92,231,0.15)', padding: '16px 18px', marginBottom: 20
 }}>
 <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
 <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>
 {locale === 'fr' ? 'Accès aux modules' : 'Module Access'}
 </span>
 </div>
 <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
 {STAFF_TABS.map((tab, idx) => {
 const allowed = staffPermissions.includes(tab.id);
 const colors = [
 { on: '#6C5CE7', bg: 'rgba(108,92,231,0.15)', border: 'rgba(108,92,231,0.4)' },
 { on: '#00b894', bg: 'rgba(0,184,148,0.15)', border: 'rgba(0,184,148,0.4)' },
 { on: '#e17055', bg: 'rgba(225,112,85,0.15)', border: 'rgba(225,112,85,0.4)' },
 { on: '#fdcb6e', bg: 'rgba(253,203,110,0.15)', border: 'rgba(253,203,110,0.4)' },
 { on: '#a29bfe', bg: 'rgba(162,155,254,0.15)', border: 'rgba(162,155,254,0.4)' },
 ];
 const c = colors[idx % colors.length];
 return (
 <button key={tab.id} onClick={() => toggleNewPerm(tab.id)} type="button" style={{
 padding: '7px 16px', borderRadius: 20, border: '1.5px solid', cursor: 'pointer',
 fontSize: '0.8rem', fontWeight: 700, transition: 'all 0.2s',
 background: allowed ? c.bg : 'rgba(255,255,255,0.04)',
 borderColor: allowed ? c.border : 'rgba(255,255,255,0.1)',
 color: allowed ? c.on : 'rgba(255,255,255,0.35)',
 transform: allowed ? 'scale(1.02)' : 'scale(1)',
 }}>
 {allowed ? '' : ''} {locale === 'ar' ? tab.labelAr : locale === 'es' ? tab.labelEs : locale === 'pt' ? tab.labelPt : locale === 'fr' ? tab.labelFr : tab.labelEn}
 </button>
 );
 })}
 </div>
 </div>

 <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
 <button onClick={() => { setShowStaffForm(false); setStaffForm({ name: '', email: '', password: '', phone: '' }); setStaffPerms(['overview','products','flash','orders','stock']); }} style={{
 padding: '10px 20px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.12)',
 background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)',
 fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
 display: 'flex', alignItems: 'center', gap: 6,
 }}>
 <X size={14} /> {t('admin.cancel')}
 </button>
 <button onClick={createStaff} disabled={staffSaving} style={{
 padding: '10px 22px', borderRadius: 12, border: 'none',
 background: 'linear-gradient(135deg, #6C5CE7, #a29bfe)',
 color: 'white', fontSize: '0.85rem', fontWeight: 700,
 cursor: 'pointer', transition: 'all 0.2s',
 display: 'flex', alignItems: 'center', gap: 6,
 boxShadow: '0 4px 16px rgba(108,92,231,0.4)',
 opacity: staffSaving ? 0.7 : 1,
 }}>
 {staffSaving ? <RefreshCw size={14} className={styles.spin} /> : <Check size={14} />}
 {locale === 'fr' ? t('admin.create') : t('admin.create')} {t('nav.account') || 'Account'}
 </button>
 </div>
 </div>
 )}
 </div>

 {/* Staff List */}
 <div style={{
 background: 'var(--surface-container)',
 border: '1px solid var(--border-subtle)',
 borderRadius: 20, padding: 24, overflow: 'hidden',
 }}>
 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
 <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
 <div style={{
 width: 40, height: 40, borderRadius: 12,
 background: 'linear-gradient(135deg, rgba(108,92,231,0.2), rgba(162,155,254,0.1))',
 border: '1px solid rgba(108,92,231,0.25)',
 display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem'
 }}><Star size={18} /></div>
 <div>
 <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
 {t('admin.team')}
 </h3>
 <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>
 {staffList?.length || 0} {locale === 'fr' ? (staffList?.length === 1 ? 'membre actif' : 'membres actifs') : locale === 'es' ? (staffList?.length === 1 ? 'miembro activo' : 'miembros activos') : locale === 'pt' ? (staffList?.length === 1 ? 'membro ativo' : 'membros ativos') : (staffList?.length === 1 ? 'active member' : 'active members')}
 </p>
 </div>
 </div>
 <button onClick={() => refetchStaff()} style={{
 padding: '8px 16px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)',
 background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)',
 fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
 display: 'flex', alignItems: 'center', gap: 6,
 }} onMouseEnter={e => e.currentTarget.style.background='rgba(108,92,231,0.12)'}
 onMouseLeave={e => e.currentTarget.style.background='rgba(255,255,255,0.05)'}>
 <RefreshCw size={13} /> {t('admin.refresh')}
 </button>
 </div>

 {!staffList || staffList.length === 0 ? (
 <div style={{ padding: '56px 0', textAlign: 'center' }}>
 <div style={{
 width: 72, height: 72, borderRadius: 20, margin: '0 auto 16px',
 background: 'linear-gradient(135deg, rgba(108,92,231,0.15), rgba(162,155,254,0.08))',
 border: '1px solid rgba(108,92,231,0.2)',
 display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem',
 }}><Star size={28} /></div>
 <p style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>
 {t('admin.no_staff')}
 </p>
 <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: 6, maxWidth: 300, margin: '8px auto 0' }}>
 {locale === 'fr' ? t('admin.no_staff') : t('admin.new_employee')}
 </p>
 </div>
 ) : (
 <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
 {staffList.map((staff) => {
 const initials = staff.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();
 let perms: string[] = [];
 try { perms = staff.permissions ? JSON.parse(staff.permissions) : []; } catch { perms = []; }
 const permColors = [
 { on: '#6C5CE7', bg: 'rgba(108,92,231,0.12)', border: 'rgba(108,92,231,0.25)' },
 { on: '#00b894', bg: 'rgba(0,184,148,0.12)', border: 'rgba(0,184,148,0.25)' },
 { on: '#e17055', bg: 'rgba(225,112,85,0.12)', border: 'rgba(225,112,85,0.25)' },
 { on: '#fdcb6e', bg: 'rgba(253,203,110,0.12)', border: 'rgba(253,203,110,0.25)' },
 { on: '#a29bfe', bg: 'rgba(162,155,254,0.12)', border: 'rgba(162,155,254,0.25)' },
 ];
 return (
 <div key={staff.id} style={{
 padding: '16px 18px',
 background: 'rgba(255,255,255,0.03)',
 border: '1px solid rgba(255,255,255,0.06)',
 borderRadius: 16,
 transition: 'all 0.25s',
 cursor: 'default',
 }}
 onMouseEnter={e => { e.currentTarget.style.background='rgba(108,92,231,0.06)'; e.currentTarget.style.borderColor='rgba(108,92,231,0.2)'; }}
 onMouseLeave={e => { e.currentTarget.style.background='rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor='rgba(255,255,255,0.06)'; }}>
 <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
 {/* Avatar */}
 <div style={{
 width: 48, height: 48, borderRadius: 15, flexShrink: 0,
 background: 'linear-gradient(135deg, #6C5CE7, #a29bfe)',
 display: 'flex', alignItems: 'center', justifyContent: 'center',
 color: 'white', fontWeight: 800, fontSize: '0.95rem',
 boxShadow: '0 4px 12px rgba(108,92,231,0.35)',
 }}>
 {initials}
 </div>

 {/* Info */}
 <div style={{ flex: 1, minWidth: 0 }}>
 <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>{staff.name}</div>
 <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 10 }}>
 <span>{staff.email}</span>
 {staff.phone && <span>{staff.phone}</span>}
 </div>
 </div>

 {/* Role badge */}
 <span style={{
 background: 'linear-gradient(135deg, rgba(0,184,148,0.15), rgba(0,184,148,0.08))',
 color: '#00b894',
 border: '1px solid rgba(0,184,148,0.3)',
 borderRadius: 20, padding: '4px 12px', fontSize: '0.68rem', fontWeight: 800,
 flexShrink: 0, letterSpacing: '0.06em',
 }}>STAFF</span>

 {/* Date */}
 <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', minWidth: 60, textAlign: 'right', flexShrink: 0 }}>
 {new Date(staff.createdAt).toLocaleDateString(
 locale === 'fr' ? 'fr-FR' : locale === 'ar' ? 'ar-DZ' : locale === 'es' ? 'es-ES' : locale === 'pt' ? 'pt-BR' : 'en-US',
 { day: 'numeric', month: 'short' }
 )}
 </div>

 {/* Edit button */}
 <button onClick={() => openEditStaff(staff)} style={{
 flexShrink: 0, padding: '7px 14px', borderRadius: 10,
 border: '1px solid rgba(108,92,231,0.25)',
 background: 'rgba(108,92,231,0.08)', color: '#a29bfe',
 fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer',
 transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 5,
 }} onMouseEnter={e => { e.currentTarget.style.background='rgba(108,92,231,0.2)'; e.currentTarget.style.borderColor='rgba(108,92,231,0.5)'; }}
 onMouseLeave={e => { e.currentTarget.style.background='rgba(108,92,231,0.08)'; e.currentTarget.style.borderColor='rgba(108,92,231,0.25)'; }}>
 <Edit size={13} /> {t('admin.edit')}
 </button>

 {/* Delete */}
 <button onClick={() => deleteStaff(staff.id, staff.name)} style={{
 flexShrink: 0, width: 34, height: 34, borderRadius: 10,
 border: '1px solid rgba(214,48,49,0.2)',
 background: 'rgba(214,48,49,0.06)', color: '#e17055',
 cursor: 'pointer', transition: 'all 0.2s',
 display: 'flex', alignItems: 'center', justifyContent: 'center',
 }} onMouseEnter={e => { e.currentTarget.style.background='rgba(214,48,49,0.18)'; e.currentTarget.style.borderColor='rgba(214,48,49,0.5)'; }}
 onMouseLeave={e => { e.currentTarget.style.background='rgba(214,48,49,0.06)'; e.currentTarget.style.borderColor='rgba(214,48,49,0.2)'; }}>
 <Trash2 size={14} />
 </button>
 </div>

 {/* Permissions chips */}
 {perms.length > 0 && (
 <div style={{ marginTop: 12, marginLeft: 62, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
 {STAFF_TABS.filter(t => perms.includes(t.id)).map((t, idx) => {
 const c = permColors[idx % permColors.length];
 return (
 <span key={t.id} style={{
 fontSize: '0.7rem', padding: '3px 10px', borderRadius: 10,
 background: c.bg, color: c.on,
 border: `1px solid ${c.border}`, fontWeight: 700,
 }}>
 {locale === 'ar' ? t.labelAr : locale === 'es' ? t.labelEs : locale === 'pt' ? t.labelPt : locale === 'fr' ? t.labelFr : t.labelEn}
 </span>
 );
 })}
 </div>
 )}
 </div>
 );
 })}
 </div>
 )}
 </div>
 </div>
 )}

 {/* FLASH SALE TAB */}
 {activeTab === 'flash' && (
 <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

 {/* Add to Flash Sale */}
 <div className={styles.card}>
 <div className={styles.cardHeader}>
 <h3> {t('admin.add_flash')}</h3>
 </div>
 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
 {/* Product picker */}
 <div className={styles.formGroup}>
 <label className={styles.label}>{t('admin.product_lbl')}</label>
 <select
 className={styles.select}
 value={flashAddProductId}
 onChange={e => setFlashAddProductId(e.target.value)}
 >
 <option value="">{t('admin.select_product')}</option>
 {allProductsForFlash?.products
 .filter(p => !p.countdownEnd) // exclude already in flash
 .map(p => (
 <option key={p.id} value={p.id}>{getName(p)} — ${p.price.toFixed(2)}</option>
 ))}
 </select>
 </div>
 {/* Discount % */}
 <div className={styles.formGroup}>
 <label className={styles.label}>{t('admin.discount_lbl')}</label>
 <input
 type="number" min={0} max={90} step={5}
 className={styles.input}
 value={flashDiscount}
 onChange={e => setFlashDiscount(Number(e.target.value))}
 />
 </div>
 {/* End datetime */}
 <div className={styles.formGroup}>
 <label className={styles.label}>{t('admin.sale_ends')}</label>
 <input
 type="datetime-local"
 className={styles.input}
 value={flashEnd}
 onChange={e => setFlashEnd(e.target.value)}
 min={new Date().toISOString().substring(0, 16)}
 />
 </div>
 {/* Submit */}
 <button
 className={styles.btnAdd}
 onClick={addToFlashSale}
 disabled={flashSaving || !flashAddProductId || !flashEnd}
 style={{ marginBottom: 0 }}
 >
 {flashSaving ? <RefreshCw size={14} className={styles.spin} /> : <Zap size={14} />}
 {t('admin.launch')}
 </button>
 </div>
 </div>

 {/* Current Flash Sale Products */}
 <div className={styles.card}>
 <div className={styles.cardHeader}>
 <h3> {t('admin.flash_products')} ({flashProducts?.length || 0})</h3>
 <button className={styles.btnEdit} onClick={() => { refetchFlash(); refetchAllProducts(); }}>
 <RefreshCw size={14} /> {t('admin.refresh')}
 </button>
 </div>
 {!flashProducts || flashProducts.length === 0 ? (
 <div className={styles.empty} style={{ padding: '48px 0', textAlign: 'center' }}>
 <span style={{ fontSize: '3rem' }}></span>
 <p style={{ marginTop: 12 }}>{t('admin.no_flash')}</p>
 </div>
 ) : (
 <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
 {flashProducts.map((product, idx) => {
 const endsAt = product.countdownEnd ? new Date(product.countdownEnd) : null;
 const isExpired = endsAt ? endsAt < new Date() : false;
 const timeLeft = endsAt
 ? Math.max(0, Math.floor((endsAt.getTime() - Date.now()) / 1000 / 60))
 : 0;
 const hoursLeft = Math.floor(timeLeft / 60);
 const minsLeft = timeLeft % 60;
 return (
 <div key={product.id} style={{
 display: 'flex', alignItems: 'center', gap: 16, padding: '14px 0',
 borderBottom: idx < flashProducts.length - 1 ? '1px solid var(--border-subtle)' : 'none',
 }}>
 {/* Product image */}
 <div style={{ width: 52, height: 52, borderRadius: 10, overflow: 'hidden', flexShrink: 0, background: 'var(--surface-container-high)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
 {product.images?.[0] ? (
 <Image src={product.images[0].url} alt={product.name} width={52} height={52} style={{ objectFit: 'cover' }} />
 ) : <Camera size={20} />}
 </div>
 {/* Info */}
 <div style={{ flex: 1, minWidth: 0 }}>
 <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
 {getName(product)}
 </div>
 <div style={{ display: 'flex', gap: 12, marginTop: 4, fontSize: '0.82rem' }}>
 <span style={{ color: '#6C5CE7', fontWeight: 800 }}>${product.price.toFixed(2)}</span>
 {product.originalPrice && (
 <span style={{ textDecoration: 'line-through', color: 'var(--text-muted)' }}>${product.originalPrice.toFixed(2)}</span>
 )}
 {product.originalPrice && (
 <span style={{ color: '#e17055', fontWeight: 700 }}>
 -{Math.round((1 - product.price / product.originalPrice) * 100)}%
 </span>
 )}
 </div>
 </div>
 {/* Timer */}
 <div style={{ textAlign: 'center', minWidth: 100 }}>
 {isExpired ? (
 <span style={{ color: '#d63031', fontWeight: 700, fontSize: '0.8rem' }}>
 {t('admin.expired')}
 </span>
 ) : (
 <>
 <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 2 }}>
 {t('admin.ends_in')}
 </div>
 <div style={{ fontWeight: 800, color: '#fdcb6e', fontSize: '0.95rem' }}>
 {hoursLeft}h {minsLeft}min
 </div>
 <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
 {endsAt?.toLocaleDateString()}
 </div>
 </>
 )}
 </div>
 {/* Remove */}
 <button
 className={styles.btnDelete}
 onClick={() => removeFromFlashSale(product.id, getName(product))}
 title={t('admin.remove_flash')}
 >
 <Trash2 size={15} />
 </button>
 </div>
 );
 })}
 </div>
 )}
 </div>
 </div>
 )}

 {/* PRODUCTS TAB */}
 {activeTab === 'products' && !showForm && (() => {
 const allProds = productsData?.products || [];
 const hiddenCount = allProds.filter(p => !p.active).length;
 const visibleCount = allProds.filter(p => p.active).length;
 const filteredProds = productFilter === 'hidden'
 ? allProds.filter(p => !p.active)
 : productFilter === 'visible'
 ? allProds.filter(p => p.active)
 : allProds;
 return (
 <div className={styles.card}>
 <div className={styles.cardHeader}>
 <h3>{t('all_products') || 'All Products'} ({productsData?.pagination.total || 0})</h3>
 <button className={styles.btnAdd} onClick={newProduct}>+ {t('add_product') || 'Add Product'}</button>
 </div>
 {/* Visibility filter tabs */}
 <div className={styles.productFilterBar}>
 <button
 className={`${styles.filterTab} ${productFilter === 'all' ? styles.filterTabActive : ''}`}
 onClick={() => setProductFilter('all')}
 >
 {t('admin.filter_all') || 'Tous'} <span className={styles.filterCount}>{allProds.length}</span>
 </button>
 <button
 className={`${styles.filterTab} ${productFilter === 'visible' ? styles.filterTabVisible : ''}`}
 onClick={() => setProductFilter('visible')}
 >
 {t('admin.filter_visible') || 'Visibles'} <span className={styles.filterCount}>{visibleCount}</span>
 </button>
 <button
 className={`${styles.filterTab} ${productFilter === 'hidden' ? styles.filterTabHidden : ''}`}
 onClick={() => setProductFilter('hidden')}
 >
 {t('admin.filter_hidden') || 'Masqués'}
 {hiddenCount > 0 && <span className={styles.filterCountAlert}>{hiddenCount}</span>}
 </button>
 </div>
 {filteredProds.length === 0 && (
 <div className={styles.empty}>
 {productFilter === 'hidden'
 ? (t('admin.no_hidden') || ' Aucun produit masqué')
 : (t('admin.no_products') || 'Aucun produit')}
 </div>
 )}
 <div className={styles.productGrid}>
 {filteredProds.map(product => (
 <div key={product.id} className={`${styles.productAdminCard} ${!product.active ? styles.inactive : styles.activeCard}`}>
 <div className={styles.productAdminImage}>
 {product.images[0] ? (
 <Image src={product.images[0].url} alt={product.name} fill sizes="200px" style={{ objectFit: 'cover' }} />
 ) : (
 <div className={styles.noImage}><Camera size={20} /></div>
 )}
 {/* Visibility status badge */}
 <div className={product.active ? styles.visibleBadge : styles.inactiveBadge}>
 {product.active
 ? <><Eye size={10} /> {t('admin.visible') || 'Visible'}</>
 : <><EyeOff size={10} /> {t('admin.hidden') || 'Masqué'}</>
 }
 </div>
 {product.featured && <div className={styles.featuredBadge}></div>}
 </div>
 <div className={styles.productAdminInfo}>
 <h4>{getName(product)}</h4>
 <div className={styles.productMeta}>
 <span className={styles.productPrice}>${product.price.toFixed(2)}</span>
 <span className={styles.productCat}>{product.category?.icon} {product.category?.name}</span>
 </div>
 <div className={styles.productActions}>
 <button className={styles.btnEdit} onClick={() => editProduct(product)} title={t('admin.edit')}>
 <Pencil size={13} /> {t('admin.edit') || 'Edit'}
 </button>
 <button
 className={product.active ? styles.btnActiveToggle : styles.btnHiddenToggle}
 onClick={() => toggleField(product.id, 'active', product.active)}
 title={product.active ? (t('admin.hide') || 'Masquer') : (t('admin.show') || 'Afficher')}
 >
 {product.active
 ? <><EyeOff size={13} /> {t('admin.hide') || 'Masquer'}</>
 : <><Eye size={13} /> {t('admin.show') || 'Afficher'}</>
 }
 </button>
 <button className={styles.btnDelete} onClick={() => deleteProduct(product.id, product.name)} title={t('admin.delete') || 'Delete'}>
 <Trash2 size={13} />
 </button>
 </div>
 </div>
 </div>
 ))}
 </div>
 {productsData && productsData.pagination.totalPages > 1 && (
 <div className={styles.pagination}>
 <button disabled={productPage <= 1} onClick={() => setProductPage(p => p - 1)}>Prev</button>
 <span>Page {productPage} / {productsData.pagination.totalPages}</span>
 <button disabled={productPage >= productsData.pagination.totalPages} onClick={() => setProductPage(p => p + 1)}>Next </button>
 </div>
 )}
 </div>
 );
 })()}


 {/* PRODUCT FORM (CREATE/EDIT) */}
 {activeTab === 'products' && showForm && (
 <div className={styles.card}>
 <div className={styles.cardHeader}>
 <h3>{editingId ? 'Edit Product' : 'New Product'}</h3>
 <button className={styles.btnSecondary} onClick={() => { setShowForm(false); setEditingId(null); }}>Back to list</button>
 </div>
 <div className={styles.formLayout}>
 {/* Left: Form fields */}
 <div className={styles.formFields}>
 {/* Names */}
 <div className={styles.formSection}>
 <h4>Product Info</h4>
 <div className={styles.formGrid}>
 <div className={styles.field}>
 <label>Name (EN) *</label>
 <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Product name in English" />
 </div>
 <div className={styles.field}>
 <label>Nom (FR)</label>
 <input value={form.nameFr} onChange={e => setForm(p => ({ ...p, nameFr: e.target.value }))} placeholder="Nom du produit en français" />
 </div>
 <div className={styles.field}>
 <label>الاسم (AR)</label>
 <input value={form.nameAr} onChange={e => setForm(p => ({ ...p, nameAr: e.target.value }))} placeholder="اسم المنتج بالعربية" dir="rtl" />
 </div>
 </div>
 </div>

 {/* Descriptions */}
 <div className={styles.formSection}>
 <h4>Descriptions</h4>
 <div className={styles.formGrid}>
 <div className={styles.field}>
 <label>Description (EN)</label>
 <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={3} placeholder="Product description in English" />
 </div>
 <div className={styles.field}>
 <label>Description (FR)</label>
 <textarea value={form.descriptionFr} onChange={e => setForm(p => ({ ...p, descriptionFr: e.target.value }))} rows={3} placeholder="Description en français" />
 </div>
 <div className={styles.field}>
 <label>الوصف (AR)</label>
 <textarea value={form.descriptionAr} onChange={e => setForm(p => ({ ...p, descriptionAr: e.target.value }))} rows={3} placeholder="وصف المنتج بالعربية" dir="rtl" />
 </div>
 </div>
 </div>

 {/* Price & Category */}
 <div className={styles.formSection}>
 <h4>Pricing & Category</h4>
 <div className={styles.formRow}>
 <div className={styles.field}>
 <label>Price ($) *</label>
 <input type="number" step="0.01" value={form.price} onChange={e => setForm(p => ({ ...p, price: parseFloat(e.target.value) || 0 }))} />
 </div>
 <div className={styles.field}>
 <label>Original Price ($)</label>
 <input type="number" step="0.01" value={form.originalPrice || ''} onChange={e => setForm(p => ({ ...p, originalPrice: parseFloat(e.target.value) || null }))} placeholder="Leave empty if no discount" />
 </div>
 <div className={styles.field}>
 <label>Category *</label>
 <select value={form.categoryId} onChange={e => setForm(p => ({ ...p, categoryId: e.target.value }))}>
 <option value="">Select...</option>
 {categories?.map(cat => (
 <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
 ))}
 </select>
 </div>
 <div className={styles.field}>
 <label>Badge</label>
 <input value={form.badge} onChange={e => setForm(p => ({ ...p, badge: e.target.value }))} placeholder="e.g. 20% OFF, NEW" />
 </div>
 <div className={styles.field}>
 <label>Countdown End</label>
 <input type="datetime-local" value={form.countdownEnd} onChange={e => setForm(p => ({ ...p, countdownEnd: e.target.value }))} />
 </div>
 </div>
 <div className={styles.checkboxRow}>
 <label className={styles.checkboxLabel}>
 <input type="checkbox" checked={form.featured} onChange={e => setForm(p => ({ ...p, featured: e.target.checked }))} />
 <span>Featured</span>
 </label>
 <label className={styles.checkboxLabel}>
 <input type="checkbox" checked={form.active} onChange={e => setForm(p => ({ ...p, active: e.target.checked }))} />
 <span>Active</span>
 </label>
 </div>
 </div>

 {/* Variants */}
 <div className={styles.formSection}>
 <h4>{t('admin.variants')}</h4>
 <div className={styles.variantBtns}>
 {['color', 'size', 'material', 'weight', 'style'].map(type => (
 <button key={type} className={styles.btnSmall} onClick={() => addVariant(type)}>
 + {type.charAt(0).toUpperCase() + type.slice(1)}
 </button>
 ))}
 </div>
 {/* Custom variant type */}
 <div className={styles.customVariantRow}>
 <input
 className={styles.variantInput}
 placeholder={t('admin.custom_type')}
 value={customVariantType}
 onChange={e => setCustomVariantType(e.target.value)}
 onKeyDown={e => { if (e.key === 'Enter' && customVariantType.trim()) { addVariant(customVariantType.trim().toLowerCase()); setCustomVariantType(''); } }}
 />
 <button
 className={styles.btnSmall}
 disabled={!customVariantType.trim()}
 onClick={() => { if (customVariantType.trim()) { addVariant(customVariantType.trim().toLowerCase()); setCustomVariantType(''); } }}
 >
 + {t('admin.add_variant')}
 </button>
 </div>
 <div className={styles.variantList}>
 {form.variants.map((v, i) => (
 <div key={i} className={styles.variantRow}>
 <span className={styles.variantType} title={v.type}>
 {v.type.charAt(0).toUpperCase()}
 </span>
 <span className={styles.variantTypeLabel}>{v.type}</span>
 <input value={v.name} onChange={e => updateVariant(i, 'name', e.target.value)} placeholder={t('admin.var_name')} className={styles.variantInput} />
 {v.type === 'color' ? (
 <input type="color" value={v.value} onChange={e => updateVariant(i, 'value', e.target.value)} className={styles.colorInput} />
 ) : (
 <input value={v.value} onChange={e => updateVariant(i, 'value', e.target.value)} placeholder={t('admin.var_value')} className={styles.variantInput} />
 )}
 <input type="number" value={v.stock} onChange={e => updateVariant(i, 'stock', parseInt(e.target.value) || 0)} placeholder="Stock" className={styles.stockInput} />
 <button className={styles.btnRemove} onClick={() => removeVariant(i)}></button>
 </div>
 ))}
 {form.variants.length === 0 && <p className={styles.emptyText}>{t('admin.no_variants')}</p>}
 </div>
 </div>
 </div>

 {/* Right: Images */}
 <div className={styles.formImages}>
 <div className={styles.formSection}>
 <h4>Product Images</h4>
 <div className={styles.imageUploadZone} onClick={() => fileInputRef.current?.click()}>
 <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleImageUpload} className={styles.hiddenInput} />
 {uploading ? (
 <div className={styles.uploadingIndicator}>
 <div className={styles.spinner} />
 <span>Uploading...</span>
 </div>
 ) : (
 <>
 <span className={styles.uploadIcon}><Upload size={20} /></span>
 <span className={styles.uploadText}>Click to upload images</span>
 <span className={styles.uploadHint}>JPG, PNG, WebP • Max 5MB</span>
 </>
 )}
 </div>
 <div className={styles.imageGallery}>
 {form.images.map((img, i) => (
 <div key={i} className={styles.imageThumb}>
 <Image src={img.url} alt={img.alt || ''} fill sizes="120px" style={{ objectFit: 'cover' }} />
 <button className={styles.imageRemove} onClick={() => removeImage(i)}></button>
 {i === 0 && <span className={styles.mainLabel}>Main</span>}
 </div>
 ))}
 </div>
 {form.images.length === 0 && <p className={styles.emptyText}>No images. Upload at least one photo.</p>}
 </div>

 {/* Save / Cancel */}
 <div className={styles.formActions}>
 <button className={styles.btnSave} onClick={saveProduct} disabled={saving}>
 {saving ? 'Saving...' : editingId ? ' Update Product' : ' Create Product'}
 </button>
 <button className={styles.btnCancel} onClick={() => { setShowForm(false); setEditingId(null); }}>Cancel</button>
 </div>
 </div>
 </div>
 </div>
 )}

 {/* ORDERS TAB */}
 {activeTab === 'orders' && (
 <div className={styles.card}>
 <h3>{t('all_orders') || 'All Orders'} ({ordersData?.pagination.total || 0})</h3>
 <div className={styles.tableWrapper}>
 <table className={styles.table}>
 <thead>
 <tr>
 <th>{t('order') || 'Order'}</th>
 <th>{t('customer') || 'Customer'}</th>
 <th>{t('items') || 'Items'}</th>
 <th>{t('total') || 'Total'}</th>
 <th>{t('payment') || 'Payment'}</th>
 <th>{t('status') || 'Status'}</th>
 <th>{t('date') || 'Date'}</th>
 <th>{t('actions') || 'Actions'}</th>
 </tr>
 </thead>
 <tbody>
 {ordersData?.orders.map(order => (
 <tr key={order.id}>
 <td className={styles.cellBold}>{order.orderNumber}</td>
 <td>
 <div>{order.user.name}</div>
 <small>{order.user.email}</small>
 </td>
 <td>{order.items.reduce((s, i) => s + i.quantity, 0)}</td>
 <td>${order.total.toFixed(2)}</td>
 <td>
 <span className={styles.paymentBadge}>
 {order.paymentMethod === 'cod' ? 'COD' : 'CARD'} {order.paymentMethod.toUpperCase()}
 </span>
 </td>
 <td>
 <span className={styles.statusBadge} style={{ backgroundColor: statusColor(order.status) }}>
 {order.status.replace(/_/g, ' ')}
 </span>
 </td>
 <td>{new Date(order.createdAt).toLocaleDateString()}</td>
 <td>
 <select value={order.status} onChange={e => updateOrderStatus(order.id, e.target.value)} className={styles.statusSelect}>
 <option value="pending">Pending</option>
 <option value="confirmed">Confirmed</option>
 <option value="processing">Processing</option>
 <option value="shipped">Shipped</option>
 <option value="out_for_delivery">Out for Delivery</option>
 <option value="delivered">Delivered</option>
 <option value="cancelled">Cancelled</option>
 </select>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 {ordersData && ordersData.pagination.totalPages > 1 && (
 <div className={styles.pagination}>
 <button disabled={orderPage <= 1} onClick={() => setOrderPage(p => p - 1)}>Prev</button>
 <span>Page {orderPage} / {ordersData.pagination.totalPages}</span>
 <button disabled={orderPage >= ordersData.pagination.totalPages} onClick={() => setOrderPage(p => p + 1)}>Next </button>
 </div>
 )}
 </div>
 )}

 {/* CATEGORIES TAB */}
 {activeTab === 'categories' && (
 <div className={styles.card}>
 <div className={styles.cardHeader}>
 <h3>{t('admin.all_cats')} ({categories?.length || 0})</h3>
 <button className={styles.btnAdd} onClick={() => { setCatForm({ ...emptyCatForm }); setEditingCatId(null); setShowCatForm(!showCatForm); }}>
 {showCatForm ? '' : '+'} {showCatForm ? t('admin.cancel') : t('admin.new_cat')}
 </button>
 </div>

 {/* Category Form */}
 {showCatForm && (
 <div className={styles.catFormCard}>
 <div className={styles.catFormGrid}>
 <div className={styles.catFormField}>
 <label>Ÿ‡§ {t('admin.name_en')}</label>
 <input value={catForm.name} onChange={e => setCatForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Electronics" />
 </div>
 <div className={styles.catFormField}>
 <label>Ÿ‡· {t('admin.name_fr')}</label>
 <input value={catForm.nameFr} onChange={e => setCatForm(p => ({ ...p, nameFr: e.target.value }))} placeholder="e.g. Électronique" />
 </div>
 <div className={styles.catFormField}>
 <label>Ÿ‡¦ {t('admin.name_ar')}</label>
 <input value={catForm.nameAr} onChange={e => setCatForm(p => ({ ...p, nameAr: e.target.value }))} placeholder="e.g. إلكترونيات" dir="rtl" />
 </div>
 </div>

 {/* Premium Icon & Color Picker */}
 <div className={styles.catFormField}>
 <label>{t('admin.icon_color')}</label>
 <CategoryIconPicker
 selectedId={catForm.icon}
 selectedGradient={catForm.gradient}
 onSelect={(iconId, gradient) => setCatForm(p => ({ ...p, icon: iconId, gradient }))}
 />
 </div>

 {/* LivePreview */}
 <div className={styles.catPreview}>
 <CategoryIconTile iconId={catForm.icon} gradient={catForm.gradient} size="lg" animate={true} />
 <div>
 <strong>{catForm.name || '...'}</strong>
 <small>{catForm.nameFr || '...'}</small>
 </div>
 </div>

 <div className={styles.catFormActions}>
 <button className={styles.btnSave} onClick={saveCat} disabled={savingCat || !catForm.name || !catForm.nameFr}>
 {savingCat ? <RefreshCw size={14} className={styles.spin} /> : <Check size={14} />}
 {editingCatId ? t('admin.update') : t('admin.create')}
 </button>
 <button className={styles.btnCancel} onClick={() => { setShowCatForm(false); setEditingCatId(null); }}>
 <X size={14} /> {t('admin.cancel')}
 </button>
 </div>
 </div>
 )}

 {/* Categories Grid */}
 <div className={styles.catGrid}>
 {categories?.map(cat => (
 <div key={cat.id} className={styles.catCard}>
 <CategoryIconTile iconId={cat.icon} gradient={cat.gradient} size="md" animate={false} />
 <div className={styles.catCardInfo}>
 <h4>{getName(cat)}</h4>
 <div className={styles.catCardNames}>
 <small>EN {cat.name}</small>
 <small>FR {cat.nameFr}</small>
 </div>
 <span className={styles.catProductCount}>
 <Package size={11} /> {(cat as Category & { productCount?: number }).productCount || 0}
 </span>
 </div>
 <div className={styles.catCardActions}>
 <button className={styles.btnEdit} onClick={() => editCat(cat)} title={t('admin.edit')}><Pencil size={14} /></button>
 <button className={styles.btnDelete} onClick={() => deleteCat(cat.id, cat.name)} title={t('admin.delete')}><Trash2 size={14} /></button>
 </div>
 </div>
 ))}
 {(!categories || categories.length === 0) && (
 <p className={styles.empty}>{t('admin.no_cats')}</p>
 )}
 </div>
 </div>
 )}

 {/* STOCK TAB */}
 {activeTab === 'stock' && (
 <>
 {/* Stock Controls */}
 <div className={styles.stockControls}>
 <div className={styles.stockSearchBar}>
 <span className={styles.searchIcon}><Search size={16} /></span>
 <input
 className={styles.stockSearchInput}
 placeholder={t('admin.search_product')}
 value={stockSearch}
 onChange={e => setStockSearch(e.target.value)}
 />
 </div>
 <div className={styles.stockViewToggle}>
 <button
 className={`${styles.viewBtn} ${stockView === 'all' ? styles.viewBtnActive : ''}`}
 onClick={() => setStockView('all')}
 >
 {t('admin.all_stock')}
 </button>
 <button
 className={`${styles.viewBtn} ${stockView === 'alerts' ? styles.viewBtnActive : ''}`}
 onClick={() => setStockView('alerts')}
 >
 {t('admin.alerts')} {stockAlerts ? `(${stockAlerts.length})` : ''}
 </button>
 </div>
 {Object.keys(stockEdits).length > 0 && (
 <button className={styles.btnSaveStock} onClick={async () => {
 setSavingStock(true);
 try {
 const batch = Object.entries(stockEdits).map(([variantId, stock]) => ({ variantId, stock }));
 await fetch('/api/stock', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(batch) });
 setStockEdits({});
 refetchAllStock();
 refetchStockAlerts();
 showToast(`${batch.length} variant(s) updated!`, 'success');
 } catch { showToast('Save failed', 'error'); }
 setSavingStock(false);
 }} disabled={savingStock}>
 {savingStock ? '' : ''} {t('admin.save_changes')} ({Object.keys(stockEdits).length})
 </button>
 )}
 </div>

 {/* ALL STOCK VIEW */}
 {stockView === 'all' && (
 <div className={styles.card}>
 <h3>{t('admin.stock_mgmt')} ({allStockProducts?.length || 0} {t('admin.products_count')})</h3>
 <div className={styles.tableWrapper}>
 <table className={styles.table}>
 <thead>
 <tr>
 <th style={{ width: 40 }}></th>
 <th>{t('admin.col_product')}</th>
 <th>{t('admin.col_category')}</th>
 <th>{t('admin.col_price')}</th>
 <th>{t('admin.col_stock')}</th>
 <th>{t('admin.col_status')}</th>
 <th>{t('admin.col_actions')}</th>
 </tr>
 </thead>
 <tbody>
 {allStockProducts?.map(product => {
 const isExpanded = expandedProduct === product.id;
 const sizeVariants = product.variants.filter(v => v.type === 'size');
 const currentTotal = sizeVariants.reduce((sum, v) => {
 const edited = stockEdits[v.id];
 return sum + (edited !== undefined ? edited : v.stock);
 }, 0);
 const stockStatus = currentTotal === 0 ? 'out' : currentTotal <= 5 ? 'critical' : currentTotal <= 20 ? 'low' : 'good';
 const statusColors = { out: '#d63031', critical: '#e17055', low: '#fdcb6e', good: '#00b894' };
 const statusLabels = {
 out: t('admin.stock_out'),
 critical: t('admin.stock_critical'),
 low: t('admin.stock_low'),
 good: t('admin.stock_ok'),
 };

 return (
 <React.Fragment key={product.id}>
 <tr key={product.id} className={`${styles.stockTableRow} ${isExpanded ? styles.stockRowExpanded : ''}`}>
 <td>
 <button className={styles.expandBtn} onClick={() => setExpandedProduct(isExpanded ? null : product.id)}>
 {isExpanded ? '' : ''}
 </button>
 </td>
 <td>
 <div className={styles.stockProductCell}>
 {product.images[0] ? (
 <div className={styles.stockThumb}>
 <Image src={product.images[0].url} alt={product.name} fill sizes="40px" style={{ objectFit: 'cover' }} />
 </div>
 ) : (
 <div className={styles.stockThumbEmpty}>{product.category.icon}</div>
 )}
 <div>
 <strong>{getName(product)}</strong>
 <small>{sizeVariants.length} {t('admin.variants_count')}</small>
 </div>
 </div>
 </td>
 <td><span className={styles.catChip}>{product.category.icon} {getName(product.category)}</span></td>
 <td className={styles.cellBold}>${product.price.toFixed(2)}</td>
 <td>
 <div className={styles.stockLevelInline}>
 <div className={styles.miniBar}>
 <div className={styles.miniFill} style={{ width: `${Math.min(100, (currentTotal / 100) * 100)}%`, background: statusColors[stockStatus] }} />
 </div>
 <strong>{currentTotal}</strong>
 </div>
 </td>
 <td>
 <span className={styles.stockStatusBadge} style={{ backgroundColor: statusColors[stockStatus] }}>
 {statusLabels[stockStatus]}
 </span>
 </td>
 <td>
 <button className={styles.btnSmall} onClick={() => { setAddingVariant(product.id); setNewVariant({ type: 'size', name: '', value: '', stock: 10 }); }}>
 + {t('admin.add_variant_btn')}
 </button>
 </td>
 </tr>

 {/* Expanded variant rows */}
 {isExpanded && sizeVariants.map(v => {
 const editedStock = stockEdits[v.id];
 const currentStock = editedStock !== undefined ? editedStock : v.stock;
 const isEdited = editedStock !== undefined;
 const stockLevel = currentStock === 0 ? 'out' : currentStock <= 5 ? 'critical' : currentStock <= 20 ? 'low' : 'good';
 return (
 <tr key={v.id} className={styles.variantSubRow}>
 <td></td>
 <td colSpan={6}>
 <div className={styles.variantCard}>
 <div className={styles.variantCardLeft}>
 <span className={styles.variantDot} style={{ background: v.type === 'color' ? v.value : 'var(--color-primary)' }} />
 <span className={styles.variantCardName}>{v.name || v.value}</span>
 <span className={styles.variantTypeLabel}>{v.type}</span>
 </div>
 <div className={styles.variantCardRight}>
 <div className={styles.stockInputGroup}>
 <button className={styles.stockMinus} onClick={() => setStockEdits(prev => ({ ...prev, [v.id]: Math.max(0, currentStock - 1) }))}></button>
 <input
 type="number"
 className={`${styles.stockEditInput} ${isEdited ? styles.stockEdited : ''}`}
 value={currentStock}
 onChange={e => {
 const val = parseInt(e.target.value) || 0;
 setStockEdits(prev => ({ ...prev, [v.id]: Math.max(0, val) }));
 }}
 min={0}
 />
 <button className={styles.stockPlus} onClick={() => setStockEdits(prev => ({ ...prev, [v.id]: currentStock + 1 }))}>+</button>
 </div>
 <span className={`${styles.stockLevelBadge} ${styles[`stock_${stockLevel}`]}`}>
 {currentStock === 0 ? ` ${t('admin.stock_out')}` : currentStock <= 5 ? `! ${t('admin.stock_critical')}` : currentStock <= 20 ? ` ${t('admin.stock_low')}` : ` ${t('admin.stock_ok')}`}
 </span>
 {isEdited && (
 <button className={styles.undoBtn} onClick={() => setStockEdits(prev => { const next = { ...prev }; delete next[v.id]; return next; })} title="Undo">
 
 </button>
 )}
 </div>
 </div>
 </td>
 </tr>
 );
 })}

 {/* Expanded color variants (non-editable stock, just display) */}
 {isExpanded && product.variants.filter(v => v.type === 'color').length > 0 && (
 <tr className={styles.variantSubRow}>
 <td></td>
 <td colSpan={6}>
 <div className={styles.colorVariantsRow}>
 <span className={styles.colorLabel}>{t('admin.colors')}:</span>
 {product.variants.filter(v => v.type === 'color').map(v => (
 <span key={v.id} className={styles.colorSwatch} style={{ backgroundColor: v.value }} title={v.name} />
 ))}
 </div>
 </td>
 </tr>
 )}

 {/* Add variant inline form */}
 {addingVariant === product.id && (
 <tr className={styles.addVariantRow}>
 <td></td>
 <td colSpan={6}>
 <div className={styles.addVariantForm}>
 <select value={newVariant.type} onChange={e => setNewVariant(p => ({ ...p, type: e.target.value }))} className={styles.miniSelect}>
 <option value="size">Size</option>
 <option value="color">Color</option>
 </select>
 <input placeholder="Name" value={newVariant.name} onChange={e => setNewVariant(p => ({ ...p, name: e.target.value }))} className={styles.miniInput} />
 {newVariant.type === 'color' ? (
 <input type="color" value={newVariant.value || '#6C5CE7'} onChange={e => setNewVariant(p => ({ ...p, value: e.target.value }))} className={styles.colorInput} />
 ) : (
 <input placeholder="Value" value={newVariant.value} onChange={e => setNewVariant(p => ({ ...p, value: e.target.value }))} className={styles.miniInput} />
 )}
 <input type="number" placeholder="Stock" value={newVariant.stock} onChange={e => setNewVariant(p => ({ ...p, stock: parseInt(e.target.value) || 0 }))} className={styles.miniInputSmall} />
 <button className={styles.btnSmallSave} onClick={async () => {
 if (!newVariant.name) { showToast('Variant name required', 'error'); return; }
 try {
 await apiCall(`/api/products/${product.id}`, 'PUT', {
 variants: [...product.variants.map(v => ({ type: v.type, name: v.name, value: v.value, stock: v.stock })), newVariant],
 });
 setAddingVariant(null);
 refetchAllStock();
 showToast('Variant added!', 'success');
 } catch { showToast('Failed to add variant', 'error'); }
 }}></button>
 <button className={styles.btnSmallCancel} onClick={() => setAddingVariant(null)}></button>
 </div>
 </td>
 </tr>
 )}
 </React.Fragment>
 );
 })}
 </tbody>
 </table>
 </div>
 {(!allStockProducts || allStockProducts.length === 0) && (
 <div className={styles.noAlerts}>
 <span><Package size={24} /></span>
 <p>{t('admin.no_products')}</p>
 </div>
 )}
 </div>
 )}

 {/* ALERTS VIEW */}
 {stockView === 'alerts' && (
 <div className={styles.card}>
 <h3> {t('low_stock') || 'Low Stock Alerts'}</h3>
 <div className={styles.stockGrid}>
 {stockAlerts?.map(alert => (
 <div key={alert.product.id} className={`${styles.stockCard} ${alert.totalStock <= 5 ? styles.stockCritical : alert.totalStock <= 15 ? styles.stockWarning : ''}`}>
 <div className={styles.stockHeader}>
 <span className={styles.stockIcon}>{alert.product.category.icon}</span>
 <div>
 <strong>{getName(alert.product as { name: string; nameFr: string; nameAr: string })}</strong>
 <small>{alert.product.category.name}</small>
 </div>
 </div>
 <div className={styles.stockLevel}>
 <div className={styles.stockBar}>
 <div className={styles.stockFill} style={{ width: `${Math.min(100, (alert.totalStock / 50) * 100)}%` }} />
 </div>
 <span className={styles.stockCount}>{alert.totalStock} {t('units') || 'units'}</span>
 </div>
 <div className={styles.stockVariants}>
 {alert.variants.map(v => (
 <span key={v.name} className={styles.variantChip}>
 {v.name}: <strong>{v.stock}</strong>
 </span>
 ))}
 </div>
 <span className={styles.stockPrice}>${alert.product.price.toFixed(2)}</span>
 </div>
 ))}
 {stockAlerts?.length === 0 && (
 <div className={styles.noAlerts}>
 <span></span>
 <p>{t('all_stocked') || 'All products are well stocked!'}</p>
 </div>
 )}
 </div>
 </div>
 )}
 </>
 )}
 </div>
 </div>
 </main>
 );
}

