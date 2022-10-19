import WebSocket from 'ws';
import { WebSocketConnection } from "./WebSocketConnection";
import { Sessions } from './Sessions';
import { FileInfoRequestMessage } from '@doggofrens/filesharing-ws-proto';

export class UploadConnection extends WebSocketConnection {

    private readonly id: string;

    constructor(ws: WebSocket, id: string) {
        super(ws);
        this.id = id;
    }

    onOpen(): void {
        console.log('UploadConnection opened');
        super.send(new FileInfoReqMessage(id).toUint8Array());
    }

    onClose(): void {
        console.log('UploadConnection closed');
        delete Sessions[this.id];
    }

}
