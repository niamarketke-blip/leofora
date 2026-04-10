/* ============================================================
   Leofora – Faux Plant Store App Logic
   ============================================================ */

'use strict';

// ─── Product Data ─────────────────────────────────────────────────────────────

const PRODUCTS = [
  {
    id: 1,
    name: 'Monstera Deluxe',
    category: 'indoor',
    emoji: '🌿',
    price: 49.99,
    originalPrice: 64.99,
    badge: 'Best Seller',
    rating: 4.9,
    reviews: 312,
    desc: 'Our most popular piece. This lifelike Monstera features large, split-leaf fronds made from premium PE material. Comes in a minimalist ceramic-look pot.',
    height: '90 cm',
    material: 'PE Leaves',
    potIncluded: 'Yes',
    care: 'Dust monthly',
  },
  {
    id: 2,
    name: 'Desert Cactus Trio',
    category: 'succulents',
    emoji: '🌵',
    price: 34.99,
    originalPrice: null,
    badge: null,
    rating: 4.7,
    reviews: 198,
    desc: 'Three beautifully crafted faux cacti in a rustic terracotta planter. The perfect boho touch for any shelf or windowsill.',
    height: '25 cm',
    material: 'PVC & Foam',
    potIncluded: 'Yes (terracotta)',
    care: 'Wipe clean',
  },
  {
    id: 3,
    name: 'Fiddle Leaf Fig',
    category: 'indoor',
    emoji: '🌳',
    price: 79.99,
    originalPrice: 99.99,
    badge: 'Sale',
    rating: 4.8,
    reviews: 241,
    desc: 'The classic statement plant, now maintenance-free. 120 cm of lush, hand-veined foliage in a sleek matte-black planter.',
    height: '120 cm',
    material: 'Silk & PE',
    potIncluded: 'Yes (matte black)',
    care: 'Dust monthly',
  },
  {
    id: 4,
    name: 'Trailing Pothos',
    category: 'hanging',
    emoji: '🌱',
    price: 27.99,
    originalPrice: null,
    badge: null,
    rating: 4.6,
    reviews: 156,
    desc: 'Long, cascading vines perfect for shelves, macramé hangers, or trailing from tall furniture. Each vine is individually wired for easy shaping.',
    height: '80 cm (trailing)',
    material: 'Silk',
    potIncluded: 'No (hanging pot sold separately)',
    care: 'Shape as desired',
  },
  {
    id: 5,
    name: 'Bamboo Palm',
    category: 'trees',
    emoji: '🎋',
    price: 89.99,
    originalPrice: null,
    badge: 'New',
    rating: 4.7,
    reviews: 87,
    desc: 'Elegant, slender bamboo stalks topped with feathery palm leaves. Creates instant tropical vibes in living rooms or office lobbies.',
    height: '150 cm',
    material: 'PE & Natural Reed',
    potIncluded: 'Yes (woven basket)',
    care: 'Dust quarterly',
  },
  {
    id: 6,
    name: 'Succulent Garden Box',
    category: 'succulents',
    emoji: '🪴',
    price: 42.99,
    originalPrice: 54.99,
    badge: 'Sale',
    rating: 4.9,
    reviews: 403,
    desc: 'A curated arrangement of six different succulents in a chic wooden planter box. Zero upkeep, 100% adorable.',
    height: '12 cm',
    material: 'Plastic & Faux Moss',
    potIncluded: 'Yes (wooden box)',
    care: 'Dust monthly',
  },
  {
    id: 7,
    name: 'Snake Plant',
    category: 'indoor',
    emoji: '🌿',
    price: 38.99,
    originalPrice: null,
    badge: null,
    rating: 4.8,
    reviews: 274,
    desc: 'Tall, architectural leaves with realistic variegated patterns. A modern design staple that requires absolutely nothing from you.',
    height: '70 cm',
    material: 'PE',
    potIncluded: 'Yes (grey concrete-look)',
    care: 'Wipe leaves clean',
  },
  {
    id: 8,
    name: 'Hanging Eucalyptus',
    category: 'hanging',
    emoji: '🌿',
    price: 22.99,
    originalPrice: null,
    badge: null,
    rating: 4.5,
    reviews: 119,
    desc: 'Soft, silvery-green eucalyptus sprigs bundled together. Perfect for shower hooks, doorways, or wreaths. Lasts forever unlike real eucalyptus.',
    height: '40 cm bundle',
    material: 'Fabric & Wire',
    potIncluded: 'N/A',
    care: 'Shape and hang',
  },
  {
    id: 9,
    name: 'Olive Tree',
    category: 'trees',
    emoji: '🫒',
    price: 119.99,
    originalPrice: 139.99,
    badge: 'Premium',
    rating: 4.9,
    reviews: 65,
    desc: 'A stunning full-height faux olive tree complete with lifelike tiny olives and a twisted natural-wood trunk. The ultimate Mediterranean accent piece.',
    height: '180 cm',
    material: 'PE Leaves, Natural Wood Trunk',
    potIncluded: 'Yes (terracotta-look)',
    care: 'Dust quarterly',
  },
  {
    id: 10,
    name: 'Mini Aloe Set',
    category: 'succulents',
    emoji: '🌱',
    price: 18.99,
    originalPrice: null,
    badge: null,
    rating: 4.6,
    reviews: 322,
    desc: 'Four petite aloe plants in individual white pots. Adorable on desks, bathroom counters, or window ledges.',
    height: '15 cm each',
    material: 'PVC',
    potIncluded: 'Yes (set of 4 white pots)',
    care: 'Dust occasionally',
  },
  {
    id: 11,
    name: 'Bird of Paradise',
    category: 'indoor',
    emoji: '🌴',
    price: 95.99,
    originalPrice: 119.99,
    badge: 'Sale',
    rating: 4.8,
    reviews: 132,
    desc: 'Large, dramatic leaves with vibrant tropical energy. Our Bird of Paradise is 160 cm of pure architectural beauty.',
    height: '160 cm',
    material: 'PE & Silk',
    potIncluded: 'Yes (natural rattan basket)',
    care: 'Wipe with damp cloth',
  },
  {
    id: 12,
    name: 'Cherry Blossom Branch',
    category: 'trees',
    emoji: '🌸',
    price: 44.99,
    originalPrice: null,
    badge: 'New',
    rating: 4.7,
    reviews: 78,
    desc: 'Delicate pink blooms on elegant branches for a Japanese-inspired aesthetic. Stunning in a tall vase or as a standalone arrangement.',
    height: '100 cm',
    material: 'Silk & Metal Wire',
    potIncluded: 'No (vase sold separately)',
    care: 'Dust blooms gently',
  },
];

