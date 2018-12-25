import Loki from 'lokijs'
import Adapter from 'lokijs/src/loki-fs-structured-adapter'

// take from configuration or export constructor from this module
const dbFile = './data/loki_db.json'
var roomLamps

const lokiConf = {
  verbose: true,
  autoload: true,
  autosave: true,
  env: 'NODEJS',
  adapter: new Adapter(),
  autoloadCallback: initializeDatabase
}

const db = new Loki(dbFile, lokiConf)

function initializeDatabase() {
  roomLamps =
    db.getCollection('room_lamps') ||
    db.addCollection('room_lamps', { autoupdate: true })
}

export { db as default, roomLamps }
