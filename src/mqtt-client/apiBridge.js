import messageBus, { MQTT__CLEAR_SENDER_COMMANDS } from '../messageBus'
import {
  lampCommands,
  lampSubscriptions,
  type as lampType,
  lampBroadcasts
} from './lampMqtt'
import {
  blindCommands,
  blindSubscriptions,
  type as blindType,
  blindBroadcasts
} from './blindMqtt'

const sentCommands = new Map()
const broadcasts = new Map()

export default function registerBridge(client) {
  /* Add broadcasts here */
  broadcasts.set(lampType, lampBroadcasts)
  broadcasts.set(blindType, blindBroadcasts)
  /* Add publishers here */
  bridgePublishes(lampCommands)
  bridgePublishes(blindCommands)

  client.on('connect', connAck => {
    if (!connAck.sessionPresent) {
      /* Add subscriptions here */
      bridgeSubscriptions(lampSubscriptions)
      bridgeSubscriptions(blindSubscriptions)
    }
  })

  client.on('message', onMessage)

  /**
   * @param {Map<symbol,function>} commandsMap
   */
  function bridgePublishes(commandsMap) {
    commandsMap.forEach((getPublishArgs, eventSymbol) => {
      messageBus.on(eventSymbol, eventPayload =>
        setImmediate(apiEventHandler, getPublishArgs, eventPayload)
      )
    })
  }

  function apiEventHandler(getArgs, eventPayload) {
    const publishArgs = getArgs(
      eventPayload.data,
      sanitizeSender(eventPayload.sender)
    )
    publishCommandFromApi(publishArgs, eventPayload)
  }

  function publishCommandFromApi({ topic, payload }, eventPayload) {
    client.publish(topic, payload, err => {
      if (err) {
        throw err
      } else {
        sentCommands.set(topic, eventPayload.done)
      }
    })
  }

  function bridgeSubscriptions(subscriptions) {
    subscriptions.forEach(subs => {
      if (typeof subs === 'object') {
        client.subscribe(subs.topics, subs.options, console.log)
      } else {
        client.subscribe(subs, console.log)
      }
    })
  }
}

/**
 * @param {String} topic
 * @param {Buffer} payload
 */
function onMessage(topic, payload) {
  const topicObj = createTopicObject(topic)
  if (topicObj.type !== 'device') {
    return
  }
  switch (topicObj.msgType) {
    case 'resp':
      commandResponseHandler(topicObj, payload)
      break
    case 'present':
      devicePresentMessageHandler(topicObj, payload)
      break
    case 'lost':
      deviceLostMessageHandler(topicObj)
      break
    default:
      break
  }
}

/**
 * @param {string} topic of MQTT packet
 * @returns {object}
 */
function createTopicObject(topic) {
  const [, type, subtype, id, msgType, command, senderInApi] = topic.split('/')
  return {
    type,
    subtype,
    id,
    msgType,
    command,
    senderInApi
  }
}

function commandResponseHandler(topicObj, payload) {
  const commandTopic = createCommandTopic(topicObj)
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

function createCommandTopic({ type, subtype, id, command, senderInApi }) {
  return `saartk/${type}/${subtype}/${id}/cmnd/${command}/${sanitizeSender(
    senderInApi
  )}`
}

function devicePresentMessageHandler({ id, subtype, msgType }, payload) {
  const broadcastEvent = broadcasts.get(subtype).get(msgType)
  const eventPayload = {
    id: JSON.parse(id),
    ...JSON.parse(payload.toString())
  }
  messageBus.emit(broadcastEvent, eventPayload)
}

function deviceLostMessageHandler({ id, subtype, msgType }) {
  const broadcastEvent = broadcasts.get(subtype).get(msgType)
  messageBus.emit(broadcastEvent, JSON.parse(id))
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
