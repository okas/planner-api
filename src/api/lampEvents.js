import * as model from '../models/lampModel'

export default function registerLampsEvents(socket) {
  socket.on('lamp__get-all', fn => {
    fn(model.getGroupedLamps())
    console.log('sending lamps grouped by rooms.')
  })

  socket.on('lamp__add', (lamp, fn) => {
    let result = model.add(lamp)
    fn(result)
    console.log(
      result.errors
        ? `Sent errors on adding new lamp: [ ${JSON.stringify(result)} ]`
        : `Sent added lamps's id.`
    )
  })

  socket.on('lamp__update', (lamp, fn) => {
    const result = model.update(lamp)
    fn(result)
    console.log(
      !result.errors
        ? `Sent updated lamp's status, was no errors.`
        : `Sent errors on updating lamp: [ ${JSON.stringify(result)} ]`
    )
  })

  socket.on('lamp__remove', (lampId, fn) => {
    const result = model.remove(lampId)
    fn(result)
    console.log(
      !result.errors
        ? `Sent removed lamp's status, was no errors.`
        : `Sent errors on removing lamp: [ ${JSON.stringify(result)} ]`
    )
  })

  socket.on('lamp__get-dependent-presets', (lampId, fn) => {
    const result = model.getDependendtPresets(lampId)
    fn(result)
    console.log("sending lamp's dependent presets")
  })
}
