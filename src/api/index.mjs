import SocketIOClient from 'socket.io'
import registerLampsEvents from './lamps'
import registerWindowsBlindEvents from './blinds'

// Todo: retreive configurtion here
const socketIoConfig = {
  path: '/api',
  pingInterval: 3600000 || undefined // testing only!
}

export let io

export default function initApi(httpServer) {
  // Force single initialization
  if (io) return

  io = new SocketIOClient(httpServer, socketIoConfig)

  io.on('connect', socket => {
    console.log(`|-> [ ${socket.id} ] : a user connected`)
    socket.on('disconnect', () => {
      console.log(`>-| [ ${socket.id} ] : a user disconnected`)
    })
    registerLampsEvents(socket)
    registerWindowsBlindEvents(socket)
  })
}
