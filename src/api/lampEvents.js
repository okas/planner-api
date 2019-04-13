import * as model from '../model/lampModel'

/**
 * @param {SocketIO.Socket} socket
 */
export default function registerLampsEvents(socket) {
  socket.on('lamp__get_all', fn => {
    fn(model.getAll())
    console.log(`[ ${socket.id} ] :  sending lamps rooms`)
  })

  socket.on('lamp__add', (lamp, fn) => {
    let result = model.add(lamp)
    if (result.errors) {
      fn(result)
    } else {
      fn({ id: result.id })
      socket.broadcast.emit('lamp__api_add', result)
    }
    console.log(
      `[ ${socket.id} ] : ${
        result.errors
          ? `Sent errors on adding new lamp: [ ${JSON.stringify(result)} ]`
          : `Sent added lamps's id and broadcasted new document.`
      }`
    )
  })

  socket.on('lamp__update', (lamp, fn) => {
    const result = model.update(lamp)
    if (result.errors) {
      fn(result)
    } else {
      fn({ status: 'ok' })
      socket.broadcast.emit('lamp__api_update', result)
    }
    console.log(
      `[ ${socket.id} ] : ${
        result.errors
          ? `Sent errors on updating lamp: [ ${JSON.stringify(result)} ]`
          : `Sent updated lamp's status, no errors.`
      }`
    )
  })

  socket.on('lamp__remove', (lampId, fn) => {
    const result = model.remove(lampId)
    if (result.errors) {
      fn(result)
    } else {
      fn({ status: 'ok' })
      socket.broadcast.emit('lamp__api_remove', result)
    }
    console.log(
      `[ ${socket.id} ] : ${
        result.errors
          ? `Sent errors on removing lamp: [ ${JSON.stringify(result)} ]`
          : `Sent removed lamp's status, no errors.`
      }`
    )
  })

  socket.on('lamp__get_dependent_presets', (lampId, fn) => {
    const result = model.getDependendtPresets(lampId)
    fn(result)
    console.log(`[ ${socket.id} ] : sending lamp's dependent presets`)
  })
}
