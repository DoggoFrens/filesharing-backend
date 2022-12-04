import { InfoMessage, Message, MessageType } from '@doggofrens/filesharing-ws-proto';
import WebSocket from 'ws';
import { WebSocketConnection } from "./WebSocketConnection";
import { ChunkMessage, ChunkRequestMessage } from '@doggofrens/filesharing-ws-proto';
import { sessions } from './Sessions';

export class DownloadConnection extends WebSocketConnection {

    private readonly id: string;

    constructor(ws: WebSocket, id: string) {
        super(ws);
        this.id = id;
        console.log('DownloadConnection opened');

        if (sessions[this.id] == null || sessions[this.id].name == null || sessions[this.id].size == null) {
            this.ws.close();
        }

        sessions[this.id].downloadConnection = this;
        super.send(new InfoMessage(sessions[this.id].name!, sessions[this.id].size!));
    }

    onClose(): void {
        console.log('DownloadConnection closed');
        sessions[this.id].uploadConnection.close();
    }

    handleMessage(message: Message | null): void {
        if (message == null) {
            console.log('DownloadConnection: Message was not parsed correctly (null received)');
            this.ws.close();
            return;
        }
        console.log("Download ", message);

        switch (message.type) {
            case MessageType.ChunkRequest:
                sessions[this.id].uploadConnection.forwardChunkRequest(message as ChunkRequestMessage);
                break;
            default:
                console.log('DownloadConnection: Unknown message type');
                this.ws.close();
        }
    }

    sendChunkMessage(message: ChunkMessage): void {
        super.send(message);
    }
}