import { 
  signUpUser, 
  logInUser, 
  logOutUser, 
  getUserProfile, 
  updateUserProfile, 
  changeUserPassword, 
  submitDeveloperRequest, 
  getDeveloperRequests, 
  handleDeveloperRequest, 
  submitGameRequest, 
  getDeveloperGameRequests, 
  getPendingGameRequests, 
  handleGameRequest, 
  directPublishGame, 
  getActiveGames, 
  updateAndResubmitGameRequest,
  simulatedEmails,
  onAuthStateListener,
  getAllUsers,
  changeUserRole,
  generateAndStore2FACode,
  verify2FACode,
  clear2FACode,
  registerWebAuthnCredential,
  verifyWebAuthnCredential,
  hasWebAuthnCredential,
  removeWebAuthnCredential
} from './firebase-service.js';

// --- PLATFORM STATE ---
let state = {
  user: null,
  currentRoute: '#/',
  games: [],
  theme: '#00ff66', // Default neon green
  activePromoIndex: 0,
  promoTimer: null,
  currentGame: null,
  gameInstance: null,
  recentEmails: []
};

// --- DEFAULT GAMES PRE-POPULATION ---
const PRESET_GAMES = [
  {
    id: "preset_snake",
    name: "Neon Snake",
    description: "The classic retro arcade game! Guide the neon snake to consume glowing particles, but avoid hitting yourself or the boundaries.",
    logoUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60",
    githubUrl: "https://github.com/diggy-games/neon-snake",
    howToPlay: "Use the arrow keys or WASD to navigate the snake. Eat green glowing particles to grow. The game ends if you collide with the walls or your own tail.",
    targetAudience: "Everyone (All Ages)",
    categories: ["RETRO", "RPG"],
    developerUid: "system",
    developerName: "DIGGY Core Devs",
    approved: true
  },
  {
    id: "preset_bricks",
    name: "Brick Breaker Glow",
    description: "Bounce the ball and destroy the neon bricks in this fast-paced arcade retro classic. Collect multipliers and clear the screen!",
    logoUrl: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=150&auto=format&fit=crop&q=60",
    githubUrl: "https://github.com/diggy-games/brick-breaker-glow",
    howToPlay: "Move the paddle left and right using your Mouse or Left/Right arrow keys. Prevent the glowing orb from falling. Break all the colored neon bricks to win.",
    targetAudience: "Kids 6+",
    categories: ["RETRO", "MULTIPLAYER"],
    developerUid: "system",
    developerName: "DIGGY Core Devs",
    approved: true
  },
  {
    id: "preset_evader",
    name: "Space Laser Evader",
    description: "Navigate your starfighter through an intense neon asteroid field. Shoot incoming targets and survive the onslaught!",
    logoUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=150&auto=format&fit=crop&q=60",
    githubUrl: "https://github.com/diggy-games/space-laser-evader",
    howToPlay: "Move Left/Right using the Arrow keys or A/D keys. Fire your laser cannon using the Spacebar. Avoid colliding with space debris.",
    targetAudience: "Teens 10+",
    categories: ["RPG", "RETRO"],
    developerUid: "system",
    developerName: "DIGGY Core Devs",
    approved: true
  }
];

// --- SPA ROUTER ---
const routes = {
  '#/': renderHome,
  '#/login': renderLogin,
  '#/dev': renderDev,
  '#/admin': renderAdmin,
  '#/settings': renderSettings,
  '#/game/:id': renderGameDetails
};

function navigateTo(route) {
  window.location.hash = route;
}

async function handleRouting() {
  const hash = window.location.hash || '#/';
  state.currentRoute = hash;

  // Cleanup active canvas game loops
  if (state.gameInstance && state.gameInstance.stop) {
    state.gameInstance.stop();
    state.gameInstance = null;
  }

  // Handle Dynamic Routes like #/game/some_id
  if (hash.startsWith('#/game/')) {
    const gameId = hash.split('#/game/')[1];
    await renderGameDetails(gameId);
    updateActiveSidebarNav('');
    return;
  }

  const renderer = routes[hash] || renderHome;
  updateActiveSidebarNav(hash);
  await renderer();
}

function updateActiveSidebarNav(hash) {
  document.querySelectorAll('.nav-item').forEach(item => {
    if (item.getAttribute('data-route') === hash) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });
}

// --- INITIALIZATION ---
window.addEventListener('DOMContentLoaded', async () => {
  // Listen for hash changes
  window.addEventListener('hashchange', handleRouting);
  
  // Track system email simulation list
  window.addEventListener('diggy-email-sent', (e) => {
    state.recentEmails.unshift(e.detail);
    updateSimulatedInboxUI();
  });

  setupInboxWidget();

  // Listen to Auth state (Firebase or LocalStorage fallback)
  onAuthStateListener(async (user) => {
    if (user) {
      state.user = user;
      applyTheme(user.customTheme || '#00ff66');
      renderUserBadge();
    } else {
      state.user = null;
      applyTheme('#00ff66');
      renderUserBadge();
    }
    
    // Refresh current route to apply auth permissions
    handleRouting();
  });

  // Pull initial games list
  await fetchGames();
});

async function fetchGames() {
  try {
    const dbGames = await getActiveGames();
    // Combine preset games with database games
    state.games = [...PRESET_GAMES, ...dbGames.filter(g => !PRESET_GAMES.some(p => p.id === g.id))];
  } catch (err) {
    console.warn("Could not pull games from Firebase, using presets only:", err);
    state.games = [...PRESET_GAMES];
  }
}

// --- RENDER PAGES ---

// Render: HOMEPAGE
async function renderHome() {
  const main = document.getElementById('main-container');
  
  // Setup standard home HTML layout
  main.innerHTML = `
    <div class="top-header">
      <div class="page-title-wrap">
        <h1>היכל המשחקים DIGGY</h1>
        <p style="color: var(--text-muted); margin-top: 5px;">מקום המשחקים המוביל לילדים ומתכנתים</p>
      </div>
      <div class="header-actions" id="header-auth-actions"></div>
    </div>

    <!-- Promo Carousel Banner -->
    <div class="promo-slider" id="promo-slider"></div>

    <!-- Categories Tab Filter -->
    <div class="section-title">
      <span>קטגוריות משחקים</span>
      <div class="category-tabs" style="display: flex; gap: 10px;">
        <button class="btn btn-secondary active-cat" data-category="ALL" style="padding: 6px 14px; font-size: 11px;">הכל</button>
        <button class="btn btn-secondary" data-category="RPG" style="padding: 6px 14px; font-size: 11px;">RPG</button>
        <button class="btn btn-secondary" data-category="RETRO" style="padding: 6px 14px; font-size: 11px;">RETRO</button>
        <button class="btn btn-secondary" data-category="MULTIPLAYER" style="padding: 6px 14px; font-size: 11px;">MULTIPLAYER</button>
      </div>
    </div>

    <!-- Active Games List -->
    <div class="games-grid" id="home-games-grid"></div>

    <!-- Recently Played Section -->
    <div id="recent-played-section" style="display: none;">
      <div class="section-title">משחקים ששיחקת לאחרונה</div>
      <div class="games-grid" id="recent-games-grid"></div>
    </div>

    <!-- Favorite Games Section -->
    <div id="favorites-section" style="display: none;">
      <div class="section-title">משחקים שאהבת (ב-❤️)</div>
      <div class="games-grid" id="favorite-games-grid"></div>
    </div>
  `;

  renderHeaderActions();
  setupPromoCarousel();
  renderGamesGrid('ALL');
  renderRecentlyPlayedAndFavorites();

  // Category tab filter listeners
  const tabs = main.querySelectorAll('.category-tabs button');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => {
        t.style.borderColor = 'rgba(255, 255, 255, 0.05)';
        t.style.background = 'transparent';
      });
      tab.style.borderColor = 'var(--accent-color)';
      tab.style.background = 'var(--accent-dim)';
      renderGamesGrid(tab.getAttribute('data-category'));
    });
  });
}

function renderHeaderActions() {
  const container = document.getElementById('header-auth-actions');
  if (!container) return;

  if (state.user) {
    container.innerHTML = `
      <div style="display: flex; gap: 10px; align-items: center;">
        <span style="color: var(--text-muted); font-size: 14px;">שלום, <strong>${state.user.username}</strong>!</span>
        <button class="btn btn-secondary" id="logout-btn"><i class="fas fa-sign-out-alt"></i> התנתק</button>
      </div>
    `;
    document.getElementById('logout-btn').addEventListener('click', async () => {
      await logOutUser();
      navigateTo('#/login');
    });
  } else {
    container.innerHTML = `
      <button class="btn btn-primary" onclick="window.location.hash='#/login'"><i class="fas fa-sign-in-alt"></i> התחבר / הרשם</button>
    `;
  }
}

function setupPromoCarousel() {
  const slider = document.getElementById('promo-slider');
  if (!slider) return;

  const promoGames = state.games.slice(0, 3);
  if (promoGames.length === 0) {
    slider.style.display = 'none';
    return;
  }

  clearInterval(state.promoTimer);

  slider.innerHTML = promoGames.map((game, index) => `
    <div class="slide-item ${index === 0 ? 'active' : ''}" style="background-image: url('${game.logoUrl}')" data-index="${index}">
      <div class="slide-overlay"></div>
      <div class="slide-content">
        <span class="slide-tag">משחק מומלץ!</span>
        <h2 class="slide-title">${game.name}</h2>
        <p class="slide-desc">${game.description}</p>
        <button class="btn btn-primary play-now-promo" data-id="${game.id}"><i class="fas fa-play"></i> שחק עכשיו</button>
      </div>
    </div>
  `).join('');

  slider.querySelectorAll('.play-now-promo').forEach(btn => {
    btn.addEventListener('click', () => {
      const gameId = btn.getAttribute('data-id');
      navigateTo(`#/game/${gameId}`);
    });
  });

  state.activePromoIndex = 0;
  state.promoTimer = setInterval(() => {
    const slides = slider.querySelectorAll('.slide-item');
    if (!slides.length) return;
    slides[state.activePromoIndex].classList.remove('active');
    state.activePromoIndex = (state.activePromoIndex + 1) % slides.length;
    slides[state.activePromoIndex].classList.add('active');
  }, 5000);
}

function renderGamesGrid(categoryFilter) {
  const grid = document.getElementById('home-games-grid');
  if (!grid) return;

  const filtered = categoryFilter === 'ALL' 
    ? state.games 
    : state.games.filter(g => g.categories && g.categories.includes(categoryFilter));

  if (filtered.length === 0) {
    grid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 40px 0;">אין משחקים בקטגוריה זו כרגע.</div>`;
    return;
  }

  grid.innerHTML = filtered.map(game => createGameCardMarkup(game)).join('');
  bindGameCardEvents(grid);
}

