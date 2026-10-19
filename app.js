import { supabase } from './supabaseclient.js';

document.addEventListener('DOMContentLoaded', () => {
  /* ==========================================================================
     STATE MANAGEMENT
     ========================================================================== */
  const state = {
    iphone: {
      color: 'ice',
      colorName: 'Titanium Biru Es',
      model: 'pro',
      modelName: 'iPhone 17 Pro',
      storage: '128',
      storageLabel: '128 GB',
      basePrice: 18499000,
      addPrice: 0,
      totalPrice: 18499000
    },
    bag: []
  };

  // Color specific image styling configurations (CSS filters) to match names
  const colorFilters = {
    ice: 'none',
    misty: 'hue-rotate(-15deg) saturate(0.6) brightness(0.95)',
    royal: 'hue-rotate(10deg) saturate(1.1) brightness(0.85)',
    navy: 'hue-rotate(25deg) saturate(0.7) brightness(0.65)'
  };

  /* ==========================================================================
     DOM ELEMENTS
     ========================================================================== */
  // Configurator Elements
  const colorSwatches = document.querySelectorAll('.color-swatch-btn');
  const colorBadge = document.getElementById('color-badge');
  const configPreviewImg = document.getElementById('config-preview-img');
  
  const modelChips = document.querySelectorAll('.config-option-chip[data-model]');
  const storageChips = document.querySelectorAll('.config-option-chip[data-storage]');
  
  // Sticky Bar Elements
  const floatingBar = document.getElementById('floating-bar');
  const stickyDesc = document.getElementById('sticky-desc');
  const stickyPriceDisplay = document.getElementById('sticky-price-display');
  const stickyAddToBagBtn = document.getElementById('sticky-add-to-bag');
  
  // Configurator target to observe
  const configuratorSection = document.getElementById('configurator-section');

  // Bag / Cart Elements
  const bagBtn = document.getElementById('bag-btn');
  const bagCountBadge = document.getElementById('bag-count');
  const bagOverlay = document.getElementById('bag-overlay');
  const bagDrawer = document.getElementById('bag-drawer');
  const bagCloseBtn = document.getElementById('bag-close-btn');
  const bagItemsList = document.getElementById('bag-items-list');
  const bagEmptyState = document.getElementById('bag-empty-state');
  const bagSubtotal = document.getElementById('bag-subtotal');
  const checkoutBtn = document.getElementById('checkout-btn');

  // Auth / Account Elements
  const accountBtn = document.getElementById('account-btn');
  const userActiveDot = document.getElementById('user-active-dot');
  const authOverlay = document.getElementById('auth-overlay');
  const authDrawer = document.getElementById('auth-drawer');
  const authCloseBtn = document.getElementById('auth-close-btn');
  const authTitle = document.getElementById('auth-title');
  
  const authTabsContainer = document.getElementById('auth-tabs-container');
  const tabLoginBtn = document.getElementById('tab-login-btn');
  const tabRegisterBtn = document.getElementById('tab-register-btn');
  
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');
  const userProfileView = document.getElementById('user-profile-view');
  
  const loginEmailInput = document.getElementById('login-email');
  const loginPasswordInput = document.getElementById('login-password');
  
  const registerEmailInput = document.getElementById('register-email');
  const registerPasswordInput = document.getElementById('register-password');
  const registerFullNameInput = document.getElementById('register-fullname');
  const registerDobInput = document.getElementById('register-dob');
  
  const userEmailDisplay = document.getElementById('user-email-display');
  const userFullNameDisplay = document.getElementById('user-fullname-display');
  const userDobDisplay = document.getElementById('user-dob-display');
  const orderHistoryList = document.getElementById('order-history-list');
  const logoutBtn = document.getElementById('logout-btn');

  let currentUser = null;
  let isAuthForced = false;
  let authTimer = null;

  // Store & Accessories Add-to-bag Elements
  const storeGrid = document.getElementById('store-grid');

  // Search Accessories Element
  const searchInput = document.getElementById('accessory-search');
  const storeCards = document.querySelectorAll('.store-utility-card');

  // Mobile navigation Elements
  const mobileNavToggle = document.getElementById('mobile-nav-toggle');
  const globalNavList = document.getElementById('global-nav-list');

  // Footer Accordion elements
  const footerHeaders = document.querySelectorAll('.footer-col-title');

  /* ==========================================================================
     HELPER FUNCTIONS
     ========================================================================== */
  // Format Number to Indonesian Rupiah (Rp 18.499.000)
  function formatRupiah(number) {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(number).replace(/IDR/g, 'Rp').trim();
  }

  // Calculate and update the iPhone configurations
  function updateiPhonePrice() {
    state.iphone.totalPrice = state.iphone.basePrice + state.iphone.addPrice;
    
    // Update display price in config panel (optionally in chips)
    // Update sticky bottom bar
    if (stickyPriceDisplay) {
      stickyPriceDisplay.textContent = formatRupiah(state.iphone.totalPrice);
    }
    
    // Update sticky description
    if (stickyDesc) {
      stickyDesc.textContent = `${state.iphone.modelName}, ${state.iphone.colorName}, ${state.iphone.storageLabel}`;
    }
  }

  /* ==========================================================================
     CONFIGURATOR EVENT LISTENERS
     ========================================================================== */
  
  // 1. Color Selection
  colorSwatches.forEach(swatch => {
    swatch.addEventListener('click', () => {
      // Remove selected class from all swatches
      colorSwatches.forEach(btn => btn.classList.remove('selected'));
      // Add to clicked
      swatch.classList.add('selected');
      
      // Update state
      const color = swatch.dataset.color;
      const colorName = swatch.dataset.colorName;
      
      state.iphone.color = color;
      state.iphone.colorName = colorName;
      
      // Update badge text
      if (colorBadge) {
        colorBadge.textContent = colorName;
      }
      
      // Apply CSS visual effect on preview image to match selected color
      if (configPreviewImg && colorFilters[color]) {
        configPreviewImg.style.transition = 'filter 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        configPreviewImg.style.filter = colorFilters[color];
      }
      
      updateiPhonePrice();
    });
  });

  // 2. Model Selection
  modelChips.forEach(chip => {
    chip.addEventListener('click', () => {
      modelChips.forEach(c => c.classList.remove('selected'));
      chip.classList.add('selected');
      
      state.iphone.model = chip.dataset.model;
      state.iphone.modelName = chip.querySelector('.chip-label-strong').textContent;
      state.iphone.basePrice = parseInt(chip.dataset.priceBase, 10);
      
      updateiPhonePrice();
    });
  });

  // 3. Storage Selection
  storageChips.forEach(chip => {
    chip.addEventListener('click', () => {
      storageChips.forEach(c => c.classList.remove('selected'));
      chip.classList.add('selected');
      
      state.iphone.storage = chip.dataset.storage;
      state.iphone.storageLabel = chip.querySelector('.chip-label-strong').textContent;
      state.iphone.addPrice = parseInt(chip.dataset.priceAdd, 10);
      
      updateiPhonePrice();
    });
  });

  /* ==========================================================================
     FLOATING STICKY BAR INTERSECTION OBSERVER
     ========================================================================== */
  if (configuratorSection && floatingBar) {
    const observerOptions = {
      root: null,
      threshold: 0.1 // Triggers when 10% of configurator is visible
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        // Show sticky bar when the purchase configurator is in view
        if (entry.isIntersecting) {
          floatingBar.classList.add('visible');
        } else {
          // Hide when scrolled away
          floatingBar.classList.remove('visible');
        }
      });
    }, observerOptions);

    observer.observe(configuratorSection);
  }

  /* ==========================================================================
     SHOPPING BAG (CART) LOGIC
     ========================================================================== */
  
  // Render bag contents
  function renderBag() {
    // Clear current items
    const itemCards = bagItemsList.querySelectorAll('.bag-item-card');
    itemCards.forEach(card => card.remove());
    
    if (state.bag.length === 0) {
      bagEmptyState.style.display = 'flex';
      bagSubtotal.textContent = formatRupiah(0);
      bagCountBadge.textContent = '0';
      bagCountBadge.classList.remove('visible');
    } else {
      bagEmptyState.style.display = 'none';
      
      let totalAmount = 0;
      let totalItems = 0;
      
      state.bag.forEach((item, index) => {
        totalAmount += item.price;
        totalItems += 1;
        
        const itemCard = document.createElement('div');
        itemCard.className = 'bag-item-card';
        itemCard.innerHTML = `
          <div class="bag-item-thumb-container">
            <img src="${item.img}" alt="${item.name}" class="bag-item-thumb" style="${item.style || ''}">
          </div>
          <div class="bag-item-details">
            <div>
              <h4 class="bag-item-title">${item.name}</h4>
              <p class="bag-item-meta">${item.desc || ''}</p>
            </div>
            <div class="bag-item-row-price">
              <span class="bag-item-price">${formatRupiah(item.price)}</span>
              <button class="bag-item-remove-btn" data-index="${index}">Hapus</button>
            </div>
          </div>
        `;
        bagItemsList.appendChild(itemCard);
      });
      
      bagSubtotal.textContent = formatRupiah(totalAmount);
      bagCountBadge.textContent = totalItems;
      bagCountBadge.classList.add('visible');
      
      // Bind remove buttons
      const removeButtons = bagItemsList.querySelectorAll('.bag-item-remove-btn');
      removeButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
          const idx = parseInt(e.target.dataset.index, 10);
          state.bag.splice(idx, 1);
          renderBag();
        });
      });
    }
  }

  // Add Item to Bag
  function addToBag(item) {
    state.bag.push(item);
    renderBag();
    
    // Open Bag Overlay to show added item
    bagOverlay.classList.add('active');
  }

  // Add iPhone Configured Product to Bag
  if (stickyAddToBagBtn) {
    stickyAddToBagBtn.addEventListener('click', () => {
      // Create product item from state
      const item = {
        id: `iphone-${state.iphone.model}-${state.iphone.color}-${state.iphone.storage}`,
        name: `${state.iphone.modelName}`,
        desc: `${state.iphone.colorName}, ${state.iphone.storageLabel}`,
        price: state.iphone.totalPrice,
        img: 'assets/iphone-blue.png',
        style: configPreviewImg.style.filter ? `filter: ${configPreviewImg.style.filter};` : ''
      };
      addToBag(item);
    });
  }

  // Add Store Accessories to Bag
  if (storeGrid) {
    storeGrid.addEventListener('click', (e) => {
      if (e.target.classList.contains('add-to-bag-btn')) {
        e.preventDefault();
        const button = e.target;
        const item = {
          id: button.dataset.id,
          name: button.dataset.name,
          desc: 'Aksesoris Warna Senada',
          price: parseInt(button.dataset.price, 10),
          img: button.dataset.img
        };
        addToBag(item);
      }
    });
  }

  // Close bag drawer when clicking the close button or clicking outside
  if (bagBtn) {
    bagBtn.addEventListener('click', () => {
      bagOverlay.classList.add('active');
    });
  }

  if (bagCloseBtn) {
    bagCloseBtn.addEventListener('click', () => {
      bagOverlay.classList.remove('active');
    });
  }

  if (bagOverlay) {
    bagOverlay.addEventListener('click', (e) => {
      if (e.target === bagOverlay) {
        bagOverlay.classList.remove('active');
      }
    });
  }

  /* ==========================================================================
     AUTHENTICATION LOGIC (Supabase Auth)
     ========================================================================== */
  
  // Toggle Auth Tabs (Login vs Register)
  if (tabLoginBtn && tabRegisterBtn) {
    tabLoginBtn.addEventListener('click', () => {
      // Aktifkan tab login (Solid Blue, White Text)
      tabLoginBtn.className = 'button-primary';
      tabLoginBtn.style.background = '';
      tabLoginBtn.style.border = '';
      tabLoginBtn.style.color = '#ffffff';

      // Matikan tab register (Outline, Gray Text)
      tabRegisterBtn.className = 'button-pearl-capsule';
      tabRegisterBtn.style.border = '1px solid var(--colors-hairline)';
      tabRegisterBtn.style.background = 'var(--colors-surface-pearl)';
      tabRegisterBtn.style.color = 'var(--colors-ink-muted-80)';
      
      loginForm.style.display = 'flex';
      registerForm.style.display = 'none';
      authTitle.textContent = 'Apple ID';
    });

    tabRegisterBtn.addEventListener('click', () => {
      // Aktifkan tab register (Solid Blue, White Text)
      tabRegisterBtn.className = 'button-primary';
      tabRegisterBtn.style.background = '';
      tabRegisterBtn.style.border = '';
      tabRegisterBtn.style.color = '#ffffff';

      // Matikan tab login (Outline, Gray Text)
      tabLoginBtn.className = 'button-pearl-capsule';
      tabLoginBtn.style.border = '1px solid var(--colors-hairline)';
      tabLoginBtn.style.background = 'var(--colors-surface-pearl)';
      tabLoginBtn.style.color = 'var(--colors-ink-muted-80)';
      
      loginForm.style.display = 'none';
      registerForm.style.display = 'flex';
      authTitle.textContent = 'Daftar Apple ID';
    });
  }

  // Open/Close Auth drawer
  if (accountBtn) {
    accountBtn.addEventListener('click', () => {
      if (authOverlay) {
        authOverlay.classList.add('active');
      }
    });
  }

  if (authCloseBtn) {
    authCloseBtn.addEventListener('click', () => {
      if (isAuthForced) {
        alert('Sesi Uji Coba Berakhir: Silakan masuk atau buat akun Apple ID untuk melanjutkan.');
        return;
      }
      if (authOverlay) {
        authOverlay.classList.remove('active');
      }
    });
  }

  if (authOverlay) {
    authOverlay.addEventListener('click', (e) => {
      if (e.target === authOverlay) {
        if (isAuthForced) return; // Kunci penutupan overlay jika dipaksa
        authOverlay.classList.remove('active');
      }
    });
  }

  // Handle Login
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      if (!supabase) {
        alert('Koneksi Supabase belum terkonfigurasi. Silakan periksa kembali file .env Anda.');
        return;
      }
      
      const email = loginEmailInput.value.trim();
      const password = loginPasswordInput.value;
      
      const submitBtn = loginForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.textContent = 'Memproses...';
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
      
      if (error) {
        alert(`Gagal Masuk: ${error.message}`);
      } else {
        alert('Berhasil Masuk!');
        loginForm.reset();
        authOverlay.classList.remove('active');
      }
    });
  }

  // Handle Register
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      if (!supabase) {
        alert('Koneksi Supabase belum terkonfigurasi. Silakan periksa kembali file .env Anda.');
        return;
      }
      
      const email = registerEmailInput.value.trim();
      const password = registerPasswordInput.value;
      const fullName = registerFullNameInput.value.trim();
      const dob = registerDobInput.value;
      
      const submitBtn = registerForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.textContent = 'Membuat Akun...';
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            dob: dob
          }
        }
      });
      
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
      
      if (error) {
        alert(`Gagal mendaftar: ${error.message}`);
      } else {
        alert('Akun berhasil dibuat! Silakan periksa email konfirmasi jika dibutuhkan atau langsung login.');
        registerForm.reset();
        // Switch to login tab
        tabLoginBtn.click();
      }
    });
  }

  // Handle Logout
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      if (!supabase) return;
      const { error } = await supabase.auth.signOut();
      if (error) {
        alert(`Gagal keluar: ${error.message}`);
      } else {
        alert('Anda telah keluar akun.');
        authOverlay.classList.remove('active');
      }
    });
  }

  // Load User Profile (Full Name & DOB) from database
  async function loadUserProfile(userId) {
    if (!supabase) return;
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('full_name, dob')
        .eq('id', userId)
        .single();

      if (error) throw error;

      if (profile) {
        if (userFullNameDisplay && profile.full_name) {
          userFullNameDisplay.textContent = profile.full_name;
        }
        if (userDobDisplay && profile.dob) {
          const dateObj = new Date(profile.dob);
          if (!isNaN(dateObj)) {
            userDobDisplay.textContent = dateObj.toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            });
          } else {
            userDobDisplay.textContent = profile.dob;
          }
        }
      }
    } catch (e) {
      console.warn('Peringatan: Gagal memuat profil tambahan dari tabel profiles:', e.message);
    }
  }

  // Load User Order History
  async function loadOrderHistory(userId) {
    if (!orderHistoryList) return;
    
    orderHistoryList.innerHTML = '<p style="color: var(--colors-ink-muted-48); text-align: center; padding: 12px 0;">Memuat riwayat...</p>';
    
    try {
      const { data: orders, error } = await supabase
        .from('orders')
        .select('id, total_price, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      orderHistoryList.innerHTML = '';
      
      if (!orders || orders.length === 0) {
        orderHistoryList.innerHTML = `
          <div style="text-align: center; padding: 24px 0; color: var(--colors-ink-muted-48); display: flex; flex-direction: column; align-items: center; gap: 8px;">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="opacity: 0.5;">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
            <div style="font-size: 12px; font-weight: 500; color: var(--colors-ink);">Belum ada riwayat pesanan</div>
            <div style="font-size: 11px; opacity: 0.7; max-width: 220px; line-height: 1.3;">Temukan produk pilihan Anda di toko dan lakukan pembelian pertama!</div>
          </div>
        `;
        return;
      }
      
      orders.forEach(order => {
        const date = new Date(order.created_at).toLocaleDateString('id-ID', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
        
        const itemEl = document.createElement('div');
        itemEl.style.padding = '8px';
        itemEl.style.background = 'var(--colors-surface-pearl)';
        itemEl.style.border = '1px solid var(--colors-hairline)';
        itemEl.style.borderRadius = 'var(--rounded-sm)';
        itemEl.style.display = 'flex';
        itemEl.style.justifyContent = 'space-between';
        itemEl.style.alignItems = 'center';
        
        itemEl.innerHTML = `
          <div>
            <div style="font-weight: 600; color: var(--colors-ink); font-size: 11px; word-break: break-all;">ID: ${order.id.substring(0,8)}...</div>
            <div style="color: var(--colors-ink-muted-48); font-size: 10px; margin-top: 2px;">${date}</div>
          </div>
          <div style="font-weight: 600; color: var(--colors-primary); font-size: 12px;">
            ${formatRupiah(order.total_price)}
          </div>
        `;
        orderHistoryList.appendChild(itemEl);
      });
      
    } catch (e) {
      console.error('Error loading history:', e);
      orderHistoryList.innerHTML = '<p style="color: #ff3b30; text-align: center; padding: 12px 0;">Gagal memuat riwayat.</p>';
    }
  }

  // Subscribe to auth state changes
  if (supabase) {
    supabase.auth.onAuthStateChange((event, session) => {
      if (session && session.user) {
        currentUser = session.user;
        isAuthForced = false;

        // Hentikan timer jika aktif
        if (authTimer) clearTimeout(authTimer);

        // Sembunyikan peringatan dan tampilkan kembali tombol close
        const warningEl = document.getElementById('auth-forced-warning');
        if (warningEl) warningEl.style.display = 'none';
        if (authCloseBtn) authCloseBtn.style.display = 'flex';
        
        // Update UI state
        if (userActiveDot) userActiveDot.style.display = 'block';
        if (authTabsContainer) authTabsContainer.style.display = 'none';
        if (loginForm) loginForm.style.display = 'none';
        if (registerForm) registerForm.style.display = 'none';
        if (userProfileView) userProfileView.style.display = 'flex';
        
        if (userEmailDisplay) userEmailDisplay.textContent = currentUser.email;

        // 1. Tampilkan nama lengkap & DOB secara instan dari session user_metadata
        const metadata = currentUser.user_metadata || {};
        if (userFullNameDisplay) userFullNameDisplay.textContent = metadata.full_name || '-';
        if (userDobDisplay) {
          const dobVal = metadata.dob;
          if (dobVal) {
            const dateObj = new Date(dobVal);
            if (!isNaN(dateObj)) {
              userDobDisplay.textContent = dateObj.toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              });
            } else {
              userDobDisplay.textContent = dobVal;
            }
          } else {
            userDobDisplay.textContent = '-';
          }
        }
        
        // 2. Load riwayat belanja
        loadOrderHistory(currentUser.id);

        // 3. Muat profil cadangan dari database
        loadUserProfile(currentUser.id);

        // Tutup laci login secara otomatis
        if (authOverlay) authOverlay.classList.remove('active');
      } else {
        currentUser = null;
        
        // Reset UI state
        if (userActiveDot) userActiveDot.style.display = 'none';
        if (authTabsContainer) authTabsContainer.style.display = 'flex';
        if (userProfileView) userProfileView.style.display = 'none';
        
        // Reset to login form
        if (tabLoginBtn) tabLoginBtn.click();

        // Mulai timer anonim jika log out
        startAnonymousTimer();
      }
    });
  } else {
    console.warn('Supabase client tidak aktif. Fitur akun dan riwayat belanja dinonaktifkan.');
  }

  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', async () => {
      if (state.bag.length === 0) {
        alert('Tas belanja Anda kosong!');
        return;
      }

      // Hitung total harga
      const totalPrice = state.bag.reduce((total, item) => total + item.price, 0);

      // Ubah teks tombol menjadi loading
      const originalText = checkoutBtn.textContent;
      checkoutBtn.disabled = true;
      checkoutBtn.textContent = 'Memproses Pesanan...';

      if (!supabase) {
        alert('Gagal memproses checkout: Koneksi Supabase belum terkonfigurasi. Pastikan file .env memiliki variabel VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY.');
        checkoutBtn.disabled = false;
        checkoutBtn.textContent = originalText;
        return;
      }

      try {
        // 1. Simpan ke tabel 'orders' dengan user_id jika user sedang login
        const orderPayload = { total_price: totalPrice };
        if (currentUser) {
          orderPayload.user_id = currentUser.id;
        }

        const { data: orderData, error: orderError } = await supabase
          .from('orders')
          .insert([orderPayload])
          .select()
          .single();

        if (orderError) throw orderError;

        const orderId = orderData.id;

        // 2. Siapkan data item untuk 'order_items'
        const orderItemsData = state.bag.map(item => ({
          order_id: orderId,
          product_id: item.id,
          name: item.name,
          description: item.desc || '',
          price: item.price,
          quantity: 1,
          img: item.img
        }));

        // 3. Simpan detail item ke 'order_items'
        const { error: itemsError } = await supabase
          .from('order_items')
          .insert(orderItemsData);

        if (itemsError) throw itemsError;

        // Berhasil!
        alert(`Terima kasih! Pesanan Anda berhasil disimpan.\nID Pesanan: ${orderId}\nProduk siap dikirim!`);
        state.bag = [];
        renderBag();
        bagOverlay.classList.remove('active');

      } catch (error) {
        console.error('Error during checkout:', error);
        alert('Gagal memproses pesanan ke Supabase. Silakan coba beberapa saat lagi.');
      } finally {
        checkoutBtn.disabled = false;
        checkoutBtn.textContent = originalText;
      }
    });
  }

  /* ==========================================================================
     ACCESSORIES STORE SEARCH FILTER
     ========================================================================== */
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase().trim();
      const currentStoreCards = document.querySelectorAll('.store-utility-card');
      
      currentStoreCards.forEach(card => {
        const title = card.querySelector('.card-title').textContent.toLowerCase();
        const category = card.dataset.category.toLowerCase();
        
        if (title.includes(query) || category.includes(query)) {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      });
    });
  }

  /* ==========================================================================
     MOBILE NAVIGATION DRAWER TOGGLE
     ========================================================================== */
  if (mobileNavToggle && globalNavList) {
    mobileNavToggle.addEventListener('click', () => {
      globalNavList.classList.toggle('active');
      
      // Simple toggle icon animation
      if (globalNavList.classList.contains('active')) {
        globalNavList.style.display = 'flex';
        globalNavList.style.flexDirection = 'column';
        globalNavList.style.position = 'absolute';
        globalNavList.style.top = '44px';
        globalNavList.style.left = '0';
        globalNavList.style.right = '0';
        globalNavList.style.backgroundColor = 'var(--colors-surface-black)';
        globalNavList.style.padding = 'var(--spacing-lg)';
        globalNavList.style.borderBottom = '1px solid rgba(255,255,255,0.08)';
        globalNavList.style.zIndex = '999';
        
        mobileNavToggle.innerHTML = `
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.2">
            <line x1="4" y1="4" x2="14" y2="14" />
            <line x1="4" y1="14" x2="14" y2="4" />
          </svg>
        `;
      } else {
        globalNavList.style.display = '';
        mobileNavToggle.innerHTML = `
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.2">
            <line x1="2" y1="5" x2="16" y2="5" />
            <line x1="2" y1="9" x2="16" y2="9" />
            <line x1="2" y1="13" x2="16" y2="13" />
          </svg>
        `;
      }
    });
  }

  /* ==========================================================================
     FOOTER ACCORDION IN MOBILE (<= 833px)
     ========================================================================== */
  footerHeaders.forEach(header => {
    header.addEventListener('click', () => {
      if (window.innerWidth <= 833) {
        const column = header.parentElement;
        column.classList.toggle('active');
      }
    });
  });

  // Handle window resizing to reset footer states
  window.addEventListener('resize', () => {
    if (window.innerWidth > 833) {
      document.querySelectorAll('.footer-nav-col').forEach(col => {
        col.classList.remove('active');
      });
      if (globalNavList) {
        globalNavList.style.display = '';
      }
    }
  });

  // Render accessories dari Supabase secara dinamis
  async function loadAndRenderAccessories() {
    if (!storeGrid) return;
    
    try {
      const { data: accessories, error } = await supabase
        .from('accessories')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Hapus state memuat data
      storeGrid.innerHTML = '';

      if (!accessories || accessories.length === 0) {
        storeGrid.innerHTML = `
          <div class="empty-accessories" style="grid-column: 1 / -1; text-align: center; padding: 48px 0; color: var(--colors-ink-muted-48);">
            Tidak ada aksesoris yang tersedia.
          </div>
        `;
        return;
      }

      accessories.forEach(item => {
        const card = document.createElement('div');
        card.className = 'store-utility-card';
        card.dataset.category = item.category;

        // AirPods Max punya skala custom agar pas
        const imgStyle = item.id === 'acc-3' ? 'style="transform: scale(0.9);"' : '';

        card.innerHTML = `
          <div class="card-img-container">
            <img src="${item.img}" alt="${item.name}" class="card-image" ${imgStyle}>
          </div>
          <div class="card-details">
            <h3 class="body-strong card-title">${item.name}</h3>
            <p class="caption card-price">${formatRupiah(item.price)}</p>
          </div>
          <div class="card-actions">
            <a href="#" class="text-link">Selengkapnya</a>
            <button class="button-pearl-capsule add-to-bag-btn" 
              data-id="${item.id}" 
              data-name="${item.name}" 
              data-price="${item.price}" 
              data-img="${item.img}">Masukkan ke Tas</button>
          </div>
        `;
        storeGrid.appendChild(card);
      });

    } catch (error) {
      console.error('Error fetching accessories from Supabase:', error);
      storeGrid.innerHTML = `
        <div class="error-accessories" style="grid-column: 1 / -1; text-align: center; padding: 48px 0; color: #ff3b30;">
          Gagal memuat aksesoris. Pastikan local server Anda aktif dan koneksi internet/Supabase tersedia.
        </div>
      `;
    }
  }

  // Fungsi untuk memulai timer paksa login bagi pengguna anonim
  function startAnonymousTimer() {
    if (authTimer) clearTimeout(authTimer);
    
    authTimer = setTimeout(() => {
      // Jika setelah 10 detik masih belum login (anonim)
      if (!currentUser) {
        isAuthForced = true;
        
        // Tampilkan warning box dan sembunyikan tombol close
        const warningEl = document.getElementById('auth-forced-warning');
        if (warningEl) warningEl.style.display = 'block';
        if (authCloseBtn) authCloseBtn.style.display = 'none';
        
        // Paksa buka laci login
        if (authOverlay) {
          authOverlay.classList.add('active');
        }
      }
    }, 10000);
  }

  // Initialize
  updateiPhonePrice();
  renderBag();
  loadAndRenderAccessories();
  startAnonymousTimer();
});
