/**
 * ZORKO HARDA — CAFE & RESTAURANT
 * Interactive Features & Aesthetics Script
 */

document.addEventListener('DOMContentLoaded', () => {
  initLiveHours();
  initHeaderScroll();
  initMobileMenu();
  initMenuFilterAndSearch();
  initCartAndWhatsApp();
  initReservationForm();
  initCopyAddress();
  initScrollSpy();
  initCurrentYear();
});

/* --------------------------------------------------
   1. Live Opening Hours Status (11:00 AM - 11:00 PM)
   -------------------------------------------------- */
function initLiveHours() {
  const statusDot = document.getElementById('statusDot');
  const statusText = document.getElementById('statusText');
  if (!statusText) return;

  const now = new Date();
  const hours = now.getHours();
  // Open daily from 11 AM (11) to 11 PM (23)
  const isOpen = hours >= 11 && hours < 23;

  if (isOpen) {
    statusText.textContent = 'Open Now • 11:00 AM – 11:00 PM';
    if (statusDot) {
      statusDot.style.backgroundColor = '#27ae60';
      statusDot.style.boxShadow = '0 0 0 3px rgba(39, 174, 96, 0.25)';
    }
  } else {
    statusText.textContent = 'Closed Now • Opens at 11:00 AM';
    if (statusDot) {
      statusDot.style.backgroundColor = '#e74c3c';
      statusDot.style.boxShadow = '0 0 0 3px rgba(231, 76, 60, 0.25)';
    }
  }
}

/* --------------------------------------------------
   2. Sticky Header Styling on Scroll
   -------------------------------------------------- */
function initHeaderScroll() {
  const header = document.querySelector('.header');
  if (!header) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 30) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }, { passive: true });
}

/* --------------------------------------------------
   3. Mobile Navigation Drawer
   -------------------------------------------------- */
function initMobileMenu() {
  const toggleBtn = document.getElementById('menuToggle');
  const navMenu = document.getElementById('navMenu');
  const navLinks = document.querySelectorAll('.nav-link');

  if (!toggleBtn || !navMenu) return;

  toggleBtn.addEventListener('click', () => {
    const isActive = navMenu.classList.toggle('open');
    toggleBtn.classList.toggle('active', isActive);
    toggleBtn.setAttribute('aria-expanded', isActive ? 'true' : 'false');
  });

  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('open');
      toggleBtn.classList.remove('active');
      toggleBtn.setAttribute('aria-expanded', 'false');
    });
  });

  // Close when tapping outside
  document.addEventListener('click', (e) => {
    if (!navMenu.contains(e.target) && !toggleBtn.contains(e.target) && navMenu.classList.contains('open')) {
      navMenu.classList.remove('open');
      toggleBtn.classList.remove('active');
    }
  });
}

/* --------------------------------------------------
   4. Menu Category Filter & Instant Search
   -------------------------------------------------- */
function initMenuFilterAndSearch() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const searchInput = document.getElementById('menuSearchInput');
  const clearSearchBtn = document.getElementById('clearSearchBtn');
  const dishCards = document.querySelectorAll('.dish-card');
  const emptyState = document.getElementById('menuEmptyState');

  let activeCategory = 'all';
  let searchQuery = '';

  function applyFilters() {
    let visibleCount = 0;

    dishCards.forEach(card => {
      const category = card.getAttribute('data-category') || '';
      const isBestseller = card.getAttribute('data-bestseller') === 'true';
      const title = card.querySelector('.dish-title')?.textContent.toLowerCase() || '';
      const desc = card.querySelector('.dish-desc')?.textContent.toLowerCase() || '';

      const matchesCategory =
        activeCategory === 'all' ||
        (activeCategory === 'bestseller' && isBestseller) ||
        category === activeCategory;

      const matchesSearch =
        !searchQuery ||
        title.includes(searchQuery) ||
        desc.includes(searchQuery) ||
        category.includes(searchQuery);

      if (matchesCategory && matchesSearch) {
        card.style.display = 'flex';
        visibleCount++;
      } else {
        card.style.display = 'none';
      }
    });

    if (emptyState) {
      emptyState.style.display = visibleCount === 0 ? 'block' : 'none';
    }
  }

  // Category Filter Click
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeCategory = btn.getAttribute('data-filter') || 'all';
      applyFilters();
    });
  });

  // Search Input
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.trim().toLowerCase();
      if (clearSearchBtn) {
        clearSearchBtn.style.display = searchQuery.length > 0 ? 'block' : 'none';
      }
      applyFilters();
    });
  }

  // Clear Search
  if (clearSearchBtn && searchInput) {
    clearSearchBtn.addEventListener('click', () => {
      searchInput.value = '';
      searchQuery = '';
      clearSearchBtn.style.display = 'none';
      searchInput.focus();
      applyFilters();
    });
  }
}

