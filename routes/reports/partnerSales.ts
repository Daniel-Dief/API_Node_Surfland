import express from "express";
import mssql from "mssql";
import { formatarDataSQL } from "../../utils";
import { dbConfigPortal } from "../../dbConnectors";
import { queryPartnersReport } from "../../queryString";

function getPartnerSales(app : express.Application) {
  app.get("/reports/partnerSales", async (req, res) => {
    try {
      const pool = await mssql.connect(dbConfigPortal);
      const { paymentMethod, saleDate, saleDateEnd, partnerName } = req.query;
      let tempDateEnd : Date | undefined;

      if(saleDate && !saleDateEnd) {
        tempDateEnd = new Date(saleDate.toString());
        tempDateEnd.setUTCHours(23, 59, 59, 999);
      } else if(saleDate && saleDateEnd) {
        tempDateEnd = new Date(saleDateEnd.toString());
        tempDateEnd.setUTCHours(23, 59, 59, 999);
      }

      const queryStr = queryPartnersReport({
        paymentMethod: paymentMethod as string,
        saleDate: formatarDataSQL(saleDate),
        saleDateEnd: formatarDataSQL(tempDateEnd),
        partnerName: partnerName as string,
      });

      const result = await pool.request().query(queryStr);
      res.json(result.recordset);
    } catch (err) {
      console.error(err);
      res.status(500).send("Error retrieving data from database");
    }
  });
}

export { getPartnerSales };