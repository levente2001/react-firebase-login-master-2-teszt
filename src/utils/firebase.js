import * as firebase from "firebase/app";
import "firebase/auth";

if (!process.env.REACT_APP_FIREBASE_CONFIG) {
  console.error("REACT_APP_FIREBASE_CONFIG must be defined");
  console.log("ENV: ", process.env);
}
const firebaseConfig = {
  apiKey: "AIzaSyBPMbpoXJaWgPyCjjlqF_SNzWZomU-3glE",
  authDomain: "csakvar-teszt.firebaseapp.com",
  databaseURL: "https://csakvar-teszt-default-rtdb.firebaseio.com",
  projectId: "csakvar-teszt",
  storageBucket: "csakvar-teszt.appspot.com",
  messagingSenderId: "1054237640350",
  appId: "1:1054237640350:web:add2ecd0e68b316d685d8f",
  measurementId: "G-XECXZ9SRHN"
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
