export enum Role {
  both = 0,
  peer = 1,
  dual = 3
}

export const RoleLabel = {
  [Role.both]: "BOTH",
  [Role.peer]: "PEER",
  [Role.dual]: "DUAL",
} as const

export enum NetworkType {
  TEST_NET = 152
}

export const NetworkTypeLabel = {
  152: "TEST_NET",
} as const


