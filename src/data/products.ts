export interface Product {
 id: string;
 name: string;
 nameAr: string;
 nameFr: string;
 description: string;
 descriptionAr: string;
 descriptionFr: string;
 price: number;
 originalPrice?: number;
 currency: string;
 images: string[];
 category: string;
 categoryIcon: string;
 variants: {
 colors: { name: string; hex: string }[];
 sizes: string[];
 };
 stock: number;
 rating: number;
 reviewCount: number;
 badge?: string;
 countdown?: string;
 featured: boolean;
}

export interface CartItem {
 product: Product;
 quantity: number;
 selectedColor: string;
 selectedSize: string;
}

export interface Order {
 id: string;
 customer: string;
 date: string;
 total: number;
 status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
 items: CartItem[];
 trackingSteps: TrackingStep[];
}

export interface TrackingStep {
 label: string;
 labelFr: string;
 labelAr: string;
 time: string;
 status: 'completed' | 'active' | 'pending';
 icon: string;
}

export interface Category {
 id: string;
 name: string;
 nameFr: string;
 nameAr: string;
 icon: string;
 productCount: number;
 gradient: string;
}

export const categories: Category[] = [
 { id: 'tech', name: 'Technology', nameFr: 'Technologie', nameAr: 'تكنولوجيا', icon: '💻', productCount: 234, gradient: 'linear-gradient(135deg, #6C5CE7, #a29bfe)' },
 { id: 'fashion', name: 'Fashion', nameFr: 'Mode', nameAr: 'أزياء', icon: '👗', productCount: 567, gradient: 'linear-gradient(135deg, #fd79a8, #e84393)' },
 { id: 'home', name: 'Home & Living', nameFr: 'Maison', nameAr: 'المنزل', icon: '', productCount: 189, gradient: 'linear-gradient(135deg, #00b894, #55efc4)' },
 { id: 'beauty', name: 'Beauty', nameFr: 'Beauté', nameAr: 'جمال', icon: '', productCount: 312, gradient: 'linear-gradient(135deg, #fdcb6e, #f39c12)' },
 { id: 'sports', name: 'Sports', nameFr: 'Sports', nameAr: 'رياضة', icon: '⚽', productCount: 145, gradient: 'linear-gradient(135deg, #e17055, #d63031)' },
 { id: 'books', name: 'Books', nameFr: 'Livres', nameAr: 'كتب', icon: '📚', productCount: 423, gradient: 'linear-gradient(135deg, #0984e3, #74b9ff)' },
];

