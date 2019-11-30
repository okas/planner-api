import messageBus, { MQTT__CLEAR_SENDER_COMMANDS } from '../messageBus'
import {
  logMissingCommandResponse,
  logMissingComponent,
  logMissingGeneric
} from './logHelpers'
import { createTopicObject, getBaseTopic } from './utilities'

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

  /**
   * Bridges `mqtt-client` strateges' 'publishCommands' to `messageBus`,
   * so it can respond to certiain pre-agreed events.
   */
  function bridgePublishes() {
    strategiesMap.forEach(({ type, publishCommands }) => {
      if (!publishCommands) {
        logMissingGeneric('publishCommands', `strategy: '${type}'`)
        return
      }
      publishCommands.forEach(preparePublishCommands)
    })
  }

  /**
   * Set up Publish Commands in a way that that `mqtt-client` will react on certain `api-server` Events.
   * @param {{(data: string, sender: string): { topic: string, payload: string | Buffer, responseParser:(responsePayload: Buffer)=>string}}} getStrategyPublishData generates data to pulish with MQTT.
   * @param {symbol} eventSymbol Event in that `messageBus`.
   */
  function preparePublishCommands(getStrategyPublishData, eventSymbol) {
    messageBus.on(eventSymbol, eventPayload =>
      setImmediate(apiEventHandler, getStrategyPublishData, eventPayload)
    )
  }

  /**
   * @param {(data: string, sender: string) => { topic: string, payload: string | Buffer, responseParser:function}} getStrategyPublishData
   * @param {{data: string; sender: string | boolean; done: (payload: Buffer | *) => void}} apiEventPayload
   *  This enables asyn two-way communication between `aspi-server` and `mqtt-client`.
   */
  function apiEventHandler(getStrategyPublishData, { data, sender, done }) {
    const { topic, payload, responseParser } = getStrategyPublishData(
      data,
      sanitizeSender(sender)
    )
    client.publish(topic, payload, err => {
      if (err) {
        console.log(err)
        return
      }
      /* When Publish succeeds, then set up 'wiring' to route (async!) response from MQTT device back to WS API. */
      sentCommands.set(
        topic,
        /** @param {Buffer} responsePayload When MQTT responds to this Publish it will be sent to caller of this handler. */
        responsePayload =>
          done(
            responseParser ? responseParser(responsePayload) : responsePayload
          )
      )
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
      case 'init-update':
        genericAsyncActionHandler(topicObj, payload)
        break
      default:
        console.log('! received topic with unknown scheme: ', topic)
        break
    }
  }

  /**
   * @param {import('./typedefs').TopicObject} topic
   * @param {Buffer} payload
   */
  function devicePresentHandler({ id, subtype, msgType }, payload) {
    const broadcastEvent = getFromStrategies('apiBroadcasts', subtype, msgType)
    if (!broadcastEvent) {
      return
    }
    const eventPayload = {
      id,
      ...JSON.parse(payload.toString())
    }
    messageBus.emit(broadcastEvent, eventPayload)
  }

  function deviceLostHandler({ id, subtype, msgType }) {
    const broadcastEvent = getFromStrategies('apiBroadcasts', subtype, msgType)
    if (!broadcastEvent) {
      return
    }
    messageBus.emit(broadcastEvent, JSON.parse(id))
  }

  /**
   * @param {import('./typedefs').TopicObject} topic
   * @param {Buffer} payload
   */
  function genericAsyncActionHandler({ id, subtype, msgType }, payload) {
    const asyncAction = getFromStrategies('asyncTasks', subtype, msgType)
    if (!asyncAction) {
      return
    }
    asyncAction(id, payload)
      .then(({ topic, payload }) => client.publish(topic, payload))
      .catch(console.log) // TODO test whether catches in the same way as when called chanied
  }

  /**
   * Get item from StrategyMap, log errors if encountered.
   * @param {('apiBroadcasts' | 'asyncTasks')} strategyComponent Type of item to retreive
   * @param {string} subtype Strategy type or name of Model Entity (device).
   * @param {string} msgType Item name in Strategy.
   */
  function getFromStrategies(strategyComponent, subtype, msgType) {
    const strategy = strategiesMap.get(subtype)
    if (!strategy) {
      logMissingComponent('strategy', strategyComponent, subtype, msgType)
      return
    }
    const component = strategy[strategyComponent]
    if (!component) {
      logMissingComponent('component', strategyComponent, subtype, msgType)
      return
    }
    const item = component.get(msgType)
    if (!item) {
      logMissingComponent('item', strategyComponent, subtype, msgType)
    }
    return item
  }
}

/**
 * @param {import('./typedefs').TopicObject} topicObj
 * @param {Buffer} payload
 */
function commandResponseHandler(topicObj, payload) {
  const commandTopic = createCommandTopic(topicObj)
  const doneCallBack = sentCommands.get(commandTopic)
  sentCommands.delete(commandTopic)
  if (doneCallBack) {
    doneCallBack(payload)
  } else {
    logMissingCommandResponse(commandTopic)
  }
}

function createCommandTopic({ type, subtype, id, command, senderInApi }) {
  return `${getBaseTopic(type, subtype)}/${id}/cmnd/${command}/${sanitizeSender(
    senderInApi
  )}`
}

messageBus.on(MQTT__CLEAR_SENDER_COMMANDS, sender => {
  setImmediate(clearSenderCommands, sender)
})

/**
 * @param {string} sender
 */
function clearSenderCommands(sender) {
  const toDelete = []
  sentCommands.forEach((v, k) => {
    if (k.endsWith(sender)) {
      toDelete.push(k)
    }
  })
  toDelete.forEach(c => sentCommands.delete(c))
}

/**
 * @param {string | boolean} sender
 * @returns {string} Sanitized `sender`, `'false'` or `''`. In case of `'false'`, MQTT client receiving message can do something about it.
 */
function sanitizeSender(sender) {
  return sender || sender === false ? sender.toString() : ''
}
