import { UploadConnection } from "./UploadConnection";
import { DownloadConnection } from "./DownloadConnection";

export interface Session {
    name: string
    size: number
    uploadConnection?: UploadConnection
    downloadConnection?: DownloadConnection
}

export const Sessions: Record<string, Session> = {};