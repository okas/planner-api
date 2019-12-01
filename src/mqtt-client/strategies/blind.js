import {
  MQTT__BLIND_CMND__SET_STATE,
  MQTT__BLIND_CMND__STATE,
  MQTT__BLIND_LOST,
  MQTT__BLIND_PRESENT
} from '../../messageBus'
import { getDeviceCommonTopics, getTopicBaseDevice } from '../utilities'
import { geState, setState } from './commonPublishCommands'
import { getActionDevicePresentLost } from './commonSyncActions'

const type = 'blind'
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
    [MQTT__BLIND_CMND__STATE, geState(topicBase)],
    [MQTT__BLIND_CMND__SET_STATE, setState(topicBase)]
  ]),
  actions: new Map([
    ['present', getActionDevicePresentLost(MQTT__BLIND_PRESENT)],
    ['lost', getActionDevicePresentLost(MQTT__BLIND_LOST)]
  ])
}
