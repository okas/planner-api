import { presetCollection } from '../persistence'
import messageBus, {
  MQTT__LAMP_CMND__SET_STATE,
  MQTT__BLIND_CMND__SET_STATE,
  MQTT__RESP__LAMP__SET_STATE,
  MQTT__RESP__BLIND__SET_STATE
} from '../messageBus'

export function queryAllRunnableTasks() {
  return queryRunnablesResultSet().data({ removeMeta: true })
}

function queryRunnablesResultSet() {
  return presetCollection.chain('findRunnablePresets')
}

/**
 * @param {any} id
 * @returns {Object} a single document
 */
export function queryRunnableTaskById(id) {
  return queryRunnablesResultSet()
    .where(p => p.id === id)
    .data({ removeMeta: true })[0]
}

/**
 * @param {Array<any>} devices
 * @param {any} sender
 * @param {function} beforeDone
 */
export function runPresetTask(devices, sender, beforeDone = null) {
  devices.forEach(({ id, type, value }) => {
    let mqttCommandEvent, mqttResponseEvent
    switch (type) {
      case 'lamp':
        mqttCommandEvent = MQTT__LAMP_CMND__SET_STATE
        mqttResponseEvent = MQTT__RESP__LAMP__SET_STATE
        break
      case 'blind':
        mqttCommandEvent = MQTT__BLIND_CMND__SET_STATE
        mqttResponseEvent = MQTT__RESP__BLIND__SET_STATE
        break
    }
    messageBus.emit(mqttCommandEvent, {
      data: { id, state: value },
      sender,
      done
    })
    function done(payload) {
      const eventPayload = {
        id,
        state: payload
      }
      if (beforeDone) {
        beforeDone({ type, ...eventPayload })
      }
      messageBus.emit(mqttResponseEvent, eventPayload)
    }
  })
}
