import mqtt from 'mqtt'

/**
 * Client registry and initial states.
 */
const clientStateStore = {
  'lamp/6529777472840401000': [0.0, 1.0],
  'lamp/6529777590750675000': [1.0, 0.0],
  'blind/6529777716835647000': [1.0],
  'blind/6529777749580579000': [0.33]
}

Object.keys(clientStateStore).forEach(clientId => {
  const client = mqtt.connect('mqtt://broker.hivemq.com:1883', {
    clientId,
    will: {
      topic: `saartk/device/${clientId}/lost`,
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
  console.log('>>>>>')
  console.log(`payload: "${payload}"`)
  console.log(` => for ${clientId} : `, packet)
  console.log('<<<<<')
}

function onConnect(client, clientId, ack) {
  console.log(`connect connaACK:`, ack)
  const payload = {
    outputs: clientStateStore[clientId].map((s, i) => ({ [i]: s }))
  }
  client.publish(
    `saartk/device/${clientId}/present`,
    JSON.stringify(payload),
    console.log
  )
  client.subscribe(`saartk/api/present`, console.log)
  for (let i = 0; i < clientStateStore[clientId].length; i++) {
    client.subscribe(
      `saartk/device/${clientId}/${i}/cmnd/set-state/+`,
      console.log
    )
    client.subscribe(`saartk/device/${clientId}/${i}/cmnd/state/+`, console.log)
  }
}

/**
 * @param {mqtt.MqttClient} client
 * @param {string} topic
 * @param {Buffer} payload
 */
function messageHandler(client, clientId, topic, payload) {
  const [, , , , rawOutput, , command] = topic.split('/')
  const output = Number.parseInt(rawOutput)
  if (Number.isNaN(output)) {
    return
  }
  switch (command) {
    case 'set-state':
      clientStateStore[clientId][output] = payload.readFloatLE(0) // "Do work" part
      console.log('in (1)"', command, '" output is: ', output)
    // eslint-disable-next-line no-fallthrough
    case 'state':
      console.log('in (2)"', command, '" output is: ', output)
      const responseTopic = topic.replace('/cmnd/', '/resp/')
      console.log(`responseTopic:`, responseTopic)
      respondState(client, responseTopic, clientId, output)
  }
}

function respondState(client, responseTopic, clientId, output) {
  client.publish(
    responseTopic,
    Buffer.from(Float32Array.from([clientStateStore[clientId][output]]).buffer),
    console.log
  )
}
