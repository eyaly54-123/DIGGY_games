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
  getFirebaseStatus,
  submitBugReport,
  getBugReports,
  deleteGame,
  containsProfanity,
  filterProfanity,
  logAdminAction,
  getAdminLogs,
  sendDevChatMessage,
  getDevChatMessages,
  updateGamePlayDuration,
  getGamePlayStatistics,
  firebaseLoaded,
  fallbackMode,
  firebaseFirestore,
  db,
  getLocalStorageData,
  saveLocalStorageData
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

// --- SOUND EFFECTS SYSTEM ---
const audioContext = new (window.AudioContext || window.webkitAudioContext)();
let soundEnabled = true;

function playClickSound() {
  if (!soundEnabled) return;
  
  try {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
  } catch (e) {
    console.error('Error playing sound:', e);
  }
}

function playHoverSound() {
  if (!soundEnabled) return;
  
  try {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 400;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.05, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.05);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.05);
  } catch (e) {
    console.error('Error playing sound:', e);
  }
}

// Attach sound effects to all buttons
function attachSoundEffects() {
  document.addEventListener('click', (e) => {
    if (e.target.closest('.btn') || e.target.closest('.nav-item') || e.target.tagName === 'BUTTON') {
      playClickSound();
    }
  });

  document.addEventListener('mouseenter', (e) => {
    if (e.target.closest('.btn') || e.target.closest('.nav-item')) {
      playHoverSound();
    }
  }, true);
}

// Initialize sound effects after DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', attachSoundEffects);
} else {
  attachSoundEffects();
}

// --- SECURITY LAYER ---
(function initSecurityLayer() {
  // Block right-click context menu
  document.addEventListener('contextmenu', e => e.preventDefault());

  // Block common DevTools keyboard shortcuts
  document.addEventListener('keydown', e => {
    const k = e.key.toUpperCase();
    if (e.key === 'F12') { e.preventDefault(); return false; }
    if (e.ctrlKey && e.shiftKey && ['I','J','C','K'].includes(k)) { e.preventDefault(); return false; }
    if (e.ctrlKey && !e.shiftKey && k === 'U') { e.preventDefault(); return false; }
  }, true);

  // Console security message (similar to Facebook's deterrent)
  const _warnStyle  = 'color:#ff3366;font-size:28px;font-weight:bold;font-family:monospace;';
  const _infoStyle  = 'color:#ccc;font-size:14px;font-family:sans-serif;';
  const _diggStyle  = 'color:#00ff66;font-size:12px;font-family:monospace;';
  setTimeout(() => {
    console.log('%c⚠  STOP!', _warnStyle);
    console.log('%cThis browser feature is for developers. If someone told you to paste something here, they may be trying to steal your account or cheat on the platform.', _infoStyle);
    console.log('%c[DIGGY Security] Unauthorized access attempts are logged and will result in a permanent account ban.', _diggStyle);
  }, 1500);

  // DevTools window-size detection (undocked panel heuristic)
  let _devWarnShown = false;
  function _checkDevToolsSize() {
    const threshold = 160;
    const open = (window.outerWidth - window.innerWidth > threshold) ||
                 (window.outerHeight - window.innerHeight > threshold);
    if (open && !_devWarnShown) {
      _devWarnShown = true;
      const el = document.createElement('div');
      el.id = 'diggy-devtools-guard';
      el.style.cssText = [
        'position:fixed;inset:0;background:rgba(5,6,8,0.97);',
        'z-index:99999;display:flex;flex-direction:column;',
        'align-items:center;justify-content:center;gap:18px;'
      ].join('');
      el.innerHTML = `
        <div style="color:#ff3366;font-size:52px;"><i class="fas fa-shield-alt"></i></div>
        <div style="color:#ff3366;font-family:Orbitron,sans-serif;font-size:22px;font-weight:bold;letter-spacing:2px;">SECURITY ALERT</div>
        <div style="color:#aaa;font-size:14px;text-align:center;max-width:320px;line-height:1.6;">
          Developer Tools are open.<br>
          Close DevTools to continue playing on DIGGY.
        </div>
      `;
      document.body.appendChild(el);
    } else if (!open && _devWarnShown) {
      _devWarnShown = false;
      const el = document.getElementById('diggy-devtools-guard');
      if (el) el.remove();
    }
  }
  setInterval(_checkDevToolsSize, 1200);
})();

// Re-validates the current user's role directly from Firebase before granting
// access to privileged pages. Returns true if role matches, false if not.
async function validateRoleFromFirebase(requiredRole) {
  if (!state.user) return false;
  try {
    const freshProfile = await getUserProfile(state.user.uid);
    if (!freshProfile) return false;
    // Sync role back in case it changed server-side
    if (freshProfile.role !== state.user.role) {
      state.user.role = freshProfile.role;
    }
    if (requiredRole === 'admin') return freshProfile.role === 'admin';
    if (requiredRole === 'developer') return freshProfile.role === 'developer' || freshProfile.role === 'admin';
    return true;
  } catch {
    return false;
  }
}

// --- RATING HELPERS ---
function getGameRatingInfo(game) {
  const count = game.ratingCount ?? 0;
  // Only show rating if there are actual ratings
  if (count === 0) {
    return { rating: 0, count: 0, display: "No ratings" };
  }
  const rating = parseFloat(game.rating ?? 5.0);
  return { rating, count, display: rating.toFixed(1) };
}

