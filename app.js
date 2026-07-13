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
  updateGameDetails,
  recordGamePlay,
  rateGame,
  debugLocalStorageGames,
  removeGameByName,
  clearAllLocalStorage,
  submitGameVersionRequest,
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
  removeWebAuthnCredential,
  checkLoginRateLimit,
  recordLoginAttempt,
  clearLoginAttempts,
  sanitizeInput,
  validatePasswordStrength,
  validateUsername,
  validateEmail,
  sendEmailViaResend,
  isPrivilegedRole,
  getPrivilegedAccountRequirements,
  getFirebaseStatus
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
  recentEmails: [],
  supportActiveThreadId: null
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
    approved: true,
    rating: 4.8,
    ratingCount: 156,
    ratingSum: 748.8
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
    approved: true,
    rating: 4.6,
    ratingCount: 98,
    ratingSum: 450.8
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
    approved: true,
    rating: 4.9,
    ratingCount: 203,
    ratingSum: 994.7
  }
];

// --- RATING HELPERS ---
function getGameRatingInfo(game) {
  const rating = parseFloat(game.rating ?? 5.0);
  const count = game.ratingCount ?? 0;
  return { rating, count, display: rating.toFixed(1) };
}

function renderStarsDisplay(rating, count, sizeClass = '') {
  const num = parseFloat(rating);
  let stars = '';
  for (let i = 1; i <= 5; i++) {
    if (num >= i - 0.25) {
      stars += '<i class="fas fa-star"></i>';
    } else if (num >= i - 0.75) {
      stars += '<i class="fas fa-star-half-alt"></i>';
    } else {
      stars += '<i class="far fa-star"></i>';
    }
  }
  const countHtml = count > 0 ? `<span class="rating-count">(${count})</span>` : '';
  return `<div class="star-rating-display ${sizeClass}">${stars}<span class="rating-value">${num.toFixed(1)}</span>${countHtml}</div>`;
}

function getUserRatingsStore() {
  try {
    return JSON.parse(localStorage.getItem('diggy_game_ratings') || '{}');
  } catch {
    return {};
  }
}

function saveUserRating(gameId, score) {
  const store = getUserRatingsStore();
  const userKey = state.user?.uid || 'guest';
  if (!store[userKey]) store[userKey] = {};
  store[userKey][gameId] = score;
  localStorage.setItem('diggy_game_ratings', JSON.stringify(store));
  
  // Sync to Firebase
  if (state.user?.uid) {
    import('./firebase-service.js').then(mod => {
      if (mod.firebaseLoaded && !mod.fallbackMode) {
        try {
          const ratingsRef = mod.firebaseFirestore.doc(mod.db, "user_ratings", state.user.uid);
          mod.firebaseFirestore.setDoc(ratingsRef, { ratings: store[state.user.uid], updatedAt: new Date().toISOString() }).catch(e => {
            console.warn("Firebase user ratings sync failed:", e);
          });
        } catch (e) {
          console.warn("Firebase user ratings sync failed:", e);
        }
      }
    });
  }
}

function getUserRatingForGame(gameId) {
  const store = getUserRatingsStore();
  const userKey = state.user?.uid || 'guest';
  return store[userKey]?.[gameId] || null;
}

function getSupportThreads() {
  try {
    return JSON.parse(localStorage.getItem('diggy_support_threads') || '[]');
  } catch {
    return [];
  }
}

function getSiteEmailSettings() {
  try {
    return {
      supportEmail: 'diggy-games@outlook.com',
      legalEmail: 'diggy-games@outlook.com',
      notificationEmail: 'diggy-games@outlook.com',
      ...JSON.parse(localStorage.getItem('diggy_email_settings') || '{}')
    };
  } catch {
    return {
      supportEmail: 'diggy-games@outlook.com',
      legalEmail: 'diggy-games@outlook.com',
      notificationEmail: 'diggy-games@outlook.com'
    };
  }
}

function saveSiteEmailSettings(settings) {
  const current = getSiteEmailSettings();
  const merged = { ...current, ...settings };
  localStorage.setItem('diggy_email_settings', JSON.stringify(merged));
  
  // Sync to Firebase
  import('./firebase-service.js').then(mod => {
    if (mod.firebaseLoaded && !mod.fallbackMode) {
      try {
        const configRef = mod.firebaseFirestore.doc(mod.db, "site_config", "email_settings");
        mod.firebaseFirestore.setDoc(configRef, { ...merged, updatedAt: new Date().toISOString() }).catch(e => {
          console.warn("Firebase email settings sync failed:", e);
        });
      } catch (e) {
        console.warn("Firebase email settings sync failed:", e);
      }
    }
  });
  
  return merged;
}

function saveSupportThreads(threads) {
  localStorage.setItem('diggy_support_threads', JSON.stringify(threads));
  
  // Sync to Firebase
  import('./firebase-service.js').then(mod => {
    if (mod.firebaseLoaded && !mod.fallbackMode) {
      try {
        const configRef = mod.firebaseFirestore.doc(mod.db, "site_config", "support_threads");
        mod.firebaseFirestore.setDoc(configRef, { threads, updatedAt: new Date().toISOString() }).catch(e => {
          console.warn("Firebase support threads sync failed:", e);
        });
      } catch (e) {
        console.warn("Firebase support threads sync failed:", e);
      }
    }
  });
}

function createSupportThread({ name, email, subject, message }) {
  const thread = {
    id: 'support_' + Math.random().toString(36).slice(2, 10),
    name,
    email,
    subject,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    messages: [{
      id: 'msg_' + Math.random().toString(36).slice(2, 10),
      sender: 'user',
      author: name,
      text: message,
      createdAt: new Date().toISOString()
    }]
  };

  const threads = getSupportThreads();
  threads.unshift(thread);
  saveSupportThreads(threads);
  return thread;
}

function addSupportReply(threadId, sender, author, message) {
  const threads = getSupportThreads();
  const thread = threads.find(t => t.id === threadId);
  if (!thread) return null;

  thread.messages.push({
    id: 'msg_' + Math.random().toString(36).slice(2, 10),
    sender,
    author,
    text: message,
    createdAt: new Date().toISOString()
  });
  thread.updatedAt = new Date().toISOString();
  saveSupportThreads(threads);
  return thread;
}

function renderAdminSupportChat(selectedThreadId = null) {
  const listEl = document.getElementById('admin-support-thread-list');
  const contentEl = document.getElementById('admin-support-thread-content');
  if (!listEl || !contentEl) return;

  const threads = getSupportThreads().sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));
  const effectiveThreadId = selectedThreadId || state.supportActiveThreadId || threads[0]?.id || null;
  state.supportActiveThreadId = effectiveThreadId;

  if (threads.length === 0) {
    listEl.innerHTML = '<div class="support-chat-empty">No open tickets right now.</div>';
    contentEl.innerHTML = '<div class="support-chat-empty">No ticket selected.</div>';
    return;
  }

  listEl.innerHTML = threads.map(thread => {
    const lastMsg = thread.messages[thread.messages.length - 1];
    const isActive = thread.id === effectiveThreadId;
    return `
      <button class="support-thread-card ${isActive ? 'active' : ''}" data-thread-id="${thread.id}">
        <div class="support-thread-title">${thread.subject}</div>
        <div class="support-thread-meta">${thread.name} · ${thread.email}</div>
        <div class="support-thread-preview">${lastMsg ? lastMsg.text : 'No messages'}</div>
      </button>
    `;
  }).join('');

  listEl.querySelectorAll('.support-thread-card').forEach(btn => {
    btn.addEventListener('click', () => {
      renderAdminSupportChat(btn.getAttribute('data-thread-id'));
    });
  });

  const activeThread = threads.find(thread => thread.id === effectiveThreadId) || threads[0];
  const messagesHtml = activeThread.messages.map(message => `
    <div class="support-message ${message.sender === 'admin' ? 'admin' : ''}">
      <div class="support-message-author">${message.author}</div>
      <div class="support-message-text">${message.text}</div>
      <div class="support-message-time">${new Date(message.createdAt).toLocaleString()}</div>
    </div>
  `).join('');

  contentEl.innerHTML = `
    <div class="support-thread-header">
      <div>
        <div class="support-thread-title">${activeThread.subject}</div>
        <div class="support-thread-meta">${activeThread.name} · ${activeThread.email}</div>
      </div>
      <div class="support-thread-meta">Created: ${new Date(activeThread.createdAt).toLocaleString()}</div>
    </div>
    <div class="support-thread-messages">${messagesHtml}</div>
    <form id="support-reply-form" class="support-reply-form">
      <textarea id="support-reply-input" rows="3" placeholder="Type a reply to the support requester..."></textarea>
      <button class="btn btn-primary" type="submit"><i class="fas fa-paper-plane"></i> Send</button>
    </form>
  `;

  const form = document.getElementById('support-reply-form');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const input = document.getElementById('support-reply-input');
      const message = input.value.trim();
      if (!message) return;

      addSupportReply(activeThread.id, 'admin', state.user?.username || 'Admin', message);
      const customerEmail = activeThread.email;
      const html = `
        <div style="font-family: sans-serif; background: #07080a; color: white; padding: 24px; border-radius: 12px; border: 1px solid #00ff66;">
          <h2 style="color: #00ff66;">New reply from the DIGGY team</h2>
          <p>Hi ${activeThread.name},</p>
          <p>${message}</p>
          <p>For further questions, you can reply directly to this email.</p>
        </div>
      `;
      await sendEmailViaResend(customerEmail, `DIGGY - New support reply`, html);
      showToast('Reply sent to the user!', 'success');
      renderAdminSupportChat(activeThread.id);
    });
  }
}

function setupGameRatingUI(gameId) {
  const container = document.getElementById('game-rating-input');
  const displayEl = document.getElementById('game-rating-display');
  if (!container) return;

  const game = state.games.find(g => g.id === gameId);
  if (!game) return;

  const existingRating = getUserRatingForGame(gameId);
  const { rating, count } = getGameRatingInfo(game);

  if (displayEl) {
    displayEl.innerHTML = renderStarsDisplay(rating, count);
  }

  container.innerHTML = `
    <div class="rating-input-label">Rate this game:</div>
    <div class="star-rating-input" id="star-input-btns">
      ${[1, 2, 3, 4, 5].map(n => `
        <button type="button" class="star-input-btn ${existingRating >= n ? 'selected' : ''}" data-score="${n}" title="${n} stars">
          <i class="${existingRating >= n ? 'fas' : 'far'} fa-star"></i>
        </button>
      `).join('')}
    </div>
    ${existingRating ? `<div class="rating-user-msg">You rated ${existingRating} stars</div>` : ''}
  `;

  container.querySelectorAll('.star-input-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const score = parseInt(btn.getAttribute('data-score'), 10);
      if (getUserRatingForGame(gameId)) {
        showToast('You already rated this game!', 'warning');
        return;
      }

      showLoader(true);
      try {
        const newRating = await rateGame(gameId, score);
        saveUserRating(gameId, score);
        const idx = state.games.findIndex(g => g.id === gameId);
        if (idx !== -1) {
          state.games[idx].rating = newRating;
          state.games[idx].ratingCount = (state.games[idx].ratingCount || 0) + 1;
          state.games[idx].ratingSum = (state.games[idx].ratingSum || 0) + score;
        }
        showToast('Thanks for rating! ⭐', 'success');
        setupGameRatingUI(gameId);
      } catch (err) {
        showToast('Error saving rating', 'danger');
      } finally {
        showLoader(false);
      }
    });

    btn.addEventListener('mouseenter', () => {
      if (getUserRatingForGame(gameId)) return;
      const hoverScore = parseInt(btn.getAttribute('data-score'), 10);
      container.querySelectorAll('.star-input-btn').forEach(b => {
        const s = parseInt(b.getAttribute('data-score'), 10);
        const icon = b.querySelector('i');
        icon.className = s <= hoverScore ? 'fas fa-star' : 'far fa-star';
      });
    });

    btn.addEventListener('mouseleave', () => {
      const current = getUserRatingForGame(gameId);
      container.querySelectorAll('.star-input-btn').forEach(b => {
        const s = parseInt(b.getAttribute('data-score'), 10);
        const icon = b.querySelector('i');
        icon.className = current && s <= current ? 'fas fa-star' : 'far fa-star';
        b.classList.toggle('selected', current && s <= current);
      });
    });
  });
}

// --- SPA ROUTER ---
const routes = {
  '#/': renderHome,
  '#/login': renderLogin,
  '#/dev': renderDev,
  '#/dev-docs': renderDevDocs,
  '#/admin': renderAdmin,
  '#/settings': renderSettings,
  '#/articles': renderArticles,
  '#/sitemap': renderSitemap,
  '#/terms': renderTerms,
  '#/privacy': renderPrivacy,
  '#/contact': renderContact,
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

  if (hash.startsWith('#/articles/')) {
    const slug = hash.split('#/articles/')[1];
    await renderArticleDetail(slug);
    updateActiveSidebarNav('#/articles');
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
  
  // Track system email events without showing the old simulation widget
  window.addEventListener('diggy-email-sent', () => {
    state.recentEmails = state.recentEmails.slice(0, 5);
  });

  setupSidebarNavigation();
  setupFooterNavigation();

  // Listen to Auth state (Firebase or LocalStorage fallback)
  onAuthStateListener(async (user) => {
    if (user) {
      state.user = user;
      applyTheme(user.customTheme || '#00ff66');
      renderUserBadge();
      setupSidebarNavigation(); // Rebuild sidebar when user changes
    } else {
      state.user = null;
      applyTheme('#00ff66');
      renderUserBadge();
      setupSidebarNavigation(); // Rebuild sidebar when user logs out
    }
    
    // Refresh current route to apply auth permissions
    handleRouting();
  });

  // Pull initial games list
  await fetchGames();
});

