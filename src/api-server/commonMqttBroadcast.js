import messageBus, {
  MQTT__CLIENT_LOST,
  MQTT__CLIENT_READY
} from '../messageBus'

const deviceStateRooms = ['lamp-state']

/**
 *  SocketIO broadcaster. Uses `{messageBus}` module to listen events from MQTT.
 *  @param {SocketIO.Server} io
 */
export default function registerCommonMqttBroadcasts(io) {
  function getLogPrefix() {
    return `[ API: Common MQTT Broadcaster ], rooms "${deviceStateRooms}" : `
  }

  messageBus.on(MQTT__CLIENT_LOST, () => {
    deviceStateRooms.forEach(r => {
      io.to(r).emit('devices__api_lost')
    })
    console.log(`${getLogPrefix()}MQTT client lost.`)
  })

  messageBus.on(MQTT__CLIENT_READY, () => {
    deviceStateRooms.forEach(r => {
      io.to(r).emit('devices__api_ready')
    })
    console.log(`${getLogPrefix()}MQTT client ready.`)
  })
}
