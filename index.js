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

        socket.emit('message', { user: 'admin', text: `${user.name}, Welcome to the Room ${user.room}` })

        socket.broadcast.to(user.room).emit('message', { user: 'admin', text: `${user.name},has Joined` })

        socket.join(user.room)

        callback()
    })

    socket.on('sendMessage', (message, callback) => {
        const user = getUser(socket.id)
     
        io.to(user.room).emit('message', { user: user.name, text: message })

        callback()
    })

    socket.on('disconnect', () => {
        console.log(`User had left!!!`)
    })
})


app.use(cors())
app.use(router)




app.get('/test', (req, res) => { res.send(`Test server work`) })


server.listen(PORT, () => {
    console.log(`Server has started on ${PORT}`)

})