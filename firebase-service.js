import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updatePassword
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc,
  deleteDoc,
  orderBy,
  limit
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Helper: Map username to virtual email for Firebase Auth
const getEmailForUsername = (username) => {
  return `${username.toLowerCase().trim()}@diggy.com`;
};

// --- AUTHENTICATION ---

/**
 * Register a new user
 * @param {string} username 6-12 characters
 * @param {string} password 6-12 characters
 */
export async function signUpUser(username, password) {
  const cleanUsername = username.trim();
  if (cleanUsername.length < 6 || cleanUsername.length > 12) {
    throw new Error("Username must be between 6 and 12 characters.");
  }
  if (password.length < 6 || password.length > 12) {
    throw new Error("Password must be between 6 and 12 characters.");
  }

  // Check if username already exists in firestore
  const usersRef = collection(db, "users");
  const q = query(usersRef, where("username", "==", cleanUsername));
  const querySnapshot = await getDocs(q);
  if (!querySnapshot.empty) {
    throw new Error("Username is already taken.");
  }

  const email = getEmailForUsername(cleanUsername);
  
  // Create user in Auth
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  // Create user profile document in Firestore
  const userDoc = {
    uid: user.uid,
    username: cleanUsername,
    email: email,
    role: 'player', // Default role
    twoFactorEnabled: false,
    twoFactorEmail: "",
    biometricsEnabled: false,
    biometricsCredential: null,
    customTheme: '#00ff66', // Default neon green
    favorites: [],
    recentlyPlayed: [],
    createdAt: new Date().toISOString()
  };

  await setDoc(doc(db, "users", user.uid), userDoc);
  return userDoc;
}

/**
 * Log in a user
 * @param {string} username
 * @param {string} password
 */
export async function logInUser(username, password) {
  const email = getEmailForUsername(username);
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;
  
  // Get user details
  const profile = await getUserProfile(user.uid);
  return profile;
}

/**
 * Log out current user
 */
export async function logOutUser() {
  await signOut(auth);
}

/**
 * Get user profile document
 * @param {string} uid 
 */
export async function getUserProfile(uid) {
  const docRef = doc(db, "users", uid);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return docSnap.data();
  }
  throw new Error("User profile not found.");
}

/**
 * Update user profile details
 */
export async function updateUserProfile(uid, data) {
  const docRef = doc(db, "users", uid);
  await updateDoc(docRef, data);
  return { uid, ...data };
}

/**
 * Change password
 */
export async function changeUserPassword(newPassword) {
  const user = auth.currentUser;
  if (!user) throw new Error("No authenticated user.");
  if (newPassword.length < 6 || newPassword.length > 12) {
    throw new Error("Password must be between 6 and 12 characters.");
  }
  await updatePassword(user, newPassword);
}

// --- DEVELOPER REQUEST WORKFLOW ---

/**
 * Submit request to become a developer
 */
export async function submitDeveloperRequest(uid, username, reason, contactEmail) {
  const requestRef = collection(db, "developer_requests");
  
  // Check if a pending request already exists
  const q = query(requestRef, where("uid", "==", uid), where("status", "==", "pending"));
  const existing = await getDocs(q);
  if (!existing.empty) {
    throw new Error("You already have a pending developer application.");
  }

  const requestDoc = {
    uid,
    username,
    reason,
    contactEmail,
    status: 'pending',
    createdAt: new Date().toISOString(),
    adminReason: ""
  };

  const docRef = await addDoc(requestRef, requestDoc);
  return { id: docRef.id, ...requestDoc };
}

/**
 * Get all developer requests (Admin only or verification done on admin client)
 */
export async function getDeveloperRequests() {
  const q = query(collection(db, "developer_requests"), orderBy("createdAt", "desc"));
  const querySnapshot = await getDocs(q);
  const requests = [];
  querySnapshot.forEach((doc) => {
    requests.push({ id: doc.id, ...doc.data() });
  });
  return requests;
}

/**
 * Approve or Reject developer request
 */
export async function handleDeveloperRequest(requestId, status, adminReason) {
  const docRef = doc(db, "developer_requests", requestId);
  const snap = await getDoc(docRef);
  if (!snap.exists()) throw new Error("Request not found");
  
  const requestData = snap.data();
  await updateDoc(docRef, { status, adminReason });

  if (status === 'approved') {
    // Update user's role to developer
    await updateUserProfile(requestData.uid, { role: 'developer' });
  }

  // Dispatch email notification via Resend
  await sendStatusEmail(requestData.contactEmail, requestData.username, 'Developer Role Application', status, adminReason);
  
  return { id: requestId, ...requestData, status, adminReason };
}

// --- GAME SUBMISSION WORKFLOW ---

/**
 * Submit a game for approval
 */
