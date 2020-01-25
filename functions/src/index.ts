import * as functions from "firebase-functions"
import {
  discoverNewPeers,
  cleanGonePeers
} from "./triggers"

export const discovering = functions
  .region('asia-northeast1')
  .runWith({ timeoutSeconds: 300 })
  .pubsub.schedule('every 90 minutes')
  .timeZone('Asia/Tokyo')
  .onRun(async () => {
    discoverNewPeers()
      .catch(error => console.debug(error))
  })

export const cleaning = functions
  .region('asia-northeast1')
  .runWith({ timeoutSeconds: 300 })
  .pubsub.schedule('every 24 hours')
  .timeZone('Asia/Tokyo')
  .onRun(async () => {
    cleanGonePeers()
      .catch(error => console.debug(error))
  })
