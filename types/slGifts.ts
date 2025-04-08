export interface insertProps {
    contractId: number;
    giftsId: number[];
}

export interface giftsLogs {
    Name: string;
    JSON: string;
    ChangedAt: Date;
}

export interface contractInfos {
    Contractid: number,
    Status: string,
    Clientname: string,
    Documento: string,
    Email: string
    logHistory: giftsLogs[] | undefined
}