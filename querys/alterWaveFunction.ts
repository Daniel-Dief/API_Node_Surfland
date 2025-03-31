function queryGetProduct(searchMethod : string) {
    return `
            SELECT
                sp.ProductId,
                p2.Name as ClientName,
                p.Name as WaveName,
                CASE
                    WHEN p.WaveLevel = 1 THEN 'Bay'
                    WHEN p.WaveLevel = 2 THEN 'Reef'
                END WaveLevel,
                s.Name as Time,
                s.ScheduleId,
                sp.Date as 'Date',
                sp.Used as 'Used'
            FROM
                SalesProducts sp
            INNER JOIN Sales sl ON
                sl.SaleId = sp.SaleId
            INNER JOIN Products p ON
                sp.ProductId = p.ProductId
            INNER JOIN Schedules s ON
                s.ScheduleId = sp.ScheduleId
            INNER JOIN SalesProductsClients p2 ON
                p2.SaleProductId = sp.SaleProductId
            WHERE
                sp.token = '${searchMethod}'
                AND
                sp.StatusId = 4
        `
}

function querySimpleGetProduct(searchMethod : string) {
    return `
            SELECT
                sp.ProductId,
                sp.ScheduleId,
                sp.Date
            FROM
                SalesProducts sp
            WHERE
                sp.Token = '${searchMethod}'
                AND
                sp.StatusId = 4
        `
}

function queryUpdateProduct(searchMethod : string, product_id : number, schedule_id : number, date : string) {
    return `
        UPDATE
            SalesProducts
        SET
            ProductId = ${product_id},
            ScheduleId = ${schedule_id},
            Date = '${date}'
        WHERE
            Token = '${searchMethod}'
            AND
            StatusId = 4
        `
}

function queryCheckHasPermission(usrLogin : string, usrPassword : string, functionId : string) {
    return `
            SELECT
                COUNT(u.PersonId) AS result
            FROM
                Users u
            INNER JOIN
                Permissions p
            ON
                u.AccessProfileId = p.AccessProfileId
            WHERE
                u.Login = '${usrLogin}'
            AND
                u.Password = '${usrPassword}'
            AND
                p.FunctionId = ${functionId}
        `
}

function queryCheckIsAdmin(usrLogin : string, usrPassword : string) {
    return `
            SELECT
                COUNT(u.PersonId) AS result
            FROM
                Users u
            WHERE
                u.Login = '${usrLogin}'
            AND
                u.Password = '${usrPassword}'
            AND
                u.AccessProfileId = 10
        `
}

function queryCartByLocator(locator: string){
    return `
        SELECT
            ci.conta_id AS "ContaId",
            ci.produto AS "Nome",
            ci.codigobarras AS "QRCode",
            ci.dataprevista AS "Data",
            ci.horario AS "Horario",
        CASE
            WHEN ci.databaixa is null THEN 0
            WHEN ci.databaixa is not null THEN 1
        END AS "Utilizado"
        FROM
            contas_ingressos ci
        INNER JOIN
            contas c
        ON
            ci.conta_id = c.id
        WHERE
            c.localizador = '${locator}'
        `
}

export {
    queryCartByLocator,
    queryCheckIsAdmin,
    queryCheckHasPermission,
    querySimpleGetProduct,
    queryUpdateProduct,
    queryGetProduct
}
