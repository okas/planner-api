import { getDevices } from '../models/presetsModel'

export default function registerPresetsEvents(socket) {
  socket.on('get-devices-selection', (lang, fn) => {
    if (typeof fn === 'function') {
      fn(getDevices(lang))
    } else {
      lang(getDevices())
    }
    console.log('sending devices grouped by type, then rooms.')
  })
}
