import express from "express";
import mssql from "mssql";
import { formatarDataSQL } from "../../utils";
import { dbConfigPWI } from "../../dbConnectors";
import { queryMonthlyIncomeReport } from "../../querys/monthlyIncomeReport";
import { authenticateToken } from "../../auth";

function getmonthlyIncome(app : express.Application) {
  app.get("/reports/monthlyIncome", async (req, res) => {
    if(!authenticateToken(req.header('Authorization'))){
      res.status(401).json({ error: 'Token inválido' });
      return;
    }
    let pool
    try {
      const configWithTimeout = {
        ...dbConfigPWI,
        connectionTimeout: 600000, // 5 minutos
        requestTimeout: 600000,    // 5 minutos
      };
    
      pool = await mssql.connect(configWithTimeout);
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

      const queryStr = queryMonthlyIncomeReport({
        startDate: tempStartDate,
        endDate: tempEndDate
      });
      
      const jsontest = {"msg": queryStr}

      const result = await pool.request().query(queryStr);
      pool.close()
      res.json(jsontest);
    } catch (err) {
      console.error(err);
      res.status(500).send("Error retrieving data from database");
    } finally {
        if (pool) {
          await pool.close();
        };
      }
  });
}

export { getmonthlyIncome };