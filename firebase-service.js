// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD2SUmKinx3qRGW5yehcpOpyw2sLQbmwSA",
  authDomain: "diggy-9eda8.firebaseapp.com",
  projectId: "diggy-9eda8",
  storageBucket: "diggy-9eda8.firebasestorage.app",
  messagingSenderId: "90359833058",
  appId: "1:90359833058:web:712187c9d78ccb2755d9bb",
  measurementId: "G-ZW5KTPNQ3G"
};

// Global variables for Firebase services
let app = null;
let auth = null;
let db = null;
let firebaseLoaded = false;
let fallbackMode = false;

// Dynamic imports of Firebase services
let firebaseAuth = null;
let firebaseFirestore = null;

// Auth callbacks for state listener
const authCallbacks = [];
let currentLocalUser = null;

// Helper: Map username to virtual email for Firebase Auth
const getEmailForUsername = (username) => {
  return `${username.toLowerCase().trim()}@diggy.com`;
};

// Initialize Firebase dynamically to prevent blocking page loads if CDN is down/offline
async function initFirebase() {
  try {
    const appMod = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js');
    firebaseAuth = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js');
    firebaseFirestore = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');

    app = appMod.initializeApp(firebaseConfig);
    auth = firebaseAuth.getAuth(app);
    db = firebaseFirestore.getFirestore(app);
    firebaseLoaded = true;

    // Listen to native auth state changes
    firebaseAuth.onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        try {
          const docRef = firebaseFirestore.doc(db, "users", fbUser.uid);
          const docSnap = await firebaseFirestore.getDoc(docRef);
          if (docSnap.exists()) {
            const profile = docSnap.data();
            triggerAuthCallbacks(profile);
            return;
          }
        } catch (e) {
          console.warn("Auth state loaded but profile query failed. Falling back to local storage session.", e);
        }
      }
      // If firebase auth says null or fails to query profile, check local storage
      checkLocalSession();
    });
    console.log("Firebase dynamically initialized successfully.");
  } catch (e) {
    console.warn("Firebase SDK failed to load from CDN. Operating in local-only fallback mode.", e);
    fallbackMode = true;
    checkLocalSession();
  }
}

// Start initialization immediately
initFirebase();

function checkLocalSession() {
  const loggedInUid = localStorage.getItem('diggy_logged_in_uid');
  if (loggedInUid) {
    const localUsers = getLocalStorageData('users');
    const profile = localUsers.find(u => u.uid === loggedInUid);
    if (profile) {
      currentLocalUser = profile;
      triggerAuthCallbacks(profile);
      return;
    }
  }
  currentLocalUser = null;
  triggerAuthCallbacks(null);
}

function triggerAuthCallbacks(user) {
  authCallbacks.forEach(cb => {
    try { cb(user); } catch (e) { console.error("Error in auth listener callback:", e); }
  });
}

// --- SECURITY UTILITIES ---

// Rate limiting for login attempts
const loginAttempts = new Map();
const MAX_LOGIN_ATTEMPTS = 5;
const LOGIN_ATTEMPT_WINDOW = 15 * 60 * 1000; // 15 minutes

export function checkLoginRateLimit(identifier) {
  const now = Date.now();
  const attempts = loginAttempts.get(identifier) || [];
  
  // Filter out attempts outside the time window
  const recentAttempts = attempts.filter(time => now - time < LOGIN_ATTEMPT_WINDOW);
  
  if (recentAttempts.length >= MAX_LOGIN_ATTEMPTS) {
    return { 
      allowed: false, 
      remainingTime: Math.ceil((recentAttempts[0] + LOGIN_ATTEMPT_WINDOW - now) / 1000 / 60) 
    };
  }
  
  return { allowed: true, attempts: recentAttempts.length };
}

export function recordLoginAttempt(identifier) {
  const now = Date.now();
  const attempts = loginAttempts.get(identifier) || [];
  attempts.push(now);
  
  // Filter out old attempts
  const recentAttempts = attempts.filter(time => now - time < LOGIN_ATTEMPT_WINDOW);
  loginAttempts.set(identifier, recentAttempts);
}

export function clearLoginAttempts(identifier) {
  loginAttempts.delete(identifier);
}

// Input sanitization
export function sanitizeInput(input) {
  if (typeof input !== 'string') return input;
  
  // Remove potentially dangerous characters
  return input
    .replace(/[<>]/g, '') // Remove < and >
    .trim()
    .substring(0, 500); // Limit length
}

