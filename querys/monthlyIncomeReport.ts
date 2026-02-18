interface queryMonthlyIncomeReportProps {
    startDate: string;
    endDate: string;
}
  
function queryMonthlyIncomeReport({ startDate, endDate } : queryMonthlyIncomeReportProps) {
    return `
	WITH CTE_ItensUnicos AS (
SELECT DISTINCT 
		MOV.PK_ID AS CODIGOITEMVENDA,
	    ped.pk_id AS codigoPedido,
		tf.pk_id AS codigoFamilia,
		tf.ds_familia AS familia,
		Mov.fk_produto AS codigoProduto,
		mov.DS_MODELO AS produto,
		ped.nr_pedido AS numeroPedido,
		CAST(pf.dh_transacao AS DATE) AS dataPedido,
		mov.VL_PRETOT AS Valor,
		MOV.QT_MOVIMENTO AS qtdItem,
		PF.DS_DOCUMENTO AS formaPagamento,
		case
			when ped.fk_origemvenda = 'W' then PF.nr_nsu
			else pf.DS_TEFNSUHOST 
		end as NSU,
		PF.ds_autorizacao,
		ban.ds_bandeira AS bandeiraCartao,
	CAST(pc2.dh_catraca AS DATE) AS dataUtilizacao,
		CAST(pc.DT_PREVISAOVISITA AS DATE) AS previsaoUso,
		CASE
			WHEN pc2.dh_catraca IS NULL
			AND pc.DT_PREVISAOVISITA <= GETDATE() THEN 'No Show'
			WHEN pc2.dh_catraca IS NULL
			AND pc.DT_PREVISAOVISITA >= ped.dt_pedido THEN 'Uso Futuro'
			ELSE 'Utilização na venda'
		END AS statusUtilizacao,
	case
			when ped.fk_origemvenda = 'W' then 'Portal'
			else 'Vixen' 
		end as Origem
	FROM vd_pedidos PED 
	LEFT JOIN pv_financeiro pf ON PED.pk_id = PF.FK_ORIGEM
	LEFT JOIN es_movimentos MOV ON PED.pk_id = MOV.FK_ORIGEM 
	LEFT JOIN tb_produtos AS TP ON TP.pk_id = MOV.FK_PRODUTO
	LEFT JOIN tb_familias AS TF ON TF.pk_id = TP.FK_FAMILIA
	LEFT JOIN pv_tefbandeira AS BAN ON	BAN.cd_bandeira = PF.cd_tefbandeira
	LEFT JOIN pq_ingresso AS PC ON PC.FK_ORIGEM = mov.FK_ORIGEM AND PC.FK_ORIGEMITEM = MOV.PK_ID 
	LEFT JOIN pq_catraca AS PC2 ON PC.NR_PASSAPORTE = PC2.nr_passaporte AND PC.NR_PASSAPORTEDIG = PC2.NR_PASSAPORTEDIG
	LEFT JOIN fi_movfin AS FM ON FM.PK_ID = PF.FK_MOVFIN 
	WHERE
		mov.TG_ORIGEM = 'V'
		AND mov.tg_cancelado = 0
		AND ped.dh_cancelado IS NULL
		AND MOV.TG_INATIVO = 0
		and PED.fk_motivodevolucao = 0
		--AND ped.pk_id = 332642
		AND pf.dh_transacao between '${startDate}' and '${endDate}'
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
