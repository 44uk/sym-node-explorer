import { firestore } from "firebase-admin"

import ms from "ms"
import * as geoIP from "geoip-lite"
import * as DNS from "dns"
import { promisify } from "util"

import { Path } from "../constants"
import { httpClient as cli } from "../lib/http-client"
import { admin, db } from "../lib/firebase"
import { delay } from "../lib/util"

interface INodeInfo {
  version: number,
  publicKey: string
  roles: number
  port: number
  networkIdentifier: number
  host: string
  friendlyName: string
}

interface IPeer extends INodeInfo {
  _reachable: boolean
  _foundAt: firestore.Timestamp
}

const peerCollection = db.collection(Path.peers)

const fetchAndSavePeers = (url: URL, identifier: string) => {
  console.debug("Peers: %s Requested", url.href)
  return cli<INodeInfo[]>({
    url: url.href,
    parse: "json",
    timeout: 1500
  })
    .then(resp => resp.body)
    .then(body => {
      if(Number.isNaN(body.length)) { throw new Error("ServiceUnavailable"); }
      console.debug("Peers: %s Found %d", url.href, body.length)
      return body
    })
    .then(peers => peers.map(p => peerCollection.doc(p.publicKey)
      .set({
        ...p,
        _foundAt: admin.firestore.FieldValue.serverTimestamp(),
        _gateway: p.roles === 3 ? `http://${p.host}:3000/node/info` : "",
      }, {
        merge: true
      }))
    )
}

export const discoverNewPeers = () => {
  console.debug("Run discoverNewPeers")
  return peerCollection
    .where("roles", "==", 3)
    .get()
    .then(qSnap => qSnap.docs.map(doc => doc.data() as IPeer))
    .then(peers => peers
      .map(peer => {
        try { return { peer, url: new URL("/node/peers", `http://${peer.host}:3000`) } }
        catch(error) { return null }
      })
      .filter((v): v is { peer: IPeer, url: URL } => v !== null)
      .map(({ peer, url }, idx) => (
        delay(idx * 2500)
          .then(() => fetchAndSavePeers(url, peer.publicKey))
          .then(result => {
            console.debug("PubKey: %s, host: %s is reachable.", peer.publicKey.slice(0,8), url.href)
            return peerCollection.doc(peer.publicKey).set({ _reachable: true }, { merge: true })
          })
          .catch(error => {
            console.debug("PubKey: %s, host: %s is unreachable. %s", peer.publicKey.slice(0,8), url.href, error.message)
            return peerCollection.doc(peer.publicKey).set({ _reachable: false }, { merge: true })
            //   .catch(e => console.debug(e))
          })
        )
      )
    )
    .then(result => result.length)
}

export const cleanGonePeers = (hours = 24) => {
  console.debug("Run cleanGonePeers")
  const batch = db.batch()
  return peerCollection
    .orderBy("_foundAt")
    .endAt(new Date(Date.now() - ms(`${hours} hours`)))
    .get()
    .then(querySnap => querySnap.docs.forEach(d => batch.delete(d.ref)))
    .then(_ => batch.commit())
    .then(result => result.length)
}

// export const lookupCountry = (host: string) => {
//   const lookup = geoIP.lookup("35.158.49.202")
//   console.debug(lookup)
//   return promisify(DNS.lookup)("cat-testnet.44uk.net")
//     .then(lookupAddr => {
//       const result = geoIP.lookup(lookupAddr.address)
//       console.debug(result)
//       return result
//     })
// }
