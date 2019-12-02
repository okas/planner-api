import messageBus from '../../messageBus'
import { responseParser } from '../responseParser'

/**
 * @param {string | symbol} mbEvent
 * @returns {import('../typedefs').MQTTAction}
 */
export function getActionDevicePresentLost(mbEvent) {
  /** @type {import('../typedefs').MQTTAction} */
  const func = (id, mqttPayload) => {
    messageBus.emit(mbEvent, {
      id,
      ...responseParser(mqttPayload)
    })
  }
  return func
}
