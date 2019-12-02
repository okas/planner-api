/**
 * @param {Buffer|string} responsePayload
 */
export function responseParser(responsePayload) {
  return responsePayload && JSON.parse(responsePayload.toString() || null)
}
