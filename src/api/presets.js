import * as model from '../models/presetsModel'

export default function registerPresetsEvents(socket) {
  socket.on('presets-add', (preset, fn) => {
    const result = model.add(preset)
    fn(result)
    console.log(
      !result.error
        ? `Sent added preset's id.`
        : `Sent error on adding new preset: [ ${JSON.stringify(result)} ]`
    )
  })

  socket.on('preset-update', (preset, fn) => {
    const result = model.update(preset)
    fn(result)
    console.log(
      !result.error
        ? `Sent updated presets's status, was no errors.`
        : `Sent error on updating new preset: [ ${JSON.stringify(result)} ]`
    )
  })

  socket.on('preset-remove', (preset, fn) => {
    const result = model.remove(preset)
    fn(result)
    console.log(
      !result.error
        ? `Sent removed presets's status, was no errors.`
        : `Sent error on updating new preset: [ ${JSON.stringify(result)} ]`
    )
  })

  socket.on('presets-set-active', ({ id, active }, fn) => {
    const result = model.setActive(id, active)
    fn(result)
    console.log(
      !result.error
        ? `Sent state for set active change of preset, was no errors.`
        : `Sent error on setting new active state: [ ${JSON.stringify(
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
