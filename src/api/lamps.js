import * as model from '../models/lampsModel'

export default function registerLampsEvents(socket) {
  socket.on('get-all-room_lamps', fn => {
    fn(model.getGroupedLamps())
    console.log('sending lamps grouped by rooms.')
  })

  socket.on('lamps-add', (lamp, room, fn) => {
    let lampObj = model.lampAdd(lamp, room)
    console.log(`created: ${JSON.stringify(lampObj)}`)
    fn(lampObj)
  })
}
