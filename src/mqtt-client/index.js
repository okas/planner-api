import mqtt from 'mqtt'
import messageBus, { MQTT__CLIENT_READY } from '../messageBus'
import registerBridge from './apiBridge'

export default function initMqtt() {
  const client = mqtt.connect('mqtt://broker.hivemq.com:1883', {
    resubscribe: true,
    clientId: 'api'
  })
  client.on('message', logMessage)
  client.on('connect', connAck => onConnect(client, connAck))
  registerBridge(client)
}

function logMessage(topic, payload, packet) {
  console.log('>>>>>')
  console.log(`payload: "${payload}"`)
  console.log(packet)
  console.log('<<<<<')
}

function onConnect(client, connAck) {
  console.log(`connect connaACK:`, connAck)
  // Todo this is one place where event can be emitted
  // to set up socket.io related init.
  if (connAck.returnCode !== 0) {
    // ToDo reliable connection problem handling should involve more events than connect.
    setTimeout(() => client.reconnect(), 2000)
    return
  }
  client.publish('saartk/greeting/api', `hello, at @${Date()}`, console.log)
  client.subscribe('saartk/greeting/device/+/+', console.log)

  // Todo analyze right time for ready notify
  messageBus.emit(MQTT__CLIENT_READY, client)
}
