import * as functions from "firebase-functions"

import {
  discoverNewPeers,
  cleanGonePeers,
  // lookupCountry
} from "./triggers"

// export interface IPeer {
//   version: number,
//   publicKey: string
//   roles: number
//   port: number
//   networkIdentifier: number
//   host: string
//   friendlyName: string
//   _gateway: string
//   _reachedAt: firestore.Timestamp
//   _reachable: boolean
// }

export const requestDiscovering = functions.https.onRequest((_req, resp) => {
  discoverNewPeers()
    .then(result => resp.json({ message: `Discovered ${result} peers` }))
    .catch(error => console.debug(error))
})

export const requestCleaning = functions.https.onRequest((_req, resp) => {
  cleanGonePeers()
    .then(result => resp.json({ message: `Deleted ${result} peers` }))
    .catch(error => console.debug(error))
})

// export const lookingUpCountry = functions
//   .firestore.document(`/peers/{id}`)
//   .onWrite((snap) => {
//     const data = snap.after.data()
//     console.log(data.host)
//   })

export const discovering = functions
  .region('asia-northeast1')
  .runWith({ timeoutSeconds: 120 })
  .pubsub.schedule('every 70 minutes')
  .timeZone('Asia/Tokyo')
  .onRun(async () => {
    discoverNewPeers()
      .catch(error => console.debug(error))
  })

export const cleaning = functions
  .region('asia-northeast1')
  .runWith({ timeoutSeconds: 120 })
  .pubsub.schedule('every 24 hours')
  .timeZone('Asia/Tokyo')
  .onRun(async () => {
    cleanGonePeers()
      .then(result => console.debug(`Deleted ${result} peers`))
      .catch(error => console.debug(error))
  })
