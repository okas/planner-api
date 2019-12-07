import messageBus, { MQTT__CLEAR_SENDER_COMMANDS } from '../messageBus'
import { stringIsEmptyOrWhiteSpace } from '../utilities'

/**
 * @param {SocketIO.Socket} socket conection from browser
 */
export default function registerApiEventsCommon(socket) {
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
          ? `>-- [ ${socket.id} ] : failed to joined to rooms "${rooms}", because of errors: ${err}`
          : `>-> [ ${socket.id} ] : joined to rooms "${rooms}"`
      )
    })
  })

  socket.on('api__leave_rooms', (rooms, fn) => {
    let workerPromise
    if (Array.isArray(rooms)) {
      workerPromise = Promise.allSettled(rooms.map(leaveRoom))
    } else if (!stringIsEmptyOrWhiteSpace(rooms)) {
      workerPromise = Promise.allSettled(leaveRoom(rooms))
    } else {
      if (fn) {
        fn(createResponse('no rooms given to leave'))
      }
      console.log(`--< [ ${socket.id} ] : no rooms given to leave`)
    }
    workerPromise.then(getLeaveRoomResultHandler(socket.id, rooms, fn))
  })

  /**
   * @param {string} room
   */
  function leaveRoom(room) {
    return new Promise(resolve => {
      socket.leave(room, err => resolve({ room, err }))
    })
  }
}

/**
 * @param {string } socketId
 * @param {string | string[]} rooms
 * @param {(arg0: object) => void} fn
 */
function getLeaveRoomResultHandler(socketId, rooms, fn) {
  return workResults => {
    const results = workResults.map(({ value }) => value)
    const hasErrors = results.some(({ err }) => !!err)
    if (fn) {
      fn(createResponse(hasErrors ? results : null))
    }
    console.log(
      hasErrors
        ? `--< [ ${socketId} ] : failed to leave from rooms "${rooms}", because of errors: ${results}`
        : `<-< [ ${socketId} ] : leaved from rooms "${rooms}"`
    )
  }
}

function createResponse(err) {
  const response = { status: '' }
  if (err) {
    response.status = 'failed'
    response.erros = [err]
  } else {
    response.status = 'ok'
  }
  return response
}
