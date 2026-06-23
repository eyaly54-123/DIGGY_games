(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))a(i);new MutationObserver(i=>{for(const n of i)if(n.type==="childList")for(const s of n.addedNodes)s.tagName==="LINK"&&s.rel==="modulepreload"&&a(s)}).observe(document,{childList:!0,subtree:!0});function o(i){const n={};return i.integrity&&(n.integrity=i.integrity),i.referrerPolicy&&(n.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?n.credentials="include":i.crossOrigin==="anonymous"?n.credentials="omit":n.credentials="same-origin",n}function a(i){if(i.ep)return;i.ep=!0;const n=o(i);fetch(i.href,n)}})();const ft="modulepreload",yt=function(e){return"/"+e},Ee={},j=function(t,o,a){let i=Promise.resolve();if(o&&o.length>0){document.getElementsByTagName("link");const s=document.querySelector("meta[property=csp-nonce]"),r=(s==null?void 0:s.nonce)||(s==null?void 0:s.getAttribute("nonce"));i=Promise.allSettled(o.map(c=>{if(c=yt(c),c in Ee)return;Ee[c]=!0;const d=c.endsWith(".css"),m=d?'[rel="stylesheet"]':"";if(document.querySelector(`link[href="${c}"]${m}`))return;const u=document.createElement("link");if(u.rel=d?"stylesheet":ft,d||(u.as="script"),u.crossOrigin="",u.href=c,r&&u.setAttribute("nonce",r),document.head.appendChild(u),d)return new Promise((E,S)=>{u.addEventListener("load",E),u.addEventListener("error",()=>S(new Error(`Unable to preload CSS for ${c}`)))})}))}function n(s){const r=new Event("vite:preloadError",{cancelable:!0});if(r.payload=s,window.dispatchEvent(r),!r.defaultPrevented)throw s}return i.then(s=>{for(const r of s||[])r.status==="rejected"&&n(r.reason);return t().catch(n)})},vt={apiKey:"AIzaSyD2SUmKinx3qRGW5yehcpOpyw2sLQbmwSA",authDomain:"diggy-9eda8.firebaseapp.com",projectId:"diggy-9eda8",storageBucket:"diggy-9eda8.firebasestorage.app",messagingSenderId:"90359833058",appId:"1:90359833058:web:712187c9d78ccb2755d9bb",measurementId:"G-ZW5KTPNQ3G"};let J=null,P=null,v=null,I=!1,x=!1,U=null,p=null;const Le=[];let T=null;const ee=e=>`${e.toLowerCase().trim()}@diggy.com`;async function ht(){try{const e=await j(()=>import("https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js"),[]);U=await j(()=>import("https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js"),[]),p=await j(()=>import("https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js"),[]),J=e.initializeApp(vt),P=U.getAuth(J),v=p.getFirestore(J),I=!0,U.onAuthStateChanged(P,async t=>{if(t)try{const o=p.doc(v,"users",t.uid),a=await p.getDoc(o);if(a.exists()){const i=a.data();_(i);return}}catch(o){console.warn("Auth state loaded but profile query failed. Falling back to local storage session.",o)}Ie()}),console.log("Firebase dynamically initialized successfully.")}catch(e){console.warn("Firebase SDK failed to load from CDN. Operating in local-only fallback mode.",e),x=!0,Ie()}}ht();function Ie(){const e=localStorage.getItem("diggy_logged_in_uid");if(e){const o=w("users").find(a=>a.uid===e);if(o){T=o,_(o);return}}T=null,_(null)}function _(e){Le.forEach(t=>{try{t(e)}catch(o){console.error("Error in auth listener callback:",o)}})}const N=new Map,bt=5,te=15*60*1e3;function $e(e){const t=Date.now(),a=(N.get(e)||[]).filter(i=>t-i<te);return a.length>=bt?{allowed:!1,remainingTime:Math.ceil((a[0]+te-t)/1e3/60)}:{allowed:!0,attempts:a.length}}function Te(e){const t=Date.now(),o=N.get(e)||[];o.push(t);const a=o.filter(i=>t-i<te);N.set(e,a)}function Ge(e){N.delete(e)}function V(e){return typeof e!="string"?e:e.replace(/[<>]/g,"").trim().substring(0,500)}function de(e){const t=[];return e.length<6&&t.push("הסיסמה חייבת להכיל לפחות 6 תווים"),e.length>12&&t.push("הסיסמה חייבת להכיל לכל היותר 12 תווים"),/[a-zA-Z]/.test(e)||t.push("הסיסמה חייבת להכיל לפחות אות אחת באנגלית"),/[0-9]/.test(e)||t.push("הסיסמה חייבת להכיל לפחות ספרה אחת"),{valid:t.length===0,errors:t}}function ce(e){const t=[];return e.length<6&&t.push("שם המשתמש חייב להכיל לפחות 6 תווים"),e.length>12&&t.push("שם המשתמש חייב להכיל לכל היותר 12 תווים"),/^[a-zA-Z0-9_]+$/.test(e)||t.push("שם המשתמש יכול להכיל רק אותיות, ספרות וקו תחתון"),{valid:t.length===0,errors:t}}function Be(e){return{valid:/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e),error:"כתובת האימייל אינה תקינה"}}function w(e){const t=localStorage.getItem(`diggy_db_${e}`);return t?JSON.parse(t):[]}function L(e,t){localStorage.setItem(`diggy_db_${e}`,JSON.stringify(t))}w("games").length===0&&L("games",[{id:"preset_snake",name:"Neon Snake",description:"The classic retro arcade game! Guide the neon snake to consume glowing particles, but avoid hitting yourself or the boundaries.",logoUrl:"https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60",githubUrl:"https://github.com/diggy-games/neon-snake",howToPlay:"Use the arrow keys or WASD to navigate the snake. Eat green glowing particles to grow. The game ends if you collide with the walls or your own tail.",targetAudience:"Everyone (All Ages)",categories:["RETRO","RPG"],developerUid:"system",developerName:"DIGGY Core Devs",approved:!0}]);if(w("users").length===0){const e=[{uid:"local_admin_123",username:"admin",email:"admin@diggy.com",role:"admin",twoFactorEnabled:!1,twoFactorEmail:"",biometricsEnabled:!1,customTheme:"#00ff66",favorites:[],recentlyPlayed:[],createdAt:new Date().toISOString()},{uid:"local_dev_456",username:"developer_jon",email:"jon@diggy.com",role:"developer",twoFactorEnabled:!1,twoFactorEmail:"",biometricsEnabled:!1,customTheme:"#00ffff",favorites:["preset_snake"],recentlyPlayed:[],createdAt:new Date().toISOString()},{uid:"local_player_789",username:"gamer_kid",email:"kid@diggy.com",role:"player",twoFactorEnabled:!1,twoFactorEmail:"",biometricsEnabled:!1,customTheme:"#ff3366",favorites:[],recentlyPlayed:["preset_snake"],createdAt:new Date().toISOString()}];L("users",e)}function De(e){Le.push(e),(x||I)&&e(T)}async function _e(e,t){const o=e.trim();if(o.length<6||o.length>12)throw new Error("Username must be between 6 and 12 characters.");if(t.length<6||t.length>12)throw new Error("Password must be between 6 and 12 characters.");const i={uid:"local_"+Math.random().toString(36).substr(2,9),username:o,email:ee(o),role:o.toLowerCase()==="admin"?"admin":"player",twoFactorEnabled:!1,twoFactorEmail:"",biometricsEnabled:!1,biometricsCredential:null,customTheme:"#00ff66",favorites:[],recentlyPlayed:[],createdAt:new Date().toISOString()};if(I&&!x)try{const r=ee(o),c=p.collection(v,"users"),d=p.query(c,p.where("username","==",o));if(!(await p.getDocs(d)).empty)throw new Error("Username is already taken.");const E=(await U.createUserWithEmailAndPassword(P,r,t)).user;i.uid=E.uid,await p.setDoc(p.doc(v,"users",E.uid),i);const S=w("users");return S.push(i),L("users",S),T=i,localStorage.setItem("diggy_logged_in_uid",E.uid),_(i),i}catch(r){if(console.warn("Firebase sign up failed. Falling back to LocalStorage auth.",r),r.code==="auth/email-already-in-use"||r.message==="Username is already taken.")throw new Error("שם המשתמש כבר תפוס במערכת!");if(r.code==="auth/weak-password")throw new Error("הסיסמה חלשה מדי!");x=!0,console.log("Switched to LocalStorage fallback due to error:",r.message||r)}const n=w("users");if(n.some(r=>r.username.toLowerCase()===o.toLowerCase()))throw new Error("Username is already taken.");return n.push(i),L("users",n),T=i,localStorage.setItem("diggy_logged_in_uid",i.uid),_(i),i}async function pe(e,t){const o=e.trim().toLowerCase();if(I&&!x&&t!=="DUMMY_PASSWORD_NOT_USED"&&t!=="auth_biometric_token")try{const n=ee(e),r=(await U.signInWithEmailAndPassword(P,n,t)).user,c=p.doc(v,"users",r.uid),d=await p.getDoc(c);if(d.exists()){const m=d.data();return T=m,localStorage.setItem("diggy_logged_in_uid",m.uid),_(m),m}throw new Error("User profile not found in database.")}catch(n){if(console.warn("Firebase sign in failed. Attempting LocalStorage auth fallback.",n),n.code==="auth/user-not-found"||n.code==="auth/wrong-password"||n.code==="auth/invalid-credential"||n.code==="auth/invalid-email")throw new Error("שם המשתמש או הסיסמה שגויים!");x=!0,console.log("Switched to LocalStorage login fallback due to error:",n.message||n)}const i=w("users").find(n=>n.username.toLowerCase()===o);if(!i)throw new Error("שם המשתמש או הסיסמה שגויים! (לא נמצא חשבון)");return T=i,localStorage.setItem("diggy_logged_in_uid",i.uid),_(i),i}async function Re(){if(localStorage.removeItem("diggy_logged_in_uid"),T=null,I&&!x)try{await U.signOut(P)}catch(e){console.warn("Firebase sign out failed:",e)}_(null)}async function Ue(e){if(I&&!x)try{const a=p.doc(v,"users",e),i=await p.getDoc(a);if(i.exists())return i.data()}catch(a){console.warn("Firebase profile read failed, using local fallback:",a)}const o=w("users").find(a=>a.uid===e);if(o)return o;throw new Error("User profile not found.")}async function G(e,t){const o=w("users"),a=o.findIndex(i=>i.uid===e);if(a!==-1&&(o[a]={...o[a],...t},L("users",o),T&&T.uid===e&&(T=o[a])),I&&!x)try{const i=p.doc(v,"users",e);await p.updateDoc(i,t);return}catch(i){console.warn("Firebase profile update failed, saved locally only:",i)}}async function Pe(e){if(e.length<6||e.length>12)throw new Error("Password must be between 6 and 12 characters.");if(I&&!x)try{const t=P.currentUser;if(t){await U.updatePassword(t,e);return}}catch(t){console.warn("Firebase password change failed, falling back to local only:",t)}console.log("Local password updated successfully.")}async function Ce(){if(I&&!x)try{const e=p.query(p.collection(v,"users")),t=await p.getDocs(e),o=[];return t.forEach(a=>o.push(a.data())),o}catch(e){console.warn("Firebase load all users failed, loading local:",e)}return w("users")}async function Me(e,t){await G(e,{role:t})}async function qe(e,t,o,a){const i={id:"req_"+Math.random().toString(36).substr(2,9),uid:e,username:t,reason:o,contactEmail:a,status:"pending",createdAt:new Date().toISOString(),adminReason:""},n=w("developer_requests");if(n.some(r=>r.uid===e&&r.status==="pending"))throw new Error("יש לך כבר פנייה ממתינה להפוך למפתח!");if(n.push(i),L("developer_requests",n),I&&!x)try{await p.addDoc(p.collection(v,"developer_requests"),i)}catch(r){console.warn("Firebase dev request submission failed, saved locally only:",r)}return i}async function ze(){if(I&&!x)try{const e=p.query(p.collection(v,"developer_requests"),p.orderBy("createdAt","desc")),t=await p.getDocs(e),o=[];return t.forEach(a=>o.push({id:a.id,...a.data()})),o}catch(e){console.warn("Firebase developer requests load failed, loading local:",e)}return w("developer_requests").sort((e,t)=>new Date(t.createdAt)-new Date(e.createdAt))}async function Fe(e,t,o){console.log("handleDeveloperRequest called with:",{requestId:e,status:t,adminReason:o});const a=w("developer_requests");console.log("Current requests:",a);const i=a.findIndex(s=>s.id===e||s.uid===e);console.log("Found request at index:",i);let n=null;if(i!==-1)a[i].status=t,a[i].adminReason=o,n=a[i],L("developer_requests",a),t==="approved"&&await G(a[i].uid,{role:"developer"});else throw console.error("Request not found with id:",e),new Error("Request not found - could not locate developer request with ID: "+e);if(I&&!x&&n)try{const s=p.collection(v,"developer_requests"),r=p.query(s,p.where("uid","==",n.uid)),c=await p.getDocs(r);if(!c.empty){const d=c.docs[0].id;await p.updateDoc(p.doc(v,"developer_requests",d),{status:t,adminReason:o})}}catch(s){console.warn("Firebase developer request handle failed, processed locally:",s)}if(n)return await et(n.contactEmail,n.username,"Developer Role Application",t,o),n;throw new Error("Request not found")}async function Oe(e){const o={id:"greq_"+Math.random().toString(36).substr(2,9),...e,status:"pending",createdAt:new Date().toISOString(),adminSuggestions:""},a=w("game_requests");if(a.some(n=>n.githubUrl===e.githubUrl&&n.status==="rejected"))throw new Error("מאגר המשחק הזה נדחה בעבר ולא ניתן להגישו שוב.");if(a.push(o),L("game_requests",a),I&&!x)try{await p.addDoc(p.collection(v,"game_requests"),o)}catch(n){console.warn("Firebase game request failed, saved locally:",n)}return o}async function He(e){if(I&&!x)try{const t=p.query(p.collection(v,"game_requests"),p.where("developerUid","==",e)),o=await p.getDocs(t),a=[];return o.forEach(i=>a.push({id:i.id,...i.data()})),a}catch(t){console.warn("Firebase load dev game requests failed, loading local:",t)}return w("game_requests").filter(t=>t.developerUid===e)}async function je(){if(I&&!x)try{const e=p.query(p.collection(v,"game_requests")),t=await p.getDocs(e),o=[];return t.forEach(a=>o.push({id:a.id,...a.data()})),o}catch(e){console.warn("Firebase load pending game requests failed, loading local:",e)}return w("game_requests")}async function Ye(e,t,o=""){const a=w("game_requests"),i=a.findIndex(s=>s.id===e);let n=null;if(i!==-1&&(a[i].status=t,a[i].adminSuggestions=o,n=a[i],L("game_requests",a),t==="approved")){const s=w("games");if(n.type==="version_update"){const r=s.findIndex(c=>c.id===n.parentGameId);r!==-1&&(s[r].gameUrl=n.gameUrl,s[r].githubUrl=n.githubUrl,s[r].version=n.version,s[r].latestChangelog=n.changelog,L("games",s))}else{const r="game_"+Math.random().toString(36).substr(2,9),c={id:r,name:n.name,description:n.description,logoUrl:n.logoUrl,githubUrl:n.githubUrl,gameUrl:n.gameUrl||"",howToPlay:n.howToPlay,targetAudience:n.targetAudience,categories:n.categories,developerUid:n.developerUid,developerName:n.developerName,approved:!0,plays:0,ratingSum:0,ratingCount:0,rating:5,createdAt:new Date().toISOString()};s.push(c),L("games",s),a[i].gameId=r,L("game_requests",a)}}if(I&&!x&&n)try{const s=p.collection(v,"game_requests"),r=p.query(s,p.where("id","==",e)),c=await p.getDocs(r);if(!c.empty){const d=c.docs[0].id;let m={status:t,adminSuggestions:o};if(t==="approved")if(n.type==="version_update"){const u=p.collection(v,"games"),E=p.query(u,p.where("id","==",n.parentGameId)),S=await p.getDocs(E);if(!S.empty){const b=S.docs[0].id;await p.updateDoc(p.doc(v,"games",b),{gameUrl:n.gameUrl,githubUrl:n.githubUrl,version:n.version,latestChangelog:n.changelog})}}else{const u="game_"+Math.random().toString(36).substr(2,9);await p.addDoc(p.collection(v,"games"),{id:u,name:n.name,description:n.description,logoUrl:n.logoUrl,githubUrl:n.githubUrl,gameUrl:n.gameUrl||"",howToPlay:n.howToPlay,targetAudience:n.targetAudience,categories:n.categories,developerUid:n.developerUid,developerName:n.developerName,approved:!0,plays:0,ratingSum:0,ratingCount:0,rating:5,createdAt:new Date().toISOString()}),m.gameId=u}await p.updateDoc(p.doc(v,"game_requests",d),m)}}catch(s){console.warn("Firebase game request handling error, completed locally:",s)}if(n){try{const s=await Ue(n.developerUid),r=s.twoFactorEmail||s.email||"developer@diggy.com";await et(r,n.developerName,`Game Submission: ${n.name}`,t,o)}catch(s){console.warn("Failed to send notification email:",s)}return n}throw new Error("Request not found")}async function Ne(e,t){const o=w("game_requests"),a=o.findIndex(i=>i.id===e);if(a!==-1&&(o[a]={...o[a],...t,status:"pending",adminSuggestions:"",createdAt:new Date().toISOString()},L("game_requests",o)),I&&!x)try{const i=p.collection(v,"game_requests"),n=p.query(i,p.where("githubUrl","==",t.githubUrl)),s=await p.getDocs(n);if(!s.empty){const r=s.docs[0].id;await p.updateDoc(p.doc(v,"game_requests",r),{...t,status:"pending",adminSuggestions:"",createdAt:new Date().toISOString()})}}catch(i){console.warn("Firebase resubmission failed, updated locally:",i)}}async function Ve(e){const t={id:"game_"+Math.random().toString(36).substr(2,9),...e,approved:!0,createdAt:new Date().toISOString()},o=w("games");if(o.push(t),L("games",o),I&&!x)try{await p.addDoc(p.collection(v,"games"),t)}catch(a){console.warn("Firebase direct publish failed, published locally:",a)}return t}async function We(){if(I&&!x)try{const e=p.query(p.collection(v,"games"),p.orderBy("createdAt","desc")),t=await p.getDocs(e),o=[];return t.forEach(a=>o.push({id:a.id,...a.data()})),o}catch(e){console.warn("Firebase load active games failed, loading local:",e)}return w("games")}const C=new Map;function ae(e){const t=Math.floor(1e5+Math.random()*9e5).toString(),o=Date.now()+5*60*1e3;return C.set(e,{code:t,expiresAt:o,attempts:0,maxAttempts:3}),t}function Ke(e,t){const o=C.get(e);return o?Date.now()>o.expiresAt?(C.delete(e),{valid:!1,error:"קוד האימות פג תוקף. בקש קוד חדש."}):o.attempts>=o.maxAttempts?(C.delete(e),{valid:!1,error:"חרגת ממספר הניסיונות המקסימלי. נסה להתחבר מחדש."}):(o.attempts++,t===o.code?(C.delete(e),{valid:!0}):{valid:!1,error:`קוד שגוי. נותרו ${o.maxAttempts-o.attempts} ניסיונות.`}):{valid:!1,error:"קוד אימות לא תקף או פג תוקף"}}function Je(e){C.delete(e)}const z=new Map;async function Ze(e,t){if(!window.PublicKeyCredential)throw new Error("הדפדפן שלך לא תומך ב-WebAuthn");if(!await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable())throw new Error("לא נמצא מכשיר ביומטרי זמין במערכת");try{const a=new TextEncoder().encode(t),i=new Uint8Array(32);crypto.getRandomValues(i);const n={challenge:i,rp:{name:"DIGGY Games",id:window.location.hostname||"localhost"},user:{id:a,name:e,displayName:e},pubKeyCredParams:[{type:"public-key",alg:-7}],authenticatorSelection:{authenticatorAttachment:"platform",userVerification:"required"},timeout:6e4},s=await navigator.credentials.create({publicKey:n});if(!s)throw new Error("יצירת אישור ביומטרי נכשלה");const r=Array.from(new Uint8Array(s.rawId)),c={credentialId:r,publicKey:s.response.publicKey?Array.from(new Uint8Array(s.response.publicKey)):null,counter:0,username:e,uid:t,createdAt:Date.now()};return z.set(t,c),localStorage.setItem(`diggy_webauthn_${t}`,JSON.stringify(c)),{success:!0,credentialId:r}}catch(a){throw console.error("WebAuthn registration error:",a),new Error(`שגיאה ברישום ביומטרי: ${a.message}`)}}async function Xe(e,t){if(!window.PublicKeyCredential)throw new Error("הדפדפן שלך לא תומך ב-WebAuthn");let o=z.get(t);if(!o){const a=localStorage.getItem(`diggy_webauthn_${t}`);a&&(o=JSON.parse(a),z.set(t,o))}if(!o)throw new Error("לא נמצא אישור ביומטרי שמור. אנא הפעל זיהוי ביומטרי בהגדרות.");try{const a=new Uint8Array(32);crypto.getRandomValues(a);const i={challenge:a,allowCredentials:[{type:"public-key",id:new Uint8Array(o.credentialId)}],userVerification:"required",timeout:6e4};if(!await navigator.credentials.get({publicKey:i}))throw new Error("אימות ביומטרי נכשל");return o.counter++,localStorage.setItem(`diggy_webauthn_${t}`,JSON.stringify(o)),{success:!0,username:e}}catch(a){throw console.error("WebAuthn verification error:",a),new Error(`שגיאה באימות ביומטרי: ${a.message}`)}}function xt(e){return z.has(e)||localStorage.getItem(`diggy_webauthn_${e}`)!==null}function wt(e){z.delete(e),localStorage.removeItem(`diggy_webauthn_${e}`)}const Y=[];function ue(){const e=typeof window<"u"?window:null,t=(localStorage.getItem("diggy_resend_api_key")||(e==null?void 0:e.__DIGGY_RESEND_API_KEY__)||"").trim(),o=(localStorage.getItem("diggy_resend_from")||(e==null?void 0:e.__DIGGY_RESEND_FROM__)||"DIGGY Games <noreply@diggy.com>").trim();return{apiKey:t,from:o||"DIGGY Games <noreply@diggy.com>",enabled:!!(t&&t!=="re_your_api_key_here")}}function Qe(e,t){const o=(e||"").trim(),a=(t||"").trim();return localStorage.setItem("diggy_resend_api_key",o),localStorage.setItem("diggy_resend_from",a||"DIGGY Games <noreply@diggy.com>"),ue()}function ie(){return ue()}async function F(e,t,o){const a={id:"email_"+Math.random().toString(36).substr(2,9),to:e,subject:t,html:o,sentAt:new Date().toLocaleTimeString(),timestamp:Date.now()},i=ue();if(i.enabled)try{const n=await fetch("https://api.resend.com/emails",{method:"POST",headers:{Authorization:`Bearer ${i.apiKey}`,"Content-Type":"application/json"},body:JSON.stringify({from:i.from,to:[e],subject:t,html:o})});if(n.ok){const s=await n.json();a.status="sent",a.messageId=s.id,console.log(`[Email Sent via Resend] to: ${e} | subject: ${t} | id: ${s.id}`)}else{const s=await n.json();return console.error("[Resend API Error]",s),a.status="failed",a.error=s.message,Y.unshift(a),window.dispatchEvent(new CustomEvent("diggy-email-sent",{detail:a})),{success:!1,mode:"api_failed",error:s.message,email:a}}}catch(n){return console.error("[Resend API Network Error]",n),a.status="failed",a.error=n.message,Y.unshift(a),window.dispatchEvent(new CustomEvent("diggy-email-sent",{detail:a})),{success:!1,mode:"network_error",error:n.message,email:a}}else a.status="simulated",console.log(`[Email Simulated] to: ${e} | subject: ${t}`);return Y.unshift(a),window.dispatchEvent(new CustomEvent("diggy-email-sent",{detail:a})),{success:!0,mode:i.enabled?"api":"simulated",email:a}}async function et(e,t,o,a,i){const n={approved:"#00ff66",rejected:"#ff3366",improvement:"#ffcc00"},s={approved:"APPROVED / מאושר",rejected:"REJECTED / נדחה",improvement:"IMPROVEMENTS REQUESTED / דרוש שיפור"},r=n[a]||"#00ff66",c=s[a]||a.toUpperCase(),d=`
    <div style="background-color: #07080a; color: #ffffff; font-family: sans-serif; padding: 40px; border-radius: 12px; border: 2px solid ${r}; max-width: 600px; margin: 0 auto;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #00ff66; font-size: 36px; margin: 0;">DIGGY</h1>
      </div>
      
      <div style="background: rgba(255,255,255,0.03); border-radius: 8px; padding: 25px; border-left: 4px solid ${r}; margin-bottom: 25px;">
        <h2>היי ${t},</h2>
        <p>יש לנו עדכון לגבי הבקשה שלך באתר <strong>DIGGY</strong>!</p>
        
        <div style="margin: 20px 0; padding: 15px; background: rgba(0,0,0,0.3); border-radius: 6px; text-align: center;">
          <span style="color: #888888; display: block; margin-bottom: 5px;">סוג הפעולה</span>
          <strong style="font-size: 18px;">${o}</strong>
          <hr style="border: 0; border-top: 1px solid rgba(255,255,255,0.1); margin: 10px 0;">
          <span style="color: #888888; display: block; margin-bottom: 5px;">סטטוס בקשה</span>
          <strong style="font-size: 22px; color: ${r};">${c}</strong>
        </div>

        ${i?`
          <div style="background: rgba(255,255,255,0.05); padding: 15px; border-radius: 6px;">
            <strong style="color: ${r}; display: block; margin-bottom: 8px;">הערות מנהל המערכת:</strong>
            <p style="margin: 0; color: #eeeeee;">${i}</p>
          </div>
        `:""}
      </div>
    </div>
  `;await F(e,`DIGGY - עדכון בקשת ${o}`,d)}async function tt(e){const t=w("games"),o=t.findIndex(a=>a.id===e);if(o!==-1&&(t[o].plays=(t[o].plays||0)+1,L("games",t)),I&&!x)try{const a=p.collection(v,"games"),i=p.query(a,p.where("id","==",e)),n=await p.getDocs(i);if(n.empty){const s=p.doc(v,"games",e),r=await p.getDoc(s);if(r.exists()){const c=r.data().plays||0;await p.updateDoc(s,{plays:c+1})}}else{const s=n.docs[0].id,r=n.docs[0].data().plays||0;await p.updateDoc(p.doc(v,"games",s),{plays:r+1})}}catch(a){console.warn("Firebase record gameplay failed:",a)}}async function at(e,t){const a={id:"greq_"+Math.random().toString(36).substr(2,9),parentGameId:e,type:"version_update",status:"pending",createdAt:new Date().toISOString(),adminSuggestions:"",...t},i=w("game_requests");if(i.push(a),L("game_requests",i),I&&!x)try{await p.addDoc(p.collection(v,"game_requests"),a)}catch(n){console.warn("Firebase game version request failed, saved locally:",n)}return a}async function it(e,t){const o=w("games"),a=o.findIndex(n=>n.id===e);let i=5;if(a!==-1){const n=o[a].ratingSum||0,s=o[a].ratingCount||0,r=n+t,c=s+1;i=parseFloat((r/c).toFixed(1)),o[a].ratingSum=r,o[a].ratingCount=c,o[a].rating=i,L("games",o)}if(I&&!x)try{const n=p.collection(v,"games"),s=p.query(n,p.where("id","==",e)),r=await p.getDocs(s);if(!r.empty){const c=r.docs[0].id,d=r.docs[0].data(),m=d.ratingSum||0,u=d.ratingCount||0,E=m+t,S=u+1,b=parseFloat((E/S).toFixed(1));await p.updateDoc(p.doc(v,"games",c),{ratingSum:E,ratingCount:S,rating:b})}}catch(n){console.warn("Firebase rate game failed:",n)}return i}const Et=Object.freeze(Object.defineProperty({__proto__:null,get auth(){return P},changeUserPassword:Pe,changeUserRole:Me,checkLoginRateLimit:$e,clear2FACode:Je,clearLoginAttempts:Ge,directPublishGame:Ve,generateAndStore2FACode:ae,getActiveGames:We,getAllUsers:Ce,getDeveloperGameRequests:He,getDeveloperRequests:ze,getPendingGameRequests:je,getResendConfigState:ie,getUserProfile:Ue,handleDeveloperRequest:Fe,handleGameRequest:Ye,hasWebAuthnCredential:xt,logInUser:pe,logOutUser:Re,onAuthStateListener:De,rateGame:it,recordGamePlay:tt,recordLoginAttempt:Te,registerWebAuthnCredential:Ze,removeWebAuthnCredential:wt,sanitizeInput:V,sendEmailViaResend:F,setResendConfig:Qe,signUpUser:_e,simulatedEmails:Y,submitDeveloperRequest:qe,submitGameRequest:Oe,submitGameVersionRequest:at,updateAndResubmitGameRequest:Ne,updateUserProfile:G,validateEmail:Be,validatePasswordStrength:de,validateUsername:ce,verify2FACode:Ke,verifyWebAuthnCredential:Xe},Symbol.toStringTag,{value:"Module"}));let l={user:null,currentRoute:"#/",games:[],theme:"#00ff66",activePromoIndex:0,promoTimer:null,currentGame:null,gameInstance:null,recentEmails:[],supportActiveThreadId:null};const Z=[{id:"preset_snake",name:"Neon Snake",description:"The classic retro arcade game! Guide the neon snake to consume glowing particles, but avoid hitting yourself or the boundaries.",logoUrl:"https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60",githubUrl:"https://github.com/diggy-games/neon-snake",howToPlay:"Use the arrow keys or WASD to navigate the snake. Eat green glowing particles to grow. The game ends if you collide with the walls or your own tail.",targetAudience:"Everyone (All Ages)",categories:["RETRO","RPG"],developerUid:"system",developerName:"DIGGY Core Devs",approved:!0,rating:4.8,ratingCount:156,ratingSum:748.8},{id:"preset_bricks",name:"Brick Breaker Glow",description:"Bounce the ball and destroy the neon bricks in this fast-paced arcade retro classic. Collect multipliers and clear the screen!",logoUrl:"https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=150&auto=format&fit=crop&q=60",githubUrl:"https://github.com/diggy-games/brick-breaker-glow",howToPlay:"Move the paddle left and right using your Mouse or Left/Right arrow keys. Prevent the glowing orb from falling. Break all the colored neon bricks to win.",targetAudience:"Kids 6+",categories:["RETRO","MULTIPLAYER"],developerUid:"system",developerName:"DIGGY Core Devs",approved:!0,rating:4.6,ratingCount:98,ratingSum:450.8},{id:"preset_evader",name:"Space Laser Evader",description:"Navigate your starfighter through an intense neon asteroid field. Shoot incoming targets and survive the onslaught!",logoUrl:"https://images.unsplash.com/photo-1542751371-adc38448a05e?w=150&auto=format&fit=crop&q=60",githubUrl:"https://github.com/diggy-games/space-laser-evader",howToPlay:"Move Left/Right using the Arrow keys or A/D keys. Fire your laser cannon using the Spacebar. Avoid colliding with space debris.",targetAudience:"Teens 10+",categories:["RPG","RETRO"],developerUid:"system",developerName:"DIGGY Core Devs",approved:!0,rating:4.9,ratingCount:203,ratingSum:994.7}];function ge(e){const t=parseFloat(e.rating??5),o=e.ratingCount??0;return{rating:t,count:o,display:t.toFixed(1)}}function ot(e,t,o=""){const a=parseFloat(e);let i="";for(let s=1;s<=5;s++)a>=s-.25?i+='<i class="fas fa-star"></i>':a>=s-.75?i+='<i class="fas fa-star-half-alt"></i>':i+='<i class="far fa-star"></i>';const n=t>0?`<span class="rating-count">(${t})</span>`:"";return`<div class="star-rating-display ${o}">${i}<span class="rating-value">${a.toFixed(1)}</span>${n}</div>`}function st(){try{return JSON.parse(localStorage.getItem("diggy_game_ratings")||"{}")}catch{return{}}}function It(e,t){var i;const o=st(),a=((i=l.user)==null?void 0:i.uid)||"guest";o[a]||(o[a]={}),o[a][e]=t,localStorage.setItem("diggy_game_ratings",JSON.stringify(o))}function H(e){var a,i;const t=st(),o=((a=l.user)==null?void 0:a.uid)||"guest";return((i=t[o])==null?void 0:i[e])||null}function me(){try{return JSON.parse(localStorage.getItem("diggy_support_threads")||"[]")}catch{return[]}}function nt(e){localStorage.setItem("diggy_support_threads",JSON.stringify(e))}function At({name:e,email:t,subject:o,message:a}){const i={id:"support_"+Math.random().toString(36).slice(2,10),name:e,email:t,subject:o,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString(),messages:[{id:"msg_"+Math.random().toString(36).slice(2,10),sender:"user",author:e,text:a,createdAt:new Date().toISOString()}]},n=me();return n.unshift(i),nt(n),i}function St(e,t,o,a){const i=me(),n=i.find(s=>s.id===e);return n?(n.messages.push({id:"msg_"+Math.random().toString(36).slice(2,10),sender:t,author:o,text:a,createdAt:new Date().toISOString()}),n.updatedAt=new Date().toISOString(),nt(i),n):null}function oe(e=null){var c;const t=document.getElementById("admin-support-thread-list"),o=document.getElementById("admin-support-thread-content");if(!t||!o)return;const a=me().sort((d,m)=>new Date(m.updatedAt||m.createdAt)-new Date(d.updatedAt||d.createdAt)),i=e||l.supportActiveThreadId||((c=a[0])==null?void 0:c.id)||null;if(l.supportActiveThreadId=i,a.length===0){t.innerHTML='<div class="support-chat-empty">אין פניות פתוחות כרגע.</div>',o.innerHTML='<div class="support-chat-empty">לא נבחרה פנייה.</div>';return}t.innerHTML=a.map(d=>{const m=d.messages[d.messages.length-1];return`
      <button class="support-thread-card ${d.id===i?"active":""}" data-thread-id="${d.id}">
        <div class="support-thread-title">${d.subject}</div>
        <div class="support-thread-meta">${d.name} · ${d.email}</div>
        <div class="support-thread-preview">${m?m.text:"ללא הודעות"}</div>
      </button>
    `}).join(""),t.querySelectorAll(".support-thread-card").forEach(d=>{d.addEventListener("click",()=>{oe(d.getAttribute("data-thread-id"))})});const n=a.find(d=>d.id===i)||a[0],s=n.messages.map(d=>`
    <div class="support-message ${d.sender==="admin"?"admin":""}">
      <div class="support-message-author">${d.author}</div>
      <div class="support-message-text">${d.text}</div>
      <div class="support-message-time">${new Date(d.createdAt).toLocaleString()}</div>
    </div>
  `).join("");o.innerHTML=`
    <div class="support-thread-header">
      <div>
        <div class="support-thread-title">${n.subject}</div>
        <div class="support-thread-meta">${n.name} · ${n.email}</div>
      </div>
      <div class="support-thread-meta">נוצר: ${new Date(n.createdAt).toLocaleString()}</div>
    </div>
    <div class="support-thread-messages">${s}</div>
    <form id="support-reply-form" class="support-reply-form">
      <textarea id="support-reply-input" rows="3" placeholder="הקלד תגובה לאדם שנותן תמיכה..."></textarea>
      <button class="btn btn-primary" type="submit"><i class="fas fa-paper-plane"></i> שלח</button>
    </form>
  `;const r=document.getElementById("support-reply-form");r&&r.addEventListener("submit",async d=>{var b;d.preventDefault();const u=document.getElementById("support-reply-input").value.trim();if(!u)return;St(n.id,"admin",((b=l.user)==null?void 0:b.username)||"Admin",u);const E=n.email,S=`
        <div style="font-family: sans-serif; background: #07080a; color: white; padding: 24px; border-radius: 12px; border: 1px solid #00ff66;">
          <h2 style="color: #00ff66;">תגובה חדשה מהצוות של DIGGY</h2>
          <p>היי ${n.name},</p>
          <p>${u}</p>
          <p>לשאלות נוספות, ניתן להשיב ישירות לאימייל זה.</p>
        </div>
      `;await F(E,"DIGGY - תגובה חדשה לתמיכה",S),g("התגובה נשלחה למשתמש!","success"),oe(n.id)})}function rt(e){const t=document.getElementById("game-rating-input"),o=document.getElementById("game-rating-display");if(!t)return;const a=l.games.find(r=>r.id===e);if(!a)return;const i=H(e),{rating:n,count:s}=ge(a);o&&(o.innerHTML=ot(n,s)),t.innerHTML=`
    <div class="rating-input-label">דרג את המשחק:</div>
    <div class="star-rating-input" id="star-input-btns">
      ${[1,2,3,4,5].map(r=>`
        <button type="button" class="star-input-btn ${i>=r?"selected":""}" data-score="${r}" title="${r} כוכבים">
          <i class="${i>=r?"fas":"far"} fa-star"></i>
        </button>
      `).join("")}
    </div>
    ${i?`<div class="rating-user-msg">דרגת ${i} כוכבים</div>`:""}
  `,t.querySelectorAll(".star-input-btn").forEach(r=>{r.addEventListener("click",async()=>{const c=parseInt(r.getAttribute("data-score"),10);if(H(e)){g("כבר דירגת משחק זה!","warning");return}y(!0);try{const d=await it(e,c);It(e,c);const m=l.games.findIndex(u=>u.id===e);m!==-1&&(l.games[m].rating=d,l.games[m].ratingCount=(l.games[m].ratingCount||0)+1,l.games[m].ratingSum=(l.games[m].ratingSum||0)+c),g("תודה על הדירוג! ⭐","success"),rt(e)}catch{g("שגיאה בשמירת הדירוג","danger")}finally{y(!1)}}),r.addEventListener("mouseenter",()=>{if(H(e))return;const c=parseInt(r.getAttribute("data-score"),10);t.querySelectorAll(".star-input-btn").forEach(d=>{const m=parseInt(d.getAttribute("data-score"),10),u=d.querySelector("i");u.className=m<=c?"fas fa-star":"far fa-star"})}),r.addEventListener("mouseleave",()=>{const c=H(e);t.querySelectorAll(".star-input-btn").forEach(d=>{const m=parseInt(d.getAttribute("data-score"),10),u=d.querySelector("i");u.className=c&&m<=c?"fas fa-star":"far fa-star",d.classList.toggle("selected",c&&m<=c)})})})}const kt={"#/":lt,"#/login":Gt,"#/dev":ye,"#/dev-docs":Vt,"#/admin":K,"#/settings":pt,"#/articles":Ft,"#/sitemap":Ht,"#/terms":jt,"#/privacy":Yt,"#/contact":Nt,"#/game/:id":ct};function k(e){window.location.hash=e}async function Ae(){const e=window.location.hash||"#/";if(l.currentRoute=e,l.gameInstance&&l.gameInstance.stop&&(l.gameInstance.stop(),l.gameInstance=null),e.startsWith("#/game/")){const o=e.split("#/game/")[1];await ct(o),X("");return}if(e.startsWith("#/articles/")){const o=e.split("#/articles/")[1];await Ot(o),X("#/articles");return}const t=kt[e]||lt;X(e),await t()}function X(e){document.querySelectorAll(".nav-item").forEach(t=>{t.getAttribute("data-route")===e?t.classList.add("active"):t.classList.remove("active")})}window.addEventListener("DOMContentLoaded",async()=>{window.addEventListener("hashchange",Ae),window.addEventListener("diggy-email-sent",e=>{l.recentEmails.unshift(e.detail),qt()}),Mt(),Q(),Lt(),De(async e=>{e?(l.user=e,le(e.customTheme||"#00ff66"),W(),Q()):(l.user=null,le("#00ff66"),W(),Q()),Ae()}),await fe()});function Q(){const e=document.getElementById("sidebar-nav-menu");if(!e)return;let t=`
    <div class="nav-item" id="home-nav-btn" data-route="#/">
      <i class="fas fa-home"></i>
      <span>מסך הבית</span>
    </div>
    <div class="nav-item" id="articles-nav-btn" data-route="#/articles">
      <i class="fas fa-newspaper"></i>
      <span>מאמרים וחדשות</span>
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
  `,l.user&&((l.user.role==="developer"||l.user.role==="admin")&&(t+=`
        <div class="nav-section-title">פיתוח</div>
        <div class="nav-item" id="dev-nav-btn" data-route="#/dev">
          <i class="fas fa-code"></i>
          <span>פאנל מפתח</span>
        </div>
        <div class="nav-item" id="dev-docs-btn" data-route="#/dev-docs">
          <i class="fas fa-book"></i>
          <span>מדריך מפתחים</span>
        </div>
      `),l.user.role==="admin"&&(t+=`
        <div class="nav-item" id="admin-nav-btn" data-route="#/admin">
          <i class="fas fa-shield-alt"></i>
          <span>ניהול מערכת</span>
        </div>
      `)),e.innerHTML=t,document.getElementById("home-nav-btn").addEventListener("click",()=>{k("#/")});const o=document.getElementById("articles-nav-btn");o&&o.addEventListener("click",()=>{k("#/articles")}),e.querySelectorAll("[data-category]").forEach(s=>{s.addEventListener("click",()=>{const r=s.getAttribute("data-category");k("#/"),setTimeout(()=>{se(r),document.querySelectorAll(".category-tabs button").forEach(d=>{d.getAttribute("data-category")===r?(d.classList.add("active-cat"),d.style.borderColor="var(--accent-color)",d.style.background="var(--accent-dim)"):(d.classList.remove("active-cat"),d.style.borderColor="rgba(255, 255, 255, 0.05)",d.style.background="transparent")})},150)})});const a=document.getElementById("dev-nav-btn");a&&a.addEventListener("click",()=>{k("#/dev")});const i=document.getElementById("dev-docs-btn");i&&i.addEventListener("click",()=>{k("#/dev-docs")});const n=document.getElementById("admin-nav-btn");n&&n.addEventListener("click",()=>{k("#/admin")})}function Lt(){Object.entries({"footer-sitemap-btn":"#/sitemap","footer-terms-btn":"#/terms","footer-privacy-btn":"#/privacy","footer-contact-btn":"#/contact","footer-rights-btn":"#/contact","footer-articles-btn":"#/articles"}).forEach(([t,o])=>{const a=document.getElementById(t);a&&a.addEventListener("click",i=>{i.preventDefault(),k(o)})})}function M(){if(!document.getElementById("content-page-inline-styles")){const e=document.createElement("style");e.id="content-page-inline-styles",e.textContent=`
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
    `,document.head.appendChild(e)}}async function fe(){try{const e=await We();l.games=[...Z,...e.filter(t=>!Z.some(o=>o.id===t.id))]}catch(e){console.warn("Could not pull games from Firebase, using presets only:",e),l.games=[...Z]}}async function lt(){const e=document.getElementById("main-container");e.innerHTML=`
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
  `,$t(),Tt(),se("ALL"),dt();const t=e.querySelectorAll(".category-tabs button");t.forEach(o=>{o.addEventListener("click",()=>{t.forEach(a=>{a.classList.remove("active-cat"),a.style.borderColor="rgba(255, 255, 255, 0.05)",a.style.background="transparent"}),o.classList.add("active-cat"),o.style.borderColor="var(--accent-color)",o.style.background="var(--accent-dim)",se(o.getAttribute("data-category"))})})}function $t(){const e=document.getElementById("header-auth-actions");e&&(l.user?(e.innerHTML=`
      <div style="display: flex; gap: 10px; align-items: center;">
        <span style="color: var(--text-muted); font-size: 14px;">שלום, <strong>${l.user.username}</strong>!</span>
        <button class="btn btn-secondary" id="logout-btn"><i class="fas fa-sign-out-alt"></i> התנתק</button>
      </div>
    `,document.getElementById("logout-btn").addEventListener("click",async()=>{await Re(),k("#/login")})):e.innerHTML=`
      <button class="btn btn-primary" onclick="window.location.hash='#/login'"><i class="fas fa-sign-in-alt"></i> התחבר / הרשם</button>
    `)}function Tt(){const e=document.getElementById("promo-slider");if(!e)return;const t=l.games.slice(0,3);if(t.length===0){e.style.display="none";return}clearInterval(l.promoTimer),e.innerHTML=t.map((o,a)=>`
    <div class="slide-item ${a===0?"active":""}" style="background-image: url('${o.logoUrl}')" data-index="${a}">
      <div class="slide-overlay"></div>
      <div class="slide-content">
        <span class="slide-tag">משחק מומלץ!</span>
        <h2 class="slide-title">${o.name}</h2>
        <p class="slide-desc">${o.description}</p>
        <button class="btn btn-primary play-now-promo" data-id="${o.id}"><i class="fas fa-play"></i> שחק עכשיו</button>
      </div>
    </div>
  `).join(""),e.querySelectorAll(".play-now-promo").forEach(o=>{o.addEventListener("click",()=>{const a=o.getAttribute("data-id");k(`#/game/${a}`)})}),l.activePromoIndex=0,l.promoTimer=setInterval(()=>{const o=e.querySelectorAll(".slide-item");o.length&&(o[l.activePromoIndex].classList.remove("active"),l.activePromoIndex=(l.activePromoIndex+1)%o.length,o[l.activePromoIndex].classList.add("active"))},5e3)}function se(e){const t=document.getElementById("home-games-grid");if(!t)return;console.log("renderGamesGrid called with category:",e),console.log("Total games:",l.games.length),console.log("Games with categories:",l.games.filter(a=>a.categories&&a.categories.length>0).length);const o=e==="ALL"?l.games:l.games.filter(a=>a.categories&&a.categories.includes(e));if(console.log("Filtered games count:",o.length),console.log("Filtered games:",o.map(a=>({name:a.name,categories:a.categories}))),o.length===0){t.innerHTML='<div style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 40px 0;">אין משחקים בקטגוריה זו כרגע.</div>';return}t.innerHTML=o.map(a=>ne(a)).join(""),re(t)}function ne(e){const t=l.user&&l.user.favorites&&l.user.favorites.includes(e.id),o=t?"active":"",a=t?"fas fa-heart":"far fa-heart",{rating:i,count:n}=ge(e);return`
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
        ${ot(i,n,"card-size")}
        <p class="game-card-desc">${e.description}</p>
        <div class="game-card-tags">
          ${e.categories.map(s=>`<span class="game-tag">${s}</span>`).join("")}
        </div>
        <button class="btn btn-secondary play-game-btn" data-id="${e.id}" style="width: 100%; justify-content: center; padding: 8px;">
          <i class="fas fa-play"></i> שחק
        </button>
      </div>
    </div>
  `}function re(e){e.querySelectorAll(".play-game-btn").forEach(t=>{t.addEventListener("click",o=>{o.stopPropagation();const a=t.getAttribute("data-id");k(`#/game/${a}`)})}),e.querySelectorAll(".favorite-btn").forEach(t=>{t.addEventListener("click",async o=>{if(o.stopPropagation(),!l.user){g("אנא התחבר כדי לשמור משחקים מועדפים!","warning"),k("#/login");return}const a=t.getAttribute("data-id");let i=[...l.user.favorites||[]];i.includes(a)?(i=i.filter(n=>n!==a),t.classList.remove("active"),t.querySelector("i").className="far fa-heart",g("הוסר מהמועדפים","info")):(i.push(a),t.classList.add("active"),t.querySelector("i").className="fas fa-heart",g("נוסף למועדפים! ❤️","success")),l.user.favorites=i,await G(l.user.uid,{favorites:i}),dt()})})}function dt(){const e=document.getElementById("recent-played-section"),t=document.getElementById("recent-games-grid"),o=document.getElementById("favorites-section"),a=document.getElementById("favorite-games-grid");if(!l.user){e&&(e.style.display="none"),o&&(o.style.display="none");return}const i=l.user.recentlyPlayed||[];if(i.length>0&&t){const s=l.games.filter(r=>i.includes(r.id));s.length>0?(e.style.display="block",t.innerHTML=s.map(r=>ne(r)).join(""),re(t)):e.style.display="none"}else e&&(e.style.display="none");const n=l.user.favorites||[];if(n.length>0&&a){const s=l.games.filter(r=>n.includes(r.id));s.length>0?(o.style.display="block",a.innerHTML=s.map(r=>ne(r)).join(""),re(a)):o.style.display="none"}else o&&(o.style.display="none")}function Gt(){const e=document.getElementById("main-container");e.innerHTML=`
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
  `;let t=!1;const o=document.getElementById("login-form"),a=document.getElementById("toggle-auth-mode"),i=document.getElementById("auth-panel-title"),n=document.getElementById("auth-biometric-btn");a.addEventListener("click",s=>{s.preventDefault(),t=!t,t?(i.textContent="רישום חשבון DIGGY חדש",o.querySelector('button[type="submit"]').innerHTML='<i class="fas fa-user-plus"></i> צור חשבון',a.textContent="התחבר לחשבון קיים",n.style.display="none"):(i.textContent="כניסה למערכת DIGGY",o.querySelector('button[type="submit"]').innerHTML='<i class="fas fa-rocket"></i> התחבר',a.textContent="צור חשבון חדש",n.style.display="flex")}),o.addEventListener("submit",async s=>{s.preventDefault();const r=V(document.getElementById("auth-username").value),c=document.getElementById("auth-password").value,d=ce(r);if(!d.valid){g(d.errors[0],"danger");return}const m=de(c);if(!m.valid){g(m.errors[0],"danger");return}if(!t){const u=$e(r);if(!u.allowed){g(`יותר מדי ניסיונות כניסה. נסה שוב בעוד ${u.remainingTime} דקות.`,"danger");return}}y(!0);try{if(t){const u=await _e(r,c);g("החשבון נוצר בהצלחה! ברוך הבא ל-DIGGY 🎉","success"),k("#/")}else{Te(r);const u=await pe(r,c);if(Ge(r),u.twoFactorEnabled){y(!1),Bt(u);return}g("התחברת בהצלחה! 🎮","success"),k("#/")}}catch(u){g(u.message,"danger")}finally{y(!1)}}),n.addEventListener("click",()=>{Dt()})}function Bt(e){const t=ae(e.uid),o=`
    <div style="background: #07080a; color: #fff; padding: 30px; border-radius: 12px; border: 1px solid #00ff66; font-family: sans-serif; text-align: center;">
      <h2 style="color: #00ff66;">DIGGY Security Verification</h2>
      <p>שלום ${e.username}, קיבלנו בקשת התחברות לחשבון שלך.</p>
      <div style="font-size: 32px; font-weight: bold; background: rgba(0,255,102,0.1); border: 1px dashed #00ff66; padding: 15px; margin: 20px auto; letter-spacing: 5px; width: 200px; border-radius: 6px;">
        ${t}
      </div>
      <p style="color: #888;">הקוד תקף ל-5 דקות הקרובות. אנא אל תשתף קוד זה עם אף אחד.</p>
    </div>
  `;j(()=>Promise.resolve().then(()=>Et),void 0).then(async a=>{const i=e.twoFactorEmail||e.email;await a.sendEmailViaResend(i,"DIGGY - קוד אימות דו-שלבי",o);const n=document.getElementById("modal-overlay"),s=document.getElementById("modal-title"),r=document.getElementById("modal-body");s.textContent="אימות דו-שלבי (2FA)",r.innerHTML=`
      <div style="text-align: center; display: flex; flex-direction: column; gap: 15px;">
        <p>קוד אימות נשלח לאימייל שלך: <strong style="color: var(--accent-color);">${i}</strong></p>
        <p style="font-size: 13px; color: var(--text-muted);">הזן את 6 הספרות כדי להשלים את ההתחברות:</p>
        <input type="text" id="twofactor-input" max-length="6" placeholder="000000" style="text-align: center; font-size: 24px; letter-spacing: 8px; font-family: var(--font-display); width: 200px; margin: 10px auto;">
        <button class="btn btn-primary" id="verify-2fa-btn" style="justify-content: center;">אמת קוד וכנס</button>
        <button class="btn btn-secondary" id="resend-2fa-btn" style="justify-content: center; font-size: 12px;">שלח קוד חדש</button>
      </div>
    `,n.classList.add("active"),document.getElementById("verify-2fa-btn").addEventListener("click",()=>{const c=document.getElementById("twofactor-input").value.trim(),d=Ke(e.uid,c);d.valid?(n.classList.remove("active"),g("הקוד אומת! ברוך הבא ל-DIGGY 🎉","success"),k("#/")):(g(d.error,"danger"),d.error.includes("חרגת")&&setTimeout(()=>{n.classList.remove("active"),k("#/login")},2e3))}),document.getElementById("resend-2fa-btn").addEventListener("click",()=>{Je(e.uid);const c=ae(e.uid),d=o.replace(t,c);a.sendEmailViaResend(i,"DIGGY - קוד אימות דו-שלבי (חדש)",d),g("קוד חדש נשלח לאימייל!","info")})})}async function Dt(){const e=document.getElementById("modal-overlay"),t=document.getElementById("modal-title"),o=document.getElementById("modal-body");t.textContent="סורק טביעת אצבע ביומטרי",o.innerHTML=`
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
  `,e.classList.add("active");let a=localStorage.getItem("diggy_bio_username"),i=localStorage.getItem("diggy_bio_uid");setTimeout(async()=>{const n=document.getElementById("bio-status"),s=document.getElementById("bio-widget");if(!a||!i){s.classList.remove("scanning"),s.style.color="var(--danger-color)",n.innerHTML="שגיאה: זיהוי ביומטרי לא מוגדר!",n.style.color="var(--danger-color)",setTimeout(()=>{e.classList.remove("active"),g("לא הוגדרה כניסה ביומטרית בחשבון זה! היכנס רגיל והפעל אותה בהגדרות.","warning")},1500);return}try{(await Xe(a,i)).success&&(s.classList.remove("scanning"),s.style.color="#00ff66",n.innerHTML="סריקה הושלמה! מאושר",setTimeout(async()=>{e.classList.remove("active");const c=await pe(a,"auth_biometric_token");g(`ברוך שובך ביומטרי, ${a}!`,"success"),k("#/")},1e3))}catch(r){console.warn("WebAuthn verification failed:",r),s.classList.remove("scanning"),s.style.color="var(--danger-color)",n.innerHTML="סריקה נכשלה",n.style.color="var(--danger-color)",setTimeout(()=>{e.classList.remove("active"),g("שגיאה בכניסה ביומטרית: "+r.message,"danger")},1500)}},2e3)}async function ye(){const e=document.getElementById("main-container");if(!l.user||l.user.role!=="developer"&&l.user.role!=="admin"){e.innerHTML=`
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
  `;try{const t=await He(l.user.uid),o=document.getElementById("dev-games-list-body");t.length===0?o.innerHTML=`
        <tr>
          <td colspan="7" style="text-align: center; color: var(--text-muted); padding: 40px;">
            <i class="fas fa-folder-open" style="font-size: 32px; display: block; margin-bottom: 10px;"></i>
            טרם הגשת משחקים לאתר. לחץ על "הגש משחק חדש" כדי להתחיל!
          </td>
        </tr>
      `:(o.innerHTML=t.map(a=>{let i="";a.status==="pending"?i='<span class="badge badge-pending">ממתין לאישור</span>':a.status==="approved"?i='<span class="badge badge-approved">אושר בהצלחה</span>':a.status==="rejected"?i='<span class="badge badge-rejected">נדחה</span>':a.status==="improvement"&&(i='<span class="badge badge-improvement">דרוש תיקון</span>');const n=a.status==="improvement"?`<button class="btn btn-secondary resubmit-btn" data-id="${a.id}" style="padding: 4px 10px; font-size: 11px;"><i class="fas fa-edit"></i> ערוך והגש שנית</button>`:a.status==="approved"?`<div style="display: flex; gap: 6px;">
                  <button class="btn btn-secondary view-stats-btn" data-id="${a.id}" style="padding: 4px 8px; font-size: 11px; background: rgba(0, 255, 102, 0.05); color: var(--accent-color); border-color: rgba(0,255,102,0.2);"><i class="fas fa-chart-line"></i> סטטיסטיקות</button>
                  <button class="btn btn-primary new-version-btn" data-id="${a.id}" style="padding: 4px 8px; font-size: 11px;"><i class="fas fa-code-branch"></i> גרסה חדשה</button>
                 </div>`:'<span style="color: var(--text-dark); font-size: 12px;">אין פעולות</span>';return`
          <tr data-raw='${JSON.stringify(a)}'>
            <td><img src="${a.logoUrl||""}" onerror="this.src='https://placehold.co/40x40/12161e/00ff66?text=G'" style="width: 40px; height: 40px; border-radius: 6px; object-fit: cover;"></td>
            <td style="font-weight: bold; color: var(--accent-color);">${a.name}</td>
            <td>${a.categories?a.categories.join(", "):""}</td>
            <td><a href="${a.githubUrl}" target="_blank" style="color: #0096ff; text-decoration: underline; font-size: 12px;">קוד מאגר</a></td>
            <td>${i}</td>
            <td style="max-width: 200px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${a.adminSuggestions||""}">${a.adminSuggestions||'<span style="color: var(--text-dark);">אין</span>'}</td>
            <td>${n}</td>
          </tr>
        `}).join(""),o.querySelectorAll(".resubmit-btn").forEach(a=>{a.addEventListener("click",()=>{const i=a.closest("tr"),n=JSON.parse(i.getAttribute("data-raw"));Se(n)})}),o.querySelectorAll(".view-stats-btn").forEach(a=>{a.addEventListener("click",()=>{const i=a.closest("tr"),n=JSON.parse(i.getAttribute("data-raw"));_t(n)})}),o.querySelectorAll(".new-version-btn").forEach(a=>{a.addEventListener("click",()=>{const i=a.closest("tr"),n=JSON.parse(i.getAttribute("data-raw"));Rt(n)})}))}catch(t){g("שגיאה בטעינת משחקי מפתח: "+t.message,"danger")}document.getElementById("dev-submit-game-btn").addEventListener("click",()=>{Se()})}function Se(e=null){const t=document.getElementById("modal-overlay"),o=document.getElementById("modal-title"),a=document.getElementById("modal-body");o.textContent=e?`עריכת והגשת המשחק: ${e.name}`:"הגשת משחק חדש ל-DIGGY",a.innerHTML=`
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
  `,t.classList.add("active");const i=document.getElementById("game-submit-form");i.addEventListener("submit",async n=>{n.preventDefault();const s=i.querySelectorAll('input[name="game-cats"]:checked');if(s.length===0){g("עליך לבחור לפחות קטגוריה אחת (מקסימום 3)!","warning");return}if(s.length>3){g("ניתן לבחור עד 3 קטגוריות בלבד!","warning");return}const r=Array.from(s).map(d=>d.value),c={name:document.getElementById("game-name").value,description:document.getElementById("game-desc").value,logoUrl:document.getElementById("game-logo").value,githubUrl:document.getElementById("game-github").value,gameUrl:document.getElementById("game-url").value,howToPlay:document.getElementById("game-how").value,targetAudience:document.getElementById("game-audience").value,categories:r,developerUid:l.user.uid,developerName:l.user.username};y(!0);try{e?(await Ne(e.id,c),g("בקשת המשחק עודכנה ונשלחה מחדש לאישור! 🚀","success")):(await Oe(c),g("המשחק נשלח לאישור ה-Admin! יישלח אליך עדכון במייל. 📧","success")),t.classList.remove("active"),ye()}catch(d){g(d.message,"danger")}finally{y(!1)}})}function _t(e){const t=document.getElementById("modal-overlay"),o=document.getElementById("modal-title"),a=document.getElementById("modal-body");o.textContent=`סטטיסטיקות משחק: ${e.name}`;const i=l.games.find(u=>u.githubUrl===e.githubUrl||u.id===e.gameId),n=i&&i.plays||0;let s=0;for(let u=0;u<e.id.length;u++)s+=e.id.charCodeAt(u);const c=(i?ge(i):{display:(4.5+s%6*.1).toFixed(1)}).display,d=(1.5+(n?n%3*.4:.8)).toFixed(1),m=(n*.15).toFixed(2);a.innerHTML=`
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
          <div style="font-size: 28px; font-weight: bold; color: var(--accent-color); margin-top: 5px; font-family: var(--font-display);">${n}</div>
        </div>

        <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 12px; padding: 15px; text-align: center; box-shadow: var(--border-glow);">
          <i class="fas fa-star" style="font-size: 24px; color: #ffd700; margin-bottom: 8px;"></i>
          <div style="font-size: 12px; color: var(--text-muted); text-transform: uppercase;">דירוג שחקנים</div>
          <div style="font-size: 28px; font-weight: bold; color: #fff; margin-top: 5px; font-family: var(--font-display);">${c} <span style="font-size: 14px; color: var(--text-muted);">/ 5.0</span></div>
        </div>

        <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 12px; padding: 15px; text-align: center; box-shadow: var(--border-glow);">
          <i class="fas fa-hourglass-half" style="font-size: 24px; color: #70d6ff; margin-bottom: 8px;"></i>
          <div style="font-size: 12px; color: var(--text-muted); text-transform: uppercase;">זמן משחק ממוצע</div>
          <div style="font-size: 22px; font-weight: bold; color: #fff; margin-top: 10px; font-family: var(--font-display);">${d} דק'</div>
        </div>

        <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 12px; padding: 15px; text-align: center; box-shadow: var(--border-glow);">
          <i class="fas fa-coins" style="font-size: 24px; color: #00ff66; margin-bottom: 8px;"></i>
          <div style="font-size: 12px; color: var(--text-muted); text-transform: uppercase;">רווחים שנצברו</div>
          <div style="font-size: 22px; font-weight: bold; color: #00ff66; margin-top: 10px; font-family: var(--font-display);">${m} ₪</div>
        </div>
      </div>

      <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 12px; padding: 15px; font-size: 13px; line-height: 1.5; color: var(--text-muted);">
        <i class="fas fa-circle-info" style="color: var(--accent-color); margin-left: 5px;"></i>
        הרווחים מחושבים לפי מפתח תגמול של 0.15 ₪ לכל משחק פעיל של שחקן רשום באתר. תשלומים מועברים בסוף כל חודש קלנדרי.
      </div>
    </div>
  `,t.classList.add("active")}function Rt(e){const t=document.getElementById("modal-overlay"),o=document.getElementById("modal-title"),a=document.getElementById("modal-body");o.textContent=`הגשת גרסה חדשה: ${e.name}`,a.innerHTML=`
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
  `,t.classList.add("active"),document.getElementById("game-version-form").addEventListener("submit",async n=>{n.preventDefault();const s={version:document.getElementById("version-number").value.trim(),changelog:document.getElementById("version-changelog").value.trim(),gameUrl:document.getElementById("version-url").value.trim(),githubUrl:document.getElementById("version-github").value.trim(),developerUid:l.user.uid,developerName:l.user.username,name:e.name,logoUrl:e.logoUrl,description:e.description};y(!0);try{await at(e.gameId||e.id,s),g("גרסת המשחק החדשה נשלחה לאישור המנהל! 🚀","success"),t.classList.remove("active"),ye()}catch(r){g(r.message,"danger")}finally{y(!1)}})}async function K(){const e=document.getElementById("main-container");if(!l.user||l.user.role!=="admin"){e.innerHTML=`
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

    <!-- Support Chat Section -->
    <div class="section-title">צ'אט תמיכה / Admin Inbox</div>
    <div class="support-chat-shell">
      <div class="support-chat-list" id="admin-support-thread-list"></div>
      <div class="support-chat-content" id="admin-support-thread-content"></div>
    </div>

    <!-- Resend Configuration Section -->
    <div class="section-title">הגדרות Resend ואימיילים</div>
    <div class="data-table-container" style="padding: 20px;">
      <div class="form-group">
        <label>מפתח Resend API</label>
        <input type="password" id="resend-api-key" value="${ie().apiKey||""}" placeholder="re_...">
      </div>
      <div class="form-group">
        <label>כתובת שולח (Sender)</label>
        <input type="text" id="resend-from" value="${ie().from||"DIGGY Games <noreply@diggy.com>"}" placeholder="DIGGY Games <noreply@yourdomain.com>">
      </div>
      <div class="form-group">
        <label>כתובת תמיכה לאדמין</label>
        <input type="email" id="support-admin-email" value="${localStorage.getItem("diggy_support_admin_email")||"support@diggy-arena.com"}" placeholder="support@yourdomain.com">
      </div>
      <button class="btn btn-primary" id="save-resend-config-btn" style="margin-top: 10px;"><i class="fas fa-save"></i> שמור הגדרות Resend</button>
      <p style="margin-top: 10px; color: var(--text-muted); font-size: 13px;">ההגדרות נשמרות ב-localStorage של הדפדפן. לשימוש אמיתי יש להגדיר דומיין מאומת ב-Resend ולשמור מפתח API תקין.</p>
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
  `,oe(l.supportActiveThreadId),document.getElementById("admin-direct-upload-btn").addEventListener("click",()=>{Ut()});const t=document.getElementById("save-resend-config-btn");t&&t.addEventListener("click",()=>{const o=document.getElementById("resend-api-key").value,a=document.getElementById("resend-from").value,i=document.getElementById("support-admin-email").value;Qe(o,a),i&&localStorage.setItem("diggy_support_admin_email",i),g("הגדרות Resend נשמרו.","success")});try{const o=await ze(),a=document.getElementById("admin-dev-requests-body");o.length===0?a.innerHTML='<tr><td colspan="6" style="text-align: center; color: var(--text-muted); padding: 30px;">אין פניות מפתחים פעילות.</td></tr>':(a.innerHTML=o.map(i=>{const n=i.status==="pending";let s="";i.status==="approved"?s='<span class="badge badge-approved">אושר</span>':i.status==="rejected"?s='<span class="badge badge-rejected">נדחה</span>':s='<span class="badge badge-pending">ממתין</span>';const r=n?`
            <div style="display: flex; gap: 8px;">
              <button class="btn btn-primary admin-approve-dev" data-id="${i.id}" style="padding: 4px 8px; font-size: 10px;"><i class="fas fa-check"></i> אישור</button>
              <button class="btn btn-danger admin-reject-dev" data-id="${i.id}" style="padding: 4px 8px; font-size: 10px;"><i class="fas fa-times"></i> דחייה</button>
            </div>
          `:'<span style="color: var(--text-dark); font-size: 12px;">נסגר</span>';return`
          <tr>
            <td style="font-weight: bold;">${i.username}</td>
            <td>${i.contactEmail}</td>
            <td style="max-width: 250px; font-size: 13px;" title="${i.reason}">${i.reason}</td>
            <td>${new Date(i.createdAt).toLocaleDateString()}</td>
            <td>${s}</td>
            <td>${r}</td>
          </tr>
        `}).join(""),a.querySelectorAll(".admin-approve-dev").forEach(i=>{i.addEventListener("click",()=>q(i.getAttribute("data-id"),"approved","dev"))}),a.querySelectorAll(".admin-reject-dev").forEach(i=>{i.addEventListener("click",()=>q(i.getAttribute("data-id"),"rejected","dev"))}))}catch(o){console.error("Error loading dev requests:",o)}try{const o=await je(),a=document.getElementById("admin-game-requests-body");o.length===0?a.innerHTML='<tr><td colspan="6" style="text-align: center; color: var(--text-muted); padding: 30px;">אין משחקים הממתינים לאישור.</td></tr>':(a.innerHTML=o.map(i=>{const n=i.status==="pending";let s="";i.status==="approved"?s='<span class="badge badge-approved">אושר</span>':i.status==="rejected"?s='<span class="badge badge-rejected">נדחה</span>':i.status==="improvement"&&(s='<span class="badge badge-improvement">הצעת שיפור</span>');const r=i.type==="version_update"?`<span class="badge badge-pending" style="background: rgba(112, 214, 255, 0.15); color: #70d6ff; border-color: rgba(112,214,255,0.3); margin-top: 4px; display: inline-block;">עדכון גרסה (${i.version})</span>`:"",c=n?`
            <div style="display: flex; gap: 6px; flex-direction: column;">
              <button class="btn btn-primary admin-approve-game" data-id="${i.id}" style="padding: 4px 8px; font-size: 10px; justify-content: center;"><i class="fas fa-check"></i> אישור והעלאה</button>
              <button class="btn btn-secondary admin-improve-game" data-id="${i.id}" style="padding: 4px 8px; font-size: 10px; justify-content: center; border-color: #0096ff; color: #0096ff;"><i class="fas fa-comment-dots"></i> הצעות לשיפור</button>
              <button class="btn btn-danger admin-reject-game" data-id="${i.id}" style="padding: 4px 8px; font-size: 10px; justify-content: center;"><i class="fas fa-times"></i> דחייה מוחלטת</button>
            </div>
          `:`<div style="display: flex; flex-direction: column; gap: 4px;">${s}<span style="color: var(--text-muted); font-size: 11px;">${i.adminSuggestions||""}</span></div>`;return`
          <tr>
            <td><strong>${i.developerName}</strong></td>
            <td>
              <div style="display: flex; align-items: center; gap: 10px;">
                <img src="${i.logoUrl}" style="width: 40px; height: 40px; border-radius: 6px; object-fit: cover;">
                <div>
                  <div style="font-weight: bold; color: var(--accent-color);">${i.name} ${r}</div>
                  <div style="font-size: 11px; color: var(--text-muted);">איך משחקים: ${i.howToPlay}</div>
                </div>
              </div>
            </td>
            <td>${i.categories?i.categories.join(", "):""}</td>
            <td><a href="${i.githubUrl}" target="_blank" style="color: #0096ff; text-decoration: underline; font-size: 12px;">מקור קוד</a></td>
            <td>
              ${i.type==="version_update"?`<div style="font-size: 12px; color: var(--accent-color);"><strong>מה חדש בגרסה:</strong> ${i.changelog}</div>`:`<div style="font-size: 12px;"><strong>מיועד ל:</strong> ${i.targetAudience}</div>
                   <div style="font-size: 12px; color: var(--text-muted); max-width: 200px; overflow: hidden; text-overflow: ellipsis;">${i.description}</div>`}
            </td>
            <td>${c}</td>
          </tr>
        `}).join(""),a.querySelectorAll(".admin-approve-game").forEach(i=>{i.addEventListener("click",()=>q(i.getAttribute("data-id"),"approved","game"))}),a.querySelectorAll(".admin-improve-game").forEach(i=>{i.addEventListener("click",()=>q(i.getAttribute("data-id"),"improvement","game"))}),a.querySelectorAll(".admin-reject-game").forEach(i=>{i.addEventListener("click",()=>q(i.getAttribute("data-id"),"rejected","game"))}))}catch(o){console.error("Error loading games queue:",o)}try{const o=await Ce(),a=document.getElementById("admin-users-list-body");o.length===0?a.innerHTML='<tr><td colspan="6" style="text-align: center; color: var(--text-muted); padding: 30px;">לא נמצאו חשבונות רשומים.</td></tr>':(a.innerHTML=o.map(i=>{const n=i.createdAt?new Date(i.createdAt).toLocaleDateString():"לא ידוע",s=i.twoFactorEnabled?'<span style="color: var(--accent-color); font-size: 11px;"><i class="fas fa-check-circle"></i> פעיל</span>':'<span style="color: var(--text-dark); font-size: 11px;">כבוי</span>',r=i.biometricsEnabled?'<span style="color: var(--accent-color); font-size: 11px;"><i class="fas fa-check-circle"></i> פעיל</span>':'<span style="color: var(--text-dark); font-size: 11px;">כבוי</span>';return`
          <tr>
            <td><strong>${i.username}</strong></td>
            <td style="font-family: monospace; font-size: 11px; color: var(--text-muted);">${i.uid}</td>
            <td>${i.email}</td>
            <td>
              <select class="admin-role-select" data-uid="${i.uid}" style="background: var(--bg-darker); border-color: rgba(255,255,255,0.1); padding: 4px 8px; border-radius: 4px; font-size: 12px; font-family: var(--font-display); color: var(--accent-color);">
                <option value="player" ${i.role==="player"?"selected":""}>PLAYER</option>
                <option value="developer" ${i.role==="developer"?"selected":""}>DEVELOPER</option>
                <option value="admin" ${i.role==="admin"?"selected":""}>ADMIN</option>
              </select>
            </td>
            <td>
              <div style="display: flex; gap: 10px;">
                <span>2FA: ${s}</span>
                <span>Bio: ${r}</span>
              </div>
            </td>
            <td>${n}</td>
          </tr>
        `}).join(""),a.querySelectorAll(".admin-role-select").forEach(i=>{i.addEventListener("change",async()=>{const n=i.getAttribute("data-uid"),s=i.value;y(!0);try{await Me(n,s),g(`דרגת המשתמש עודכנה ל-${s.toUpperCase()} בהצלחה!`,"success"),l.user&&l.user.uid===n&&(l.user.role=s,W()),K()}catch(r){g("עדכון הדרגה נכשל: "+r.message,"danger")}finally{y(!1)}})}))}catch(o){console.error("Error loading users list:",o)}}function q(e,t,o){const a=document.getElementById("modal-overlay"),i=document.getElementById("modal-title"),n=document.getElementById("modal-body");i.textContent="הזנת הסבר מנהל מערכת (Admin Action)";let s="רשום סיבה או הצעות לשיפור שיועברו למשתמש:";t==="approved"?s="הערות אישור (יופיעו במייל):":t==="rejected"?s="סיבת סירוב (יופיע במייל - המשתמש לא יוכל להגיש שוב):":t==="improvement"&&(s="פרט את ההצעות לשיפור ושינויים שנדרשים מהמפתח:"),n.innerHTML=`
    <form id="admin-reason-form">
      <div class="form-group">
        <label>${s}</label>
        <textarea id="admin-notes" required placeholder="הזן כאן את הטקסט..." rows="4"></textarea>
      </div>
      <button type="submit" class="btn btn-primary" style="width: 100%; justify-content: center;">
        <i class="fas fa-check-double"></i> בצע פעולה ושלח מייל
      </button>
    </form>
  `,a.classList.add("active"),document.getElementById("admin-reason-form").addEventListener("submit",async r=>{r.preventDefault();const c=document.getElementById("admin-notes").value.trim();y(!0);try{o==="dev"?(await Fe(e,t,c),g("בקשת המפתח עודכנה והמייל נשלח בהצלחה!","success")):o==="game"&&(await Ye(e,t,c),g("בקשת המשחק עודכנה והמייל נשלח בהצלחה!","success")),a.classList.remove("active"),await fe(),K()}catch(d){g(d.message,"danger")}finally{y(!1)}})}function Ut(){const e=document.getElementById("modal-overlay"),t=document.getElementById("modal-title"),o=document.getElementById("modal-body");t.textContent="העלאה ישירה של משחק (Admin Bypass)",o.innerHTML=`
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
  `,e.classList.add("active");const a=document.getElementById("admin-direct-upload-form");a.addEventListener("submit",async i=>{i.preventDefault();const n=a.querySelectorAll('input[name="direct-cats"]:checked');if(n.length===0){g("בחר לפחות קטגוריה אחת!","warning");return}const s=Array.from(n).map(c=>c.value),r={name:document.getElementById("direct-name").value,description:document.getElementById("direct-desc").value,logoUrl:document.getElementById("direct-logo").value,githubUrl:document.getElementById("direct-github").value,gameUrl:document.getElementById("direct-url").value,howToPlay:document.getElementById("direct-how").value,targetAudience:document.getElementById("direct-audience").value,categories:s,developerUid:l.user.uid,developerName:`${l.user.username} (ADMIN)`};y(!0);try{await Ve(r),g("המשחק פורסם בהצלחה באתר ללא צורך באישור! 🎉","success"),e.classList.remove("active"),await fe(),K()}catch(c){g(c.message,"danger")}finally{y(!1)}})}async function ct(e){const t=document.getElementById("main-container"),o=l.games.find(a=>a.id===e);if(!o){t.innerHTML='<div style="text-align: center; padding: 80px 0;"><h2>משחק לא נמצא!</h2></div>';return}if(l.currentGame=o,l.user){let a=[...l.user.recentlyPlayed||[]];a=a.filter(i=>i!==e),a.unshift(e),a=a.slice(0,5),l.user.recentlyPlayed=a,await G(l.user.uid,{recentlyPlayed:a})}t.innerHTML=`
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
          <span class="game-meta-label">דירוג שחקנים</span>
          <div id="game-rating-display"></div>
        </div>

        <div class="game-meta-item" id="game-rating-input-wrap">
          <div id="game-rating-input"></div>
        </div>

        <hr style="border: 0; border-top: 1px solid rgba(255, 255, 255, 0.05);">

        <div class="game-meta-item">
          <span class="game-meta-label">תיאור המשחק</span>
          <p style="font-size: 13px; line-height: 1.5; color: var(--text-muted);">${o.description}</p>
        </div>
      </div>
    </div>
  `,document.getElementById("start-game-btn").addEventListener("click",()=>{if(document.getElementById("game-menu-overlay").style.display="none",tt(o.id).catch(a=>console.warn("Failed to record play stat:",a)),o.gameUrl){const a=document.getElementById("retro-game-iframe");a.src=o.gameUrl,a.style.display="block",l.gameInstance={stop:()=>{a.src="",a.style.display="none"}}}else{const a=document.getElementById("retro-game-canvas");a.style.display="block",o.id==="preset_snake"?l.gameInstance=ke(a):o.id==="preset_bricks"?l.gameInstance=Pt(a):o.id==="preset_evader"?l.gameInstance=Ct(a):l.gameInstance=ke(a)}}),rt(e)}function ke(e){const t=e.getContext("2d"),o=document.getElementById("game-score-display");let a=0,i=20,n=0,s={x:160,y:160,dx:i,dy:0,cells:[],maxCells:4},r={x:320,y:320},c=null,d=!0;function m(b,R){return Math.floor(Math.random()*(R-b))+b}function u(){d&&(c=requestAnimationFrame(u),!(++n<6)&&(n=0,t.clearRect(0,0,e.width,e.height),s.x+=s.dx,s.y+=s.dy,s.x<0?s.x=e.width-i:s.x>=e.width&&(s.x=0),s.y<0?s.y=e.height-i:s.y>=e.height&&(s.y=0),s.cells.unshift({x:s.x,y:s.y}),s.cells.length>s.maxCells&&s.cells.pop(),t.fillStyle="#ff3366",t.shadowBlur=15,t.shadowColor="#ff3366",t.beginPath(),t.arc(r.x+i/2,r.y+i/2,i/2-2,0,2*Math.PI),t.fill(),t.fillStyle=l.theme,t.shadowBlur=15,t.shadowColor=l.theme,s.cells.forEach(function(b,R){t.fillRect(b.x,b.y,i-1,i-1),b.x===r.x&&b.y===r.y&&(s.maxCells++,a+=10,o.textContent=`ניקוד: ${a}`,r.x=m(0,e.width/i)*i,r.y=m(0,e.height/i)*i);for(let f=R+1;f<s.cells.length;f++)b.x===s.cells[f].x&&b.y===s.cells[f].y&&S()})))}function E(b){b.key==="ArrowLeft"&&s.dx===0?(s.dx=-i,s.dy=0):b.key==="ArrowUp"&&s.dy===0?(s.dy=-i,s.dx=0):b.key==="ArrowRight"&&s.dx===0?(s.dx=i,s.dy=0):b.key==="ArrowDown"&&s.dy===0&&(s.dy=i,s.dx=0)}document.addEventListener("keydown",E),c=requestAnimationFrame(u);function S(){d=!1,t.shadowBlur=0,t.fillStyle="rgba(0, 0, 0, 0.8)",t.fillRect(0,0,e.width,e.height),t.fillStyle="#ff3366",t.font="24px Orbitron",t.textAlign="center",t.fillText("GAME OVER",e.width/2,e.height/2-20),t.fillStyle="#ffffff",t.font="14px Outfit",t.fillText(`ניקוד סופי: ${a}`,e.width/2,e.height/2+10),t.fillText("לחץ שוב על כפתור התחל כדי לנסות שנית",e.width/2,e.height/2+40)}return{stop:()=>{d=!1,cancelAnimationFrame(c),document.removeEventListener("keydown",E)}}}function Pt(e){const t=e.getContext("2d"),o=document.getElementById("game-score-display");let a=0,i=!0,n=null,s={x:e.width/2,y:e.height-30,dx:3,dy:-3,radius:8},r={x:e.width/2-50,y:e.height-20,width:100,height:10,speed:7},c=!1,d=!1,m=4,u=6,E=75,S=20,b=15,R=40,f=40,$=[];const B=["#ff3366","#00ff66","#0096ff","#ffcc00"];for(let h=0;h<u;h++){$[h]=[];for(let A=0;A<m;A++)$[h][A]={x:0,y:0,status:1,color:B[A%B.length]}}function O(h){h.key==="Right"||h.key==="ArrowRight"?d=!0:(h.key==="Left"||h.key==="ArrowLeft")&&(c=!0)}function he(h){h.key==="Right"||h.key==="ArrowRight"?d=!1:(h.key==="Left"||h.key==="ArrowLeft")&&(c=!1)}function be(h){let A=h.clientX-e.getBoundingClientRect().left;A>0&&A<e.width&&(r.x=A-r.width/2)}document.addEventListener("keydown",O),document.addEventListener("keyup",he),document.addEventListener("mousemove",be);function ut(){for(let h=0;h<u;h++)for(let A=0;A<m;A++){let D=$[h][A];D.status===1&&s.x>D.x&&s.x<D.x+E&&s.y>D.y&&s.y<D.y+S&&(s.dy=-s.dy,D.status=0,a+=15,o.textContent=`ניקוד: ${a}`,a===m*u*15&&mt())}}function xe(){if(i){t.clearRect(0,0,e.width,e.height);for(let h=0;h<u;h++)for(let A=0;A<m;A++)if($[h][A].status===1){let D=h*(E+b)+f,we=A*(S+b)+R;$[h][A].x=D,$[h][A].y=we,t.fillStyle=$[h][A].color,t.shadowBlur=10,t.shadowColor=$[h][A].color,t.fillRect(D,we,E,S)}if(t.beginPath(),t.arc(s.x,s.y,s.radius,0,Math.PI*2),t.fillStyle="#ffffff",t.shadowBlur=12,t.shadowColor="#ffffff",t.fill(),t.closePath(),t.fillStyle=l.theme,t.shadowBlur=15,t.shadowColor=l.theme,t.fillRect(r.x,r.y,r.width,r.height),ut(),(s.x+s.dx>e.width-s.radius||s.x+s.dx<s.radius)&&(s.dx=-s.dx),s.y+s.dy<s.radius)s.dy=-s.dy;else if(s.y+s.dy>e.height-s.radius)if(s.x>r.x&&s.x<r.x+r.width)s.dy=-s.dy;else{gt();return}d&&r.x<e.width-r.width?r.x+=r.speed:c&&r.x>0&&(r.x-=r.speed),s.x+=s.dx,s.y+=s.dy,n=requestAnimationFrame(xe)}}n=requestAnimationFrame(xe);function gt(){i=!1,t.shadowBlur=0,t.fillStyle="rgba(0,0,0,0.85)",t.fillRect(0,0,e.width,e.height),t.fillStyle="#ff3366",t.font="24px Orbitron",t.textAlign="center",t.fillText("GAME OVER",e.width/2,e.height/2-20),t.fillStyle="#ffffff",t.font="14px Outfit",t.fillText(`ניקוד סופי: ${a}`,e.width/2,e.height/2+10),t.fillText("נסה שנית!",e.width/2,e.height/2+40)}function mt(){i=!1,t.shadowBlur=0,t.fillStyle="rgba(0,0,0,0.85)",t.fillRect(0,0,e.width,e.height),t.fillStyle="#00ff66",t.font="24px Orbitron",t.textAlign="center",t.fillText("YOU WIN!",e.width/2,e.height/2-20),t.fillStyle="#ffffff",t.fillText(`ניקוד סופי: ${a}`,e.width/2,e.height/2+10)}return{stop:()=>{i=!1,cancelAnimationFrame(n),document.removeEventListener("keydown",O),document.removeEventListener("keyup",he),document.removeEventListener("mousemove",be)}}}function Ct(e){const t=e.getContext("2d"),o=document.getElementById("game-score-display");let a=0,i=!0,n=null,s={x:e.width/2-20,y:e.height-40,width:40,height:30,speed:6},r=[],c=[],d={},m=0;function u(f){d[f.key]=!0}function E(f){d[f.key]=!1}document.addEventListener("keydown",u),document.addEventListener("keyup",E);function S(){c.push({x:Math.random()*(e.width-30),y:-30,width:30,height:30,speed:1.5+Math.random()*3,color:"#ffaa00"})}function b(){i&&((d.ArrowLeft||d.a)&&(s.x=Math.max(0,s.x-s.speed)),(d.ArrowRight||d.d)&&(s.x=Math.min(e.width-s.width,s.x+s.speed)),(d[" "]||d.Spacebar)&&(!s.lastFired||Date.now()-s.lastFired>300)&&(r.push({x:s.x+s.width/2-2,y:s.y,width:4,height:12,speed:7}),s.lastFired=Date.now()),t.clearRect(0,0,e.width,e.height),t.fillStyle=l.theme,t.shadowBlur=15,t.shadowColor=l.theme,t.beginPath(),t.moveTo(s.x+s.width/2,s.y),t.lineTo(s.x,s.y+s.height),t.lineTo(s.x+s.width,s.y+s.height),t.closePath(),t.fill(),m++,m>40&&(S(),m=0),t.fillStyle="#00ffff",t.shadowColor="#00ffff",r.forEach((f,$)=>{f.y-=f.speed,t.fillRect(f.x,f.y,f.width,f.height),f.y<0&&r.splice($,1)}),c.forEach((f,$)=>{if(f.y+=f.speed,t.fillStyle=f.color,t.shadowColor=f.color,t.fillRect(f.x,f.y,f.width,f.height),f.x<s.x+s.width&&f.x+f.width>s.x&&f.y<s.y+s.height&&f.y+f.height>s.y){R();return}r.forEach((B,O)=>{B.x<f.x+f.width&&B.x+B.width>f.x&&B.y<f.y+f.height&&B.y+B.height>f.y&&(c.splice($,1),r.splice(O,1),a+=20,o.textContent=`ניקוד: ${a}`)}),f.y>e.height&&c.splice($,1)}),n=requestAnimationFrame(b))}n=requestAnimationFrame(b);function R(){i=!1,t.shadowBlur=0,t.fillStyle="rgba(0,0,0,0.85)",t.fillRect(0,0,e.width,e.height),t.fillStyle="#ff3366",t.font="24px Orbitron",t.textAlign="center",t.fillText("SPACE SHUTTLE CRASHED",e.width/2,e.height/2-20),t.fillStyle="#ffffff",t.font="14px Outfit",t.fillText(`ניקוד סופי: ${a}`,e.width/2,e.height/2+10),t.fillText("נסה שנית!",e.width/2,e.height/2+40)}return{stop:()=>{i=!1,cancelAnimationFrame(n),document.removeEventListener("keydown",u),document.removeEventListener("keyup",E)}}}function pt(){const e=document.getElementById("main-container");if(!l.user){e.innerHTML=`
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
  `,document.getElementById("save-profile-btn").addEventListener("click",async()=>{const n=V(document.getElementById("settings-username").value.trim()),s=ce(n);if(!s.valid){g(s.errors[0],"danger");return}y(!0);try{await G(l.user.uid,{username:n}),l.user.username=n,W(),g("שם המשתמש עודכן בהצלחה!","success")}catch(r){g(r.message,"danger")}finally{y(!1)}}),document.getElementById("change-pass-btn").addEventListener("click",async()=>{const n=document.getElementById("settings-new-password").value,s=de(n);if(!s.valid){g(s.errors[0],"danger");return}y(!0);try{await Pe(n),g("הסיסמה שונתה בהצלחה!","success"),document.getElementById("settings-new-password").value=""}catch(r){g(r.message,"danger")}finally{y(!1)}});const t=document.getElementById("settings-2fa-toggle"),o=document.getElementById("settings-2fa-email-group");t.addEventListener("change",async()=>{const n=t.checked;o.style.display=n?"block":"none",n||(y(!0),await G(l.user.uid,{twoFactorEnabled:!1}),l.user.twoFactorEnabled=!1,g("אימות דו-שלבי בוטל.","info"),y(!1))});const a=document.getElementById("settings-2fa-email");a.addEventListener("change",async()=>{const n=V(a.value.trim());if(n){const s=Be(n);if(!s.valid){g(s.error,"danger");return}y(!0),await G(l.user.uid,{twoFactorEnabled:!0,twoFactorEmail:n}),l.user.twoFactorEnabled=!0,l.user.twoFactorEmail=n,g("כתובת אימות דו-שלבי עודכנה!","success"),y(!1)}}),document.querySelectorAll(".color-picker-btn").forEach(n=>{n.addEventListener("click",async()=>{document.querySelectorAll(".color-picker-btn").forEach(r=>r.classList.remove("active")),n.classList.add("active");const s=n.getAttribute("data-color");y(!0),await G(l.user.uid,{customTheme:s}),l.user.customTheme=s,le(s),y(!1),g("ערכת העיצוב הניאונית עודכנה!","success")})}),document.getElementById("register-biometric-btn").addEventListener("click",async()=>{y(!0);try{const n=await Ze(l.user.username,l.user.uid);n.success&&(localStorage.setItem("diggy_bio_username",l.user.username),localStorage.setItem("diggy_bio_uid",l.user.uid),await G(l.user.uid,{biometricsEnabled:!0,biometricsCredentialId:n.credentialId.join(",")}),l.user.biometricsEnabled=!0,document.getElementById("bio-setup-status").textContent="מופעל",document.getElementById("bio-setup-status").style.color="var(--accent-color)",g("זיהוי ביומטרי הופעל בהצלחה עבור מכשיר זה! 🔒","success"))}catch(n){g("שגיאה ברישום ביומטרי: "+n.message,"danger")}finally{y(!1)}});const i=document.getElementById("dev-application-form");i&&i.addEventListener("submit",async n=>{n.preventDefault();const s=document.getElementById("dev-app-reason").value,r=document.getElementById("dev-app-email").value,c=document.getElementById("dev-app-pass").value;if(c.length<6||c.length>12){g("הזן סיסמת אימות תקינה (6-12 תווים)!","danger");return}y(!0);try{await qe(l.user.uid,l.user.username,s,r),g("בקשת המפתח נשלחה בהצלחה! מייל עיצוב יישלח אלייך עם החלטת ה-Admin. 📬","success"),pt()}catch(d){g(d.message,"danger")}finally{y(!1)}})}function le(e){l.theme=e;const t=document.documentElement;t.style.setProperty("--accent-color",e),t.style.setProperty("--accent-glow",`${e}66`),t.style.setProperty("--accent-dim",`${e}1a`),t.style.setProperty("--border-color",`${e}26`)}function W(){const e=document.getElementById("sidebar-user-badge-wrap");if(e)if(l.user){const t=l.user.username.charAt(0).toUpperCase();e.innerHTML=`
      <div class="user-badge" onclick="window.location.hash='#/settings'" style="cursor: pointer;">
        <div class="user-avatar">${t}</div>
        <div class="user-info">
          <span class="user-name">${l.user.username}</span>
          <span class="user-role">${l.user.role}</span>
        </div>
      </div>
    `}else e.innerHTML=`
      <button class="btn btn-secondary" onclick="window.location.hash='#/login'" style="width: 100%; justify-content: center; padding: 10px;">
        <i class="fas fa-sign-in-alt"></i> התחבר / הרשם
      </button>
    `}function g(e,t="success"){const o=document.getElementById("toast-container");if(!o)return;const a=document.createElement("div");a.style.background="var(--bg-dark)",a.style.color="#ffffff",a.style.padding="12px 20px",a.style.borderRadius="8px",a.style.fontSize="14px",a.style.fontWeight="bold",a.style.fontFamily="var(--font-body)",a.style.boxShadow="0 5px 15px rgba(0,0,0,0.5)",a.style.transition="all 0.3s ease",a.style.transform="translateY(20px)",a.style.opacity="0",a.style.display="flex",a.style.alignItems="center",a.style.gap="10px";let i="var(--accent-color)",n="fa-check-circle";t==="danger"?(i="var(--danger-color)",n="fa-exclamation-triangle"):t==="warning"?(i="var(--warning-color)",n="fa-exclamation-circle"):t==="info"&&(i="#0096ff",n="fa-info-circle"),a.style.borderLeft=`4px solid ${i}`,a.style.boxShadow=`0 0 10px ${i}40`,a.innerHTML=`<i class="fas ${n}" style="color: ${i}"></i> <span>${e}</span>`,o.appendChild(a),setTimeout(()=>{a.style.transform="translateY(0)",a.style.opacity="1"},10),setTimeout(()=>{a.style.transform="translateY(-20px)",a.style.opacity="0",setTimeout(()=>{a.remove()},300)},4e3)}function y(e){const t=document.getElementById("app-global-loader");t&&(t.style.display=e?"flex":"none")}document.getElementById("modal-close-btn").addEventListener("click",()=>{document.getElementById("modal-overlay").classList.remove("active");const e=document.getElementById("bio-widget");e&&e.classList.remove("scanning")});document.getElementById("settings-nav-btn").addEventListener("click",()=>{k("#/settings")});function Mt(){const e=document.createElement("div");e.className="simulated-inbox-widget collapsed",e.id="simulated-inbox-widget",e.innerHTML=`
    <div class="inbox-header" id="inbox-header">
      <span class="inbox-title"><i class="fas fa-envelope-open-text"></i> תיבת מיילים (סימולציה)</span>
      <span class="inbox-count" id="inbox-count">0</span>
    </div>
    <div class="inbox-body" id="inbox-body">
      <div style="text-align: center; color: var(--text-dark); font-size: 11px; padding: 20px;">אין מיילים כרגע</div>
    </div>
  `,document.body.appendChild(e),document.getElementById("inbox-header").addEventListener("click",()=>{e.classList.toggle("collapsed")})}function qt(){const e=document.getElementById("inbox-count"),t=document.getElementById("inbox-body");if(!e||!t)return;const o=l.recentEmails;if(e.textContent=o.length,o.length===0){t.innerHTML='<div style="text-align: center; color: var(--text-dark); font-size: 11px; padding: 20px;">אין מיילים כרגע</div>';return}t.innerHTML=o.map(a=>`
    <div class="email-item" data-id="${a.id}">
      <div class="email-item-subject">${a.subject}</div>
      <div class="email-item-meta">
        <span>נמען: ${a.to}</span>
        <span>${a.sentAt}</span>
      </div>
    </div>
  `).join(""),t.querySelectorAll(".email-item").forEach(a=>{a.addEventListener("click",()=>{const i=a.getAttribute("data-id"),n=o.find(s=>s.id===i);n&&zt(n)})})}function zt(e){const t=document.getElementById("simulated-inbox-widget"),o=document.createElement("div");o.className="email-content-view",o.innerHTML=`
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
  `,t.appendChild(o),document.getElementById("email-view-back-btn").addEventListener("click",a=>{a.preventDefault(),o.remove()})}const ve={welcome:{title:"ברוכים הבאים ל-DIGGY Arena",date:"15 יוני 2026",icon:"fa-rocket",excerpt:"גלו את עולם המשחקים החדש לילדים — ארקייד, רטרו וקז'ואל במקום אחד.",content:`
      <p>ברוכים הבאים ל-<strong>DIGGY Arena</strong> — פלטפורמת המשחקים המובילה לילדים ולנוער בישראל. כאן תמצאו מגוון רחב של משחקי ארקייד, רטרו וקז'ואל שפותחו על ידי מפתחים מקומיים ובינלאומיים.</p>
      <h3>מה מחכה לכם?</h3>
      <ul>
        <li>משחקים חינמיים לחלוטין — ללא פרסומות</li>
        <li>קטגוריות מגוונות: RPG, RETRO, ACTION, PUZZLE ועוד</li>
        <li>מערכת דירוג כוכבים לכל משחק</li>
        <li>אפשרות לשמור משחקים מועדפים (לאחר הרשמה)</li>
      </ul>
      <p>הירשמו בחינם, בחרו משחק מהקטלוג, ותתחילו לשחק!</p>
    `},"safe-gaming":{title:"משחקים בטוחים ברשת — מדריך לילדים",date:"10 יוני 2026",icon:"fa-shield-alt",excerpt:"טיפים חשובים לשחק בצורה בטוחה ומהנה באינטרנט.",content:`
      <p>האינטרנט הוא מקום מדהים לשחק וללמוד, אבל חשוב לשחק בחוכמה. הנה כמה כללים בסיסיים:</p>
      <ul>
        <li><strong>אל תשתפו מידע אישי</strong> — לא שם מלא, כתובת, מספר טלפון או סיסמאות</li>
        <li><strong>ספרו להורים</strong> — אם משהו מרגיש לא נכון, ספרו למבוגר</li>
        <li><strong>קחו הפסקות</strong> — קום וזוז כל 30 דקות</li>
        <li><strong>שחקו רק באתרים מוכרים</strong> — DIGGY בודק כל משחק לפני פרסום</li>
      </ul>
    `},"parents-guide":{title:"מדריך להורים — DIGGY Arena",date:"8 יוני 2026",icon:"fa-users",excerpt:"כל מה שהורים צריכים לדעת על הפלטפורמה שלנו.",content:`
      <p>DIGGY Arena נועדה לספק סביבת משחקים בטוחה וחינוכית לילדים. כל משחק עובר בדיקת איכות ואישור מנהל לפני פרסום.</p>
      <h3>מה אנחנו מבטיחים?</h3>
      <ul>
        <li>ללא פרסומות או קישורים חיצוניים בתוך המשחקים</li>
        <li>ללא איסוף מידע אישי מילדים ללא הסכמת הורים</li>
        <li>תוכן מותאם לגיל — ללא אלימות או תכנים פוגעניים</li>
        <li>אפשרות לאימות דו-שלבי לחשבונות</li>
      </ul>
      <p>לשאלות נוספות, פנו אלינו דרך <a href="#/contact" style="color: var(--accent-color);">דף צור קשר</a>.</p>
    `},community:{title:"כללי קהילה DIGGY",date:"5 יוני 2026",icon:"fa-handshake",excerpt:"כיצד לשמור על קהילה נעימה, מכבדת ומהנה.",content:`
      <p>קהילת DIGGY בנויה על כבוד הדדי. אנו מצפים מכל המשתמשים:</p>
      <ul>
        <li>לדרג משחקים בכנות ובהגינות</li>
        <li>לא לנסות לפרוץ או לפגוע במערכת</li>
        <li>לדווח על תוכן בעייתי דרך דף צור קשר</li>
        <li>לכבד מפתחים ושחקנים אחרים</li>
      </ul>
      <p>הפרה של כללי הקהילה עלולה להוביל לחסימת חשבון.</p>
    `},"top-games":{title:"המשחקים הפופולריים השבוע",date:"1 יוני 2026",icon:"fa-fire",excerpt:"אלו המשחקים שזכו לדירוג הגבוה ביותר השבוע.",content:`
      <p>כל שבוע אנו מפרסמים את המשחקים המובילים לפי דירוג שחקנים וכמות משחקים. הנה הנבחרים:</p>
      <ul>
        <li><strong>Neon Snake</strong> — קלאסיקת הארקייד עם עיצוב ניאון מרהיב ⭐ 4.8</li>
        <li><strong>Space Laser Evader</strong> — משחק חלל מאתגר ⭐ 4.9</li>
        <li><strong>Brick Breaker Glow</strong> — שובר לבנים עם אפקטים זוהרים ⭐ 4.6</li>
      </ul>
      <p>דרגו את המשחקים האהובים עליכם ועזרו לקהילה לגלות פנינים חדשות!</p>
    `},"ratings-guide":{title:"איך עובדת מערכת הדירוג?",date:"28 מאי 2026",icon:"fa-star",excerpt:"הסבר על מערכת הכוכבים — דרגו משחקים ועזרו לקהילה.",content:`
      <p>ב-DIGGY כל שחקן יכול לדרג משחק פעם אחת בלבד, בסולם של 1–5 כוכבים.</p>
      <h3>איך לדרג?</h3>
      <ul>
        <li>היכנסו לדף המשחק</li>
        <li>בצד ימין תראו "דרג את המשחק"</li>
        <li>לחצו על מספר הכוכבים שמתאים לחוויה שלכם</li>
      </ul>
      <p>הדירוג הממוצע מוצג על כרטיס המשחק ובדף הפרטים. מפתחים מקבלים בונוס תגמול על משחקים עם דירוג גבוה!</p>
    `},"new-features":{title:"חידושים ועדכונים — יוני 2026",date:"20 יוני 2026",icon:"fa-sparkles",excerpt:"מערכת דירוג חדשה, מאמרים ציבוריים ושיפורי ניווט.",content:`
      <p>אנחנו שמחים לעדכן על חידושים חדשים בפלטפורמה:</p>
      <ul>
        <li><strong>מערכת דירוג כוכבים</strong> — דרגו כל משחק וראו את הדירוג הממוצע</li>
        <li><strong>מאמרים וחדשות</strong> — תוכן חדש לשחקנים והורים</li>
        <li><strong>מפת אתר משופרת</strong> — ניווט קל לכל הדפים</li>
        <li><strong>דפי מידע משפטי</strong> — תנאי שימוש, פרטיות וצור קשר</li>
      </ul>
    `}};async function Ft(){M();const e=document.getElementById("main-container"),t=Object.entries(ve);e.innerHTML=`
    <div class="top-header">
      <div class="page-title-wrap">
        <h1>מאמרים וחדשות</h1>
        <p style="color: var(--text-muted); margin-top: 5px;">טיפים, מדריכים ועדכונים מעולם DIGGY</p>
      </div>
    </div>
    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; margin-top: 20px;">
      ${t.map(([o,a])=>`
        <div class="article-card" data-slug="${o}">
          <div class="article-card-date"><i class="fas fa-calendar-alt"></i> ${a.date}</div>
          <h3 class="article-card-title"><i class="fas ${a.icon}" style="color: var(--accent-color); margin-left: 8px;"></i>${a.title}</h3>
          <p class="article-card-excerpt">${a.excerpt}</p>
          <span style="color: var(--accent-color); font-size: 13px; margin-top: 10px; display: inline-block;">קרא עוד ←</span>
        </div>
      `).join("")}
    </div>
  `,e.querySelectorAll(".article-card").forEach(o=>{o.addEventListener("click",()=>{k(`#/articles/${o.getAttribute("data-slug")}`)})})}async function Ot(e){M();const t=document.getElementById("main-container"),o=ve[e];if(!o){t.innerHTML=`
      <div style="text-align: center; padding: 80px 0;">
        <h2>מאמר לא נמצא</h2>
        <button class="btn btn-primary" onclick="window.location.hash='#/articles'" style="margin-top: 20px;">חזרה למאמרים</button>
      </div>
    `;return}t.innerHTML=`
    <div style="margin-bottom: 20px;">
      <a href="#/articles" style="color: var(--accent-color); font-size: 14px;"><i class="fas fa-chevron-right"></i> חזרה לכל המאמרים</a>
    </div>
    <div class="legal-page-content">
      <div style="font-size: 12px; color: var(--text-muted); margin-bottom: 15px;"><i class="fas fa-calendar-alt"></i> ${o.date}</div>
      <h2 class="doc-article-title"><i class="fas ${o.icon}"></i> ${o.title}</h2>
      <div class="doc-section">${o.content}</div>
    </div>
  `}async function Ht(){M();const e=document.getElementById("main-container"),t=l.games.map(a=>`<li><a href="#/game/${a.id}">${a.name}</a></li>`).join(""),o=Object.entries(ve).map(([a,i])=>`<li><a href="#/articles/${a}">${i.title}</a></li>`).join("");e.innerHTML=`
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
          <h3><i class="fas fa-gamepad"></i> משחקים (${l.games.length})</h3>
          <ul>${t||"<li>אין משחקים</li>"}</ul>
        </div>
        <div class="sitemap-group">
          <h3><i class="fas fa-newspaper"></i> מאמרים</h3>
          <ul>${o}</ul>
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
  `}async function jt(){M();const e=document.getElementById("main-container");e.innerHTML=`
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
  `}async function Yt(){M();const e=document.getElementById("main-container");e.innerHTML=`
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
  `}async function Nt(){M();const e=document.getElementById("main-container");e.innerHTML=`
    <div class="top-header">
      <div class="page-title-wrap">
        <h1>צור קשר</h1>
        <p style="color: var(--text-muted); margin-top: 5px;">נשמח לעזור — שחקנים, הורים ובעלי זכויות</p>
      </div>
    </div>
    <div class="legal-page-content">
      <div class="doc-section">
        <h3><i class="fas fa-envelope" style="color: var(--accent-color);"></i> יצירת קשר כללית</h3>
        <p>לשאלות, הצעות ותמיכה: <strong>support@diggy-arena.com</strong></p>
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
        <p>שלחו ל: <strong>legal@diggy-arena.com</strong> — נטפל בפניה תוך 48 שעות עסקיות.</p>
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
  `;const t=document.getElementById("support-request-form");t&&t.addEventListener("submit",async o=>{o.preventDefault();const a=document.getElementById("support-name").value.trim(),i=document.getElementById("support-email").value.trim(),n=document.getElementById("support-subject").value.trim(),s=document.getElementById("support-message").value.trim();if(!a||!i||!n||!s){g("אנא מלא את כל השדות.","warning");return}y(!0);try{const r=At({name:a,email:i,subject:n,message:s}),c=localStorage.getItem("diggy_support_admin_email")||"support@diggy-arena.com",d=`
          <div style="font-family: sans-serif; background: #07080a; color: white; padding: 24px; border-radius: 12px; border: 1px solid #00ff66;">
            <h2 style="color: #00ff66;">פנייה חדשה לתמיכה - DIGGY</h2>
            <p><strong>שם:</strong> ${a}</p>
            <p><strong>אימייל:</strong> ${i}</p>
            <p><strong>נושא:</strong> ${n}</p>
            <p><strong>הודעה:</strong> ${s}</p>
          </div>
        `,m=`
          <div style="font-family: sans-serif; background: #07080a; color: white; padding: 24px; border-radius: 12px; border: 1px solid #00ff66;">
            <h2 style="color: #00ff66;">קיבלנו את הפנייה שלך</h2>
            <p>היי ${a},</p>
            <p>הפנייה שלך נרשמה בצ'אט התמיכה של האדמין. נעדכן אותך בהקדם האפשרי.</p>
          </div>
        `;await F(c,`DIGGY Support: ${n}`,d),await F(i,"DIGGY - קיבלנו את הפנייה שלך",m),g("הפנייה נשלחה בהצלחה! אנחנו נענה בקרוב.","success"),t.reset()}catch(r){g(r.message||"שגיאה בשליחת הפנייה","danger")}finally{y(!1)}})}async function Vt(){const e=document.getElementById("main-container");if(!l.user||l.user.role!=="developer"&&l.user.role!=="admin"){e.innerHTML=`
      <div style="text-align: center; padding: 80px 0;">
        <i class="fas fa-lock" style="font-size: 64px; color: var(--danger-color); margin-bottom: 20px;"></i>
        <h2>גישה חסומה!</h2>
        <p style="color: var(--text-muted); margin-top: 10px;">דף זה מיועד למפתחים מורשים בלבד.</p>
        <button class="btn btn-primary" onclick="window.location.hash='#/'" style="margin-top: 20px;">חזור למסך הבית</button>
      </div>
    `;return}if(!document.getElementById("dev-docs-inline-styles")){const i=document.createElement("style");i.id="dev-docs-inline-styles",i.textContent=`
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
    `,document.head.appendChild(i)}e.innerHTML=`
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
    `};function o(i){const n=document.getElementById("doc-content-area");n.innerHTML=t[i]||""}o("getting-started");const a=document.querySelectorAll(".doc-tab-btn");a.forEach(i=>{i.addEventListener("click",()=>{a.forEach(s=>s.classList.remove("active-doc-tab")),i.classList.add("active-doc-tab");const n=i.getAttribute("data-doc");o(n)})})}
