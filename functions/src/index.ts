import * as functions from "firebase-functions"
import {
  discoverNewPeers,
  cleanGonePeers
} from "./triggers"

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
      .catch(error => console.debug(error))
  })
