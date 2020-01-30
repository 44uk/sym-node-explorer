import React, { useState, useMemo } from "react"
import clsx from "clsx"
import { usePeers, IPeer } from "./hooks/usePeers"

import "./App.sass"

import {
  Role,
  RoleLabel,
  NetworkType,
  NetworkTypeLabel
} from "./constants"

const Peer = (peer: IPeer) => (<div className="card fluid">
  <div className="peer">
    <h3 className="peer-pubkey">PubKey: {peer.publicKey}</h3>
    <dl className="peer-info">
      <dt>FriendlyName</dt>
      <dd>{peer.friendlyName}</dd>
      <dt>Host</dt>
      <dd>{peer.host}</dd>
      <dt>Port</dt>
      <dd>{peer.port}</dd>
      <dt>Network</dt>
      <dd>{NetworkTypeLabel[peer.networkIdentifier as NetworkType]}({peer.networkIdentifier})</dd>
      <dt>Role</dt>
      <dd>{RoleLabel[peer.roles as Role]}({peer.roles})</dd>
      <dt>Version</dt>
      <dd>{peer.version}</dd>
      { peer._country && <>
      <dt>Country</dt>
      <dd>{peer._country}</dd>
      </>}
    </dl>
    { peer._reachable &&
      <a className="peer-gateway" href={peer._gateway} target="_blank" rel="noopener noreferrer">{peer._gateway}</a>
    }
  </div>
</div>)

const Header = () => (<header>
  <a href="/" className="logo">NEM2 Node Explorer</a>
</header>)

const Footer = () => (<footer>
  <p>NEM2 Node Explorer</p>
</footer>)

const Loading = () => (<div>

</div>)

const App: React.FC = () => {
  const { peers, loaded } = usePeers()
  const [role, setRole] = useState(Role.both)
  const [keyword, setKeyword] = useState("")

  const clsBoth = useMemo(() => clsx("role-switch", role === Role.both && "is-active"), [role])
  const clsPeer = useMemo(() => clsx("role-switch", role === Role.peer && "is-active"), [role])
  const clsDual = useMemo(() => clsx("role-switch", role === Role.dual && "is-active"), [role])
  // const clsBoth = clsx(role === Role.both && "is-active")
  // const clsPeer = clsx(role === Role.peer && "is-active")
  // const clsDual = clsx(role === Role.dual && "is-active")

  const displayedPeers = useMemo(() => (
    peers
      .filter(peer => role === Role.both ? true : peer.roles === role)
      .filter(peer => keyword === "" ? true : (
        peer.publicKey.startsWith(keyword)
        || peer.friendlyName.startsWith(keyword)
        || peer.host.startsWith(keyword)
      ))
  ), [peers, role, keyword])

  const count = useMemo(() => {
    return displayedPeers.reduce((accum, value) => {
      switch (value.roles) {
        case Role.peer:
          accum[Role.peer] += 1
          break;
        case Role.dual:
          accum[Role.dual] += 1
          break;
      }
      return accum
    }, {
      [Role.peer]: 0,
      [Role.dual]: 0
    })
  }, [displayedPeers])

  return (<>
    <Header />

    <div className="role-switcher">
      <button className={clsBoth} onClick={() => setRole(Role.both)}>{ RoleLabel[Role.both] }</button>
      <button className={clsPeer} onClick={() => setRole(Role.peer)}>{ RoleLabel[Role.peer] }</button>
      <button className={clsDual} onClick={() => setRole(Role.dual)}>{ RoleLabel[Role.dual] }</button>
    </div>

    <div className="keyword-searcher">
      <input type="search"
        value={keyword}
        onChange={e => setKeyword(e.target.value)}
        className="keyword-searcher-input"
        placeholder="Input part of PublicKey, FriendlyName, Host."
      />
    </div>

    <div className="stat">
      <dl className="stat-info">
        <dt>Node</dt>
        <dd>
          <span className="stat-info-count">Both: { displayedPeers.length }</span>
          <span className="stat-info-count">Peer: { count[Role.peer] }</span>
          <span className="stat-info-count">Dual: { count[Role.dual] }</span>
        </dd>
      </dl>
    </div>

    <main>
      <ul className="peer-list">
        { displayedPeers
          .filter(doc => role === Role.both ? true : doc.roles === role)
          .map(p => <li key={p.publicKey}>{ Peer(p) }</li>)
        }
      </ul>
    </main>

    <Footer />
  </>)
}

export default App
