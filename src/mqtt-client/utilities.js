/* MQTT topic generation.
 * ================================================================== */

const rootBase = 'saartk'
const typeServerClient = 'api'
const typeDevice = 'device'

const deviceCommonParts = ['present', 'lost', 'resp/+/+']

/**
 * Topic start for server MQTT client.
 * @constant `saartk/api`
 */
export const serverTypeBase = `${rootBase}/${typeServerClient}`

/**
 * Topic start for type `device`.
 * @constant `saartk/device`
 */
export const deviceTypeBase = `${rootBase}/${typeDevice}`

/**
 * Topic start for device's type and `subType`.
 * @param {String} subType Device type (entity).
 * @returns `saartk/device/{subType}`
 */
export function getTopicBaseDevice(subType) {
  return `${deviceTypeBase}/${subType}`
}

/**
 * Topic start for any type and subtype.
 * @param {string} type 'device', 'iontnode', etc.
 * @param {String} subType Device type (entity).
 * @returns `saartk/{type}/{subType}`
 */
export function getBaseTopic(type, subType) {
  return `${rootBase}/${type}/${subType}`
}

/**
 * Complete topics for any device's `subtype` and it's common full topics.
 * @param {String} subType Device type (entity).
 * @returns `[saartk/device/{subType}/{common}]`
 * @example return ['saartk/device/lamp/+/resp/+/+']
 */
export function getDeviceCommonTopics(subType) {
  return genericCreatorWithIdLevel(typeDevice, subType, deviceCommonParts)
}

/**
 * Complete topics for any `type`, `subtype` and it's common full topics.
 * @param {String} subType Device type (entity).
 * @param {string[]} topicEnds Topic parts, without ID wildcard, it will be added!
 * @returns `[saartk/{type}/{subType}/{common}]`
 * @example
 * return ['saartk/device/lamp/+/resp/+/+',
 *         'saartk/device/lamp/+/init']
 */
export function getDeviceCommonTopicsWithOthers(subType, topicEnds) {
  const result = getDeviceCommonTopics(subType)
  result.push(...genericCreatorWithIdLevel(typeDevice, subType, topicEnds))
  return result
}

/**
 * Generates complete topics.
 * @param {string} type
 * @param {string} subType
 * @param {string[]} topicParts Provide without ID wildcard level!
 * @example return ['saartk/device/lamp/+/resp/+/+']
 */
function genericCreatorWithIdLevel(type, subType, topicParts) {
  return topicParts.map(p => `${getBaseTopic(type, subType)}/+/${p}`)
}

/* MQTT topic to object.
 * ================================================================== */

/**
 * @param {string} topic of MQTT packet
 * @returns {import('./typedefs').TopicObject} Topic string splitted to ovject properties.
 */
export function createTopicObject(topic) {
  const [, type, subtype, id, msgType, command, senderInApi] = topic.split('/')
  return {
    type,
    subtype,
    id,
    msgType,
    command,
    senderInApi
  }
}
