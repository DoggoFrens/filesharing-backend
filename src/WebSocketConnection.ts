import WebSocket from 'ws';
import { MessageType, Message, AckMessage, FileChunkMessage, FileInfoMessage, FileInfoRequestMessage } from '@doggofrens/filesharing-ws-proto';

export abstract class WebSocketConnection {

    protected readonly ws: WebSocket;

    constructor(ws: WebSocket) {
        this.ws = ws;
        ws.binaryType = 'nodebuffer';

        ws.on('open', () => this.onOpen());
        ws.on('close', () => this.onClose());
        ws.on('message', data => this.handleMessage(WebSocketConnection.parseMessage(data as Buffer)));
    }

    protected send(message: Message): void {
        this.ws.send(message.toUint8Array());
    }

    private static parseMessage(data: Buffer): Message | null {
        const messageType = data.readUInt8(0);
        switch (messageType) {
            case MessageType.Ack:
                return new AckMessage();
            case MessageType.FileInfo:
                return FileInfoMessage.fromUint8Array(data);
            case MessageType.FileChunk:
                return FileChunkMessage.fromUint8Array(data);
            default:
                return null;
        }
    }

    abstract onOpen(): void;
    abstract onClose(): void;
    abstract handleMessage(message: Message | null): void;
}
