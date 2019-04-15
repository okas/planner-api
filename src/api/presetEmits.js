import messageBus, { PRESET__UPDATED_DEVICE_DELETED } from '../messageBus'

const room = 'preset'

/**
 *  SocketIO broadcaster. Uses `{messageBus}` module to listen events from app.
 *  @param {SocketIO.Server} io
 */
export default function(io) {
  const ioRoom = io.to(room)

  function getLogPrefix() {
    return `[ API: presetEmitter ], room "${room}" : `
  }

  messageBus.on(PRESET__UPDATED_DEVICE_DELETED, preset => {
    ioRoom.emit('preset__api_update', preset)
    // ToDo receive and pass amy error infor of model/database?
    console.log(`${getLogPrefix()}Sent updated presets's status, no errors.`)
  })
}
