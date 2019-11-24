import * as model from '../model/iotnodeModel'
import { getTopicBaseDevice, getDeviceCommoTopicsWithOthers } from './utilities'
import { ExistingDocumentError, ValidationErrors } from '../model/errors'

const type = 'iotnode'
const baseTopic = getTopicBaseDevice(type)
const cmndInit = 'init'
const cmndInitUpdate = 'init-update'
const subscriptions = getDeviceCommoTopicsWithOthers(type, [
  cmndInit,
  cmndInitUpdate
])

/* Use model directly in this strategy */

/**
 * @type {Map<string,Promise<import('./typedefCommons').MQTTActionResult>>}
 */
const asyncActions = new Map()
// @ts-ignore
asyncActions.set(cmndInit, mqttInitHandler)
// @ts-ignore
asyncActions.set(cmndInitUpdate, mqttInitUpdateHandler)

/**
 * @async
 * @param {number | string} id
 * @param {string | Buffer} mqttPayload
 * @returns {Promise<import('./typedefCommons').MQTTActionResult>}
 */
async function mqttInitHandler(id, mqttPayload) {
  const parsedSourceDoc = createModelDoc(id, mqttPayload)
  let rawPayload
  try {
    const result = model.addOrUpdate(parsedSourceDoc)
    rawPayload = trimOutputs(result)
  } catch (err) {
    rawPayload = errorHandler(err)
  }
  // TODO Limit errors to 10! IoTNode might not handle more!
  // TODO IoTNode max packet size is 1KB
  return getActionResult(id, cmndInit, rawPayload)
}

/**
 * @async
 * @param {number | string} id
 * @param {string | Buffer} mqttPayload
 * @returns {Promise<import('./typedefCommons').MQTTActionResult>}
 */
async function mqttInitUpdateHandler(id, mqttPayload) {
  const parsedSourceDoc = createModelDoc(id, mqttPayload)
  let rawPayload
  try {
    const result = model.updateForced(parsedSourceDoc)
    rawPayload = trimOutputs(result)
  } catch (err) {
    rawPayload = errorHandler(err)
  }
  // TODO Limit errors to 10! IoTNode might not handle more!
  // TODO IoTNode max packet size is 1KB
  return getActionResult(id, cmndInitUpdate, rawPayload)
}

/**
 * @param {string | number} id
 * @param {string | Buffer} mqttPayload
 */
function createModelDoc(id, mqttPayload) {
  return {
    id,
    ...JSON.parse(mqttPayload.toString())
  }
}

/**
 * @param {import('../persistence/iotnodeCollection').IoTNodeDoc} outputs
 */
function trimOutputs({ outputs }) {
  return { outputs: outputs.map(({ id }) => ({ id })) }
}

/**
 * @param {ValidationErrors | ExistingDocumentError<import('../persistence/iotnodeCollection').IoTNodeDoc>} err
 * @returns {import('./typedefCommons').ErrorResult | ErrorExistingResult<import('../persistence/iotnodeCollection').IoTNodeDoc>}
 */
function errorHandler(err) {
  let rawPayload
  if (err instanceof ExistingDocumentError) {
    rawPayload = { errors: err.errors, existing: err.existing }
  } else if (err instanceof ValidationErrors) {
    rawPayload = { errors: err.errors }
  } else {
    console.error('Unexpected Error:: ', err)
  }
  return rawPayload
}

/**
 * @param {string | number} id
 * @param {string} command
 * @param {OKResult | ErrorExistingResult<import('../persistence/iotnodeCollection').IoTNodeDoc>} rawPayload
 * @returns {import('./typedefCommons').MQTTActionResult}
 */
function getActionResult(id, command, rawPayload) {
  return {
    topic: `${baseTopic}/${id}/${command}-r`,
    payload: JSON.stringify(rawPayload)
  }
}

export default {
  type,
  subscriptions,
  asyncActions
}

/**
 * @typedef {{outputs: { id: number; }[];}} OKResult
 */
/**
 * @template T
 * @typedef {T | import('./typedefCommons').ErrorResult & {existing?: T}} ErrorExistingResult<T>
 */
