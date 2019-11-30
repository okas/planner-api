import IOServer from 'socket.io'
import registerApiEventsCommon from './apiEventsCommon'
import registerModelEventsBlind from './events-ws/modelEventsBlind'
import registerModelEventsLamp from './events-ws/modelEventsLamp'
import registerModelEventPreset from './events-ws/modelEventsPreset'
import registerMqttEventsBlind from './events-ws/mqttEventsBlind'
import registerMqttEventsLamp from './events-ws/mqttEventsLamp'
import registerMqttEventsPreset from './events-ws/mqttEventsPreset'
import registerModelBroadcastsPreset from './messages/modelBroadcastsPreset'
import registerMqttBroadcastsBlind from './messages/mqttBroadcastsBlind'
import registerMqttBroadcastsCommon from './messages/mqttBroadcastsCommon'
import registerMqttBroadcastsLamp from './messages/mqttBroadcastsLamp'

export default function initWsServer(httpServer) {
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
  registerMqttBroadcastsLamp(io)
  registerMqttBroadcastsBlind(io)
  registerModelBroadcastsPreset(io)
  registerMqttBroadcastsCommon(io)
  io.on(
    'connection',
    /** @param {SocketIO.Socket} socket current connections socket  */
    socket => {
      registerApiEventsCommon(socket)
      registerModelEventsLamp(socket)
      registerMqttEventsLamp(socket)
      registerModelEventsBlind(socket)
      registerMqttEventsBlind(socket)
      registerModelEventPreset(socket)
      registerMqttEventsPreset(socket)
    }
  )
}

/** @type {SocketIO.Server} */
export let io