// ─── State ────────────────────────────────────────────────────────────────────

const state = {
  cart: JSON.parse(localStorage.getItem('leofora_cart') || '[]'),
  filter: 'all',
};

// ─── DOM References ───────────────────────────────────────────────────────────

const productsGrid  = document.getElementById('productsGrid');
const cartBtn       = document.getElementById('cartBtn');
const cartCount     = document.getElementById('cartCount');
const cartOverlay   = document.getElementById('cartOverlay');
const cartDrawer    = document.getElementById('cartDrawer');
const cartClose     = document.getElementById('cartClose');
const cartItems     = document.getElementById('cartItems');
const cartEmpty     = document.getElementById('cartEmpty');
const cartFooter    = document.getElementById('cartFooter');
const cartTotal     = document.getElementById('cartTotal');
const checkoutBtn   = document.getElementById('checkoutBtn');
const cartShopLink  = document.getElementById('cartShopLink');
const filtersEl     = document.getElementById('filters');
const toast         = document.getElementById('toast');
const modalOverlay  = document.getElementById('modalOverlay');
const productModal  = document.getElementById('productModal');
const modalClose    = document.getElementById('modalClose');
const modalContent  = document.getElementById('modalContent');

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatPrice(n) {
  return '$' + n.toFixed(2);
}

