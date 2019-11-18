import * as model from '../model/iotnodeModel'

const type = 'iotnode'
const topicBase = `saartk/device/${type}`
const topicSubscriptionParts = ['init']

/* Use model directly in this strategy */

/**
 * @param {Number|string} id
 * @param {string|Buffer} mqttPayload
 */
async function mqttInitHandler(id, mqttPayload) {
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
    topic: `${topicBase}/${id}/${topicSubscriptionParts[0]}-r`,
    payload: JSON.stringify(rawPayload)
  }
}

export default {
  type,
  subscriptions: topicSubscriptionParts.map(p => `${topicBase}/+/${p}`),
  publishCommands: null,
  apiBroadcasts: null,
  mqttInitHandler
}
