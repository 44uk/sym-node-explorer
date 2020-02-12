import {
  functions,
  admin,
  db
} from "./lib/firebase"
import { Path } from "./constants"

const peerCollection = db.collection(Path.peers)

const peer = {
  friendlyName: "5693E31B",
  host: "api-xym-3-01.ap-northeast-1.nemtech.network",
  networkIdentifier: 152,
  port: 7900,
  publicKey: "B3E0DA69C4B05D83095329BE6AFE63C390947E42F46C9E88C68366A11CC7744F",
  roles: 3,
  version: 0,
  _gateway: "http://api-xym-3-01.ap-northeast-1.nemtech.network:3000"
}

peerCollection.doc(peer.publicKey).set({ ...peer })
  .catch(error => console.debug(error))
