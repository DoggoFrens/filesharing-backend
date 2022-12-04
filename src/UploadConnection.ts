import WebSocket from 'ws';
import {
    ChunkMessage,
    ChunkRequestMessage,
    ChunkSizeInfoMessage,
    InfoMessage,
    InfoRequestMessage,
    Message,
    MessageType
} from '@doggofrens/filesharing-ws-proto';

import { WebSocketConnection } from "./WebSocketConnection";
import { Session, sessions } from './Sessions';

export class UploadConnection extends WebSocketConnection {

    private readonly id: string;

    private requestedChunkNumber: number | null = null;

    constructor(ws: WebSocket, id: string) {
        super(ws);
        this.id = id;
        console.log('UploadConnection opened');
        sessions[this.id] = {
            uploadConnection: this
        } as Session;
        super.send(new InfoRequestMessage(this.id));
    }

    onClose(): void {
        console.log('UploadConnection closed');
        delete sessions[this.id];
    }

    handleMessage(message: Message | null): void {
        if (message == null) {
            console.log('UploadConnection: Message was not parsed correctly (null received)');
            this.ws.close();
            return;
        }

        console.log("Upload ", message);

        switch (message.type) {
            case MessageType.Info:
                if (sessions[this.id].name != null || sessions[this.id].size != null) {
                    console.error('UploadConnection: FileInfo already received');
                    this.ws.close();
                }

                sessions[this.id].name = (message as InfoMessage).name;
                let size = (message as InfoMessage).size;
                sessions[this.id].size = size;
                let chunkSize = Math.min(size, Math.max(size/100, 1_048_576));
                chunkSize = Math.ceil(chunkSize);
                console.log(size, chunkSize)
                sessions[this.id].chunkSize = chunkSize
                this.sendChunkSizeInfoMessage(chunkSize);
                break;
            case MessageType.Chunk:
                if (sessions[this.id] == null || sessions[this.id].downloadConnection == null) {
                    this.ws.close();
                }

                if (this.requestedChunkNumber != null && (message as ChunkMessage).chunkNumber !== this.requestedChunkNumber) {
                    console.error('UploadConnection: Chunk number mismatch');
                    this.ws.close();
                }

                this.requestedChunkNumber = (message as ChunkMessage).chunkNumber;
                sessions[this.id]!.downloadConnection!.sendChunkMessage((message as ChunkMessage));

                break;
            default:
                console.log('UploadConnection: Unknown message type');
                this.ws.close();
        }
    }

    close(): void {
        this.ws.close();
    }

    sendChunkSizeInfoMessage(chunkSize: number): void {
        super.send(new ChunkSizeInfoMessage(chunkSize));
    }

    forwardChunkRequest(message: ChunkRequestMessage): void {
        this.requestedChunkNumber = message.number;
        super.send(message);
    }

}
