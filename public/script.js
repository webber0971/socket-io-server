const socket = io('/')
const videoGrid = document.getElementById('video-grid')
const myPeer = new Peer(undefined, {
  host: '/',
  port: '3001'
})
const myVideo = document.createElement('video')
myVideo.muted = true
const peers = {}

myPeer.on('open', id => {
  console.log("open")
  console.log("user_id",id)
  console.log("room_id",ROOM_ID)
  socket.emit('join-room', ROOM_ID, id)
})

navigator.mediaDevices.getUserMedia({video: true,audio: true}).then(stream => {
  console.log("this my stream =",stream)
  addVideoStream(myVideo, stream)
  console.log("建立自己的畫面")

  myPeer.on('call', call => {
    console.log("收到返回的 call 邀請")
    call.answer(stream)
    const video = document.createElement('video')
    call.on('stream', userVideoStream => {
      console.log("this is other stream",userVideoStream)
      addVideoStream(video, userVideoStream)
    })
  })

  socket.on('user-connected', userId => {
    console.log(userId,"+")
    setTimeout(connectToNewUser,500,userId,stream)
  })
}).catch((err)=>{console.log("取得鏡頭失敗")})

socket.on('user-disconnected', userId => {
  console.log(userId,"-")
  if (peers[userId]) peers[userId].close()
})


async function connectToNewUser(userId, stream) {
  console.log("收到別人的user_id = ",userId)
  console.log("自己的的 stream = ",stream)
  console.log("用call發出請求")
  const call = myPeer.call(userId, stream)
  const video = document.createElement('video')
  // await sleep(1000)
  call.on('stream', userVideoStream => {
    console.log("別人的 stream =",userVideoStream)
    addVideoStream(video, userVideoStream)
  })
  call.on('close', () => {
    console.log("close")
    video.remove()
  })

  peers[userId] = call
}

function addVideoStream(video, stream) {
  video.srcObject = stream
  video.addEventListener('loadedmetadata', () => {
    video.play()
  })
  videoGrid.append(video)
}

function sleep(n = 0) {
    return new Promise((resolve) => {
      setTimeout(function () {
        resolve();
      }, n);
    });
}
