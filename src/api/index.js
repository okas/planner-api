import SocketIO from 'socket.io'
import registerLampsEvents from './lampsEvents'
import registerWindowsBlindEvents from './blindsEvents'
import registerPresetsEvents from './presetsevents'

export default function initApi(httpServer) {
  // Force single initialization
  if (io) return

  io = new SocketIO(httpServer, socketIoConfig)

  io.on('connect', socket => {
    console.log(`|-> [ ${socket.id} ] : a user connected`)
    socket.on('disconnect', () => {
      console.log(`>-| [ ${socket.id} ] : a user disconnected`)
    })
    registerLampsEvents(socket)
    registerWindowsBlindEvents(socket)
    registerPresetsEvents(socket)
  })
}

// Todo: retreive configurtion here
const socketIoConfig = {
  path: '/api',
  pingInterval: 3600000 || undefined // testing only!
}

export let io
