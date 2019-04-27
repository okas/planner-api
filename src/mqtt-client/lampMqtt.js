import {
  MQTT__LAMP_CMND__STATE,
  MQTT__LAMP_CMND__SET_STATE
} from '../messageBus'

/**
 * @type {Map<symbol,function>}
 */
export let lampCommands = new Map()
export let lampSubscriptions = ['saartk/device/lamp/+/+/+/+']

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