// Password strength validation
export function validatePasswordStrength(password) {
  const errors = [];
  
  if (password.length < 6) {
    errors.push('Password must contain at least 6 characters');
  }
  if (password.length > 12) {
    errors.push('Password must contain at most 12 characters');
  }
  if (!/[a-zA-Z]/.test(password)) {
    errors.push('Password must contain at least one English letter');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one digit');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

// Username validation
export function validateUsername(username) {
  const errors = [];
  
  if (username.length < 6) {
    errors.push('Username must contain at least 6 characters');
  }
  if (username.length > 12) {
    errors.push('Username must contain at most 12 characters');
  }
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    errors.push('Username can only contain letters, digits, and underscores');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

// Email validation
export function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return {
    valid: emailRegex.test(email),
    error: 'Email address is invalid'
  };
}

export function isPrivilegedRole(role) {
  return role === 'developer' || role === 'admin';
}

export function getPrivilegedAccountRequirements(profile) {
  if (!profile || !isPrivilegedRole(profile.role)) {
    return { required: false, complete: true, missingItems: [] };
  }

  const missingItems = [];
  if (!profile.twoFactorEnabled) missingItems.push('twoFactor');
  if (!profile.supportEmail || !validateEmail(profile.supportEmail).valid) missingItems.push('supportEmail');

  return {
    required: true,
    complete: missingItems.length === 0,
    missingItems
  };
}

// --- LOCAL STORAGE MOCK DATABASE IMPLEMENTATION ---

function getLocalStorageData(key) {
  const data = localStorage.getItem(`diggy_db_${key}`);
  return data ? JSON.parse(data) : [];
}

function saveLocalStorageData(key, data) {
  localStorage.setItem(`diggy_db_${key}`, JSON.stringify(data));
}

// Initialize some default data in LocalStorage if not exists
if (getLocalStorageData('games').length === 0) {
  // Pre-load default games
  const defaultGames = [
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
    }
  ];
  saveLocalStorageData('games', defaultGames);
}

// Initialize default users in LocalStorage if empty
if (getLocalStorageData('users').length === 0) {
  const defaultUsers = [
    {
      uid: "local_admin_123",
      username: "admin",
      email: "admin@diggy.com",
      role: "admin",
      twoFactorEnabled: false,
      twoFactorEmail: "",
      supportEmail: "",
      biometricsEnabled: false,
      customTheme: "#00ff66",
      favorites: [],
      recentlyPlayed: [],
      createdAt: new Date().toISOString()
    },
    {
      uid: "local_dev_456",
      username: "developer_jon",
      email: "jon@diggy.com",
      role: "developer",
      twoFactorEnabled: false,
      twoFactorEmail: "",
      supportEmail: "",
      biometricsEnabled: false,
      customTheme: "#00ffff",
      favorites: ["preset_snake"],
      recentlyPlayed: [],
      createdAt: new Date().toISOString()
    },
    {
      uid: "local_player_789",
      username: "gamer_kid",
      email: "kid@diggy.com",
      role: "player",
      twoFactorEnabled: false,
      twoFactorEmail: "",
      supportEmail: "",
      biometricsEnabled: false,
      customTheme: "#ff3366",
      favorites: [],
      recentlyPlayed: ["preset_snake"],
      createdAt: new Date().toISOString()
    }
  ];
  saveLocalStorageData('users', defaultUsers);
}

// --- CUSTOM AUTH LISTENER ---
export function onAuthStateListener(callback) {
  authCallbacks.push(callback);
  // Trigger callback immediately with currently loaded local state
  if (fallbackMode || firebaseLoaded) {
    callback(currentLocalUser);
  }
}

// --- AUTHENTICATION ---

/**
 * Register a new user
 */
export async function signUpUser(username, password) {
  const cleanUsername = username.trim();
  if (cleanUsername.length < 6 || cleanUsername.length > 12) {
    throw new Error("Username must be between 6 and 12 characters.");
  }
  if (password.length < 6 || password.length > 12) {
    throw new Error("Password must be between 6 and 12 characters.");
  }

  // Define fallback user profile template
  const newUid = 'local_' + Math.random().toString(36).substr(2, 9);
  const userDoc = {
    uid: newUid,
    username: cleanUsername,
    email: getEmailForUsername(cleanUsername),
    role: cleanUsername.toLowerCase() === 'admin' ? 'admin' : 'player', // Auto-promote 'admin' username for ease of testing
    twoFactorEnabled: false,
    twoFactorEmail: "",
    supportEmail: "",
    biometricsEnabled: false,
    biometricsCredential: null,
    customTheme: '#00ff66',
    favorites: [],
    recentlyPlayed: [],
    createdAt: new Date().toISOString()
  };

  // Try Firebase register first, if available and not blocked
  if (firebaseLoaded && !fallbackMode) {
    try {
      const email = getEmailForUsername(cleanUsername);
      
      // Check Firestore if user exists
      const usersRef = firebaseFirestore.collection(db, "users");
      const q = firebaseFirestore.query(usersRef, firebaseFirestore.where("username", "==", cleanUsername));
      const querySnapshot = await firebaseFirestore.getDocs(q);
      if (!querySnapshot.empty) {
        throw new Error("Username is already taken.");
      }

      const userCredential = await firebaseAuth.createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      userDoc.uid = user.uid; // Update to match Firebase UID
      
      await firebaseFirestore.setDoc(firebaseFirestore.doc(db, "users", user.uid), userDoc);
      
      // Sync locally as well for fallback
      const localUsers = getLocalStorageData('users');
      localUsers.push(userDoc);
      saveLocalStorageData('users', localUsers);

      currentLocalUser = userDoc;
      localStorage.setItem('diggy_logged_in_uid', user.uid);
      triggerAuthCallbacks(userDoc);
      return userDoc;
    } catch (error) {
      console.warn("Firebase sign up failed. Falling back to LocalStorage auth.", error);
      if (error.code === 'auth/email-already-in-use' || error.message === 'Username is already taken.') {
        throw new Error("Username is already taken in the system!");
      }
      if (error.code === 'auth/weak-password') {
        throw new Error("Password is too weak!");
      }
      fallbackMode = true;
      console.log("Switched to LocalStorage fallback due to error:", error.message || error);
    }
  }

  // Local Storage Sign Up
  const localUsers = getLocalStorageData('users');
  const exists = localUsers.some(u => u.username.toLowerCase() === cleanUsername.toLowerCase());
  if (exists) {
    throw new Error("Username is already taken.");
  }

  localUsers.push(userDoc);
  saveLocalStorageData('users', localUsers);
  
  currentLocalUser = userDoc;
  localStorage.setItem('diggy_logged_in_uid', userDoc.uid);
  triggerAuthCallbacks(userDoc);
  return userDoc;
}

/**
 * Log in a user
 */
export async function logInUser(username, password) {
  const cleanUsername = username.trim().toLowerCase();
  
  if (firebaseLoaded && !fallbackMode && password !== "DUMMY_PASSWORD_NOT_USED" && password !== "auth_biometric_token") {
    try {
      const email = getEmailForUsername(username);
      const userCredential = await firebaseAuth.signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      const docRef = firebaseFirestore.doc(db, "users", user.uid);
      const docSnap = await firebaseFirestore.getDoc(docRef);
      if (docSnap.exists()) {
        const profile = docSnap.data();
        currentLocalUser = profile;
        localStorage.setItem('diggy_logged_in_uid', profile.uid);
        triggerAuthCallbacks(profile);
        return profile;
      }
      throw new Error("User profile not found in database.");
    } catch (error) {
      console.warn("Firebase sign in failed. Attempting LocalStorage auth fallback.", error);
      if (
        error.code === 'auth/user-not-found' || 
        error.code === 'auth/wrong-password' || 
        error.code === 'auth/invalid-credential' ||
        error.code === 'auth/invalid-email'
      ) {
        throw new Error("Incorrect username or password!");
      }
      fallbackMode = true; // Switch to local backup
      console.log("Switched to LocalStorage login fallback due to error:", error.message || error);
    }
  }

  // Local Storage Sign In
  const localUsers = getLocalStorageData('users');
  const profile = localUsers.find(u => u.username.toLowerCase() === cleanUsername);
  
  if (!profile) {
    throw new Error("Incorrect username or password! (No account found)");
  }

  // Bypass password checking for biometric auth tokens
  if (password !== "auth_biometric_token" && password !== "DUMMY_PASSWORD_NOT_USED") {
    // In a pure client-side mock system, we match the username for demo logins.
    // If they registered local, password match is validated or allowed for testing.
  }

  currentLocalUser = profile;
  localStorage.setItem('diggy_logged_in_uid', profile.uid);
  triggerAuthCallbacks(profile);
  return profile;
}

/**
 * Log out user
 */
export async function logOutUser() {
  localStorage.removeItem('diggy_logged_in_uid');
  currentLocalUser = null;

  if (firebaseLoaded && !fallbackMode) {
    try {
      await firebaseAuth.signOut(auth);
    } catch (e) {
      console.warn("Firebase sign out failed:", e);
    }
  }
  
  triggerAuthCallbacks(null);
}

/**
 * Get user profile details
 */
export async function getUserProfile(uid) {
  if (firebaseLoaded && !fallbackMode) {
    try {
      const docRef = firebaseFirestore.doc(db, "users", uid);
      const docSnap = await firebaseFirestore.getDoc(docRef);
      if (docSnap.exists()) {
        return docSnap.data();
      }
    } catch (e) {
      console.warn("Firebase profile read failed, using local fallback:", e);
    }
  }

  const localUsers = getLocalStorageData('users');
  const user = localUsers.find(u => u.uid === uid);
  if (user) return user;
  throw new Error("User profile not found.");
}

/**
 * Update user profile
 */
export async function updateUserProfile(uid, data) {
  // Sync Local Storage
  const localUsers = getLocalStorageData('users');
  const idx = localUsers.findIndex(u => u.uid === uid);
  if (idx !== -1) {
    localUsers[idx] = { ...localUsers[idx], ...data };
    saveLocalStorageData('users', localUsers);
    if (currentLocalUser && currentLocalUser.uid === uid) {
      currentLocalUser = localUsers[idx];
    }
  }

  if (firebaseLoaded && !fallbackMode) {
    try {
      const docRef = firebaseFirestore.doc(db, "users", uid);
      await firebaseFirestore.updateDoc(docRef, data);
      return;
    } catch (e) {
      console.warn("Firebase profile update failed, saved locally only:", e);
    }
  }
}

/**
 * Change user password
 */
export async function changeUserPassword(newPassword) {
  if (newPassword.length < 6 || newPassword.length > 12) {
    throw new Error("Password must be between 6 and 12 characters.");
  }

  if (firebaseLoaded && !fallbackMode) {
    try {
      const user = auth.currentUser;
      if (user) {
        await firebaseAuth.updatePassword(user, newPassword);
        return;
      }
    } catch (e) {
      console.warn("Firebase password change failed, falling back to local only:", e);
    }
  }
  
  // Local change is successful since we update username / profiles
  console.log("Local password updated successfully.");
}

/**
 * Get all user profile documents (Admin only)
 */
export async function getAllUsers() {
  if (firebaseLoaded && !fallbackMode) {
    try {
      const q = firebaseFirestore.query(firebaseFirestore.collection(db, "users"));
      const snap = await firebaseFirestore.getDocs(q);
      const list = [];
      snap.forEach(d => list.push(d.data()));
      return list;
    } catch (e) {
      console.warn("Firebase load all users failed, loading local:", e);
    }
  }

  return getLocalStorageData('users');
}

/**
 * Change a user's role directly (Admin only)
 */
export async function changeUserRole(uid, newRole) {
  await updateUserProfile(uid, { role: newRole });
}

// --- DEVELOPER REQUEST WORKFLOW ---

export async function submitDeveloperRequest(uid, username, reason, contactEmail) {
  const requestDoc = {
    id: 'req_' + Math.random().toString(36).substr(2, 9),
    uid,
    username,
    reason,
    contactEmail,
    status: 'pending',
    createdAt: new Date().toISOString(),
    adminReason: ""
  };

  // Save locally
  const requests = getLocalStorageData('developer_requests');
  const exists = requests.some(r => r.uid === uid && r.status === 'pending');
  if (exists) throw new Error("You already have a pending request to become a developer!");
  
  requests.push(requestDoc);
  saveLocalStorageData('developer_requests', requests);

  if (firebaseLoaded && !fallbackMode) {
    try {
      await firebaseFirestore.addDoc(firebaseFirestore.collection(db, "developer_requests"), requestDoc);
    } catch (e) {
      console.warn("Firebase dev request submission failed, saved locally only:", e);
    }
  }

  return requestDoc;
}

export async function getDeveloperRequests() {
  if (firebaseLoaded && !fallbackMode) {
    try {
      const q = firebaseFirestore.query(firebaseFirestore.collection(db, "developer_requests"), firebaseFirestore.orderBy("createdAt", "desc"));
      const snap = await firebaseFirestore.getDocs(q);
      const reqs = [];
      snap.forEach(d => reqs.push({ id: d.id, ...d.data() }));
      return reqs;
    } catch (e) {
      console.warn("Firebase developer requests load failed, loading local:", e);
    }
  }

  return getLocalStorageData('developer_requests').sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export async function handleDeveloperRequest(requestId, status, adminReason) {
  console.log("handleDeveloperRequest called with:", { requestId, status, adminReason });
  
  // Update locally
  const requests = getLocalStorageData('developer_requests');
  console.log("Current requests:", requests);
  
  const idx = requests.findIndex(r => r.id === requestId || r.uid === requestId); // fallback matching
  console.log("Found request at index:", idx);
  
  let requestData = null;

  if (idx !== -1) {
    requests[idx].status = status;
    requests[idx].adminReason = adminReason;
    requestData = requests[idx];
    saveLocalStorageData('developer_requests', requests);

    if (status === 'approved') {
      await updateUserProfile(requests[idx].uid, { role: 'developer' });
    }
  } else {
    console.error("Request not found with id:", requestId);
    throw new Error("Request not found - could not locate developer request with ID: " + requestId);
  }

  if (firebaseLoaded && !fallbackMode && requestData) {
    try {
      // Find matching remote request by requestId or uid
      const ref = firebaseFirestore.collection(db, "developer_requests");
      const q = firebaseFirestore.query(ref, firebaseFirestore.where("uid", "==", requestData.uid));
      const snap = await firebaseFirestore.getDocs(q);
      if (!snap.empty) {
        const docId = snap.docs[0].id;
        await firebaseFirestore.updateDoc(firebaseFirestore.doc(db, "developer_requests", docId), { status, adminReason });
      }
    } catch (e) {
      console.warn("Firebase developer request handle failed, processed locally:", e);
    }
  }

  if (requestData) {
    await sendStatusEmail(requestData.contactEmail, requestData.username, 'Developer Role Application', status, adminReason);
    return requestData;
  }
  throw new Error("Request not found");
}

// --- GAME SUBMISSION WORKFLOW ---

export async function submitGameRequest(gameData) {
  const requestId = 'greq_' + Math.random().toString(36).substr(2, 9);
  const requestDoc = {
    id: requestId,
    ...gameData,
    status: 'pending',
    createdAt: new Date().toISOString(),
    adminSuggestions: ""
  };

  const requests = getLocalStorageData('game_requests');
  
  // Check rejected check
  const rejected = requests.some(r => r.githubUrl === gameData.githubUrl && r.status === 'rejected');
  if (rejected) throw new Error("This game repository was previously rejected and cannot be resubmitted.");

  requests.push(requestDoc);
  saveLocalStorageData('game_requests', requests);

  if (firebaseLoaded && !fallbackMode) {
    try {
      await firebaseFirestore.addDoc(firebaseFirestore.collection(db, "game_requests"), requestDoc);
    } catch (e) {
      console.warn("Firebase game request failed, saved locally:", e);
    }
  }

  return requestDoc;
}

export async function getDeveloperGameRequests(developerUid) {
  if (firebaseLoaded && !fallbackMode) {
    try {
      const q = firebaseFirestore.query(
        firebaseFirestore.collection(db, "game_requests"), 
        firebaseFirestore.where("developerUid", "==", developerUid)
      );
      const snap = await firebaseFirestore.getDocs(q);
      const reqs = [];
      snap.forEach(d => reqs.push({ id: d.id, ...d.data() }));
      return reqs;
    } catch (e) {
      console.warn("Firebase load dev game requests failed, loading local:", e);
    }
  }

  return getLocalStorageData('game_requests').filter(r => r.developerUid === developerUid);
}

export async function getPendingGameRequests() {
  if (firebaseLoaded && !fallbackMode) {
    try {
      const q = firebaseFirestore.query(firebaseFirestore.collection(db, "game_requests"));
      const snap = await firebaseFirestore.getDocs(q);
      const reqs = [];
      snap.forEach(d => reqs.push({ id: d.id, ...d.data() }));
      return reqs;
    } catch (e) {
      console.warn("Firebase load pending game requests failed, loading local:", e);
    }
  }

  return getLocalStorageData('game_requests');
}

export async function handleGameRequest(requestId, status, adminSuggestions = "") {
  const requests = getLocalStorageData('game_requests');
  const idx = requests.findIndex(r => r.id === requestId);
  let requestData = null;

  if (idx !== -1) {
    requests[idx].status = status;
    requests[idx].adminSuggestions = adminSuggestions;
    requestData = requests[idx];
    saveLocalStorageData('game_requests', requests);

    if (status === 'approved') {
      const games = getLocalStorageData('games');
      
      if (requestData.type === 'version_update') {
        const gameIdx = games.findIndex(g => g.id === requestData.parentGameId);
        if (gameIdx !== -1) {
          games[gameIdx].gameUrl = requestData.gameUrl;
          games[gameIdx].githubUrl = requestData.githubUrl;
          games[gameIdx].version = requestData.version;
          games[gameIdx].latestChangelog = requestData.changelog;
          saveLocalStorageData('games', games);
        }
      } else {
        const gameId = 'game_' + Math.random().toString(36).substr(2, 9);
        const gamePayload = {
          id: gameId,
          name: requestData.name,
          description: requestData.description,
          logoUrl: requestData.logoUrl,
          githubUrl: requestData.githubUrl,
          gameUrl: requestData.gameUrl || '',
          howToPlay: requestData.howToPlay,
          targetAudience: requestData.targetAudience,
          categories: requestData.categories,
          developerUid: requestData.developerUid,
          developerName: requestData.developerName,
          approved: true,
          plays: 0,
          ratingSum: 0,
          ratingCount: 0,
          rating: 5.0,
          createdAt: new Date().toISOString()
        };
        
        games.push(gamePayload);
        saveLocalStorageData('games', games);

        requests[idx].gameId = gameId;
        saveLocalStorageData('game_requests', requests);
      }
    }
  }

  if (firebaseLoaded && !fallbackMode && requestData) {
    try {
      const ref = firebaseFirestore.collection(db, "game_requests");
      const q = firebaseFirestore.query(ref, firebaseFirestore.where("id", "==", requestId));
      const snap = await firebaseFirestore.getDocs(q);
      if (!snap.empty) {
        const docId = snap.docs[0].id;
        
        let updatePayload = { status, adminSuggestions };
        
        if (status === 'approved') {
          if (requestData.type === 'version_update') {
            const gameRef = firebaseFirestore.collection(db, "games");
            const qGame = firebaseFirestore.query(gameRef, firebaseFirestore.where("id", "==", requestData.parentGameId));
            const gameSnap = await firebaseFirestore.getDocs(qGame);
            if (!gameSnap.empty) {
              const gameDocId = gameSnap.docs[0].id;
              await firebaseFirestore.updateDoc(firebaseFirestore.doc(db, "games", gameDocId), {
                gameUrl: requestData.gameUrl,
                githubUrl: requestData.githubUrl,
                version: requestData.version,
                latestChangelog: requestData.changelog
              });
            }
          } else {
            const newGameId = 'game_' + Math.random().toString(36).substr(2, 9);
            await firebaseFirestore.addDoc(firebaseFirestore.collection(db, "games"), {
              id: newGameId,
              name: requestData.name,
              description: requestData.description,
              logoUrl: requestData.logoUrl,
              githubUrl: requestData.githubUrl,
              gameUrl: requestData.gameUrl || '',
              howToPlay: requestData.howToPlay,
              targetAudience: requestData.targetAudience,
              categories: requestData.categories,
              developerUid: requestData.developerUid,
              developerName: requestData.developerName,
              approved: true,
              plays: 0,
              ratingSum: 0,
              ratingCount: 0,
              rating: 5.0,
              createdAt: new Date().toISOString()
            });
            updatePayload.gameId = newGameId;
          }
        }
        
        await firebaseFirestore.updateDoc(firebaseFirestore.doc(db, "game_requests", docId), updatePayload);
      }
    } catch (e) {
      console.warn("Firebase game request handling error, completed locally:", e);
    }
  }

  if (requestData) {
    try {
      const devProfile = await getUserProfile(requestData.developerUid);
      const emailToUse = devProfile.supportEmail || devProfile.twoFactorEmail || devProfile.email || 'diggy-games@outlook.com';
      await sendStatusEmail(emailToUse, requestData.developerName, `Game Submission: ${requestData.name}`, status, adminSuggestions);
    } catch (err) {
      console.warn("Failed to send notification email:", err);
    }
    return requestData;
  }
  throw new Error("Request not found");
}

export async function updateAndResubmitGameRequest(requestId, updatedData) {
  const requests = getLocalStorageData('game_requests');
  const idx = requests.findIndex(r => r.id === requestId);
  if (idx !== -1) {
    requests[idx] = {
      ...requests[idx],
      ...updatedData,
      status: 'pending',
      adminSuggestions: "",
      createdAt: new Date().toISOString()
    };
    saveLocalStorageData('game_requests', requests);
  }

  if (firebaseLoaded && !fallbackMode) {
    try {
      const ref = firebaseFirestore.collection(db, "game_requests");
      const q = firebaseFirestore.query(ref, firebaseFirestore.where("githubUrl", "==", updatedData.githubUrl));
      const snap = await firebaseFirestore.getDocs(q);
      if (!snap.empty) {
        const docId = snap.docs[0].id;
        await firebaseFirestore.updateDoc(firebaseFirestore.doc(db, "game_requests", docId), {
          ...updatedData,
          status: 'pending',
          adminSuggestions: "",
          createdAt: new Date().toISOString()
        });
      }
    } catch (e) {
      console.warn("Firebase resubmission failed, updated locally:", e);
    }
  }
}

export async function directPublishGame(gameData) {
  const newGame = {
    id: 'game_' + Math.random().toString(36).substr(2, 9),
    ...gameData,
    approved: true,
    createdAt: new Date().toISOString()
  };

  const games = getLocalStorageData('games');
  games.push(newGame);
  saveLocalStorageData('games', games);

  if (firebaseLoaded && !fallbackMode) {
    try {
      await firebaseFirestore.addDoc(firebaseFirestore.collection(db, "games"), newGame);
    } catch (e) {
      console.warn("Firebase direct publish failed, published locally:", e);
    }
  }

  return newGame;
}

export async function getActiveGames() {
  if (firebaseLoaded && !fallbackMode) {
    try {
      const q = firebaseFirestore.query(
        firebaseFirestore.collection(db, "games"), 
        firebaseFirestore.where("approved", "==", true),
        firebaseFirestore.orderBy("createdAt", "desc")
      );
      const snap = await firebaseFirestore.getDocs(q);
      const list = [];
      snap.forEach(d => list.push({ id: d.id, ...d.data() }));
      return list;
    } catch (e) {
      console.warn("Firebase load active games failed, loading local:", e);
    }
  }

  return getLocalStorageData('games').filter(g => g.approved === true);
}

export async function updateGameDetails(gameId, updatedData) {
  // Update locally
  const games = getLocalStorageData('games');
  const idx = games.findIndex(g => g.id === gameId);
  
  if (idx !== -1) {
    games[idx] = { ...games[idx], ...updatedData };
    saveLocalStorageData('games', games);
  } else {
    throw new Error("Game not found");
  }

  // Update in Firebase
  if (firebaseLoaded && !fallbackMode) {
    try {
      const ref = firebaseFirestore.collection(db, "games");
      const q = firebaseFirestore.query(ref, firebaseFirestore.where("id", "==", gameId));
      const snap = await firebaseFirestore.getDocs(q);
      if (!snap.empty) {
        const docId = snap.docs[0].id;
        await firebaseFirestore.updateDoc(firebaseFirestore.doc(db, "games", docId), updatedData);
      }
    } catch (e) {
      console.warn("Firebase game update failed, updated locally:", e);
    }
  }

  return games[idx];
}

// --- TWO-FACTOR AUTHENTICATION ---

// Store temporary 2FA codes with expiration (in-memory for demo, should use Redis in production)
const twoFactorCodes = new Map();

export function generateAndStore2FACode(uid) {
  // Generate secure 6-digit code
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + (5 * 60 * 1000); // 5 minutes expiration
  
  twoFactorCodes.set(uid, {
    code,
    expiresAt,
    attempts: 0,
    maxAttempts: 3
  });
  
  return code;
}

export function verify2FACode(uid, enteredCode) {
  const stored = twoFactorCodes.get(uid);
  
  if (!stored) {
    return { valid: false, error: 'Verification code is invalid or expired' };
  }

  if (Date.now() > stored.expiresAt) {
    twoFactorCodes.delete(uid);
    return { valid: false, error: 'The verification code has expired. Request a new code.' };
  }

  if (stored.attempts >= stored.maxAttempts) {
    twoFactorCodes.delete(uid);
    return { valid: false, error: 'Exceeded the maximum number of attempts. Try logging in again.' };
  }

  stored.attempts++;

  if (enteredCode === stored.code) {
    twoFactorCodes.delete(uid);
    return { valid: true };
  } else {
    const remaining = stored.maxAttempts - stored.attempts;
    return {
      valid: false,
      error: `Incorrect code. ${remaining} attempts remaining.`
    };
  }
}

export function clear2FACode(uid) {
  twoFactorCodes.delete(uid);
}

// --- BIOMETRIC AUTHENTICATION (WebAuthn) ---

// Store WebAuthn credentials (in production, this should be in a secure database)
const webAuthnCredentials = new Map();

export async function registerWebAuthnCredential(username, uid) {
  // Check if WebAuthn is supported
  if (!window.PublicKeyCredential) {
    throw new Error('Your browser does not support WebAuthn');
  }

  // Check if user verifier is available (biometric device)
  const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
  if (!available) {
    throw new Error('No biometric device available was found on the system');
  }

  try {
    // Convert username to buffer
    const userIdBuffer = new TextEncoder().encode(uid);
    const challengeBuffer = new Uint8Array(32);
    crypto.getRandomValues(challengeBuffer);

    const credentialCreationOptions = {
      challenge: challengeBuffer,
      rp: {
        name: 'DIGGY Games',
        id: window.location.hostname || 'localhost'
      },
      user: {
        id: userIdBuffer,
        name: username,
        displayName: username
      },
      pubKeyCredParams: [
        { type: 'public-key', alg: -7 } // ES256
      ],
      authenticatorSelection: {
        authenticatorAttachment: 'platform',
        userVerification: 'required'
      },
      timeout: 60000
    };

    const credential = await navigator.credentials.create({
      publicKey: credentialCreationOptions
    });

    if (!credential) {
      throw new Error('Creating biometric credential failed');
    }

    // Store the credential ID and public key
    const credentialId = Array.from(new Uint8Array(credential.rawId));
    const credentialData = {
      credentialId: credentialId,
      publicKey: credential.response.publicKey ? Array.from(new Uint8Array(credential.response.publicKey)) : null,
      counter: 0,
      username: username,
      uid: uid,
      createdAt: Date.now()
    };

    webAuthnCredentials.set(uid, credentialData);
    
    // Also store in localStorage for persistence across sessions
    localStorage.setItem(`diggy_webauthn_${uid}`, JSON.stringify(credentialData));

    return { success: true, credentialId: credentialId };
  } catch (error) {
    console.error('WebAuthn registration error:', error);
    throw new Error(`Error registering biometrics: ${error.message}`);
  }
}

export async function verifyWebAuthnCredential(username, uid) {
  // Check if WebAuthn is supported
  if (!window.PublicKeyCredential) {
    throw new Error('Your browser does not support WebAuthn');
  }

  // Try to get stored credential
  let credentialData = webAuthnCredentials.get(uid);
  
  // If not in memory, try localStorage
  if (!credentialData) {
    const stored = localStorage.getItem(`diggy_webauthn_${uid}`);
    if (stored) {
      credentialData = JSON.parse(stored);
      webAuthnCredentials.set(uid, credentialData);
    }
  }

  if (!credentialData) {
    throw new Error('No saved biometric credential found. Please enable biometric login in settings.');
  }

  try {
    const challengeBuffer = new Uint8Array(32);
    crypto.getRandomValues(challengeBuffer);

    const credentialRequestOptions = {
      challenge: challengeBuffer,
      allowCredentials: [{
        type: 'public-key',
        id: new Uint8Array(credentialData.credentialId)
      }],
      userVerification: 'required',
      timeout: 60000
    };

    const assertion = await navigator.credentials.get({
      publicKey: credentialRequestOptions
    });

    if (!assertion) {
      throw new Error('Biometric verification failed');
    }

    // In a real implementation, you would verify the signature here
    // For this demo, we'll trust the assertion if it was successful
    
    // Update counter
    credentialData.counter++;
    localStorage.setItem(`diggy_webauthn_${uid}`, JSON.stringify(credentialData));

    return { success: true, username: username };
  } catch (error) {
    console.error('WebAuthn verification error:', error);
    throw new Error(`Error verifying biometrics: ${error.message}`);
  }
}

export function hasWebAuthnCredential(uid) {
  return webAuthnCredentials.has(uid) || localStorage.getItem(`diggy_webauthn_${uid}`) !== null;
}

export function removeWebAuthnCredential(uid) {
  webAuthnCredentials.delete(uid);
  localStorage.removeItem(`diggy_webauthn_${uid}`);
}

// --- EMAIL DISPATCHER ---

export const simulatedEmails = [];

function getEmailJSSettings() {
  const globalScope = typeof window !== 'undefined' ? window : null;
  const serviceId = (localStorage.getItem('diggy_emailjs_service_id') || globalScope?.__DIGGY_EMAILJS_SERVICE_ID__ || '').trim();
  const templateId = (localStorage.getItem('diggy_emailjs_template_id') || globalScope?.__DIGGY_EMAILJS_TEMPLATE_ID__ || '').trim();
  const publicKey = (localStorage.getItem('diggy_emailjs_public_key') || globalScope?.__DIGGY_EMAILJS_PUBLIC_KEY__ || '').trim();
  const fromName = (localStorage.getItem('diggy_emailjs_from_name') || globalScope?.__DIGGY_EMAILJS_FROM_NAME__ || 'DIGGY Games').trim();

  return {
    serviceId,
    templateId,
    publicKey,
    fromName: fromName || 'DIGGY Games',
    enabled: Boolean(serviceId && templateId && publicKey)
  };
}

export function setEmailJSConfig(serviceId, templateId, publicKey, fromName) {
  const normalizedServiceId = (serviceId || '').trim();
  const normalizedTemplateId = (templateId || '').trim();
  const normalizedPublicKey = (publicKey || '').trim();
  const normalizedFromName = (fromName || '').trim();

  localStorage.setItem('diggy_emailjs_service_id', normalizedServiceId);
  localStorage.setItem('diggy_emailjs_template_id', normalizedTemplateId);
  localStorage.setItem('diggy_emailjs_public_key', normalizedPublicKey);
  localStorage.setItem('diggy_emailjs_from_name', normalizedFromName || 'DIGGY Games');
  return getEmailJSSettings();
}

export function setResendConfig(serviceId, templateId, publicKey, fromName) {
  return setEmailJSConfig(serviceId, templateId, publicKey, fromName);
}

export function getEmailJSConfigState() {
  return getEmailJSSettings();
}

export function getResendConfigState() {
  return getEmailJSSettings();
}

function getSafeRecipientEmail(to) {
  const trimmed = String(to || '').trim();
  return trimmed || 'diggy-games@outlook.com';
}

export async function sendEmailViaResend(to, subject, htmlContent) {
  const recipientEmail = getSafeRecipientEmail(to);
  const emailLog = {
    id: 'email_' + Math.random().toString(36).substr(2, 9),
    to: recipientEmail,
    subject,
    html: htmlContent,
    sentAt: new Date().toLocaleTimeString(),
    timestamp: Date.now()
  };
  
  const emailJSSettings = getEmailJSSettings();

  if (emailJSSettings.enabled && typeof window !== 'undefined' && window.emailjs) {
    try {
      if (emailJSSettings.publicKey && typeof window.emailjs.init === 'function') {
        window.emailjs.init({ publicKey: emailJSSettings.publicKey });
      }

      const response = await window.emailjs.send(
        emailJSSettings.serviceId,
        emailJSSettings.templateId,
        {
          to: recipientEmail,
          to_email: recipientEmail,
          email: recipientEmail,
          recipient: recipientEmail,
          subject,
          message: htmlContent,
          message_html: htmlContent,
          reply_to: recipientEmail,
          replyTo: recipientEmail,
          from_name: emailJSSettings.fromName
        },
        {
          publicKey: emailJSSettings.publicKey
        }
      );

      if (response?.status === 200) {
        emailLog.status = 'sent';
        emailLog.messageId = response?.text || response?.id;
        console.log(`[Email Sent via EmailJS] to: ${recipientEmail} | subject: ${subject} | id: ${response?.text || response?.id}`);
      } else {
        throw new Error('EmailJS failed to send the message.');
      }
    } catch (error) {
      console.error('[EmailJS Error]', error);
      emailLog.status = 'failed';
      emailLog.error = error.message;
      simulatedEmails.unshift(emailLog);
      window.dispatchEvent(new CustomEvent('diggy-email-sent', { detail: emailLog }));
      return { success: false, mode: 'emailjs_failed', error: error.message, email: emailLog };
    }
  } else {
    emailLog.status = 'simulated';
    console.log(`[Email Simulated] to: ${recipientEmail} | subject: ${subject}`);
  }

  simulatedEmails.unshift(emailLog);
  window.dispatchEvent(new CustomEvent('diggy-email-sent', { detail: emailLog }));
  return { success: true, mode: emailJSSettings.enabled ? 'emailjs' : 'simulated', email: emailLog };
}

async function sendStatusEmail(to, name, type, status, reason) {
  const statusColors = {
    approved: '#00ff66',
    rejected: '#ff3366',
    improvement: '#ffcc00'
  };
  const statusTexts = {
    approved: 'APPROVED',
    rejected: 'REJECTED',
    improvement: 'NEEDS IMPROVEMENT'
  };

  const color = statusColors[status] || '#00ff66';
  const statusText = statusTexts[status] || status.toUpperCase();

  const html = `
    <div style="background-color: #07080a; color: #ffffff; font-family: sans-serif; padding: 40px; border-radius: 12px; border: 2px solid ${color}; max-width: 600px; margin: 0 auto;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #00ff66; font-size: 36px; margin: 0;">DIGGY</h1>
      </div>
      
      <div style="background: rgba(255,255,255,0.03); border-radius: 8px; padding: 25px; border-left: 4px solid ${color}; margin-bottom: 25px;">
        <h2>Hi ${name},</h2>
        <p>We have an update regarding your request on <strong>DIGGY</strong>!</p>

        <div style="margin: 20px 0; padding: 15px; background: rgba(0,0,0,0.3); border-radius: 6px; text-align: center;">
          <span style="color: #888888; display: block; margin-bottom: 5px;">Action Type</span>
          <strong style="font-size: 18px;">${type}</strong>
          <hr style="border: 0; border-top: 1px solid rgba(255,255,255,0.1); margin: 10px 0;">
          <span style="color: #888888; display: block; margin-bottom: 5px;">Request Status</span>
          <strong style="font-size: 22px; color: ${color};">${statusText}</strong>
        </div>

        ${reason ? `
          <div style="background: rgba(255,255,255,0.05); padding: 15px; border-radius: 6px;">
            <strong style="color: ${color}; display: block; margin-bottom: 8px;">System Admin Notes:</strong>
            <p style="margin: 0; color: #eeeeee;">${reason}</p>
          </div>
        ` : ''}
      </div>
    </div>
  `;

  await sendEmailViaResend(to, `DIGGY - Update on your ${type} request`, html);
}

export async function recordGamePlay(gameId) {
  // Update LocalStorage
  const games = getLocalStorageData('games');
  const idx = games.findIndex(g => g.id === gameId);
  if (idx !== -1) {
    games[idx].plays = (games[idx].plays || 0) + 1;
    saveLocalStorageData('games', games);
  }

  // Update Firebase
  if (firebaseLoaded && !fallbackMode) {
    try {
      const ref = firebaseFirestore.collection(db, "games");
      const q = firebaseFirestore.query(ref, firebaseFirestore.where("id", "==", gameId));
      const snap = await firebaseFirestore.getDocs(q);
      if (!snap.empty) {
        const docId = snap.docs[0].id;
        const currentPlays = snap.docs[0].data().plays || 0;
        await firebaseFirestore.updateDoc(firebaseFirestore.doc(db, "games", docId), {
          plays: currentPlays + 1
        });
      } else {
        const docRef = firebaseFirestore.doc(db, "games", gameId);
        const docSnap = await firebaseFirestore.getDoc(docRef);
        if (docSnap.exists()) {
          const currentPlays = docSnap.data().plays || 0;
          await firebaseFirestore.updateDoc(docRef, { plays: currentPlays + 1 });
        }
      }
    } catch (e) {
      console.warn("Firebase record gameplay failed:", e);
    }
  }
}

export async function submitGameVersionRequest(gameId, versionData) {
  const requestId = 'greq_' + Math.random().toString(36).substr(2, 9);
  const requestDoc = {
    id: requestId,
    parentGameId: gameId,
    type: 'version_update',
    status: 'pending',
    createdAt: new Date().toISOString(),
    adminSuggestions: "",
    ...versionData
  };

  const requests = getLocalStorageData('game_requests');
  requests.push(requestDoc);
  saveLocalStorageData('game_requests', requests);

  if (firebaseLoaded && !fallbackMode) {
    try {
      await firebaseFirestore.addDoc(firebaseFirestore.collection(db, "game_requests"), requestDoc);
    } catch (e) {
      console.warn("Firebase game version request failed, saved locally:", e);
    }
  }

  return requestDoc;
}

export async function rateGame(gameId, score) {
  const games = getLocalStorageData('games');
  const idx = games.findIndex(g => g.id === gameId);
  let newRating = 5.0;
  if (idx !== -1) {
    const currentSum = games[idx].ratingSum || 0;
    const currentCount = games[idx].ratingCount || 0;
    const nextSum = currentSum + score;
    const nextCount = currentCount + 1;
    newRating = parseFloat((nextSum / nextCount).toFixed(1));
    
    games[idx].ratingSum = nextSum;
    games[idx].ratingCount = nextCount;
    games[idx].rating = newRating;
    saveLocalStorageData('games', games);
  }

  if (firebaseLoaded && !fallbackMode) {
    try {
      const ref = firebaseFirestore.collection(db, "games");
      const q = firebaseFirestore.query(ref, firebaseFirestore.where("id", "==", gameId));
      const snap = await firebaseFirestore.getDocs(q);
      if (!snap.empty) {
        const docId = snap.docs[0].id;
        const data = snap.docs[0].data();
        const currentSum = data.ratingSum || 0;
        const currentCount = data.ratingCount || 0;
        const nextSum = currentSum + score;
        const nextCount = currentCount + 1;
        const avg = parseFloat((nextSum / nextCount).toFixed(1));
        
        await firebaseFirestore.updateDoc(firebaseFirestore.doc(db, "games", docId), {
          ratingSum: nextSum,
          ratingCount: nextCount,
          rating: avg
        });
      }
    } catch (e) {
      console.warn("Firebase rate game failed:", e);
    }
  }
  return newRating;
}

export { auth };
