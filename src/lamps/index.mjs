import { collections } from '../database'
import { getRandomIntInclusive } from '../utilities'

/* Internal functions */

function transformToRoomGroupedObj() {
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

// Mockup function. This funtion will retreive physical state in future.
function getState(lampId) {
  // About 1/3 of calls will be 1, otherwize 0.
  // Dimmed lamps might have value 0..1 ? ;-)
  return +(getRandomIntInclusive(lampId, lampId + 2) % (lampId + 2) === 0)
}

/* Take in a socket instance and register events */

export default function registerLampsEvents(socket) {
  socket.on('get-all-room_lamps', fn => {
    fn(transformToRoomGroupedObj())
    console.log(
      `sending lamps array with ${collections.roomLamps.count()} items.`
    )
  })

  socket.on('lamps-add', (lamp, room, fn) => {
    let lampObj = collections.roomLamps.insertOne({
      name: `${lamp || '-lamp'} ${collections.roomLamps.count() + 1}`, // ToDo: remove test code (number suffix)
      room: room || '?'
    })
    console.log(`created: ${JSON.stringify(lampObj)}`)
    fn(lampObj)
  })
}
