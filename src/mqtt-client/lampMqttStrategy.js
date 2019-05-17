import {
  MQTT__LAMP_CMND__STATE,
  MQTT__LAMP_CMND__SET_STATE,
  MQTT__LAMP_PRESENT,
  MQTT__LAMP_LOST
} from '../messageBus'

const type = 'lamp'
const topicBase = `saartk/device/${type}`
const topicSubscriptionParts = ['/+/present', '/+/lost', '/+/resp/+/+']

/**
 * @type {Map<symbol,function>}
 */
const publishCommands = new Map()
publishCommands.set(MQTT__LAMP_CMND__STATE, getLampState)
publishCommands.set(MQTT__LAMP_CMND__SET_STATE, setLampState)

function getLampState(data, sender) {
  return {
    topic: `${topicBase}/${data}/cmnd/state/${sender}`,
    payload: null,
    responseParser: payload => payload.readFloatLE(0)
  }
}

function setLampState(data, sender) {
  return {
    topic: `${topicBase}/${data.id}/cmnd/set-state/${sender}`,
    payload: Buffer.from(Float32Array.from([data.state]).buffer),
    responseParser: payload => payload.readFloatLE(0)
  }
}

/**
 * @type {Map<string,symbol>} maps broadcast type to Symbol event for EventEmitter usage.
 */
const apiBroadcasts = new Map()
apiBroadcasts.set('present', MQTT__LAMP_PRESENT)
apiBroadcasts.set('lost', MQTT__LAMP_LOST)

export default {
  type,
  subscriptions: topicSubscriptionParts.map(p => topicBase + p),
  publishCommands,
  apiBroadcasts
}
