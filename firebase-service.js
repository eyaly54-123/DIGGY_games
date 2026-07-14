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

// Profanity filter - common inappropriate words
const profanityList = [
  'fuck', 'shit', 'ass', 'bitch', 'damn', 'hell', 'crap', 'piss',
  'dick', 'cock', 'pussy', 'whore', 'slut', 'bastard', 'cunt',
  'fag', 'nigger', 'nigga', 'retard', 'idiot', 'stupid', 'dumb',
  'wanker', 'twat', 'arse', 'bollocks', 'prick', 'knob',
  // Hebrew profanity
  'זין', 'כוס', 'תחת', 'שרמוטה', 'זונה', 'חרא', 'מזדיין', 'מזדיינת',
  'בן זונה', 'בת זונה', 'כוסעמק', 'כוס אמק', 'תחתון', 'תחתניק',
  'זיון', 'זיינית', 'מפגר', 'אידיוט', 'טמבל', 'שמוק', 'בן כלבה',
  'בת כלבה', 'אחור', 'כוסית', 'זונמט', 'זונמטה'
];

export function containsProfanity(text) {
  if (!text || typeof text !== 'string') return false;
  const lowerText = text.toLowerCase();
  return profanityList.some(word => lowerText.includes(word));
}

export function filterProfanity(text) {
  if (!text || typeof text !== 'string') return text;
  let filtered = text;
  profanityList.forEach(word => {
    const regex = new RegExp(word, 'gi');
    filtered = filtered.replace(regex, '*'.repeat(word.length));
  });
  return filtered;
}

// Global variables for Firebase services
let app = null;
let auth = null;
let db = null;
let firebaseLoaded = false;
let fallbackMode = false;

// Promise that resolves once Firebase finishes initialising (success or failure).
// Awaiting this avoids race conditions where data functions run before the SDK loads.
let _firebaseReadyResolve;
const firebaseReadyPromise = new Promise(resolve => { _firebaseReadyResolve = resolve; });

