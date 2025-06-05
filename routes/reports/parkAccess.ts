import express from "express";
import mssql from "mssql";
import { formatarDataSQL } from "../../utils";
import { dbConfigPortal } from "../../dbConnectors";
import { queryparkAccess } from "../../querys/parkAccessReport";
import { authenticateToken } from "../../auth";

function getparkAccess(app : express.Application) {
  app.get("/reports/parkAccess", async (req, res) => {
    if(!authenticateToken(req.header('Authorization'))){
      res.status(401).json({ error: 'Token inválido' });
      return;
    }
    try {
      const pool = await mssql.connect(dbConfigPortal);
      const { startDate, endDate } = req.query;
      let tempStartDate : Date | string | undefined;
      let tempEndDate : Date | string | undefined;

      if(startDate && endDate) {
        tempStartDate = new Date(startDate.toString());
        tempStartDate.setUTCHours(0, 0, 0, 0);
        tempEndDate = new Date(endDate.toString());
        tempEndDate.setUTCHours(23, 59, 59, 999);
      } else {
        throw new Error("Start date and end date are required");
      }

      tempStartDate = formatarDataSQL(tempStartDate);
      tempEndDate = formatarDataSQL(tempEndDate);

      if(!tempStartDate || !tempEndDate) {
        throw new Error("Invalid date format");
      }

      const queryStr = queryparkAccess({
        startDate: tempStartDate,
        endDate: tempEndDate
      });

      const result = await pool.request().query(queryStr);
      pool.close()
      res.json(result.recordset);
    } catch (err) {
      console.error(err);
      res.status(500).send("Error retrieving data from database");
    }
  });
}

export { getparkAccess };