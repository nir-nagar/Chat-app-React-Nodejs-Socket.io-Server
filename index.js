const express = require('express')
const socketio = require('socket.io')
const http = require('http')
const cors = require('cors')
const router = require('./router')

const { addUser, removeUser, getUser, getUsersInRoom } = require('./users')

const PORT = process.env.PORT || 5000

const app = express()
const server = http.createServer(app)
const io = socketio(server)


io.on('connection', (socket) => {
    // console.log(`we have a new connectin!!!`)
    socket.on('join', ({ name, room }, callback) => {
        // console.log(`${name}, ${room}`)


        const { error, user } = addUser({ id: socket.id, name, room })


        if (error) callback(error)

        socket.emit('message', { user: 'admin', text: `${user.name}, Welcome To The Room ${user.room}` })

        socket.broadcast.to(user.room).emit('message', { user: 'Admin', text: `${user.name}, Has Joined` })

        socket.join(user.room)

        io.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room) })

        callback()
    })

    socket.on('sendMessage', (message, callback) => {
        const user = getUser(socket.id)

        io.to(user.room).emit('message', { user: user.name, text: message })
        io.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room) })

        callback()
    })

    socket.on('disconnect', () => {


        const user = removeUser(socket.id)

        if (user)
            io.to(user.room).emit('message', { user: 'Admin', text: `${user.name} Has Left,` })
        console.log(`User had left!!!`)
    })
})


app.use(cors())
app.use(router)




app.get('/test', (req, res) => { res.send(`Test server work`) })


server.listen(PORT, () => {
    console.log(`Server has started on ${PORT}`)

})