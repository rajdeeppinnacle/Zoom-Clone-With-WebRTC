const socket = io('/')
const screen = document.getElementById('screen')
const videos = document.getElementById('videos')
let userId = null;

let myPeer = null

if (ROLE == "admin") {
  myPeer = new Peer("ad1001n")
}
else {
  myPeer = new Peer()
}

const myVideo = document.createElement('video')
myVideo.muted = true
const peers = {}

//console.info(navigator.mediaDevices.getSupportedConstraints())

if (ROLE == "student") {

  var constraints = {
    video: {
      frameRate: { ideal: 10, max: 20 },
      width: { min: 480, ideal: 480, max: 480 },
      height: { min: 240, ideal: 240, max: 240 }
    }
  };

  navigator.mediaDevices.getUserMedia(constraints).then(stream => {
    addVideoStream(videos, myVideo, stream)

    myPeer.on('call', call => {

      call.answer(stream)

      const video = document.createElement('video')

      call.on('stream', userVideoStream => {
        if (call.peer == "ad1001n") {
          addVideoStream(screen, video, userVideoStream)
        } else {
          addVideoStream(videos, video, userVideoStream)
        }
      })

    })

    socket.on('user-connected', userId => {
      connectToNewUser(userId, stream)
    })
  })
}
else {
  navigator.mediaDevices.getDisplayMedia({ video: { cursor: "always" }, audio: true }).then(stream => {

    addVideoStream(screen, myVideo, stream)

    myPeer.on('call', call => {
      call.answer(stream)
      const video = document.createElement('video')
      call.on('stream', userVideoStream => {
        addVideoStream(videos, video, userVideoStream)
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
  const call = myPeer.call(userId, stream, { metadata: { info: 10001 } })
  const video = document.createElement('video')

  call.on('stream', userVideoStream => {

    if (ROLE == "student") {
      if (userId == "ad1001n") {
        addVideoStream(screen, video, userVideoStream)
      } else {
        addVideoStream(videos, video, userVideoStream)
      }
    } else {
      addVideoStream(videos, video, userVideoStream)
    }

  })

  call.on('close', () => {
    video.remove()
  })

  peers[userId] = call
}

function addVideoStream(wrapper, video, stream) {

  video.srcObject = stream

  video.addEventListener('loadedmetadata', () => {
    video.play()
  })

  wrapper.append(video)
}
