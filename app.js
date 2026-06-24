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
  recordGamePlay,
  rateGame,
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
  setResendConfig,
  getResendConfigState,
  isPrivilegedRole,
  getPrivilegedAccountRequirements
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
  return merged;
}

function saveSupportThreads(threads) {
  localStorage.setItem('diggy_support_threads', JSON.stringify(threads));
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
    listEl.innerHTML = '<div class="support-chat-empty">אין פניות פתוחות כרגע.</div>';
    contentEl.innerHTML = '<div class="support-chat-empty">לא נבחרה פנייה.</div>';
    return;
  }

  listEl.innerHTML = threads.map(thread => {
    const lastMsg = thread.messages[thread.messages.length - 1];
    const isActive = thread.id === effectiveThreadId;
    return `
      <button class="support-thread-card ${isActive ? 'active' : ''}" data-thread-id="${thread.id}">
        <div class="support-thread-title">${thread.subject}</div>
        <div class="support-thread-meta">${thread.name} · ${thread.email}</div>
        <div class="support-thread-preview">${lastMsg ? lastMsg.text : 'ללא הודעות'}</div>
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
      <div class="support-thread-meta">נוצר: ${new Date(activeThread.createdAt).toLocaleString()}</div>
    </div>
    <div class="support-thread-messages">${messagesHtml}</div>
    <form id="support-reply-form" class="support-reply-form">
      <textarea id="support-reply-input" rows="3" placeholder="הקלד תגובה לאדם שנותן תמיכה..."></textarea>
      <button class="btn btn-primary" type="submit"><i class="fas fa-paper-plane"></i> שלח</button>
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
          <h2 style="color: #00ff66;">תגובה חדשה מהצוות של DIGGY</h2>
          <p>היי ${activeThread.name},</p>
          <p>${message}</p>
          <p>לשאלות נוספות, ניתן להשיב ישירות לאימייל זה.</p>
        </div>
      `;
      await sendEmailViaResend(customerEmail, `DIGGY - תגובה חדשה לתמיכה`, html);
      showToast('התגובה נשלחה למשתמש!', 'success');
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
    <div class="rating-input-label">דרג את המשחק:</div>
    <div class="star-rating-input" id="star-input-btns">
      ${[1, 2, 3, 4, 5].map(n => `
        <button type="button" class="star-input-btn ${existingRating >= n ? 'selected' : ''}" data-score="${n}" title="${n} כוכבים">
          <i class="${existingRating >= n ? 'fas' : 'far'} fa-star"></i>
        </button>
      `).join('')}
    </div>
    ${existingRating ? `<div class="rating-user-msg">דרגת ${existingRating} כוכבים</div>` : ''}
  `;

  container.querySelectorAll('.star-input-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const score = parseInt(btn.getAttribute('data-score'), 10);
      if (getUserRatingForGame(gameId)) {
        showToast('כבר דירגת משחק זה!', 'warning');
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
        showToast('תודה על הדירוג! ⭐', 'success');
        setupGameRatingUI(gameId);
      } catch (err) {
        showToast('שגיאה בשמירת הדירוג', 'danger');
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
      <span>מסך הבית</span>
    </div>
    <div class="nav-item" id="articles-nav-btn" data-route="#/articles">
      <i class="fas fa-newspaper"></i>
      <span>מאמרים וחדשות</span>
    </div>
  `;

  // Add category navigation
  navItems += `
    <div class="nav-section-title">קטגוריות</div>
    <div class="nav-item" data-category="ALL">
      <i class="fas fa-th-large"></i>
      <span>הכל</span>
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
        <div class="nav-section-title">פיתוח</div>
        <div class="nav-item" id="dev-nav-btn" data-route="#/dev">
          <i class="fas fa-code"></i>
          <span>פאנל מפתח</span>
        </div>
        <div class="nav-item" id="dev-docs-btn" data-route="#/dev-docs">
          <i class="fas fa-book"></i>
          <span>מדריך מפתחים</span>
        </div>
      `;
    }

    if (state.user.role === 'admin') {
      navItems += `
        <div class="nav-item" id="admin-nav-btn" data-route="#/admin">
          <i class="fas fa-shield-alt"></i>
          <span>ניהול מערכת</span>
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
      <div class="category-tabs" style="display: flex; gap: 10px; flex-wrap: wrap;">
        <button class="btn btn-secondary active-cat" data-category="ALL" style="padding: 6px 14px; font-size: 11px;">הכל</button>
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

  console.log("renderGamesGrid called with category:", categoryFilter);
  console.log("Total games:", state.games.length);
  console.log("Games with categories:", state.games.filter(g => g.categories && g.categories.length > 0).length);

  const filtered = categoryFilter === 'ALL' 
    ? state.games 
    : state.games.filter(g => g.categories && g.categories.includes(categoryFilter));

  console.log("Filtered games count:", filtered.length);
  console.log("Filtered games:", filtered.map(g => ({ name: g.name, categories: g.categories })));

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
          <i class="fas fa-code-branch"></i> מפתח: ${game.developerName}
        </div>
        ${renderStarsDisplay(rating, count, 'card-size')}
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
        showToast(`יותר מדי ניסיונות כניסה. נסה שוב בעוד ${rateLimit.remainingTime} דקות.`, "danger");
        return;
      }
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
        recordLoginAttempt(username);
        const profile = await logInUser(username, password);
        
        // Clear login attempts on successful login
        clearLoginAttempts(username);
        
        const requirementStatus = getPrivilegedAccountRequirements(profile);
        if (requirementStatus.required && !requirementStatus.complete) {
          showLoader(false);
          showToast("לפני הכניסה למערכת עליך להשלים הגדרות אבטחה: אימות דו-שלבי וכתובת תמיכה.", "danger");
          navigateTo('#/settings');
          return;
        }

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
    const destEmail = profile.twoFactorEmail || profile.email || 'diggy-games@outlook.com';
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
          : (req.status === 'approved' 
              ? `<div style="display: flex; gap: 6px;">
                  <button class="btn btn-secondary view-stats-btn" data-id="${req.id}" style="padding: 4px 8px; font-size: 11px; background: rgba(0, 255, 102, 0.05); color: var(--accent-color); border-color: rgba(0,255,102,0.2);"><i class="fas fa-chart-line"></i> סטטיסטיקות</button>
                  <button class="btn btn-primary new-version-btn" data-id="${req.id}" style="padding: 4px 8px; font-size: 11px;"><i class="fas fa-code-branch"></i> גרסה חדשה</button>
                 </div>` 
              : '<span style="color: var(--text-dark); font-size: 12px;">אין פעולות</span>');

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
        <label>קישור למשחק פעיל (Playable URL / GitHub Pages / iframe)</label>
        <input type="url" id="game-url" value="${editData ? (editData.gameUrl || '') : ''}" required placeholder="https://username.github.io/my-game/">
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

function openGameStatsModal(req) {
  const overlay = document.getElementById('modal-overlay');
  const modalTitle = document.getElementById('modal-title');
  const modalBody = document.getElementById('modal-body');

  modalTitle.textContent = `סטטיסטיקות משחק: ${req.name}`;
  
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
          <div style="font-size: 12px; color: var(--text-muted); text-transform: uppercase;">כמות משחקים (Plays)</div>
          <div style="font-size: 28px; font-weight: bold; color: var(--accent-color); margin-top: 5px; font-family: var(--font-display);">${plays}</div>
        </div>

        <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 12px; padding: 15px; text-align: center; box-shadow: var(--border-glow);">
          <i class="fas fa-star" style="font-size: 24px; color: #ffd700; margin-bottom: 8px;"></i>
          <div style="font-size: 12px; color: var(--text-muted); text-transform: uppercase;">דירוג שחקנים</div>
          <div style="font-size: 28px; font-weight: bold; color: #fff; margin-top: 5px; font-family: var(--font-display);">${rating} <span style="font-size: 14px; color: var(--text-muted);">/ 5.0</span></div>
        </div>

        <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 12px; padding: 15px; text-align: center; box-shadow: var(--border-glow);">
          <i class="fas fa-hourglass-half" style="font-size: 24px; color: #70d6ff; margin-bottom: 8px;"></i>
          <div style="font-size: 12px; color: var(--text-muted); text-transform: uppercase;">זמן משחק ממוצע</div>
          <div style="font-size: 22px; font-weight: bold; color: #fff; margin-top: 10px; font-family: var(--font-display);">${avgTime} דק'</div>
        </div>

        <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 12px; padding: 15px; text-align: center; box-shadow: var(--border-glow);">
          <i class="fas fa-coins" style="font-size: 24px; color: #00ff66; margin-bottom: 8px;"></i>
          <div style="font-size: 12px; color: var(--text-muted); text-transform: uppercase;">רווחים שנצברו</div>
          <div style="font-size: 22px; font-weight: bold; color: #00ff66; margin-top: 10px; font-family: var(--font-display);">${earnings} ₪</div>
        </div>
      </div>

      <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 12px; padding: 15px; font-size: 13px; line-height: 1.5; color: var(--text-muted);">
        <i class="fas fa-circle-info" style="color: var(--accent-color); margin-left: 5px;"></i>
        הרווחים מחושבים לפי מפתח תגמול של 0.15 ₪ לכל משחק פעיל של שחקן רשום באתר. תשלומים מועברים בסוף כל חודש קלנדרי.
      </div>
    </div>
  `;

  overlay.classList.add('active');
}

function openNewVersionModal(req) {
  const overlay = document.getElementById('modal-overlay');
  const modalTitle = document.getElementById('modal-title');
  const modalBody = document.getElementById('modal-body');

  modalTitle.textContent = `הגשת גרסה חדשה: ${req.name}`;
  
  modalBody.innerHTML = `
    <form id="game-version-form">
      <div style="background: rgba(255, 255, 255, 0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 8px; padding: 12px; margin-bottom: 15px; font-size: 13px; color: var(--text-muted);">
        <i class="fas fa-info-circle" style="color: var(--accent-color); margin-left: 5px;"></i>
        אתה מגיש כעת עדכון גרסה למשחק פעיל. בקשה זו תועבר לבדיקה של מנהל המערכת (Admin) ותעודכן באתר לאחר אישורה.
      </div>

      <div class="form-group">
        <label>שם המשחק (לא ניתן לשינוי)</label>
        <input type="text" id="version-game-name" value="${req.name}" disabled style="background: rgba(255,255,255,0.02); color: var(--text-muted); cursor: not-allowed;">
      </div>
      
      <div class="form-group">
        <label>מספר הגרסה החדש (למשל: v1.1.0, v2.0)</label>
        <input type="text" id="version-number" required placeholder="v1.1.0">
      </div>
      
      <div class="form-group">
        <label>מה חדש בגרסה הזו? (Changelog)</label>
        <textarea id="version-changelog" required placeholder="פרט כאן את רשימת השינויים, תיקוני הבאגים והשיפורים בגרסה זו..." rows="4"></textarea>
      </div>

      <div class="form-group">
        <label>קישור מעודכן למשחק פעיל (Playable URL)</label>
        <input type="url" id="version-url" value="${req.gameUrl || ''}" required placeholder="https://username.github.io/my-game/">
      </div>

      <div class="form-group">
        <label>קישור מעודכן למאגר GitHub (קוד המשחק)</label>
        <input type="url" id="version-github" value="${req.githubUrl || ''}" required placeholder="https://github.com/user/repo">
      </div>

      <button type="submit" class="btn btn-primary" style="width: 100%; justify-content: center; margin-top: 15px;">
        <i class="fas fa-paper-plane"></i> שלח גרסה חדשה לאישור
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
      showToast("גרסת המשחק החדשה נשלחה לאישור המנהל! 🚀", "success");
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

    <!-- Support Chat Section -->
    <div class="section-title">צ'אט תמיכה / Admin Inbox</div>
    <div class="support-chat-shell">
      <div class="support-chat-list" id="admin-support-thread-list"></div>
      <div class="support-chat-content" id="admin-support-thread-content"></div>
    </div>

    <!-- EmailJS Configuration Section -->
    <div class="section-title">הגדרות EmailJS ואימיילים</div>
    <div class="data-table-container" style="padding: 20px;">
      <div class="form-group">
        <label>אימייל תמיכה</label>
        <input type="email" id="site-support-email" value="${getSiteEmailSettings().supportEmail || 'diggy-games@outlook.com'}" placeholder="diggy-games@outlook.com">
      </div>
      <div class="form-group">
        <label>אימייל משפטי / DMCA</label>
        <input type="email" id="site-legal-email" value="${getSiteEmailSettings().legalEmail || ''}" placeholder="legal@yourdomain.com">
      </div>
      <div class="form-group">
        <label>אימייל התראות</label>
        <input type="email" id="site-notification-email" value="${getSiteEmailSettings().notificationEmail || ''}" placeholder="alerts@yourdomain.com">
      </div>
      <div class="form-group">
        <label>Service ID</label>
        <input type="text" id="emailjs-service-id" value="${getResendConfigState().serviceId || ''}" placeholder="service_xxxxx">
      </div>
      <div class="form-group">
        <label>Template ID</label>
        <input type="text" id="emailjs-template-id" value="${getResendConfigState().templateId || ''}" placeholder="template_xxxxx">
      </div>
      <div class="form-group">
        <label>Public Key</label>
        <input type="password" id="emailjs-public-key" value="${getResendConfigState().publicKey || ''}" placeholder="public_key">
      </div>
      <div class="form-group">
        <label>שם שולח</label>
        <input type="text" id="emailjs-from-name" value="${getResendConfigState().fromName || 'DIGGY Games'}" placeholder="DIGGY Games">
      </div>
      <div class="form-group">
        <label>כתובת תמיכה לאדמין</label>
        <input type="email" id="support-admin-email" value="${localStorage.getItem('diggy_support_admin_email') || 'diggy-games@outlook.com'}" placeholder="diggy-games@outlook.com">
      </div>
      <button class="btn btn-primary" id="save-resend-config-btn" style="margin-top: 10px;"><i class="fas fa-save"></i> שמור הגדרות EmailJS</button>
      <p style="margin-top: 10px; color: var(--text-muted); font-size: 13px;">ב-EmailJS יש ליצור Service, Template עם שדות: to_email, subject, message, message_html, reply_to, from_name.</p>
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

  renderAdminSupportChat(state.supportActiveThreadId);

  // Bind direct upload
  document.getElementById('admin-direct-upload-btn').addEventListener('click', () => {
    openAdminDirectUploadModal();
  });

  const saveResendBtn = document.getElementById('save-resend-config-btn');
  if (saveResendBtn) {
    saveResendBtn.addEventListener('click', () => {
      const serviceId = document.getElementById('emailjs-service-id').value;
      const templateId = document.getElementById('emailjs-template-id').value;
      const publicKey = document.getElementById('emailjs-public-key').value;
      const fromName = document.getElementById('emailjs-from-name').value;
      const adminEmail = document.getElementById('support-admin-email').value;
      const supportEmail = document.getElementById('site-support-email').value;
      const legalEmail = document.getElementById('site-legal-email').value;
      const notificationEmail = document.getElementById('site-notification-email').value;
      setResendConfig(serviceId, templateId, publicKey, fromName);
      saveSiteEmailSettings({
        supportEmail,
        legalEmail,
        notificationEmail
      });
      if (adminEmail) {
        localStorage.setItem('diggy_support_admin_email', adminEmail);
      }
      showToast('הגדרות EmailJS ואימיילים נשמרו.', 'success');
    });
  }

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

        const typeBadge = req.type === 'version_update' 
          ? `<span class="badge badge-pending" style="background: rgba(112, 214, 255, 0.15); color: #70d6ff; border-color: rgba(112,214,255,0.3); margin-top: 4px; display: inline-block;">עדכון גרסה (${req.version})</span>`
          : '';

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
                  <div style="font-weight: bold; color: var(--accent-color);">${req.name} ${typeBadge}</div>
                  <div style="font-size: 11px; color: var(--text-muted);">איך משחקים: ${req.howToPlay}</div>
                </div>
              </div>
            </td>
            <td>${req.categories ? req.categories.join(', ') : ''}</td>
            <td><a href="${req.githubUrl}" target="_blank" style="color: #0096ff; text-decoration: underline; font-size: 12px;">מקור קוד</a></td>
            <td>
              ${req.type === 'version_update'
                ? `<div style="font-size: 12px; color: var(--accent-color);"><strong>מה חדש בגרסה:</strong> ${req.changelog}</div>`
                : `<div style="font-size: 12px;"><strong>מיועד ל:</strong> ${req.targetAudience}</div>
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
        <label>קישור למשחק פעיל (Playable URL / GitHub Pages / iframe)</label>
        <input type="url" id="direct-url" required placeholder="https://username.github.io/my-game/">
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
          <span class="game-meta-label">דירוג שחקנים</span>
          <div id="game-rating-display"></div>
        </div>

        <div class="game-meta-item" id="game-rating-input-wrap">
          <div id="game-rating-input"></div>
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

  setupGameRatingUI(gameId);
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
      ${(() => {
        const requirementStatus = getPrivilegedAccountRequirements(state.user);
        if (requirementStatus.required) {
          return `
            <div style="width: 100%; padding: 14px 16px; border-radius: 12px; background: ${requirementStatus.complete ? 'rgba(0,255,102,0.08)' : 'rgba(255,170,0,0.12)'}; border: 1px solid ${requirementStatus.complete ? 'rgba(0,255,102,0.25)' : 'rgba(255,170,0,0.25)'}; margin-bottom: 20px;">
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                <i class="fas ${requirementStatus.complete ? 'fa-shield-alt' : 'fa-exclamation-triangle'}" style="color: ${requirementStatus.complete ? 'var(--accent-color)' : '#ffaa00'};"></i>
                <strong style="font-size: 14px;">${requirementStatus.complete ? 'החשבון מוכן לשימוש' : 'נדרשות הגדרות אבטחה לפיתוח/ניהול'}</strong>
              </div>
              <div style="font-size: 13px; color: var(--text-muted); line-height: 1.6;">
                ${requirementStatus.complete ? 'כל הדרישות הושלמו ותוכל להמשיך לעבוד עם החשבון.' : `לפני המשך העבודה יש להשלים:${requirementStatus.missingItems.includes('twoFactor') ? '<br>• הפעלת אימות דו-שלבי' : ''}${requirementStatus.missingItems.includes('supportEmail') ? '<br>• הזנת כתובת תמיכה פנימית' : ''}`}
              </div>
            </div>
          `;
        }
        return '';
      })()}

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
                <span style="font-size: 12px; color: var(--text-muted);">שלח קוד אבטחה בכל חיבור</span>
              </div>
              <input type="checkbox" id="settings-2fa-toggle" ${state.user.twoFactorEnabled ? 'checked' : ''} style="width: 20px; height: 20px; accent-color: var(--accent-color); cursor: pointer;">
            </div>
            
            <div id="settings-2fa-email-group" style="display: ${state.user.twoFactorEnabled ? 'block' : 'none'}; margin-top: 15px;">
              <div class="form-group">
                <label>כתובת אימייל לשליחת הקוד</label>
                <input type="email" id="settings-2fa-email" value="${state.user.twoFactorEmail || ''}" placeholder="myemail@example.com">
              </div>
            </div>

            ${isPrivilegedRole(state.user.role) ? `
              <div style="margin-top: 15px;">
                <div class="form-group">
                  <label>כתובת תמיכה פנימית (למפתח/Admin)</label>
                  <input type="email" id="settings-support-email" value="${state.user.supportEmail || ''}" placeholder="support@yourdomain.com">
                </div>
              </div>
            ` : ''}
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
    const passwordValidation = validatePasswordStrength(newPass);
    
    if (!passwordValidation.valid) {
      showToast(passwordValidation.errors[0], "danger");
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
      if (isPrivilegedRole(state.user.role)) {
        toggle2fa.checked = true;
        group2fa.style.display = 'block';
        showToast("למשתמשי מפתח/Admin חובה להפעיל אימות דו-שלבי.", "danger");
        return;
      }

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
    const val = sanitizeInput(input2faEmail.value.trim());
    if (!val) {
      showToast("יש להזין כתובת אימייל לשליחת הקוד", "danger");
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
    showToast("כתובת אימות דו-שלבי עודכנה!", "success");
    showLoader(false);
  });

  const inputSupportEmail = document.getElementById('settings-support-email');
  if (inputSupportEmail) {
    inputSupportEmail.addEventListener('change', async () => {
      const val = sanitizeInput(inputSupportEmail.value.trim());
      if (!val) {
        showToast("יש להזין כתובת תמיכה פנימית", "danger");
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
      showToast("כתובת התמיכה נשמרה בהצלחה!", "success");
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

// --- PUBLIC ARTICLES ---
const PUBLIC_ARTICLES = {
  'welcome': {
    title: 'ברוכים הבאים ל-DIGGY Arena',
    date: '15 יוני 2026',
    icon: 'fa-rocket',
    excerpt: 'גלו את עולם המשחקים החדש לילדים — ארקייד, רטרו וקז\'ואל במקום אחד.',
    content: `
      <p>ברוכים הבאים ל-<strong>DIGGY Arena</strong> — פלטפורמת המשחקים המובילה לילדים ולנוער בישראל. כאן תמצאו מגוון רחב של משחקי ארקייד, רטרו וקז\'ואל שפותחו על ידי מפתחים מקומיים ובינלאומיים.</p>
      <h3>מה מחכה לכם?</h3>
      <ul>
        <li>משחקים חינמיים לחלוטין — ללא פרסומות</li>
        <li>קטגוריות מגוונות: RPG, RETRO, ACTION, PUZZLE ועוד</li>
        <li>מערכת דירוג כוכבים לכל משחק</li>
        <li>אפשרות לשמור משחקים מועדפים (לאחר הרשמה)</li>
      </ul>
      <p>הירשמו בחינם, בחרו משחק מהקטלוג, ותתחילו לשחק!</p>
    `
  },
  'safe-gaming': {
    title: 'משחקים בטוחים ברשת — מדריך לילדים',
    date: '10 יוני 2026',
    icon: 'fa-shield-alt',
    excerpt: 'טיפים חשובים לשחק בצורה בטוחה ומהנה באינטרנט.',
    content: `
      <p>האינטרנט הוא מקום מדהים לשחק וללמוד, אבל חשוב לשחק בחוכמה. הנה כמה כללים בסיסיים:</p>
      <ul>
        <li><strong>אל תשתפו מידע אישי</strong> — לא שם מלא, כתובת, מספר טלפון או סיסמאות</li>
        <li><strong>ספרו להורים</strong> — אם משהו מרגיש לא נכון, ספרו למבוגר</li>
        <li><strong>קחו הפסקות</strong> — קום וזוז כל 30 דקות</li>
        <li><strong>שחקו רק באתרים מוכרים</strong> — DIGGY בודק כל משחק לפני פרסום</li>
      </ul>
    `
  },
  'parents-guide': {
    title: 'מדריך להורים — DIGGY Arena',
    date: '8 יוני 2026',
    icon: 'fa-users',
    excerpt: 'כל מה שהורים צריכים לדעת על הפלטפורמה שלנו.',
    content: `
      <p>DIGGY Arena נועדה לספק סביבת משחקים בטוחה וחינוכית לילדים. כל משחק עובר בדיקת איכות ואישור מנהל לפני פרסום.</p>
      <h3>מה אנחנו מבטיחים?</h3>
      <ul>
        <li>ללא פרסומות או קישורים חיצוניים בתוך המשחקים</li>
        <li>ללא איסוף מידע אישי מילדים ללא הסכמת הורים</li>
        <li>תוכן מותאם לגיל — ללא אלימות או תכנים פוגעניים</li>
        <li>אפשרות לאימות דו-שלבי לחשבונות</li>
      </ul>
      <p>לשאלות נוספות, פנו אלינו דרך <a href="#/contact" style="color: var(--accent-color);">דף צור קשר</a>.</p>
    `
  },
  'community': {
    title: 'כללי קהילה DIGGY',
    date: '5 יוני 2026',
    icon: 'fa-handshake',
    excerpt: 'כיצד לשמור על קהילה נעימה, מכבדת ומהנה.',
    content: `
      <p>קהילת DIGGY בנויה על כבוד הדדי. אנו מצפים מכל המשתמשים:</p>
      <ul>
        <li>לדרג משחקים בכנות ובהגינות</li>
        <li>לא לנסות לפרוץ או לפגוע במערכת</li>
        <li>לדווח על תוכן בעייתי דרך דף צור קשר</li>
        <li>לכבד מפתחים ושחקנים אחרים</li>
      </ul>
      <p>הפרה של כללי הקהילה עלולה להוביל לחסימת חשבון.</p>
    `
  },
  'top-games': {
    title: 'המשחקים הפופולריים השבוע',
    date: '1 יוני 2026',
    icon: 'fa-fire',
    excerpt: 'אלו המשחקים שזכו לדירוג הגבוה ביותר השבוע.',
    content: `
      <p>כל שבוע אנו מפרסמים את המשחקים המובילים לפי דירוג שחקנים וכמות משחקים. הנה הנבחרים:</p>
      <ul>
        <li><strong>Neon Snake</strong> — קלאסיקת הארקייד עם עיצוב ניאון מרהיב ⭐ 4.8</li>
        <li><strong>Space Laser Evader</strong> — משחק חלל מאתגר ⭐ 4.9</li>
        <li><strong>Brick Breaker Glow</strong> — שובר לבנים עם אפקטים זוהרים ⭐ 4.6</li>
      </ul>
      <p>דרגו את המשחקים האהובים עליכם ועזרו לקהילה לגלות פנינים חדשות!</p>
    `
  },
  'ratings-guide': {
    title: 'איך עובדת מערכת הדירוג?',
    date: '28 מאי 2026',
    icon: 'fa-star',
    excerpt: 'הסבר על מערכת הכוכבים — דרגו משחקים ועזרו לקהילה.',
    content: `
      <p>ב-DIGGY כל שחקן יכול לדרג משחק פעם אחת בלבד, בסולם של 1–5 כוכבים.</p>
      <h3>איך לדרג?</h3>
      <ul>
        <li>היכנסו לדף המשחק</li>
        <li>בצד ימין תראו "דרג את המשחק"</li>
        <li>לחצו על מספר הכוכבים שמתאים לחוויה שלכם</li>
      </ul>
      <p>הדירוג הממוצע מוצג על כרטיס המשחק ובדף הפרטים. מפתחים מקבלים בונוס תגמול על משחקים עם דירוג גבוה!</p>
    `
  },
  'new-features': {
    title: 'חידושים ועדכונים — יוני 2026',
    date: '20 יוני 2026',
    icon: 'fa-sparkles',
    excerpt: 'מערכת דירוג חדשה, מאמרים ציבוריים ושיפורי ניווט.',
    content: `
      <p>אנחנו שמחים לעדכן על חידושים חדשים בפלטפורמה:</p>
      <ul>
        <li><strong>מערכת דירוג כוכבים</strong> — דרגו כל משחק וראו את הדירוג הממוצע</li>
        <li><strong>מאמרים וחדשות</strong> — תוכן חדש לשחקנים והורים</li>
        <li><strong>מפת אתר משופרת</strong> — ניווט קל לכל הדפים</li>
        <li><strong>דפי מידע משפטי</strong> — תנאי שימוש, פרטיות וצור קשר</li>
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
        <h1>מאמרים וחדשות</h1>
        <p style="color: var(--text-muted); margin-top: 5px;">טיפים, מדריכים ועדכונים מעולם DIGGY</p>
      </div>
    </div>
    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; margin-top: 20px;">
      ${articles.map(([slug, art]) => `
        <div class="article-card" data-slug="${slug}">
          <div class="article-card-date"><i class="fas fa-calendar-alt"></i> ${art.date}</div>
          <h3 class="article-card-title"><i class="fas ${art.icon}" style="color: var(--accent-color); margin-left: 8px;"></i>${art.title}</h3>
          <p class="article-card-excerpt">${art.excerpt}</p>
          <span style="color: var(--accent-color); font-size: 13px; margin-top: 10px; display: inline-block;">קרא עוד ←</span>
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
        <h2>מאמר לא נמצא</h2>
        <button class="btn btn-primary" onclick="window.location.hash='#/articles'" style="margin-top: 20px;">חזרה למאמרים</button>
      </div>
    `;
    return;
  }

  main.innerHTML = `
    <div style="margin-bottom: 20px;">
      <a href="#/articles" style="color: var(--accent-color); font-size: 14px;"><i class="fas fa-chevron-right"></i> חזרה לכל המאמרים</a>
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
        <h1>מפת האתר</h1>
        <p style="color: var(--text-muted); margin-top: 5px;">כל הדפים והקישורים באתר DIGGY Arena</p>
      </div>
    </div>
    <div class="legal-page-content">
      <div class="sitemap-grid">
        <div class="sitemap-group">
          <h3><i class="fas fa-home"></i> עמודים ראשיים</h3>
          <ul>
            <li><a href="#/">מסך הבית — קטלוג משחקים</a></li>
            <li><a href="#/articles">מאמרים וחדשות</a></li>
            <li><a href="#/login">הרשמה / כניסה</a></li>
            <li><a href="#/settings">הגדרות פרופיל</a></li>
          </ul>
        </div>
        <div class="sitemap-group">
          <h3><i class="fas fa-gamepad"></i> משחקים (${state.games.length})</h3>
          <ul>${gameLinks || '<li>אין משחקים</li>'}</ul>
        </div>
        <div class="sitemap-group">
          <h3><i class="fas fa-newspaper"></i> מאמרים</h3>
          <ul>${articleLinks}</ul>
        </div>
        <div class="sitemap-group">
          <h3><i class="fas fa-gavel"></i> מידע משפטי</h3>
          <ul>
            <li><a href="#/terms">תנאי שימוש</a></li>
            <li><a href="#/privacy">מדיניות פרטיות</a></li>
            <li><a href="#/contact">צור קשר / זכויות יוצרים</a></li>
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
        <h1>תנאי שימוש</h1>
        <p style="color: var(--text-muted); margin-top: 5px;">עודכן לאחרונה: יוני 2026</p>
      </div>
    </div>
    <div class="legal-page-content">
      <div class="doc-section">
        <h3>1. קבלת התנאים</h3>
        <p>שימוש באתר DIGGY Arena מהווה הסכמה לתנאי שימוש אלה. אם אינך מסכים — אנא אל תשתמש באתר.</p>
      </div>
      <div class="doc-section">
        <h3>2. זכויות יוצרים</h3>
        <p>כל התוכן באתר — עיצוב, לוגו, טקסטים וממשק — שייך ל-DIGGY Arena Ltd. אלא אם צוין אחרת. משחקים שפורסמו באתר שייכים למפתחיהם, והם מעניקים ל-DIGGY רישיון להציגם.</p>
        <p>בעלי זכויות יוצרים שמזהים הפרה יכולים לפנות אלינו דרך <a href="#/contact" style="color: var(--accent-color);">דף צור קשר</a> עם פרטי ההפרה. נטפל בפניות תוך 48 שעות.</p>
      </div>
      <div class="doc-section">
        <h3>3. שימוש מותר</h3>
        <p>האתר מיועד לשחק משחקים, לדרגם ולקרוא תוכן. אסור לפרוץ, להעתיק, לסרוק או לעשות שימוש מסחרי ללא אישור.</p>
      </div>
      <div class="doc-section">
        <h3>4. הגבלת אחריות</h3>
        <p>DIGGY Arena מספקת את השירות "כפי שהוא". איננו אחראים לנזקים הנובעים משימוש באתר או במשחקים של צד שלישי.</p>
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
        <h1>מדיניות פרטיות</h1>
        <p style="color: var(--text-muted); margin-top: 5px;">עודכן לאחרונה: יוני 2026</p>
      </div>
    </div>
    <div class="legal-page-content">
      <div class="doc-section">
        <h3>1. מידע שאנו אוספים</h3>
        <p>אנו אוספים: שם משתמש, כתובת אימייל (בהרשמה), העדפות משחק (מועדפים, היסטוריה) ודירוגים. לא נאסוף מידע מילדים מתחת לגיל 13 ללא הסכמת הורים.</p>
      </div>
      <div class="doc-section">
        <h3>2. שימוש במידע</h3>
        <p>המידע משמש להפעלת החשבון, שיפור חוויית המשחק, ותקשורת עם המשתמש. לא נמכור מידע לצד שלישי.</p>
      </div>
      <div class="doc-section">
        <h3>3. אחסון ואבטחה</h3>
        <p>נתונים נשמרים ב-Firebase/Google Cloud עם הצפנה. דירוגים ומועדפים נשמרים גם ב-localStorage בדפדפן.</p>
      </div>
      <div class="doc-section">
        <h3>4. זכויותיכם</h3>
        <p>ניתן לבקש מחיקת חשבון ונתונים דרך <a href="#/contact" style="color: var(--accent-color);">דף צור קשר</a>.</p>
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
        <h1>צור קשר</h1>
        <p style="color: var(--text-muted); margin-top: 5px;">נשמח לעזור — שחקנים, הורים ובעלי זכויות</p>
      </div>
    </div>
    <div class="legal-page-content">
      <div class="doc-section">
        <h3><i class="fas fa-envelope" style="color: var(--accent-color);"></i> יצירת קשר כללית</h3>
        <p>לשאלות, הצעות ותמיכה: <strong>${getSiteEmailSettings().supportEmail || 'diggy-games@outlook.com'}</strong></p>
      </div>

      <div class="doc-section" style="background: rgba(0,255,102,0.06); border: 1px solid rgba(0,255,102,0.16); border-radius: 12px; padding: 20px;">
        <h3><i class="fas fa-headset" style="color: var(--accent-color);"></i> שלח פנייה לתמיכה</h3>
        <p>הפנייה נרשמת בצ'אט פנימי של האדמין ונשלחת גם באימייל אם Resend מוגדר.</p>
        <form id="support-request-form" style="display: flex; flex-direction: column; gap: 12px; margin-top: 15px;">
          <input type="text" id="support-name" placeholder="שם מלא" required>
          <input type="email" id="support-email" placeholder="your@email.com" required>
          <input type="text" id="support-subject" placeholder="נושא הפנייה" required>
          <textarea id="support-message" rows="4" placeholder="תאר את הבעיה או השאלה שלך..." required></textarea>
          <button type="submit" class="btn btn-primary" style="width: fit-content; justify-content: center;"><i class="fas fa-paper-plane"></i> שלח פנייה</button>
        </form>
      </div>

      <div class="doc-section" style="background: rgba(255,200,0,0.05); border: 1px solid rgba(255,200,0,0.15); border-radius: 12px; padding: 20px;">
        <h3><i class="fas fa-copyright" style="color: #ffd700;"></i> בעלי זכויות יוצרים (DMCA)</h3>
        <p>אם אתם בעלי זכויות ומזהים תוכן המפר את זכויותיכם באתר שלנו, אנא שלחו אלינו:</p>
        <ul>
          <li>שם מלא ופרטי התקשרות</li>
          <li>תיאור היצירה המוגנת</li>
          <li>קישור לדף המשחק או התוכן הרלוונטי ב-DIGGY</li>
          <li>הצהרה שהשימוש אינו מורשה</li>
        </ul>
        <p>שלחו ל: <strong>${getSiteEmailSettings().legalEmail || 'diggy-games@outlook.com'}</strong> — נטפל בפניה תוך 48 שעות עסקיות.</p>
      </div>
      <div class="doc-section">
        <h3>קישורים מהירים</h3>
        <p>
          <a href="#/sitemap" style="color: var(--accent-color); margin-left: 15px;">מפת האתר</a>
          <a href="#/terms" style="color: var(--accent-color); margin-left: 15px;">תנאי שימוש</a>
          <a href="#/privacy" style="color: var(--accent-color);">מדיניות פרטיות</a>
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
        showToast('אנא מלא את כל השדות.', 'warning');
        return;
      }

      showLoader(true);
      try {
        const thread = createSupportThread({ name, email, subject, message });
        const adminEmail = getSiteEmailSettings().supportEmail || localStorage.getItem('diggy_support_admin_email') || 'diggy-games@outlook.com';
        const adminHtml = `
          <div style="font-family: sans-serif; background: #07080a; color: white; padding: 24px; border-radius: 12px; border: 1px solid #00ff66;">
            <h2 style="color: #00ff66;">פנייה חדשה לתמיכה - DIGGY</h2>
            <p><strong>שם:</strong> ${name}</p>
            <p><strong>אימייל:</strong> ${email}</p>
            <p><strong>נושא:</strong> ${subject}</p>
            <p><strong>הודעה:</strong> ${message}</p>
          </div>
        `;
        const userHtml = `
          <div style="font-family: sans-serif; background: #07080a; color: white; padding: 24px; border-radius: 12px; border: 1px solid #00ff66;">
            <h2 style="color: #00ff66;">קיבלנו את הפנייה שלך</h2>
            <p>היי ${name},</p>
            <p>הפנייה שלך נרשמה בצ'אט התמיכה של האדמין. נעדכן אותך בהקדם האפשרי.</p>
          </div>
        `;
        await sendEmailViaResend(adminEmail, `DIGGY Support: ${subject}`, adminHtml);
        await sendEmailViaResend(email, 'DIGGY - קיבלנו את הפנייה שלך', userHtml);
        showToast('הפנייה נשלחה בהצלחה! אנחנו נענה בקרוב.', 'success');
        form.reset();
      } catch (err) {
        showToast(err.message || 'שגיאה בשליחת הפנייה', 'danger');
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
        <h2>גישה חסומה!</h2>
        <p style="color: var(--text-muted); margin-top: 10px;">דף זה מיועד למפתחים מורשים בלבד.</p>
        <button class="btn btn-primary" onclick="window.location.hash='#/'" style="margin-top: 20px;">חזור למסך הבית</button>
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
        text-align: right;
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
        <h1>מדריכים ותיעוד מפתחים</h1>
        <p style="color: var(--text-muted); margin-top: 5px;">כל מה שצריך לדעת כדי לבנות ולהצליח עם משחקים ב-DIGGY</p>
      </div>
    </div>
    
    <div class="dev-docs-container" style="display: flex; gap: 30px; margin-top: 20px; align-items: flex-start;">
      <!-- Sidebar navigation for docs -->
      <div class="dev-docs-sidebar" style="width: 250px; background: var(--bg-card); border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 16px; padding: 15px; display: flex; flex-direction: column; gap: 8px; flex-shrink: 0; box-shadow: var(--border-glow);">
        <button class="doc-tab-btn active-doc-tab" data-doc="getting-started"><i class="fas fa-rocket"></i> כיצד זה עובד?</button>
        <button class="doc-tab-btn" data-doc="standards"><i class="fas fa-list-check"></i> סטנדרטים ודרישות</button>
        <button class="doc-tab-btn" data-doc="monetization"><i class="fas fa-coins"></i> תגמולים ורווחים</button>
        <button class="doc-tab-btn" data-doc="tips"><i class="fas fa-trophy"></i> איך להצליח?</button>
      </div>
      
      <!-- Doc Content Display area -->
      <div class="dev-docs-content" id="doc-content-area" style="flex-grow: 1; background: var(--bg-card); border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 16px; padding: 30px; min-height: 400px; box-shadow: var(--border-glow);">
        <!-- Loaded dynamically -->
      </div>
    </div>
  `;

  const docArticles = {
    'getting-started': `
      <h2 class="doc-article-title"><i class="fas fa-rocket"></i> כיצד עובדת מערכת העלאת המשחקים ב-DIGGY?</h2>
      <div class="doc-section">
        <p>פלטפורמת <strong>DIGGY</strong> מיועדת להביא משחקי רטרו, ארקייד וקז'ואל איכותיים ומרהיבים לילדים. המערכת מבוססת על הרצה פנימית של משחקי Web מבוססי HTML5/JS בתוך חלונות משחק (iframes) מאובטחים. מפתחים יכולים לבנות ולהגיש משחקים בקלות רבה.</p>
      </div>
      <div class="doc-section">
        <h3>השלבים להגשת משחק מוצלח באתר:</h3>
        <ul>
          <li><strong>בניית המשחק (Development):</strong> צור משחק קז'ואל אינטראקטיבי שרץ בדפדפן (HTML/JS/CSS). ניתן להשתמש בכל מנוע שתומך בייצוא ל-Web (כמו Unity, Godot, PixiJS, Phaser או Vanilla JS Canvas).</li>
          <li><strong>אירוח המשחק (Hosting):</strong> העלה את המשחק שלך לאוויר כדי שיהיה זמין בדפדפן. אנו ממליצים להשתמש ב-<strong>GitHub Pages</strong> שהוא שירות חינמי, יציב ומעולה לטעינת משחקים.</li>
          <li><strong>הגשת הבקשה (Submission):</strong> היכנס ללוח המפתח שלך ב-DIGGY, לחץ על "הגש משחק חדש", והזן את קישור המשחק הפעיל (Playable URL) ואת קישור קוד המקור ב-GitHub.</li>
          <li><strong>בדיקה ואישור (Admin Approval):</strong> מנהלי המערכת יבחנו את המשחק כדי לוודא תקינות. לאחר אישורו, המשחק יפורסם אוטומטית באתר ויופיע לכל השחקנים!</li>
        </ul>
      </div>
      <div class="doc-section">
        <h3>דוגמה למבנה בסיסי של קובץ HTML ראשי למשחק:</h3>
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
      <h2 class="doc-article-title"><i class="fas fa-list-check"></i> סטנדרטים ודרישות טכנולוגיות</h2>
      <div class="doc-section">
        <p>כדי לשמור על איכות גבוהה, רמת אבטחה מעולה וחווית משתמש רציפה עבור השחקנים שלנו, כל משחק המוגש לאתר DIGGY נדרש לעמוד בסטנדרטים הבאים:</p>
      </div>
      <div class="doc-section">
        <h3>1. עיצוב רספונסיבי והתאמה למסך</h3>
        <p>מכיוון שהמשחקים נטענים בתוך מסגרת משחק קבועה בדף, על המשחק שלך להתאים את עצמו בצורה חלקה לכל גודל חלון (מומלץ להשתמש ב-100% רוחב וגובה של ה-viewport או לתמוך ביחס גובה-רוחב גמיש).</p>
      </div>
      <div class="doc-section">
        <h3>2. קוד מקור (לבדיקת Admin בלבד)</h3>
        <p>מפתחים נדרשים לספק קישור לקוד המקור לצורך בדיקת איכות ואבטחה על ידי צוות הניהול. קישור זה <strong>אינו מוצג לציבור</strong> ומשמש אך ורק לתהליך האישור.</p>
      </div>
      <div class="doc-section">
        <h3>3. שמירה על סביבה בטוחה לילדים</h3>
        <ul>
          <li><strong>ללא פרסומות:</strong> חל איסור מוחלט לשלב פרסומות קופצות, מודעות וידאו או קישורים חיצוניים לרכישה.</li>
          <li><strong>ללא תוכן פוגעני:</strong> המשחקים צריכים להיות מותאמים לילדים בכל הגילאים, ללא תכנים אלימים או פוגעניים.</li>
          <li><strong>ללא איסוף מידע אישי:</strong> אין לבקש מהמשתמשים להזין פרטים אישיים, סיסמאות או אימיילים בתוך המשחק.</li>
        </ul>
      </div>
      <div class="doc-section">
        <h3>4. שימוש במקלדת, עכבר ומגע</h3>
        <p>ודא שהמשחק תומך במקשים סטנדרטיים (מקשי החצים, WASD, רווח) ועובד בצורה חלקה גם במכשירים ניידים אם ציינת שהמשחק מיועד גם להם.</p>
      </div>
    `,
    'monetization': `
      <h2 class="doc-article-title"><i class="fas fa-coins"></i> מערכת תגמולים ורווחים למפתחים</h2>
      <div class="doc-section">
        <p>ב-DIGGY אנו מעריכים את העבודה הקשה של המפתחים ומציעים מערכת תגמולים דינמית שמאפשרת לכם להרוויח על בסיס הפופולריות והאיכות של המשחקים שלכם!</p>
      </div>
      <div class="doc-section">
        <h3>איך עובד התגמול במערכת?</h3>
        <ul>
          <li><strong>תגמול על כמות כניסות (Play Milestone Bonus):</strong>
            <p>על כל שחקן רשום שמשחק במשחק שלך לפחות דקה אחת, המערכת מתגמלת אותך בנקודות מפתח (Developer Points) הניתנות להמרה לפרסים או למענקים כספיים.</p>
          </li>
          <li><strong>בונוס דירוג כוכבים (Star Rating multiplier):</strong>
            <p>משחקים המדורגים בדירוג ממוצע גבוה על ידי הקהילה (למשל, 4.5 כוכבים ומעלה) זוכים להכפלת התגמול היומי שלהם ולחשיפה מוגברת בעמוד הבית.</p>
          </li>
          <li><strong>אתגרי ותחרויות מפתחים (Monthly Hackathons):</strong>
            <p>בכל חודש אנו מכריזים על תחרות פיתוח סביב נושא מסוים (למשל "משחקי חלל ניאון"). משחקים שמגיעים לשלושת המקומות הראשונים זוכים בפרסים כספיים יקרי ערך ובתגים מיוחדים לפרופיל המפתח שלהם.</p>
          </li>
          <li><strong>תגמול קוד פתוח מוביל (Open Source Contribution):</strong>
            <p>קוד מקור שזוכה להכי הרבה כוכבים (Stars) ב-GitHub ומתוחזק היטב על ידי המפתח, מקבל מענק עידוד חודשי מטעם צוות DIGGY לפיתוח חינוכי.</p>
          </li>
        </ul>
      </div>
    `,
    'tips': `
      <h2 class="doc-article-title"><i class="fas fa-trophy"></i> טיפים ועצות ליצירת משחק מנצח</h2>
      <div class="doc-section">
        <p>רוצה שהמשחק שלך יגיע לראש טבלת הפופולריות ושכולם ישחקו בו? הנה כמה טיפים מנצחים מצוות העיצוב והפיתוח של DIGGY:</p>
      </div>
      <div class="doc-section">
        <h3>1. התאם לאסתטיקה של האתר - ניאון שחור וגלאסמורפיזם</h3>
        <p>המשתמשים של DIGGY רגילים לעיצוב יוקרתי, זוהר ומודרני. משחקים המשתמשים ברקעים כהים בשילוב אלמנטים זוהרים בצבעי ניאון (ירוק זוהר, ורוד פוקסיה, כחול חשמלי) ירגישו מחוברים בצורה טבעית לאתר ויקבלו יותר כניסות.</p>
      </div>
      <div class="doc-section">
        <h3>2. טעינה מהירה ומעבר מיידי למשחק (Instant Fun)</h3>
        <p>לילדים יש סבלנות קצרה. הימנע ממסכי טעינה ארוכים, סרטוני פתיחה מורכבים או הגדרות מסובכות. הבא את השחקן ישירות למסך הראשי עם כפתור "שחק עכשיו" בולט.</p>
      </div>
      <div class="doc-section">
        <h3>3. שילוב מוזיקת רטרו (8-bit) ואפקטים קוליים</h3>
        <p>סאונד יוצר 50% מהחוויה! מוזיקת רקע קופצנית בסגנון רטרו ואפקטים קוליים עבור קפיצה, פסילה, ולקיחת נקודות יהפכו את המשחק לממכר במיוחד. *טיפ: אל תשכח להוסיף כפתור השתקה (Mute).*</p>
      </div>
      <div class="doc-section">
        <h3>4. מכניקה פשוטה אך מאתגרת (Easy to Learn, Hard to Master)</h3>
        <p>המשחקים הטובים ביותר הם כאלה שניתן להבין בשתי שניות (למשל: סנייק או שובר לבנים) אך קשה מאוד להגיע בהם לניקוד גבוה. זה יוצר אתגר שמעודד את השחקנים לנסות שוב ושוב.</p>
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
