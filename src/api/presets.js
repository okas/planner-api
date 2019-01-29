import { getDevices, addPreset } from '../models/presetsModel'

export default function registerPresetsEvents(socket) {
  socket.on('get-devices-selection', (lang, fn) => {
    if (typeof fn === 'function') {
      fn(getDevices(lang))
    } else {
      lang(getDevices())
    }
    console.log('sending devices grouped by type, then rooms.')
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
}
