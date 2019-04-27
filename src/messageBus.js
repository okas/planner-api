import { EventEmitter } from 'events'

export default new EventEmitter()

/**
 * For internal components of Persisstence: Persistence Collections are initialized,
 * not all the parts of Persisence layer.
 */
export const PERSISTENCE__COLLECTIONS_READY = Symbol(
  'persistence:collectionsReady'
)
/**
 * For Persistence consumers: Persistence layer is fully initialized.
 */
export const PERSISTENCE__READY = Symbol('persistence:ready')

/**
 * For notifying Preset room's sockets that Preset has changed.
 */
export const PRESET__UPDATED_DEVICE_DELETED = Symbol(
  'presetModel:updatedDevicesDeleted'
)

export const MQTT__CLIENT_READY = Symbol('mqtt:ready')

export const MQTT__CLEAR_SENDER_COMMANDS = Symbol('mqtt:clearSenderCommands')

export const MQTT__LAMP_CMND__STATE = Symbol('mqtt:getLampState')

export const MQTT__LAMP_CMND__SET_STATE = Symbol('mqtt:setLampstate')

export const MQTT__LAMP_PRESENT = Symbol('mqtt:lampPresent')
