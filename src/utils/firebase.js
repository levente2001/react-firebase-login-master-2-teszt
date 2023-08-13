import * as firebase from "firebase/app";
import "firebase/auth";

if (!process.env.REACT_APP_FIREBASE_CONFIG) {
  console.error("REACT_APP_FIREBASE_CONFIG must be defined");
  console.log("ENV: ", process.env);
}
const firebaseConfig = {
  apiKey: "AIzaSyB2G3m3pWrq0SBGhOm3opl0d7Ildtj22QQ",
  authDomain: "csakvar-e2db9.firebaseapp.com",
  databaseURL: "https://csakvar-e2db9-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "csakvar-e2db9",
  storageBucket: "csakvar-e2db9.appspot.com",
  messagingSenderId: "839616465411",
  appId: "1:839616465411:web:38243d1649fc785bdbdc36",
  measurementId: "G-3KXJKBHTYN"
};




export function initialize() {
  // Initialize Firebase
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }
}

export function attachAuthListener(handler) {
  return firebase.auth().onAuthStateChanged(user => {
    handler(user);
  });
}

export async function createNewUser(email, password) {
  await firebase.auth().createUserWithEmailAndPassword(email, password);
}

export async function signIn(email, password) {
  await firebase.auth().signInWithEmailAndPassword(email, password);
}

export async function signOut() {
  await firebase.auth().signOut();
}
