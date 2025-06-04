interface queryMonthlyIncomeReportProps {
    startDate: string;
    endDate: string;
}
  
function queryMonthlyIncomeReport({ startDate, endDate } : queryMonthlyIncomeReportProps) {
    return `
	WITH CTE_ItensUnicos AS (
		SELECT 
			MOV.PK_ID AS CODIGOITEMVENDA,
			PED.PK_ID AS codigoPedido,
			TF.PK_ID AS codigoFamilia,
			TF.DS_FAMILIA AS familia,
			MOV.FK_PRODUTO AS codigoProduto,
			MOV.DS_MODELO AS produto,
			PED.NR_PEDIDO AS numeroPedido,
			CAST(PED.DT_PEDIDO AS DATE) AS dataPedido,
			MOV.VL_PRETOT AS Valor,
			MOV.QT_MOVIMENTO AS qtdItem,
			PF.DS_DOCUMENTO AS formaPagamento,
			CASE
				WHEN PED.FK_ORIGEMVENDA = 'W' THEN PF.NR_NSU
				ELSE PF.DS_TEFNSUHOST 
			END AS NSU,
			PF.DS_AUTORIZACAO,
			BAN.DS_BANDEIRA AS bandeiraCartao,
			CAST(PC2.DH_CATRACA AS DATE) AS dataUtilizacao,
			CAST(PC.DT_PREVISAOVISITA AS DATE) AS previsaoUso,
			CASE
				WHEN PC2.DH_CATRACA IS NULL AND PC.DT_PREVISAOVISITA <= GETDATE() THEN 'No Show'
				WHEN PC2.DH_CATRACA IS NULL AND PC.DT_PREVISAOVISITA >= PED.DT_PEDIDO THEN 'Uso Futuro'
				ELSE 'Utilização na venda'
			END AS statusUtilizacao,
			CASE
				WHEN PED.FK_ORIGEMVENDA = 'W' THEN 'Portal'
				ELSE 'Vixen' 
			END AS Origem,
			ROW_NUMBER() OVER (PARTITION BY MOV.PK_ID ORDER BY PED.DT_PEDIDO) AS rn
		FROM 
			VD_PEDIDOS PED 
		LEFT JOIN PV_FINANCEIRO PF ON PED.PK_ID = PF.FK_ORIGEM
		LEFT JOIN ES_MOVIMENTOS MOV ON PED.PK_ID = MOV.FK_ORIGEM 
		LEFT JOIN TB_PRODUTOS TP ON TP.PK_ID = MOV.FK_PRODUTO
		LEFT JOIN TB_FAMILIAS TF ON TF.PK_ID = TP.FK_FAMILIA
		LEFT JOIN PV_TEFBANDEIRA BAN ON BAN.CD_BANDEIRA = PF.CD_TEFBANDEIRA
		LEFT JOIN PQ_INGRESSO PC ON PC.FK_ORIGEM = MOV.FK_ORIGEM AND PC.FK_ORIGEMITEM = MOV.PK_ID 
		LEFT JOIN PQ_CATRACA PC2 ON PC.NR_PASSAPORTE = PC2.NR_PASSAPORTE AND PC.NR_PASSAPORTEDIG = PC2.NR_PASSAPORTEDIG
		LEFT JOIN FI_MOVFIN FM ON FM.PK_ID = PF.FK_MOVFIN 
		WHERE
			MOV.TG_ORIGEM = 'V'
			AND MOV.TG_CANCELADO = 0
			AND PED.DH_CANCELADO IS NULL
			AND MOV.TG_INATIVO = 0
			AND PED.FK_MOTIVODEVOLUCAO = 0
			AND PF.DH_TRANSACAO BETWEEN '${startDate}' AND '${endDate}'
	)
	
	SELECT 
		CODIGOITEMVENDA,
		codigoPedido,
		codigoFamilia,
		familia,
		codigoProduto,
		produto,
		numeroPedido,
		dataPedido,
		Valor,
		qtdItem,
		formaPagamento,
		NSU,
		ds_autorizacao,
		bandeiraCartao,
		dataUtilizacao,
		previsaoUso,
		statusUtilizacao,
		Origem
	FROM 
		CTE_ItensUnicos
	WHERE 
		rn = 1;
	`
}

export {
    queryMonthlyIncomeReport
};
