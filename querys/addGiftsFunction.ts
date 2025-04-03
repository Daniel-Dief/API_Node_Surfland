import { Client } from "pg"
import { dbConfigSL } from "../dbConnectors"

function queryListAllGifts() {
    return `
        SELECT
            id AS GiftId,
            nome AS Name
        FROM
            vendas.brinde
        WHERE
            ativo = TRUE
        ORDER BY
            nome
    `
}

function queryGetContract(contractId : number) {
    return `
        SELECT
            v.id as ContractId,
            v.status as Status,
            c.nome as ClientName,
            c.email as Email
        FROM
            vendas.venda v
        INNER JOIN
            clientes.cliente c
        ON
            v.id_cliente = c.id
        WHERE
            v.id = ${contractId}
    `
}

function queryGetGiftsByContract(contractId : number) {
    return `
        SELECT
            bdv.id AS GiftId,
            b.nome AS Name,
            bdv.status AS Status
        FROM
            vendas.brindes_da_venda bdv
        INNER JOIN
            vendas.brinde b
        ON
            bdv.id_brinde = b.id		
        WHERE
            bdv.id_venda = ${contractId}
    `
}

interface queryInsertGiftsProps {
    contractId: number,
    giftsId: number[]
}

function queryInsertGifts({ contractId, giftsId } : queryInsertGiftsProps) {
    let sql=  `
        INSERT INTO
            vendas.brindes_da_venda
                (
                    id_venda,
                    id_brinde,
                    status,
                    data_inclusao
                )
            values
    `

    giftsId.forEach((giftId, index) => {
        sql += `(${contractId}, ${giftId}, 'NAO_ENTREGUE', now())`
        if(index < giftsId.length - 1) sql += ','
    });

    return sql
}

async function checkGiftsId(giftsId : number[]) {
    const sql = `
        SELECT
            id
        FROM
            vendas.brinde
        WHERE
            id IN (${giftsId.join(',')})
            AND
            ativo = TRUE
    `

    try {
        const clientSL = new Client(dbConfigSL);
        await clientSL.connect();
        
        const result = await clientSL.query(sql);
        await clientSL.end();
        const giftsIdNoRepeat = [...new Set(giftsId)]

        return result.rows.length == giftsIdNoRepeat.length
    } catch {
        return false
    }
}

async function checkContractId(contractId : number) {
    const sql = `
        SELECT
            id
        FROM
            vendas.venda
        WHERE
            id = ${contractId}
    `

    try {
        const clientSL = new Client(dbConfigSL);
        await clientSL.connect();
        
        const result = await clientSL.query(sql);
        await clientSL.end();

        return result.rows.length > 0
    } catch {
        return false
    }
}

export {
    queryListAllGifts,
    queryGetContract,
    queryGetGiftsByContract,
    queryInsertGifts,
    checkGiftsId,
    checkContractId
}