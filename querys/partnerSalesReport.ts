interface queryPartnersReportProps {
  paymentMethod ?: string,
  saleDate ?: string,
  saleDateEnd ?: string,
  partnerName ?: string
}

function queryPartnersReport({ paymentMethod, saleDate, saleDateEnd, partnerName }: queryPartnersReportProps) {
    return `
      SELECT DISTINCT 
    		MOV.PK_ID AS CODIGOITEMVENDA,
    	    ped.pk_id AS codigoPedido,
    	    P.Name AS NomeComprador,
    	    P.Document AS DocumentoComprador,
    	    SPC.Name AS NomeUtilizador,
    	    SPC.Document AS DocumentoUtilizador,
    		tf.pk_id AS codigoFamilia,
    		tf.ds_familia AS familia,
    		Mov.fk_produto AS codigoProduto,
    		mov.DS_MODELO AS produto,
    		ped.nr_pedido AS numeroPedido,
    		CAST(ped.dt_pedido AS DATE) AS dataPedido,
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
    	FROM [VolpeSurfland].dbo.vd_pedidos PED 
    	LEFT JOIN [VolpeSurfland].dbo.pv_financeiro pf ON PED.pk_id = PF.FK_ORIGEM
    	LEFT JOIN [VolpeSurfland].dbo.es_movimentos MOV ON PED.pk_id = MOV.FK_ORIGEM 
    	LEFT JOIN [VolpeSurfland].dbo.tb_produtos AS TP ON TP.pk_id = MOV.FK_PRODUTO
    	LEFT JOIN [VolpeSurfland].dbo.tb_familias AS TF ON TF.pk_id = TP.FK_FAMILIA
    	LEFT JOIN [VolpeSurfland].dbo.pv_tefbandeira AS BAN ON	BAN.cd_bandeira = PF.cd_tefbandeira
    	LEFT JOIN [VolpeSurfland].dbo.pq_ingresso AS PC ON PC.FK_ORIGEM = mov.FK_ORIGEM AND PC.FK_ORIGEMITEM = MOV.PK_ID 
    	LEFT JOIN [VolpeSurfland].dbo.pq_catraca AS PC2 ON PC.NR_PASSAPORTE = PC2.nr_passaporte AND PC.NR_PASSAPORTEDIG = PC2.NR_PASSAPORTEDIG
    	LEFT JOIN [VolpeSurfland].dbo.fi_movfin AS FM ON FM.PK_ID = PF.FK_MOVFIN 
    	LEFT JOIN [AzurePortal].[Surfland.PortalCliente].dbo.SalesProducts SP ON CONCAT(PC2.NR_PASSAPORTE, PC2.NR_PASSAPORTEDIG) = (SP.Token COLLATE SQL_Latin1_General_CP1_CI_AS)
    	LEFT JOIN [AzurePortal].[Surfland.PortalCliente].dbo.SalesProductsClients SPC ON SP.SaleProductId = SPC.SaleProductId
    	LEFT JOIN [AzurePortal].[Surfland.PortalCliente].dbo.Sales S ON S.SaleId = SP.SaleId 
    	LEFT JOIN [AzurePortal].[Surfland.PortalCliente].dbo.Persons P ON P.PersonId = S.PersonId
	WHERE
		mov.TG_ORIGEM = 'V'
		AND mov.tg_cancelado = 0
		AND ped.dh_cancelado IS NULL
		AND MOV.TG_INATIVO = 0
		AND TF.pk_id in (43, 46, 49, 50, 52, 45)
		and PED.fk_motivodevolucao = 0
		${
		 paymentMethod ? `AND pf.DS_DOCUMENTO LIKE '${paymentMethod}'` : ''
	        }
		${
		  saleDate ? `AND ped.dt_pedido BETWEEN '${saleDate}' AND '${saleDateEnd}'` : ''
		 }
        ${
          partnerName ? `AND TF.pk_id = '${partnerName}'` : ''
        }		
	ORDER BY MOV.PK_ID 
    `;
}

function queryPaymentMethods() {
  return `
  SELECT
    pm.Name
  FROM
    PaymentMethods pm
  WHERE
    pm.StatusId = 1
  `
}

export {
  queryPartnersReport,
  queryPaymentMethods
};
