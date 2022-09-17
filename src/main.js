const express = require('express')
const cors = require('cors')
const crypto = require('crypto')

const { WebSocketServer } = require('ws')

const app = express()
const wss = new WebSocketServer({ port: 5001 })
const wss2 = new WebSocketServer({ port: 5002 })

app.use(cors())
app.use(express.json())

const sessions = {}

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.get('/create-session', (req, res) => {
    const name = req.query.name
    const size = req.query.size
    const id = crypto.randomUUID()

    sessions[id] = {
        name: name,
        size: size,
        chunks: []
    }

    console.log(sessions)

    res.send({ id })
})

app.listen(5000, () => {
    console.log(`Example app listening on port 5000`)
})

wss.on('connection', (ws, req) => {
    ws.binaryType = 'nodebuffer'
    console.log(req.url)

    const id = req.url.split('?id=')[1]

    sessions[id].ws_up = ws
    
    ws.on('message', data => {
        sessions[id].chunks.push(data)
        sessions[id].ws_dw.send(data)
    })
})

wss2.on('connection', (ws, req) => {
    console.log(req.url)

    
    const id = req.url.split('?id=')[1]
    sessions[id].ws_dw = ws

    
    sessions[id].uploading = true
    sessions[id].ws_up.send(JSON.stringify({ type: 'start' }))
    

    // let i = 0
    // while (sessions[id].uploading || i < sessions[id].chunks.length) {
    //     console.log(i);
    //     sessions[id].ws_dw.send(sessions[id].chunks[i])
    //     i++
    // }
    // console.log('Data finished sending!!! XD !!!!!!!')
})
