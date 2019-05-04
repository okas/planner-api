import messageBus, {
  MQTT__LAMP_LOST,
  MQTT__LAMP_PRESENT,
  MQTT__RESP__LAMP__SET_STATE
} from '../messageBus'

const room = 'lamp-state'

/**
 *  SocketIO broadcaster. Uses `{messageBus}` module to listen events from MQTT.
 *  @param {SocketIO.Server} io
 */
export default function registerLampMqttBroadcast(io) {
  function logMsg(msg) {
    console.log(`[ API: Lamp MQTT Broadcaster ], room "${room}" : ${msg}.`)
  }

  messageBus.on(MQTT__LAMP_PRESENT, data => {
    io.to(room).emit('lamp__api_present', data)
    logMsg(`lamp "${data.id}" is present.`)
  })

  messageBus.on(MQTT__LAMP_LOST, data => {
    io.to(room).emit('lamp__api_lost', data)
    logMsg(`lamp "${data}" is lost`)
  })

  messageBus.on(
    MQTT__RESP__LAMP__SET_STATE,
    /**
     * @param {SocketIO.Socket} broadcastContext if null, then broadcast context is {SocketIO.Server}
     */ (data, broadcastContext = null) => {
      const context = broadcastContext || io
      context.to(room).emit('lamp__api_set_state', data)
      logMsg('forwarding set state of Lamp, MQTT=>API=>browser')
    }
  )
}
