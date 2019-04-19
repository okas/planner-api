import * as model from '../model/presetModel'

const room = 'preset'

/**
 * @param {SocketIO.Socket} socket
 */
export default function registerPresetsEvents(socket) {
  function getLogPrefix(roomVal) {
    return `[ ${socket.id} ]${roomVal ? `, room "${roomVal}"` : ''} : `
  }

  socket.on('preset__add', (preset, fn) => {
    const result = model.add(preset)
    if (result.errors) {
      fn(result)
    } else {
      fn({ id: result.id })
      socket.to(room).emit('preset__api_add', result)
    }
    console.log(
      `${getLogPrefix(room)}${
        result.errors
          ? `Sent errors on adding new preset: [ ${JSON.stringify(result)} ]`
          : `Sent added preset's id.`
      }`
    )
  })

  socket.on('preset__update', (preset, fn) => {
    const result = model.update(preset)
    if (result.errors) {
      fn(result)
    } else {
      fn({ status: 'ok' })
      socket.to(room).emit('preset__api_update', result)
    }
    console.log(
      `${getLogPrefix(room)}${
        result.errors
          ? `Sent errors on updating preset: [ ${JSON.stringify(result)} ]`
          : `Sent updated presets's status, no errors.`
      }`
    )
  })

  socket.on('preset__remove', (presetId, fn) => {
    const result = model.remove(presetId)
    if (result.errors) {
      fn(result)
    } else {
      fn({ status: 'ok' })
      socket.to(room).emit('preset__api_remove', result)
    }
    console.log(
      `${getLogPrefix(room)}${
        result.errors
          ? `Sent errors on removing preset: [ ${JSON.stringify(result)} ]`
          : `Sent removed presets's status, no errors.`
      }`
    )
  })

  socket.on('preset__set_active', (patchObj, fn) => {
    const result = model.setActive(patchObj)
    if (result.errors) {
      fn(result)
    } else {
      fn({ status: 'ok' })
      socket.to(room).emit('preset__api_set_active', patchObj)
    }
    console.log(
      `${getLogPrefix(room)}${
        result.errors
          ? `Sent errors on setting new active state: [ ${JSON.stringify(
              result
            )} ]`
          : `Sent and broadcasted state for Preset active property's change, no errors.`
      }`
    )
  })

  socket.on('preset__get_all', fn => {
    fn(model.getAll())
    console.log(`${getLogPrefix()}Sent all presets.`)
  })

  // Verify is it necessary expect that fn is moved- argument order if data is not given?
  socket.on('preset__get_devices_all', (lang, fn) => {
    if (typeof fn === 'function') {
      fn(model.getDevicesSelection(lang))
    } else {
      lang(model.getDevicesSelection())
    }
    console.log(
      `${getLogPrefix()}Sent devices data for Presets, grouped by type.`
    )
  })
}
