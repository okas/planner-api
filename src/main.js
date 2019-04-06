import http from 'http'
import messageBus, { PERSISTENCE_READY } from './messageBus'
import './persistence'
import initApi from './api'
import initScheduler from './scheduler'

// Todo: retreive configurtion here
const port = 3000

messageBus.on(PERSISTENCE_READY, () => {
  /* Init internals  */

  const httpServer = http.createServer()
  initApi(httpServer)

  /* Run API server */

  httpServer.listen(port, err => {
    if (err) throw err
    console.info(`==> api is listening on [ *:${port} ]`)
  })

  console.info('||| planner-api init done')
})
