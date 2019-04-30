import messageBus, {
  MQTT__BLIND_CMND__STATE,
  MQTT__BLIND_CMND__SET_STATE
} from '../messageBus'

const broadcastRoom = 'blind-state'

/**
 * @param {SocketIO.Socket} socket
 */
export default function registerBlindMqttEvents(socket) {
  /**
   * @param {String} [room]
   */
  function getLogPrefix(room) {
    return `[ ${socket.id} ]${room ? `, room "${room}"` : ''} : `
  }

  socket.on('blind__get_state', (blindId, fn) => {
    console.log(`${getLogPrefix()} get Blind state form MQTT`)
    messageBus.emit(MQTT__BLIND_CMND__STATE, {
      data: blindId,
      sender: socket.id,
      done: payload => {
        fn(payload)
        console.log(
          `${getLogPrefix()}forwarding Blind state MQTT=>API=>browser.`
        )
      }
    })
  })

  socket.on('blind__set_state', (changeData, fn) => {
    const errors = validateState(changeData)
    if (errors) {
      fn(errors)
      return
    }
    messageBus.emit(MQTT__BLIND_CMND__SET_STATE, {
      data: changeData,
      sender: socket.id,
      done: payload => {
        // ToDo error handling, a/o validation?
        fn({ status: 'ok', response: payload })
        broadcastBlindSetState(changeData, payload)
        console.log(
          `${getLogPrefix(
            broadcastRoom
          )}forwarding set state of Blind, MQTT=>API=>browser.`
        )
      }
    })
  })

  function broadcastBlindSetState({ id }, state) {
    socket.to(broadcastRoom).emit('blind__api_set_state', { id, state })
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
