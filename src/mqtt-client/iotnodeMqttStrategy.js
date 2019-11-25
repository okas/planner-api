import * as model from '../model/iotnodeModel'
import { getTopicBaseDevice, getDeviceCommoTopicsWithOthers } from './utilities'
import { ExistingDocumentError, ValidationErrors } from '../model/errors'

const type = 'iotnode'
const baseTopic = getTopicBaseDevice(type)
const cmndInit = 'init'
const cmndInitUpdate = 'init-update'

/* Use model directly in this strategy */

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
    const { outputs: resultOutputs } = model.addOrUpdate(parsedSourceDoc)
    rawPayload = { outputs: resultOutputs.map(({ id }) => ({ id })) }
  } catch (err) {
    rawPayload = generateErrorResult(err)
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
    model.updateForced(parsedSourceDoc)
    rawPayload = { state: 'ok' }
  } catch (err) {
    rawPayload = generateErrorResult(err)
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
 * @param {ValidationErrors | ExistingDocumentError<import('../persistence/iotnodeCollection').IoTNodeDoc>} err
 * @returns {import('./typedefCommons').ErrorResult | ErrorExistingResult<ExistingDocumentError,import('../persistence/iotnodeCollection').IoTNodeDoc>}
 */
function generateErrorResult(err) {
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
 * @param {any} rawPayload
 * @returns {import('./typedefCommons').MQTTActionResult}
 */
function getActionResult(id, command, rawPayload) {
  /* Do not use pretty JSON, as IoTNode has veri limited resources to handle data!!! */
  return {
    topic: `${baseTopic}/${id}/${command}-r`,
    payload: JSON.stringify(rawPayload)
  }
}

/**
 * Public API.
 */
export default {
  type,
  subscriptions: getDeviceCommoTopicsWithOthers(type, [
    cmndInit,
    cmndInitUpdate
  ]),
  asyncActions: new Map([
    [cmndInit, mqttInitHandler],
    [cmndInitUpdate, mqttInitUpdateHandler]
  ])
}

/**
 * @typedef {{state: string}} StateResult
 */
/**
 * @typedef {{outputs: { id: number; }[];}} OutputsInitializedResult
 */
/**
 * @template  TError, T
 * @typedef {import('./typedefCommons').ErrorResult & {existing: T}} ErrorExistingResult<TError<T>>
 */
