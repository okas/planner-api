import { EventEmitter } from 'events'

export default new EventEmitter()

export const PERSISTENCE__COLLECTIONS_READY = Symbol(
  'persistence:collectionsReady'
)
export const PERSISTENCE__READY = Symbol('persistence:ready')
