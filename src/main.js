import http from 'http'
import './persistence'
import initApi from './api'
import messageBus from './messageBus'

// Todo: retreive configurtion here
const port = 3000

messageBus.on('persistence:ready', () => {
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
