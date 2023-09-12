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
exports.ENROLADOS_CONTROLADOR = void 0;
const database_1 = __importDefault(require("../../database"));
const xlsx_1 = __importDefault(require("xlsx"));
const fs_1 = __importDefault(require("fs"));
const builder = require('xmlbuilder');
class EnroladoControlador {
    ListarEnrolados(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const ENROLADOS = yield database_1.default.query('SELECT * FROM cg_enrolados');
            if (ENROLADOS.rowCount > 0) {
                return res.jsonp(ENROLADOS.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros' });
            }
        });
    }
    ObtenerUnEnrolado(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const ENROLADOS = yield database_1.default.query('SELECT * FROM cg_enrolados WHERE id = $1', [id]);
            if (ENROLADOS.rowCount > 0) {
                return res.jsonp(ENROLADOS.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros' });
            }
        });
    }
    CrearEnrolado(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id_usuario, nombre, contrasenia, activo, finger, data_finger, codigo } = req.body;
            yield database_1.default.query('INSERT INTO cg_enrolados (id_usuario, nombre, contrasenia, activo, finger, data_finger, codigo) VALUES ($1, $2,$3, $4, $5, $6, $7)', [id_usuario, nombre, contrasenia, activo, finger, data_finger, codigo]);
            res.jsonp({ message: 'Se ha añadido correctamente al catálogo enrolados' });
        });
    }
    ObtenerRegistroEnrolado(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id_usuario } = req.params;
            const ENROLADOS = yield database_1.default.query('SELECT id FROM cg_enrolados WHERE id_usuario = $1', [id_usuario]);
            if (ENROLADOS.rowCount > 0) {
                return res.jsonp(ENROLADOS.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se ha encontrado en el catálogo enrolados' });
            }
        });
    }
    ObtenerUltimoId(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const ENROLADOS = yield database_1.default.query('SELECT MAX(id) FROM cg_enrolados');
            if (ENROLADOS.rowCount > 0) {
                return res.jsonp(ENROLADOS.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros' });
            }
        });
    }
    ActualizarEnrolado(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id_usuario, nombre, contrasenia, activo, finger, data_finger, codigo, id } = req.body;
            yield database_1.default.query('UPDATE cg_enrolados SET id_usuario = $1, nombre = $2, contrasenia = $3, activo = $4, finger = $5, data_finger = $6, codigo = $7 WHERE id = $8', [id_usuario, nombre, contrasenia, activo, finger, data_finger, codigo, id]);
            res.jsonp({ message: 'Usuario Enrolado actualizado exitosamente' });
        });
    }
    EliminarEnrolado(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id;
            yield database_1.default.query('DELETE FROM cg_enrolados WHERE id = $1', [id]);
            res.jsonp({ message: 'Registro eliminado.' });
        });
    }
    CargaPlantillaEnrolado(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let list = req.files;
            let cadena = list.uploads[0].path;
            let filename = cadena.split("\\")[1];
            var filePath = `./plantillas/${filename}`;
            const workbook = xlsx_1.default.readFile(filePath);
            const sheet_name_list = workbook.SheetNames;
            const plantilla = xlsx_1.default.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);
            plantilla.forEach((data) => __awaiter(this, void 0, void 0, function* () {
                const { cedula, contrasenia, finger, data_finger } = data;
                //Nombre, Apellido, Código e id_usuario del empleado
                const datosEmpleado = yield database_1.default.query('SELECT id, nombre, apellido, codigo, estado FROM empleados WHERE cedula = $1', [cedula]);
                let nombre = datosEmpleado.rows[0]['nombre'] + ' ' + datosEmpleado.rows[0]['apellido'];
                let codigo = datosEmpleado.rows[0]['codigo'];
                if (datosEmpleado.rows[0]['estado'] === 1) {
                    var activo = true;
                }
                else {
                    activo = false;
                }
                const id_usuario = yield database_1.default.query('SELECT id FROM usuarios WHERE id_empleado = $1', [datosEmpleado.rows[0]['id']]);
                if (cedula != undefined) {
                    yield database_1.default.query('INSERT INTO cg_enrolados (id_usuario, nombre, contrasenia, activo, finger, data_finger, codigo) VALUES ($1, $2,$3, $4, $5, $6, $7)', [id_usuario.rows[0]['id'], nombre, contrasenia, activo, finger, data_finger, codigo]);
                }
                else {
                    res.jsonp({ error: 'plantilla equivocada' });
                }
            }));
            res.jsonp({ message: 'La plantilla a sido receptada' });
            fs_1.default.unlinkSync(filePath);
        });
    }
    FileXML(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var xml = builder.create('root').ele(req.body).end({ pretty: true });
            console.log(req.body.userName);
            let filename = "Enrolados-" + req.body.userName + '-' + req.body.userId + '-' + new Date().getTime() + '.xml';
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
    ObtenerDatosEmpleado(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { usuario } = req.params;
            const ENROLADOS = yield database_1.default.query('SELECT e.id, e.nombre, e.apellido, e.cedula, e.codigo, e.estado, u.id FROM empleados AS e, usuarios AS u WHERE e.id = u.id_empleado AND u.usuario = $1', [usuario]);
            if (ENROLADOS.rowCount > 0) {
                return res.jsonp(ENROLADOS.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se ha encontrado registros' });
            }
        });
    }
}
exports.ENROLADOS_CONTROLADOR = new EnroladoControlador();
exports.default = exports.ENROLADOS_CONTROLADOR;