// Setup sidebar navigation based on user role
function setupSidebarNavigation() {
  const navMenu = document.getElementById('sidebar-nav-menu');
  if (!navMenu) return;

  let navItems = `
    <div class="nav-item" id="home-nav-btn" data-route="#/">
      <i class="fas fa-home"></i>
      <span>Home</span>
    </div>
    <div class="nav-item" id="articles-nav-btn" data-route="#/articles">
      <i class="fas fa-newspaper"></i>
      <span>Articles & News</span>
    </div>
  `;

  // Add category navigation
  navItems += `
    <div class="nav-section-title">Categories</div>
    <div class="nav-item" data-category="ALL">
      <i class="fas fa-th-large"></i>
      <span>All</span>
    </div>
    <div class="nav-item" data-category="RPG">
      <i class="fas fa-dragon"></i>
      <span>RPG</span>
    </div>
    <div class="nav-item" data-category="RETRO">
      <i class="fas fa-gamepad"></i>
      <span>RETRO</span>
    </div>
    <div class="nav-item" data-category="MULTIPLAYER">
      <i class="fas fa-users"></i>
      <span>MULTIPLAYER</span>
    </div>
    <div class="nav-item" data-category="ACTION">
      <i class="fas fa-bolt"></i>
      <span>ACTION</span>
    </div>
    <div class="nav-item" data-category="PUZZLE">
      <i class="fas fa-puzzle-piece"></i>
      <span>PUZZLE</span>
    </div>
    <div class="nav-item" data-category="ADVENTURE">
      <i class="fas fa-compass"></i>
      <span>ADVENTURE</span>
    </div>
    <div class="nav-item" data-category="SPORTS">
      <i class="fas fa-futbol"></i>
      <span>SPORTS</span>
    </div>
  `;

  // Add role-specific navigation
  if (state.user) {
    if (state.user.role === 'developer' || state.user.role === 'admin') {
      navItems += `
        <div class="nav-section-title">Development</div>
        <div class="nav-item" id="dev-nav-btn" data-route="#/dev">
          <i class="fas fa-code"></i>
          <span>Developer Panel</span>
        </div>
        <div class="nav-item" id="dev-docs-btn" data-route="#/dev-docs">
          <i class="fas fa-book"></i>
          <span>Developer Guide</span>
        </div>
      `;
    }

    if (state.user.role === 'admin') {
      navItems += `
        <div class="nav-item" id="admin-nav-btn" data-route="#/admin">
          <i class="fas fa-shield-alt"></i>
          <span>System Admin</span>
        </div>
      `;
    }
  }

  navMenu.innerHTML = navItems;

  // Bind click events
  document.getElementById('home-nav-btn').addEventListener('click', () => {
    navigateTo('#/');
  });

  const articlesNav = document.getElementById('articles-nav-btn');
  if (articlesNav) {
    articlesNav.addEventListener('click', () => {
      navigateTo('#/articles');
    });
  }

  // Category filters
  navMenu.querySelectorAll('[data-category]').forEach(item => {
    item.addEventListener('click', () => {
      const category = item.getAttribute('data-category');
      navigateTo('#/');
      // Wait for home to render, then filter
      setTimeout(() => {
        renderGamesGrid(category);
        // Update active state on main content tabs
        const mainTabs = document.querySelectorAll('.category-tabs button');
        mainTabs.forEach(tab => {
          if (tab.getAttribute('data-category') === category) {
            tab.classList.add('active-cat');
            tab.style.borderColor = 'var(--accent-color)';
            tab.style.background = 'var(--accent-dim)';
          } else {
            tab.classList.remove('active-cat');
            tab.style.borderColor = 'rgba(255, 255, 255, 0.05)';
            tab.style.background = 'transparent';
          }
        });
      }, 150);
    });
  });

  // Role-specific navigation
  const devNav = document.getElementById('dev-nav-btn');
  if (devNav) {
    devNav.addEventListener('click', () => {
      navigateTo('#/dev');
    });
  }

  const devDocsNav = document.getElementById('dev-docs-btn');
  if (devDocsNav) {
    devDocsNav.addEventListener('click', () => {
      navigateTo('#/dev-docs');
    });
  }

  const adminNav = document.getElementById('admin-nav-btn');
  if (adminNav) {
    adminNav.addEventListener('click', () => {
      navigateTo('#/admin');
    });
  }
}

function setupFooterNavigation() {
  const footerLinks = {
    'footer-sitemap-btn': '#/sitemap',
    'footer-terms-btn': '#/terms',
    'footer-privacy-btn': '#/privacy',
    'footer-contact-btn': '#/contact',
    'footer-rights-btn': '#/contact',
    'footer-articles-btn': '#/articles'
  };

  Object.entries(footerLinks).forEach(([id, route]) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('click', (e) => {
      e.preventDefault();
      navigateTo(route);
    });
  });
}

function ensureContentPageStyles() {
  if (!document.getElementById('content-page-inline-styles')) {
    const styleTag = document.createElement('style');
    styleTag.id = 'content-page-inline-styles';
    styleTag.textContent = `
      .doc-article-title {
        font-size: 24px;
        color: var(--accent-color);
        margin-bottom: 20px;
        font-family: var(--font-display);
        display: flex;
        align-items: center;
        gap: 12px;
        border-bottom: 1px solid rgba(255,255,255,0.08);
        padding-bottom: 15px;
      }
      .doc-section { margin-bottom: 25px; }
      .doc-section h3 {
        font-size: 18px;
        color: #fff;
        margin-bottom: 10px;
        font-family: var(--font-display);
      }
      .doc-section p {
        color: var(--text-muted);
        font-size: 14.5px;
        margin-bottom: 12px;
        line-height: 1.6;
      }
      .doc-section ul {
        margin-right: 20px;
        margin-bottom: 15px;
        color: var(--text-muted);
        font-size: 14px;
        list-style-type: square;
      }
      .doc-section li { margin-bottom: 8px; }
      .doc-badge {
        background: var(--accent-dim);
        color: var(--accent-color);
        padding: 3px 8px;
        border-radius: 4px;
        font-size: 11px;
        font-weight: bold;
        margin-right: 5px;
      }
      .article-card {
        background: var(--bg-card);
        border: 1px solid rgba(255,255,255,0.05);
        border-radius: 12px;
        padding: 20px;
        transition: var(--transition-smooth);
        cursor: pointer;
      }
      .article-card:hover {
        border-color: var(--accent-color);
        transform: translateY(-4px);
        box-shadow: 0 8px 25px rgba(0,255,102,0.1);
      }
      .article-card-date {
        font-size: 12px;
        color: var(--text-muted);
        margin-bottom: 8px;
      }
      .article-card-title {
        font-size: 18px;
        color: #fff;
        margin-bottom: 10px;
        font-family: var(--font-display);
      }
      .article-card-excerpt {
        font-size: 13px;
        color: var(--text-muted);
        line-height: 1.5;
      }
      .legal-page-content {
        background: var(--bg-card);
        border: 1px solid rgba(255,255,255,0.05);
        border-radius: 16px;
        padding: 30px;
        box-shadow: var(--border-glow);
      }
      .sitemap-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
        gap: 20px;
        margin-top: 20px;
      }
      .sitemap-group h3 {
        font-size: 16px;
        color: var(--accent-color);
        margin-bottom: 12px;
        font-family: var(--font-display);
      }
      .sitemap-group ul { list-style: none; margin: 0; padding: 0; }
      .sitemap-group li { margin-bottom: 8px; }
      .sitemap-group a {
        color: var(--text-muted);
        text-decoration: none;
        font-size: 14px;
        transition: color 0.3s;
      }
      .sitemap-group a:hover { color: var(--accent-color); }
    `;
    document.head.appendChild(styleTag);
  }
}

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
        <h1>DIGGY Game Hall</h1>
        <p style="color: var(--text-muted); margin-top: 5px;">The top games spot for kids and developers</p>
      </div>
      <div class="header-actions" id="header-auth-actions"></div>
    </div>

    <!-- Promo Carousel Banner -->
    <div class="promo-slider" id="promo-slider"></div>

    <!-- Categories Tab Filter -->
    <div class="section-title">
      <span>Game Categories</span>
      <div class="category-tabs" style="display: flex; gap: 10px; flex-wrap: wrap;">
        <button class="btn btn-secondary active-cat" data-category="ALL" style="padding: 6px 14px; font-size: 11px;">All</button>
        <button class="btn btn-secondary" data-category="RPG" style="padding: 6px 14px; font-size: 11px;">RPG</button>
        <button class="btn btn-secondary" data-category="RETRO" style="padding: 6px 14px; font-size: 11px;">RETRO</button>
        <button class="btn btn-secondary" data-category="MULTIPLAYER" style="padding: 6px 14px; font-size: 11px;">MULTIPLAYER</button>
        <button class="btn btn-secondary" data-category="ACTION" style="padding: 6px 14px; font-size: 11px;">ACTION</button>
        <button class="btn btn-secondary" data-category="PUZZLE" style="padding: 6px 14px; font-size: 11px;">PUZZLE</button>
        <button class="btn btn-secondary" data-category="ADVENTURE" style="padding: 6px 14px; font-size: 11px;">ADVENTURE</button>
        <button class="btn btn-secondary" data-category="SPORTS" style="padding: 6px 14px; font-size: 11px;">SPORTS</button>
      </div>
    </div>

    <!-- Active Games List -->
    <div class="games-grid" id="home-games-grid"></div>

    <!-- Recently Played Section -->
    <div id="recent-played-section" style="display: none;">
      <div class="section-title">Recently Played Games</div>
      <div class="games-grid" id="recent-games-grid"></div>
    </div>

    <!-- Favorite Games Section -->
    <div id="favorites-section" style="display: none;">
      <div class="section-title">Games You Loved (❤️)</div>
      <div class="games-grid" id="favorite-games-grid"></div>
    </div>
  `;

  renderHeaderActions();
  setupPromoCarousel();
  
  // Show Firebase connection status
  const fbStatus = getFirebaseStatus();
  if (!fbStatus.connected) {
    const statusDiv = document.createElement('div');
    statusDiv.style.cssText = 'background: rgba(255, 165, 0, 0.1); border: 1px solid orange; border-radius: 8px; padding: 10px 15px; margin-bottom: 20px; font-size: 13px; color: orange;';
    statusDiv.innerHTML = `<i class="fas fa-exclamation-triangle"></i> <strong>Warning:</strong> ${fbStatus.message}`;
    main.insertBefore(statusDiv, main.querySelector('.promo-slider'));
  }
  
  renderGamesGrid('ALL');
  renderRecentlyPlayedAndFavorites();

  // Category tab filter listeners
  const tabs = main.querySelectorAll('.category-tabs button');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => {
        t.classList.remove('active-cat');
        t.style.borderColor = 'rgba(255, 255, 255, 0.05)';
        t.style.background = 'transparent';
      });
      tab.classList.add('active-cat');
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
        <span style="color: var(--text-muted); font-size: 14px;">Hi, <strong>${state.user.username}</strong>!</span>
        <button class="btn btn-secondary" id="logout-btn"><i class="fas fa-sign-out-alt"></i> Log Out</button>
      </div>
    `;
    document.getElementById('logout-btn').addEventListener('click', async () => {
      await logOutUser();
      navigateTo('#/login');
    });
  } else {
    container.innerHTML = `
      <button class="btn btn-primary" onclick="window.location.hash='#/login'"><i class="fas fa-sign-in-alt"></i> Log In / Sign Up</button>
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
        <span class="slide-tag">Featured Game!</span>
        <h2 class="slide-title">${game.name}</h2>
        <p class="slide-desc">${game.description}</p>
        <button class="btn btn-primary play-now-promo" data-id="${game.id}"><i class="fas fa-play"></i> Play Now</button>
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

  console.log("renderGamesGrid called with category:", categoryFilter);
  console.log("Total games:", state.games.length);
  console.log("Games with categories:", state.games.filter(g => g.categories && g.categories.length > 0).length);

  const filtered = categoryFilter === 'ALL' 
    ? state.games 
    : state.games.filter(g => g.categories && g.categories.includes(categoryFilter));

  console.log("Filtered games count:", filtered.length);
  console.log("Filtered games:", filtered.map(g => ({ name: g.name, categories: g.categories })));

  if (filtered.length === 0) {
    grid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 40px 0;">No games in this category right now.</div>`;
    return;
  }

  grid.innerHTML = filtered.map(game => createGameCardMarkup(game)).join('');
  bindGameCardEvents(grid);
}