export const products: Product[] = [
 {
 id: 'prod-001',
 name: 'Lumina X1 Smart Glasses',
 nameFr: 'Lunettes Intelligentes Lumina X1',
 nameAr: 'نظارات لومينا X1 الذكية',
 description: 'Experience the future with AR-powered smart glasses featuring holographic display, voice control, and 12-hour battery life.',
 descriptionFr: 'Vivez le futur avec des lunettes intelligentes AR dotées d\'un écran holographique, commande vocale et 12h d\'autonomie.',
 descriptionAr: 'عِش المستقبل مع نظارات ذكية تعمل بالواقع المعزز مع شاشة هولوغرافية وتحكم صوتي وبطارية تدوم 12 ساعة.',
 price: 239.99,
 originalPrice: 299.99,
 currency: 'USD',
 images: ['/products/glasses-1.jpg', '/products/glasses-2.jpg'],
 category: 'tech',
 categoryIcon: '💻',
 variants: {
 colors: [
 { name: 'Electric Violet', hex: '#6C5CE7' },
 { name: 'Cyber Silver', hex: '#dfe6e9' },
 { name: 'Deep Noir', hex: '#2d3436' },
 ],
 sizes: ['Standard', 'Wide'],
 },
 stock: 42,
 rating: 4.8,
 reviewCount: 1247,
 badge: '20% OFF',
 countdown: '2026-04-06T23:59:59',
 featured: true,
 },
 {
 id: 'prod-002',
 name: 'AuraSound Pro Headphones',
 nameFr: 'Casque AuraSound Pro',
 nameAr: 'سماعات أوراساوند برو',
 description: 'Immersive 360° spatial audio with adaptive noise cancellation. Crafted with premium titanium and memory foam cushions.',
 descriptionFr: 'Audio spatial 360° immersif avec annulation de bruit adaptative. Conçu en titane premium et coussins en mousse à mémoire.',
 descriptionAr: 'صوت مكاني 360° غامر مع إلغاء ضوضاء تكيفي. مصنوع من التيتانيوم الفاخر ووسائد الفوم الذكي.',
 price: 189.99,
 originalPrice: 249.99,
 currency: 'USD',
 images: ['/products/headphones-1.jpg', '/products/headphones-2.jpg'],
 category: 'tech',
 categoryIcon: '💻',
 variants: {
 colors: [
 { name: 'Midnight Black', hex: '#2d3436' },
 { name: 'Pearl White', hex: '#f5f5f5' },
 { name: 'Royal Purple', hex: '#6C5CE7' },
 ],
 sizes: ['One Size'],
 },
 stock: 85,
 rating: 4.9,
 reviewCount: 2341,
 badge: '24% OFF',
 featured: true,
 },
 {
 id: 'prod-003',
 name: 'Silk Cascade Evening Dress',
 nameFr: 'Robe de Soirée Cascade en Soie',
 nameAr: 'فستان سهرة كاسكيد الحريري',
 description: 'Hand-draped Italian silk evening gown with cascading layers and crystal-embedded waistline. Red carpet ready.',
 descriptionFr: 'Robe de soirée en soie italienne drapée à la main avec couches en cascade et taille incrustée de cristaux.',
 descriptionAr: 'فستان سهرة من الحرير الإيطالي المدرابيه يدويًا مع طبقات متتالية وخصر مرصع بالكريستال.',
 price: 459.99,
 currency: 'USD',
 images: ['/products/dress-1.jpg', '/products/dress-2.jpg'],
 category: 'fashion',
 categoryIcon: '👗',
 variants: {
 colors: [
 { name: 'Champagne Gold', hex: '#d4a373' },
 { name: 'Midnight Blue', hex: '#2c3e50' },
 { name: 'Rose Blush', hex: '#fab1a0' },
 ],
 sizes: ['XS', 'S', 'M', 'L', 'XL'],
 },
 stock: 12,
 rating: 4.7,
 reviewCount: 89,
 featured: true,
 },
 {
 id: 'prod-004',
 name: 'NeoBotanica Smart Planter',
 nameFr: 'Jardinière Intelligente NeoBotanica',
 nameAr: 'أصيص نيوبوتانيكا الذكي',
 description: 'AI-powered self-watering planter with soil sensors, grow lights, and companion app for optimal plant health.',
 descriptionFr: 'Jardinière auto-arrosante IA avec capteurs de sol, lumières de croissance et application compagnon.',
 descriptionAr: 'أصيص ذكي بالذكاء الاصطناعي مع ري تلقائي وأجهزة استشعار للتربة وأضواء نمو وتطبيق مرافق.',
 price: 79.99,
 originalPrice: 99.99,
 currency: 'USD',
 images: ['/products/planter-1.jpg', '/products/planter-2.jpg'],
 category: 'home',
 categoryIcon: '',
 variants: {
 colors: [
 { name: 'Sage Green', hex: '#00b894' },
 { name: 'Terracotta', hex: '#e17055' },
 { name: 'Stone Gray', hex: '#636e72' },
 ],
 sizes: ['Small', 'Medium', 'Large'],
 },
 stock: 3,
 rating: 4.6,
 reviewCount: 456,
 badge: '20% OFF',
 featured: true,
 },
 {
 id: 'prod-005',
 name: 'Velvet Glow Skincare Set',
 nameFr: 'Coffret Soin Velvet Glow',
 nameAr: 'مجموعة العناية بالبشرة فيلفت جلو',
 description: 'Luxurious 5-piece skincare ritual featuring hyaluronic acid serum, vitamin C essence, and 24K gold moisturizer.',
 descriptionFr: 'Rituel de soin luxueux en 5 pièces avec sérum d\'acide hyaluronique, essence de vitamine C et crème hydratante à l\'or 24K.',
 descriptionAr: 'طقم عناية فاخر من 5 قطع يتضمن سيروم حمض الهيالورونيك وخلاصة فيتامين سي ومرطب بالذهب عيار 24.',
 price: 129.99,
 originalPrice: 179.99,
 currency: 'USD',
 images: ['/products/skincare-1.jpg', '/products/skincare-2.jpg'],
 category: 'beauty',
 categoryIcon: '',
 variants: {
 colors: [],
 sizes: ['Standard Set', 'Deluxe Set'],
 },
 stock: 67,
 rating: 4.9,
 reviewCount: 3102,
 badge: '28% OFF',
 countdown: '2026-04-05T23:59:59',
 featured: true,
 },
 {
 id: 'prod-006',
 name: 'Quantum Fitness Tracker',
 nameFr: 'Montre Quantum Fitness',
 nameAr: 'ساعة كوانتم للياقة البدنية',
 description: 'Next-gen fitness tracker with blood oxygen monitoring, ECG, body composition analysis, and 30-day battery.',
 descriptionFr: 'Tracker fitness nouvelle génération avec suivi d\'oxygène sanguin, ECG, analyse de composition corporelle et 30 jours d\'autonomie.',
 descriptionAr: 'متتبع لياقة من الجيل التالي مع مراقبة أكسجين الدم وتخطيط القلب وتحليل تكوين الجسم وبطارية 30 يومًا.',
 price: 149.99,
 currency: 'USD',
 images: ['/products/tracker-1.jpg', '/products/tracker-2.jpg'],
 category: 'sports',
 categoryIcon: '⚽',
 variants: {
 colors: [
 { name: 'Stealth Black', hex: '#2d3436' },
 { name: 'Arctic White', hex: '#f5f5f5' },
 { name: 'Neon Green', hex: '#00b894' },
 ],
 sizes: ['S/M', 'M/L', 'L/XL'],
 },
 stock: 156,
 rating: 4.5,
 reviewCount: 876,
 featured: true,
 },
 {
 id: 'prod-007',
 name: 'Zenith Mechanical Keyboard',
 nameFr: 'Clavier Mécanique Zenith',
 nameAr: 'لوحة المفاتيح الميكانيكية زينيث',
 description: 'Premium 75% mechanical keyboard with hot-swappable switches, per-key RGB, gasket mount, and PBT keycaps.',
 descriptionFr: 'Clavier mécanique premium 75% avec switches hot-swap, RGB par touche, montage gasket et keycaps PBT.',
 descriptionAr: 'لوحة مفاتيح ميكانيكية فاخرة 75% مع سويتشات قابلة للتبديل السريع وإضاءة RGB لكل مفتاح.',
 price: 169.99,
 originalPrice: 199.99,
 currency: 'USD',
 images: ['/products/keyboard-1.jpg', '/products/keyboard-2.jpg'],
 category: 'tech',
 categoryIcon: '💻',
 variants: {
 colors: [
 { name: 'Space Gray', hex: '#636e72' },
 { name: 'Rose Gold', hex: '#fab1a0' },
 { name: 'Electric Blue', hex: '#0984e3' },
 ],
 sizes: ['ISO', 'ANSI'],
 },
 stock: 28,
 rating: 4.8,
 reviewCount: 1567,
 badge: '15% OFF',
 featured: true,
 },
 {
 id: 'prod-008',
 name: 'Atlas Travel Backpack',
 nameFr: 'Sac à Dos Voyage Atlas',
 nameAr: 'حقيبة ظهر أطلس للسفر',
 description: 'Expandable 40L travel backpack with anti-theft compartment, USB charging port, and waterproof fabric.',
 descriptionFr: 'Sac à dos voyage extensible 40L avec compartiment anti-vol, port USB et tissu imperméable.',
 descriptionAr: 'حقيبة ظهر سفر قابلة للتوسيع 40 لتر مع حجرة مضادة للسرقة ومنفذ شحن USB وقماش مقاوم للماء.',
 price: 89.99,
 currency: 'USD',
 images: ['/products/backpack-1.jpg', '/products/backpack-2.jpg'],
 category: 'fashion',
 categoryIcon: '👗',
 variants: {
 colors: [
 { name: 'Volcanic Black', hex: '#2d3436' },
 { name: 'Forest Green', hex: '#00b894' },
 { name: 'Navy Blue', hex: '#0984e3' },
 ],
 sizes: ['One Size'],
 },
 stock: 95,
 rating: 4.7,
 reviewCount: 2103,
 featured: false,
 },
];

