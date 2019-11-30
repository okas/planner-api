import messageBus, {
  MQTT__API_CLIENT_LOST,
  MQTT__API_CLIENT_READY
} from '../../messageBus'

const deviceStateRooms = ['lamp-state', 'blind-state']

/**
 *  SocketIO broadcaster. Uses `{messageBus}` module to listen events from MQTT.
 *  @param {SocketIO.Server} io
 */
export default function registerMqttBroadcastsCommon(io) {
  messageBus.on(MQTT__API_CLIENT_LOST, () => {
    deviceStateRooms.forEach(r => {
      io.to(r).emit('devices__api_lost')
    })
    logMsg('MQTT API client lost')
  })

  messageBus.on(MQTT__API_CLIENT_READY, () => {
    deviceStateRooms.forEach(r => {
      io.to(r).emit('devices__api_ready')
    })
    logMsg('MQTT API client ready')
  })

  function logMsg(msg) {
    console.log(
      `[ API: Common MQTT Broadcaster ], rooms "${deviceStateRooms}" : ${msg}.`
    )
  }
}
