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
    responseParser: JSON.parse
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
    responseParser: JSON.parse
  })
  return func
}
