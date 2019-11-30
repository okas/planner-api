import messageBus, {
  MQTT__LAMP_CMND__STATE,
  MQTT__LAMP_CMND__SET_STATE,
  MQTT__RESP__LAMP__SET_STATE
} from '../../messageBus'

/**
 * @param {SocketIO.Socket} socket
 */
export default function registerMqttEventsLamp(socket) {
  /**
   * @param {String} [room]
   */
  function getLogPrefix(room) {
    return `[ ${socket.id} ]${room ? `, room "${room}"` : ''} : `
  }

  socket.on('lamp__get_state', (lampId, fn) => {
    console.log(`${getLogPrefix()}get Lamp state from MQTT`)
    messageBus.emit(MQTT__LAMP_CMND__STATE, {
      data: lampId,
      sender: socket.id,
      done: payload => {
        fn(payload)
        console.log(
          `${getLogPrefix()}forwarding Lamp state MQTT=>API=>browser.`
        )
      }
    })
  })

  socket.on('lamp__set_state', (changeData, fn) => {
    const errors = validateState(changeData)
    if (errors) {
      fn(errors)
      return
    }
    messageBus.emit(MQTT__LAMP_CMND__SET_STATE, {
      data: changeData,
      sender: socket.id,
      done: payload => {
        fn({ status: 'ok', response: payload })
        const eventPayload = {
          id: changeData.id,
          state: payload
        }
        messageBus.emit(MQTT__RESP__LAMP__SET_STATE, eventPayload, socket)
      }
    })
  })
}

function validateState(changeData) {
  const errors = []
  if (typeof changeData.state !== 'number') {
    errors.push('state must be type of number')
  }
  if (changeData.state < 0 && changeData.state > 1) {
    errors.push('state value must be in 0..1')
  }
  return errors.length ? { errors } : null
}
