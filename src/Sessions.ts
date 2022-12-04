import { UploadConnection } from "./UploadConnection";
import { DownloadConnection } from "./DownloadConnection";

export interface Session {
    name?: string
    size?: number
    chunkSize?: number
    uploadConnection: UploadConnection
    downloadConnection?: DownloadConnection
}

export const sessions: Record<string, Session> = {};
