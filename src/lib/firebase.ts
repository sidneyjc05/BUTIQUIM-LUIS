import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue, set, remove } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyDc8lVaOtwJhoykCYvzAYNhdS0q8dBdx6w",
  authDomain: "botiquimfacil.firebaseapp.com",
  databaseURL: "https://botiquimfacil-default-rtdb.firebaseio.com",
  projectId: "botiquimfacil",
  storageBucket: "botiquimfacil.firebasestorage.app",
  messagingSenderId: "706088666715",
  appId: "1:706088666715:web:f09a631bc60ed3a7eb617e",
  measurementId: "G-2MW7NTHGN2"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
export const rootRef = ref(db, 'botiquim_v3_react'); // Changing root to not conflict weirdly if they have garbage Data

export { ref, onValue, set, remove };