export const sampleOrders: Order[] = [
 {
 id: 'WW-20260401-001',
 customer: 'Sarah Johnson',
 date: '2026-04-01',
 total: 429.98,
 status: 'shipped',
 items: [],
 trackingSteps: [
 { label: 'Order Confirmed', labelFr: 'Commande Confirmée', labelAr: 'تم تأكيد الطلب', time: '2026-04-01 10:30', status: 'completed', icon: '✓' },
 { label: 'Processing', labelFr: 'En Traitement', labelAr: 'قيد المعالجة', time: '2026-04-01 14:00', status: 'completed', icon: '' },
 { label: 'Shipped', labelFr: 'Expédié', labelAr: 'تم الشحن', time: '2026-04-02 09:15', status: 'active', icon: '' },
 { label: 'Out for Delivery', labelFr: 'En cours de livraison', labelAr: 'في طريقه إليك', time: '', status: 'pending', icon: '🛵' },
 { label: 'Delivered', labelFr: 'Livré', labelAr: 'تم التسليم', time: '', status: 'pending', icon: '' },
 ],
 },
 {
 id: 'WW-20260402-002',
 customer: 'Ahmed Hassan',
 date: '2026-04-02',
 total: 189.99,
 status: 'processing',
 items: [],
 trackingSteps: [
 { label: 'Order Confirmed', labelFr: 'Commande Confirmée', labelAr: 'تم تأكيد الطلب', time: '2026-04-02 16:45', status: 'completed', icon: '✓' },
 { label: 'Processing', labelFr: 'En Traitement', labelAr: 'قيد المعالجة', time: '2026-04-03 08:00', status: 'active', icon: '' },
 { label: 'Shipped', labelFr: 'Expédié', labelAr: 'تم الشحن', time: '', status: 'pending', icon: '' },
 { label: 'Out for Delivery', labelFr: 'En cours de livraison', labelAr: 'في طريقه إليك', time: '', status: 'pending', icon: '🛵' },
 { label: 'Delivered', labelFr: 'Livré', labelAr: 'تم التسليم', time: '', status: 'pending', icon: '' },
 ],
 },
 {
 id: 'WW-20260330-003',
 customer: 'Marie Dupont',
 date: '2026-03-30',
 total: 539.98,
 status: 'delivered',
 items: [],
 trackingSteps: [
 { label: 'Order Confirmed', labelFr: 'Commande Confirmée', labelAr: 'تم تأكيد الطلب', time: '2026-03-30 11:00', status: 'completed', icon: '✓' },
 { label: 'Processing', labelFr: 'En Traitement', labelAr: 'قيد المعالجة', time: '2026-03-30 15:30', status: 'completed', icon: '' },
 { label: 'Shipped', labelFr: 'Expédié', labelAr: 'تم الشحن', time: '2026-03-31 10:00', status: 'completed', icon: '' },
 { label: 'Out for Delivery', labelFr: 'En cours de livraison', labelAr: 'في طريقه إليك', time: '2026-04-01 08:30', status: 'completed', icon: '🛵' },
 { label: 'Delivered', labelFr: 'Livré', labelAr: 'تم التسليم', time: '2026-04-01 10:15', status: 'completed', icon: '' },
 ],
 },
 {
 id: 'WW-20260403-004',
 customer: 'Liam Chen',
 date: '2026-04-03',
 total: 79.99,
 status: 'pending',
 items: [],
 trackingSteps: [
 { label: 'Order Confirmed', labelFr: 'Commande Confirmée', labelAr: 'تم تأكيد الطلب', time: '2026-04-03 22:10', status: 'active', icon: '✓' },
 { label: 'Processing', labelFr: 'En Traitement', labelAr: 'قيد المعالجة', time: '', status: 'pending', icon: '' },
 { label: 'Shipped', labelFr: 'Expédié', labelAr: 'تم الشحن', time: '', status: 'pending', icon: '' },
 { label: 'Out for Delivery', labelFr: 'En cours de livraison', labelAr: 'في طريقه إليك', time: '', status: 'pending', icon: '🛵' },
 { label: 'Delivered', labelFr: 'Livré', labelAr: 'تم التسليم', time: '', status: 'pending', icon: '' },
 ],
 },
];

export const reviews = [
 { id: 1, user: 'Alex M.', rating: 5, date: '2026-03-28', comment: 'Absolutely stunning product! The quality exceeds expectations. Fast shipping too.', avatar: '👨‍💻' },
 { id: 2, user: 'Fatima K.', rating: 4, date: '2026-03-25', comment: 'Great design and build quality. Minor improvement needed in the packaging.', avatar: '👩‍' },
 { id: 3, user: 'Pierre L.', rating: 5, date: '2026-03-20', comment: 'Meilleur achat de l\'année ! Je recommande vivement. Service client exceptionnel.', avatar: '👨‍🔬' },
 { id: 4, user: 'Yuki T.', rating: 5, date: '2026-03-18', comment: 'Premium quality, premium experience. WIWISHOP never disappoints!', avatar: '👩‍💼' },
];
