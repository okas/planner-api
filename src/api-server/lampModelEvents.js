import * as model from '../model/lampModel'

const broadcastRoom = 'lamp'

/**
 * @param {SocketIO.Socket} socket
 */
export default function registerLampModelEvents(socket) {
  /**
   * @param {String} [room]
   */
  function getLogPrefix(room) {
    return `[ ${socket.id} ]${room ? `, room "${room}"` : ''} : `
  }

  socket.on('lamp__get_all', fn => {
    fn(model.getAll())
    console.log(`${getLogPrefix()}sent Lamps`)
  })

  socket.on('lamp__add', (lamp, fn) => {
    const result = model.add(lamp)
    if (result.errors) {
      fn(result)
    } else {
      fn({ id: result.id })
      socket.to(broadcastRoom).emit('lamp__api_add', result)
    }
    console.log(
      `${getLogPrefix(broadcastRoom)}${
        result.errors
          ? `Sent errors on adding new Lamp: [ ${JSON.stringify(result)} ]`
          : `Sent added Lamp's id and broadcasted new document.`
      }`
    )
  })

  socket.on('lamp__update', (lamp, fn) => {
    const result = model.update(lamp)
    if (result.errors) {
      fn(result)
    } else {
      fn({ status: 'ok' })
      socket.to(broadcastRoom).emit('lamp__api_update', result)
    }
    console.log(
      `${getLogPrefix(broadcastRoom)}${
        result.errors
          ? `Sent errors on updating Lamp: [ ${JSON.stringify(result)} ]`
          : `Sent updated Lamp's status and broadcasted document changes.`
      }`
    )
  })

  socket.on('lamp__remove', (lampId, fn) => {
    const result = model.remove(lampId)
    if (result.errors) {
      fn(result)
    } else {
      fn({ status: 'ok' })
      socket.to(broadcastRoom).emit('lamp__api_remove', result)
    }
    console.log(
      `${getLogPrefix(broadcastRoom)}${
        result.errors
          ? `Sent errors on removing Lamp: [ ${JSON.stringify(result)} ]`
          : `Sent removed Lamp's status, no errors.`
      }`
    )
  })

  socket.on('lamp__get_dependent_presets', (lampId, fn) => {
    const result = model.getDependendtPresets(lampId)
    fn(result)
    console.log(`${getLogPrefix()}Sent lamp's dependent presets`)
  })
}
