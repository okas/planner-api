import SocketIO from 'socket.io'
import registerLampEvents from './lampEvents'
import registerWindowsBlindEvents from './blindEvents'
import registerPresetEvents from './presetEvents'

export default function initApi(httpServer) {
  io = new SocketIO(httpServer, socketIoConfig)

  io.on(
    'connect',
    /** @param {SocketIO.Socket} socket current connections socket  */
    socket => {
      console.log(`|-> [ ${socket.id} ] : a user connected`)
      socket.on('disconnect', () => {
        console.log(`>-| [ ${socket.id} ] : a user disconnected`)
      })
      registerLampEvents(socket)
      registerWindowsBlindEvents(socket)
      registerPresetEvents(socket)
    }
  )
}

// Todo: retreive configurtion here
const socketIoConfig = {
  path: '/api',
  pingInterval: 3600000 || undefined // testing only!
}

export let io
