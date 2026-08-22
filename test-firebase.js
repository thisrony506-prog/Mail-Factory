import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { getDatabase, ref, set, push, get, child, query, orderByChild, equalTo } from "firebase/database";

const firebaseConfig = { 
  apiKey: "AIzaSyAbsa0uvBYhkEYoLxuHwD4TQi5GDdAzQpg", 
  authDomain: "exchanger-pro.firebaseapp.com", 
  databaseURL: "https://exchanger-pro-default-rtdb.firebaseio.com", 
  projectId: "exchanger-pro", 
  storageBucket: "exchanger-pro.firebasestorage.app", 
  messagingSenderId: "889959520630", 
  appId: "1:889959520630:web:f4cbf82f236b616e1f8257" 
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

async function run() {
  await signInWithEmailAndPassword(auth, "testuser2@example.com", "password123");
  const uid = auth.currentUser.uid;
  console.log("Logged in:", uid);

  try {
    const q = query(ref(db, 'used_emails'), orderByChild('email'), equalTo("abc@def.com"));
    const snap = await get(q);
    console.log("query used_emails SUCCESS:", snap.exists());
  } catch(e) {
    console.log("query used_emails FAIL:", e.message);
  }

  try {
    const newSubRef = push(ref(db, 'submissions'));
    console.log("Push generated key:", newSubRef.key);
    await set(newSubRef, { userId: uid, test: 1 });
    console.log("set submissions SUCCESS");
  } catch(e) {
    console.log("set submissions FAIL:", e.message);
  }

  try {
    const newRef = push(ref(db, 'used_emails'));
    await set(newRef, { email: "abc@def.com" });
    console.log("push used_emails SUCCESS");
  } catch(e) {
    console.log("push used_emails FAIL:", e.message);
  }
  
  try {
    const uRef = ref(db, `user_submissions/${uid}/123`);
    await set(uRef, { userId: uid });
    console.log("push user_submissions SUCCESS");
  } catch(e) {
    console.log("push user_submissions FAIL:", e.message);
  }

  process.exit(0);
}
run();
