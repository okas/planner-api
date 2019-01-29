import Loki from 'lokijs'
import LokiFsStructuredAdapter from 'lokijs/src/loki-fs-structured-adapter'

export let roomLamps
export let roomBlinds
export let presets

export default function(bootstrapFn) {
  fnProgramLogic = bootstrapFn
}

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
  roomLamps = getOrAddCollection('room_lamps')
  roomBlinds = getOrAddCollection('room_blinds')
  presets = getOrAddCollection('presets')
  fnProgramLogic()
}

function getOrAddCollection(collectionName) {
  return (
    db.getCollection(collectionName) ||
    db.addCollection(collectionName, { autoupdate: true })
  )
}
