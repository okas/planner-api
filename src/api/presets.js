import { getDevices } from '../models/presetsModel'

export default function registerPresetsEvents(socket) {
  socket.on('get-devices-selection', fn => {
    fn(getDevices())
    console.log('sending devices grouped by type, then rooms.')
  })
}
