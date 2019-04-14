import registerCommonEvents from './commonEvents'
import registerLampEvents from './lampEvents'
import registerWindowsBlindEvents from './blindEvents'
import registerPresetEvents from './presetEvents'

export default function initApi(httpServer) {
  io = new SocketIO(httpServer, socketIoConfig)

  io.on(
    'connect',
    /** @param {SocketIO.Socket} socket current connections socket  */
    socket => {
      registerCommonEvents(socket)
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
