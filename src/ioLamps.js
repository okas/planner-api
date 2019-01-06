import { collections } from './database'
import { getRandomIntInclusive } from './utilities'

/* Internal functions */

function groupLampsByRooms(lampsColl) {
  return lampsColl.data.reduce((grouped, lamp, i) => {
    if (!grouped[lamp.room]) {
      grouped[lamp.room] = []
    }

    grouped[lamp.room].push({
      ...lamp, // ToDo: filter out unwanted props
      state: getState(lamp)
    })
    return grouped
  }, {})
}

// Test implementation. This funtion will retreive physical state in future.
function getState(lamp) {
  return !!(getRandomIntInclusive(1, 3) % 3 === 0)
}

/* Take in a socket instance and register events */

export default function registerLampsEvents(socket) {
  socket.on('get-all-room_lamps', fn => {
    console.log(
      `sending lamps array with ${collections.roomLamps.count()} items.`
    )
    fn(groupLampsByRooms(collections.roomLamps))
  })

  socket.on('lamps-add', (lamp, room, fn) => {
    let lampObj = collections.roomLamps.insertOne({
      name: `${lamp || '-lamp'} ${collections.roomLamps.count() + 1}`,
      room: `${room || '-tuba'}`
    })
    console.log(`created: ${JSON.stringify(lampObj)}`)
    fn(JSON.stringify(lampObj))
  })
}
