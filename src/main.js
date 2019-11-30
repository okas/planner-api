import http from 'http'
import messageBus, {
  PERSISTENCE__READY,
  MQTT__CLIENT_READY
} from './messageBus'
import './persistence'
import initScheduler from './presetScheduler'
import initMqtt from './mqtt-client'
import initWsServer from './ws-server'

console.info('>>> planner-api init start')
// Todo: retreive configurtion here
const port = 3000

messageBus.once(PERSISTENCE__READY, () => {
  /* Init internals  */

  const httpServer = http.createServer()
  initWsServer(httpServer)
  messageBus.once(MQTT__CLIENT_READY, initScheduler)
  initMqtt()

  /* Run API server */

  httpServer.listen(port, err => {
    if (err) {
      throw err
    }
    console.info(`==> Socket.IO API is listening on [ *:${port} ]`)
  })

  console.info('||| planner-api init done')
})