function renderStars(rating) {
  const full  = Math.floor(rating);
  const half  = rating % 1 >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(empty);
}

function saveCart() {
  localStorage.setItem('leofora_cart', JSON.stringify(state.cart));
}

let toastTimer;
function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2600);
}

// ─── Product Grid ─────────────────────────────────────────────────────────────

function renderProducts() {
  const filtered = state.filter === 'all'
    ? PRODUCTS
    : PRODUCTS.filter(p => p.category === state.filter);

  productsGrid.innerHTML = '';

  filtered.forEach(product => {
    const card = document.createElement('article');
    card.className = 'product-card';
    card.setAttribute('data-id', product.id);
    card.setAttribute('tabindex', '0');
    card.setAttribute('role', 'button');
    card.setAttribute('aria-label', `View details for ${product.name}`);

    card.innerHTML = `
      <div class="product-img">
        <span>${product.emoji}</span>
        ${product.badge ? `<span class="product-badge">${product.badge}</span>` : ''}
      </div>
      <div class="product-info">
        <div class="product-category">${product.category}</div>
        <div class="product-name">${product.name}</div>
        <div class="stars">${renderStars(product.rating)}<span>(${product.reviews})</span></div>
        <p class="product-desc">${product.desc}</p>
        <div class="product-footer">
          <div class="product-price">
            ${formatPrice(product.price)}
            ${product.originalPrice ? `<span class="original">${formatPrice(product.originalPrice)}</span>` : ''}
          </div>
          <button class="add-to-cart-btn" data-id="${product.id}" aria-label="Add ${product.name} to cart">Add to Cart</button>
        </div>
      </div>
    `;

    // Click on card body (not the button) → open modal
    card.addEventListener('click', (e) => {
      if (!e.target.classList.contains('add-to-cart-btn')) {
        openModal(product);
      }
    });

    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.target.classList.contains('add-to-cart-btn')) {
        openModal(product);
      }
    });

    // Add-to-cart button
    card.querySelector('.add-to-cart-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      addToCart(product.id);
    });

    productsGrid.appendChild(card);
  });
}

// ─── Filters ──────────────────────────────────────────────────────────────────

filtersEl.addEventListener('click', (e) => {
  const btn = e.target.closest('.filter-btn');
  if (!btn) return;
  filtersEl.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  state.filter = btn.dataset.filter;
  renderProducts();
});

// ─── Cart Logic ───────────────────────────────────────────────────────────────

function addToCart(productId) {
  const product = PRODUCTS.find(p => p.id === productId);
  if (!product) return;

  const existing = state.cart.find(i => i.id === productId);
  if (existing) {
    existing.qty += 1;
  } else {
    state.cart.push({ id: productId, qty: 1 });
  }
  saveCart();
  updateCartUI();
  showToast(`🌿 ${product.name} added to cart!`);
}

function removeFromCart(productId) {
  state.cart = state.cart.filter(i => i.id !== productId);
  saveCart();
  updateCartUI();
}

function changeQty(productId, delta) {
  const item = state.cart.find(i => i.id === productId);
  if (!item) return;
  item.qty = Math.max(1, item.qty + delta);
  saveCart();
  updateCartUI();
}

function getCartTotal() {
  return state.cart.reduce((sum, item) => {
    const product = PRODUCTS.find(p => p.id === item.id);
    return sum + (product ? product.price * item.qty : 0);
  }, 0);
}

function getTotalItems() {
  return state.cart.reduce((sum, item) => sum + item.qty, 0);
}

