import {
  MQTT__BLIND_CMND__SET_STATE,
  MQTT__BLIND_CMND__STATE,
  MQTT__BLIND_LOST,
  MQTT__BLIND_PRESENT
} from '../../messageBus'
import { getDeviceCommonTopics, getTopicBaseDevice } from '../utilities'

const type = 'blind'
const topicBase = getTopicBaseDevice(type)

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
    responseParser: JSON.parse
  }
}

function setBlindState(data, sender) {
  return {
    topic: `${topicBase}/${data.id}/cmnd/set-state/${sender}`,
    payload: JSON.stringify(data.state),
    responseParser: JSON.parse
  }
}

/**
 * @type {Map<string,symbol>} maps broadcast type to Symbol event for EventEmitter usage.
 */
const apiBroadcasts = new Map()
apiBroadcasts.set('present', MQTT__BLIND_PRESENT)
apiBroadcasts.set('lost', MQTT__BLIND_LOST)

/**
 * Public API
 * @type {import('../typedefs').MQTTStrategy}
 */
export default {
  type,
  subscriptions: getDeviceCommonTopics(type),
  publishCommands,
  apiBroadcasts
}
