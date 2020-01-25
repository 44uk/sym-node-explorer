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
  _reachable: boolean
  _foundAt: firestore.Timestamp
}

const peerCollection = db.collection(Path.peers)

const fetchAndSavePeers = (url: URL, identifier: string) => {
  return cli<INodeInfo[]>({
    url: url.href,
    parse: "json",
    timeout: 2500
  })
    .then(resp => resp.body)
    .then(body => {
      console.debug("Found %d Peers.", body.length)
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
    .then(result => {
      peerCollection.doc(identifier).set({
        _reachable: true,
      }, {
        merge: true
      })
        .catch(e => console.debug(e))
      return result
    })
}

export const discoverNewPeers = () => {
  console.debug("Run discoverNewPeers")
  return peerCollection
    .where("roles", "==", 3)
    .get()
    .then(querySnap => querySnap.docs.map(doc => doc.data() as IPeer))
    .then(peers => peers
      .map(peer => {
        try { return { peer, url: new URL("/node/peers", `http://${peer.host}:3000`) } }
        catch(error) { return null }
      })
      .filter((v): v is { peer: IPeer, url: URL } => v !== null)
      .map(({ peer, url }) => fetchAndSavePeers(url, peer.publicKey)
        .catch(error => {
          console.debug("pubKey: %s, host: %s is unreachable.", peer.publicKey.slice(0,8), peer.host)
          return peerCollection.doc(peer.publicKey).set({
            _reachable: false
          }, {
            merge: true
          })
            .catch(e => console.debug(e))
        })
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

