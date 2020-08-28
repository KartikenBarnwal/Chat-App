const socket = io()

//elements
const $messages = document.getElementById('messages')
const $info = document.getElementById('info')

//template
const messageTemplate = document.getElementById('message-template').innerHTML
const messageTemplate2 = document.getElementById('message-template2').innerHTML
const positionTemplate = document.getElementById('position-template').innerHTML
const positionTemplate2 = document.getElementById('position-template2').innerHTML
const joiningTemplate = document.getElementById('joining-template').innerHTML
const joiningTemplate2 = document.getElementById('joining-template2').innerHTML
const disjoiningTemplate = document.getElementById('disjoining-template').innerHTML
const roomTemplate = document.getElementById('room-template').innerHTML

const autoScroll = () => {
    // new message element
    const $newMessage = $messages.lastElementChild

    // height of the new child
    const newMessageStyles = getComputedStyle($newMessage)
    // console.log(newMessageStyles)
    const newMessageHeight = $newMessage.offsetHeight
    
    // Visible height
    const visibleHeight = $messages.offsetHeight

    // Height of the container
    const containerHeight = $messages.scrollHeight

    // How much i have Scrolled?
    const scrollOffset = $messages.scrollTop + visibleHeight

    if(containerHeight - newMessageHeight <= scrollOffset){
        console.log('big yes')
        $messages.scrollTop = $messages.scrollHeight
    }
}


socket.on('joined', (username, flag)=>{
    if(flag==0)
    {
        const html = Mustache.render(joiningTemplate)
        $messages.insertAdjacentHTML('beforeend', html)
    }
    else if(flag==1)
    {
        const html = Mustache.render(joiningTemplate2, {username})
        $messages.insertAdjacentHTML('beforeend', html)
    }
})
socket.on('disjoined',(username)=>{
    const html = Mustache.render(disjoiningTemplate, {username})
    $messages.insertAdjacentHTML('beforeend', html)
})

document.getElementById('send').addEventListener('click',(e)=>{
    e.preventDefault()
    const message = document.getElementById('message').value
    if(message=='')
    {
        document.querySelector('input').focus()
        return 
    }
    socket.emit('sendMessage', message, (error)=>{
        if(error)
        {
            document.querySelector('input').focus()
            return alert(error)
        }
        console.log('Message Acknowledged!')
    })
    document.querySelector('input').focus()
    document.getElementById('message').value = ""

})

document.getElementById('sendPosition').addEventListener('click',()=>{
    if(!navigator.geolocation)
    {
        return alert('Geolocation not supported on your browser!')
    }


    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit('sendPosition',{
            lat: position.coords.latitude,
            lon: position.coords.longitude
        },(error)=>{
            if(error)
            alert(error)
        });
      });


})

socket.on('refreshMsg', (message, createdAt, username, flag) => {
    console.log(message)
    const timestamp = moment(createdAt).format('h:mm a')
    console.log(timestamp)

    if(flag==0)
    {
        const html = Mustache.render(messageTemplate, {
            message,
            timestamp,
            username
        })
        $messages.insertAdjacentHTML('beforeend', html)
        autoScroll()
    }
    else if(flag==1)
    {
        const html = Mustache.render(messageTemplate2, {
            message,
            timestamp,
            username
        })
        $messages.insertAdjacentHTML('beforeend', html)
        autoScroll()
    }
})
socket.on('refreshPos', (createdAt, pos, username, flag) => {
    const link = `https://www.google.com/maps?q=${pos.lat},${pos.lon}`
    const timestamp = moment(createdAt).format('h:mm a')
    console.log(timestamp)

    if(flag==0)
    {
        const html = Mustache.render(positionTemplate, {
            link,
            timestamp,
            username
        })
        $messages.insertAdjacentHTML('beforeend', html)
        autoScroll()
    }
    if(flag==1)
    {
        const html = Mustache.render(positionTemplate2, {
            link,
            timestamp,
            username
        })
        $messages.insertAdjacentHTML('beforeend', html)
        autoScroll()
    }

})

//Room Data
socket.on('roomData', ({room, users}) => {
    const html = Mustache.render(roomTemplate, {
        room,
        users
    })
    $info.innerHTML = html
})

//Options
const {username, room} = Qs.parse(location.search ,{ignoreQueryPrefix: true})

socket.emit('join', username, room, (error)=>{
    if(error)
    {
        alert(error)
        location.href="/"
    }
})