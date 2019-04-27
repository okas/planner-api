import messageBus, { MQTT__CLEAR_SENDER_COMMANDS } from '../messageBus'
import { lampCommands, lampSubscriptions } from './lampMqtt'

const sentCommands = new Map()

export default function registerBridge(client) {
  /* Add publishers here */
  bridgePublishes(client, lampCommands)
  client.on('connect', connAck => {
    /* Add subscriptions here */
    bridgeSubscriptions(client, lampSubscriptions)
  })
  client.on('message', messageHandler)
}

/**
 * @param {Map<symbol,function>} commandsMap
 */
function bridgePublishes(client, commandsMap) {
  commandsMap.forEach((getArgs, eventSymbol) => {
    messageBus.on(eventSymbol, eventPayload =>
      setImmediate(apiEventHandler, client, getArgs, eventPayload)
    )
  })
}

function apiEventHandler(client, getArgs, eventPayload) {
  const publishArgs = getArgs(
    eventPayload.data,
    sanitizeSender(eventPayload.sender)
  )
  publishCommandFromApi(client, publishArgs, eventPayload)
}

function publishCommandFromApi(client, { topic, payload }, eventPayload) {
  client.publish(topic, payload, err => {
    if (err) {
      throw err
    } else {
      sentCommands.set(topic, eventPayload.done)
    }
  })
}

function bridgeSubscriptions(client, subscriptions) {
  subscriptions.forEach(subs => {
    if (typeof subs === 'object') {
      client.subscribe(subs.topics, subs.options, console.log)
    } else {
      client.subscribe(subs, console.log)
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
