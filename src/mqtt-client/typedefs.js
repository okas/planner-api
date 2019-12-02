export const unused = {}

/**
 * Topic and payload for ready for MQTT publish.
 * @typedef {object} MQTTTaskResult
 * @property {string} topic
 * @property {string} [payload]
 */

/**
 * @callback MQTTAsyncTask
 * @param {number | string} id
 * @param {Buffer | string} mqttPayload
 * @returns {Promise.<MQTTTaskResult>}
 */

/**
 * @callback MQTTAction
 * @param {number | string} id
 * @param {Buffer | string} [mqttPayload]
 * @returns {void}
 */

/**
 * @callback MQTTResponseParser
 * @param {Buffer | string} responsePayload
 * @returns {object}
 */

/**
 * Topic and payload for ready for MQTT publish.
 * @typedef {MQTTTaskResult & {responseParser?: MQTTResponseParser}} MQTTPublishCommandResult
 */

/**
 * @callback MQTTPublishCommand
 * @param {object} data
 * @param {string} [sender]
 * @returns {MQTTPublishCommandResult}
 */

/**
 * @typedef {object} MQTTStrategy
 * @property {string} type
 * @property {string | string[] | import('mqtt').ISubscriptionMap[]} subscriptions
 * @property {Map.<string, MQTTAsyncTask>} [asyncTasks]
 * @property {Map.<symbol, Function>} [publishCommands]
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
