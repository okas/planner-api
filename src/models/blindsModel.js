import { transformItems, groupByRooms } from './transforms'
import { roomBlinds } from '../persistence'
import { getRandomIntInclusive } from '../utilities'

export function getGroupedBlinds() {
  return roomBlinds
    .chain()
    .mapReduce(transformItems(id => getState(id)), groupByRooms)
}

// Mockup function. This funtion will retreive physical state in future.
function getState(blindId) {
  // About 1/3 of calls will be 1, otherwize 0. This decides which blind gets value later.
  const match = +(
    getRandomIntInclusive(blindId, blindId + 2) % (blindId + 2) ===
    0
  )
  // Find randomly value between 0..1.
  return match === 1 ? getRandomIntInclusive(0, 100) / 100 : 0
}

export function blindAdd(blind, room, valuestep = 1) {
  return roomBlinds.insertOne({
    name: `${blind || '-blind'} ${roomBlinds.count() + 1}`, // ToDo: remove test code (number suffix)
    room: room || '?',
    valuestep
  })
}
