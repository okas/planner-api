/** @module mqtt-client */

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

exports.unused = {}
