import Server from 'socket.io'
import registerCommonEvents from './commonEvents'
import registerLampEvents from './lampEvents'
import registerWindowsBlindEvents from './blindEvents'
import registerPresetEvents from './presetEvents'

export default function initApi(httpServer) {
  // @ts-ignore
  io = new Server(httpServer, socketIoConfig)

  io.on(
    'connection',
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

/** @type {SocketIO.Server} */
export let io
