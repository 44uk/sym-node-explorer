import React, { useState, useMemo } from "react"
import clsx from "clsx"
// @ts-ignore
import { VectorMap } from "react-jvectormap"
import { usePeers, IPeer } from "./hooks/usePeers"
import {
  Role,
  RoleLabel,
  NetworkType,
  NetworkTypeLabel
} from "./constants"
import "./App.sass"

const Peer = (peer: IPeer) => (
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
)

const Header = () => (<header>
  <a href="/" className="logo">SYM Node Explorer</a>
</header>)

const Footer = () => (<footer>
  <p>SYM Node Explorer</p>
</footer>)

interface ILocationMap {
  values: {[key: string]: number}
}

const LocationMap = ({ values }: ILocationMap) => (<div className="location">
  <VectorMap
    map={"world_mill"}
    containerClassName="location_map"
    backgroundColor="transparent" //change it to ocean blue: #0077be
    zoomOnScroll={false}
    containerStyle={{ width: "100%", height: "60vh" }}
    regionStyle={{
      initial: {
        fill: "#e4e4e4",
        stroke: "none",
        "fill-opacity": 0.9,
        "stroke-width": 0,
        "stroke-opacity": 0
      },
      hover: {
        "fill-opacity": 0.8,
        cursor: "pointer"
      },
      selected: {
        fill: "#2938bc"
      },
      selectedHover: {}
    }}
    regionsSelectable={true}
    series={{
      regions: [
        {
          values,
          scale: ["#DB70FF", "#52006C"],
          normalizeFunction: "polynomial"
        }
      ]
    }}
  />
  <ul className="location_counter">
    { Object.keys(values).sort().map(k =>
      <li className="location_counter_value" key={k}><span>{k}: {values[k]}</span></li>
    ) }
  </ul>
</div>)

const Loading = () => (<div>

</div>)

const App: React.FC = () => {
  const { peers, loaded } = usePeers()
  const [ role, setRole ] = useState(Role.both)
  const [ keyword, setKeyword ] = useState("")
  const [ showMap, setShowMap ] = useState(false)

  const clsBoth = useMemo(() => clsx("role-switch", role === Role.both && "is-active"), [role])
  const clsPeer = useMemo(() => clsx("role-switch", role === Role.peer && "is-active"), [role])
  const clsDual = useMemo(() => clsx("role-switch", role === Role.dual && "is-active"), [role])
  const clsMap  = useMemo(() => clsx("role-switch", showMap && "is-active"), [showMap])

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

  const locationCount = useMemo(() => {
    return displayedPeers.reduce((accum, value) => {
      const code = value._country ?  value._country : "_UNK_"
      accum[code] = accum[code] ? accum[code] + 1 : 1
      return accum
    }, {} as {[key: string]: number})
  }, [displayedPeers])

  return (<>
    { showMap &&
      <LocationMap values={locationCount} />
    }

    <Header />

    <div className="role-switcher">
      <button className={clsBoth} onClick={() => setRole(Role.both)}>{ RoleLabel[Role.both] }</button>
      <button className={clsPeer} onClick={() => setRole(Role.peer)}>{ RoleLabel[Role.peer] }</button>
      <button className={clsDual} onClick={() => setRole(Role.dual)}>{ RoleLabel[Role.dual] }</button>
      <button className={clsMap}  onClick={() => setShowMap(!showMap)}>Map</button>
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
