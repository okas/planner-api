import IOServer from 'socket.io'
import registerCommonEvents from './commonEvents'
import registerLampEvents from './lampEvents'
import registerWindowsBlindEvents from './blindEvents'
import registerPresetEvents from './presetEvents'
import registerPresetEmits from './presetEmits'

export default function initApi(httpServer) {
  // @ts-ignore
  io = new IOServer(httpServer, socketIoConfig)
  register(io)
}

// Todo: retreive configurtion here
const socketIoConfig = {
  path: '/api',
  pingInterval: 3600000 || undefined // testing only!
}

/**
 * @param {SocketIO.Server} io
 */
function register(io) {
  registerPresetEmits(io)
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

/** @type {SocketIO.Server} */
export let io
