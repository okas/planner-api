import messageBus, {
  MQTT__BLIND_LOST,
  MQTT__BLIND_PRESENT,
  MQTT__LAMP_LOST,
  MQTT__LAMP_PRESENT
} from '../../messageBus'
import { ExistingDocumentError, ValidationErrors } from '../../model/errors'
import * as model from '../../model/iotnodeModel'
import {
  getDeviceCommonTopicsWithOthers,
  getTopicBaseDevice
} from '../utilities'
import { getActionDevicePresentLost } from './commonSyncActions'
import { responseParser } from '../responseParser'

const type = 'iotnode'
const baseTopic = getTopicBaseDevice(type)
const cmndInit = 'init'
const cmndInitUpdate = 'init-update'

/* Use model directly in this strategy */

/**
 * @async
 * @param {number | string} id
 * @param {Buffer} mqttPayload
 * @returns {Promise<import('../typedefs').MQTTTaskResult>}
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
  return getTaskResult(id, cmndInit, rawPayload)
}

/**
 * @async
 * @param {number | string} id
 * @param {Buffer} mqttPayload
 * @returns {Promise<import('../typedefs').MQTTTaskResult>}
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
  return getTaskResult(id, cmndInitUpdate, rawPayload)
}

/**
 * @param {string | number} id
 * @param {Buffer} mqttPayload
 */
function createModelDoc(id, mqttPayload) {
  return {
    id,
    ...responseParser(mqttPayload)
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
 * @returns {import('../typedefs').MQTTTaskResult}
 */
function getTaskResult(id, command, rawPayload) {
  /* Do not use pretty JSON, as IoTNode has veri limited resources to handle data!!! */
  return {
    topic: `${baseTopic}/${id}/${command}-r`,
    payload: JSON.stringify(rawPayload)
  }
}

const mbEventsOutput = new Map([
  ['lamp_present', MQTT__LAMP_PRESENT],
  ['lamp_lost', MQTT__LAMP_LOST],
  ['blind_present', MQTT__BLIND_PRESENT],
  ['blind_lost', MQTT__BLIND_LOST]
])

/**
 * @type {import('../typedefs').MQTTAction}
 */
function devicePresentHandler(iotId, mqttPayload) {
  const { outputs: plOuts } = responseParser(mqttPayload)
  const { outputs: dbOuts } = model.getById(iotId.toString())
  dbOuts
    .filter(o => o.usage)
    .forEach(({ id: dbOId, usage }) => {
      const mbEvent = mbEventsOutput.get(`${usage}_present`)
      if (!mbEvent) {
        return
      }
      const { id: _id, usage: _usage, ...rest } = plOuts.find(
        // eslint-disable-next-line eqeqeq
        ({ id }) => id == dbOId
      )
      messageBus.emit(mbEvent, { id: dbOId, ...rest })
    })
}

/**
 * @type {import('../typedefs').MQTTAction}
 */
function deviceLostHandler(iotId, mqttPayload) {
  const { outputs: dbOuts } = model.getById(iotId.toString())
  dbOuts
    .filter(o => o.usage)
    .forEach(({ id, usage }) => {
      const mbEvent = mbEventsOutput.get(`${usage}_lost`)
      if (!mbEvent) {
        return
      }
      getActionDevicePresentLost(mbEvent)(id, mqttPayload)
    })
}

/**
 * Public API
 * @type {import('../typedefs').MQTTStrategy}
 */
export default {
  type,
  subscriptions: getDeviceCommonTopicsWithOthers(type, [
    cmndInit,
    cmndInitUpdate
  ]),
  asyncTasks: new Map([
    [cmndInit, mqttInitHandler],
    [cmndInitUpdate, mqttInitUpdateHandler]
  ]),
  actions: new Map([
    ['present', devicePresentHandler],
    ['lost', deviceLostHandler]
  ])
}
