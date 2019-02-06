import * as model from '../models/blindsModel'

export default function registerWindowsBlindEvents(socket) {
  socket.on('get-all-room_blinds', fn => {
    fn(model.getGroupedBlinds())
    console.log('sending blinds grouped by rooms.')
  })

  socket.on('blinds-add', (blind, room, fn) => {
    let blindObj = model.blindsAdd(blind, room)
    console.log(`created: ${JSON.stringify(blindObj)}`)
    fn(blindObj)
  })
}
