import socketIO from 'socket.io'
import http from 'http'
import { roomLamps } from './database'

// Todo: retreive configurtion here

const port = 3000
const pingInterval = 3600000 // testing only!

const httpServer = http.createServer()

const io = new socketIO(httpServer, {
  pingInterval: pingInterval || undefined
})

io.on('connection', s => {
  console.log(`|--> [ ${s.id} ] : a user connected`)

  s.emit('ok')

  s.on('disconnect', () => {
    console.log(`>--| [ ${s.id} ] : a user disconnected`)
  })

  s.on('lamps-get_all', fn => {
    console.log(`sending lamps array with ${roomLamps.count()} items.`)
    function generateStates(lamps) {
      function getRandomIntInclusive(min, max) {
        min = Math.ceil(min)
        max = Math.floor(max)
        return Math.floor(Math.random() * (max - min + 1)) + min // The maximum is inclusive and the minimum is inclusive
      }
      let randomIds = []
      while (randomIds.length < lamps.length * 0.33) {
        randomIds.push(getRandomIntInclusive(1, lamps.length))
      }
      return lamps.map((l, i) => {
        return {
          ...l,
          state: Number(!!randomIds.includes(++i))
        }
      })
    }
    fn(generateStates(roomLamps.data))
  })

  s.on('lamps-add', (lamp, room, fn) => {
    let lampObj = roomLamps.insertOne({
      name: `${lamp || '-lamp'} ${roomLamps.count() + 1}`,
      room: `${room || '-tuba'}`
    })
    console.log(`created: ${JSON.stringify(lampObj)}`)
    fn(lampObj)
  })
})

httpServer.listen(port, err => {
  if (err) throw err
  console.log(`==> listening on port *:${port}`)
})

console.log('planner-api init done')
