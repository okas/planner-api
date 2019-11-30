export const unused = {}

/**
 * Topic and payload for ready for MQTT publish.
@typedef {
  {
    topic: string;
    payload: string;
  }
} MQTTActionResult
 */

/**
 * @callback MQTTAsyncTask
 * @param {number | string} id
 * @param {Buffer | string} mqttPayload
 * @returns {Promise.<MQTTActionResult>}
 */

/**
 * @typedef {object} MQTTStrategy
 * @property {string} type
 * @property {string | string[] | import('mqtt').ISubscriptionMap[]} subscriptions
 * @property {Map.<string, MQTTAsyncTask>} [asyncTasks]
 * @property {Map.<symbol, Function>} [publishCommands]
 * @property {Map.<string, symbol>} [apiBroadcasts]
 */

/**
 * @typedef {('apiBroadcasts' | 'asyncTasks')} StrategyComponentName
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
