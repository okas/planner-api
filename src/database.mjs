import Loki from 'lokijs'
import LokiFsStructuredAdapter from 'lokijs/src/loki-fs-structured-adapter'

export let roomLamps
export let roomBlinds

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
  roomLamps =
    db.getCollection('room_lamps') ||
    db.addCollection('room_lamps', { autoupdate: true })

  roomBlinds =
    db.getCollection('room_blinds') ||
    db.addCollection('room_blinds', { autoupdate: true })

  fnProgramLogic()
}
