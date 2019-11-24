/**
 * @param {string} message
 */
export function logMqttGeneric(message) {
  console.log(`MQTT API Bridge: ${message}!`)
}

/**
 * @param {string} componentPart
 * @param {string} forPart
 */
export function logMissingGeneric(componentPart, forPart) {
  logMqttGeneric(`missing ${componentPart} for ${forPart}`)
}

/**
 * @param {('item' | 'component' | 'strategy')} depth
 * @param {string} componentName
 * @param {string} subtype
 * @param {string} msgType
 */
export function logMissingComponent(depth, componentName, subtype, msgType) {
  let componentPart = ''
  switch (depth) {
    case 'item':
      componentPart = `.${msgType}`
    // eslint-disable no-fallthrough
    case 'component':
      componentPart = `.${componentName}` + componentPart
    // eslint-disable no-fallthrough
    case 'strategy':
      componentPart = `strategy[${subtype}]` + componentPart
  }
  logMissingGeneric(
    `${depth} in '${componentPart}'`,
    `'${subtype}/+/${msgType}'`
  )
}

/**
 * @param {string} commandTopic
 */
export function logMissingCommandResponse(commandTopic) {
  logMqttGeneric(
    `cannot pass command response, did't found sent command: '${commandTopic}'`
  )
}
