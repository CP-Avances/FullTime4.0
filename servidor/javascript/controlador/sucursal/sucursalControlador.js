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
exports.SUCURSAL_CONTROLADOR = void 0;
const database_1 = __importDefault(require("../../database"));
const fs_1 = __importDefault(require("fs"));
const builder = require('xmlbuilder');
class SucursalControlador {
    // BUSCAR SUCURSALES POR EL NOMBRE
    BuscarNombreSucursal(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { nombre } = req.body;
            const SUCURSAL = yield database_1.default.query(`
      SELECT * FROM sucursales WHERE UPPER(nombre) = $1
      `, [nombre]);
            if (SUCURSAL.rowCount > 0) {
                return res.jsonp(SUCURSAL.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros' });
            }
        });
    }
    // GUARDAR REGISTRO DE SUCURSAL
    CrearSucursal(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { nombre, id_ciudad, id_empresa } = req.body;
            const response = yield database_1.default.query(`
      INSERT INTO sucursales (nombre, id_ciudad, id_empresa) VALUES ($1, $2, $3) RETURNING *
      `, [nombre, id_ciudad, id_empresa]);
            const [regimen] = response.rows;
            if (regimen) {
                return res.status(200).jsonp(regimen);
            }
            else {
                return res.status(404).jsonp({ message: 'mal_registro' });
            }
        });
    }
    // ACTUALIZAR REGISTRO DE ESTABLECIMIENTO
    ActualizarSucursal(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { nombre, id_ciudad, id } = req.body;
            yield database_1.default.query(`
      UPDATE sucursales SET nombre = $1, id_ciudad = $2 WHERE id = $3
      `, [nombre, id_ciudad, id]);
            res.jsonp({ message: 'Registro actualizado.' });
        });
    }
    // BUSCAR SUCURSAL POR ID DE EMPRESA
    ObtenerSucursalEmpresa(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id_empresa } = req.params;
            const SUCURSAL = yield database_1.default.query(`
      SELECT * FROM sucursales WHERE id_empresa = $1
      `, [id_empresa]);
            if (SUCURSAL.rowCount > 0) {
                return res.jsonp(SUCURSAL.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros.' });
            }
        });
    }
    // METODO DE BUSQUEDA DE SUCURSALES
    ListarSucursales(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const SUCURSAL = yield database_1.default.query(`
      SELECT s.id, s.nombre, s.id_ciudad, c.descripcion, s.id_empresa, ce.nombre AS nomempresa
      FROM sucursales s, ciudades c, cg_empresa ce
      WHERE s.id_ciudad = c.id AND s.id_empresa = ce.id
      ORDER BY s.id
      `);
            if (SUCURSAL.rowCount > 0) {
                return res.jsonp(SUCURSAL.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros.' });
            }
        });
    }
    // METODO PARA ELIMINAR REGISTRO
    EliminarRegistros(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id;
            yield database_1.default.query(`
      DELETE FROM sucursales WHERE id = $1
      `, [id]);
            res.jsonp({ message: 'Registro eliminado.' });
        });
    }
    // METODO PARA CREAR ARCHIVO XML
    FileXML(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var xml = builder.create('root').ele(req.body).end({ pretty: true });
            let filename = "Sucursales-" + req.body.userName + '-' + req.body.userId + '-' + new Date().getTime() + '.xml';
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
    // METODO PARA BUSCAR DATOS DE UNA SUCURSAL
    ObtenerUnaSucursal(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const SUCURSAL = yield database_1.default.query(`
      SELECT s.id, s.nombre, s.id_ciudad, c.descripcion, s.id_empresa, ce.nombre AS nomempresa
      FROM sucursales s, ciudades c, cg_empresa ce
      WHERE s.id_ciudad = c.id AND s.id_empresa = ce.id AND s.id = $1
      `, [id]);
            if (SUCURSAL.rowCount > 0) {
                return res.jsonp(SUCURSAL.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros.' });
            }
        });
    }
}
exports.SUCURSAL_CONTROLADOR = new SucursalControlador();
exports.default = exports.SUCURSAL_CONTROLADOR;
