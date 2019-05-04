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
 */
export function runPresetTask(devices, sender, fireDate = new Date()) {
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
      done: payload => {
        const eventPayload = {
          id,
          state: payload
        }
        messageBus.emit(mqttResponseEvent, eventPayload)
      }
    })
  })
}
