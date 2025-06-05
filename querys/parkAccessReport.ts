interface queryparkAccessProps {
    startDate: string;
    endDate: string;
}
    
function queryparkAccess({ startDate, endDate } : queryparkAccessProps) {
    return `
    SELECT
        COUNT(DISTINCT BraceletCode) AS qtd_acessos,
        CAST(CheckedInAt AS Date) AS data
    FROM
        SalesProductsAccessControl
    WHERE
        CheckedInAt BETWEEN '${startDate}' AND '${endDate}'
        AND
        Type = 1
    GROUP BY
        CAST(CheckedInAt AS Date)
    `
}
    
export {
    queryparkAccess
};
    