export async function submitGameRequest(gameData) {
  const requestsRef = collection(db, "game_requests");
  
  // Check if this game is already approved or blocked
  // If status is 'rejected', they cannot resubmit. We check game requests for rejected status with same GitHub link or Name
  const q = query(requestsRef, where("githubUrl", "==", gameData.githubUrl), where("status", "==", "rejected"));
  const rejectedCheck = await getDocs(q);
  if (!rejectedCheck.empty) {
    throw new Error("This game repository has been rejected and cannot be resubmitted.");
  }

  const requestDoc = {
    ...gameData,
    status: 'pending',
    createdAt: new Date().toISOString(),
    adminSuggestions: ""
  };

  const docRef = await addDoc(requestsRef, requestDoc);
  return { id: docRef.id, ...requestDoc };
}

/**
 * Get all developer's game requests
 */
export async function getDeveloperGameRequests(developerUid) {
  const q = query(collection(db, "game_requests"), where("developerUid", "==", developerUid), orderBy("createdAt", "desc"));
  const querySnapshot = await getDocs(q);
  const requests = [];
  querySnapshot.forEach((doc) => {
    requests.push({ id: doc.id, ...doc.data() });
  });
  return requests;
}

/**
 * Get all pending game requests (Admin)
 */
export async function getPendingGameRequests() {
  const q = query(collection(db, "game_requests"), orderBy("createdAt", "desc"));
  const querySnapshot = await getDocs(q);
  const requests = [];
  querySnapshot.forEach((doc) => {
    requests.push({ id: doc.id, ...doc.data() });
  });
  return requests;
}

/**
 * Approve, Reject, or Suggest Improvements for a game
 */
export async function handleGameRequest(requestId, status, adminSuggestions = "") {
  const requestRef = doc(db, "game_requests", requestId);
  const snap = await getDoc(requestRef);
  if (!snap.exists()) throw new Error("Game request not found");

  const requestData = snap.data();
  await updateDoc(requestRef, { status, adminSuggestions });

  if (status === 'approved') {
    // Check if game already exists in 'games' collection, if so update it, else create new
    const gamesRef = collection(db, "games");
    const gameQuery = query(gamesRef, where("requestDocId", "==", requestId));
    const gameSnap = await getDocs(gameQuery);
    
    const gamePayload = {
      name: requestData.name,
      description: requestData.description,
      logoUrl: requestData.logoUrl,
      githubUrl: requestData.githubUrl,
      howToPlay: requestData.howToPlay,
      targetAudience: requestData.targetAudience,
      categories: requestData.categories,
      developerUid: requestData.developerUid,
      developerName: requestData.developerName,
      requestDocId: requestId,
      updatedAt: new Date().toISOString()
    };

    if (gameSnap.empty) {
      gamePayload.createdAt = new Date().toISOString();
      await addDoc(gamesRef, gamePayload);
    } else {
      const existingDocId = gameSnap.docs[0].id;
      await updateDoc(doc(db, "games", existingDocId), gamePayload);
    }
  }

  // Get developer profile to email them if they have a contact email
  try {
    const devProfile = await getUserProfile(requestData.developerUid);
    const emailToUse = devProfile.twoFactorEmail || devProfile.email || 'developer@diggy.com';
    await sendStatusEmail(
      emailToUse, 
      requestData.developerName, 
      `Game Submission: ${requestData.name}`, 
      status, 
      adminSuggestions
    );
  } catch (err) {
    console.warn("Failed to send game update email:", err);
  }

  return { id: requestId, ...requestData, status, adminSuggestions };
}

/**
 * Update a game request (e.g. resubmitting after Suggestions for Improvement)
 */
export async function updateAndResubmitGameRequest(requestId, updatedData) {
  const requestRef = doc(db, "game_requests", requestId);
  const snap = await getDoc(requestRef);
  if (!snap.exists()) throw new Error("Game request not found");

  await updateDoc(requestRef, {
    ...updatedData,
    status: 'pending',
    adminSuggestions: "",
    createdAt: new Date().toISOString()
  });
}

/**
 * Direct publish game (Admin only - bypass requests)
 */
