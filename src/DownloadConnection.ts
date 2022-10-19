import WebSocket from 'ws';
import { WebSocketConnection } from "./WebSocketConnection";

export class DownloadConnection extends WebSocketConnection {

    constructor(ws: WebSocket) {
        super(ws);
    }

    handleAck(data: Buffer): void {
        throw new Error("Method not implemented.");
    }

    handleChunk(data: Buffer): void {
        throw new Error("Method not implemented.");
    }

    onClose(): void {
        console.log('UploadConnection closed');
    }
}
