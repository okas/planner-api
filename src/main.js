import SocketIO from 'socket.io'
import Loki from 'lokijs'
import Adapter from 'lokijs/src/loki-fs-structured-adapter'

// take from configurtion
const ioSrv = new SocketIO(3000)

// take from configuration
const dbFile = './data/loki_db.json'
const col1Name = 'users'
const col2Name = 'animals'
const db = new Loki(dbFile, {
  verbose: true,
  autoload: true,
  autosave: true,
  env: 'NODEJS',
  autoloadCallback: dbInit,
  adapter: new Adapter()
})

function dbInit() {
  console.log('inside dbInit callback')
  var col1 = db.getCollection(col1Name)
  if (!col1) {
    console.log(`no collection '${col1Name}' currently, creating`)
    col1 = db.addCollection(col1Name)
  } else {
    console.log(`collection '${col1Name}' exists`)
  }
  var col2 = db.getCollection(col2Name)
  if (!col2) {
    console.log(`no collection '${col2Name}' currently, creating`)
    col2 = db.addCollection(col2Name)
  } else {
    console.log(`collection '${col2Name}' exists`)
  }
  for (let i = 1; i <= 10; i++) {
    col1.insert({ name: `User${i}` })
    col2.insert({ name: `Anim${i}` })
  }
  db.saveDatabase()
  console.log('leaving dbInit callback')
}

ioSrv.on('connection', s => {
  console.log('a user connected')

  s.on('disconnect', function() {
    console.log('a user disconnected')
  })

  s.on('test', msg => {
    s.emit(`reply: ${msg}`)
  })
})
