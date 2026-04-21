/* ===========================
   Khkula — Application Logic
   SECURITY HARDENED + PAYPAL
   =========================== */

/* ══════════════════════════════════════════════════════
   SECURITY UTILITIES
   ══════════════════════════════════════════════════════ */

/**
 * escapeHtml — Prevents XSS by escaping all user-controlled text
 * before inserting it into innerHTML.
 * ALWAYS use this on any value that comes from outside the
 * hardcoded `products` / `categories` arrays.
 */
function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * sanitizeNumber — Ensures a value is a finite, positive number.
 * Used for prices and quantities so they can't be tampered via
 * localStorage manipulation.
 */
function sanitizeNumber(val, min = 0, max = Infinity) {
  const n = parseFloat(val);
  if (!isFinite(n)) return min;
  return Math.min(max, Math.max(min, n));
}

/**
 * sanitizeQuery — Strips everything except safe search characters.
 */
function sanitizeQuery(str) {
  return String(str).replace(/[<>"'`]/g, '').slice(0, 100);
}

/**
 * validateCartItem — Validates an item loaded from localStorage
 * against the known products list so nobody can inject fake items
 * or manipulate prices.
 */
function validateCartItem(item) {
  const real = products.find(p => p.id === item.id);
  if (!real) return null; // unknown product — reject
  return {
    id: real.id,
    name: real.name,       // always use server-side name
    price: real.price,     // always use server-side price
    image: real.image,
    qty: sanitizeNumber(item.qty, 1, 99),
  };
}

/**
 * loadCart — Safely hydrates cart from localStorage,
 * rejecting any tampered entries.
 */
function loadCart() {
  try {
    const raw = localStorage.getItem('khkula-cart');
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map(validateCartItem).filter(Boolean);
  } catch {
    return [];
  }
}

/**
 * Rate limiter — prevents rapid add-to-cart spam / bot abuse.
 * Limits any keyed action to `maxCalls` within `windowMs`.
 */
const _rateLimitStore = {};
function rateLimit(key, maxCalls = 10, windowMs = 5000) {
  const now = Date.now();
  if (!_rateLimitStore[key]) _rateLimitStore[key] = [];
  _rateLimitStore[key] = _rateLimitStore[key].filter(t => now - t < windowMs);
  if (_rateLimitStore[key].length >= maxCalls) return false;
  _rateLimitStore[key].push(now);
  return true;
}


/* ══════════════════════════════════════════════════════
   DATA  (hardcoded — never sourced from user input)
   ══════════════════════════════════════════════════════ */

const categories = [
  { id: 'women',        name: "Women's Clothing",          count: 6, image: 'https://picsum.photos/seed/women-afghan/600/400' },
  { id: 'men',          name: "Men's Clothing",            count: 4, image: 'https://picsum.photos/seed/men-afghan/600/400' },
  { id: 'kids',         name: "Kids' Clothing",            count: 3, image: 'https://picsum.photos/seed/kids-afghan/600/400' },
  { id: 'wedding-dresses', name: 'Wedding Dresses',        count: 3, image: 'https://picsum.photos/seed/wedding-dress-af/600/400' },
  { id: 'wedding-decor',   name: 'Wedding Decor & Accessories', count: 2, image: 'https://picsum.photos/seed/wedding-decor-af/600/400' },
  { id: 'jewelry',      name: 'Jewelry',                   count: 4, image: 'https://picsum.photos/seed/jewelry-afghan/600/400' },
  { id: 'gifts',        name: 'Gifts',                     count: 2, image: 'https://picsum.photos/seed/gifts-afghan/600/400' },
];

const products = [
  /* Women */
  { id: 1,  name: 'Kuchi Tribal Dress',         price: 289, category: 'women',          image: 'https://picsum.photos/seed/kuchi-dress/400/500',      desc: 'Hand-embroidered Kuchi dress with mirror work and traditional tribal patterns.' },
  { id: 2,  name: 'Silk Chador',                price: 149, category: 'women',          image: 'https://picsum.photos/seed/silk-chador/400/500',      desc: 'Pure silk chador with delicate gold thread embroidery along the borders.' },
  { id: 3,  name: 'Embroidered Tunic',          price: 179, category: 'women',          image: 'https://picsum.photos/seed/embroidered-tunic/400/500',desc: 'Loose-fitting tunic with intricate Afghan needlework on cotton fabric.' },
  { id: 4,  name: 'Traditional Skirt Set',      price: 219, category: 'women',          image: 'https://picsum.photos/seed/skirt-set-af/400/500',     desc: 'Flowing multi-layered skirt with matching embroidered bodice.' },
  { id: 5,  name: 'Beaded Blouse',              price: 159, category: 'women',          image: 'https://picsum.photos/seed/beaded-blouse/400/500',    desc: 'Fitted blouse with hand-sewn beadwork and traditional motifs.' },
  { id: 6,  name: 'Gold Thread Shawl',          price: 129, category: 'women',          image: 'https://picsum.photos/seed/gold-shawl/400/500',       desc: 'Lightweight pashmina shawl woven with gold threads.' },
  /* Men */
  { id: 7,  name: 'Perahan Tunban',             price: 199, category: 'men',            image: 'https://picsum.photos/seed/perahan-tunban/400/500',   desc: 'Traditional Afghan tunic and trousers set in premium cotton.' },
  { id: 8,  name: 'Embroidered Waistcoat',      price: 169, category: 'men',            image: 'https://picsum.photos/seed/waistcoat-af/400/500',     desc: 'Handcrafted waistcoat with mirror work and silk embroidery.' },
  { id: 9,  name: 'Traditional Embroidered Shirt', price: 139, category: 'men',         image: 'https://picsum.photos/seed/men-shirt-af/400/500',     desc: 'Long-sleeve shirt with intricate chest and collar embroidery.' },
  { id: 10, name: 'Afghan Pakol Cap',           price: 49,  category: 'men',            image: 'https://picsum.photos/seed/pakol-cap/400/500',        desc: 'Classic wool Pakol cap, hand-felted by Afghan artisans.' },
  /* Kids */
  { id: 11, name: 'Mini Kuchi Dress',           price: 119, category: 'kids',           image: 'https://picsum.photos/seed/mini-kuchi/400/500',       desc: "Children's Kuchi dress with colorful embroidery and tassels." },
  { id: 12, name: 'Boys Perahan Set',           price: 89,  category: 'kids',           image: 'https://picsum.photos/seed/boys-perahan/400/500',     desc: "Traditional boys' outfit with embroidered collar detail." },
  { id: 13, name: 'Girls Embroidered Outfit',   price: 99,  category: 'kids',           image: 'https://picsum.photos/seed/girls-outfit-af/400/500',  desc: 'Adorable two-piece set with floral embroidery and ribbon trim.' },
  /* Wedding Dresses */
  { id: 14, name: 'Bridal Kuchi Dress',         price: 549, category: 'wedding-dresses',image: 'https://picsum.photos/seed/bridal-kuchi/400/500',     desc: 'Show-stopping bridal dress with full mirror work, beads, and gold thread.' },
  { id: 15, name: "Groom's Wedding Ensemble",   price: 399, category: 'wedding-dresses',image: 'https://picsum.photos/seed/groom-ensemble/400/500',   desc: "Complete groom's outfit with embroidered perahan, waistcoat, and turban." },
  { id: 16, name: 'Wedding Henna Outfit',       price: 189, category: 'wedding-dresses',image: 'https://picsum.photos/seed/henna-outfit/400/500',     desc: 'Green silk outfit for the henna night celebration, with gold accents.' },
  /* Wedding Decor */
  { id: 17, name: 'Embroidered Cushion Set',    price: 79,  category: 'wedding-decor',  image: 'https://picsum.photos/seed/cushion-set/400/500',      desc: 'Set of 4 hand-embroidered cushions in traditional Afghan patterns.' },
  { id: 18, name: 'Gold Lantern Set',           price: 69,  category: 'wedding-decor',  image: 'https://picsum.photos/seed/lantern-gold/400/500',     desc: 'Set of 3 ornate metal lanterns with gold finish for wedding decor.' },
  /* Jewelry */
  { id: 19, name: 'Kuchi Tribal Necklace',      price: 189, category: 'jewelry',        image: 'https://picsum.photos/seed/kuchi-necklace/400/500',   desc: 'Statement tribal necklace with coins, beads, and intricate metalwork.' },
  { id: 20, name: 'Turquoise Earrings',         price: 79,  category: 'jewelry',        image: 'https://picsum.photos/seed/turquoise-ear/400/500',    desc: 'Elegant earrings featuring genuine Afghan turquoise stones.' },
  { id: 21, name: 'Gold-Plated Bracelet',       price: 99,  category: 'jewelry',        image: 'https://picsum.photos/seed/gold-bracelet/400/500',    desc: 'Handcrafted bracelet with traditional Afghan filigree design.' },
  { id: 22, name: 'Statement Ring Set',         price: 69,  category: 'jewelry',        image: 'https://picsum.photos/seed/ring-set-af/400/500',      desc: 'Set of 3 rings with turquoise, coral, and gold-plated details.' },
  /* Gifts */
  { id: 23, name: 'Embroidered Tablecloth',     price: 89,  category: 'gifts',          image: 'https://picsum.photos/seed/tablecloth-af/400/500',    desc: 'Large hand-embroidered tablecloth showcasing Afghan textile art.' },
  { id: 24, name: 'Miniature Afghan Carpet',    price: 129, category: 'gifts',          image: 'https://picsum.photos/seed/mini-carpet/400/500',      desc: 'Authentic hand-knotted miniature carpet, perfect as wall art or decor.' },
];

const heroSlides = [
  { image: 'https://picsum.photos/seed/hero-afghan1/1920/900', title: 'Timeless Afghan Elegance',  subtitle: 'Discover handcrafted traditional clothing',              cta: 'Shop Collection' },
  { image: 'https://picsum.photos/seed/hero-wedding2/1920/900', title: 'Bridal Perfection',        subtitle: 'Exquisite wedding dresses for your special day',         cta: 'View Wedding Collection' },
  { image: 'https://picsum.photos/seed/hero-jewelry3/1920/900', title: 'Artisan Jewelry',          subtitle: 'Authentic Kuchi jewelry, handcrafted with love',         cta: 'Explore Jewelry' },
];


/* ══════════════════════════════════════════════════════
   STATE
   ══════════════════════════════════════════════════════ */
let state = {
  currentPage: 'home',
  cart: loadCart(),           // uses secure loader
  searchQuery: '',
  activeCategory: 'all',
  currentSlide: 0,
  cartOpen: false,
  mobileMenuOpen: false,
  searchOpen: false,
};
let slideInterval = null;
let _paypalRendered = false; // guard against double-rendering PayPal buttons


/* ══════════════════════════════════════════════════════
   HELPERS
   ══════════════════════════════════════════════════════ */
function getCategoryName(id) {
  const cat = categories.find(c => c.id === id);
  return cat ? cat.name : escapeHtml(id);
}

function saveCart() {
  try {
    localStorage.setItem('khkula-cart', JSON.stringify(state.cart));
  } catch {
    // localStorage may be full or disabled — fail silently
  }
}

function getCartTotal() {
  return state.cart.reduce((sum, item) => sum + item.price * item.qty, 0);
}

function getCartCount() {
  return state.cart.reduce((sum, item) => sum + item.qty, 0);
}

function getFilteredProducts() {
  let result = products;
  if (state.activeCategory !== 'all') {
    result = result.filter(p => p.category === state.activeCategory);
  }
  if (state.searchQuery.trim()) {
    const q = sanitizeQuery(state.searchQuery).toLowerCase();
    result = result.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.desc.toLowerCase().includes(q)
    );
  }
  return result;
}


/* ══════════════════════════════════════════════════════
   NAVIGATION
   ══════════════════════════════════════════════════════ */
function navigateTo(page, category) {
  // Whitelist allowed pages
  const ALLOWED_PAGES = ['home', 'shop', 'tailoring', 'about'];
  if (!ALLOWED_PAGES.includes(page)) return;

  if (category) state.activeCategory = category;
  else if (page === 'shop') state.activeCategory = 'all';
  state.searchQuery = '';

  const content = document.getElementById('page-content');
  content.classList.add('fading');
  setTimeout(() => {
    state.currentPage = page;
    renderPage();
    content.classList.remove('fading');
    window.scrollTo({ top: 0, behavior: 'instant' });
    updateNavState();
    updateNavbarStyle();
    if (page === 'home') startSlideshow();
    else stopSlideshow();
    setTimeout(initScrollReveal, 50);
  }, 300);
}

function updateNavState() {
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.toggle('active', link.dataset.page === state.currentPage);
  });
}

