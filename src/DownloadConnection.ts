import { FileInfoMessage, Message, MessageType } from '@doggofrens/filesharing-ws-proto';
import WebSocket from 'ws';
import { WebSocketConnection } from "./WebSocketConnection";
import { FileChunkMessage } from '@doggofrens/filesharing-ws-proto';
import { sessions } from './Sessions';

export class DownloadConnection extends WebSocketConnection {

    private readonly id: string;

    constructor(ws: WebSocket, id: string) {
        super(ws);

        this.id = id;
    }

    onOpen(): void {
        console.log('DownloadConnetion opened');

        if (sessions[this.id] == null || sessions[this.id].name == null || sessions[this.id].size == null) {
            this.ws.close();
        }

        sessions[this.id].downloadConnection = this;
        super.send(new FileInfoMessage(sessions[this.id].name!, sessions[this.id].size!));
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

        switch (message.type) {
            case MessageType.Ack:
                sessions[this.id].uploadConnection.notifyChunkDownloaded();
                break;
            default:
                console.log('DownloadConnection: Unknown message type');
                this.ws.close();
        }
    }

    sendChunkMessage(message: FileChunkMessage): void {
        super.send(message);
    }
}
