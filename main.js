const io = require('socket.io')()

io.listen(3000)

io.on('connection', socket => {
  console.log('a user connected')

  socket.on('disconnect', function () {
    console.log('a user disconnected')
  })

  socket.on('test', msg => {
    socket.emit(`reply: ${msg}`)
  })
})