function createGameCardMarkup(game) {
  const isFav = state.user && state.user.favorites && state.user.favorites.includes(game.id);
  const heartClass = isFav ? 'active' : '';
  const heartIcon = isFav ? 'fas fa-heart' : 'far fa-heart';

  return `
    <div class="game-card" data-id="${game.id}">
      <div class="game-card-image" style="background-image: url('${game.logoUrl}')">
        ${!game.logoUrl ? '<i class="fas fa-gamepad"></i>' : ''}
        <button class="favorite-btn ${heartClass}" data-id="${game.id}">
          <i class="${heartIcon}"></i>
        </button>
      </div>
      <div class="game-card-body">
        <h3 class="game-card-title">${game.name}</h3>
        <div class="game-card-dev">
          <i class="fas fa-code-branch"></i> מפתח: ${game.developerName}
        </div>
        <p class="game-card-desc">${game.description}</p>
        <div class="game-card-tags">
          ${game.categories.map(c => `<span class="game-tag">${c}</span>`).join('')}
        </div>
        <button class="btn btn-secondary play-game-btn" data-id="${game.id}" style="width: 100%; justify-content: center; padding: 8px;">
          <i class="fas fa-play"></i> שחק
        </button>
      </div>
    </div>
  `;
}

function bindGameCardEvents(container) {
  container.querySelectorAll('.play-game-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.getAttribute('data-id');
      navigateTo(`#/game/${id}`);
    });
  });

  container.querySelectorAll('.favorite-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      if (!state.user) {
        showToast("אנא התחבר כדי לשמור משחקים מועדפים!", "warning");
        navigateTo('#/login');
        return;
      }
      const id = btn.getAttribute('data-id');
      let favs = [...(state.user.favorites || [])];
      
      if (favs.includes(id)) {
        favs = favs.filter(fId => fId !== id);
        btn.classList.remove('active');
        btn.querySelector('i').className = 'far fa-heart';
        showToast("הוסר מהמועדפים", "info");
      } else {
        favs.push(id);
        btn.classList.add('active');
        btn.querySelector('i').className = 'fas fa-heart';
        showToast("נוסף למועדפים! ❤️", "success");
      }
      
      state.user.favorites = favs;
      await updateUserProfile(state.user.uid, { favorites: favs });
      renderRecentlyPlayedAndFavorites();
    });
  });
}

function renderRecentlyPlayedAndFavorites() {
  const recentSection = document.getElementById('recent-played-section');
  const recentGrid = document.getElementById('recent-games-grid');
  const favsSection = document.getElementById('favorites-section');
  const favsGrid = document.getElementById('favorite-games-grid');

  if (!state.user) {
    if (recentSection) recentSection.style.display = 'none';
    if (favsSection) favsSection.style.display = 'none';
    return;
  }

  // Recently Played
  const recents = state.user.recentlyPlayed || [];
  if (recents.length > 0 && recentGrid) {
    const recentGames = state.games.filter(g => recents.includes(g.id));
    if (recentGames.length > 0) {
      recentSection.style.display = 'block';
      recentGrid.innerHTML = recentGames.map(game => createGameCardMarkup(game)).join('');
      bindGameCardEvents(recentGrid);
    } else {
      recentSection.style.display = 'none';
    }
  } else if (recentSection) {
    recentSection.style.display = 'none';
  }

  // Favorites
  const favs = state.user.favorites || [];
  if (favs.length > 0 && favsGrid) {
    const favGames = state.games.filter(g => favs.includes(g.id));
    if (favGames.length > 0) {
      favsSection.style.display = 'block';
      favsGrid.innerHTML = favGames.map(game => createGameCardMarkup(game)).join('');
      bindGameCardEvents(favsGrid);
    } else {
      favsSection.style.display = 'none';
    }
  } else if (favsSection) {
    favsSection.style.display = 'none';
  }
}

// Render: LOGIN / REGISTER
function renderLogin() {
  const main = document.getElementById('main-container');
  main.innerHTML = `
    <div style="display: flex; align-items: center; justify-content: center; min-height: 70vh;">
      <div class="modal-container" style="max-width: 420px; width: 100%;">
        <div class="modal-header" style="justify-content: center;">
          <h2 class="modal-title" id="auth-panel-title">כניסה למערכת DIGGY</h2>
        </div>
        <div class="modal-body" id="auth-panel-body">
          <form id="login-form">
            <div class="form-group">
              <label>שם משתמש (6-12 תווים)</label>
              <input type="text" id="auth-username" required placeholder="הזן שם משתמש">
            </div>
            <div class="form-group">
              <label>סיסמה (6-12 תווים)</label>
              <input type="password" id="auth-password" required placeholder="הזן סיסמה">
            </div>
            <button type="submit" class="btn btn-primary" style="width: 100%; justify-content: center; margin-top: 10px;">
              <i class="fas fa-rocket"></i> התחבר
            </button>
          </form>

          <div style="margin: 20px 0; text-align: center; color: var(--text-muted); font-size: 13px;">
            או התחבר באמצעות:
          </div>

          <button class="btn btn-secondary" id="auth-biometric-btn" style="width: 100%; justify-content: center; margin-bottom: 20px;">
            <i class="fas fa-fingerprint" style="color: var(--accent-color);"></i> כניסה ביומטרית מהירה
          </button>

          <div style="border-top: 1px solid rgba(255,255,255,0.05); padding-top: 15px; text-align: center; font-size: 14px;">
            <span style="color: var(--text-muted);">חדש באתר?</span> 
            <a href="#" id="toggle-auth-mode" style="color: var(--accent-color); font-weight: bold; margin-right: 5px;">צור חשבון חדש</a>
          </div>
        </div>
      </div>
    </div>
  `;

  let isRegisterMode = false;
  const form = document.getElementById('login-form');
  const toggleLink = document.getElementById('toggle-auth-mode');
  const panelTitle = document.getElementById('auth-panel-title');
  const bioBtn = document.getElementById('auth-biometric-btn');

  toggleLink.addEventListener('click', (e) => {
    e.preventDefault();
    isRegisterMode = !isRegisterMode;
    if (isRegisterMode) {
      panelTitle.textContent = "רישום חשבון DIGGY חדש";
      form.querySelector('button[type="submit"]').innerHTML = `<i class="fas fa-user-plus"></i> צור חשבון`;
      toggleLink.textContent = "התחבר לחשבון קיים";
      bioBtn.style.display = 'none';
    } else {
      panelTitle.textContent = "כניסה למערכת DIGGY";
      form.querySelector('button[type="submit"]').innerHTML = `<i class="fas fa-rocket"></i> התחבר`;
      toggleLink.textContent = "צור חשבון חדש";
      bioBtn.style.display = 'flex';
    }
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('auth-username').value;
    const password = document.getElementById('auth-password').value;

    if (username.length < 6 || username.length > 12) {
      showToast("שם המשתמש חייב להיות בין 6 ל-12 תווים!", "danger");
      return;
    }
    if (password.length < 6 || password.length > 12) {
      showToast("הסיסמה חייבת להיות בין 6 ל-12 תווים!", "danger");
      return;
    }

    showLoader(true);
    try {
      if (isRegisterMode) {
        // Sign Up
        const userProfile = await signUpUser(username, password);
        showToast("החשבון נוצר בהצלחה! ברוך הבא ל-DIGGY 🎉", "success");
        navigateTo('#/');
      } else {
        // Sign In
        const profile = await logInUser(username, password);
        
        // Check 2FA
        if (profile.twoFactorEnabled) {
          showLoader(false);
          trigger2FAFlow(profile);
          return;
        }

        showToast("התחברת בהצלחה! 🎮", "success");
        navigateTo('#/');
      }
    } catch (err) {
      showToast(err.message, "danger");
    } finally {
      showLoader(false);
    }
  });

  bioBtn.addEventListener('click', () => {
    triggerBiometricLoginFlow();
  });
}

// 2FA modal verification flow
function trigger2FAFlow(profile) {
  // Generate secure 2FA code using the new service
  const code = generateAndStore2FACode(profile.uid);
  
  // Send email via Resend (real or simulated)
  const emailHtml = `
    <div style="background: #07080a; color: #fff; padding: 30px; border-radius: 12px; border: 1px solid #00ff66; font-family: sans-serif; text-align: center;">
      <h2 style="color: #00ff66;">DIGGY Security Verification</h2>
      <p>שלום ${profile.username}, קיבלנו בקשת התחברות לחשבון שלך.</p>
      <div style="font-size: 32px; font-weight: bold; background: rgba(0,255,102,0.1); border: 1px dashed #00ff66; padding: 15px; margin: 20px auto; letter-spacing: 5px; width: 200px; border-radius: 6px;">
        ${code}
      </div>
      <p style="color: #888;">הקוד תקף ל-5 דקות הקרובות. אנא אל תשתף קוד זה עם אף אחד.</p>
    </div>
  `;
  
  import('./firebase-service.js').then(async (mod) => {
    const destEmail = profile.twoFactorEmail || profile.email;
    await mod.sendEmailViaResend(destEmail, "DIGGY - קוד אימות דו-שלבי", emailHtml);
    
    // Show 2FA input modal
    const overlay = document.getElementById('modal-overlay');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');
    
    modalTitle.textContent = "אימות דו-שלבי (2FA)";
    modalBody.innerHTML = `
      <div style="text-align: center; display: flex; flex-direction: column; gap: 15px;">
        <p>קוד אימות נשלח לאימייל שלך: <strong style="color: var(--accent-color);">${destEmail}</strong></p>
        <p style="font-size: 13px; color: var(--text-muted);">הזן את 6 הספרות כדי להשלים את ההתחברות:</p>
        <input type="text" id="twofactor-input" max-length="6" placeholder="000000" style="text-align: center; font-size: 24px; letter-spacing: 8px; font-family: var(--font-display); width: 200px; margin: 10px auto;">
        <button class="btn btn-primary" id="verify-2fa-btn" style="justify-content: center;">אמת קוד וכנס</button>
        <button class="btn btn-secondary" id="resend-2fa-btn" style="justify-content: center; font-size: 12px;">שלח קוד חדש</button>
      </div>
    `;
    
    overlay.classList.add('active');
    
    document.getElementById('verify-2fa-btn').addEventListener('click', () => {
      const enteredCode = document.getElementById('twofactor-input').value.trim();
      const verification = verify2FACode(profile.uid, enteredCode);
      
      if (verification.valid) {
        overlay.classList.remove('active');
        showToast("הקוד אומת! ברוך הבא ל-DIGGY 🎉", "success");
        navigateTo('#/');
      } else {
        showToast(verification.error, "danger");
        if (verification.error.includes('חרגת')) {
          // Max attempts reached, close modal and redirect to login
          setTimeout(() => {
            overlay.classList.remove('active');
            navigateTo('#/login');
          }, 2000);
        }
      }
    });
    
    document.getElementById('resend-2fa-btn').addEventListener('click', () => {
      // Clear old code and generate new one
      clear2FACode(profile.uid);
      const newCode = generateAndStore2FACode(profile.uid);
      
      const newEmailHtml = emailHtml.replace(code, newCode);
      mod.sendEmailViaResend(destEmail, "DIGGY - קוד אימות דו-שלבי (חדש)", newEmailHtml);
      showToast("קוד חדש נשלח לאימייל!", "info");
    });
  });
}

