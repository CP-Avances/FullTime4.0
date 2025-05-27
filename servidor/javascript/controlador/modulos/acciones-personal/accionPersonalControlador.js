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
const auditoriaControlador_1 = __importDefault(require("../../reportes/auditoriaControlador"));
const accesoCarpetas_1 = require("../../../libs/accesoCarpetas");
const ImagenCodificacion_1 = require("../../../libs/ImagenCodificacion");
const accesoCarpetas_2 = require("../../../libs/accesoCarpetas");
const settingsMail_1 = require("../../../libs/settingsMail");
const database_1 = __importDefault(require("../../../database"));
const path_1 = __importDefault(require("path"));
const exceljs_1 = __importDefault(require("exceljs"));
const fs_1 = __importDefault(require("fs"));
class AccionPersonalControlador {
    ListarTipoAccion(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const ACCION = yield database_1.default.query(`
            SELECT * FROM map_tipo_accion_personal
            `);
            if (ACCION.rowCount != 0) {
                return res.jsonp(ACCION.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros.' });
            }
        });
    }
    CrearTipoAccion(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { descripcion, user_name, ip, ip_local } = req.body;
                // INICIAR TRANSACCION
                yield database_1.default.query('BEGIN');
                const response = yield database_1.default.query(`
                INSERT INTO map_tipo_accion_personal (descripcion) VALUES ($1) RETURNING *
                `, [descripcion]);
                const [datos] = response.rows;
                if (datos) {
                    // INSERTAR REGISTRO DE AUDITORIA
                    yield auditoriaControlador_1.default.InsertarAuditoria({
                        tabla: 'map_tipo_accion_personal',
                        usuario: user_name,
                        accion: 'I',
                        datosOriginales: '',
                        datosNuevos: `{"descripcion": "${descripcion}"}`,
                        ip: ip,
                        ip_local: ip_local,
                        observacion: null
                    });
                    // FINALIZAR TRANSACCION
                    yield database_1.default.query('COMMIT');
                    return res.status(200).jsonp(datos);
                }
                else {
                    yield database_1.default.query('ROLLBACK');
                    return res.status(300).jsonp({ message: 'error, no se insertaron los datos' });
                }
            }
            catch (error) {
                yield database_1.default.query('ROLLBACK');
                return res.status(500).jsonp({ message: error });
            }
        });
    }
    CrearTipoAccionPersonal(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id_tipo, descripcion, base_legal, user_name, ip, ip_local } = req.body;
                // INICIAR TRANSACCION
                yield database_1.default.query('BEGIN');
                const response = yield database_1.default.query(`
                INSERT INTO map_detalle_tipo_accion_personal (id_tipo_accion_personal, descripcion, base_legal) VALUES($1, $2, $3) RETURNING*
                `, [id_tipo, descripcion, base_legal]);
                const [datos] = response.rows;
                if (datos) {
                    // INSERTAR REGISTRO DE AUDITORIA
                    yield auditoriaControlador_1.default.InsertarAuditoria({
                        tabla: 'map_detalle_tipo_accion_personal',
                        usuario: user_name,
                        accion: 'I',
                        datosOriginales: '',
                        datosNuevos: `
                        {
                            "id_tipo": "${id_tipo}", "descripcion": "${descripcion}", "base_legal": "${base_legal}",                      
                        }
                        `,
                        ip: ip,
                        ip_local: ip_local,
                        observacion: null
                    });
                    // FINALIZAR TRANSACCION
                    yield database_1.default.query('COMMIT');
                    return res.status(200).jsonp(datos);
                }
                else {
                    yield database_1.default.query('ROLLBACK');
                    return res.status(500).jsonp({ message: 'error' });
                }
            }
            catch (error) {
                yield database_1.default.query('ROLLBACK');
                return res.status(500).jsonp({ message: 'error' });
            }
        });
    }
    // TABLA TIPO_ACCION_PERSONAL 
    ListarTipoAccionPersonal(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const ACCION = yield database_1.default.query(`
            SELECT dtap.id, dtap.id_tipo_accion_personal, dtap.descripcion, dtap.base_legal, tap.descripcion AS nombre 
            FROM map_detalle_tipo_accion_personal AS dtap, map_tipo_accion_personal AS tap 
            WHERE tap.id = dtap.id_tipo_accion_personal
            `);
            if (ACCION.rowCount != 0) {
                return res.jsonp(ACCION.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros.' });
            }
        });
    }
    ListarTipoAccionEdicion(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const ACCION = yield database_1.default.query(`
            SELECT * FROM map_detalle_tipo_accion_personal WHERE NOT id_tipo_accion_personal = $1
            `, [id]);
            if (ACCION.rowCount != 0) {
                return res.jsonp(ACCION.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros.' });
            }
        });
    }
    EncontrarTipoAccionPersonalId(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const ACCION = yield database_1.default.query(`
            SELECT dtap.id, dtap.id_tipo_accion_personal, dtap.descripcion, dtap.base_legal, tap.descripcion AS nombre 
            FROM map_detalle_tipo_accion_personal AS dtap, map_tipo_accion_personal AS tap 
            WHERE dtap.id = $1 AND tap.id = dtap.id_tipo_accion_personal
            `, [id]);
            if (ACCION.rowCount != 0) {
                return res.jsonp(ACCION.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros.' });
            }
        });
    }
    ActualizarTipoAccionPersonal(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id_tipo, descripcion, base_legal, id, user_name, ip, ip_local } = req.body;
                // INICIAR TRANSACCION
                yield database_1.default.query('BEGIN');
                // CONSULTAR DATOS ANTES DE ACTUALIZAR PARA PODER REALIZAR EL REGISTRO EN AUDITORIA
                const response = yield database_1.default.query(`
                SELECT * FROM map_detalle_tipo_accion_personal WHERE id = $1
                `, [id]);
                const [datos] = response.rows;
                if (!datos) {
                    yield auditoriaControlador_1.default.InsertarAuditoria({
                        tabla: 'map_detalle_tipo_accion_personal',
                        usuario: user_name,
                        accion: 'U',
                        datosOriginales: '',
                        datosNuevos: '',
                        ip: ip,
                        ip_local: ip_local,
                        observacion: `Error al actualizar el registro con id: ${id}`
                    });
                    // FINALIZAR TRANSACCION
                    yield database_1.default.query('COMMIT');
                    return res.status(404).jsonp({ message: 'error' });
                }
                yield database_1.default.query(`
                UPDATE map_detalle_tipo_accion_personal SET id_tipo_accion_personal = $1, descripcion = $2, base_legal = $3 
                     WHERE id = $4
                `, [id_tipo, descripcion, base_legal, id]);
                // INSERTAR REGISTRO DE AUDITORIA
                yield auditoriaControlador_1.default.InsertarAuditoria({
                    tabla: 'map_detalle_tipo_accion_personal',
                    usuario: user_name,
                    accion: 'U',
                    datosOriginales: JSON.stringify(datos),
                    datosNuevos: `
                    {
                        "id_tipo": "${id_tipo}", "descripcion": "${descripcion}", "base_legal": "${base_legal}"
                    }
                    `,
                    ip: ip,
                    ip_local: ip_local,
                    observacion: null
                });
                // FINALIZAR TRANSACCION
                yield database_1.default.query('COMMIT');
                return res.status(200).jsonp({ message: 'Registro actualizado.' });
            }
            catch (error) {
                yield database_1.default.query('ROLLBACK');
                return res.status(500).jsonp({ message: 'error' });
            }
        });
    }
    EliminarTipoAccionPersonal(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = req.params.id;
                const { user_name, ip, ip_local } = req.body;
                // INICIAR TRANSACCION
                yield database_1.default.query('BEGIN');
                // CONSULTAR DATOS ANTES DE ELIMINAR PARA PODER REALIZAR EL REGISTRO EN AUDITORIA
                const response = yield database_1.default.query(`
                SELECT * FROM map_detalle_tipo_accion_personal WHERE id = $1
                `, [id]);
                const [datos] = response.rows;
                if (!datos) {
                    yield auditoriaControlador_1.default.InsertarAuditoria({
                        tabla: 'map_detalle_tipo_accion_personal',
                        usuario: user_name,
                        accion: 'D',
                        datosOriginales: '',
                        datosNuevos: '',
                        ip: ip,
                        ip_local: ip_local,
                        observacion: `Error al eliminar el registro con id: ${id}`
                    });
                    // FINALIZAR TRANSACCION
                    yield database_1.default.query('COMMIT');
                    return res.status(404).jsonp({ message: 'error' });
                }
                yield database_1.default.query(`
                DELETE FROM map_detalle_tipo_accion_personal WHERE id = $1
                `, [id]);
                // INSERTAR REGISTRO DE AUDITORIA
                yield auditoriaControlador_1.default.InsertarAuditoria({
                    tabla: 'map_detalle_tipo_accion_personal',
                    usuario: user_name,
                    accion: 'D',
                    datosOriginales: JSON.stringify(datos),
                    datosNuevos: '',
                    ip: ip,
                    ip_local: ip_local,
                    observacion: null
                });
                // FINALIZAR TRANSACCION
                yield database_1.default.query('COMMIT');
                return res.status(200).jsonp({ message: 'Registro eliminado.' });
            }
            catch (error) {
                yield database_1.default.query('ROLLBACK');
                return res.status(500).jsonp({ message: 'error' });
            }
        });
    }
    // TABLA SOLICITUD ACCION PERSONAL
    CrearPedidoAccionPersonal(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { formulario1, formulario2, formulario3, formulario4, formulario5, formulario6, user_name, ip, ip_local } = req.body;
                let datosNuevos = req.body;
                // INICIAR TRANSACCION
                yield database_1.default.query('BEGIN');
                yield database_1.default.query(`
                INSERT INTO map_documento_accion_personal (numero_accion_personal, fecha_elaboracion, hora_elaboracion, id_empleado_personal fecha_rige_desde, fecha_rige_hasta, 
                    id_tipo_accion_personal, detalle_otro, especificacion, declaracion_jurada, adicion_base_legal,
                    observacion, id_proceso_actual, id_nivel_gestion_actual, id_unidad_administrativa, id_sucursal_actual, 
                    id_lugar_trbajo_actual, id_tipo_cargo_actual, id_grupo_ocupacional_actual, id_grado_actual, 
                    remuneracion_actual, partida_individual_actual, id_proceso_propuesto, id_sucursal_propuesta, id_nivel_gestion_propuesta, 
                    id_unidad_adminstrativa_propuesta, id_lugar_trabajo_propuesto, id_tipo_cargo_propuesto, funciones_reemplazo, 
                    id_grupo_ocupacional_propuesto, id_grado_propuesto, remuneracion_propuesta, partida_individual_propuesta) 
                VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, 
                    $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32)
                `, [formulario1.numero_accion_personal, formulario1.fecha_elaboracion, formulario1.hora_elaboracion, formulario1.id_empleado_personal,
                    formulario1.fecha_rige_desde, formulario1.fecha_rige_hasta, formulario2.id_tipo_accion_personal, formulario2.detalle_otro,
                    formulario2.especificacion, formulario2.declaracion_jurada, formulario2.adicion_base_legal, formulario2.observacion,
                    formulario3.id_proceso_actual, formulario3.id_nivel_gestion_actual, formulario3.id_unidad_administrativa, formulario3.id_sucursal_actual, formulario3.id_lugar_trabajo_actual,
                    formulario3.id_tipo_cargo_actual, formulario3.id_grupo_ocupacional_actual, formulario3.id_grado_actual, formulario3.remuneracion_actual, formulario3.partida_individual_actual,
                    formulario3.id_proceso_propuesto, formulario3.id_nivel_gestion_propuesto, formulario3.id_unidad_administrativa_propuesta, formulario3.id_sucursal_propuesta,
                    formulario3.id_lugar_trabajo_propuesto, formulario3.id_tipo_cargo_propuesto, formulario3.id_grupo_ocupacional_propuesto, formulario3.id_grado_propuesto,
                    formulario3.remuneracion_propuesta, formulario3.partida_individual_propuesta
                ]);
                delete datosNuevos.user_name;
                delete datosNuevos.ip;
                // var fechaCreacionN = await FormatearFecha2(fec_creacion, 'ddd');
                // var fecha_rige_desdeN = await FormatearFecha2(fec_rige_desde, 'ddd');
                // var fecha_rige_hastaN = await FormatearFecha2(fec_rige_hasta, 'ddd');
                // var primera_fecha_reemplazoN = await FormatearFecha2(primera_fecha_reemp, 'ddd');
                // var fecha_acta_final_concurso = await FormatearFecha2(fec_act_final_concurso, 'ddd');
                // INSERTAR REGISTRO DE AUDITORIA
                yield auditoriaControlador_1.default.InsertarAuditoria({
                    tabla: 'map_solicitud_accion_personal',
                    usuario: user_name,
                    accion: 'I',
                    datosOriginales: '',
                    datosNuevos: `{}`,
                    ip: ip,
                    ip_local: ip_local,
                    observacion: null
                });
                // FINALIZAR TRANSACCION
                yield database_1.default.query('COMMIT');
                return res.jsonp({ message: 'Registro realizado con éxito.' });
            }
            catch (error) {
                yield database_1.default.query('ROLLBACK');
                return res.status(500).jsonp({ message: 'error' });
            }
        });
    }
    ActualizarPedidoAccionPersonal(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id_empleado, fec_creacion, fec_rige_desde, fec_rige_hasta, identi_accion_p, num_partida, decre_acue_resol, abrev_empl_uno, firma_empl_uno, abrev_empl_dos, firma_empl_dos, adicion_legal, tipo_accion, cargo_propuesto, proceso_propuesto, num_partida_propuesta, salario_propuesto, id_ciudad, id_empl_responsable, num_partida_individual, act_final_concurso, fec_act_final_concurso, nombre_reemp, puesto_reemp, funciones_reemp, num_accion_reemp, primera_fecha_reemp, posesion_notificacion, descripcion_pose_noti, id, user_name, ip, ip_local } = req.body;
                let datosNuevos = req.body;
                // INICIAR TRANSACCION
                yield database_1.default.query('BEGIN');
                // CONSULTAR DATOS ANTES DE ACTUALIZAR PARA PODER REALIZAR EL REGISTRO EN AUDITORIA
                const response = yield database_1.default.query(`
                SELECT * FROM map_solicitud_accion_personal WHERE id = $1
                `, [id]);
                const [datos] = response.rows;
                if (!datos) {
                    yield auditoriaControlador_1.default.InsertarAuditoria({
                        tabla: 'map_solicitud_accion_personal',
                        usuario: user_name,
                        accion: 'U',
                        datosOriginales: '',
                        datosNuevos: '',
                        ip: ip,
                        ip_local: ip_local,
                        observacion: `Error al actualizar el registro con id: ${id}`
                    });
                    // FINALIZAR TRANSACCION
                    yield database_1.default.query('COMMIT');
                    return res.status(404).jsonp({ message: 'error' });
                }
                yield database_1.default.query(`
                UPDATE map_solicitud_accion_personal SET id_empleado = $1, fecha_creacion = $2, fecha_rige_desde = $3, 
                    fecha_rige_hasta = $4, identificacion_accion_personal = $5, numero_partida_empresa = $6, 
                    id_contexto_legal = $7, titulo_empleado_uno = $8, firma_empleado_uno = $9, titulo_empleado_dos = $10, 
                    firma_empleado_dos = $11, adicion_legal = $12, id_detalle_tipo_accion_personal = $13, 
                    id_cargo_propuesto = $14, id_proceso_propuesto = $15, numero_partida_propuesta = $16, 
                    salario_propuesto = $17, id_ciudad = $18, id_empleado_responsable = $19, numero_partida_individual = $20,
                    acta_final_concurso = $21, fecha_acta_final_concurso = $22, nombre_reemplazo = $23, 
                    puesto_reemplazo = $24, funciones_reemplazo = $25, numero_accion_reemplazo = $26, 
                    primera_fecha_reemplazo = $27, posesion_notificacion = $28, descripcion_posesion_notificacion = $29 
                WHERE id = $30
                `, [id_empleado, fec_creacion, fec_rige_desde, fec_rige_hasta, identi_accion_p, num_partida,
                    decre_acue_resol, abrev_empl_uno, firma_empl_uno, abrev_empl_dos, firma_empl_dos, adicion_legal,
                    tipo_accion, cargo_propuesto, proceso_propuesto, num_partida_propuesta,
                    salario_propuesto, id_ciudad, id_empl_responsable, num_partida_individual, act_final_concurso,
                    fec_act_final_concurso, nombre_reemp, puesto_reemp, funciones_reemp, num_accion_reemp,
                    primera_fecha_reemp, posesion_notificacion, descripcion_pose_noti, id]);
                delete datosNuevos.user_name;
                delete datosNuevos.ip;
                var fechaCreacionN = yield (0, settingsMail_1.FormatearFecha2)(fec_creacion, 'ddd');
                var fecha_rige_desdeN = yield (0, settingsMail_1.FormatearFecha2)(fec_rige_desde, 'ddd');
                var fecha_rige_hastaN = yield (0, settingsMail_1.FormatearFecha2)(fec_rige_hasta, 'ddd');
                var primera_fecha_reemplazoN = yield (0, settingsMail_1.FormatearFecha2)(primera_fecha_reemp, 'ddd');
                var fecha_acta_final_concursoN = yield (0, settingsMail_1.FormatearFecha2)(fec_act_final_concurso, 'ddd');
                var fechaCreacionO = yield (0, settingsMail_1.FormatearFecha2)(datos.fecha_creacion, 'ddd');
                var fecha_rige_desdeO = yield (0, settingsMail_1.FormatearFecha2)(datos.fecha_rige_desde, 'ddd');
                var fecha_rige_hastaO = yield (0, settingsMail_1.FormatearFecha2)(datos.fecha_rige_hasta, 'ddd');
                var primera_fecha_reemplazoO = yield (0, settingsMail_1.FormatearFecha2)(datos.primera_fecha_reemplazo, 'ddd');
                var fecha_acta_final_concursoO = yield (0, settingsMail_1.FormatearFecha2)(datos.fecha_acta_final_concurso, 'ddd');
                // INSERTAR REGISTRO DE AUDITORIA
                yield auditoriaControlador_1.default.InsertarAuditoria({
                    tabla: 'map_solicitud_accion_personal',
                    usuario: user_name,
                    accion: 'U',
                    datosOriginales: `{id_empleado: ${datos.id_empleado}, fecha_creacion: ${fechaCreacionO}, fecha_rige_desde: ${fecha_rige_desdeO}, 
                fecha_rige_hasta: ${fecha_rige_hastaO}, identificacion_accion_personal: ${datos.identificacion_accion_personal}, numero_partida_empresa: ${datos.numero_partida_empresa}, id_contexto_legal: ${datos.id_contexto_legal}, 
                titulo_empleado_uno: ${datos.titulo_empleado_uno}, firma_empleado_uno: ${datos.firma_empleado_uno}, titulo_empleado_dos: ${datos.titulo_empleado_dos}, firma_empleado_dos: ${datos.firma_empleado_dos}, adicion_legal: ${datos.adicion_legal}, 
                id_detalle_tipo_accion_personal: ${datos.id_detalle_tipo_accion_personal}, id_cargo_propuesto: ${datos.id_cargo_propuesto}, id_proceso_propuesto: ${datos.id_proceso_propuesto}, numero_partida_propuesta: ${datos.numero_partida_propuesta}, 
                salario_propuesto: ${datos.salario_propuesto}, id_ciudad: ${datos.id_ciudad}, id_empleado_responsable: ${datos.id_empleado_responsable}, numero_partida_individual: ${datos.numero_partida_individual}, acta_final_concurso: ${datos.acta_final_concurso}, 
                fecha_acta_final_concurso: ${fecha_acta_final_concursoO}, nombre_reemplazo: ${datos.nombre_reemplazo}, puesto_reemplazo: ${datos.puesto_reemplazo}, funciones_reemplazo: ${datos.funciones_reemplazo}, 
                numero_accion_reemplazo: ${datos.numero_accion_reemplazo},primera_fecha_reemplazo: ${primera_fecha_reemplazoO}, posesion_notificacion: ${datos.posesion_notificacion}, 
                descripcion_posesion_notificacion: ${datos.descripcion_posesion_notificacion}}`,
                    datosNuevos: `{id_empleado: ${id_empleado}, fecha_creacion: ${fechaCreacionN}, fecha_rige_desde: ${fecha_rige_desdeN}, 
                fecha_rige_hasta: ${fecha_rige_hastaN}, identificacion_accion_personal: ${identi_accion_p}, numero_partida_empresa: ${num_partida}, id_contexto_legal: ${decre_acue_resol}, 
                titulo_empleado_uno: ${abrev_empl_uno}, firma_empleado_uno: ${firma_empl_uno}, titulo_empleado_dos: ${abrev_empl_dos}, firma_empleado_dos: ${firma_empl_dos}, adicion_legal: ${adicion_legal}, 
                id_detalle_tipo_accion_personal: ${tipo_accion}, id_cargo_propuesto: ${cargo_propuesto}, id_proceso_propuesto: ${proceso_propuesto}, numero_partida_propuesta: ${num_partida_propuesta}, 
                salario_propuesto: ${salario_propuesto}, id_ciudad: ${id_ciudad}, id_empleado_responsable: ${id_empl_responsable}, numero_partida_individual: ${num_partida_individual}, acta_final_concurso: ${act_final_concurso}, 
                fecha_acta_final_concurso: ${fecha_acta_final_concursoN}, nombre_reemplazo: ${nombre_reemp}, puesto_reemplazo: ${puesto_reemp}, funciones_reemplazo: ${funciones_reemp}, 
                numero_accion_reemplazo: ${num_accion_reemp},primera_fecha_reemplazo: ${primera_fecha_reemplazoN}, posesion_notificacion: ${posesion_notificacion}, 
                descripcion_posesion_notificacion: ${descripcion_pose_noti}}`,
                    ip: ip,
                    ip_local: ip_local,
                    observacion: null
                });
                // FINALIZAR TRANSACCION
                yield database_1.default.query('COMMIT');
                return res.jsonp({ message: 'Registro actualizado.' });
            }
            catch (error) {
                yield database_1.default.query('ROLLBACK');
                return res.status(500).jsonp({ message: 'error' });
            }
        });
    }
    verLogoMinisterio(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const file_name = 'ministerio_trabajo.png';
            let separador = path_1.default.sep;
            let ruta = (0, accesoCarpetas_2.ObtenerRutaLogos)() + separador + file_name;
            //console.log( 'solo ruta ', ruta)
            const codificado = yield (0, ImagenCodificacion_1.ConvertirImagenBase64)(ruta);
            if (codificado === 0) {
                res.send({ imagen: 0 });
            }
            else {
                res.send({ imagen: codificado });
            }
        });
    }
    // CONSULTAS GENERACIÓN DE PDF
    EncontrarDatosEmpleados(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const EMPLEADO = yield database_1.default.query(`
            SELECT d.id, d.nombre, d.apellido, d.identificacion, d.codigo, d.id_cargo, 
                ec.sueldo, d.name_cargo AS cargo, d.name_dep AS departamento 
            FROM informacion_general AS d, eu_empleado_cargos AS ec
            WHERE d.id_cargo = ec.id AND d.id = $1
            `, [id]);
            if (EMPLEADO.rowCount != 0) {
                return res.jsonp(EMPLEADO.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros.' });
            }
        });
    }
    EncontrarDatosCiudades(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const CIUDAD = yield database_1.default.query(`
            SELECT * FROM e_ciudades where id = $1
            `, [id]);
            if (CIUDAD.rowCount != 0) {
                return res.json(CIUDAD.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros.' });
            }
        });
    }
    EncontrarPedidoAccion(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const ACCION = yield database_1.default.query(`
            SELECT ap.id, ap.id_empleado, ap.fecha_creacion, ap.fecha_rige_desde, 
                ap.fecha_rige_hasta, ap.identificacion_accion_personal, ap.numero_partida_empresa, ap.id_contexto_legal,
                ap.titulo_empleado_uno, ap.firma_empleado_uno, ap.titulo_empleado_dos, ap.firma_empleado_dos, 
                ap.adicion_legal, ap.id_detalle_tipo_accion_personal, ap.id_cargo_propuesto, ap.id_proceso_propuesto, 
                ap.numero_partida_propuesta, ap.salario_propuesto, ap.id_ciudad, ap.id_empleado_responsable, 
                ap.numero_partida_individual, ap.acta_final_concurso, ap.fecha_acta_final_concurso, ap.nombre_reemplazo, 
                ap.puesto_reemplazo, ap.funciones_reemplazo, ap.numero_accion_reemplazo, ap.primera_fecha_reemplazo, 
                ap.posesion_notificacion, ap.descripcion_posesion_notificacion, tap.base_legal, tap.id_tipo_accion_personal, 
                ta.descripcion AS tipo 
            FROM map_solicitud_accion_personal AS ap, map_detalle_tipo_accion_personal AS tap, map_tipo_accion_personal AS ta 
            WHERE ap.id_detalle_tipo_accion_personal = tap.id AND ap.id = $1 AND ta.id = tap.id_tipo_accion_personal
            `, [id]);
            if (ACCION.rowCount != 0) {
                return res.jsonp(ACCION.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros' });
            }
        });
    }
    ListarPedidoAccion(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const ACCION = yield database_1.default.query(`
            SELECT ap.id, ap.id_empleado, ap.fecha_creacion, ap.fecha_rige_desde,
                ap.fecha_rige_hasta, ap.identificacion_accion_personal, ap.numero_partida_empresa, ap.id_contexto_legal, 
                ap.titulo_empleado_uno, ap.firma_empleado_uno, ap.titulo_empleado_dos, ap.firma_empleado_dos, 
                ap.adicion_legal, ap.id_detalle_tipo_accion_personal, ap.id_cargo_propuesto, ap.id_proceso_propuesto, 
                ap.numero_partida_propuesta, ap.salario_propuesto, ap.id_ciudad, ap.id_empleado_responsable, 
                ap.numero_partida_individual, ap.acta_final_concurso, ap.fecha_acta_final_concurso, ap.nombre_reemplazo, 
                ap.puesto_reemplazo, ap.funciones_reemplazo, ap.numero_accion_reemplazo, ap.primera_fecha_reemplazo, 
                ap.posesion_notificacion, ap.descripcion_posesion_notificacion, tap.base_legal, tap.id_tipo_accion_personal,
                e.codigo, e.identificacion, e.nombre, e.apellido 
            FROM map_solicitud_accion_personal AS ap, map_detalle_tipo_accion_personal AS tap, eu_empleados AS e 
            WHERE ap.id_detalle_tipo_accion_personal = tap.id AND e.id = ap.id_empleado
            `);
            if (ACCION.rowCount != 0) {
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
            const ACCION = yield database_1.default.query(`
            WITH RECURSIVE procesos AS 
            ( 
            SELECT id, nombre, proceso_padre, 1 AS numero FROM map_cat_procesos WHERE id = $1 
            UNION ALL 
            SELECT cg.id, cg.nombre, cg.proceso_padre, procesos.numero + 1 AS numero FROM map_cat_procesos cg 
            JOIN procesos ON cg.id = procesos.proceso_padre 
            ) 
            SELECT UPPER(nombre) AS nombre, numero FROM procesos ORDER BY numero DESC
            `, [id]);
            if (ACCION.rowCount != 0) {
                return res.jsonp(ACCION.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros' });
            }
        });
    }
    // METODO PARA REVISAR LOS DATOS DE LA PLANTILLA DENTRO DEL SISTEMA - MENSAJES DE CADA ERROR    **USADO
    RevisarDatos(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const documento = (_a = req.file) === null || _a === void 0 ? void 0 : _a.originalname;
                let separador = path_1.default.sep;
                let ruta = (0, accesoCarpetas_1.ObtenerRutaLeerPlantillas)() + separador + documento;
                const workbook = new exceljs_1.default.Workbook();
                yield workbook.xlsx.readFile(ruta);
                let verificador = (0, accesoCarpetas_1.ObtenerIndicePlantilla)(workbook, 'DETALLE_TIPO_ACCION_PERSONAL');
                if (verificador === false) {
                    return res.jsonp({ message: 'no_existe', data: undefined });
                }
                else {
                    const sheet_name_list = workbook.worksheets.map(sheet => sheet.name);
                    const plantilla = workbook.getWorksheet(sheet_name_list[verificador]);
                    let data = {
                        fila: '',
                        tipo_accion_personal: '',
                        descripcion: '',
                        base_legal: '',
                        observacion: ''
                    };
                    var listaAccionPersonal = [];
                    var duplicados = [];
                    var mensaje = 'correcto';
                    if (plantilla) {
                        // SUPONIENDO QUE LA PRIMERA FILA SON LAS CABECERAS
                        const headerRow = plantilla.getRow(1);
                        const headers = {};
                        // CREAR UN MAPA CON LAS CABECERAS Y SUS POSICIONES, ASEGURANDO QUE LAS CLAVES ESTEN EN MAYUSCULAS
                        headerRow.eachCell((cell, colNumber) => {
                            headers[cell.value.toString().toUpperCase()] = colNumber;
                        });
                        // VERIFICA SI LAS CABECERAS ESENCIALES ESTAN PRESENTES
                        if (!headers['ITEM'] || !headers['TIPO_ACCION_PERSONAL'] || !headers['DESCRIPCION'] || !headers['BASE_LEGAL']) {
                            return res.jsonp({ message: 'Cabeceras faltantes', data: undefined });
                        }
                        // LECTURA DE LOS DATOS DE LA PLANTILLA
                        plantilla.eachRow((row, rowNumber) => {
                            var _a, _b, _c;
                            // SALTAR LA FILA DE LAS CABECERAS
                            if (rowNumber === 1)
                                return;
                            // LEER LOS DATOS SEGUN LAS COLUMNAS ENCONTRADAS
                            const ITEM = row.getCell(headers['ITEM']).value;
                            const TIPO_ACCION_PERSONAL = (_a = row.getCell(headers['TIPO_ACCION_PERSONAL']).value) === null || _a === void 0 ? void 0 : _a.toString().trim();
                            const DESCRIPCION = (_b = row.getCell(headers['DESCRIPCION']).value) === null || _b === void 0 ? void 0 : _b.toString().trim();
                            const BASE_LEGAL = (_c = row.getCell(headers['BASE_LEGAL']).value) === null || _c === void 0 ? void 0 : _c.toString().trim();
                            // VERIFICAR QUE EL REGISTO NO TENGA DATOS VACIOS
                            if ((ITEM != undefined && ITEM != '') &&
                                (TIPO_ACCION_PERSONAL != undefined && TIPO_ACCION_PERSONAL != '') &&
                                (DESCRIPCION != undefined && DESCRIPCION != '') &&
                                (BASE_LEGAL != undefined && BASE_LEGAL != '')) {
                                data.fila = ITEM;
                                data.tipo_accion_personal = TIPO_ACCION_PERSONAL;
                                data.descripcion = DESCRIPCION;
                                data.base_legal = BASE_LEGAL;
                                data.observacion = 'no registrado';
                                listaAccionPersonal.push(data);
                            }
                            else {
                                data.fila = ITEM;
                                data.tipo_accion_personal = TIPO_ACCION_PERSONAL;
                                data.descripcion = DESCRIPCION;
                                data.base_legal = BASE_LEGAL;
                                data.observacion = 'no registrado';
                                if (data.fila == '' || data.fila == undefined) {
                                    data.fila = 'error';
                                    mensaje = 'error';
                                }
                                if (TIPO_ACCION_PERSONAL == undefined) {
                                    data.tipo_accion_personal = 'No registrado';
                                    data.observacion = 'Tipo de acción de personal ' + data.observacion;
                                }
                                if (DESCRIPCION == undefined) {
                                    data.descripcion = 'No registrado';
                                    data.observacion = 'Descripción ' + data.observacion;
                                }
                                if (BASE_LEGAL == undefined) {
                                    data.base_legal = '-';
                                }
                                listaAccionPersonal.push(data);
                            }
                            data = {};
                        });
                    }
                    // VERIFICAR EXISTENCIA DE CARPETA O ARCHIVO
                    fs_1.default.access(ruta, fs_1.default.constants.F_OK, (err) => {
                        if (err) {
                        }
                        else {
                            // ELIMINAR DEL SERVIDOR
                            fs_1.default.unlinkSync(ruta);
                        }
                    });
                    // VALIDACINES DE LOS DATOS DE LA PLANTILLA
                    listaAccionPersonal.forEach((item, index) => __awaiter(this, void 0, void 0, function* () {
                        if (item.observacion == 'no registrado') {
                            const VERIFICAR_TIPO_ACCION = yield database_1.default.query(`
                    SELECT * FROM map_tipo_accion_personal 
                    WHERE UPPER(descripcion) = UPPER($1)
                    `, [item.tipo_accion_personal]);
                            if (VERIFICAR_TIPO_ACCION.rowCount === 0) {
                                item.observacion = 'No existe el tipo de acción de personal en el sistema';
                            }
                            else {
                                // const VERIFICAR_ACCION = await pool.query(
                                //     `
                                //     SELECT * FROM map_detalle_tipo_accion_personal
                                //     WHERE id_tipo_accion_personal = $1
                                //     `
                                //     , [VERIFICAR_TIPO_ACCION.rows[0].id]);
                                // if (VERIFICAR_ACCION.rowCount === 0) {
                                //     // DISCRIMINACION DE ELEMENTOS IGUALES
                                //     if (duplicados.find((p: any) => (p.tipo_accion_personal.toLowerCase() === item.tipo_accion_personal.toLowerCase()) ) == undefined) {
                                //         duplicados.push(item);
                                //     } else {
                                //         item.observacion = '1';
                                //     }
                                // }else{
                                //     item.observacion = 'Ya existe en el sistema'  
                                // }
                            }
                        }
                    }));
                    setTimeout(() => {
                        listaAccionPersonal.sort((a, b) => {
                            // COMPARA LOS NUMEROS DE LOS OBJETOS
                            if (a.fila < b.fila) {
                                return -1;
                            }
                            if (a.fila > b.fila) {
                                return 1;
                            }
                            return 0; // SON IGUALES
                        });
                        var filaDuplicada = 0;
                        listaAccionPersonal.forEach((item) => __awaiter(this, void 0, void 0, function* () {
                            if (item.observacion == '1') {
                                item.observacion = 'Registro duplicado';
                            }
                            else if (item.observacion == 'no registrado') {
                                item.observacion = 'ok';
                            }
                            // VALIDA SI LOS DATOS DE LA COLUMNA N SON NUMEROS.
                            if (typeof item.fila === 'number' && !isNaN(item.fila)) {
                                // CONDICION PARA VALIDAR SI EN LA NUMERACION EXISTE UN NUMERO QUE SE REPITE DARA ERROR.
                                if (item.fila == filaDuplicada) {
                                    mensaje = 'error';
                                }
                            }
                            else {
                                return mensaje = 'error';
                            }
                            filaDuplicada = item.fila;
                        }));
                        if (mensaje == 'error') {
                            listaAccionPersonal = undefined;
                        }
                        return res.jsonp({ message: mensaje, data: listaAccionPersonal });
                    }, 1000);
                }
            }
            catch (error) {
                return res.status(500).jsonp({ message: 'Error con el servidor método RevisarDatos.', status: '500' });
            }
        });
    }
    // REGISTRAR PLANTILLA TIPO VACUNA    **USADO 
    CargarPlantilla(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { plantilla, user_name, ip, ip_local } = req.body;
            let error = false;
            var listaProcesosInsertados = [];
            for (const item of plantilla) {
                const { tipo_accion_personal, descripcion, base_legal } = item;
                console.log('items: ', item);
                try {
                    // INICIAR TRANSACCION
                    yield database_1.default.query('BEGIN');
                    const response = yield database_1.default.query(`
              SELECT * FROM map_tipo_accion_personal 
                    WHERE UPPER(descripcion) = UPPER($1)
              `, [tipo_accion_personal]);
                    const [tipo_acciones] = response.rows;
                    console.log('response: ', response);
                    // INICIAR TRANSACCION
                    yield database_1.default.query('BEGIN');
                    const response_accion = yield database_1.default.query(`
          INSERT INTO map_detalle_tipo_accion_personal (id_tipo_accion_personal, descripcion, base_legal) VALUES ($1, $2, $3) RETURNING *
          `, [response.rows[0].id, descripcion, base_legal]);
                    const [detalleAccion] = response_accion.rows;
                    // AUDITORIA
                    yield auditoriaControlador_1.default.InsertarAuditoria({
                        tabla: 'map_detalle_tipo_accion_personal',
                        usuario: user_name,
                        accion: 'I',
                        datosOriginales: '',
                        datosNuevos: JSON.stringify(detalleAccion),
                        ip: ip,
                        ip_local: ip_local,
                        observacion: null
                    });
                    // FINALIZAR TRANSACCION
                    yield database_1.default.query('COMMIT');
                    // AUDITORIA
                    yield auditoriaControlador_1.default.InsertarAuditoria({
                        tabla: 'map_tipo_accion_personal',
                        usuario: user_name,
                        accion: 'I',
                        datosOriginales: '',
                        datosNuevos: JSON.stringify(tipo_acciones),
                        ip: ip,
                        ip_local: ip_local,
                        observacion: null
                    });
                    // FINALIZAR TRANSACCION
                    yield database_1.default.query('COMMIT');
                }
                catch (error) {
                    // REVERTIR TRANSACCION
                    yield database_1.default.query('ROLLBACK');
                    error = true;
                }
            }
            if (error) {
                return res.status(500).jsonp({ message: 'error' });
            }
            return res.status(200).jsonp({ message: 'ok' });
        });
    }
    // METODO PARA ELIMINAR DATOS DE MANERA MULTIPLE
    EliminarTipoAccionMultiple(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { listaEliminar, user_name, ip, ip_local } = req.body;
            let error = false;
            var count = 0;
            var count_no = 0;
            var list_TipoAccion = [];
            try {
                for (const item of listaEliminar) {
                    // INICIAR TRANSACCION
                    yield database_1.default.query('BEGIN');
                    const resultado = yield database_1.default.query(`
             SELECT * FROM map_detalle_tipo_accion_personal WHERE id = $1
           `, [item.id]);
                    const [existe_tipo] = resultado.rows;
                    if (!existe_tipo) {
                        // AUDITORIA
                        yield auditoriaControlador_1.default.InsertarAuditoria({
                            tabla: 'map_detalle_tipo_accion_personal',
                            usuario: user_name,
                            accion: 'D',
                            datosOriginales: '',
                            datosNuevos: '',
                            ip: ip,
                            ip_local: ip_local,
                            observacion: `Error al eliminar el tipo accion personal con id: ${item.id}. Registro no encontrado.`
                        });
                    }
                    // FINALIZAR TRANSACCION
                    yield database_1.default.query('COMMIT');
                    if (existe_tipo) {
                        // INICIAR TRANSACCION
                        yield database_1.default.query('BEGIN');
                        const resultado = yield database_1.default.query(`
             SELECT * FROM map_detalle_tipo_accion_personal WHERE id = $1
           `, [item.id]);
                        const [existe_tipo_emple] = resultado.rows;
                        if (!existe_tipo_emple) {
                            // INICIAR TRANSACCION
                            yield database_1.default.query('BEGIN');
                            const res = yield database_1.default.query(`
             DELETE FROM map_detalle_tipo_accion_personal WHERE id = $1
           `, [item.id]);
                            // AUDITORIA
                            yield auditoriaControlador_1.default.InsertarAuditoria({
                                tabla: 'map_detalle_tipo_accion_personal',
                                usuario: user_name,
                                accion: 'D',
                                datosOriginales: JSON.stringify(existe_tipo),
                                datosNuevos: '',
                                ip: ip,
                                ip_local: ip_local,
                                observacion: null
                            });
                            // FINALIZAR TRANSACCION
                            yield database_1.default.query('COMMIT');
                            //CONTADOR ELIMINADOS
                            count += 1;
                        }
                        else {
                            list_TipoAccion.push(item.descripcion);
                            count_no += 1;
                        }
                    }
                }
                var meCount = "registro eliminado";
                if (count > 1) {
                    meCount = "registros eliminados";
                }
                res.status(200).jsonp({ message: count.toString() + ' ' + meCount + ' con éxito.',
                    ms2: 'Existen datos relacionados con ',
                    codigo: 200,
                    eliminados: count,
                    relacionados: count_no,
                    listaNoEliminados: list_TipoAccion
                });
            }
            catch (err) {
                // REVERTIR TRANSACCION
                yield database_1.default.query('ROLLBACK');
                error = true;
                if (error) {
                    if (err.table == 'map_empleado_grupo_ocupacional') {
                        if (count == 1) {
                            return res.status(300).jsonp({ message: 'Se ha eliminado ' + count + ' registro.', ms2: 'Existen datos relacionados con ', eliminados: count,
                                relacionados: count_no, listaNoEliminados: list_TipoAccion });
                        }
                        else {
                            return res.status(300).jsonp({ message: 'Se ha eliminado ' + count + ' registros.', ms2: 'Existen datos relacionados con ', eliminados: count,
                                relacionados: count_no, listaNoEliminados: list_TipoAccion });
                        }
                    }
                    else {
                        return res.status(500).jsonp({ message: 'No se puedo completar la operacion.' });
                    }
                }
            }
        });
    }
}
exports.ACCION_PERSONAL_CONTROLADOR = new AccionPersonalControlador();
exports.default = exports.ACCION_PERSONAL_CONTROLADOR;
