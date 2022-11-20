import WebSocket from 'ws';
import { WebSocketConnection } from "./WebSocketConnection";
import { Session, sessions } from './Sessions';
import { AckMessage, FileChunkMessage, FileInfoMessage, FileInfoRequestMessage, Message, MessageType } from '@doggofrens/filesharing-ws-proto';

export class UploadConnection extends WebSocketConnection {

    private readonly id: string;

    private previousChunkNumber: number | null = null;

    constructor(ws: WebSocket, id: string) {
        super(ws);
        this.id = id;
    }

    onOpen(): void {
        console.log('UploadConnection opened');
        sessions[this.id] = {
            uploadConnection: this
        } as Session;
        super.send(new FileInfoRequestMessage(this.id));
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

        switch (message.type) {
            case MessageType.FileInfo:
                if (sessions[this.id].name != null || sessions[this.id].size != null) {
                    console.error('UploadConnection: FileInfo already received');
                    this.ws.close();
                }

                sessions[this.id].name = (message as FileInfoMessage).name;
                sessions[this.id].size = (message as FileInfoMessage).size;

                break;
            case MessageType.FileChunk:
                if (sessions[this.id] == null || sessions[this.id].downloadConnection == null) {
                    this.ws.close();
                }

                if (this.previousChunkNumber != null && (message as FileChunkMessage).chunkNumber !== this.previousChunkNumber + 1) {
                    console.error('UploadConnection: Chunk number mismatch');
                    this.ws.close();
                }

                this.previousChunkNumber = (message as FileChunkMessage).chunkNumber;
                sessions[this.id]!.downloadConnection!.sendChunkMessage((message as FileChunkMessage));

                break;
            default:
                console.log('UploadConnection: Unknown message type');
                this.ws.close();
        }
    }

    close(): void {
        this.ws.close();
    }

    notifyChunkDownloaded(): void {
        super.send(new AckMessage());
    }

}
