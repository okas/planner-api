import {
  MQTT__LAMP_CMND__STATE,
  MQTT__LAMP_CMND__SET_STATE
} from '../messageBus'

export default {
  [MQTT__LAMP_CMND__STATE]: getState,
  [MQTT__LAMP_CMND__SET_STATE]: setState
}

function getState(data, sender) {
  return {
    topic: `saartk/device/lamp/${data}/cmnd/state/${sender}`,
    payload: null
  }
}

function setState(data, sender) {
  return {
    topic: `saartk/device/lamp/${data.id}/cmnd/set-state/${sender}`,
    payload: data.state.toString()
  }
}
