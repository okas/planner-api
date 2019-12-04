/**
 * @param {Buffer} responsePayload
 */
export function responseParser(responsePayload) {
  return JSON.parse(responsePayload.toString() || null)
}
