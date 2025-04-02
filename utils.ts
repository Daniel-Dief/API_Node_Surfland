import { ParsedQs } from 'qs';
import mysql from 'mysql2/promise';
import { dbConfigIntranet } from './dbConnectors';
import { changeProduct } from './types/log';

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
      `INSERT INTO Logs (UserId, OldJSON, NewJSON) VALUES (?, ?, ?, 14)`,
      [userId, str_oldProduct, str_newProduct]
    );
  }

export { formatarDataSQL, alterWaveLog };