// Biometric Quick Login flow
async function triggerBiometricLoginFlow() {
  const overlay = document.getElementById('modal-overlay');
  const modalTitle = document.getElementById('modal-title');
  const modalBody = document.getElementById('modal-body');

  modalTitle.textContent = "סורק טביעת אצבע ביומטרי";
  modalBody.innerHTML = `
    <div class="bio-scanner-container">
      <div class="fingerprint-widget scanning" id="bio-widget">
        <i class="fas fa-fingerprint fingerprint-icon"></i>
        <div class="scanner-laser"></div>
      </div>
      <div id="bio-status" style="font-weight: bold; color: var(--accent-color); text-transform: uppercase; font-family: var(--font-display);">סורק... נא להניח אצבע</div>
      <p style="font-size: 13px; color: var(--text-muted); max-width: 300px;">
        מתחבר באמצעות מפתח האבטחה הביומטרי של המכשיר שלך (WebAuthn).
      </p>
    </div>
  `;

  overlay.classList.add('active');

  // Get stored biometric credentials
  let username = localStorage.getItem('diggy_bio_username');
  let uid = localStorage.getItem('diggy_bio_uid');

  // Let scanning run for 2 seconds for visual effect
  setTimeout(async () => {
    const statusText = document.getElementById('bio-status');
    const widget = document.getElementById('bio-widget');

    if (!username || !uid) {
      widget.classList.remove('scanning');
      widget.style.color = 'var(--danger-color)';
      statusText.innerHTML = "שגיאה: זיהוי ביומטרי לא מוגדר!";
      statusText.style.color = 'var(--danger-color)';
      
      setTimeout(() => {
        overlay.classList.remove('active');
        showToast("לא הוגדרה כניסה ביומטרית בחשבון זה! היכנס רגיל והפעל אותה בהגדרות.", "warning");
      }, 1500);
      return;
    }

    try {
      // Use real WebAuthn verification
      const result = await verifyWebAuthnCredential(username, uid);
      
      if (result.success) {
        widget.classList.remove('scanning');
        widget.style.color = '#00ff66';
        statusText.innerHTML = "סריקה הושלמה! מאושר";
        
        setTimeout(async () => {
          overlay.classList.remove('active');
          // Log in with biometric token
          const profile = await logInUser(username, "auth_biometric_token");
          showToast(`ברוך שובך ביומטרי, ${username}!`, "success");
          navigateTo('#/');
        }, 1000);
      }
    } catch (e) {
      console.warn("WebAuthn verification failed:", e);
      widget.classList.remove('scanning');
      widget.style.color = 'var(--danger-color)';
      statusText.innerHTML = "סריקה נכשלה";
      statusText.style.color = 'var(--danger-color)';
      
      setTimeout(() => {
        overlay.classList.remove('active');
        showToast("שגיאה בכניסה ביומטרית: " + e.message, "danger");
      }, 1500);
    }
  }, 2000);
}

// Render: DEVELOPER DASHBOARD
async function renderDev() {
  const main = document.getElementById('main-container');
  
  if (!state.user || (state.user.role !== 'developer' && state.user.role !== 'admin')) {
    main.innerHTML = `
      <div style="text-align: center; padding: 80px 0;">
        <i class="fas fa-lock" style="font-size: 64px; color: var(--danger-color); margin-bottom: 20px;"></i>
        <h2>גישה חסומה!</h2>
        <p style="color: var(--text-muted); margin-top: 10px;">דף זה מיועד למפתחים מורשים בלבד. אם ברצונך להעלות משחקים, הגש בקשה בהגדרות.</p>
        <button class="btn btn-primary" onclick="window.location.hash='#/'" style="margin-top: 20px;">חזור למסך הבית</button>
      </div>
    `;
    return;
  }

  main.innerHTML = `
    <div class="top-header">
      <div class="page-title-wrap">
        <h1>לוח בקרה מפתח</h1>
        <p style="color: var(--text-muted); margin-top: 5px;">נהל את המשחקים שלך והגש בקשות העלאה לאתר</p>
      </div>
      <button class="btn btn-primary" id="dev-submit-game-btn"><i class="fas fa-plus"></i> הגש משחק חדש</button>
    </div>

    <div class="section-title">המשחקים והבקשות שלך</div>
    <div class="data-table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>לוגו</th>
            <th>שם המשחק</th>
            <th>קטגוריות</th>
            <th>קישור GITHUB</th>
            <th>סטטוס</th>
            <th>הערות ADMIN</th>
            <th>פעולות</th>
          </tr>
        </thead>
        <tbody id="dev-games-list-body">
          <tr>
            <td colspan="7" style="text-align: center; color: var(--text-muted); padding: 30px;">טוען נתונים...</td>
          </tr>
        </tbody>
      </table>
    </div>
  `;

  // Fetch games & requests
  try {
    const requests = await getDeveloperGameRequests(state.user.uid);
    const body = document.getElementById('dev-games-list-body');
    
    if (requests.length === 0) {
      body.innerHTML = `
        <tr>
          <td colspan="7" style="text-align: center; color: var(--text-muted); padding: 40px;">
            <i class="fas fa-folder-open" style="font-size: 32px; display: block; margin-bottom: 10px;"></i>
            טרם הגשת משחקים לאתר. לחץ על "הגש משחק חדש" כדי להתחיל!
          </td>
        </tr>
      `;
    } else {
      body.innerHTML = requests.map(req => {
        let statusBadge = '';
        if (req.status === 'pending') statusBadge = '<span class="badge badge-pending">ממתין לאישור</span>';
        else if (req.status === 'approved') statusBadge = '<span class="badge badge-approved">אושר בהצלחה</span>';
        else if (req.status === 'rejected') statusBadge = '<span class="badge badge-rejected">נדחה</span>';
        else if (req.status === 'improvement') statusBadge = '<span class="badge badge-improvement">דרוש תיקון</span>';

        const actionBtn = req.status === 'improvement' 
          ? `<button class="btn btn-secondary resubmit-btn" data-id="${req.id}" style="padding: 4px 10px; font-size: 11px;"><i class="fas fa-edit"></i> ערוך והגש שנית</button>`
          : (req.status === 'approved' ? '<span style="color: var(--accent-color); font-size: 12px;"><i class="fas fa-check-circle"></i> חי באתר</span>' : '<span style="color: var(--text-dark); font-size: 12px;">אין פעולות</span>');

        return `
          <tr data-raw='${JSON.stringify(req)}'>
            <td><img src="${req.logoUrl || ''}" onerror="this.src='https://placehold.co/40x40/12161e/00ff66?text=G'" style="width: 40px; height: 40px; border-radius: 6px; object-fit: cover;"></td>
            <td style="font-weight: bold; color: var(--accent-color);">${req.name}</td>
            <td>${req.categories ? req.categories.join(', ') : ''}</td>
            <td><a href="${req.githubUrl}" target="_blank" style="color: #0096ff; text-decoration: underline; font-size: 12px;">קוד מאגר</a></td>
            <td>${statusBadge}</td>
            <td style="max-width: 200px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${req.adminSuggestions || ''}">${req.adminSuggestions || '<span style="color: var(--text-dark);">אין</span>'}</td>
            <td>${actionBtn}</td>
          </tr>
        `;
      }).join('');

      body.querySelectorAll('.resubmit-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const row = btn.closest('tr');
          const data = JSON.parse(row.getAttribute('data-raw'));
          openGameSubmitModal(data);
        });
      });
    }
  } catch (err) {
    showToast("שגיאה בטעינת משחקי מפתח: " + err.message, "danger");
  }

  document.getElementById('dev-submit-game-btn').addEventListener('click', () => {
    openGameSubmitModal();
  });
}

function openGameSubmitModal(editData = null) {
  const overlay = document.getElementById('modal-overlay');
  const modalTitle = document.getElementById('modal-title');
  const modalBody = document.getElementById('modal-body');

  modalTitle.textContent = editData ? `עריכת והגשת המשחק: ${editData.name}` : "הגשת משחק חדש ל-DIGGY";
  
  modalBody.innerHTML = `
    <form id="game-submit-form">
      <div class="form-group">
        <label>שם המשחק</label>
        <input type="text" id="game-name" value="${editData ? editData.name : ''}" required placeholder="לדוגמה: מלך הרטרו">
      </div>
      <div class="form-group">
        <label>תיאור קצר</label>
        <textarea id="game-desc" required placeholder="הסבר קצר על המשחק..." rows="2">${editData ? editData.description : ''}</textarea>
      </div>
      <div class="form-group">
        <label>קישור לתמונת לוגו (URL)</label>
        <input type="url" id="game-logo" value="${editData ? editData.logoUrl : ''}" required placeholder="https://example.com/logo.png">
      </div>
      <div class="form-group">
        <label>קישור למאגר GitHub (קוד המשחק)</label>
        <input type="url" id="game-github" value="${editData ? editData.githubUrl : ''}" required placeholder="https://github.com/user/repo" ${editData && editData.status === 'rejected' ? 'disabled' : ''}>
      </div>
      <div class="form-group">
        <label>איך משחקים (מדריך מקוצר)</label>
        <textarea id="game-how" required placeholder="לדוגמה: לחץ על חצים לזוז, רווח לירות..." rows="2">${editData ? editData.howToPlay : ''}</textarea>
      </div>
      <div class="form-group">
        <label>למי מיועד המשחק (קהל יעד)</label>
        <input type="text" id="game-audience" value="${editData ? editData.targetAudience : ''}" required placeholder="לדוגמה: ילדים בגיל 8 ומעלה">
      </div>
      <div class="form-group">
        <label>קטגוריות (סמן עד 3 קטגוריות)</label>
        <div class="category-checkbox-grid">
          <label class="category-checkbox-label">
            <input type="checkbox" name="game-cats" value="RPG" ${editData && editData.categories.includes('RPG') ? 'checked' : ''}> RPG
          </label>
          <label class="category-checkbox-label">
            <input type="checkbox" name="game-cats" value="RETRO" ${editData && editData.categories.includes('RETRO') ? 'checked' : ''}> RETRO
          </label>
          <label class="category-checkbox-label">
            <input type="checkbox" name="game-cats" value="MULTIPLAYER" ${editData && editData.categories.includes('MULTIPLAYER') ? 'checked' : ''}> MULTIPLAYER
          </label>
        </div>
      </div>
      <button type="submit" class="btn btn-primary" style="width: 100%; justify-content: center; margin-top: 15px;">
        <i class="fas fa-paper-plane"></i> ${editData ? 'שלח עדכון מחדש' : 'שלח בקשה לאישור ADMIN'}
      </button>
    </form>
  `;

  overlay.classList.add('active');

  const form = document.getElementById('game-submit-form');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const checkedBoxes = form.querySelectorAll('input[name="game-cats"]:checked');
    if (checkedBoxes.length === 0) {
      showToast("עליך לבחור לפחות קטגוריה אחת (מקסימום 3)!", "warning");
      return;
    }
    if (checkedBoxes.length > 3) {
      showToast("ניתן לבחור עד 3 קטגוריות בלבד!", "warning");
      return;
    }

    const categories = Array.from(checkedBoxes).map(cb => cb.value);

    const gameData = {
      name: document.getElementById('game-name').value,
      description: document.getElementById('game-desc').value,
      logoUrl: document.getElementById('game-logo').value,
      githubUrl: document.getElementById('game-github').value,
      howToPlay: document.getElementById('game-how').value,
      targetAudience: document.getElementById('game-audience').value,
      categories: categories,
      developerUid: state.user.uid,
      developerName: state.user.username
    };

    showLoader(true);
    try {
      if (editData) {
        // Re-submit updated game request
        await updateAndResubmitGameRequest(editData.id, gameData);
        showToast("בקשת המשחק עודכנה ונשלחה מחדש לאישור! 🚀", "success");
      } else {
        // New game request
        await submitGameRequest(gameData);
        showToast("המשחק נשלח לאישור ה-Admin! יישלח אליך עדכון במייל. 📧", "success");
      }
      overlay.classList.remove('active');
      renderDev();
    } catch (err) {
      showToast(err.message, "danger");
    } finally {
      showLoader(false);
    }
  });
}

