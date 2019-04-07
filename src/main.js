import http from 'http'
import messageBus, { PERSISTENCE__READY } from './messageBus'
import './persistence'
import initApi from './api'
import initScheduler from './presetScheduler'

// Todo: retreive configurtion here
const port = 3000

messageBus.on(PERSISTENCE__READY, () => {
  /* Init internals  */

  const httpServer = http.createServer()
  initApi(httpServer)

  /* Run Scheduler */

  initScheduler()

  /* Run API server */

  httpServer.listen(port, err => {
    if (err) throw err
    console.info(`==> api is listening on [ *:${port} ]`)
  })

  console.info('||| planner-api init done')
})
