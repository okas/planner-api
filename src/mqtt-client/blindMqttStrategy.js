import {
  MQTT__BLIND_CMND__STATE,
  MQTT__BLIND_CMND__SET_STATE,
  MQTT__BLIND_PRESENT,
  MQTT__BLIND_LOST
} from '../messageBus'
import { toBuffer } from './utilities'

const type = 'blind'
const topicBase = `saartk/device/${type}`
const topicSubscriptionParts = ['/+/present', '/+/lost', '/+/resp/+/+']

/**
 * @type {Map<symbol,function>}
 */
const publishCommands = new Map()
publishCommands.set(MQTT__BLIND_CMND__STATE, getBlindState)
publishCommands.set(MQTT__BLIND_CMND__SET_STATE, setBlindState)

function getBlindState(data, sender) {
  return {
    topic: `${topicBase}/${data}/cmnd/state/${sender}`,
    payload: null,
    responseParser: payload => payload.readFloatLE(0)
  }
}

function setBlindState(data, sender) {
  return {
    topic: `${topicBase}/${data.id}/cmnd/set-state/${sender}`,
    payload: toBuffer([data.state]),
    responseParser: payload => payload.readFloatLE(0)
  }
}

/**
 * @type {Map<string,symbol>} maps broadcast type to Symbol event for EventEmitter usage.
 */
const apiBroadcasts = new Map()
apiBroadcasts.set('present', MQTT__BLIND_PRESENT)
apiBroadcasts.set('lost', MQTT__BLIND_LOST)

export default {
  type,
  subscriptions: topicSubscriptionParts.map(p => topicBase + p),
  publishCommands,
  apiBroadcasts
}
