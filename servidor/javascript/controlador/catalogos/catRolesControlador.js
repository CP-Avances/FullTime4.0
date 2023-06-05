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
const builder = require('xmlbuilder');
const database_1 = __importDefault(require("../../database"));
const fs_1 = __importDefault(require("fs"));
class RolesControlador {
    // METODO PARA LISTAR ROLES DEL SISTEMA
    ListarRoles(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const ROL = yield database_1.default.query(`
      SELECT id, nombre FROM cg_roles ORDER BY nombre ASC
      `);
            if (ROL.rowCount > 0) {
                return res.jsonp(ROL.rows);
            }
            else {
                res.status(404).jsonp({ text: 'Registro no encontrado.' });
            }
        });
    }
    // METODO PARA ELIMINAR REGISTRO
    EliminarRol(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id;
            yield database_1.default.query(`
      DELETE FROM cg_roles WHERE id = $1
      `, [id]);
            res.jsonp({ message: 'Registro eliminado.' });
        });
    }
    // METODO PARA CREAR ARCHIVO XML
    FileXML(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var xml = builder.create('root').ele(req.body).end({ pretty: true });
            console.log(req.body.userName);
            let filename = "Roles-" + req.body.userName + '-' + req.body.userId + '-' + new Date().getTime() + '.xml';
            fs_1.default.writeFile(`xmlDownload/${filename}`, xml, function (err) {
            });
            res.jsonp({ text: 'XML creado', name: filename });
        });
    }
    // METODO PARA DESCARGAR ARCHIVO XML
    downloadXML(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const name = req.params.nameXML;
            let filePath = `servidor\\xmlDownload\\${name}`;
            res.sendFile(__dirname.split("servidor")[0] + filePath);
        });
    }
    // METODO PARA REGISTRAR ROL
    CrearRol(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { nombre } = req.body;
            yield database_1.default.query(`
       INSERT INTO cg_roles (nombre) VALUES ($1)
       `, [nombre]);
            res.jsonp({ message: 'Registro guardado.' });
        });
    }
    ListarRolesActualiza(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id;
            const ROL = yield database_1.default.query('SELECT * FROM cg_roles WHERE NOT id = $1', [id]);
            if (ROL.rowCount > 0) {
                return res.jsonp(ROL.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros.' });
            }
        });
    }
    ObtnenerUnRol(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const ROL = yield database_1.default.query('SELECT * FROM cg_roles WHERE id = $1', [id]);
            if (ROL.rowCount > 0) {
                return res.jsonp(ROL.rows);
            }
            else {
                res.status(404).jsonp({ text: 'Registro no encontrado.' });
            }
        });
    }
    ActualizarRol(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { nombre, id } = req.body;
            yield database_1.default.query('UPDATE cg_roles SET nombre = $1 WHERE id = $2', [nombre, id]);
            res.jsonp({ message: 'Registro Actualizado' });
        });
    }
}
const ROLES_CONTROLADOR = new RolesControlador();
exports.default = ROLES_CONTROLADOR;