// Render: ADMIN PANEL
async function renderAdmin() {
  const main = document.getElementById('main-container');

  if (!state.user || state.user.role !== 'admin') {
    main.innerHTML = `
      <div style="text-align: center; padding: 80px 0;">
        <i class="fas fa-radiation-alt" style="font-size: 64px; color: var(--danger-color); margin-bottom: 20px;"></i>
        <h2>מערכת נעולה - ADMIN ONLY!</h2>
        <p style="color: var(--text-muted); margin-top: 10px;">דף זה מיועד אך ורק למנהלי מערכת DIGGY.</p>
        <button class="btn btn-primary" onclick="window.location.hash='#/'" style="margin-top: 20px;">חזור למסך הבית</button>
      </div>
    `;
    return;
  }

  main.innerHTML = `
    <div class="top-header">
      <div class="page-title-wrap">
        <h1>לוח בקרה מנהל מערכת (Admin)</h1>
        <p style="color: var(--text-muted); margin-top: 5px;">ניהול פניות מתכנתים, אישור משחקים חדשים והעלאה ישירה</p>
      </div>
      <button class="btn btn-primary" id="admin-direct-upload-btn"><i class="fas fa-upload"></i> העלה משחק ישיר</button>
    </div>

    <!-- Dev Applications Section -->
    <div class="section-title">פניות שחקנים להפוך למתכנתים</div>
    <div class="data-table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>שם משתמש</th>
            <th>אימייל אבטחה</th>
            <th>סיבת בקשה</th>
            <th>תאריך</th>
            <th>סטטוס פנייה</th>
            <th>פעולות החלטה</th>
          </tr>
        </thead>
        <tbody id="admin-dev-requests-body">
          <tr><td colspan="6" style="text-align: center; color: var(--text-muted);">טוען בקשות...</td></tr>
        </tbody>
      </table>
    </div>

    <!-- Game Submissions Section -->
    <div class="section-title">הגשות משחקים חדשים לאישור</div>
    <div class="data-table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>מפתח</th>
            <th>פרטי משחק</th>
            <th>קטגוריות</th>
            <th>GitHub</th>
            <th>קהל יעד / תיאור</th>
            <th>פעולות החלטה</th>
          </tr>
        </thead>
        <tbody id="admin-game-requests-body">
          <tr><td colspan="6" style="text-align: center; color: var(--text-muted);">טוען משחקים לאישור...</td></tr>
        </tbody>
      </table>
    </div>

    <!-- Users Management Section -->
    <div class="section-title">ניהול משתמשים ודרגות (חשבונות רשומים)</div>
    <div class="data-table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>שם משתמש</th>
            <th>מזהה ייחודי (UID)</th>
            <th>אימייל במערכת</th>
            <th>דרגה / תפקיד (ROLE)</th>
            <th>2FA / ביומטרי</th>
            <th>תאריך רישום</th>
          </tr>
        </thead>
        <tbody id="admin-users-list-body">
          <tr><td colspan="6" style="text-align: center; color: var(--text-muted);">טוען רשימת משתמשים...</td></tr>
        </tbody>
      </table>
    </div>
  `;

  // Bind direct upload
  document.getElementById('admin-direct-upload-btn').addEventListener('click', () => {
    openAdminDirectUploadModal();
  });

  // Pull applications to become developers
  try {
    const devRequests = await getDeveloperRequests();
    const devBody = document.getElementById('admin-dev-requests-body');
    
    if (devRequests.length === 0) {
      devBody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-muted); padding: 30px;">אין פניות מפתחים פעילות.</td></tr>`;
    } else {
      devBody.innerHTML = devRequests.map(req => {
        const isPending = req.status === 'pending';
        let statusText = '';
        if (req.status === 'approved') statusText = '<span class="badge badge-approved">אושר</span>';
        else if (req.status === 'rejected') statusText = '<span class="badge badge-rejected">נדחה</span>';
        else statusText = '<span class="badge badge-pending">ממתין</span>';

        const actionButtons = isPending 
          ? `
            <div style="display: flex; gap: 8px;">
              <button class="btn btn-primary admin-approve-dev" data-id="${req.id}" style="padding: 4px 8px; font-size: 10px;"><i class="fas fa-check"></i> אישור</button>
              <button class="btn btn-danger admin-reject-dev" data-id="${req.id}" style="padding: 4px 8px; font-size: 10px;"><i class="fas fa-times"></i> דחייה</button>
            </div>
          ` 
          : `<span style="color: var(--text-dark); font-size: 12px;">נסגר</span>`;

        return `
          <tr>
            <td style="font-weight: bold;">${req.username}</td>
            <td>${req.contactEmail}</td>
            <td style="max-width: 250px; font-size: 13px;" title="${req.reason}">${req.reason}</td>
            <td>${new Date(req.createdAt).toLocaleDateString()}</td>
            <td>${statusText}</td>
            <td>${actionButtons}</td>
          </tr>
        `;
      }).join('');

      devBody.querySelectorAll('.admin-approve-dev').forEach(btn => {
        btn.addEventListener('click', () => openAdminReasonModal(btn.getAttribute('data-id'), 'approved', 'dev'));
      });
      devBody.querySelectorAll('.admin-reject-dev').forEach(btn => {
        btn.addEventListener('click', () => openAdminReasonModal(btn.getAttribute('data-id'), 'rejected', 'dev'));
      });
    }
  } catch (err) {
    console.error("Error loading dev requests:", err);
  }

  // Pull Game approval submissions
  try {
    const gameRequests = await getPendingGameRequests();
    const gameBody = document.getElementById('admin-game-requests-body');

    if (gameRequests.length === 0) {
      gameBody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-muted); padding: 30px;">אין משחקים הממתינים לאישור.</td></tr>`;
    } else {
      gameBody.innerHTML = gameRequests.map(req => {
        const isPending = req.status === 'pending';
        let statusText = '';
        if (req.status === 'approved') statusText = '<span class="badge badge-approved">אושר</span>';
        else if (req.status === 'rejected') statusText = '<span class="badge badge-rejected">נדחה</span>';
        else if (req.status === 'improvement') statusText = '<span class="badge badge-improvement">הצעת שיפור</span>';

        const actionButtons = isPending 
          ? `
            <div style="display: flex; gap: 6px; flex-direction: column;">
              <button class="btn btn-primary admin-approve-game" data-id="${req.id}" style="padding: 4px 8px; font-size: 10px; justify-content: center;"><i class="fas fa-check"></i> אישור והעלאה</button>
              <button class="btn btn-secondary admin-improve-game" data-id="${req.id}" style="padding: 4px 8px; font-size: 10px; justify-content: center; border-color: #0096ff; color: #0096ff;"><i class="fas fa-comment-dots"></i> הצעות לשיפור</button>
              <button class="btn btn-danger admin-reject-game" data-id="${req.id}" style="padding: 4px 8px; font-size: 10px; justify-content: center;"><i class="fas fa-times"></i> דחייה מוחלטת</button>
            </div>
          `
          : `<div style="display: flex; flex-direction: column; gap: 4px;">${statusText}<span style="color: var(--text-muted); font-size: 11px;">${req.adminSuggestions || ''}</span></div>`;

        return `
          <tr>
            <td><strong>${req.developerName}</strong></td>
            <td>
              <div style="display: flex; align-items: center; gap: 10px;">
                <img src="${req.logoUrl}" style="width: 40px; height: 40px; border-radius: 6px; object-fit: cover;">
                <div>
                  <div style="font-weight: bold; color: var(--accent-color);">${req.name}</div>
                  <div style="font-size: 11px; color: var(--text-muted);">איך משחקים: ${req.howToPlay}</div>
                </div>
              </div>
            </td>
            <td>${req.categories.join(', ')}</td>
            <td><a href="${req.githubUrl}" target="_blank" style="color: #0096ff; text-decoration: underline; font-size: 12px;">מקור קוד</a></td>
            <td>
              <div style="font-size: 12px;"><strong>מיועד ל:</strong> ${req.targetAudience}</div>
              <div style="font-size: 12px; color: var(--text-muted); max-width: 200px; overflow: hidden; text-overflow: ellipsis;">${req.description}</div>
            </td>
            <td>${actionButtons}</td>
          </tr>
        `;
      }).join('');

      gameBody.querySelectorAll('.admin-approve-game').forEach(btn => {
        btn.addEventListener('click', () => openAdminReasonModal(btn.getAttribute('data-id'), 'approved', 'game'));
      });
      gameBody.querySelectorAll('.admin-improve-game').forEach(btn => {
        btn.addEventListener('click', () => openAdminReasonModal(btn.getAttribute('data-id'), 'improvement', 'game'));
      });
      gameBody.querySelectorAll('.admin-reject-game').forEach(btn => {
        btn.addEventListener('click', () => openAdminReasonModal(btn.getAttribute('data-id'), 'rejected', 'game'));
      });
    }
  } catch (err) {
    console.error("Error loading games queue:", err);
  }

  // Pull all registered users data
  try {
    const allUsers = await getAllUsers();
    const usersBody = document.getElementById('admin-users-list-body');
    
    if (allUsers.length === 0) {
      usersBody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-muted); padding: 30px;">לא נמצאו חשבונות רשומים.</td></tr>`;
    } else {
      usersBody.innerHTML = allUsers.map(u => {
        const registrationDate = u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'לא ידוע';
        const twoFaBadge = u.twoFactorEnabled ? '<span style="color: var(--accent-color); font-size: 11px;"><i class="fas fa-check-circle"></i> פעיל</span>' : '<span style="color: var(--text-dark); font-size: 11px;">כבוי</span>';
        const bioBadge = u.biometricsEnabled ? '<span style="color: var(--accent-color); font-size: 11px;"><i class="fas fa-check-circle"></i> פעיל</span>' : '<span style="color: var(--text-dark); font-size: 11px;">כבוי</span>';

        return `
          <tr>
            <td><strong>${u.username}</strong></td>
            <td style="font-family: monospace; font-size: 11px; color: var(--text-muted);">${u.uid}</td>
            <td>${u.email}</td>
            <td>
              <select class="admin-role-select" data-uid="${u.uid}" style="background: var(--bg-darker); border-color: rgba(255,255,255,0.1); padding: 4px 8px; border-radius: 4px; font-size: 12px; font-family: var(--font-display); color: var(--accent-color);">
                <option value="player" ${u.role === 'player' ? 'selected' : ''}>PLAYER</option>
                <option value="developer" ${u.role === 'developer' ? 'selected' : ''}>DEVELOPER</option>
                <option value="admin" ${u.role === 'admin' ? 'selected' : ''}>ADMIN</option>
              </select>
            </td>
            <td>
              <div style="display: flex; gap: 10px;">
                <span>2FA: ${twoFaBadge}</span>
                <span>Bio: ${bioBadge}</span>
              </div>
            </td>
            <td>${registrationDate}</td>
          </tr>
        `;
      }).join('');

      // Bind role change selectors
      usersBody.querySelectorAll('.admin-role-select').forEach(select => {
        select.addEventListener('change', async () => {
          const uid = select.getAttribute('data-uid');
          const newRole = select.value;
          
          showLoader(true);
          try {
            await changeUserRole(uid, newRole);
            showToast(`דרגת המשתמש עודכנה ל-${newRole.toUpperCase()} בהצלחה!`, "success");
            // If the user modified their own role, update state
            if (state.user && state.user.uid === uid) {
              state.user.role = newRole;
              renderUserBadge();
            }
            renderAdmin(); // Refresh dashboard
          } catch (e) {
            showToast("עדכון הדרגה נכשל: " + e.message, "danger");
          } finally {
            showLoader(false);
          }
        });
      });
    }
  } catch (err) {
    console.error("Error loading users list:", err);
  }
}


