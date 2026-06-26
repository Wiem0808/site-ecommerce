'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Locale = 'en' | 'fr' | 'ar' | 'es' | 'pt';

interface Translations {
 [key: string]: { en: string; fr: string; ar: string; es: string; pt: string };
}

const translations: Translations = {
 // Navigation
 'nav.home': { en: 'Home', fr: 'Accueil', ar: 'الرئيسية', es: 'Inicio', pt: 'Início' },
 'nav.products': { en: 'Products', fr: 'Produits', ar: 'المنتجات', es: 'Productos', pt: 'Produtos' },
 'nav.categories': { en: 'Categories', fr: 'Catégories', ar: 'الفئات', es: 'Categorías', pt: 'Categorias' },
 'nav.tracking': { en: 'Track Order', fr: 'Suivi', ar: 'تتبع الطلب', es: 'Seguimiento', pt: 'Rastrear' },
 'nav.cart': { en: 'Cart', fr: 'Panier', ar: 'السلة', es: 'Carrito', pt: 'Carrinho' },
 'nav.admin': { en: 'Admin', fr: 'Admin', ar: 'الإدارة', es: 'Admin', pt: 'Admin' },
 'nav.search': { en: 'Search products...', fr: 'Rechercher...', ar: 'بحث...', es: 'Buscar...', pt: 'Pesquisar...' },

 // Hero
 'hero.title': { en: 'Elevate Your\nLifestyle', fr: 'Élevez Votre\nStyle de Vie', ar: 'ارتقِ بأسلوب\nحياتك', es: 'Eleva Tu\nEstilo de Vida', pt: 'Eleve Seu\nEstilo de Vida' },
 'hero.subtitle': { en: 'Discover premium products curated for the modern world. From cutting-edge tech to timeless fashion.', fr: 'Découvrez des produits premium sélectionnés pour le monde moderne. De la tech dernier cri à la mode intemporelle.', ar: 'اكتشف منتجات فاخرة مختارة للعالم الحديث. من التكنولوجيا المتطورة إلى الأزياء الخالدة.', es: 'Descubre productos premium seleccionados para el mundo moderno. Desde tecnología de punta hasta moda atemporal.', pt: 'Descubra produtos premium selecionados para o mundo moderno. Da tecnologia de ponta à moda atemporal.' },
 'hero.cta': { en: 'Shop Now', fr: 'Acheter', ar: 'تسوق الآن', es: 'Comprar Ahora', pt: 'Comprar Agora' },
 'hero.cta2': { en: 'Explore Collections', fr: 'Explorer', ar: 'استكشف المجموعات', es: 'Explorar', pt: 'Explorar' },

 // Sections
 'section.categories': { en: 'Browse Categories', fr: 'Parcourir les Catégories', ar: 'تصفح الفئات', es: 'Explorar Categorías', pt: 'Ver Categorias' },
 'section.featured': { en: 'Featured Products', fr: 'Produits en Vedette', ar: 'منتجات مميزة', es: 'Productos Destacados', pt: 'Produtos em Destaque' },
 'section.featured.sub': { en: 'Handpicked for you', fr: 'Sélectionnés pour vous', ar: 'مختارة لك', es: 'Seleccionados para ti', pt: 'Selecionados para você' },
 'section.tracking': { en: 'Track Your Order', fr: 'Suivez Votre Commande', ar: 'تتبع طلبك', es: 'Rastrea Tu Pedido', pt: 'Rastreie Seu Pedido' },
 'section.tracking.sub': { en: 'Real-time delivery updates', fr: 'Mises à jour en temps réel', ar: 'تحديثات التوصيل في الوقت الفعلي', es: 'Actualizaciones en tiempo real', pt: 'Atualizações em tempo real' },
 'section.newsletter': { en: 'Stay in the Loop', fr: 'Restez Informé', ar: 'ابقَ على اطلاع', es: 'Mantente Informado', pt: 'Fique por Dentro' },

 // Product Detail
 'product.addToCart': { en: 'Add to Cart', fr: 'Ajouter au Panier', ar: 'أضف إلى السلة', es: 'Añadir al Carrito', pt: 'Adicionar ao Carrinho' },
 'product.buyNow': { en: 'Buy Now', fr: 'Acheter', ar: 'اشترِ الآن', es: 'Comprar Ahora', pt: 'Comprar Agora' },
 'product.color': { en: 'Color', fr: 'Couleur', ar: 'اللون', es: 'Color', pt: 'Cor' },
 'product.size': { en: 'Size', fr: 'Taille', ar: 'المقاس', es: 'Talla', pt: 'Tamanho' },
 'product.quantity': { en: 'Quantity', fr: 'Quantité', ar: 'الكمية', es: 'Cantidad', pt: 'Quantidade' },
 'product.reviews': { en: 'Reviews', fr: 'Avis', ar: 'التقييمات', es: 'Reseñas', pt: 'Avaliações' },
 'product.description':{ en: 'Description', fr: 'Description', ar: 'الوصف', es: 'Descripción', pt: 'Descrição' },
 'product.specs': { en: 'Specifications', fr: 'Spécifications', ar: 'المواصفات', es: 'Especificaciones', pt: 'Especificações' },
 'product.shipping': { en: 'Shipping', fr: 'Livraison', ar: 'الشحن', es: 'Envío', pt: 'Envio' },
 'product.related': { en: 'Complete the Look', fr: 'Complétez le Look', ar: 'أكمل المظهر', es: 'Completa el Look', pt: 'Complete o Look' },
 'product.inStock': { en: 'In Stock', fr: 'En Stock', ar: 'متوفر', es: 'En Stock', pt: 'Em Estoque' },
 'product.lowStock': { en: 'Low Stock', fr: 'Stock Bas', ar: 'مخزون منخفض', es: 'Stock Bajo', pt: 'Estoque Baixo' },
 'product.outOfStock': { en: 'Out of Stock', fr: 'Rupture de Stock', ar: 'نفذ المخزون', es: 'Agotado', pt: 'Esgotado' },
 'product.flashSale': { en: 'Flash Sale Ends In', fr: 'Vente Flash se termine dans', ar: 'ينتهي العرض خلال', es: 'La Oferta Termina En', pt: 'Oferta Termina Em' },

 // Product page shortcut keys
 'home': { en: 'Home', fr: 'Accueil', ar: 'الرئيسية', es: 'Inicio', pt: 'Início' },
 'loading': { en: 'Loading...', fr: 'Chargement...', ar: 'جاري التحميل...', es: 'Cargando...', pt: 'Carregando...' },
 'product_not_found': { en: 'Product not found', fr: 'Produit introuvable', ar: 'المنتج غير موجود', es: 'Producto no encontrado', pt: 'Produto não encontrado' },
 'back_home': { en: '← Back to Home', fr: '← Retour à l\'accueil', ar: '← العودة للرئيسية', es: '← Volver al Inicio', pt: '← Voltar ao Início' },
 'reviews': { en: 'reviews', fr: 'avis', ar: 'تقييمات', es: 'reseñas', pt: 'avaliações' },
 'flash_sale': { en: 'Flash Sale', fr: 'Vente Flash', ar: 'تخفيض فلاش', es: 'Oferta Flash', pt: 'Oferta Flash' },
 'color': { en: 'Color', fr: 'Couleur', ar: 'اللون', es: 'Color', pt: 'Cor' },
 'size': { en: 'Size', fr: 'Taille', ar: 'المقاس', es: 'Talla', pt: 'Tamanho' },
 'out_of_stock': { en: 'Out of Stock', fr: 'Rupture de Stock', ar: 'نفذ المخزون', es: 'Agotado', pt: 'Esgotado' },
 'added': { en: 'Added!', fr: 'Ajouté !', ar: 'تمت الإضافة!', es: '¡Añadido!', pt: 'Adicionado!' },
 'add_to_cart': { en: 'Add to Cart', fr: 'Ajouter au Panier', ar: 'أضف إلى السلة', es: 'Añadir al Carrito', pt: 'Adicionar ao Carrinho' },
 'in_stock': { en: 'In Stock', fr: 'En Stock', ar: 'متوفر', es: 'En Stock', pt: 'Em Estoque' },
 'available': { en: 'available', fr: 'disponible(s)', ar: 'متاح', es: 'disponible(s)', pt: 'disponível(eis)' },
 'description': { en: 'Description', fr: 'Description', ar: 'الوصف', es: 'Descripción', pt: 'Descrição' },
 'specifications': { en: 'Specifications', fr: 'Spécifications', ar: 'المواصفات', es: 'Especificaciones', pt: 'Especificações' },
 'category': { en: 'Category', fr: 'Catégorie', ar: 'الفئة', es: 'Categoría', pt: 'Categoria' },
 'total_stock': { en: 'Total Stock', fr: 'Stock Total', ar: 'المخزون الإجمالي', es: 'Stock Total', pt: 'Estoque Total' },
 'colors_available': { en: 'Colors', fr: 'Couleurs', ar: 'الألوان', es: 'Colores', pt: 'Cores' },
 'sizes_available': { en: 'Sizes', fr: 'Tailles', ar: 'المقاسات', es: 'Tallas', pt: 'Tamanhos' },
 'currency': { en: 'Currency', fr: 'Devise', ar: 'العملة', es: 'Moneda', pt: 'Moeda' },
 'no_reviews': { en: 'No reviews yet. Be the first to review!', fr: 'Pas encore d\'avis. Soyez le premier !', ar: 'لا توجد تقييمات بعد. كن أول من يقيّم!', es: 'Sin reseñas aún. ¡Sé el primero!', pt: 'Sem avaliações ainda. Seja o primeiro!' },
 'related_products': { en: 'You May Also Like', fr: 'Vous Aimerez Aussi', ar: 'قد يعجبك أيضًا', es: 'También Te Puede Gustar', pt: 'Você Também Pode Gostar' },
 'view_all': { en: 'View all results', fr: 'Voir tous les résultats', ar: 'عرض كل النتائج', es: 'Ver todos los resultados', pt: 'Ver todos os resultados' },

 // Tracking Page
 'track_order': { en: 'Track Your Order', fr: 'Suivez Votre Commande', ar: 'تتبع طلبك', es: 'Rastrea Tu Pedido', pt: 'Rastreie Seu Pedido' },
 'enter_order': { en: 'Enter order number (e.g. WW-20260401-001)', fr: 'Numéro de commande (ex: WW-20260401-001)', ar: 'أدخل رقم الطلب (مثال: WW-20260401-001)', es: 'Número de pedido (ej: WW-20260401-001)', pt: 'Número do pedido (ex: WW-20260401-001)' },
 'enter_order_prompt': { en: 'Enter your order number to track delivery', fr: 'Entrez votre numéro de commande pour suivre la livraison', ar: 'أدخل رقم طلبك لتتبع التوصيل', es: 'Ingresa tu número de pedido para rastrearlo', pt: 'Insira seu número de pedido para rastrear' },
 'tracking_description': { en: 'Get real-time updates on your shipment location and estimated delivery time', fr: 'Recevez des mises à jour en temps réel sur la position de votre colis et le délai estimé de livraison', ar: 'احصل على تحديثات فورية عن موقع شحنتك ووقت التسليم المقدر', es: 'Obtén actualizaciones en tiempo real sobre tu envío', pt: 'Obtenha atualizações em tempo real sobre sua entrega' },
 'live_tracking': { en: 'Live Map Tracking', fr: 'Suivi sur Carte', ar: 'تتبع مباشر على الخريطة', es: 'Seguimiento en Mapa', pt: 'Rastreamento em Mapa' },
 'real_time': { en: 'Real-time Updates', fr: 'Mises à jour en Temps Réel', ar: 'تحديثات فورية', es: 'Actualizaciones en Tiempo Real', pt: 'Atualizações em Tempo Real' },
 'invoices': { en: 'Invoice Download', fr: 'Télécharger la Facture', ar: 'تحميل الفاتورة', es: 'Descargar Factura', pt: 'Baixar Fatura' },
 'order_not_found': { en: 'Order not found. Please check your order number.', fr: 'Commande introuvable. Vérifiez votre numéro de commande.', ar: 'الطلب غير موجود. يرجى التحقق من رقم الطلب.', es: 'Pedido no encontrado. Verifica tu número.', pt: 'Pedido não encontrado. Verifique seu número.' },
 'searching': { en: 'Searching...', fr: 'Recherche en cours...', ar: 'جاري البحث...', es: 'Buscando...', pt: 'Pesquisando...' },
 'placed_on': { en: 'Placed on', fr: 'Passée le', ar: 'تم الطلب في', es: 'Realizado el', pt: 'Feito em' },
 'confirmed': { en: 'Confirmed', fr: 'Confirmée', ar: 'مؤكدة', es: 'Confirmado', pt: 'Confirmado' },
 'processing': { en: 'Processing', fr: 'En traitement', ar: 'قيد المعالجة', es: 'Procesando', pt: 'Processando' },
 'shipped': { en: 'Shipped', fr: 'Expédiée', ar: 'تم الشحن', es: 'Enviado', pt: 'Enviado' },
 'out_delivery': { en: 'Out for Delivery', fr: 'En cours de livraison', ar: 'في طريقها إليك', es: 'En Camino', pt: 'Saiu para Entrega' },
 'delivered': { en: 'Delivered', fr: 'Livrée', ar: 'تم التسليم', es: 'Entregado', pt: 'Entregue' },
 'tracking_history': { en: 'Tracking History', fr: 'Historique de Suivi', ar: 'سجل التتبع', es: 'Historial de Seguimiento', pt: 'Histórico de Rastreamento' },
 'delivery_map': { en: 'Delivery Progress', fr: 'Progression de la Livraison', ar: 'تقدم التوصيل', es: 'Progreso de Entrega', pt: 'Progresso da Entrega' },
 'warehouse': { en: 'Warehouse', fr: 'Entrepôt', ar: 'المستودع', es: 'Almacén', pt: 'Armazém' },
 'your_address': { en: 'Your Address', fr: 'Votre Adresse', ar: 'عنوانك', es: 'Tu Dirección', pt: 'Seu Endereço' },
 'order_items': { en: 'Order Items', fr: 'Articles Commandés', ar: 'عناصر الطلب', es: 'Artículos del Pedido', pt: 'Itens do Pedido' },
 'subtotal': { en: 'Subtotal', fr: 'Sous-total', ar: 'المجموع الفرعي', es: 'Subtotal', pt: 'Subtotal' },
 'shipping': { en: 'Shipping', fr: 'Livraison', ar: 'الشحن', es: 'Envío', pt: 'Envio' },
 'tax': { en: 'Tax', fr: 'TVA', ar: 'الضريبة', es: 'Impuestos', pt: 'Impostos' },
 'total': { en: 'Total', fr: 'Total', ar: 'المجموع', es: 'Total', pt: 'Total' },
 'payment': { en: 'Payment', fr: 'Paiement', ar: 'الدفع', es: 'Pago', pt: 'Pagamento' },
 'method': { en: 'Method', fr: 'Méthode', ar: 'الطريقة', es: 'Método', pt: 'Método' },
 'status': { en: 'Status', fr: 'Statut', ar: 'الحالة', es: 'Estado', pt: 'Status' },
 'cash_delivery': { en: 'Cash on Delivery', fr: 'Paiement à la Livraison', ar: 'الدفع عند الاستلام', es: 'Contra Reembolso', pt: 'Pagamento na Entrega' },
 'credit_card': { en: 'Credit Card', fr: 'Carte Bancaire', ar: 'بطاقة ائتمان', es: 'Tarjeta de Crédito', pt: 'Cartão de Crédito' },

 // Cart Page
 'cart.title': { en: 'Your Cart', fr: 'Votre Panier', ar: 'سلتك', es: 'Tu Carrito', pt: 'Seu Carrinho' },
 'cart.empty': { en: 'Your cart is empty', fr: 'Votre panier est vide', ar: 'سلتك فارغة', es: 'Tu carrito está vacío', pt: 'Seu carrinho está vazio' },
 'cart.subtotal': { en: 'Subtotal', fr: 'Sous-total', ar: 'المجموع الفرعي', es: 'Subtotal', pt: 'Subtotal' },
 'cart.shipping': { en: 'Shipping', fr: 'Livraison', ar: 'الشحن', es: 'Envío', pt: 'Envio' },
 'cart.tax': { en: 'Tax', fr: 'TVA', ar: 'الضريبة', es: 'Impuestos', pt: 'Impostos' },
 'cart.total': { en: 'Total', fr: 'Total', ar: 'المجموع', es: 'Total', pt: 'Total' },
 'cart.checkout': { en: 'Proceed to Checkout', fr: 'Passer à la Caisse', ar: 'المتابعة للدفع', es: 'Proceder al Pago', pt: 'Ir para o Pagamento' },
 'cart.continueShopping':{ en: 'Continue Shopping', fr: 'Continuer les Achats', ar: 'متابعة التسوق', es: 'Seguir Comprando', pt: 'Continuar Comprando' },
 'cart.remove': { en: 'Remove', fr: 'Supprimer', ar: 'حذف', es: 'Eliminar', pt: 'Remover' },
 'cart.promo': { en: 'Promo Code', fr: 'Code Promo', ar: 'كود خصم', es: 'Código Promo', pt: 'Código Promo' },
 'cart.apply': { en: 'Apply', fr: 'Appliquer', ar: 'تطبيق', es: 'Aplicar', pt: 'Aplicar' },
 'cart.free': { en: 'Free', fr: 'Gratuit', ar: 'مجاني', es: 'Gratis', pt: 'Grátis' },

 // Checkout
 'checkout.title': { en: 'Checkout', fr: 'Paiement', ar: 'الدفع', es: 'Pago', pt: 'Pagamento' },
 'checkout.shipping': { en: 'Shipping Address', fr: 'Adresse de Livraison', ar: 'عنوان التوصيل', es: 'Dirección de Envío', pt: 'Endereço de Entrega' },
 'checkout.payment': { en: 'Payment Method', fr: 'Méthode de Paiement', ar: 'طريقة الدفع', es: 'Método de Pago', pt: 'Método de Pagamento' },
 'checkout.card': { en: 'Credit / Debit Card', fr: 'Carte Bancaire', ar: 'بطاقة ائتمان', es: 'Tarjeta de Crédito/Débito', pt: 'Cartão de Crédito/Débito' },
 'checkout.cod': { en: 'Cash on Delivery', fr: 'Paiement à la Livraison', ar: 'الدفع عند الاستلام', es: 'Contra Reembolso', pt: 'Pagamento na Entrega' },
 'checkout.place': { en: 'Place Order', fr: 'Confirmer la Commande', ar: 'تأكيد الطلب', es: 'Realizar Pedido', pt: 'Fazer Pedido' },
 'checkout.proforma': { en: 'Proforma Invoice', fr: 'Facture Proforma', ar: 'فاتورة مبدئية', es: 'Factura Proforma', pt: 'Fatura Proforma' },

 // Catalogue
 'catalogue': { en: 'All Products', fr: 'Tous les Produits', ar: 'جميع المنتجات', es: 'Todos los Productos', pt: 'Todos os Produtos' },
 'search': { en: 'Search', fr: 'Recherche', ar: 'بحث', es: 'Búsqueda', pt: 'Pesquisa' },
 'search_placeholder':{ en: 'Search products...', fr: 'Rechercher des produits...', ar: 'البحث عن منتجات...', es: 'Buscar productos...', pt: 'Pesquisar produtos...' },
 'categories': { en: 'Categories', fr: 'Catégories', ar: 'الفئات', es: 'Categorías', pt: 'Categorias' },
 'all': { en: 'All', fr: 'Tout', ar: 'الكل', es: 'Todo', pt: 'Tudo' },
 'price_range': { en: 'Price Range', fr: 'Fourchette de Prix', ar: 'نطاق السعر', es: 'Rango de Precio', pt: 'Faixa de Preço' },
 'sort_by': { en: 'Sort By', fr: 'Trier Par', ar: 'ترتيب حسب', es: 'Ordenar Por', pt: 'Ordenar Por' },
 'newest': { en: 'Newest', fr: 'Plus récent', ar: 'الأحدث', es: 'Más Reciente', pt: 'Mais Recente' },
 'price_low': { en: 'Price: Low to High', fr: 'Prix : croissant', ar: 'السعر: من الأقل', es: 'Precio: Menor a Mayor', pt: 'Preço: Menor para Maior' },
 'price_high': { en: 'Price: High to Low', fr: 'Prix : décroissant', ar: 'السعر: من الأعلى', es: 'Precio: Mayor a Menor', pt: 'Preço: Maior para Menor' },
 'name_az': { en: 'Name: A-Z', fr: 'Nom : A-Z', ar: 'الاسم: أ-ي', es: 'Nombre: A-Z', pt: 'Nome: A-Z' },
 'no_results': { en: 'No products found', fr: 'Aucun produit trouvé', ar: 'لم يتم العثور على منتجات', es: 'No se encontraron productos', pt: 'Nenhum produto encontrado' },
 'try_different': { en: 'Try different filters or search terms', fr: 'Essayez des filtres ou termes différents', ar: 'جرب فلاتر أو كلمات بحث مختلفة', es: 'Prueba diferentes filtros o términos', pt: 'Tente filtros ou termos diferentes' },
 'products_found': { en: 'products found', fr: 'produits trouvés', ar: 'منتجات وُجدت', es: 'productos encontrados', pt: 'produtos encontrados' },
 'prev': { en: 'Prev', fr: 'Préc.', ar: 'السابق', es: 'Ant.', pt: 'Ant.' },
 'next': { en: 'Next', fr: 'Suiv.', ar: 'التالي', es: 'Sig.', pt: 'Próx.' },

 // Admin
 'admin.title': { en: 'Dashboard', fr: 'Tableau de Bord', ar: 'لوحة التحكم', es: 'Panel de Control', pt: 'Painel de Controle' },
 'admin.revenue': { en: 'Revenue', fr: 'Revenus', ar: 'الإيرادات', es: 'Ingresos', pt: 'Receita' },
 'admin.orders': { en: 'Orders', fr: 'Commandes', ar: 'الطلبات', es: 'Pedidos', pt: 'Pedidos' },
 'admin.products': { en: 'Products', fr: 'Produits', ar: 'المنتجات', es: 'Productos', pt: 'Produtos' },
 'admin.customers': { en: 'Customers', fr: 'Clients', ar: 'العملاء', es: 'Clientes', pt: 'Clientes' },
 'admin.lowStock': { en: 'Low Stock Alerts', fr: 'Alertes Stock Bas', ar: 'تنبيهات المخزون', es: 'Alertas de Stock Bajo', pt: 'Alertas de Estoque Baixo' },
 'admin.recentOrders': { en: 'Recent Orders', fr: 'Commandes Récentes', ar: 'الطلبات الأخيرة', es: 'Pedidos Recientes', pt: 'Pedidos Recentes' },

 // Chatbot
 'chat.title': { en: 'WIWI Assistant', fr: 'Assistant WIWI', ar: 'مساعد ويوي', es: 'Asistente WIWI', pt: 'Assistente WIWI' },
 'chat.welcome': { en: 'Hi! How can I help you today?', fr: 'Bonjour ! Comment puis-je vous aider ?', ar: 'مرحبًا! كيف يمكنني مساعدتك؟', es: '¡Hola! ¿Cómo puedo ayudarte?', pt: 'Olá! Como posso ajudá-lo hoje?' },
 'chat.placeholder': { en: 'Type a message...', fr: 'Écrivez un message...', ar: 'اكتب رسالة...', es: 'Escribe un mensaje...', pt: 'Digite uma mensagem...' },

 // Footer
 'footer.about': { en: 'About Us', fr: 'À Propos', ar: 'من نحن', es: 'Sobre Nosotros', pt: 'Sobre Nós' },
 'footer.contact': { en: 'Contact', fr: 'Contact', ar: 'اتصل بنا', es: 'Contacto', pt: 'Contato' },
 'footer.privacy': { en: 'Privacy Policy', fr: 'Politique de Confidentialité', ar: 'سياسة الخصوصية', es: 'Política de Privacidad', pt: 'Política de Privacidade' },
 'footer.terms': { en: 'Terms of Service', fr: 'Conditions d\'Utilisation', ar: 'شروط الخدمة', es: 'Términos de Servicio', pt: 'Termos de Serviço' },
 'footer.returns': { en: 'Returns', fr: 'Retours', ar: 'الإرجاع', es: 'Devoluciones', pt: 'Devoluções' },
 'footer.tagline': { en: 'Premium shopping, redefined.', fr: 'Le shopping premium, réinventé.', ar: 'التسوق الفاخر، مُعاد تعريفه.', es: 'Compras premium, redefinidas.', pt: 'Compras premium, redefinidas.' },

 // General
 'general.viewAll': { en: 'View All', fr: 'Voir Tout', ar: 'عرض الكل', es: 'Ver Todo', pt: 'Ver Tudo' },
 'general.items': { en: 'items', fr: 'articles', ar: 'منتجات', es: 'artículos', pt: 'itens' },
 'general.off': { en: 'OFF', fr: 'DE RÉDUCTION', ar: 'خصم', es: 'DESCUENTO', pt: 'DESCONTO' },

 // Checkout Page
 'checkout': { en: 'Checkout', fr: 'Paiement', ar: 'الدفع', es: 'Pago', pt: 'Pagamento' },
 'shipping_address': { en: 'Shipping Address', fr: 'Adresse de Livraison', ar: 'عنوان الشحن', es: 'Dirección de Envío', pt: 'Endereço de Entrega' },
 'full_name': { en: 'Full Name', fr: 'Nom Complet', ar: 'الاسم الكامل', es: 'Nombre Completo', pt: 'Nome Completo' },
 'email': { en: 'Email', fr: 'Email', ar: 'البريد الإلكتروني', es: 'Correo Electrónico', pt: 'E-mail' },
 'phone': { en: 'Phone', fr: 'Téléphone', ar: 'الهاتف', es: 'Teléfono', pt: 'Telefone' },
 'address': { en: 'Street Address', fr: 'Adresse', ar: 'العنوان', es: 'Dirección', pt: 'Endereço' },
 'city': { en: 'City', fr: 'Ville', ar: 'المدينة', es: 'Ciudad', pt: 'Cidade' },
 'zip': { en: 'Postal Code', fr: 'Code Postal', ar: 'الرمز البريدي', es: 'Código Postal', pt: 'CEP' },
 'country': { en: 'Country', fr: 'Pays', ar: 'البلد', es: 'País', pt: 'País' },
 'select_country': { en: 'Select...', fr: 'Sélectionnez...', ar: 'اختر...', es: 'Selecciona...', pt: 'Selecione...' },
 'payment_method': { en: 'Payment Method', fr: 'Méthode de Paiement', ar: 'طريقة الدفع', es: 'Método de Pago', pt: 'Método de Pagamento' },
 'proforma_generated': { en: 'Proforma invoice generated', fr: 'Facture proforma générée', ar: 'فاتورة مبدئية ستُنشأ', es: 'Factura proforma generada', pt: 'Fatura proforma gerada' },
 'card_number': { en: 'Card Number', fr: 'Numéro de Carte', ar: 'رقم البطاقة', es: 'Número de Tarjeta', pt: 'Número do Cartão' },
 'expiry': { en: 'Expiry', fr: 'Expiration', ar: 'تاريخ الانتهاء', es: 'Vencimiento', pt: 'Validade' },
 'order_summary': { en: 'Order Summary', fr: 'Récapitulatif de la Commande', ar: 'ملخص الطلب', es: 'Resumen del Pedido', pt: 'Resumo do Pedido' },
 'promo_placeholder': { en: 'Promo code', fr: 'Code promo', ar: 'كود خصم', es: 'Código promo', pt: 'Código promo' },
 'apply': { en: 'Apply', fr: 'Appliquer', ar: 'تطبيق', es: 'Aplicar', pt: 'Aplicar' },
 'discount': { en: 'Discount', fr: 'Réduction', ar: 'الخصم', es: 'Descuento', pt: 'Desconto' },
 'free': { en: 'FREE', fr: 'GRATUIT', ar: 'مجاني', es: 'GRATIS', pt: 'GRÁTIS' },
 'place_order': { en: 'Place Order', fr: 'Confirmer la Commande', ar: 'تأكيد الطلب', es: 'Realizar Pedido', pt: 'Fazer Pedido' },
 'secure_checkout': { en: 'Secure 256-bit SSL Encrypted', fr: 'Paiement sécurisé SSL 256-bit', ar: 'دفع آمن بتشفير SSL 256-bit', es: 'Pago Seguro SSL 256-bit', pt: 'Pagamento Seguro SSL 256-bit' },
 'order_confirmed': { en: 'Order Confirmed!', fr: 'Commande Confirmée !', ar: 'تم تأكيد الطلب!', es: '¡Pedido Confirmado!', pt: 'Pedido Confirmado!' },
 'order_email': { en: 'Confirmation email sent to', fr: 'Email de confirmation envoyé à', ar: 'تم إرسال بريد التأكيد إلى', es: 'Email de confirmación enviado a', pt: 'Email de confirmação enviado para' },
 'proforma_notice': { en: 'A proforma invoice has been generated. Pay upon delivery.', fr: 'Une facture proforma a été générée. Payez à la livraison.', ar: 'تم إنشاء فاتورة مبدئية. ادفع عند الاستلام.', es: 'Se generó una factura proforma. Paga al recibir.', pt: 'Uma fatura proforma foi gerada. Pague na entrega.' },
 'continue_shopping': { en: 'Continue Shopping', fr: 'Continuer les Achats', ar: 'متابعة التسوق', es: 'Seguir Comprando', pt: 'Continuar Comprando' },
 'cart_empty': { en: 'Your cart is empty', fr: 'Votre panier est vide', ar: 'سلتك فارغة', es: 'Tu carrito está vacío', pt: 'Seu carrinho está vazio' },
 'shop_now': { en: 'Shop Now', fr: 'Acheter Maintenant', ar: 'تسوق الآن', es: 'Comprar Ahora', pt: 'Comprar Agora' },

 // Admin Page
 'overview': { en: 'Overview', fr: 'Vue d\'ensemble', ar: 'نظرة عامة', es: 'Resumen', pt: 'Visão Geral' },
 'orders': { en: 'Orders', fr: 'Commandes', ar: 'الطلبات', es: 'Pedidos', pt: 'Pedidos' },
 'stock': { en: 'Stock Alerts', fr: 'Alertes Stock', ar: 'تنبيهات المخزون', es: 'Alertas de Stock', pt: 'Alertas de Estoque' },
 'dashboard': { en: 'Dashboard', fr: 'Tableau de Bord', ar: 'لوحة التحكم', es: 'Panel de Control', pt: 'Painel' },
 'weekly_orders': { en: 'Weekly Orders', fr: 'Commandes Hebdomadaires', ar: 'الطلبات الأسبوعية', es: 'Pedidos Semanales', pt: 'Pedidos Semanais' },
 'recent_orders': { en: 'Recent Orders', fr: 'Commandes Récentes', ar: 'الطلبات الأخيرة', es: 'Pedidos Recientes', pt: 'Pedidos Recentes' },
 'no_orders': { en: 'No orders yet', fr: 'Aucune commande', ar: 'لا توجد طلبات', es: 'Sin pedidos aún', pt: 'Sem pedidos ainda' },
 'all_orders': { en: 'All Orders', fr: 'Toutes les Commandes', ar: 'جميع الطلبات', es: 'Todos los Pedidos', pt: 'Todos os Pedidos' },
 'order': { en: 'Order', fr: 'Commande', ar: 'الطلب', es: 'Pedido', pt: 'Pedido' },
 'customer': { en: 'Customer', fr: 'Client', ar: 'العميل', es: 'Cliente', pt: 'Cliente' },
 'items': { en: 'Items', fr: 'Articles', ar: 'العناصر', es: 'Artículos', pt: 'Itens' },
 'date': { en: 'Date', fr: 'Date', ar: 'التاريخ', es: 'Fecha', pt: 'Data' },
 'actions': { en: 'Actions', fr: 'Actions', ar: 'الإجراءات', es: 'Acciones', pt: 'Ações' },
 'low_stock': { en: 'Low Stock Alerts', fr: 'Alertes Stock Bas', ar: 'تنبيهات المخزون المنخفض',es: 'Alertas Stock Bajo', pt: 'Alertas de Estoque Baixo' },
 'units': { en: 'units', fr: 'unités', ar: 'وحدات', es: 'unidades', pt: 'unidades' },
 'all_stocked': { en: 'All products are well stocked!', fr: 'Tous les produits sont bien approvisionnés !', ar: 'جميع المنتجات متوفرة بكميات كافية!', es: '¡Todos los productos tienen stock suficiente!', pt: 'Todos os produtos estão bem estocados!' },
 'products_mgmt': { en: 'Products', fr: 'Produits', ar: 'المنتجات', es: 'Productos', pt: 'Produtos' },
 'all_products': { en: 'All Products', fr: 'Tous les Produits', ar: 'جميع المنتجات', es: 'Todos los Productos', pt: 'Todos os Produtos' },
 'add_product': { en: 'Add Product', fr: 'Ajouter Produit', ar: 'إضافة منتج', es: 'Añadir Producto', pt: 'Adicionar Produto' },

 // Home Page — hardcoded strings to translate
 'home.announcement': { en: 'FREE SHIPPING on orders over $100! Promo: WELCOME10 ', fr: 'LIVRAISON GRATUITE dès 100$ d\'achat ! Code Promo : WELCOME10 ', ar: 'شحن مجاني للطلبات فوق 100$! كود: WELCOME10 ', es: '¡ENVÍO GRATIS en pedidos +100$! Promo: WELCOME10 ', pt: 'FRETE GRÁTIS em pedidos acima de $100! Promo: WELCOME10 ' },
 'home.flash_desc': { en: 'Take advantage of our exclusive deals', fr: 'Profitez de nos offres exclusives', ar: 'استفد من عروضنا الحصرية', es: 'Aprovecha nuestras ofertas exclusivas', pt: 'Aproveite nossas ofertas exclusivas' },
 'home.hours': { en: 'Hours', fr: 'Heures', ar: 'ساعات', es: 'Horas', pt: 'Horas' },
 'home.new_customer': { en: 'New Customer', fr: 'Nouveau Client', ar: 'عميل جديد', es: 'Nuevo Cliente', pt: 'Novo Cliente' },
 'home.promo_desc': { en: 'Get 10% off your first order with code', fr: 'Bénéficiez de -10% sur votre première commande avec le code', ar: 'احصل على خصم 10% على طلبك الأول بالكود', es: 'Obtén 10% de descuento en tu primer pedido con el código', pt: 'Ganhe 10% de desconto no seu primeiro pedido com o código' },
 'home.new_arrivals': { en: 'New Arrivals', fr: 'Nouveaux Arrivages', ar: 'الوافدون الجدد', es: 'Nuevas Llegadas', pt: 'Novidades' },
 'home.new_arrivals_sub': { en: 'Latest additions to our store', fr: 'Les derniers ajouts à notre boutique', ar: 'أحدث الإضافات إلى متجرنا', es: 'Las últimas incorporaciones a nuestra tienda', pt: 'Últimas adições à nossa loja' },
 'home.summer_sale': { en: 'Summer Sale', fr: 'Soldes d\'Été', ar: 'تخفيضات الصيف', es: 'Rebajas de Verano', pt: 'Saldos de Verão' },
 'home.summer_sub': { en: 'Up to 50% off on premium selection', fr: 'Jusqu\'à -50% sur une sélection premium', ar: 'خصم يصل إلى 50% على تشكيلة مميزة', es: 'Hasta 50% de descuento en selección premium', pt: 'Até 50% de desconto em seleção premium' },
 'home.summer_cta': { en: 'Discover', fr: 'Découvrir', ar: 'اكتشف', es: 'Descubrir', pt: 'Descobrir' },
 'home.new_coll': { en: 'New Collection', fr: 'Nouvelle Collection', ar: 'مجموعة جديدة', es: 'Nueva Colección', pt: 'Nova Coleção' },
 'home.new_coll_sub': { en: 'Tech, Fashion, Beauty — latest trends', fr: 'Tech, Fashion, Beauty — les dernières tendances', ar: 'تقنية، أزياء، جمال — أحدث الاتجاهات', es: 'Tech, Moda, Belleza — últimas tendencias', pt: 'Tech, Moda, Beleza — últimas tendências' },
 'home.new_coll_cta': { en: 'Explore', fr: 'Explorer', ar: 'استكشف', es: 'Explorar', pt: 'Explorar' },
 'home.express': { en: 'Express Delivery', fr: 'Livraison Express', ar: 'توصيل سريع', es: 'Entrega Express', pt: 'Entrega Expressa' },
 'home.express_sub': { en: 'Free delivery on orders over $100', fr: 'Livraison gratuite dès 100$ d\'achat', ar: 'شحن مجاني للطلبات فوق 100$', es: 'Entrega gratis en pedidos +100$', pt: 'Entrega grátis em pedidos acima de $100' },
 'home.express_cta': { en: 'Order Now', fr: 'Commander', ar: 'اطلب الآن', es: 'Pedir Ahora', pt: 'Pedir Agora' },

 // Trust badges
 'trust.fast_delivery': { en: 'Fast Delivery', fr: 'Livraison Rapide', ar: 'توصيل سريع', es: 'Entrega Rápida', pt: 'Entrega Rápida' },
 'trust.fast_desc': { en: 'Delivery in 24-48h', fr: 'Livraison en 24-48h', ar: 'التوصيل في 24-48 ساعة', es: 'Entrega en 24-48h', pt: 'Entrega em 24-48h' },
 'trust.secure': { en: 'Secure Payment', fr: 'Paiement Sécurisé', ar: 'دفع آمن', es: 'Pago Seguro', pt: 'Pagamento Seguro' },
 'trust.secure_desc': { en: 'Your data is protected', fr: 'Vos données protégées', ar: 'بياناتك محمية', es: 'Tus datos están protegidos', pt: 'Seus dados estão protegidos' },
 'trust.returns': { en: 'Free Returns', fr: 'Retour Gratuit', ar: 'إرجاع مجاني', es: 'Devoluciones Gratis', pt: 'Devoluções Grátis' },
 'trust.returns_desc': { en: '30-day returns', fr: 'Retour sous 30 jours', ar: 'إرجاع خلال 30 يومًا', es: 'Devoluciones en 30 días', pt: 'Devoluções em 30 dias' },
 'trust.support': { en: '24/7 Support', fr: 'Support 24/7', ar: 'دعم 24/7', es: 'Soporte 24/7', pt: 'Suporte 24/7' },
 'trust.support_desc': { en: 'Always available', fr: 'À votre écoute', ar: 'دائمًا في خدمتك', es: 'Siempre disponibles', pt: 'Sempre disponível' },

 // Footer hardcoded
 'footer.shop': { en: 'Shop', fr: 'Boutique', ar: 'المتجر', es: 'Tienda', pt: 'Loja' },
 'footer.legal': { en: 'Legal', fr: 'Légal', ar: 'قانوني', es: 'Legal', pt: 'Legal' },
 'footer.copyright': { en: '© 2026 WIWISHOP. All rights reserved.', fr: '© 2026 WIWISHOP. Tous droits réservés.', ar: '© 2026 WIWISHOP. جميع الحقوق محفوظة.', es: '© 2026 WIWISHOP. Todos los derechos reservados.', pt: '© 2026 WIWISHOP. Todos os direitos reservados.' },
 'footer.email_placeholder': { en: 'your@email.com', fr: 'votre@email.com', ar: 'بريدك@الإلكتروني.com', es: 'tu@correo.com', pt: 'seu@email.com' },

 // Chatbot — status
 'chat.online': { en: 'Online', fr: 'En ligne', ar: 'متصل', es: 'En línea', pt: 'Online' },

 // ChatBot responses
 'chat.greeting': { en: "Hi there! I'm WIWI, your shopping assistant. I can help you with:\n• Finding products\n• Order tracking\n• Returns policy\n• Payment options\n\nWhat would you like to know?", fr: "Bonjour ! Je suis WIWI, votre assistant shopping. Je peux vous aider avec :\n• Trouver des produits\n• Suivi de commande\n• Politique de retour\n• Options de paiement\n\nQue souhaitez-vous savoir ?", ar: "مرحبًا! أنا ويوي، مساعد التسوق الخاص بك. يمكنني مساعدتك في:\n• البحث عن المنتجات\n• تتبع الطلب\n• سياسة الإرجاع\n• خيارات الدفع\n\nماذا تريد أن تعرف؟", es: "¡Hola! Soy WIWI, tu asistente de compras. Puedo ayudarte con:\n• Encontrar productos\n• Seguimiento de pedidos\n• Política de devoluciones\n• Opciones de pago\n\n¿Qué deseas saber?", pt: "Olá! Sou WIWI, seu assistente de compras. Posso ajudá-lo com:\n• Encontrar produtos\n• Rastreamento de pedidos\n• Política de devoluções\n• Opções de pagamento\n\nO que gostaria de saber?" },
 'chat.returns': { en: "Our return policy:\n• 30-day free returns\n• Items must be unworn/unused\n• Original packaging required\n• Refund within 5-7 business days\n\nWould you like to start a return?", fr: "Notre politique de retour :\n• Retours gratuits sous 30 jours\n• Articles non portés/utilisés\n• Emballage d'origine requis\n• Remboursement sous 5-7 jours ouvrés\n\nSouhaitez-vous initier un retour ?", ar: "سياسة الإرجاع:\n• إرجاع مجاني خلال 30 يومًا\n• يجب أن تكون المنتجات غير مستخدمة\n• التغليف الأصلي مطلوب\n• استرداد خلال 5-7 أيام عمل\n\nهل تريد بدء عملية إرجاع؟", es: "Nuestra política de devoluciones:\n• Devoluciones gratuitas en 30 días\n• Artículos sin usar\n• Embalaje original requerido\n• Reembolso en 5-7 días hábiles\n\n¿Deseas iniciar una devolución?", pt: "Nossa política de devoluções:\n• Devoluções gratuitas em 30 dias\n• Itens sem uso\n• Embalagem original necessária\n• Reembolso em 5-7 dias úteis\n\nDeseja iniciar uma devolução?" },
 'chat.payment': { en: "We accept:\n• Credit/Debit Cards (Visa, Mastercard, Amex)\n• Cash on Delivery (COD)\n• PayPal\n• Apple Pay / Google Pay\n\nAll payments are secured with SSL encryption.", fr: "Nous acceptons :\n• Cartes bancaires (Visa, Mastercard, Amex)\n• Paiement à la livraison\n• PayPal\n• Apple Pay / Google Pay\n\nTous les paiements sont sécurisés par SSL.", ar: "نقبل:\n• بطاقات الائتمان (فيزا، ماستركارد، أمكس)\n• الدفع عند الاستلام\n• باي بال\n• أبل باي / جوجل باي\n\nجميع المدفوعات مؤمنة بتشفير SSL.", es: "Aceptamos:\n• Tarjetas de Crédito/Débito (Visa, Mastercard, Amex)\n• Contra Reembolso (COD)\n• PayPal\n• Apple Pay / Google Pay\n\nTodos los pagos están asegurados con SSL.", pt: "Aceitamos:\n• Cartões de Crédito/Débito (Visa, Mastercard, Amex)\n• Pagamento na Entrega (COD)\n• PayPal\n• Apple Pay / Google Pay\n\nTodos os pagamentos são protegidos com SSL." },
 'chat.shipping_info':{ en: "Shipping info:\n• Free shipping on orders over $100\n• Standard: 3-5 business days\n• Express: 1-2 business days ($12.99)\n• International: 7-14 business days\n\nTrack your order in real-time on our tracking page!", fr: "Infos livraison :\n• Gratuite au-dessus de 100$\n• Standard : 3-5 jours ouvrés\n• Express : 1-2 jours ouvrés (12,99$)\n• International : 7-14 jours ouvrés\n\nSuivez votre commande en temps réel !", ar: "معلومات الشحن:\n• شحن مجاني للطلبات فوق 100$\n• عادي: 3-5 أيام عمل\n• سريع: 1-2 يوم عمل (12.99$)\n• دولي: 7-14 يوم عمل\n\nتتبع طلبك في الوقت الفعلي!", es: "Información de envío:\n• Envío gratis en pedidos +$100\n• Estándar: 3-5 días hábiles\n• Express: 1-2 días hábiles ($12.99)\n• Internacional: 7-14 días hábiles\n\n¡Rastrea tu pedido en tiempo real!", pt: "Informações de envio:\n• Frete grátis em pedidos acima de $100\n• Padrão: 3-5 dias úteis\n• Expresso: 1-2 dias úteis ($12.99)\n• Internacional: 7-14 dias úteis\n\nRastreie seu pedido em tempo real!" },
 'chat.tracking': { en: "To track your order:\n1. Go to the 'Track Order' page\n2. Enter your order ID (e.g., WW-20260401-001)\n3. See real-time updates with map\n\nNeed your order ID? Check your confirmation email!", fr: "Pour suivre votre commande :\n1. Allez sur la page 'Suivi'\n2. Entrez votre n° de commande (ex: WW-20260401-001)\n3. Voyez les mises à jour en temps réel\n\nBesoin de votre n° ? Vérifiez votre email !", ar: "لتتبع طلبك:\n1. اذهب إلى صفحة 'تتبع الطلب'\n2. أدخل رقم الطلب (مثال: WW-20260401-001)\n3. شاهد التحديثات في الوقت الفعلي\n\nتحتاج رقم الطلب؟ تحقق من بريدك!", es: "Para rastrear tu pedido:\n1. Ve a la página 'Seguimiento'\n2. Ingresa tu número de pedido (ej: WW-20260401-001)\n3. Ve actualizaciones en tiempo real con mapa\n\n¿Necesitas tu número? ¡Revisa tu email!", pt: "Para rastrear seu pedido:\n1. Vá para a página 'Rastrear Pedido'\n2. Insira seu número de pedido (ex: WW-20260401-001)\n3. Veja atualizações em tempo real com mapa\n\nPrecisa do número? Verifique seu email!" },
 'chat.default': { en: "I'm not sure I understand. Could you try asking about:\n• Products & recommendations\n• Order tracking\n• Returns & refunds\n• Payment methods\n• Shipping info", fr: "Je ne suis pas sûr de comprendre. Essayez de demander :\n• Produits & recommandations\n• Suivi de commande\n• Retours & remboursements\n• Méthodes de paiement\n• Infos livraison", ar: "لست متأكدًا مما تعنيه. جرّب السؤال عن:\n• المنتجات والتوصيات\n• تتبع الطلب\n• الإرجاع والاسترداد\n• طرق الدفع\n• معلومات الشحن", es: "No estoy seguro de entender. Intenta preguntar sobre:\n• Productos y recomendaciones\n• Seguimiento de pedido\n• Devoluciones y reembolsos\n• Métodos de pago\n• Información de envío", pt: "Não tenho certeza do que quer dizer. Tente perguntar sobre:\n• Produtos e recomendações\n• Rastreamento de pedido\n• Devoluções e reembolsos\n• Métodos de pagamento\n• Informações de envio" },
 'chat.found': { en: 'product(s) matching your search:', fr: 'produit(s) correspondant(s) :', ar: 'منتج(ات) مطابقة:', es: 'producto(s) que coinciden con tu búsqueda:', pt: 'produto(s) correspondentes à sua pesquisa:' },

 // Auth Page
 'auth.login_title': { en: 'Welcome back!', fr: 'Bon retour !', ar: 'مرحبًا بعودتك!', es: '¡Bienvenido de nuevo!', pt: 'Bem-vindo de volta!' },
 'auth.register_title': { en: 'Create an account', fr: 'Créer un compte', ar: 'إنشاء حساب', es: 'Crear una cuenta', pt: 'Criar uma conta' },
 'auth.login_sub': { en: 'Sign in to access your space',fr: 'Connectez-vous pour accéder à votre espace', ar: 'سجّل دخولك للوصول إلى مساحتك', es: 'Inicia sesión para acceder a tu espacio', pt: 'Entre para acessar seu espaço' },
 'auth.register_sub': { en: 'Join WIWISHOP in seconds', fr: 'Rejoignez WIWISHOP en quelques secondes', ar: 'انضم لـ WIWISHOP في ثوانٍ', es: 'Únete a WIWISHOP en segundos', pt: 'Junte-se ao WIWISHOP em segundos' },
 'auth.login_tab': { en: 'Sign In', fr: 'Connexion', ar: 'تسجيل الدخول', es: 'Iniciar Sesión', pt: 'Entrar' },
 'auth.register_tab': { en: 'Sign Up', fr: 'Inscription', ar: 'إنشاء حساب', es: 'Registrarse', pt: 'Cadastrar' },
 'auth.name_label': { en: 'Full Name', fr: 'Nom complet', ar: 'الاسم الكامل', es: 'Nombre completo', pt: 'Nome completo' },
 'auth.name_placeholder':{ en: 'Your full name', fr: 'Votre nom complet', ar: 'اسمك الكامل', es: 'Tu nombre completo', pt: 'Seu nome completo' },
 'auth.password_label': { en: 'Password', fr: 'Mot de passe', ar: 'كلمة المرور', es: 'Contraseña', pt: 'Senha' },
 'auth.phone_label': { en: 'Phone', fr: 'Téléphone', ar: 'الهاتف', es: 'Teléfono', pt: 'Telefone' },
 'auth.optional': { en: 'optional', fr: 'optionnel', ar: 'اختياري', es: 'opcional', pt: 'opcional' },
 'auth.login_btn': { en: 'Sign In', fr: 'Se connecter', ar: 'تسجيل الدخول', es: 'Iniciar sesión', pt: 'Entrar' },
 'auth.register_btn': { en: 'Sign Up', fr: "S'inscrire", ar: 'إنشاء حساب', es: 'Registrarse', pt: 'Cadastrar' },
 'auth.no_account': { en: 'No account yet?', fr: 'Pas encore de compte ?', ar: 'ليس لديك حساب؟', es: '¿Sin cuenta aún?', pt: 'Sem conta ainda?' },
 'auth.create_account': { en: 'Create an account', fr: 'Créer un compte', ar: 'إنشاء حساب', es: 'Crear una cuenta', pt: 'Criar uma conta' },
 'auth.have_account': { en: 'Already have an account?', fr: 'Déjà un compte ?', ar: 'لديك حساب بالفعل؟', es: '¿Ya tienes cuenta?', pt: 'Já tem conta?' },
 'auth.pw_weak': { en: 'Weak', fr: 'Faible', ar: 'ضعيفة', es: 'Débil', pt: 'Fraca' },
 'auth.pw_medium': { en: 'Medium', fr: 'Moyen', ar: 'متوسطة', es: 'Media', pt: 'Média' },
 'auth.pw_strong': { en: 'Strong', fr: 'Fort', ar: 'قوية', es: 'Fuerte', pt: 'Forte' },
 'auth.err_invalid': { en: 'Incorrect email or password', fr: 'Email ou mot de passe incorrect', ar: 'البريد أو كلمة المرور غير صحيحة', es: 'Email o contraseña incorrectos', pt: 'Email ou senha incorretos' },
 'auth.err_name': { en: 'Name is required', fr: 'Le nom est requis', ar: 'الاسم مطلوب', es: 'El nombre es obligatorio', pt: 'O nome é obrigatório' },
 'auth.err_pw_length': { en: 'Password must be at least 6 characters', fr: 'Le mot de passe doit contenir au moins 6 caractères', ar: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل', es: 'La contraseña debe tener al menos 6 caracteres', pt: 'A senha deve ter pelo menos 6 caracteres' },
 'auth.err_email_used': { en: 'Email already in use', fr: 'Email déjà utilisé', ar: 'البريد الإلكتروني مستخدم بالفعل', es: 'Email ya en uso', pt: 'Email já em uso' },
 'auth.err_generic': { en: 'An error occurred', fr: 'Une erreur est survenue', ar: 'حدث خطأ', es: 'Ocurrió un error', pt: 'Ocorreu um erro' },

 // Account Page
 'account.admin_badge': { en: 'Administrator', fr: 'Administrateur', ar: 'مشرف', es: 'Administrador', pt: 'Administrador' },
 'account.client_badge': { en: 'Customer', fr: 'Client', ar: 'عميل', es: 'Cliente', pt: 'Cliente' },
 'account.logout': { en: 'Log Out', fr: 'Déconnexion', ar: 'تسجيل الخروج', es: 'Cerrar sesión', pt: 'Sair' },
 'account.tab_overview': { en: 'Overview', fr: 'Aperçu', ar: 'نظرة عامة', es: 'Resumen', pt: 'Visão geral' },
 'account.tab_orders': { en: 'My Orders', fr: 'Mes commandes', ar: 'طلباتي', es: 'Mis pedidos', pt: 'Meus pedidos' },
 'account.tab_profile': { en: 'Profile', fr: 'Profil', ar: 'الملف الشخصي', es: 'Perfil', pt: 'Perfil' },
 'account.tab_settings': { en: 'Settings', fr: 'Paramètres', ar: 'الإعدادات', es: 'Ajustes', pt: 'Configurações' },
 'account.stat_orders': { en: 'Orders', fr: 'Commandes', ar: 'الطلبات', es: 'Pedidos', pt: 'Pedidos' },
 'account.stat_delivered':{ en: 'Delivered', fr: 'Livrées', ar: 'تم التسليم', es: 'Entregados', pt: 'Entregues' },
 'account.stat_pending': { en: 'In Progress', fr: 'En cours', ar: 'جارية', es: 'En curso', pt: 'Em andamento' },
 'account.stat_favorites':{ en: 'Favorites', fr: 'Favoris', ar: 'المفضلة', es: 'Favoritos', pt: 'Favoritos' },
 'account.admin_panel': { en: 'Admin Dashboard', fr: 'Tableau de bord Admin', ar: 'لوحة الإدارة', es: 'Panel de administración', pt: 'Painel de administração' },
 'account.admin_desc': { en: 'Manage products, orders and users', fr: 'Gérez les produits, commandes et utilisateurs', ar: 'إدارة المنتجات والطلبات والمستخدمين', es: 'Gestiona productos, pedidos y usuarios', pt: 'Gerenciar produtos, pedidos e usuários' },
 'account.admin_access': { en: 'Go to Dashboard', fr: 'Accéder', ar: 'الانتقال للوحة', es: 'Ir al panel', pt: 'Ir ao painel' },
 'account.no_orders': { en: 'No orders yet', fr: 'Aucune commande', ar: 'لا توجد طلبات', es: 'Sin pedidos aún', pt: 'Sem pedidos ainda' },
 'account.no_orders_desc':{ en: "You haven't placed any order yet. Explore our catalogue!", fr: "Vous n'avez pas encore passé de commande. Explorez notre catalogue !", ar: 'لم تقم بأي طلب بعد. استكشف متجرنا!', es: '¡Aún no has realizado ningún pedido. Explora nuestro catálogo!', pt: 'Você ainda não fez nenhum pedido. Explore nosso catálogo!' },
 'account.discover': { en: 'Discover', fr: 'Découvrir', ar: 'اكتشف', es: 'Descubrir', pt: 'Descobrir' },
 'account.personal_info': { en: 'Personal Information', fr: 'Informations personnelles', ar: 'المعلومات الشخصية', es: 'Información personal', pt: 'Informações pessoais' },
 'account.save': { en: 'Save', fr: 'Enregistrer', ar: 'حفظ', es: 'Guardar', pt: 'Salvar' },
 'account.change_pw_title':{ en: 'Change Password', fr: 'Changer le mot de passe', ar: 'تغيير كلمة المرور', es: 'Cambiar contraseña', pt: 'Alterar senha' },
 'account.current_pw': { en: 'Current Password', fr: 'Mot de passe actuel', ar: 'كلمة المرور الحالية', es: 'Contraseña actual', pt: 'Senha atual' },
 'account.new_pw': { en: 'New Password', fr: 'Nouveau mot de passe', ar: 'كلمة المرور الجديدة', es: 'Nueva contraseña', pt: 'Nova senha' },
 'account.confirm_pw': { en: 'Confirm', fr: 'Confirmer', ar: 'تأكيد', es: 'Confirmar', pt: 'Confirmar' },
 'account.change_pw_btn': { en: 'Change', fr: 'Changer', ar: 'تغيير', es: 'Cambiar', pt: 'Alterar' },
 'account.prefs_title': { en: 'Preferences', fr: 'Préférences', ar: 'التفضيلات', es: 'Preferencias', pt: 'Preferências' },
 'account.prefs_desc': { en: 'Language and theme preferences are accessible from the navigation bar. You can switch between dark and light mode, and change the language at any time.', fr: 'Les préférences de langue et de thème sont accessibles depuis la barre de navigation. Vous pouvez basculer entre le mode sombre et clair, et changer la langue à tout moment.', ar: 'إعدادات اللغة والسمة متاحة من شريط التنقل. يمكنك التبديل بين الوضع الداكن والفاتح، وتغيير اللغة في أي وقت.', es: 'Las preferencias de idioma y tema están accesibles desde la barra de navegación. Puedes cambiar entre modo oscuro y claro, y cambiar el idioma en cualquier momento.', pt: 'As preferências de idioma e tema estão acessíveis na barra de navegação. Você pode alternar entre os modos escuro e claro, e mudar o idioma a qualquer momento.' },
 'account.saved_ok': { en: 'Profile updated successfully', fr: 'Profil mis à jour avec succès', ar: 'تم تحديث الملف بنجاح', es: 'Perfil actualizado con éxito', pt: 'Perfil atualizado com sucesso' },
 'account.save_err': { en: 'Error updating profile', fr: 'Erreur lors de la mise à jour', ar: 'خطأ في التحديث', es: 'Error al actualizar', pt: 'Erro ao atualizar' },
 'account.pw_changed': { en: 'Password changed successfully', fr: 'Mot de passe changé avec succès', ar: 'تم تغيير كلمة المرور بنجاح', es: 'Contraseña cambiada con éxito', pt: 'Senha alterada com sucesso' },
 'account.pw_mismatch': { en: 'Passwords do not match', fr: 'Les mots de passe ne correspondent pas', ar: 'كلمتا المرور غير متطابقتين', es: 'Las contraseñas no coinciden', pt: 'As senhas não coincidem' },
 'account.pw_current_err':{ en: 'Incorrect current password',fr: 'Mot de passe actuel incorrect', ar: 'كلمة المرور الحالية غير صحيحة', es: 'Contraseña actual incorrecta', pt: 'Senha atual incorreta' },
 'account.net_err': { en: 'Network error', fr: 'Erreur réseau', ar: 'خطأ في الشبكة', es: 'Error de red', pt: 'Erro de rede' },
 'account.article': { en: 'item', fr: 'article', ar: 'عنصر', es: 'artículo', pt: 'item' },
 'account.articles': { en: 'items', fr: 'articles', ar: 'عناصر', es: 'artículos', pt: 'itens' },

 // Navbar user menu
 'nav.my_account': { en: 'My Account', fr: 'Mon compte', ar: 'حسابي', es: 'Mi cuenta', pt: 'Minha conta' },
 'nav.my_orders': { en: 'My Orders', fr: 'Mes commandes', ar: 'طلباتي', es: 'Mis pedidos', pt: 'Meus pedidos' },
 'nav.logout': { en: 'Log Out', fr: 'Déconnexion', ar: 'تسجيل الخروج', es: 'Cerrar sesión', pt: 'Sair' },
 'nav.login': { en: 'Sign In', fr: 'Connexion', ar: 'تسجيل الدخول', es: 'Iniciar sesión', pt: 'Entrar' },
 'nav.login_register':{ en: 'Sign In / Register', fr: 'Connexion / Inscription', ar: 'تسجيل الدخول / التسجيل', es: 'Entrar / Registrarse', pt: 'Entrar / Cadastrar' },

 // Status labels (order tracking / account)
 'status.pending': { en: 'Pending', fr: 'En attente', ar: 'معلق', es: 'Pendiente', pt: 'Pendente' },
 'status.confirmed': { en: 'Confirmed', fr: 'Confirmée', ar: 'مؤكدة', es: 'Confirmado', pt: 'Confirmado' },
 'status.processing': { en: 'Processing', fr: 'En préparation', ar: 'قيد التحضير', es: 'En preparación', pt: 'Processando' },
 'status.shipped': { en: 'Shipped', fr: 'Expédiée', ar: 'تم الشحن', es: 'Enviado', pt: 'Enviado' },
 'status.out_for_delivery': { en: 'Out for Delivery', fr: 'En livraison', ar: 'في طريق التسليم', es: 'En camino', pt: 'Saiu para entrega' },
 'status.delivered': { en: 'Delivered', fr: 'Livrée', ar: 'تم التسليم', es: 'Entregado', pt: 'Entregue' },
 'status.cancelled': { en: 'Cancelled', fr: 'Annulée', ar: 'ملغاة', es: 'Cancelado', pt: 'Cancelado' },

 // Admin — Sidebar & Header
 'admin.flash_sale': { en: 'Flash Sale', fr: 'Vente Flash', ar: 'تخفيض فلاش', es: 'Venta Flash', pt: 'Venda Flash' },
 'admin.categories': { en: 'Categories', fr: 'Catégories', ar: 'الفئات', es: 'Categorías', pt: 'Categorias' },
 'admin.team': { en: 'Team', fr: 'Équipe', ar: 'الفريق', es: 'Equipo', pt: 'Equipe' },
 'admin.view_site': { en: 'View Site', fr: 'Voir le site', ar: 'عرض الموقع', es: 'Ver sitio', pt: 'Ver site' },
 'admin.tracking_lbl': { en: 'Tracking', fr: 'Suivi', ar: 'التتبع', es: 'Seguimiento', pt: 'Rastreamento' },
 'admin.logout': { en: 'Logout', fr: 'Déconnexion', ar: 'تسجيل الخروج', es: 'Cerrar sesión', pt: 'Sair' },
 'admin.flash_title': { en: 'Flash Sale', fr: 'Vente Flash', ar: 'تخفيض فلاش', es: 'Venta Flash', pt: 'Venda Flash' },
 'admin.cat_title': { en: 'Category Management', fr: 'Gestion des Catégories', ar: 'إدارة الفئات', es: 'Gestión de Categorías', pt: 'Gestão de Categorias' },
 'admin.team_title': { en: '👥 Team Management', fr: '👥 Gestion Équipe', ar: '👥 إدارة الفريق', es: '👥 Gestión de Equipo', pt: '👥 Gestão de Equipe' },

 // Admin — Login
 'admin.login_password': { en: 'Password', fr: 'Mot de passe', ar: 'كلمة المرور', es: 'Contraseña', pt: 'Senha' },
 'admin.login_btn': { en: 'Sign In', fr: 'Se connecter', ar: 'تسجيل الدخول', es: 'Iniciar sesión', pt: 'Entrar' },

 // Admin — General UI
 'admin.edit': { en: 'Edit', fr: 'Modifier', ar: 'تعديل', es: 'Editar', pt: 'Editar' },
 'admin.cancel': { en: 'Cancel', fr: 'Annuler', ar: 'إلغاء', es: 'Cancelar', pt: 'Cancelar' },
 'admin.delete': { en: 'Delete', fr: 'Supprimer', ar: 'حذف', es: 'Eliminar', pt: 'Excluir' },
 'admin.create': { en: 'Create', fr: 'Créer', ar: 'إنشاء', es: 'Crear', pt: 'Criar' },
 'admin.update': { en: 'Update', fr: 'Modifier', ar: 'تحديث', es: 'Actualizar', pt: 'Atualizar' },
 'admin.refresh': { en: 'Refresh', fr: 'Actualiser', ar: 'تحديث', es: 'Actualizar', pt: 'Actualizar' },
 'admin.launch': { en: 'Launch', fr: 'Lancer', ar: 'إطلاق', es: 'Lanzar', pt: 'Lançar' },
 'admin.search_product': { en: 'Search product...', fr: 'Rechercher un produit...', ar: 'البحث عن منتج...', es: 'Buscar producto...', pt: 'Buscar produto...' },
 'admin.no_products': { en: 'No products found', fr: 'Aucun produit trouvé', ar: 'لا توجد منتجات', es: 'Sin productos', pt: 'Sem produtos' },

 // Admin — Staff / Team
 'admin.edit_profile': { en: 'Edit Profile', fr: 'Modifier le profil', ar: 'تعديل الملف', es: 'Editar perfil', pt: 'Editar perfil' },
 'admin.full_name': { en: 'Full Name', fr: 'Nom complet', ar: 'الاسم الكامل', es: 'Nombre completo', pt: 'Nome completo' },
 'admin.phone': { en: 'Phone', fr: 'Téléphone', ar: 'الهاتف', es: 'Teléfono', pt: 'Telefone' },
 'admin.new_password': { en: 'New Password', fr: 'Nouveau mot de passe', ar: 'كلمة المرور الجديدة', es: 'Nueva contraseña', pt: 'Nova senha' },
 'admin.optional': { en: 'optional', fr: 'optionnel', ar: 'اختياري', es: 'opcional', pt: 'opcional' },
 'admin.permissions': { en: 'Module Access', fr: 'Accès aux modules', ar: 'صلاحيات الوحدات', es: 'Accesos a módulos', pt: 'Acesso aos módulos' },
 'admin.save_changes': { en: 'Save Changes', fr: 'Enregistrer', ar: 'حفظ التغييرات', es: 'Guardar cambios', pt: 'Salvar mudanças' },
 'admin.new_employee': { en: '+ New Employee', fr: '+ Nouvel employé', ar: '+ موظف جديد', es: '+ Nuevo empleado', pt: '+ Novo funcionário' },
 'admin.no_staff': { en: 'No team members yet', fr: "Aucun membre dans l'équipe", ar: 'لا يوجد أعضاء', es: 'Sin miembros del equipo', pt: 'Sem membros na equipe' },

 // Admin — Flash Sale
 'admin.add_flash': { en: 'Add to Flash Sale', fr: 'Ajouter à la Vente Flash', ar: 'إضافة للتخفيض', es: 'Agregar a venta flash', pt: 'Adicionar à venda flash' },
 'admin.product_lbl': { en: 'Product', fr: 'Produit', ar: 'المنتج', es: 'Producto', pt: 'Produto' },
 'admin.select_product': { en: '-- Select a product --', fr: '-- Choisir un produit --', ar: '-- اختر منتجًا --', es: '-- Seleccionar producto --', pt: '-- Selecionar produto --' },
 'admin.discount_lbl': { en: 'Discount (%)', fr: 'Remise (%)', ar: 'الخصم (%)', es: 'Descuento (%)', pt: 'Desconto (%)' },
 'admin.sale_ends': { en: 'Sale Ends At', fr: 'Fin de la vente', ar: 'نهاية التخفيض', es: 'Fin de la venta', pt: 'Fim da venda' },
 'admin.flash_products': { en: 'Flash Sale Products', fr: 'Produits en Vente Flash', ar: 'منتجات التخفيض', es: 'Productos en venta flash', pt: 'Produtos em venda flash' },
 'admin.no_flash': { en: 'No products in flash sale', fr: 'Aucun produit en vente flash', ar: 'لا توجد منتجات في التخفيض', es: 'Sin productos en venta flash', pt: 'Sem produtos em venda flash' },
 'admin.expired': { en: 'Expired', fr: 'Expirée', ar: 'منتهية الصلاحية', es: 'Expirada', pt: 'Expirada' },
 'admin.ends_in': { en: 'Ends in', fr: 'Fin dans', ar: 'تنتهي خلال', es: 'Termina en', pt: 'Termina em' },
 'admin.remove_flash': { en: 'Remove from flash sale', fr: 'Retirer de la vente flash', ar: 'إزالة من التخفيض', es: 'Quitar de venta flash', pt: 'Remover da venda flash' },

 // Admin — Categories
 'admin.all_cats': { en: 'All Categories', fr: 'Toutes les Catégories', ar: 'جميع الفئات', es: 'Todas las categorías', pt: 'Todas as categorias' },
 'admin.new_cat': { en: 'New Category', fr: 'Nouvelle Catégorie', ar: 'فئة جديدة', es: 'Nueva categoría', pt: 'Nova categoria' },
 'admin.name_en': { en: 'Name (EN)', fr: 'Nom (EN)', ar: 'الاسم (EN)', es: 'Nombre (EN)', pt: 'Nome (EN)' },
 'admin.name_fr': { en: 'Name (FR)', fr: 'Nom (FR)', ar: 'الاسم (FR)', es: 'Nombre (FR)', pt: 'Nome (FR)' },
 'admin.name_ar': { en: 'Name (AR)', fr: 'Nom (AR)', ar: 'الاسم (AR)', es: 'Nombre (AR)', pt: 'Nome (AR)' },
 'admin.icon_color': { en: 'Icon & Color', fr: 'Icône & Couleur', ar: 'الأيقونة واللون', es: 'Icono y color', pt: 'Ícone e cor' },
 'admin.no_cats': { en: 'No categories yet. Create one!', fr: 'Aucune catégorie. Créez-en une !', ar: 'لا توجد فئات بعد. أنشئ واحدة!', es: 'Sin categorías. ¡Crea una!', pt: 'Nenhuma categoria. Crie uma!' },

 // Admin — Stock
 'admin.all_stock': { en: 'All Stock', fr: 'Tout le Stock', ar: 'كل المخزون', es: 'Todo el stock', pt: 'Todo o estoque' },
 'admin.alerts': { en: 'Alerts', fr: 'Alertes', ar: 'التنبيهات', es: 'Alertas', pt: 'Alertas' },
 'admin.stock_mgmt': { en: 'Stock Management', fr: 'Gestion du Stock', ar: 'إدارة المخزون', es: 'Gestión de stock', pt: 'Gestão de estoque' },
 'admin.products_count': { en: 'products', fr: 'produits', ar: 'منتجات', es: 'productos', pt: 'produtos' },
 'admin.col_product': { en: 'Product', fr: 'Produit', ar: 'المنتج', es: 'Producto', pt: 'Produto' },
 'admin.col_category': { en: 'Category', fr: 'Catégorie', ar: 'الفئة', es: 'Categoría', pt: 'Categoria' },
 'admin.col_price': { en: 'Price', fr: 'Prix', ar: 'السعر', es: 'Precio', pt: 'Preço' },
 'admin.col_stock': { en: 'Total Stock', fr: 'Stock Total', ar: 'المخزون الإجمالي', es: 'Stock total', pt: 'Estoque total' },
 'admin.col_status': { en: 'Status', fr: 'Statut', ar: 'الحالة', es: 'Estado', pt: 'Status' },
 'admin.col_actions': { en: 'Actions', fr: 'Actions', ar: 'الإجراءات', es: 'Acciones', pt: 'Ações' },
 'admin.stock_out': { en: 'Out of Stock', fr: 'Rupture', ar: 'نفاد المخزون', es: 'Sin stock', pt: 'Sem estoque' },
 'admin.stock_critical': { en: 'Critical', fr: 'Critique', ar: 'حرج', es: 'Crítico', pt: 'Crítico' },
 'admin.stock_low': { en: 'Low', fr: 'Bas', ar: 'منخفض', es: 'Bajo', pt: 'Baixo' },
 'admin.stock_ok': { en: 'In Stock', fr: 'OK', ar: 'متوفر', es: 'En stock', pt: 'Em estoque' },
 'admin.variants': { en: 'Variants', fr: 'Variantes', ar: 'المتغيرات', es: 'Variantes', pt: 'Variantes' },
 'admin.add_variant': { en: '+ Add', fr: '+ Ajouter', ar: '+ إضافة', es: '+ Agregar', pt: '+ Adicionar' },
 'admin.add_variant_btn':{ en: '+ Variant', fr: '+ Variante', ar: '+ متغير', es: '+ Variante', pt: '+ Variante' },
 'admin.custom_type': { en: 'Custom type...', fr: 'Type personnalisé...', ar: 'نوع مخصص...', es: 'Tipo personalizado...', pt: 'Tipo personalizado...' },
 'admin.var_name': { en: 'Name', fr: 'Nom', ar: 'الاسم', es: 'Nombre', pt: 'Nome' },
 'admin.var_value': { en: 'Value', fr: 'Valeur', ar: 'القيمة', es: 'Valor', pt: 'Valor' },
 'admin.no_variants': { en: 'No variants yet. Add colors, sizes, or custom types.', fr: 'Aucune variante. Ajoutez des couleurs, tailles ou types personnalisés.', ar: 'لا توجد متغيرات بعد.', es: 'Sin variantes. Añade colores, tallas o tipos.', pt: 'Sem variantes. Adicione cores, tamanhos ou tipos.' },
 'admin.colors': { en: 'Colors', fr: 'Couleurs', ar: 'الألوان', es: 'Colores', pt: 'Cores' },
 'admin.variants_count': { en: 'variants', fr: 'variantes', ar: 'متغيرات', es: 'variantes', pt: 'variantes' },

 // Product visibility
 'admin.visible': { en: 'Visible', fr: 'Visible', ar: 'مرئي', es: 'Visible', pt: 'Visível' },
 'admin.hidden': { en: 'Hidden', fr: 'Masqué', ar: 'مخفي', es: 'Oculto', pt: 'Oculto' },
 'admin.hide': { en: 'Hide', fr: 'Masquer', ar: 'إخفاء', es: 'Ocultar', pt: 'Ocultar' },
 'admin.show': { en: 'Show', fr: 'Afficher', ar: 'إظهار', es: 'Mostrar', pt: 'Mostrar' },
 'admin.filter_all': { en: 'All', fr: 'Tous', ar: 'الكل', es: 'Todos', pt: 'Todos' },
 'admin.filter_visible': { en: 'Visible', fr: 'Visibles', ar: 'مرئية', es: 'Visibles', pt: 'Visíveis' },
 'admin.filter_hidden': { en: 'Hidden', fr: 'Masqués', ar: 'مخفية', es: 'Ocultos', pt: 'Ocultos' },
 'admin.no_hidden': { en: 'No hidden products', fr: 'Aucun produit masqué', ar: 'لا توجد منتجات مخفية', es: 'Sin productos ocultos', pt: 'Nenhum produto oculto' },
 'admin.no_products': { en: 'No products found', fr: 'Aucun produit trouvé', ar: 'لا توجد منتجات', es: 'No se encontraron productos', pt: 'Nenhum produto encontrado' },
};


interface I18nContextType {
 locale: Locale;
 setLocale: (locale: Locale) => void;
 t: (key: string) => string;
 dir: 'ltr' | 'rtl';
}

export const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: ReactNode }) {
 const [locale, setLocale] = useState<Locale>('fr');

 useEffect(() => {
 const saved = localStorage.getItem('wiwishop-locale') as Locale;
 if (saved && ['en', 'fr', 'ar', 'es', 'pt'].includes(saved)) {
 setLocale(saved);
 }
 }, []);

 useEffect(() => {
 localStorage.setItem('wiwishop-locale', locale);
 document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr';
 document.documentElement.lang = locale;
 }, [locale]);

 const t = (key: string): string => {
 const entry = translations[key];
 if (!entry) return key;
 return entry[locale] || entry.en || key;
 };

 const dir = locale === 'ar' ? 'rtl' : 'ltr';

 return (
 <I18nContext.Provider value={{ locale, setLocale, t, dir }}>
 {children}
 </I18nContext.Provider>
 );
}

export function useI18n() {
 const context = useContext(I18nContext);
 if (!context) throw new Error('useI18n must be used within I18nProvider');
 return context;
}
