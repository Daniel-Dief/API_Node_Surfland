require('dotenv').config();

// Configuração da conexão com o banco de dados
const dbConfigIntranet = {
    host: process.env.DB_INTRANET_HOST ?? "",
    user: process.env.DB_INTRANET_USER ?? "",
    password: process.env.DB_INTRANET_PASSWORD ?? "",
    database: process.env.DB_INTRANET_DATABASE ?? "",
}

const dbConfigPortal = {
    user: process.env.DB_PORTAL_USER ?? "",
    password: process.env.DB_PORTAL_PASSWORD ?? "",
    server: process.env.DB_PORTAL_HOST ?? "",
    database: process.env.DB_PORTAL_DATABASE ?? "",
    options: {
        encrypt: true,
        trustServerCertificate: true,
    },
};

const dbConfigPWI = {
    user: process.env.DB_PWI_USER ?? "",
    password: process.env.DB_PWI_PASSWORD ?? "",
    port: Number(process.env.DB_PWI_PORT ?? ""),
    server: process.env.DB_PWI_HOST ?? "",
    database: process.env.DB_PWI_DATABASE ?? "",
    options: {
        encrypt: true,
        trustServerCertificate: true,
    },
    requestTimeout: 180000
};

const dbConfigTravel = {
    host: process.env.DB_TRAVEL_HOST ?? "",
    port: Number(process.env.DB_TRAVEL_PORT ?? ""),
    user: process.env.DB_TRAVEL_USER ?? "",
    password: process.env.DB_TRAVEL_PASSWORD ?? "",
    database: process.env.DB_TRAVEL_DATABASE ?? "",
}

const dbConfigSL = {
    host: process.env.DB_SL_HOST ?? "",
    port: Number(process.env.DB_SL_PORT ?? ""),
    user: process.env.DB_SL_USER ?? "",
    password: process.env.DB_SL_PASSWORD ?? "",
    database: process.env.DB_SL_DATABASE ?? "",
}

export { dbConfigIntranet, dbConfigPortal, dbConfigTravel, dbConfigSL, dbConfigPWI };
