// ===========================
// EduFun — firebase-config.js
// Ganti nilai di bawah dengan config Firebase proyekmu
// Cara dapat config: Firebase Console → Project Settings → Your apps → SDK setup
// ===========================

const firebaseConfig = {
  apiKey: "AIzaSyAYeecZ6guDEr98vvfAg8B8jzgAoEsaUhA",
  authDomain: "edufun-4404c.firebaseapp.com",
  projectId: "edufun-4404c",
  storageBucket: "edufun-4404c.firebasestorage.app",
  messagingSenderId: "292325669894",
  appId: "1:292325669894:web:b94e3584f1b8f088141787"
};

// Init Firebase
firebase.initializeApp(firebaseConfig);

const fbAuth = firebase.auth();
const fbDB   = firebase.firestore();

// Aktifkan offline persistence (data tetap bisa diakses saat offline)
fbDB.enablePersistence({ synchronizeTabs: true })
  .catch(err => {
    if (err.code === 'failed-precondition') console.warn('Firebase persistence: multiple tabs open');
    else if (err.code === 'unimplemented')  console.warn('Firebase persistence: browser not supported');
  });
