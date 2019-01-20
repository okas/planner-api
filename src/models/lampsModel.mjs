import { collections } from '../database'
import { getRandomIntInclusive } from '../utilities'

// Mockup function. This funtion will retreive physical state in future.
function getState(lampId) {
  // About 1/3 of calls will be 1, otherwize 0.
  // Dimmed lamps might have value 0..1 ? ;-)
  return +(getRandomIntInclusive(lampId, lampId + 2) % (lampId + 2) === 0)
}

export function transformToRoomGroupedObj() {
  return collections.roomLamps.chain().mapReduce(
    lamp => {
      const { meta, $loki: id, ...obj } = lamp
      return { id, ...obj, state: getState(id) }
    },
    mapped => {
      return mapped.reduce((grouped, lamp) => {
        if (!grouped[lamp.room]) {
          grouped[lamp.room] = []
        }
        grouped[lamp.room].push(lamp)
        return grouped
      }, {})
    }
  )
}

export function lampAdd(lamp, room) {
  return collections.roomLamps.insertOne({
    name: `${lamp || '-lamp'} ${collections.roomLamps.count() + 1}`, // ToDo: remove test code (number suffix)
    room: room || '?'
  })
}
