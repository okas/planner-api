import SocketIOClient from 'socket.io'
import http from 'http'
import setBootstrap from './database'
import registerLampsEvents from './ioLamps'

/* Setup bootstrap, to cope with LokiJS async database loading. */
setBootstrap(main)

function main() {
  /* Init internals and retreive config */

  // Todo: retreive configurtion here
  const port = 3000
  const socketIoConfig = {
    pingInterval: 3600000 || undefined // testing only!
  }

  const httpServer = http.createServer()
  const io = new SocketIOClient(httpServer, socketIoConfig)

  /* API definition: set up socekt.io sockets */

  io.on('connect', socket => {
    console.log(`|-> [ ${socket.id} ] : a user connected`)
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
