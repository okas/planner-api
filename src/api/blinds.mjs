import { transformToRoomGroupedObj, blindsAdd } from '../models/blindsModel'

export default function registerWindowsBlindEvents(socket) {
  socket.on('get-all-room_blinds', fn => {
    fn(transformToRoomGroupedObj())
    console.log('sending blinds grouped by rooms.')
  })
  socket.on('blinds-add', (blind, room, fn) => {
    let blindObj = blindsAdd(blind, room)
    console.log(`created: ${JSON.stringify(blindObj)}`)
    fn(blindObj)
  })
}
