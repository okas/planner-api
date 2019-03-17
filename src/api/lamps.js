import * as model from '../models/lampsModel'

export default function registerLampsEvents(socket) {
  socket.on('get-all-room_lamps', fn => {
    fn(model.getGroupedLamps())
    console.log('sending lamps grouped by rooms.')
  })

  socket.on('lamp-add', (lamp, fn) => {
    let result = model.lampAdd(lamp)
    fn(result)
    console.log(
      result.errors
        ? `Sent error on adding new lamp: [ ${JSON.stringify(result)} ]`
        : `Sent added lamps's id.`
    )
  })
}
