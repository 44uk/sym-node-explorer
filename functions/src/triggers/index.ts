import ms from "ms"
import { firestore } from "firebase-admin"
import { httpClient as cli } from "../lib/http-client"
import { admin, db } from "../lib/firebase"
import { Path } from "../constants"

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
  _unreachable: boolean
  _reachedAt: firestore.Timestamp
}

const peerCollection = db.collection(Path.peers)

const fetchAndSavePeers = (peerURL: URL) => {
  return cli<INodeInfo[]>({
    url: peerURL.href,
    parse: "json",
    timeout: 2500
  })
    .then(resp => resp.body)
    .then(peers => peers.forEach(p => peerCollection.doc(p.publicKey).set({
      _reachedAt: admin.firestore.FieldValue.serverTimestamp(),
      _unreachable: false,
      ...p
    }, {
      merge: true
    })))
}

export const discoverNewPeers = () => {
  return peerCollection
    .where("roles", "==", 3)
    .where("_unreachable", "==", false)
    .get()
    .then(querySnap => querySnap.docs.map(doc => doc.data() as IPeer))
    .then(peers => peers
      .map(peer => {
        try { return { peer, url: new URL("/node/peers", `http://${peer.host}:3000`) } }
        catch(error) { return null }
      })
      .filter((v): v is { peer: IPeer, url: URL } => v !== null)
      .forEach(({ peer, url }) => fetchAndSavePeers(url)
        .catch(error => {
          console.debug("pubKey: %s, host: %s is unreachable.", peer.publicKey.slice(0,8), peer.host)
          peerCollection.doc(peer.publicKey).set({
            _unreachable: true
          }, {
            merge: true
          })
            .catch(e => console.debug(e))
        })
      )
    )
}

export const cleanGonePeers = (hours = 24) => {
  const batch = db.batch()
  return peerCollection
    .orderBy("_reachedAt")
    .endAt(new Date(Date.now() - ms(`${hours} hours`)))
    .get()
    .then(querySnap => querySnap.docs.forEach(d => batch.delete(d.ref)))
    .then(_ => batch.commit())
}

