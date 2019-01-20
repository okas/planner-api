import { roomLamps } from '../persistence'
import { getRandomIntInclusive } from '../utilities'

export function transformToRoomGroupedObj() {
  return roomLamps.chain().mapReduce(
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

// Mockup function. This funtion will retreive physical state in future.
function getState(lampId) {
  // About 1/3 of calls will be 1, otherwize 0.
  // Dimmed lamps might have value 0..1 ? ;-)
  return +(getRandomIntInclusive(lampId, lampId + 2) % (lampId + 2) === 0)
}

export function lampAdd(lamp, room) {
  return roomLamps.insertOne({
    name: `${lamp || '-lamp'} ${roomLamps.count() + 1}`, // ToDo: remove test code (number suffix)
    room: room || '?'
  })
}
