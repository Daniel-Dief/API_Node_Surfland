export interface insertProps {
    contractId: number;
    giftsId: number[];
}

export interface giftsLogs {
    Name: string;
    JSON: {
        contractId: number;
        giftsId: number[];
    };
    ChangedAt: Date;
}

export interface contractInfos {
    Contractid: number,
    Status: string,
    Clientname: string,
    Documento: string,
    Email: string
    logHistory: formatGiftsLogs[] | undefined
}

export interface giftsInfos {
    giftsid: number,
    giftsname: string
}

export interface formatGiftsLogs {
    Name: string;
    JSON: {
        contractId: number;
        giftsNames: string[];
    };
    ChangedAt: Date;
}