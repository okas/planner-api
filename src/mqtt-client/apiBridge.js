import messageBus, { MQTT__CLEAR_SENDER_COMMANDS } from '../messageBus'
import lampCommands from './lampCommands'

const sentCommands = new Map()

export default function registerBridge(client) {
  /* Import and then iterate all command objects here */
  Object.getOwnPropertySymbols(lampCommands).forEach(sym => {
    messageBus.on(sym, event => {
      setImmediate(bridgePublisher, client, sym, event)
    })
  })
  client.on('message', messageHandler)
}

function bridgePublisher(client, sym, eventArgs) {
  const { topic, payload } = lampCommands[sym](
    eventArgs.data,
    sanitizeSender(eventArgs.sender)
  )
  client.publish(topic, payload, err => {
    if (err) {
      throw err
    } else {
      sentCommands.set(topic, eventArgs.done)
    }
  })
}

/**
 * @param {String} topic
 * @param {Buffer} payload
 */
function messageHandler(topic, payload) {
  // it is called on both times: publish from this client and receive message from broker !?
  const [, type, subtype, id, msgType, command, senderInApi] = topic.split('/')
  if (type === 'device' && msgType === 'resp') {
    const commandTopic = `saartk/${type}/${subtype}/${id}/cmnd/${command}/${sanitizeSender(
      senderInApi
    )}`
    let doneCallBack = sentCommands.get(commandTopic)
    sentCommands.delete(commandTopic)
    if (doneCallBack) {
      doneCallBack(JSON.parse(payload.toString()))
    } else {
      console.log(
        `MQTT: cannot pass command response, did't found sent command: "${commandTopic}"`
      )
    }
  }
}

messageBus.on(MQTT__CLEAR_SENDER_COMMANDS, sender => {
  setImmediate(() => clearSenderCommands(sender))
})

function clearSenderCommands(sender) {
  const toDelete = []
  sentCommands.forEach((v, k) => {
    if (k.endsWith(sender)) {
      toDelete.push(k)
    }
  })
  toDelete.forEach(c => sentCommands.delete(c))
}

function sanitizeSender(sender) {
  return sender || sender === false ? sender : ''
}
