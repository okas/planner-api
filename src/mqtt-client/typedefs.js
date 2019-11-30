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
 * @typedef {object} MQTTStrategy
 * @property {string} type
 * @property {string[]} subscriptions
 * @property {Map.<string, (id: string | number, mqttPayload: string | Buffer) => Promise<MQTTActionResult>>} [asyncTasks]
 * @property {Map<symbol, Function>} [publishCommands]
 * @property {Map<string, symbol>} [apiBroadcasts]
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
