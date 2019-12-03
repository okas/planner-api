export const unused = {}

/**
 * Topic and payload for ready for MQTT publish.
 * @typedef {object} MQTTTaskResult
 * @property {string} topic
 * @property {string} [payload]
 */

/**
 * Topic and payload for ready for MQTT publish.
 * @typedef {object} MQTTTaskResultBinary
 * @property {string} topic
 * @property {Buffer} [payload]
 */

/**
 * @callback MQTTAsyncTask
 * @param {number | string} id
 * @param {Buffer} mqttPayload
 * @returns {Promise.<MQTTTaskResult>}
 */

/**
 * @callback MQTTAsyncTaskBinary
 * @param {number | string} id
 * @param {Buffer} mqttPayload
 * @returns {Promise.<MQTTTaskResultBinary>}
 */

/**
 * @callback MQTTAction
 * @param {number | string} id
 * @param {Buffer} [mqttPayload]
 * @returns {void}
 */

/**
 * @callback MQTTResponseParser
 * @param {Buffer} responsePayload
 * @returns {any}
 */

/**
 * Topic and payload ready for MQTT publish.
 * @typedef {MQTTTaskResult & {responseParser?: MQTTResponseParser}} MQTTPublishCommandResult
 */

/**
 * Topic and payload ready for MQTT publish.
 * @typedef {MQTTTaskResultBinary & {responseParser?: MQTTResponseParser}} MQTTPublishCommandResultBinary
 */

/**
 * @callback MQTTPublishCommand
 * @param {object} data
 * @param {string} [sender]
 * @returns {MQTTPublishCommandResult}
 */

/**
 * @callback MQTTPublishCommandBinary
 * @param {object} data
 * @param {string} [sender]
 * @returns {MQTTPublishCommandResultBinary}
 */

/**
 * @typedef {object} MQTTStrategy
 * @property {string} type
 * @property {string | string[] | import('mqtt').ISubscriptionMap[]} subscriptions
 * @property {Map.<string, MQTTAsyncTask | MQTTAsyncTaskBinary>} [asyncTasks]
 * @property {Map.<symbol, MQTTPublishCommand | MQTTPublishCommandBinary>} [publishCommands]
 * @property {Map.<string, MQTTAction>} [actions]
 */

/**
 * @typedef {('asyncTasks' | 'actions')} StrategyComponentName
 */

/**
  * Topic string splitted to object properties.
@typedef {
  {
    type: string;
    subtype: string;
    id: string;
    msgType: string;
    command: string;
    senderInApi: string;
  }
} TopicObject
  */

/**
 * Common errors result.
 * @typedef {{errors: string[]; }} ErrorResult
 */

/**
 * @typedef {{state: string}} StateResult
 */

/**
 * @typedef {{outputs: { id: number; }[];}} OutputsInitializedResult
 */

/**
 * @template  TError, T
 * @typedef {import('./typedefs').ErrorResult & {existing: T}} ErrorExistingResult<TError<T>>
 */
