import express from "express";
import { Client } from "pg";
import { dbConfigSL } from "../../dbConnectors";
import { authenticateToken } from "../../auth";
import {
    queryListAllGifts,
    queryGetContract,
    queryGetGiftsByContract,
    queryInsertGifts,
    checkContractId,
    checkGiftsId
} from "../../querys/addGiftsFunction"
import { contractInfos, insertProps } from "../../types/slGifts"
import { addGiftsSLLog, getHistoryGiftsSLLog } from "../../utils";

// Função para listar todos os brindes disponiveis
function getAllGifts(app : express.Application) {
  app.get('/slGifts/getAllGifts/', async (req, res) => {
      if(!authenticateToken(req.header('Authorization'))){
        res.status(401).json({ error: 'Token inválido' });
        return;
      }
      
      try {
        const clientSL = new Client(dbConfigSL);
        await clientSL.connect();
        
        const result = await clientSL.query(queryListAllGifts());
        await clientSL.end();
    
        res.json(result.rows);
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao listar os brindes' });
      }
  })
}

// Função para listar as informações do contrato
function getContract(app : express.Application) {
  app.get('/slGifts/getContract', async (req, res) => {
      if(!authenticateToken(req.header('Authorization'))){
        res.status(401).json({ error: 'Token inválido' });
        return;
      }
      
      const { contractId } = req.query;

      if(!contractId) {
        res.status(400).json({ error: 'Id do contrato não informado' });
        return
      }

      let formatcontractId : number | null = null;

      try {
        formatcontractId = parseInt(contractId.toString());
      } catch (error) {
        console.error(error);
        res.status(400).json({ error: 'Id do contrato inválido' });
        return
      }

      const logHistory = await getHistoryGiftsSLLog(formatcontractId);

      try {
        const clientSL = new Client(dbConfigSL);
        await clientSL.connect();
        
        const result = await clientSL.query(
          queryGetContract(formatcontractId)
        );
        await clientSL.end();
    
        const contractInfo = result.rows[0] as contractInfos;

        if(!contractId) {
          res.status(400).json({ error: 'Contrato não encontrado' });
          return;
        }

        if(logHistory) {
          contractInfo.logHistory = logHistory;
        }

        res.json(contractInfo);
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao listar as informações do contrato' });
      }
  })
}

// Função para listar os brindes do contrato
function getGiftsByContract(app : express.Application) {
  app.get('/slGifts/getGiftsByContract', async (req, res) => {
      if(!authenticateToken(req.header('Authorization'))){
        res.status(401).json({ error: 'Token inválido' });
        return;
      }
      
      const { contractId } = req.query;

      if(!contractId) {
        res.status(400).json({ error: 'Id do contrato não informado' });
        return
      }

      let formatcontractId : number | null = null;

      try {
        formatcontractId = parseInt(contractId.toString());
      } catch (error) {
        console.error(error);
        res.status(400).json({ error: 'Id do contrato inválido' });
        return
      }

      try {
        const clientSL = new Client(dbConfigSL);
        await clientSL.connect();
        
        const result = await clientSL.query(
          queryGetGiftsByContract(formatcontractId)
        );
        await clientSL.end();
    
        res.json(result.rows);
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao listar os brindes do contrato' });
      }
  })
}

// Função para listar os brindes do contrato
function insertGifts(app : express.Application) {
  app.post('/slGifts/insertGifts', async (req, res) => {
      if(!authenticateToken(req.header('Authorization'))){
        res.status(401).json({ error: 'Token inválido' });
        return;
      }
      
      let insertBody : insertProps | null = null;
      let usrDocument : string | null = null;

      try {
        insertBody = {
          contractId: parseInt(req.body.contractId),
          giftsId: req.body.giftsId
        }
        usrDocument = req.body.usrDocument;
      } catch (error) {
        console.error(error);
        res.status(400).json({ error: 'Corpo da requisição inválido' });
      }

      if(!insertBody || !insertBody.contractId || insertBody.giftsId.length == 0 || !usrDocument) {
        res.status(400).json({ error: 'Corpo da requisição inválido' });
        return
      }

      const checkContract = await checkContractId(insertBody.contractId);
      
      if(!checkContract) {
        res.status(400).json({ error: 'Contrato não encontrado' });
        return
      }

      const checkGifts = await checkGiftsId(insertBody.giftsId);

      if(!checkGifts) {
        res.status(400).json({ error: 'Brinde(s) não encontrado' });
        return
      }

      try {
        const clientSL = new Client(dbConfigSL);
        await clientSL.connect();
        
        const result = await clientSL.query(
          queryInsertGifts(insertBody)
        );

        await clientSL.end();
        
        addGiftsSLLog(usrDocument, insertBody);

        res.status(200).json({
          success: true,
          message: 'Brindes adicionados ao contrato com sucesso!'
        });
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao adicionar brindes ao contrato!' });
      }
  })
}

export {
    getAllGifts,
    getContract,
    getGiftsByContract,
    insertGifts
}