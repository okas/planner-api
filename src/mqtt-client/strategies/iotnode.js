import { ExistingDocumentError, ValidationErrors } from '../../model/errors'
import * as model from '../../model/iotnodeModel'
import {
  getDeviceCommonTopicsWithOthers,
  getTopicBaseDevice
} from '../utilities'

const type = 'iotnode'
const baseTopic = getTopicBaseDevice(type)
const cmndInit = 'init'
const cmndInitUpdate = 'init-update'

/* Use model directly in this strategy */

/**
 * @async
 * @param {number | string} id
 * @param {string | Buffer} mqttPayload
 * @returns {Promise<import('../typedefs').MQTTActionResult>}
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
 * @returns {Promise<import('../typedefs').MQTTActionResult>}
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
 * @param {ValidationErrors | ExistingDocumentError<import('../../model/typedefs').IoTNodeDoc>} err
 * @returns {import('../typedefs').ErrorResult | import('../typedefs').ErrorExistingResult<ExistingDocumentError,import('../../model/typedefs').IoTNodeDoc>}
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
 * @returns {import('../typedefs').MQTTActionResult}
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
  subscriptions: getDeviceCommonTopicsWithOthers(type, [
    cmndInit,
    cmndInitUpdate
  ]),
  asyncActions: new Map([
    [cmndInit, mqttInitHandler],
    [cmndInitUpdate, mqttInitUpdateHandler]
  ])
}
