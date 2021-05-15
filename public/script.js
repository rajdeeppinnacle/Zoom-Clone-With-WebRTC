const socket = io('/')
const videoGrid = document.getElementById('video-grid')
const myPeer = new Peer()
const myVideo = document.createElement('video')
myVideo.onclick=()=>{
  myVideo.style.width="100vw";
  myVideo.style.height="100vh";
}
myVideo.muted = true
const peers = {}

//console.info(navigator.mediaDevices.getSupportedConstraints())

if (ROLE == "student") {
  navigator.mediaDevices.getUserMedia({
    video: {
      width: { min: 640, ideal: 640 },
      height: { min: 400, ideal: 480 },
      aspectRatio: { ideal: 1.7777777778 },
    },
    audio: {
      sampleSize: 16,
      channelCount: 2,
    }
  }).then(stream => {

    addVideoStream(myVideo, stream)

    myPeer.on('call', call => {

      call.answer(stream)
      const video = document.createElement('video')
      call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream)
      })
    })

    socket.on('user-connected', userId => {
      connectToNewUser(userId, stream)
    })
  })
}
else{
  navigator.mediaDevices.getDisplayMedia().then(stream => {
  
    addVideoStream(myVideo, stream)
  
    myPeer.on('call', call => {
      
      call.answer(stream)
      const video = document.createElement('video')
      call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream)
      })
    })
  
    socket.on('user-connected', userId => {
      connectToNewUser(userId, stream)
    })
  })
}

socket.on('user-disconnected', userId => {
  if (peers[userId]) peers[userId].close()
})

myPeer.on('open', id => {
  socket.emit('join-room', ROOM_ID, id)
})

function connectToNewUser(userId, stream) {
  const call = myPeer.call(userId, stream)
  const video = document.createElement('video')

  call.on('stream', userVideoStream => {
    addVideoStream(video, userVideoStream)
  })

  call.on('close', () => {
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