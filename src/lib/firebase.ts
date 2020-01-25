import firebase from "firebase"

const firebaseConfig = {
  apiKey: "AIzaSyCqXnVrOiRldPTxrDqx8KZReIN3Qg0Y_M0",
  authDomain: "nem2-node-explorer.firebaseapp.com",
  databaseURL: "https://nem2-node-explorer.firebaseio.com",
  projectId: "nem2-node-explorer",
  storageBucket: "nem2-node-explorer.appspot.com",
  messagingSenderId: "19352502485",
  appId: "1:19352502485:web:57e9d0edc119b00c73a25c"
};

export const firebaseApp = firebase.initializeApp(firebaseConfig)
export const db = firebaseApp.firestore()
