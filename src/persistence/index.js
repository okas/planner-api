import Loki from 'lokijs'
import LokiFsStructuredAdapter from 'lokijs/src/loki-fs-structured-adapter'
import messageBus from '../messageBus'

// take from configuration or export constructor from this module
const dbFile = './data/loki_db.json'

const configuration = {
  verbose: true,
  autoload: true,
  autosave: true,
  env: 'NODEJS',
  adapter: new LokiFsStructuredAdapter(),
  autoloadCallback: initializeDatabase
}

function initializeDatabase() {
  initCollections()
  messageBus.emit('persistence:ready')
}

function initCollections() {
  roomLampsCollection = getOrAddCollection('room_lamps')
  roomBlindsCollection = getOrAddCollection('room_blinds')
  presetsCollection = getOrAddCollection('presets')
}

function getOrAddCollection(name, config = null) {
  return db.getCollection(name) || db.addCollection(name, config)
}

const db = new Loki(dbFile, configuration)

export let roomLampsCollection, roomBlindsCollection, presetsCollection
