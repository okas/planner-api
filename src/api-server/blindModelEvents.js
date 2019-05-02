import * as model from '../model/blindModel'

const broadcastRoom = 'blind'

/**
 * @param {SocketIO.Socket} socket
 */
export default function registerBlindModelEvents(socket) {
  /**
   * @param {String} [room]
   */
  function getLogPrefix(room) {
    return `[ ${socket.id} ]${room ? `, room "${room}"` : ''} : `
  }

  socket.on('blind__get_all', fn => {
    fn(model.getAll())
    console.log(`${getLogPrefix()}sent Blinds`)
  })

  socket.on('blind__add', (blind, fn) => {
    let result = model.add(blind)
    if (result.errors) {
      fn(result)
    } else {
      fn({ id: result.id })
      socket.to(broadcastRoom).emit('blind__api_add', result)
    }
    console.log(
      `${getLogPrefix(broadcastRoom)}${
        result.errors
          ? `Sent errors on adding new Blind: [ ${JSON.stringify(result)} ]`
          : `Sent added Blind's id and broadcasted new document.`
      }`
    )
  })

  socket.on('blind__update', (blind, fn) => {
    const result = model.update(blind)
    if (result.errors) {
      fn(result)
    } else {
      fn({ status: 'ok' })
      socket.to(broadcastRoom).emit('blind__api_update', result)
    }
    console.log(
      `${getLogPrefix(broadcastRoom)}${
        result.errors
          ? `Sent errors on updating Blind: [ ${JSON.stringify(result)} ]`
          : `Sent updated Blind's status and broadcasted document changes.`
      }`
    )
  })

  socket.on('blind__remove', (blindId, fn) => {
    const result = model.remove(blindId)
    if (result.errors) {
      fn(result)
    } else {
      fn({ status: 'ok' })
      socket.to(broadcastRoom).emit('blind__api_remove', result)
    }
    console.log(
      `${getLogPrefix(broadcastRoom)}${
        result.errors
          ? `Sent errors on removing Blind: [ ${JSON.stringify(result)} ]`
          : `Sent removed Blind's status, no errors.`
      }`
    )
  })

  socket.on('blind__get_dependent_presets', (blindId, fn) => {
    const result = model.getDependendtPresets(blindId)
    fn(result)
    console.log(`${getLogPrefix()}Sent Blind's dependent presets`)
  })
}
