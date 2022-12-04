import express, { Application } from "express";
import { IncomingMessage } from "http";
import WebSocket, { WebSocketServer } from 'ws';
import { DownloadConnection } from "./DownloadConnection";
import { sessions } from "./Sessions";
import { UploadConnection } from "./UploadConnection";
import crypto from 'crypto';

const app: Application = express();
const PORT: number = 5000;
const uploadSocket = new WebSocketServer({ noServer: true });
const downloadSocket = new WebSocketServer({ noServer: true });
const server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

uploadSocket.on('connection', (ws: WebSocket, id: string) => {
    ws.binaryType = 'nodebuffer';
    sessions[id] = { uploadConnection: new UploadConnection(ws, id) };
});

downloadSocket.on('connection', (ws: WebSocket, id: string) => {
    ws.binaryType = 'nodebuffer';
    sessions[id].downloadConnection = new DownloadConnection(ws, id);
});

server.on('upgrade', (request: IncomingMessage, socket, head) => {
    if (request.url == null) {
        request.destroy();
        return;
    }

    const id = crypto.randomUUID();


    if (request.url === '/') {

        uploadSocket.handleUpgrade(request, socket, head, (ws: WebSocket) => {
            uploadSocket.emit('connection', ws, id);
        });
    } else {
        const id = request.url.slice(1);

        if (!(id in sessions)) {
            request.destroy();
            return;
        }

        downloadSocket.handleUpgrade(request, socket, head, (ws: WebSocket) => {
            downloadSocket.emit('connection', ws, id);
        });
    }
});