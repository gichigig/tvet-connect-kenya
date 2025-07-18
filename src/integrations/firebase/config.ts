import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDeitRT7787Mp_HqKwZ7rI-6D3TG_eLLvU",
  authDomain: "newy-35816.firebaseapp.com",
  databaseURL: "https://newy-35816-default-rtdb.firebaseio.com",
  projectId: "newy-35816",
  storageBucket: "newy-35816.firebasestorage.app",
  messagingSenderId: "641795975385",
  appId: "1:641795975385:web:c684df13fa77e76796f6c8",
  measurementId: "G-CYZ73802JW"
};

export const firebaseApp = initializeApp(firebaseConfig);
export const db = getFirestore(firebaseApp);

