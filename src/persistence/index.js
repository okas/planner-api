import Loki from 'lokijs'
import LokiFsStructuredAdapter from 'lokijs/src/loki-fs-structured-adapter'
import messageBus, { PERSISTENCE_READY } from '../messageBus'
import setupLampsCollection from './lampsCollection'
import setupBlindsCollection from './blindsCollection'
import setupPresetCollection from './presetsCollection'

// take from configuration or export constructor from this module
const dbFile = './data/loki_db.json'

const database = new Loki(dbFile, {
  verbose: true,
  autoload: true,
  autosave: true,
  env: 'NODEJS',
  adapter: new LokiFsStructuredAdapter(),
  autoloadCallback: initializeDatabase
})

function initializeDatabase() {
  initCollections()
  // Save configurations to db
  database.saveDatabase()
  messageBus.emit(PERSISTENCE_READY)
}

function initCollections() {
  roomLampsCollection = setupLampsCollection(database)
  roomBlindsCollection = setupBlindsCollection(database)
  presetsCollection = setupPresetCollection(database)
}

/** @type {Collection} */
export let roomLampsCollection
/** @type {Collection} */
export let roomBlindsCollection
/** @type {Collection} */
export let presetsCollection
