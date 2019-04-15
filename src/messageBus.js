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
