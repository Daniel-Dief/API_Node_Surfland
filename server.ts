import express from "express";
import cors from "cors";
import { getPartnerSales } from "./routes/reports/partnerSales";
import { getPaymentMethods } from "./routes/fixeds";
import {
  getShedulesByDate,
  getCartByLocator,
  getProductByBarcode,
  postCheckAccess,
  postUpdateProduct
} from "./routes/functions/alterWaveRoutes";
import {
  getAllGifts,
  getContract,
  getGiftsByContract,
  insertGifts
} from "./routes/functions/addGiftsSL";
import { getmonthlyIncome } from "./routes/reports/monthlyIncome";
import { getmonthlyUtilization } from "./routes/reports/monthlyUtilization";
import { getparkAccess } from "./routes/reports/parkAccess";

const app = express();
app.use(cors());
const port = 3222;

// Middleware to parse JSON
app.use(express.json());

//-----------------------Rotas-----------------------
// Relatório de vendas por parceiros
getPartnerSales(app);
getPaymentMethods(app);

// Alteração de sessões 
getShedulesByDate(app);
getCartByLocator(app);
getProductByBarcode(app);
postCheckAccess(app);
postUpdateProduct(app);

// Brindes do SL
getAllGifts(app);
getContract(app);
getGiftsByContract(app);
insertGifts(app);

// Relatório financeiro
getmonthlyIncome(app);
getmonthlyUtilization(app);

// Relatório acesso ao parque
getparkAccess(app);

// Iniciar servidor
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});