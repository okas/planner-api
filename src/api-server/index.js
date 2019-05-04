import IOServer from 'socket.io'
import registerBlindModelEvents from './blindModelEvents'
import registerBlindMqttBroadcast from './blindMqttBroadcast'
import registerBlindMqttEvents from './blindMqttEvents'
import registerCommonApiEvents from './commonApiEvents'
import registerCommonMqttBroadcasts from './commonMqttBroadcast'
import registerLampModelEvents from './lampModelEvents'
import registerLampMqttBroadcast from './lampMqttBroadcast'
import registerLampMqttEvents from './lampMqttEvents'
import registerPresetModelBroadcast from './presetModelBroadcast'
import registerPresetModelEvents from './presetModelEvents'
import registerPresetMqttEvents from './presetMqttEvents'

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
  registerPresetModelBroadcast(io)
  registerCommonMqttBroadcasts(io)
  io.on(
    'connection',
    /** @param {SocketIO.Socket} socket current connections socket  */
    socket => {
      registerCommonApiEvents(socket)
      registerLampModelEvents(socket)
      registerLampMqttEvents(socket)
      registerBlindModelEvents(socket)
      registerBlindMqttEvents(socket)
      registerPresetModelEvents(socket)
      registerPresetMqttEvents(socket)
    }
  )
}

/** @type {SocketIO.Server} */
export let io