// Modal asking Admin to write reason/feedback for developer status or game requests
function openAdminReasonModal(requestId, status, type) {
  const overlay = document.getElementById('modal-overlay');
  const modalTitle = document.getElementById('modal-title');
  const modalBody = document.getElementById('modal-body');

  modalTitle.textContent = "הזנת הסבר מנהל מערכת (Admin Action)";
  
  let labelText = "רשום סיבה או הצעות לשיפור שיועברו למשתמש:";
  if (status === 'approved') labelText = "הערות אישור (יופיעו במייל):";
  else if (status === 'rejected') labelText = "סיבת סירוב (יופיע במייל - המשתמש לא יוכל להגיש שוב):";
  else if (status === 'improvement') labelText = "פרט את ההצעות לשיפור ושינויים שנדרשים מהמפתח:";

  modalBody.innerHTML = `
    <form id="admin-reason-form">
      <div class="form-group">
        <label>${labelText}</label>
        <textarea id="admin-notes" required placeholder="הזן כאן את הטקסט..." rows="4"></textarea>
      </div>
      <button type="submit" class="btn btn-primary" style="width: 100%; justify-content: center;">
        <i class="fas fa-check-double"></i> בצע פעולה ושלח מייל
      </button>
    </form>
  `;

  overlay.classList.add('active');

  document.getElementById('admin-reason-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const reason = document.getElementById('admin-notes').value.trim();

    showLoader(true);
    try {
      if (type === 'dev') {
        await handleDeveloperRequest(requestId, status, reason);
        showToast("בקשת המפתח עודכנה והמייל נשלח בהצלחה!", "success");
      } else if (type === 'game') {
        await handleGameRequest(requestId, status, reason);
        showToast("בקשת המשחק עודכנה והמייל נשלח בהצלחה!", "success");
      }
      
      overlay.classList.remove('active');
      await fetchGames();
      renderAdmin();
    } catch (err) {
      showToast(err.message, "danger");
    } finally {
      showLoader(false);
    }
  });
}

function openAdminDirectUploadModal() {
  const overlay = document.getElementById('modal-overlay');
  const modalTitle = document.getElementById('modal-title');
  const modalBody = document.getElementById('modal-body');

  modalTitle.textContent = "העלאה ישירה של משחק (Admin Bypass)";
  
  modalBody.innerHTML = `
    <form id="admin-direct-upload-form">
      <div class="form-group">
        <label>שם המשחק</label>
        <input type="text" id="direct-name" required placeholder="לדוגמה: אלוף המבוכים">
      </div>
      <div class="form-group">
        <label>תיאור</label>
        <textarea id="direct-desc" required placeholder="תיאור קצר..." rows="2"></textarea>
      </div>
      <div class="form-group">
        <label>קישור ללוגו (URL)</label>
        <input type="url" id="direct-logo" required placeholder="https://example.com/logo.png">
      </div>
      <div class="form-group">
        <label>קישור למאגר GitHub</label>
        <input type="url" id="direct-github" required placeholder="https://github.com/... (אופציונלי)">
      </div>
      <div class="form-group">
        <label>הוראות משחק</label>
        <textarea id="direct-how" required placeholder="איך משחקים..." rows="2"></textarea>
      </div>
      <div class="form-group">
        <label>קהל יעד</label>
        <input type="text" id="direct-audience" required placeholder="לדוגמה: לכולם">
      </div>
      <div class="form-group">
        <label>קטגוריות (סמן עד 3)</label>
        <div class="category-checkbox-grid">
          <label class="category-checkbox-label">
            <input type="checkbox" name="direct-cats" value="RPG"> RPG
          </label>
          <label class="category-checkbox-label">
            <input type="checkbox" name="direct-cats" value="RETRO"> RETRO
          </label>
          <label class="category-checkbox-label">
            <input type="checkbox" name="direct-cats" value="MULTIPLAYER"> MULTIPLAYER
          </label>
        </div>
      </div>
      <button type="submit" class="btn btn-primary" style="width: 100%; justify-content: center; margin-top: 15px;">
        <i class="fas fa-cloud-upload-alt"></i> פרסם מיידית באתר
      </button>
    </form>
  `;

  overlay.classList.add('active');

  const form = document.getElementById('admin-direct-upload-form');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const checkedBoxes = form.querySelectorAll('input[name="direct-cats"]:checked');
    if (checkedBoxes.length === 0) {
      showToast("בחר לפחות קטגוריה אחת!", "warning");
      return;
    }
    const categories = Array.from(checkedBoxes).map(cb => cb.value);

    const gamePayload = {
      name: document.getElementById('direct-name').value,
      description: document.getElementById('direct-desc').value,
      logoUrl: document.getElementById('direct-logo').value,
      githubUrl: document.getElementById('direct-github').value,
      howToPlay: document.getElementById('direct-how').value,
      targetAudience: document.getElementById('direct-audience').value,
      categories: categories,
      developerUid: state.user.uid,
      developerName: `${state.user.username} (ADMIN)`
    };

    showLoader(true);
    try {
      await directPublishGame(gamePayload);
      showToast("המשחק פורסם בהצלחה באתר ללא צורך באישור! 🎉", "success");
      overlay.classList.remove('active');
      await fetchGames();
      renderAdmin();
    } catch (err) {
      showToast(err.message, "danger");
    } finally {
      showLoader(false);
    }
  });
}

// Render: GAME DETAILS & INTERACTIVE PLAY WINDOW
async function renderGameDetails(gameId) {
  const main = document.getElementById('main-container');

  const game = state.games.find(g => g.id === gameId);
  if (!game) {
    main.innerHTML = `<div style="text-align: center; padding: 80px 0;"><h2>משחק לא נמצא!</h2></div>`;
    return;
  }

  // Update State
  state.currentGame = game;

  // Add game to user's recently played list in background
  if (state.user) {
    let recent = [...(state.user.recentlyPlayed || [])];
    recent = recent.filter(id => id !== gameId); // remove duplicate
    recent.unshift(gameId); // put first
    recent = recent.slice(0, 5); // limit to 5
    state.user.recentlyPlayed = recent;
    await updateUserProfile(state.user.uid, { recentlyPlayed: recent });
  }

  main.innerHTML = `
    <div style="margin-bottom: 20px;">
      <a href="#/" style="color: var(--accent-color); font-size: 14px;"><i class="fas fa-chevron-right"></i> חזרה לכל המשחקים</a>
    </div>

    <div class="game-play-area">
      <!-- Game Display Screen Panel -->
      <div class="game-screen-panel">
        <div class="game-screen-header">
          <h2 style="font-size: 20px; color: var(--accent-color);">${game.name}</h2>
          <span style="font-size: 13px; color: var(--text-muted); font-family: var(--font-display);" id="game-score-display">ניקוד: 0</span>
        </div>
        <div class="game-canvas-container">
          <div class="game-menu-overlay" id="game-menu-overlay">
            <h3 class="game-menu-title">${game.name}</h3>
            <p style="color: var(--text-muted); font-size: 14px; max-width: 380px; text-align: center; line-height: 1.5;">${game.howToPlay}</p>
            <button class="btn btn-primary" id="start-game-btn"><i class="fas fa-gamepad"></i> התחל משחק!</button>
          </div>
          <!-- Game Canvas -->
          <canvas id="retro-game-canvas" width="600" height="400" style="display: none;"></canvas>
        </div>
      </div>

      <!-- Game Details Info Panel -->
      <div class="game-sidebar-panel">
        <div style="display: flex; justify-content: center;">
          <img src="${game.logoUrl}" onerror="this.src='https://placehold.co/120x120/12161e/00ff66?text=DIGGY'" style="width: 100px; height: 100px; border-radius: 12px; object-fit: cover; border: 2px solid var(--accent-color); box-shadow: var(--border-glow);">
        </div>
        
        <div class="game-meta-item">
          <span class="game-meta-label">מפתח</span>
          <span class="game-meta-val" style="font-weight: bold; color: var(--accent-color);">${game.developerName}</span>
        </div>

        <div class="game-meta-item">
          <span class="game-meta-label">קטגוריות</span>
          <div style="display: flex; gap: 5px;">
            ${game.categories.map(c => `<span class="game-tag" style="background: var(--accent-dim); color: var(--accent-color);">${c}</span>`).join('')}
          </div>
        </div>

        <div class="game-meta-item">
          <span class="game-meta-label">קהל יעד</span>
          <span class="game-meta-val">${game.targetAudience}</span>
        </div>

        <div class="game-meta-item">
          <span class="game-meta-label">קוד מקור</span>
          <a href="${game.githubUrl}" target="_blank" style="color: #0096ff; text-decoration: underline; font-size: 13px;">צפה ב-GitHub Repository</a>
        </div>

        <hr style="border: 0; border-top: 1px solid rgba(255, 255, 255, 0.05);">

        <div class="game-meta-item">
          <span class="game-meta-label">תיאור המשחק</span>
          <p style="font-size: 13px; line-height: 1.5; color: var(--text-muted);">${game.description}</p>
        </div>
      </div>
    </div>
  `;

  // Bind Start Game Button
  document.getElementById('start-game-btn').addEventListener('click', () => {
    document.getElementById('game-menu-overlay').style.display = 'none';
    const canvas = document.getElementById('retro-game-canvas');
    canvas.style.display = 'block';
    
    // Launch game engine depending on id
    if (game.id === 'preset_snake') {
      state.gameInstance = launchSnakeGame(canvas);
    } else if (game.id === 'preset_bricks') {
      state.gameInstance = launchBricksGame(canvas);
    } else if (game.id === 'preset_evader') {
      state.gameInstance = launchEvaderGame(canvas);
    } else {
      // Fallback fallback engine
      state.gameInstance = launchSnakeGame(canvas); // fallback to snake
    }
  });
}