/* --------------------------------------------------
   5. Interactive Cart & WhatsApp Quick Ordering
   -------------------------------------------------- */
let cart = [];

function initCartAndWhatsApp() {
  const addButtons = document.querySelectorAll('.add-to-cart-btn');
  const cartDrawer = document.getElementById('cartDrawer');
  const cartCloseBtn = document.getElementById('cartCloseBtn');
  const cartItemsList = document.getElementById('cartItemsList');
  const cartCountBadges = document.querySelectorAll('.cart-count-badge');
  const cartTotalAmount = document.getElementById('cartTotalAmount');
  const sendWhatsAppOrderBtn = document.getElementById('sendWhatsAppOrderBtn');
  const floatingWhatsAppBtn = document.getElementById('floatingWhatsAppBtn');

  // Add Item Click
  addButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const card = btn.closest('.dish-card') || btn.closest('.combo-card');
      if (!card) return;

      const name = card.getAttribute('data-name') || card.querySelector('h3, .dish-title')?.textContent.trim();
      const priceText = card.getAttribute('data-price') || card.querySelector('.dish-price')?.textContent.replace(/[^0-9]/g, '');
      const price = parseInt(priceText, 10) || 0;

      addToCart(name, price);
      showToast(`Added "${name}" to your order! 🛍️`);
      if (cartDrawer) cartDrawer.classList.add('active');
    });
  });

  function addToCart(name, price) {
    const existingIndex = cart.findIndex(item => item.name === name);
    if (existingIndex > -1) {
      cart[existingIndex].qty += 1;
    } else {
      cart.push({ name, price, qty: 1 });
    }
    renderCart();
  }

  function removeFromCart(index) {
    cart.splice(index, 1);
    renderCart();
  }

  function renderCart() {
    if (!cartItemsList) return;

    cartItemsList.innerHTML = '';
    let total = 0;
    let totalItems = 0;

    if (cart.length === 0) {
      cartItemsList.innerHTML = '<p style="color:var(--text-muted);font-size:0.85rem;text-align:center;padding:12px 0;">No items in your order yet.</p>';
      if (cartDrawer) cartDrawer.classList.remove('active');
    } else {
      cart.forEach((item, index) => {
        const itemTotal = item.price * item.qty;
        total += itemTotal;
        totalItems += item.qty;

        const row = document.createElement('div');
        row.className = 'cart-item-row';
        row.innerHTML = `
          <div class="cart-item-info">
            <strong>${item.name}</strong>
            <small>${item.qty} × ₹${item.price} = ₹${itemTotal}</small>
          </div>
          <button class="cart-item-remove" data-index="${index}" title="Remove item" aria-label="Remove item">✕</button>
        `;
        cartItemsList.appendChild(row);
      });
    }

    // Attach remove handlers
    const removeButtons = cartItemsList.querySelectorAll('.cart-item-remove');
    removeButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-index'), 10);
        removeFromCart(idx);
      });
    });

    if (cartTotalAmount) {
      cartTotalAmount.textContent = `₹${total}`;
    }

    cartCountBadges.forEach(badge => {
      badge.textContent = totalItems;
      badge.style.display = totalItems > 0 ? 'inline-flex' : 'none';
    });
  }

  if (cartCloseBtn && cartDrawer) {
    cartCloseBtn.addEventListener('click', () => {
      cartDrawer.classList.remove('active');
    });
  }

  // Send Order via WhatsApp
  if (sendWhatsAppOrderBtn) {
    sendWhatsAppOrderBtn.addEventListener('click', () => {
      if (cart.length === 0) {
        showToast('Please add items to your order first! 🍔');
        return;
      }

      let orderText = `*New Order Request — ZORKO HARDA*%0A%0A`;
      let total = 0;
      cart.forEach((item, i) => {
        const itemTotal = item.price * item.qty;
        total += itemTotal;
        orderText += `${i + 1}. *${item.name}* (Qty: ${item.qty}) — ₹${itemTotal}%0A`;
      });
      orderText += `%0A*Estimated Total: ₹${total}*%0A%0A_Please confirm availability and prep time. Thank you!_`;

      const whatsappUrl = `https://wa.me/917869074917?text=${orderText}`;
      window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    });
  }
}

