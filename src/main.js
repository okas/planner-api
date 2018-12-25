import SocketIO from 'socket.io'
import { roomLamps } from './database'

// take from configurtion
const ioSrv = new SocketIO(3000, {
  pingInterval: 3600000 // testing only!
})

ioSrv.on('connection', s => {
  console.log(`a user connected: ${s.id}`)

  s.on('disconnect', () => {
    console.log(`a user disconnected: [ ${s.id} ]`)
  })

  s.on('lamps-add', (lamp, room) => {
    let lampObj = roomLamps.insertOne({
      name: `${lamp || '-lamp'} ${roomLamps.count() + 1}`,
      room: `${room || '-tuba'}`,
      creator: s.id
    })
    console.log(`created: ${JSON.stringify(lampObj)}`)
    s.emit(lampObj)
  })
})
