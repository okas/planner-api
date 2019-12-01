import messageBus from '../../messageBus'

/**
 * @param {string | symbol} mbEvent
 * @returns {import('../typedefs').MQTTAction}
 */
export function getActionDevicePresentLost(mbEvent) {
  /** @type {import('../typedefs').MQTTAction} */
  const func = (id, mqttPayload) => {
    messageBus.emit(mbEvent, {
      id,
      ...(mqttPayload && JSON.parse(mqttPayload.toString() || null))
    })
  }
  return func
}