// --- BUILT-IN RETRO GAME ENGINES (CANVAS) ---

// 1. NEON SNAKE GAME
function launchSnakeGame(canvas) {
  const ctx = canvas.getContext('2d');
  const scoreDisplay = document.getElementById('game-score-display');
  
  let score = 0;
  let grid = 20;
  let count = 0;
  
  let snake = {
    x: 160,
    y: 160,
    dx: grid,
    dy: 0,
    cells: [],
    maxCells: 4
  };
  
  let apple = {
    x: 320,
    y: 320
  };

  let gameInterval = null;
  let isRunning = true;

  function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
  }

  function loop() {
    if (!isRunning) return;
    gameInterval = requestAnimationFrame(loop);

    // Slow game loop to 15 fps
    if (++count < 6) {
      return;
    }
    count = 0;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Move snake
    snake.x += snake.dx;
    snake.y += snake.dy;

    // Wrap snake position on edge collision
    if (snake.x < 0) snake.x = canvas.width - grid;
    else if (snake.x >= canvas.width) snake.x = 0;
    
    if (snake.y < 0) snake.y = canvas.height - grid;
    else if (snake.y >= canvas.height) snake.y = 0;

    // Track tail
    snake.cells.unshift({x: snake.x, y: snake.y});

    if (snake.cells.length > snake.maxCells) {
      snake.cells.pop();
    }

    // Draw apple
    ctx.fillStyle = '#ff3366';
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#ff3366';
    ctx.beginPath();
    ctx.arc(apple.x + grid/2, apple.y + grid/2, grid/2 - 2, 0, 2 * Math.PI);
    ctx.fill();

    // Draw snake
    ctx.fillStyle = state.theme; // Use user selected theme color!
    ctx.shadowBlur = 15;
    ctx.shadowColor = state.theme;
    
    snake.cells.forEach(function(cell, index) {
      ctx.fillRect(cell.x, cell.y, grid-1, grid-1);

      // Check collision with apple
      if (cell.x === apple.x && cell.y === apple.y) {
        snake.maxCells++;
        score += 10;
        scoreDisplay.textContent = `ניקוד: ${score}`;
        
        apple.x = getRandomInt(0, canvas.width / grid) * grid;
        apple.y = getRandomInt(0, canvas.height / grid) * grid;
      }

      // Check self-collision
      for (let i = index + 1; i < snake.cells.length; i++) {
        if (cell.x === snake.cells[i].x && cell.y === snake.cells[i].y) {
          gameOver();
        }
      }
    });
  }

  function handleKeydown(e) {
    if (e.key === 'ArrowLeft' && snake.dx === 0) { snake.dx = -grid; snake.dy = 0; }
    else if (e.key === 'ArrowUp' && snake.dy === 0) { snake.dy = -grid; snake.dx = 0; }
    else if (e.key === 'ArrowRight' && snake.dx === 0) { snake.dx = grid; snake.dy = 0; }
    else if (e.key === 'ArrowDown' && snake.dy === 0) { snake.dy = grid; snake.dx = 0; }
  }

  document.addEventListener('keydown', handleKeydown);
  gameInterval = requestAnimationFrame(loop);

  function gameOver() {
    isRunning = false;
    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#ff3366';
    ctx.font = '24px Orbitron';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', canvas.width/2, canvas.height/2 - 20);
    
    ctx.fillStyle = '#ffffff';
    ctx.font = '14px Outfit';
    ctx.fillText(`ניקוד סופי: ${score}`, canvas.width/2, canvas.height/2 + 10);
    ctx.fillText('לחץ שוב על כפתור התחל כדי לנסות שנית', canvas.width/2, canvas.height/2 + 40);
  }

  return {
    stop: () => {
      isRunning = false;
      cancelAnimationFrame(gameInterval);
      document.removeEventListener('keydown', handleKeydown);
    }
  };
}

// 2. BRICK BREAKER GLOW GAME
function launchBricksGame(canvas) {
  const ctx = canvas.getContext('2d');
  const scoreDisplay = document.getElementById('game-score-display');
  
  let score = 0;
  let isRunning = true;
  let gameInterval = null;

  let ball = { x: canvas.width/2, y: canvas.height - 30, dx: 3, dy: -3, radius: 8 };
  let paddle = { x: canvas.width/2 - 50, y: canvas.height - 20, width: 100, height: 10, speed: 7 };
  let leftPressed = false;
  let rightPressed = false;

  // Brick rows config
  let brickRowCount = 4;
  let brickColumnCount = 6;
  let brickWidth = 75;
  let brickHeight = 20;
  let brickPadding = 15;
  let brickOffsetTop = 40;
  let brickOffsetLeft = 40;
  
  let bricks = [];
  const brickColors = ['#ff3366', '#00ff66', '#0096ff', '#ffcc00'];

  for (let c = 0; c < brickColumnCount; c++) {
    bricks[c] = [];
    for (let r = 0; r < brickRowCount; r++) {
      bricks[c][r] = { x: 0, y: 0, status: 1, color: brickColors[r % brickColors.length] };
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Right" || e.key === "ArrowRight") rightPressed = true;
    else if (e.key === "Left" || e.key === "ArrowLeft") leftPressed = true;
  }

  function handleKeyUp(e) {
    if (e.key === "Right" || e.key === "ArrowRight") rightPressed = false;
    else if (e.key === "Left" || e.key === "ArrowLeft") leftPressed = false;
  }

  function handleMouseMove(e) {
    let relativeX = e.clientX - canvas.getBoundingClientRect().left;
    if (relativeX > 0 && relativeX < canvas.width) {
      paddle.x = relativeX - paddle.width/2;
    }
  }

  document.addEventListener("keydown", handleKeyDown);
  document.addEventListener("keyup", handleKeyUp);
  document.addEventListener("mousemove", handleMouseMove);

  function collisionDetection() {
    for (let c = 0; c < brickColumnCount; c++) {
      for (let r = 0; r < brickRowCount; r++) {
        let b = bricks[c][r];
        if (b.status === 1) {
          if (ball.x > b.x && ball.x < b.x + brickWidth && ball.y > b.y && ball.y < b.y + brickHeight) {
            ball.dy = -ball.dy;
            b.status = 0;
            score += 15;
            scoreDisplay.textContent = `ניקוד: ${score}`;
            if (score === brickRowCount * brickColumnCount * 15) {
              winGame();
            }
          }
        }
      }
    }
  }

  function draw() {
    if (!isRunning) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw bricks
    for (let c = 0; c < brickColumnCount; c++) {
      for (let r = 0; r < brickRowCount; r++) {
        if (bricks[c][r].status === 1) {
          let brickX = (c * (brickWidth + brickPadding)) + brickOffsetLeft;
          let brickY = (r * (brickHeight + brickPadding)) + brickOffsetTop;
          bricks[c][r].x = brickX;
          bricks[c][r].y = brickY;
          
          ctx.fillStyle = bricks[c][r].color;
          ctx.shadowBlur = 10;
          ctx.shadowColor = bricks[c][r].color;
          ctx.fillRect(brickX, brickY, brickWidth, brickHeight);
        }
      }
    }

    // Draw ball
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = "#ffffff";
    ctx.shadowBlur = 12;
    ctx.shadowColor = "#ffffff";
    ctx.fill();
    ctx.closePath();

    // Draw paddle
    ctx.fillStyle = state.theme;
    ctx.shadowBlur = 15;
    ctx.shadowColor = state.theme;
    ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);

    // Detect brick hits
    collisionDetection();

    // Ball wall bounce
    if (ball.x + ball.dx > canvas.width - ball.radius || ball.x + ball.dx < ball.radius) {
      ball.dx = -ball.dx;
    }
    if (ball.y + ball.dy < ball.radius) {
      ball.dy = -ball.dy;
    } else if (ball.y + ball.dy > canvas.height - ball.radius) {
      // Paddle bounce
      if (ball.x > paddle.x && ball.x < paddle.x + paddle.width) {
        ball.dy = -ball.dy;
      } else {
        gameOver();
        return;
      }
    }

    // Move paddle
    if (rightPressed && paddle.x < canvas.width - paddle.width) {
      paddle.x += paddle.speed;
    } else if (leftPressed && paddle.x > 0) {
      paddle.x -= paddle.speed;
    }

    // Move ball
    ball.x += ball.dx;
    ball.y += ball.dy;

    gameInterval = requestAnimationFrame(draw);
  }

  gameInterval = requestAnimationFrame(draw);

  function gameOver() {
    isRunning = false;
    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(0,0,0,0.85)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#ff3366';
    ctx.font = '24px Orbitron';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', canvas.width/2, canvas.height/2 - 20);
    ctx.fillStyle = '#ffffff';
    ctx.font = '14px Outfit';
    ctx.fillText(`ניקוד סופי: ${score}`, canvas.width/2, canvas.height/2 + 10);
    ctx.fillText('נסה שנית!', canvas.width/2, canvas.height/2 + 40);
  }

  function winGame() {
    isRunning = false;
    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(0,0,0,0.85)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#00ff66';
    ctx.font = '24px Orbitron';
    ctx.textAlign = 'center';
    ctx.fillText('YOU WIN!', canvas.width/2, canvas.height/2 - 20);
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`ניקוד סופי: ${score}`, canvas.width/2, canvas.height/2 + 10);
  }

  return {
    stop: () => {
      isRunning = false;
      cancelAnimationFrame(gameInterval);
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keyup", handleKeyUp);
      document.removeEventListener("mousemove", handleMouseMove);
    }
  };
}