function updateCartUI() {
  const total = getTotalItems();
  cartCount.textContent = total;

  // Render cart items
  const isEmpty = state.cart.length === 0;
  cartEmpty.style.display  = isEmpty ? 'flex' : 'none';
  cartFooter.style.display = isEmpty ? 'none' : 'block';

  // Remove existing item rows
  cartItems.querySelectorAll('.cart-item').forEach(el => el.remove());

  state.cart.forEach(item => {
    const product = PRODUCTS.find(p => p.id === item.id);
    if (!product) return;

    const row = document.createElement('div');
    row.className = 'cart-item';
    row.innerHTML = `
      <div class="cart-item-emoji">${product.emoji}</div>
      <div class="cart-item-details">
        <div class="cart-item-name">${product.name}</div>
        <div class="cart-item-price">${formatPrice(product.price)} each</div>
        <div class="cart-item-qty">
          <button class="qty-btn" data-action="dec" data-id="${product.id}" aria-label="Decrease quantity">−</button>
          <span class="qty-val">${item.qty}</span>
          <button class="qty-btn" data-action="inc" data-id="${product.id}" aria-label="Increase quantity">+</button>
        </div>
      </div>
      <button class="cart-item-remove" data-id="${product.id}" aria-label="Remove ${product.name} from cart">🗑</button>
    `;

    row.querySelector('[data-action="dec"]').addEventListener('click', () => changeQty(product.id, -1));
    row.querySelector('[data-action="inc"]').addEventListener('click', () => changeQty(product.id, 1));
    row.querySelector('.cart-item-remove').addEventListener('click', () => removeFromCart(product.id));

    cartItems.appendChild(row);
  });

  cartTotal.textContent = formatPrice(getCartTotal());
}

// ─── Cart Drawer Open/Close ───────────────────────────────────────────────────

function openCart() {
  cartOverlay.classList.add('open');
  cartDrawer.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeCart() {
  cartOverlay.classList.remove('open');
  cartDrawer.classList.remove('open');
  document.body.style.overflow = '';
}

cartBtn.addEventListener('click', openCart);
cartClose.addEventListener('click', closeCart);
cartOverlay.addEventListener('click', closeCart);
cartShopLink.addEventListener('click', (e) => {
  e.preventDefault();
  closeCart();
  document.getElementById('products').scrollIntoView({ behavior: 'smooth' });
});

checkoutBtn.addEventListener('click', () => {
  showToast('🎉 Thanks for your order! (Demo store)');
  state.cart = [];
  saveCart();
  updateCartUI();
  closeCart();
});

// ─── Product Modal ────────────────────────────────────────────────────────────

function openModal(product) {
  modalContent.innerHTML = `
    <div class="modal-product-img">${product.emoji}</div>
    <div class="modal-body">
      <div class="modal-category">${product.category}</div>
      <h2 class="modal-title">${product.name}</h2>
      <div class="stars">${renderStars(product.rating)}<span>(${product.reviews} reviews)</span></div>
      <div class="modal-price">
        ${formatPrice(product.price)}
        ${product.originalPrice ? `<span class="original">${formatPrice(product.originalPrice)}</span>` : ''}
      </div>
      <p class="modal-desc">${product.desc}</p>
      <div class="modal-specs">
        <div class="modal-spec"><strong>Height</strong><span>${product.height}</span></div>
        <div class="modal-spec"><strong>Material</strong><span>${product.material}</span></div>
        <div class="modal-spec"><strong>Pot Included</strong><span>${product.potIncluded}</span></div>
        <div class="modal-spec"><strong>Care</strong><span>${product.care}</span></div>
      </div>
      <button class="btn btn-primary btn-full modal-add-btn" data-id="${product.id}">Add to Cart – ${formatPrice(product.price)}</button>
    </div>
  `;

  modalContent.querySelector('.modal-add-btn').addEventListener('click', () => {
    addToCart(product.id);
    closeModal();
  });

  modalOverlay.classList.add('open');
  productModal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  modalOverlay.classList.remove('open');
  productModal.classList.remove('open');
  document.body.style.overflow = '';
}

modalClose.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', closeModal);

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeModal();
    closeCart();
  }
});

// ─── Init ─────────────────────────────────────────────────────────────────────

renderProducts();
updateCartUI();
