import http from 'http'
import initApi from './api'
import setBootstrap from './database'

// Todo: retreive configurtion here
const port = 3000

/* Setup bootstrap, to cope with LokiJS async database loading. */
setBootstrap(main)

function main() {
  /* Init internals  */

  const httpServer = http.createServer()
  initApi(httpServer)

  /* Run API server */

  httpServer.listen(port, err => {
    if (err) throw err
    console.info(`==> api is listening on [ *:${port} ]`)
  })

  console.info('||| planner-api init done')
}
