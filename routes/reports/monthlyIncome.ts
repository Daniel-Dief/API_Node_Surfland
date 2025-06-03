import express from "express";
import mssql from "mssql";
import { formatarDataSQL } from "../../utils";
import { dbConfigPWI } from "../../dbConnectors";
import { queryMonthlyIncomeReport } from "../../querys/monthlyIncomeReport";

function getmonthlyIncome(app : express.Application) {
  app.get("/reports/monthlyIncome", async (req, res) => {
    try {
      const pool = await mssql.connect(dbConfigPWI);
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

      const result = await pool.request().query(queryStr);
      res.json(result.recordset);
    } catch (err) {
      console.error(err);
      res.status(500).send("Error retrieving data from database");
    }
  });
}

export { getmonthlyIncome };