function createGameCardMarkup(game) {
  const isFav = state.user && state.user.favorites && state.user.favorites.includes(game.id);
  const heartClass = isFav ? 'active' : '';
  const heartIcon = isFav ? 'fas fa-heart' : 'far fa-heart';
  const { rating, count } = getGameRatingInfo(game);

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
          <i class="fas fa-code-branch"></i> Developer: ${game.developerName}
        </div>
        ${renderStarsDisplay(rating, count, 'card-size')}
        <p class="game-card-desc">${game.description}</p>
        <div class="game-card-tags">
          ${game.categories.map(c => `<span class="game-tag">${c}</span>`).join('')}
        </div>
        <button class="btn btn-secondary play-game-btn" data-id="${game.id}" style="width: 100%; justify-content: center; padding: 8px;">
          <i class="fas fa-play"></i> Play
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
        showToast("Please log in to save favorite games!", "warning");
        navigateTo('#/login');
        return;
      }
      const id = btn.getAttribute('data-id');
      let favs = [...(state.user.favorites || [])];
      
      if (favs.includes(id)) {
        favs = favs.filter(fId => fId !== id);
        btn.classList.remove('active');
        btn.querySelector('i').className = 'far fa-heart';
        showToast("Removed from favorites", "info");
      } else {
        favs.push(id);
        btn.classList.add('active');
        btn.querySelector('i').className = 'fas fa-heart';
        showToast("Added to favorites! ❤️", "success");
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
          <h2 class="modal-title" id="auth-panel-title">Log In to DIGGY</h2>
        </div>
        <div class="modal-body" id="auth-panel-body">
          <form id="login-form">
            <div class="form-group">
              <label>Username (6-12 characters)</label>
              <input type="text" id="auth-username" required placeholder="Enter username">
            </div>
            <div class="form-group">
              <label>Password (6-12 characters)</label>
              <input type="password" id="auth-password" required placeholder="Enter password">
            </div>
            <button type="submit" class="btn btn-primary" style="width: 100%; justify-content: center; margin-top: 10px;">
              <i class="fas fa-rocket"></i> Log In
            </button>
          </form>

          <div style="margin: 20px 0; text-align: center; color: var(--text-muted); font-size: 13px;">
            Or log in with:
          </div>

          <button class="btn btn-secondary" id="auth-biometric-btn" style="width: 100%; justify-content: center; margin-bottom: 20px;">
            <i class="fas fa-fingerprint" style="color: var(--accent-color);"></i> Quick Biometric Login
          </button>

          <div style="border-top: 1px solid rgba(255,255,255,0.05); padding-top: 15px; text-align: center; font-size: 14px;">
            <span style="color: var(--text-muted);">New here?</span>
            <a href="#" id="toggle-auth-mode" style="color: var(--accent-color); font-weight: bold; margin-right: 5px;">Create a new account</a>
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
      panelTitle.textContent = "Register a new DIGGY account";
      form.querySelector('button[type="submit"]').innerHTML = `<i class="fas fa-user-plus"></i> Create Account`;
      toggleLink.textContent = "Log in to an existing account";
      bioBtn.style.display = 'none';
    } else {
      panelTitle.textContent = "Log In to DIGGY";
      form.querySelector('button[type="submit"]').innerHTML = `<i class="fas fa-rocket"></i> Log In`;
      toggleLink.textContent = "Create a new account";
      bioBtn.style.display = 'flex';
    }
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = sanitizeInput(document.getElementById('auth-username').value);
    const password = document.getElementById('auth-password').value;

    // Validate username
    const usernameValidation = validateUsername(username);
    if (!usernameValidation.valid) {
      showToast(usernameValidation.errors[0], "danger");
      return;
    }

    // Validate password strength
    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.valid) {
      showToast(passwordValidation.errors[0], "danger");
      return;
    }

    // Check rate limiting for login
    if (!isRegisterMode) {
      const rateLimit = checkLoginRateLimit(username);
      if (!rateLimit.allowed) {
        showToast(`Too many login attempts. Try again in ${rateLimit.remainingTime} minutes.`, "danger");
        return;
      }
    }

    showLoader(true);
    try {
      if (isRegisterMode) {
        // Sign Up
        const userProfile = await signUpUser(username, password);
        showToast("Account created successfully! Welcome to DIGGY 🎉", "success");
        navigateTo('#/');
      } else {
        // Sign In
        recordLoginAttempt(username);
        const profile = await logInUser(username, password);
        
        // Clear login attempts on successful login
        clearLoginAttempts(username);
        
        const requirementStatus = getPrivilegedAccountRequirements(profile);
        if (requirementStatus.required && !requirementStatus.complete) {
          showLoader(false);
          showToast("Before logging in you must complete security settings: two-factor authentication and a support email.", "danger");
          navigateTo('#/settings');
          return;
        }

        // Check 2FA2
        if (profile.twoFactorEnabled) {
          showLoader(false);
          trigger2FAFlow(profile);
          return;
        }

        showToast("Logged in successfully! 🎮", "success");
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
      <p>Hi ${profile.username}, we received a login request for your account.</p>
      <div style="font-size: 32px; font-weight: bold; background: rgba(0,255,102,0.1); border: 1px dashed #00ff66; padding: 15px; margin: 20px auto; letter-spacing: 5px; width: 200px; border-radius: 6px;">
        ${code}
      </div>
      <p style="color: #888;">This code is valid for the next 5 minutes. Please don't share this code with anyone.</p>
    </div>
  `;
  
  import('./firebase-service.js').then(async (mod) => {
    const destEmail = profile.twoFactorEmail || profile.email || 'diggy-games@outlook.com';
    await mod.sendEmailViaResend(destEmail, "DIGGY - Two-factor verification code", emailHtml);

    // Show 2FA input modal
    const overlay = document.getElementById('modal-overlay');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');

    modalTitle.textContent = "Two-Factor Verification (2FA)";
    modalBody.innerHTML = `
      <div style="text-align: center; display: flex; flex-direction: column; gap: 15px;">
        <p>A verification code was sent to your email: <strong style="color: var(--accent-color);">${destEmail}</strong></p>
        <p style="font-size: 13px; color: var(--text-muted);">Enter the 6 digits to complete login:</p>
        <input type="text" id="twofactor-input" max-length="6" placeholder="000000" style="text-align: center; font-size: 24px; letter-spacing: 8px; font-family: var(--font-display); width: 200px; margin: 10px auto;">
        <button class="btn btn-primary" id="verify-2fa-btn" style="justify-content: center;">Verify Code & Log In</button>
        <button class="btn btn-secondary" id="resend-2fa-btn" style="justify-content: center; font-size: 12px;">Send New Code</button>
      </div>
    `;
    
    overlay.classList.add('active');
    
    document.getElementById('verify-2fa-btn').addEventListener('click', () => {
      const enteredCode = document.getElementById('twofactor-input').value.trim();
      const verification = verify2FACode(profile.uid, enteredCode);
      
      if (verification.valid) {
        overlay.classList.remove('active');
        showToast("Code verified! Welcome to DIGGY 🎉", "success");
        navigateTo('#/');
      } else {
        showToast(verification.error, "danger");
        if (verification.error.includes('Exceeded')) {
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
      mod.sendEmailViaResend(destEmail, "DIGGY - Two-factor verification code (new)", newEmailHtml);
      showToast("New code sent to your email!", "info");
    });
  });
}

// Biometric Quick Login flow
async function triggerBiometricLoginFlow() {
  const overlay = document.getElementById('modal-overlay');
  const modalTitle = document.getElementById('modal-title');
  const modalBody = document.getElementById('modal-body');

  modalTitle.textContent = "Biometric Fingerprint Scanner";
  modalBody.innerHTML = `
    <div class="bio-scanner-container">
      <div class="fingerprint-widget scanning" id="bio-widget">
        <i class="fas fa-fingerprint fingerprint-icon"></i>
        <div class="scanner-laser"></div>
      </div>
      <div id="bio-status" style="font-weight: bold; color: var(--accent-color); text-transform: uppercase; font-family: var(--font-display);">Scanning... please place your finger</div>
      <p style="font-size: 13px; color: var(--text-muted); max-width: 300px;">
        Logging in using your device's biometric security key (WebAuthn).
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
      statusText.innerHTML = "Error: Biometric login not set up!";
      statusText.style.color = 'var(--danger-color)';

      setTimeout(() => {
        overlay.classList.remove('active');
        showToast("Biometric login isn't set up for this account! Log in normally and enable it in settings.", "warning");
      }, 1500);
      return;
    }

    try {
      // Use real WebAuthn verification
      const result = await verifyWebAuthnCredential(username, uid);
      
      if (result.success) {
        widget.classList.remove('scanning');
        widget.style.color = '#00ff66';
        statusText.innerHTML = "Scan complete! Approved";

        setTimeout(async () => {
          overlay.classList.remove('active');
          // Log in with biometric token
          const profile = await logInUser(username, "auth_biometric_token");
          showToast(`Welcome back, ${username}!`, "success");
          navigateTo('#/');
        }, 1000);
      }
    } catch (e) {
      console.warn("WebAuthn verification failed:", e);
      widget.classList.remove('scanning');
      widget.style.color = 'var(--danger-color)';
      statusText.innerHTML = "Scan failed";
      statusText.style.color = 'var(--danger-color)';

      setTimeout(() => {
        overlay.classList.remove('active');
        showToast("Error during biometric login: " + e.message, "danger");
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
        <h2>Access Blocked!</h2>
        <p style="color: var(--text-muted); margin-top: 10px;">This page is for authorized developers only. If you'd like to upload games, submit a request in settings.</p>
        <button class="btn btn-primary" onclick="window.location.hash='#/'" style="margin-top: 20px;">Back to Home</button>
      </div>
    `;
    return;
  }

  main.innerHTML = `
    <div class="top-header">
      <div class="page-title-wrap">
        <h1>Developer Dashboard</h1>
        <p style="color: var(--text-muted); margin-top: 5px;">Manage your games and submit upload requests to the site</p>
      </div>
      <button class="btn btn-primary" id="dev-submit-game-btn"><i class="fas fa-plus"></i> Submit New Game</button>
    </div>

    <div class="section-title">Your Games and Requests</div>
    <div class="data-table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>Logo</th>
            <th>Game Name</th>
            <th>Categories</th>
            <th>GITHUB Link</th>
            <th>Status</th>
            <th>ADMIN Notes</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody id="dev-games-list-body">
          <tr>
            <td colspan="7" style="text-align: center; color: var(--text-muted); padding: 30px;">Loading data...</td>
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
            You haven't submitted any games yet. Click "Submit New Game" to get started!
          </td>
        </tr>
      `;
    } else {
      body.innerHTML = requests.map(req => {
        let statusBadge = '';
        if (req.status === 'pending') statusBadge = '<span class="badge badge-pending">Pending Review</span>';
        else if (req.status === 'approved') statusBadge = '<span class="badge badge-approved">Approved</span>';
        else if (req.status === 'rejected') statusBadge = '<span class="badge badge-rejected">Rejected</span>';
        else if (req.status === 'improvement') statusBadge = '<span class="badge badge-improvement">Needs Improvement</span>';

        const actionBtn = req.status === 'improvement'
          ? `<button class="btn btn-secondary resubmit-btn" data-id="${req.id}" style="padding: 4px 10px; font-size: 11px;"><i class="fas fa-edit"></i> Edit & Resubmit</button>`
          : (req.status === 'approved'
              ? `<div style="display: flex; gap: 6px;">
                  <button class="btn btn-secondary view-stats-btn" data-id="${req.id}" style="padding: 4px 8px; font-size: 11px; background: rgba(0, 255, 102, 0.05); color: var(--accent-color); border-color: rgba(0,255,102,0.2);"><i class="fas fa-chart-line"></i> Stats</button>
                  <button class="btn btn-primary new-version-btn" data-id="${req.id}" style="padding: 4px 8px; font-size: 11px;"><i class="fas fa-code-branch"></i> New Version</button>
                 </div>`
              : '<span style="color: var(--text-dark); font-size: 12px;">No actions</span>');

        return `
          <tr data-raw='${JSON.stringify(req)}'>
            <td><img src="${req.logoUrl || ''}" onerror="this.src='https://placehold.co/40x40/12161e/00ff66?text=G'" style="width: 40px; height: 40px; border-radius: 6px; object-fit: cover;"></td>
            <td style="font-weight: bold; color: var(--accent-color);">${req.name}</td>
            <td>${req.categories ? req.categories.join(', ') : ''}</td>
            <td><a href="${req.githubUrl}" target="_blank" style="color: #0096ff; text-decoration: underline; font-size: 12px;">Repo Code</a></td>
            <td>${statusBadge}</td>
            <td style="max-width: 200px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${req.adminSuggestions || ''}">${req.adminSuggestions || '<span style="color: var(--text-dark);">None</span>'}</td>
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

      body.querySelectorAll('.view-stats-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const row = btn.closest('tr');
          const data = JSON.parse(row.getAttribute('data-raw'));
          openGameStatsModal(data);
        });
      });

      body.querySelectorAll('.new-version-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const row = btn.closest('tr');
          const data = JSON.parse(row.getAttribute('data-raw'));
          openNewVersionModal(data);
        });
      });
    }
  } catch (err) {
    showToast("Error loading developer games: " + err.message, "danger");
  }

  document.getElementById('dev-submit-game-btn').addEventListener('click', () => {
    openGameSubmitModal();
  });
}

