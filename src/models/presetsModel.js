import { roomLamps, roomBlinds } from '../persistence'
import { transformItems, groupByRooms } from './transforms'

export function getDevices() {
  return [
    {
      type: 'lamps',
      items: roomLamps.chain().mapReduce(transformItems(), groupByRooms)
    },
    {
      type: 'blinds',
      items: roomBlinds.chain().mapReduce(transformItems(), groupByRooms)
    }
  ]
}
