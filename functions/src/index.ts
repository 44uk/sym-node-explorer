import * as functions from "firebase-functions"
import {
  discoverNewPeers,
  cleanGonePeers,
  lookupPeerGIOs
} from "./triggers"

// export const requestDiscovering = functions
//   .https.onRequest((_req, resp) => {
//     discoverNewPeers()
//       .then(result => resp.json({ message: `Discovered ${result} peers` }))
//       .catch(error => console.debug(error))
//   })
//
// export const requestCleaning = functions.region(REGION).https.onRequest((_req, resp) => {
//   cleanGonePeers()
//     .then(result => resp.json({ message: `Deleted ${result} peers` }))
//     .catch(error => console.debug(error))
// })

export const discovering = functions
  .runWith({ timeoutSeconds: 60 * 5 })
  .pubsub.schedule('every 70 minutes')
  .timeZone('Asia/Tokyo')
  .onRun(async () => {
    discoverNewPeers()
      .catch(error => console.debug(error))
  })

export const lookuping = functions
  .runWith({ timeoutSeconds: 60 * 5 })
  .pubsub.schedule('every 80 minutes')
  .timeZone('Asia/Tokyo')
  .onRun(async () => {
    lookupPeerGIOs()
      .then(result => console.debug(`Lookup ${result} peer countries`))
      .catch(error => console.debug(error))
  })

export const cleaning = functions
  .runWith({ timeoutSeconds: 60 * 5 })
  .pubsub.schedule('every 12 hours')
  .timeZone('Asia/Tokyo')
  .onRun(async () => {
    cleanGonePeers()
      .then(result => console.debug(`Deleted ${result} peers`))
      .catch(error => console.debug(error))
  })
