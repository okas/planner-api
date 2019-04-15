import messageBus, { PRESET__UPDATED_DEVICE_DELETED } from '../messageBus'

/**
 *  SocketIO broadcaster. Uses `{messageBus}` module to listen events from app.
 *  @param {SocketIO.Server} io
 */
export default function(io) {
  const ioRoom = io.to('preset')

  messageBus.on(PRESET__UPDATED_DEVICE_DELETED, preset => {
    ioRoom.emit('preset__api_update', preset)
  })
}
