import express, { Application, Request } from "express";
import { IncomingMessage } from "http";
import { URL } from 'url';
import WebSocket, { WebSocketServer } from 'ws';
import { parse } from 'query-string';

interface Session {
    name: string
    size: number
    uploadSocket?: WebSocket
    downloadSocket?: WebSocket
}

function areQueryParamsValid(name: any, size: any) {
    return name != null && size != null && typeof size === 'number';
}

const sessions: Record<string, Session> = {};

const app: Application = express();
const PORT: number = 5000;
const uploadSocket = new WebSocketServer({ noServer: true });
const downloadSocket = new WebSocketServer({ noServer: true });
const server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

uploadSocket.on('connection', (ws: WebSocket, id: string) => {
    ws.on('open', () => {
        sessions[id].uploadSocket = ws;
        ws.send(id)
    });
    ws.on('message', () => {
        // sessions[id].chunks.push(data)
        // sessions[id].ws_dw.send(data)

        // handle messages in custom format
    });
    ws.on('close', () => {
        sessions[id].uploadSocket?.close();
        delete sessions[id];
    });
});

downloadSocket.on('connection', (ws: WebSocket, id: string) => {
    ws.on('open', () => {
        sessions[id].downloadSocket = ws
        
    })
});

server.on('upgrade', (request: IncomingMessage, socket, head) => {
    if (request.url == null) {
        request.destroy();
        return;
    }

    const reqUrl = new URL(request.url);
    if (reqUrl.pathname === '/') {
        const parsedQuery = parse(reqUrl.search, {parseNumbers: true});

        if (!areQueryParamsValid(parsedQuery.name, parsedQuery.size)) {
            request.destroy();
            return;
        }

        const id = crypto.randomUUID();
        sessions[id] = {
            name: parsedQuery.name,
            size: parsedQuery.size,
        } as Session;

        uploadSocket.handleUpgrade(request, socket, head, (ws: WebSocket) => {
            uploadSocket.emit('connection', ws, id);
        });
    } else {
        const id = reqUrl.pathname.slice(1);
        
        if (!(id in sessions)) {
            request.destroy();
            return;
        }
        
        downloadSocket.handleUpgrade(request, socket, head, (ws: WebSocket) => {
            downloadSocket.emit('connection', ws, id);
        });
    }
});
