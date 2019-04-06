import { EventEmitter } from 'events'

export default new EventEmitter()

export const PERSISTENCE_COLLECTIONS_READY = 'persistence:collectionsReady'
export const PERSISTENCE_READY = 'persistence:ready'
