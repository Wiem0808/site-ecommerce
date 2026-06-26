require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:admin@localhost:5432/wiwi_shop?schema=public';
const isProduction = process.env.NODE_ENV === 'production';
const pool = new Pool({ 
  connectionString,
  ssl: isProduction ? { rejectUnauthorized: false } : false,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Seeding WIWISHOP database (PostgreSQL: wiwi_shop)...');
  console.log('   URL:', connectionString.replace(/:[^:@]+@/, ':***@'));

  // Clear existing data in correct order
  await prisma.trackingEvent.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.review.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.address.deleteMany();
  await prisma.promoCode.deleteMany();
  await prisma.user.deleteMany();
  console.log('  ✓ Cleared existing data');

  // ─── Users ───
  const adminHash = await bcrypt.hash('admin123', 10);
  const userHash = await bcrypt.hash('user123', 10);

  const admin = await prisma.user.create({
    data: { email: 'admin@wiwishop.com', passwordHash: adminHash, name: 'Admin WIWI', role: 'admin' },
  });
  const customer1 = await prisma.user.create({
    data: { email: 'sarah@example.com', passwordHash: userHash, name: 'Sarah Johnson', phone: '+1-555-0101' },
  });
  const customer2 = await prisma.user.create({
    data: { email: 'ahmed@example.com', passwordHash: userHash, name: 'Ahmed Hassan', phone: '+212-600-0202' },
  });
  const customer3 = await prisma.user.create({
    data: { email: 'marie@example.com', passwordHash: userHash, name: 'Marie Dupont', phone: '+33-6-0303' },
  });
  console.log('  ✓ Created 4 users (1 admin + 3 customers)');

  // Addresses
  const addr1 = await prisma.address.create({
    data: { userId: customer1.id, name: 'Sarah Johnson', phone: '+1-555-0101', street: '123 Park Ave', city: 'New York', zip: '10001', country: 'US', isDefault: true },
  });
  await prisma.address.create({
    data: { userId: customer2.id, name: 'Ahmed Hassan', phone: '+212-600-0202', street: '45 Bd Mohammed V', city: 'Casablanca', zip: '20000', country: 'MA', isDefault: true },
  });
  await prisma.address.create({
    data: { userId: customer3.id, name: 'Marie Dupont', phone: '+33-6-0303', street: '12 Rue de Rivoli', city: 'Paris', zip: '75001', country: 'FR', isDefault: true },
  });
  console.log('  ✓ Created 3 addresses');

  // ─── Categories ───
  const catTech = await prisma.category.create({
    data: { name: 'Technology', nameFr: 'Technologie', nameAr: 'تكنولوجيا', icon: '💻', gradient: 'linear-gradient(135deg, #6C5CE7, #a29bfe)', sortOrder: 1 },
  });
  const catFashion = await prisma.category.create({
    data: { name: 'Fashion', nameFr: 'Mode', nameAr: 'أزياء', icon: '👗', gradient: 'linear-gradient(135deg, #fd79a8, #e84393)', sortOrder: 2 },
  });
  const catHome = await prisma.category.create({
    data: { name: 'Home & Living', nameFr: 'Maison', nameAr: 'المنزل', icon: '🏠', gradient: 'linear-gradient(135deg, #00b894, #55efc4)', sortOrder: 3 },
  });
  const catBeauty = await prisma.category.create({
    data: { name: 'Beauty', nameFr: 'Beauté', nameAr: 'جمال', icon: '✨', gradient: 'linear-gradient(135deg, #fdcb6e, #f39c12)', sortOrder: 4 },
  });
  const catSports = await prisma.category.create({
    data: { name: 'Sports', nameFr: 'Sports', nameAr: 'رياضة', icon: '⚽', gradient: 'linear-gradient(135deg, #e17055, #d63031)', sortOrder: 5 },
  });
  console.log('  ✓ Created 5 categories');

  // ─── Products with REAL images ───
  const productsData = [
    // ═══ TECHNOLOGIE (4 produits) ═══
    {
      name: 'Lumina X1 Smart Glasses', nameFr: 'Lunettes Intelligentes Lumina X1', nameAr: 'نظارات لومينا X1 الذكية',
      description: 'Experience the future with AR-powered smart glasses featuring holographic display, voice control, and 12-hour battery life.',
      descriptionFr: 'Vivez le futur avec des lunettes intelligentes AR dotées d\'un affichage holographique, contrôle vocal et 12h d\'autonomie.',
      descriptionAr: 'عِش المستقبل مع نظارات ذكية تعمل بالواقع المعزز مع عرض ثلاثي الأبعاد وتحكم صوتي.',
      price: 239.99, originalPrice: 299.99, categoryId: catTech.id, badge: '20% OFF', countdownEnd: new Date('2026-04-10T23:59:59'), featured: true,
      image: '/products/smart-glasses.png',
      colors: [{ name: 'Electric Violet', value: '#6C5CE7' }, { name: 'Cyber Silver', value: '#dfe6e9' }, { name: 'Deep Noir', value: '#2d3436' }],
      sizes: [{ name: 'Standard', stock: 25 }, { name: 'Wide', stock: 17 }],
    },
    {
      name: 'AuraSound Pro Headphones', nameFr: 'Casque AuraSound Pro', nameAr: 'سماعات أوراساوند برو',
      description: 'Immersive 360° spatial audio with adaptive noise cancellation, 40mm titanium drivers, and 50-hour battery.',
      descriptionFr: 'Audio spatial 360° immersif avec annulation de bruit adaptive, transducteurs titane 40mm et 50h d\'autonomie.',
      descriptionAr: 'صوت مكاني 360 درجة مع إلغاء ضوضاء تكيفي وبطارية 50 ساعة.',
      price: 189.99, originalPrice: 249.99, categoryId: catTech.id, badge: '24% OFF', countdownEnd: null, featured: true,
      image: '/products/headphones.png',
      colors: [{ name: 'Midnight Black', value: '#2d3436' }, { name: 'Pearl White', value: '#f5f5f5' }, { name: 'Royal Purple', value: '#6C5CE7' }],
      sizes: [{ name: 'One Size', stock: 85 }],
    },
    {
      name: 'Zenith Mechanical Keyboard', nameFr: 'Clavier Mécanique Zenith', nameAr: 'لوحة مفاتيح زينيث الميكانيكية',
      description: 'Premium 75% mechanical keyboard with hot-swappable switches, PBT keycaps, per-key RGB, and aluminum case.',
      descriptionFr: 'Clavier mécanique premium 75% avec switches hot-swap, touches PBT, RGB par touche et boîtier aluminium.',
      descriptionAr: 'لوحة مفاتيح ميكانيكية فاخرة بتصميم 75% مع مفاتيح قابلة للتبديل وإضاءة RGB.',
      price: 169.99, originalPrice: 199.99, categoryId: catTech.id, badge: '15% OFF', countdownEnd: null, featured: true,
      image: '/products/mechanical-keyboard.png',
      colors: [{ name: 'Space Gray', value: '#636e72' }, { name: 'Rose Gold', value: '#fab1a0' }],
      sizes: [{ name: 'ISO', stock: 15 }, { name: 'ANSI', stock: 13 }],
    },
    {
      name: 'Nova Wireless Earbuds', nameFr: 'Écouteurs Sans Fil Nova', nameAr: 'سماعات نوفا اللاسلكية',
      description: 'Crystal-clear audio with active noise cancellation, wireless charging case, and 8-hour battery per charge.',
      descriptionFr: 'Audio cristallin avec ANC, boîtier à charge sans fil et 8h d\'autonomie par charge.',
      descriptionAr: 'صوت واضح مع إلغاء ضوضاء نشط وعلبة شحن لاسلكية و8 ساعات عمل.',
      price: 129.99, originalPrice: 159.99, categoryId: catTech.id, badge: '19% OFF', countdownEnd: null, featured: false,
      image: '/products/wireless-earbuds.png',
      colors: [{ name: 'Cloud White', value: '#f5f5f5' }, { name: 'Jet Black', value: '#2d3436' }],
      sizes: [{ name: 'One Size', stock: 120 }],
    },

    // ═══ MODE (3 produits) ═══
    {
      name: 'Silk Cascade Evening Dress', nameFr: 'Robe de Soirée en Soie Cascade', nameAr: 'فستان سهرة كاسكيد الحريري',
      description: 'Hand-draped Italian silk evening gown with crystal-embedded waistline and flowing cascade silhouette.',
      descriptionFr: 'Robe de soirée en soie italienne drapée à la main avec taille incrustée de cristaux et silhouette cascade.',
      descriptionAr: 'فستان سهرة من الحرير الإيطالي مع خصر مرصع بالكريستال وتصميم متدفق.',
      price: 459.99, originalPrice: null, categoryId: catFashion.id, badge: null, countdownEnd: null, featured: true,
      image: '/products/evening-dress.png',
      colors: [{ name: 'Champagne Gold', value: '#d4a373' }, { name: 'Midnight Blue', value: '#2c3e50' }],
      sizes: [{ name: 'XS', stock: 3 }, { name: 'S', stock: 5 }, { name: 'M', stock: 2 }, { name: 'L', stock: 1 }, { name: 'XL', stock: 1 }],
    },
    {
      name: 'Atlas Travel Backpack', nameFr: 'Sac à Dos Atlas Voyage', nameAr: 'حقيبة ظهر أطلس للسفر',
      description: 'Expandable 40L travel backpack with anti-theft compartment, USB charging port, and waterproof fabric.',
      descriptionFr: 'Sac à dos voyage extensible 40L avec compartiment anti-vol, port USB et tissu imperméable.',
      descriptionAr: 'حقيبة ظهر سفر قابلة للتوسيع 40 لتر مع جيب مضاد للسرقة ومنفذ USB.',
      price: 89.99, originalPrice: null, categoryId: catFashion.id, badge: null, countdownEnd: null, featured: false,
      image: '/products/travel-backpack.png',
      colors: [{ name: 'Volcanic Black', value: '#2d3436' }, { name: 'Navy Blue', value: '#0984e3' }],
      sizes: [{ name: 'One Size', stock: 95 }],
    },
    {
      name: 'Milano Leather Jacket', nameFr: 'Veste en Cuir Milano', nameAr: 'جاكيت جلد ميلانو',
      description: 'Handcrafted Italian leather biker jacket with satin lining, YKK zippers, and vintage inspired design.',
      descriptionFr: 'Veste biker en cuir italien artisanal avec doublure satin, fermetures YKK et design vintage.',
      descriptionAr: 'جاكيت جلد إيطالي يدوي الصنع بتصميم عتيق وبطانة ساتان وسحابات YKK.',
      price: 349.99, originalPrice: 429.99, categoryId: catFashion.id, badge: '19% OFF', countdownEnd: null, featured: true,
      image: '/products/leather-jacket.png',
      colors: [{ name: 'Classic Black', value: '#2d3436' }, { name: 'Cognac Brown', value: '#b07949' }],
      sizes: [{ name: 'S', stock: 8 }, { name: 'M', stock: 12 }, { name: 'L', stock: 10 }, { name: 'XL', stock: 6 }],
    },

    // ═══ MAISON (2 produits) ═══
    {
      name: 'NeoBotanica Smart Planter', nameFr: 'Jardinière Intelligente NeoBotanica', nameAr: 'أصيص نيوبوتانيكا الذكي',
      description: 'AI-powered self-watering planter with soil moisture sensors, integrated grow lights, and companion app.',
      descriptionFr: 'Jardinière auto-arrosante IA avec capteurs d\'humidité du sol, lumières de croissance intégrées et application.',
      descriptionAr: 'أصيص ذكي بالذكاء الاصطناعي مع ري تلقائي ومستشعرات رطوبة وإضاءة نمو.',
      price: 79.99, originalPrice: 99.99, categoryId: catHome.id, badge: '20% OFF', countdownEnd: null, featured: true,
      image: '/products/smart-planter.png',
      colors: [{ name: 'Sage Green', value: '#00b894' }, { name: 'Terracotta', value: '#e17055' }],
      sizes: [{ name: 'Small', stock: 1 }, { name: 'Medium', stock: 1 }, { name: 'Large', stock: 1 }],
    },
    {
      name: 'Zen Aroma Diffuser', nameFr: 'Diffuseur d\'Arômes Zen', nameAr: 'ناشر عطر زين',
      description: 'Ultrasonic aroma diffuser with warm ambient LED light, wood grain base, whisper-quiet operation, and 8-hour runtime.',
      descriptionFr: 'Diffuseur d\'arômes ultrasonique avec éclairage LED ambiant chaud, base bois, fonctionnement silencieux et 8h d\'autonomie.',
      descriptionAr: 'ناشر عطر بالموجات فوق الصوتية مع إضاءة LED دافئة وقاعدة خشبية وتشغيل هادئ.',
      price: 49.99, originalPrice: 69.99, categoryId: catHome.id, badge: '28% OFF', countdownEnd: new Date('2026-04-08T23:59:59'), featured: false,
      image: '/products/aroma-diffuser.png',
      colors: [{ name: 'Warm Wood', value: '#b07949' }, { name: 'White Marble', value: '#f5f5f5' }],
      sizes: [{ name: '300ml', stock: 45 }, { name: '500ml', stock: 30 }],
    },

    // ═══ BEAUTÉ (2 produits) ═══
    {
      name: 'Velvet Glow Skincare Set', nameFr: 'Coffret Soin Velvet Glow', nameAr: 'مجموعة فيلفت جلو للعناية',
      description: 'Luxurious 5-piece skincare ritual with 24K gold moisturizer, vitamin C serum, hyaluronic acid, and jade roller.',
      descriptionFr: 'Rituel de soin luxueux en 5 pièces avec crème hydratante à l\'or 24K, sérum vitamine C, acide hyaluronique et rouleau de jade.',
      descriptionAr: 'طقم عناية فاخر من 5 قطع مع مرطب ذهب 24 قيراط وسيروم فيتامين C وحمض الهيالورونيك.',
      price: 129.99, originalPrice: 179.99, categoryId: catBeauty.id, badge: '28% OFF', countdownEnd: new Date('2026-04-07T23:59:59'), featured: true,
      image: '/products/skincare-set.png',
      colors: [],
      sizes: [{ name: 'Standard Set', stock: 40 }, { name: 'Deluxe Set', stock: 27 }],
    },
    {
      name: 'Éclat de Nuit Perfume', nameFr: 'Parfum Éclat de Nuit', nameAr: 'عطر إيكلا دو نوي',
      description: 'An enchanting evening fragrance with notes of jasmine, amber, and sandalwood. Long-lasting 12-hour formula.',
      descriptionFr: 'Un parfum envoûtant du soir aux notes de jasmin, ambre et bois de santal. Formule longue tenue 12h.',
      descriptionAr: 'عطر ساحر للمساء بنفحات الياسمين والعنبر وخشب الصندل. تركيبة تدوم 12 ساعة.',
      price: 89.99, originalPrice: null, categoryId: catBeauty.id, badge: null, countdownEnd: null, featured: false,
      image: '/products/perfume-bottle.png',
      colors: [],
      sizes: [{ name: '50ml', stock: 60 }, { name: '100ml', stock: 35 }],
    },

    // ═══ SPORTS (3 produits) ═══
    {
      name: 'Quantum Fitness Tracker', nameFr: 'Montre Quantum Fitness', nameAr: 'ساعة كوانتم للياقة البدنية',
      description: 'Next-gen fitness tracker with ECG monitoring, SpO2 sensor, GPS, and 30-day battery life.',
      descriptionFr: 'Tracker fitness nouvelle génération avec ECG, capteur SpO2, GPS et 30 jours d\'autonomie.',
      descriptionAr: 'متتبع لياقة من الجيل التالي مع تخطيط قلب ومستشعر أكسجين وGPS وبطارية 30 يوم.',
      price: 149.99, originalPrice: null, categoryId: catSports.id, badge: null, countdownEnd: null, featured: true,
      image: '/products/fitness-tracker.png',
      colors: [{ name: 'Stealth Black', value: '#2d3436' }, { name: 'Neon Green', value: '#00b894' }],
      sizes: [{ name: 'S/M', stock: 50 }, { name: 'M/L', stock: 60 }, { name: 'L/XL', stock: 46 }],
    },
    {
      name: 'Harmony Pro Yoga Mat', nameFr: 'Tapis de Yoga Harmony Pro', nameAr: 'سجادة يوغا هارموني برو',
      description: 'Premium 6mm non-slip yoga mat with alignment lines, eco-friendly TPE material, and carrying strap.',
      descriptionFr: 'Tapis de yoga premium 6mm antidérapant avec lignes d\'alignement, matériau TPE écologique et sangle de transport.',
      descriptionAr: 'سجادة يوغا فاخرة 6 مم مانعة للانزلاق مع خطوط محاذاة ومادة TPE صديقة للبيئة.',
      price: 59.99, originalPrice: 79.99, categoryId: catSports.id, badge: '25% OFF', countdownEnd: null, featured: false,
      image: '/products/yoga-mat.png',
      colors: [{ name: 'Deep Purple', value: '#6C5CE7' }, { name: 'Ocean Teal', value: '#00b894' }, { name: 'Sunset Orange', value: '#e17055' }],
      sizes: [{ name: 'Standard (183cm)', stock: 75 }, { name: 'Long (200cm)', stock: 40 }],
    },
    {
      name: 'Luxe Designer Sunglasses', nameFr: 'Lunettes de Soleil Luxe Designer', nameAr: 'نظارات شمسية فاخرة',
      description: 'Premium aviator sunglasses with gold metal frame, UV400 gradient lenses, and genuine leather case.',
      descriptionFr: 'Lunettes de soleil aviateur premium avec monture métal doré, verres dégradés UV400 et étui cuir véritable.',
      descriptionAr: 'نظارات أفياتور فاخرة بإطار معدني ذهبي وعدسات متدرجة UV400 وحافظة جلد أصلي.',
      price: 199.99, originalPrice: 259.99, categoryId: catFashion.id, badge: '23% OFF', countdownEnd: new Date('2026-04-09T23:59:59'), featured: true,
      image: '/products/designer-sunglasses.png',
      colors: [{ name: 'Gold', value: '#f39c12' }, { name: 'Silver', value: '#dfe6e9' }, { name: 'Rose Gold', value: '#fab1a0' }],
      sizes: [{ name: 'One Size', stock: 42 }],
    },
  ];

  for (const p of productsData) {
    const product = await prisma.product.create({
      data: {
        name: p.name, nameFr: p.nameFr, nameAr: p.nameAr,
        description: p.description, descriptionFr: p.descriptionFr, descriptionAr: p.descriptionAr,
        price: p.price, originalPrice: p.originalPrice, categoryId: p.categoryId,
        badge: p.badge, countdownEnd: p.countdownEnd, featured: p.featured,
      },
    });

    for (const color of p.colors) {
      await prisma.productVariant.create({
        data: { productId: product.id, type: 'color', name: color.name, value: color.value, stock: 50 },
      });
    }
    for (const size of p.sizes) {
      await prisma.productVariant.create({
        data: { productId: product.id, type: 'size', name: size.name, value: size.name, stock: size.stock },
      });
    }

    // Real product images
    await prisma.productImage.create({
      data: { productId: product.id, url: p.image, alt: p.name, sortOrder: 0 },
    });

    if (p.featured) {
      const reviewers = [customer1, customer2, customer3];
      const comments = [
        { rating: 5, comment: 'Absolutely stunning! The quality exceeds all expectations. Worth every penny.' },
        { rating: 4, comment: 'Great design and build quality. Fast shipping too. Highly recommended!' },
        { rating: 5, comment: 'Best purchase of the year! The packaging was premium and the product is flawless.' },
      ];
      for (let i = 0; i < 3; i++) {
        await prisma.review.create({
          data: { productId: product.id, userId: reviewers[i].id, rating: comments[i].rating, comment: comments[i].comment },
        });
      }
    }
  }
  console.log(`  ✓ Created ${productsData.length} products with real images, variants & reviews`);

  // ─── Promo Codes ───
  await prisma.promoCode.create({
    data: { code: 'WELCOME10', discountType: 'percentage', discountValue: 10, minOrderValue: 50, maxUses: 1000, active: true, expiresAt: new Date('2026-12-31') },
  });
  await prisma.promoCode.create({
    data: { code: 'FLASH25', discountType: 'percentage', discountValue: 25, minOrderValue: 100, maxUses: 200, active: true, expiresAt: new Date('2026-04-10') },
  });
  await prisma.promoCode.create({
    data: { code: 'FREE20', discountType: 'fixed', discountValue: 20, minOrderValue: 80, maxUses: 500, active: true },
  });
  console.log('  ✓ Created 3 promo codes');

  // ─── Sample Orders ───
  const allProducts = await prisma.product.findMany();
  const order1 = await prisma.order.create({
    data: {
      orderNumber: 'WW-20260401-001', userId: customer1.id, addressId: addr1.id,
      status: 'shipped', paymentMethod: 'card', paymentStatus: 'paid',
      subtotal: 429.98, shippingCost: 0, tax: 85.99, total: 515.97,
    },
  });
  await prisma.orderItem.create({
    data: { orderId: order1.id, productId: allProducts[0].id, quantity: 1, unitPrice: 239.99, totalPrice: 239.99, productName: allProducts[0].name },
  });
  await prisma.orderItem.create({
    data: { orderId: order1.id, productId: allProducts[1].id, quantity: 1, unitPrice: 189.99, totalPrice: 189.99, productName: allProducts[1].name },
  });

  const trackingSteps = [
    { status: 'confirmed', label: 'Order Confirmed', labelFr: 'Commande Confirmée', labelAr: 'تم تأكيد الطلب', timestamp: new Date('2026-04-01T10:30:00') },
    { status: 'processing', label: 'Processing', labelFr: 'En Traitement', labelAr: 'قيد المعالجة', timestamp: new Date('2026-04-01T14:00:00') },
    { status: 'shipped', label: 'Shipped via DHL Express', labelFr: 'Expédié via DHL Express', labelAr: 'تم الشحن عبر DHL Express', timestamp: new Date('2026-04-02T09:15:00'), location: 'Distribution Center, New York', latitude: 40.7128, longitude: -74.0060 },
  ];
  for (const step of trackingSteps) {
    await prisma.trackingEvent.create({ data: { orderId: order1.id, ...step } });
  }
  await prisma.invoice.create({ data: { orderId: order1.id, type: 'final', invoiceNumber: 'INV-2026-001' } });
  console.log('  ✓ Created sample order with tracking + invoice');

  console.log('');
  console.log('✅ Seed completed!');
  console.log('   Database: wiwi_shop (PostgreSQL)');
  console.log(`   Products: ${productsData.length} (with real product images)`);
  console.log('   Admin:    admin@wiwishop.com / admin123');
  console.log('   Users:    sarah/ahmed/marie@example.com / user123');
  console.log('   Promos:   WELCOME10, FLASH25, FREE20');
}

main()
  .catch(e => { console.error('SEED ERROR:', e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); await pool.end(); });
