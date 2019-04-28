import messageBus, { MQTT__CLEAR_SENDER_COMMANDS } from '../messageBus'

/**
 * @param {SocketIO.Socket} socket conection from browser
 */
export default function registerCommonEvents(socket) {
  console.log(`|-> [ ${socket.id} ] : a user connected`)

  socket.on('disconnecting', reason => {
    messageBus.emit(MQTT__CLEAR_SENDER_COMMANDS, socket.id)
  })

  socket.on('disconnect', () => {
    console.log(`>-| [ ${socket.id} ] : a user disconnected`)
  })

  socket.on('api__join_rooms', (rooms, fn) => {
    socket.join(rooms, err => {
      if (fn) {
        fn(createResponse(err))
      }
      console.log(
        err
          ? `>-- [ ${socket.id} ] : failed to joined to rooms "${rooms}"`
          : `>-> [ ${socket.id} ] : joined to rooms "${rooms}"`
      )
    })
  })

  socket.on('api__leave_rooms', (rooms, fn) => {
    socket.leave(rooms, err => {
      if (fn) {
        fn(createResponse(err))
      }
      console.log(
        err
          ? `--< [ ${socket.id} ] : failed to leave from rooms "${rooms}"`
          : `<-< [ ${socket.id} ] : leaved from rooms "${rooms}"`
      )
    })
  })
}

function createResponse(err) {
  let response = { status: '' }
  if (err) {
    response.status = 'failed'
    response.erros = [err]
  } else {
    response.status = 'ok'
  }
  return response
}
