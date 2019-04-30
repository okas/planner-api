import messageBus, {
  MQTT__LAMP_CMND__STATE,
  MQTT__LAMP_CMND__SET_STATE
} from '../messageBus'

const broadcastRoom = 'lamp-state'

/**
 * @param {SocketIO.Socket} socket
 */
export default function registerLampMqttEvents(socket) {
  /**
   * @param {String} [room]
   */
  function getLogPrefix(room) {
    return `[ ${socket.id} ]${room ? `, room "${room}"` : ''} : `
  }

  socket.on('lamp__get_state', (lampId, fn) => {
    console.log(`${getLogPrefix()}get Lamp state form MQTT`)
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
        // ToDo error handling, a/o validation?
        fn({ status: 'ok', response: payload })
        broadcastLampSetState(changeData, payload)
        console.log(
          `${getLogPrefix(
            broadcastRoom
          )}forwarding set state of Lamp, MQTT=>API=>browser.`
        )
      }
    })
  })

  function broadcastLampSetState({ id }, state) {
    socket.to(broadcastRoom).emit('lamp__api_set_state', { id, state })
  }
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
