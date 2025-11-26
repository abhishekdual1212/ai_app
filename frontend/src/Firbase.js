
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {getAuth,GoogleAuthProvider } from "firebase/auth"

 const firebaseConfig = {
  apiKey: "AIzaSyA6YajUjjy069KUUuYAemN9d763VnQJ2LA",
  authDomain: "privarq-datence.firebaseapp.com",
  projectId: "privarq-datence",
  storageBucket: "privarq-datence.firebasestorage.app",
  messagingSenderId: "800853975950",
  appId: "1:800853975950:web:0cf426204bdfe2a043fadf",
  measurementId: "G-YWC4VELBJX"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app)
const googleProvider = new GoogleAuthProvider();

const analytics = getAnalytics(app);

export {auth,googleProvider}