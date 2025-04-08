import { ParsedQs } from 'qs';
import mysql from 'mysql2/promise';
import { dbConfigIntranet } from './dbConnectors';
import { changeProduct } from './types/log';
import { giftsLogs, insertProps } from './types/slGifts';

function formatarDataSQL(data: string | string[] | Date | ParsedQs | (string | ParsedQs)[] | undefined): string | undefined {
    if (data) { 
        const valor = Array.isArray(data) ? data[0] : data;
        if (valor instanceof Date) {
            return valor.toISOString().replace('T', ' ').slice(0, -1);
        }
        if (typeof valor === 'string') {
            const d = new Date(valor);
            return !isNaN(d.getTime()) ? d.toISOString().replace('T', ' ').slice(0, -1) : undefined;
        }
    }
}

// Função para salvar log no Banco de Dados
async function alterWaveLog(usrDocument : string, oldProduct : changeProduct, newProduct : changeProduct) {
    const connection = await mysql.createConnection(dbConfigIntranet);
    const [rows] = await connection.execute(
      `SELECT UserId FROM Users WHERE Login = ?`,
      [usrDocument]
    );
    const userId = (rows as any)[0]?.UserId ?? 0;
    
    if(userId == 0) {
      console.log("Erro ao buscar usuário");
    }
  
    const str_oldProduct = JSON.stringify(oldProduct);
    const str_newProduct = JSON.stringify(newProduct);
  
    await connection.execute(
      `INSERT INTO Logs (UserId, OldJSON, NewJSON, FunctionId) VALUES (?, ?, ?, 14)`,
      [userId, str_oldProduct, str_newProduct]
    );
  }

// Função para salvar log no Banco de Dados
async function addGiftsSLLog(usrDocument : string, insertBody: insertProps) {
  const connection = await mysql.createConnection(dbConfigIntranet);
  const [rows] = await connection.execute(
    `SELECT UserId FROM Users WHERE Login = ?`,
    [usrDocument]
  );
  const userId = (rows as any)[0]?.UserId ?? 0;
  
  if(userId == 0) {
    console.log("Erro ao buscar usuário");
  }

  const str_oldJSON = JSON.stringify({});
  const str_newJSON = JSON.stringify(insertBody);

  await connection.execute(
    `INSERT INTO Logs (UserId, OldJSON, NewJSON, FunctionId) VALUES (?, ?, ?, 17)`,
    [userId, str_oldJSON, str_newJSON]
  );
}

async function getHistoryGiftsSLLog(contractId : number) {
  const connection = await mysql.createConnection(dbConfigIntranet);
  const rows = await connection.execute(
    `
    SELECT
        p.Name,
        l.NewJSON,
        l.ChangedAt
    FROM
        Logs l
    INNER JOIN
        Users u
    ON
        l.UserId = u.UserId
    INNER JOIN
        Persons p
    ON
        u.PersonId = p.PersonId
    WHERE
        l.FunctionId = 17
        AND
        l.NewJSON LIKE '{"contractId":${contractId}%'
    `
  );
  
  const result : Array<giftsLogs> = [];

  (rows[0] as Array<any>).map(row => {
    result.push({
      Name: row.Name,
      JSON: JSON.parse(row.NewJSON),
      ChangedAt: row.ChangedAt
    })
  })

  return result;
}

export {
  formatarDataSQL,
  alterWaveLog,
  addGiftsSLLog,
  getHistoryGiftsSLLog
};