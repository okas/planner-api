import mqtt from 'mqtt'
import { getTopicBaseDevice, serverTypeBase } from './mqtt-client/utilities'

/**
 * Client registry and initial states.
 */
const clientStateStore = {
  'lamp/6529777472840401000': 0.0,
  'lamp/6529777590750675000': 1.0,
  'blind/6529777716835647000': 1.0,
  'blind/6529777749580579000': 0.33
}

Object.keys(clientStateStore).forEach(clientId => {
  const client = mqtt.connect('mqtt://broker.hivemq.com:1883', {
    clientId,
    will: {
      topic: `${getTopicBaseDevice(clientId)}/lost`,
      payload: null,
      qos: 0,
      retain: false
    }
  })
  client.on('message', (topic, payload, packet) => {
    logOnMessage(clientId, payload, packet)
    messageHandler(client, clientId, topic, payload)
  })
  client.on('connect', ack => onConnect(client, clientId, ack))
})

function logOnMessage(clientId, payload, packet) {
  console.log(`~ ~ ~ ~ ~ ~ ~ ~`)

  console.log(`Date time: `, Date())
  console.log('>>>>>')
  console.log(`payload: "${payload}"`)
  console.log(` => for ${clientId} : `, packet)
  console.log('<<<<<')
}

/**
 *
 * @param {mqtt.MqttClient} client
 * @param {string} clientId
 * @param {any} ack
 */
function onConnect(client, clientId, ack) {
  console.log(`connect connaACK:`, ack)
  const payload = {
    state: clientStateStore[clientId],
    timestamp: Date.now()
  }
  client.publish(
    `${getTopicBaseDevice(clientId)}/present`,
    JSON.stringify(payload),
    console.log
  )
  client.subscribe(`${serverTypeBase}/present`, console.log)
  client.subscribe(`${getTopicBaseDevice(clientId)}/cmnd/+/+`, console.log)
}

/**
 * @param {mqtt.MqttClient} client
 * @param {string | number} clientId
 * @param {string} topic
 * @param {Buffer} payload
 */
function messageHandler(client, clientId, topic, payload) {
  const [, , , , , command] = topic.split('/')
  const responseTopic = topic.replace('/cmnd/', '/resp/')
  console.log(`responseTopic:`, responseTopic)
  switch (command) {
    case 'set-state':
      clientStateStore[clientId] =
        payload && JSON.parse(payload.toString() || null) // "Do work" part
    // eslint-disable-next-line no-fallthrough
    case 'state':
      break
    default:
      return
  }
  respondState(client, responseTopic, clientId)
}

/**
 * @param {mqtt.MqttClient} client
 * @param {string} responseTopic
 * @param {string | number} clientId
 */
function respondState(client, responseTopic, clientId) {
  console.log(
    `~ ~ ~ responseState(): JSON.stringify(clientStateStore[${clientId}]): ${JSON.stringify(
      clientStateStore[clientId]
    )}`
  )
  client.publish(
    responseTopic,
    JSON.stringify(clientStateStore[clientId]),
    console.log
  )
}