function updateNavbarStyle() {
  const navbar = document.getElementById('navbar');
  if (state.currentPage === 'home' && window.scrollY <= 50) {
    navbar.classList.add('nav-transparent');
  } else {
    navbar.classList.remove('nav-transparent');
  }
}

window.addEventListener('scroll', updateNavbarStyle);


/* ══════════════════════════════════════════════════════
   PAGE ROUTER
   ══════════════════════════════════════════════════════ */
function renderPage() {
  const content = document.getElementById('page-content');
  _paypalRendered = false; // reset on each page change
  switch (state.currentPage) {
    case 'home':      content.innerHTML = renderHome();      break;
    case 'shop':      content.innerHTML = renderShop();      break;
    case 'tailoring': content.innerHTML = renderTailoring(); break;
    case 'about':     content.innerHTML = renderAbout();     break;
  }
}


/* ══════════════════════════════════════════════════════
   HOME PAGE
   ══════════════════════════════════════════════════════ */
function renderHome() {
  return `
    <!-- Hero Slideshow -->
    <section class="relative h-screen min-h-[600px] overflow-hidden">
      ${heroSlides.map((slide, i) => `
        <div class="hero-slide ${i === 0 ? 'active' : ''}">
          <img src="${escapeHtml(slide.image)}" alt="${escapeHtml(slide.title)}" loading="${i === 0 ? 'eager' : 'lazy'}">
          <div class="hero-overlay"></div>
        </div>
      `).join('')}
      <div class="absolute inset-0 flex items-center z-10">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 w-full">
          <div id="hero-text" style="transition: opacity 0.5s, transform 0.5s;">
            <div class="gold-divider left-align mb-6">
              <span class="text-gold text-xs font-bold tracking-[0.3em] uppercase">Khkula Collection</span>
            </div>
            <h1 class="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-4">${escapeHtml(heroSlides[0].title)}</h1>
            <p class="text-white/80 text-lg sm:text-xl font-light mb-8 max-w-md">${escapeHtml(heroSlides[0].subtitle)}</p>
            <button onclick="navigateTo('shop')" class="bg-darkred hover:bg-darkred-dark text-white px-8 py-4 text-sm font-bold tracking-widest uppercase transition-all duration-300 rounded-sm hover:shadow-lg hover:shadow-darkred/30">
              ${escapeHtml(heroSlides[0].cta)}
            </button>
          </div>
        </div>
      </div>
      <div class="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex gap-3">
        ${heroSlides.map((_, i) => `<button class="slide-dot ${i === 0 ? 'active' : ''}" onclick="goToSlide(${i})" aria-label="Slide ${i + 1}"></button>`).join('')}
      </div>
      <button onclick="prevSlide()" class="hero-arrow left" aria-label="Previous slide"><i class="fas fa-chevron-left"></i></button>
      <button onclick="nextSlide()" class="hero-arrow right" aria-label="Next slide"><i class="fas fa-chevron-right"></i></button>
    </section>

    <!-- Categories -->
    <section class="py-20 md:py-28">
      <div class="max-w-7xl mx-auto px-4 sm:px-6">
        <div class="text-center mb-14 reveal">
          <div class="gold-divider mb-4"><span class="text-gold text-xs font-bold tracking-[0.3em] uppercase">Browse</span></div>
          <h2 class="font-display text-3xl sm:text-4xl font-bold">Our Categories</h2>
        </div>
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          ${categories.map((cat, i) => `
            <div class="category-card aspect-[4/3] reveal" style="transition-delay:${i * 80}ms" onclick="navigateTo('shop','${escapeHtml(cat.id)}')">
              <img src="${escapeHtml(cat.image)}" alt="${escapeHtml(cat.name)}" loading="lazy">
              <div class="card-overlay"></div>
              <div class="card-text">
                <h3 class="font-display text-white text-base sm:text-lg font-bold">${escapeHtml(cat.name)}</h3>
                <p class="text-white/60 text-xs mt-1">${cat.count} items</p>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </section>

    <!-- Featured Products -->
    <section class="py-20 md:py-28 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6">
        <div class="text-center mb-14 reveal">
          <div class="gold-divider mb-4"><span class="text-gold text-xs font-bold tracking-[0.3em] uppercase">Curated</span></div>
          <h2 class="font-display text-3xl sm:text-4xl font-bold">Featured Pieces</h2>
        </div>
        <div class="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          ${products.slice(0, 6).map((p, i) => renderProductCard(p, i)).join('')}
        </div>
        <div class="text-center mt-12 reveal">
          <button onclick="navigateTo('shop')" class="border-2 border-darkred text-darkred hover:bg-darkred hover:text-white px-10 py-4 text-sm font-bold tracking-widest uppercase transition-all duration-300 rounded-sm">
            View All Products
          </button>
        </div>
      </div>
    </section>

    <!-- Why Choose Us -->
    <section class="py-20 md:py-28">
      <div class="max-w-7xl mx-auto px-4 sm:px-6">
        <div class="text-center mb-14 reveal">
          <div class="gold-divider mb-4"><span class="text-gold text-xs font-bold tracking-[0.3em] uppercase">Why Khkula</span></div>
          <h2 class="font-display text-3xl sm:text-4xl font-bold">The Khkula Difference</h2>
        </div>
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <div class="feature-card reveal"><div class="feature-icon"><i class="fas fa-hand-sparkles"></i></div><h3 class="font-display text-lg font-bold mb-2">Handcrafted</h3><p class="text-sm text-gray-500 leading-relaxed">Every piece is made by skilled Afghan artisans using traditional techniques passed through generations.</p></div>
          <div class="feature-card reveal" style="transition-delay:100ms"><div class="feature-icon"><i class="fas fa-gem"></i></div><h3 class="font-display text-lg font-bold mb-2">Authentic</h3><p class="text-sm text-gray-500 leading-relaxed">Genuine materials sourced from local Afghan markets. No imitations, only the real heritage.</p></div>
          <div class="feature-card reveal" style="transition-delay:200ms"><div class="feature-icon"><i class="fas fa-ruler-combined"></i></div><h3 class="font-display text-lg font-bold mb-2">Custom Fit</h3><p class="text-sm text-gray-500 leading-relaxed">Get clothes tailored to your exact measurements for a perfect, flattering fit every time.</p></div>
          <div class="feature-card reveal" style="transition-delay:300ms"><div class="feature-icon"><i class="fas fa-globe-americas"></i></div><h3 class="font-display text-lg font-bold mb-2">Global Delivery</h3><p class="text-sm text-gray-500 leading-relaxed">We ship worldwide with careful packaging to ensure your items arrive in perfect condition.</p></div>
        </div>
      </div>
    </section>

    <!-- CTA Banner -->
    <section class="py-20 md:py-28 bg-darkred cta-pattern relative overflow-hidden">
      <div class="absolute inset-0 bg-gradient-to-r from-darkred-dark/80 to-darkred/40"></div>
      <div class="max-w-4xl mx-auto px-4 sm:px-6 text-center relative z-10 reveal">
        <div class="gold-divider mb-6"><span class="text-gold text-xs font-bold tracking-[0.3em] uppercase">Made For You</span></div>
        <h2 class="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">Custom Tailored to Your Exact Measurements</h2>
        <p class="text-white/70 text-lg mb-10 max-w-2xl mx-auto font-light">Experience the luxury of clothing made specifically for you. Our master tailors bring your vision to life with precision and artistry.</p>
        <button onclick="navigateTo('tailoring')" class="bg-gold hover:bg-gold-light text-darkred-dark px-10 py-4 text-sm font-bold tracking-widest uppercase transition-all duration-300 rounded-sm hover:shadow-lg">
          Start Custom Order
        </button>
      </div>
    </section>
  `;
}


/* ══════════════════════════════════════════════════════
   SHOP PAGE
   ══════════════════════════════════════════════════════ */
function renderShop() {
  const filtered = getFilteredProducts();
  return `
    <section class="pt-28 md:pt-32 pb-20 md:pb-28">
      <div class="max-w-7xl mx-auto px-4 sm:px-6">
        <div class="mb-10">
          <div class="gold-divider left-align mb-4"><span class="text-gold text-xs font-bold tracking-[0.3em] uppercase">Shop</span></div>
          <h1 class="font-display text-3xl sm:text-4xl font-bold">Our Collection</h1>
          <p class="text-gray-500 mt-2" id="shop-count">Showing ${filtered.length} product${filtered.length !== 1 ? 's' : ''}</p>
        </div>

        <div class="mb-4">
          <div class="relative max-w-md">
            <i class="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
            <input type="text" placeholder="Search products..."
                   value="${escapeHtml(state.searchQuery)}"
                   oninput="handleShopSearch(this.value)"
                   maxlength="100"
                   autocomplete="off"
                   class="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-gold bg-white font-body transition-colors">
          </div>
        </div>

        <div class="flex flex-wrap gap-2 mb-10" id="filter-bar">
          <button class="filter-btn ${state.activeCategory === 'all' ? 'active' : ''}" onclick="filterCategory('all')">All</button>
          ${categories.map(c => `<button class="filter-btn ${state.activeCategory === c.id ? 'active' : ''}" onclick="filterCategory('${escapeHtml(c.id)}')">${escapeHtml(c.name)}</button>`).join('')}
        </div>

        <div id="shop-grid" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          ${filtered.map((p, i) => renderProductCard(p, i)).join('')}
        </div>
        ${filtered.length === 0 ? `
          <div class="text-center py-20" id="shop-empty">
            <i class="fas fa-search text-4xl text-gray-300 mb-4 block"></i>
            <p class="text-gray-400 text-lg">No products found matching your criteria.</p>
            <button onclick="clearFilters()" class="mt-4 text-darkred font-bold hover:underline">Clear filters</button>
          </div>
        ` : ''}
      </div>
    </section>
  `;
}

function clearFilters() {
  state.activeCategory = 'all';
  state.searchQuery = '';
  renderPage();
  setTimeout(initScrollReveal, 50);
}

function filterCategory(cat) {
  // Whitelist category ids
  const valid = ['all', ...categories.map(c => c.id)];
  if (!valid.includes(cat)) return;
  state.activeCategory = cat;
  renderPage();
  setTimeout(initScrollReveal, 50);
}

function handleShopSearch(query) {
  state.searchQuery = sanitizeQuery(query);
  const filtered = getFilteredProducts();

  const countEl = document.getElementById('shop-count');
  if (countEl) countEl.textContent = `Showing ${filtered.length} product${filtered.length !== 1 ? 's' : ''}`;

  const grid  = document.getElementById('shop-grid');
  const empty = document.getElementById('shop-empty');
  if (grid) {
    grid.innerHTML = filtered.map((p, i) => renderProductCard(p, i)).join('');
    if (filtered.length === 0 && !empty) {
      grid.insertAdjacentHTML('afterend', `
        <div class="text-center py-20" id="shop-empty">
          <i class="fas fa-search text-4xl text-gray-300 mb-4 block"></i>
          <p class="text-gray-400 text-lg">No products found matching your criteria.</p>
          <button onclick="clearFilters()" class="mt-4 text-darkred font-bold hover:underline">Clear filters</button>
        </div>
      `);
    } else if (filtered.length > 0 && empty) {
      empty.remove();
    }
  }
  setTimeout(initScrollReveal, 50);
}


/* ══════════════════════════════════════════════════════
   PRODUCT CARD  (all data from hardcoded array — safe)
   ══════════════════════════════════════════════════════ */
function renderProductCard(p, index) {
  const inCart = state.cart.find(c => c.id === p.id);
  return `
    <div class="product-card reveal" style="transition-delay:${(index % 8) * 60}ms">
      <div class="product-img">
        <img src="${escapeHtml(p.image)}" alt="${escapeHtml(p.name)}" loading="lazy">
        ${inCart ? '<div class="in-cart-badge"><i class="fas fa-check mr-1"></i>In Cart</div>' : ''}
      </div>
      <div class="p-4">
        <p class="text-[11px] text-gray-400 uppercase tracking-wider font-bold mb-1">${escapeHtml(getCategoryName(p.category))}</p>
        <h3 class="font-display text-sm sm:text-base font-bold leading-snug mb-1 line-clamp-2">${escapeHtml(p.name)}</h3>
        <p class="text-gray-400 text-xs leading-relaxed mb-3 line-clamp-2">${escapeHtml(p.desc)}</p>
        <div class="flex items-center justify-between gap-2">
          <span class="text-darkred font-bold text-lg">$${p.price.toFixed(2)}</span>
          <button class="btn-add-cart" onclick="addToCart(${p.id})">
            ${inCart ? 'Add More' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  `;
}


/* ══════════════════════════════════════════════════════
   TAILORING PAGE
   ══════════════════════════════════════════════════════ */
function renderTailoring() {
  return `
    <section class="pt-28 md:pt-32 pb-20 md:pb-28">
      <div class="max-w-7xl mx-auto px-4 sm:px-6">
        <div class="mb-14">
          <div class="gold-divider left-align mb-4"><span class="text-gold text-xs font-bold tracking-[0.3em] uppercase">Personalized</span></div>
          <h1 class="font-display text-3xl sm:text-4xl font-bold">Custom Tailoring</h1>
          <p class="text-gray-500 mt-3 max-w-2xl text-lg font-light">Get any piece from our collection tailored to your exact measurements. Fill in the form below and our master tailors will craft your garment with precision.</p>
        </div>

        <div class="grid lg:grid-cols-2 gap-12 lg:gap-16">
          <div class="reveal">
            <div class="aspect-[4/5] rounded-lg overflow-hidden mb-8">
              <img src="https://picsum.photos/seed/tailoring-afghan/600/750" alt="Custom tailoring" class="w-full h-full object-cover">
            </div>
            <div class="space-y-6">
              ${[['1','Choose Your Design','Select any product from our shop or describe your dream design.'],
                 ['2','Provide Your Measurements','Fill in the detailed measurement form with your exact sizes.'],
                 ['3','We Craft & Deliver','Our artisans create your piece and ship it to your doorstep within 2–3 weeks.']].map(([n,h,p]) => `
                <div class="flex gap-4">
                  <div class="w-10 h-10 rounded-full bg-darkred/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span class="text-darkred font-display font-bold text-sm">${n}</span>
                  </div>
                  <div><h3 class="font-display font-bold mb-1">${h}</h3><p class="text-sm text-gray-500">${p}</p></div>
                </div>
              `).join('')}
            </div>
          </div>

          <div class="reveal" style="transition-delay:150ms">
            <form id="tailoring-form" class="bg-white rounded-xl p-6 sm:p-8 shadow-sm border border-gray-100" onsubmit="handleTailoringSubmit(event)" novalidate>
              <h3 class="font-display text-xl font-bold mb-6 pb-4 border-b border-gray-100">Measurement Form</h3>

              <p class="text-xs text-gray-400 uppercase tracking-wider font-bold mb-4">Personal Information</p>
              <div class="grid sm:grid-cols-2 gap-4 mb-8">
                <div>
                  <label class="block text-sm font-bold mb-1.5" for="tf-name">Full Name</label>
                  <input id="tf-name" name="fullName" type="text" required maxlength="100" class="measure-input" placeholder="Your full name" autocomplete="name">
                </div>
                <div>
                  <label class="block text-sm font-bold mb-1.5" for="tf-email">Email</label>
                  <input id="tf-email" name="email" type="email" required maxlength="254" class="measure-input" placeholder="your@email.com" autocomplete="email">
                </div>
                <div>
                  <label class="block text-sm font-bold mb-1.5" for="tf-phone">Phone</label>
                  <input id="tf-phone" name="phone" type="tel" maxlength="20" class="measure-input" placeholder="+1 234 567 890" autocomplete="tel">
                </div>
                <div>
                  <label class="block text-sm font-bold mb-1.5" for="tf-type">Clothing Type</label>
                  <select id="tf-type" name="clothingType" required class="measure-input" style="cursor:pointer">
                    <option value="">Select type...</option>
                    ${categories.map(c => `<option value="${escapeHtml(c.id)}">${escapeHtml(c.name)}</option>`).join('')}
                  </select>
                </div>
              </div>

              <p class="text-xs text-gray-400 uppercase tracking-wider font-bold mb-4">Body Measurements (inches)</p>
              <div class="grid sm:grid-cols-2 gap-4 mb-8">
                ${[['tf-height','height','Height','65','20','100'],
                   ['tf-chest','chest','Chest','38','20','70'],
                   ['tf-waist','waist','Waist','30','20','70'],
                   ['tf-hips','hips','Hips','40','20','70'],
                   ['tf-shoulders','shoulders','Shoulders','18','10','30'],
                   ['tf-sleeve','sleeve','Sleeve Length','24','10','40'],
                   ['tf-neck','neck','Neck','15','10','25'],
                   ['tf-arm','arm','Arm Length','25','10','40']].map(([id,name,label,ph,min,max]) => `
                  <div>
                    <label class="block text-sm font-bold mb-1.5" for="${id}">${label}</label>
                    <input id="${id}" name="${name}" type="number" step="0.5" min="${min}" max="${max}"
                           ${['height','chest','waist'].includes(name) ? 'required' : ''}
                           class="measure-input" placeholder="e.g. ${ph}">
                  </div>
                `).join('')}
              </div>

              <p class="text-xs text-gray-400 uppercase tracking-wider font-bold mb-4">Additional Details</p>
              <div class="mb-8">
                <label class="block text-sm font-bold mb-1.5" for="tf-notes">Design Preferences & Notes</label>
                <textarea id="tf-notes" name="notes" rows="4" maxlength="1000" class="measure-input"
                          placeholder="Describe any specific design preferences, color choices, embroidery patterns, or special requests..."></textarea>
              </div>

              <button type="submit" class="w-full bg-darkred hover:bg-darkred-dark text-white py-4 text-sm font-bold tracking-widest uppercase transition-all duration-300 rounded-sm hover:shadow-lg hover:shadow-darkred/20">
                Submit Custom Order Request
              </button>
              <p class="text-xs text-gray-400 text-center mt-3">We will contact you within 24 hours to confirm your order.</p>
            </form>

            <div id="tailoring-success" class="hidden bg-white rounded-xl p-8 sm:p-12 shadow-sm border border-gray-100 text-center">
              <div class="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-6">
                <i class="fas fa-check text-green-500 text-3xl"></i>
              </div>
              <h3 class="font-display text-2xl font-bold mb-3">Order Request Submitted</h3>
              <p class="text-gray-500 max-w-md mx-auto">Thank you for choosing Khkula. Our team will review your measurements and contact you within 24 hours to confirm your custom order.</p>
              <button onclick="navigateTo('shop')" class="mt-6 border-2 border-darkred text-darkred hover:bg-darkred hover:text-white px-8 py-3 text-sm font-bold tracking-wider uppercase transition-all rounded-sm">
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  `;
}

function handleTailoringSubmit(e) {
  e.preventDefault();
  const form = document.getElementById('tailoring-form');
  if (!form.checkValidity()) { form.reportValidity(); return; }
  form.classList.add('hidden');
  document.getElementById('tailoring-success').classList.remove('hidden');
  showToast('Custom order request submitted!');
}


/* ══════════════════════════════════════════════════════
   ABOUT PAGE
   ══════════════════════════════════════════════════════ */
function renderAbout() {
  return `
    <section class="relative h-[50vh] min-h-[350px] overflow-hidden about-hero-bg" style="background-image:url('https://picsum.photos/seed/afghan-landscape/1920/800')">
      <div class="absolute inset-0 bg-gradient-to-b from-darkred-dark/70 via-darkred/50 to-darkred-dark/80"></div>
      <div class="absolute inset-0 flex items-center justify-center text-center z-10">
        <div>
          <div class="gold-divider mb-4"><span class="text-gold text-xs font-bold tracking-[0.3em] uppercase">Our Story</span></div>
          <h1 class="font-display text-4xl sm:text-5xl md:text-6xl font-bold text-white">About Khkula</h1>
        </div>
      </div>
    </section>

    <section class="py-20 md:py-28">
      <div class="max-w-4xl mx-auto px-4 sm:px-6">
        <div class="reveal"><h2 class="font-display text-2xl sm:text-3xl font-bold mb-6 text-center">A Living Heritage</h2><div class="gold-divider mb-10"></div></div>
        <div class="space-y-6 text-gray-600 leading-relaxed text-lg reveal" style="transition-delay:100ms">
          <p>Afghanistan possesses one of the world's richest textile heritages, spanning thousands of years of artistry and innovation. From the intricate mirror-work embroidery of the Kuchi nomads to the luxurious silk fabrics woven in the ancient cities of Herat and Balkh, Afghan clothing represents a living tradition of extraordinary craftsmanship.</p>
          <p>Each stitch tells a story. Each pattern carries the identity of a tribe, a region, a family. The vibrant colors of a Kuchi dress, the elegant drape of a silk chador, the commanding presence of a groom's embroidered perahan — these are not merely garments. They are wearable works of art that embody centuries of culture, resilience, and beauty.</p>
          <p>Yet this heritage faces challenges. Decades of conflict have threatened the survival of many traditional crafts, and the artisans who keep these skills alive need support and access to global markets.</p>
        </div>
        <div class="my-16 grid md:grid-cols-2 gap-6 reveal" style="transition-delay:200ms">
          <div class="aspect-[4/3] rounded-lg overflow-hidden"><img src="https://picsum.photos/seed/embroidery-detail/600/450" alt="Embroidery detail" class="w-full h-full object-cover"></div>
          <div class="aspect-[4/3] rounded-lg overflow-hidden"><img src="https://picsum.photos/seed/afghan-artisan/600/450" alt="Afghan artisan at work" class="w-full h-full object-cover"></div>
        </div>
        <div class="space-y-6 text-gray-600 leading-relaxed text-lg reveal" style="transition-delay:150ms">
          <h2 class="font-display text-2xl sm:text-3xl font-bold mb-6 text-center">Our Mission</h2>
          <div class="gold-divider mb-10"></div>
          <p>At <strong class="text-darkred">Khkula</strong> — a name that echoes the warmth and richness of Afghan culture — we exist to bridge this gap. Our mission is to preserve and celebrate Afghan textile heritage by bringing authentic, handcrafted clothing and accessories to a global audience, while directly supporting the artisans and their communities.</p>
          <p>Every piece in our collection is crafted by skilled Afghan artisans who have inherited their craft through generations. We work directly with weaving cooperatives, embroidery workshops, and jewelry makers across Afghanistan, ensuring fair compensation and sustainable livelihoods.</p>
          <p>We believe that when you wear a Khkula piece, you carry more than fabric — you carry a story, a culture, and a connection to the hands that created it. You become part of a movement to keep these extraordinary traditions alive.</p>
        </div>
        <div class="mt-16 grid sm:grid-cols-3 gap-8 reveal" style="transition-delay:200ms">
          ${[['heart','Preserve','Keeping ancient crafts alive by providing sustainable demand for traditional techniques.'],
             ['hands-helping','Empower','Supporting artisan families with fair wages, safe conditions, and economic independence.'],
             ['globe','Connect','Building bridges between Afghan culture and the world through beautiful, meaningful pieces.']].map(([icon,h,p]) => `
            <div class="text-center">
              <div class="w-16 h-16 rounded-full bg-darkred/5 flex items-center justify-center mx-auto mb-4"><i class="fas fa-${icon} text-darkred text-xl"></i></div>
              <h3 class="font-display font-bold text-lg mb-2">${h}</h3>
              <p class="text-sm text-gray-500">${p}</p>
            </div>
          `).join('')}
        </div>
      </div>
    </section>

    <section class="py-16 bg-darkred">
      <div class="max-w-5xl mx-auto px-4 sm:px-6">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          ${[['150+','Artisans Supported',0],['2,000+','Pieces Crafted',100],['35+','Countries Shipped',200],['98%','Customer Satisfaction',300]].map(([n,l,d]) => `
            <div class="reveal" style="transition-delay:${d}ms">
              <p class="font-display text-3xl sm:text-4xl font-bold text-gold mb-1">${n}</p>
              <p class="text-white/60 text-sm">${l}</p>
            </div>
          `).join('')}
        </div>
      </div>
    </section>
  `;
}


/* ══════════════════════════════════════════════════════
   CART SYSTEM
   ══════════════════════════════════════════════════════ */
function addToCart(productId) {
  // Rate-limit: max 15 add-to-cart actions per 10 seconds
  if (!rateLimit('add-to-cart', 15, 10000)) {
    showToast('Slow down — too many requests!');
    return;
  }

  const product = products.find(p => p.id === productId);
  if (!product) return;

  const existing = state.cart.find(c => c.id === productId);
  if (existing) {
    existing.qty = Math.min(existing.qty + 1, 99);
  } else {
    state.cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      qty: 1,
    });
  }

  saveCart();
  renderCart();
  updateCartBadge();
  showToast(product.name + ' added to cart');
  renderPage();
  setTimeout(initScrollReveal, 50);
}

function removeFromCart(productId) {
  state.cart = state.cart.filter(c => c.id !== productId);
  saveCart();
  renderCart();
  updateCartBadge();
  renderPage();
  setTimeout(initScrollReveal, 50);
}

function updateQuantity(productId, delta) {
  const item = state.cart.find(c => c.id === productId);
  if (!item) return;
  item.qty = Math.min(99, Math.max(1, item.qty + delta));
  saveCart();
  renderCart();
  updateCartBadge();
}

function updateCartBadge() {
  const badge = document.getElementById('cart-badge');
  const count = getCartCount();
  badge.textContent = count;
  badge.classList.toggle('hidden', count === 0);
}

function toggleCart() {
  state.cartOpen = !state.cartOpen;
  document.getElementById('cart-panel').classList.toggle('open', state.cartOpen);
  document.getElementById('cart-overlay').classList.toggle('open', state.cartOpen);
  document.body.style.overflow = state.cartOpen ? 'hidden' : '';
  if (state.cartOpen) renderCart();
}

function renderCart() {
  const itemsContainer = document.getElementById('cart-items');
  const footerContainer = document.getElementById('cart-footer');
  _paypalRendered = false;

  if (state.cart.length === 0) {
    itemsContainer.innerHTML = `
      <div class="flex flex-col items-center justify-center h-full text-center py-16">
        <i class="fas fa-shopping-bag text-5xl text-gray-200 mb-4"></i>
        <p class="text-gray-400 font-bold mb-1">Your cart is empty</p>
        <p class="text-gray-300 text-sm mb-6">Discover our beautiful collection</p>
        <button onclick="toggleCart();navigateTo('shop');" class="text-darkred text-sm font-bold hover:underline">Browse Products</button>
      </div>
    `;
    footerContainer.innerHTML = '';
    return;
  }

  itemsContainer.innerHTML = state.cart.map(item => `
    <div class="cart-item">
      <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.name)}">
      <div class="flex-1 min-w-0">
        <h4 class="font-display text-sm font-bold truncate">${escapeHtml(item.name)}</h4>
        <p class="text-darkred font-bold text-sm mt-0.5">$${item.price.toFixed(2)}</p>
        <div class="flex items-center gap-2 mt-2">
          <button class="qty-btn" onclick="updateQuantity(${item.id}, -1)"><i class="fas fa-minus"></i></button>
          <span class="text-sm font-bold w-6 text-center">${item.qty}</span>
          <button class="qty-btn" onclick="updateQuantity(${item.id}, 1)"><i class="fas fa-plus"></i></button>
        </div>
      </div>
      <div class="flex flex-col items-end justify-between">
        <button onclick="removeFromCart(${item.id})" class="text-gray-300 hover:text-darkred transition-colors p-1" aria-label="Remove item">
          <i class="fas fa-trash-alt text-xs"></i>
        </button>
        <span class="text-sm font-bold text-gray-700">$${(item.price * item.qty).toFixed(2)}</span>
      </div>
    </div>
  `).join('');

  footerContainer.innerHTML = `
    <div class="flex justify-between items-center mb-1">
      <span class="text-gray-500 text-sm">Subtotal</span>
      <span class="font-display font-bold text-lg">$${getCartTotal().toFixed(2)}</span>
    </div>
    <p class="text-xs text-gray-400 mb-4">Shipping calculated at checkout</p>

    <!-- PayPal Button Container -->
    <div id="paypal-button-container"></div>

    <!-- Fallback message while PayPal loads -->
    <p id="paypal-loading" class="text-center text-xs text-gray-400 mt-2">Loading secure checkout…</p>
  `;

  // Mount PayPal buttons after DOM is updated
  requestAnimationFrame(mountPayPalButtons);
}


/* ══════════════════════════════════════════════════════
   PAYPAL CHECKOUT
   ══════════════════════════════════════════════════════ */
function mountPayPalButtons() {
  if (_paypalRendered) return;
  if (typeof paypal === 'undefined') {
    // SDK not loaded yet — retry once
    setTimeout(mountPayPalButtons, 800);
    return;
  }

  const container = document.getElementById('paypal-button-container');
  const loadingMsg = document.getElementById('paypal-loading');
  if (!container) return;

  _paypalRendered = true;
  if (loadingMsg) loadingMsg.remove();

  paypal.Buttons({
    style: {
      layout:  'vertical',
      color:   'gold',
      shape:   'rect',
      label:   'pay',
      height:  45,
    },

    /* ── createOrder ──────────────────────────────────────
       Build the PayPal order from the current cart.
       Prices are taken from the trusted `products` array,
       NOT from localStorage, so they can't be manipulated.
    ──────────────────────────────────────────────────── */
    createOrder(data, actions) {
      const items = state.cart.map(item => {
        const prod = products.find(p => p.id === item.id);
        if (!prod) return null;
        return {
          name:        prod.name.slice(0, 127),   // PayPal 127-char limit
          unit_amount: { currency_code: 'USD', value: prod.price.toFixed(2) },
          quantity:    String(item.qty),
          category:    'PHYSICAL_GOODS',
        };
      }).filter(Boolean);

      const itemTotal = items.reduce(
        (sum, i) => sum + parseFloat(i.unit_amount.value) * parseInt(i.quantity), 0
      );

      return actions.order.create({
        purchase_units: [{
          description: 'Khkula Afghan Clothing',
          amount: {
            currency_code: 'USD',
            value: itemTotal.toFixed(2),
            breakdown: {
              item_total: { currency_code: 'USD', value: itemTotal.toFixed(2) },
            },
          },
          items,
        }],
        application_context: {
          brand_name: 'Khkula',
          shipping_preference: 'GET_FROM_FILE',   // let PayPal collect shipping
          user_action: 'PAY_NOW',
        },
      });
    },

    /* ── onApprove ────────────────────────────────────────
       Buyer approved the payment — capture it.
       On sandbox this will succeed; on live it charges real money.
    ──────────────────────────────────────────────────── */
    onApprove(data, actions) {
      return actions.order.capture().then(details => {
        const name  = details.payer?.name?.given_name || 'Customer';
        const ordId = details.id;

        // Clear the cart
        state.cart = [];
        saveCart();
        updateCartBadge();
        toggleCart();

        // Show success UI
        showOrderSuccess(name, ordId);
      });
    },

    /* ── onError ──────────────────────────────────────── */
    onError(err) {
      console.error('PayPal error:', err);
      showToast('Payment error — please try again.');
    },

    /* ── onCancel ─────────────────────────────────────── */
    onCancel() {
      showToast('Payment cancelled.');
    },

  }).render('#paypal-button-container');
}

function showOrderSuccess(buyerName, orderId) {
  // Navigate to home and show a prominent success message
  navigateTo('home');
  setTimeout(() => {
    const banner = document.createElement('div');
    banner.style.cssText = `
      position:fixed;top:80px;left:50%;transform:translateX(-50%);
      background:#fff;border:2px solid #8B1A1A;border-radius:12px;
      padding:32px 40px;text-align:center;z-index:3000;
      box-shadow:0 12px 40px rgba(0,0,0,0.15);max-width:90vw;width:480px;
    `;
    banner.innerHTML = `
      <div style="width:64px;height:64px;border-radius:50%;background:#f0fdf4;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;">
        <i class="fas fa-check-circle" style="color:#22c55e;font-size:28px;"></i>
      </div>
      <h2 style="font-family:'Playfair Display',serif;font-size:22px;font-weight:700;margin-bottom:8px;">Thank you, ${escapeHtml(buyerName)}!</h2>
      <p style="color:#6b7280;font-size:14px;margin-bottom:6px;">Your order has been placed successfully.</p>
      <p style="color:#9ca3af;font-size:12px;margin-bottom:20px;">Order ID: <strong>${escapeHtml(orderId)}</strong></p>
      <button onclick="this.parentElement.remove()" style="background:#8B1A1A;color:white;border:none;padding:10px 28px;border-radius:4px;font-weight:700;font-size:13px;letter-spacing:0.1em;cursor:pointer;text-transform:uppercase;">
        Continue Shopping
      </button>
    `;
    document.body.appendChild(banner);
  }, 400);
}


/* ══════════════════════════════════════════════════════
   SEARCH
   ══════════════════════════════════════════════════════ */
function toggleSearch() {
  state.searchOpen = !state.searchOpen;
  const bar = document.getElementById('search-bar-desktop');
  bar.classList.toggle('open', state.searchOpen);
  if (state.searchOpen) bar.querySelector('input').focus();
}

function handleSearch(query) {
  const q = sanitizeQuery(query);
  if (q.trim().length > 0) {
    state.searchQuery = q;
    if (state.currentPage !== 'shop') navigateTo('shop');
    else handleShopSearch(q);
  }
}


/* ══════════════════════════════════════════════════════
   MOBILE MENU
   ══════════════════════════════════════════════════════ */
function toggleMobileMenu() {
  state.mobileMenuOpen = !state.mobileMenuOpen;
  document.getElementById('mobile-menu').classList.toggle('open', state.mobileMenuOpen);
  document.getElementById('mobile-overlay').classList.toggle('open', state.mobileMenuOpen);
  document.body.style.overflow = state.mobileMenuOpen ? 'hidden' : '';
}


/* ══════════════════════════════════════════════════════
   TOAST
   ══════════════════════════════════════════════════════ */
function showToast(message) {
  const toast   = document.getElementById('toast');
  const textEl  = document.getElementById('toast-text');
  // Sanitize: use textContent, NOT innerHTML, to prevent injection
  textEl.textContent = String(message).slice(0, 120);
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2500);
}


/* ══════════════════════════════════════════════════════
   SLIDESHOW
   ══════════════════════════════════════════════════════ */
function startSlideshow() {
  stopSlideshow();
  state.currentSlide = 0;
  updateSlideContent();
  slideInterval = setInterval(nextSlide, 5000);
}

function stopSlideshow() {
  if (slideInterval) { clearInterval(slideInterval); slideInterval = null; }
}

function goToSlide(index) {
  if (index < 0 || index >= heroSlides.length) return;
  state.currentSlide = index;
  updateSlideVisuals();
  stopSlideshow();
  slideInterval = setInterval(nextSlide, 5000);
}

function nextSlide() {
  state.currentSlide = (state.currentSlide + 1) % heroSlides.length;
  updateSlideVisuals();
}

function prevSlide() {
  state.currentSlide = (state.currentSlide - 1 + heroSlides.length) % heroSlides.length;
  updateSlideVisuals();
  stopSlideshow();
  slideInterval = setInterval(nextSlide, 5000);
}

function updateSlideVisuals() {
  document.querySelectorAll('.hero-slide').forEach((slide, i) => {
    slide.classList.toggle('active', i === state.currentSlide);
  });
  document.querySelectorAll('.slide-dot').forEach((dot, i) => {
    dot.classList.toggle('active', i === state.currentSlide);
  });
  updateSlideContent();
}

function updateSlideContent() {
  const textEl = document.getElementById('hero-text');
  if (!textEl) return;
  const slide = heroSlides[state.currentSlide];
  textEl.style.opacity = '0';
  textEl.style.transform = 'translateY(15px)';
  setTimeout(() => {
    // Use textContent to prevent XSS even on static data
    textEl.querySelector('h1').textContent = slide.title;
    textEl.querySelector('p').textContent  = slide.subtitle;
    textEl.querySelector('button').textContent = slide.cta;
    textEl.style.opacity   = '1';
    textEl.style.transform = 'translateY(0)';
  }, 400);
}


/* ══════════════════════════════════════════════════════
   SCROLL REVEAL
   ══════════════════════════════════════════════════════ */
function initScrollReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal:not(.visible)').forEach(el => observer.observe(el));
}


/* ══════════════════════════════════════════════════════
   FOOTER / MOBILE CATEGORIES
   ══════════════════════════════════════════════════════ */
function renderFooterCategories() {
  const footerEl = document.getElementById('footer-categories');
  const mobileEl = document.getElementById('mobile-categories');

  if (footerEl) {
    footerEl.innerHTML = categories.map(c =>
      `<li><a href="#" onclick="navigateTo('shop','${escapeHtml(c.id)}');return false;" class="footer-link">${escapeHtml(c.name)}</a></li>`
    ).join('');
  }

  if (mobileEl) {
    mobileEl.innerHTML = categories.map(c =>
      `<a href="#" onclick="navigateTo('shop','${escapeHtml(c.id)}');toggleMobileMenu();return false;" class="mobile-link">${escapeHtml(c.name)}</a>`
    ).join('');
  }
}


/* ══════════════════════════════════════════════════════
   KEYBOARD SHORTCUTS
   ══════════════════════════════════════════════════════ */
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    if (state.cartOpen)      toggleCart();
    if (state.mobileMenuOpen) toggleMobileMenu();
    if (state.searchOpen)    toggleSearch();
  }
});


/* ══════════════════════════════════════════════════════
   INIT
   ══════════════════════════════════════════════════════ */
function init() {
  renderPage();
  updateNavState();
  updateCartBadge();
  renderFooterCategories();
  updateNavbarStyle();
  if (state.currentPage === 'home') startSlideshow();
  setTimeout(initScrollReveal, 100);
}

document.addEventListener('DOMContentLoaded', init);
