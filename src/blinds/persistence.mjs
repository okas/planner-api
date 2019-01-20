import { collections } from '../database'
import { getRandomIntInclusive } from '../utilities'

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

export function transformToRoomGroupedObj() {
  return collections.roomBlinds.chain().mapReduce(
    blind => {
      const { meta, $loki: id, ...obj } = blind
      return { id, ...obj, state: getState(id) }
    },
    mapped => {
      return mapped.reduce((grouped, blind) => {
        if (!grouped[blind.room]) {
          grouped[blind.room] = []
        }
        grouped[blind.room].push(blind)
        return grouped
      }, {})
    }
  )
}

export function blindAdd(blind, room) {
  return collections.roomBlinds.insertOne({
    name: `${blind || '-blind'} ${collections.roomBlinds.count() + 1}`, // ToDo: remove test code (number suffix)
    room: room || '?'
  })
}
