import {
  MQTT__LAMP_CMND__STATE,
  MQTT__LAMP_CMND__SET_STATE,
  MQTT__LAMP_PRESENT,
  MQTT__LAMP_LOST
} from '../../messageBus'
import { getTopicBaseDevice, getDeviceCommonTopics } from '../utilities'

const type = 'lamp'
const topicBase = getTopicBaseDevice(type)

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
    responseParser: JSON.parse
  }
}

function setLampState(data, sender) {
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
apiBroadcasts.set('present', MQTT__LAMP_PRESENT)
apiBroadcasts.set('lost', MQTT__LAMP_LOST)

export default {
  type,
  subscriptions: getDeviceCommonTopics(type),
  publishCommands,
  apiBroadcasts
}
