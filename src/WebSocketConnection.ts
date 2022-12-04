import WebSocket from 'ws';
import {
    AckMessage,
    ChunkMessage,
    ChunkRequestMessage,
    InfoMessage,
    Message,
    MessageType
} from '@doggofrens/filesharing-ws-proto';

export abstract class WebSocketConnection {

    protected readonly ws: WebSocket;

    constructor(ws: WebSocket) {
        this.ws = ws;
        ws.binaryType = 'nodebuffer';

        ws.on('close', () => this.onClose());
        ws.on('message', data => this.handleMessage(WebSocketConnection.parseMessage(data as Buffer)));
    }

    protected send(message: Message): void {
        console.log(message);
        this.ws.send(message.toUint8Array());
    }

    private static parseMessage(data: ArrayBuffer): Message | null {
        const _data = new Uint8Array(data);
        const messageType = _data[0];

        switch (messageType) {
            case MessageType.Ack:
                return new AckMessage();
            case MessageType.Info:
                return InfoMessage.fromUint8Array(_data);
            case MessageType.Chunk:
                return ChunkMessage.fromUint8Array(_data);
            case MessageType.ChunkRequest:
                return ChunkRequestMessage.fromUint8Array(_data);
            default:
                return null;
        }
    }

    abstract onClose(): void;
    abstract handleMessage(message: Message | null): void;
}
