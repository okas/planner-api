import messageBus, { MQTT__CLEAR_SENDER_COMMANDS } from '../messageBus'

const sentCommands = new Map()

/**
 * @param {import('mqtt').MqttClient} client
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
    strategiesMap.forEach(({ type, publishCommands }) => {
      if (!publishCommands) {
        console.log(
          ` MQTT API Bridge: missing 'publishCommands' for strategy: '${type}'`
        )
        return
      }
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
        devicePresentHandler(topicObj, payload)
        break
      case 'lost':
        deviceLostHandler(topicObj)
        break
      case 'init':
        initHandler(topicObj, payload)
        break
      default:
        console.log('! received topic with unknown scheme: ', topic)
        break
    }
  }

  function devicePresentHandler({ id, subtype, msgType }, payload) {
    const { apiBroadcasts } = strategiesMap.get(subtype)
    if (!apiBroadcasts) {
      logMissingComponent('apiBroadcasts', subtype, msgType)
      return
    }
    const broadcastEvent = apiBroadcasts.get(msgType)
    const eventPayload = {
      id,
      ...JSON.parse(payload.toString())
    }
    messageBus.emit(broadcastEvent, eventPayload)
  }

  function deviceLostHandler({ id, subtype, msgType }) {
    const { apiBroadcasts } = strategiesMap.get(subtype)
    if (!apiBroadcasts) {
      logMissingComponent('apiBroadcasts', subtype, msgType)
      return
    }
    const broadcastEvent = apiBroadcasts.get(msgType)
    messageBus.emit(broadcastEvent, JSON.parse(id))
  }

  function initHandler({ id, subtype, msgType }, payload) {
    const asyncFn = strategiesMap.get(subtype).mqttInitHandler
    if (!asyncFn) {
      logMissingComponent('mqttInitHandler', subtype, msgType)
    }
    asyncFn(id, payload)
      .then(({ topic, payload: respPayload }) => {
        client.publish(topic, respPayload)
      })
      .catch(console.log)
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

function createCommandTopic({ type, subtype, id, command, senderInApi }) {
  return `saartk/${type}/${subtype}/${id}/cmnd/${command}/${sanitizeSender(
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

function logMissingComponent(component, subtype, msgType) {
  console.log(
    ` MQTT API Bridge: didn't found ${component} for ${subtype}/+/${msgType}!`
  )
}
