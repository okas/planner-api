import messageBus, {
  MQTT__BLIND_PRESENT,
  MQTT__BLIND_LOST,
  MQTT__RESP__BLIND__SET_STATE
} from '../../messageBus'

const room = 'blind-state'

/**
 *  SocketIO broadcaster. Uses `{messageBus}` module to listen events from MQTT.
 *  @param {SocketIO.Server} io
 */
export default function registerMqttBroadcastsBlind(io) {
  messageBus.on(MQTT__BLIND_PRESENT, data => {
    io.to(room).emit('blind__api_present', data)
    logMsg(`blind "${data.id}" is present.`)
  })

  messageBus.on(MQTT__BLIND_LOST, data => {
    io.to(room).emit('blind__api_lost', data)
    logMsg(`blind "${data.id}" is lost`)
  })

  messageBus.on(
    MQTT__RESP__BLIND__SET_STATE,
    /** @param {SocketIO.Socket} broadcastContext if null, then broadcast context is {SocketIO.Server} */
    (data, broadcastContext = null) => {
      const context = broadcastContext || io
      context.to(room).emit('blind__api_set_state', data)
      logMsg('forwarding set state of Blind, MQTT=>API=>browser')
    }
  )

  function logMsg(msg) {
    console.log(`[ API: Blind MQTT Broadcaster ], room "${room}" : ${msg}.`)
  }
}