/* --------------------------------------------------
   6. Table Reservation to WhatsApp
   -------------------------------------------------- */
function initReservationForm() {
  const form = document.getElementById('reservationForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('resName')?.value.trim();
    const phone = document.getElementById('resPhone')?.value.trim();
    const guests = document.getElementById('resGuests')?.value;
    const date = document.getElementById('resDate')?.value;
    const time = document.getElementById('resTime')?.value;
    const notes = document.getElementById('resNotes')?.value.trim();

    if (!name || !phone || !date || !time) {
      showToast('Please fill out all required reservation fields. 📋');
      return;
    }

    let message = `*Table Reservation Request — ZORKO HARDA*%0A%0A`;
    message += `👤 *Name:* ${name}%0A`;
    message += `📞 *Phone:* ${phone}%0A`;
    message += `👥 *Number of Guests:* ${guests}%0A`;
    message += `📅 *Date:* ${date}%0A`;
    message += `⏰ *Time:* ${time}%0A`;
    if (notes) {
      message += `📝 *Notes/Occasion:* ${notes}%0A`;
    }
    message += `%0A_Sent via Zorko Harda Website_`;

    const whatsappUrl = `https://wa.me/917869074917?text=${message}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    showToast('Redirecting to WhatsApp to confirm your table! ✨');
    form.reset();
  });
}

/* --------------------------------------------------
   7. Copy Address with Instant Toast
   -------------------------------------------------- */
function initCopyAddress() {
  const copyBtns = document.querySelectorAll('.copy-address-btn');
  const fullAddress = 'GP Mall, near Bus Stand, Kukrawad, Harda, Madhya Pradesh 461331';

  copyBtns.forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      try {
        await navigator.clipboard.writeText(fullAddress);
        showToast('Address copied to clipboard! 📋');
      } catch (err) {
        // Fallback for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = fullAddress;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        showToast('Address copied to clipboard! 📋');
      }
    });
  });
}

/* --------------------------------------------------
   8. Navigation ScrollSpy (Active link indicator)
   -------------------------------------------------- */
function initScrollSpy() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  if (sections.length === 0 || navLinks.length === 0) return;

  window.addEventListener('scroll', () => {
    let currentId = '';
    const scrollPosition = window.scrollY + 120;

    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      if (scrollPosition >= top && scrollPosition < top + height) {
        currentId = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${currentId}`) {
        link.classList.add('active');
      }
    });
  }, { passive: true });
}

/* --------------------------------------------------
   9. Year helper
   -------------------------------------------------- */
function initCurrentYear() {
  const yearElem = document.getElementById('currentYear');
  if (yearElem) {
    yearElem.textContent = new Date().getFullYear();
  }
}

/* --------------------------------------------------
   10. Toast Notification Helper
   -------------------------------------------------- */
let toastTimeout;
function showToast(message) {
  let toast = document.getElementById('toastNotice');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toastNotice';
    toast.className = 'toast-notice';
    document.body.appendChild(toast);
  }

  toast.innerHTML = `<span>✦</span> <span>${message}</span>`;
  toast.classList.add('show');

  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.remove('show');
  }, 3200);
}
