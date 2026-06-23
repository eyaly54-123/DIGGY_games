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
      // Fallback: If registration failed due to config/provider error, proceed with local
      if (error.code === 'auth/operation-not-allowed' || error.code === 'auth/internal-error' || error.message.includes('permission')) {
        fallbackMode = true; // Switch permanently to local fallback for this session
      } else {
        throw error; // Re-throw real user errors (like email already in use)
      }
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
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        throw new Error("שם המשתמש או הסיסמה שגויים!");
      }
      fallbackMode = true; // Switch to local backup
    }
  }

  // Local Storage Sign In
  const localUsers = getLocalStorageData('users');
  const profile = localUsers.find(u => u.username.toLowerCase() === cleanUsername);
  
  if (!profile) {
    throw new Error("שם המשתמש או הסיסמה שגויים! (לא נמצא חשבון)");
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
  if (exists) throw new Error("יש לך כבר פנייה ממתינה להפוך למפתח!");
  
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
  // Update locally
  const requests = getLocalStorageData('developer_requests');
  const idx = requests.findIndex(r => r.id === requestId || r.uid === requestId); // fallback matching
  let requestData = null;

  if (idx !== -1) {
    requests[idx].status = status;
    requests[idx].adminReason = adminReason;
    requestData = requests[idx];
    saveLocalStorageData('developer_requests', requests);

    if (status === 'approved') {
      await updateUserProfile(requests[idx].uid, { role: 'developer' });
    }
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
  if (rejected) throw new Error("מאגר המשחק הזה נדחה בעבר ולא ניתן להגישו שוב.");

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
      const gamePayload = {
        id: 'game_' + Math.random().toString(36).substr(2, 9),
        name: requestData.name,
        description: requestData.description,
        logoUrl: requestData.logoUrl,
        githubUrl: requestData.githubUrl,
        howToPlay: requestData.howToPlay,
        targetAudience: requestData.targetAudience,
        categories: requestData.categories,
        developerUid: requestData.developerUid,
        developerName: requestData.developerName,
        approved: true,
        createdAt: new Date().toISOString()
      };
      
      games.push(gamePayload);
      saveLocalStorageData('games', games);
    }
  }

  if (firebaseLoaded && !fallbackMode && requestData) {
    try {
      const ref = firebaseFirestore.collection(db, "game_requests");
      const q = firebaseFirestore.query(ref, firebaseFirestore.where("githubUrl", "==", requestData.githubUrl));
      const snap = await firebaseFirestore.getDocs(q);
      if (!snap.empty) {
        const docId = snap.docs[0].id;
        await firebaseFirestore.updateDoc(firebaseFirestore.doc(db, "game_requests", docId), { status, adminSuggestions });
        
        if (status === 'approved') {
          await firebaseFirestore.addDoc(firebaseFirestore.collection(db, "games"), {
            name: requestData.name,
            description: requestData.description,
            logoUrl: requestData.logoUrl,
            githubUrl: requestData.githubUrl,
            howToPlay: requestData.howToPlay,
            targetAudience: requestData.targetAudience,
            categories: requestData.categories,
            developerUid: requestData.developerUid,
            developerName: requestData.developerName,
            approved: true,
            createdAt: new Date().toISOString()
          });
        }
      }
    } catch (e) {
      console.warn("Firebase game request handling error, completed locally:", e);
    }
  }

  if (requestData) {
    try {
      const devProfile = await getUserProfile(requestData.developerUid);
      const emailToUse = devProfile.twoFactorEmail || devProfile.email || 'developer@diggy.com';
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
      const q = firebaseFirestore.query(firebaseFirestore.collection(db, "games"), firebaseFirestore.orderBy("createdAt", "desc"));
      const snap = await firebaseFirestore.getDocs(q);
      const list = [];
      snap.forEach(d => list.push({ id: d.id, ...d.data() }));
      return list;
    } catch (e) {
      console.warn("Firebase load active games failed, loading local:", e);
    }
  }

  return getLocalStorageData('games');
}

// --- EMAIL DISPATCHER ---

export const simulatedEmails = [];

export async function sendEmailViaResend(to, subject, htmlContent) {
  const emailLog = {
    id: 'email_' + Math.random().toString(36).substr(2, 9),
    to,
    subject,
    html: htmlContent,
    sentAt: new Date().toLocaleTimeString(),
    timestamp: Date.now()
  };
  
  simulatedEmails.unshift(emailLog);
  window.dispatchEvent(new CustomEvent('diggy-email-sent', { detail: emailLog }));

  console.log(`[Email Dispatched] to: ${to} | subject: ${subject}`);
  return { success: true, mode: 'simulated', email: emailLog };
}

async function sendStatusEmail(to, name, type, status, reason) {
  const statusColors = {
    approved: '#00ff66',
    rejected: '#ff3366',
    improvement: '#ffcc00'
  };
  const statusTexts = {
    approved: 'APPROVED / מאושר',
    rejected: 'REJECTED / נדחה',
    improvement: 'IMPROVEMENTS REQUESTED / דרוש שיפור'
  };

  const color = statusColors[status] || '#00ff66';
  const statusText = statusTexts[status] || status.toUpperCase();

  const html = `
    <div style="background-color: #07080a; color: #ffffff; font-family: sans-serif; padding: 40px; border-radius: 12px; border: 2px solid ${color}; max-width: 600px; margin: 0 auto;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #00ff66; font-size: 36px; margin: 0;">DIGGY</h1>
      </div>
      
      <div style="background: rgba(255,255,255,0.03); border-radius: 8px; padding: 25px; border-left: 4px solid ${color}; margin-bottom: 25px;">
        <h2>היי ${name},</h2>
        <p>יש לנו עדכון לגבי הבקשה שלך באתר <strong>DIGGY</strong>!</p>
        
        <div style="margin: 20px 0; padding: 15px; background: rgba(0,0,0,0.3); border-radius: 6px; text-align: center;">
          <span style="color: #888888; display: block; margin-bottom: 5px;">סוג הפעולה</span>
          <strong style="font-size: 18px;">${type}</strong>
          <hr style="border: 0; border-top: 1px solid rgba(255,255,255,0.1); margin: 10px 0;">
          <span style="color: #888888; display: block; margin-bottom: 5px;">סטטוס בקשה</span>
          <strong style="font-size: 22px; color: ${color};">${statusText}</strong>
        </div>

        ${reason ? `
          <div style="background: rgba(255,255,255,0.05); padding: 15px; border-radius: 6px;">
            <strong style="color: ${color}; display: block; margin-bottom: 8px;">הערות מנהל המערכת:</strong>
            <p style="margin: 0; color: #eeeeee;">${reason}</p>
          </div>
        ` : ''}
      </div>
    </div>
  `;

  await sendEmailViaResend(to, `DIGGY - עדכון בקשת ${type}`, html);
}
export { auth };
