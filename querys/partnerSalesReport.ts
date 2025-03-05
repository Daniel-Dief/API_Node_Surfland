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
        CASE
          WHEN ROW_NUMBER() OVER (PARTITION BY s.SaleId
        ORDER BY
          s.SaleId) = 1 
                  THEN spp.Value
          ELSE NULL
        END AS "ValorPago",
        CASE
          WHEN ROW_NUMBER() OVER (PARTITION BY s.SaleId
        ORDER BY
          s.SaleId) = 1 
                  THEN spp.Installments
          ELSE NULL
        END AS "QtdParcelas",
        CASE
          WHEN ROW_NUMBER() OVER (PARTITION BY s.SaleId
        ORDER BY
          s.SaleId) = 1 
                  THEN (spp.Value / spp.Installments)
          ELSE NULL
        END AS "ValorParcela",
        CASE
          WHEN ROW_NUMBER() OVER (PARTITION BY s.SaleId
        ORDER BY
          s.SaleId) = 1 
                  THEN pm.Name
          ELSE NULL
        END AS "FormaPagamento",
        CASE
          WHEN ROW_NUMBER() OVER (PARTITION BY s.SaleId
        ORDER BY
          s.SaleId) = 1 
                  THEN spp.Usn
          ELSE NULL
        END AS "NSU",
        CASE
          WHEN ROW_NUMBER() OVER (PARTITION BY s.SaleId
        ORDER BY
          s.SaleId) = 1 
                  THEN spp.AuthorizationCode
          ELSE NULL
        END AS "CodigoAutorizacao",
        pt.ProductTypeId AS "CodigoCategoria",
        pt.Name AS "CategoriaProduto",
        p4.Partner AS "Parceiro"
      FROM
        Sales s
      LEFT JOIN 
              SalesProducts sp ON
        s.SaleId = sp.SaleId
      LEFT JOIN 
              Products pp ON
        sp.ProductId = pp.ProductId
      LEFT JOIN 
              SalesPayments spp ON
        s.SaleId = spp.SaleId
      LEFT JOIN 
              Persons p ON
        s.PersonId = p.PersonId
      LEFT JOIN 
              PaymentMethods pm ON
        spp.PaymentMethodId = pm.PaymentMethodId
      LEFT JOIN 
              ProductTypes pt ON
        pp.ProductTypeId = pt.ProductTypeId
      LEFT JOIN (
        SELECT
          p3.ProductId,
          CASE
            WHEN p3.Name LIKE '%Oficina Fabio Aquino%' THEN 'Oficina Fabio Aquino'
            WHEN p3.Name LIKE '%Surf Pool Training%' THEN 'Surf Pool Training'
            WHEN p3.Name LIKE '%Burle Experience%' THEN 'Burle Experience'
            WHEN p3.Name LIKE '%Camomile Massagem%' THEN 'Camomile Massagem'
            WHEN p3.Name LIKE '%Aprimore Surf%' THEN 'Aprimore Surf'
            WHEN p3.Name LIKE '%CT Surfland%' THEN 'CT Surfland'
            ELSE 'Outros'
          END AS "Partner"
        FROM
          Products p3
          ) p4 ON
        pp.ProductId = p4.ProductId
      WHERE
        pt.ProductTypeId NOT IN (2, 6)
        AND s.StatusId = 4
        ${
          paymentMethod ? `AND pm.Name = '${paymentMethod}'` : ''
        }
        ${
          saleDate ? `AND s.CreatedAt BETWEEN '${saleDate}' AND '${saleDateEnd}'` : ''
        }
        ${
          partnerName ? `AND p4.Partner = '${partnerName}'` : ''
        }
      ORDER BY
        s.SaleId
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