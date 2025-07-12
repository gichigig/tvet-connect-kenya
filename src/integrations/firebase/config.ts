import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyD6d_3qxprt3b8GIsinOouvLHfOnsd0nsk",
  authDomain: "registrar-729a7.firebaseapp.com",
  databaseURL: "https://registrar-729a7-default-rtdb.firebaseio.com",
  projectId: "registrar-729a7",
  storageBucket: "registrar-729a7.firebasestorage.app",
  messagingSenderId: "773636745556",
  appId: "1:773636745556:web:294a1e16fe165b224ec0c1",
  measurementId: "G-2HNNL4JZJC"
};

export const firebaseApp = initializeApp(firebaseConfig);
