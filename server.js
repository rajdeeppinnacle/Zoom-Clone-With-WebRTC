const express = require('express')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)
const { v4: uuidV4 } = require('uuid')

app.set('view engine', 'ejs')
app.use(express.static('public'))

app.get('/:role', (req, res) => {
  const role = req.params.role
  res.redirect(`/${role}/${uuidV4()}`)
})

app.get('/:role/:room', (req, res) => {
  res.render('room', { roomId: req.params.room, role: req.params.role })
})

io.on('connection', socket => {
  socket.on('join-room', (roomId, userId) => {
    socket.join(roomId)
    socket.to(roomId).broadcast.emit('user-connected', userId)

    socket.on('disconnect', () => {
      socket.to(roomId).broadcast.emit('user-disconnected', userId)
    })
  })
})

const PORT = process.env.PORT || 3000

server.listen(PORT, () => console.log("Listening on " + PORT))