function openGameSubmitModal(editData = null) {
  const overlay = document.getElementById('modal-overlay');
  const modalTitle = document.getElementById('modal-title');
  const modalBody = document.getElementById('modal-body');

  modalTitle.textContent = editData ? `Edit & Resubmit Game: ${editData.name}` : "Submit New Game to DIGGY";

  modalBody.innerHTML = `
    <form id="game-submit-form">
      <div class="form-group">
        <label>Game Name</label>
        <input type="text" id="game-name" value="${editData ? editData.name : ''}" required placeholder="e.g. Retro King">
      </div>
      <div class="form-group">
        <label>Short Description</label>
        <textarea id="game-desc" required placeholder="A short explanation of the game..." rows="2">${editData ? editData.description : ''}</textarea>
      </div>
      <div class="form-group">
        <label>Logo Image Link (URL)</label>
        <input type="url" id="game-logo" value="${editData ? editData.logoUrl : ''}" required placeholder="https://example.com/logo.png">
      </div>
      <div class="form-group">
        <label>GitHub Repo Link (game code)</label>
        <input type="url" id="game-github" value="${editData ? editData.githubUrl : ''}" required placeholder="https://github.com/user/repo" ${editData && editData.status === 'rejected' ? 'disabled' : ''}>
      </div>
      <div class="form-group">
        <label>Playable Game Link (Playable URL / GitHub Pages / iframe)</label>
        <input type="url" id="game-url" value="${editData ? (editData.gameUrl || '') : ''}" required placeholder="https://username.github.io/my-game/">
      </div>
      <div class="form-group">
        <label>How to Play (short guide)</label>
        <textarea id="game-how" required placeholder="e.g. Press arrows to move, space to shoot..." rows="2">${editData ? editData.howToPlay : ''}</textarea>
      </div>
      <div class="form-group">
        <label>Who the game is for (target audience)</label>
        <input type="text" id="game-audience" value="${editData ? editData.targetAudience : ''}" required placeholder="e.g. Kids age 8 and up">
      </div>
      <div class="form-group">
        <label>Categories (select up to 3)</label>
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
          <label class="category-checkbox-label">
            <input type="checkbox" name="game-cats" value="ACTION" ${editData && editData.categories.includes('ACTION') ? 'checked' : ''}> ACTION
          </label>
          <label class="category-checkbox-label">
            <input type="checkbox" name="game-cats" value="PUZZLE" ${editData && editData.categories.includes('PUZZLE') ? 'checked' : ''}> PUZZLE
          </label>
          <label class="category-checkbox-label">
            <input type="checkbox" name="game-cats" value="ADVENTURE" ${editData && editData.categories.includes('ADVENTURE') ? 'checked' : ''}> ADVENTURE
          </label>
          <label class="category-checkbox-label">
            <input type="checkbox" name="game-cats" value="SPORTS" ${editData && editData.categories.includes('SPORTS') ? 'checked' : ''}> SPORTS
          </label>
        </div>
      </div>
      <button type="submit" class="btn btn-primary" style="width: 100%; justify-content: center; margin-top: 15px;">
        <i class="fas fa-paper-plane"></i> ${editData ? 'Resend Update' : 'Submit Request for ADMIN Approval'}
      </button>
    </form>
  `;

  overlay.classList.add('active');

  const form = document.getElementById('game-submit-form');
  const gameCatBoxes = form.querySelectorAll('input[name="game-cats"]');
  gameCatBoxes.forEach(box => {
    box.addEventListener('change', () => {
      const checkedCount = form.querySelectorAll('input[name="game-cats"]:checked').length;
      gameCatBoxes.forEach(b => { if (!b.checked) b.disabled = checkedCount >= 3; });
    });
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const checkedBoxes = form.querySelectorAll('input[name="game-cats"]:checked');
    if (checkedBoxes.length === 0) {
      showToast("You must select at least one category (maximum 3)!", "warning");
      return;
    }
    if (checkedBoxes.length > 3) {
      showToast("You can select up to 3 categories only!", "warning");
      return;
    }

    const categories = Array.from(checkedBoxes).map(cb => cb.value);

    const gameData = {
      name: document.getElementById('game-name').value,
      description: document.getElementById('game-desc').value,
      logoUrl: document.getElementById('game-logo').value,
      githubUrl: document.getElementById('game-github').value,
      gameUrl: document.getElementById('game-url').value,
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
        showToast("Game request updated and resubmitted for approval! 🚀", "success");
      } else {
        // New game request
        await submitGameRequest(gameData);
        showToast("Game submitted for Admin approval! You'll receive an email update. 📧", "success");
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

function openGameStatsModal(req) {
  const overlay = document.getElementById('modal-overlay');
  const modalTitle = document.getElementById('modal-title');
  const modalBody = document.getElementById('modal-body');

  modalTitle.textContent = `Game Stats: ${req.name}`;
  
  const game = state.games.find(g => g.githubUrl === req.githubUrl || g.id === req.gameId);
  const plays = game ? (game.plays || 0) : 0;
  
  let seed = 0;
  for (let i = 0; i < req.id.length; i++) seed += req.id.charCodeAt(i);
  const ratingInfo = game ? getGameRatingInfo(game) : { display: (4.5 + (seed % 6) * 0.1).toFixed(1), count: 0 };
  const rating = ratingInfo.display;
  
  const avgTime = (1.5 + (plays ? (plays % 3) * 0.4 : 0.8)).toFixed(1);
  const earnings = (plays * 0.15).toFixed(2);

  modalBody.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 20px; padding: 10px 0;">
      <div style="display: flex; align-items: center; gap: 15px; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 15px;">
        <img src="${req.logoUrl}" onerror="this.src='https://placehold.co/80x80/12161e/00ff66?text=G'" style="width: 70px; height: 70px; border-radius: 10px; object-fit: cover; border: 2px solid var(--accent-color); box-shadow: var(--border-glow);">
        <div>
          <h3 style="font-size: 20px; color: #fff; font-family: var(--font-display);">${req.name}</h3>
          <span class="doc-badge">${req.categories ? req.categories.join(', ') : ''}</span>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
        <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 12px; padding: 15px; text-align: center; box-shadow: var(--border-glow);">
          <i class="fas fa-play" style="font-size: 24px; color: var(--accent-color); margin-bottom: 8px;"></i>
          <div style="font-size: 12px; color: var(--text-muted); text-transform: uppercase;">Play Count (Plays)</div>
          <div style="font-size: 28px; font-weight: bold; color: var(--accent-color); margin-top: 5px; font-family: var(--font-display);">${plays}</div>
        </div>

        <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 12px; padding: 15px; text-align: center; box-shadow: var(--border-glow);">
          <i class="fas fa-star" style="font-size: 24px; color: #ffd700; margin-bottom: 8px;"></i>
          <div style="font-size: 12px; color: var(--text-muted); text-transform: uppercase;">Player Rating</div>
          <div style="font-size: 28px; font-weight: bold; color: #fff; margin-top: 5px; font-family: var(--font-display);">${rating} <span style="font-size: 14px; color: var(--text-muted);">/ 5.0</span></div>
        </div>

        <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 12px; padding: 15px; text-align: center; box-shadow: var(--border-glow);">
          <i class="fas fa-hourglass-half" style="font-size: 24px; color: #70d6ff; margin-bottom: 8px;"></i>
          <div style="font-size: 12px; color: var(--text-muted); text-transform: uppercase;">Average Play Time</div>
          <div style="font-size: 22px; font-weight: bold; color: #fff; margin-top: 10px; font-family: var(--font-display);">${avgTime} min</div>
        </div>

        <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 12px; padding: 15px; text-align: center; box-shadow: var(--border-glow);">
          <i class="fas fa-coins" style="font-size: 24px; color: #00ff66; margin-bottom: 8px;"></i>
          <div style="font-size: 12px; color: var(--text-muted); text-transform: uppercase;">Earnings Accrued</div>
          <div style="font-size: 22px; font-weight: bold; color: #00ff66; margin-top: 10px; font-family: var(--font-display);">${earnings} ₪</div>
        </div>
      </div>

      <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 12px; padding: 15px; font-size: 13px; line-height: 1.5; color: var(--text-muted);">
        <i class="fas fa-circle-info" style="color: var(--accent-color); margin-left: 5px;"></i>
        Earnings are calculated using a reward rate of ₪0.15 per active play by a registered player on the site. Payments are transferred at the end of each calendar month.
      </div>
    </div>
  `;

  overlay.classList.add('active');
}

function openNewVersionModal(req) {
  const overlay = document.getElementById('modal-overlay');
  const modalTitle = document.getElementById('modal-title');
  const modalBody = document.getElementById('modal-body');

  modalTitle.textContent = `Submit New Version: ${req.name}`;

  modalBody.innerHTML = `
    <form id="game-version-form">
      <div style="background: rgba(255, 255, 255, 0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 8px; padding: 12px; margin-bottom: 15px; font-size: 13px; color: var(--text-muted);">
        <i class="fas fa-info-circle" style="color: var(--accent-color); margin-left: 5px;"></i>
        You are now submitting a version update for an active game. This request will be reviewed by the system Admin and updated on the site after approval.
      </div>

      <div class="form-group">
        <label>Game Name (cannot be changed)</label>
        <input type="text" id="version-game-name" value="${req.name}" disabled style="background: rgba(255,255,255,0.02); color: var(--text-muted); cursor: not-allowed;">
      </div>

      <div class="form-group">
        <label>New Version Number (e.g. v1.1.0, v2.0)</label>
        <input type="text" id="version-number" required placeholder="v1.1.0">
      </div>

      <div class="form-group">
        <label>What's new in this version? (Changelog)</label>
        <textarea id="version-changelog" required placeholder="Detail the list of changes, bug fixes, and improvements in this version..." rows="4"></textarea>
      </div>

      <div class="form-group">
        <label>Updated Playable Game Link (Playable URL)</label>
        <input type="url" id="version-url" value="${req.gameUrl || ''}" required placeholder="https://username.github.io/my-game/">
      </div>

      <div class="form-group">
        <label>Updated GitHub Repo Link (game code)</label>
        <input type="url" id="version-github" value="${req.githubUrl || ''}" required placeholder="https://github.com/user/repo">
      </div>

      <button type="submit" class="btn btn-primary" style="width: 100%; justify-content: center; margin-top: 15px;">
        <i class="fas fa-paper-plane"></i> Submit New Version for Approval
      </button>
    </form>
  `;

  overlay.classList.add('active');

  const form = document.getElementById('game-version-form');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const versionData = {
      version: document.getElementById('version-number').value.trim(),
      changelog: document.getElementById('version-changelog').value.trim(),
      gameUrl: document.getElementById('version-url').value.trim(),
      githubUrl: document.getElementById('version-github').value.trim(),
      developerUid: state.user.uid,
      developerName: state.user.username,
      name: req.name,
      logoUrl: req.logoUrl,
      description: req.description
    };

    showLoader(true);
    try {
      await submitGameVersionRequest(req.gameId || req.id, versionData);
      showToast("New game version sent for admin approval! 🚀", "success");
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
        <h2>System Locked - ADMIN ONLY!</h2>
        <p style="color: var(--text-muted); margin-top: 10px;">This page is exclusively for DIGGY system admins.</p>
        <button class="btn btn-primary" onclick="window.location.hash='#/'" style="margin-top: 20px;">Back to Home</button>
      </div>
    `;
    return;
  }

  main.innerHTML = `
    <div class="top-header">
      <div class="page-title-wrap">
        <h1>System Admin Dashboard (Admin)</h1>
        <p style="color: var(--text-muted); margin-top: 5px;">Manage developer applications, approve new games, and direct uploads</p>
      </div>
      <div style="display: flex; gap: 10px;">
        <button class="btn btn-danger" id="clear-local-storage-btn"><i class="fas fa-trash"></i> Clear Local Storage</button>
        <button class="btn btn-primary" id="admin-direct-upload-btn"><i class="fas fa-upload"></i> Direct Game Upload</button>
      </div>
    </div>

    <!-- Dev Applications Section -->
    <div class="section-title">Player Applications to Become Developers</div>
    <div class="data-table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>Username</th>
            <th>Security Email</th>
            <th>Request Reason</th>
            <th>Date</th>
            <th>Request Status</th>
            <th>Decision Actions</th>
          </tr>
        </thead>
        <tbody id="admin-dev-requests-body">
          <tr><td colspan="6" style="text-align: center; color: var(--text-muted);">Loading requests...</td></tr>
        </tbody>
      </table>
    </div>

    <!-- Game Submissions Section -->
    <div class="section-title">New Game Submissions for Approval</div>
    <div class="data-table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>Developer</th>
            <th>Game Details</th>
            <th>Categories</th>
            <th>GitHub</th>
            <th>Target Audience / Description</th>
            <th>Decision Actions</th>
          </tr>
        </thead>
        <tbody id="admin-game-requests-body">
          <tr><td colspan="6" style="text-align: center; color: var(--text-muted);">Loading games for approval...</td></tr>
        </tbody>
      </table>
    </div>

    <!-- Support Chat Section -->
    <div class="section-title">Support Chat / Admin Inbox</div>
    <div class="support-chat-shell">
      <div class="support-chat-list" id="admin-support-thread-list"></div>
      <div class="support-chat-content" id="admin-support-thread-content"></div>
    </div>

    <!-- Users Management Section -->
    <div class="section-title">User & Role Management (Registered Accounts)</div>
    <div class="data-table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>Username</th>
            <th>Unique ID (UID)</th>
            <th>System Email</th>
            <th>Role</th>
            <th>2FA / Biometric</th>
            <th>Registration Date</th>
          </tr>
        </thead>
        <tbody id="admin-users-list-body">
          <tr><td colspan="6" style="text-align: center; color: var(--text-muted);">Loading user list...</td></tr>
        </tbody>
      </table>
    </div>
  `;

  renderAdminSupportChat(state.supportActiveThreadId);

  // Bind clear localStorage button
  document.getElementById('clear-local-storage-btn').addEventListener('click', () => {
    if (confirm('Are you sure you want to clear all localStorage? This will remove all local data and the system will rely entirely on Firebase.')) {
      clearAllLocalStorage();
      showToast('Local storage cleared. System will now use Firebase only.', 'success');
      setTimeout(() => location.reload(), 1500);
    }
  });

  // Bind direct upload
  document.getElementById('admin-direct-upload-btn').addEventListener('click', () => {
    openAdminDirectUploadModal();
  });

  // Pull applications to become developers
  try {
    const devRequests = await getDeveloperRequests();
    const devBody = document.getElementById('admin-dev-requests-body');
    
    if (devRequests.length === 0) {
      devBody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-muted); padding: 30px;">No active developer applications.</td></tr>`;
    } else {
      devBody.innerHTML = devRequests.map(req => {
        const isPending = req.status === 'pending';
        let statusText = '';
        if (req.status === 'approved') statusText = '<span class="badge badge-approved">Approved</span>';
        else if (req.status === 'rejected') statusText = '<span class="badge badge-rejected">Rejected</span>';
        else statusText = '<span class="badge badge-pending">Pending Review</span>';

        const actionButtons = isPending
          ? `
            <div style="display: flex; gap: 8px;">
              <button class="btn btn-primary admin-approve-dev" data-id="${req.id}" style="padding: 4px 8px; font-size: 10px;"><i class="fas fa-check"></i> Approve</button>
              <button class="btn btn-danger admin-reject-dev" data-id="${req.id}" style="padding: 4px 8px; font-size: 10px;"><i class="fas fa-times"></i> Reject</button>
            </div>
          `
          : `<span style="color: var(--text-dark); font-size: 12px;">Closed</span>`;

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
      gameBody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-muted); padding: 30px;">No games pending approval.</td></tr>`;
    } else {
      gameBody.innerHTML = gameRequests.map(req => {
        const isPending = req.status === 'pending';
        let statusText = '';
        if (req.status === 'approved') statusText = '<span class="badge badge-approved">Approved</span>';
        else if (req.status === 'rejected') statusText = '<span class="badge badge-rejected">Rejected</span>';
        else if (req.status === 'improvement') statusText = '<span class="badge badge-improvement">Needs Improvement</span>';

        const typeBadge = req.type === 'version_update'
          ? `<span class="badge badge-pending" style="background: rgba(112, 214, 255, 0.15); color: #70d6ff; border-color: rgba(112,214,255,0.3); margin-top: 4px; display: inline-block;">Version Update (${req.version})</span>`
          : '';

        const actionButtons = isPending
          ? `
            <div style="display: flex; gap: 6px; flex-direction: column;">
              <button class="btn btn-primary admin-approve-game" data-id="${req.id}" style="padding: 4px 8px; font-size: 10px; justify-content: center;"><i class="fas fa-check"></i> Approve & Publish</button>
              <button class="btn btn-secondary admin-improve-game" data-id="${req.id}" style="padding: 4px 8px; font-size: 10px; justify-content: center; border-color: #0096ff; color: #0096ff;"><i class="fas fa-comment-dots"></i> Needs Improvement</button>
              <button class="btn btn-danger admin-reject-game" data-id="${req.id}" style="padding: 4px 8px; font-size: 10px; justify-content: center;"><i class="fas fa-times"></i> Reject</button>
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
                  <div style="font-weight: bold; color: var(--accent-color);">${req.name} ${typeBadge}</div>
                  <div style="font-size: 11px; color: var(--text-muted);">How to play: ${req.howToPlay}</div>
                </div>
              </div>
            </td>
            <td>${req.categories ? req.categories.join(', ') : ''}</td>
            <td><a href="${req.githubUrl}" target="_blank" style="color: #0096ff; text-decoration: underline; font-size: 12px;">Source Code</a></td>
            <td>
              ${req.type === 'version_update'
                ? `<div style="font-size: 12px; color: var(--accent-color);"><strong>What's new in this version:</strong> ${req.changelog}</div>`
                : `<div style="font-size: 12px;"><strong>Intended for:</strong> ${req.targetAudience}</div>
                   <div style="font-size: 12px; color: var(--text-muted); max-width: 200px; overflow: hidden; text-overflow: ellipsis;">${req.description}</div>`
              }
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
      usersBody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-muted); padding: 30px;">No registered accounts found.</td></tr>`;
    } else {
      usersBody.innerHTML = allUsers.map(u => {
        const registrationDate = u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'Unknown';
        const twoFaBadge = u.twoFactorEnabled ? '<span style="color: var(--accent-color); font-size: 11px;"><i class="fas fa-check-circle"></i> Active</span>' : '<span style="color: var(--text-dark); font-size: 11px;">Off</span>';
        const bioBadge = u.biometricsEnabled ? '<span style="color: var(--accent-color); font-size: 11px;"><i class="fas fa-check-circle"></i> Active</span>' : '<span style="color: var(--text-dark); font-size: 11px;">Off</span>';

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
            showToast(`User role updated to ${newRole.toUpperCase()} successfully!`, "success");
            // If the user modified their own role, update state
            if (state.user && state.user.uid === uid) {
              state.user.role = newRole;
              renderUserBadge();
            }
            renderAdmin(); // Refresh dashboard
          } catch (e) {
            showToast("Role update failed: " + e.message, "danger");
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

  modalTitle.textContent = "Enter Admin Explanation (Admin Action)";

  let labelText = "Write a reason or improvement suggestions to send to the user:";
  if (status === 'approved') labelText = "Approval notes (will appear in the email):";
  else if (status === 'rejected') labelText = "Rejection reason (will appear in the email - the user won't be able to resubmit):";
  else if (status === 'improvement') labelText = "Detail the improvement suggestions and changes required from the developer:";

  modalBody.innerHTML = `
    <form id="admin-reason-form">
      <div class="form-group">
        <label>${labelText}</label>
        <textarea id="admin-notes" required placeholder="Enter text here..." rows="4"></textarea>
      </div>
      <button type="submit" class="btn btn-primary" style="width: 100%; justify-content: center;">
        <i class="fas fa-check-double"></i> Perform Action & Send Email
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
        showToast("Developer request updated and email sent successfully!", "success");
      } else if (type === 'game') {
        await handleGameRequest(requestId, status, reason);
        showToast("Game request updated and email sent successfully!", "success");
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

  modalTitle.textContent = "Direct Game Upload (Admin Bypass)";

  modalBody.innerHTML = `
    <form id="admin-direct-upload-form">
      <div class="form-group">
        <label>Game Name</label>
        <input type="text" id="direct-name" required placeholder="e.g. Dungeon Champion">
      </div>
      <div class="form-group">
        <label>Description</label>
        <textarea id="direct-desc" required placeholder="Short description..." rows="2"></textarea>
      </div>
      <div class="form-group">
        <label>Logo Link (URL)</label>
        <input type="url" id="direct-logo" required placeholder="https://example.com/logo.png">
      </div>
      <div class="form-group">
        <label>GitHub Repo Link</label>
        <input type="url" id="direct-github" required placeholder="https://github.com/... (optional)">
      </div>
      <div class="form-group">
        <label>Playable Game Link (Playable URL / GitHub Pages / iframe)</label>
        <input type="url" id="direct-url" required placeholder="https://username.github.io/my-game/">
      </div>
      <div class="form-group">
        <label>Game Instructions</label>
        <textarea id="direct-how" required placeholder="How to play..." rows="2"></textarea>
      </div>
      <div class="form-group">
        <label>Target Audience</label>
        <input type="text" id="direct-audience" required placeholder="e.g. Everyone">
      </div>
      <div class="form-group">
        <label>Categories (select up to 3)</label>
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
          <label class="category-checkbox-label">
            <input type="checkbox" name="direct-cats" value="ACTION"> ACTION
          </label>
          <label class="category-checkbox-label">
            <input type="checkbox" name="direct-cats" value="PUZZLE"> PUZZLE
          </label>
          <label class="category-checkbox-label">
            <input type="checkbox" name="direct-cats" value="ADVENTURE"> ADVENTURE
          </label>
          <label class="category-checkbox-label">
            <input type="checkbox" name="direct-cats" value="SPORTS"> SPORTS
          </label>
        </div>
      </div>
      <button type="submit" class="btn btn-primary" style="width: 100%; justify-content: center; margin-top: 15px;">
        <i class="fas fa-cloud-upload-alt"></i> Publish Immediately
      </button>
    </form>
  `;

  overlay.classList.add('active');

  const form = document.getElementById('admin-direct-upload-form');
  const directCatBoxes = form.querySelectorAll('input[name="direct-cats"]');
  directCatBoxes.forEach(box => {
    box.addEventListener('change', () => {
      const checkedCount = form.querySelectorAll('input[name="direct-cats"]:checked').length;
      directCatBoxes.forEach(b => { if (!b.checked) b.disabled = checkedCount >= 3; });
    });
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const checkedBoxes = form.querySelectorAll('input[name="direct-cats"]:checked');
    if (checkedBoxes.length === 0) {
      showToast("Select at least one category!", "warning");
      return;
    }
    if (checkedBoxes.length > 3) {
      showToast("You can select up to 3 categories only!", "warning");
      return;
    }
    const categories = Array.from(checkedBoxes).map(cb => cb.value);

    const gamePayload = {
      name: document.getElementById('direct-name').value,
      description: document.getElementById('direct-desc').value,
      logoUrl: document.getElementById('direct-logo').value,
      githubUrl: document.getElementById('direct-github').value,
      gameUrl: document.getElementById('direct-url').value,
      howToPlay: document.getElementById('direct-how').value,
      targetAudience: document.getElementById('direct-audience').value,
      categories: categories,
      developerUid: state.user.uid,
      developerName: `${state.user.username} (ADMIN)`
    };

    showLoader(true);
    try {
      await directPublishGame(gamePayload);
      showToast("Game published successfully without needing approval! 🎉", "success");
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
    main.innerHTML = `<div style="text-align: center; padding: 80px 0;"><h2>Game not found!</h2></div>`;
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
      <a href="#/" style="color: var(--accent-color); font-size: 14px;"><i class="fas fa-chevron-left"></i> Back to All Games</a>
    </div>

    <div class="game-play-area">
      <!-- Game Display Screen Panel -->
      <div class="game-screen-panel">
        <div class="game-screen-header">
          <h2 style="font-size: 20px; color: var(--accent-color);">${game.name}</h2>
          <div style="display: flex; gap: 10px; align-items: center;">
            <span style="font-size: 13px; color: var(--text-muted); font-family: var(--font-display);" id="game-score-display">Score: 0</span>
            <button class="btn btn-secondary" id="enlarge-game-btn" style="padding: 4px 10px; font-size: 12px;"><i class="fas fa-expand"></i> Enlarge</button>
          </div>
        </div>
        <div class="game-canvas-container">
          <div class="game-menu-overlay" id="game-menu-overlay">
            <h3 class="game-menu-title">${game.name}</h3>
            <p style="color: var(--text-muted); font-size: 14px; max-width: 380px; text-align: center; line-height: 1.5;">${game.howToPlay}</p>
            <button class="btn btn-primary" id="start-game-btn"><i class="fas fa-gamepad"></i> Start Game!</button>
          </div>
          <!-- Game Canvas -->
          <canvas id="retro-game-canvas" width="600" height="400" style="display: none;"></canvas>
          <!-- Game IFrame (for custom uploaded games) -->
          <iframe id="retro-game-iframe" style="display: none; width: 100%; height: 100%; min-height: 400px; border: 2px solid var(--accent-color); border-radius: 8px; background: #000; box-shadow: var(--border-glow);" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
        </div>
      </div>

      <!-- Game Details Info Panel -->
      <div class="game-sidebar-panel">
        <div style="display: flex; justify-content: center;">
          <img src="${game.logoUrl}" onerror="this.src='https://placehold.co/120x120/12161e/00ff66?text=DIGGY'" style="width: 100px; height: 100px; border-radius: 12px; object-fit: cover; border: 2px solid var(--accent-color); box-shadow: var(--border-glow);">
        </div>
        
        <div class="game-meta-item">
          <span class="game-meta-label">Developer</span>
          <span class="game-meta-val" style="font-weight: bold; color: var(--accent-color);">${game.developerName}</span>
        </div>

        <div class="game-meta-item">
          <span class="game-meta-label">Categories</span>
          <div style="display: flex; gap: 5px;">
            ${game.categories.map(c => `<span class="game-tag" style="background: var(--accent-dim); color: var(--accent-color);">${c}</span>`).join('')}
          </div>
        </div>

        <div class="game-meta-item">
          <span class="game-meta-label">Target Audience</span>
          <span class="game-meta-val">${game.targetAudience}</span>
        </div>

        <div class="game-meta-item">
          <span class="game-meta-label">Player Rating</span>
          <div id="game-rating-display"></div>
        </div>

        <div class="game-meta-item" id="game-rating-input-wrap">
          <div id="game-rating-input"></div>
        </div>

        <hr style="border: 0; border-top: 1px solid rgba(255, 255, 255, 0.05);">

        <div class="game-meta-item">
          <span class="game-meta-label">Game Description</span>
          <p style="font-size: 13px; line-height: 1.5; color: var(--text-muted);">${game.description}</p>
        </div>

        ${state.user && (state.user.role === 'admin' || state.user.uid === game.developerUid) ? `
          <hr style="border: 0; border-top: 1px solid rgba(255, 255, 255, 0.05);">
          <div class="game-meta-item">
            <button class="btn btn-secondary" id="edit-game-btn" style="width: 100%;"><i class="fas fa-edit"></i> Edit Game Details</button>
          </div>
        ` : ''}
      </div>
    </div>

    <!-- Edit Game Modal -->
    <div id="edit-game-modal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 10000; align-items: center; justify-content: center;">
      <div style="background: var(--bg-card); border: 1px solid var(--accent-color); border-radius: 12px; padding: 30px; max-width: 500px; width: 90%; max-height: 90vh; overflow-y: auto;">
        <h3 style="color: var(--accent-color); margin-bottom: 20px;">Edit Game Details</h3>
        <form id="edit-game-form">
          <div style="margin-bottom: 15px;">
            <label style="display: block; color: var(--text-muted); margin-bottom: 5px; font-size: 13px;">Game Name</label>
            <input type="text" id="edit-game-name" value="${game.name}" style="width: 100%; padding: 10px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; color: #fff;">
          </div>
          <div style="margin-bottom: 15px;">
            <label style="display: block; color: var(--text-muted); margin-bottom: 5px; font-size: 13px;">Description</label>
            <textarea id="edit-game-description" rows="3" style="width: 100%; padding: 10px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; color: #fff;">${game.description}</textarea>
          </div>
          <div style="margin-bottom: 15px;">
            <label style="display: block; color: var(--text-muted); margin-bottom: 5px; font-size: 13px;">Logo URL</label>
            <input type="text" id="edit-game-logo" value="${game.logoUrl}" style="width: 100%; padding: 10px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; color: #fff;">
          </div>
          <div style="margin-bottom: 15px;">
            <label style="display: block; color: var(--text-muted); margin-bottom: 5px; font-size: 13px;">Game URL</label>
            <input type="text" id="edit-game-url" value="${game.gameUrl || ''}" style="width: 100%; padding: 10px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; color: #fff;">
          </div>
          <div style="margin-bottom: 15px;">
            <label style="display: block; color: var(--text-muted); margin-bottom: 5px; font-size: 13px;">GitHub URL</label>
            <input type="text" id="edit-game-github" value="${game.githubUrl}" style="width: 100%; padding: 10px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; color: #fff;">
          </div>
          <div style="margin-bottom: 15px;">
            <label style="display: block; color: var(--text-muted); margin-bottom: 5px; font-size: 13px;">How to Play</label>
            <textarea id="edit-game-how" rows="2" style="width: 100%; padding: 10px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; color: #fff;">${game.howToPlay}</textarea>
          </div>
          <div style="margin-bottom: 15px;">
            <label style="display: block; color: var(--text-muted); margin-bottom: 5px; font-size: 13px;">Target Audience</label>
            <input type="text" id="edit-game-audience" value="${game.targetAudience}" style="width: 100%; padding: 10px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; color: #fff;">
          </div>
          <div style="margin-bottom: 15px;">
            <label style="display: block; color: var(--text-muted); margin-bottom: 5px; font-size: 13px;">Categories (comma-separated)</label>
            <input type="text" id="edit-game-categories" value="${(game.categories || []).join(', ')}" style="width: 100%; padding: 10px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; color: #fff;">
          </div>
          <div style="display: flex; gap: 10px; margin-top: 20px;">
            <button type="submit" class="btn btn-primary" style="flex: 1;"><i class="fas fa-save"></i> Save Changes</button>
            <button type="button" class="btn btn-secondary" id="cancel-edit-btn" style="flex: 1;">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  `;

  // Bind Start Game Button
  document.getElementById('start-game-btn').addEventListener('click', () => {
    document.getElementById('game-menu-overlay').style.display = 'none';
    
    recordGamePlay(game.id).catch(err => console.warn("Failed to record play stat:", err));
    
    if (game.gameUrl) {
      const iframe = document.getElementById('retro-game-iframe');
      iframe.src = game.gameUrl;
      iframe.style.display = 'block';
      state.gameInstance = {
        stop: () => {
          iframe.src = '';
          iframe.style.display = 'none';
        }
      };
    } else {
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
    }
  });

  // Bind Enlarge Button
  const enlargeBtn = document.getElementById('enlarge-game-btn');
  if (enlargeBtn) {
    enlargeBtn.addEventListener('click', () => {
      const gameScreenPanel = document.querySelector('.game-screen-panel');
      const gameSidebarPanel = document.querySelector('.game-sidebar-panel');
      
      if (!document.fullscreenElement) {
        // Request true fullscreen
        if (gameScreenPanel.requestFullscreen) {
          gameScreenPanel.requestFullscreen();
        } else if (gameScreenPanel.webkitRequestFullscreen) {
          gameScreenPanel.webkitRequestFullscreen();
        } else if (gameScreenPanel.msRequestFullscreen) {
          gameScreenPanel.msRequestFullscreen();
        }
        enlargeBtn.innerHTML = '<i class="fas fa-compress"></i> Exit Fullscreen';
      } else {
        // Exit fullscreen
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
          document.msExitFullscreen();
        }
        enlargeBtn.innerHTML = '<i class="fas fa-expand"></i> Fullscreen';
      }
    });

    // Listen for fullscreen changes to update button and sidebar
    document.addEventListener('fullscreenchange', () => {
      const gameSidebarPanel = document.querySelector('.game-sidebar-panel');
      if (document.fullscreenElement) {
        enlargeBtn.innerHTML = '<i class="fas fa-compress"></i> Exit Fullscreen';
        if (gameSidebarPanel) gameSidebarPanel.style.display = 'none';
      } else {
        enlargeBtn.innerHTML = '<i class="fas fa-expand"></i> Fullscreen';
        if (gameSidebarPanel) gameSidebarPanel.style.display = '';
      }
    });
  }

  setupGameRatingUI(gameId);

  // Bind Edit Game Button
  const editBtn = document.getElementById('edit-game-btn');
  const editModal = document.getElementById('edit-game-modal');
  const cancelEditBtn = document.getElementById('cancel-edit-btn');
  const editForm = document.getElementById('edit-game-form');

  if (editBtn && editModal) {
    editBtn.addEventListener('click', () => {
      editModal.style.display = 'flex';
    });

    cancelEditBtn.addEventListener('click', () => {
      editModal.style.display = 'none';
    });

    editModal.addEventListener('click', (e) => {
      if (e.target === editModal) {
        editModal.style.display = 'none';
      }
    });

    editForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      showLoader(true);
      try {
        const categoriesInput = document.getElementById('edit-game-categories').value.trim();
        const categories = categoriesInput ? categoriesInput.split(',').map(c => c.trim()).filter(c => c) : [];
        
        const updatedData = {
          name: document.getElementById('edit-game-name').value.trim(),
          description: document.getElementById('edit-game-description').value.trim(),
          logoUrl: document.getElementById('edit-game-logo').value.trim(),
          gameUrl: document.getElementById('edit-game-url').value.trim(),
          githubUrl: document.getElementById('edit-game-github').value.trim(),
          howToPlay: document.getElementById('edit-game-how').value.trim(),
          targetAudience: document.getElementById('edit-game-audience').value.trim(),
          categories: categories
        };

        await updateGameDetails(gameId, updatedData);
        
        // Update local state
        const idx = state.games.findIndex(g => g.id === gameId);
        if (idx !== -1) {
          state.games[idx] = { ...state.games[idx], ...updatedData };
        }
        
        editModal.style.display = 'none';
        showToast('Game details updated successfully!', 'success');
        
        // Re-render the game details page
        await renderGameDetails(gameId);
      } catch (err) {
        showToast('Failed to update game details: ' + err.message, 'danger');
      } finally {
        showLoader(false);
      }
    });
  }
}

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
        scoreDisplay.textContent = `Score: ${score}`;

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
    ctx.fillText(`Final Score: ${score}`, canvas.width/2, canvas.height/2 + 10);
    ctx.fillText('Press Start again to try once more', canvas.width/2, canvas.height/2 + 40);
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
            scoreDisplay.textContent = `Score: ${score}`;
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
    ctx.fillText(`Final Score: ${score}`, canvas.width/2, canvas.height/2 + 10);
    ctx.fillText('Try again!', canvas.width/2, canvas.height/2 + 40);
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
    ctx.fillText(`Final Score: ${score}`, canvas.width/2, canvas.height/2 + 10);
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
          scoreDisplay.textContent = `Score: ${score}`;
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
    ctx.fillText(`Final Score: ${score}`, canvas.width/2, canvas.height/2 + 10);
    ctx.fillText('Try again!', canvas.width/2, canvas.height/2 + 40);
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
        <h2>Restricted Access</h2>
        <p style="color: var(--text-muted); margin-top: 10px;">You must log in to access settings.</p>
        <button class="btn btn-primary" onclick="window.location.hash='#/login'" style="margin-top: 20px;">Log In Now</button>
      </div>
    `;
    return;
  }

  main.innerHTML = `
    <div class="top-header">
      <div class="page-title-wrap">
        <h1>Account Settings & Personalization</h1>
        <p style="color: var(--text-muted); margin-top: 5px;">Manage your account details and customize the site's look to your taste</p>
      </div>
    </div>

    <div style="display: flex; gap: 30px; flex-wrap: wrap;">
      ${(() => {
        const requirementStatus = getPrivilegedAccountRequirements(state.user);
        if (requirementStatus.required) {
          return `
            <div style="width: 100%; padding: 14px 16px; border-radius: 12px; background: ${requirementStatus.complete ? 'rgba(0,255,102,0.08)' : 'rgba(255,170,0,0.12)'}; border: 1px solid ${requirementStatus.complete ? 'rgba(0,255,102,0.25)' : 'rgba(255,170,0,0.25)'}; margin-bottom: 20px;">
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                <i class="fas ${requirementStatus.complete ? 'fa-shield-alt' : 'fa-exclamation-triangle'}" style="color: ${requirementStatus.complete ? 'var(--accent-color)' : '#ffaa00'};"></i>
                <strong style="font-size: 14px;">${requirementStatus.complete ? 'Account ready to use' : 'Security settings required for development/admin'}</strong>
              </div>
              <div style="font-size: 13px; color: var(--text-muted); line-height: 1.6;">
                ${requirementStatus.complete ? 'All requirements completed and you can continue working with your account.' : `Before continuing, you must complete:${requirementStatus.missingItems.includes('twoFactor') ? '<br>• Enable two-factor authentication' : ''}${requirementStatus.missingItems.includes('supportEmail') ? '<br>• Enter an internal support email' : ''}`}
              </div>
            </div>
          `;
        }
        return '';
      })()}

      <!-- Profile settings card -->
      <div class="settings-card" style="flex: 1; min-width: 320px; max-width: 500px;">
        <div class="settings-card-header">
          <h2 class="settings-card-title">Profile Details</h2>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>Username</label>
            <input type="text" id="settings-username" value="${state.user.username}">
          </div>
          <div class="form-group">
            <label>Associated Email</label>
            <input type="text" value="${state.user.email}" disabled style="background: rgba(255,255,255,0.02); color: var(--text-muted);">
          </div>
          <div class="form-group">
            <label>User Role (ROLE)</label>
            <div style="font-weight: bold; color: var(--accent-color); font-family: var(--font-display); font-size: 16px;">
              ${state.user.role.toUpperCase()}
            </div>
          </div>

          <button class="btn btn-primary" id="save-profile-btn" style="width: 100%; justify-content: center; margin-top: 10px;">
            Update Username
          </button>
        </div>
      </div>

      <!-- Security / Auth card -->
      <div class="settings-card" style="flex: 1; min-width: 320px; max-width: 500px;">
        <div class="settings-card-header">
          <h2 class="settings-card-title">Security & Passwords</h2>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>Change Password (6-12 characters)</label>
            <input type="password" id="settings-new-password" placeholder="Enter new password">
          </div>
          <button class="btn btn-secondary" id="change-pass-btn" style="width: 100%; justify-content: center; margin-bottom: 25px;">
            Change Password
          </button>

          <!-- 2FA Setup -->
          <div style="border-top: 1px solid rgba(255,255,255,0.05); padding-top: 20px; margin-bottom: 20px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div>
                <strong style="display: block; font-size: 14px;">Two-Factor Email Authentication (2FA)</strong>
                <span style="font-size: 12px; color: var(--text-muted);">Send a security code on every login</span>
              </div>
              <input type="checkbox" id="settings-2fa-toggle" ${state.user.twoFactorEnabled ? 'checked' : ''} style="width: 20px; height: 20px; accent-color: var(--accent-color); cursor: pointer;">
            </div>

            <div id="settings-2fa-email-group" style="display: ${state.user.twoFactorEnabled ? 'block' : 'none'}; margin-top: 15px;">
              <div class="form-group">
                <label>Email Address to Send the Code</label>
                <input type="email" id="settings-2fa-email" value="${state.user.twoFactorEmail || ''}" placeholder="myemail@example.com">
              </div>
            </div>

            ${isPrivilegedRole(state.user.role) ? `
              <div style="margin-top: 15px;">
                <div class="form-group">
                  <label>Internal Support Email (for Developer/Admin)</label>
                  <input type="email" id="settings-support-email" value="${state.user.supportEmail || ''}" placeholder="support@yourdomain.com">
                </div>
              </div>
            ` : ''}
          </div>

          <!-- Biometric setup -->
          <div style="border-top: 1px solid rgba(255,255,255,0.05); padding-top: 20px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
              <div>
                <strong style="display: block; font-size: 14px;">Quick Biometric Login (WebAuthn)</strong>
                <span style="font-size: 12px; color: var(--text-muted);">Use your device's fingerprint/FaceID to log in</span>
              </div>
              <span id="bio-setup-status" style="font-size: 11px; font-family: var(--font-display); color: ${state.user.biometricsEnabled ? 'var(--accent-color)' : 'var(--text-muted)'};">
                ${state.user.biometricsEnabled ? 'Enabled' : 'Not Set Up'}
              </span>
            </div>
            <button class="btn btn-secondary" id="register-biometric-btn" style="width: 100%; justify-content: center;">
              <i class="fas fa-fingerprint"></i> ${state.user.biometricsEnabled ? 'Set Up Biometrics Again' : 'Enable Biometric Login'}
            </button>
          </div>
        </div>
      </div>

      <!-- Display Theme Personalization -->
      <div class="settings-card" style="flex: 1; min-width: 320px; max-width: 100%;">
        <div class="settings-card-header">
          <h2 class="settings-card-title">Display Customization</h2>
        </div>
        <div class="modal-body">
          <label style="font-size: 12px; color: var(--text-muted); text-transform: uppercase; font-family: var(--font-display);">Choose your preferred neon color:</label>
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
          <h2 class="settings-card-title">Request to Become a DIGGY Game Developer</h2>
        </div>
        <div class="modal-body">
          <form id="dev-application-form">
            <p style="font-size: 14px; margin-bottom: 20px; color: var(--text-muted);">
              Want to upload your GitHub games to a site where kids from all over the world will play them? Fill out the following request and it will be sent to the Admin team.
            </p>
            <div class="form-group">
              <label>Reason (why would you like to be a developer on the site and which games would you like to upload?)</label>
              <textarea id="dev-app-reason" required placeholder="I want to be a developer because..." rows="3"></textarea>
            </div>
            <div style="display: flex; gap: 20px; flex-wrap: wrap;">
              <div class="form-group" style="flex: 1; min-width: 220px;">
                <label>Security Email (to send a styled approval / rejection notice)</label>
                <input type="email" id="dev-app-email" required placeholder="name@example.com">
              </div>
              <div class="form-group" style="flex: 1; min-width: 220px;">
                <label>Verification Password (to secure the request)</label>
                <input type="password" id="dev-app-pass" required placeholder="Enter your current account password">
              </div>
            </div>

            <button type="submit" class="btn btn-primary" style="margin-top: 10px;">
              <i class="fas fa-file-signature"></i> Submit Developer Request
            </button>
          </form>
        </div>
      </div>
    ` : ''}
  `;

  // Bind settings profile username update
  document.getElementById('save-profile-btn').addEventListener('click', async () => {
    const newUsername = sanitizeInput(document.getElementById('settings-username').value.trim());
    const usernameValidation = validateUsername(newUsername);
    
    if (!usernameValidation.valid) {
      showToast(usernameValidation.errors[0], "danger");
      return;
    }
    
    showLoader(true);
    try {
      await updateUserProfile(state.user.uid, { username: newUsername });
      state.user.username = newUsername;
      renderUserBadge();
      showToast("Username updated successfully!", "success");
    } catch (e) {
      showToast(e.message, "danger");
    } finally {
      showLoader(false);
    }
  });

  // Change password binding
  document.getElementById('change-pass-btn').addEventListener('click', async () => {
    const newPass = document.getElementById('settings-new-password').value;
    const passwordValidation = validatePasswordStrength(newPass);
    
    if (!passwordValidation.valid) {
      showToast(passwordValidation.errors[0], "danger");
      return;
    }
    
    showLoader(true);
    try {
      await changeUserPassword(newPass);
      showToast("Password changed successfully!", "success");
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
  const input2faEmail = document.getElementById('settings-2fa-email');
  
  toggle2fa.addEventListener('change', async () => {
    const enabled = toggle2fa.checked;
    group2fa.style.display = enabled ? 'block' : 'none';
    
    if (!enabled) {
      if (isPrivilegedRole(state.user.role)) {
        toggle2fa.checked = true;
        group2fa.style.display = 'block';
        showToast("Developer/Admin users are required to enable two-factor authentication.", "danger");
        return;
      }

      showLoader(true);
      await updateUserProfile(state.user.uid, { twoFactorEnabled: false });
      state.user.twoFactorEnabled = false;
      showToast("Two-factor authentication disabled.", "info");
      showLoader(false);
    } else {
      let val = sanitizeInput(input2faEmail.value.trim());
      if (!val && state.user.email) {
        val = state.user.email;
        input2faEmail.value = val;
      }
      
      if (val) {
        const emailValidation = validateEmail(val);
        if (emailValidation.valid) {
          showLoader(true);
          await updateUserProfile(state.user.uid, { 
            twoFactorEnabled: true, 
            twoFactorEmail: val 
          });
          state.user.twoFactorEnabled = true;
          state.user.twoFactorEmail = val;
          showToast("אימות דו-שלבי הופעל בהצלחה!", "success");
          showLoader(false);
          return;
        }
      }
      showToast("נא להזין כתובת אימייל תקינה להשלמת ההפעלה.", "warning");
    }
  });

  // If 2FA gets updated, save profile email
  input2faEmail.addEventListener('change', async () => {
    const val = sanitizeInput(input2faEmail.value.trim());
    if (!val) {
      showToast("You must enter an email address to send the code", "danger");
      return;
    }

    const emailValidation = validateEmail(val);
    if (!emailValidation.valid) {
      showToast(emailValidation.error, "danger");
      return;
    }
    
    showLoader(true);
    await updateUserProfile(state.user.uid, { 
      twoFactorEnabled: true, 
      twoFactorEmail: val 
    });
    state.user.twoFactorEnabled = true;
    state.user.twoFactorEmail = val;
    showToast("Two-factor verification email updated!", "success");
    showLoader(false);
  });

  const inputSupportEmail = document.getElementById('settings-support-email');
  if (inputSupportEmail) {
    inputSupportEmail.addEventListener('change', async () => {
      const val = sanitizeInput(inputSupportEmail.value.trim());
      if (!val) {
        showToast("You must enter an internal support email", "danger");
        return;
      }

      const emailValidation = validateEmail(val);
      if (!emailValidation.valid) {
        showToast(emailValidation.error, "danger");
        return;
      }

      showLoader(true);
      await updateUserProfile(state.user.uid, { supportEmail: val });
      state.user.supportEmail = val;
      showToast("Support email saved successfully!", "success");
      showLoader(false);
    });
  }

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
      showToast("Neon theme updated!", "success");
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
        
        // Sync to Firebase
        import('./firebase-service.js').then(mod => {
          if (mod.firebaseLoaded && !mod.fallbackMode) {
            try {
              const bioRef = mod.firebaseFirestore.doc(mod.db, "webauthn_credentials", state.user.uid);
              mod.firebaseFirestore.setDoc(bioRef, { 
                username: state.user.username,
                uid: state.user.uid,
                credentialId: result.credentialId.join(','),
                updatedAt: new Date().toISOString()
              }).catch(e => {
                console.warn("Firebase WebAuthn sync failed:", e);
              });
            } catch (e) {
              console.warn("Firebase WebAuthn sync failed:", e);
            }
          }
        });
        
        await updateUserProfile(state.user.uid, { 
          biometricsEnabled: true, 
          biometricsCredentialId: result.credentialId.join(',') 
        });

        state.user.biometricsEnabled = true;
        document.getElementById('bio-setup-status').textContent = 'Enabled';
        document.getElementById('bio-setup-status').style.color = 'var(--accent-color)';
        showToast("Biometric login enabled successfully for this device! 🔒", "success");
      }
    } catch (e) {
      showToast("Error registering biometrics: " + e.message, "danger");
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
        showToast("Enter a valid verification password (6-12 characters)!", "danger");
        return;
      }

      showLoader(true);
      try {
        await submitDeveloperRequest(state.user.uid, state.user.username, reason, email);
        showToast("Developer request sent successfully! A styled email will be sent to you with the Admin's decision. 📬", "success");
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
        <i class="fas fa-sign-in-alt"></i> Log In / Sign Up
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

// --- PUBLIC ARTICLES ---
const PUBLIC_ARTICLES = {
  'welcome': {
    title: 'Welcome to DIGGY Arena',
    date: 'June 15, 2026',
    icon: 'fa-rocket',
    excerpt: 'Discover the new gaming world for kids — arcade, retro, and casual all in one place.',
    content: `
      <p>Welcome to <strong>DIGGY Arena</strong> — the leading gaming platform for kids and teens. Here you'll find a wide range of arcade, retro, and casual games developed by local and international developers.</p>
      <h3>What awaits you?</h3>
      <ul>
        <li>Completely free games — no ads</li>
        <li>Diverse categories: RPG, RETRO, ACTION, PUZZLE, and more</li>
        <li>A star rating system for every game</li>
        <li>The ability to save favorite games (after signing up)</li>
      </ul>
      <p>Sign up for free, pick a game from the catalog, and start playing!</p>
    `
  },
  'safe-gaming': {
    title: 'Safe Gaming Online — A Guide for Kids',
    date: 'June 10, 2026',
    icon: 'fa-shield-alt',
    excerpt: 'Important tips for playing safely and enjoyably online.',
    content: `
      <p>The internet is an amazing place to play and learn, but it's important to play smart. Here are some basic rules:</p>
      <ul>
        <li><strong>Don't share personal information</strong> — no full name, address, phone number, or passwords</li>
        <li><strong>Tell your parents</strong> — if something feels off, tell an adult</li>
        <li><strong>Take breaks</strong> — get up and move every 30 minutes</li>
        <li><strong>Only play on trusted sites</strong> — DIGGY checks every game before publishing</li>
      </ul>
    `
  },
  'parents-guide': {
    title: 'A Guide for Parents — DIGGY Arena',
    date: 'June 8, 2026',
    icon: 'fa-users',
    excerpt: 'Everything parents need to know about our platform.',
    content: `
      <p>DIGGY Arena is designed to provide a safe and educational gaming environment for kids. Every game goes through a quality check and admin approval before publishing.</p>
      <h3>What do we guarantee?</h3>
      <ul>
        <li>No ads or external links inside the games</li>
        <li>No collection of personal information from children without parental consent</li>
        <li>Age-appropriate content — no violent or offensive material</li>
        <li>Two-factor authentication available for accounts</li>
      </ul>
      <p>For further questions, contact us through our <a href="#/contact" style="color: var(--accent-color);">contact page</a>.</p>
    `
  },
  'community': {
    title: 'DIGGY Community Guidelines',
    date: 'June 5, 2026',
    icon: 'fa-handshake',
    excerpt: 'How to keep a pleasant, respectful, and fun community.',
    content: `
      <p>The DIGGY community is built on mutual respect. We expect all users to:</p>
      <ul>
        <li>Rate games honestly and fairly</li>
        <li>Not attempt to hack or harm the system</li>
        <li>Report problematic content through the contact page</li>
        <li>Respect other developers and players</li>
      </ul>
      <p>Violating the community guidelines may lead to an account ban.</p>
    `
  },
  'top-games': {
    title: 'This Week\'s Most Popular Games',
    date: 'June 1, 2026',
    icon: 'fa-fire',
    excerpt: 'These are the games that earned the highest ratings this week.',
    content: `
      <p>Every week we publish the top games ranked by player ratings and play count. Here are the picks:</p>
      <ul>
        <li><strong>Neon Snake</strong> — an arcade classic with stunning neon design ⭐ 4.8</li>
        <li><strong>Space Laser Evader</strong> — a challenging space game ⭐ 4.9</li>
        <li><strong>Brick Breaker Glow</strong> — a brick breaker with glowing effects ⭐ 4.6</li>
      </ul>
      <p>Rate your favorite games and help the community discover new gems!</p>
    `
  },
  'ratings-guide': {
    title: 'How Does the Rating System Work?',
    date: 'May 28, 2026',
    icon: 'fa-star',
    excerpt: 'An explanation of the star system — rate games and help the community.',
    content: `
      <p>On DIGGY, every player can rate a game only once, on a scale of 1–5 stars.</p>
      <h3>How to rate?</h3>
      <ul>
        <li>Go to the game page</li>
        <li>On the side you'll see "Rate this game"</li>
        <li>Click the number of stars that matches your experience</li>
      </ul>
      <p>The average rating is shown on the game card and on the details page. Developers get a reward bonus for games with high ratings!</p>
    `
  },
  'new-features': {
    title: 'New Features & Updates — June 2026',
    date: 'June 20, 2026',
    icon: 'fa-sparkles',
    excerpt: 'A new rating system, public articles, and navigation improvements.',
    content: `
      <p>We're happy to share new updates to the platform:</p>
      <ul>
        <li><strong>Star rating system</strong> — rate every game and see the average rating</li>
        <li><strong>Articles & News</strong> — new content for players and parents</li>
        <li><strong>Improved sitemap</strong> — easy navigation to all pages</li>
        <li><strong>Legal info pages</strong> — terms of use, privacy, and contact</li>
      </ul>
    `
  }
};

async function renderArticles() {
  ensureContentPageStyles();
  const main = document.getElementById('main-container');
  const articles = Object.entries(PUBLIC_ARTICLES);

  main.innerHTML = `
    <div class="top-header">
      <div class="page-title-wrap">
        <h1>Articles & News</h1>
        <p style="color: var(--text-muted); margin-top: 5px;">Tips, guides, and updates from the world of DIGGY</p>
      </div>
    </div>
    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; margin-top: 20px;">
      ${articles.map(([slug, art]) => `
        <div class="article-card" data-slug="${slug}">
          <div class="article-card-date"><i class="fas fa-calendar-alt"></i> ${art.date}</div>
          <h3 class="article-card-title"><i class="fas ${art.icon}" style="color: var(--accent-color); margin-left: 8px;"></i>${art.title}</h3>
          <p class="article-card-excerpt">${art.excerpt}</p>
          <span style="color: var(--accent-color); font-size: 13px; margin-top: 10px; display: inline-block;">Read More →</span>
        </div>
      `).join('')}
    </div>
  `;

  main.querySelectorAll('.article-card').forEach(card => {
    card.addEventListener('click', () => {
      navigateTo(`#/articles/${card.getAttribute('data-slug')}`);
    });
  });
}

async function renderArticleDetail(slug) {
  ensureContentPageStyles();
  const main = document.getElementById('main-container');
  const article = PUBLIC_ARTICLES[slug];

  if (!article) {
    main.innerHTML = `
      <div style="text-align: center; padding: 80px 0;">
        <h2>Article not found</h2>
        <button class="btn btn-primary" onclick="window.location.hash='#/articles'" style="margin-top: 20px;">Back to Articles</button>
      </div>
    `;
    return;
  }

  main.innerHTML = `
    <div style="margin-bottom: 20px;">
      <a href="#/articles" style="color: var(--accent-color); font-size: 14px;"><i class="fas fa-chevron-left"></i> Back to All Articles</a>
    </div>
    <div class="legal-page-content">
      <div style="font-size: 12px; color: var(--text-muted); margin-bottom: 15px;"><i class="fas fa-calendar-alt"></i> ${article.date}</div>
      <h2 class="doc-article-title"><i class="fas ${article.icon}"></i> ${article.title}</h2>
      <div class="doc-section">${article.content}</div>
    </div>
  `;
}

async function renderSitemap() {
  ensureContentPageStyles();
  const main = document.getElementById('main-container');
  const gameLinks = state.games.map(g => `<li><a href="#/game/${g.id}">${g.name}</a></li>`).join('');
  const articleLinks = Object.entries(PUBLIC_ARTICLES).map(([slug, art]) =>
    `<li><a href="#/articles/${slug}">${art.title}</a></li>`
  ).join('');

  main.innerHTML = `
    <div class="top-header">
      <div class="page-title-wrap">
        <h1>Site Map</h1>
        <p style="color: var(--text-muted); margin-top: 5px;">All the pages and links on the DIGGY Arena site</p>
      </div>
    </div>
    <div class="legal-page-content">
      <div class="sitemap-grid">
        <div class="sitemap-group">
          <h3><i class="fas fa-home"></i> Main Pages</h3>
          <ul>
            <li><a href="#/">Home — Game Catalog</a></li>
            <li><a href="#/articles">Articles & News</a></li>
            <li><a href="#/login">Sign Up / Log In</a></li>
            <li><a href="#/settings">Profile Settings</a></li>
          </ul>
        </div>
        <div class="sitemap-group">
          <h3><i class="fas fa-gamepad"></i> Games (${state.games.length})</h3>
          <ul>${gameLinks || '<li>No games</li>'}</ul>
        </div>
        <div class="sitemap-group">
          <h3><i class="fas fa-newspaper"></i> Articles</h3>
          <ul>${articleLinks}</ul>
        </div>
        <div class="sitemap-group">
          <h3><i class="fas fa-gavel"></i> Legal Info</h3>
          <ul>
            <li><a href="#/terms">Terms of Use</a></li>
            <li><a href="#/privacy">Privacy Policy</a></li>
            <li><a href="#/contact">Contact / Copyright</a></li>
          </ul>
        </div>
      </div>
    </div>
  `;
}

async function renderTerms() {
  ensureContentPageStyles();
  const main = document.getElementById('main-container');
  main.innerHTML = `
    <div class="top-header">
      <div class="page-title-wrap">
        <h1>Terms of Use</h1>
        <p style="color: var(--text-muted); margin-top: 5px;">Last updated: June 2026</p>
      </div>
    </div>
    <div class="legal-page-content">
      <div class="doc-section">
        <h3>1. Acceptance of Terms</h3>
        <p>Using the DIGGY Arena site constitutes agreement to these terms of use. If you do not agree, please do not use the site.</p>
      </div>
      <div class="doc-section">
        <h3>2. Copyright</h3>
        <p>All content on the site — design, logo, text, and interface — belongs to DIGGY Arena Ltd. unless otherwise stated. Games published on the site belong to their developers, who grant DIGGY a license to display them.</p>
        <p>Copyright holders who identify an infringement can contact us via the <a href="#/contact" style="color: var(--accent-color);">contact page</a> with the infringement details. We will address reports within 48 hours.</p>
      </div>
      <div class="doc-section">
        <h3>3. Permitted Use</h3>
        <p>The site is intended for playing games, rating them, and reading content. Hacking, copying, scraping, or commercial use without authorization is prohibited.</p>
      </div>
      <div class="doc-section">
        <h3>4. Limitation of Liability</h3>
        <p>DIGGY Arena provides the service "as is". We are not liable for damages arising from use of the site or third-party games.</p>
      </div>
    </div>
  `;
}

async function renderPrivacy() {
  ensureContentPageStyles();
  const main = document.getElementById('main-container');
  main.innerHTML = `
    <div class="top-header">
      <div class="page-title-wrap">
        <h1>Privacy Policy</h1>
        <p style="color: var(--text-muted); margin-top: 5px;">Last updated: June 2026</p>
      </div>
    </div>
    <div class="legal-page-content">
      <div class="doc-section">
        <h3>1. Information We Collect</h3>
        <p>We collect: username, email address (at signup), game preferences (favorites, history), and ratings. We do not collect information from children under 13 without parental consent.</p>
      </div>
      <div class="doc-section">
        <h3>2. Use of Information</h3>
        <p>The information is used to operate the account, improve the gaming experience, and communicate with the user. We will not sell information to third parties.</p>
      </div>
      <div class="doc-section">
        <h3>3. Storage and Security</h3>
        <p>Data is stored on Firebase/Google Cloud with encryption. Ratings and favorites are also stored in localStorage in the browser.</p>
      </div>
      <div class="doc-section">
        <h3>4. Your Rights</h3>
        <p>You can request deletion of your account and data via the <a href="#/contact" style="color: var(--accent-color);">contact page</a>.</p>
      </div>
    </div>
  `;
}

async function renderContact() {
  ensureContentPageStyles();
  const main = document.getElementById('main-container');
  main.innerHTML = `
    <div class="top-header">
      <div class="page-title-wrap">
        <h1>Contact Us</h1>
        <p style="color: var(--text-muted); margin-top: 5px;">We're happy to help — players, parents, and copyright holders</p>
      </div>
    </div>
    <div class="legal-page-content">
      <div class="doc-section">
        <h3><i class="fas fa-envelope" style="color: var(--accent-color);"></i> General Contact</h3>
        <p>For questions, suggestions, and support: <strong>${getSiteEmailSettings().supportEmail || 'diggy-games@outlook.com'}</strong></p>
      </div>

      <div class="doc-section" style="background: rgba(0,255,102,0.06); border: 1px solid rgba(0,255,102,0.16); border-radius: 12px; padding: 20px;">
        <h3><i class="fas fa-headset" style="color: var(--accent-color);"></i> Send a Support Request</h3>
        <p>Your request is logged in the admin's internal chat and is also sent by email if Resend is configured.</p>
        <form id="support-request-form" style="display: flex; flex-direction: column; gap: 12px; margin-top: 15px;">
          <input type="text" id="support-name" placeholder="Full name" required>
          <input type="email" id="support-email" placeholder="your@email.com" required>
          <input type="text" id="support-subject" placeholder="Request subject" required>
          <textarea id="support-message" rows="4" placeholder="Describe your issue or question..." required></textarea>
          <button type="submit" class="btn btn-primary" style="width: fit-content; justify-content: center;"><i class="fas fa-paper-plane"></i> Send Request</button>
        </form>
      </div>

      <div class="doc-section" style="background: rgba(255,200,0,0.05); border: 1px solid rgba(255,200,0,0.15); border-radius: 12px; padding: 20px;">
        <h3><i class="fas fa-copyright" style="color: #ffd700;"></i> Copyright Holders (DMCA)</h3>
        <p>If you are a copyright holder and identify content that infringes your rights on our site, please send us:</p>
        <ul>
          <li>Full name and contact details</li>
          <li>Description of the protected work</li>
          <li>Link to the game page or relevant content on DIGGY</li>
          <li>A statement that the use is unauthorized</li>
        </ul>
        <p>Send to: <strong>${getSiteEmailSettings().legalEmail || 'diggy-games@outlook.com'}</strong> — we will address the report within 48 business hours.</p>
      </div>
      <div class="doc-section">
        <h3>Quick Links</h3>
        <p>
          <a href="#/sitemap" style="color: var(--accent-color); margin-left: 15px;">Site Map</a>
          <a href="#/terms" style="color: var(--accent-color); margin-left: 15px;">Terms of Use</a>
          <a href="#/privacy" style="color: var(--accent-color);">Privacy Policy</a>
        </p>
      </div>
    </div>
  `;

  const form = document.getElementById('support-request-form');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('support-name').value.trim();
      const email = document.getElementById('support-email').value.trim();
      const subject = document.getElementById('support-subject').value.trim();
      const message = document.getElementById('support-message').value.trim();

      if (!name || !email || !subject || !message) {
        showToast('Please fill in all fields.', 'warning');
        return;
      }

      showLoader(true);
      try {
        const thread = createSupportThread({ name, email, subject, message });
        const adminEmail = getSiteEmailSettings().supportEmail || localStorage.getItem('diggy_support_admin_email') || 'diggy-games@outlook.com';
        const adminHtml = `
          <div style="font-family: sans-serif; background: #07080a; color: white; padding: 24px; border-radius: 12px; border: 1px solid #00ff66;">
            <h2 style="color: #00ff66;">New Support Request - DIGGY</h2>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Subject:</strong> ${subject}</p>
            <p><strong>Message:</strong> ${message}</p>
          </div>
        `;
        const userHtml = `
          <div style="font-family: sans-serif; background: #07080a; color: white; padding: 24px; border-radius: 12px; border: 1px solid #00ff66;">
            <h2 style="color: #00ff66;">We received your request</h2>
            <p>Hi ${name},</p>
            <p>Your request has been logged in the admin's support chat. We'll update you as soon as possible.</p>
          </div>
        `;
        await sendEmailViaResend(adminEmail, `DIGGY Support: ${subject}`, adminHtml);
        await sendEmailViaResend(email, 'DIGGY - We received your request', userHtml);
        showToast('Request sent successfully! We will respond soon.', 'success');
        form.reset();
      } catch (err) {
        showToast(err.message || 'Error sending request', 'danger');
      } finally {
        showLoader(false);
      }
    });
  }
}

// Render: DEVELOPER DOCUMENTATION
async function renderDevDocs() {
  const main = document.getElementById('main-container');

  if (!state.user || (state.user.role !== 'developer' && state.user.role !== 'admin')) {
    main.innerHTML = `
      <div style="text-align: center; padding: 80px 0;">
        <i class="fas fa-lock" style="font-size: 64px; color: var(--danger-color); margin-bottom: 20px;"></i>
        <h2>Access Blocked!</h2>
        <p style="color: var(--text-muted); margin-top: 10px;">This page is for authorized developers only.</p>
        <button class="btn btn-primary" onclick="window.location.hash='#/'" style="margin-top: 20px;">Back to Home</button>
      </div>
    `;
    return;
  }

  // Scoped documentation CSS
  if (!document.getElementById('dev-docs-inline-styles')) {
    const styleTag = document.createElement('style');
    styleTag.id = 'dev-docs-inline-styles';
    styleTag.textContent = `
      .doc-tab-btn {
        font-family: var(--font-display);
        font-size: 14px;
        text-align: left;
        background: none;
        border: none;
        padding: 12px 15px;
        color: var(--text-muted);
        border-radius: 8px;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 10px;
        transition: all 0.3s;
      }
      .doc-tab-btn:hover {
        background: rgba(255, 255, 255, 0.02) !important;
        color: var(--accent-color) !important;
      }
      .doc-tab-btn.active-doc-tab {
        background: var(--accent-dim) !important;
        color: var(--accent-color) !important;
        border-right: 3px solid var(--accent-color);
        font-weight: bold;
      }
      .doc-article-title {
        font-size: 24px;
        color: var(--accent-color);
        margin-bottom: 20px;
        font-family: var(--font-display);
        display: flex;
        align-items: center;
        gap: 12px;
        border-bottom: 1px solid rgba(255,255,255,0.08);
        padding-bottom: 15px;
      }
      .doc-section {
        margin-bottom: 25px;
      }
      .doc-section h3 {
        font-size: 18px;
        color: #fff;
        margin-bottom: 10px;
        font-family: var(--font-display);
      }
      .doc-section p {
        color: var(--text-muted);
        font-size: 14.5px;
        margin-bottom: 12px;
        line-height: 1.6;
      }
      .doc-section ul {
        margin-right: 20px;
        margin-bottom: 15px;
        color: var(--text-muted);
        font-size: 14px;
        list-style-type: square;
      }
      .doc-section li {
        margin-bottom: 8px;
      }
      .doc-code-block {
        background: #090c12;
        border: 1px solid rgba(255, 255, 255, 0.05);
        border-radius: 8px;
        padding: 15px;
        font-family: monospace;
        font-size: 13px;
        color: #70d6ff;
        direction: ltr;
        text-align: left;
        overflow-x: auto;
        margin: 15px 0;
      }
      .doc-badge {
        background: var(--accent-dim);
        color: var(--accent-color);
        padding: 3px 8px;
        border-radius: 4px;
        font-size: 11px;
        font-weight: bold;
        margin-right: 5px;
      }
    `;
    document.head.appendChild(styleTag);
  }

  main.innerHTML = `
    <div class="top-header">
      <div class="page-title-wrap">
        <h1>Developer Guides & Documentation</h1>
        <p style="color: var(--text-muted); margin-top: 5px;">Everything you need to know to build and succeed with games on DIGGY</p>
      </div>
    </div>

    <div class="dev-docs-container" style="display: flex; gap: 30px; margin-top: 20px; align-items: flex-start;">
      <!-- Sidebar navigation for docs -->
      <div class="dev-docs-sidebar" style="width: 250px; background: var(--bg-card); border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 16px; padding: 15px; display: flex; flex-direction: column; gap: 8px; flex-shrink: 0; box-shadow: var(--border-glow);">
        <button class="doc-tab-btn active-doc-tab" data-doc="getting-started"><i class="fas fa-rocket"></i> How does it work?</button>
        <button class="doc-tab-btn" data-doc="standards"><i class="fas fa-list-check"></i> Standards & Requirements</button>
        <button class="doc-tab-btn" data-doc="monetization"><i class="fas fa-coins"></i> Rewards & Earnings</button>
        <button class="doc-tab-btn" data-doc="tips"><i class="fas fa-trophy"></i> How to succeed?</button>
      </div>
      
      <!-- Doc Content Display area -->
      <div class="dev-docs-content" id="doc-content-area" style="flex-grow: 1; background: var(--bg-card); border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 16px; padding: 30px; min-height: 400px; box-shadow: var(--border-glow);">
        <!-- Loaded dynamically -->
      </div>
    </div>
  `;

  const docArticles = {
    'getting-started': `
      <h2 class="doc-article-title"><i class="fas fa-rocket"></i> How does the DIGGY game upload system work?</h2>
      <div class="doc-section">
        <p>The <strong>DIGGY</strong> platform is designed to bring high-quality, stunning retro, arcade, and casual games to kids. The system is based on running Web games built on HTML5/JS inside secure game windows (iframes). Developers can build and submit games very easily.</p>
      </div>
      <div class="doc-section">
        <h3>Steps to successfully submit a game on the site:</h3>
        <ul>
          <li><strong>Build the game (Development):</strong> Create an interactive casual game that runs in the browser (HTML/JS/CSS). You can use any engine that supports exporting to Web (like Unity, Godot, PixiJS, Phaser, or Vanilla JS Canvas).</li>
          <li><strong>Host the game (Hosting):</strong> Put your game online so it's accessible in the browser. We recommend using <strong>GitHub Pages</strong>, a free, stable, and excellent service for loading games.</li>
          <li><strong>Submit the request (Submission):</strong> Go to your developer panel on DIGGY, click "Submit New Game", and enter the playable game link (Playable URL) and the source code link on GitHub.</li>
          <li><strong>Review and approval (Admin Approval):</strong> System admins will review the game to verify it works correctly. Once approved, the game will be automatically published on the site and appear to all players!</li>
        </ul>
      </div>
      <div class="doc-section">
        <h3>Example of a basic main HTML file structure for a game:</h3>
        <div class="doc-code-block">&lt;!DOCTYPE html&gt;
&lt;html&gt;
&lt;head&gt;
  &lt;meta charset="UTF-8"&gt;
  &lt;title&gt;My Diggy Game&lt;/title&gt;
  &lt;style&gt;
    body { margin: 0; background: #000; overflow: hidden; }
    canvas { width: 100vw; height: 100vh; display: block; }
  &lt;/style&gt;
&lt;/head&gt;
&lt;body&gt;
  &lt;canvas id="gameCanvas"&gt;&lt;/canvas&gt;
  &lt;script src="game.js"&gt;&lt;/script&gt;
&lt;/body&gt;
&lt;/html&gt;</div>
      </div>
    `,
    'standards': `
      <h2 class="doc-article-title"><i class="fas fa-list-check"></i> Technology Standards & Requirements</h2>
      <div class="doc-section">
        <p>To maintain high quality, excellent security, and a smooth user experience for our players, every game submitted to the DIGGY site must meet the following standards:</p>
      </div>
      <div class="doc-section">
        <h3>1. Responsive Design & Screen Fit</h3>
        <p>Since games load inside a fixed game frame on the page, your game must adapt smoothly to any window size (we recommend using 100% width and height of the viewport, or supporting a flexible aspect ratio).</p>
      </div>
      <div class="doc-section">
        <h3>2. Source Code (for Admin review only)</h3>
        <p>Developers are required to provide a link to the source code for quality and security review by the admin team. This link <strong>is not shown publicly</strong> and is used exclusively for the approval process.</p>
      </div>
      <div class="doc-section">
        <h3>3. Maintaining a Safe Environment for Kids</h3>
        <ul>
          <li><strong>No ads:</strong> It is strictly forbidden to include pop-up ads, video ads, or external purchase links.</li>
          <li><strong>No offensive content:</strong> Games must be suitable for children of all ages, with no violent or offensive content.</li>
          <li><strong>No collecting personal information:</strong> Do not ask users to enter personal details, passwords, or emails within the game.</li>
        </ul>
      </div>
      <div class="doc-section">
        <h3>4. Keyboard, Mouse, and Touch Support</h3>
        <p>Make sure your game supports standard keys (arrow keys, WASD, space) and works smoothly on mobile devices if you indicated the game is intended for them too.</p>
      </div>
    `,
    'monetization': `
      <h2 class="doc-article-title"><i class="fas fa-coins"></i> Developer Rewards & Earnings System</h2>
      <div class="doc-section">
        <p>At DIGGY we value the hard work of developers and offer a dynamic rewards system that lets you earn based on the popularity and quality of your games!</p>
      </div>
      <div class="doc-section">
        <h3>How does the rewards system work?</h3>
        <ul>
          <li><strong>Play count reward (Play Milestone Bonus):</strong>
            <p>For every registered player who plays your game for at least one minute, the system rewards you with Developer Points that can be converted into prizes or cash grants.</p>
          </li>
          <li><strong>Star rating bonus (Star Rating multiplier):</strong>
            <p>Games rated highly on average by the community (e.g., 4.5 stars and up) get their daily reward doubled and increased exposure on the home page.</p>
          </li>
          <li><strong>Developer challenges and competitions (Monthly Hackathons):</strong>
            <p>Every month we announce a development competition around a specific theme (e.g. "Neon Space Games"). Games that reach the top three places win valuable cash prizes and special badges for their developer profile.</p>
          </li>
          <li><strong>Leading open source reward (Open Source Contribution):</strong>
            <p>Source code that earns the most Stars on GitHub and is well maintained by the developer receives a monthly encouragement grant from the DIGGY team for educational development.</p>
          </li>
        </ul>
      </div>
    `,
    'tips': `
      <h2 class="doc-article-title"><i class="fas fa-trophy"></i> Tips & Advice for Creating a Winning Game</h2>
      <div class="doc-section">
        <p>Want your game to reach the top of the popularity chart and have everyone playing it? Here are some winning tips from the DIGGY design and development team:</p>
      </div>
      <div class="doc-section">
        <h3>1. Match the Site's Aesthetic - Black Neon and Glassmorphism</h3>
        <p>DIGGY's users are used to a premium, glowing, modern design. Games that use dark backgrounds combined with glowing neon-colored elements (glowing green, fuchsia pink, electric blue) will feel naturally connected to the site and get more plays.</p>
      </div>
      <div class="doc-section">
        <h3>2. Fast Loading and Instant Transition to Gameplay (Instant Fun)</h3>
        <p>Kids have short patience. Avoid long loading screens, complex intro videos, or complicated setup. Take the player directly to the main screen with a prominent "Play Now" button.</p>
      </div>
      <div class="doc-section">
        <h3>3. Add Retro Music (8-bit) and Sound Effects</h3>
        <p>Sound makes up 50% of the experience! Bouncy retro-style background music and sound effects for jumping, missing, and collecting points will make the game especially addictive. *Tip: don't forget to add a mute button.*</p>
      </div>
      <div class="doc-section">
        <h3>4. Simple Yet Challenging Mechanics (Easy to Learn, Hard to Master)</h3>
        <p>The best games are ones that can be understood in two seconds (e.g. Snake or Brick Breaker) but are very hard to get a high score in. This creates a challenge that encourages players to try again and again.</p>
      </div>
    `
  };

  // Render article content helper
  function displayArticle(docKey) {
    const area = document.getElementById('doc-content-area');
    area.innerHTML = docArticles[docKey] || '';
  }

  // Initial render of first article
  displayArticle('getting-started');

  // Bind tab buttons click handler
  const docBtns = document.querySelectorAll('.doc-tab-btn');
  docBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Toggle active states
      docBtns.forEach(b => b.classList.remove('active-doc-tab'));
      btn.classList.add('active-doc-tab');
      
      // Load content
      const docKey = btn.getAttribute('data-doc');
      displayArticle(docKey);
    });
  });
}
