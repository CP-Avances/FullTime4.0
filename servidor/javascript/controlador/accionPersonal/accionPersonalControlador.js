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
exports.ACCION_PERSONAL_CONTROLADOR = void 0;
const database_1 = __importDefault(require("../../database"));
const ImagenCodificacion_1 = require("../../libs/ImagenCodificacion");
const fs_1 = __importDefault(require("fs"));
const builder = require('xmlbuilder');
class AccionPersonalControlador {
    /** TABLA TIPO_ACCION */
    ListarTipoAccion(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const ACCION = yield database_1.default.query('SELECT * FROM tipo_accion');
            if (ACCION.rowCount > 0) {
                return res.jsonp(ACCION.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros' });
            }
        });
    }
    CrearTipoAccion(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { descripcion } = req.body;
            yield database_1.default.query('INSERT INTO tipo_accion (descripcion) VALUES($1)', [descripcion]);
            res.jsonp({ message: 'Registro guardado' });
        });
    }
    EncontrarUltimoTipoAccion(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const ACCION = yield database_1.default.query('SELECT MAX(id) AS id FROM tipo_accion');
            if (ACCION.rowCount > 0) {
                return res.jsonp(ACCION.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros' });
            }
        });
    }
    /** TABLA CARGO_PROPUESTO */
    ListarCargoPropuestos(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const ACCION = yield database_1.default.query('SELECT * FROM cargo_propuesto');
            if (ACCION.rowCount > 0) {
                return res.jsonp(ACCION.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros' });
            }
        });
    }
    CrearCargoPropuesto(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { descripcion } = req.body;
            yield database_1.default.query('INSERT INTO cargo_propuesto (descripcion) VALUES($1)', [descripcion]);
            res.jsonp({ message: 'Registro guardado' });
        });
    }
    EncontrarUltimoCargoP(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const ACCION = yield database_1.default.query('SELECT MAX(id) AS id FROM cargo_propuesto');
            if (ACCION.rowCount > 0) {
                return res.jsonp(ACCION.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros' });
            }
        });
    }
    ListarUnCargoPropuestos(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const ACCION = yield database_1.default.query('SELECT * FROM cargo_propuesto WHERE id = $1', [id]);
            if (ACCION.rowCount > 0) {
                return res.jsonp(ACCION.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros' });
            }
        });
    }
    /** TABLA DECRETO_ACUERDO_RESOL */
    ListarDecretos(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const ACCION = yield database_1.default.query('SELECT * FROM decreto_acuerdo_resol');
            if (ACCION.rowCount > 0) {
                return res.jsonp(ACCION.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros' });
            }
        });
    }
    CrearDecreto(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { descripcion } = req.body;
            yield database_1.default.query('INSERT INTO decreto_acuerdo_resol (descripcion) VALUES($1)', [descripcion]);
            res.jsonp({ message: 'Registro guardado' });
        });
    }
    EncontrarUltimoDecreto(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const ACCION = yield database_1.default.query('SELECT MAX(id) AS id FROM decreto_acuerdo_resol');
            if (ACCION.rowCount > 0) {
                return res.jsonp(ACCION.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros' });
            }
        });
    }
    ListarUnDecreto(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const ACCION = yield database_1.default.query('SELECT * FROM decreto_acuerdo_resol WHERE id = $1', [id]);
            if (ACCION.rowCount > 0) {
                return res.jsonp(ACCION.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros' });
            }
        });
    }
    /** TABLA TIPO_ACCION_PERSONAL */
    ListarTipoAccionPersonal(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const ACCION = yield database_1.default.query('SELECT tap.id, tap.id_tipo, tap.descripcion, tap.base_legal, ' +
                'tap.tipo_permiso, tap.tipo_vacacion, tap.tipo_situacion_propuesta, ta.descripcion AS nombre ' +
                'FROM tipo_accion_personal AS tap, tipo_accion AS ta WHERE ta.id = tap.id_tipo');
            if (ACCION.rowCount > 0) {
                return res.jsonp(ACCION.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros' });
            }
        });
    }
    ListarTipoAccionEdicion(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const ACCION = yield database_1.default.query('SELECT * FROM tipo_accion_personal WHERE NOT id_tipo = $1', [id]);
            if (ACCION.rowCount > 0) {
                return res.jsonp(ACCION.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros' });
            }
        });
    }
    CrearTipoAccionPersonal(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id_tipo, descripcion, base_legal, tipo_permiso, tipo_vacacion, tipo_situacion_propuesta } = req.body;
            yield database_1.default.query('INSERT INTO tipo_accion_personal (id_tipo, descripcion, base_legal, tipo_permiso, ' +
                'tipo_vacacion, tipo_situacion_propuesta) VALUES($1, $2, $3, $4, $5, $6)', [id_tipo, descripcion, base_legal, tipo_permiso, tipo_vacacion, tipo_situacion_propuesta]);
            res.jsonp({ message: 'Autorización se registró con éxito' });
        });
    }
    EncontrarTipoAccionPersonalId(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const ACCION = yield database_1.default.query('SELECT tap.id, tap.id_tipo, tap.descripcion, tap.base_legal, ' +
                'tap.tipo_permiso, tap.tipo_vacacion, tap.tipo_situacion_propuesta, ta.descripcion AS nombre ' +
                'FROM tipo_accion_personal AS tap, tipo_accion AS ta WHERE tap.id = $1 AND ta.id = tap.id_tipo', [id]);
            if (ACCION.rowCount > 0) {
                return res.jsonp(ACCION.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros' });
            }
        });
    }
    ActualizarTipoAccionPersonal(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id_tipo, descripcion, base_legal, tipo_permiso, tipo_vacacion, tipo_situacion_propuesta, id } = req.body;
            yield database_1.default.query('UPDATE tipo_accion_personal SET id_tipo = $1, descripcion = $2, base_legal = $3, ' +
                'tipo_permiso = $4, tipo_vacacion = $5, tipo_situacion_propuesta = $6 WHERE id = $7', [id_tipo, descripcion, base_legal, tipo_permiso, tipo_vacacion, tipo_situacion_propuesta, id]);
            res.jsonp({ message: 'Registro exitoso' });
        });
    }
    EliminarTipoAccionPersonal(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id;
            yield database_1.default.query('DELETE FROM tipo_accion_personal WHERE id = $1', [id]);
            res.jsonp({ message: 'Registro eliminado.' });
        });
    }
    /** TABLA ACCION_PERSONAL_EMPLEADO */
    CrearPedidoAccionPersonal(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id_empleado, fec_creacion, fec_rige_desde, fec_rige_hasta, identi_accion_p, num_partida, decre_acue_resol, abrev_empl_uno, firma_empl_uno, abrev_empl_dos, firma_empl_dos, adicion_legal, tipo_accion, descrip_partida, cargo_propuesto, proceso_propuesto, num_partida_propuesta, salario_propuesto, id_ciudad, id_empl_responsable, num_partida_individual, act_final_concurso, fec_act_final_concurso, nombre_reemp, puesto_reemp, funciones_reemp, num_accion_reemp, primera_fecha_reemp, posesion_notificacion, descripcion_pose_noti } = req.body;
            yield database_1.default.query('INSERT INTO accion_personal_empleado (id_empleado, fec_creacion, fec_rige_desde, ' +
                'fec_rige_hasta, identi_accion_p, num_partida, decre_acue_resol, abrev_empl_uno, firma_empl_uno, ' +
                'abrev_empl_dos, firma_empl_dos, adicion_legal, tipo_accion, descrip_partida, cargo_propuesto, ' +
                'proceso_propuesto, num_partida_propuesta, salario_propuesto, id_ciudad, id_empl_responsable, ' +
                'num_partida_individual, act_final_concurso, fec_act_final_concurso, nombre_reemp, puesto_reemp, ' +
                'funciones_reemp, num_accion_reemp, primera_fecha_reemp, posesion_notificacion, descripcion_pose_noti) ' +
                'VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, ' +
                '$20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30)', [id_empleado, fec_creacion, fec_rige_desde, fec_rige_hasta, identi_accion_p, num_partida,
                decre_acue_resol, abrev_empl_uno, firma_empl_uno, abrev_empl_dos, firma_empl_dos, adicion_legal,
                tipo_accion, descrip_partida, cargo_propuesto, proceso_propuesto, num_partida_propuesta,
                salario_propuesto, id_ciudad, id_empl_responsable, num_partida_individual, act_final_concurso, fec_act_final_concurso,
                nombre_reemp, puesto_reemp, funciones_reemp, num_accion_reemp, primera_fecha_reemp, posesion_notificacion, descripcion_pose_noti]);
            res.jsonp({ message: 'Registro realizado con éxito' });
        });
    }
    ActualizarPedidoAccionPersonal(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id_empleado, fec_creacion, fec_rige_desde, fec_rige_hasta, identi_accion_p, num_partida, decre_acue_resol, abrev_empl_uno, firma_empl_uno, abrev_empl_dos, firma_empl_dos, adicion_legal, tipo_accion, descrip_partida, cargo_propuesto, proceso_propuesto, num_partida_propuesta, salario_propuesto, id_ciudad, id_empl_responsable, num_partida_individual, act_final_concurso, fec_act_final_concurso, nombre_reemp, puesto_reemp, funciones_reemp, num_accion_reemp, primera_fecha_reemp, posesion_notificacion, descripcion_pose_noti, id } = req.body;
            yield database_1.default.query('UPDATE accion_personal_empleado SET id_empleado = $1, fec_creacion = $2, ' +
                'fec_rige_desde = $3, fec_rige_hasta = $4, identi_accion_p = $5, num_partida = $6, ' +
                'decre_acue_resol = $7, abrev_empl_uno = $8, firma_empl_uno = $9, abrev_empl_dos = $10, ' +
                'firma_empl_dos = $11, adicion_legal = $12, tipo_accion = $13, descrip_partida = $14, ' +
                'cargo_propuesto = $15, proceso_propuesto = $16, num_partida_propuesta = $17, ' +
                'salario_propuesto = $18, id_ciudad = $19, id_empl_responsable = $20, num_partida_individual = $21,' +
                'act_final_concurso = $22, fec_act_final_concurso = $23, nombre_reemp = $24, puesto_reemp = $25, ' +
                'funciones_reemp = $26, num_accion_reemp = $27, primera_fecha_reemp = $28, posesion_notificacion = $29, ' +
                'descripcion_pose_noti = $30 WHERE id = $31', [id_empleado, fec_creacion, fec_rige_desde, fec_rige_hasta, identi_accion_p, num_partida,
                decre_acue_resol, abrev_empl_uno, firma_empl_uno, abrev_empl_dos, firma_empl_dos, adicion_legal,
                tipo_accion, descrip_partida, cargo_propuesto, proceso_propuesto, num_partida_propuesta,
                salario_propuesto, id_ciudad, id_empl_responsable, num_partida_individual, act_final_concurso,
                fec_act_final_concurso, nombre_reemp, puesto_reemp, funciones_reemp, num_accion_reemp,
                primera_fecha_reemp, posesion_notificacion, descripcion_pose_noti, id]);
            res.jsonp({ message: 'Registro realizado con éxito' });
        });
    }
    verLogoMinisterio(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const file_name = 'ministerio_trabajo.png';
            const codificado = yield (0, ImagenCodificacion_1.ImagenBase64LogosEmpresas)(file_name);
            if (codificado === 0) {
                res.send({ imagen: 0 });
            }
            else {
                res.send({ imagen: codificado });
            }
        });
    }
    /** CONSULTAS GENERACIÓN DE PDF */
    EncontrarDatosEmpleados(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const EMPLEADO = yield database_1.default.query('SELECT d.id, d.nombre, d.apellido, d.cedula, d.codigo, d.id_cargo, ' +
                'ec.sueldo, tc.cargo, cd.nombre AS departamento ' +
                'FROM datos_actuales_empleado AS d, empl_cargos AS ec, tipo_cargo AS tc, cg_departamentos AS cd ' +
                'WHERE d.id_cargo = ec.id AND ec.cargo = tc.id AND ec.id_departamento = cd.id AND d.id = $1', [id]);
            if (EMPLEADO.rowCount > 0) {
                return res.jsonp(EMPLEADO.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros' });
            }
        });
    }
    EncontrarDatosCiudades(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const CIUDAD = yield database_1.default.query('SELECT * FROM ciudades where id = $1', [id]);
            if (CIUDAD.rowCount > 0) {
                return res.json(CIUDAD.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros' });
            }
        });
    }
    EncontrarPedidoAccion(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const ACCION = yield database_1.default.query('SELECT ap.id, ap.id_empleado, ap.fec_creacion, ap.fec_rige_desde, ' +
                'ap.fec_rige_hasta, ap.identi_accion_p, ap.num_partida, ap.decre_acue_resol, ap.abrev_empl_uno, ' +
                'ap.firma_empl_uno, ap.abrev_empl_dos, ap.firma_empl_dos, ap.adicion_legal, ap.tipo_accion, ' +
                'ap.descrip_partida, ap.cargo_propuesto, ap.proceso_propuesto, ap.num_partida_propuesta, ' +
                'ap.salario_propuesto, ap.id_ciudad, ap.id_empl_responsable, ap.num_partida_individual, ' +
                'ap.act_final_concurso, ap.fec_act_final_concurso, ap.nombre_reemp, ap.puesto_reemp, ' +
                'ap.funciones_reemp, ap.num_accion_reemp, ap.primera_fecha_reemp, ap.posesion_notificacion, ' +
                'ap.descripcion_pose_noti, tap.base_legal, tap.id_tipo, ta.descripcion AS tipo ' +
                'FROM accion_personal_empleado AS ap, tipo_accion_personal AS tap, tipo_accion AS ta ' +
                'WHERE ap.tipo_accion = tap.id AND ap.id = $1 AND ta.id = tap.id_tipo', [id]);
            if (ACCION.rowCount > 0) {
                return res.jsonp(ACCION.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros' });
            }
        });
    }
    ListarPedidoAccion(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const ACCION = yield database_1.default.query('SELECT ap.id, ap.id_empleado, ap.fec_creacion, ap.fec_rige_desde, ' +
                'ap.fec_rige_hasta, ap.identi_accion_p, ap.num_partida, ap.decre_acue_resol, ap.abrev_empl_uno, ' +
                'ap.firma_empl_uno, ap.abrev_empl_dos, ap.firma_empl_dos, ap.adicion_legal, ap.tipo_accion, ' +
                'ap.descrip_partida, ap.cargo_propuesto, ap.proceso_propuesto, ap.num_partida_propuesta, ' +
                'ap.salario_propuesto, ap.id_ciudad, ap.id_empl_responsable, ap.num_partida_individual, ' +
                'ap.act_final_concurso, ap.fec_act_final_concurso, ap.nombre_reemp, ap.puesto_reemp, ' +
                'ap.funciones_reemp, ap.num_accion_reemp, ap.primera_fecha_reemp, ap.posesion_notificacion, ' +
                'ap.descripcion_pose_noti, tap.base_legal, tap.id_tipo, e.codigo, e.cedula, e.nombre, e.apellido ' +
                'FROM accion_personal_empleado AS ap, tipo_accion_personal AS tap, empleados AS e ' +
                'WHERE ap.tipo_accion = tap.id AND e.id = ap.id_empleado');
            if (ACCION.rowCount > 0) {
                return res.jsonp(ACCION.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros' });
            }
        });
    }
    EncontrarProcesosRecursivos(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const ACCION = yield database_1.default.query('WITH RECURSIVE procesos AS ( ' +
                'SELECT id, nombre, proc_padre, 1 AS numero FROM cg_procesos WHERE id = $1 ' +
                'UNION ALL ' +
                'SELECT cg.id, cg.nombre, cg.proc_padre, procesos.numero + 1 AS numero FROM cg_procesos cg ' +
                'JOIN procesos ON cg.id = procesos.proc_padre ' +
                ') SELECT UPPER(nombre) AS nombre, numero FROM procesos ORDER BY numero DESC;', [id]);
            if (ACCION.rowCount > 0) {
                return res.jsonp(ACCION.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros' });
            }
        });
    }
    // METODO PARA CREAR ARCHIVO XML
    FileXML(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var xml = builder.create('root').ele(req.body).end({ pretty: true });
            console.log(req.body.userName);
            let filename = "AccionesPersonal-" + req.body.userName + '-' + req.body.userId + '-' + new Date().getTime() + '.xml';
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
}
exports.ACCION_PERSONAL_CONTROLADOR = new AccionPersonalControlador();
exports.default = exports.ACCION_PERSONAL_CONTROLADOR;