export async function directPublishGame(gameData) {
  const gamesRef = collection(db, "games");
  const gamePayload = {
    ...gameData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  const docRef = await addDoc(gamesRef, gamePayload);
  return { id: docRef.id, ...gamePayload };
}

/**
 * Get all approved/active games
 */
export async function getActiveGames() {
  const q = query(collection(db, "games"), orderBy("createdAt", "desc"));
  const querySnapshot = await getDocs(q);
  const games = [];
  querySnapshot.forEach((doc) => {
    games.push({ id: doc.id, ...doc.data() });
  });
  return games;
}

// --- EMAIL DISPATCHER (RESEND + CLIENT-SIDE SIMULATOR) ---

// In-memory array of simulated emails that developers can view in their console/sandbox for local debugging
export const simulatedEmails = [];

/**
 * Send an email using Resend API.
 * Falls back to local notification trigger + logs HTML on failure or missing token.
 */
export async function sendEmailViaResend(to, subject, htmlContent) {
  const emailLog = {
    id: 'email_' + Math.random().toString(36).substr(2, 9),
    to,
    subject,
    html: htmlContent,
    sentAt: new Date().toLocaleTimeString(),
    timestamp: Date.now()
  };
  
  // Store in simulated list so we can show it in the UI
  simulatedEmails.unshift(emailLog);
  // Dispatch custom browser event to trigger simulated inbox UI update
  window.dispatchEvent(new CustomEvent('diggy-email-sent', { detail: emailLog }));

  // Retrieve Resend API key from Firestore Config if set
  let resendApiKey = "";
  try {
    const configSnap = await getDoc(doc(db, "config", "resend"));
    if (configSnap.exists()) {
      resendApiKey = configSnap.data().apiKey;
    }
  } catch (e) {
    console.log("No remote resend config found. Using simulator mode.");
  }

  if (!resendApiKey) {
    console.log(`[Resend Simulator] Email sent to: ${to}\nSubject: ${subject}\nContent:`, htmlContent);
    return { success: true, mode: 'simulated', email: emailLog };
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'DIGGY Platform <onboarding@resend.dev>',
        to: [to],
        subject: subject,
        html: htmlContent
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Resend API Error: ${errText}`);
    }

    const data = await response.json();
    return { success: true, mode: 'api', data, email: emailLog };
  } catch (error) {
    console.error("[Resend API Error] Failed to send email via API. Falling back to simulator.", error);
    return { success: true, mode: 'simulated_fallback', error: error.message, email: emailLog };
  }
}

/**
 * Send role or game request updates via a beautifully styled HTML email
 */
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

  const isHebrew = true; // Designed for Israeli children

  const html = `
    <div style="background-color: #07080a; color: #ffffff; font-family: 'Outfit', 'Inter', sans-serif; padding: 40px; border-radius: 12px; border: 2px solid ${color}; max-width: 600px; margin: 0 auto; box-shadow: 0 0 20px rgba(0,255,102,0.1);">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #00ff66; font-size: 36px; margin: 0; letter-spacing: 2px; font-weight: 800; text-shadow: 0 0 10px rgba(0,255,102,0.5);">DIGGY</h1>
        <p style="color: #888888; font-size: 14px; margin: 5px 0 0 0;">The Ultimate Kids Gaming Arena</p>
      </div>
      
      <div style="background: rgba(255,255,255,0.03); border-radius: 8px; padding: 25px; border-left: 4px solid ${color}; margin-bottom: 25px;">
        <h2 style="color: #ffffff; margin-top: 0; font-size: 20px;">היי ${name},</h2>
        <p style="font-size: 16px; line-height: 1.6; color: #dddddd;">
          יש לנו עדכון לגבי הבקשה שלך באתר <strong>DIGGY</strong>!
        </p>
        
        <div style="margin: 20px 0; padding: 15px; background: rgba(0,0,0,0.3); border-radius: 6px; text-align: center;">
          <span style="font-size: 12px; text-transform: uppercase; color: #888888; display: block; margin-bottom: 5px;">סוג הפעולה</span>
          <strong style="font-size: 18px; color: #ffffff;">${type}</strong>
          <hr style="border: 0; border-top: 1px solid rgba(255,255,255,0.1); margin: 10px 0;">
          <span style="font-size: 12px; text-transform: uppercase; color: #888888; display: block; margin-bottom: 5px;">סטטוס בקשה</span>
          <strong style="font-size: 22px; color: ${color}; text-shadow: 0 0 8px ${color}80;">${statusText}</strong>
        </div>

        ${reason ? `
          <div style="background: rgba(255,255,255,0.05); padding: 15px; border-radius: 6px; margin-top: 15px;">
            <strong style="color: ${color}; display: block; margin-bottom: 8px; font-size: 14px;">הערות מנהל המערכת (Admin Notes):</strong>
            <p style="margin: 0; font-size: 15px; line-height: 1.5; color: #eeeeee;">${reason}</p>
          </div>
        ` : ''}
      </div>

      <div style="text-align: center; color: #666666; font-size: 12px; margin-top: 30px; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 20px;">
        <p>מכתב זה נשלח אוטומטית ממערכת DIGGY. נא לא להשיב למייל זה.</p>
        <p>&copy; ${new Date().getFullYear()} DIGGY Games. All rights reserved.</p>
      </div>
    </div>
  `;

  await sendEmailViaResend(to, `DIGGY - עדכון בקשת ${type}`, html);
}

// Export references for app.js
export { auth, db };
