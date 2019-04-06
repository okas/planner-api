import * as model from '../models/presetsModel'

export default function registerPresetsEvents(socket) {
  socket.on('presets-add', (preset, fn) => {
    const result = model.add(preset)
    fn(result)
    console.log(
      !result.errors
        ? `Sent added preset's id.`
        : `Sent errors on adding new preset: [ ${JSON.stringify(result)} ]`
    )
  })

  socket.on('preset-update', (preset, fn) => {
    const result = model.update(preset)
    fn(result)
    console.log(
      !result.errors
        ? `Sent updated presets's status, was no errors.`
        : `Sent errors on updating preset: [ ${JSON.stringify(result)} ]`
    )
  })

  socket.on('preset-remove', (presetId, fn) => {
    const result = model.remove(presetId)
    fn(result)
    console.log(
      !result.errors
        ? `Sent removed presets's status, was no errors.`
        : `Sent errors on removing preset: [ ${JSON.stringify(result)} ]`
    )
  })

  socket.on('presets-set-active', ({ id, active }, fn) => {
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

  socket.on('presets-get-all', fn => {
    fn(model.getAll())
    console.log('Sent all presets.')
  })

  // Verify is it necessary expect that fn is moved- argument order if data is not given?
  socket.on('presets-get-devices-selection', (lang, fn) => {
    if (typeof fn === 'function') {
      fn(model.getDevicesSelection(lang))
    } else {
      lang(model.getDevicesSelection())
    }
    console.log('Sent devices selection grouped by type.')
  })
}