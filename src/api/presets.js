import { addPreset, getAll, getDevices } from '../models/presetsModel'

export default function registerPresetsEvents(socket) {
  socket.on('get-devices-selection', (lang, fn) => {
    if (typeof fn === 'function') {
      fn(getDevices(lang))
    } else {
      lang(getDevices())
    }
    console.log('Sent devices selection grouped by type and room.')
  })

  socket.on('presets-add', (preset, fn) => {
    const result = addPreset(preset)
    fn(result)
    console.log(
      !result.error
        ? `Sent added preset's id.`
        : `Sent error on adding new preset: [ ${JSON.stringify(result)} ]`
    )
  })

  socket.on('presets-get-all', fn => {
    fn(getAll())
    console.log('Sent all presets.')
  })
}
