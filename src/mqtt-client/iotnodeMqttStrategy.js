import * as model from '../model/iotnodeModel'

const type = 'iotnode'
const topicBase = `saartk/device/${type}`
const topicSubscriptionParts = ['init']

/* Use model directly in this strategy */

/**
 * @type {Map<String,Promise>} maps broadcast type to Symbol event for EventEmitter usage.
 */
const asyncActions = new Map()
// @ts-ignore
asyncActions.set('init', mqttInitHandler)

/**
 * @param {Number|string} id
 * @param {string|Buffer} mqttPayload
 */
async function mqttInitHandler(id, mqttPayload) {
  // @ts-ignore
  const { outputs, errors } = model.addOrUpdate({
    id,
    ...JSON.parse(mqttPayload.toString())
  })
  let rawPayload
  if (errors) {
    rawPayload = { errors }
  } else {
    rawPayload = { outputs: outputs.map(({ id }) => ({ id })) }
  }
  return {
    topic: `${topicBase}/${id}/init-r`,
    payload: JSON.stringify(rawPayload)
  }
}

export default {
  type,
  subscriptions: topicSubscriptionParts.map(p => `${topicBase}/+/${p}`),
  asyncActions
}
