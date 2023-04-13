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
exports.PROCESOS_CONTROLADOR = void 0;
const fs_1 = __importDefault(require("fs"));
const builder = require('xmlbuilder');
const database_1 = __importDefault(require("../../database"));
class ProcesoControlador {
    list(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const Sin_proc_padre = yield database_1.default.query('SELECT * FROM cg_procesos AS cg_p WHERE cg_p.proc_padre IS NULL ORDER BY cg_p.nombre ASC');
            const Con_proc_padre = yield database_1.default.query('SELECT cg_p.id, cg_p.nombre, cg_p.nivel, nom_p.nombre AS proc_padre FROM cg_procesos AS cg_p, NombreProcesos AS nom_p WHERE cg_p.proc_padre = nom_p.id ORDER BY cg_p.nombre ASC');
            Sin_proc_padre.rows.forEach((obj) => {
                Con_proc_padre.rows.push(obj);
            });
            res.jsonp(Con_proc_padre.rows);
        });
    }
    getOne(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const unaProvincia = yield database_1.default.query('SELECT * FROM cg_procesos WHERE id = $1', [id]);
            if (unaProvincia.rowCount > 0) {
                return res.jsonp(unaProvincia.rows);
            }
            res.status(404).jsonp({ text: 'El proceso no ha sido encontrado' });
        });
    }
    create(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { nombre, nivel, proc_padre } = req.body;
            yield database_1.default.query('INSERT INTO cg_procesos (nombre, nivel, proc_padre) VALUES ($1, $2, $3)', [nombre, nivel, proc_padre]);
            console.log(req.body);
            res.jsonp({ message: 'El departamento ha sido guardado en éxito' });
        });
    }
    getIdByNombre(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { nombre } = req.params;
            const unIdProceso = yield database_1.default.query('SELECT id FROM cg_procesos WHERE nombre = $1', [nombre]);
            if (unIdProceso != null) {
                return res.jsonp(unIdProceso.rows);
            }
            res.status(404).jsonp({ text: 'El proceso no ha sido encontrado' });
        });
    }
    ActualizarProceso(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { nombre, nivel, proc_padre, id } = req.body;
            yield database_1.default.query('UPDATE cg_procesos SET nombre = $1, nivel = $2, proc_padre = $3 WHERE id = $4', [nombre, nivel, proc_padre, id]);
            res.jsonp({ message: 'El proceso actualizado exitosamente' });
        });
    }
    EliminarProceso(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id;
            yield database_1.default.query('DELETE FROM cg_procesos WHERE id = $1', [id]);
            res.jsonp({ message: 'Registro eliminado.' });
        });
    }
    FileXML(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var xml = builder.create('root').ele(req.body).end({ pretty: true });
            console.log(req.body.userName);
            let filename = "Procesos-" + req.body.userName + '-' + req.body.userId + '-' + new Date().getTime() + '.xml';
            fs_1.default.writeFile(`xmlDownload/${filename}`, xml, function (err) {
                if (err) {
                    return console.log(err);
                }
                console.log("Archivo guardado");
            });
            res.jsonp({ text: 'XML creado', name: filename });
        });
    }
    downloadXML(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const name = req.params.nameXML;
            let filePath = `servidor\\xmlDownload\\${name}`;
            res.sendFile(__dirname.split("servidor")[0] + filePath);
        });
    }
}
exports.PROCESOS_CONTROLADOR = new ProcesoControlador();
exports.default = exports.PROCESOS_CONTROLADOR;
