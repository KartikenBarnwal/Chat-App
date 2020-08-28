const express = require('express')
const http = require('http');
const socketio = require('socket.io');
const port = 3000 || process.env.PORT
const path = require('path')
const Filter = require('bad-words')
const {addUser, removeUser, getUser, getUsersInRoom} = require('./utils/users')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const publicDirPath = path.join(__dirname,'../public')
const viewsPath = path.join(__dirname,'../views')

app.set('view engine', 'ejs')
app.set('views',viewsPath)

app.use(express.static(publicDirPath))

app.get('/',(req,res)=>{
    res.render('index')
})

io.on('connection', (socket) => {
    console.log('a user connected');

    socket.on('join',(username, room, cb)=>{
        const {error, user} = addUser({
            id: socket.id,
            username,
            room
        })

        if(error)
        {
            return cb(error)
        }

        socket.join(user.room)

        socket.emit('joined',user.username,0)
        socket.broadcast.to(user.room).emit('joined',user.username,1)
        
        io.to(user.room).emit('roomData',{
            room: user.room,
            users: getUsersInRoom(user.room)
        })

        cb()
    })

    socket.on('sendMessage', (message,callback)=>{
        const user = getUser(socket.id)

        if(!user)
        {
            return callback('Unable to Send the Message!')
        }

        const filter = new Filter()
        if(filter.isProfane(message))
        {
            return callback('Profanity does not suit Professionalism!')
        }
        const createdAt = new Date().getTime()
        socket.emit('refreshMsg',message,createdAt,'You',0)
        socket.broadcast.to(user.room).emit('refreshMsg',message,createdAt,user.username,1)

        callback()
    }) 

    socket.on('sendPosition', (pos,callback) => {
        const user = getUser(socket.id)

        if(!user)
        {
            return callback('Unable to Send the Location!')
        }

        console.log(pos.lat,pos.lon)
        const createdAt = new Date().getTime()
        socket.emit('refreshPos',createdAt,pos,'You',0)
        socket.broadcast.to(user.room).emit('refreshPos',createdAt,pos,user.username,1)

        callback()
    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id)

        if(user)
        {
            io.to(user.room).emit('disjoined', user.username)
            console.log('user disconnected');

            io.to(user.room).emit('roomData',{
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
    });

});


server.listen(port,()=>{
    console.log('Server is running on port '+port)
})