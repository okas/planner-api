import * as model from '../models/presetModel'

export default function registerPresetsEvents(socket) {
  socket.on('preset__add', (preset, fn) => {
    const result = model.add(preset)
    fn(result)
    console.log(
      !result.errors
        ? `Sent added preset's id.`
        : `Sent errors on adding new preset: [ ${JSON.stringify(result)} ]`
    )
  })

  socket.on('preset__update', (preset, fn) => {
    const result = model.update(preset)
    fn(result)
    console.log(
      !result.errors
        ? `Sent updated presets's status, was no errors.`
        : `Sent errors on updating preset: [ ${JSON.stringify(result)} ]`
    )
  })

  socket.on('preset__remove', (presetId, fn) => {
    const result = model.remove(presetId)
    fn(result)
    console.log(
      !result.errors
        ? `Sent removed presets's status, was no errors.`
        : `Sent errors on removing preset: [ ${JSON.stringify(result)} ]`
    )
  })

  socket.on('presets__set_active', ({ id, active }, fn) => {
    const result = model.setActive(id, active)
    fn(result)
    console.log(
      !result.errors
        ? `Sent state for preset active property's change, was no errors.`
        : `Sent errors on setting new active state: [ ${JSON.stringify(
            result
          )} ]`
    )
  })

  socket.on('preset__get_all', fn => {
    fn(model.getAll())
    console.log('Sent all presets.')
  })

  // Verify is it necessary expect that fn is moved- argument order if data is not given?
  socket.on('preset__get_devices_all', (lang, fn) => {
    if (typeof fn === 'function') {
      fn(model.getDevicesSelection(lang))
    } else {
      lang(model.getDevicesSelection())
    }
    console.log('Sent devices selection grouped by type.')
  })
}
