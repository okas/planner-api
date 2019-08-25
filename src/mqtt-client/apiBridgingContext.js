import messageBus, { MQTT__CLEAR_SENDER_COMMANDS } from '../messageBus'

const sentCommands = new Map()

/**
 * @param {Map<string,object>} strategiesMap
 */
export default function registerBridge(client, strategiesMap) {
  bridgePublishes()

  client.on('connect', connAck => {
    if (!connAck.sessionPresent) {
      bridgeSubscriptions()
    }
  })

  client.on('message', (topic, payload) =>
    setImmediate(onMessage, topic, payload)
  )

  function bridgeSubscriptions() {
    strategiesMap.forEach(({ subscriptions }) => {
      if (!Array.isArray(subscriptions) && typeof subscriptions !== 'string') {
        client.subscribe(
          subscriptions.topics,
          subscriptions.options,
          console.log
        )
      } else {
        client.subscribe(subscriptions, console.log)
      }
    })
  }

  function bridgePublishes() {
    strategiesMap.forEach(({ publishCommands }) => {
      publishCommands.forEach((getStrategyPublishData, eventSymbol) => {
        messageBus.on(eventSymbol, eventPayload =>
          setImmediate(apiEventHandler, getStrategyPublishData, eventPayload)
        )
      })
    })
  }

  function apiEventHandler(getStrategyPublishData, { data, sender, done }) {
    const { topic, payload: pubPLoad, responseParser } = getStrategyPublishData(
      data,
      sanitizeSender(sender)
    )
    publishCommandFromApi(topic, pubPLoad, parseAndDone)

    function parseAndDone(respPLoad) {
      const data = responseParser ? responseParser(respPLoad) : respPLoad
      done(data)
    }
  }

  function publishCommandFromApi(topic, payload, doneCallBack) {
    client.publish(topic, payload, err => {
      if (err) {
        throw err
      } else {
        sentCommands.set(topic, doneCallBack)
      }
    })
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

  function devicePresentMessageHandler({ id, subtype, msgType }, payload) {
    const broadcastEvent = strategiesMap.get(subtype).apiBroadcasts.get(msgType)
    const eventPayload = {
      id,
      ...JSON.parse(payload.toString())
    }
    messageBus.emit(broadcastEvent, eventPayload)
  }

  function deviceLostMessageHandler({ id, subtype, msgType }) {
    const broadcastEvent = strategiesMap.get(subtype).apiBroadcasts.get(msgType)
    messageBus.emit(broadcastEvent, JSON.parse(id))
  }
}

/**
 * @param {string} topic of MQTT packet
 * @returns {object}
 */
function createTopicObject(topic) {
  const [
    ,
    type,
    subtype,
    id,
    output,
    msgType,
    command,
    senderInApi
  ] = topic.split('/')
  return {
    type,
    subtype,
    id,
    output,
    msgType,
    command,
    senderInApi
  }
}

function commandResponseHandler(topicObj, payload) {
  const commandTopic = createCommandTopic(topicObj)
  const doneCallBack = sentCommands.get(commandTopic)
  sentCommands.delete(commandTopic)
  if (doneCallBack) {
    doneCallBack(payload)
  } else {
    console.log(
      `MQTT: cannot pass command response, did't found sent command: "${commandTopic}"`
    )
  }
}

function createCommandTopic({
  type,
  subtype,
  id,
  output,
  command,
  senderInApi
}) {
  return `saartk/${type}/${subtype}/${id}/${output}/cmnd/${command}/${sanitizeSender(
    senderInApi
  )}`
}

messageBus.on(MQTT__CLEAR_SENDER_COMMANDS, sender => {
  setImmediate(clearSenderCommands, sender)
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
