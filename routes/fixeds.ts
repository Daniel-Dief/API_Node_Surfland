import express from "express";
import mssql from "mssql";
import { dbConfigPortal } from "../dbConnectors";
import { queryPaymentMethods }  from "../querys/partnerSalesReport";

function getPaymentMethods (app : express.Application) {
  app.get("/fixeds/paymentMethods", async (req, res) => {
    try {
      const pool = await mssql.connect(dbConfigPortal);
      const queryStr = queryPaymentMethods();
      const result = await pool.request().query(queryStr);

      const arrPaymentMethods = result.recordset.map((record: any) => record.Name);
      res.status(200).send(arrPaymentMethods);
    } catch (err) {
      console.error(err);
      res.status(500).send("Error retrieving data from database");
    }
  });
}

export { getPaymentMethods };