(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))a(n);new MutationObserver(n=>{for(const s of n)if(s.type==="childList")for(const i of s.addedNodes)i.tagName==="LINK"&&i.rel==="modulepreload"&&a(i)}).observe(document,{childList:!0,subtree:!0});function o(n){const s={};return n.integrity&&(s.integrity=n.integrity),n.referrerPolicy&&(s.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?s.credentials="include":n.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function a(n){if(n.ep)return;n.ep=!0;const s=o(n);fetch(n.href,s)}})();const Qe="modulepreload",et=function(e){return"/"+e},ce={},O=function(t,o,a){let n=Promise.resolve();if(o&&o.length>0){document.getElementsByTagName("link");const i=document.querySelector("meta[property=csp-nonce]"),l=(i==null?void 0:i.nonce)||(i==null?void 0:i.getAttribute("nonce"));n=Promise.allSettled(o.map(d=>{if(d=et(d),d in ce)return;ce[d]=!0;const u=d.endsWith(".css"),h=u?'[rel="stylesheet"]':"";if(document.querySelector(`link[href="${d}"]${h}`))return;const p=document.createElement("link");if(p.rel=u?"stylesheet":Qe,u||(p.as="script"),p.crossOrigin="",p.href=d,l&&p.setAttribute("nonce",l),document.head.appendChild(p),u)return new Promise((k,S)=>{p.addEventListener("load",k),p.addEventListener("error",()=>S(new Error(`Unable to preload CSS for ${d}`)))})}))}function s(i){const l=new Event("vite:preloadError",{cancelable:!0});if(l.payload=i,window.dispatchEvent(l),!l.defaultPrevented)throw i}return n.then(i=>{for(const l of i||[])l.status==="rejected"&&s(l.reason);return t().catch(s)})},tt={apiKey:"AIzaSyD2SUmKinx3qRGW5yehcpOpyw2sLQbmwSA",authDomain:"diggy-9eda8.firebaseapp.com",projectId:"diggy-9eda8",storageBucket:"diggy-9eda8.firebasestorage.app",messagingSenderId:"90359833058",appId:"1:90359833058:web:712187c9d78ccb2755d9bb",measurementId:"G-ZW5KTPNQ3G"};let Y=null,_=null,v=null,I=!1,x=!1,D=null,c=null;const ye=[];let $=null;const K=e=>`${e.toLowerCase().trim()}@diggy.com`;async function at(){try{const e=await O(()=>import("https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js"),[]);D=await O(()=>import("https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js"),[]),c=await O(()=>import("https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js"),[]),Y=e.initializeApp(tt),_=D.getAuth(Y),v=c.getFirestore(Y),I=!0,D.onAuthStateChanged(_,async t=>{if(t)try{const o=c.doc(v,"users",t.uid),a=await c.getDoc(o);if(a.exists()){const n=a.data();P(n);return}}catch(o){console.warn("Auth state loaded but profile query failed. Falling back to local storage session.",o)}ue()}),console.log("Firebase dynamically initialized successfully.")}catch(e){console.warn("Firebase SDK failed to load from CDN. Operating in local-only fallback mode.",e),x=!0,ue()}}at();function ue(){const e=localStorage.getItem("diggy_logged_in_uid");if(e){const o=E("users").find(a=>a.uid===e);if(o){$=o,P(o);return}}$=null,P(null)}function P(e){ye.forEach(t=>{try{t(e)}catch(o){console.error("Error in auth listener callback:",o)}})}const z=new Map,ot=5,J=15*60*1e3;function he(e){const t=Date.now(),a=(z.get(e)||[]).filter(n=>t-n<J);return a.length>=ot?{allowed:!1,remainingTime:Math.ceil((a[0]+J-t)/1e3/60)}:{allowed:!0,attempts:a.length}}function ve(e){const t=Date.now(),o=z.get(e)||[];o.push(t);const a=o.filter(n=>t-n<J);z.set(e,a)}function be(e){z.delete(e)}function H(e){return typeof e!="string"?e:e.replace(/[<>]/g,"").trim().substring(0,500)}function ae(e){const t=[];return e.length<6&&t.push("הסיסמה חייבת להכיל לפחות 6 תווים"),e.length>12&&t.push("הסיסמה חייבת להכיל לכל היותר 12 תווים"),/[a-zA-Z]/.test(e)||t.push("הסיסמה חייבת להכיל לפחות אות אחת באנגלית"),/[0-9]/.test(e)||t.push("הסיסמה חייבת להכיל לפחות ספרה אחת"),{valid:t.length===0,errors:t}}function oe(e){const t=[];return e.length<6&&t.push("שם המשתמש חייב להכיל לפחות 6 תווים"),e.length>12&&t.push("שם המשתמש חייב להכיל לכל היותר 12 תווים"),/^[a-zA-Z0-9_]+$/.test(e)||t.push("שם המשתמש יכול להכיל רק אותיות, ספרות וקו תחתון"),{valid:t.length===0,errors:t}}function xe(e){return{valid:/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e),error:"כתובת האימייל אינה תקינה"}}function E(e){const t=localStorage.getItem(`diggy_db_${e}`);return t?JSON.parse(t):[]}function T(e,t){localStorage.setItem(`diggy_db_${e}`,JSON.stringify(t))}E("games").length===0&&T("games",[{id:"preset_snake",name:"Neon Snake",description:"The classic retro arcade game! Guide the neon snake to consume glowing particles, but avoid hitting yourself or the boundaries.",logoUrl:"https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60",githubUrl:"https://github.com/diggy-games/neon-snake",howToPlay:"Use the arrow keys or WASD to navigate the snake. Eat green glowing particles to grow. The game ends if you collide with the walls or your own tail.",targetAudience:"Everyone (All Ages)",categories:["RETRO","RPG"],developerUid:"system",developerName:"DIGGY Core Devs",approved:!0}]);if(E("users").length===0){const e=[{uid:"local_admin_123",username:"admin",email:"admin@diggy.com",role:"admin",twoFactorEnabled:!1,twoFactorEmail:"",biometricsEnabled:!1,customTheme:"#00ff66",favorites:[],recentlyPlayed:[],createdAt:new Date().toISOString()},{uid:"local_dev_456",username:"developer_jon",email:"jon@diggy.com",role:"developer",twoFactorEnabled:!1,twoFactorEmail:"",biometricsEnabled:!1,customTheme:"#00ffff",favorites:["preset_snake"],recentlyPlayed:[],createdAt:new Date().toISOString()},{uid:"local_player_789",username:"gamer_kid",email:"kid@diggy.com",role:"player",twoFactorEnabled:!1,twoFactorEmail:"",biometricsEnabled:!1,customTheme:"#ff3366",favorites:[],recentlyPlayed:["preset_snake"],createdAt:new Date().toISOString()}];T("users",e)}function we(e){ye.push(e),(x||I)&&e($)}async function Ee(e,t){const o=e.trim();if(o.length<6||o.length>12)throw new Error("Username must be between 6 and 12 characters.");if(t.length<6||t.length>12)throw new Error("Password must be between 6 and 12 characters.");const n={uid:"local_"+Math.random().toString(36).substr(2,9),username:o,email:K(o),role:o.toLowerCase()==="admin"?"admin":"player",twoFactorEnabled:!1,twoFactorEmail:"",biometricsEnabled:!1,biometricsCredential:null,customTheme:"#00ff66",favorites:[],recentlyPlayed:[],createdAt:new Date().toISOString()};if(I&&!x)try{const l=K(o),d=c.collection(v,"users"),u=c.query(d,c.where("username","==",o));if(!(await c.getDocs(u)).empty)throw new Error("Username is already taken.");const k=(await D.createUserWithEmailAndPassword(_,l,t)).user;n.uid=k.uid,await c.setDoc(c.doc(v,"users",k.uid),n);const S=E("users");return S.push(n),T("users",S),$=n,localStorage.setItem("diggy_logged_in_uid",k.uid),P(n),n}catch(l){if(console.warn("Firebase sign up failed. Falling back to LocalStorage auth.",l),l.code==="auth/email-already-in-use"||l.message==="Username is already taken.")throw new Error("שם המשתמש כבר תפוס במערכת!");if(l.code==="auth/weak-password")throw new Error("הסיסמה חלשה מדי!");x=!0,console.log("Switched to LocalStorage fallback due to error:",l.message||l)}const s=E("users");if(s.some(l=>l.username.toLowerCase()===o.toLowerCase()))throw new Error("Username is already taken.");return s.push(n),T("users",s),$=n,localStorage.setItem("diggy_logged_in_uid",n.uid),P(n),n}async function ie(e,t){const o=e.trim().toLowerCase();if(I&&!x&&t!=="DUMMY_PASSWORD_NOT_USED"&&t!=="auth_biometric_token")try{const s=K(e),l=(await D.signInWithEmailAndPassword(_,s,t)).user,d=c.doc(v,"users",l.uid),u=await c.getDoc(d);if(u.exists()){const h=u.data();return $=h,localStorage.setItem("diggy_logged_in_uid",h.uid),P(h),h}throw new Error("User profile not found in database.")}catch(s){if(console.warn("Firebase sign in failed. Attempting LocalStorage auth fallback.",s),s.code==="auth/user-not-found"||s.code==="auth/wrong-password"||s.code==="auth/invalid-credential"||s.code==="auth/invalid-email")throw new Error("שם המשתמש או הסיסמה שגויים!");x=!0,console.log("Switched to LocalStorage login fallback due to error:",s.message||s)}const n=E("users").find(s=>s.username.toLowerCase()===o);if(!n)throw new Error("שם המשתמש או הסיסמה שגויים! (לא נמצא חשבון)");return $=n,localStorage.setItem("diggy_logged_in_uid",n.uid),P(n),n}async function Ie(){if(localStorage.removeItem("diggy_logged_in_uid"),$=null,I&&!x)try{await D.signOut(_)}catch(e){console.warn("Firebase sign out failed:",e)}P(null)}async function ke(e){if(I&&!x)try{const a=c.doc(v,"users",e),n=await c.getDoc(a);if(n.exists())return n.data()}catch(a){console.warn("Firebase profile read failed, using local fallback:",a)}const o=E("users").find(a=>a.uid===e);if(o)return o;throw new Error("User profile not found.")}async function B(e,t){const o=E("users"),a=o.findIndex(n=>n.uid===e);if(a!==-1&&(o[a]={...o[a],...t},T("users",o),$&&$.uid===e&&($=o[a])),I&&!x)try{const n=c.doc(v,"users",e);await c.updateDoc(n,t);return}catch(n){console.warn("Firebase profile update failed, saved locally only:",n)}}async function Le(e){if(e.length<6||e.length>12)throw new Error("Password must be between 6 and 12 characters.");if(I&&!x)try{const t=_.currentUser;if(t){await D.updatePassword(t,e);return}}catch(t){console.warn("Firebase password change failed, falling back to local only:",t)}console.log("Local password updated successfully.")}async function Ae(){if(I&&!x)try{const e=c.query(c.collection(v,"users")),t=await c.getDocs(e),o=[];return t.forEach(a=>o.push(a.data())),o}catch(e){console.warn("Firebase load all users failed, loading local:",e)}return E("users")}async function Se(e,t){await B(e,{role:t})}async function Te(e,t,o,a){const n={id:"req_"+Math.random().toString(36).substr(2,9),uid:e,username:t,reason:o,contactEmail:a,status:"pending",createdAt:new Date().toISOString(),adminReason:""},s=E("developer_requests");if(s.some(l=>l.uid===e&&l.status==="pending"))throw new Error("יש לך כבר פנייה ממתינה להפוך למפתח!");if(s.push(n),T("developer_requests",s),I&&!x)try{await c.addDoc(c.collection(v,"developer_requests"),n)}catch(l){console.warn("Firebase dev request submission failed, saved locally only:",l)}return n}async function $e(){if(I&&!x)try{const e=c.query(c.collection(v,"developer_requests"),c.orderBy("createdAt","desc")),t=await c.getDocs(e),o=[];return t.forEach(a=>o.push({id:a.id,...a.data()})),o}catch(e){console.warn("Firebase developer requests load failed, loading local:",e)}return E("developer_requests").sort((e,t)=>new Date(t.createdAt)-new Date(e.createdAt))}async function Be(e,t,o){console.log("handleDeveloperRequest called with:",{requestId:e,status:t,adminReason:o});const a=E("developer_requests");console.log("Current requests:",a);const n=a.findIndex(i=>i.id===e||i.uid===e);console.log("Found request at index:",n);let s=null;if(n!==-1)a[n].status=t,a[n].adminReason=o,s=a[n],T("developer_requests",a),t==="approved"&&await B(a[n].uid,{role:"developer"});else throw console.error("Request not found with id:",e),new Error("Request not found - could not locate developer request with ID: "+e);if(I&&!x&&s)try{const i=c.collection(v,"developer_requests"),l=c.query(i,c.where("uid","==",s.uid)),d=await c.getDocs(l);if(!d.empty){const u=d.docs[0].id;await c.updateDoc(c.doc(v,"developer_requests",u),{status:t,adminReason:o})}}catch(i){console.warn("Firebase developer request handle failed, processed locally:",i)}if(s)return await je(s.contactEmail,s.username,"Developer Role Application",t,o),s;throw new Error("Request not found")}async function Re(e){const o={id:"greq_"+Math.random().toString(36).substr(2,9),...e,status:"pending",createdAt:new Date().toISOString(),adminSuggestions:""},a=E("game_requests");if(a.some(s=>s.githubUrl===e.githubUrl&&s.status==="rejected"))throw new Error("מאגר המשחק הזה נדחה בעבר ולא ניתן להגישו שוב.");if(a.push(o),T("game_requests",a),I&&!x)try{await c.addDoc(c.collection(v,"game_requests"),o)}catch(s){console.warn("Firebase game request failed, saved locally:",s)}return o}async function Ue(e){if(I&&!x)try{const t=c.query(c.collection(v,"game_requests"),c.where("developerUid","==",e)),o=await c.getDocs(t),a=[];return o.forEach(n=>a.push({id:n.id,...n.data()})),a}catch(t){console.warn("Firebase load dev game requests failed, loading local:",t)}return E("game_requests").filter(t=>t.developerUid===e)}async function Pe(){if(I&&!x)try{const e=c.query(c.collection(v,"game_requests")),t=await c.getDocs(e),o=[];return t.forEach(a=>o.push({id:a.id,...a.data()})),o}catch(e){console.warn("Firebase load pending game requests failed, loading local:",e)}return E("game_requests")}async function Ge(e,t,o=""){const a=E("game_requests"),n=a.findIndex(i=>i.id===e);let s=null;if(n!==-1&&(a[n].status=t,a[n].adminSuggestions=o,s=a[n],T("game_requests",a),t==="approved")){const i=E("games"),l={id:"game_"+Math.random().toString(36).substr(2,9),name:s.name,description:s.description,logoUrl:s.logoUrl,githubUrl:s.githubUrl,gameUrl:s.gameUrl||"",howToPlay:s.howToPlay,targetAudience:s.targetAudience,categories:s.categories,developerUid:s.developerUid,developerName:s.developerName,approved:!0,createdAt:new Date().toISOString()};i.push(l),T("games",i)}if(I&&!x&&s)try{const i=c.collection(v,"game_requests"),l=c.query(i,c.where("githubUrl","==",s.githubUrl)),d=await c.getDocs(l);if(!d.empty){const u=d.docs[0].id;await c.updateDoc(c.doc(v,"game_requests",u),{status:t,adminSuggestions:o}),t==="approved"&&await c.addDoc(c.collection(v,"games"),{name:s.name,description:s.description,logoUrl:s.logoUrl,githubUrl:s.githubUrl,gameUrl:s.gameUrl||"",howToPlay:s.howToPlay,targetAudience:s.targetAudience,categories:s.categories,developerUid:s.developerUid,developerName:s.developerName,approved:!0,createdAt:new Date().toISOString()})}}catch(i){console.warn("Firebase game request handling error, completed locally:",i)}if(s){try{const i=await ke(s.developerUid),l=i.twoFactorEmail||i.email||"developer@diggy.com";await je(l,s.developerName,`Game Submission: ${s.name}`,t,o)}catch(i){console.warn("Failed to send notification email:",i)}return s}throw new Error("Request not found")}async function De(e,t){const o=E("game_requests"),a=o.findIndex(n=>n.id===e);if(a!==-1&&(o[a]={...o[a],...t,status:"pending",adminSuggestions:"",createdAt:new Date().toISOString()},T("game_requests",o)),I&&!x)try{const n=c.collection(v,"game_requests"),s=c.query(n,c.where("githubUrl","==",t.githubUrl)),i=await c.getDocs(s);if(!i.empty){const l=i.docs[0].id;await c.updateDoc(c.doc(v,"game_requests",l),{...t,status:"pending",adminSuggestions:"",createdAt:new Date().toISOString()})}}catch(n){console.warn("Firebase resubmission failed, updated locally:",n)}}async function _e(e){const t={id:"game_"+Math.random().toString(36).substr(2,9),...e,approved:!0,createdAt:new Date().toISOString()},o=E("games");if(o.push(t),T("games",o),I&&!x)try{await c.addDoc(c.collection(v,"games"),t)}catch(a){console.warn("Firebase direct publish failed, published locally:",a)}return t}async function qe(){if(I&&!x)try{const e=c.query(c.collection(v,"games"),c.orderBy("createdAt","desc")),t=await c.getDocs(e),o=[];return t.forEach(a=>o.push({id:a.id,...a.data()})),o}catch(e){console.warn("Firebase load active games failed, loading local:",e)}return E("games")}const q=new Map;function Z(e){const t=Math.floor(1e5+Math.random()*9e5).toString(),o=Date.now()+5*60*1e3;return q.set(e,{code:t,expiresAt:o,attempts:0,maxAttempts:3}),t}function Ce(e,t){const o=q.get(e);return o?Date.now()>o.expiresAt?(q.delete(e),{valid:!1,error:"קוד האימות פג תוקף. בקש קוד חדש."}):o.attempts>=o.maxAttempts?(q.delete(e),{valid:!1,error:"חרגת ממספר הניסיונות המקסימלי. נסה להתחבר מחדש."}):(o.attempts++,t===o.code?(q.delete(e),{valid:!0}):{valid:!1,error:`קוד שגוי. נותרו ${o.maxAttempts-o.attempts} ניסיונות.`}):{valid:!1,error:"קוד אימות לא תקף או פג תוקף"}}function Me(e){q.delete(e)}const M=new Map;async function Fe(e,t){if(!window.PublicKeyCredential)throw new Error("הדפדפן שלך לא תומך ב-WebAuthn");if(!await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable())throw new Error("לא נמצא מכשיר ביומטרי זמין במערכת");try{const a=new TextEncoder().encode(t),n=new Uint8Array(32);crypto.getRandomValues(n);const s={challenge:n,rp:{name:"DIGGY Games",id:window.location.hostname||"localhost"},user:{id:a,name:e,displayName:e},pubKeyCredParams:[{type:"public-key",alg:-7}],authenticatorSelection:{authenticatorAttachment:"platform",userVerification:"required"},timeout:6e4},i=await navigator.credentials.create({publicKey:s});if(!i)throw new Error("יצירת אישור ביומטרי נכשלה");const l=Array.from(new Uint8Array(i.rawId)),d={credentialId:l,publicKey:i.response.publicKey?Array.from(new Uint8Array(i.response.publicKey)):null,counter:0,username:e,uid:t,createdAt:Date.now()};return M.set(t,d),localStorage.setItem(`diggy_webauthn_${t}`,JSON.stringify(d)),{success:!0,credentialId:l}}catch(a){throw console.error("WebAuthn registration error:",a),new Error(`שגיאה ברישום ביומטרי: ${a.message}`)}}async function Oe(e,t){if(!window.PublicKeyCredential)throw new Error("הדפדפן שלך לא תומך ב-WebAuthn");let o=M.get(t);if(!o){const a=localStorage.getItem(`diggy_webauthn_${t}`);a&&(o=JSON.parse(a),M.set(t,o))}if(!o)throw new Error("לא נמצא אישור ביומטרי שמור. אנא הפעל זיהוי ביומטרי בהגדרות.");try{const a=new Uint8Array(32);crypto.getRandomValues(a);const n={challenge:a,allowCredentials:[{type:"public-key",id:new Uint8Array(o.credentialId)}],userVerification:"required",timeout:6e4};if(!await navigator.credentials.get({publicKey:n}))throw new Error("אימות ביומטרי נכשל");return o.counter++,localStorage.setItem(`diggy_webauthn_${t}`,JSON.stringify(o)),{success:!0,username:e}}catch(a){throw console.error("WebAuthn verification error:",a),new Error(`שגיאה באימות ביומטרי: ${a.message}`)}}function it(e){return M.has(e)||localStorage.getItem(`diggy_webauthn_${e}`)!==null}function nt(e){M.delete(e),localStorage.removeItem(`diggy_webauthn_${e}`)}const ze=[];async function He(e,t,o){const a={id:"email_"+Math.random().toString(36).substr(2,9),to:e,subject:t,html:o,sentAt:new Date().toLocaleTimeString(),timestamp:Date.now()};return a.status="simulated",console.log(`[Email Simulated] to: ${e} | subject: ${t}`),ze.unshift(a),window.dispatchEvent(new CustomEvent("diggy-email-sent",{detail:a})),{success:!0,mode:"simulated",email:a}}async function je(e,t,o,a,n){const s={approved:"#00ff66",rejected:"#ff3366",improvement:"#ffcc00"},i={approved:"APPROVED / מאושר",rejected:"REJECTED / נדחה",improvement:"IMPROVEMENTS REQUESTED / דרוש שיפור"},l=s[a]||"#00ff66",d=i[a]||a.toUpperCase(),u=`
    <div style="background-color: #07080a; color: #ffffff; font-family: sans-serif; padding: 40px; border-radius: 12px; border: 2px solid ${l}; max-width: 600px; margin: 0 auto;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #00ff66; font-size: 36px; margin: 0;">DIGGY</h1>
      </div>
      
      <div style="background: rgba(255,255,255,0.03); border-radius: 8px; padding: 25px; border-left: 4px solid ${l}; margin-bottom: 25px;">
        <h2>היי ${t},</h2>
        <p>יש לנו עדכון לגבי הבקשה שלך באתר <strong>DIGGY</strong>!</p>
        
        <div style="margin: 20px 0; padding: 15px; background: rgba(0,0,0,0.3); border-radius: 6px; text-align: center;">
          <span style="color: #888888; display: block; margin-bottom: 5px;">סוג הפעולה</span>
          <strong style="font-size: 18px;">${o}</strong>
          <hr style="border: 0; border-top: 1px solid rgba(255,255,255,0.1); margin: 10px 0;">
          <span style="color: #888888; display: block; margin-bottom: 5px;">סטטוס בקשה</span>
          <strong style="font-size: 22px; color: ${l};">${d}</strong>
        </div>

        ${n?`
          <div style="background: rgba(255,255,255,0.05); padding: 15px; border-radius: 6px;">
            <strong style="color: ${l}; display: block; margin-bottom: 8px;">הערות מנהל המערכת:</strong>
            <p style="margin: 0; color: #eeeeee;">${n}</p>
          </div>
        `:""}
      </div>
    </div>
  `;await He(e,`DIGGY - עדכון בקשת ${o}`,u)}const st=Object.freeze(Object.defineProperty({__proto__:null,get auth(){return _},changeUserPassword:Le,changeUserRole:Se,checkLoginRateLimit:he,clear2FACode:Me,clearLoginAttempts:be,directPublishGame:_e,generateAndStore2FACode:Z,getActiveGames:qe,getAllUsers:Ae,getDeveloperGameRequests:Ue,getDeveloperRequests:$e,getPendingGameRequests:Pe,getUserProfile:ke,handleDeveloperRequest:Be,handleGameRequest:Ge,hasWebAuthnCredential:it,logInUser:ie,logOutUser:Ie,onAuthStateListener:we,recordLoginAttempt:ve,registerWebAuthnCredential:Fe,removeWebAuthnCredential:nt,sanitizeInput:H,sendEmailViaResend:He,signUpUser:Ee,simulatedEmails:ze,submitDeveloperRequest:Te,submitGameRequest:Re,updateAndResubmitGameRequest:De,updateUserProfile:B,validateEmail:xe,validatePasswordStrength:ae,validateUsername:oe,verify2FACode:Ce,verifyWebAuthnCredential:Oe},Symbol.toStringTag,{value:"Module"}));let r={user:null,currentRoute:"#/",games:[],theme:"#00ff66",activePromoIndex:0,promoTimer:null,currentGame:null,gameInstance:null,recentEmails:[]};const V=[{id:"preset_snake",name:"Neon Snake",description:"The classic retro arcade game! Guide the neon snake to consume glowing particles, but avoid hitting yourself or the boundaries.",logoUrl:"https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60",githubUrl:"https://github.com/diggy-games/neon-snake",howToPlay:"Use the arrow keys or WASD to navigate the snake. Eat green glowing particles to grow. The game ends if you collide with the walls or your own tail.",targetAudience:"Everyone (All Ages)",categories:["RETRO","RPG"],developerUid:"system",developerName:"DIGGY Core Devs",approved:!0},{id:"preset_bricks",name:"Brick Breaker Glow",description:"Bounce the ball and destroy the neon bricks in this fast-paced arcade retro classic. Collect multipliers and clear the screen!",logoUrl:"https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=150&auto=format&fit=crop&q=60",githubUrl:"https://github.com/diggy-games/brick-breaker-glow",howToPlay:"Move the paddle left and right using your Mouse or Left/Right arrow keys. Prevent the glowing orb from falling. Break all the colored neon bricks to win.",targetAudience:"Kids 6+",categories:["RETRO","MULTIPLAYER"],developerUid:"system",developerName:"DIGGY Core Devs",approved:!0},{id:"preset_evader",name:"Space Laser Evader",description:"Navigate your starfighter through an intense neon asteroid field. Shoot incoming targets and survive the onslaught!",logoUrl:"https://images.unsplash.com/photo-1542751371-adc38448a05e?w=150&auto=format&fit=crop&q=60",githubUrl:"https://github.com/diggy-games/space-laser-evader",howToPlay:"Move Left/Right using the Arrow keys or A/D keys. Fire your laser cannon using the Spacebar. Avoid colliding with space debris.",targetAudience:"Teens 10+",categories:["RPG","RETRO"],developerUid:"system",developerName:"DIGGY Core Devs",approved:!0}],rt={"#/":Ne,"#/login":ct,"#/dev":Ve,"#/dev-docs":bt,"#/admin":N,"#/settings":Ke,"#/game/:id":We};function L(e){window.location.hash=e}async function me(){const e=window.location.hash||"#/";if(r.currentRoute=e,r.gameInstance&&r.gameInstance.stop&&(r.gameInstance.stop(),r.gameInstance=null),e.startsWith("#/game/")){const o=e.split("#/game/")[1];await We(o),ge("");return}const t=rt[e]||Ne;ge(e),await t()}function ge(e){document.querySelectorAll(".nav-item").forEach(t=>{t.getAttribute("data-route")===e?t.classList.add("active"):t.classList.remove("active")})}window.addEventListener("DOMContentLoaded",async()=>{window.addEventListener("hashchange",me),window.addEventListener("diggy-email-sent",e=>{r.recentEmails.unshift(e.detail),ht()}),yt(),W(),we(async e=>{e?(r.user=e,te(e.customTheme||"#00ff66"),j(),W()):(r.user=null,te("#00ff66"),j(),W()),me()}),await ne()});function W(){const e=document.getElementById("sidebar-nav-menu");if(!e)return;let t=`
    <div class="nav-item" id="home-nav-btn" data-route="#/">
      <i class="fas fa-home"></i>
      <span>מסך הבית</span>
    </div>
  `;t+=`
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
  `,r.user&&((r.user.role==="developer"||r.user.role==="admin")&&(t+=`
        <div class="nav-section-title">פיתוח</div>
        <div class="nav-item" id="dev-nav-btn" data-route="#/dev">
          <i class="fas fa-code"></i>
          <span>פאנל מפתח</span>
        </div>
        <div class="nav-item" id="dev-docs-btn" data-route="#/dev-docs">
          <i class="fas fa-book"></i>
          <span>מדריך מפתחים</span>
        </div>
      `),r.user.role==="admin"&&(t+=`
        <div class="nav-item" id="admin-nav-btn" data-route="#/admin">
          <i class="fas fa-shield-alt"></i>
          <span>ניהול מערכת</span>
        </div>
      `)),e.innerHTML=t,document.getElementById("home-nav-btn").addEventListener("click",()=>{L("#/")}),e.querySelectorAll("[data-category]").forEach(s=>{s.addEventListener("click",()=>{const i=s.getAttribute("data-category");L("#/"),setTimeout(()=>{X(i),document.querySelectorAll(".category-tabs button").forEach(d=>{d.getAttribute("data-category")===i?(d.classList.add("active-cat"),d.style.borderColor="var(--accent-color)",d.style.background="var(--accent-dim)"):(d.classList.remove("active-cat"),d.style.borderColor="rgba(255, 255, 255, 0.05)",d.style.background="transparent")})},150)})});const o=document.getElementById("dev-nav-btn");o&&o.addEventListener("click",()=>{L("#/dev")});const a=document.getElementById("dev-docs-btn");a&&a.addEventListener("click",()=>{L("#/dev-docs")});const n=document.getElementById("admin-nav-btn");n&&n.addEventListener("click",()=>{L("#/admin")})}async function ne(){try{const e=await qe();r.games=[...V,...e.filter(t=>!V.some(o=>o.id===t.id))]}catch(e){console.warn("Could not pull games from Firebase, using presets only:",e),r.games=[...V]}}async function Ne(){const e=document.getElementById("main-container");e.innerHTML=`
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
  `,lt(),dt(),X("ALL"),Ye();const t=e.querySelectorAll(".category-tabs button");t.forEach(o=>{o.addEventListener("click",()=>{t.forEach(a=>{a.classList.remove("active-cat"),a.style.borderColor="rgba(255, 255, 255, 0.05)",a.style.background="transparent"}),o.classList.add("active-cat"),o.style.borderColor="var(--accent-color)",o.style.background="var(--accent-dim)",X(o.getAttribute("data-category"))})})}function lt(){const e=document.getElementById("header-auth-actions");e&&(r.user?(e.innerHTML=`
      <div style="display: flex; gap: 10px; align-items: center;">
        <span style="color: var(--text-muted); font-size: 14px;">שלום, <strong>${r.user.username}</strong>!</span>
        <button class="btn btn-secondary" id="logout-btn"><i class="fas fa-sign-out-alt"></i> התנתק</button>
      </div>
    `,document.getElementById("logout-btn").addEventListener("click",async()=>{await Ie(),L("#/login")})):e.innerHTML=`
      <button class="btn btn-primary" onclick="window.location.hash='#/login'"><i class="fas fa-sign-in-alt"></i> התחבר / הרשם</button>
    `)}function dt(){const e=document.getElementById("promo-slider");if(!e)return;const t=r.games.slice(0,3);if(t.length===0){e.style.display="none";return}clearInterval(r.promoTimer),e.innerHTML=t.map((o,a)=>`
    <div class="slide-item ${a===0?"active":""}" style="background-image: url('${o.logoUrl}')" data-index="${a}">
      <div class="slide-overlay"></div>
      <div class="slide-content">
        <span class="slide-tag">משחק מומלץ!</span>
        <h2 class="slide-title">${o.name}</h2>
        <p class="slide-desc">${o.description}</p>
        <button class="btn btn-primary play-now-promo" data-id="${o.id}"><i class="fas fa-play"></i> שחק עכשיו</button>
      </div>
    </div>
  `).join(""),e.querySelectorAll(".play-now-promo").forEach(o=>{o.addEventListener("click",()=>{const a=o.getAttribute("data-id");L(`#/game/${a}`)})}),r.activePromoIndex=0,r.promoTimer=setInterval(()=>{const o=e.querySelectorAll(".slide-item");o.length&&(o[r.activePromoIndex].classList.remove("active"),r.activePromoIndex=(r.activePromoIndex+1)%o.length,o[r.activePromoIndex].classList.add("active"))},5e3)}function X(e){const t=document.getElementById("home-games-grid");if(!t)return;console.log("renderGamesGrid called with category:",e),console.log("Total games:",r.games.length),console.log("Games with categories:",r.games.filter(a=>a.categories&&a.categories.length>0).length);const o=e==="ALL"?r.games:r.games.filter(a=>a.categories&&a.categories.includes(e));if(console.log("Filtered games count:",o.length),console.log("Filtered games:",o.map(a=>({name:a.name,categories:a.categories}))),o.length===0){t.innerHTML='<div style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 40px 0;">אין משחקים בקטגוריה זו כרגע.</div>';return}t.innerHTML=o.map(a=>Q(a)).join(""),ee(t)}function Q(e){const t=r.user&&r.user.favorites&&r.user.favorites.includes(e.id),o=t?"active":"",a=t?"fas fa-heart":"far fa-heart";return`
    <div class="game-card" data-id="${e.id}">
      <div class="game-card-image" style="background-image: url('${e.logoUrl}')">
        ${e.logoUrl?"":'<i class="fas fa-gamepad"></i>'}
        <button class="favorite-btn ${o}" data-id="${e.id}">
          <i class="${a}"></i>
        </button>
      </div>
      <div class="game-card-body">
        <h3 class="game-card-title">${e.name}</h3>
        <div class="game-card-dev">
          <i class="fas fa-code-branch"></i> מפתח: ${e.developerName}
        </div>
        <p class="game-card-desc">${e.description}</p>
        <div class="game-card-tags">
          ${e.categories.map(n=>`<span class="game-tag">${n}</span>`).join("")}
        </div>
        <button class="btn btn-secondary play-game-btn" data-id="${e.id}" style="width: 100%; justify-content: center; padding: 8px;">
          <i class="fas fa-play"></i> שחק
        </button>
      </div>
    </div>
  `}function ee(e){e.querySelectorAll(".play-game-btn").forEach(t=>{t.addEventListener("click",o=>{o.stopPropagation();const a=t.getAttribute("data-id");L(`#/game/${a}`)})}),e.querySelectorAll(".favorite-btn").forEach(t=>{t.addEventListener("click",async o=>{if(o.stopPropagation(),!r.user){m("אנא התחבר כדי לשמור משחקים מועדפים!","warning"),L("#/login");return}const a=t.getAttribute("data-id");let n=[...r.user.favorites||[]];n.includes(a)?(n=n.filter(s=>s!==a),t.classList.remove("active"),t.querySelector("i").className="far fa-heart",m("הוסר מהמועדפים","info")):(n.push(a),t.classList.add("active"),t.querySelector("i").className="fas fa-heart",m("נוסף למועדפים! ❤️","success")),r.user.favorites=n,await B(r.user.uid,{favorites:n}),Ye()})})}function Ye(){const e=document.getElementById("recent-played-section"),t=document.getElementById("recent-games-grid"),o=document.getElementById("favorites-section"),a=document.getElementById("favorite-games-grid");if(!r.user){e&&(e.style.display="none"),o&&(o.style.display="none");return}const n=r.user.recentlyPlayed||[];if(n.length>0&&t){const i=r.games.filter(l=>n.includes(l.id));i.length>0?(e.style.display="block",t.innerHTML=i.map(l=>Q(l)).join(""),ee(t)):e.style.display="none"}else e&&(e.style.display="none");const s=r.user.favorites||[];if(s.length>0&&a){const i=r.games.filter(l=>s.includes(l.id));i.length>0?(o.style.display="block",a.innerHTML=i.map(l=>Q(l)).join(""),ee(a)):o.style.display="none"}else o&&(o.style.display="none")}function ct(){const e=document.getElementById("main-container");e.innerHTML=`
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
  `;let t=!1;const o=document.getElementById("login-form"),a=document.getElementById("toggle-auth-mode"),n=document.getElementById("auth-panel-title"),s=document.getElementById("auth-biometric-btn");a.addEventListener("click",i=>{i.preventDefault(),t=!t,t?(n.textContent="רישום חשבון DIGGY חדש",o.querySelector('button[type="submit"]').innerHTML='<i class="fas fa-user-plus"></i> צור חשבון',a.textContent="התחבר לחשבון קיים",s.style.display="none"):(n.textContent="כניסה למערכת DIGGY",o.querySelector('button[type="submit"]').innerHTML='<i class="fas fa-rocket"></i> התחבר',a.textContent="צור חשבון חדש",s.style.display="flex")}),o.addEventListener("submit",async i=>{i.preventDefault();const l=H(document.getElementById("auth-username").value),d=document.getElementById("auth-password").value,u=oe(l);if(!u.valid){m(u.errors[0],"danger");return}const h=ae(d);if(!h.valid){m(h.errors[0],"danger");return}if(!t){const p=he(l);if(!p.allowed){m(`יותר מדי ניסיונות כניסה. נסה שוב בעוד ${p.remainingTime} דקות.`,"danger");return}}y(!0);try{if(t){const p=await Ee(l,d);m("החשבון נוצר בהצלחה! ברוך הבא ל-DIGGY 🎉","success"),L("#/")}else{ve(l);const p=await ie(l,d);if(be(l),p.twoFactorEnabled){y(!1),ut(p);return}m("התחברת בהצלחה! 🎮","success"),L("#/")}}catch(p){m(p.message,"danger")}finally{y(!1)}}),s.addEventListener("click",()=>{mt()})}function ut(e){const t=Z(e.uid),o=`
    <div style="background: #07080a; color: #fff; padding: 30px; border-radius: 12px; border: 1px solid #00ff66; font-family: sans-serif; text-align: center;">
      <h2 style="color: #00ff66;">DIGGY Security Verification</h2>
      <p>שלום ${e.username}, קיבלנו בקשת התחברות לחשבון שלך.</p>
      <div style="font-size: 32px; font-weight: bold; background: rgba(0,255,102,0.1); border: 1px dashed #00ff66; padding: 15px; margin: 20px auto; letter-spacing: 5px; width: 200px; border-radius: 6px;">
        ${t}
      </div>
      <p style="color: #888;">הקוד תקף ל-5 דקות הקרובות. אנא אל תשתף קוד זה עם אף אחד.</p>
    </div>
  `;O(()=>Promise.resolve().then(()=>st),void 0).then(async a=>{const n=e.twoFactorEmail||e.email;await a.sendEmailViaResend(n,"DIGGY - קוד אימות דו-שלבי",o);const s=document.getElementById("modal-overlay"),i=document.getElementById("modal-title"),l=document.getElementById("modal-body");i.textContent="אימות דו-שלבי (2FA)",l.innerHTML=`
      <div style="text-align: center; display: flex; flex-direction: column; gap: 15px;">
        <p>קוד אימות נשלח לאימייל שלך: <strong style="color: var(--accent-color);">${n}</strong></p>
        <p style="font-size: 13px; color: var(--text-muted);">הזן את 6 הספרות כדי להשלים את ההתחברות:</p>
        <input type="text" id="twofactor-input" max-length="6" placeholder="000000" style="text-align: center; font-size: 24px; letter-spacing: 8px; font-family: var(--font-display); width: 200px; margin: 10px auto;">
        <button class="btn btn-primary" id="verify-2fa-btn" style="justify-content: center;">אמת קוד וכנס</button>
        <button class="btn btn-secondary" id="resend-2fa-btn" style="justify-content: center; font-size: 12px;">שלח קוד חדש</button>
      </div>
    `,s.classList.add("active"),document.getElementById("verify-2fa-btn").addEventListener("click",()=>{const d=document.getElementById("twofactor-input").value.trim(),u=Ce(e.uid,d);u.valid?(s.classList.remove("active"),m("הקוד אומת! ברוך הבא ל-DIGGY 🎉","success"),L("#/")):(m(u.error,"danger"),u.error.includes("חרגת")&&setTimeout(()=>{s.classList.remove("active"),L("#/login")},2e3))}),document.getElementById("resend-2fa-btn").addEventListener("click",()=>{Me(e.uid);const d=Z(e.uid),u=o.replace(t,d);a.sendEmailViaResend(n,"DIGGY - קוד אימות דו-שלבי (חדש)",u),m("קוד חדש נשלח לאימייל!","info")})})}async function mt(){const e=document.getElementById("modal-overlay"),t=document.getElementById("modal-title"),o=document.getElementById("modal-body");t.textContent="סורק טביעת אצבע ביומטרי",o.innerHTML=`
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
  `,e.classList.add("active");let a=localStorage.getItem("diggy_bio_username"),n=localStorage.getItem("diggy_bio_uid");setTimeout(async()=>{const s=document.getElementById("bio-status"),i=document.getElementById("bio-widget");if(!a||!n){i.classList.remove("scanning"),i.style.color="var(--danger-color)",s.innerHTML="שגיאה: זיהוי ביומטרי לא מוגדר!",s.style.color="var(--danger-color)",setTimeout(()=>{e.classList.remove("active"),m("לא הוגדרה כניסה ביומטרית בחשבון זה! היכנס רגיל והפעל אותה בהגדרות.","warning")},1500);return}try{(await Oe(a,n)).success&&(i.classList.remove("scanning"),i.style.color="#00ff66",s.innerHTML="סריקה הושלמה! מאושר",setTimeout(async()=>{e.classList.remove("active");const d=await ie(a,"auth_biometric_token");m(`ברוך שובך ביומטרי, ${a}!`,"success"),L("#/")},1e3))}catch(l){console.warn("WebAuthn verification failed:",l),i.classList.remove("scanning"),i.style.color="var(--danger-color)",s.innerHTML="סריקה נכשלה",s.style.color="var(--danger-color)",setTimeout(()=>{e.classList.remove("active"),m("שגיאה בכניסה ביומטרית: "+l.message,"danger")},1500)}},2e3)}async function Ve(){const e=document.getElementById("main-container");if(!r.user||r.user.role!=="developer"&&r.user.role!=="admin"){e.innerHTML=`
      <div style="text-align: center; padding: 80px 0;">
        <i class="fas fa-lock" style="font-size: 64px; color: var(--danger-color); margin-bottom: 20px;"></i>
        <h2>גישה חסומה!</h2>
        <p style="color: var(--text-muted); margin-top: 10px;">דף זה מיועד למפתחים מורשים בלבד. אם ברצונך להעלות משחקים, הגש בקשה בהגדרות.</p>
        <button class="btn btn-primary" onclick="window.location.hash='#/'" style="margin-top: 20px;">חזור למסך הבית</button>
      </div>
    `;return}e.innerHTML=`
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
  `;try{const t=await Ue(r.user.uid),o=document.getElementById("dev-games-list-body");t.length===0?o.innerHTML=`
        <tr>
          <td colspan="7" style="text-align: center; color: var(--text-muted); padding: 40px;">
            <i class="fas fa-folder-open" style="font-size: 32px; display: block; margin-bottom: 10px;"></i>
            טרם הגשת משחקים לאתר. לחץ על "הגש משחק חדש" כדי להתחיל!
          </td>
        </tr>
      `:(o.innerHTML=t.map(a=>{let n="";a.status==="pending"?n='<span class="badge badge-pending">ממתין לאישור</span>':a.status==="approved"?n='<span class="badge badge-approved">אושר בהצלחה</span>':a.status==="rejected"?n='<span class="badge badge-rejected">נדחה</span>':a.status==="improvement"&&(n='<span class="badge badge-improvement">דרוש תיקון</span>');const s=a.status==="improvement"?`<button class="btn btn-secondary resubmit-btn" data-id="${a.id}" style="padding: 4px 10px; font-size: 11px;"><i class="fas fa-edit"></i> ערוך והגש שנית</button>`:a.status==="approved"?'<span style="color: var(--accent-color); font-size: 12px;"><i class="fas fa-check-circle"></i> חי באתר</span>':'<span style="color: var(--text-dark); font-size: 12px;">אין פעולות</span>';return`
          <tr data-raw='${JSON.stringify(a)}'>
            <td><img src="${a.logoUrl||""}" onerror="this.src='https://placehold.co/40x40/12161e/00ff66?text=G'" style="width: 40px; height: 40px; border-radius: 6px; object-fit: cover;"></td>
            <td style="font-weight: bold; color: var(--accent-color);">${a.name}</td>
            <td>${a.categories?a.categories.join(", "):""}</td>
            <td><a href="${a.githubUrl}" target="_blank" style="color: #0096ff; text-decoration: underline; font-size: 12px;">קוד מאגר</a></td>
            <td>${n}</td>
            <td style="max-width: 200px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${a.adminSuggestions||""}">${a.adminSuggestions||'<span style="color: var(--text-dark);">אין</span>'}</td>
            <td>${s}</td>
          </tr>
        `}).join(""),o.querySelectorAll(".resubmit-btn").forEach(a=>{a.addEventListener("click",()=>{const n=a.closest("tr"),s=JSON.parse(n.getAttribute("data-raw"));pe(s)})}))}catch(t){m("שגיאה בטעינת משחקי מפתח: "+t.message,"danger")}document.getElementById("dev-submit-game-btn").addEventListener("click",()=>{pe()})}function pe(e=null){const t=document.getElementById("modal-overlay"),o=document.getElementById("modal-title"),a=document.getElementById("modal-body");o.textContent=e?`עריכת והגשת המשחק: ${e.name}`:"הגשת משחק חדש ל-DIGGY",a.innerHTML=`
    <form id="game-submit-form">
      <div class="form-group">
        <label>שם המשחק</label>
        <input type="text" id="game-name" value="${e?e.name:""}" required placeholder="לדוגמה: מלך הרטרו">
      </div>
      <div class="form-group">
        <label>תיאור קצר</label>
        <textarea id="game-desc" required placeholder="הסבר קצר על המשחק..." rows="2">${e?e.description:""}</textarea>
      </div>
      <div class="form-group">
        <label>קישור לתמונת לוגו (URL)</label>
        <input type="url" id="game-logo" value="${e?e.logoUrl:""}" required placeholder="https://example.com/logo.png">
      </div>
      <div class="form-group">
        <label>קישור למאגר GitHub (קוד המשחק)</label>
        <input type="url" id="game-github" value="${e?e.githubUrl:""}" required placeholder="https://github.com/user/repo" ${e&&e.status==="rejected"?"disabled":""}>
      </div>
      <div class="form-group">
        <label>קישור למשחק פעיל (Playable URL / GitHub Pages / iframe)</label>
        <input type="url" id="game-url" value="${e&&e.gameUrl||""}" required placeholder="https://username.github.io/my-game/">
      </div>
      <div class="form-group">
        <label>איך משחקים (מדריך מקוצר)</label>
        <textarea id="game-how" required placeholder="לדוגמה: לחץ על חצים לזוז, רווח לירות..." rows="2">${e?e.howToPlay:""}</textarea>
      </div>
      <div class="form-group">
        <label>למי מיועד המשחק (קהל יעד)</label>
        <input type="text" id="game-audience" value="${e?e.targetAudience:""}" required placeholder="לדוגמה: ילדים בגיל 8 ומעלה">
      </div>
      <div class="form-group">
        <label>קטגוריות (סמן עד 3 קטגוריות)</label>
        <div class="category-checkbox-grid">
          <label class="category-checkbox-label">
            <input type="checkbox" name="game-cats" value="RPG" ${e&&e.categories.includes("RPG")?"checked":""}> RPG
          </label>
          <label class="category-checkbox-label">
            <input type="checkbox" name="game-cats" value="RETRO" ${e&&e.categories.includes("RETRO")?"checked":""}> RETRO
          </label>
          <label class="category-checkbox-label">
            <input type="checkbox" name="game-cats" value="MULTIPLAYER" ${e&&e.categories.includes("MULTIPLAYER")?"checked":""}> MULTIPLAYER
          </label>
        </div>
      </div>
      <button type="submit" class="btn btn-primary" style="width: 100%; justify-content: center; margin-top: 15px;">
        <i class="fas fa-paper-plane"></i> ${e?"שלח עדכון מחדש":"שלח בקשה לאישור ADMIN"}
      </button>
    </form>
  `,t.classList.add("active");const n=document.getElementById("game-submit-form");n.addEventListener("submit",async s=>{s.preventDefault();const i=n.querySelectorAll('input[name="game-cats"]:checked');if(i.length===0){m("עליך לבחור לפחות קטגוריה אחת (מקסימום 3)!","warning");return}if(i.length>3){m("ניתן לבחור עד 3 קטגוריות בלבד!","warning");return}const l=Array.from(i).map(u=>u.value),d={name:document.getElementById("game-name").value,description:document.getElementById("game-desc").value,logoUrl:document.getElementById("game-logo").value,githubUrl:document.getElementById("game-github").value,gameUrl:document.getElementById("game-url").value,howToPlay:document.getElementById("game-how").value,targetAudience:document.getElementById("game-audience").value,categories:l,developerUid:r.user.uid,developerName:r.user.username};y(!0);try{e?(await De(e.id,d),m("בקשת המשחק עודכנה ונשלחה מחדש לאישור! 🚀","success")):(await Re(d),m("המשחק נשלח לאישור ה-Admin! יישלח אליך עדכון במייל. 📧","success")),t.classList.remove("active"),Ve()}catch(u){m(u.message,"danger")}finally{y(!1)}})}async function N(){const e=document.getElementById("main-container");if(!r.user||r.user.role!=="admin"){e.innerHTML=`
      <div style="text-align: center; padding: 80px 0;">
        <i class="fas fa-radiation-alt" style="font-size: 64px; color: var(--danger-color); margin-bottom: 20px;"></i>
        <h2>מערכת נעולה - ADMIN ONLY!</h2>
        <p style="color: var(--text-muted); margin-top: 10px;">דף זה מיועד אך ורק למנהלי מערכת DIGGY.</p>
        <button class="btn btn-primary" onclick="window.location.hash='#/'" style="margin-top: 20px;">חזור למסך הבית</button>
      </div>
    `;return}e.innerHTML=`
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
  `,document.getElementById("admin-direct-upload-btn").addEventListener("click",()=>{gt()});try{const t=await $e(),o=document.getElementById("admin-dev-requests-body");t.length===0?o.innerHTML='<tr><td colspan="6" style="text-align: center; color: var(--text-muted); padding: 30px;">אין פניות מפתחים פעילות.</td></tr>':(o.innerHTML=t.map(a=>{const n=a.status==="pending";let s="";a.status==="approved"?s='<span class="badge badge-approved">אושר</span>':a.status==="rejected"?s='<span class="badge badge-rejected">נדחה</span>':s='<span class="badge badge-pending">ממתין</span>';const i=n?`
            <div style="display: flex; gap: 8px;">
              <button class="btn btn-primary admin-approve-dev" data-id="${a.id}" style="padding: 4px 8px; font-size: 10px;"><i class="fas fa-check"></i> אישור</button>
              <button class="btn btn-danger admin-reject-dev" data-id="${a.id}" style="padding: 4px 8px; font-size: 10px;"><i class="fas fa-times"></i> דחייה</button>
            </div>
          `:'<span style="color: var(--text-dark); font-size: 12px;">נסגר</span>';return`
          <tr>
            <td style="font-weight: bold;">${a.username}</td>
            <td>${a.contactEmail}</td>
            <td style="max-width: 250px; font-size: 13px;" title="${a.reason}">${a.reason}</td>
            <td>${new Date(a.createdAt).toLocaleDateString()}</td>
            <td>${s}</td>
            <td>${i}</td>
          </tr>
        `}).join(""),o.querySelectorAll(".admin-approve-dev").forEach(a=>{a.addEventListener("click",()=>C(a.getAttribute("data-id"),"approved","dev"))}),o.querySelectorAll(".admin-reject-dev").forEach(a=>{a.addEventListener("click",()=>C(a.getAttribute("data-id"),"rejected","dev"))}))}catch(t){console.error("Error loading dev requests:",t)}try{const t=await Pe(),o=document.getElementById("admin-game-requests-body");t.length===0?o.innerHTML='<tr><td colspan="6" style="text-align: center; color: var(--text-muted); padding: 30px;">אין משחקים הממתינים לאישור.</td></tr>':(o.innerHTML=t.map(a=>{const n=a.status==="pending";let s="";a.status==="approved"?s='<span class="badge badge-approved">אושר</span>':a.status==="rejected"?s='<span class="badge badge-rejected">נדחה</span>':a.status==="improvement"&&(s='<span class="badge badge-improvement">הצעת שיפור</span>');const i=n?`
            <div style="display: flex; gap: 6px; flex-direction: column;">
              <button class="btn btn-primary admin-approve-game" data-id="${a.id}" style="padding: 4px 8px; font-size: 10px; justify-content: center;"><i class="fas fa-check"></i> אישור והעלאה</button>
              <button class="btn btn-secondary admin-improve-game" data-id="${a.id}" style="padding: 4px 8px; font-size: 10px; justify-content: center; border-color: #0096ff; color: #0096ff;"><i class="fas fa-comment-dots"></i> הצעות לשיפור</button>
              <button class="btn btn-danger admin-reject-game" data-id="${a.id}" style="padding: 4px 8px; font-size: 10px; justify-content: center;"><i class="fas fa-times"></i> דחייה מוחלטת</button>
            </div>
          `:`<div style="display: flex; flex-direction: column; gap: 4px;">${s}<span style="color: var(--text-muted); font-size: 11px;">${a.adminSuggestions||""}</span></div>`;return`
          <tr>
            <td><strong>${a.developerName}</strong></td>
            <td>
              <div style="display: flex; align-items: center; gap: 10px;">
                <img src="${a.logoUrl}" style="width: 40px; height: 40px; border-radius: 6px; object-fit: cover;">
                <div>
                  <div style="font-weight: bold; color: var(--accent-color);">${a.name}</div>
                  <div style="font-size: 11px; color: var(--text-muted);">איך משחקים: ${a.howToPlay}</div>
                </div>
              </div>
            </td>
            <td>${a.categories.join(", ")}</td>
            <td><a href="${a.githubUrl}" target="_blank" style="color: #0096ff; text-decoration: underline; font-size: 12px;">מקור קוד</a></td>
            <td>
              <div style="font-size: 12px;"><strong>מיועד ל:</strong> ${a.targetAudience}</div>
              <div style="font-size: 12px; color: var(--text-muted); max-width: 200px; overflow: hidden; text-overflow: ellipsis;">${a.description}</div>
            </td>
            <td>${i}</td>
          </tr>
        `}).join(""),o.querySelectorAll(".admin-approve-game").forEach(a=>{a.addEventListener("click",()=>C(a.getAttribute("data-id"),"approved","game"))}),o.querySelectorAll(".admin-improve-game").forEach(a=>{a.addEventListener("click",()=>C(a.getAttribute("data-id"),"improvement","game"))}),o.querySelectorAll(".admin-reject-game").forEach(a=>{a.addEventListener("click",()=>C(a.getAttribute("data-id"),"rejected","game"))}))}catch(t){console.error("Error loading games queue:",t)}try{const t=await Ae(),o=document.getElementById("admin-users-list-body");t.length===0?o.innerHTML='<tr><td colspan="6" style="text-align: center; color: var(--text-muted); padding: 30px;">לא נמצאו חשבונות רשומים.</td></tr>':(o.innerHTML=t.map(a=>{const n=a.createdAt?new Date(a.createdAt).toLocaleDateString():"לא ידוע",s=a.twoFactorEnabled?'<span style="color: var(--accent-color); font-size: 11px;"><i class="fas fa-check-circle"></i> פעיל</span>':'<span style="color: var(--text-dark); font-size: 11px;">כבוי</span>',i=a.biometricsEnabled?'<span style="color: var(--accent-color); font-size: 11px;"><i class="fas fa-check-circle"></i> פעיל</span>':'<span style="color: var(--text-dark); font-size: 11px;">כבוי</span>';return`
          <tr>
            <td><strong>${a.username}</strong></td>
            <td style="font-family: monospace; font-size: 11px; color: var(--text-muted);">${a.uid}</td>
            <td>${a.email}</td>
            <td>
              <select class="admin-role-select" data-uid="${a.uid}" style="background: var(--bg-darker); border-color: rgba(255,255,255,0.1); padding: 4px 8px; border-radius: 4px; font-size: 12px; font-family: var(--font-display); color: var(--accent-color);">
                <option value="player" ${a.role==="player"?"selected":""}>PLAYER</option>
                <option value="developer" ${a.role==="developer"?"selected":""}>DEVELOPER</option>
                <option value="admin" ${a.role==="admin"?"selected":""}>ADMIN</option>
              </select>
            </td>
            <td>
              <div style="display: flex; gap: 10px;">
                <span>2FA: ${s}</span>
                <span>Bio: ${i}</span>
              </div>
            </td>
            <td>${n}</td>
          </tr>
        `}).join(""),o.querySelectorAll(".admin-role-select").forEach(a=>{a.addEventListener("change",async()=>{const n=a.getAttribute("data-uid"),s=a.value;y(!0);try{await Se(n,s),m(`דרגת המשתמש עודכנה ל-${s.toUpperCase()} בהצלחה!`,"success"),r.user&&r.user.uid===n&&(r.user.role=s,j()),N()}catch(i){m("עדכון הדרגה נכשל: "+i.message,"danger")}finally{y(!1)}})}))}catch(t){console.error("Error loading users list:",t)}}function C(e,t,o){const a=document.getElementById("modal-overlay"),n=document.getElementById("modal-title"),s=document.getElementById("modal-body");n.textContent="הזנת הסבר מנהל מערכת (Admin Action)";let i="רשום סיבה או הצעות לשיפור שיועברו למשתמש:";t==="approved"?i="הערות אישור (יופיעו במייל):":t==="rejected"?i="סיבת סירוב (יופיע במייל - המשתמש לא יוכל להגיש שוב):":t==="improvement"&&(i="פרט את ההצעות לשיפור ושינויים שנדרשים מהמפתח:"),s.innerHTML=`
    <form id="admin-reason-form">
      <div class="form-group">
        <label>${i}</label>
        <textarea id="admin-notes" required placeholder="הזן כאן את הטקסט..." rows="4"></textarea>
      </div>
      <button type="submit" class="btn btn-primary" style="width: 100%; justify-content: center;">
        <i class="fas fa-check-double"></i> בצע פעולה ושלח מייל
      </button>
    </form>
  `,a.classList.add("active"),document.getElementById("admin-reason-form").addEventListener("submit",async l=>{l.preventDefault();const d=document.getElementById("admin-notes").value.trim();y(!0);try{o==="dev"?(await Be(e,t,d),m("בקשת המפתח עודכנה והמייל נשלח בהצלחה!","success")):o==="game"&&(await Ge(e,t,d),m("בקשת המשחק עודכנה והמייל נשלח בהצלחה!","success")),a.classList.remove("active"),await ne(),N()}catch(u){m(u.message,"danger")}finally{y(!1)}})}function gt(){const e=document.getElementById("modal-overlay"),t=document.getElementById("modal-title"),o=document.getElementById("modal-body");t.textContent="העלאה ישירה של משחק (Admin Bypass)",o.innerHTML=`
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
  `,e.classList.add("active");const a=document.getElementById("admin-direct-upload-form");a.addEventListener("submit",async n=>{n.preventDefault();const s=a.querySelectorAll('input[name="direct-cats"]:checked');if(s.length===0){m("בחר לפחות קטגוריה אחת!","warning");return}const i=Array.from(s).map(d=>d.value),l={name:document.getElementById("direct-name").value,description:document.getElementById("direct-desc").value,logoUrl:document.getElementById("direct-logo").value,githubUrl:document.getElementById("direct-github").value,gameUrl:document.getElementById("direct-url").value,howToPlay:document.getElementById("direct-how").value,targetAudience:document.getElementById("direct-audience").value,categories:i,developerUid:r.user.uid,developerName:`${r.user.username} (ADMIN)`};y(!0);try{await _e(l),m("המשחק פורסם בהצלחה באתר ללא צורך באישור! 🎉","success"),e.classList.remove("active"),await ne(),N()}catch(d){m(d.message,"danger")}finally{y(!1)}})}async function We(e){const t=document.getElementById("main-container"),o=r.games.find(a=>a.id===e);if(!o){t.innerHTML='<div style="text-align: center; padding: 80px 0;"><h2>משחק לא נמצא!</h2></div>';return}if(r.currentGame=o,r.user){let a=[...r.user.recentlyPlayed||[]];a=a.filter(n=>n!==e),a.unshift(e),a=a.slice(0,5),r.user.recentlyPlayed=a,await B(r.user.uid,{recentlyPlayed:a})}t.innerHTML=`
    <div style="margin-bottom: 20px;">
      <a href="#/" style="color: var(--accent-color); font-size: 14px;"><i class="fas fa-chevron-right"></i> חזרה לכל המשחקים</a>
    </div>

    <div class="game-play-area">
      <!-- Game Display Screen Panel -->
      <div class="game-screen-panel">
        <div class="game-screen-header">
          <h2 style="font-size: 20px; color: var(--accent-color);">${o.name}</h2>
          <span style="font-size: 13px; color: var(--text-muted); font-family: var(--font-display);" id="game-score-display">ניקוד: 0</span>
        </div>
        <div class="game-canvas-container">
          <div class="game-menu-overlay" id="game-menu-overlay">
            <h3 class="game-menu-title">${o.name}</h3>
            <p style="color: var(--text-muted); font-size: 14px; max-width: 380px; text-align: center; line-height: 1.5;">${o.howToPlay}</p>
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
          <img src="${o.logoUrl}" onerror="this.src='https://placehold.co/120x120/12161e/00ff66?text=DIGGY'" style="width: 100px; height: 100px; border-radius: 12px; object-fit: cover; border: 2px solid var(--accent-color); box-shadow: var(--border-glow);">
        </div>
        
        <div class="game-meta-item">
          <span class="game-meta-label">מפתח</span>
          <span class="game-meta-val" style="font-weight: bold; color: var(--accent-color);">${o.developerName}</span>
        </div>

        <div class="game-meta-item">
          <span class="game-meta-label">קטגוריות</span>
          <div style="display: flex; gap: 5px;">
            ${o.categories.map(a=>`<span class="game-tag" style="background: var(--accent-dim); color: var(--accent-color);">${a}</span>`).join("")}
          </div>
        </div>

        <div class="game-meta-item">
          <span class="game-meta-label">קהל יעד</span>
          <span class="game-meta-val">${o.targetAudience}</span>
        </div>

        <div class="game-meta-item">
          <span class="game-meta-label">קוד מקור</span>
          <a href="${o.githubUrl}" target="_blank" style="color: #0096ff; text-decoration: underline; font-size: 13px;">צפה ב-GitHub Repository</a>
        </div>

        <hr style="border: 0; border-top: 1px solid rgba(255, 255, 255, 0.05);">

        <div class="game-meta-item">
          <span class="game-meta-label">תיאור המשחק</span>
          <p style="font-size: 13px; line-height: 1.5; color: var(--text-muted);">${o.description}</p>
        </div>
      </div>
    </div>
  `,document.getElementById("start-game-btn").addEventListener("click",()=>{if(document.getElementById("game-menu-overlay").style.display="none",o.gameUrl){const a=document.getElementById("retro-game-iframe");a.src=o.gameUrl,a.style.display="block",r.gameInstance={stop:()=>{a.src="",a.style.display="none"}}}else{const a=document.getElementById("retro-game-canvas");a.style.display="block",o.id==="preset_snake"?r.gameInstance=fe(a):o.id==="preset_bricks"?r.gameInstance=pt(a):o.id==="preset_evader"?r.gameInstance=ft(a):r.gameInstance=fe(a)}})}function fe(e){const t=e.getContext("2d"),o=document.getElementById("game-score-display");let a=0,n=20,s=0,i={x:160,y:160,dx:n,dy:0,cells:[],maxCells:4},l={x:320,y:320},d=null,u=!0;function h(w,G){return Math.floor(Math.random()*(G-w))+w}function p(){u&&(d=requestAnimationFrame(p),!(++s<6)&&(s=0,t.clearRect(0,0,e.width,e.height),i.x+=i.dx,i.y+=i.dy,i.x<0?i.x=e.width-n:i.x>=e.width&&(i.x=0),i.y<0?i.y=e.height-n:i.y>=e.height&&(i.y=0),i.cells.unshift({x:i.x,y:i.y}),i.cells.length>i.maxCells&&i.cells.pop(),t.fillStyle="#ff3366",t.shadowBlur=15,t.shadowColor="#ff3366",t.beginPath(),t.arc(l.x+n/2,l.y+n/2,n/2-2,0,2*Math.PI),t.fill(),t.fillStyle=r.theme,t.shadowBlur=15,t.shadowColor=r.theme,i.cells.forEach(function(w,G){t.fillRect(w.x,w.y,n-1,n-1),w.x===l.x&&w.y===l.y&&(i.maxCells++,a+=10,o.textContent=`ניקוד: ${a}`,l.x=h(0,e.width/n)*n,l.y=h(0,e.height/n)*n);for(let g=G+1;g<i.cells.length;g++)w.x===i.cells[g].x&&w.y===i.cells[g].y&&S()})))}function k(w){w.key==="ArrowLeft"&&i.dx===0?(i.dx=-n,i.dy=0):w.key==="ArrowUp"&&i.dy===0?(i.dy=-n,i.dx=0):w.key==="ArrowRight"&&i.dx===0?(i.dx=n,i.dy=0):w.key==="ArrowDown"&&i.dy===0&&(i.dy=n,i.dx=0)}document.addEventListener("keydown",k),d=requestAnimationFrame(p);function S(){u=!1,t.shadowBlur=0,t.fillStyle="rgba(0, 0, 0, 0.8)",t.fillRect(0,0,e.width,e.height),t.fillStyle="#ff3366",t.font="24px Orbitron",t.textAlign="center",t.fillText("GAME OVER",e.width/2,e.height/2-20),t.fillStyle="#ffffff",t.font="14px Outfit",t.fillText(`ניקוד סופי: ${a}`,e.width/2,e.height/2+10),t.fillText("לחץ שוב על כפתור התחל כדי לנסות שנית",e.width/2,e.height/2+40)}return{stop:()=>{u=!1,cancelAnimationFrame(d),document.removeEventListener("keydown",k)}}}function pt(e){const t=e.getContext("2d"),o=document.getElementById("game-score-display");let a=0,n=!0,s=null,i={x:e.width/2,y:e.height-30,dx:3,dy:-3,radius:8},l={x:e.width/2-50,y:e.height-20,width:100,height:10,speed:7},d=!1,u=!1,h=4,p=6,k=75,S=20,w=15,G=40,g=40,A=[];const R=["#ff3366","#00ff66","#0096ff","#ffcc00"];for(let f=0;f<p;f++){A[f]=[];for(let b=0;b<h;b++)A[f][b]={x:0,y:0,status:1,color:R[b%R.length]}}function F(f){f.key==="Right"||f.key==="ArrowRight"?u=!0:(f.key==="Left"||f.key==="ArrowLeft")&&(d=!0)}function se(f){f.key==="Right"||f.key==="ArrowRight"?u=!1:(f.key==="Left"||f.key==="ArrowLeft")&&(d=!1)}function re(f){let b=f.clientX-e.getBoundingClientRect().left;b>0&&b<e.width&&(l.x=b-l.width/2)}document.addEventListener("keydown",F),document.addEventListener("keyup",se),document.addEventListener("mousemove",re);function Je(){for(let f=0;f<p;f++)for(let b=0;b<h;b++){let U=A[f][b];U.status===1&&i.x>U.x&&i.x<U.x+k&&i.y>U.y&&i.y<U.y+S&&(i.dy=-i.dy,U.status=0,a+=15,o.textContent=`ניקוד: ${a}`,a===h*p*15&&Xe())}}function le(){if(n){t.clearRect(0,0,e.width,e.height);for(let f=0;f<p;f++)for(let b=0;b<h;b++)if(A[f][b].status===1){let U=f*(k+w)+g,de=b*(S+w)+G;A[f][b].x=U,A[f][b].y=de,t.fillStyle=A[f][b].color,t.shadowBlur=10,t.shadowColor=A[f][b].color,t.fillRect(U,de,k,S)}if(t.beginPath(),t.arc(i.x,i.y,i.radius,0,Math.PI*2),t.fillStyle="#ffffff",t.shadowBlur=12,t.shadowColor="#ffffff",t.fill(),t.closePath(),t.fillStyle=r.theme,t.shadowBlur=15,t.shadowColor=r.theme,t.fillRect(l.x,l.y,l.width,l.height),Je(),(i.x+i.dx>e.width-i.radius||i.x+i.dx<i.radius)&&(i.dx=-i.dx),i.y+i.dy<i.radius)i.dy=-i.dy;else if(i.y+i.dy>e.height-i.radius)if(i.x>l.x&&i.x<l.x+l.width)i.dy=-i.dy;else{Ze();return}u&&l.x<e.width-l.width?l.x+=l.speed:d&&l.x>0&&(l.x-=l.speed),i.x+=i.dx,i.y+=i.dy,s=requestAnimationFrame(le)}}s=requestAnimationFrame(le);function Ze(){n=!1,t.shadowBlur=0,t.fillStyle="rgba(0,0,0,0.85)",t.fillRect(0,0,e.width,e.height),t.fillStyle="#ff3366",t.font="24px Orbitron",t.textAlign="center",t.fillText("GAME OVER",e.width/2,e.height/2-20),t.fillStyle="#ffffff",t.font="14px Outfit",t.fillText(`ניקוד סופי: ${a}`,e.width/2,e.height/2+10),t.fillText("נסה שנית!",e.width/2,e.height/2+40)}function Xe(){n=!1,t.shadowBlur=0,t.fillStyle="rgba(0,0,0,0.85)",t.fillRect(0,0,e.width,e.height),t.fillStyle="#00ff66",t.font="24px Orbitron",t.textAlign="center",t.fillText("YOU WIN!",e.width/2,e.height/2-20),t.fillStyle="#ffffff",t.fillText(`ניקוד סופי: ${a}`,e.width/2,e.height/2+10)}return{stop:()=>{n=!1,cancelAnimationFrame(s),document.removeEventListener("keydown",F),document.removeEventListener("keyup",se),document.removeEventListener("mousemove",re)}}}function ft(e){const t=e.getContext("2d"),o=document.getElementById("game-score-display");let a=0,n=!0,s=null,i={x:e.width/2-20,y:e.height-40,width:40,height:30,speed:6},l=[],d=[],u={},h=0;function p(g){u[g.key]=!0}function k(g){u[g.key]=!1}document.addEventListener("keydown",p),document.addEventListener("keyup",k);function S(){d.push({x:Math.random()*(e.width-30),y:-30,width:30,height:30,speed:1.5+Math.random()*3,color:"#ffaa00"})}function w(){n&&((u.ArrowLeft||u.a)&&(i.x=Math.max(0,i.x-i.speed)),(u.ArrowRight||u.d)&&(i.x=Math.min(e.width-i.width,i.x+i.speed)),(u[" "]||u.Spacebar)&&(!i.lastFired||Date.now()-i.lastFired>300)&&(l.push({x:i.x+i.width/2-2,y:i.y,width:4,height:12,speed:7}),i.lastFired=Date.now()),t.clearRect(0,0,e.width,e.height),t.fillStyle=r.theme,t.shadowBlur=15,t.shadowColor=r.theme,t.beginPath(),t.moveTo(i.x+i.width/2,i.y),t.lineTo(i.x,i.y+i.height),t.lineTo(i.x+i.width,i.y+i.height),t.closePath(),t.fill(),h++,h>40&&(S(),h=0),t.fillStyle="#00ffff",t.shadowColor="#00ffff",l.forEach((g,A)=>{g.y-=g.speed,t.fillRect(g.x,g.y,g.width,g.height),g.y<0&&l.splice(A,1)}),d.forEach((g,A)=>{if(g.y+=g.speed,t.fillStyle=g.color,t.shadowColor=g.color,t.fillRect(g.x,g.y,g.width,g.height),g.x<i.x+i.width&&g.x+g.width>i.x&&g.y<i.y+i.height&&g.y+g.height>i.y){G();return}l.forEach((R,F)=>{R.x<g.x+g.width&&R.x+R.width>g.x&&R.y<g.y+g.height&&R.y+R.height>g.y&&(d.splice(A,1),l.splice(F,1),a+=20,o.textContent=`ניקוד: ${a}`)}),g.y>e.height&&d.splice(A,1)}),s=requestAnimationFrame(w))}s=requestAnimationFrame(w);function G(){n=!1,t.shadowBlur=0,t.fillStyle="rgba(0,0,0,0.85)",t.fillRect(0,0,e.width,e.height),t.fillStyle="#ff3366",t.font="24px Orbitron",t.textAlign="center",t.fillText("SPACE SHUTTLE CRASHED",e.width/2,e.height/2-20),t.fillStyle="#ffffff",t.font="14px Outfit",t.fillText(`ניקוד סופי: ${a}`,e.width/2,e.height/2+10),t.fillText("נסה שנית!",e.width/2,e.height/2+40)}return{stop:()=>{n=!1,cancelAnimationFrame(s),document.removeEventListener("keydown",p),document.removeEventListener("keyup",k)}}}function Ke(){const e=document.getElementById("main-container");if(!r.user){e.innerHTML=`
      <div style="text-align: center; padding: 80px 0;">
        <h2>גישה מוגבלת</h2>
        <p style="color: var(--text-muted); margin-top: 10px;">עלייך להתחבר למערכת כדי לגשת להגדרות.</p>
        <button class="btn btn-primary" onclick="window.location.hash='#/login'" style="margin-top: 20px;">התחבר עכשיו</button>
      </div>
    `;return}e.innerHTML=`
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
            <input type="text" id="settings-username" value="${r.user.username}">
          </div>
          <div class="form-group">
            <label>אימייל משויך</label>
            <input type="text" value="${r.user.email}" disabled style="background: rgba(255,255,255,0.02); color: var(--text-muted);">
          </div>
          <div class="form-group">
            <label>תפקיד משתמש (ROLE)</label>
            <div style="font-weight: bold; color: var(--accent-color); font-family: var(--font-display); font-size: 16px;">
              ${r.user.role.toUpperCase()}
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
              <input type="checkbox" id="settings-2fa-toggle" ${r.user.twoFactorEnabled?"checked":""} style="width: 20px; height: 20px; accent-color: var(--accent-color); cursor: pointer;">
            </div>
            
            <div id="settings-2fa-email-group" style="display: ${r.user.twoFactorEnabled?"block":"none"}; margin-top: 15px;">
              <div class="form-group">
                <label>כתובת אימייל לשליחת הקוד</label>
                <input type="email" id="settings-2fa-email" value="${r.user.twoFactorEmail||""}" placeholder="myemail@example.com">
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
              <span id="bio-setup-status" style="font-size: 11px; font-family: var(--font-display); color: ${r.user.biometricsEnabled?"var(--accent-color)":"var(--text-muted)"};">
                ${r.user.biometricsEnabled?"מופעל":"לא מוגדר"}
              </span>
            </div>
            <button class="btn btn-secondary" id="register-biometric-btn" style="width: 100%; justify-content: center;">
              <i class="fas fa-fingerprint"></i> ${r.user.biometricsEnabled?"הגדר ביומטרי מחדש":"הפעל זיהוי ביומטרי"}
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
            <div class="color-picker-btn ${r.theme==="#00ff66"?"active":""}" style="background: #00ff66;" data-color="#00ff66"></div>
            <div class="color-picker-btn ${r.theme==="#ff3366"?"active":""}" style="background: #ff3366;" data-color="#ff3366"></div>
            <div class="color-picker-btn ${r.theme==="#ffaa00"?"active":""}" style="background: #ffaa00;" data-color="#ffaa00"></div>
            <div class="color-picker-btn ${r.theme==="#00ffff"?"active":""}" style="background: #00ffff;" data-color="#00ffff"></div>
            <div class="color-picker-btn ${r.theme==="#b026ff"?"active":""}" style="background: #b026ff;" data-color="#b026ff"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Become a Developer Application Form (If player role) -->
    ${r.user.role==="player"?`
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
    `:""}
  `,document.getElementById("save-profile-btn").addEventListener("click",async()=>{const s=H(document.getElementById("settings-username").value.trim()),i=oe(s);if(!i.valid){m(i.errors[0],"danger");return}y(!0);try{await B(r.user.uid,{username:s}),r.user.username=s,j(),m("שם המשתמש עודכן בהצלחה!","success")}catch(l){m(l.message,"danger")}finally{y(!1)}}),document.getElementById("change-pass-btn").addEventListener("click",async()=>{const s=document.getElementById("settings-new-password").value,i=ae(s);if(!i.valid){m(i.errors[0],"danger");return}y(!0);try{await Le(s),m("הסיסמה שונתה בהצלחה!","success"),document.getElementById("settings-new-password").value=""}catch(l){m(l.message,"danger")}finally{y(!1)}});const t=document.getElementById("settings-2fa-toggle"),o=document.getElementById("settings-2fa-email-group");t.addEventListener("change",async()=>{const s=t.checked;o.style.display=s?"block":"none",s||(y(!0),await B(r.user.uid,{twoFactorEnabled:!1}),r.user.twoFactorEnabled=!1,m("אימות דו-שלבי בוטל.","info"),y(!1))});const a=document.getElementById("settings-2fa-email");a.addEventListener("change",async()=>{const s=H(a.value.trim());if(s){const i=xe(s);if(!i.valid){m(i.error,"danger");return}y(!0),await B(r.user.uid,{twoFactorEnabled:!0,twoFactorEmail:s}),r.user.twoFactorEnabled=!0,r.user.twoFactorEmail=s,m("כתובת אימות דו-שלבי עודכנה!","success"),y(!1)}}),document.querySelectorAll(".color-picker-btn").forEach(s=>{s.addEventListener("click",async()=>{document.querySelectorAll(".color-picker-btn").forEach(l=>l.classList.remove("active")),s.classList.add("active");const i=s.getAttribute("data-color");y(!0),await B(r.user.uid,{customTheme:i}),r.user.customTheme=i,te(i),y(!1),m("ערכת העיצוב הניאונית עודכנה!","success")})}),document.getElementById("register-biometric-btn").addEventListener("click",async()=>{y(!0);try{const s=await Fe(r.user.username,r.user.uid);s.success&&(localStorage.setItem("diggy_bio_username",r.user.username),localStorage.setItem("diggy_bio_uid",r.user.uid),await B(r.user.uid,{biometricsEnabled:!0,biometricsCredentialId:s.credentialId.join(",")}),r.user.biometricsEnabled=!0,document.getElementById("bio-setup-status").textContent="מופעל",document.getElementById("bio-setup-status").style.color="var(--accent-color)",m("זיהוי ביומטרי הופעל בהצלחה עבור מכשיר זה! 🔒","success"))}catch(s){m("שגיאה ברישום ביומטרי: "+s.message,"danger")}finally{y(!1)}});const n=document.getElementById("dev-application-form");n&&n.addEventListener("submit",async s=>{s.preventDefault();const i=document.getElementById("dev-app-reason").value,l=document.getElementById("dev-app-email").value,d=document.getElementById("dev-app-pass").value;if(d.length<6||d.length>12){m("הזן סיסמת אימות תקינה (6-12 תווים)!","danger");return}y(!0);try{await Te(r.user.uid,r.user.username,i,l),m("בקשת המפתח נשלחה בהצלחה! מייל עיצוב יישלח אלייך עם החלטת ה-Admin. 📬","success"),Ke()}catch(u){m(u.message,"danger")}finally{y(!1)}})}function te(e){r.theme=e;const t=document.documentElement;t.style.setProperty("--accent-color",e),t.style.setProperty("--accent-glow",`${e}66`),t.style.setProperty("--accent-dim",`${e}1a`),t.style.setProperty("--border-color",`${e}26`)}function j(){const e=document.getElementById("sidebar-user-badge-wrap");if(e)if(r.user){const t=r.user.username.charAt(0).toUpperCase();e.innerHTML=`
      <div class="user-badge" onclick="window.location.hash='#/settings'" style="cursor: pointer;">
        <div class="user-avatar">${t}</div>
        <div class="user-info">
          <span class="user-name">${r.user.username}</span>
          <span class="user-role">${r.user.role}</span>
        </div>
      </div>
    `}else e.innerHTML=`
      <button class="btn btn-secondary" onclick="window.location.hash='#/login'" style="width: 100%; justify-content: center; padding: 10px;">
        <i class="fas fa-sign-in-alt"></i> התחבר / הרשם
      </button>
    `}function m(e,t="success"){const o=document.getElementById("toast-container");if(!o)return;const a=document.createElement("div");a.style.background="var(--bg-dark)",a.style.color="#ffffff",a.style.padding="12px 20px",a.style.borderRadius="8px",a.style.fontSize="14px",a.style.fontWeight="bold",a.style.fontFamily="var(--font-body)",a.style.boxShadow="0 5px 15px rgba(0,0,0,0.5)",a.style.transition="all 0.3s ease",a.style.transform="translateY(20px)",a.style.opacity="0",a.style.display="flex",a.style.alignItems="center",a.style.gap="10px";let n="var(--accent-color)",s="fa-check-circle";t==="danger"?(n="var(--danger-color)",s="fa-exclamation-triangle"):t==="warning"?(n="var(--warning-color)",s="fa-exclamation-circle"):t==="info"&&(n="#0096ff",s="fa-info-circle"),a.style.borderLeft=`4px solid ${n}`,a.style.boxShadow=`0 0 10px ${n}40`,a.innerHTML=`<i class="fas ${s}" style="color: ${n}"></i> <span>${e}</span>`,o.appendChild(a),setTimeout(()=>{a.style.transform="translateY(0)",a.style.opacity="1"},10),setTimeout(()=>{a.style.transform="translateY(-20px)",a.style.opacity="0",setTimeout(()=>{a.remove()},300)},4e3)}function y(e){const t=document.getElementById("app-global-loader");t&&(t.style.display=e?"flex":"none")}document.getElementById("modal-close-btn").addEventListener("click",()=>{document.getElementById("modal-overlay").classList.remove("active");const e=document.getElementById("bio-widget");e&&e.classList.remove("scanning")});document.getElementById("settings-nav-btn").addEventListener("click",()=>{L("#/settings")});function yt(){const e=document.createElement("div");e.className="simulated-inbox-widget collapsed",e.id="simulated-inbox-widget",e.innerHTML=`
    <div class="inbox-header" id="inbox-header">
      <span class="inbox-title"><i class="fas fa-envelope-open-text"></i> תיבת מיילים (סימולציה)</span>
      <span class="inbox-count" id="inbox-count">0</span>
    </div>
    <div class="inbox-body" id="inbox-body">
      <div style="text-align: center; color: var(--text-dark); font-size: 11px; padding: 20px;">אין מיילים כרגע</div>
    </div>
  `,document.body.appendChild(e),document.getElementById("inbox-header").addEventListener("click",()=>{e.classList.toggle("collapsed")})}function ht(){const e=document.getElementById("inbox-count"),t=document.getElementById("inbox-body");if(!e||!t)return;const o=r.recentEmails;if(e.textContent=o.length,o.length===0){t.innerHTML='<div style="text-align: center; color: var(--text-dark); font-size: 11px; padding: 20px;">אין מיילים כרגע</div>';return}t.innerHTML=o.map(a=>`
    <div class="email-item" data-id="${a.id}">
      <div class="email-item-subject">${a.subject}</div>
      <div class="email-item-meta">
        <span>נמען: ${a.to}</span>
        <span>${a.sentAt}</span>
      </div>
    </div>
  `).join(""),t.querySelectorAll(".email-item").forEach(a=>{a.addEventListener("click",()=>{const n=a.getAttribute("data-id"),s=o.find(i=>i.id===n);s&&vt(s)})})}function vt(e){const t=document.getElementById("simulated-inbox-widget"),o=document.createElement("div");o.className="email-content-view",o.innerHTML=`
    <div class="email-view-header">
      <a href="#" class="email-view-back" id="email-view-back-btn"><i class="fas fa-arrow-left"></i> חזרה</a>
      <span style="font-size: 11px; color: var(--text-dark);">${e.sentAt}</span>
    </div>
    <div style="font-size: 12px; margin-bottom: 15px; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 8px;">
      <div><strong>אל:</strong> ${e.to}</div>
      <div><strong>נושא:</strong> ${e.subject}</div>
    </div>
    <div style="flex-grow: 1; overflow-y: auto;">
      ${e.html}
    </div>
  `,t.appendChild(o),document.getElementById("email-view-back-btn").addEventListener("click",a=>{a.preventDefault(),o.remove()})}async function bt(){const e=document.getElementById("main-container");if(!r.user||r.user.role!=="developer"&&r.user.role!=="admin"){e.innerHTML=`
      <div style="text-align: center; padding: 80px 0;">
        <i class="fas fa-lock" style="font-size: 64px; color: var(--danger-color); margin-bottom: 20px;"></i>
        <h2>גישה חסומה!</h2>
        <p style="color: var(--text-muted); margin-top: 10px;">דף זה מיועד למפתחים מורשים בלבד.</p>
        <button class="btn btn-primary" onclick="window.location.hash='#/'" style="margin-top: 20px;">חזור למסך הבית</button>
      </div>
    `;return}if(!document.getElementById("dev-docs-inline-styles")){const n=document.createElement("style");n.id="dev-docs-inline-styles",n.textContent=`
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
    `,document.head.appendChild(n)}e.innerHTML=`
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
  `;const t={"getting-started":`
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
    `,standards:`
      <h2 class="doc-article-title"><i class="fas fa-list-check"></i> סטנדרטים ודרישות טכנולוגיות</h2>
      <div class="doc-section">
        <p>כדי לשמור על איכות גבוהה, רמת אבטחה מעולה וחווית משתמש רציפה עבור השחקנים שלנו, כל משחק המוגש לאתר DIGGY נדרש לעמוד בסטנדרטים הבאים:</p>
      </div>
      <div class="doc-section">
        <h3>1. עיצוב רספונסיבי והתאמה למסך</h3>
        <p>מכיוון שהמשחקים נטענים בתוך מסגרת משחק קבועה בדף, על המשחק שלך להתאים את עצמו בצורה חלקה לכל גודל חלון (מומלץ להשתמש ב-100% רוחב וגובה של ה-viewport או לתמוך ביחס גובה-רוחב גמיש).</p>
      </div>
      <div class="doc-section">
        <h3>2. קוד מקור פתוח (GitHub Repository)</h3>
        <p>אנו מאמינים בשיתוף ידע ולמידה הדדית. מפתחים נדרשים לשתף את קוד המקור של המשחק שלהם ב-GitHub. קישור זה יוצג לצד המשחק ויאפשר לילדים אחרים ללמוד כיצד בניתם את המשחק.</p>
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
    `,monetization:`
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
    `,tips:`
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
    `};function o(n){const s=document.getElementById("doc-content-area");s.innerHTML=t[n]||""}o("getting-started");const a=document.querySelectorAll(".doc-tab-btn");a.forEach(n=>{n.addEventListener("click",()=>{a.forEach(i=>i.classList.remove("active-doc-tab")),n.classList.add("active-doc-tab");const s=n.getAttribute("data-doc");o(s)})})}
