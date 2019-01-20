import { roomLamps } from '../persistence'
import { getRandomIntInclusive } from '../utilities'

export function transformToRoomGroupedObj() {
  return roomLamps.chain().mapReduce(
    ({ meta, $loki: id, ...item }) => ({ id, ...item, state: getState(id) }),
    mapped => {
      return mapped.reduce((groupS, { room: id, ...item }) => {
        const group = groupS.find(g => g.id === id)
        if (group) {
          group.items.push(item)
        } else {
          groupS.push({ id, items: [item] })
        }
        return groupS
      }, [])
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
