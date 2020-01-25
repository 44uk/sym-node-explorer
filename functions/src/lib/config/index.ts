import * as functions from "firebase-functions"

interface IConfig {
  base: {
    initial_gateway: string
  }
}

const {
  base
} = functions.config() as IConfig

export const config = {
  initialGateway: base.initial_gateway
}