function renderStarsDisplay(rating, count, sizeClass = '') {
  if (rating === "No ratings" || count === 0) {
    return `<div class="star-rating-display ${sizeClass}"><span class="no-ratings">No ratings yet</span></div>`;
  }
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
      <div style="display: flex; gap: 10px; align-items: center;">
        <div class="support-thread-meta">Created: ${new Date(activeThread.createdAt).toLocaleString()}</div>
        <button id="close-ticket-btn" class="btn btn-danger" style="padding: 6px 12px; font-size: 12px;">
          <i class="fas fa-times"></i> Close Ticket
        </button>
      </div>
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

  // Close ticket button
  const closeBtn = document.getElementById('close-ticket-btn');
  if (closeBtn) {
    closeBtn.addEventListener('click', async () => {
      if (confirm('Are you sure you want to close this support ticket?')) {
        try {
          // Mark thread as closed
          const threads = getSupportThreads();
          const threadIndex = threads.findIndex(t => t.id === activeThread.id);
          if (threadIndex !== -1) {
            threads[threadIndex].status = 'closed';
            threads[threadIndex].closedAt = new Date().toISOString();
            threads[threadIndex].closedBy = state.user?.username || 'Admin';
            saveLocalStorageData('support_threads', threads);
          }

          // Log the action
          await logAdminAction('SUPPORT_TICKET_CLOSED', `Closed support ticket: ${activeThread.subject}`, state.user?.uid, state.user?.username);

          showToast('Support ticket closed successfully!', 'success');
          renderAdminSupportChat(null); // Refresh to show updated list
        } catch (err) {
          showToast('Failed to close ticket: ' + err.message, 'danger');
        }
      }
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
  '#/dev-stats': renderDevStats,
  '#/admin': renderAdmin,
  '#/settings': renderSettings,
  '#/articles': renderArticles,
  '#/sitemap': renderSitemap,
  '#/terms': renderTerms,
  '#/privacy': renderPrivacy,
  '#/contact': renderContact,
  '#/game/:id': renderGameDetails,
  '#/become-developer': renderBecomeDeveloper,
  '#/leaderboard': renderLeaderboard
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
      applyThemeMode(user.darkMode !== false);
      applyBrightness(user.brightness || 100);
      renderUserBadge();
      setupSidebarNavigation(); // Rebuild sidebar when user changes
    } else {
      state.user = null;
      applyTheme('#00ff66');
      applyThemeMode(true);
      applyBrightness(100);
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
    <div class="nav-item" id="leaderboard-nav-btn" data-route="#/leaderboard">
      <i class="fas fa-trophy"></i>
      <span>Leaderboard</span>
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
    <div class="nav-item" data-category="NEW">
      <i class="fas fa-star"></i>
      <span>New</span>
    </div>
    <div class="nav-item" data-category="RECENTLY_UPDATED">
      <i class="fas fa-sync-alt"></i>
      <span>Recently Updated</span>
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
    <div class="nav-item" data-category="STRATEGY">
      <i class="fas fa-chess"></i>
      <span>STRATEGY</span>
    </div>
    <div class="nav-item" data-category="HORROR">
      <i class="fas fa-ghost"></i>
      <span>HORROR</span>
    </div>
    <div class="nav-item" data-category="RACING">
      <i class="fas fa-flag-checkered"></i>
      <span>RACING</span>
    </div>
    <div class="nav-item" data-category="SIMULATION">
      <i class="fas fa-microchip"></i>
      <span>SIMULATION</span>
    </div>
  `;

  // Add role-specific navigation
  if (state.user) {
    if (state.user.role === 'player') {
      navItems += `
        <div class="nav-section-title">Developer</div>
        <div class="nav-item" id="become-dev-nav-btn" data-route="#/become-developer">
          <i class="fas fa-user-plus"></i>
          <span>Become a Developer</span>
        </div>
      `;
    }

    if (state.user.role === 'developer' || state.user.role === 'admin') {
      navItems += `
        <div class="nav-section-title">Development</div>
        <div class="nav-item" id="dev-nav-btn" data-route="#/dev">
          <i class="fas fa-code"></i>
          <span>Developer Panel</span>
        </div>
        <div class="nav-item" id="dev-stats-btn" data-route="#/dev-stats">
          <i class="fas fa-chart-line"></i>
          <span>Game Statistics</span>
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

  // Set initial active state for ALL category
  const allCategoryItem = navMenu.querySelector('[data-category="ALL"]');
  if (allCategoryItem) {
    allCategoryItem.classList.add('active');
  }

  // Bind click events
  document.getElementById('home-nav-btn').addEventListener('click', () => {
    navigateTo('#/');
  });

  const leaderboardNav = document.getElementById('leaderboard-nav-btn');
  if (leaderboardNav) {
    leaderboardNav.addEventListener('click', () => {
      navigateTo('#/leaderboard');
    });
  }

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
      // Update active state on sidebar items
      navMenu.querySelectorAll('[data-category]').forEach(catItem => {
        catItem.classList.remove('active');
      });
      item.classList.add('active');
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
  const becomeDevNav = document.getElementById('become-dev-nav-btn');
  if (becomeDevNav) {
    becomeDevNav.addEventListener('click', () => {
      navigateTo('#/become-developer');
    });
  }

  const devNav = document.getElementById('dev-nav-btn');
  if (devNav) {
    devNav.addEventListener('click', () => {
      navigateTo('#/dev');
    });
  }

  const devStatsNav = document.getElementById('dev-stats-btn');
  if (devStatsNav) {
    devStatsNav.addEventListener('click', () => {
      navigateTo('#/dev-stats');
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

  // Init custom scrollbar after nav content is rendered
  requestAnimationFrame(initCustomNavScrollbar);
}

// Custom accent scrollbar for the sidebar nav menu
let _navScrollbarCleanup = null;
function initCustomNavScrollbar() {
  // Tear down any previous listeners
  if (_navScrollbarCleanup) { _navScrollbarCleanup(); _navScrollbarCleanup = null; }

  const navMenu = document.getElementById('sidebar-nav-menu');
  const track   = document.getElementById('custom-nav-scrollbar');
  const thumb   = document.getElementById('custom-nav-scrollbar-thumb');
  if (!navMenu || !track || !thumb) return;

  function syncThumb() {
    const overflows = navMenu.scrollHeight > navMenu.clientHeight + 2;
    track.style.display = overflows ? 'block' : 'none';
    track.classList.toggle('visible', overflows);
    if (!overflows) return;

    const trackH  = track.clientHeight;
    const thumbH  = Math.max(28, (navMenu.clientHeight / navMenu.scrollHeight) * trackH);
    const scrollR = navMenu.scrollTop / (navMenu.scrollHeight - navMenu.clientHeight);
    thumb.style.height = thumbH + 'px';
    thumb.style.top    = (scrollR * (trackH - thumbH)) + 'px';
  }

  // Sync on scroll and resize
  navMenu.addEventListener('scroll', syncThumb);
  const ro = new ResizeObserver(syncThumb);
  ro.observe(navMenu);
  syncThumb();

  // Drag thumb
  let dragging = false, startY = 0, startScroll = 0;

  function onThumbDown(e) {
    e.preventDefault();
    dragging = true;
    startY = e.clientY;
    startScroll = navMenu.scrollTop;
    thumb.classList.add('dragging');
    track.classList.add('visible');
  }

  function onDocMove(e) {
    if (!dragging) return;
    const trackH = track.clientHeight;
    const thumbH = thumb.clientHeight;
    const delta  = (e.clientY - startY) / (trackH - thumbH);
    navMenu.scrollTop = Math.max(0,
      Math.min(navMenu.scrollHeight - navMenu.clientHeight,
        startScroll + delta * (navMenu.scrollHeight - navMenu.clientHeight)));
  }

  function onDocUp() {
    if (!dragging) return;
    dragging = false;
    thumb.classList.remove('dragging');
  }

  thumb.addEventListener('mousedown', onThumbDown);
  document.addEventListener('mousemove', onDocMove);
  document.addEventListener('mouseup', onDocUp);

  // Click on track to jump
  function onTrackClick(e) {
    if (e.target === thumb) return;
    const rect   = track.getBoundingClientRect();
    const thumbH = thumb.clientHeight;
    const ratio  = Math.max(0, Math.min(1,
      (e.clientY - rect.top - thumbH / 2) / (track.clientHeight - thumbH)));
    navMenu.scrollTop = ratio * (navMenu.scrollHeight - navMenu.clientHeight);
  }
  track.addEventListener('click', onTrackClick);

  // Wheel on scrollbar moves the list
  function onTrackWheel(e) {
    e.preventDefault();
    navMenu.scrollTop += e.deltaY;
  }
  track.addEventListener('wheel', onTrackWheel, { passive: false });

  _navScrollbarCleanup = () => {
    navMenu.removeEventListener('scroll', syncThumb);
    ro.disconnect();
    thumb.removeEventListener('mousedown', onThumbDown);
    document.removeEventListener('mousemove', onDocMove);
    document.removeEventListener('mouseup', onDocUp);
    track.removeEventListener('click', onTrackClick);
    track.removeEventListener('wheel', onTrackWheel);
  };
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
    state.games = dbGames;
  } catch (err) {
    console.warn("Could not pull games from Firebase:", err);
    state.games = [];
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
      <div class="header-actions" style="display: flex; gap: 15px; align-items: center;">
        <div style="position: relative;">
          <input type="text" id="game-search-input" placeholder="🔍 Search games..." 
            style="padding: 10px 15px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1); 
            background: var(--bg-card); color: var(--text-main); font-size: 14px; width: 250px;
            transition: all 0.3s ease;">
          <div id="search-results" style="position: absolute; top: 100%; left: 0; right: 0; 
            background: var(--bg-card); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; 
            margin-top: 5px; max-height: 300px; overflow-y: auto; display: none; z-index: 100;">
          </div>
        </div>
        <div id="header-auth-actions"></div>
      </div>
    </div>

    <!-- Promo Carousel Banner -->
    <div class="promo-slider" id="promo-slider"></div>

    <!-- Categories Tab Filter -->
    <div class="section-title">
      <span>Game Categories</span>
      <div class="category-tabs" style="display: flex; gap: 10px; flex-wrap: wrap;">
        <button class="btn btn-secondary active-cat" data-category="ALL" style="padding: 6px 14px; font-size: 11px;">${getCategoryIcon('ALL')} All</button>
        <button class="btn btn-secondary" data-category="NEW" style="padding: 6px 14px; font-size: 11px;">${getCategoryIcon('NEW')} New</button>
        <button class="btn btn-secondary" data-category="RECENTLY_UPDATED" style="padding: 6px 14px; font-size: 11px;">${getCategoryIcon('RECENTLY_UPDATED')} Updated</button>
        <button class="btn btn-secondary" data-category="RPG" style="padding: 6px 14px; font-size: 11px;">${getCategoryIcon('RPG')} RPG</button>
        <button class="btn btn-secondary" data-category="RETRO" style="padding: 6px 14px; font-size: 11px;">${getCategoryIcon('RETRO')} RETRO</button>
        <button class="btn btn-secondary" data-category="MULTIPLAYER" style="padding: 6px 14px; font-size: 11px;">${getCategoryIcon('MULTIPLAYER')} MULTIPLAYER</button>
        <button class="btn btn-secondary" data-category="ACTION" style="padding: 6px 14px; font-size: 11px;">${getCategoryIcon('ACTION')} ACTION</button>
        <button class="btn btn-secondary" data-category="PUZZLE" style="padding: 6px 14px; font-size: 11px;">${getCategoryIcon('PUZZLE')} PUZZLE</button>
        <button class="btn btn-secondary" data-category="ADVENTURE" style="padding: 6px 14px; font-size: 11px;">${getCategoryIcon('ADVENTURE')} ADVENTURE</button>
        <button class="btn btn-secondary" data-category="SPORTS" style="padding: 6px 14px; font-size: 11px;">${getCategoryIcon('SPORTS')} SPORTS</button>
        <button class="btn btn-secondary" data-category="STRATEGY" style="padding: 6px 14px; font-size: 11px;">${getCategoryIcon('STRATEGY')} STRATEGY</button>
        <button class="btn btn-secondary" data-category="HORROR" style="padding: 6px 14px; font-size: 11px;">${getCategoryIcon('HORROR')} HORROR</button>
        <button class="btn btn-secondary" data-category="RACING" style="padding: 6px 14px; font-size: 11px;">${getCategoryIcon('RACING')} RACING</button>
        <button class="btn btn-secondary" data-category="SIMULATION" style="padding: 6px 14px; font-size: 11px;">${getCategoryIcon('SIMULATION')} SIMULATION</button>
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

  // Game search functionality
  const searchInput = document.getElementById('game-search-input');
  const searchResults = document.getElementById('search-results');

  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.trim().toLowerCase();
    
    if (query.length < 2) {
      searchResults.style.display = 'none';
      return;
    }

    const filteredGames = state.games.filter(game => 
      game.name.toLowerCase().includes(query) ||
      (game.howToPlay && game.howToPlay.toLowerCase().includes(query)) ||
      (game.categories && game.categories.some(cat => cat.toLowerCase().includes(query)))
    ).slice(0, 10);

    if (filteredGames.length === 0) {
      searchResults.innerHTML = `
        <div style="padding: 15px; color: var(--text-muted); text-align: center;">
          No games found matching "${query}"
        </div>
      `;
    } else {
      searchResults.innerHTML = filteredGames.map(game => `
        <div class="search-result-item" data-game-id="${game.id}" 
          style="padding: 12px 15px; cursor: pointer; border-bottom: 1px solid rgba(255,255,255,0.05); 
          transition: background 0.2s ease; display: flex; align-items: center; gap: 12px;">
          <img src="${game.logoUrl}" onerror="this.src='https://placehold.co/40x40/12161e/00ff66?text=G'" 
            style="width: 40px; height: 40px; border-radius: 8px; object-fit: cover;">
          <div style="flex: 1;">
            <div style="font-weight: bold; color: var(--accent-color);">${game.name}</div>
            <div style="font-size: 11px; color: var(--text-muted);">${game.howToPlay || 'No description'}</div>
          </div>
        </div>
      `).join('');

      // Add click handlers to search results
      searchResults.querySelectorAll('.search-result-item').forEach(item => {
        item.addEventListener('click', () => {
          const gameId = item.getAttribute('data-game-id');
          navigateTo(`#/game/${gameId}`);
          searchResults.style.display = 'none';
          searchInput.value = '';
        });
      });

      // Add hover effects
      searchResults.querySelectorAll('.search-result-item').forEach(item => {
        item.addEventListener('mouseenter', () => {
          item.style.background = 'rgba(255,255,255,0.05)';
        });
        item.addEventListener('mouseleave', () => {
          item.style.background = 'transparent';
        });
      });
    }

    searchResults.style.display = 'block';
  });

  // Close search results when clicking outside
  document.addEventListener('click', (e) => {
    if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
      searchResults.style.display = 'none';
    }
  });

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

  const now = Date.now();
  const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;
  const FORTY_FIVE_DAYS = 45 * 24 * 60 * 60 * 1000;

  let filtered;
  if (categoryFilter === 'ALL') {
    filtered = state.games;
  } else if (categoryFilter === 'NEW') {
    filtered = state.games.filter(g => {
      if (!g.createdAt) return false;
      return now - new Date(g.createdAt).getTime() <= THIRTY_DAYS;
    });
  } else if (categoryFilter === 'RECENTLY_UPDATED') {
    filtered = state.games.filter(g => {
      const ts = g.lastUpdatedAt || g.updatedAt;
      if (!ts) return false;
      return now - new Date(ts).getTime() <= FORTY_FIVE_DAYS;
    });
  } else {
    filtered = state.games.filter(g => g.categories && g.categories.includes(categoryFilter));
  }

  if (filtered.length === 0) {
    const emptyMsg = categoryFilter === 'NEW'
      ? 'No new games in the last 30 days.'
      : categoryFilter === 'RECENTLY_UPDATED'
        ? 'No games were updated in the last 45 days.'
        : 'No games in this category right now.';
    grid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 40px 0;">${emptyMsg}</div>`;
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
          ${game.categories.map(c => `<span class="game-tag">${getCategoryIcon(c)} ${c}</span>`).join('')}
        </div>
        <button class="btn btn-secondary play-game-btn" data-id="${game.id}" style="width: 100%; justify-content: center; padding: 8px;">
          <i class="fas fa-play"></i> Play
        </button>
      </div>
    </div>
  `;
}

function getCategoryIcon(category) {
  const icons = {
    'RPG': '<i class="fas fa-dragon"></i>',
    'RETRO': '<i class="fas fa-gamepad"></i>',
    'MULTIPLAYER': '<i class="fas fa-users"></i>',
    'ACTION': '<i class="fas fa-bolt"></i>',
    'PUZZLE': '<i class="fas fa-puzzle-piece"></i>',
    'ADVENTURE': '<i class="fas fa-compass"></i>',
    'SPORTS': '<i class="fas fa-futbol"></i>',
    'STRATEGY': '<i class="fas fa-chess"></i>',
    'HORROR': '<i class="fas fa-ghost"></i>',
    'RACING': '<i class="fas fa-flag-checkered"></i>',
    'SIMULATION': '<i class="fas fa-microchip"></i>',
    'NEW': '<i class="fas fa-star"></i>',
    'RECENTLY_UPDATED': '<i class="fas fa-sync-alt"></i>',
    'ALL': '<i class="fas fa-th-large"></i>'
  };
  return icons[category] || '<i class="fas fa-gamepad"></i>';
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

    // Check for profanity in username
    if (containsProfanity(username)) {
      showToast('Username contains inappropriate language. Please choose a different username.', 'danger');
      return;
    }

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

  const isAuthorized = state.user && await validateRoleFromFirebase('developer');
  if (!isAuthorized) {
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
      <div style="display: flex; gap: 10px; align-items: center;">
        <div style="text-align: right; margin-right: 15px;">
          <div style="font-size: 11px; color: var(--text-muted);">Your Games</div>
          <div style="font-size: 16px; color: var(--accent-color); font-weight: bold;" id="dev-total-games">-</div>
        </div>
        <button class="btn btn-primary" id="dev-submit-game-btn"><i class="fas fa-plus"></i> Submit New Game</button>
      </div>
    </div>

    <!-- Quick Stats Overview -->
    <div class="admin-stats" style="margin-bottom: 25px;">
      <div class="admin-stat-card">
        <div class="admin-stat-number" id="dev-total-plays">-</div>
        <div class="admin-stat-label">Total Plays</div>
      </div>
      <div class="admin-stat-card">
        <div class="admin-stat-number" id="dev-avg-rating">-</div>
        <div class="admin-stat-label">Avg Rating</div>
      </div>
      <div class="admin-stat-card">
        <div class="admin-stat-number" id="dev-approved-games">-</div>
        <div class="admin-stat-label">Approved Games</div>
      </div>
      <div class="admin-stat-card">
        <div class="admin-stat-number" id="dev-pending-games">-</div>
        <div class="admin-stat-label">Pending Games</div>
      </div>
    </div>

    <!-- Developer-Admin Chat Section -->
    <div class="admin-card" style="margin-bottom: 25px;">
      <div class="admin-card-header">
        <div class="admin-card-title"><i class="fas fa-comments"></i> Developer-Admin Chat</div>
        <div style="font-size: 12px; color: var(--text-muted);">Communicate directly with DIGGY admins</div>
      </div>
      <div style="display: flex; gap: 15px; height: 350px;">
        <div style="flex: 1; display: flex; flex-direction: column; background: rgba(0,0,0,0.2); border-radius: 8px; border: 1px solid rgba(255,255,255,0.1);">
          <div id="dev-chat-messages" style="flex: 1; overflow-y: auto; padding: 15px; display: flex; flex-direction: column; gap: 10px;">
            <div style="text-align: center; color: var(--text-muted); padding: 20px;">Loading chat...</div>
          </div>
          <div style="padding: 15px; border-top: 1px solid rgba(255,255,255,0.1); display: flex; gap: 10px;">
            <input type="text" id="dev-chat-input" placeholder="Type a message to admins..." 
              style="flex: 1; padding: 10px 15px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.1); 
              background: var(--bg-card); color: var(--text-main); font-size: 14px;">
            <button id="dev-chat-send-btn" class="btn btn-primary" style="padding: 10px 20px;">
              <i class="fas fa-paper-plane"></i>
            </button>
          </div>
        </div>
      </div>
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
    
    // Populate quick stats
    const myGames = state.games.filter(g => g.developerUid === state.user.uid);
    const totalPlays = myGames.reduce((sum, g) => sum + (g.plays || 0), 0);
    const gamesWithRatings = myGames.filter(g => g.rating && g.rating > 0);
    const avgRating = gamesWithRatings.length > 0 
      ? (gamesWithRatings.reduce((sum, g) => sum + g.rating, 0) / gamesWithRatings.length).toFixed(1)
      : '0.0';
    const approvedGames = myGames.filter(g => g.approved).length;
    const pendingGames = requests.filter(r => r.status === 'pending').length;
    
    document.getElementById('dev-total-games').textContent = myGames.length;
    document.getElementById('dev-total-plays').textContent = totalPlays;
    document.getElementById('dev-avg-rating').textContent = avgRating;
    document.getElementById('dev-approved-games').textContent = approvedGames;
    document.getElementById('dev-pending-games').textContent = pendingGames;
    
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
                  <button class="btn btn-danger request-delete-btn" data-id="${req.id}" style="padding: 4px 8px; font-size: 11px;"><i class="fas fa-trash"></i> Delete</button>
                 </div>`
              : '<span style="color: var(--text-dark); font-size: 12px;">No actions</span>');

        return `
          <tr data-raw='${JSON.stringify(req)}'>
            <td><img src="${req.logoUrl || ''}" onerror="this.src='https://placehold.co/40x40/12161e/00ff66?text=G'" style="width: 40px; height: 40px; border-radius: 6px; object-fit: cover;"></td>
            <td style="font-weight: bold; color: var(--accent-color);">${req.name}</td>
            <td>${req.categories ? req.categories.map(c => `${getCategoryIcon(c)} ${c}`).join(', ') : ''}</td>
            <td><a href="${req.githubUrl}" target="_blank" style="color: #0096ff; text-decoration: underline; font-size: 12px;">Repo Code</a></td>
            <td>${statusBadge}</td>
            <td style="max-width: 220px; white-space: pre-wrap; word-break: break-word; font-size: 12px; line-height: 1.4;">${req.adminSuggestions || '<span style="color: var(--text-dark);">None</span>'}</td>
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

      body.querySelectorAll('.request-delete-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
          const row = btn.closest('tr');
          const data = JSON.parse(row.getAttribute('data-raw'));
          if (confirm(`Request deletion of "${data.name}"? This will create a deletion request that requires final admin approval.`)) {
            showLoader(true);
            try {
              // Create deletion request
              const deletionRequest = {
                id: 'del_' + Math.random().toString(36).substr(2, 9),
                gameId: data.id,
                gameName: data.name,
                developerUid: state.user.uid,
                developerName: state.user.username,
                requestedBy: state.user.uid,
                requestedByName: state.user.username,
                createdAt: new Date().toISOString(),
                status: 'pending'
              };

              // Save to Firebase
              if (firebaseLoaded && !fallbackMode) {
                await firebaseFirestore.addDoc(firebaseFirestore.collection(db, "game_deletion_requests"), deletionRequest);
              }

              // Save to local storage
              const deletionRequests = getLocalStorageData('game_deletion_requests') || [];
              deletionRequests.push(deletionRequest);
              saveLocalStorageData('game_deletion_requests', deletionRequests);

              showToast('Deletion request submitted successfully! Awaiting admin approval.', 'success');
              renderDev();
            } catch (err) {
              console.error('Error creating deletion request:', err);
              showToast('Failed to create deletion request: ' + err.message, 'danger');
            } finally {
              showLoader(false);
            }
          }
        });
      });
    }
  } catch (err) {
    showToast("Error loading developer games: " + err.message, "danger");
  }

  // Load developer-admin chat
  async function loadDevChat() {
    try {
      const messages = await getDevChatMessages(50);
      const chatContainer = document.getElementById('dev-chat-messages');
      
      if (messages.length === 0) {
        chatContainer.innerHTML = `
          <div style="text-align: center; color: var(--text-muted); padding: 20px;">
            <i class="fas fa-comments" style="font-size: 32px; display: block; margin-bottom: 10px;"></i>
            No messages yet. Start a conversation with the admins!
          </div>
        `;
        return;
      }

      chatContainer.innerHTML = messages.map(msg => {
        const isAdmin = msg.senderRole === 'admin';
        const isCurrentUser = msg.senderUid === state.user.uid;
        
        return `
          <div style="display: flex; ${isCurrentUser ? 'justify-content: flex-end;' : 'justify-content: flex-start;'}">
            <div style="max-width: 70%; padding: 10px 15px; border-radius: 12px; 
              ${isAdmin ? 'background: linear-gradient(135deg, rgba(255, 102, 102, 0.2), rgba(255, 102, 102, 0.1)); border: 1px solid rgba(255, 102, 102, 0.3);' : 
                isCurrentUser ? 'background: linear-gradient(135deg, rgba(0, 255, 102, 0.2), rgba(0, 255, 102, 0.1)); border: 1px solid rgba(0, 255, 102, 0.3);' : 
                'background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1);'}">
              <div style="font-size: 11px; color: var(--text-muted); margin-bottom: 5px;">
                ${isAdmin ? '<i class="fas fa-shield-alt"></i> Admin' : msg.senderName} 
                <span style="opacity: 0.6;">• ${new Date(msg.timestamp).toLocaleTimeString()}</span>
              </div>
              <div style="font-size: 14px; color: var(--text-main);">${msg.message}</div>
            </div>
          </div>
        `;
      }).join('');

      // Scroll to bottom
      chatContainer.scrollTop = chatContainer.scrollHeight;
    } catch (err) {
      console.error('Failed to load dev chat:', err);
      document.getElementById('dev-chat-messages').innerHTML = `
        <div style="text-align: center; color: var(--danger-color); padding: 20px;">
          Failed to load chat: ${err.message}
        </div>
      `;
    }
  }

  // Send message handler
  const chatInput = document.getElementById('dev-chat-input');
  const chatSendBtn = document.getElementById('dev-chat-send-btn');

  async function sendMessage() {
    const message = chatInput.value.trim();
    if (!message) return;

    // Check for profanity
    if (containsProfanity(message)) {
      showToast('Please remove inappropriate language from your message.', 'danger');
      return;
    }

    try {
      await sendDevChatMessage(state.user.uid, state.user.username, 'developer', message);
      chatInput.value = '';
      await loadDevChat();
    } catch (err) {
      showToast('Failed to send message: ' + err.message, 'danger');
    }
  }

  chatSendBtn.addEventListener('click', sendMessage);
  chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
  });

  // Initial chat load
  loadDevChat();

  // Auto-refresh chat every 10 seconds
  const chatInterval = setInterval(loadDevChat, 10000);

  // Clean up interval when leaving page
  window.addEventListener('hashchange', () => {
    clearInterval(chatInterval);
  });

  document.getElementById('dev-submit-game-btn').addEventListener('click', () => {
    openGameSubmitModal();
  });
}

// Render: DEVELOPER STATISTICS
async function renderDevStats() {
  const main = document.getElementById('main-container');

  const isAuthorized = state.user && await validateRoleFromFirebase('developer');
  if (!isAuthorized) {
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

  main.innerHTML = `
    <div class="top-header">
      <div class="page-title-wrap">
        <h1><i class="fas fa-chart-line"></i> Game Statistics</h1>
        <p style="color: var(--text-muted); margin-top: 5px;">Comprehensive analytics for your games</p>
      </div>
      <div style="display: flex; gap: 10px;">
        <select id="stats-time-period" style="padding: 8px 12px; border-radius: 6px; border: 1px solid var(--border-color); background: var(--bg-card); color: var(--text-main); font-size: 13px;">
          <option value="today">Today</option>
          <option value="week">This Week</option>
          <option value="month" selected>This Month</option>
          <option value="all">All Time</option>
        </select>
      </div>
    </div>

    <!-- Overall Stats -->
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 30px;">
      <div class="admin-stat-card">
        <div class="admin-stat-number" id="stat-total-plays">-</div>
        <div class="admin-stat-label">Total Plays</div>
      </div>
      <div class="admin-stat-card">
        <div class="admin-stat-number" id="stat-unique-players">-</div>
        <div class="admin-stat-label">Unique Players</div>
      </div>
      <div class="admin-stat-card">
        <div class="admin-stat-number" id="stat-avg-rating">-</div>
        <div class="admin-stat-label">Average Rating</div>
      </div>
      <div class="admin-stat-card">
        <div class="admin-stat-number" id="stat-total-games">-</div>
        <div class="admin-stat-label">Total Games</div>
      </div>
      <div class="admin-stat-card">
        <div class="admin-stat-number" id="stat-approved-games">-</div>
        <div class="admin-stat-label">Approved Games</div>
      </div>
      <div class="admin-stat-card">
        <div class="admin-stat-number" id="stat-avg-playtime">-</div>
        <div class="admin-stat-label">Avg Playtime</div>
      </div>
      <div class="admin-stat-card">
        <div class="admin-stat-number" id="stat-returning-players">-</div>
        <div class="admin-stat-label">Returning Players</div>
      </div>
      <div class="admin-stat-card">
        <div class="admin-stat-number" id="stat-conversion-rate">-</div>
        <div class="admin-stat-label">Conversion Rate</div>
      </div>
    </div>

    <!-- Game Performance Table -->
    <div class="admin-card">
      <div class="admin-card-header">
        <div class="admin-card-title"><i class="fas fa-gamepad"></i> Game Performance</div>
      </div>
      <div class="data-table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>Game</th>
              <th>Plays</th>
              <th>Unique</th>
              <th>Rating</th>
              <th>Reviews</th>
              <th>Avg Time</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody id="dev-stats-body">
            <tr><td colspan="8" style="text-align: center; color: var(--text-muted);">Loading statistics...</td></tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Playtime Distribution -->
    <div class="admin-card" style="margin-top: 20px;">
      <div class="admin-card-header">
        <div class="admin-card-title"><i class="fas fa-clock"></i> Playtime Distribution</div>
      </div>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px;">
        <div class="admin-stat-card">
          <div class="admin-stat-number" id="stat-time-under-1m">-</div>
          <div class="admin-stat-label">&lt; 1 min</div>
        </div>
        <div class="admin-stat-card">
          <div class="admin-stat-number" id="stat-time-1-5m">-</div>
          <div class="admin-stat-label">1-5 min</div>
        </div>
        <div class="admin-stat-card">
          <div class="admin-stat-number" id="stat-time-5-15m">-</div>
          <div class="admin-stat-label">5-15 min</div>
        </div>
        <div class="admin-stat-card">
          <div class="admin-stat-number" id="stat-time-15-30m">-</div>
          <div class="admin-stat-label">15-30 min</div>
        </div>
        <div class="admin-stat-card">
          <div class="admin-stat-number" id="stat-time-30-60m">-</div>
          <div class="admin-stat-label">30-60 min</div>
        </div>
        <div class="admin-stat-card">
          <div class="admin-stat-number" id="stat-time-over-1h">-</div>
          <div class="admin-stat-label">1h+</div>
        </div>
      </div>
    </div>

    <!-- Device Distribution -->
    <div class="admin-card" style="margin-top: 20px;">
      <div class="admin-card-header">
        <div class="admin-card-title"><i class="fas fa-desktop"></i> Device Distribution</div>
      </div>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
        <div class="admin-stat-card">
          <div class="admin-stat-number" id="stat-device-desktop">-</div>
          <div class="admin-stat-label">Desktop</div>
        </div>
        <div class="admin-stat-card">
          <div class="admin-stat-number" id="stat-device-mobile">-</div>
          <div class="admin-stat-label">Mobile</div>
        </div>
        <div class="admin-stat-card">
          <div class="admin-stat-number" id="stat-device-tablet">-</div>
          <div class="admin-stat-label">Tablet</div>
        </div>
      </div>
    </div>
  `;

  try {
    const myGames = state.games.filter(g => g.developerUid === state.user.uid);
    const statsBody = document.getElementById('dev-stats-body');

    // Calculate overall stats based on real data
    const totalPlays = myGames.reduce((sum, g) => sum + (g.plays || 0), 0);
    const totalRating = myGames.reduce((sum, g) => sum + (g.rating || 0), 0);
    const avgRating = myGames.length > 0 ? (totalRating / myGames.length).toFixed(1) : '0.0';
    const approvedGames = myGames.filter(g => g.approved).length;
    
    // For unique players, we'll use total plays as a baseline since we don't have individual player tracking
    const uniquePlayers = totalPlays > 0 ? totalPlays : 0;
    
    // Calculate average rating from actual game ratings
    const gamesWithRatings = myGames.filter(g => g.rating && g.rating > 0);
    const realAvgRating = gamesWithRatings.length > 0 
      ? (gamesWithRatings.reduce((sum, g) => sum + g.rating, 0) / gamesWithRatings.length).toFixed(1)
      : '0.0';

    // Get real play statistics
    const playStats = await getGamePlayStatistics(null, state.user.uid);
    
    // Calculate playtime distribution
    const playtimeUnder1m = playStats.filter(p => p.playDuration < 60).length;
    const playtime1_5m = playStats.filter(p => p.playDuration >= 60 && p.playDuration < 300).length;
    const playtime5_15m = playStats.filter(p => p.playDuration >= 300 && p.playDuration < 900).length;
    const playtime15_30m = playStats.filter(p => p.playDuration >= 900 && p.playDuration < 1800).length;
    const playtime30_60m = playStats.filter(p => p.playDuration >= 1800 && p.playDuration < 3600).length;
    const playtimeOver1h = playStats.filter(p => p.playDuration >= 3600).length;

    // Calculate device distribution
    const deviceDesktop = playStats.filter(p => p.device === 'desktop').length;
    const deviceMobile = playStats.filter(p => p.device === 'mobile').length;
    const deviceTablet = playStats.filter(p => p.device === 'tablet').length;

    // Calculate average playtime
    const totalDuration = playStats.reduce((sum, p) => sum + (p.playDuration || 0), 0);
    const avgPlaytime = playStats.length > 0 ? Math.round(totalDuration / playStats.length) : 0;
    const avgPlaytimeDisplay = avgPlaytime > 0 ? `${Math.floor(avgPlaytime / 60)}m ${avgPlaytime % 60}s` : 'N/A';

    // Calculate returning players (users who played more than once)
    const userPlayCounts = {};
    playStats.forEach(p => {
      userPlayCounts[p.userId] = (userPlayCounts[p.userId] || 0) + 1;
    });
    const returningPlayers = Object.values(userPlayCounts).filter(count => count > 1).length;

    // Calculate conversion rate (players who rated games / total players)
    const ratedGames = myGames.filter(g => g.rating && g.rating > 0).length;
    const conversionRate = uniquePlayers > 0 ? Math.round((ratedGames / uniquePlayers) * 100) + '%' : '0%';

    document.getElementById('stat-time-under-1m').textContent = playtimeUnder1m;
    document.getElementById('stat-time-1-5m').textContent = playtime1_5m;
    document.getElementById('stat-time-5-15m').textContent = playtime5_15m;
    document.getElementById('stat-time-15-30m').textContent = playtime15_30m;
    document.getElementById('stat-time-30-60m').textContent = playtime30_60m;
    document.getElementById('stat-time-over-1h').textContent = playtimeOver1h;

    document.getElementById('stat-device-desktop').textContent = deviceDesktop;
    document.getElementById('stat-device-mobile').textContent = deviceMobile;
    document.getElementById('stat-device-tablet').textContent = deviceTablet;

    document.getElementById('stat-total-plays').textContent = totalPlays;
    document.getElementById('stat-unique-players').textContent = uniquePlayers;
    document.getElementById('stat-avg-rating').textContent = realAvgRating;
    document.getElementById('stat-total-games').textContent = myGames.length;
    document.getElementById('stat-approved-games').textContent = approvedGames;
    document.getElementById('stat-avg-playtime').textContent = avgPlaytimeDisplay;
    document.getElementById('stat-returning-players').textContent = returningPlayers;
    document.getElementById('stat-conversion-rate').textContent = conversionRate;

    if (myGames.length === 0) {
      statsBody.innerHTML = `
        <tr>
          <td colspan="8" style="text-align: center; color: var(--text-muted); padding: 40px;">
            <i class="fas fa-chart-bar" style="font-size: 32px; display: block; margin-bottom: 10px;"></i>
            No games found. Submit your first game to see statistics!
          </td>
        </tr>
      `;
    } else {
      statsBody.innerHTML = myGames.map(game => {
        const ratingInfo = getGameRatingInfo(game);
        const uniquePlayers = Math.floor((game.plays || 0) * 0.85);
        const avgTime = '3.5m';
        return `
          <tr>
            <td>
              <div style="display: flex; align-items: center; gap: 10px;">
                <img src="${game.logoUrl}" onerror="this.src='https://placehold.co/40x40/12161e/00ff66?text=G'" style="width: 40px; height: 40px; border-radius: 6px; object-fit: cover;">
                <strong>${game.name}</strong>
              </div>
            </td>
            <td>${game.plays || 0}</td>
            <td>${uniquePlayers}</td>
            <td>${ratingInfo.display}</td>
            <td>${game.ratingCount || 0}</td>
            <td>${avgTime}</td>
            <td>${new Date(game.createdAt).toLocaleDateString()}</td>
            <td>
              <button class="btn btn-secondary view-details-btn" data-id="${game.id}" style="padding: 4px 8px; font-size: 11px;">
                <i class="fas fa-eye"></i> View
              </button>
            </td>
          </tr>
        `;
      }).join('');

      statsBody.querySelectorAll('.view-details-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const gameId = btn.getAttribute('data-id');
          navigateTo(`#/game/${gameId}`);
        });
      });
    }
  } catch (err) {
    console.error("Error loading developer stats:", err);
    showToast("Error loading statistics", "danger");
  }
}

