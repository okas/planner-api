/**
 * @param {string} topicBase
 */
export function geState(topicBase) {
  /**
   * @type {import('../typedefs').MQTTPublishCommand}
   */
  const func = (data, sender) => ({
    topic: `${topicBase}/${data}/cmnd/state/${sender}`,
    payload: null,
    responseParser: parser
  })
  return func
}

/**
 * @param {string} topicBase
 */
export function setState(topicBase) {
  /**
   * @type {import('../typedefs').MQTTPublishCommand}
   */
  const func = (data, sender) => ({
    topic: `${topicBase}/${data.id}/cmnd/set-state/${sender}`,
    payload: JSON.stringify(data.state),
    responseParser: parser
  })
  return func
}

/**
 * @param {{ toString: () => string; }} responsePayload
 */
function parser(responsePayload) {
  return JSON.parse(responsePayload.toString() || null)
}
