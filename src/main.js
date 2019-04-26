import http from 'http'
import messageBus, {
  PERSISTENCE__READY,
  MQTT__CLIENT_READY
} from './messageBus'
import './persistence'
import initApi from './api-socket.io'
import initScheduler from './presetScheduler'
import initMqtt from './mqtt-client'

console.info('>>> planner-api init start')
// Todo: retreive configurtion here
const port = 3000

messageBus.once(PERSISTENCE__READY, () => {
  /* Init internals  */

  const httpServer = http.createServer()
  initApi(httpServer)
  messageBus.once(MQTT__CLIENT_READY, initScheduler)
  initMqtt()

  /* Run API server */

  httpServer.listen(port, err => {
    if (err) throw err
    console.info(`==> api-socket.io is listening on [ *:${port} ]`)
  })

  console.info('||| planner-api init done')
})
