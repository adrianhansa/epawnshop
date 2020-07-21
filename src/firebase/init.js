import firebase from "@firebase/app";
import "firebase/firestore";
import "firebase/firebase-auth";
import "firebase/functions";
import "firebase/storage";

var firebaseConfig = {
  apiKey: "AIzaSyBwr3bUAyf_AWckXMoI241D6kF-YkjdLbM",
  authDomain: "pawnshop-8e37d.firebaseapp.com",
  databaseURL: "https://pawnshop-8e37d.firebaseio.com",
  projectId: "pawnshop-8e37d",
  storageBucket: "pawnshop-8e37d.appspot.com",
  messagingSenderId: "954850662183",
  appId: "1:954850662183:web:8e910989596c64b0f07b02",
  measurementId: "G-TSXQNFY235"
};
// Initialize Firebase
export const fb = firebase.initializeApp(firebaseConfig);
export const db = firebase.firestore();
export const functions = firebase.functions();