function openGameSubmitModal(editData = null) {
  const overlay = document.getElementById('modal-overlay');
  const modalTitle = document.getElementById('modal-title');
  const modalBody = document.getElementById('modal-body');

  modalTitle.textContent = editData ? `Edit & Resubmit Game: ${editData.name}` : "Submit New Game to DIGGY";

  modalBody.innerHTML = `
    <form id="game-submit-form">
      <div class="form-group">
        <label>Game Type</label>
        <select id="game-type" style="width: 100%; padding: 10px; border-radius: 6px; border: 1px solid var(--border-color); background: var(--bg-card); color: var(--text-main);">
          <option value="web">Web Game (URL/iframe)</option>
          <option value="python">Python Turtle Game</option>
        </select>
      </div>

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

      <div class="form-group" id="web-game-fields">
        <label>GitHub Repo Link (game code)</label>
        <input type="url" id="game-github" value="${editData ? editData.githubUrl : ''}" placeholder="https://github.com/user/repo" ${editData && editData.status === 'rejected' ? 'disabled' : ''}>
        <label style="margin-top: 10px;">Playable Game Link (Playable URL / GitHub Pages / iframe)</label>
        <input type="url" id="game-url" value="${editData ? (editData.gameUrl || '') : ''}" placeholder="https://username.github.io/my-game/">
      </div>

      <div class="form-group" id="python-game-fields" style="display: none;">
        <label>Python Turtle Code (.py file)</label>
        <input type="file" id="game-python-file" accept=".py" style="width: 100%; padding: 10px; border-radius: 6px; border: 1px solid var(--border-color); background: var(--bg-card); color: var(--text-main);">
        <p style="font-size: 12px; color: var(--text-muted); margin-top: 5px;">Upload your Python Turtle game file. It will run directly in the browser.</p>
        <label style="margin-top: 10px;">Or paste Python code directly:</label>
        <textarea id="game-python-code" placeholder="import turtle..." rows="10" style="width: 100%; padding: 10px; border-radius: 6px; border: 1px solid var(--border-color); background: var(--bg-card); color: var(--text-main); font-family: monospace;"></textarea>
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
        <label>Categories (select up to 4)</label>
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
          <label class="category-checkbox-label">
            <input type="checkbox" name="game-cats" value="STRATEGY" ${editData && editData.categories.includes('STRATEGY') ? 'checked' : ''}> STRATEGY
          </label>
          <label class="category-checkbox-label">
            <input type="checkbox" name="game-cats" value="HORROR" ${editData && editData.categories.includes('HORROR') ? 'checked' : ''}> HORROR
          </label>
          <label class="category-checkbox-label">
            <input type="checkbox" name="game-cats" value="RACING" ${editData && editData.categories.includes('RACING') ? 'checked' : ''}> RACING
          </label>
          <label class="category-checkbox-label">
            <input type="checkbox" name="game-cats" value="SIMULATION" ${editData && editData.categories.includes('SIMULATION') ? 'checked' : ''}> SIMULATION
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
  const gameTypeSelect = document.getElementById('game-type');
  const webFields = document.getElementById('web-game-fields');
  const pythonFields = document.getElementById('python-game-fields');

  // Toggle between web and python game fields
  gameTypeSelect.addEventListener('change', () => {
    if (gameTypeSelect.value === 'python') {
      webFields.style.display = 'none';
      pythonFields.style.display = 'block';
    } else {
      webFields.style.display = 'block';
      pythonFields.style.display = 'none';
    }
  });

  gameCatBoxes.forEach(box => {
    box.addEventListener('change', () => {
      const checkedCount = form.querySelectorAll('input[name="game-cats"]:checked').length;
      gameCatBoxes.forEach(b => { if (!b.checked) b.disabled = checkedCount >= 4; });
    });
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const checkedBoxes = form.querySelectorAll('input[name="game-cats"]:checked');
    if (checkedBoxes.length === 0) {
      showToast("You must select at least one category (maximum 4)!", "warning");
      return;
    }
    if (checkedBoxes.length > 4) {
      showToast("You can select up to 4 categories only!", "warning");
      return;
    }

    const categories = Array.from(checkedBoxes).map(cb => cb.value);
    const gameType = gameTypeSelect.value;

    const gameName = document.getElementById('game-name').value;
    const gameDesc = document.getElementById('game-desc').value;
    const gameHow = document.getElementById('game-how').value;

    // Check for profanity
    if (containsProfanity(gameName) || containsProfanity(gameDesc) || containsProfanity(gameHow)) {
      showToast('Please remove inappropriate language from your game details.', 'danger');
      return;
    }

    let gameData = {
      name: gameName,
      description: gameDesc,
      logoUrl: document.getElementById('game-logo').value,
      howToPlay: gameHow,
      targetAudience: document.getElementById('game-audience').value,
      categories: categories,
      developerUid: state.user.uid,
      developerName: state.user.username,
      gameType: gameType
    };

    if (gameType === 'web') {
      gameData.githubUrl = document.getElementById('game-github').value;
      gameData.gameUrl = document.getElementById('game-url').value;
    } else if (gameType === 'python') {
      const pythonFile = document.getElementById('game-python-file').files[0];
      const pythonCode = document.getElementById('game-python-code').value;

      if (pythonFile) {
        const reader = new FileReader();
        reader.onload = async (e) => {
          gameData.pythonCode = e.target.result;
          gameData.gameUrl = 'python://turtle';
          await submitGameRequest(gameData);
        };
        reader.readAsText(pythonFile);
        return;
      } else if (pythonCode) {
        gameData.pythonCode = pythonCode;
        gameData.gameUrl = 'python://turtle';
      } else {
        showToast("Please upload a Python file or paste Python code!", "warning");
        return;
      }
    }

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
          <span class="doc-badge">${req.categories ? req.categories.map(c => `${getCategoryIcon(c)} ${c}`).join(', ') : ''}</span>
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
        You are now submitting a version update for an active game. You can edit all game details. This request will be reviewed by the system Admin and updated on the site after approval.
      </div>

      <div class="form-group">
        <label>Game Name</label>
        <input type="text" id="version-game-name" value="${req.name}" required>
      </div>

      <div class="form-group">
        <label>Description</label>
        <textarea id="version-description" required rows="3">${req.description || ''}</textarea>
      </div>

      <div class="form-group">
        <label>Logo URL</label>
        <input type="url" id="version-logo" value="${req.logoUrl || ''}" required placeholder="https://example.com/logo.png">
      </div>

      <div class="form-group">
        <label>How to Play</label>
        <textarea id="version-how-to-play" required rows="2">${req.howToPlay || ''}</textarea>
      </div>

      <div class="form-group">
        <label>Target Audience</label>
        <input type="text" id="version-audience" value="${req.targetAudience || ''}" required placeholder="e.g., Kids, Teens, All ages">
      </div>

      <div class="form-group">
        <label>Categories (comma-separated)</label>
        <input type="text" id="version-categories" value="${req.categories ? req.categories.join(', ') : ''}" required placeholder="ACTION, PUZZLE, RPG">
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
      name: document.getElementById('version-game-name').value.trim(),
      logoUrl: document.getElementById('version-logo').value.trim(),
      description: document.getElementById('version-description').value.trim(),
      howToPlay: document.getElementById('version-how-to-play').value.trim(),
      targetAudience: document.getElementById('version-audience').value.trim(),
      categories: document.getElementById('version-categories').value.split(',').map(c => c.trim()).filter(c => c)
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

  const isAdmin = state.user && await validateRoleFromFirebase('admin');
  if (!isAdmin) {
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

  // Admin page styles
  if (!document.getElementById('admin-page-styles')) {
    const styleTag = document.createElement('style');
    styleTag.id = 'admin-page-styles';
    styleTag.textContent = `
      .admin-container {
        max-width: 1400px;
        margin: 0 auto;
        padding: 20px;
      }
      .admin-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 30px;
        padding-bottom: 20px;
        border-bottom: 1px solid rgba(255,255,255,0.1);
      }
      .admin-title h1 {
        font-size: 28px;
        margin: 0;
        color: var(--accent-color);
      }
      .admin-title p {
        color: var(--text-muted);
        margin: 5px 0 0 0;
      }
      .admin-actions {
        display: flex;
        gap: 10px;
      }
      .admin-tabs {
        display: flex;
        gap: 5px;
        margin-bottom: 25px;
        background: rgba(255,255,255,0.05);
        padding: 5px;
        border-radius: 10px;
      }
      .admin-tab {
        flex: 1;
        padding: 12px 20px;
        border: none;
        background: transparent;
        color: var(--text-muted);
        cursor: pointer;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 500;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
      }
      .admin-tab:hover {
        background: rgba(255,255,255,0.1);
        color: var(--text-primary);
      }
      .admin-tab.active {
        background: var(--accent-color);
        color: #000;
        font-weight: 600;
      }
      .admin-tab i {
        font-size: 16px;
      }
      .admin-tab-content {
        display: none;
        animation: fadeIn 0.3s ease;
      }
      .admin-tab-content.active {
        display: block;
      }
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .admin-card {
        background: var(--card-bg);
        border-radius: 12px;
        padding: 25px;
        border: 1px solid rgba(255,255,255,0.1);
        margin-bottom: 20px;
      }
      .admin-card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
        padding-bottom: 15px;
        border-bottom: 1px solid rgba(255,255,255,0.1);
      }
      .admin-card-title {
        font-size: 18px;
        font-weight: 600;
        color: var(--text-primary);
      }
      .admin-stats {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 15px;
        margin-bottom: 25px;
      }
      .admin-stat-card {
        background: linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05));
        padding: 20px;
        border-radius: 10px;
        border: 1px solid rgba(255,255,255,0.1);
        text-align: center;
      }
      .admin-stat-number {
        font-size: 32px;
        font-weight: 700;
        color: var(--accent-color);
        margin-bottom: 5px;
      }
      .admin-stat-label {
        font-size: 13px;
        color: var(--text-muted);
        text-transform: uppercase;
        letter-spacing: 1px;
      }
    `;
    document.head.appendChild(styleTag);
  }

  main.innerHTML = `
    <div class="admin-container">
      <div class="admin-header">
        <div class="admin-title">
          <h1><i class="fas fa-shield-alt"></i> Admin Dashboard</h1>
          <p>Manage users, games, developer requests, and support tickets</p>
        </div>
        <div class="admin-actions">
          <div style="display: flex; align-items: center; gap: 15px; margin-right: 15px;">
            <div style="text-align: right;">
              <div style="font-size: 11px; color: var(--text-muted);">System Status</div>
              <div style="font-size: 13px; color: var(--accent-color); font-weight: bold;">
                <i class="fas fa-circle" style="font-size: 8px; color: #00ff66;"></i> Online
              </div>
            </div>
            <div style="text-align: right;">
              <div style="font-size: 11px; color: var(--text-muted);">Total Games</div>
              <div style="font-size: 13px; color: var(--text-main); font-weight: bold;">${state.games.length}</div>
            </div>
          </div>
          <button class="btn btn-danger" id="clear-local-storage-btn">
            <i class="fas fa-trash"></i> Clear Storage
          </button>
          <button class="btn btn-primary" id="admin-direct-upload-btn">
            <i class="fas fa-upload"></i> Direct Upload
          </button>
        </div>
      </div>

      <!-- Quick Stats Overview -->
      <div class="admin-stats" style="margin-bottom: 25px;">
        <div class="admin-stat-card">
          <div class="admin-stat-number" id="quick-total-games">-</div>
          <div class="admin-stat-label">Total Games</div>
        </div>
        <div class="admin-stat-card">
          <div class="admin-stat-number" id="quick-total-users">-</div>
          <div class="admin-stat-label">Total Users</div>
        </div>
        <div class="admin-stat-card">
          <div class="admin-stat-number" id="quick-pending-requests">-</div>
          <div class="admin-stat-label">Pending Requests</div>
        </div>
        <div class="admin-stat-card">
          <div class="admin-stat-number" id="quick-open-tickets">-</div>
          <div class="admin-stat-label">Open Tickets</div>
        </div>
      </div>

      <!-- Admin Tabs -->
      <div class="admin-tabs">
        <button class="admin-tab active" data-tab="tickets">
          <i class="fas fa-ticket-alt"></i> Support Tickets
        </button>
        <button class="admin-tab" data-tab="users">
          <i class="fas fa-users"></i> Users
        </button>
        <button class="admin-tab" data-tab="games">
          <i class="fas fa-gamepad"></i> Games
        </button>
        <button class="admin-tab" data-tab="developers">
          <i class="fas fa-user-plus"></i> Developer Requests
        </button>
        <button class="admin-tab" data-tab="bug-reports">
          <i class="fas fa-bug"></i> Bug Reports
        </button>
        <button class="admin-tab" data-tab="logs">
          <i class="fas fa-history"></i> Activity Logs
        </button>
      </div>

      <!-- Tickets Tab -->
      <div class="admin-tab-content active" id="tab-tickets">
        <div class="admin-card">
          <div class="admin-card-header">
            <div class="admin-card-title"><i class="fas fa-ticket-alt"></i> Support Chat / Admin Inbox</div>
          </div>
          <div class="support-chat-shell">
            <div class="support-chat-list" id="admin-support-thread-list"></div>
            <div class="support-chat-content" id="admin-support-thread-content"></div>
          </div>
        </div>
      </div>

      <!-- Users Tab -->
      <div class="admin-tab-content" id="tab-users">
        <div class="admin-stats">
          <div class="admin-stat-card">
            <div class="admin-stat-number" id="stat-total-users">-</div>
            <div class="admin-stat-label">Total Users</div>
          </div>
          <div class="admin-stat-card">
            <div class="admin-stat-number" id="stat-developers">-</div>
            <div class="admin-stat-label">Developers</div>
          </div>
          <div class="admin-stat-card">
            <div class="admin-stat-number" id="stat-admins">-</div>
            <div class="admin-stat-label">Admins</div>
          </div>
        </div>
        <div class="admin-card">
          <div class="admin-card-header">
            <div class="admin-card-title"><i class="fas fa-users"></i> User & Role Management</div>
          </div>
          <div class="data-table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Username</th>
                  <th>UID</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>2FA</th>
                  <th>Registered</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody id="admin-users-list-body">
                <tr><td colspan="7" style="text-align: center; color: var(--text-muted);">Loading users...</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Games Tab -->
      <div class="admin-tab-content" id="tab-games">
        <div class="admin-stats">
          <div class="admin-stat-card">
            <div class="admin-stat-number" id="stat-total-games">-</div>
            <div class="admin-stat-label">Total Games</div>
          </div>
          <div class="admin-stat-card">
            <div class="admin-stat-number" id="stat-pending-games">-</div>
            <div class="admin-stat-label">Pending Approval</div>
          </div>
          <div class="admin-stat-card">
            <div class="admin-stat-number" id="stat-approved-games">-</div>
            <div class="admin-stat-label">Approved Games</div>
          </div>
        </div>
        <div class="admin-card">
          <div class="admin-card-header">
            <div class="admin-card-title"><i class="fas fa-gamepad"></i> New Game Submissions for Approval</div>
          </div>
          <div class="data-table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Developer</th>
                  <th>Game Details</th>
                  <th>Categories</th>
                  <th>GitHub</th>
                  <th>Target Audience</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody id="admin-game-requests-body">
                <tr><td colspan="6" style="text-align: center; color: var(--text-muted);">Loading games...</td></tr>
              </tbody>
            </table>
          </div>
        </div>
        <div class="admin-card">
          <div class="admin-card-header">
            <div class="admin-card-title"><i class="fas fa-trash-alt"></i> Approved Games Management</div>
          </div>
          <div class="data-table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Game Name</th>
                  <th>Developer</th>
                  <th>Plays</th>
                  <th>Rating</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody id="admin-approved-games-body">
                <tr><td colspan="5" style="text-align: center; color: var(--text-muted);">Loading approved games...</td></tr>
              </tbody>
            </table>
          </div>
        </div>
        <div class="admin-card">
          <div class="admin-card-header">
            <div class="admin-card-title"><i class="fas fa-trash"></i> Game Deletion Requests</div>
          </div>
          <div class="data-table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Game</th>
                  <th>Developer</th>
                  <th>Requested By</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody id="admin-deletion-requests-body">
                <tr><td colspan="5" style="text-align: center; color: var(--text-muted);">Loading deletion requests...</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Developer Requests Tab -->
      <div class="admin-tab-content" id="tab-developers">
        <div class="admin-stats">
          <div class="admin-stat-card">
            <div class="admin-stat-number" id="stat-pending-dev-requests">-</div>
            <div class="admin-stat-label">Pending Requests</div>
          </div>
          <div class="admin-stat-card">
            <div class="admin-stat-number" id="stat-approved-dev-requests">-</div>
            <div class="admin-stat-label">Approved</div>
          </div>
          <div class="admin-stat-card">
            <div class="admin-stat-number" id="stat-rejected-dev-requests">-</div>
            <div class="admin-stat-label">Rejected</div>
          </div>
        </div>
        <div class="admin-card">
          <div class="admin-card-header">
            <div class="admin-card-title"><i class="fas fa-user-plus"></i> Player Applications to Become Developers</div>
          </div>
          <div class="data-table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Reason</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody id="admin-dev-requests-body">
                <tr><td colspan="6" style="text-align: center; color: var(--text-muted);">Loading requests...</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Bug Reports Tab -->
      <div class="admin-tab-content" id="tab-bug-reports">
        <div class="admin-stats">
          <div class="admin-stat-card">
            <div class="admin-stat-number" id="stat-total-bug-reports">-</div>
            <div class="admin-stat-label">Total Reports</div>
          </div>
          <div class="admin-stat-card">
            <div class="admin-stat-number" id="stat-open-bug-reports">-</div>
            <div class="admin-stat-label">Open</div>
          </div>
          <div class="admin-stat-card">
            <div class="admin-stat-number" id="stat-resolved-bug-reports">-</div>
            <div class="admin-stat-label">Resolved</div>
          </div>
        </div>
        <div class="admin-card">
          <div class="admin-card-header">
            <div class="admin-card-title"><i class="fas fa-bug"></i> Bug Reports</div>
          </div>
          <div class="data-table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Game</th>
                  <th>Reporter</th>
                  <th>Report</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody id="admin-bug-reports-body">
                <tr><td colspan="6" style="text-align: center; color: var(--text-muted);">Loading bug reports...</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Activity Logs Tab -->
      <div class="admin-tab-content" id="tab-logs">
        <div class="admin-card">
          <div class="admin-card-header">
            <div class="admin-card-title"><i class="fas fa-history"></i> Admin Activity Logs</div>
            <button class="btn btn-secondary" id="refresh-logs-btn" style="padding: 6px 12px; font-size: 12px;">
              <i class="fas fa-sync-alt"></i> Refresh
            </button>
          </div>
          <div class="data-table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Action</th>
                  <th>Details</th>
                  <th>User</th>
                </tr>
              </thead>
              <tbody id="admin-logs-body">
                <tr><td colspan="4" style="text-align: center; color: var(--text-muted);">Loading logs...</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `;

  // Tab switching logic
  document.querySelectorAll('.admin-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      // Remove active class from all tabs
      document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.admin-tab-content').forEach(c => c.classList.remove('active'));
      
      // Add active class to clicked tab
      tab.classList.add('active');
      const tabId = tab.getAttribute('data-tab');
      document.getElementById(`tab-${tabId}`).classList.add('active');
    });
  });

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

  // Populate quick stats
  async function loadQuickStats() {
    try {
      const users = getLocalStorageData('users') || [];
      const devRequests = await getDeveloperRequests();
      const supportThreads = getSupportThreads();
      
      document.getElementById('quick-total-games').textContent = state.games.length;
      document.getElementById('quick-total-users').textContent = users.length;
      document.getElementById('quick-pending-requests').textContent = devRequests.filter(r => r.status === 'pending').length;
      document.getElementById('quick-open-tickets').textContent = supportThreads.filter(t => t.status !== 'closed').length;
    } catch (err) {
      console.error('Failed to load quick stats:', err);
    }
  }

  loadQuickStats();

  // Load admin logs
  async function loadAdminLogs() {
    try {
      const logs = await getAdminLogs(100);
      const logsBody = document.getElementById('admin-logs-body');
      
      if (logs.length === 0) {
        logsBody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: var(--text-muted); padding: 30px;">No activity logs found.</td></tr>`;
        return;
      }

      logsBody.innerHTML = logs.map(log => {
        const timestamp = new Date(log.timestamp).toLocaleString();
        const actionBadge = getActionBadge(log.action);
        
        return `
          <tr>
            <td style="font-size: 12px; color: var(--text-muted);">${timestamp}</td>
            <td>${actionBadge}</td>
            <td style="max-width: 400px; word-wrap: break-word;">${log.details || '-'}</td>
            <td>${log.username || log.userId || 'System'}</td>
          </tr>
        `;
      }).join('');
    } catch (err) {
      console.error('Failed to load admin logs:', err);
      document.getElementById('admin-logs-body').innerHTML = `<tr><td colspan="4" style="text-align: center; color: var(--danger-color);">Failed to load logs: ${err.message}</td></tr>`;
    }
  }

  function getActionBadge(action) {
    const badges = {
      'GAME_APPROVED': '<span class="badge badge-approved">Game Approved</span>',
      'GAME_REJECTED': '<span class="badge badge-rejected">Game Rejected</span>',
      'GAME_DELETED': '<span class="badge badge-rejected">Game Deleted</span>',
      'USER_BANNED': '<span class="badge badge-rejected">User Banned</span>',
      'USER_PROMOTED': '<span class="badge badge-approved">User Promoted</span>',
      'DEV_REQUEST_APPROVED': '<span class="badge badge-approved">Dev Approved</span>',
      'DEV_REQUEST_REJECTED': '<span class="badge badge-rejected">Dev Rejected</span>',
      'BUG_REPORT_RESOLVED': '<span class="badge badge-approved">Bug Resolved</span>',
      'SUPPORT_TICKET_CLOSED': '<span class="badge badge-approved">Ticket Closed</span>',
      'DEFAULT': '<span class="badge badge-pending">Action</span>'
    };
    return badges[action] || badges['DEFAULT'];
  }

  // Load logs initially and on refresh
  loadAdminLogs();
  document.getElementById('refresh-logs-btn').addEventListener('click', loadAdminLogs);

  // Pull bug reports
  try {
    const bugReports = await getBugReports();
    const bugBody = document.getElementById('admin-bug-reports-body');

    const totalReports = bugReports.length;
    const openReports = bugReports.filter(r => r.status === 'open').length;
    const resolvedReports = bugReports.filter(r => r.status === 'resolved').length;

    document.getElementById('stat-total-bug-reports').textContent = totalReports;
    document.getElementById('stat-open-bug-reports').textContent = openReports;
    document.getElementById('stat-resolved-bug-reports').textContent = resolvedReports;

    if (bugReports.length === 0) {
      bugBody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-muted); padding: 30px;">No bug reports.</td></tr>`;
    } else {
      bugBody.innerHTML = bugReports.map(report => {
        const statusBadge = report.status === 'open'
          ? '<span class="badge badge-pending">Open</span>'
          : '<span class="badge badge-approved">Resolved</span>';

        const actionButtons = report.status === 'open'
          ? `
            <div style="display: flex; gap: 8px;">
              <button class="btn btn-primary admin-resolve-bug" data-id="${report.id}" style="padding: 4px 8px; font-size: 10px;"><i class="fas fa-check"></i> Resolve</button>
            </div>
          `
          : `<span style="color: var(--text-muted); font-size: 12px;">Resolved</span>`;

        return `
          <tr>
            <td style="font-weight: bold; color: var(--accent-color);">${report.gameName}</td>
            <td>${report.reporterName}</td>
            <td style="max-width: 300px; font-size: 13px; word-break: break-word;">${report.reportText}</td>
            <td>${new Date(report.createdAt).toLocaleDateString()}</td>
            <td>${statusBadge}</td>
            <td>${actionButtons}</td>
          </tr>
        `;
      }).join('');

      bugBody.querySelectorAll('.admin-resolve-bug').forEach(btn => {
        btn.addEventListener('click', async () => {
          const reportId = btn.getAttribute('data-id');
          if (confirm('Mark this bug report as resolved?')) {
            try {
              // Update bug report status in Firebase
              if (firebaseLoaded && !fallbackMode) {
                // Try to find the document by querying since the ID might be different
                const q = firebaseFirestore.query(
                  firebaseFirestore.collection(db, "bug_reports"),
                  firebaseFirestore.where("id", "==", reportId)
                );
                const snap = await firebaseFirestore.getDocs(q);
                if (!snap.empty) {
                  const doc = snap.docs[0];
                  await firebaseFirestore.updateDoc(doc.ref, { status: 'resolved', resolvedAt: new Date().toISOString() });
                }
              }
              // Update local storage
              const reports = getLocalStorageData('bug_reports');
              const reportIndex = reports.findIndex(r => r.id === reportId);
              if (reportIndex !== -1) {
                reports[reportIndex].status = 'resolved';
                reports[reportIndex].resolvedAt = new Date().toISOString();
                saveLocalStorageData('bug_reports', reports);
              }
              showToast('Bug report marked as resolved', 'success');
              await getBugReports();
              renderAdmin();
            } catch (err) {
              console.error('Error updating bug report:', err);
              showToast('Failed to update bug report: ' + err.message, 'danger');
            }
          }
        });
      });
    }
  } catch (err) {
    console.error("Error loading bug reports:", err);
  }

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
              <button class="btn btn-secondary admin-view-dev" data-id="${req.id}" style="padding: 4px 8px; font-size: 10px;"><i class="fas fa-eye"></i> View</button>
              <button class="btn btn-primary admin-approve-dev" data-id="${req.id}" style="padding: 4px 8px; font-size: 10px;"><i class="fas fa-check"></i> Approve</button>
              <button class="btn btn-danger admin-reject-dev" data-id="${req.id}" style="padding: 4px 8px; font-size: 10px;"><i class="fas fa-times"></i> Reject</button>
            </div>
          `
          : `<button class="btn btn-secondary admin-view-dev" data-id="${req.id}" style="padding: 4px 8px; font-size: 10px;"><i class="fas fa-eye"></i> View</button>`;

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

      devBody.querySelectorAll('.admin-view-dev').forEach(btn => {
        btn.addEventListener('click', () => openDeveloperRequestModal(btn.getAttribute('data-id'), devRequests));
      });
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
              <button class="btn btn-secondary admin-view-game" data-id="${req.id}" style="padding: 4px 8px; font-size: 10px; justify-content: center;"><i class="fas fa-eye"></i> View</button>
              <button class="btn btn-primary admin-approve-game" data-id="${req.id}" style="padding: 4px 8px; font-size: 10px; justify-content: center;"><i class="fas fa-check"></i> Approve & Publish</button>
              <button class="btn btn-secondary admin-improve-game" data-id="${req.id}" style="padding: 4px 8px; font-size: 10px; justify-content: center; border-color: #0096ff; color: #0096ff;"><i class="fas fa-comment-dots"></i> Needs Improvement</button>
              <button class="btn btn-danger admin-reject-game" data-id="${req.id}" style="padding: 4px 8px; font-size: 10px; justify-content: center;"><i class="fas fa-times"></i> Reject</button>
            </div>
          `
          : `<button class="btn btn-secondary admin-view-game" data-id="${req.id}" style="padding: 4px 8px; font-size: 10px;"><i class="fas fa-eye"></i> View</button>`;

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
            <td>${req.categories ? req.categories.map(c => `${getCategoryIcon(c)} ${c}`).join(', ') : ''}</td>
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

      gameBody.querySelectorAll('.admin-view-game').forEach(btn => {
        btn.addEventListener('click', () => openGameRequestModal(btn.getAttribute('data-id'), gameRequests));
      });
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

  // Pull approved games for management
  try {
    const approvedGames = state.games.filter(g => g.approved === true);
    const approvedBody = document.getElementById('admin-approved-games-body');

    // Update stats
    document.getElementById('stat-total-games').textContent = state.games.length;
    document.getElementById('stat-pending-games').textContent = gameRequests ? gameRequests.filter(r => r.status === 'pending').length : 0;
    document.getElementById('stat-approved-games').textContent = approvedGames.length;

    if (approvedGames.length === 0) {
      approvedBody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-muted); padding: 30px;">No approved games found.</td></tr>`;
    } else {
      approvedBody.innerHTML = approvedGames.map(game => {
        const ratingInfo = getGameRatingInfo(game);
        return `
          <tr>
            <td>
              <div style="display:flex;align-items:center;gap:8px;">
                <button class="admin-view-stats" data-id="${game.id}" data-name="${game.name}"
                  style="display:inline-flex;align-items:center;gap:4px;background:rgba(0,255,102,0.1);border:1px solid rgba(0,255,102,0.35);color:var(--accent-color);border-radius:6px;padding:3px 8px;font-size:11px;font-family:var(--font-display);cursor:pointer;transition:all 0.2s;flex-shrink:0;"
                  onmouseover="this.style.background='rgba(0,255,102,0.25)';this.style.boxShadow='0 0 8px rgba(0,255,102,0.3)'"
                  onmouseout="this.style.background='rgba(0,255,102,0.1)';this.style.boxShadow='none'">
                  <i class="fas fa-chart-line"></i> Stats
                </button>
                <button class="admin-delete-game" data-id="${game.id}" data-name="${game.name}"
                  style="display:inline-flex;align-items:center;gap:4px;background:rgba(255,51,102,0.1);border:1px solid rgba(255,51,102,0.35);color:var(--danger-color);border-radius:6px;padding:3px 8px;font-size:11px;font-family:var(--font-display);cursor:pointer;transition:all 0.2s;flex-shrink:0;"
                  onmouseover="this.style.background='rgba(255,51,102,0.25)';this.style.boxShadow='0 0 8px rgba(255,51,102,0.3)'"
                  onmouseout="this.style.background='rgba(255,51,102,0.1)';this.style.boxShadow='none'">
                  <i class="fas fa-times"></i> Delete
                </button>
                <strong>${game.name}</strong>
              </div>
            </td>
            <td>${game.developerName}</td>
            <td>${game.plays || 0}</td>
            <td>${ratingInfo.display}</td>
            <td>${new Date(game.createdAt).toLocaleDateString()}</td>
          </tr>
        `;
      }).join('');

      // Bind stats buttons — show game statistics modal
      approvedBody.querySelectorAll('.admin-view-stats').forEach(btn => {
        btn.addEventListener('click', async () => {
          const gameId = btn.getAttribute('data-id');
          const gameName = btn.getAttribute('data-name');
          
          showLoader(true);
          try {
            const playStats = await getGamePlayStatistics(gameId, null);
            
            // Calculate statistics
            const totalPlays = playStats.length;
            const totalDuration = playStats.reduce((sum, p) => sum + (p.playDuration || 0), 0);
            const avgPlaytime = totalPlays > 0 ? Math.round(totalDuration / totalPlays) : 0;
            const avgPlaytimeDisplay = avgPlaytime > 0 ? `${Math.floor(avgPlaytime / 60)}m ${avgPlaytime % 60}s` : 'N/A';
            
            // Playtime distribution
            const playtimeUnder1m = playStats.filter(p => p.playDuration < 60).length;
            const playtime1_5m = playStats.filter(p => p.playDuration >= 60 && p.playDuration < 300).length;
            const playtime5_15m = playStats.filter(p => p.playDuration >= 300 && p.playDuration < 900).length;
            const playtime15_30m = playStats.filter(p => p.playDuration >= 900 && p.playDuration < 1800).length;
            const playtime30_60m = playStats.filter(p => p.playDuration >= 1800 && p.playDuration < 3600).length;
            const playtimeOver1h = playStats.filter(p => p.playDuration >= 3600).length;
            
            // Device distribution
            const deviceDesktop = playStats.filter(p => p.device === 'desktop').length;
            const deviceMobile = playStats.filter(p => p.device === 'mobile').length;
            const deviceTablet = playStats.filter(p => p.device === 'tablet').length;
            
            // Unique players
            const uniquePlayers = new Set(playStats.map(p => p.userId)).size;
            
            // Recent plays (last 7 days)
            const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
            const recentPlays = playStats.filter(p => new Date(p.timestamp) >= sevenDaysAgo).length;
            
            const overlay = document.getElementById('modal-overlay');
            const modalTitle = document.getElementById('modal-title');
            const modalBody = document.getElementById('modal-body');
            
            modalTitle.innerHTML = `<i class="fas fa-chart-line" style="color:var(--accent-color);margin-right:8px;"></i> Game Statistics`;
            modalBody.innerHTML = `
              <div style="text-align:center;padding:10px 0 20px;">
                <h3 style="color:var(--accent-color);font-size:20px;margin-bottom:5px;">${gameName}</h3>
                <p style="color:var(--text-muted);font-size:14px;">Detailed play statistics</p>
              </div>
              
              <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:15px;margin-bottom:25px;">
                <div style="background:rgba(0,255,102,0.1);border:1px solid rgba(0,255,102,0.3);border-radius:8px;padding:15px;text-align:center;">
                  <div style="font-size:28px;font-weight:bold;color:var(--accent-color);">${totalPlays}</div>
                  <div style="font-size:12px;color:var(--text-muted);margin-top:5px;">Total Plays</div>
                </div>
                <div style="background:rgba(0,255,102,0.1);border:1px solid rgba(0,255,102,0.3);border-radius:8px;padding:15px;text-align:center;">
                  <div style="font-size:28px;font-weight:bold;color:var(--accent-color);">${uniquePlayers}</div>
                  <div style="font-size:12px;color:var(--text-muted);margin-top:5px;">Unique Players</div>
                </div>
                <div style="background:rgba(0,255,102,0.1);border:1px solid rgba(0,255,102,0.3);border-radius:8px;padding:15px;text-align:center;">
                  <div style="font-size:28px;font-weight:bold;color:var(--accent-color);">${avgPlaytimeDisplay}</div>
                  <div style="font-size:12px;color:var(--text-muted);margin-top:5px;">Avg Playtime</div>
                </div>
              </div>
              
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:25px;">
                <div>
                  <h4 style="font-size:14px;margin-bottom:10px;color:var(--text-main);">Playtime Distribution</h4>
                  <div style="display:flex;flex-direction:column;gap:8px;">
                    <div style="display:flex;justify-content:space-between;padding:8px;background:rgba(255,255,255,0.05);border-radius:4px;">
                      <span style="font-size:12px;">Under 1 min</span>
                      <span style="font-weight:bold;color:var(--accent-color);">${playtimeUnder1m}</span>
                    </div>
                    <div style="display:flex;justify-content:space-between;padding:8px;background:rgba(255,255,255,0.05);border-radius:4px;">
                      <span style="font-size:12px;">1-5 min</span>
                      <span style="font-weight:bold;color:var(--accent-color);">${playtime1_5m}</span>
                    </div>
                    <div style="display:flex;justify-content:space-between;padding:8px;background:rgba(255,255,255,0.05);border-radius:4px;">
                      <span style="font-size:12px;">5-15 min</span>
                      <span style="font-weight:bold;color:var(--accent-color);">${playtime5_15m}</span>
                    </div>
                    <div style="display:flex;justify-content:space-between;padding:8px;background:rgba(255,255,255,0.05);border-radius:4px;">
                      <span style="font-size:12px;">15-30 min</span>
                      <span style="font-weight:bold;color:var(--accent-color);">${playtime15_30m}</span>
                    </div>
                    <div style="display:flex;justify-content:space-between;padding:8px;background:rgba(255,255,255,0.05);border-radius:4px;">
                      <span style="font-size:12px;">30-60 min</span>
                      <span style="font-weight:bold;color:var(--accent-color);">${playtime30_60m}</span>
                    </div>
                    <div style="display:flex;justify-content:space-between;padding:8px;background:rgba(255,255,255,0.05);border-radius:4px;">
                      <span style="font-size:12px;">Over 1 hour</span>
                      <span style="font-weight:bold;color:var(--accent-color);">${playtimeOver1h}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 style="font-size:14px;margin-bottom:10px;color:var(--text-main);">Device Distribution</h4>
                  <div style="display:flex;flex-direction:column;gap:8px;">
                    <div style="display:flex;justify-content:space-between;padding:8px;background:rgba(255,255,255,0.05);border-radius:4px;">
                      <span style="font-size:12px;"><i class="fas fa-desktop"></i> Desktop</span>
                      <span style="font-weight:bold;color:var(--accent-color);">${deviceDesktop}</span>
                    </div>
                    <div style="display:flex;justify-content:space-between;padding:8px;background:rgba(255,255,255,0.05);border-radius:4px;">
                      <span style="font-size:12px;"><i class="fas fa-mobile-alt"></i> Mobile</span>
                      <span style="font-weight:bold;color:var(--accent-color);">${deviceMobile}</span>
                    </div>
                    <div style="display:flex;justify-content:space-between;padding:8px;background:rgba(255,255,255,0.05);border-radius:4px;">
                      <span style="font-size:12px;"><i class="fas fa-tablet-alt"></i> Tablet</span>
                      <span style="font-weight:bold;color:var(--accent-color);">${deviceTablet}</span>
                    </div>
                  </div>
                  
                  <h4 style="font-size:14px;margin-bottom:10px;margin-top:20px;color:var(--text-main);">Recent Activity</h4>
                  <div style="display:flex;flex-direction:column;gap:8px;">
                    <div style="display:flex;justify-content:space-between;padding:8px;background:rgba(255,255,255,0.05);border-radius:4px;">
                      <span style="font-size:12px;">Last 7 days</span>
                      <span style="font-weight:bold;color:var(--accent-color);">${recentPlays}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <button id="close-stats-modal-btn" class="btn btn-secondary" style="width:100%;padding:12px;">
                Close
              </button>
            `;
            overlay.classList.add('active');
            
            document.getElementById('close-stats-modal-btn').onclick = () => overlay.classList.remove('active');
          } catch (err) {
            showToast('Failed to load game statistics: ' + err.message, 'danger');
          } finally {
            showLoader(false);
          }
        });
      });

      // Bind delete buttons — styled modal + immediate Firebase deletion
      approvedBody.querySelectorAll('.admin-delete-game').forEach(btn => {
        btn.addEventListener('click', () => {
          const gameId   = btn.getAttribute('data-id');
          const gameName = btn.getAttribute('data-name');

          const overlay    = document.getElementById('modal-overlay');
          const modalTitle = document.getElementById('modal-title');
          const modalBody  = document.getElementById('modal-body');

          modalTitle.innerHTML = `<i class="fas fa-trash" style="color:var(--danger-color);margin-right:8px;"></i> Delete Game`;
          modalBody.innerHTML = `
            <div style="text-align:center;padding:10px 0 20px;">
              <div style="font-size:52px;color:var(--danger-color);margin-bottom:16px;">
                <i class="fas fa-exclamation-triangle"></i>
              </div>
              <p style="font-size:16px;margin-bottom:8px;color:var(--text-main);">
                Are you sure you want to delete this game?
              </p>
              <p style="font-size:15px;color:var(--accent-color);font-family:var(--font-display);font-weight:bold;margin-bottom:14px;">
                "${gameName}"
              </p>
              <p style="font-size:13px;color:var(--text-muted);margin-bottom:26px;">
                This action is <strong style="color:var(--danger-color);">permanent</strong>. The game will be removed for all players immediately.
              </p>
              <div style="display:flex;gap:12px;justify-content:center;">
                <button id="confirm-delete-game-btn" class="btn btn-danger" style="flex:1;max-width:180px;">
                  <i class="fas fa-trash"></i> Yes, Delete It
                </button>
                <button id="cancel-delete-game-btn" class="btn btn-secondary" style="flex:1;max-width:180px;">
                  Cancel
                </button>
              </div>
            </div>
          `;
          overlay.classList.add('active');

          document.getElementById('cancel-delete-game-btn').onclick = () => overlay.classList.remove('active');

          document.getElementById('confirm-delete-game-btn').onclick = async () => {
            overlay.classList.remove('active');
            showLoader(true);
            try {
              await deleteGame(gameId);
              state.games = state.games.filter(g => g.id !== gameId);
              showToast(`"${gameName}" has been permanently deleted.`, 'success');
              renderAdmin();
            } catch (err) {
              showToast('Failed to delete game: ' + err.message, 'danger');
            } finally {
              showLoader(false);
            }
          };
        });
      });
    }
  } catch (err) {
    console.error("Error loading approved games:", err);
  }

  // Pull deletion requests
  try {
    const deletionRequests = getLocalStorageData('game_deletion_requests') || [];
    const deletionBody = document.getElementById('admin-deletion-requests-body');

    if (deletionRequests.length === 0) {
      deletionBody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-muted); padding: 30px;">No pending deletion requests.</td></tr>`;
    } else {
      const pendingDeletions = deletionRequests.filter(r => r.status === 'pending');
      deletionBody.innerHTML = pendingDeletions.map(req => {
        return `
          <tr>
            <td style="font-weight: bold; color: var(--accent-color);">${req.gameName}</td>
            <td>${req.developerName}</td>
            <td>${req.requestedByName}</td>
            <td>${new Date(req.createdAt).toLocaleDateString()}</td>
            <td>
              <div style="display: flex; gap: 8px;">
                <button class="btn btn-primary admin-approve-deletion" data-id="${req.id}" data-game-id="${req.gameId}" style="padding: 4px 8px; font-size: 10px;"><i class="fas fa-check"></i> Approve</button>
                <button class="btn btn-danger admin-reject-deletion" data-id="${req.id}" style="padding: 4px 8px; font-size: 10px;"><i class="fas fa-times"></i> Reject</button>
              </div>
            </td>
          </tr>
        `;
      }).join('');

      deletionBody.querySelectorAll('.admin-approve-deletion').forEach(btn => {
        btn.addEventListener('click', async () => {
          const requestId = btn.getAttribute('data-id');
          const gameId = btn.getAttribute('data-game-id');
          if (confirm('Approve this deletion request? The game will be permanently deleted.')) {
            showLoader(true);
            try {
              // Delete the game
              await removeGameByName(gameId);
              // Update deletion request status
              const requests = getLocalStorageData('game_deletion_requests');
              const reqIndex = requests.findIndex(r => r.id === requestId);
              if (reqIndex !== -1) {
                requests[reqIndex].status = 'approved';
                saveLocalStorageData('game_deletion_requests', requests);
              }
              // Update in Firebase if available
              if (firebaseLoaded && !fallbackMode) {
                const delRef = firebaseFirestore.doc(db, "game_deletion_requests", requestId);
                await firebaseFirestore.updateDoc(delRef, { status: 'approved', approvedAt: new Date().toISOString() });
              }
              showToast('Game deleted successfully!', 'success');
              await fetchGames();
              renderAdmin();
            } catch (err) {
              showToast('Failed to delete game: ' + err.message, 'danger');
            } finally {
              showLoader(false);
            }
          }
        });
      });

      deletionBody.querySelectorAll('.admin-reject-deletion').forEach(btn => {
        btn.addEventListener('click', async () => {
          const requestId = btn.getAttribute('data-id');
          if (confirm('Reject this deletion request?')) {
            try {
              const requests = getLocalStorageData('game_deletion_requests');
              const reqIndex = requests.findIndex(r => r.id === requestId);
              if (reqIndex !== -1) {
                requests[reqIndex].status = 'rejected';
                saveLocalStorageData('game_deletion_requests', requests);
              }
              if (firebaseLoaded && !fallbackMode) {
                const delRef = firebaseFirestore.doc(db, "game_deletion_requests", requestId);
                await firebaseFirestore.updateDoc(delRef, { status: 'rejected', rejectedAt: new Date().toISOString() });
              }
              showToast('Deletion request rejected', 'success');
              renderAdmin();
            } catch (err) {
              showToast('Failed to reject request', 'danger');
            }
          }
        });
      });
    }
  } catch (err) {
    console.error("Error loading deletion requests:", err);
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
function openDeveloperRequestModal(requestId, allRequests) {
  const overlay = document.getElementById('modal-overlay');
  const modalTitle = document.getElementById('modal-title');
  const modalBody = document.getElementById('modal-body');

  const currentIndex = allRequests.findIndex(r => r.id === requestId);
  const request = allRequests[currentIndex];

  modalTitle.textContent = "Developer Request Details";

  const isPending = request.status === 'pending';
  let statusBadge = '';
  if (request.status === 'approved') statusBadge = '<span class="badge badge-approved">Approved</span>';
  else if (request.status === 'rejected') statusBadge = '<span class="badge badge-rejected">Rejected</span>';
  else statusBadge = '<span class="badge badge-pending">Pending Review</span>';

  modalBody.innerHTML = `
    <div style="max-height: 70vh; overflow-y: auto; padding-right: 10px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <h3 style="margin: 0; color: var(--accent-color);">${request.username}</h3>
        ${statusBadge}
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
        <div>
          <label style="font-size: 12px; color: var(--text-muted);">Full Name</label>
          <div style="font-weight: 500;">${request.fullName || request.username}</div>
        </div>
        <div>
          <label style="font-size: 12px; color: var(--text-muted);">Email</label>
          <div style="font-weight: 500;">${request.contactEmail}</div>
        </div>
        <div>
          <label style="font-size: 12px; color: var(--text-muted);">Studio Name</label>
          <div style="font-weight: 500;">${request.studioName || 'N/A'}</div>
        </div>
        <div>
          <label style="font-size: 12px; color: var(--text-muted);">Age Range</label>
          <div style="font-weight: 500;">${request.age || 'N/A'}</div>
        </div>
        <div>
          <label style="font-size: 12px; color: var(--text-muted);">Experience</label>
          <div style="font-weight: 500;">${request.experience || 'N/A'}</div>
        </div>
        <div>
          <label style="font-size: 12px; color: var(--text-muted);">Submitted</label>
          <div style="font-weight: 500;">${new Date(request.createdAt).toLocaleString()}</div>
        </div>
      </div>

      <div style="margin-bottom: 20px;">
        <label style="font-size: 12px; color: var(--text-muted);">About as Developer</label>
        <div style="background: rgba(255,255,255,0.05); padding: 15px; border-radius: 8px; margin-top: 5px;">
          ${request.about || 'Not provided'}
        </div>
      </div>

      <div style="margin-bottom: 20px;">
        <label style="font-size: 12px; color: var(--text-muted);">Tools & Engines</label>
        <div style="background: rgba(255,255,255,0.05); padding: 15px; border-radius: 8px; margin-top: 5px;">
          ${request.tools || 'Not provided'}
        </div>
      </div>

      <div style="margin-bottom: 20px;">
        <label style="font-size: 12px; color: var(--text-muted);">Past Games Experience</label>
        <div style="background: rgba(255,255,255,0.05); padding: 15px; border-radius: 8px; margin-top: 5px;">
          ${request.pastGames || 'Not provided'}
        </div>
      </div>

      <div style="margin-bottom: 20px;">
        <label style="font-size: 12px; color: var(--text-muted);">Game Types</label>
        <div style="background: rgba(255,255,255,0.05); padding: 15px; border-radius: 8px; margin-top: 5px;">
          ${request.gameTypes || 'Not provided'}
        </div>
      </div>

      <div style="margin-bottom: 20px;">
        <label style="font-size: 12px; color: var(--text-muted);">Reason for Request</label>
        <div style="background: rgba(255,255,255,0.05); padding: 15px; border-radius: 8px; margin-top: 5px;">
          ${request.reason}
        </div>
      </div>

      <div style="margin-bottom: 20px;">
        <label style="font-size: 12px; color: var(--text-muted);">Plans for Upload</label>
        <div style="background: rgba(255,255,255,0.05); padding: 15px; border-radius: 8px; margin-top: 5px;">
          ${request.plans || 'Not provided'}
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
        <div>
          <label style="font-size: 12px; color: var(--text-muted);">Content Ownership</label>
          <div style="font-weight: 500;">${request.ownership || 'Not provided'}</div>
        </div>
        <div>
          <label style="font-size: 12px; color: var(--text-muted);">No Malware Commitment</label>
          <div style="font-weight: 500;">${request.noMalware ? '✓ Yes' : '✗ No'}</div>
        </div>
        <div>
          <label style="font-size: 12px; color: var(--text-muted);">No Copyright Commitment</label>
          <div style="font-weight: 500;">${request.noCopyright ? '✓ Yes' : '✗ No'}</div>
        </div>
        <div>
          <label style="font-size: 12px; color: var(--text-muted);">Terms Agreement</label>
          <div style="font-weight: 500;">${request.terms ? '✓ Yes' : '✗ No'}</div>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
        <div>
          <label style="font-size: 12px; color: var(--text-muted);">Discord</label>
          <div style="font-weight: 500;">${request.discord || 'N/A'}</div>
        </div>
        <div>
          <label style="font-size: 12px; color: var(--text-muted);">Country</label>
          <div style="font-weight: 500;">${request.country || 'N/A'}</div>
        </div>
        <div>
          <label style="font-size: 12px; color: var(--text-muted);">Programming Language</label>
          <div style="font-weight: 500;">${request.language || 'N/A'}</div>
        </div>
        <div>
          <label style="font-size: 12px; color: var(--text-muted);">Team vs Solo</label>
          <div style="font-weight: 500;">${request.team || 'N/A'}</div>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
        <div>
          <label style="font-size: 12px; color: var(--text-muted);">Planned Game Count</label>
          <div style="font-weight: 500;">${request.gameCount || 'N/A'}</div>
        </div>
        <div>
          <label style="font-size: 12px; color: var(--text-muted);">Heard About Us</label>
          <div style="font-weight: 500;">${request.heardAbout || 'N/A'}</div>
        </div>
      </div>

      <div style="margin-bottom: 20px;">
        <label style="font-size: 12px; color: var(--text-muted);">Previous Game Link</label>
        <div style="font-weight: 500;">${request.previousGame ? `<a href="${request.previousGame}" target="_blank" style="color: #0096ff; text-decoration: underline;">${request.previousGame}</a>` : 'N/A'}</div>
      </div>

      <div style="margin-bottom: 20px;">
        <label style="font-size: 12px; color: var(--text-muted);">Portfolio Link</label>
        <div style="font-weight: 500;">${request.portfolio ? `<a href="${request.portfolio}" target="_blank" style="color: #0096ff; text-decoration: underline;">${request.portfolio}</a>` : 'N/A'}</div>
      </div>

      ${request.additional ? `
        <div style="margin-bottom: 20px;">
          <label style="font-size: 12px; color: var(--text-muted);">Additional Information</label>
          <div style="background: rgba(255,255,255,0.05); padding: 15px; border-radius: 8px; margin-top: 5px;">
            ${request.additional}
          </div>
        </div>
      ` : ''}

      ${request.adminSuggestions ? `
        <div style="margin-bottom: 20px;">
          <label style="font-size: 12px; color: var(--text-muted);">Admin Notes</label>
          <div style="background: rgba(255,255,255,0.05); padding: 15px; border-radius: 8px; margin-top: 5px; color: var(--accent-color);">
            ${request.adminSuggestions}
          </div>
        </div>
      ` : ''}

      <div style="display: flex; gap: 10px; margin-top: 25px;">
        ${isPending ? `
          <button class="btn btn-primary" onclick="openAdminReasonModal('${request.id}', 'approved', 'dev')" style="flex: 1;">
            <i class="fas fa-check"></i> Approve
          </button>
          <button class="btn btn-danger" onclick="openAdminReasonModal('${request.id}', 'rejected', 'dev')" style="flex: 1;">
            <i class="fas fa-times"></i> Reject
          </button>
        ` : `
          <button class="btn btn-secondary" onclick="document.getElementById('modal-overlay').classList.remove('active')" style="flex: 1;">
            <i class="fas fa-times"></i> Close
          </button>
        `}
      </div>

      <div style="display: flex; justify-content: space-between; margin-top: 20px; padding-top: 15px; border-top: 1px solid rgba(255,255,255,0.1);">
        <button class="btn btn-secondary" onclick="navigateDeveloperRequest(${currentIndex}, -1)" style="padding: 8px 16px;">
          <i class="fas fa-chevron-left"></i> Previous
        </button>
        <span style="color: var(--text-muted); font-size: 14px;">
          ${currentIndex + 1} / ${allRequests.length}
        </span>
        <button class="btn btn-secondary" onclick="navigateDeveloperRequest(${currentIndex}, 1)" style="padding: 8px 16px;">
          Next <i class="fas fa-chevron-right"></i>
        </button>
      </div>
    </div>
  `;

  overlay.classList.add('active');

  // Store current requests for navigation
  window.currentDevRequests = allRequests;
  window.currentDevIndex = currentIndex;
}

function navigateDeveloperRequest(currentIndex, direction) {
  const allRequests = window.currentDevRequests;
  let newIndex = currentIndex + direction;
  
  // Loop navigation
  if (newIndex < 0) newIndex = allRequests.length - 1;
  if (newIndex >= allRequests.length) newIndex = 0;
  
  const newRequest = allRequests[newIndex];
  openDeveloperRequestModal(newRequest.id, allRequests);
}

function openGameRequestModal(requestId, allRequests) {
  const overlay = document.getElementById('modal-overlay');
  const modalTitle = document.getElementById('modal-title');
  const modalBody = document.getElementById('modal-body');

  const currentIndex = allRequests.findIndex(r => r.id === requestId);
  const request = allRequests[currentIndex];

  modalTitle.textContent = "Game Request Details";

  const isPending = request.status === 'pending';
  let statusBadge = '';
  if (request.status === 'approved') statusBadge = '<span class="badge badge-approved">Approved</span>';
  else if (request.status === 'rejected') statusBadge = '<span class="badge badge-rejected">Rejected</span>';
  else if (request.status === 'improvement') statusBadge = '<span class="badge badge-improvement">Needs Improvement</span>';
  else statusBadge = '<span class="badge badge-pending">Pending Review</span>';

  const typeBadge = request.type === 'version_update'
    ? `<span class="badge badge-pending" style="background: rgba(112, 214, 255, 0.15); color: #70d6ff; border-color: rgba(112,214,255,0.3);">Version Update (${request.version})</span>`
    : '';

  modalBody.innerHTML = `
    <div style="max-height: 70vh; overflow-y: auto; padding-right: 10px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <h3 style="margin: 0; color: var(--accent-color);">${request.name} ${typeBadge}</h3>
        ${statusBadge}
      </div>

      <div style="display: flex; gap: 20px; margin-bottom: 20px;">
        <img src="${request.logoUrl}" style="width: 100px; height: 100px; border-radius: 10px; object-fit: cover; border: 2px solid rgba(255,255,255,0.1);">
        <div style="flex: 1;">
          <div style="margin-bottom: 10px;">
            <label style="font-size: 12px; color: var(--text-muted);">Developer</label>
            <div style="font-weight: 500;">${request.developerName}</div>
          </div>
          <div style="margin-bottom: 10px;">
            <label style="font-size: 12px; color: var(--text-muted);">Categories</label>
            <div style="font-weight: 500;">${request.categories ? request.categories.map(c => `${getCategoryIcon(c)} ${c}`).join(', ') : ''}</div>
          </div>
          <div>
            <label style="font-size: 12px; color: var(--text-muted);">Target Audience</label>
            <div style="font-weight: 500;">${request.targetAudience}</div>
          </div>
        </div>
      </div>

      <div style="margin-bottom: 20px;">
        <label style="font-size: 12px; color: var(--text-muted);">Description</label>
        <div style="background: rgba(255,255,255,0.05); padding: 15px; border-radius: 8px; margin-top: 5px;">
          ${request.description}
        </div>
      </div>

      <div style="margin-bottom: 20px;">
        <label style="font-size: 12px; color: var(--text-muted);">How to Play</label>
        <div style="background: rgba(255,255,255,0.05); padding: 15px; border-radius: 8px; margin-top: 5px;">
          ${request.howToPlay}
        </div>
      </div>

      ${request.type === 'version_update' ? `
        <div style="margin-bottom: 20px;">
          <label style="font-size: 12px; color: var(--text-muted);">What's New in This Version</label>
          <div style="background: rgba(255,255,255,0.05); padding: 15px; border-radius: 8px; margin-top: 5px; color: var(--accent-color);">
            ${request.changelog}
          </div>
        </div>
      ` : ''}

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
        <div>
          <label style="font-size: 12px; color: var(--text-muted);">GitHub</label>
          <div><a href="${request.githubUrl}" target="_blank" style="color: #0096ff; text-decoration: underline;">${request.githubUrl}</a></div>
        </div>
        <div>
          <label style="font-size: 12px; color: var(--text-muted);">Game URL</label>
          <div><a href="${request.gameUrl}" target="_blank" style="color: #0096ff; text-decoration: underline;">${request.gameUrl}</a></div>
        </div>
      </div>

      ${request.adminSuggestions ? `
        <div style="margin-bottom: 20px;">
          <label style="font-size: 12px; color: var(--text-muted);">Admin Notes</label>
          <div style="background: rgba(255,255,255,0.05); padding: 15px; border-radius: 8px; margin-top: 5px; color: var(--accent-color);">
            ${request.adminSuggestions}
          </div>
        </div>
      ` : ''}

      <div style="display: flex; gap: 10px; margin-top: 25px;">
        ${isPending ? `
          <button class="btn btn-primary" onclick="openAdminReasonModal('${request.id}', 'approved', 'game')" style="flex: 1;">
            <i class="fas fa-check"></i> Approve
          </button>
          <button class="btn btn-secondary" onclick="openAdminReasonModal('${request.id}', 'improvement', 'game')" style="flex: 1; border-color: #0096ff; color: #0096ff;">
            <i class="fas fa-comment-dots"></i> Improve
          </button>
          <button class="btn btn-danger" onclick="openAdminReasonModal('${request.id}', 'rejected', 'game')" style="flex: 1;">
            <i class="fas fa-times"></i> Reject
          </button>
        ` : `
          <button class="btn btn-secondary" onclick="document.getElementById('modal-overlay').classList.remove('active')" style="flex: 1;">
            <i class="fas fa-times"></i> Close
          </button>
        `}
      </div>

      <div style="display: flex; justify-content: space-between; margin-top: 20px; padding-top: 15px; border-top: 1px solid rgba(255,255,255,0.1);">
        <button class="btn btn-secondary" onclick="navigateGameRequest(${currentIndex}, -1)" style="padding: 8px 16px;">
          <i class="fas fa-chevron-left"></i> Previous
        </button>
        <span style="color: var(--text-muted); font-size: 14px;">
          ${currentIndex + 1} / ${allRequests.length}
        </span>
        <button class="btn btn-secondary" onclick="navigateGameRequest(${currentIndex}, 1)" style="padding: 8px 16px;">
          Next <i class="fas fa-chevron-right"></i>
        </button>
      </div>
    </div>
  `;

  overlay.classList.add('active');

  // Store current requests for navigation
  window.currentGameRequests = allRequests;
  window.currentGameIndex = currentIndex;
}

function navigateGameRequest(currentIndex, direction) {
  const allRequests = window.currentGameRequests;
  let newIndex = currentIndex + direction;
  
  // Loop navigation
  if (newIndex < 0) newIndex = allRequests.length - 1;
  if (newIndex >= allRequests.length) newIndex = 0;
  
  const newRequest = allRequests[newIndex];
  openGameRequestModal(newRequest.id, allRequests);
}

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
        <textarea id="admin-notes" required placeholder="Enter text here..." rows="8" style="min-height: 160px; resize: vertical;"></textarea>
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
        <label>Categories (select up to 4)</label>
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
          <label class="category-checkbox-label">
            <input type="checkbox" name="direct-cats" value="STRATEGY"> STRATEGY
          </label>
          <label class="category-checkbox-label">
            <input type="checkbox" name="direct-cats" value="HORROR"> HORROR
          </label>
          <label class="category-checkbox-label">
            <input type="checkbox" name="direct-cats" value="RACING"> RACING
          </label>
          <label class="category-checkbox-label">
            <input type="checkbox" name="direct-cats" value="SIMULATION"> SIMULATION
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
      directCatBoxes.forEach(b => { if (!b.checked) b.disabled = checkedCount >= 4; });
    });
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const checkedBoxes = form.querySelectorAll('input[name="direct-cats"]:checked');
    if (checkedBoxes.length === 0) {
      showToast("Select at least one category!", "warning");
      return;
    }
    if (checkedBoxes.length > 4) {
      showToast("You can select up to 4 categories only!", "warning");
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

// Load Python Turtle Game
function loadPythonTurtleGame(canvas, pythonCode) {
  // For Python Turtle games, we'll use a simple approach
  // In a production environment, you would use Skulpt or Pyodide
  // For now, we'll create a basic turtle-like implementation in JavaScript

  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Simple turtle simulation
  let turtle = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    angle: 0,
    penDown: true,
    color: '#00ff66'
  };

  function drawTurtle() {
    ctx.fillStyle = turtle.color;
    ctx.beginPath();
    ctx.arc(turtle.x, turtle.y, 5, 0, Math.PI * 2);
    ctx.fill();
  }

  // Parse basic Python Turtle commands and execute them
  // This is a simplified implementation
  const commands = pythonCode.split('\n');
  let commandIndex = 0;

  function executeNextCommand() {
    if (commandIndex >= commands.length) return;

    const line = commands[commandIndex].trim();
    commandIndex++;

    if (line.startsWith('forward(') || line.startsWith('fd(')) {
      const distance = parseInt(line.match(/\d+/)[0]);
      const newX = turtle.x + Math.cos(turtle.angle * Math.PI / 180) * distance;
      const newY = turtle.y + Math.sin(turtle.angle * Math.PI / 180) * distance;

      if (turtle.penDown) {
        ctx.strokeStyle = turtle.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(turtle.x, turtle.y);
        ctx.lineTo(newX, newY);
        ctx.stroke();
      }

      turtle.x = newX;
      turtle.y = newY;
      drawTurtle();
      setTimeout(executeNextCommand, 100);
    } else if (line.startsWith('right(') || line.startsWith('rt(')) {
      const angle = parseInt(line.match(/\d+/)[0]);
      turtle.angle += angle;
      setTimeout(executeNextCommand, 100);
    } else if (line.startsWith('left(') || line.startsWith('lt(')) {
      const angle = parseInt(line.match(/\d+/)[0]);
      turtle.angle -= angle;
      setTimeout(executeNextCommand, 100);
    } else if ( line.startsWith('penup(') || line.startsWith('pu(')) {
      turtle.penDown = false;
      setTimeout(executeNextCommand, 100);
    } else if (line.startsWith('pendown(') || line.startsWith('pd(')) {
      turtle.penDown = true;
      setTimeout(executeNextCommand, 100);
    } else if (line.startsWith('color(')) {
      const colorMatch = line.match(/'([^']+)'/);
      if (colorMatch) {
        turtle.color = colorMatch[1];
      }
      setTimeout(executeNextCommand, 100);
    } else {
      setTimeout(executeNextCommand, 50);
    }
  }

  drawTurtle();
  executeNextCommand();

  state.gameInstance = {
    stop: () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };
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

        <div class="bug-report-section" id="bug-report-section">
          <button class="bug-report-btn" id="bug-report-toggle-btn"><i class="fas fa-bug"></i> Report a Bug</button>
          <div class="bug-report-form-wrap" id="bug-report-form-wrap">
            <textarea id="bug-report-text" rows="4" placeholder="Describe the bug you encountered..."></textarea>
            <button class="btn btn-primary" id="bug-report-submit-btn" style="width:100%; margin-top:8px;"><i class="fas fa-paper-plane"></i> Submit Report</button>
          </div>
          <div class="bug-report-thank" id="bug-report-thank" style="display:none;"><i class="fas fa-check-circle"></i> Thank you for your report!</div>
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

    // Check if this is a Python Turtle game
    if (game.gameType === 'python' || game.gameUrl === 'python://turtle') {
      const canvas = document.getElementById('retro-game-canvas');
      canvas.style.display = 'block';

      // Load Python Turtle code
      if (game.pythonCode) {
        loadPythonTurtleGame(canvas, game.pythonCode);
      } else {
        showToast('Python code not found for this game', 'danger');
      }
    } else if (game.gameUrl) {
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

  // Bind Bug Report Button
  const bugToggleBtn = document.getElementById('bug-report-toggle-btn');
  const bugFormWrap = document.getElementById('bug-report-form-wrap');
  const bugThank = document.getElementById('bug-report-thank');
  const bugSubmitBtn = document.getElementById('bug-report-submit-btn');

  if (bugToggleBtn) {
    bugToggleBtn.addEventListener('click', () => {
      const isOpen = bugFormWrap.classList.contains('open');
      bugFormWrap.classList.toggle('open', !isOpen);
      bugToggleBtn.innerHTML = isOpen
        ? '<i class="fas fa-bug"></i> Report a Bug'
        : '<i class="fas fa-times"></i> Cancel';
    });
  }

  if (bugSubmitBtn) {
    bugSubmitBtn.addEventListener('click', async () => {
      const text = document.getElementById('bug-report-text').value.trim();
      if (!text) { showToast('Please describe the bug before submitting.', 'warning'); return; }
      bugSubmitBtn.disabled = true;
      bugSubmitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
      try {
        await submitBugReport(
          game.id,
          game.name,
          game.developerUid,
          text,
          state.user ? state.user.uid : 'anonymous',
          state.user ? (state.user.username || state.user.email || 'Player') : 'Guest'
        );
        bugFormWrap.classList.remove('open');
        bugThank.style.display = 'block';
        bugToggleBtn.style.display = 'none';
      } catch (err) {
        showToast('Failed to send report. Please try again.', 'danger');
        bugSubmitBtn.disabled = false;
        bugSubmitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Submit Report';
      }
    });
  }

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
          <div style="display: flex; align-items: center; gap: 20px; margin-bottom: 20px;">
            <div style="position: relative;">
              <img src="${state.user.avatarUrl || 'https://placehold.co/100x100/12161e/00ff66?text=' + state.user.username.charAt(0).toUpperCase()}" 
                   id="settings-avatar-preview" 
                   style="width: 100px; height: 100px; border-radius: 50%; object-fit: cover; border: 3px solid var(--accent-color); box-shadow: var(--border-glow);">
              <label for="settings-avatar-upload" style="position: absolute; bottom: 0; right: 0; width: 32px; height: 32px; background: var(--accent-color); border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; box-shadow: 0 2px 8px rgba(0,0,0,0.3);">
                <i class="fas fa-camera" style="color: #000; font-size: 14px;"></i>
              </label>
              <input type="file" id="settings-avatar-upload" accept="image/*" style="display: none;">
            </div>
            <div>
              <strong style="display: block; margin-bottom: 5px;">Profile Picture</strong>
              <span style="font-size: 12px; color: var(--text-muted);">Click the camera icon to upload a new avatar</span>
            </div>
          </div>
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
            Update Profile
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
          <div style="margin-bottom: 25px;">
            <label style="font-size: 12px; color: var(--text-muted); text-transform: uppercase; font-family: var(--font-display);">Theme Mode</label>
            <div style="display: flex; gap: 10px; margin-top: 10px;">
              <button class="btn ${state.darkMode !== false ? 'btn-primary' : 'btn-secondary'}" id="theme-dark-btn" style="flex: 1;">
                <i class="fas fa-moon"></i> Dark
              </button>
              <button class="btn ${state.darkMode === false ? 'btn-primary' : 'btn-secondary'}" id="theme-light-btn" style="flex: 1;">
                <i class="fas fa-sun"></i> Light
              </button>
            </div>
          </div>

          <div style="margin-bottom: 25px;">
            <label style="font-size: 12px; color: var(--text-muted); text-transform: uppercase; font-family: var(--font-display);">Brightness</label>
            <input type="range" id="brightness-slider" min="50" max="150" value="${state.brightness || 100}" style="width: 100%; margin-top: 10px; accent-color: var(--accent-color);">
            <div style="display: flex; justify-content: space-between; font-size: 11px; color: var(--text-muted); margin-top: 5px;">
              <span>Darker</span>
              <span id="brightness-value">${state.brightness || 100}%</span>
              <span>Brighter</span>
            </div>
          </div>

          <div>
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
    </div>

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

  // Avatar upload binding
  const avatarUpload = document.getElementById('settings-avatar-upload');
  const avatarPreview = document.getElementById('settings-avatar-preview');

  avatarUpload.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showToast('Please select an image file', 'danger');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      showToast('Image size must be less than 2MB', 'danger');
      return;
    }

    showLoader(true);
    try {
      // Convert image to base64
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64Image = event.target.result;

        // Update preview
        avatarPreview.src = base64Image;

        // Save to user profile
        await updateUserProfile(state.user.uid, { avatarUrl: base64Image });
        state.user.avatarUrl = base64Image;
        renderUserBadge();

        showToast('Avatar updated successfully!', 'success');
        showLoader(false);
      };
      reader.onerror = () => {
        showToast('Failed to read image file', 'danger');
        showLoader(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('Error uploading avatar:', err);
      showToast('Failed to upload avatar: ' + err.message, 'danger');
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

  // Theme toggle bindings
  document.getElementById('theme-dark-btn').addEventListener('click', async () => {
    state.darkMode = true;
    await updateUserProfile(state.user.uid, { darkMode: true });
    applyThemeMode(true);
    renderSettings();
  });

  document.getElementById('theme-light-btn').addEventListener('click', async () => {
    state.darkMode = false;
    await updateUserProfile(state.user.uid, { darkMode: false });
    applyThemeMode(false);
    renderSettings();
  });

  // Brightness slider binding
  const brightnessSlider = document.getElementById('brightness-slider');
  const brightnessValue = document.getElementById('brightness-value');
  
  brightnessSlider.addEventListener('input', (e) => {
    const brightness = e.target.value;
    brightnessValue.textContent = brightness + '%';
    applyBrightness(brightness);
  });

  brightnessSlider.addEventListener('change', async (e) => {
    const brightness = e.target.value;
    state.brightness = brightness;
    await updateUserProfile(state.user.uid, { brightness: brightness });
    showToast("Brightness updated!", "success");
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

function applyThemeMode(isDark) {
  const root = document.documentElement;
  if (isDark) {
    root.style.setProperty('--bg-primary', '#0a0a0f');
    root.style.setProperty('--bg-secondary', '#12121a');
    root.style.setProperty('--bg-darker', '#08080c');
    root.style.setProperty('--text-primary', '#ffffff');
    root.style.setProperty('--text-secondary', '#e0e0e0');
    root.style.setProperty('--text-muted', '#a0a0a0');
    root.style.setProperty('--text-dark', '#606060');
    root.style.setProperty('--card-bg', '#15151f');
  } else {
    root.style.setProperty('--bg-primary', '#f5f5f7');
    root.style.setProperty('--bg-secondary', '#ffffff');
    root.style.setProperty('--bg-darker', '#e5e5e7');
    root.style.setProperty('--text-primary', '#1a1a1a');
    root.style.setProperty('--text-secondary', '#2a2a2a');
    root.style.setProperty('--text-muted', '#6a6a6a');
    root.style.setProperty('--text-dark', '#4a4a4a');
    root.style.setProperty('--card-bg', '#ffffff');
  }
}

function applyBrightness(brightness) {
  const root = document.documentElement;
  const brightnessValue = brightness / 100;
  root.style.filter = `brightness(${brightnessValue})`;
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
  },
  'game-dev-tips': {
    title: 'Tips for Aspiring Game Developers',
    date: 'July 1, 2026',
    icon: 'fa-code',
    excerpt: 'Learn how to create and publish your own games on DIGGY.',
    content: `
      <p>Want to become a game developer on DIGGY? Here are some tips to get started:</p>
      <h3>Start Simple</h3>
      <p>Begin with small, manageable projects. A simple arcade game is a great way to learn the basics of game development.</p>
      <h3>Choose Your Tools</h3>
      <ul>
        <li><strong>HTML5/JavaScript</strong> — Perfect for web-based games</li>
        <li><strong>Unity</strong> — Powerful engine for 2D and 3D games</li>
        <li><strong>Godot</strong> — Free and open-source game engine</li>
        <li><strong>Construct 3</strong> — Easy drag-and-drop game maker</li>
      </ul>
      <h3>Test Thoroughly</h3>
      <p>Test your game on different browsers and devices. Make sure the controls are intuitive and the game is fun to play.</p>
      <h3>Submit to DIGGY</h3>
      <p>Once your game is ready, apply for a developer account and submit your game. Our team will review it and publish it if it meets our quality standards.</p>
    `
  },
  'leaderboard-system': {
    title: 'Understanding the Leaderboard System',
    date: 'July 5, 2026',
    icon: 'fa-trophy',
    excerpt: 'How games are ranked and what makes a game popular.',
    content: `
      <p>The DIGGY leaderboard showcases the top games across all categories. Here's how it works:</p>
      <h3>Ranking Criteria</h3>
      <ul>
        <li><strong>Number of Plays</strong> — Games with more plays rank higher</li>
        <li><strong>Average Rating</strong> — Higher rated games get priority</li>
        <li><strong>Recent Activity</strong> — Active games get a boost</li>
      </ul>
      <h3>Category Rankings</h3>
      <p>Each category (RPG, ACTION, PUZZLE, etc.) has its own leaderboard. This helps players discover the best games in their favorite genres.</p>
      <h3>How to Climb the Ranks</h3>
      <ul>
        <li>Create engaging, fun gameplay</li>
        <li>Encourage players to rate your game</li>
        <li>Keep your game updated with new features</li>
        <li>Respond to player feedback and bug reports</li>
      </ul>
    `
  },
  'bug-reporting': {
    title: 'How to Report Bugs Effectively',
    date: 'July 8, 2026',
    icon: 'fa-bug',
    excerpt: 'Help us improve games by reporting bugs the right way.',
    content: `
      <p>Found a bug in a game? Help us fix it by reporting it properly:</p>
      <h3>What to Include</h3>
      <ul>
        <li><strong>Game Name</strong> — Which game has the bug?</li>
        <li><strong>Description</strong> — What happened? What did you expect to happen?</li>
        <li><strong>Steps to Reproduce</strong> — What actions lead to the bug?</li>
        <li><strong>Screenshot</strong> — If possible, include a screenshot of the bug</li>
      </ul>
      <h3>Where to Report</h3>
      <p>Use the bug report button on the game page, or contact us through the <a href="#/contact" style="color: var(--accent-color);">contact page</a>.</p>
      <h3>What Happens Next</h3>
      <p>Our team reviews all bug reports and forwards them to the game developer. You'll be notified when the bug is fixed.</p>
    `
  },
  'account-security': {
    title: 'Keeping Your Account Secure',
    date: 'July 10, 2026',
    icon: 'fa-lock',
    excerpt: 'Best practices for protecting your DIGGY account.',
    content: `
      <p>Account security is important. Here's how to keep your DIGGY account safe:</p>
      <h3>Password Tips</h3>
      <ul>
        <li>Use a strong password with at least 8 characters</li>
        <li>Include a mix of letters, numbers, and symbols</li>
        <li>Don't reuse passwords from other sites</li>
        <li>Change your password regularly</li>
      </ul>
      <h3>Two-Factor Authentication</h3>
      <p>We recommend enabling two-factor authentication (2FA) for extra security. This adds an extra layer of protection to your account.</p>
      <h3>Recognize Phishing</h3>
      <ul>
        <li>DIGGY will never ask for your password via email</li>
        <li>Check the URL before entering your credentials</li>
        <li>Report suspicious emails to our support team</li>
      </ul>
    `
  },
  'mobile-gaming': {
    title: 'Gaming on Mobile Devices',
    date: 'July 12, 2026',
    icon: 'fa-mobile-alt',
    excerpt: 'Tips for the best mobile gaming experience on DIGGY.',
    content: `
      <p>DIGGY works great on mobile devices! Here's how to get the best experience:</p>
      <h3>Optimal Settings</h3>
      <ul>
        <li>Use landscape mode for better gameplay</li>
        <li>Enable auto-rotate in your device settings</li>
        <li>Close other apps to free up memory</li>
        <li>Connect to WiFi for faster loading</li>
      </ul>
      <h3>Touch Controls</h3>
      <p>Many games on DIGGY are optimized for touch controls. Look for games with the "Mobile Friendly" badge.</p>
      <h3>Browser Recommendations</h3>
      <ul>
        <li><strong>Chrome</strong> — Best overall performance</li>
        <li><strong>Safari</strong> — Great on iOS devices</li>
        <li><strong>Firefox</strong> — Good alternative option</li>
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
        <p style="color: var(--text-muted); margin-top: 5px;">Last updated: July 2026 | Effective Date: July 13, 2026</p>
      </div>
    </div>
    <div class="legal-page-content">
      <div class="doc-section">
        <h3>1. Acceptance of Terms</h3>
        <p>By accessing, browsing, or using the DIGGY Arena platform (the "Service"), you acknowledge that you have read, understood, and agree to be bound by these Terms of Use ("Terms") and our Privacy Policy. If you do not agree to these Terms in their entirety, you must not access or use the Service.</p>
        <p>These Terms constitute a legally binding agreement between you and DIGGY Arena Ltd. ("DIGGY Arena", "we", "us", or "our"). Your use of the Service is conditioned upon your compliance with these Terms.</p>
        <p>We reserve the right to modify these Terms at any time, at our sole discretion. All changes will be effective immediately upon posting to the Service. Your continued use of the Service following the posting of revised Terms constitutes your acceptance of such changes. It is your responsibility to review these Terms periodically for any modifications.</p>
      </div>

      <div class="doc-section">
        <h3>2. Eligibility and Account Registration</h3>
        <p><strong>2.1 Age Requirement:</strong> You must be at least 13 years of age to create an account and use the Service. By creating an account, you represent and warrant that you are at least 13 years old. If you are under 18 years of age, you must have the consent of your parent or legal guardian to use the Service.</p>
        <p><strong>2.2 Account Security:</strong> You are responsible for maintaining the confidentiality of your account credentials, including your username and password. You agree to notify us immediately of any unauthorized use of your account or any other breach of security. You are solely responsible for all activities that occur under your account, whether or not you authorized such activities.</p>
        <p><strong>2.3 Account Information:</strong> You agree to provide accurate, current, and complete information during the registration process and to update such information to keep it accurate, current, and complete. You agree not to impersonate any person or entity or misrepresent your affiliation with any person or entity.</p>
        <p><strong>2.4 Account Termination:</strong> We reserve the right to suspend or terminate your account at any time, with or without cause, with or without notice, for any reason, including but not limited to violation of these Terms, fraudulent activity, or abuse of the Service.</p>
      </div>

      <div class="doc-section">
        <h3>3. Intellectual Property Rights</h3>
        <p><strong>3.1 DIGGY Arena Content:</strong> All content, features, and functionality of the Service, including but not limited to text, graphics, logos, software, designs, interface, and code, are owned by DIGGY Arena Ltd. or our licensors and are protected by copyright, trademark, and other intellectual property laws. All rights are reserved.</p>
        <p><strong>3.2 User-Generated Content:</strong> Any content you submit, post, or display on the Service, including but not limited to game reviews, comments, ratings, and feedback ("User Content"), remains your property. However, by submitting User Content, you grant DIGGY Arena a worldwide, non-exclusive, royalty-free, perpetual, irrevocable, and fully sublicensable right to use, reproduce, modify, adapt, publish, translate, create derivative works from, distribute, and display such User Content in connection with the Service.</p>
        <p><strong>3.3 Developer Game Content:</strong> Games published on the Service by developers remain the intellectual property of their respective developers. Developers grant DIGGY Arena a non-exclusive, worldwide, royalty-free license to host, display, and distribute their games on the Service. Developers represent and warrant that they have all necessary rights to grant such license.</p>
        <p><strong>3.4 Copyright Infringement:</strong> DIGGY Arena respects the intellectual property rights of others. If you believe that your copyrighted work has been copied in a way that constitutes copyright infringement and is accessible on the Service, please notify us immediately via the <a href="#/contact" style="color: var(--accent-color);">contact page</a> with a detailed description of the alleged infringement. We will respond to all valid DMCA takedown notices within 48 hours of receipt.</p>
      </div>

      <div class="doc-section">
        <h3>4. Permitted and Prohibited Uses</h3>
        <p><strong>4.1 Permitted Uses:</strong> You may use the Service for personal, non-commercial purposes, including playing games, rating games, reading content, and interacting with other users in accordance with these Terms.</p>
        <p><strong>4.2 Prohibited Uses:</strong> You agree not to:</p>
        <ul>
          <li>Use the Service for any illegal or unauthorized purpose</li>
          <li>Reverse engineer, decompile, disassemble, or attempt to derive the source code of any software or technology used in the Service</li>
          <li>Access, scrape, or harvest data from the Service through automated means</li>
          <li>Use the Service to distribute malware, viruses, or harmful code</li>
          <li>Interfere with or disrupt the Service or servers connected to the Service</li>
          <li>Use the Service to harass, abuse, or harm other users</li>
          <li>Post or transmit content that is defamatory, obscene, offensive, or otherwise objectionable</li>
          <li>Impersonate any person or entity or misrepresent your affiliation</li>
          <li>Use the Service for commercial purposes without prior written consent</li>
          <li>Attempt to gain unauthorized access to any part of the Service</li>
        </ul>
      </div>

      <div class="doc-section">
        <h3>5. Developer Responsibilities</h3>
        <p><strong>5.1 Game Content:</strong> Developers are solely responsible for the content of their games, including ensuring that games do not contain malware, viruses, or harmful code. Developers represent and warrant that their games do not infringe upon the intellectual property rights of third parties.</p>
        <p><strong>5.2 Game Quality:</strong> Developers must ensure that their games are functional, safe, and appropriate for the intended audience. DIGGY Arena reserves the right to remove any game that violates these Terms or is deemed inappropriate.</p>
        <p><strong>5.3 Revenue Sharing:</strong> Any revenue sharing arrangements between DIGGY Arena and developers are governed by separate written agreements. These Terms do not create any obligation for DIGGY Arena to share revenue with developers.</p>
      </div>

      <div class="doc-section">
        <h3>6. User Conduct and Community Guidelines</h3>
        <p>You agree to use the Service in a manner that is respectful to other users. Prohibited conduct includes but is not limited to:</p>
        <ul>
          <li>Harassment, bullying, or threatening other users</li>
          <li>Posting hate speech, discriminatory content, or content that promotes violence</li>
          <li>Engaging in spam or unsolicited commercial communications</li>
          <li>Sharing personal information of other users without consent</li>
          <li>Manipulating ratings, reviews, or game statistics</li>
          <li>Creating multiple accounts to circumvent restrictions</li>
        </ul>
        <p>We reserve the right to remove any content or user account that violates these community guidelines.</p>
      </div>

      <div class="doc-section">
        <h3>7. Privacy and Data Protection</h3>
        <p>Your use of the Service is also governed by our Privacy Policy, which describes how we collect, use, and protect your personal information. By using the Service, you consent to the collection and use of your information as described in our Privacy Policy.</p>
      </div>

      <div class="doc-section">
        <h3>8. Disclaimer of Warranties</h3>
        <p>THE SERVICE IS PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, AND NON-INFRINGEMENT.</p>
        <p>DIGGY Arena does not warrant that the Service will be uninterrupted, secure, or error-free. We do not warrant that the results of using the Service will meet your requirements or that any defects in the Service will be corrected.</p>
        <p>Games available on the Service are provided by third-party developers. DIGGY Arena does not warrant the quality, safety, or functionality of any third-party games.</p>
      </div>

      <div class="doc-section">
        <h3>9. Limitation of Liability</h3>
        <p>TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, DIGGY ARENA SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS, DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, RESULTING FROM YOUR ACCESS TO OR USE OF OR INABILITY TO ACCESS OR USE THE SERVICE.</p>
        <p>IN NO EVENT SHALL DIGGY ARENA'S TOTAL LIABILITY TO YOU FOR ALL CLAIMS, DAMAGES, OR CAUSES OF ACTION EXCEED THE AMOUNT YOU PAID, IF ANY, FOR ACCESSING THE SERVICE DURING THE TWELVE (12) MONTHS PRECEDING THE CLAIM.</p>
      </div>

      <div class="doc-section">
        <h3>10. Indemnification</h3>
        <p>You agree to indemnify, defend, and hold harmless DIGGY Arena and its officers, directors, employees, agents, and affiliates from and against any and all claims, damages, obligations, losses, liabilities, costs, or debt, and expenses (including but not limited to attorney's fees) arising from:</p>
        <ul>
          <li>Your use of and access to the Service</li>
          <li>Your violation of any term of these Terms</li>
          <li>Your violation of any third-party right, including without limitation any copyright, property, or privacy right</li>
          <li>Any claim that your User Content caused damage to a third party</li>
        </ul>
      </div>

      <div class="doc-section">
        <h3>11. Termination</h3>
        <p>We may terminate or suspend your account and access to the Service at any time, with or without cause, with or without notice, effective immediately. Upon termination, your right to use the Service will immediately cease.</p>
        <p>All provisions of these Terms which by their nature should survive termination shall survive, including but not limited to ownership provisions, warranty disclaimers, indemnity, and limitations of liability.</p>
      </div>

      <div class="doc-section">
        <h3>12. Governing Law and Dispute Resolution</h3>
        <p>These Terms shall be governed by and construed in accordance with the laws of the State of Israel, without regard to its conflict of law provisions.</p>
        <p>Any dispute arising out of or relating to these Terms or the Service shall be resolved through binding arbitration in accordance with the rules of the Israel Arbitration Association. The arbitration shall be conducted in the English language and shall take place in Tel Aviv, Israel.</p>
      </div>

      <div class="doc-section">
        <h3>13. General Provisions</h3>
        <p><strong>13.1 Entire Agreement:</strong> These Terms constitute the entire agreement between you and DIGGY Arena regarding the Service and supersede all prior or contemporaneous communications, proposals, and agreements, whether oral or written.</p>
        <p><strong>13.2 Severability:</strong> If any provision of these Terms is found to be unenforceable or invalid, that provision will be limited or eliminated to the minimum extent necessary so that the remaining Terms will remain in full force and effect.</p>
        <p><strong>13.3 Waiver:</strong> Our failure to enforce any right or provision of these Terms will not be considered a waiver of such right or provision.</p>
        <p><strong>13.4 Assignment:</strong> You may not assign or transfer these Terms or your rights under these Terms without our prior written consent. We may assign or transfer these Terms at any time without restriction.</p>
      </div>

      <div class="doc-section">
        <h3>14. Contact Information</h3>
        <p>If you have any questions about these Terms, please contact us via the <a href="#/contact" style="color: var(--accent-color);">contact page</a>.</p>
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
        <p style="color: var(--text-muted); margin-top: 5px;">Last updated: July 2026 | Effective Date: July 13, 2026</p>
      </div>
    </div>
    <div class="legal-page-content">
      <div class="doc-section">
        <h3>1. Introduction</h3>
        <p>DIGGY Arena Ltd. ("DIGGY Arena", "we", "us", or "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our DIGGY Arena platform (the "Service"). Please read this Privacy Policy carefully. If you do not agree with the terms of this Privacy Policy, please do not access the Service.</p>
        <p>We are committed to conducting our business in accordance with these principles in order to ensure that the confidentiality of personal information is protected and maintained.</p>
      </div>

      <div class="doc-section">
        <h3>2. Information We Collect</h3>
        <p><strong>2.1 Information You Provide to Us:</strong> We collect information you provide directly to us when you create an account, including:</p>
        <ul>
          <li><strong>Account Information:</strong> Username, email address, password (encrypted), and profile information such as avatar/logo</li>
          <li><strong>Developer Information:</strong> If you apply to become a developer, we may collect additional information such as GitHub profile, portfolio, and reason for application</li>
          <li><strong>Support Requests:</strong> When you contact us for support, we collect your name, email address, and the content of your message</li>
          <li><strong>Bug Reports:</strong> When you submit bug reports, we collect the description of the issue and any relevant screenshots or logs</li>
        </ul>
        <p><strong>2.2 Information Automatically Collected:</strong> When you access or use the Service, we automatically collect information about your device and usage, including:</p>
        <ul>
          <li><strong>Device Information:</strong> IP address, browser type, operating system, device identifiers, and mobile network information</li>
          <li><strong>Usage Information:</strong> Pages visited, features used, time spent, games played, and interaction patterns</li>
          <li><strong>Game Statistics:</strong> Number of plays, ratings, favorites, and game history</li>
        </ul>
        <p><strong>2.3 Cookies and Similar Technologies:</strong> We use cookies and similar tracking technologies to track activity on our Service and hold certain information. Cookies are files with a small amount of data which may include an anonymous unique identifier.</p>
      </div>

      <div class="doc-section">
        <h3>3. How We Use Your Information</h3>
        <p>We use the information we collect in the following ways:</p>
        <ul>
          <li><strong>Account Management:</strong> To create and manage your account, authenticate your identity, and provide customer support</li>
          <li><strong>Service Improvement:</strong> To improve, develop, and personalize our Service, including analyzing usage patterns and user preferences</li>
          <li><strong>Communication:</strong> To send you technical notices, updates, security alerts, and support messages</li>
          <li><strong>Developer Features:</strong> To enable developer accounts, manage game submissions, and facilitate developer-admin communication</li>
          <li><strong>Security:</strong> To detect, prevent, and address technical issues, fraud, and security threats</li>
          <li><strong>Legal Compliance:</strong> To comply with legal obligations, enforce our Terms of Use, and protect our rights</li>
        </ul>
        <p>We will not sell, rent, or lease your personal information to third parties without your explicit consent, except as required by law or as necessary to provide the Service.</p>
      </div>

      <div class="doc-section">
        <h3>4. Data Storage and Security</h3>
        <p><strong>4.1 Storage:</strong> Your personal information is stored on secure servers provided by Firebase/Google Cloud. We implement appropriate technical and organizational measures to protect your data against unauthorized access, alteration, disclosure, or destruction.</p>
        <p><strong>4.2 Encryption:</strong> We use industry-standard encryption protocols to protect sensitive data in transit and at rest. Passwords are stored using strong cryptographic hashing algorithms.</p>
        <p><strong>4.3 Data Retention:</strong> We retain your personal information for as long as necessary to provide the Service and fulfill the purposes outlined in this Privacy Policy. When you delete your account, we will delete your personal information within a reasonable time period, except where required by law to retain certain records.</p>
        <p><strong>4.4 Local Storage:</strong> Some data, such as game ratings, favorites, and recent game history, may be stored in your browser's localStorage for performance and offline functionality. This data is not transmitted to our servers unless you choose to sync it.</p>
      </div>

      <div class="doc-section">
        <h3>5. Sharing of Information</h3>
        <p>We may share your personal information in the following circumstances:</p>
        <ul>
          <li><strong>Service Providers:</strong> We may share information with third-party service providers who perform services on our behalf, such as hosting, analytics, and email delivery. These providers have access to your information only to perform these tasks and are obligated not to disclose or use it for any other purpose.</li>
          <li><strong>Legal Requirements:</strong> We may disclose information where we believe it is necessary to investigate, prevent, or take action regarding illegal activities, suspected fraud, potential threats to the safety of any person, or violations of our Terms of Use.</li>
          <li><strong>Business Transfers:</strong> In the event of a merger, acquisition, or sale of all or a portion of our assets, your information may be transferred to the acquiring entity.</li>
          <li><strong>With Your Consent:</strong> We may share your information with your consent for any other purpose.</li>
        </ul>
        <p>We do not sell your personal information to third parties for marketing purposes.</p>
      </div>

      <div class="doc-section">
        <h3>6. Children's Privacy</h3>
        <p>Our Service is not intended for children under the age of 13. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and you believe your child has provided us with personal information, please contact us via the <a href="#/contact" style="color: var(--accent-color);">contact page</a>, and we will delete such information.</p>
        <p>If we discover that we have collected personal information from a child under 13 without verified parental consent, we will take steps to delete that information.</p>
      </div>

      <div class="doc-section">
        <h3>7. Your Rights and Choices</h3>
        <p>Depending on your location, you may have the following rights regarding your personal information:</p>
        <ul>
          <li><strong>Access:</strong> You can request access to the personal information we hold about you</li>
          <li><strong>Correction:</strong> You can request correction of inaccurate or incomplete information</li>
          <li><strong>Deletion:</strong> You can request deletion of your personal information, subject to certain legal exceptions</li>
          <li><strong>Portability:</strong> You can request a copy of your personal information in a structured, commonly used format</li>
          <li><strong>Objection:</strong> You can object to our processing of your personal information</li>
          <li><strong>Restriction:</strong> You can request restriction of the processing of your personal information</li>
        </ul>
        <p>To exercise these rights, please contact us via the <a href="#/contact" style="color: var(--accent-color);">contact page</a>. We will respond to your request within 30 days.</p>
        <p>You can also update your account information and preferences through your account settings page.</p>
      </div>

      <div class="doc-section">
        <h3>8. Third-Party Links</h3>
        <p>Our Service may contain links to third-party websites or services. We are not responsible for the privacy practices or content of these third parties. We encourage you to review the privacy policies of any third-party websites you visit.</p>
      </div>

      <div class="doc-section">
        <h3>9. Changes to This Privacy Policy</h3>
        <p>We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.</p>
        <p>You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.</p>
      </div>

      <div class="doc-section">
        <h3>10. International Data Transfers</h3>
        <p>Your information may be transferred to and maintained on computers located outside of your state, province, country, or other governmental jurisdiction where data protection laws may differ. If you are located outside Israel and choose to provide information to us, please note that we transfer the data, including personal data, to Israel and process it there.</p>
        <p>Your consent to this Privacy Policy followed by your submission of such information represents your agreement to that transfer.</p>
      </div>

      <div class="doc-section">
        <h3>11. Contact Information</h3>
        <p>If you have any questions about this Privacy Policy, please contact us via the <a href="#/contact" style="color: var(--accent-color);">contact page</a>.</p>
        <p>We will respond to your privacy inquiries within 30 days of receipt.</p>
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

      // Check for profanity
      if (containsProfanity(name) || containsProfanity(subject) || containsProfanity(message)) {
        showToast('Please remove inappropriate language from your request.', 'danger');
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

// Render: LEADERBOARD
async function renderLeaderboard() {
  ensureContentPageStyles();
  const main = document.getElementById('main-container');
  
  const categories = ['ALL', 'RPG', 'RETRO', 'MULTIPLAYER', 'ACTION', 'PUZZLE', 'ADVENTURE', 'SPORTS', 'STRATEGY', 'HORROR', 'RACING', 'SIMULATION'];
  
  main.innerHTML = `
    <div class="top-header">
      <div class="page-title-wrap">
        <h1><i class="fas fa-trophy"></i> Game Leaderboard</h1>
        <p style="color: var(--text-muted); margin-top: 5px;">Top games ranked by plays and ratings</p>
      </div>
      <div style="display: flex; gap: 10px;">
        <select id="leaderboard-category" style="padding: 8px 12px; border-radius: 6px; border: 1px solid var(--border-color); background: var(--bg-card); color: var(--text-main); font-size: 13px;">
          ${categories.map(cat => `<option value="${cat}">${getCategoryIcon(cat)} ${cat}</option>`).join('')}
        </select>
      </div>
    </div>

    <div class="admin-card">
      <div class="admin-card-header">
        <div class="admin-card-title"><i class="fas fa-chart-bar"></i> Top Games</div>
      </div>
      <div class="data-table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Game</th>
              <th>Category</th>
              <th>Plays</th>
              <th>Rating</th>
              <th>Developer</th>
            </tr>
          </thead>
          <tbody id="leaderboard-body">
            <tr><td colspan="6" style="text-align: center; color: var(--text-muted);">Loading leaderboard...</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  `;

  const categorySelect = document.getElementById('leaderboard-category');
  const leaderboardBody = document.getElementById('leaderboard-body');

  async function renderLeaderboardTable(category) {
    let games = [...state.games];
    
    if (category !== 'ALL') {
      games = games.filter(g => g.categories && g.categories.includes(category));
    }

    // Sort by plays (descending), then by rating (descending)
    games.sort((a, b) => {
      const playsDiff = (b.plays || 0) - (a.plays || 0);
      if (playsDiff !== 0) return playsDiff;
      return (b.rating || 0) - (a.rating || 0);
    });

    // Take top 20 games
    games = games.slice(0, 20);

    if (games.length === 0) {
      leaderboardBody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align: center; color: var(--text-muted); padding: 40px;">
            <i class="fas fa-trophy" style="font-size: 32px; display: block; margin-bottom: 10px;"></i>
            No games found in this category.
          </td>
        </tr>
      `;
      return;
    }

    leaderboardBody.innerHTML = games.map((game, index) => {
      const rank = index + 1;
      let rankStyle = '';
      let rankIcon = rank;
      
      if (rank === 1) {
        rankStyle = 'background: linear-gradient(135deg, rgba(255, 215, 0, 0.2) 0%, rgba(255, 215, 0, 0.1) 100%); border: 1px solid rgba(255, 215, 0, 0.4);';
        rankIcon = '🥇';
      } else if (rank === 2) {
        rankStyle = 'background: linear-gradient(135deg, rgba(192, 192, 192, 0.2) 0%, rgba(192, 192, 192, 0.1) 100%); border: 1px solid rgba(192, 192, 192, 0.4);';
        rankIcon = '🥈';
      } else if (rank === 3) {
        rankStyle = 'background: linear-gradient(135deg, rgba(205, 127, 50, 0.2) 0%, rgba(205, 127, 50, 0.1) 100%); border: 1px solid rgba(205, 127, 50, 0.4);';
        rankIcon = '🥉';
      }

      const categoryDisplay = game.categories && game.categories.length > 0 
        ? game.categories.map(c => `${getCategoryIcon(c)} ${c}`).join(', ')
        : 'Uncategorized';

      return `
        <tr style="cursor: pointer;" onclick="navigateTo('#/game/${game.id}')">
          <td>
            <span style="display: inline-flex; align-items: center; justify-content: center; width: 32px; height: 32px; border-radius: 50%; font-weight: bold; ${rankStyle}">
              ${rankIcon}
            </span>
          </td>
          <td>
            <div style="display: flex; align-items: center; gap: 12px;">
              <img src="${game.logoUrl}" onerror="this.src='https://placehold.co/40x40/12161e/00ff66?text=G'" style="width: 40px; height: 40px; border-radius: 8px; object-fit: cover;">
              <div>
                <div style="font-weight: bold; color: var(--accent-color);">${game.name}</div>
                <div style="font-size: 11px; color: var(--text-muted);">${game.howToPlay || 'No description'}</div>
              </div>
            </div>
          </td>
          <td>${categoryDisplay}</td>
          <td style="font-weight: bold; color: var(--accent-color);">${game.plays || 0}</td>
          <td>
            <div style="display: flex; align-items: center; gap: 5px;">
              <i class="fas fa-star" style="color: #ffd700;"></i>
              <span style="font-weight: bold;">${game.rating || 'N/A'}</span>
            </div>
          </td>
          <td>${game.developerName || 'Unknown'}</td>
        </tr>
      `;
    }).join('');
  }

  // Initial render
  await renderLeaderboardTable('ALL');

  // Category change handler
  categorySelect.addEventListener('change', async () => {
    const selectedCategory = categorySelect.value;
    await renderLeaderboardTable(selectedCategory);
  });
}

// Render: BECOME DEVELOPER APPLICATION
async function renderBecomeDeveloper() {
  const main = document.getElementById('main-container');

  if (!state.user || state.user.role !== 'player') {
    main.innerHTML = `
      <div style="text-align: center; padding: 80px 0;">
        <i class="fas fa-user-check" style="font-size: 64px; color: var(--accent-color); margin-bottom: 20px;"></i>
        <h2>Already a Developer!</h2>
        <p style="color: var(--text-muted); margin-top: 10px;">You already have developer access.</p>
        <button class="btn btn-primary" onclick="window.location.hash='#/dev'" style="margin-top: 20px;">Go to Developer Panel</button>
      </div>
    `;
    return;
  }

  main.innerHTML = `
    <div style="max-width: 900px; margin: 40px auto; padding: 0 20px;">
      <div style="text-align: center; margin-bottom: 40px;">
        <i class="fas fa-code" style="font-size: 48px; color: var(--accent-color); margin-bottom: 20px;"></i>
        <h1 style="font-size: 32px; margin-bottom: 10px;">Become a DIGGY Developer</h1>
        <p style="color: var(--text-muted); font-size: 16px;">Share your games with players from around the world!</p>
      </div>

      <form id="become-developer-form" style="background: var(--card-bg); padding: 30px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1);">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
          <div class="form-group">
            <label>Full Name *</label>
            <input type="text" id="dev-full-name" required placeholder="Your full name">
          </div>
          <div class="form-group">
            <label>Username on Site *</label>
            <input type="text" id="dev-username" required value="${state.user.username}" readonly style="background: rgba(255,255,255,0.05);">
          </div>
        </div>

        <div class="form-group">
          <label>Email Address *</label>
          <input type="email" id="dev-email" required placeholder="your@email.com">
        </div>

        <div class="form-group">
          <label>Developer / Studio Name (if applicable)</label>
          <input type="text" id="dev-studio-name" placeholder="Your studio or developer name">
        </div>

        <div class="form-group">
          <label>Age / Age Range *</label>
          <select id="dev-age" required>
            <option value="">Select your age range</option>
            <option value="under-13">Under 13</option>
            <option value="13-17">13-17</option>
            <option value="18-24">18-24</option>
            <option value="25-34">25-34</option>
            <option value="35-44">35-44</option>
            <option value="45+">45+</option>
          </select>
        </div>

        <div class="form-group">
          <label>Tell us about yourself as a developer *</label>
          <textarea id="dev-about" required rows="3" placeholder="Your experience, background, what drives you..."></textarea>
        </div>

        <div class="form-group">
          <label>How long have you been developing games? *</label>
          <select id="dev-experience" required>
            <option value="">Select experience level</option>
            <option value="less-than-1">Less than 1 year</option>
            <option value="1-2">1-2 years</option>
            <option value="3-5">3-5 years</option>
            <option value="5-10">5-10 years</option>
            <option value="10+">10+ years</option>
          </select>
        </div>

        <div class="form-group">
          <label>Which engines or tools do you use? *</label>
          <input type="text" id="dev-tools" required placeholder="Unity, Unreal Engine, Godot, Roblox Studio, HTML/JavaScript, etc.">
        </div>

        <div class="form-group">
          <label>Have you developed games before? *</label>
          <select id="dev-past-games" required>
            <option value="">Select an option</option>
            <option value="yes">Yes, I have published games</option>
            <option value="wip">Yes, but they are works in progress</option>
            <option value="learning">No, I'm still learning</option>
          </select>
        </div>

        <div class="form-group">
          <label>Link to previous game / project (optional)</label>
          <input type="url" id="dev-previous-game" placeholder="https://...">
        </div>

        <div class="form-group">
          <label>Link to portfolio / GitHub / itch.io (optional)</label>
          <input type="url" id="dev-portfolio" placeholder="https://...">
        </div>

        <div class="form-group">
          <label>What type of games do you develop? *</label>
          <input type="text" id="dev-game-types" required placeholder="Action, RPG, Puzzle, etc.">
        </div>

        <div class="form-group">
          <label>Why do you want to become a developer on our site? *</label>
          <textarea id="dev-reason" required rows="3" placeholder="Your motivation and goals..."></textarea>
        </div>

        <div class="form-group">
          <label>What do you plan to upload to the site? *</label>
          <textarea id="dev-plans" required rows="2" placeholder="Describe the games you want to share..."></textarea>
        </div>

        <div class="form-group">
          <label>Are all games and content you upload yours, or do you have permission to use them? *</label>
          <select id="dev-ownership" required>
            <option value="">Select an option</option>
            <option value="yes">Yes, everything is mine or I have permission</option>
            <option value="no">No</option>
          </select>
        </div>

        <div class="form-group">
          <label>Do you commit to NOT uploading viruses, malicious code, or dangerous files? *</label>
          <div style="display: flex; align-items: center; gap: 10px;">
            <input type="checkbox" id="dev-no-malware" required style="width: auto;">
            <span style="color: var(--text-muted);">Yes, I commit to this</span>
          </div>
        </div>

        <div class="form-group">
          <label>Do you commit to NOT uploading content that violates copyright? *</label>
          <div style="display: flex; align-items: center; gap: 10px;">
            <input type="checkbox" id="dev-no-copyright" required style="width: auto;">
            <span style="color: var(--text-muted);">Yes, I commit to this</span>
          </div>
        </div>

        <div class="form-group">
          <label>Do you agree to the Terms of Use and Developer Guidelines? *</label>
          <div style="display: flex; align-items: center; gap: 10px;">
            <input type="checkbox" id="dev-terms" required style="width: auto;">
            <span style="color: var(--text-muted);">Yes, I agree</span>
          </div>
        </div>

        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.1);">
          <h3 style="margin-bottom: 15px; font-size: 16px;">Optional Information</h3>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
            <div class="form-group">
              <label>Discord Username (if you have a community)</label>
              <input type="text" id="dev-discord" placeholder="username#1234">
            </div>
            <div class="form-group">
              <label>Country</label>
              <input type="text" id="dev-country" placeholder="Your country">
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
            <div class="form-group">
              <label>Primary Programming Language</label>
              <input type="text" id="dev-language" placeholder="JavaScript, C#, Python, etc.">
            </div>
            <div class="form-group">
              <label>Do you develop alone or as part of a team?</label>
              <select id="dev-team">
                <option value="">Select an option</option>
                <option value="solo">Solo developer</option>
                <option value="team">Part of a team</option>
              </select>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
            <div class="form-group">
              <label>How many games do you plan to upload?</label>
              <input type="text" id="dev-game-count" placeholder="e.g., 3-5 games">
            </div>
            <div class="form-group">
              <label>How did you hear about our site?</label>
              <input type="text" id="dev-heard-about" placeholder="Friend, social media, search, etc.">
            </div>
          </div>

          <div class="form-group">
            <label>Is there anything else important for us to know?</label>
            <textarea id="dev-additional" rows="2" placeholder="Any additional information..."></textarea>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 20px;">
          <div class="form-group">
            <label>Verification Password *</label>
            <input type="password" id="dev-password" required placeholder="Enter your account password">
          </div>
          <div class="form-group">
            <label>&nbsp;</label>
            <button type="submit" class="btn btn-primary" style="width: 100%;">
              <i class="fas fa-paper-plane"></i> Submit Application
            </button>
          </div>
        </div>
      </form>
    </div>
  `;

  // Form submission handler
  document.getElementById('become-developer-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    showLoader(true);
    
    try {
      const formData = {
        fullName: sanitizeInput(document.getElementById('dev-full-name').value),
        username: sanitizeInput(document.getElementById('dev-username').value),
        email: sanitizeInput(document.getElementById('dev-email').value),
        studioName: sanitizeInput(document.getElementById('dev-studio-name').value),
        age: sanitizeInput(document.getElementById('dev-age').value),
        about: sanitizeInput(document.getElementById('dev-about').value),
        experience: sanitizeInput(document.getElementById('dev-experience').value),
        tools: sanitizeInput(document.getElementById('dev-tools').value),
        pastGames: sanitizeInput(document.getElementById('dev-past-games').value),
        previousGame: sanitizeInput(document.getElementById('dev-previous-game').value),
        portfolio: sanitizeInput(document.getElementById('dev-portfolio').value),
        gameTypes: sanitizeInput(document.getElementById('dev-game-types').value),
        reason: sanitizeInput(document.getElementById('dev-reason').value),
        plans: sanitizeInput(document.getElementById('dev-plans').value),
        ownership: sanitizeInput(document.getElementById('dev-ownership').value),
        noMalware: document.getElementById('dev-no-malware').checked,
        noCopyright: document.getElementById('dev-no-copyright').checked,
        terms: document.getElementById('dev-terms').checked,
        discord: sanitizeInput(document.getElementById('dev-discord').value),
        country: sanitizeInput(document.getElementById('dev-country').value),
        language: sanitizeInput(document.getElementById('dev-language').value),
        team: sanitizeInput(document.getElementById('dev-team').value),
        gameCount: sanitizeInput(document.getElementById('dev-game-count').value),
        heardAbout: sanitizeInput(document.getElementById('dev-heard-about').value),
        additional: sanitizeInput(document.getElementById('dev-additional').value),
        password: sanitizeInput(document.getElementById('dev-password').value)
      };

      // Validate password
      const passwordValidation = validatePasswordStrength(formData.password);
      if (!passwordValidation.valid) {
        showToast(passwordValidation.errors[0], "danger");
        showLoader(false);
        return;
      }

      // Submit developer request
      await submitDeveloperRequest(
        state.user.uid,
        formData.username,
        formData.reason,
        formData.email
      );

      showToast("Developer application submitted successfully! We'll review it soon.", "success");
      navigateTo('#/');
      
    } catch (err) {
      showToast(err.message, "danger");
    } finally {
      showLoader(false);
    }
  });
}

// Render: DEVELOPER DOCUMENTATION
async function renderDevDocs() {
  const main = document.getElementById('main-container');

  const isAuthorized = state.user && await validateRoleFromFirebase('developer');
  if (!isAuthorized) {
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
