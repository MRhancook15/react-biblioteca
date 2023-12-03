  // Import the functions you need from the SDKs you need
  import { initializeApp } from "firebase/app";
  import { getFirestore } from "@firebase/firestore"
  import { getStorage } from "firebase/storage";
  import { GoogleAuthProvider, getAuth } from "firebase/auth";


  // Your web app's Firebase configuration
  const firebaseConfig = {
    apiKey: "AIzaSyACIcC96hUJphy8LyiuMtJZqbWn1GMLwew",
    authDomain: "biblioteca-react-5e5a8.firebaseapp.com",
    projectId: "biblioteca-react-5e5a8",
    storageBucket: "biblioteca-react-5e5a8.appspot.com",
    messagingSenderId: "919422615576",
    appId: "1:919422615576:web:ff37c972acaa56e240436d"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  export const db = getFirestore(app);
  export const storage = getStorage(app);
  export const auth = getAuth(app)
  export const provider = new GoogleAuthProvider();