// 3. SPACE LASER EVADER GAME
function launchEvaderGame(canvas) {
  const ctx = canvas.getContext('2d');
  const scoreDisplay = document.getElementById('game-score-display');
  
  let score = 0;
  let isRunning = true;
  let gameInterval = null;

  let player = { x: canvas.width/2 - 20, y: canvas.height - 40, width: 40, height: 30, speed: 6 };
  let lasers = [];
  let enemies = [];
  let keys = {};
  let spawnTimer = 0;

  function handleKeyDown(e) { keys[e.key] = true; }
  function handleKeyUp(e) { keys[e.key] = false; }
  
  document.addEventListener('keydown', handleKeyDown);
  document.addEventListener('keyup', handleKeyUp);

  function spawnEnemy() {
    enemies.push({
      x: Math.random() * (canvas.width - 30),
      y: -30,
      width: 30,
      height: 30,
      speed: 1.5 + Math.random() * 3,
      color: '#ffaa00'
    });
  }

  function draw() {
    if (!isRunning) return;

    // Movement
    if (keys['ArrowLeft'] || keys['a']) {
      player.x = Math.max(0, player.x - player.speed);
    }
    if (keys['ArrowRight'] || keys['d']) {
      player.x = Math.min(canvas.width - player.width, player.x + player.speed);
    }
    if (keys[' '] || keys['Spacebar']) {
      // Limit rate of fire
      if (!player.lastFired || Date.now() - player.lastFired > 300) {
        lasers.push({ x: player.x + player.width/2 - 2, y: player.y, width: 4, height: 12, speed: 7 });
        player.lastFired = Date.now();
      }
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw Ship
    ctx.fillStyle = state.theme;
    ctx.shadowBlur = 15;
    ctx.shadowColor = state.theme;
    ctx.beginPath();
    ctx.moveTo(player.x + player.width/2, player.y);
    ctx.lineTo(player.x, player.y + player.height);
    ctx.lineTo(player.x + player.width, player.y + player.height);
    ctx.closePath();
    ctx.fill();

    // Spawn obstacles
    spawnTimer++;
    if (spawnTimer > 40) {
      spawnEnemy();
      spawnTimer = 0;
    }

    // Update & Draw lasers
    ctx.fillStyle = '#00ffff';
    ctx.shadowColor = '#00ffff';
    lasers.forEach((laser, index) => {
      laser.y -= laser.speed;
      ctx.fillRect(laser.x, laser.y, laser.width, laser.height);
      if (laser.y < 0) lasers.splice(index, 1);
    });

    // Update & Draw enemies
    enemies.forEach((enemy, eIdx) => {
      enemy.y += enemy.speed;
      ctx.fillStyle = enemy.color;
      ctx.shadowColor = enemy.color;
      ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);

      // Check collision with ship
      if (enemy.x < player.x + player.width &&
          enemy.x + enemy.width > player.x &&
          enemy.y < player.y + player.height &&
          enemy.y + enemy.height > player.y) {
        gameOver();
        return;
      }

      // Check collision with lasers
      lasers.forEach((laser, lIdx) => {
        if (laser.x < enemy.x + enemy.width &&
            laser.x + laser.width > enemy.x &&
            laser.y < enemy.y + enemy.height &&
            laser.y + laser.height > enemy.y) {
          
          enemies.splice(eIdx, 1);
          lasers.splice(lIdx, 1);
          score += 20;
          scoreDisplay.textContent = `ניקוד: ${score}`;
        }
      });

      // Remove offscreen
      if (enemy.y > canvas.height) enemies.splice(eIdx, 1);
    });

    gameInterval = requestAnimationFrame(draw);
  }

  gameInterval = requestAnimationFrame(draw);

  function gameOver() {
    isRunning = false;
    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(0,0,0,0.85)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#ff3366';
    ctx.font = '24px Orbitron';
    ctx.textAlign = 'center';
    ctx.fillText('SPACE SHUTTLE CRASHED', canvas.width/2, canvas.height/2 - 20);
    ctx.fillStyle = '#ffffff';
    ctx.font = '14px Outfit';
    ctx.fillText(`ניקוד סופי: ${score}`, canvas.width/2, canvas.height/2 + 10);
    ctx.fillText('נסה שנית!', canvas.width/2, canvas.height/2 + 40);
  }

  return {
    stop: () => {
      isRunning = false;
      cancelAnimationFrame(gameInterval);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    }
  };
}

// --- SETTINGS VIEW ---
export function renderSettings() {
  const main = document.getElementById('main-container');

  if (!state.user) {
    main.innerHTML = `
      <div style="text-align: center; padding: 80px 0;">
        <h2>גישה מוגבלת</h2>
        <p style="color: var(--text-muted); margin-top: 10px;">עלייך להתחבר למערכת כדי לגשת להגדרות.</p>
        <button class="btn btn-primary" onclick="window.location.hash='#/login'" style="margin-top: 20px;">התחבר עכשיו</button>
      </div>
    `;
    return;
  }

  main.innerHTML = `
    <div class="top-header">
      <div class="page-title-wrap">
        <h1>הגדרות חשבון והתאמה אישית</h1>
        <p style="color: var(--text-muted); margin-top: 5px;">נהל את פרטי החשבון והתאם את תצוגת האתר לטעמך</p>
      </div>
    </div>

    <div style="display: flex; gap: 30px; flex-wrap: wrap;">
      <!-- Profile settings card -->
      <div class="settings-card" style="flex: 1; min-width: 320px; max-width: 500px;">
        <div class="settings-card-header">
          <h2 class="settings-card-title">פרטי פרופיל</h2>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>שם משתמש</label>
            <input type="text" id="settings-username" value="${state.user.username}">
          </div>
          <div class="form-group">
            <label>אימייל משויך</label>
            <input type="text" value="${state.user.email}" disabled style="background: rgba(255,255,255,0.02); color: var(--text-muted);">
          </div>
          <div class="form-group">
            <label>תפקיד משתמש (ROLE)</label>
            <div style="font-weight: bold; color: var(--accent-color); font-family: var(--font-display); font-size: 16px;">
              ${state.user.role.toUpperCase()}
            </div>
          </div>
          
          <button class="btn btn-primary" id="save-profile-btn" style="width: 100%; justify-content: center; margin-top: 10px;">
            עדכן שם משתמש
          </button>
        </div>
      </div>

      <!-- Security / Auth card -->
      <div class="settings-card" style="flex: 1; min-width: 320px; max-width: 500px;">
        <div class="settings-card-header">
          <h2 class="settings-card-title">אבטחה וסיסמאות</h2>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>שינוי סיסמה (6-12 תווים)</label>
            <input type="password" id="settings-new-password" placeholder="הזן סיסמה חדשה">
          </div>
          <button class="btn btn-secondary" id="change-pass-btn" style="width: 100%; justify-content: center; margin-bottom: 25px;">
            שנה סיסמה
          </button>

          <!-- 2FA Setup -->
          <div style="border-top: 1px solid rgba(255,255,255,0.05); padding-top: 20px; margin-bottom: 20px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div>
                <strong style="display: block; font-size: 14px;">אימות דו-שלבי במייל (2FA)</strong>
                <span style="font-size: 12px; color: var(--text-muted);">שלח קוד אבטחה ביומטרי בכל חיבור</span>
              </div>
              <input type="checkbox" id="settings-2fa-toggle" ${state.user.twoFactorEnabled ? 'checked' : ''} style="width: 20px; height: 20px; accent-color: var(--accent-color); cursor: pointer;">
            </div>
            
            <div id="settings-2fa-email-group" style="display: ${state.user.twoFactorEnabled ? 'block' : 'none'}; margin-top: 15px;">
              <div class="form-group">
                <label>כתובת אימייל לשליחת הקוד</label>
                <input type="email" id="settings-2fa-email" value="${state.user.twoFactorEmail || ''}" placeholder="myemail@example.com">
              </div>
            </div>
          </div>

          <!-- Biometric setup -->
          <div style="border-top: 1px solid rgba(255,255,255,0.05); padding-top: 20px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
              <div>
                <strong style="display: block; font-size: 14px;">זיהוי ביומטרי מהיר (WebAuthn)</strong>
                <span style="font-size: 12px; color: var(--text-muted);">השתמש בטביעת אצבע/FaceID של המכשיר לכניסה</span>
              </div>
              <span id="bio-setup-status" style="font-size: 11px; font-family: var(--font-display); color: ${state.user.biometricsEnabled ? 'var(--accent-color)' : 'var(--text-muted)'};">
                ${state.user.biometricsEnabled ? 'מופעל' : 'לא מוגדר'}
              </span>
            </div>
            <button class="btn btn-secondary" id="register-biometric-btn" style="width: 100%; justify-content: center;">
              <i class="fas fa-fingerprint"></i> ${state.user.biometricsEnabled ? 'הגדר ביומטרי מחדש' : 'הפעל זיהוי ביומטרי'}
            </button>
          </div>
        </div>
      </div>

      <!-- Display Theme Personalization -->
      <div class="settings-card" style="flex: 1; min-width: 320px; max-width: 100%;">
        <div class="settings-card-header">
          <h2 class="settings-card-title">התאמת תצוגה</h2>
        </div>
        <div class="modal-body">
          <label style="font-size: 12px; color: var(--text-muted); text-transform: uppercase; font-family: var(--font-display);">בחר את צבע הניאון המועדף עליך:</label>
          <div class="color-picker-grid">
            <div class="color-picker-btn ${state.theme === '#00ff66' ? 'active' : ''}" style="background: #00ff66;" data-color="#00ff66"></div>
            <div class="color-picker-btn ${state.theme === '#ff3366' ? 'active' : ''}" style="background: #ff3366;" data-color="#ff3366"></div>
            <div class="color-picker-btn ${state.theme === '#ffaa00' ? 'active' : ''}" style="background: #ffaa00;" data-color="#ffaa00"></div>
            <div class="color-picker-btn ${state.theme === '#00ffff' ? 'active' : ''}" style="background: #00ffff;" data-color="#00ffff"></div>
            <div class="color-picker-btn ${state.theme === '#b026ff' ? 'active' : ''}" style="background: #b026ff;" data-color="#b026ff"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Become a Developer Application Form (If player role) -->
    ${state.user.role === 'player' ? `
      <div class="settings-card" style="margin-top: 30px; max-width: 100%;">
        <div class="settings-card-header" style="border-left: 4px solid var(--accent-color); padding-left: 10px;">
          <h2 class="settings-card-title">בקשה להפיכה למפתח משחקים ב-DIGGY</h2>
        </div>
        <div class="modal-body">
          <form id="dev-application-form">
            <p style="font-size: 14px; margin-bottom: 20px; color: var(--text-muted);">
              רוצה להעלות את משחקי ה-GitHub שלך לאתר שילדים מכל העולם ישחקו בהם? מלא את הבקשה הבאה והיא תישלח לצוות ה-Admin.
            </p>
            <div class="form-group">
              <label>סיבה (מדוע תרצה להיות מפתח באתר ואיזה משחקים תרצה להעלות?)</label>
              <textarea id="dev-app-reason" required placeholder="אני רוצה להיות מפתח כי..." rows="3"></textarea>
            </div>
            <div style="display: flex; gap: 20px; flex-wrap: wrap;">
              <div class="form-group" style="flex: 1; min-width: 220px;">
                <label>אימייל אבטחה (לשליחת הודעת אישור / דחייה מעוצבת)</label>
                <input type="email" id="dev-app-email" required placeholder="name@example.com">
              </div>
              <div class="form-group" style="flex: 1; min-width: 220px;">
                <label>סיסמת אימות (לאבטחת הבקשה)</label>
                <input type="password" id="dev-app-pass" required placeholder="הזן את סיסמת החשבון הנוכחי">
              </div>
            </div>

            <button type="submit" class="btn btn-primary" style="margin-top: 10px;">
              <i class="fas fa-file-signature"></i> הגש בקשת מפתח
            </button>
          </form>
        </div>
      </div>
    ` : ''}
  `;

  // Bind settings profile username update
  document.getElementById('save-profile-btn').addEventListener('click', async () => {
    const newUsername = document.getElementById('settings-username').value.trim();
    if (newUsername.length < 6 || newUsername.length > 12) {
      showToast("שם המשתמש חייב להיות בין 6 ל-12 תווים", "danger");
      return;
    }
    showLoader(true);
    try {
      await updateUserProfile(state.user.uid, { username: newUsername });
      state.user.username = newUsername;
      renderUserBadge();
      showToast("שם המשתמש עודכן בהצלחה!", "success");
    } catch (e) {
      showToast(e.message, "danger");
    } finally {
      showLoader(false);
    }
  });

  // Change password binding
  document.getElementById('change-pass-btn').addEventListener('click', async () => {
    const newPass = document.getElementById('settings-new-password').value;
    if (newPass.length < 6 || newPass.length > 12) {
      showToast("הסיסמה חייבת להיות בין 6 ל-12 תווים!", "danger");
      return;
    }
    showLoader(true);
    try {
      await changeUserPassword(newPass);
      showToast("הסיסמה שונתה בהצלחה!", "success");
      document.getElementById('settings-new-password').value = "";
    } catch (e) {
      showToast(e.message, "danger");
    } finally {
      showLoader(false);
    }
  });

  // 2FA Toggle binding
  const toggle2fa = document.getElementById('settings-2fa-toggle');
  const group2fa = document.getElementById('settings-2fa-email-group');
  toggle2fa.addEventListener('change', async () => {
    const enabled = toggle2fa.checked;
    group2fa.style.display = enabled ? 'block' : 'none';
    
    if (!enabled) {
      showLoader(true);
      await updateUserProfile(state.user.uid, { twoFactorEnabled: false });
      state.user.twoFactorEnabled = false;
      showToast("אימות דו-שלבי בוטל.", "info");
      showLoader(false);
    }
  });

  // If 2FA gets updated, save profile email
  const input2faEmail = document.getElementById('settings-2fa-email');
  input2faEmail.addEventListener('change', async () => {
    const val = input2faEmail.value.trim();
    if (val) {
      showLoader(true);
      await updateUserProfile(state.user.uid, { 
        twoFactorEnabled: true, 
        twoFactorEmail: val 
      });
      state.user.twoFactorEnabled = true;
      state.user.twoFactorEmail = val;
      showToast("כתובת אימות דו-שלבי עודכנה!", "success");
      showLoader(false);
    }
  });

  // Theme color picking
  document.querySelectorAll('.color-picker-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      document.querySelectorAll('.color-picker-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const color = btn.getAttribute('data-color');
      
      showLoader(true);
      await updateUserProfile(state.user.uid, { customTheme: color });
      state.user.customTheme = color;
      applyTheme(color);
      showLoader(false);
      showToast("ערכת העיצוב הניאונית עודכנה!", "success");
    });
  });

  // Biometric registration trigger
  document.getElementById('register-biometric-btn').addEventListener('click', async () => {
    showLoader(true);
    try {
      // Use real WebAuthn registration
      const result = await registerWebAuthnCredential(state.user.username, state.user.uid);
      
      if (result.success) {
        // Store credentials for login
        localStorage.setItem('diggy_bio_username', state.user.username);
        localStorage.setItem('diggy_bio_uid', state.user.uid);
        
        await updateUserProfile(state.user.uid, { 
          biometricsEnabled: true, 
          biometricsCredentialId: result.credentialId.join(',') 
        });

        state.user.biometricsEnabled = true;
        document.getElementById('bio-setup-status').textContent = 'מופעל';
        document.getElementById('bio-setup-status').style.color = 'var(--accent-color)';
        showToast("זיהוי ביומטרי הופעל בהצלחה עבור מכשיר זה! 🔒", "success");
      }
    } catch (e) {
      showToast("שגיאה ברישום ביומטרי: " + e.message, "danger");
    } finally {
      showLoader(false);
    }
  });

  // Become Developer Application Form Submit
  const devAppForm = document.getElementById('dev-application-form');
  if (devAppForm) {
    devAppForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const reason = document.getElementById('dev-app-reason').value;
      const email = document.getElementById('dev-app-email').value;
      const pass = document.getElementById('dev-app-pass').value;

      if (pass.length < 6 || pass.length > 12) {
        showToast("הזן סיסמת אימות תקינה (6-12 תווים)!", "danger");
        return;
      }

      showLoader(true);
      try {
        await submitDeveloperRequest(state.user.uid, state.user.username, reason, email);
        showToast("בקשת המפתח נשלחה בהצלחה! מייל עיצוב יישלח אלייך עם החלטת ה-Admin. 📬", "success");
        renderSettings(); // refresh form
      } catch (err) {
        showToast(err.message, "danger");
      } finally {
        showLoader(false);
      }
    });
  }
}

