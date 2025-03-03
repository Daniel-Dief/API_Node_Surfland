import express from "express";
import sql from "mssql";
import { Client } from "pg";
import { dbConfigPortal, dbConfigIntranet, dbConfigTravel } from "../../dbConnectors";
import { authenticateToken } from "../../auth";
import { changeProduct } from "../../types/log";
import { Log } from "../../utils";
import mysql from "mysql2/promise";
import apiSheduleRequest from "../CodeChange/apiPortal"
import {
  queryCartByLocator,
  queryCheckIsAdmin,
  queryCheckHasPermission,
  querySimpleGetProduct,
  queryUpdateProduct,
  queryGetProduct
} from "../../querys/alterWaveFunction"

// Function to fetch schedules from the database
function getShedulesByDate(app : express.Application) {
    app.get('/schedules/:date', async (req, res) => {
        if(!authenticateToken(req.header('Authorization'))){
            res.status(401).json({ error: 'Token inválido' });
            return;
        }
        const { date } = req.params;
        
        try {
            const apiResponse = await apiSheduleRequest(date);
            res.json(apiResponse);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erro ao buscar horários' });
        }
    });
}

// Função para buscar um produto pelo código de barras
function getProductByBarcode(app : express.Application) {
  app.get('/product/:searchMethod', async (req, res) => {
      if(!authenticateToken(req.header('Authorization'))){
        res.status(401).json({ error: 'Token inválido' });
        return;
      }
    
      const { searchMethod } = req.params;
    
      try {
        await sql.connect(dbConfigPortal);
        const result = await sql.query(queryGetProduct(searchMethod));
    
        res.json(result.recordset);
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao buscar produto' });
      }
    });
}

// Função para atualizar um produto
function postUpdateProduct(app : express.Application) {
  app.post('/product/update', async (req, res) => {
      if(!authenticateToken(req.header('Authorization'))){
        res.status(401).json({ error: 'Token inválido' });
        return;
      }
      const { usrDocument, searchMethod, product_id, schedule_id, date } = req.body;
    
      if(usrDocument === null || usrDocument === undefined) {
        res.status(400).json({ error: 'Documento do usuário não informado' });
      }
    
      try {
        await sql.connect(dbConfigPortal);
    
        const requestProduct = await sql.query(querySimpleGetProduct(searchMethod));
      
        const oldProduct : changeProduct = {
          searchMethod: searchMethod,
          productId: requestProduct.recordset[0].ProductId,
          scheduleId: requestProduct.recordset[0].ScheduleId,
          date: requestProduct.recordset[0].Date
        }
      
        const newProduct : changeProduct = {
          searchMethod: searchMethod,
          productId: product_id,
          scheduleId: schedule_id,
          date: date
        }
    
        await sql.query(queryUpdateProduct(searchMethod, product_id, schedule_id, date));
    
        await Log(usrDocument, oldProduct, newProduct);
    
        res.json({ success: true });
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao atualizar produto' });
      }
    });
}

// Verificar login do usuário
function postCheckAccess(app : express.Application) {
  app.post('/checkAccess', async (req, res) => {
      const connection = await mysql.createConnection(dbConfigIntranet)
      const { functionId, usrLogin, usrPassword } = req.body;
    
      const [adminRows] = await connection.execute(queryCheckIsAdmin(usrLogin, usrPassword));
    
      if((adminRows as any)[0]?.result === 1) {
        res.status(200).json({
          access: true,
          isAdmin: true
        });
        return;
      }
    
      const [rows] = await connection.execute(queryCheckHasPermission(usrLogin, usrPassword, functionId));
    
      await connection.end();
    
      // Pegar o valor da contagem (0 ou 1)
      const result = (rows as any)[0]?.result ?? 0;
      
      if(result === 1) {
        res.status(200).json({
          access: true,
          isAdmin: false
        });
      } else {
        res.status(401).json({
          access: false,
          isAdmin: false
        });
      }
    });
}

// Função para buscar um produto pelo código de barras
function getCartByLocator(app : express.Application) {
  app.get('/cart/:locator', async (req, res) => {
      if(!authenticateToken(req.header('Authorization'))){
        res.status(401).json({ error: 'Token inválido' });
        return;
      }
    
      const { locator } = req.params;
      
      try {
        const clientTravel = new Client(dbConfigTravel);
        await clientTravel.connect();
        
        const result = await clientTravel.query(queryCartByLocator(locator));
        await clientTravel.end();
    
        res.json(result.rows);
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao buscar carrinho' });
      }
    })
}

export {
  getShedulesByDate,
  getProductByBarcode,
  postUpdateProduct,
  postCheckAccess,
  getCartByLocator
}