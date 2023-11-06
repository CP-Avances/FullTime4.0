"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CONEXION_DATABASES_CONTROLADOR = void 0;
const pg_pool_1 = __importDefault(require("pg-pool"));
class ConexionDataBasesControlador {
    // METODO PARA OPTENER EL NOMBRE DE LA BASE DE DATOS
    setDatabaseName(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { nombre } = req.params;
            console.log('entro en conexion data base');
            const db_cliente = new pg_pool_1.default({
                user: 'postgres',
                host: 'localhost',
                port: 5432,
                database: nombre,
                password: '12345'
            });
            db_cliente.query('SELECT NOW()', (err, res) => {
                if (err) {
                    console.log("Error durante la conexión", err);
                }
                else {
                    console.log("Conexión exitosa base: ", nombre);
                }
            });
            exports.cliente = db_cliente;
            return res.json(exports.cliente);
        });
    }
}
exports.CONEXION_DATABASES_CONTROLADOR = new ConexionDataBasesControlador();
exports.default = exports.CONEXION_DATABASES_CONTROLADOR;
