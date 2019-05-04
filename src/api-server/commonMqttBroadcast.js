import messageBus, {
  MQTT__CLIENT_LOST,
  MQTT__CLIENT_READY
} from '../messageBus'

const deviceStateRooms = ['lamp-state', 'blind-state']

/**
 *  SocketIO broadcaster. Uses `{messageBus}` module to listen events from MQTT.
 *  @param {SocketIO.Server} io
 */
export default function registerCommonMqttBroadcasts(io) {
  messageBus.on(MQTT__CLIENT_LOST, () => {
    deviceStateRooms.forEach(r => {
      io.to(r).emit('devices__api_lost')
    })
    logMsg('MQTT client lost')
  })

  messageBus.on(MQTT__CLIENT_READY, () => {
    deviceStateRooms.forEach(r => {
      io.to(r).emit('devices__api_ready')
    })
    logMsg('MQTT client ready')
  })

  function logMsg(msg) {
    console.log(
      `[ API: Common MQTT Broadcaster ], rooms "${deviceStateRooms}" : ${msg}.`
    )
  }
}
