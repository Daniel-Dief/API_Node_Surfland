interface queryPartnersReportProps {
  paymentMethod ?: string,
  saleDate ?: string,
  saleDateEnd ?: string,
  partnerName ?: string
}

function queryPartnersReport({ paymentMethod, saleDate, saleDateEnd, partnerName }: queryPartnersReportProps) {
    return `
    SELECT
        s.SaleId AS "CodigoVendas",
        pp.Name AS "NomeProduto",
        pp.ProductId AS "ProductId",
        p.Name AS "NomeCliente",
        s.CreatedAt AS "DataVenda",
        spp.Value AS "ValorPago",
        spp.Installments AS "QtdParcelas",
        (spp.Value / spp.Installments) AS "ValorParcela",
        pm.Name AS "FormaPagamento",
        spp.Usn AS "NSU",
        spp.AuthorizationCode AS "CodigoAutorizacao",
        pt.ProductTypeId AS "CodigoCategoria",
        pt.Name AS "CategoriaProduto",
        p4.Partner AS "Parceiro"
    FROM
        Sales s
    INNER JOIN
        SalesProducts sp
    ON
        s.SaleId = sp.SaleId
    INNER JOIN
        Products pp
    ON
        sp.ProductId = pp.ProductId
    INNER JOIN
        SalesPayments spp
    ON
        s.SaleId = spp.SaleId
    INNER JOIN
        Persons p
    ON
        s.PersonId = p.PersonId
    INNER JOIN
        PaymentMethods pm 
    ON
        spp.PaymentMethodId = pm.PaymentMethodId
    INNER JOIN
        ProductTypes pt
    ON
        pp.ProductTypeId = pt.ProductTypeId
    INNER JOIN
      (
        SELECT
          p3.ProductId,
            CASE
              WHEN p3.Name LIKE '%Oficina Fabio Aquino%' THEN 'Oficina Fabio Aquino'
            WHEN p3.Name LIKE '%Surf Pool Training%' THEN 'Surf Pool Training'
            WHEN p3.Name LIKE '%Burle Experience%' THEN 'Burle Experience'
            WHEN p3.Name LIKE '%Camomile Massagem%' THEN 'Camomile Massagem'
            WHEN pt3.Name LIKE '%CT Surfland%' THEN 'CT Surfland'
            ELSE 'Outros'
            END AS "Partner"
        FROM
          Products p3
        INNER JOIN
          ProductTypes pt3
        ON
          p3.ProductTypeId = pt3.ProductTypeId
      ) p4
    ON
      pp.ProductId = p4.ProductId
    WHERE
      pt.ProductTypeId not in (2, 6)
      ${
        paymentMethod
          ? `AND pm.Name = '${paymentMethod}'`
          : ""
      }
      ${
        saleDate
          ? `AND s.CreatedAt BETWEEN '${saleDate}' AND '${saleDateEnd}'`
          : ""
      }
      ${
        partnerName
          ? `AND p4.Partner = '${partnerName}'`
          : ""
      }
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