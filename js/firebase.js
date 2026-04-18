import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDnfZbiUA8vyd7fidONYG6hkHgrXlFwfz8",
  authDomain: "restart-49a17.firebaseapp.com",
  projectId: "restart-49a17",
  storageBucket: "restart-49a17.firebasestorage.app",
  messagingSenderId: "429968145136",
  appId: "1:429968145136:web:6dee0572662b9daeff2035",
  measurementId: "G-JCQJGCN2FV"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);