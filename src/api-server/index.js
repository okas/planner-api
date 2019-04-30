import IOServer from 'socket.io'
import registerCommonEvents from './commonEvents'
import registerLampModelEvents from './lampModelEvents'
import registerLampMqttEvents from './lampMqttEvents'
import registerLampMqttBroadcast from './lampMqttBroadcast'
import registerBlindModelEvents from './blindModelEvents'
import registerBlindMqttEvents from './blindMqttEvents'
import registerBlindMqttBroadcast from './blindMqttBroadcast'
import registerPresetEvents from './presetEvents'
import registerPresetBroadcast from './presetBroadcast'
import registerCommonMqttBroadcasts from './commonMqttBroadcast'

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
  registerLampMqttBroadcast(io)
  registerBlindMqttBroadcast(io)
  registerPresetBroadcast(io)
  registerCommonMqttBroadcasts(io)
  io.on(
    'connection',
    /** @param {SocketIO.Socket} socket current connections socket  */
    socket => {
      registerCommonEvents(socket)
      registerLampModelEvents(socket)
      registerLampMqttEvents(socket)
      registerBlindModelEvents(socket)
      registerBlindMqttEvents(socket)
      registerPresetEvents(socket)
    }
  )
}

/** @type {SocketIO.Server} */
export let io
