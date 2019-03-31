import Loki from 'lokijs'
import LokiFsStructuredAdapter from 'lokijs/src/loki-fs-structured-adapter'

export default function(bootstrapFn) {
  fnProgramLogic = bootstrapFn
}

export let roomLampsCollection, roomBlindsCollection, presetsCollection

let fnProgramLogic
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

const db = new Loki(dbFile, configuration)

function initializeDatabase() {
  initCollections()
  fnProgramLogic()
}

function initCollections() {
  roomLampsCollection = getOrAddCollection('room_lamps')
  roomBlindsCollection = getOrAddCollection('room_blinds')
  presetsCollection = getOrAddCollection('presets')
}

function getOrAddCollection(name, config = null) {
  return db.getCollection(name) || db.addCollection(name, config)
}
