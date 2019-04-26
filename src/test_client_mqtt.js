import mqtt from 'mqtt'

/**
 * Client registry and initial states.
 */
const clientStateStore = {
  'lamp/61': 1,
  'lamp/62': 0
  // 'lamp/63': 0,
  // 'lamp/64': 1,
  // 'lamp/65': 0,
  // 'lamp/66': 1
}

Object.keys(clientStateStore).forEach(clientId => {
  const client = mqtt.connect('mqtt://broker.hivemq.com:1883', {
    clientId
  })
  client.on('message', (topic, payload, packet) => {
    logOnMessage(clientId, payload, packet)
    messageHandler(client, clientId, topic, payload)
  })
  client.on('connect', ack => conneAck(client, clientId, ack))
})

function logOnMessage(clientId, payload, packet) {
  console.log('>>>>>')
  console.log(`payload: "${payload}"`)
  console.log(` => for ${clientId} : `, packet)
  console.log('<<<<<')
}

function conneAck(client, clientId, ack) {
  console.log(`connect connaACK:`, ack)
  client.publish(
    `saartk/greeting/${clientId}`,
    `hello, at @${Date()}`,
    console.log
  )
  client.subscribe(`saartk/greeting/api`, console.log)
  client.subscribe(`saartk/device/${clientId}/cmnd/+/+`, console.log)
}

/**
 * @param {mqtt.MqttClient} client
 * @param {string} topic
 * @param {Buffer} payload
 */
function messageHandler(client, clientId, topic, payload) {
  const [, , , , , command, sender] = topic.split('/')
  const responseTopic = `saartk/device/${clientId}/resp/${command}/${sanitizeSender(
    sender
  )}`
  console.log(`responseTopic:`, responseTopic)
  switch (command) {
    case 'set-state':
      clientStateStore[clientId] = JSON.parse(payload.toString()) // "Do work" part
    // eslint-disable-next-line no-fallthrough
    case 'state':
      respondState(client, responseTopic, clientId)
      break
    default:
      break
  }
}

function sanitizeSender(sender) {
  return sender || sender === false ? sender : ''
}

function respondState(client, responseTopic, clientId) {
  client.publish(
    responseTopic,
    clientStateStore[clientId].toString(),
    console.log
  )
}
