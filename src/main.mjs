import socketIO from 'socket.io'
import http from 'http'
import setBootstrap from './database'
import registerLampsEvents from './ioLamps'

/* Setup bootstrap, to cope with LokiJS async database loading. */
setBootstrap(main)

function main() {
  /* Init internals and retreive config */

  // Todo: retreive configurtion here
  const port = 3000
  const pingInterval = 3600000 // testing only!
  const socketIoConfig = {
    pingInterval: pingInterval || undefined
  }

  const httpServer = http.createServer()
  const io = new socketIO(httpServer, socketIoConfig)

  /* API definition: set up socekt.io sockets */

  io.on('connection', socket => {
    console.log(`|-> [ ${socket.id} ] : a user connected`)

    socket.emit('ok')

    socket.on('disconnect', () => {
      console.log(`>-| [ ${socket.id} ] : a user disconnected`)
    })

    registerLampsEvents(socket)
  })

  /* Run API server */

  httpServer.listen(port, err => {
    if (err) throw err
    console.info(`==> api is listening on [ *:${port} ]`)
  })

  console.info('||| planner-api init done')
}
