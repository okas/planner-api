import * as model from '../models/blindModel'

export default function registerWindowsBlindEvents(socket) {
  socket.on('blind__get_all', fn => {
    fn(model.getGroupedBlinds())
    console.log('sending blinds grouped by rooms.')
  })

  socket.on('blind__add', (blind, fn) => {
    let result = model.add(blind)
    fn(result)
    console.log(
      result.errors
        ? `Sent errors on adding new blind: [ ${JSON.stringify(result)} ]`
        : `Sent added lamps's id.`
    )
  })

  socket.on('blind__update', (blind, fn) => {
    const result = model.update(blind)
    fn(result)
    console.log(
      !result.errors
        ? `Sent updated blind's status, was no errors.`
        : `Sent errors on updating blind: [ ${JSON.stringify(result)} ]`
    )
  })

  socket.on('blind__remove', (blindId, fn) => {
    const result = model.remove(blindId)
    fn(result)
    console.log(
      !result.errors
        ? `Sent removed blind's status, was no errors.`
        : `Sent errors on removing blind: [ ${JSON.stringify(result)} ]`
    )
  })

  socket.on('lamp__get-dependent-presets', (blindId, fn) => {
    const result = model.getDependendtPresets(blindId)
    fn(result)
    console.log("sending blind's dependent presets.")
  })
}
