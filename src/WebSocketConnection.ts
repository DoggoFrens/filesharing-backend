import WebSocket from 'ws';
import { MessageType, Message } from '@doggofrens/filesharing-ws-proto';

export abstract class WebSocketConnection {

    private readonly ws: WebSocket;

    constructor(ws: WebSocket) {
        this.ws = ws;
        ws.binaryType = 'nodebuffer';
        
        ws.on('open', () => this.onOpen());
        ws.on('close', () => this.onClose());
        ws.on('message', data => this.handleMessage(data as Buffer));
    }

    private handleMessage(data: Buffer): void {
        const messageType = data.readUInt8(0);
        switch (messageType) {
            
        }
    }

    protected send(message: Message): void {
        this.ws.send(message.toUint8Array());
    }
    
    abstract onOpen(): void;
    abstract onClose(): void;
}
