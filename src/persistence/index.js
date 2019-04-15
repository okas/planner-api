import Loki from 'lokijs'
import LokiFsStructuredAdapter from 'lokijs/src/loki-fs-structured-adapter'
import messageBus, {
  PERSISTENCE__READY,
  PERSISTENCE__COLLECTIONS_READY
} from '../messageBus'
import setupLampCollection from './lampCollection'
import setupBlindCollection from './blindCollection'
import setupPresetCollection from './presetCollection'

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
  database.saveDatabase(err => {
    if (err) {
      console.error('error : ' + err)
    } else {
      messageBus.emit(PERSISTENCE__READY)
    }
  })
  messageBus.emit(PERSISTENCE__COLLECTIONS_READY)
}

function initCollections() {
  lampCollection = setupLampCollection(database)
  blindCollection = setupBlindCollection(database)
  presetCollection = setupPresetCollection(database)
}

/** @type {Collection} */
export let lampCollection
/** @type {Collection} */
export let blindCollection
/** @type {Collection} */
export let presetCollection
