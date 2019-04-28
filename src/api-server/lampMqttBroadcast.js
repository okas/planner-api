import messageBus, { MQTT__LAMP_PRESENT, MQTT__LAMP_LOST } from '../messageBus'

const room = 'lamp-state'

/**
 *  SocketIO broadcaster. Uses `{messageBus}` module to listen events from MQTT.
 *  @param {SocketIO.Server} io
 */
export default function(io) {
  function getLogPrefix() {
    return `[ API: Lamp MQTT Broadcaster ], room "${room}" : `
  }

  messageBus.on(MQTT__LAMP_PRESENT, data => {
    io.to(room).emit('lamp__api_present', data)
    console.log(`${getLogPrefix()}lamp "${data.id}" is present.`)
  })

  messageBus.on(MQTT__LAMP_LOST, data => {
    io.to(room).emit('lamp__api_lost', data)
    console.log(`${getLogPrefix()}lamp "${data}" is lost.`)
  })
}
