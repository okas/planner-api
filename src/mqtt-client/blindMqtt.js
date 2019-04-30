import {
  MQTT__BLIND_CMND__STATE,
  MQTT__BLIND_CMND__SET_STATE,
  MQTT__BLIND_PRESENT,
  MQTT__BLIND_LOST
} from '../messageBus'

export const type = 'blind'

const topicPrefix = 'saartk/device/blind/+/'
const topicParts = ['present', 'lost', 'resp/+/+']
export let blindSubscriptions = topicParts.map(p => topicPrefix + p)

/**
 * @type {Map<symbol,function>}
 */
export const blindCommands = new Map()

blindCommands.set(MQTT__BLIND_CMND__STATE, getBlindState)
blindCommands.set(MQTT__BLIND_CMND__SET_STATE, setBlindState)

function getBlindState(data, sender) {
  return {
    topic: `saartk/device/blind/${data}/cmnd/state/${sender}`,
    payload: null
  }
}

function setBlindState(data, sender) {
  return {
    topic: `saartk/device/blind/${data.id}/cmnd/set-state/${sender}`,
    payload: data.state.toString()
  }
}

/**
 * @type {Map<string,symbol>} holds broadcast type to Symbol event
 * relations for EventEmitter usage.
 */
export const blindBroadcasts = new Map()
blindBroadcasts.set('present', MQTT__BLIND_PRESENT)
blindBroadcasts.set('lost', MQTT__BLIND_LOST)
