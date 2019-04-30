import messageBus, {
  MQTT__BLIND_PRESENT,
  MQTT__BLIND_LOST
} from '../messageBus'

const room = 'blind-state'

/**
 *  SocketIO broadcaster. Uses `{messageBus}` module to listen events from MQTT.
 *  @param {SocketIO.Server} io
 */
export default function(io) {
  function getLogPrefix() {
    return `[ API: Blind MQTT Broadcaster ], room "${room}" : `
  }

  messageBus.on(MQTT__BLIND_PRESENT, data => {
    io.to(room).emit('blind__api_present', data)
    console.log(`${getLogPrefix()}blind "${data.id}" is present.`)
  })

  messageBus.on(MQTT__BLIND_LOST, data => {
    io.to(room).emit('blind__api_lost', data)
    console.log(`${getLogPrefix()}blind "${data}" is lost.`)
  })
}
