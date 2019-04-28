import {
  MQTT__LAMP_CMND__STATE,
  MQTT__LAMP_CMND__SET_STATE,
  MQTT__LAMP_PRESENT,
  MQTT__LAMP_LOST
} from '../messageBus'

export const type = 'lamp'

const topicPrefix = 'saartk/device/lamp/+/'
const topicParts = ['present', 'lost', 'resp/+/+']
export let lampSubscriptions = topicParts.map(p => topicPrefix + p)

/**
 * @type {Map<symbol,function>}
 */
export const lampCommands = new Map()

lampCommands.set(MQTT__LAMP_CMND__STATE, getLampState)
lampCommands.set(MQTT__LAMP_CMND__SET_STATE, setLampState)

function getLampState(data, sender) {
  return {
    topic: `saartk/device/lamp/${data}/cmnd/state/${sender}`,
    payload: null
  }
}

function setLampState(data, sender) {
  return {
    topic: `saartk/device/lamp/${data.id}/cmnd/set-state/${sender}`,
    payload: data.state.toString()
  }
}

/**
 * @type {Map<string,symbol>} holds broadcast type to Symbol event
 * relations for EventEmitter usage.
 */
export const lampBroadcasts = new Map()
lampBroadcasts.set('present', MQTT__LAMP_PRESENT)
lampBroadcasts.set('lost', MQTT__LAMP_LOST)
