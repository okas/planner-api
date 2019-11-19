import mqtt from 'mqtt'
import messageBus, {
  MQTT__CLIENT_READY,
  MQTT__CLIENT_LOST
} from '../messageBus'
import registerBridgeContext from './apiBridgingContext'
import lampStrategy from './lampMqttStrategy'
import blindStrategy from './blindMqttStrategy'
import iotnodeMqttStrategy from './iotnodeMqttStrategy'
import { serverTypeBase } from './utilities'

const strategiesMap = new Map()

/* Add imported strategies to arguments */
setupStrategyMaps([lampStrategy, blindStrategy, iotnodeMqttStrategy])

function setupStrategyMaps(strategies) {
  strategies.forEach(s => {
    strategiesMap.set(s.type, s)
  })
}

export default function initMqtt() {
  const client = mqtt.connect('mqtt://broker.hivemq.com:1883', {
    resubscribe: true,
    clientId: 'api'
  })

  client.on('end', () => messageBus.emit(MQTT__CLIENT_LOST))

  client.on('offline', () => messageBus.emit(MQTT__CLIENT_LOST))

  client.on('message', logMessage)

  client.on('connect', ack => {
    console.log(`connect connaACK:`, ack)
    if (ack.returnCode !== 0) {
      /* If returnCode !== 0, then connection is made, but sometinh in broker got wrong:
       * authentication, internal error, bad request, etc
       */
      setTimeout(() => client.reconnect(), 2000)
      return
    }
    client.publish(
      `${serverTypeBase}/present`,
      `hello, at @${Date()}`,
      console.log
    )
    messageBus.emit(MQTT__CLIENT_READY)
  })

  registerBridgeContext(client, strategiesMap)
}

function logMessage(topic, payload, packet) {
  console.log('>>>>>')
  console.log(`payload: "${payload}"`)
  console.log(packet)
  console.log('<<<<<')
}