// Apply Neon Color Variables dynamically
function applyTheme(color) {
  state.theme = color;
  const root = document.documentElement;
  root.style.setProperty('--accent-color', color);
  root.style.setProperty('--accent-glow', `${color}66`); // 40% transparency hex
  root.style.setProperty('--accent-dim', `${color}1a`);  // 10% transparency hex
  root.style.setProperty('--border-color', `${color}26`); // 15% transparency hex
}

// Render User Sidebar Avatar badge
function renderUserBadge() {
  const container = document.getElementById('sidebar-user-badge-wrap');
  if (!container) return;

  if (state.user) {
    const firstLetter = state.user.username.charAt(0).toUpperCase();
    container.innerHTML = `
      <div class="user-badge" onclick="window.location.hash='#/settings'" style="cursor: pointer;">
        <div class="user-avatar">${firstLetter}</div>
        <div class="user-info">
          <span class="user-name">${state.user.username}</span>
          <span class="user-role">${state.user.role}</span>
        </div>
      </div>
    `;
  } else {
    container.innerHTML = `
      <button class="btn btn-secondary" onclick="window.location.hash='#/login'" style="width: 100%; justify-content: center; padding: 10px;">
        <i class="fas fa-sign-in-alt"></i> התחבר / הרשם
      </button>
    `;
  }
}

// --- GLOBAL UI HELPERS ---

// Toast notification helper
function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.style.background = 'var(--bg-dark)';
  toast.style.color = '#ffffff';
  toast.style.padding = '12px 20px';
  toast.style.borderRadius = '8px';
  toast.style.fontSize = '14px';
  toast.style.fontWeight = 'bold';
  toast.style.fontFamily = 'var(--font-body)';
  toast.style.boxShadow = '0 5px 15px rgba(0,0,0,0.5)';
  toast.style.transition = 'all 0.3s ease';
  toast.style.transform = 'translateY(20px)';
  toast.style.opacity = '0';
  toast.style.display = 'flex';
  toast.style.alignItems = 'center';
  toast.style.gap = '10px';

  let accent = 'var(--accent-color)';
  let icon = 'fa-check-circle';

  if (type === 'danger') {
    accent = 'var(--danger-color)';
    icon = 'fa-exclamation-triangle';
  } else if (type === 'warning') {
    accent = 'var(--warning-color)';
    icon = 'fa-exclamation-circle';
  } else if (type === 'info') {
    accent = '#0096ff';
    icon = 'fa-info-circle';
  }

  toast.style.borderLeft = `4px solid ${accent}`;
  toast.style.boxShadow = `0 0 10px ${accent}40`;
  
  toast.innerHTML = `<i class="fas ${icon}" style="color: ${accent}"></i> <span>${message}</span>`;
  container.appendChild(toast);

  // Animate in
  setTimeout(() => {
    toast.style.transform = 'translateY(0)';
    toast.style.opacity = '1';
  }, 10);

  // Animate out
  setTimeout(() => {
    toast.style.transform = 'translateY(-20px)';
    toast.style.opacity = '0';
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 4000);
}

// Loader helper
function showLoader(visible) {
  const loader = document.getElementById('app-global-loader');
  if (!loader) return;
  loader.style.display = visible ? 'flex' : 'none';
}

// Bind modal close buttons
document.getElementById('modal-close-btn').addEventListener('click', () => {
  document.getElementById('modal-overlay').classList.remove('active');
  // Stop biometric scanner if active
  const widget = document.getElementById('bio-widget');
  if (widget) widget.classList.remove('scanning');
});

// Settings sidebar item click listener
document.getElementById('settings-nav-btn').addEventListener('click', () => {
  navigateTo('#/settings');
});

// Home sidebar item click listener
document.getElementById('home-nav-btn').addEventListener('click', () => {
  navigateTo('#/');
});

// Developer sidebar nav button click listener
const devNav = document.getElementById('dev-nav-btn');
if (devNav) {
  devNav.addEventListener('click', () => {
    navigateTo('#/dev');
  });
}

// Admin sidebar nav button click listener
const adminNav = document.getElementById('admin-nav-btn');
if (adminNav) {
  adminNav.addEventListener('click', () => {
    navigateTo('#/admin');
  });
}

// --- RESEND EMAIL INBOX SIMULATOR UI ---
function setupInboxWidget() {
  const widget = document.createElement('div');
  widget.className = 'simulated-inbox-widget collapsed';
  widget.id = 'simulated-inbox-widget';
  widget.innerHTML = `
    <div class="inbox-header" id="inbox-header">
      <span class="inbox-title"><i class="fas fa-envelope-open-text"></i> תיבת מיילים (סימולציה)</span>
      <span class="inbox-count" id="inbox-count">0</span>
    </div>
    <div class="inbox-body" id="inbox-body">
      <div style="text-align: center; color: var(--text-dark); font-size: 11px; padding: 20px;">אין מיילים כרגע</div>
    </div>
  `;
  document.body.appendChild(widget);

  const header = document.getElementById('inbox-header');
  header.addEventListener('click', () => {
    widget.classList.toggle('collapsed');
  });
}

function updateSimulatedInboxUI() {
  const count = document.getElementById('inbox-count');
  const body = document.getElementById('inbox-body');
  if (!count || !body) return;

  const emails = state.recentEmails;
  count.textContent = emails.length;

  if (emails.length === 0) {
    body.innerHTML = `<div style="text-align: center; color: var(--text-dark); font-size: 11px; padding: 20px;">אין מיילים כרגע</div>`;
    return;
  }

  body.innerHTML = emails.map(email => `
    <div class="email-item" data-id="${email.id}">
      <div class="email-item-subject">${email.subject}</div>
      <div class="email-item-meta">
        <span>נמען: ${email.to}</span>
        <span>${email.sentAt}</span>
      </div>
    </div>
  `).join('');

  body.querySelectorAll('.email-item').forEach(item => {
    item.addEventListener('click', () => {
      const id = item.getAttribute('data-id');
      const email = emails.find(e => e.id === id);
      if (email) {
        openEmailViewer(email);
      }
    });
  });
}

function openEmailViewer(email) {
  const widget = document.getElementById('simulated-inbox-widget');
  
  const viewer = document.createElement('div');
  viewer.className = 'email-content-view';
  viewer.innerHTML = `
    <div class="email-view-header">
      <a href="#" class="email-view-back" id="email-view-back-btn"><i class="fas fa-arrow-left"></i> חזרה</a>
      <span style="font-size: 11px; color: var(--text-dark);">${email.sentAt}</span>
    </div>
    <div style="font-size: 12px; margin-bottom: 15px; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 8px;">
      <div><strong>אל:</strong> ${email.to}</div>
      <div><strong>נושא:</strong> ${email.subject}</div>
    </div>
    <div style="flex-grow: 1; overflow-y: auto;">
      ${email.html}
    </div>
  `;
  widget.appendChild(viewer);

  document.getElementById('email-view-back-btn').addEventListener('click', (e) => {
    e.preventDefault();
    viewer.remove();
  });
}
