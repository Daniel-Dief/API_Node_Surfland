interface queryMonthlyUtilizationProps {
    startDate: string;
    endDate: string;
}
  
function queryMonthlyUtilization({ startDate, endDate } : queryMonthlyUtilizationProps) {
    return `
    SELECT
	ING.FK_ORIGEM as codigoIngressoPWI,
	vendasPortal.backofficeid as codigoIntegracao,
	itensvendaportal.saleid as codigoVenda,
	itensVendaPortal.date as prevUsoPortal,
	itensVendaPortal.saleproductid as codigoItemVenda,
	tipoProdutoPortal.name as familiaProdutoPortal,
	productsPortal.name as produtoPortal,
	itensVendaPortal.token AS INGRESSO_PORTAL,
	statusPortal.name AS situacaoIngresso,
	itensVendaPortal.value as valorPortal,
	formaPgtoPortal.name as formaPagamento,
	surfista.name as nomeSurfista,
	surfista.document as documentoSurfista,
	CONCAT(CAT.NR_PASSAPORTE, CAT.NR_PASSAPORTEDIG) AS INGRESSO_PWI,
	MAX(CAT.DH_CATRACA) AS BAIXA_PWI,
	max(SPAC5.CheckedInAt) as baixa_portal,
	ing.tg_inativo as cancelado
FROM
	[AzurePortal].[Surfland.PortalCliente].dbo.salesproducts itensVendaPortal
LEFT JOIN [AzurePortal].[Surfland.PortalCliente].dbo.SalesProductsAccessControl SPAC5 
    ON
	SPAC5.saleProductID = itensVendaPortal.saleProductID
	AND itensVendaPortal.statusid IN (4, 15)
LEFT JOIN [AzurePortal].[Surfland.PortalCliente].dbo.salespayments as pgtoPortal
    on
	pgtoPortal.saleid = itensVendaPortal.saleid
LEFT JOIN [AzurePortal].[Surfland.PortalCliente].dbo.sales as vendasPortal
    on
	vendasportal.saleid = itensVendaPortal.saleid
LEFT JOIN [AzurePortal].[Surfland.PortalCliente].dbo.PaymentMethods as formaPgtoPortal
    ON
	formaPgtoPortal.PaymentMethodId = pgtoPortal.PaymentMethodId
LEFT JOIN [AzurePortal].[Surfland.PortalCliente].dbo.status statusPortal
    ON
	statusPortal.statusid = itensVendaPortal.statusid
left join [AzurePortal].[Surfland.PortalCliente].dbo.products productsPortal
    on
	productsPortal.productid = itensVendaPortal.productid
LEFT JOIN [AzurePortal].[Surfland.PortalCliente].dbo.SalesProductsClients surfista
    on
	surfista.saleproductid = itensVendaPortal.saleproductid
left join [AzurePortal].[Surfland.PortalCliente].dbo.ProductTypes tipoProdutoPortal
    on
	productsPortal.ProductTypeId = tipoProdutoPortal.ProductTypeId
FULL JOIN [VolpeSurfland].dbo.PQ_CATRACA CAT 
    ON
	itensVendaPortal.token = CONCAT(CAT.NR_PASSAPORTE, CAT.NR_PASSAPORTEDIG)
LEFT JOIN [VolpeSurfland].dbo.PQ_INGRESSO ING 
    ON
	ING.NR_PASSAPORTE = CAT.NR_PASSAPORTE
	AND ING.NR_PASSAPORTEDIG = CAT.NR_PASSAPORTEDIG
	and ing.tg_inativo = 0
WHERE
	(itensVendaPortal.date >= '${startDate}'
		AND itensVendaPortal.date < '${endDate}'
		AND itensVendaPortal.statusid IN (4, 15)
    /*--OR 
    (CAT.DH_CATRACA >= '${startDate}' 
    AND CAT.DH_CATRACA < '${endDate}'*/
			AND ING.TG_ORIGEM <> 'Z'
			--AND ING.FK_ORIGEM = 361506
			AND CAT.NR_UTILIZACAO = 1)
GROUP BY
	itensVendaPortal.token,
	CAT.NR_PASSAPORTE,
	CAT.NR_PASSAPORTEDIG,
	statusPortal.name,
	itensVendaPortal.saleproductid,
	itensvendaportal.saleid,
	productsPortal.name,
	itensVendaPortal.value,
	formaPgtoPortal.name,
	surfista.name,
	surfista.document,
	ING.FK_ORIGEM,
	vendasPortal.backofficeid,
	tipoProdutoPortal.name,
	itensVendaPortal.date,
	ing.tg_inativo
    `
}

export {
    queryMonthlyUtilization
};
