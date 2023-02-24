const express = require('express')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)
const { v4: uuidV4 } = require('uuid')
const port = process.env.PORT || 3000;

app.set('view engine', 'ejs')
app.use(express.static('public'))

app.get('/', (req, res) => {
  res.redirect(`/${uuidV4()}`)
})

app.get('/:room', (req, res) => {
  res.render('room', { roomId: req.params.room })
})

// videos 頁面

io.on('connection', socket => {
  socket.on('join-room', (roomId, userId) => {
    console.log("join-room = 成功")
    console.log("room_id = ",roomId)
    console.log("user_id = ",userId)
    socket.join(roomId)
    socket.to(roomId).broadcast.emit('user-connected', userId)
    socket.on('disconnect', () => {
      socket.to(roomId).broadcast.emit('user-disconnected', userId)
    })
  })

  // 聊天頁面
  console.log("有人加入連線")
  socket.on("enter_room",(client_id)=>{
      console.log(client_id)
      console.log("kkk")
      socket.join(client_id)
      io.emit('chat message', client_id);
      // socket.to(client_id).emit('chat message', client_id);
      socket.on("user_entered",(client_id)=>{
          io.emit("user_entered",client_id)
      })
      
      socket.on('chat message', (msg) => {
          console.log(msg)
          io.emit('chat message', msg);
      });
  })
  
  socket.on("disconnect",()=>{
      console.log("有人離線")
      socket.emit("user_left")
  })
})

server.listen(port, () => {
  console.log(`Socket.IO server running at http://localhost:${port}/`);
});