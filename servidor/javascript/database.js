"use strict";
// CONEXION CON LA BASE DE DATOS POSTGRESQL
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pg_pool_1 = __importDefault(require("pg-pool"));
const pool = new pg_pool_1.default({
    user: 'fulltime',
<<<<<<< HEAD
    host: '192.168.0.156',
    port: 5432,
    database: 'fulltime4_original',
=======
    host: '186.4.226.49',
    port: 9192,
    database: 'fulltime4_prueba',
>>>>>>> 5a3a5511b51668e4fbbcf1e39562ab2b63c1d89d
    password: 'fulltime'
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
