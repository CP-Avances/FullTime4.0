"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// CONEXION CON LA BASE DE DATOS POSTGRESQL
const pg_pool_1 = __importDefault(require("pg-pool"));
const pool = new pg_pool_1.default({
    user: 'postgres',
    host: '192.168.0.145',
    port: 5432,
    database: 'prueba_empresa',
    password: 'fu11tim3'
});
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.log("Error durante la conexión", err);
    }
    else {
        console.log("Conexión exitosa");
    }
});
exports.default = pool;
