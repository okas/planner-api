export default function registerCommonEvents(socket) {
  console.log(`|-> [ ${socket.id} ] : a user connected`)
  socket.on('disconnecting', reason => {})
  socket.on('disconnect', () => {
    console.log(`>-| [ ${socket.id} ] : a user disconnected`)
  })

  socket.on('api__join_room', (room, fn) => {
    socket.join(room, err => {
      if (fn) {
        fn(createResponse(err))
      }
      console.log(
        err
          ? `>-- [ ${socket.id} ] : failed to joined to room "${room}"`
          : `>-> [ ${socket.id} ] : joined to room "${room}"`
      )
    })
  })

  socket.on('api__leave_room', (room, fn) => {
    socket.leave(room, err => {
      if (fn) {
        fn(createResponse(err))
      }
      console.log(
        err
          ? `--< [ ${socket.id} ] : failed to leave from room "${room}"`
          : `<-< [ ${socket.id} ] : leaved from room "${room}"`
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
