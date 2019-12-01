import {
  MQTT__LAMP_CMND__SET_STATE,
  MQTT__LAMP_CMND__STATE,
  MQTT__LAMP_LOST,
  MQTT__LAMP_PRESENT
} from '../../messageBus'
import { getDeviceCommonTopics, getTopicBaseDevice } from '../utilities'
import { geState, setState } from './commonPublishCommands'
import { getActionDevicePresentLost } from './commonSyncActions'

const type = 'lamp'
const topicBase = getTopicBaseDevice(type)

/* Currently using only Common Publish Commands, but they can be replaced and new ones added. */

/**
 * Public API
 * @type {import('../typedefs').MQTTStrategy}
 */
export default {
  type,
  subscriptions: getDeviceCommonTopics(type),
  publishCommands: new Map([
    [MQTT__LAMP_CMND__STATE, geState(topicBase)],
    [MQTT__LAMP_CMND__SET_STATE, setState(topicBase)]
  ]),
  actions: new Map([
    ['present', getActionDevicePresentLost(MQTT__LAMP_PRESENT)],
    ['lost', getActionDevicePresentLost(MQTT__LAMP_LOST)]
  ])
}
