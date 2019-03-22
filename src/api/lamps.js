import * as model from '../models/lampsModel'

export default function registerLampsEvents(socket) {
  socket.on('get-all-room_lamps', fn => {
    fn(model.getGroupedLamps())
    console.log('sending lamps grouped by rooms.')
  })

  socket.on('lamp-add', (lamp, fn) => {
    let result = model.add(lamp)
    fn(result)
    console.log(
      result.errors
        ? `Sent errors on adding new lamp: [ ${JSON.stringify(result)} ]`
        : `Sent added lamps's id.`
    )
  })

  socket.on('lamp-update', (lamp, fn) => {
    const result = model.update(lamp)
    fn(result)
    console.log(
      !result.errors
        ? `Sent updated lamp's status, was no errors.`
        : `Sent errors on updating new lamp: [ ${JSON.stringify(result)} ]`
    )
  })
}
