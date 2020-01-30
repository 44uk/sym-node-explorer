import { useState, useCallback, useMemo, useEffect } from "react"
import { firestore } from "firebase"
import { db } from "../lib/firebase"

export interface IPeer {
  version: number,
  publicKey: string
  roles: number
  port: number
  networkIdentifier: number
  host: string
  friendlyName: string
  _gateway: string
  _reachedAt: firestore.Timestamp
  _reachable: boolean
  _country: string
}

export const usePeers = () => {
  const [peers, setPeers] = useState<IPeer[]>([])
  const [loaded, setLoaded] = useState(false)

  const collection = useMemo(() => db.collection("peers"), [])

  const handler = () => {
    collection
      .onSnapshot(snap => {
        const _peers = snap.docs
          .map(doc => doc.data() as IPeer)
        setPeers(_peers)
        setLoaded(true)
      })
  }

  useEffect(() => handler(), [])

  return { peers, loaded }
}
