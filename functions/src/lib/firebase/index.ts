import * as functions from "firebase-functions"
import * as admin from 'firebase-admin'
import serviceAccount from "../../../firebase-adminsdk.json"

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
  databaseURL: "https://nem2-node-explorer.firebaseio.com"
})

export { admin, functions }

export const db = admin.firestore()
