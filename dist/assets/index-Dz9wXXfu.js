(function(){const a=document.createElement("link").relList;if(a&&a.supports&&a.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))t(n);new MutationObserver(n=>{for(const s of n)if(s.type==="childList")for(const i of s.addedNodes)i.tagName==="LINK"&&i.rel==="modulepreload"&&t(i)}).observe(document,{childList:!0,subtree:!0});function o(n){const s={};return n.integrity&&(s.integrity=n.integrity),n.referrerPolicy&&(s.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?s.credentials="include":n.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function t(n){if(n.ep)return;n.ep=!0;const s=o(n);fetch(n.href,s)}})();const tt="modulepreload",at=function(e){return"/"+e},ue={},F=function(a,o,t){let n=Promise.resolve();if(o&&o.length>0){document.getElementsByTagName("link");const i=document.querySelector("meta[property=csp-nonce]"),r=(i==null?void 0:i.nonce)||(i==null?void 0:i.getAttribute("nonce"));n=Promise.allSettled(o.map(c=>{if(c=at(c),c in ue)return;ue[c]=!0;const u=c.endsWith(".css"),f=u?'[rel="stylesheet"]':"";if(document.querySelector(`link[href="${c}"]${f}`))return;const p=document.createElement("link");if(p.rel=u?"stylesheet":tt,u||(p.as="script"),p.crossOrigin="",p.href=c,r&&p.setAttribute("nonce",r),document.head.appendChild(p),u)return new Promise((k,A)=>{p.addEventListener("load",k),p.addEventListener("error",()=>A(new Error(`Unable to preload CSS for ${c}`)))})}))}function s(i){const r=new Event("vite:preloadError",{cancelable:!0});if(r.payload=i,window.dispatchEvent(r),!r.defaultPrevented)throw i}return n.then(i=>{for(const r of i||[])r.status==="rejected"&&s(r.reason);return a().catch(s)})},ot={apiKey:"AIzaSyD2SUmKinx3qRGW5yehcpOpyw2sLQbmwSA",authDomain:"diggy-9eda8.firebaseapp.com",projectId:"diggy-9eda8",storageBucket:"diggy-9eda8.firebasestorage.app",messagingSenderId:"90359833058",appId:"1:90359833058:web:712187c9d78ccb2755d9bb",measurementId:"G-ZW5KTPNQ3G"};let Y=null,_=null,v=null,I=!1,b=!1,D=null,d=null;const ve=[];let $=null;const K=e=>`${e.toLowerCase().trim()}@diggy.com`;async function it(){try{const e=await F(()=>import("https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js"),[]);D=await F(()=>import("https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js"),[]),d=await F(()=>import("https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js"),[]),Y=e.initializeApp(ot),_=D.getAuth(Y),v=d.getFirestore(Y),I=!0,D.onAuthStateChanged(_,async a=>{if(a)try{const o=d.doc(v,"users",a.uid),t=await d.getDoc(o);if(t.exists()){const n=t.data();G(n);return}}catch(o){console.warn("Auth state loaded but profile query failed. Falling back to local storage session.",o)}me()}),console.log("Firebase dynamically initialized successfully.")}catch(e){console.warn("Firebase SDK failed to load from CDN. Operating in local-only fallback mode.",e),b=!0,me()}}it();function me(){const e=localStorage.getItem("diggy_logged_in_uid");if(e){const o=w("users").find(t=>t.uid===e);if(o){$=o,G(o);return}}$=null,G(null)}function G(e){ve.forEach(a=>{try{a(e)}catch(o){console.error("Error in auth listener callback:",o)}})}const O=new Map,st=5,J=15*60*1e3;function he(e){const a=Date.now(),t=(O.get(e)||[]).filter(n=>a-n<J);return t.length>=st?{allowed:!1,remainingTime:Math.ceil((t[0]+J-a)/1e3/60)}:{allowed:!0,attempts:t.length}}function be(e){const a=Date.now(),o=O.get(e)||[];o.push(a);const t=o.filter(n=>a-n<J);O.set(e,t)}function xe(e){O.delete(e)}function H(e){return typeof e!="string"?e:e.replace(/[<>]/g,"").trim().substring(0,500)}function ae(e){const a=[];return e.length<6&&a.push("הסיסמה חייבת להכיל לפחות 6 תווים"),e.length>12&&a.push("הסיסמה חייבת להכיל לכל היותר 12 תווים"),/[a-zA-Z]/.test(e)||a.push("הסיסמה חייבת להכיל לפחות אות אחת באנגלית"),/[0-9]/.test(e)||a.push("הסיסמה חייבת להכיל לפחות ספרה אחת"),{valid:a.length===0,errors:a}}function oe(e){const a=[];return e.length<6&&a.push("שם המשתמש חייב להכיל לפחות 6 תווים"),e.length>12&&a.push("שם המשתמש חייב להכיל לכל היותר 12 תווים"),/^[a-zA-Z0-9_]+$/.test(e)||a.push("שם המשתמש יכול להכיל רק אותיות, ספרות וקו תחתון"),{valid:a.length===0,errors:a}}function we(e){return{valid:/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e),error:"כתובת האימייל אינה תקינה"}}function w(e){const a=localStorage.getItem(`diggy_db_${e}`);return a?JSON.parse(a):[]}function L(e,a){localStorage.setItem(`diggy_db_${e}`,JSON.stringify(a))}w("games").length===0&&L("games",[{id:"preset_snake",name:"Neon Snake",description:"The classic retro arcade game! Guide the neon snake to consume glowing particles, but avoid hitting yourself or the boundaries.",logoUrl:"https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60",githubUrl:"https://github.com/diggy-games/neon-snake",howToPlay:"Use the arrow keys or WASD to navigate the snake. Eat green glowing particles to grow. The game ends if you collide with the walls or your own tail.",targetAudience:"Everyone (All Ages)",categories:["RETRO","RPG"],developerUid:"system",developerName:"DIGGY Core Devs",approved:!0}]);if(w("users").length===0){const e=[{uid:"local_admin_123",username:"admin",email:"admin@diggy.com",role:"admin",twoFactorEnabled:!1,twoFactorEmail:"",biometricsEnabled:!1,customTheme:"#00ff66",favorites:[],recentlyPlayed:[],createdAt:new Date().toISOString()},{uid:"local_dev_456",username:"developer_jon",email:"jon@diggy.com",role:"developer",twoFactorEnabled:!1,twoFactorEmail:"",biometricsEnabled:!1,customTheme:"#00ffff",favorites:["preset_snake"],recentlyPlayed:[],createdAt:new Date().toISOString()},{uid:"local_player_789",username:"gamer_kid",email:"kid@diggy.com",role:"player",twoFactorEnabled:!1,twoFactorEmail:"",biometricsEnabled:!1,customTheme:"#ff3366",favorites:[],recentlyPlayed:["preset_snake"],createdAt:new Date().toISOString()}];L("users",e)}function Ee(e){ve.push(e),(b||I)&&e($)}async function Ie(e,a){const o=e.trim();if(o.length<6||o.length>12)throw new Error("Username must be between 6 and 12 characters.");if(a.length<6||a.length>12)throw new Error("Password must be between 6 and 12 characters.");const n={uid:"local_"+Math.random().toString(36).substr(2,9),username:o,email:K(o),role:o.toLowerCase()==="admin"?"admin":"player",twoFactorEnabled:!1,twoFactorEmail:"",biometricsEnabled:!1,biometricsCredential:null,customTheme:"#00ff66",favorites:[],recentlyPlayed:[],createdAt:new Date().toISOString()};if(I&&!b)try{const r=K(o),c=d.collection(v,"users"),u=d.query(c,d.where("username","==",o));if(!(await d.getDocs(u)).empty)throw new Error("Username is already taken.");const k=(await D.createUserWithEmailAndPassword(_,r,a)).user;n.uid=k.uid,await d.setDoc(d.doc(v,"users",k.uid),n);const A=w("users");return A.push(n),L("users",A),$=n,localStorage.setItem("diggy_logged_in_uid",k.uid),G(n),n}catch(r){if(console.warn("Firebase sign up failed. Falling back to LocalStorage auth.",r),r.code==="auth/email-already-in-use"||r.message==="Username is already taken.")throw new Error("שם המשתמש כבר תפוס במערכת!");if(r.code==="auth/weak-password")throw new Error("הסיסמה חלשה מדי!");b=!0,console.log("Switched to LocalStorage fallback due to error:",r.message||r)}const s=w("users");if(s.some(r=>r.username.toLowerCase()===o.toLowerCase()))throw new Error("Username is already taken.");return s.push(n),L("users",s),$=n,localStorage.setItem("diggy_logged_in_uid",n.uid),G(n),n}async function ie(e,a){const o=e.trim().toLowerCase();if(I&&!b&&a!=="DUMMY_PASSWORD_NOT_USED"&&a!=="auth_biometric_token")try{const s=K(e),r=(await D.signInWithEmailAndPassword(_,s,a)).user,c=d.doc(v,"users",r.uid),u=await d.getDoc(c);if(u.exists()){const f=u.data();return $=f,localStorage.setItem("diggy_logged_in_uid",f.uid),G(f),f}throw new Error("User profile not found in database.")}catch(s){if(console.warn("Firebase sign in failed. Attempting LocalStorage auth fallback.",s),s.code==="auth/user-not-found"||s.code==="auth/wrong-password"||s.code==="auth/invalid-credential"||s.code==="auth/invalid-email")throw new Error("שם המשתמש או הסיסמה שגויים!");b=!0,console.log("Switched to LocalStorage login fallback due to error:",s.message||s)}const n=w("users").find(s=>s.username.toLowerCase()===o);if(!n)throw new Error("שם המשתמש או הסיסמה שגויים! (לא נמצא חשבון)");return $=n,localStorage.setItem("diggy_logged_in_uid",n.uid),G(n),n}async function ke(){if(localStorage.removeItem("diggy_logged_in_uid"),$=null,I&&!b)try{await D.signOut(_)}catch(e){console.warn("Firebase sign out failed:",e)}G(null)}async function Le(e){if(I&&!b)try{const t=d.doc(v,"users",e),n=await d.getDoc(t);if(n.exists())return n.data()}catch(t){console.warn("Firebase profile read failed, using local fallback:",t)}const o=w("users").find(t=>t.uid===e);if(o)return o;throw new Error("User profile not found.")}async function B(e,a){const o=w("users"),t=o.findIndex(n=>n.uid===e);if(t!==-1&&(o[t]={...o[t],...a},L("users",o),$&&$.uid===e&&($=o[t])),I&&!b)try{const n=d.doc(v,"users",e);await d.updateDoc(n,a);return}catch(n){console.warn("Firebase profile update failed, saved locally only:",n)}}async function Ae(e){if(e.length<6||e.length>12)throw new Error("Password must be between 6 and 12 characters.");if(I&&!b)try{const a=_.currentUser;if(a){await D.updatePassword(a,e);return}}catch(a){console.warn("Firebase password change failed, falling back to local only:",a)}console.log("Local password updated successfully.")}async function Se(){if(I&&!b)try{const e=d.query(d.collection(v,"users")),a=await d.getDocs(e),o=[];return a.forEach(t=>o.push(t.data())),o}catch(e){console.warn("Firebase load all users failed, loading local:",e)}return w("users")}async function Te(e,a){await B(e,{role:a})}async function $e(e,a,o,t){const n={id:"req_"+Math.random().toString(36).substr(2,9),uid:e,username:a,reason:o,contactEmail:t,status:"pending",createdAt:new Date().toISOString(),adminReason:""},s=w("developer_requests");if(s.some(r=>r.uid===e&&r.status==="pending"))throw new Error("יש לך כבר פנייה ממתינה להפוך למפתח!");if(s.push(n),L("developer_requests",s),I&&!b)try{await d.addDoc(d.collection(v,"developer_requests"),n)}catch(r){console.warn("Firebase dev request submission failed, saved locally only:",r)}return n}async function Be(){if(I&&!b)try{const e=d.query(d.collection(v,"developer_requests"),d.orderBy("createdAt","desc")),a=await d.getDocs(e),o=[];return a.forEach(t=>o.push({id:t.id,...t.data()})),o}catch(e){console.warn("Firebase developer requests load failed, loading local:",e)}return w("developer_requests").sort((e,a)=>new Date(a.createdAt)-new Date(e.createdAt))}async function Ue(e,a,o){console.log("handleDeveloperRequest called with:",{requestId:e,status:a,adminReason:o});const t=w("developer_requests");console.log("Current requests:",t);const n=t.findIndex(i=>i.id===e||i.uid===e);console.log("Found request at index:",n);let s=null;if(n!==-1)t[n].status=a,t[n].adminReason=o,s=t[n],L("developer_requests",t),a==="approved"&&await B(t[n].uid,{role:"developer"});else throw console.error("Request not found with id:",e),new Error("Request not found - could not locate developer request with ID: "+e);if(I&&!b&&s)try{const i=d.collection(v,"developer_requests"),r=d.query(i,d.where("uid","==",s.uid)),c=await d.getDocs(r);if(!c.empty){const u=c.docs[0].id;await d.updateDoc(d.doc(v,"developer_requests",u),{status:a,adminReason:o})}}catch(i){console.warn("Firebase developer request handle failed, processed locally:",i)}if(s)return await Ne(s.contactEmail,s.username,"Developer Role Application",a,o),s;throw new Error("Request not found")}async function Re(e){const o={id:"greq_"+Math.random().toString(36).substr(2,9),...e,status:"pending",createdAt:new Date().toISOString(),adminSuggestions:""},t=w("game_requests");if(t.some(s=>s.githubUrl===e.githubUrl&&s.status==="rejected"))throw new Error("מאגר המשחק הזה נדחה בעבר ולא ניתן להגישו שוב.");if(t.push(o),L("game_requests",t),I&&!b)try{await d.addDoc(d.collection(v,"game_requests"),o)}catch(s){console.warn("Firebase game request failed, saved locally:",s)}return o}async function Ge(e){if(I&&!b)try{const a=d.query(d.collection(v,"game_requests"),d.where("developerUid","==",e)),o=await d.getDocs(a),t=[];return o.forEach(n=>t.push({id:n.id,...n.data()})),t}catch(a){console.warn("Firebase load dev game requests failed, loading local:",a)}return w("game_requests").filter(a=>a.developerUid===e)}async function Pe(){if(I&&!b)try{const e=d.query(d.collection(v,"game_requests")),a=await d.getDocs(e),o=[];return a.forEach(t=>o.push({id:t.id,...t.data()})),o}catch(e){console.warn("Firebase load pending game requests failed, loading local:",e)}return w("game_requests")}async function De(e,a,o=""){const t=w("game_requests"),n=t.findIndex(i=>i.id===e);let s=null;if(n!==-1&&(t[n].status=a,t[n].adminSuggestions=o,s=t[n],L("game_requests",t),a==="approved")){const i=w("games");if(s.type==="version_update"){const r=i.findIndex(c=>c.id===s.parentGameId);r!==-1&&(i[r].gameUrl=s.gameUrl,i[r].githubUrl=s.githubUrl,i[r].version=s.version,i[r].latestChangelog=s.changelog,L("games",i))}else{const r="game_"+Math.random().toString(36).substr(2,9),c={id:r,name:s.name,description:s.description,logoUrl:s.logoUrl,githubUrl:s.githubUrl,gameUrl:s.gameUrl||"",howToPlay:s.howToPlay,targetAudience:s.targetAudience,categories:s.categories,developerUid:s.developerUid,developerName:s.developerName,approved:!0,plays:0,createdAt:new Date().toISOString()};i.push(c),L("games",i),t[n].gameId=r,L("game_requests",t)}}if(I&&!b&&s)try{const i=d.collection(v,"game_requests"),r=d.query(i,d.where("id","==",e)),c=await d.getDocs(r);if(!c.empty){const u=c.docs[0].id;let f={status:a,adminSuggestions:o};if(a==="approved")if(s.type==="version_update"){const p=d.collection(v,"games"),k=d.query(p,d.where("id","==",s.parentGameId)),A=await d.getDocs(k);if(!A.empty){const x=A.docs[0].id;await d.updateDoc(d.doc(v,"games",x),{gameUrl:s.gameUrl,githubUrl:s.githubUrl,version:s.version,latestChangelog:s.changelog})}}else{const p="game_"+Math.random().toString(36).substr(2,9);await d.addDoc(d.collection(v,"games"),{id:p,name:s.name,description:s.description,logoUrl:s.logoUrl,githubUrl:s.githubUrl,gameUrl:s.gameUrl||"",howToPlay:s.howToPlay,targetAudience:s.targetAudience,categories:s.categories,developerUid:s.developerUid,developerName:s.developerName,approved:!0,plays:0,createdAt:new Date().toISOString()}),f.gameId=p}await d.updateDoc(d.doc(v,"game_requests",u),f)}}catch(i){console.warn("Firebase game request handling error, completed locally:",i)}if(s){try{const i=await Le(s.developerUid),r=i.twoFactorEmail||i.email||"developer@diggy.com";await Ne(r,s.developerName,`Game Submission: ${s.name}`,a,o)}catch(i){console.warn("Failed to send notification email:",i)}return s}throw new Error("Request not found")}async function _e(e,a){const o=w("game_requests"),t=o.findIndex(n=>n.id===e);if(t!==-1&&(o[t]={...o[t],...a,status:"pending",adminSuggestions:"",createdAt:new Date().toISOString()},L("game_requests",o)),I&&!b)try{const n=d.collection(v,"game_requests"),s=d.query(n,d.where("githubUrl","==",a.githubUrl)),i=await d.getDocs(s);if(!i.empty){const r=i.docs[0].id;await d.updateDoc(d.doc(v,"game_requests",r),{...a,status:"pending",adminSuggestions:"",createdAt:new Date().toISOString()})}}catch(n){console.warn("Firebase resubmission failed, updated locally:",n)}}async function Ce(e){const a={id:"game_"+Math.random().toString(36).substr(2,9),...e,approved:!0,createdAt:new Date().toISOString()},o=w("games");if(o.push(a),L("games",o),I&&!b)try{await d.addDoc(d.collection(v,"games"),a)}catch(t){console.warn("Firebase direct publish failed, published locally:",t)}return a}async function Me(){if(I&&!b)try{const e=d.query(d.collection(v,"games"),d.orderBy("createdAt","desc")),a=await d.getDocs(e),o=[];return a.forEach(t=>o.push({id:t.id,...t.data()})),o}catch(e){console.warn("Firebase load active games failed, loading local:",e)}return w("games")}const C=new Map;function Z(e){const a=Math.floor(1e5+Math.random()*9e5).toString(),o=Date.now()+5*60*1e3;return C.set(e,{code:a,expiresAt:o,attempts:0,maxAttempts:3}),a}function qe(e,a){const o=C.get(e);return o?Date.now()>o.expiresAt?(C.delete(e),{valid:!1,error:"קוד האימות פג תוקף. בקש קוד חדש."}):o.attempts>=o.maxAttempts?(C.delete(e),{valid:!1,error:"חרגת ממספר הניסיונות המקסימלי. נסה להתחבר מחדש."}):(o.attempts++,a===o.code?(C.delete(e),{valid:!0}):{valid:!1,error:`קוד שגוי. נותרו ${o.maxAttempts-o.attempts} ניסיונות.`}):{valid:!1,error:"קוד אימות לא תקף או פג תוקף"}}function ze(e){C.delete(e)}const q=new Map;async function Fe(e,a){if(!window.PublicKeyCredential)throw new Error("הדפדפן שלך לא תומך ב-WebAuthn");if(!await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable())throw new Error("לא נמצא מכשיר ביומטרי זמין במערכת");try{const t=new TextEncoder().encode(a),n=new Uint8Array(32);crypto.getRandomValues(n);const s={challenge:n,rp:{name:"DIGGY Games",id:window.location.hostname||"localhost"},user:{id:t,name:e,displayName:e},pubKeyCredParams:[{type:"public-key",alg:-7}],authenticatorSelection:{authenticatorAttachment:"platform",userVerification:"required"},timeout:6e4},i=await navigator.credentials.create({publicKey:s});if(!i)throw new Error("יצירת אישור ביומטרי נכשלה");const r=Array.from(new Uint8Array(i.rawId)),c={credentialId:r,publicKey:i.response.publicKey?Array.from(new Uint8Array(i.response.publicKey)):null,counter:0,username:e,uid:a,createdAt:Date.now()};return q.set(a,c),localStorage.setItem(`diggy_webauthn_${a}`,JSON.stringify(c)),{success:!0,credentialId:r}}catch(t){throw console.error("WebAuthn registration error:",t),new Error(`שגיאה ברישום ביומטרי: ${t.message}`)}}async function Oe(e,a){if(!window.PublicKeyCredential)throw new Error("הדפדפן שלך לא תומך ב-WebAuthn");let o=q.get(a);if(!o){const t=localStorage.getItem(`diggy_webauthn_${a}`);t&&(o=JSON.parse(t),q.set(a,o))}if(!o)throw new Error("לא נמצא אישור ביומטרי שמור. אנא הפעל זיהוי ביומטרי בהגדרות.");try{const t=new Uint8Array(32);crypto.getRandomValues(t);const n={challenge:t,allowCredentials:[{type:"public-key",id:new Uint8Array(o.credentialId)}],userVerification:"required",timeout:6e4};if(!await navigator.credentials.get({publicKey:n}))throw new Error("אימות ביומטרי נכשל");return o.counter++,localStorage.setItem(`diggy_webauthn_${a}`,JSON.stringify(o)),{success:!0,username:e}}catch(t){throw console.error("WebAuthn verification error:",t),new Error(`שגיאה באימות ביומטרי: ${t.message}`)}}function nt(e){return q.has(e)||localStorage.getItem(`diggy_webauthn_${e}`)!==null}function rt(e){q.delete(e),localStorage.removeItem(`diggy_webauthn_${e}`)}const He=[];async function je(e,a,o){const t={id:"email_"+Math.random().toString(36).substr(2,9),to:e,subject:a,html:o,sentAt:new Date().toLocaleTimeString(),timestamp:Date.now()};return t.status="simulated",console.log(`[Email Simulated] to: ${e} | subject: ${a}`),He.unshift(t),window.dispatchEvent(new CustomEvent("diggy-email-sent",{detail:t})),{success:!0,mode:"simulated",email:t}}async function Ne(e,a,o,t,n){const s={approved:"#00ff66",rejected:"#ff3366",improvement:"#ffcc00"},i={approved:"APPROVED / מאושר",rejected:"REJECTED / נדחה",improvement:"IMPROVEMENTS REQUESTED / דרוש שיפור"},r=s[t]||"#00ff66",c=i[t]||t.toUpperCase(),u=`
    <div style="background-color: #07080a; color: #ffffff; font-family: sans-serif; padding: 40px; border-radius: 12px; border: 2px solid ${r}; max-width: 600px; margin: 0 auto;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #00ff66; font-size: 36px; margin: 0;">DIGGY</h1>
      </div>
      
      <div style="background: rgba(255,255,255,0.03); border-radius: 8px; padding: 25px; border-left: 4px solid ${r}; margin-bottom: 25px;">
        <h2>היי ${a},</h2>
        <p>יש לנו עדכון לגבי הבקשה שלך באתר <strong>DIGGY</strong>!</p>
        
        <div style="margin: 20px 0; padding: 15px; background: rgba(0,0,0,0.3); border-radius: 6px; text-align: center;">
          <span style="color: #888888; display: block; margin-bottom: 5px;">סוג הפעולה</span>
          <strong style="font-size: 18px;">${o}</strong>
          <hr style="border: 0; border-top: 1px solid rgba(255,255,255,0.1); margin: 10px 0;">
          <span style="color: #888888; display: block; margin-bottom: 5px;">סטטוס בקשה</span>
          <strong style="font-size: 22px; color: ${r};">${c}</strong>
        </div>

        ${n?`
          <div style="background: rgba(255,255,255,0.05); padding: 15px; border-radius: 6px;">
            <strong style="color: ${r}; display: block; margin-bottom: 8px;">הערות מנהל המערכת:</strong>
            <p style="margin: 0; color: #eeeeee;">${n}</p>
          </div>
        `:""}
      </div>
    </div>
  `;await je(e,`DIGGY - עדכון בקשת ${o}`,u)}async function Ye(e){const a=w("games"),o=a.findIndex(t=>t.id===e);if(o!==-1&&(a[o].plays=(a[o].plays||0)+1,L("games",a)),I&&!b)try{const t=d.collection(v,"games"),n=d.query(t,d.where("id","==",e)),s=await d.getDocs(n);if(s.empty){const i=d.doc(v,"games",e),r=await d.getDoc(i);if(r.exists()){const c=r.data().plays||0;await d.updateDoc(i,{plays:c+1})}}else{const i=s.docs[0].id,r=s.docs[0].data().plays||0;await d.updateDoc(d.doc(v,"games",i),{plays:r+1})}}catch(t){console.warn("Firebase record gameplay failed:",t)}}async function Ve(e,a){const t={id:"greq_"+Math.random().toString(36).substr(2,9),parentGameId:e,type:"version_update",status:"pending",createdAt:new Date().toISOString(),adminSuggestions:"",...a},n=w("game_requests");if(n.push(t),L("game_requests",n),I&&!b)try{await d.addDoc(d.collection(v,"game_requests"),t)}catch(s){console.warn("Firebase game version request failed, saved locally:",s)}return t}const lt=Object.freeze(Object.defineProperty({__proto__:null,get auth(){return _},changeUserPassword:Ae,changeUserRole:Te,checkLoginRateLimit:he,clear2FACode:ze,clearLoginAttempts:xe,directPublishGame:Ce,generateAndStore2FACode:Z,getActiveGames:Me,getAllUsers:Se,getDeveloperGameRequests:Ge,getDeveloperRequests:Be,getPendingGameRequests:Pe,getUserProfile:Le,handleDeveloperRequest:Ue,handleGameRequest:De,hasWebAuthnCredential:nt,logInUser:ie,logOutUser:ke,onAuthStateListener:Ee,recordGamePlay:Ye,recordLoginAttempt:be,registerWebAuthnCredential:Fe,removeWebAuthnCredential:rt,sanitizeInput:H,sendEmailViaResend:je,signUpUser:Ie,simulatedEmails:He,submitDeveloperRequest:$e,submitGameRequest:Re,submitGameVersionRequest:Ve,updateAndResubmitGameRequest:_e,updateUserProfile:B,validateEmail:we,validatePasswordStrength:ae,validateUsername:oe,verify2FACode:qe,verifyWebAuthnCredential:Oe},Symbol.toStringTag,{value:"Module"}));let l={user:null,currentRoute:"#/",games:[],theme:"#00ff66",activePromoIndex:0,promoTimer:null,currentGame:null,gameInstance:null,recentEmails:[]};const V=[{id:"preset_snake",name:"Neon Snake",description:"The classic retro arcade game! Guide the neon snake to consume glowing particles, but avoid hitting yourself or the boundaries.",logoUrl:"https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60",githubUrl:"https://github.com/diggy-games/neon-snake",howToPlay:"Use the arrow keys or WASD to navigate the snake. Eat green glowing particles to grow. The game ends if you collide with the walls or your own tail.",targetAudience:"Everyone (All Ages)",categories:["RETRO","RPG"],developerUid:"system",developerName:"DIGGY Core Devs",approved:!0},{id:"preset_bricks",name:"Brick Breaker Glow",description:"Bounce the ball and destroy the neon bricks in this fast-paced arcade retro classic. Collect multipliers and clear the screen!",logoUrl:"https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=150&auto=format&fit=crop&q=60",githubUrl:"https://github.com/diggy-games/brick-breaker-glow",howToPlay:"Move the paddle left and right using your Mouse or Left/Right arrow keys. Prevent the glowing orb from falling. Break all the colored neon bricks to win.",targetAudience:"Kids 6+",categories:["RETRO","MULTIPLAYER"],developerUid:"system",developerName:"DIGGY Core Devs",approved:!0},{id:"preset_evader",name:"Space Laser Evader",description:"Navigate your starfighter through an intense neon asteroid field. Shoot incoming targets and survive the onslaught!",logoUrl:"https://images.unsplash.com/photo-1542751371-adc38448a05e?w=150&auto=format&fit=crop&q=60",githubUrl:"https://github.com/diggy-games/space-laser-evader",howToPlay:"Move Left/Right using the Arrow keys or A/D keys. Fire your laser cannon using the Spacebar. Avoid colliding with space debris.",targetAudience:"Teens 10+",categories:["RPG","RETRO"],developerUid:"system",developerName:"DIGGY Core Devs",approved:!0}],dt={"#/":We,"#/login":mt,"#/dev":ne,"#/dev-docs":It,"#/admin":N,"#/settings":Ze,"#/game/:id":Je};function S(e){window.location.hash=e}async function ge(){const e=window.location.hash||"#/";if(l.currentRoute=e,l.gameInstance&&l.gameInstance.stop&&(l.gameInstance.stop(),l.gameInstance=null),e.startsWith("#/game/")){const o=e.split("#/game/")[1];await Je(o),pe("");return}const a=dt[e]||We;pe(e),await a()}function pe(e){document.querySelectorAll(".nav-item").forEach(a=>{a.getAttribute("data-route")===e?a.classList.add("active"):a.classList.remove("active")})}window.addEventListener("DOMContentLoaded",async()=>{window.addEventListener("hashchange",ge),window.addEventListener("diggy-email-sent",e=>{l.recentEmails.unshift(e.detail),wt()}),xt(),W(),Ee(async e=>{e?(l.user=e,te(e.customTheme||"#00ff66"),j(),W()):(l.user=null,te("#00ff66"),j(),W()),ge()}),await se()});function W(){const e=document.getElementById("sidebar-nav-menu");if(!e)return;let a=`
    <div class="nav-item" id="home-nav-btn" data-route="#/">
      <i class="fas fa-home"></i>
      <span>מסך הבית</span>
    </div>
  `;a+=`
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
  `,l.user&&((l.user.role==="developer"||l.user.role==="admin")&&(a+=`
        <div class="nav-section-title">פיתוח</div>
        <div class="nav-item" id="dev-nav-btn" data-route="#/dev">
          <i class="fas fa-code"></i>
          <span>פאנל מפתח</span>
        </div>
        <div class="nav-item" id="dev-docs-btn" data-route="#/dev-docs">
          <i class="fas fa-book"></i>
          <span>מדריך מפתחים</span>
        </div>
      `),l.user.role==="admin"&&(a+=`
        <div class="nav-item" id="admin-nav-btn" data-route="#/admin">
          <i class="fas fa-shield-alt"></i>
          <span>ניהול מערכת</span>
        </div>
      `)),e.innerHTML=a,document.getElementById("home-nav-btn").addEventListener("click",()=>{S("#/")}),e.querySelectorAll("[data-category]").forEach(s=>{s.addEventListener("click",()=>{const i=s.getAttribute("data-category");S("#/"),setTimeout(()=>{X(i),document.querySelectorAll(".category-tabs button").forEach(c=>{c.getAttribute("data-category")===i?(c.classList.add("active-cat"),c.style.borderColor="var(--accent-color)",c.style.background="var(--accent-dim)"):(c.classList.remove("active-cat"),c.style.borderColor="rgba(255, 255, 255, 0.05)",c.style.background="transparent")})},150)})});const o=document.getElementById("dev-nav-btn");o&&o.addEventListener("click",()=>{S("#/dev")});const t=document.getElementById("dev-docs-btn");t&&t.addEventListener("click",()=>{S("#/dev-docs")});const n=document.getElementById("admin-nav-btn");n&&n.addEventListener("click",()=>{S("#/admin")})}async function se(){try{const e=await Me();l.games=[...V,...e.filter(a=>!V.some(o=>o.id===a.id))]}catch(e){console.warn("Could not pull games from Firebase, using presets only:",e),l.games=[...V]}}async function We(){const e=document.getElementById("main-container");e.innerHTML=`
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
  `,ct(),ut(),X("ALL"),Ke();const a=e.querySelectorAll(".category-tabs button");a.forEach(o=>{o.addEventListener("click",()=>{a.forEach(t=>{t.classList.remove("active-cat"),t.style.borderColor="rgba(255, 255, 255, 0.05)",t.style.background="transparent"}),o.classList.add("active-cat"),o.style.borderColor="var(--accent-color)",o.style.background="var(--accent-dim)",X(o.getAttribute("data-category"))})})}function ct(){const e=document.getElementById("header-auth-actions");e&&(l.user?(e.innerHTML=`
      <div style="display: flex; gap: 10px; align-items: center;">
        <span style="color: var(--text-muted); font-size: 14px;">שלום, <strong>${l.user.username}</strong>!</span>
        <button class="btn btn-secondary" id="logout-btn"><i class="fas fa-sign-out-alt"></i> התנתק</button>
      </div>
    `,document.getElementById("logout-btn").addEventListener("click",async()=>{await ke(),S("#/login")})):e.innerHTML=`
      <button class="btn btn-primary" onclick="window.location.hash='#/login'"><i class="fas fa-sign-in-alt"></i> התחבר / הרשם</button>
    `)}function ut(){const e=document.getElementById("promo-slider");if(!e)return;const a=l.games.slice(0,3);if(a.length===0){e.style.display="none";return}clearInterval(l.promoTimer),e.innerHTML=a.map((o,t)=>`
    <div class="slide-item ${t===0?"active":""}" style="background-image: url('${o.logoUrl}')" data-index="${t}">
      <div class="slide-overlay"></div>
      <div class="slide-content">
        <span class="slide-tag">משחק מומלץ!</span>
        <h2 class="slide-title">${o.name}</h2>
        <p class="slide-desc">${o.description}</p>
        <button class="btn btn-primary play-now-promo" data-id="${o.id}"><i class="fas fa-play"></i> שחק עכשיו</button>
      </div>
    </div>
  `).join(""),e.querySelectorAll(".play-now-promo").forEach(o=>{o.addEventListener("click",()=>{const t=o.getAttribute("data-id");S(`#/game/${t}`)})}),l.activePromoIndex=0,l.promoTimer=setInterval(()=>{const o=e.querySelectorAll(".slide-item");o.length&&(o[l.activePromoIndex].classList.remove("active"),l.activePromoIndex=(l.activePromoIndex+1)%o.length,o[l.activePromoIndex].classList.add("active"))},5e3)}function X(e){const a=document.getElementById("home-games-grid");if(!a)return;console.log("renderGamesGrid called with category:",e),console.log("Total games:",l.games.length),console.log("Games with categories:",l.games.filter(t=>t.categories&&t.categories.length>0).length);const o=e==="ALL"?l.games:l.games.filter(t=>t.categories&&t.categories.includes(e));if(console.log("Filtered games count:",o.length),console.log("Filtered games:",o.map(t=>({name:t.name,categories:t.categories}))),o.length===0){a.innerHTML='<div style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 40px 0;">אין משחקים בקטגוריה זו כרגע.</div>';return}a.innerHTML=o.map(t=>Q(t)).join(""),ee(a)}function Q(e){const a=l.user&&l.user.favorites&&l.user.favorites.includes(e.id),o=a?"active":"",t=a?"fas fa-heart":"far fa-heart";return`
    <div class="game-card" data-id="${e.id}">
      <div class="game-card-image" style="background-image: url('${e.logoUrl}')">
        ${e.logoUrl?"":'<i class="fas fa-gamepad"></i>'}
        <button class="favorite-btn ${o}" data-id="${e.id}">
          <i class="${t}"></i>
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
  `}function ee(e){e.querySelectorAll(".play-game-btn").forEach(a=>{a.addEventListener("click",o=>{o.stopPropagation();const t=a.getAttribute("data-id");S(`#/game/${t}`)})}),e.querySelectorAll(".favorite-btn").forEach(a=>{a.addEventListener("click",async o=>{if(o.stopPropagation(),!l.user){m("אנא התחבר כדי לשמור משחקים מועדפים!","warning"),S("#/login");return}const t=a.getAttribute("data-id");let n=[...l.user.favorites||[]];n.includes(t)?(n=n.filter(s=>s!==t),a.classList.remove("active"),a.querySelector("i").className="far fa-heart",m("הוסר מהמועדפים","info")):(n.push(t),a.classList.add("active"),a.querySelector("i").className="fas fa-heart",m("נוסף למועדפים! ❤️","success")),l.user.favorites=n,await B(l.user.uid,{favorites:n}),Ke()})})}function Ke(){const e=document.getElementById("recent-played-section"),a=document.getElementById("recent-games-grid"),o=document.getElementById("favorites-section"),t=document.getElementById("favorite-games-grid");if(!l.user){e&&(e.style.display="none"),o&&(o.style.display="none");return}const n=l.user.recentlyPlayed||[];if(n.length>0&&a){const i=l.games.filter(r=>n.includes(r.id));i.length>0?(e.style.display="block",a.innerHTML=i.map(r=>Q(r)).join(""),ee(a)):e.style.display="none"}else e&&(e.style.display="none");const s=l.user.favorites||[];if(s.length>0&&t){const i=l.games.filter(r=>s.includes(r.id));i.length>0?(o.style.display="block",t.innerHTML=i.map(r=>Q(r)).join(""),ee(t)):o.style.display="none"}else o&&(o.style.display="none")}function mt(){const e=document.getElementById("main-container");e.innerHTML=`
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
  `;let a=!1;const o=document.getElementById("login-form"),t=document.getElementById("toggle-auth-mode"),n=document.getElementById("auth-panel-title"),s=document.getElementById("auth-biometric-btn");t.addEventListener("click",i=>{i.preventDefault(),a=!a,a?(n.textContent="רישום חשבון DIGGY חדש",o.querySelector('button[type="submit"]').innerHTML='<i class="fas fa-user-plus"></i> צור חשבון',t.textContent="התחבר לחשבון קיים",s.style.display="none"):(n.textContent="כניסה למערכת DIGGY",o.querySelector('button[type="submit"]').innerHTML='<i class="fas fa-rocket"></i> התחבר',t.textContent="צור חשבון חדש",s.style.display="flex")}),o.addEventListener("submit",async i=>{i.preventDefault();const r=H(document.getElementById("auth-username").value),c=document.getElementById("auth-password").value,u=oe(r);if(!u.valid){m(u.errors[0],"danger");return}const f=ae(c);if(!f.valid){m(f.errors[0],"danger");return}if(!a){const p=he(r);if(!p.allowed){m(`יותר מדי ניסיונות כניסה. נסה שוב בעוד ${p.remainingTime} דקות.`,"danger");return}}h(!0);try{if(a){const p=await Ie(r,c);m("החשבון נוצר בהצלחה! ברוך הבא ל-DIGGY 🎉","success"),S("#/")}else{be(r);const p=await ie(r,c);if(xe(r),p.twoFactorEnabled){h(!1),gt(p);return}m("התחברת בהצלחה! 🎮","success"),S("#/")}}catch(p){m(p.message,"danger")}finally{h(!1)}}),s.addEventListener("click",()=>{pt()})}function gt(e){const a=Z(e.uid),o=`
    <div style="background: #07080a; color: #fff; padding: 30px; border-radius: 12px; border: 1px solid #00ff66; font-family: sans-serif; text-align: center;">
      <h2 style="color: #00ff66;">DIGGY Security Verification</h2>
      <p>שלום ${e.username}, קיבלנו בקשת התחברות לחשבון שלך.</p>
      <div style="font-size: 32px; font-weight: bold; background: rgba(0,255,102,0.1); border: 1px dashed #00ff66; padding: 15px; margin: 20px auto; letter-spacing: 5px; width: 200px; border-radius: 6px;">
        ${a}
      </div>
      <p style="color: #888;">הקוד תקף ל-5 דקות הקרובות. אנא אל תשתף קוד זה עם אף אחד.</p>
    </div>
  `;F(()=>Promise.resolve().then(()=>lt),void 0).then(async t=>{const n=e.twoFactorEmail||e.email;await t.sendEmailViaResend(n,"DIGGY - קוד אימות דו-שלבי",o);const s=document.getElementById("modal-overlay"),i=document.getElementById("modal-title"),r=document.getElementById("modal-body");i.textContent="אימות דו-שלבי (2FA)",r.innerHTML=`
      <div style="text-align: center; display: flex; flex-direction: column; gap: 15px;">
        <p>קוד אימות נשלח לאימייל שלך: <strong style="color: var(--accent-color);">${n}</strong></p>
        <p style="font-size: 13px; color: var(--text-muted);">הזן את 6 הספרות כדי להשלים את ההתחברות:</p>
        <input type="text" id="twofactor-input" max-length="6" placeholder="000000" style="text-align: center; font-size: 24px; letter-spacing: 8px; font-family: var(--font-display); width: 200px; margin: 10px auto;">
        <button class="btn btn-primary" id="verify-2fa-btn" style="justify-content: center;">אמת קוד וכנס</button>
        <button class="btn btn-secondary" id="resend-2fa-btn" style="justify-content: center; font-size: 12px;">שלח קוד חדש</button>
      </div>
    `,s.classList.add("active"),document.getElementById("verify-2fa-btn").addEventListener("click",()=>{const c=document.getElementById("twofactor-input").value.trim(),u=qe(e.uid,c);u.valid?(s.classList.remove("active"),m("הקוד אומת! ברוך הבא ל-DIGGY 🎉","success"),S("#/")):(m(u.error,"danger"),u.error.includes("חרגת")&&setTimeout(()=>{s.classList.remove("active"),S("#/login")},2e3))}),document.getElementById("resend-2fa-btn").addEventListener("click",()=>{ze(e.uid);const c=Z(e.uid),u=o.replace(a,c);t.sendEmailViaResend(n,"DIGGY - קוד אימות דו-שלבי (חדש)",u),m("קוד חדש נשלח לאימייל!","info")})})}async function pt(){const e=document.getElementById("modal-overlay"),a=document.getElementById("modal-title"),o=document.getElementById("modal-body");a.textContent="סורק טביעת אצבע ביומטרי",o.innerHTML=`
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
  `,e.classList.add("active");let t=localStorage.getItem("diggy_bio_username"),n=localStorage.getItem("diggy_bio_uid");setTimeout(async()=>{const s=document.getElementById("bio-status"),i=document.getElementById("bio-widget");if(!t||!n){i.classList.remove("scanning"),i.style.color="var(--danger-color)",s.innerHTML="שגיאה: זיהוי ביומטרי לא מוגדר!",s.style.color="var(--danger-color)",setTimeout(()=>{e.classList.remove("active"),m("לא הוגדרה כניסה ביומטרית בחשבון זה! היכנס רגיל והפעל אותה בהגדרות.","warning")},1500);return}try{(await Oe(t,n)).success&&(i.classList.remove("scanning"),i.style.color="#00ff66",s.innerHTML="סריקה הושלמה! מאושר",setTimeout(async()=>{e.classList.remove("active");const c=await ie(t,"auth_biometric_token");m(`ברוך שובך ביומטרי, ${t}!`,"success"),S("#/")},1e3))}catch(r){console.warn("WebAuthn verification failed:",r),i.classList.remove("scanning"),i.style.color="var(--danger-color)",s.innerHTML="סריקה נכשלה",s.style.color="var(--danger-color)",setTimeout(()=>{e.classList.remove("active"),m("שגיאה בכניסה ביומטרית: "+r.message,"danger")},1500)}},2e3)}async function ne(){const e=document.getElementById("main-container");if(!l.user||l.user.role!=="developer"&&l.user.role!=="admin"){e.innerHTML=`
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
  `;try{const a=await Ge(l.user.uid),o=document.getElementById("dev-games-list-body");a.length===0?o.innerHTML=`
        <tr>
          <td colspan="7" style="text-align: center; color: var(--text-muted); padding: 40px;">
            <i class="fas fa-folder-open" style="font-size: 32px; display: block; margin-bottom: 10px;"></i>
            טרם הגשת משחקים לאתר. לחץ על "הגש משחק חדש" כדי להתחיל!
          </td>
        </tr>
      `:(o.innerHTML=a.map(t=>{let n="";t.status==="pending"?n='<span class="badge badge-pending">ממתין לאישור</span>':t.status==="approved"?n='<span class="badge badge-approved">אושר בהצלחה</span>':t.status==="rejected"?n='<span class="badge badge-rejected">נדחה</span>':t.status==="improvement"&&(n='<span class="badge badge-improvement">דרוש תיקון</span>');const s=t.status==="improvement"?`<button class="btn btn-secondary resubmit-btn" data-id="${t.id}" style="padding: 4px 10px; font-size: 11px;"><i class="fas fa-edit"></i> ערוך והגש שנית</button>`:t.status==="approved"?`<div style="display: flex; gap: 6px;">
                  <button class="btn btn-secondary view-stats-btn" data-id="${t.id}" style="padding: 4px 8px; font-size: 11px; background: rgba(0, 255, 102, 0.05); color: var(--accent-color); border-color: rgba(0,255,102,0.2);"><i class="fas fa-chart-line"></i> סטטיסטיקות</button>
                  <button class="btn btn-primary new-version-btn" data-id="${t.id}" style="padding: 4px 8px; font-size: 11px;"><i class="fas fa-code-branch"></i> גרסה חדשה</button>
                 </div>`:'<span style="color: var(--text-dark); font-size: 12px;">אין פעולות</span>';return`
          <tr data-raw='${JSON.stringify(t)}'>
            <td><img src="${t.logoUrl||""}" onerror="this.src='https://placehold.co/40x40/12161e/00ff66?text=G'" style="width: 40px; height: 40px; border-radius: 6px; object-fit: cover;"></td>
            <td style="font-weight: bold; color: var(--accent-color);">${t.name}</td>
            <td>${t.categories?t.categories.join(", "):""}</td>
            <td><a href="${t.githubUrl}" target="_blank" style="color: #0096ff; text-decoration: underline; font-size: 12px;">קוד מאגר</a></td>
            <td>${n}</td>
            <td style="max-width: 200px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${t.adminSuggestions||""}">${t.adminSuggestions||'<span style="color: var(--text-dark);">אין</span>'}</td>
            <td>${s}</td>
          </tr>
        `}).join(""),o.querySelectorAll(".resubmit-btn").forEach(t=>{t.addEventListener("click",()=>{const n=t.closest("tr"),s=JSON.parse(n.getAttribute("data-raw"));fe(s)})}),o.querySelectorAll(".view-stats-btn").forEach(t=>{t.addEventListener("click",()=>{const n=t.closest("tr"),s=JSON.parse(n.getAttribute("data-raw"));ft(s)})}),o.querySelectorAll(".new-version-btn").forEach(t=>{t.addEventListener("click",()=>{const n=t.closest("tr"),s=JSON.parse(n.getAttribute("data-raw"));yt(s)})}))}catch(a){m("שגיאה בטעינת משחקי מפתח: "+a.message,"danger")}document.getElementById("dev-submit-game-btn").addEventListener("click",()=>{fe()})}function fe(e=null){const a=document.getElementById("modal-overlay"),o=document.getElementById("modal-title"),t=document.getElementById("modal-body");o.textContent=e?`עריכת והגשת המשחק: ${e.name}`:"הגשת משחק חדש ל-DIGGY",t.innerHTML=`
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
  `,a.classList.add("active");const n=document.getElementById("game-submit-form");n.addEventListener("submit",async s=>{s.preventDefault();const i=n.querySelectorAll('input[name="game-cats"]:checked');if(i.length===0){m("עליך לבחור לפחות קטגוריה אחת (מקסימום 3)!","warning");return}if(i.length>3){m("ניתן לבחור עד 3 קטגוריות בלבד!","warning");return}const r=Array.from(i).map(u=>u.value),c={name:document.getElementById("game-name").value,description:document.getElementById("game-desc").value,logoUrl:document.getElementById("game-logo").value,githubUrl:document.getElementById("game-github").value,gameUrl:document.getElementById("game-url").value,howToPlay:document.getElementById("game-how").value,targetAudience:document.getElementById("game-audience").value,categories:r,developerUid:l.user.uid,developerName:l.user.username};h(!0);try{e?(await _e(e.id,c),m("בקשת המשחק עודכנה ונשלחה מחדש לאישור! 🚀","success")):(await Re(c),m("המשחק נשלח לאישור ה-Admin! יישלח אליך עדכון במייל. 📧","success")),a.classList.remove("active"),ne()}catch(u){m(u.message,"danger")}finally{h(!1)}})}function ft(e){const a=document.getElementById("modal-overlay"),o=document.getElementById("modal-title"),t=document.getElementById("modal-body");o.textContent=`סטטיסטיקות משחק: ${e.name}`;const n=l.games.find(f=>f.githubUrl===e.githubUrl||f.id===e.gameId),s=n&&n.plays||0;let i=0;for(let f=0;f<e.id.length;f++)i+=e.id.charCodeAt(f);const r=(4.5+i%6*.1).toFixed(1),c=(1.5+(s?s%3*.4:.8)).toFixed(1),u=(s*.15).toFixed(2);t.innerHTML=`
    <div style="display: flex; flex-direction: column; gap: 20px; padding: 10px 0;">
      <div style="display: flex; align-items: center; gap: 15px; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 15px;">
        <img src="${e.logoUrl}" onerror="this.src='https://placehold.co/80x80/12161e/00ff66?text=G'" style="width: 70px; height: 70px; border-radius: 10px; object-fit: cover; border: 2px solid var(--accent-color); box-shadow: var(--border-glow);">
        <div>
          <h3 style="font-size: 20px; color: #fff; font-family: var(--font-display);">${e.name}</h3>
          <span class="doc-badge">${e.categories?e.categories.join(", "):""}</span>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
        <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 12px; padding: 15px; text-align: center; box-shadow: var(--border-glow);">
          <i class="fas fa-play" style="font-size: 24px; color: var(--accent-color); margin-bottom: 8px;"></i>
          <div style="font-size: 12px; color: var(--text-muted); text-transform: uppercase;">כמות משחקים (Plays)</div>
          <div style="font-size: 28px; font-weight: bold; color: var(--accent-color); margin-top: 5px; font-family: var(--font-display);">${s}</div>
        </div>

        <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 12px; padding: 15px; text-align: center; box-shadow: var(--border-glow);">
          <i class="fas fa-star" style="font-size: 24px; color: #ffd700; margin-bottom: 8px;"></i>
          <div style="font-size: 12px; color: var(--text-muted); text-transform: uppercase;">דירוג שחקנים</div>
          <div style="font-size: 28px; font-weight: bold; color: #fff; margin-top: 5px; font-family: var(--font-display);">${r} <span style="font-size: 14px; color: var(--text-muted);">/ 5.0</span></div>
        </div>

        <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 12px; padding: 15px; text-align: center; box-shadow: var(--border-glow);">
          <i class="fas fa-hourglass-half" style="font-size: 24px; color: #70d6ff; margin-bottom: 8px;"></i>
          <div style="font-size: 12px; color: var(--text-muted); text-transform: uppercase;">זמן משחק ממוצע</div>
          <div style="font-size: 22px; font-weight: bold; color: #fff; margin-top: 10px; font-family: var(--font-display);">${c} דק'</div>
        </div>

        <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 12px; padding: 15px; text-align: center; box-shadow: var(--border-glow);">
          <i class="fas fa-coins" style="font-size: 24px; color: #00ff66; margin-bottom: 8px;"></i>
          <div style="font-size: 12px; color: var(--text-muted); text-transform: uppercase;">רווחים שנצברו</div>
          <div style="font-size: 22px; font-weight: bold; color: #00ff66; margin-top: 10px; font-family: var(--font-display);">${u} ₪</div>
        </div>
      </div>

      <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 12px; padding: 15px; font-size: 13px; line-height: 1.5; color: var(--text-muted);">
        <i class="fas fa-circle-info" style="color: var(--accent-color); margin-left: 5px;"></i>
        הרווחים מחושבים לפי מפתח תגמול של 0.15 ₪ לכל משחק פעיל של שחקן רשום באתר. תשלומים מועברים בסוף כל חודש קלנדרי.
      </div>
    </div>
  `,a.classList.add("active")}function yt(e){const a=document.getElementById("modal-overlay"),o=document.getElementById("modal-title"),t=document.getElementById("modal-body");o.textContent=`הגשת גרסה חדשה: ${e.name}`,t.innerHTML=`
    <form id="game-version-form">
      <div style="background: rgba(255, 255, 255, 0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 8px; padding: 12px; margin-bottom: 15px; font-size: 13px; color: var(--text-muted);">
        <i class="fas fa-info-circle" style="color: var(--accent-color); margin-left: 5px;"></i>
        אתה מגיש כעת עדכון גרסה למשחק פעיל. בקשה זו תועבר לבדיקה של מנהל המערכת (Admin) ותעודכן באתר לאחר אישורה.
      </div>

      <div class="form-group">
        <label>שם המשחק (לא ניתן לשינוי)</label>
        <input type="text" id="version-game-name" value="${e.name}" disabled style="background: rgba(255,255,255,0.02); color: var(--text-muted); cursor: not-allowed;">
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
        <input type="url" id="version-url" value="${e.gameUrl||""}" required placeholder="https://username.github.io/my-game/">
      </div>

      <div class="form-group">
        <label>קישור מעודכן למאגר GitHub (קוד המשחק)</label>
        <input type="url" id="version-github" value="${e.githubUrl||""}" required placeholder="https://github.com/user/repo">
      </div>

      <button type="submit" class="btn btn-primary" style="width: 100%; justify-content: center; margin-top: 15px;">
        <i class="fas fa-paper-plane"></i> שלח גרסה חדשה לאישור
      </button>
    </form>
  `,a.classList.add("active"),document.getElementById("game-version-form").addEventListener("submit",async s=>{s.preventDefault();const i={version:document.getElementById("version-number").value.trim(),changelog:document.getElementById("version-changelog").value.trim(),gameUrl:document.getElementById("version-url").value.trim(),githubUrl:document.getElementById("version-github").value.trim(),developerUid:l.user.uid,developerName:l.user.username,name:e.name,logoUrl:e.logoUrl,description:e.description};h(!0);try{await Ve(e.gameId||e.id,i),m("גרסת המשחק החדשה נשלחה לאישור המנהל! 🚀","success"),a.classList.remove("active"),ne()}catch(r){m(r.message,"danger")}finally{h(!1)}})}async function N(){const e=document.getElementById("main-container");if(!l.user||l.user.role!=="admin"){e.innerHTML=`
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
  `,document.getElementById("admin-direct-upload-btn").addEventListener("click",()=>{vt()});try{const a=await Be(),o=document.getElementById("admin-dev-requests-body");a.length===0?o.innerHTML='<tr><td colspan="6" style="text-align: center; color: var(--text-muted); padding: 30px;">אין פניות מפתחים פעילות.</td></tr>':(o.innerHTML=a.map(t=>{const n=t.status==="pending";let s="";t.status==="approved"?s='<span class="badge badge-approved">אושר</span>':t.status==="rejected"?s='<span class="badge badge-rejected">נדחה</span>':s='<span class="badge badge-pending">ממתין</span>';const i=n?`
            <div style="display: flex; gap: 8px;">
              <button class="btn btn-primary admin-approve-dev" data-id="${t.id}" style="padding: 4px 8px; font-size: 10px;"><i class="fas fa-check"></i> אישור</button>
              <button class="btn btn-danger admin-reject-dev" data-id="${t.id}" style="padding: 4px 8px; font-size: 10px;"><i class="fas fa-times"></i> דחייה</button>
            </div>
          `:'<span style="color: var(--text-dark); font-size: 12px;">נסגר</span>';return`
          <tr>
            <td style="font-weight: bold;">${t.username}</td>
            <td>${t.contactEmail}</td>
            <td style="max-width: 250px; font-size: 13px;" title="${t.reason}">${t.reason}</td>
            <td>${new Date(t.createdAt).toLocaleDateString()}</td>
            <td>${s}</td>
            <td>${i}</td>
          </tr>
        `}).join(""),o.querySelectorAll(".admin-approve-dev").forEach(t=>{t.addEventListener("click",()=>M(t.getAttribute("data-id"),"approved","dev"))}),o.querySelectorAll(".admin-reject-dev").forEach(t=>{t.addEventListener("click",()=>M(t.getAttribute("data-id"),"rejected","dev"))}))}catch(a){console.error("Error loading dev requests:",a)}try{const a=await Pe(),o=document.getElementById("admin-game-requests-body");a.length===0?o.innerHTML='<tr><td colspan="6" style="text-align: center; color: var(--text-muted); padding: 30px;">אין משחקים הממתינים לאישור.</td></tr>':(o.innerHTML=a.map(t=>{const n=t.status==="pending";let s="";t.status==="approved"?s='<span class="badge badge-approved">אושר</span>':t.status==="rejected"?s='<span class="badge badge-rejected">נדחה</span>':t.status==="improvement"&&(s='<span class="badge badge-improvement">הצעת שיפור</span>');const i=t.type==="version_update"?`<span class="badge badge-pending" style="background: rgba(112, 214, 255, 0.15); color: #70d6ff; border-color: rgba(112,214,255,0.3); margin-top: 4px; display: inline-block;">עדכון גרסה (${t.version})</span>`:"",r=n?`
            <div style="display: flex; gap: 6px; flex-direction: column;">
              <button class="btn btn-primary admin-approve-game" data-id="${t.id}" style="padding: 4px 8px; font-size: 10px; justify-content: center;"><i class="fas fa-check"></i> אישור והעלאה</button>
              <button class="btn btn-secondary admin-improve-game" data-id="${t.id}" style="padding: 4px 8px; font-size: 10px; justify-content: center; border-color: #0096ff; color: #0096ff;"><i class="fas fa-comment-dots"></i> הצעות לשיפור</button>
              <button class="btn btn-danger admin-reject-game" data-id="${t.id}" style="padding: 4px 8px; font-size: 10px; justify-content: center;"><i class="fas fa-times"></i> דחייה מוחלטת</button>
            </div>
          `:`<div style="display: flex; flex-direction: column; gap: 4px;">${s}<span style="color: var(--text-muted); font-size: 11px;">${t.adminSuggestions||""}</span></div>`;return`
          <tr>
            <td><strong>${t.developerName}</strong></td>
            <td>
              <div style="display: flex; align-items: center; gap: 10px;">
                <img src="${t.logoUrl}" style="width: 40px; height: 40px; border-radius: 6px; object-fit: cover;">
                <div>
                  <div style="font-weight: bold; color: var(--accent-color);">${t.name} ${i}</div>
                  <div style="font-size: 11px; color: var(--text-muted);">איך משחקים: ${t.howToPlay}</div>
                </div>
              </div>
            </td>
            <td>${t.categories?t.categories.join(", "):""}</td>
            <td><a href="${t.githubUrl}" target="_blank" style="color: #0096ff; text-decoration: underline; font-size: 12px;">מקור קוד</a></td>
            <td>
              ${t.type==="version_update"?`<div style="font-size: 12px; color: var(--accent-color);"><strong>מה חדש בגרסה:</strong> ${t.changelog}</div>`:`<div style="font-size: 12px;"><strong>מיועד ל:</strong> ${t.targetAudience}</div>
                   <div style="font-size: 12px; color: var(--text-muted); max-width: 200px; overflow: hidden; text-overflow: ellipsis;">${t.description}</div>`}
            </td>
            <td>${r}</td>
          </tr>
        `}).join(""),o.querySelectorAll(".admin-approve-game").forEach(t=>{t.addEventListener("click",()=>M(t.getAttribute("data-id"),"approved","game"))}),o.querySelectorAll(".admin-improve-game").forEach(t=>{t.addEventListener("click",()=>M(t.getAttribute("data-id"),"improvement","game"))}),o.querySelectorAll(".admin-reject-game").forEach(t=>{t.addEventListener("click",()=>M(t.getAttribute("data-id"),"rejected","game"))}))}catch(a){console.error("Error loading games queue:",a)}try{const a=await Se(),o=document.getElementById("admin-users-list-body");a.length===0?o.innerHTML='<tr><td colspan="6" style="text-align: center; color: var(--text-muted); padding: 30px;">לא נמצאו חשבונות רשומים.</td></tr>':(o.innerHTML=a.map(t=>{const n=t.createdAt?new Date(t.createdAt).toLocaleDateString():"לא ידוע",s=t.twoFactorEnabled?'<span style="color: var(--accent-color); font-size: 11px;"><i class="fas fa-check-circle"></i> פעיל</span>':'<span style="color: var(--text-dark); font-size: 11px;">כבוי</span>',i=t.biometricsEnabled?'<span style="color: var(--accent-color); font-size: 11px;"><i class="fas fa-check-circle"></i> פעיל</span>':'<span style="color: var(--text-dark); font-size: 11px;">כבוי</span>';return`
          <tr>
            <td><strong>${t.username}</strong></td>
            <td style="font-family: monospace; font-size: 11px; color: var(--text-muted);">${t.uid}</td>
            <td>${t.email}</td>
            <td>
              <select class="admin-role-select" data-uid="${t.uid}" style="background: var(--bg-darker); border-color: rgba(255,255,255,0.1); padding: 4px 8px; border-radius: 4px; font-size: 12px; font-family: var(--font-display); color: var(--accent-color);">
                <option value="player" ${t.role==="player"?"selected":""}>PLAYER</option>
                <option value="developer" ${t.role==="developer"?"selected":""}>DEVELOPER</option>
                <option value="admin" ${t.role==="admin"?"selected":""}>ADMIN</option>
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
        `}).join(""),o.querySelectorAll(".admin-role-select").forEach(t=>{t.addEventListener("change",async()=>{const n=t.getAttribute("data-uid"),s=t.value;h(!0);try{await Te(n,s),m(`דרגת המשתמש עודכנה ל-${s.toUpperCase()} בהצלחה!`,"success"),l.user&&l.user.uid===n&&(l.user.role=s,j()),N()}catch(i){m("עדכון הדרגה נכשל: "+i.message,"danger")}finally{h(!1)}})}))}catch(a){console.error("Error loading users list:",a)}}function M(e,a,o){const t=document.getElementById("modal-overlay"),n=document.getElementById("modal-title"),s=document.getElementById("modal-body");n.textContent="הזנת הסבר מנהל מערכת (Admin Action)";let i="רשום סיבה או הצעות לשיפור שיועברו למשתמש:";a==="approved"?i="הערות אישור (יופיעו במייל):":a==="rejected"?i="סיבת סירוב (יופיע במייל - המשתמש לא יוכל להגיש שוב):":a==="improvement"&&(i="פרט את ההצעות לשיפור ושינויים שנדרשים מהמפתח:"),s.innerHTML=`
    <form id="admin-reason-form">
      <div class="form-group">
        <label>${i}</label>
        <textarea id="admin-notes" required placeholder="הזן כאן את הטקסט..." rows="4"></textarea>
      </div>
      <button type="submit" class="btn btn-primary" style="width: 100%; justify-content: center;">
        <i class="fas fa-check-double"></i> בצע פעולה ושלח מייל
      </button>
    </form>
  `,t.classList.add("active"),document.getElementById("admin-reason-form").addEventListener("submit",async r=>{r.preventDefault();const c=document.getElementById("admin-notes").value.trim();h(!0);try{o==="dev"?(await Ue(e,a,c),m("בקשת המפתח עודכנה והמייל נשלח בהצלחה!","success")):o==="game"&&(await De(e,a,c),m("בקשת המשחק עודכנה והמייל נשלח בהצלחה!","success")),t.classList.remove("active"),await se(),N()}catch(u){m(u.message,"danger")}finally{h(!1)}})}function vt(){const e=document.getElementById("modal-overlay"),a=document.getElementById("modal-title"),o=document.getElementById("modal-body");a.textContent="העלאה ישירה של משחק (Admin Bypass)",o.innerHTML=`
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
  `,e.classList.add("active");const t=document.getElementById("admin-direct-upload-form");t.addEventListener("submit",async n=>{n.preventDefault();const s=t.querySelectorAll('input[name="direct-cats"]:checked');if(s.length===0){m("בחר לפחות קטגוריה אחת!","warning");return}const i=Array.from(s).map(c=>c.value),r={name:document.getElementById("direct-name").value,description:document.getElementById("direct-desc").value,logoUrl:document.getElementById("direct-logo").value,githubUrl:document.getElementById("direct-github").value,gameUrl:document.getElementById("direct-url").value,howToPlay:document.getElementById("direct-how").value,targetAudience:document.getElementById("direct-audience").value,categories:i,developerUid:l.user.uid,developerName:`${l.user.username} (ADMIN)`};h(!0);try{await Ce(r),m("המשחק פורסם בהצלחה באתר ללא צורך באישור! 🎉","success"),e.classList.remove("active"),await se(),N()}catch(c){m(c.message,"danger")}finally{h(!1)}})}async function Je(e){const a=document.getElementById("main-container"),o=l.games.find(t=>t.id===e);if(!o){a.innerHTML='<div style="text-align: center; padding: 80px 0;"><h2>משחק לא נמצא!</h2></div>';return}if(l.currentGame=o,l.user){let t=[...l.user.recentlyPlayed||[]];t=t.filter(n=>n!==e),t.unshift(e),t=t.slice(0,5),l.user.recentlyPlayed=t,await B(l.user.uid,{recentlyPlayed:t})}a.innerHTML=`
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
            ${o.categories.map(t=>`<span class="game-tag" style="background: var(--accent-dim); color: var(--accent-color);">${t}</span>`).join("")}
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
  `,document.getElementById("start-game-btn").addEventListener("click",()=>{if(document.getElementById("game-menu-overlay").style.display="none",Ye(o.id).catch(t=>console.warn("Failed to record play stat:",t)),o.gameUrl){const t=document.getElementById("retro-game-iframe");t.src=o.gameUrl,t.style.display="block",l.gameInstance={stop:()=>{t.src="",t.style.display="none"}}}else{const t=document.getElementById("retro-game-canvas");t.style.display="block",o.id==="preset_snake"?l.gameInstance=ye(t):o.id==="preset_bricks"?l.gameInstance=ht(t):o.id==="preset_evader"?l.gameInstance=bt(t):l.gameInstance=ye(t)}})}function ye(e){const a=e.getContext("2d"),o=document.getElementById("game-score-display");let t=0,n=20,s=0,i={x:160,y:160,dx:n,dy:0,cells:[],maxCells:4},r={x:320,y:320},c=null,u=!0;function f(x,P){return Math.floor(Math.random()*(P-x))+x}function p(){u&&(c=requestAnimationFrame(p),!(++s<6)&&(s=0,a.clearRect(0,0,e.width,e.height),i.x+=i.dx,i.y+=i.dy,i.x<0?i.x=e.width-n:i.x>=e.width&&(i.x=0),i.y<0?i.y=e.height-n:i.y>=e.height&&(i.y=0),i.cells.unshift({x:i.x,y:i.y}),i.cells.length>i.maxCells&&i.cells.pop(),a.fillStyle="#ff3366",a.shadowBlur=15,a.shadowColor="#ff3366",a.beginPath(),a.arc(r.x+n/2,r.y+n/2,n/2-2,0,2*Math.PI),a.fill(),a.fillStyle=l.theme,a.shadowBlur=15,a.shadowColor=l.theme,i.cells.forEach(function(x,P){a.fillRect(x.x,x.y,n-1,n-1),x.x===r.x&&x.y===r.y&&(i.maxCells++,t+=10,o.textContent=`ניקוד: ${t}`,r.x=f(0,e.width/n)*n,r.y=f(0,e.height/n)*n);for(let g=P+1;g<i.cells.length;g++)x.x===i.cells[g].x&&x.y===i.cells[g].y&&A()})))}function k(x){x.key==="ArrowLeft"&&i.dx===0?(i.dx=-n,i.dy=0):x.key==="ArrowUp"&&i.dy===0?(i.dy=-n,i.dx=0):x.key==="ArrowRight"&&i.dx===0?(i.dx=n,i.dy=0):x.key==="ArrowDown"&&i.dy===0&&(i.dy=n,i.dx=0)}document.addEventListener("keydown",k),c=requestAnimationFrame(p);function A(){u=!1,a.shadowBlur=0,a.fillStyle="rgba(0, 0, 0, 0.8)",a.fillRect(0,0,e.width,e.height),a.fillStyle="#ff3366",a.font="24px Orbitron",a.textAlign="center",a.fillText("GAME OVER",e.width/2,e.height/2-20),a.fillStyle="#ffffff",a.font="14px Outfit",a.fillText(`ניקוד סופי: ${t}`,e.width/2,e.height/2+10),a.fillText("לחץ שוב על כפתור התחל כדי לנסות שנית",e.width/2,e.height/2+40)}return{stop:()=>{u=!1,cancelAnimationFrame(c),document.removeEventListener("keydown",k)}}}function ht(e){const a=e.getContext("2d"),o=document.getElementById("game-score-display");let t=0,n=!0,s=null,i={x:e.width/2,y:e.height-30,dx:3,dy:-3,radius:8},r={x:e.width/2-50,y:e.height-20,width:100,height:10,speed:7},c=!1,u=!1,f=4,p=6,k=75,A=20,x=15,P=40,g=40,T=[];const U=["#ff3366","#00ff66","#0096ff","#ffcc00"];for(let y=0;y<p;y++){T[y]=[];for(let E=0;E<f;E++)T[y][E]={x:0,y:0,status:1,color:U[E%U.length]}}function z(y){y.key==="Right"||y.key==="ArrowRight"?u=!0:(y.key==="Left"||y.key==="ArrowLeft")&&(c=!0)}function re(y){y.key==="Right"||y.key==="ArrowRight"?u=!1:(y.key==="Left"||y.key==="ArrowLeft")&&(c=!1)}function le(y){let E=y.clientX-e.getBoundingClientRect().left;E>0&&E<e.width&&(r.x=E-r.width/2)}document.addEventListener("keydown",z),document.addEventListener("keyup",re),document.addEventListener("mousemove",le);function Xe(){for(let y=0;y<p;y++)for(let E=0;E<f;E++){let R=T[y][E];R.status===1&&i.x>R.x&&i.x<R.x+k&&i.y>R.y&&i.y<R.y+A&&(i.dy=-i.dy,R.status=0,t+=15,o.textContent=`ניקוד: ${t}`,t===f*p*15&&et())}}function de(){if(n){a.clearRect(0,0,e.width,e.height);for(let y=0;y<p;y++)for(let E=0;E<f;E++)if(T[y][E].status===1){let R=y*(k+x)+g,ce=E*(A+x)+P;T[y][E].x=R,T[y][E].y=ce,a.fillStyle=T[y][E].color,a.shadowBlur=10,a.shadowColor=T[y][E].color,a.fillRect(R,ce,k,A)}if(a.beginPath(),a.arc(i.x,i.y,i.radius,0,Math.PI*2),a.fillStyle="#ffffff",a.shadowBlur=12,a.shadowColor="#ffffff",a.fill(),a.closePath(),a.fillStyle=l.theme,a.shadowBlur=15,a.shadowColor=l.theme,a.fillRect(r.x,r.y,r.width,r.height),Xe(),(i.x+i.dx>e.width-i.radius||i.x+i.dx<i.radius)&&(i.dx=-i.dx),i.y+i.dy<i.radius)i.dy=-i.dy;else if(i.y+i.dy>e.height-i.radius)if(i.x>r.x&&i.x<r.x+r.width)i.dy=-i.dy;else{Qe();return}u&&r.x<e.width-r.width?r.x+=r.speed:c&&r.x>0&&(r.x-=r.speed),i.x+=i.dx,i.y+=i.dy,s=requestAnimationFrame(de)}}s=requestAnimationFrame(de);function Qe(){n=!1,a.shadowBlur=0,a.fillStyle="rgba(0,0,0,0.85)",a.fillRect(0,0,e.width,e.height),a.fillStyle="#ff3366",a.font="24px Orbitron",a.textAlign="center",a.fillText("GAME OVER",e.width/2,e.height/2-20),a.fillStyle="#ffffff",a.font="14px Outfit",a.fillText(`ניקוד סופי: ${t}`,e.width/2,e.height/2+10),a.fillText("נסה שנית!",e.width/2,e.height/2+40)}function et(){n=!1,a.shadowBlur=0,a.fillStyle="rgba(0,0,0,0.85)",a.fillRect(0,0,e.width,e.height),a.fillStyle="#00ff66",a.font="24px Orbitron",a.textAlign="center",a.fillText("YOU WIN!",e.width/2,e.height/2-20),a.fillStyle="#ffffff",a.fillText(`ניקוד סופי: ${t}`,e.width/2,e.height/2+10)}return{stop:()=>{n=!1,cancelAnimationFrame(s),document.removeEventListener("keydown",z),document.removeEventListener("keyup",re),document.removeEventListener("mousemove",le)}}}function bt(e){const a=e.getContext("2d"),o=document.getElementById("game-score-display");let t=0,n=!0,s=null,i={x:e.width/2-20,y:e.height-40,width:40,height:30,speed:6},r=[],c=[],u={},f=0;function p(g){u[g.key]=!0}function k(g){u[g.key]=!1}document.addEventListener("keydown",p),document.addEventListener("keyup",k);function A(){c.push({x:Math.random()*(e.width-30),y:-30,width:30,height:30,speed:1.5+Math.random()*3,color:"#ffaa00"})}function x(){n&&((u.ArrowLeft||u.a)&&(i.x=Math.max(0,i.x-i.speed)),(u.ArrowRight||u.d)&&(i.x=Math.min(e.width-i.width,i.x+i.speed)),(u[" "]||u.Spacebar)&&(!i.lastFired||Date.now()-i.lastFired>300)&&(r.push({x:i.x+i.width/2-2,y:i.y,width:4,height:12,speed:7}),i.lastFired=Date.now()),a.clearRect(0,0,e.width,e.height),a.fillStyle=l.theme,a.shadowBlur=15,a.shadowColor=l.theme,a.beginPath(),a.moveTo(i.x+i.width/2,i.y),a.lineTo(i.x,i.y+i.height),a.lineTo(i.x+i.width,i.y+i.height),a.closePath(),a.fill(),f++,f>40&&(A(),f=0),a.fillStyle="#00ffff",a.shadowColor="#00ffff",r.forEach((g,T)=>{g.y-=g.speed,a.fillRect(g.x,g.y,g.width,g.height),g.y<0&&r.splice(T,1)}),c.forEach((g,T)=>{if(g.y+=g.speed,a.fillStyle=g.color,a.shadowColor=g.color,a.fillRect(g.x,g.y,g.width,g.height),g.x<i.x+i.width&&g.x+g.width>i.x&&g.y<i.y+i.height&&g.y+g.height>i.y){P();return}r.forEach((U,z)=>{U.x<g.x+g.width&&U.x+U.width>g.x&&U.y<g.y+g.height&&U.y+U.height>g.y&&(c.splice(T,1),r.splice(z,1),t+=20,o.textContent=`ניקוד: ${t}`)}),g.y>e.height&&c.splice(T,1)}),s=requestAnimationFrame(x))}s=requestAnimationFrame(x);function P(){n=!1,a.shadowBlur=0,a.fillStyle="rgba(0,0,0,0.85)",a.fillRect(0,0,e.width,e.height),a.fillStyle="#ff3366",a.font="24px Orbitron",a.textAlign="center",a.fillText("SPACE SHUTTLE CRASHED",e.width/2,e.height/2-20),a.fillStyle="#ffffff",a.font="14px Outfit",a.fillText(`ניקוד סופי: ${t}`,e.width/2,e.height/2+10),a.fillText("נסה שנית!",e.width/2,e.height/2+40)}return{stop:()=>{n=!1,cancelAnimationFrame(s),document.removeEventListener("keydown",p),document.removeEventListener("keyup",k)}}}function Ze(){const e=document.getElementById("main-container");if(!l.user){e.innerHTML=`
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
            <input type="text" id="settings-username" value="${l.user.username}">
          </div>
          <div class="form-group">
            <label>אימייל משויך</label>
            <input type="text" value="${l.user.email}" disabled style="background: rgba(255,255,255,0.02); color: var(--text-muted);">
          </div>
          <div class="form-group">
            <label>תפקיד משתמש (ROLE)</label>
            <div style="font-weight: bold; color: var(--accent-color); font-family: var(--font-display); font-size: 16px;">
              ${l.user.role.toUpperCase()}
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
              <input type="checkbox" id="settings-2fa-toggle" ${l.user.twoFactorEnabled?"checked":""} style="width: 20px; height: 20px; accent-color: var(--accent-color); cursor: pointer;">
            </div>
            
            <div id="settings-2fa-email-group" style="display: ${l.user.twoFactorEnabled?"block":"none"}; margin-top: 15px;">
              <div class="form-group">
                <label>כתובת אימייל לשליחת הקוד</label>
                <input type="email" id="settings-2fa-email" value="${l.user.twoFactorEmail||""}" placeholder="myemail@example.com">
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
              <span id="bio-setup-status" style="font-size: 11px; font-family: var(--font-display); color: ${l.user.biometricsEnabled?"var(--accent-color)":"var(--text-muted)"};">
                ${l.user.biometricsEnabled?"מופעל":"לא מוגדר"}
              </span>
            </div>
            <button class="btn btn-secondary" id="register-biometric-btn" style="width: 100%; justify-content: center;">
              <i class="fas fa-fingerprint"></i> ${l.user.biometricsEnabled?"הגדר ביומטרי מחדש":"הפעל זיהוי ביומטרי"}
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
            <div class="color-picker-btn ${l.theme==="#00ff66"?"active":""}" style="background: #00ff66;" data-color="#00ff66"></div>
            <div class="color-picker-btn ${l.theme==="#ff3366"?"active":""}" style="background: #ff3366;" data-color="#ff3366"></div>
            <div class="color-picker-btn ${l.theme==="#ffaa00"?"active":""}" style="background: #ffaa00;" data-color="#ffaa00"></div>
            <div class="color-picker-btn ${l.theme==="#00ffff"?"active":""}" style="background: #00ffff;" data-color="#00ffff"></div>
            <div class="color-picker-btn ${l.theme==="#b026ff"?"active":""}" style="background: #b026ff;" data-color="#b026ff"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Become a Developer Application Form (If player role) -->
    ${l.user.role==="player"?`
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
  `,document.getElementById("save-profile-btn").addEventListener("click",async()=>{const s=H(document.getElementById("settings-username").value.trim()),i=oe(s);if(!i.valid){m(i.errors[0],"danger");return}h(!0);try{await B(l.user.uid,{username:s}),l.user.username=s,j(),m("שם המשתמש עודכן בהצלחה!","success")}catch(r){m(r.message,"danger")}finally{h(!1)}}),document.getElementById("change-pass-btn").addEventListener("click",async()=>{const s=document.getElementById("settings-new-password").value,i=ae(s);if(!i.valid){m(i.errors[0],"danger");return}h(!0);try{await Ae(s),m("הסיסמה שונתה בהצלחה!","success"),document.getElementById("settings-new-password").value=""}catch(r){m(r.message,"danger")}finally{h(!1)}});const a=document.getElementById("settings-2fa-toggle"),o=document.getElementById("settings-2fa-email-group");a.addEventListener("change",async()=>{const s=a.checked;o.style.display=s?"block":"none",s||(h(!0),await B(l.user.uid,{twoFactorEnabled:!1}),l.user.twoFactorEnabled=!1,m("אימות דו-שלבי בוטל.","info"),h(!1))});const t=document.getElementById("settings-2fa-email");t.addEventListener("change",async()=>{const s=H(t.value.trim());if(s){const i=we(s);if(!i.valid){m(i.error,"danger");return}h(!0),await B(l.user.uid,{twoFactorEnabled:!0,twoFactorEmail:s}),l.user.twoFactorEnabled=!0,l.user.twoFactorEmail=s,m("כתובת אימות דו-שלבי עודכנה!","success"),h(!1)}}),document.querySelectorAll(".color-picker-btn").forEach(s=>{s.addEventListener("click",async()=>{document.querySelectorAll(".color-picker-btn").forEach(r=>r.classList.remove("active")),s.classList.add("active");const i=s.getAttribute("data-color");h(!0),await B(l.user.uid,{customTheme:i}),l.user.customTheme=i,te(i),h(!1),m("ערכת העיצוב הניאונית עודכנה!","success")})}),document.getElementById("register-biometric-btn").addEventListener("click",async()=>{h(!0);try{const s=await Fe(l.user.username,l.user.uid);s.success&&(localStorage.setItem("diggy_bio_username",l.user.username),localStorage.setItem("diggy_bio_uid",l.user.uid),await B(l.user.uid,{biometricsEnabled:!0,biometricsCredentialId:s.credentialId.join(",")}),l.user.biometricsEnabled=!0,document.getElementById("bio-setup-status").textContent="מופעל",document.getElementById("bio-setup-status").style.color="var(--accent-color)",m("זיהוי ביומטרי הופעל בהצלחה עבור מכשיר זה! 🔒","success"))}catch(s){m("שגיאה ברישום ביומטרי: "+s.message,"danger")}finally{h(!1)}});const n=document.getElementById("dev-application-form");n&&n.addEventListener("submit",async s=>{s.preventDefault();const i=document.getElementById("dev-app-reason").value,r=document.getElementById("dev-app-email").value,c=document.getElementById("dev-app-pass").value;if(c.length<6||c.length>12){m("הזן סיסמת אימות תקינה (6-12 תווים)!","danger");return}h(!0);try{await $e(l.user.uid,l.user.username,i,r),m("בקשת המפתח נשלחה בהצלחה! מייל עיצוב יישלח אלייך עם החלטת ה-Admin. 📬","success"),Ze()}catch(u){m(u.message,"danger")}finally{h(!1)}})}function te(e){l.theme=e;const a=document.documentElement;a.style.setProperty("--accent-color",e),a.style.setProperty("--accent-glow",`${e}66`),a.style.setProperty("--accent-dim",`${e}1a`),a.style.setProperty("--border-color",`${e}26`)}function j(){const e=document.getElementById("sidebar-user-badge-wrap");if(e)if(l.user){const a=l.user.username.charAt(0).toUpperCase();e.innerHTML=`
      <div class="user-badge" onclick="window.location.hash='#/settings'" style="cursor: pointer;">
        <div class="user-avatar">${a}</div>
        <div class="user-info">
          <span class="user-name">${l.user.username}</span>
          <span class="user-role">${l.user.role}</span>
        </div>
      </div>
    `}else e.innerHTML=`
      <button class="btn btn-secondary" onclick="window.location.hash='#/login'" style="width: 100%; justify-content: center; padding: 10px;">
        <i class="fas fa-sign-in-alt"></i> התחבר / הרשם
      </button>
    `}function m(e,a="success"){const o=document.getElementById("toast-container");if(!o)return;const t=document.createElement("div");t.style.background="var(--bg-dark)",t.style.color="#ffffff",t.style.padding="12px 20px",t.style.borderRadius="8px",t.style.fontSize="14px",t.style.fontWeight="bold",t.style.fontFamily="var(--font-body)",t.style.boxShadow="0 5px 15px rgba(0,0,0,0.5)",t.style.transition="all 0.3s ease",t.style.transform="translateY(20px)",t.style.opacity="0",t.style.display="flex",t.style.alignItems="center",t.style.gap="10px";let n="var(--accent-color)",s="fa-check-circle";a==="danger"?(n="var(--danger-color)",s="fa-exclamation-triangle"):a==="warning"?(n="var(--warning-color)",s="fa-exclamation-circle"):a==="info"&&(n="#0096ff",s="fa-info-circle"),t.style.borderLeft=`4px solid ${n}`,t.style.boxShadow=`0 0 10px ${n}40`,t.innerHTML=`<i class="fas ${s}" style="color: ${n}"></i> <span>${e}</span>`,o.appendChild(t),setTimeout(()=>{t.style.transform="translateY(0)",t.style.opacity="1"},10),setTimeout(()=>{t.style.transform="translateY(-20px)",t.style.opacity="0",setTimeout(()=>{t.remove()},300)},4e3)}function h(e){const a=document.getElementById("app-global-loader");a&&(a.style.display=e?"flex":"none")}document.getElementById("modal-close-btn").addEventListener("click",()=>{document.getElementById("modal-overlay").classList.remove("active");const e=document.getElementById("bio-widget");e&&e.classList.remove("scanning")});document.getElementById("settings-nav-btn").addEventListener("click",()=>{S("#/settings")});function xt(){const e=document.createElement("div");e.className="simulated-inbox-widget collapsed",e.id="simulated-inbox-widget",e.innerHTML=`
    <div class="inbox-header" id="inbox-header">
      <span class="inbox-title"><i class="fas fa-envelope-open-text"></i> תיבת מיילים (סימולציה)</span>
      <span class="inbox-count" id="inbox-count">0</span>
    </div>
    <div class="inbox-body" id="inbox-body">
      <div style="text-align: center; color: var(--text-dark); font-size: 11px; padding: 20px;">אין מיילים כרגע</div>
    </div>
  `,document.body.appendChild(e),document.getElementById("inbox-header").addEventListener("click",()=>{e.classList.toggle("collapsed")})}function wt(){const e=document.getElementById("inbox-count"),a=document.getElementById("inbox-body");if(!e||!a)return;const o=l.recentEmails;if(e.textContent=o.length,o.length===0){a.innerHTML='<div style="text-align: center; color: var(--text-dark); font-size: 11px; padding: 20px;">אין מיילים כרגע</div>';return}a.innerHTML=o.map(t=>`
    <div class="email-item" data-id="${t.id}">
      <div class="email-item-subject">${t.subject}</div>
      <div class="email-item-meta">
        <span>נמען: ${t.to}</span>
        <span>${t.sentAt}</span>
      </div>
    </div>
  `).join(""),a.querySelectorAll(".email-item").forEach(t=>{t.addEventListener("click",()=>{const n=t.getAttribute("data-id"),s=o.find(i=>i.id===n);s&&Et(s)})})}function Et(e){const a=document.getElementById("simulated-inbox-widget"),o=document.createElement("div");o.className="email-content-view",o.innerHTML=`
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
  `,a.appendChild(o),document.getElementById("email-view-back-btn").addEventListener("click",t=>{t.preventDefault(),o.remove()})}async function It(){const e=document.getElementById("main-container");if(!l.user||l.user.role!=="developer"&&l.user.role!=="admin"){e.innerHTML=`
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
  `;const a={"getting-started":`
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
    `};function o(n){const s=document.getElementById("doc-content-area");s.innerHTML=a[n]||""}o("getting-started");const t=document.querySelectorAll(".doc-tab-btn");t.forEach(n=>{n.addEventListener("click",()=>{t.forEach(i=>i.classList.remove("active-doc-tab")),n.classList.add("active-doc-tab");const s=n.getAttribute("data-doc");o(s)})})}