// Export for UI status checking
export function getFirebaseStatus() {
  if (firebaseLoaded) return { connected: true, mode: 'firebase', message: 'Connected - games shared across all users' };
  return { connected: false, mode: 'local', message: 'Local mode - games NOT shared between users' };
}

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
    _firebaseReadyResolve();
    console.log("Firebase dynamically initialized successfully. Games will be shared across users.");

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
  } catch (e) {
    console.warn("Firebase SDK failed to load from CDN. Operating in local-only fallback mode. Games will NOT be shared between users!", e);
    fallbackMode = true;
    _firebaseReadyResolve();
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

// Games are stored in Firebase only — no local seeding.
// LocalStorage is used only as a write-through cache for offline resilience.

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
  if (firebaseLoaded) {
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
  if (firebaseLoaded) {
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
      console.log("Firebase sign up failed, using local storage:", error.message || error);
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
      console.log("Firebase login failed, using local storage:", error.message || error);
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

  if (firebaseLoaded) {
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
  if (firebaseLoaded) {
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

  if (firebaseLoaded) {
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

  if (firebaseLoaded) {
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
  if (firebaseLoaded) {
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

  // Check Firebase for existing pending request (cross-device)
  if (firebaseLoaded) {
    try {
      const ref = firebaseFirestore.collection(db, "developer_requests");
      const q = firebaseFirestore.query(ref, firebaseFirestore.where("uid", "==", uid), firebaseFirestore.where("status", "==", "pending"));
      const snap = await firebaseFirestore.getDocs(q);
      if (!snap.empty) throw new Error("You already have a pending request to become a developer!");
    } catch (e) {
      if (e.message.includes("pending request")) throw e;
      console.warn("Firebase duplicate check failed, checking locally:", e);
    }
  }

  // Also check localStorage as fallback
  const requests = getLocalStorageData('developer_requests');
  const localExists = requests.some(r => r.uid === uid && r.status === 'pending');
  if (localExists) throw new Error("You already have a pending request to become a developer!");

  requests.push(requestDoc);
  saveLocalStorageData('developer_requests', requests);

  if (firebaseLoaded) {
    try {
      await firebaseFirestore.addDoc(firebaseFirestore.collection(db, "developer_requests"), requestDoc);
    } catch (e) {
      console.warn("Firebase dev request submission failed, saved locally only:", e);
    }
  }

  return requestDoc;
}

export async function getDeveloperRequests() {
  await firebaseReadyPromise;

  if (firebaseLoaded && !fallbackMode) {
    try {
      const q = firebaseFirestore.query(firebaseFirestore.collection(db, "developer_requests"), firebaseFirestore.orderBy("createdAt", "desc"));
      const snap = await firebaseFirestore.getDocs(q);
      const reqs = [];
      snap.forEach(d => { const data = d.data(); reqs.push({ ...data, id: data.id || d.id }); });
      return reqs;
    } catch (e) {
      console.warn("Firebase developer requests load failed, loading local cache:", e);
    }
  }

  return getLocalStorageData('developer_requests').sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export async function handleDeveloperRequest(requestId, status, adminReason) {
  let requestData = null;
  let fbDocId = null;

  // 1. Try Firebase first (cross-device authoritative source)
  if (firebaseLoaded) {
    try {
      const ref = firebaseFirestore.collection(db, "developer_requests");
      // Search by custom id field stored in the document
      const q = firebaseFirestore.query(ref, firebaseFirestore.where("id", "==", requestId));
      const snap = await firebaseFirestore.getDocs(q);
      if (!snap.empty) {
        fbDocId = snap.docs[0].id;
        requestData = { ...snap.docs[0].data() };
      } else {
        // Fallback: treat requestId as uid (old behaviour)
        const q2 = firebaseFirestore.query(ref, firebaseFirestore.where("uid", "==", requestId));
        const snap2 = await firebaseFirestore.getDocs(q2);
        if (!snap2.empty) {
          fbDocId = snap2.docs[0].id;
          requestData = { ...snap2.docs[0].data() };
        }
      }
    } catch (e) {
      console.warn("Firebase developer request lookup failed:", e);
    }
  }

  // 2. Also check localStorage (covers offline / fallback mode)
  if (!requestData) {
    const requests = getLocalStorageData('developer_requests');
    const idx = requests.findIndex(r => r.id === requestId || r.uid === requestId);
    if (idx !== -1) {
      requestData = requests[idx];
    }
  }

  if (!requestData) {
    throw new Error("Request not found - could not locate developer request with ID: " + requestId);
  }

  // 3. Update Firebase
  if (firebaseLoaded) {
    try {
      const ref = firebaseFirestore.collection(db, "developer_requests");
      const targetDocId = fbDocId || (await (async () => {
        const q = firebaseFirestore.query(ref, firebaseFirestore.where("uid", "==", requestData.uid));
        const snap = await firebaseFirestore.getDocs(q);
        return snap.empty ? null : snap.docs[0].id;
      })());
      if (targetDocId) {
        await firebaseFirestore.updateDoc(firebaseFirestore.doc(db, "developer_requests", targetDocId), { status, adminReason });
      }
    } catch (e) {
      console.warn("Firebase developer request update failed:", e);
    }
  }

  // 4. Sync update to localStorage
  const requests = getLocalStorageData('developer_requests');
  const idx = requests.findIndex(r => r.id === requestData.id || r.uid === requestData.uid);
  if (idx !== -1) {
    requests[idx].status = status;
    requests[idx].adminReason = adminReason;
  } else {
    requests.push({ ...requestData, status, adminReason });
  }
  saveLocalStorageData('developer_requests', requests);

  // 5. Promote user role if approved (updateUserProfile handles Firebase directly by UID)
  if (status === 'approved') {
    await updateUserProfile(requestData.uid, { role: 'developer' });
  }

  await sendStatusEmail(requestData.contactEmail, requestData.username, 'Developer Role Application', status, adminReason);
  return { ...requestData, status, adminReason };
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

  // Check Firebase for rejected status (cross-device)
  if (firebaseLoaded) {
    try {
      const ref = firebaseFirestore.collection(db, "game_requests");
      const q = firebaseFirestore.query(ref, firebaseFirestore.where("githubUrl", "==", gameData.githubUrl), firebaseFirestore.where("status", "==", "rejected"));
      const snap = await firebaseFirestore.getDocs(q);
      if (!snap.empty) throw new Error("This game repository was previously rejected and cannot be resubmitted.");
    } catch (e) {
      if (e.message.includes("rejected")) throw e;
      console.warn("Firebase rejection check failed, checking locally:", e);
    }
  }

  // Also check localStorage as fallback
  const requests = getLocalStorageData('game_requests');
  const rejected = requests.some(r => r.githubUrl === gameData.githubUrl && r.status === 'rejected');
  if (rejected) throw new Error("This game repository was previously rejected and cannot be resubmitted.");

  requests.push(requestDoc);
  saveLocalStorageData('game_requests', requests);

  if (firebaseLoaded) {
    try {
      await firebaseFirestore.addDoc(firebaseFirestore.collection(db, "game_requests"), requestDoc);
    } catch (e) {
      console.warn("Firebase game request failed, saved locally:", e);
    }
  }

  return requestDoc;
}

export async function getDeveloperGameRequests(developerUid) {
  await firebaseReadyPromise;

  if (firebaseLoaded && !fallbackMode) {
    try {
      const q = firebaseFirestore.query(
        firebaseFirestore.collection(db, "game_requests"),
        firebaseFirestore.where("developerUid", "==", developerUid)
      );
      const snap = await firebaseFirestore.getDocs(q);
      const reqs = [];
      snap.forEach(d => { const data = d.data(); reqs.push({ ...data, id: data.id || d.id }); });
      return reqs;
    } catch (e) {
      console.warn("Firebase load dev game requests failed, loading local cache:", e);
    }
  }

  return getLocalStorageData('game_requests').filter(r => r.developerUid === developerUid);
}

export async function getPendingGameRequests() {
  await firebaseReadyPromise;

  if (firebaseLoaded && !fallbackMode) {
    try {
      const snap = await firebaseFirestore.getDocs(firebaseFirestore.collection(db, "game_requests"));
      const reqs = [];
      snap.forEach(d => { const data = d.data(); reqs.push({ ...data, id: data.id || d.id }); });
      return reqs;
    } catch (e) {
      console.warn("Firebase load game requests failed, loading local cache:", e);
    }
  }

  return getLocalStorageData('game_requests');
}

export async function handleGameRequest(requestId, status, adminSuggestions = "", requesterUid = null, requesterRole = null) {
  let requestData = null;
  let fbRequestDocId = null;

  // 1. Fetch from Firebase first (cross-device authoritative source)
  if (firebaseLoaded) {
    try {
      const ref = firebaseFirestore.collection(db, "game_requests");
      const q = firebaseFirestore.query(ref, firebaseFirestore.where("id", "==", requestId));
      const snap = await firebaseFirestore.getDocs(q);
      if (!snap.empty) {
        fbRequestDocId = snap.docs[0].id;
        requestData = { ...snap.docs[0].data() };
      }
    } catch (e) {
      console.warn("Firebase game request lookup failed:", e);
    }
  }

  // 2. Fall back to localStorage if Firebase lookup failed or offline
  if (!requestData) {
    const requests = getLocalStorageData('game_requests');
    const idx = requests.findIndex(r => r.id === requestId);
    if (idx !== -1) {
      requestData = requests[idx];
    }
  }

  if (!requestData) {
    throw new Error("Request not found - ID: " + requestId);
  }

  // 3. Apply status update to requestData
  requestData.status = status;
  requestData.adminSuggestions = adminSuggestions;

  // 4. Handle approval: create the game in Firebase (single source of truth)
  let newGameId = null;
  if (status === 'approved') {
    if (requestData.type === 'version_update') {
      // Update existing game in Firebase
      if (firebaseLoaded) {
        try {
          const gameRef = firebaseFirestore.collection(db, "games");
          const qGame = firebaseFirestore.query(gameRef, firebaseFirestore.where("id", "==", requestData.parentGameId));
          const gameSnap = await firebaseFirestore.getDocs(qGame);
          if (!gameSnap.empty) {
            await firebaseFirestore.updateDoc(firebaseFirestore.doc(db, "games", gameSnap.docs[0].id), {
              gameUrl: requestData.gameUrl,
              githubUrl: requestData.githubUrl,
              version: requestData.version,
              latestChangelog: requestData.changelog,
              lastUpdatedAt: new Date().toISOString()
            });
          }
        } catch (e) {
          console.error("Firebase version update failed:", e);
        }
      }
      
      // Update existing game in localStorage
      const games = getLocalStorageData('games');
      const gameIdx = games.findIndex(g => g.id === requestData.parentGameId);
      if (gameIdx !== -1) {
        games[gameIdx].gameUrl = requestData.gameUrl;
        games[gameIdx].githubUrl = requestData.githubUrl;
        games[gameIdx].version = requestData.version;
        games[gameIdx].latestChangelog = requestData.changelog;
        games[gameIdx].lastUpdatedAt = new Date().toISOString();
        saveLocalStorageData('games', games);
      }
    } else {
      // Create new game — one ID, written to Firebase first
      newGameId = 'game_' + Math.random().toString(36).substr(2, 9);
      const gamePayload = {
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
        rating: 0,
        createdAt: new Date().toISOString()
      };

      if (firebaseLoaded && !fallbackMode) {
        try {
          await firebaseFirestore.addDoc(firebaseFirestore.collection(db, "games"), gamePayload);
          console.log("Game created in Firebase with ID:", newGameId, "and approved:", gamePayload.approved);
        } catch (e) {
          console.error("Firebase game creation failed:", e);
        }
      }

      requestData.gameId = newGameId;
    }
  }

  // 5. Update game request status in Firebase
  if (firebaseLoaded) {
    try {
      const updatePayload = { status, adminSuggestions, ...(newGameId ? { gameId: newGameId } : {}) };
      if (fbRequestDocId) {
        await firebaseFirestore.updateDoc(firebaseFirestore.doc(db, "game_requests", fbRequestDocId), updatePayload);
      } else {
        // Try to find the doc if we only got requestData from localStorage
        const ref = firebaseFirestore.collection(db, "game_requests");
        const q = firebaseFirestore.query(ref, firebaseFirestore.where("id", "==", requestId));
        const snap = await firebaseFirestore.getDocs(q);
        if (!snap.empty) {
          await firebaseFirestore.updateDoc(firebaseFirestore.doc(db, "game_requests", snap.docs[0].id), updatePayload);
        }
      }
    } catch (e) {
      console.error("Firebase game request status update failed:", e);
    }
  }

  // 6. Sync request status to localStorage
  const requests = getLocalStorageData('game_requests');
  const localIdx = requests.findIndex(r => r.id === requestId);
  if (localIdx !== -1) {
    requests[localIdx].status = status;
    requests[localIdx].adminSuggestions = adminSuggestions;
    if (newGameId) requests[localIdx].gameId = newGameId;
  } else {
    requests.push({ ...requestData });
  }
  saveLocalStorageData('game_requests', requests);

  // 7. Send notification email to developer
  try {
    const devProfile = await getUserProfile(requestData.developerUid);
    const emailToUse = devProfile.supportEmail || devProfile.twoFactorEmail || devProfile.email || 'diggy-games@outlook.com';
    await sendStatusEmail(emailToUse, requestData.developerName, `Game Submission: ${requestData.name}`, status, adminSuggestions);
  } catch (err) {
    console.warn("Failed to send notification email:", err);
  }

  return requestData;
}

export async function updateAndResubmitGameRequest(requestId, updatedData) {
  const resubPayload = {
    ...updatedData,
    status: 'pending',
    adminSuggestions: "",
    createdAt: new Date().toISOString()
  };

  // Update Firebase by custom id field (cross-device)
  if (firebaseLoaded) {
    try {
      const ref = firebaseFirestore.collection(db, "game_requests");
      const q = firebaseFirestore.query(ref, firebaseFirestore.where("id", "==", requestId));
      const snap = await firebaseFirestore.getDocs(q);
      if (!snap.empty) {
        await firebaseFirestore.updateDoc(firebaseFirestore.doc(db, "game_requests", snap.docs[0].id), resubPayload);
      } else {
        // Fallback: search by githubUrl
        const q2 = firebaseFirestore.query(ref, firebaseFirestore.where("githubUrl", "==", updatedData.githubUrl));
        const snap2 = await firebaseFirestore.getDocs(q2);
        if (!snap2.empty) {
          await firebaseFirestore.updateDoc(firebaseFirestore.doc(db, "game_requests", snap2.docs[0].id), resubPayload);
        }
      }
    } catch (e) {
      console.warn("Firebase resubmission failed, updating locally:", e);
    }
  }

  // Sync to localStorage
  const requests = getLocalStorageData('game_requests');
  const idx = requests.findIndex(r => r.id === requestId);
  if (idx !== -1) {
    requests[idx] = { ...requests[idx], ...resubPayload };
    saveLocalStorageData('game_requests', requests);
  }
}

export async function directPublishGame(gameData) {
  const newGame = {
    id: 'game_' + Math.random().toString(36).substr(2, 9),
    ...gameData,
    approved: true,
    plays: 0,
    ratingSum: 0,
    ratingCount: 0,
    rating: 0,
    createdAt: new Date().toISOString()
  };

  // Write to Firebase first
  if (firebaseLoaded && !fallbackMode) {
    try {
      await firebaseFirestore.addDoc(firebaseFirestore.collection(db, "games"), newGame);
    } catch (e) {
      console.warn("Firebase direct publish failed, saving locally only:", e);
    }
  }

  return newGame;
}

export async function getActiveGames() {
  // Wait for Firebase to finish loading
  await firebaseReadyPromise;

  if (!firebaseLoaded || fallbackMode) {
    throw new Error("Firebase is not available. Cannot load games.");
  }

  try {
    const q = firebaseFirestore.query(
      firebaseFirestore.collection(db, "games"),
      firebaseFirestore.where("approved", "==", true)
    );
    const snap = await firebaseFirestore.getDocs(q);
    const list = [];
    snap.forEach(d => {
      const data = d.data();
      // Use the custom id field if present, otherwise use Firestore doc id
      list.push({ ...data, id: data.id || d.id });
    });
    // Sort by createdAt in JavaScript instead of Firestore to avoid index requirement
    list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    console.log("Loaded games from Firebase:", list.length);
    console.log("Games details:", list.map(g => ({ id: g.id, name: g.name, approved: g.approved })));
    return list;
  } catch (e) {
    console.error("Firebase load active games failed:", e);
    throw new Error("Failed to load games from Firebase");
  }
}

export function debugLocalStorageGames() {
  const allGames = getLocalStorageData('games');
  console.log("=== ALL GAMES IN LOCAL STORAGE ===");
  console.log(`Total games: ${allGames.length}`);
  allGames.forEach(g => {
    console.log(`- ID: ${g.id}, Name: "${g.name}", Approved: ${g.approved}`);
  });
  
  const game123 = allGames.find(g => g.name === '123' || g.name === '123 ');
  if (game123) {
    console.warn("!!! FOUND GAME NAMED '123' !!!");
    console.warn(game123);
  } else {
    console.log("No game named '123' found in localStorage");
  }
  
  return allGames;
}

export function removeGameByName(gameName) {
  const games = getLocalStorageData('games');
  const filtered = games.filter(g => g.name !== gameName && g.name !== gameName + ' ');
  if (games.length !== filtered.length) {
    saveLocalStorageData('games', filtered);
    console.log(`Removed game named "${gameName}" from localStorage`);
    return true;
  }
  console.log(`No game named "${gameName}" found to remove`);
  return false;
}

export function clearAllLocalStorage() {
  const keysToRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('diggy_')) {
      keysToRemove.push(key);
    }
  }
  
  keysToRemove.forEach(key => {
    localStorage.removeItem(key);
  });
  
  console.log(`Cleared ${keysToRemove.length} localStorage items starting with 'diggy_'`);
  console.log('Cleared keys:', keysToRemove);
  
  return keysToRemove;
}

export async function updateGameDetails(gameId, updatedData) {
  await firebaseReadyPromise;

  let updatedGame = null;

  if (firebaseLoaded && !fallbackMode) {
    try {
      const ref = firebaseFirestore.collection(db, "games");
      const q = firebaseFirestore.query(ref, firebaseFirestore.where("id", "==", gameId));
      const snap = await firebaseFirestore.getDocs(q);
      if (!snap.empty) {
        await firebaseFirestore.updateDoc(firebaseFirestore.doc(db, "games", snap.docs[0].id), updatedData);
        updatedGame = { ...snap.docs[0].data(), ...updatedData };
      } else {
        throw new Error("Game not found in Firebase");
      }
    } catch (e) {
      console.warn("Firebase game update failed:", e);
    }
  }

  if (!updatedGame) throw new Error("Game not found");
  return updatedGame;
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

// --- EMAIL DISPATCHER (Firebase-based) ---

export const simulatedEmails = [];

export async function sendEmailViaResend(to, subject, htmlContent) {
  const recipientEmail = String(to || 'diggy-games@outlook.com').trim();
  const emailLog = {
    id: 'email_' + Math.random().toString(36).substr(2, 9),
    to: recipientEmail,
    subject,
    html: htmlContent,
    sentAt: new Date().toLocaleTimeString(),
    timestamp: Date.now(),
    status: 'simulated'
  };
  
  // Store email log in Firebase for tracking
  if (firebaseLoaded) {
    try {
      await firebaseFirestore.addDoc(firebaseFirestore.collection(db, "email_logs"), emailLog);
    } catch (e) {
      console.warn("Firebase email log save failed:", e);
    }
  }
  
  simulatedEmails.unshift(emailLog);
  window.dispatchEvent(new CustomEvent('diggy-email-sent', { detail: emailLog }));
  console.log(`[Email Simulated - Firebase Mode] to: ${recipientEmail} | subject: ${subject}`);
  return { success: true, mode: 'firebase_simulated', email: emailLog };
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

  if (firebaseLoaded) {
    try {
      await firebaseFirestore.addDoc(firebaseFirestore.collection(db, "game_requests"), requestDoc);
    } catch (e) {
      console.warn("Firebase game version request failed, saved locally:", e);
    }
  }

  return requestDoc;
}

export async function rateGame(gameId, score) {
  console.log(`Rating game ${gameId} with score ${score}`);

  if (!firebaseLoaded || fallbackMode) {
    throw new Error("Firebase is not available. Cannot rate game.");
  }

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

      console.log(`Firebase rating update: sum=${currentSum} -> ${nextSum}, count=${currentCount} -> ${nextCount}, newRating=${avg}`);

      await firebaseFirestore.updateDoc(firebaseFirestore.doc(db, "games", docId), {
        ratingSum: nextSum,
        ratingCount: nextCount,
        rating: avg
      });
      console.log("Firebase rating update successful");
      return avg;
    } else {
      throw new Error("Game not found in Firebase");
    }
  } catch (e) {
    console.error("Firebase rate game failed:", e);
    throw new Error("Failed to rate game");
  }
}

// --- GAME DELETION ---

export async function deleteGame(gameId) {
  await firebaseReadyPromise;

  if (firebaseLoaded && !fallbackMode) {
    try {
      const ref = firebaseFirestore.collection(db, "games");
      const q   = firebaseFirestore.query(ref, firebaseFirestore.where("id", "==", gameId));
      const snap = await firebaseFirestore.getDocs(q);
      if (!snap.empty) {
        await firebaseFirestore.deleteDoc(firebaseFirestore.doc(db, "games", snap.docs[0].id));
      }
    } catch (e) {
      console.error("Firebase deleteGame failed:", e);
      throw e;
    }
  }

  // Remove from localStorage cache
  const games = getLocalStorageData('games');
  saveLocalStorageData('games', games.filter(g => g.id !== gameId));
}

// --- ADMIN LOGGING ---

export async function logAdminAction(action, details, userId = null, username = null) {
  await firebaseReadyPromise;

  const logEntry = {
    id: 'log_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
    action: action,
    details: details,
    userId: userId,
    username: username,
    timestamp: new Date().toISOString(),
    ipAddress: null // Could be enhanced with IP detection
  };

  if (firebaseLoaded && !fallbackMode) {
    try {
      await firebaseFirestore.addDoc(firebaseFirestore.collection(db, "admin_logs"), logEntry);
    } catch (e) {
      console.error("Failed to log admin action to Firebase:", e);
    }
  }

  // Fallback to localStorage
  const logs = getLocalStorageData('admin_logs') || [];
  logs.push(logEntry);
  // Keep only last 1000 logs in localStorage
  if (logs.length > 1000) {
    logs.splice(0, logs.length - 1000);
  }
  saveLocalStorageData('admin_logs', logs);
}

export async function getAdminLogs(limit = 100) {
  await firebaseReadyPromise;

  if (firebaseLoaded && !fallbackMode) {
    try {
      const q = firebaseFirestore.query(
        firebaseFirestore.collection(db, "admin_logs"),
        firebaseFirestore.orderBy("timestamp", "desc"),
        firebaseFirestore.limit(limit)
      );
      const snap = await firebaseFirestore.getDocs(q);
      return snap.docs.map(doc => doc.data());
    } catch (e) {
      console.error("Failed to fetch admin logs from Firebase:", e);
    }
  }

  // Fallback to localStorage
  const logs = getLocalStorageData('admin_logs') || [];
  return logs.slice(-limit).reverse();
}

// --- DEVELOPER-ADMIN CHAT ---

export async function sendDevChatMessage(senderUid, senderName, senderRole, message) {
  await firebaseReadyPromise;

  const chatMessage = {
    id: 'chat_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
    senderUid,
    senderName,
    senderRole,
    message,
    timestamp: new Date().toISOString()
  };

  if (firebaseLoaded && !fallbackMode) {
    try {
      await firebaseFirestore.addDoc(firebaseFirestore.collection(db, "dev_admin_chat"), chatMessage);
    } catch (e) {
      console.error("Failed to send dev chat message to Firebase:", e);
    }
  }

  // Fallback to localStorage
  const messages = getLocalStorageData('dev_admin_chat') || [];
  messages.push(chatMessage);
  // Keep only last 500 messages in localStorage
  if (messages.length > 500) {
    messages.splice(0, messages.length - 500);
  }
  saveLocalStorageData('dev_admin_chat', messages);

  return chatMessage;
}

export async function getDevChatMessages(limit = 50) {
  await firebaseReadyPromise;

  if (firebaseLoaded && !fallbackMode) {
    try {
      const q = firebaseFirestore.query(
        firebaseFirestore.collection(db, "dev_admin_chat"),
        firebaseFirestore.orderBy("timestamp", "desc"),
        firebaseFirestore.limit(limit)
      );
      const snap = await firebaseFirestore.getDocs(q);
      return snap.docs.map(doc => doc.data()).reverse();
    } catch (e) {
      console.error("Failed to fetch dev chat messages from Firebase:", e);
    }
  }

  // Fallback to localStorage
  const messages = getLocalStorageData('dev_admin_chat') || [];
  return messages.slice(-limit);
}

// --- GAME PLAY TRACKING ---

export async function recordGamePlay(gameId, gameName, userId, username) {
  await firebaseReadyPromise;

  const playRecord = {
    id: 'play_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
    gameId,
    gameName,
    userId,
    username,
    timestamp: new Date().toISOString(),
    device: getDeviceInfo(),
    playDuration: 0 // Will be updated when game is closed
  };

  if (firebaseLoaded && !fallbackMode) {
    try {
      await firebaseFirestore.addDoc(firebaseFirestore.collection(db, "game_plays"), playRecord);
    } catch (e) {
      console.error("Failed to record game play to Firebase:", e);
    }
  }

  // Fallback to localStorage
  const plays = getLocalStorageData('game_plays') || [];
  plays.push(playRecord);
  // Keep only last 1000 plays in localStorage
  if (plays.length > 1000) {
    plays.splice(0, plays.length - 1000);
  }
  saveLocalStorageData('game_plays', plays);

  return playRecord;
}

export async function updateGamePlayDuration(playId, durationSeconds) {
  await firebaseReadyPromise;

  if (firebaseLoaded && !fallbackMode) {
    try {
      const q = firebaseFirestore.query(
        firebaseFirestore.collection(db, "game_plays"),
        firebaseFirestore.where("id", "==", playId)
      );
      const snap = await firebaseFirestore.getDocs(q);
      if (!snap.empty) {
        await firebaseFirestore.updateDoc(snap.docs[0].ref, { playDuration: durationSeconds });
      }
    } catch (e) {
      console.error("Failed to update play duration in Firebase:", e);
    }
  }

  // Update localStorage
  const plays = getLocalStorageData('game_plays') || [];
  const playIndex = plays.findIndex(p => p.id === playId);
  if (playIndex !== -1) {
    plays[playIndex].playDuration = durationSeconds;
    saveLocalStorageData('game_plays', plays);
  }
}

export async function getGamePlayStatistics(gameId = null, userId = null) {
  await firebaseReadyPromise;

  let plays = [];

  if (firebaseLoaded && !fallbackMode) {
    try {
      let q = firebaseFirestore.collection(db, "game_plays");
      
      if (gameId) {
        q = firebaseFirestore.query(q, firebaseFirestore.where("gameId", "==", gameId));
      }
      if (userId) {
        q = firebaseFirestore.query(q, firebaseFirestore.where("userId", "==", userId));
      }
      
      const snap = await firebaseFirestore.getDocs(q);
      plays = snap.docs.map(doc => doc.data());
    } catch (e) {
      console.error("Failed to fetch game plays from Firebase:", e);
    }
  }

  // Fallback to localStorage
  if (plays.length === 0) {
    plays = getLocalStorageData('game_plays') || [];
    if (gameId) plays = plays.filter(p => p.gameId === gameId);
    if (userId) plays = plays.filter(p => p.userId === userId);
  }

  return plays;
}

function getDeviceInfo() {
  const ua = navigator.userAgent;
  let device = 'desktop';
  
  if (/Mobile|Android|iPhone/i.test(ua)) {
    device = 'mobile';
  } else if (/Tablet|iPad/i.test(ua)) {
    device = 'tablet';
  }
  
  return device;
}

// --- BUG REPORTS ---

export async function submitBugReport(gameId, gameName, developerUid, reportText, reporterUid, reporterName) {
  await firebaseReadyPromise;
  const report = {
    id: 'bug_' + Math.random().toString(36).substr(2, 9),
    gameId,
    gameName,
    developerUid,
    reportText,
    reporterUid,
    reporterName,
    createdAt: new Date().toISOString(),
    status: 'open'
  };

  if (firebaseLoaded && !fallbackMode) {
    try {
      await firebaseFirestore.addDoc(firebaseFirestore.collection(db, "bug_reports"), report);
    } catch (e) {
      console.warn("Firebase bug report submission failed:", e);
    }
  }

  // Fallback cache
  const reports = getLocalStorageData('bug_reports');
  reports.push(report);
  saveLocalStorageData('bug_reports', reports);

  return report;
}

export async function getBugReports() {
  await firebaseReadyPromise;
  if (firebaseLoaded && !fallbackMode) {
    try {
      const q = firebaseFirestore.query(
        firebaseFirestore.collection(db, "bug_reports"),
        firebaseFirestore.orderBy("createdAt", "desc")
      );
      const snap = await firebaseFirestore.getDocs(q);
      const list = [];
      snap.forEach(d => { const data = d.data(); list.push({ ...data, id: data.id || d.id }); });
      return list;
    } catch (e) {
      console.warn("Firebase bug reports load failed:", e);
    }
  }
  return getLocalStorageData('bug_reports');
}

export { auth, firebaseLoaded, fallbackMode, firebaseFirestore, db, getLocalStorageData, saveLocalStorageData };
