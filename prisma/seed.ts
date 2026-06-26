import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding WIWISHOP database...');

  // Clear existing data
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

  // ─── Products ───
  const productsData = [
    {
      name: 'Lumina X1 Smart Glasses', nameFr: 'Lunettes Intelligentes Lumina X1', nameAr: 'نظارات لومينا X1 الذكية',
      description: 'Experience the future with AR-powered smart glasses featuring holographic display, voice control, and 12-hour battery life.',
      descriptionFr: 'Vivez le futur avec des lunettes intelligentes AR dotées d\'un écran holographique, commande vocale et 12h d\'autonomie.',
      descriptionAr: 'عِش المستقبل مع نظارات ذكية تعمل بالواقع المعزز مع شاشة هولوغرافية وتحكم صوتي وبطارية تدوم 12 ساعة.',
      price: 239.99, originalPrice: 299.99, categoryId: catTech.id, badge: '20% OFF', countdownEnd: new Date('2026-04-06T23:59:59'), featured: true,
      colors: [{ name: 'Electric Violet', value: '#6C5CE7' }, { name: 'Cyber Silver', value: '#dfe6e9' }, { name: 'Deep Noir', value: '#2d3436' }],
      sizes: [{ name: 'Standard', stock: 25 }, { name: 'Wide', stock: 17 }],
    },
    {
      name: 'AuraSound Pro Headphones', nameFr: 'Casque AuraSound Pro', nameAr: 'سماعات أوراساوند برو',
      description: 'Immersive 360° spatial audio with adaptive noise cancellation. Crafted with premium titanium and memory foam cushions.',
      descriptionFr: 'Audio spatial 360° immersif avec annulation de bruit adaptative. Conçu en titane premium et coussins en mousse à mémoire.',
      descriptionAr: 'صوت مكاني 360° غامر مع إلغاء ضوضاء تكيفي. مصنوع من التيتانيوم الفاخر ووسائد الفوم الذكي.',
      price: 189.99, originalPrice: 249.99, categoryId: catTech.id, badge: '24% OFF', featured: true,
      colors: [{ name: 'Midnight Black', value: '#2d3436' }, { name: 'Pearl White', value: '#f5f5f5' }, { name: 'Royal Purple', value: '#6C5CE7' }],
      sizes: [{ name: 'One Size', stock: 85 }],
    },
    {
      name: 'Silk Cascade Evening Dress', nameFr: 'Robe de Soirée Cascade en Soie', nameAr: 'فستان سهرة كاسكيد الحريري',
      description: 'Hand-draped Italian silk evening gown with cascading layers and crystal-embedded waistline.',
      descriptionFr: 'Robe de soirée en soie italienne drapée à la main avec couches en cascade et taille incrustée de cristaux.',
      descriptionAr: 'فستان سهرة من الحرير الإيطالي مع طبقات متتالية وخصر مرصع بالكريستال.',
      price: 459.99, categoryId: catFashion.id, featured: true,
      colors: [{ name: 'Champagne Gold', value: '#d4a373' }, { name: 'Midnight Blue', value: '#2c3e50' }, { name: 'Rose Blush', value: '#fab1a0' }],
      sizes: [{ name: 'XS', stock: 3 }, { name: 'S', stock: 5 }, { name: 'M', stock: 2 }, { name: 'L', stock: 1 }, { name: 'XL', stock: 1 }],
    },
    {
      name: 'NeoBotanica Smart Planter', nameFr: 'Jardinière Intelligente NeoBotanica', nameAr: 'أصيص نيوبوتانيكا الذكي',
      description: 'AI-powered self-watering planter with soil sensors, grow lights, and companion app.',
      descriptionFr: 'Jardinière auto-arrosante IA avec capteurs de sol, lumières de croissance et application compagnon.',
      descriptionAr: 'أصيص ذكي بالذكاء الاصطناعي مع ري تلقائي وأجهزة استشعار للتربة.',
      price: 79.99, originalPrice: 99.99, categoryId: catHome.id, badge: '20% OFF', featured: true,
      colors: [{ name: 'Sage Green', value: '#00b894' }, { name: 'Terracotta', value: '#e17055' }, { name: 'Stone Gray', value: '#636e72' }],
      sizes: [{ name: 'Small', stock: 1 }, { name: 'Medium', stock: 1 }, { name: 'Large', stock: 1 }],
    },
    {
      name: 'Velvet Glow Skincare Set', nameFr: 'Coffret Soin Velvet Glow', nameAr: 'مجموعة العناية بالبشرة فيلفت جلو',
      description: 'Luxurious 5-piece skincare ritual featuring hyaluronic acid serum, vitamin C essence, and 24K gold moisturizer.',
      descriptionFr: 'Rituel de soin luxueux en 5 pièces avec sérum d\'acide hyaluronique, essence de vitamine C et crème hydratante à l\'or 24K.',
      descriptionAr: 'طقم عناية فاخر من 5 قطع يتضمن سيروم حمض الهيالورونيك وخلاصة فيتامين سي ومرطب بالذهب عيار 24.',
      price: 129.99, originalPrice: 179.99, categoryId: catBeauty.id, badge: '28% OFF', countdownEnd: new Date('2026-04-05T23:59:59'), featured: true,
      colors: [],
      sizes: [{ name: 'Standard Set', stock: 40 }, { name: 'Deluxe Set', stock: 27 }],
    },
    {
      name: 'Quantum Fitness Tracker', nameFr: 'Montre Quantum Fitness', nameAr: 'ساعة كوانتم للياقة البدنية',
      description: 'Next-gen fitness tracker with blood oxygen monitoring, ECG, body composition analysis, and 30-day battery.',
      descriptionFr: 'Tracker fitness nouvelle génération avec suivi d\'oxygène sanguin, ECG, analyse de composition corporelle et 30 jours d\'autonomie.',
      descriptionAr: 'متتبع لياقة من الجيل التالي مع مراقبة أكسجين الدم وتخطيط القلب.',
      price: 149.99, categoryId: catSports.id, featured: true,
      colors: [{ name: 'Stealth Black', value: '#2d3436' }, { name: 'Arctic White', value: '#f5f5f5' }, { name: 'Neon Green', value: '#00b894' }],
      sizes: [{ name: 'S/M', stock: 50 }, { name: 'M/L', stock: 60 }, { name: 'L/XL', stock: 46 }],
    },
    {
      name: 'Zenith Mechanical Keyboard', nameFr: 'Clavier Mécanique Zenith', nameAr: 'لوحة المفاتيح الميكانيكية زينيث',
      description: 'Premium 75% mechanical keyboard with hot-swappable switches, per-key RGB, gasket mount, and PBT keycaps.',
      descriptionFr: 'Clavier mécanique premium 75% avec switches hot-swap, RGB par touche, montage gasket et keycaps PBT.',
      descriptionAr: 'لوحة مفاتيح ميكانيكية فاخرة 75% مع سويتشات قابلة للتبديل السريع.',
      price: 169.99, originalPrice: 199.99, categoryId: catTech.id, badge: '15% OFF', featured: true,
      colors: [{ name: 'Space Gray', value: '#636e72' }, { name: 'Rose Gold', value: '#fab1a0' }, { name: 'Electric Blue', value: '#0984e3' }],
      sizes: [{ name: 'ISO', stock: 15 }, { name: 'ANSI', stock: 13 }],
    },
    {
      name: 'Atlas Travel Backpack', nameFr: 'Sac à Dos Voyage Atlas', nameAr: 'حقيبة ظهر أطلس للسفر',
      description: 'Expandable 40L travel backpack with anti-theft compartment, USB charging port, and waterproof fabric.',
      descriptionFr: 'Sac à dos voyage extensible 40L avec compartiment anti-vol, port USB et tissu imperméable.',
      descriptionAr: 'حقيبة ظهر سفر قابلة للتوسيع 40 لتر مع حجرة مضادة للسرقة.',
      price: 89.99, categoryId: catFashion.id, featured: false,
      colors: [{ name: 'Volcanic Black', value: '#2d3436' }, { name: 'Forest Green', value: '#00b894' }, { name: 'Navy Blue', value: '#0984e3' }],
      sizes: [{ name: 'One Size', stock: 95 }],
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

    // Create color variants
    for (const color of p.colors) {
      await prisma.productVariant.create({
        data: { productId: product.id, type: 'color', name: color.name, value: color.value, stock: 50 },
      });
    }

    // Create size variants
    for (const size of p.sizes) {
      await prisma.productVariant.create({
        data: { productId: product.id, type: 'size', name: size.name, value: size.name, stock: size.stock },
      });
    }

    // Create placeholder images
    await prisma.productImage.create({
      data: { productId: product.id, url: `/products/${product.id}-1.jpg`, alt: p.name, sortOrder: 0 },
    });

    // Create reviews
    if (p.featured) {
      const reviewers = [customer1, customer2, customer3];
      const comments = [
        { rating: 5, comment: 'Absolutely stunning! The quality exceeds expectations.' },
        { rating: 4, comment: 'Great design and build quality. Highly recommended.' },
        { rating: 5, comment: 'Best purchase of the year! Excellent service.' },
      ];
      for (let i = 0; i < 3; i++) {
        await prisma.review.create({
          data: { productId: product.id, userId: reviewers[i].id, rating: comments[i].rating, comment: comments[i].comment },
        });
      }
    }
  }

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

  // Tracking events
  const trackingSteps = [
    { status: 'confirmed', label: 'Order Confirmed', labelFr: 'Commande Confirmée', labelAr: 'تم تأكيد الطلب', timestamp: new Date('2026-04-01T10:30:00') },
    { status: 'processing', label: 'Processing', labelFr: 'En Traitement', labelAr: 'قيد المعالجة', timestamp: new Date('2026-04-01T14:00:00') },
    { status: 'shipped', label: 'Shipped', labelFr: 'Expédié', labelAr: 'تم الشحن', timestamp: new Date('2026-04-02T09:15:00'), location: 'Distribution Center, New York', latitude: 40.7128, longitude: -74.0060 },
  ];

  for (const step of trackingSteps) {
    await prisma.trackingEvent.create({
      data: { orderId: order1.id, ...step },
    });
  }

  // Invoice
  await prisma.invoice.create({
    data: { orderId: order1.id, type: 'final', invoiceNumber: 'INV-2026-001' },
  });

  console.log('✅ Seed completed successfully!');
  console.log(`   Users: admin@wiwishop.com / admin123`);
  console.log(`   Promo codes: WELCOME10, FLASH25, FREE20`);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
