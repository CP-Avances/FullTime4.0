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
exports.EMPLEADO_CONTROLADOR = void 0;
// SECCION LIBRERIAS
const auditoriaControlador_1 = __importDefault(require("../../auditoria/auditoriaControlador"));
const accesoCarpetas_1 = require("../../../libs/accesoCarpetas");
const accesoCarpetas_2 = require("../../../libs/accesoCarpetas");
const ImagenCodificacion_1 = require("../../../libs/ImagenCodificacion");
const ts_md5_1 = require("ts-md5");
const moment_1 = __importDefault(require("moment"));
const xlsx_1 = __importDefault(require("xlsx"));
const database_1 = __importDefault(require("../../../database"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const settingsMail_1 = require("../../../libs/settingsMail");
const sharp = require('sharp');
class EmpleadoControlador {
    /** ** ********************************************************************************************* **
     ** ** **                        MANEJO DE CODIGOS DE USUARIOS                                    ** **
     ** ** ********************************************************************************************* **/
    // BUSQUEDA DE CODIGO DEL EMPLEADO
    ObtenerCodigo(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const VALOR = yield database_1.default.query(`
      SELECT * FROM e_codigo
      `);
            if (VALOR.rowCount != 0) {
                return res.jsonp(VALOR.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'Registros no encontrados.' });
            }
        });
    }
    // CREAR CODIGO DE EMPLEADO
    CrearCodigo(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id, valor, automatico, manual, user_name, ip } = req.body;
                // INICIAR TRANSACCION
                yield database_1.default.query('BEGIN');
                const datos = yield database_1.default.query(`
        INSERT INTO e_codigo (id, valor, automatico, manual) VALUES ($1, $2, $3, $4) RETURNING *
        `, [id, valor, automatico, manual]);
                // AUDITORIA
                yield auditoriaControlador_1.default.InsertarAuditoria({
                    tabla: 'e_codigo',
                    usuario: user_name,
                    accion: 'I',
                    datosOriginales: '',
                    datosNuevos: JSON.stringify(datos.rows[0]),
                    ip,
                    observacion: null
                });
                // FINALIZAR TRANSACCION
                yield database_1.default.query('COMMIT');
                res.jsonp({ message: 'Registro guardado.' });
            }
            catch (error) {
                // REVERTIR TRANSACCION
                yield database_1.default.query('ROLLBACK');
                res.status(500).jsonp({ message: 'Error al guardar código.' });
            }
        });
    }
    // BUSQUEDA DEL ULTIMO CODIGO REGISTRADO EN EL SISTEMA
    ObtenerMAXCodigo(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const VALOR = yield database_1.default.query(`
        SELECT MAX(codigo::BIGINT) AS codigo FROM eu_empleados
        `);
                if (VALOR.rowCount != 0) {
                    return res.jsonp(VALOR.rows);
                }
                else {
                    return res.status(404).jsonp({ text: 'Registros no encontrados.' });
                }
            }
            catch (error) {
                console.log('error ---- ', error);
                return res.status(404).jsonp({ text: 'Error al obtener código máximo.' });
            }
        });
    }
    // METODO PARA ACTUALIZAR INFORMACION DE CODIGOS
    ActualizarCodigoTotal(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { valor, automatico, manual, cedula, id, user_name, ip } = req.body;
                // INICIAR TRANSACCION
                yield database_1.default.query('BEGIN');
                // CONSULTAR DATOSORIGINALES
                const codigo = yield database_1.default.query(`
        SELECT * FROM e_codigo WHERE id = $1
        `, [id]);
                const [datosOriginales] = codigo.rows;
                if (!datosOriginales) {
                    yield auditoriaControlador_1.default.InsertarAuditoria({
                        tabla: 'e_codigo',
                        usuario: user_name,
                        accion: 'U',
                        datosOriginales: '',
                        datosNuevos: '',
                        ip,
                        observacion: `Error al actualizar código con id: ${id}`
                    });
                    //FINALIZAR TRANSACCION
                    yield database_1.default.query('COMMIT');
                    return res.status(404).jsonp({ message: 'Error al actualizar código' });
                }
                const datosNuevos = yield database_1.default.query(`
        UPDATE e_codigo SET valor = $1, automatico = $2, manual = $3 , cedula = $4 WHERE id = $5 RETURNING *
        `, [valor, automatico, manual, cedula, id]);
                // AUDITORIA
                yield auditoriaControlador_1.default.InsertarAuditoria({
                    tabla: 'e_codigo',
                    usuario: user_name,
                    accion: 'U',
                    datosOriginales: JSON.stringify(datosOriginales),
                    datosNuevos: JSON.stringify(datosNuevos.rows[0]),
                    ip,
                    observacion: null
                });
                //FINALIZAR TRANSACCION
                yield database_1.default.query('COMMIT');
                return res.jsonp({ message: 'Registro actualizado.' });
            }
            catch (error) {
                //REVERTIR TRANSACCION
                yield database_1.default.query('ROLLBACK');
                return res.status(500).jsonp({ message: 'Error al actualizar código.' });
            }
        });
    }
    // METODO PARA ACTUALIZAR CODIGO DE EMPLEADO
    ActualizarCodigo(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { valor, id, user_name, ip } = req.body;
                // INICIAR TRANSACCION
                yield database_1.default.query('BEGIN');
                // CONSULTAR DATOSORIGINALES
                const codigo = yield database_1.default.query(`
        SELECT * FROM e_codigo WHERE id = $1
        `, [id]);
                const [datosOriginales] = codigo.rows;
                if (!datosOriginales) {
                    yield auditoriaControlador_1.default.InsertarAuditoria({
                        tabla: 'e_codigo',
                        usuario: user_name,
                        accion: 'U',
                        datosOriginales: '',
                        datosNuevos: '',
                        ip,
                        observacion: `Error al actualizar código con id: ${id}`
                    });
                    // FINALIZAR TRANSACCION
                    yield database_1.default.query('COMMIT');
                    return res.status(404).jsonp({ message: 'Error al actualizar código' });
                }
                const datosNuevos = yield database_1.default.query(`
        UPDATE e_codigo SET valor = $1 WHERE id = $2 RETURNING *
        `, [valor, id]);
                // AUDITORIA
                yield auditoriaControlador_1.default.InsertarAuditoria({
                    tabla: 'e_codigo',
                    usuario: user_name,
                    accion: 'U',
                    datosOriginales: JSON.stringify(datosOriginales),
                    datosNuevos: JSON.stringify(datosNuevos.rows[0]),
                    ip,
                    observacion: null
                });
                // FINALIZAR TRANSACCION
                yield database_1.default.query('COMMIT');
                return res.jsonp({ message: 'Registro actualizado.' });
            }
            catch (error) {
                // REVERTIR TRANSACCION
                yield database_1.default.query('ROLLBACK');
                return res.status(500).jsonp({ message: 'Error al actualizar código.' });
            }
        });
    }
    /** ** ********************************************************************************************* **
     ** ** **                         MANEJO DE DATOS DE EMPLEADO                                     ** **
     ** ** ********************************************************************************************* **/
    // INGRESAR REGISTRO DE EMPLEADO EN BASE DE DATOS
    InsertarEmpleado(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { cedula, apellido, nombre, esta_civil, genero, correo, fec_nacimiento, estado, domicilio, telefono, id_nacionalidad, codigo, user_name, ip } = req.body;
                // INICIAR TRANSACCION
                yield database_1.default.query('BEGIN');
                const response = yield database_1.default.query(`
        INSERT INTO eu_empleados (cedula, apellido, nombre, estado_civil, genero, correo, 
          fecha_nacimiento, estado, domicilio, telefono, id_nacionalidad, codigo) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *
        `, [cedula, apellido, nombre, esta_civil, genero, correo, fec_nacimiento, estado, domicilio,
                    telefono, id_nacionalidad, codigo]);
                const [empleado] = response.rows;
                const fechaNacimiento = yield (0, settingsMail_1.FormatearFecha2)(fec_nacimiento, 'ddd');
                empleado.fecha_nacimiento = fechaNacimiento;
                // AUDITORIA
                yield auditoriaControlador_1.default.InsertarAuditoria({
                    tabla: 'eu_empleados',
                    usuario: user_name,
                    accion: 'I',
                    datosOriginales: '',
                    datosNuevos: JSON.stringify(empleado),
                    ip,
                    observacion: null
                });
                // FINALIZAR TRANSACCION
                yield database_1.default.query('COMMIT');
                if (empleado) {
                    return res.status(200).jsonp(empleado);
                }
                else {
                    return res.status(404).jsonp({ message: 'error' });
                }
            }
            catch (error) {
                // REVERTIR TRANSACCION
                yield database_1.default.query('ROLLBACK');
                return res.status(500).jsonp({ message: 'error' });
            }
        });
    }
    // ACTUALIZAR INFORMACION EL EMPLEADO
    EditarEmpleado(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = req.params.id;
                const { cedula, apellido, nombre, esta_civil, genero, correo, fec_nacimiento, estado, domicilio, telefono, id_nacionalidad, codigo, user_name, ip } = req.body;
                // INICIAR TRANSACCION
                yield database_1.default.query('BEGIN');
                // CONSULTAR DATOSORIGINALES
                const empleado = yield database_1.default.query(`
        SELECT * FROM eu_empleados WHERE id = $1
        `, [id]);
                const [datosOriginales] = empleado.rows;
                const codigoAnterior = datosOriginales.codigo;
                const cedulaAnterior = datosOriginales.cedula;
                if (!datosOriginales) {
                    yield auditoriaControlador_1.default.InsertarAuditoria({
                        tabla: 'eu_empleados',
                        usuario: user_name,
                        accion: 'U',
                        datosOriginales: '',
                        datosNuevos: '',
                        ip,
                        observacion: `Error al actualizar empleado con id: ${id}`
                    });
                    // FINALIZAR TRANSACCION
                    yield database_1.default.query('COMMIT');
                    return res.status(404).jsonp({ message: 'Error al actualizar empleado' });
                }
                const datosNuevos = yield database_1.default.query(`
        UPDATE eu_empleados SET cedula = $2, apellido = $3, nombre = $4, estado_civil = $5, 
          genero = $6, correo = $7, fecha_nacimiento = $8, estado = $9, domicilio = $10, 
          telefono = $11, id_nacionalidad = $12, codigo = $13 
        WHERE id = $1 RETURNING *
        `, [id, cedula, apellido, nombre, esta_civil, genero, correo, fec_nacimiento, estado,
                    domicilio, telefono, id_nacionalidad, codigo]);
                const fechaNacimientoO = yield (0, settingsMail_1.FormatearFecha2)(datosOriginales.fecha_nacimiento, 'ddd');
                const fechaNacimientoN = yield (0, settingsMail_1.FormatearFecha2)(fec_nacimiento.toLocaleString(), 'ddd');
                datosOriginales.fecha_nacimiento = fechaNacimientoO;
                datosNuevos.rows[0].fecha_nacimiento = fechaNacimientoN;
                // AUDITORIA
                yield auditoriaControlador_1.default.InsertarAuditoria({
                    tabla: 'eu_empleados',
                    usuario: user_name,
                    accion: 'U',
                    datosOriginales: JSON.stringify(datosOriginales),
                    datosNuevos: JSON.stringify(datosNuevos.rows[0]),
                    ip,
                    observacion: null
                });
                // VARIABLES PARA VERIFICAR RENOBRAMIENTO DE CARPETAS
                // 0 => CORRECTO 1 => ERROR
                let verificar_permisos = 0;
                let verificar_imagen = 0;
                let verificar_vacunas = 0;
                let verificar_contrato = 0;
                if (codigoAnterior !== codigo || cedulaAnterior !== cedula) {
                    // RUTA DE LA CARPETA PERMISOS DEL USUARIO
                    const carpetaPermisosAnterior = yield (0, accesoCarpetas_1.ObtenerRuta)(codigoAnterior, cedulaAnterior, 'permisos');
                    const carpetaPermisos = yield (0, accesoCarpetas_1.ObtenerRutaPermisos)(codigo);
                    // VERIFICACION DE EXISTENCIA CARPETA PERMISOS DE USUARIO
                    fs_1.default.access(carpetaPermisosAnterior, fs_1.default.constants.F_OK, (err) => {
                        if (err) {
                            // SI NO EXISTE LA CARPETA CON EL CÓDIGO ANTERIOR, NO HACER NADA
                        }
                        else {
                            // SI EXISTE LA CARPETA CON EL CÓDIGO ANTERIOR, RENOMBRARLA CON LA RUTA DEL CÓDIGO NUEVO
                            fs_1.default.rename(carpetaPermisosAnterior, carpetaPermisos, (err) => {
                                if (err) {
                                    verificar_permisos = 1;
                                }
                                else {
                                    verificar_permisos = 0;
                                }
                            });
                        }
                    });
                    // RUTA DE LA CARPETA IMAGENES DEL USUARIO
                    const carpetaImagenesAnterior = yield (0, accesoCarpetas_1.ObtenerRuta)(codigoAnterior, cedulaAnterior, 'imagenesEmpleados');
                    const carpetaImagenes = yield (0, accesoCarpetas_1.ObtenerRutaUsuario)(id);
                    // VERIFICACION DE EXISTENCIA CARPETA IMAGENES DE USUARIO
                    fs_1.default.access(carpetaImagenesAnterior, fs_1.default.constants.F_OK, (err) => {
                        if (err) {
                            // SI NO EXISTE LA CARPETA CON EL CÓDIGO ANTERIOR, NO HACER NADA
                        }
                        else {
                            // SI EXISTE LA CARPETA CON EL CÓDIGO ANTERIOR, RENOMBRARLA CON LA RUTA DEL CÓDIGO NUEVO
                            fs_1.default.rename(carpetaImagenesAnterior, carpetaImagenes, (err) => {
                                if (err) {
                                    verificar_imagen = 1;
                                }
                                else {
                                    verificar_imagen = 0;
                                }
                            });
                        }
                    });
                    // RUTA DE LA CARPETA VACUNAS DEL USUARIO
                    const carpetaVacunasAnterior = yield (0, accesoCarpetas_1.ObtenerRuta)(codigoAnterior, cedulaAnterior, 'carnetVacuna');
                    const carpetaVacunas = yield (0, accesoCarpetas_1.ObtenerRutaVacuna)(id);
                    // VERIFICACION DE EXISTENCIA CARPETA PERMISOS DE USUARIO
                    fs_1.default.access(carpetaVacunasAnterior, fs_1.default.constants.F_OK, (err) => {
                        if (err) {
                            // SI NO EXISTE LA CARPETA CON EL CÓDIGO ANTERIOR, NO HACER NADA
                        }
                        else {
                            // SI EXISTE LA CARPETA CON EL CÓDIGO ANTERIOR, RENOMBRARLA CON LA RUTA DEL CÓDIGO NUEVO
                            fs_1.default.rename(carpetaVacunasAnterior, carpetaVacunas, (err) => {
                                if (err) {
                                    verificar_vacunas = 1;
                                }
                                else {
                                    verificar_vacunas = 0;
                                }
                            });
                        }
                    });
                    // RUTA DE LA CARPETA CONTRATOS DEL USUARIO
                    const carpetaContratosAnterior = yield (0, accesoCarpetas_1.ObtenerRuta)(codigoAnterior, cedulaAnterior, 'contratos');
                    const carpetaContratos = yield (0, accesoCarpetas_1.ObtenerRutaContrato)(id);
                    // VERIFICACION DE EXISTENCIA CARPETA CONTRATOS DE USUARIO
                    fs_1.default.access(carpetaContratosAnterior, fs_1.default.constants.F_OK, (err) => {
                        if (err) {
                            // SI NO EXISTE LA CARPETA CON EL CÓDIGO ANTERIOR, NO HACER NADA
                        }
                        else {
                            // SI EXISTE LA CARPETA CON EL CÓDIGO ANTERIOR, RENOMBRARLA CON LA RUTA DEL CÓDIGO NUEVO
                            fs_1.default.rename(carpetaContratosAnterior, carpetaContratos, (err) => {
                                if (err) {
                                    verificar_contrato = 1;
                                }
                                else {
                                    verificar_contrato = 0;
                                }
                            });
                        }
                    });
                }
                // METODO DE VERIFICACION DE MODIFICACION DE DIRECTORIOS
                const errores = {
                    '1': 'permisos',
                    '2': 'imagenes',
                    '3': 'vacunación',
                    '4': 'contratos'
                };
                const verificaciones = [verificar_permisos, verificar_imagen, verificar_vacunas, verificar_contrato];
                const mensajesError = verificaciones.map((verificacion, index) => verificacion === 1 ? errores[(index + 1).toString()] : null).filter(Boolean);
                if (mensajesError.length > 0) {
                    yield database_1.default.query('ROLLBACK');
                    return res.status(500).jsonp({ message: `Ups!!! no fue posible modificar el directorio de ${mensajesError.join(', ')} del usuario.` });
                }
                else {
                    // FINALIZAR TRANSACCION
                    yield database_1.default.query('COMMIT');
                    return res.jsonp({ message: 'Registro actualizado.' });
                }
            }
            catch (error) {
                // REVERTIR TRANSACCION
                yield database_1.default.query('ROLLBACK');
                return res.status(500).jsonp({ message: 'error' });
            }
        });
    }
    // BUSQUEDA DE UN SOLO EMPLEADO  --**VERIFICADO
    BuscarEmpleado(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const EMPLEADO = yield database_1.default.query(`
      SELECT * FROM eu_empleados WHERE id = $1
      `, [id]);
            if (EMPLEADO.rowCount != 0) {
                return res.jsonp(EMPLEADO.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'Registro no encontrado.' });
            }
        });
    }
    // BUSQUEDA DE INFORMACION ESPECIFICA DE EMPLEADOS
    ListarBusquedaEmpleados(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const empleado = yield database_1.default.query(`
      SELECT id, nombre, apellido FROM eu_empleados ORDER BY apellido
      `).then((result) => {
                return result.rows.map((obj) => {
                    return {
                        id: obj.id,
                        empleado: obj.apellido + ' ' + obj.nombre
                    };
                });
            });
            res.jsonp(empleado);
        });
    }
    // LISTAR EMPLEADOS ACTIVOS EN EL SISTEMA
    Listar(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const empleado = yield database_1.default.query(`
      SELECT * FROM eu_empleados WHERE estado = 1 ORDER BY id
      `);
            res.jsonp(empleado.rows);
        });
    }
    // METODO QUE LISTA EMPLEADOS INHABILITADOS
    ListarEmpleadosDesactivados(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const empleado = yield database_1.default.query(`
      SELECT * FROM eu_empleados WHERE estado = 2 ORDER BY id
      `);
            res.jsonp(empleado.rows);
        });
    }
    // METODO PARA INHABILITAR USUARIOS EN EL SISTEMA
    DesactivarMultiplesEmpleados(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { arrayIdsEmpleados, user_name, ip } = req.body;
            if (arrayIdsEmpleados.length > 0) {
                arrayIdsEmpleados.forEach((obj) => __awaiter(this, void 0, void 0, function* () {
                    try {
                        // INICIAR TRANSACCION
                        yield database_1.default.query('BEGIN');
                        // CONSULTAR DATOSORIGINALES
                        const empleado = yield database_1.default.query(`
            SELECT * FROM eu_empleados WHERE id = $1
            `, [obj]);
                        const [datosOriginales] = empleado.rows;
                        const usuario = yield database_1.default.query(`
            SELECT * FROM eu_usuarios WHERE id_empleado = $1
            `, [obj]);
                        const [datosOriginalesUsuario] = usuario.rows;
                        if (!datosOriginales || !datosOriginalesUsuario) {
                            yield auditoriaControlador_1.default.InsertarAuditoria({
                                tabla: 'eu_empleados',
                                usuario: user_name,
                                accion: 'U',
                                datosOriginales: '',
                                datosNuevos: '',
                                ip,
                                observacion: `Error al inhabilitar empleado con id: ${obj}`
                            });
                            yield auditoriaControlador_1.default.InsertarAuditoria({
                                tabla: 'eu_usuarios',
                                usuario: user_name,
                                accion: 'U',
                                datosOriginales: '',
                                datosNuevos: '',
                                ip,
                                observacion: `Error al inhabilitar usuario con id_empleado: ${obj}`
                            });
                            // FINALIZAR TRANSACCION
                            yield database_1.default.query('COMMIT');
                            throw new Error('Error al inhabilitar empleado con id: ' + obj);
                        }
                        // 2 => DESACTIVADO O INACTIVO
                        yield database_1.default.query(`
            UPDATE eu_empleados SET estado = 2 WHERE id = $1
            `, [obj])
                            .then((result) => { });
                        const fechaNacimientoO = yield (0, settingsMail_1.FormatearFecha2)(datosOriginales.fecha_nacimiento, 'ddd');
                        // AUDITORIA
                        yield auditoriaControlador_1.default.InsertarAuditoria({
                            tabla: 'eu_empleados',
                            usuario: user_name,
                            accion: 'U',
                            datosOriginales: `{id: ${datosOriginales.id}, cedula: ${datosOriginales.cedula}, codigo: ${datosOriginales.codigo}, apellido: ${datosOriginales.apellido}, nombre: ${datosOriginales.nombre}, fecha_nacimiento: ${fechaNacimientoO}, estado_civil: ${datosOriginales.estado_civil}, genero: ${datosOriginales.genero}, correo: ${datosOriginales.correo}, mail_alternativo: ${datosOriginales.mail_alternativo}, estado: ${datosOriginales.estado}, domicilio: ${datosOriginales.domicilio}, telefono: ${datosOriginales.telefono}, id_nacionalidad: ${datosOriginales.id_nacionalidad}, imagen: ${datosOriginales.imagen}, longitud: ${datosOriginales.longitud}, latitud: ${datosOriginales.latitud}, web_access: ${datosOriginales.web_access}}`,
                            datosNuevos: `{id: ${datosOriginales.id}, cedula: ${datosOriginales.cedula}, codigo: ${datosOriginales.codigo}, apellido: ${datosOriginales.apellido}, nombre: ${datosOriginales.nombre}, fecha_nacimiento: ${fechaNacimientoO}, estado_civil: ${datosOriginales.estado_civil}, genero: ${datosOriginales.genero}, correo: ${datosOriginales.correo}, mail_alternativo: ${datosOriginales.mail_alternativo}, estado: 2, domicilio: ${datosOriginales.domicilio}, telefono: ${datosOriginales.telefono}, id_nacionalidad: ${datosOriginales.id_nacionalidad}, imagen: ${datosOriginales.imagen}, longitud: ${datosOriginales.longitud}, latitud: ${datosOriginales.latitud}, web_access: ${datosOriginales.web_access}}`,
                            ip,
                            observacion: null
                        });
                        // FALSE => YA NO TIENE ACCESO
                        yield database_1.default.query(`
            UPDATE eu_usuarios SET estado = false, app_habilita = false WHERE id_empleado = $1
            `, [obj])
                            .then((result) => { });
                        // AUDITORIA
                        yield auditoriaControlador_1.default.InsertarAuditoria({
                            tabla: 'eu_usuarios',
                            usuario: user_name,
                            accion: 'U',
                            datosOriginales: JSON.stringify(datosOriginalesUsuario),
                            datosNuevos: `{estado: false, app_habilita: false}`,
                            ip,
                            observacion: null
                        });
                        // FINALIZAR TRANSACCION
                        yield database_1.default.query('COMMIT');
                    }
                    catch (error) {
                        // REVERTIR TRANSACCION
                        yield database_1.default.query('ROLLBACK');
                    }
                }));
                return res.jsonp({ message: 'Usuarios inhabilitados exitosamente.' });
            }
            return res.jsonp({ message: 'Upss!!! ocurrio un error.' });
        });
    }
    // METODO PARA HABILITAR EMPLEADOS
    ActivarMultiplesEmpleados(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { arrayIdsEmpleados, user_name, ip } = req.body;
            if (arrayIdsEmpleados.length > 0) {
                arrayIdsEmpleados.forEach((obj) => __awaiter(this, void 0, void 0, function* () {
                    try {
                        // INICIAR TRANSACCION
                        yield database_1.default.query('BEGIN');
                        // CONSULTAR DATOSORIGINALES
                        const empleado = yield database_1.default.query(`
            SELECT * FROM eu_empleados WHERE id = $1
            `, [obj]);
                        const [datosOriginales] = empleado.rows;
                        const usuario = yield database_1.default.query(`
            SELECT * FROM eu_usuarios WHERE id_empleado = $1
            `, [obj]);
                        const [datosOriginalesUsuario] = usuario.rows;
                        if (!datosOriginales || !datosOriginalesUsuario) {
                            yield auditoriaControlador_1.default.InsertarAuditoria({
                                tabla: 'eu_empleados',
                                usuario: user_name,
                                accion: 'U',
                                datosOriginales: '',
                                datosNuevos: '',
                                ip,
                                observacion: `Error al activar empleado con id: ${obj}`
                            });
                            yield auditoriaControlador_1.default.InsertarAuditoria({
                                tabla: 'eu_usuarios',
                                usuario: user_name,
                                accion: 'U',
                                datosOriginales: '',
                                datosNuevos: '',
                                ip,
                                observacion: `Error al activar usuario con id_empleado: ${obj}`
                            });
                            // FINALIZAR TRANSACCION
                            yield database_1.default.query('COMMIT');
                            throw new Error('Error al activar empleado con id: ' + obj);
                        }
                        // 1 => ACTIVADO
                        yield database_1.default.query(`
            UPDATE eu_empleados SET estado = 1 WHERE id = $1
            `, [obj])
                            .then((result) => { });
                        const fechaNacimientoO = yield (0, settingsMail_1.FormatearFecha2)(datosOriginales.fecha_nacimiento, 'ddd');
                        // AUDITORIA
                        yield auditoriaControlador_1.default.InsertarAuditoria({
                            tabla: 'eu_empleados',
                            usuario: user_name,
                            accion: 'U',
                            datosOriginales: `{id: ${datosOriginales.id}, cedula: ${datosOriginales.cedula}, codigo: ${datosOriginales.codigo}, apellido: ${datosOriginales.apellido}, nombre: ${datosOriginales.nombre}, fecha_nacimiento: ${fechaNacimientoO}, estado_civil: ${datosOriginales.estado_civil}, genero: ${datosOriginales.genero}, correo: ${datosOriginales.correo}, mail_alternativo: ${datosOriginales.mail_alternativo}, estado: ${datosOriginales.estado}, domicilio: ${datosOriginales.domicilio}, telefono: ${datosOriginales.telefono}, id_nacionalidad: ${datosOriginales.id_nacionalidad}, imagen: ${datosOriginales.imagen}, longitud: ${datosOriginales.longitud}, latitud: ${datosOriginales.latitud}, web_access: ${datosOriginales.web_access}}`,
                            datosNuevos: `{id: ${datosOriginales.id}, cedula: ${datosOriginales.cedula}, codigo: ${datosOriginales.codigo}, apellido: ${datosOriginales.apellido}, nombre: ${datosOriginales.nombre}, fecha_nacimiento: ${fechaNacimientoO}, estado_civil: ${datosOriginales.estado_civil}, genero: ${datosOriginales.genero}, correo: ${datosOriginales.correo}, mail_alternativo: ${datosOriginales.mail_alternativo}, estado: 1, domicilio: ${datosOriginales.domicilio}, telefono: ${datosOriginales.telefono}, id_nacionalidad: ${datosOriginales.id_nacionalidad}, imagen: ${datosOriginales.imagen}, longitud: ${datosOriginales.longitud}, latitud: ${datosOriginales.latitud}, web_access: ${datosOriginales.web_access}}`,
                            ip,
                            observacion: null
                        });
                        // TRUE => TIENE ACCESO
                        yield database_1.default.query(`
            UPDATE eu_usuarios SET estado = true, app_habilita = true WHERE id_empleado = $1
            `, [obj])
                            .then((result) => { });
                        // AUDITORIA
                        yield auditoriaControlador_1.default.InsertarAuditoria({
                            tabla: 'eu_usuarios',
                            usuario: user_name,
                            accion: 'U',
                            datosOriginales: JSON.stringify(datosOriginalesUsuario),
                            datosNuevos: `{estado: true, app_habilita: true}`,
                            ip,
                            observacion: null
                        });
                        // FINALIZAR TRANSACCION
                        yield database_1.default.query('COMMIT');
                    }
                    catch (error) {
                        // REVERTIR TRANSACCION
                        yield database_1.default.query('ROLLBACK');
                    }
                }));
                return res.jsonp({ message: 'Usuarios habilitados exitosamente.' });
            }
            return res.jsonp({ message: 'Upss!!! ocurrio un error.' });
        });
    }
    // METODO PARA HABILITAR TODA LA INFORMACION DEL EMPLEADO
    ReactivarMultiplesEmpleados(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { arrayIdsEmpleados, user_name, ip } = req.body;
            if (arrayIdsEmpleados.length > 0) {
                arrayIdsEmpleados.forEach((obj) => __awaiter(this, void 0, void 0, function* () {
                    try {
                        // INICIAR TRANSACCION
                        yield database_1.default.query('BEGIN');
                        // CONSULTAR DATOSORIGINALES
                        const empleado = yield database_1.default.query(`
            SELECT * FROM eu_empleados WHERE id = $1
            `, [obj]);
                        const [datosOriginales] = empleado.rows;
                        const usuario = yield database_1.default.query(`
            SELECT * FROM eu_usuarios WHERE id_empleado = $1
            `, [obj]);
                        const [datosOriginalesUsuario] = usuario.rows;
                        if (!datosOriginales || !datosOriginalesUsuario) {
                            yield auditoriaControlador_1.default.InsertarAuditoria({
                                tabla: 'eu_empleados',
                                usuario: user_name,
                                accion: 'U',
                                datosOriginales: '',
                                datosNuevos: '',
                                ip,
                                observacion: `Error al reactivar empleado con id: ${obj}`
                            });
                            yield auditoriaControlador_1.default.InsertarAuditoria({
                                tabla: 'eu_usuarios',
                                usuario: user_name,
                                accion: 'U',
                                datosOriginales: '',
                                datosNuevos: '',
                                ip,
                                observacion: `Error al reactivar usuario con id_empleado: ${obj}`
                            });
                            // FINALIZAR TRANSACCION
                            yield database_1.default.query('COMMIT');
                            throw new Error('Error al reactivar empleado con id: ' + obj);
                        }
                        // 1 => ACTIVADO
                        yield database_1.default.query(`
            UPDATE eu_empleados SET estado = 1 WHERE id = $1
            `, [obj])
                            .then((result) => { });
                        // AUDITORIA
                        yield auditoriaControlador_1.default.InsertarAuditoria({
                            tabla: 'eu_empleados',
                            usuario: user_name,
                            accion: 'U',
                            datosOriginales: JSON.stringify(datosOriginales),
                            datosNuevos: `{estado: 1}`,
                            ip,
                            observacion: null
                        });
                        // TRUE => TIENE ACCESO
                        yield database_1.default.query(`
            UPDATE eu_usuarios SET estado = true, app_habilita = true WHERE id_empleado = $1
            `, [obj])
                            .then((result) => { });
                        // AUDITORIA
                        yield auditoriaControlador_1.default.InsertarAuditoria({
                            tabla: 'eu_usuarios',
                            usuario: user_name,
                            accion: 'U',
                            datosOriginales: JSON.stringify(datosOriginalesUsuario),
                            datosNuevos: `{estado: true, app_habilita: true}`,
                            ip,
                            observacion: null
                        });
                        // FINALIZAR TRANSACCION
                        yield database_1.default.query('COMMIT');
                        // REVISAR
                        //EstadoHorarioPeriVacacion(obj);
                    }
                    catch (error) {
                        // REVERTIR TRANSACCION
                        yield database_1.default.query('ROLLBACK');
                    }
                }));
                return res.jsonp({ message: 'Usuarios habilitados exitosamente.' });
            }
            return res.jsonp({ message: 'Upps!!! ocurrio un error.' });
        });
    }
    // CARGAR IMAGEN DE EMPLEADO
    CrearImagenEmpleado(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            sharp.cache(false);
            try {
                // FECHA DEL SISTEMA
                const fecha = (0, moment_1.default)();
                const anio = fecha.format('YYYY');
                const mes = fecha.format('MM');
                const dia = fecha.format('DD');
                const id = req.params.id_empleado;
                const separador = path_1.default.sep;
                const { user_name, ip } = req.body;
                const unEmpleado = yield database_1.default.query(`
        SELECT * FROM eu_empleados WHERE id = $1
        `, [id]);
                let ruta_temporal = (0, accesoCarpetas_2.ObtenerRutaLeerPlantillas)() + separador + ((_a = req.file) === null || _a === void 0 ? void 0 : _a.originalname);
                if (unEmpleado.rowCount != 0) {
                    const imagen = `${unEmpleado.rows[0].codigo}_${anio}_${mes}_${dia}_${(_b = req.file) === null || _b === void 0 ? void 0 : _b.originalname}`;
                    let verificar_imagen = 0;
                    // RUTA DE LA CARPETA IMAGENES DEL USUARIO
                    const carpetaImagenes = yield (0, accesoCarpetas_1.ObtenerRutaUsuario)(id);
                    // VERIFICACION DE EXISTENCIA CARPETA IMAGENES DE USUARIO
                    fs_1.default.access(carpetaImagenes, fs_1.default.constants.F_OK, (err) => {
                        if (err) {
                            // METODO MKDIR PARA CREAR LA CARPETA
                            fs_1.default.mkdir(carpetaImagenes, { recursive: true }, (err) => {
                                if (err) {
                                    verificar_imagen = 1;
                                }
                                else {
                                    verificar_imagen = 0;
                                }
                            });
                        }
                        else {
                            verificar_imagen = 0;
                        }
                    });
                    // VERIFICAR SI LA CARPETA DE IMAGENES SE CREO
                    if (verificar_imagen === 0) {
                        let ruta_guardar = (yield (0, accesoCarpetas_1.ObtenerRutaUsuario)(unEmpleado.rows[0].id)) + separador + imagen;
                        //console.log('ruta 1 ', ruta1)
                        fs_1.default.access(ruta_temporal, fs_1.default.constants.F_OK, (err) => {
                            if (!err) {
                                sharp(ruta_temporal)
                                    .resize(800) // CAMBIA EL TAMAÑO DE LA IMAGEN A UN ANCHO DE 800 PIXELES, MANTIENE LA RELACION DE ASPECTO
                                    .jpeg({ quality: 80 }) // CONFIGURA LA CALIDAD DE LA IMAGEN JPEG AL 80%
                                    .toFile(ruta_guardar);
                                // ELIMIAR EL ARCHIVO ORIGINAL
                                setTimeout(() => __awaiter(this, void 0, void 0, function* () {
                                    fs_1.default.unlinkSync(ruta_temporal);
                                }), 1000); // ESPERAR 1 SEGUNDO
                            }
                        });
                        // VERIFICAR EXISTENCIA DE IMAGEN Y ELIMINARLA PARA ACTUALIZAR
                        if (unEmpleado.rows[0].imagen && unEmpleado.rows[0].imagen !== 'null') {
                            const ruta = (yield (0, accesoCarpetas_1.ObtenerRutaUsuario)(unEmpleado.rows[0].id)) + separador + unEmpleado.rows[0].imagen;
                            fs_1.default.access(ruta, fs_1.default.constants.F_OK, (err) => {
                                if (!err) {
                                    fs_1.default.unlinkSync(ruta);
                                }
                            });
                        }
                        // INICIAR TRANSACCION
                        yield database_1.default.query('BEGIN');
                        // CONSULTAR DATOSORIGINALES
                        const empleado = yield database_1.default.query(`
            SELECT * FROM eu_empleados WHERE id = $1
            `, [id]);
                        const [datosOriginales] = empleado.rows;
                        if (!datosOriginales) {
                            yield auditoriaControlador_1.default.InsertarAuditoria({
                                tabla: 'eu_empleados',
                                usuario: user_name,
                                accion: 'U',
                                datosOriginales: '',
                                datosNuevos: '',
                                ip,
                                observacion: `Error al actualizar imagen del usuario con id: ${id}. Registro no encontrado.`
                            });
                            // FINALIZAR TRANSACCION
                            yield database_1.default.query('COMMIT');
                            throw new Error('Error al actualizar imagen del usuario con id: ' + id);
                        }
                        yield database_1.default.query(`
            UPDATE eu_empleados SET imagen = $2 WHERE id = $1
            `, [id, imagen]);
                        const fechaNacimientoO = yield (0, settingsMail_1.FormatearFecha2)(datosOriginales.fecha_nacimiento, 'ddd');
                        // AUDITORIA
                        yield auditoriaControlador_1.default.InsertarAuditoria({
                            tabla: 'eu_empleados',
                            usuario: user_name,
                            accion: 'U',
                            datosOriginales: `{id: ${datosOriginales.id}, cedula: ${datosOriginales.cedula}, codigo: ${datosOriginales.codigo}, apellido: ${datosOriginales.apellido}, nombre: ${datosOriginales.nombre}, fecha_nacimiento: ${fechaNacimientoO}, estado_civil: ${datosOriginales.estado_civil}, genero: ${datosOriginales.genero}, correo: ${datosOriginales.correo}, mail_alternativo: ${datosOriginales.mail_alternativo}, estado: ${datosOriginales.estado}, domicilio: ${datosOriginales.domicilio}, telefono: ${datosOriginales.telefono}, id_nacionalidad: ${datosOriginales.id_nacionalidad}, imagen: ${datosOriginales.imagen}, longitud: ${datosOriginales.longitud}, latitud: ${datosOriginales.latitud}, web_access: ${datosOriginales.web_access}}`,
                            datosNuevos: `{id: ${datosOriginales.id}, cedula: ${datosOriginales.cedula}, codigo: ${datosOriginales.codigo}, apellido: ${datosOriginales.apellido}, nombre: ${datosOriginales.nombre}, fecha_nacimiento: ${fechaNacimientoO}, estado_civil: ${datosOriginales.estado_civil}, genero: ${datosOriginales.genero}, correo: ${datosOriginales.correo}, mail_alternativo: ${datosOriginales.mail_alternativo}, estado: ${datosOriginales.estado}, domicilio: ${datosOriginales.domicilio}, telefono: ${datosOriginales.telefono}, id_nacionalidad: ${datosOriginales.id_nacionalidad}, imagen: ${imagen}, longitud: ${datosOriginales.longitud}, latitud: ${datosOriginales.latitud}, web_access: ${datosOriginales.web_access}}`,
                            ip,
                            observacion: null
                        });
                        // FINALIZAR TRANSACCION
                        yield database_1.default.query('COMMIT');
                        res.jsonp({ message: 'Imagen actualizada.' });
                    }
                    else {
                        res.jsonp({ message: 'error' });
                    }
                }
            }
            catch (error) {
                // REVERTIR TRANSACCION
                yield database_1.default.query('ROLLBACK');
                res.status(500).jsonp({ message: 'Error al actualizar imagen del usuario.' });
            }
        });
    }
    // METODO PARA TOMAR DATOS DE LA UBICACION DEL DOMICILIO DEL EMPLEADO
    GeolocalizacionCrokis(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let id = req.params.id;
            let { lat, lng, user_name, ip } = req.body;
            console.log(lat, lng, id);
            try {
                // INICIAR TRANSACCION
                yield database_1.default.query('BEGIN');
                // CONSULTAR DATOSORIGINALES
                const empleado = yield database_1.default.query(`
        SELECT * FROM eu_empleados WHERE id = $1
        `, [id]);
                const [datosOriginales] = empleado.rows;
                if (!datosOriginales) {
                    yield auditoriaControlador_1.default.InsertarAuditoria({
                        tabla: 'eu_empleados',
                        usuario: user_name,
                        accion: 'U',
                        datosOriginales: '',
                        datosNuevos: '',
                        ip,
                        observacion: `Error al actualizar geolocalización de empleado con id: ${id}. Registro no encontrado.`
                    });
                    // FINALIZAR TRANSACCION
                    yield database_1.default.query('COMMIT');
                    return res.status(404).jsonp({ message: 'Error al actualizar geolocalización de empleado.' });
                }
                const datosNuevos = yield database_1.default.query(`
        UPDATE eu_empleados SET latitud = $1, longitud = $2 WHERE id = $3 RETURNING *
        `, [lat, lng, id]);
                // AUDITORIA
                yield auditoriaControlador_1.default.InsertarAuditoria({
                    tabla: 'eu_empleados',
                    usuario: user_name,
                    accion: 'U',
                    datosOriginales: JSON.stringify(datosOriginales),
                    datosNuevos: JSON.stringify(datosNuevos.rows[0]),
                    ip,
                    observacion: null
                });
                // FINALIZAR TRANSACCION
                yield database_1.default.query('COMMIT');
                return res.status(200).jsonp({ message: 'Registro actualizado.' });
            }
            catch (error) {
                // REVERTIR TRANSACCION
                yield database_1.default.query('ROLLBACK');
                return res.status(500).jsonp({ message: error });
            }
        });
    }
    /** **************************************************************************************** **
     ** **                       MANEJO DE DATOS DE TITULO PROFESIONAL                        ** **
     ** **************************************************************************************** **/
    // BUSQUEDA DE TITULOS PROFESIONALES DEL EMPLEADO
    ObtenerTitulosEmpleado(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id_empleado } = req.params;
            const unEmpleadoTitulo = yield database_1.default.query(`
        SELECT et.id, et.observacion As observaciones, et.id_titulo, 
          et.id_empleado, ct.nombre, nt.nombre as nivel
        FROM eu_empleado_titulos AS et, et_titulos AS ct, et_cat_nivel_titulo AS nt
        WHERE et.id_empleado = $1 AND et.id_titulo = ct.id AND ct.id_nivel = nt.id
        ORDER BY id
        `, [id_empleado]);
            if (unEmpleadoTitulo.rowCount != 0) {
                return res.jsonp(unEmpleadoTitulo.rows);
            }
            else {
                res.status(404).jsonp({ text: 'No se encuentran registros.' });
            }
        });
    }
    // METODO PARA BUSCAR TITULO ESPECIFICO DEL EMPLEADO
    ObtenerTituloEspecifico(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id_empleado, id_titulo } = req.body;
            const unEmpleadoTitulo = yield database_1.default.query(`
      SELECT et.id
      FROM eu_empleado_titulos AS et
      WHERE et.id_empleado = $1 AND et.id_titulo = $2
      `, [id_empleado, id_titulo]);
            if (unEmpleadoTitulo.rowCount != 0) {
                return res.jsonp(unEmpleadoTitulo.rows);
            }
            else {
                res.status(404).jsonp({ text: 'No se encuentran registros.' });
            }
        });
    }
    // INGRESAR TITULO PROFESIONAL DEL EMPLEADO
    CrearEmpleadoTitulos(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { observacion, id_empleado, id_titulo, user_name, ip } = req.body;
                // INICIAR TRANSACCION
                yield database_1.default.query('BEGIN');
                const usuario = yield database_1.default.query(`
        SELECT id FROM eu_usuarios WHERE id_empleado = $1
        `, [id_empleado]);
                const id_usuario = usuario.rows[0].id;
                const datosNuevos = yield database_1.default.query(`
        INSERT INTO eu_empleado_titulos (observacion, id_empleado, id_titulo, id_usuario) VALUES ($1, $2, $3, $4) RETURNING *
        `, [observacion, id_empleado, id_titulo, id_usuario]);
                // AUDITORIA
                yield auditoriaControlador_1.default.InsertarAuditoria({
                    tabla: 'eu_empleado_titulos',
                    usuario: user_name,
                    accion: 'I',
                    datosOriginales: '',
                    datosNuevos: JSON.stringify(datosNuevos.rows[0]),
                    ip,
                    observacion: null
                });
                // FINALIZAR TRANSACCION
                yield database_1.default.query('COMMIT');
                res.jsonp({ message: 'Registro guardado.' });
            }
            catch (error) {
                // REVERTIR TRANSACCION
                yield database_1.default.query('ROLLBACK');
                res.status(500).jsonp({ message: 'error' });
            }
        });
    }
    // ACTUALIZAR TITULO PROFESIONAL DEL EMPLEADO
    EditarTituloEmpleado(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = req.params.id_empleado_titulo;
                const { observacion, id_titulo, user_name, ip } = req.body;
                // INICIAR TRANSACCION
                yield database_1.default.query('BEGIN');
                // CONSULTAR DATOSORIGINALES
                const empleado = yield database_1.default.query('SELECT * FROM eu_empleado_titulos WHERE id = $1', [id]);
                const [datosOriginales] = empleado.rows;
                if (!datosOriginales) {
                    yield auditoriaControlador_1.default.InsertarAuditoria({
                        tabla: 'eu_empleado_titulos',
                        usuario: user_name,
                        accion: 'U',
                        datosOriginales: '',
                        datosNuevos: '',
                        ip,
                        observacion: `Error al actualizar titulo del empleado con id: ${id}. Registro no encontrado.`
                    });
                    // FINALIZAR TRANSACCION
                    yield database_1.default.query('COMMIT');
                    return res.status(404).jsonp({ message: 'Error al actualizar titulo del empleado.' });
                }
                const datosNuevos = yield database_1.default.query(`
        UPDATE eu_empleado_titulos SET observacion = $1, id_titulo = $2 WHERE id = $3 RETURNING *
        `, [observacion, id_titulo, id]);
                // AUDITORIA
                yield auditoriaControlador_1.default.InsertarAuditoria({
                    tabla: 'eu_empleado_titulos',
                    usuario: user_name,
                    accion: 'U',
                    datosOriginales: JSON.stringify(datosOriginales),
                    datosNuevos: JSON.stringify(datosNuevos.rows[0]),
                    ip,
                    observacion: null
                });
                // FINALIZAR TRANSACCION
                yield database_1.default.query('COMMIT');
                return res.jsonp({ message: 'Registro actualizado.' });
            }
            catch (error) {
                // REVERTIR TRANSACCION
                yield database_1.default.query('ROLLBACK');
                return res.status(500).jsonp({ message: 'error' });
            }
        });
    }
    // METODO PARA ELIMINAR TITULO PROFESIONAL DEL EMPLEADO
    EliminarTituloEmpleado(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { user_name, ip } = req.body;
                const id = req.params.id_empleado_titulo;
                // INICIAR TRANSACCION
                yield database_1.default.query('BEGIN');
                // CONSULTAR DATOSORIGINALES
                const empleado = yield database_1.default.query('SELECT * FROM eu_empleado_titulos WHERE id = $1', [id]);
                const [datosOriginales] = empleado.rows;
                if (!datosOriginales) {
                    yield auditoriaControlador_1.default.InsertarAuditoria({
                        tabla: 'eu_empleado_titulos',
                        usuario: user_name,
                        accion: 'D',
                        datosOriginales: '',
                        datosNuevos: '',
                        ip,
                        observacion: `Error al eliminar titulo del empleado con id: ${id}. Registro no encontrado.`
                    });
                    // FINALIZAR TRANSACCION
                    yield database_1.default.query('COMMIT');
                    return res.status(404).jsonp({ message: 'Error al eliminar titulo del empleado.' });
                }
                yield database_1.default.query(`
        DELETE FROM eu_empleado_titulos WHERE id = $1
        `, [id]);
                // AUDITORIA
                yield auditoriaControlador_1.default.InsertarAuditoria({
                    tabla: 'eu_empleado_titulos',
                    usuario: user_name,
                    accion: 'D',
                    datosOriginales: JSON.stringify(datosOriginales),
                    datosNuevos: '',
                    ip,
                    observacion: null
                });
                // FINALIZAR TRANSACCION
                yield database_1.default.query('COMMIT');
                return res.jsonp({ message: 'Registro eliminado.' });
            }
            catch (error) {
                // REVERTIR TRANSACCION
                yield database_1.default.query('ROLLBACK');
                return res.status(500).jsonp({ message: 'error' });
            }
        });
    }
    /** ******************************************************************************************* **
     ** **               CONSULTAS DE COORDENADAS DE UBICACION DEL USUARIO                       ** **
     ** ******************************************************************************************* **/
    // METODO PARA BUSCAR DATOS DE COORDENADAS DE DOMICILIO
    BuscarCoordenadas(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const UBICACION = yield database_1.default.query(`
      SELECT longitud, latitud FROM eu_empleados WHERE id = $1
      `, [id]);
            if (UBICACION.rowCount != 0) {
                return res.jsonp(UBICACION.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se ha encontrado registros.' });
            }
        });
    }
    // BUSQUEDA DE DATOS DE EMPLEADO INGRESANDO EL NOMBRE
    BuscarEmpleadoNombre(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { informacion } = req.body;
            const EMPLEADO = yield database_1.default.query(`
      SELECT * FROM eu_empleados WHERE
      (UPPER (apellido) || \' \' || UPPER (nombre)) = $1
      `, [informacion]);
            if (EMPLEADO.rowCount != 0) {
                return res.jsonp(EMPLEADO.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'Registro no encontrado.' });
            }
        });
    }
    // BUSQUEDA DE IMAGEN DE EMPLEADO
    BuscarImagen(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const imagen = req.params.imagen;
            const id = req.params.id;
            let separador = path_1.default.sep;
            let ruta = (yield (0, accesoCarpetas_1.ObtenerRutaUsuario)(id)) + separador + imagen;
            console.log('ver file ', ruta);
            fs_1.default.access(ruta, fs_1.default.constants.F_OK, (err) => {
                if (err) {
                }
                else {
                    res.sendFile(path_1.default.resolve(ruta));
                }
            });
        });
    }
    // METODO PARA CONVERTIR IMAGEN EN BASE64
    getImagenBase64(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const imagen = req.params.imagen;
            const id = req.params.id;
            let separador = path_1.default.sep;
            let ruta = (yield (0, accesoCarpetas_1.ObtenerRutaUsuario)(id)) + separador + imagen;
            let verificador = 0;
            //console.log('imagen ------ ', ruta)
            fs_1.default.access(ruta, fs_1.default.constants.F_OK, (err) => {
                if (err) {
                    verificador = 1;
                }
                else {
                    verificador = 0;
                }
            });
            if (verificador === 0) {
                const codificado = (0, ImagenCodificacion_1.ConvertirImagenBase64)(ruta);
                //console.log('codificado ', codificado)
                if (codificado === 0) {
                    res.status(200).jsonp({ imagen: 0 });
                }
                else {
                    res.status(200).jsonp({ imagen: codificado });
                }
            }
            else {
                res.status(200).jsonp({ imagen: 0 });
            }
        });
    }
    // BUSQUEDA INFORMACION DEPARTAMENTOS EMPLEADO
    ObtenerDepartamentoEmpleado(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id_emple, id_cargo } = req.body;
            const DEPARTAMENTO = yield database_1.default.query(`
      SELECT * FROM VistaDepartamentoEmpleado WHERE id_emple = $1 AND
      id_cargo = $2
      `, [id_emple, id_cargo]);
            if (DEPARTAMENTO.rowCount != 0) {
                return res.jsonp(DEPARTAMENTO.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'Registros no encontrados.' });
            }
        });
    }
    // METODO PARA ELIMINAR REGISTROS
    EliminarEmpleado(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { empleados, user_name, ip } = req.body;
            let empleadosRegistrados = false;
            let errorEliminar = false;
            for (const e of empleados) {
                try {
                    // INICIAR TRANSACCION
                    yield database_1.default.query('BEGIN');
                    // CONSULTAR DATOS ORIGINALES
                    const usuario = yield database_1.default.query('SELECT * FROM eu_usuarios WHERE id_empleado = $1', [e.id]);
                    const [datosOriginalesUsuarios] = usuario.rows;
                    const empleado = yield database_1.default.query('SELECT * FROM eu_empleados WHERE id = $1', [e.id]);
                    const [datosOriginalesEmpleado] = empleado.rows;
                    if (!datosOriginalesUsuarios || !datosOriginalesEmpleado) {
                        yield auditoriaControlador_1.default.InsertarAuditoria({
                            tabla: 'eu_usuarios',
                            usuario: user_name,
                            accion: 'D',
                            datosOriginales: '',
                            datosNuevos: '',
                            ip,
                            observacion: `Error al eliminar usuario con id: ${e.id}. Registro no encontrado.`
                        });
                        yield auditoriaControlador_1.default.InsertarAuditoria({
                            tabla: 'eu_empleados',
                            usuario: user_name,
                            accion: 'D',
                            datosOriginales: '',
                            datosNuevos: '',
                            ip,
                            observacion: `Error al eliminar empleado con id: ${e.id}. Registro no encontrado.`
                        });
                        errorEliminar = true;
                        yield database_1.default.query('COMMIT');
                        continue;
                    }
                    const datosActuales = yield database_1.default.query('SELECT * FROM datos_actuales_empleado WHERE id = $1', [e.id]);
                    const [datosActualesEmpleado] = datosActuales.rows;
                    const contratos = yield database_1.default.query('SELECT * FROM eu_empleado_contratos WHERE id_empleado = $1', [e.id]);
                    const [datosContratos] = contratos.rows;
                    const titulos = yield database_1.default.query('SELECT * FROM eu_empleado_titulos WHERE id_empleado = $1', [e.id]);
                    const [datosTitulos] = titulos.rows;
                    const discapacidad = yield database_1.default.query('SELECT * FROM eu_empleado_discapacidad WHERE id_empleado = $1', [e.id]);
                    const [datosDiscapacidad] = discapacidad.rows;
                    const vacunas = yield database_1.default.query('SELECT * FROM eu_empleado_vacunas WHERE id_empleado = $1', [e.id]);
                    const [datosVacunas] = vacunas.rows;
                    if (datosActualesEmpleado || datosContratos || datosTitulos || datosDiscapacidad || datosVacunas) {
                        empleadosRegistrados = true;
                        continue;
                    }
                    // ELIMINAR USUARIO
                    yield database_1.default.query('DELETE FROM eu_usuarios WHERE id_empleado = $1', [e.id]);
                    // AUDITORIA
                    yield auditoriaControlador_1.default.InsertarAuditoria({
                        tabla: 'eu_usuarios',
                        usuario: user_name,
                        accion: 'D',
                        datosOriginales: JSON.stringify(datosOriginalesUsuarios),
                        datosNuevos: '',
                        ip,
                        observacion: null
                    });
                    // ELIMINAR EMPLEADO
                    yield database_1.default.query('DELETE FROM eu_empleados WHERE id = $1', [e.id]);
                    const fechaNacimientoO = yield (0, settingsMail_1.FormatearFecha2)(datosOriginalesEmpleado.fecha_nacimiento, 'ddd');
                    datosOriginalesEmpleado.fecha_nacimiento = fechaNacimientoO;
                    // AUDITORIA
                    yield auditoriaControlador_1.default.InsertarAuditoria({
                        tabla: 'eu_empleados',
                        usuario: user_name,
                        accion: 'D',
                        datosOriginales: JSON.stringify(datosOriginalesEmpleado),
                        datosNuevos: '',
                        ip,
                        observacion: null
                    });
                    // FINALIZAR TRANSACCION
                    yield database_1.default.query('COMMIT');
                }
                catch (error) {
                    // REVERTIR TRANSACCION
                    yield database_1.default.query('ROLLBACK');
                    if (error.code === '23503') {
                        empleadosRegistrados = true;
                    }
                    else {
                        errorEliminar = true;
                    }
                }
            }
            if (errorEliminar) {
                return res.status(500).jsonp({ message: 'Ocurrió un error al eliminar usuarios.' });
            }
            if (empleadosRegistrados) {
                return res.status(404).jsonp({ message: 'No se eliminaron algunos usuarios ya que tienen información registrada.' });
            }
            return res.jsonp({ message: 'Usuarios eliminados correctamente.' });
        });
    }
    /** **************************************************************************************** **
     ** **                      CARGAR INFORMACION MEDIANTE PLANTILLA                            **
     ** **************************************************************************************** **/
    VerificarPlantilla_Automatica(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const documento = (_a = req.file) === null || _a === void 0 ? void 0 : _a.originalname;
                let separador = path_1.default.sep;
                let ruta = (0, accesoCarpetas_2.ObtenerRutaLeerPlantillas)() + separador + documento;
                const workbook = xlsx_1.default.readFile(ruta);
                let verificador = (0, accesoCarpetas_1.ObtenerIndicePlantilla)(workbook, 'EMPLEADOS');
                if (verificador === false) {
                    return res.jsonp({ message: 'no_existe', data: undefined });
                }
                else {
                    const sheet_name_list = workbook.SheetNames;
                    const plantilla = xlsx_1.default.utils.sheet_to_json(workbook.Sheets[sheet_name_list[verificador]]);
                    let data = {
                        fila: '',
                        cedula: '',
                        apellido: '',
                        nombre: '',
                        estado_civil: '',
                        genero: '',
                        correo: '',
                        fec_nacimiento: '',
                        latitud: '',
                        longitud: '',
                        domicilio: '',
                        telefono: '',
                        nacionalidad: '',
                        usuario: '',
                        contrasena: '',
                        rol: '',
                        observacion: '',
                    };
                    const estadoCivilArray = ['Soltero/a', 'Union de Hecho', 'Casado/a', 'Divorciado/a', 'Viudo/a'];
                    const tipogenero = ['masculino', 'femenino'];
                    // VALIDA SI LOS DATOS DE LA COLUMNA CEDULA SON NUMEROS.
                    const regex = /^[0-9]+$/;
                    const valiContra = /\s/;
                    // Expresión regular para validar la latitud y longitud
                    const regexLatitud = /^-?([1-8]?\d(\.\d+)?|90(\.0+)?)$/;
                    const regexLongitud = /^-?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)$/;
                    var listEmpleados = [];
                    var duplicados = [];
                    var duplicados1 = [];
                    var duplicados2 = [];
                    var mensaje = 'correcto';
                    plantilla.forEach((dato) => __awaiter(this, void 0, void 0, function* () {
                        // DATOS QUE SE LEEN DE LA PLANTILLA INGRESADA
                        var { ITEM, CEDULA, APELLIDO, NOMBRE, USUARIO, CONTRASENA, ROL, ESTADO_CIVIL, GENERO, CORREO, FECHA_NACIMIENTO, LATITUD, LONGITUD, DOMICILIO, TELEFONO, NACIONALIDAD } = dato;
                        // VERIFICAR QUE EL REGISTO NO TENGA DATOS VACIOS
                        if ((ITEM != undefined && ITEM != '') &&
                            (CEDULA != undefined) && (APELLIDO != undefined) &&
                            (NOMBRE != undefined) && (ESTADO_CIVIL != undefined) &&
                            (GENERO != undefined) && (CORREO != undefined) &&
                            (FECHA_NACIMIENTO != undefined) &&
                            (LATITUD != undefined) && (LONGITUD != undefined) &&
                            (DOMICILIO != undefined) && (TELEFONO != undefined) &&
                            (NACIONALIDAD != undefined) && (USUARIO != undefined) &&
                            (CONTRASENA != undefined) && (ROL != undefined)) {
                            data.fila = ITEM;
                            data.cedula = CEDULA;
                            data.nombre = NOMBRE;
                            data.apellido = APELLIDO;
                            data.usuario = USUARIO;
                            data.contrasena = CONTRASENA;
                            data.rol = ROL;
                            data.estado_civil = ESTADO_CIVIL;
                            data.genero = GENERO;
                            data.correo = CORREO;
                            data.fec_nacimiento = FECHA_NACIMIENTO;
                            data.latitud = LATITUD;
                            data.longitud = LONGITUD;
                            data.domicilio = DOMICILIO;
                            data.telefono = TELEFONO;
                            data.nacionalidad = NACIONALIDAD;
                            data.observacion = 'no registrado';
                            if (regex.test(data.cedula)) {
                                if (data.cedula.toString().length != 10) {
                                    data.observacion = 'La cédula ingresada no es válida';
                                }
                                else {
                                    if (!valiContra.test(data.contrasena.toString())) {
                                        //console.log('entro ', data.contrasena.toString().length);
                                        if (data.contrasena.toString().length <= 10) {
                                            if (estadoCivilArray.includes(data.estado_civil)) {
                                                if (tipogenero.includes(data.genero.toLowerCase())) {
                                                    // VERIFICAR SI LA VARIABLE TIENE EL FORMATO DE FECHA CORRECTO CON moment
                                                    if ((0, moment_1.default)(FECHA_NACIMIENTO, 'YYYY-MM-DD', true).isValid()) {
                                                        // VALIDA SI LOS DATOS DE LA COLUMNA TELEFONO SON NUMEROS
                                                        if (TELEFONO != undefined) {
                                                            //console.log(data.telefono, ' entro ', regex.test(TELEFONO));
                                                            if (regex.test(data.telefono.toString())) {
                                                                if (data.telefono.toString().length > 10 || data.telefono.toString().length < 7) {
                                                                    data.observacion = 'El teléfono ingresado no es válido';
                                                                }
                                                                else {
                                                                    if (!regexLatitud.test(data.latitud) && !regexLongitud.test(data.longitud)) {
                                                                        data.observacion = '3';
                                                                    }
                                                                    else if (!regexLatitud.test(data.latitud) || !regexLongitud.test(data.longitud)) {
                                                                        data.observacion = 'Verificar ubicacion';
                                                                    }
                                                                    else {
                                                                        if (duplicados.find((p) => p.cedula === dato.cedula || p.usuario === dato.usuario) == undefined) {
                                                                            data.observacion = 'ok';
                                                                            duplicados.push(dato);
                                                                        }
                                                                    }
                                                                }
                                                            }
                                                            else {
                                                                data.observacion = 'El teléfono ingresado no es válido';
                                                            }
                                                        }
                                                    }
                                                    else {
                                                        data.observacion = 'Formato de fecha incorrecto (YYYY-MM-DD)';
                                                    }
                                                }
                                                else {
                                                    data.observacion = 'Género no es válido';
                                                }
                                            }
                                            else {
                                                data.observacion = 'Estado civil no es válido';
                                            }
                                        }
                                        else {
                                            data.observacion = 'La contraseña debe tener máximo 10 caracteres';
                                        }
                                    }
                                    else {
                                        data.observacion = 'La contraseña ingresada no es válida';
                                    }
                                }
                            }
                            else {
                                data.observacion = 'La cédula ingresada no es válida';
                            }
                            listEmpleados.push(data);
                        }
                        else {
                            data.fila = ITEM;
                            data.cedula = CEDULA;
                            data.nombre = NOMBRE;
                            data.apellido = APELLIDO;
                            data.usuario = USUARIO;
                            data.contrasena = CONTRASENA;
                            data.rol = ROL;
                            data.estado_civil = ESTADO_CIVIL;
                            data.genero = GENERO;
                            data.correo = CORREO;
                            data.fec_nacimiento = FECHA_NACIMIENTO;
                            data.latitud = LATITUD;
                            data.longitud = LONGITUD;
                            data.domicilio = DOMICILIO;
                            data.telefono = TELEFONO;
                            data.nacionalidad = NACIONALIDAD;
                            data.observacion = 'no registrado';
                            if (data.fila == '' || data.fila == undefined) {
                                data.fila = 'error';
                                mensaje = 'error';
                            }
                            if (APELLIDO == undefined) {
                                data.apellido = 'No registrado';
                                data.observacion = 'Apellido ' + data.observacion;
                            }
                            if (NOMBRE == undefined) {
                                data.nombre = 'No registrado';
                                data.observacion = 'Nombre ' + data.observacion;
                            }
                            if (ESTADO_CIVIL == undefined) {
                                data.estado_civil = 'No registrado';
                                data.observacion = 'Estado civil ' + data.observacion;
                            }
                            if (GENERO == undefined) {
                                data.genero = 'No registrado';
                                data.observacion = 'Género ' + data.observacion;
                            }
                            if (CORREO == undefined) {
                                data.correo = 'No registrado';
                                data.observacion = 'Correo ' + data.observacion;
                            }
                            if (FECHA_NACIMIENTO == undefined) {
                                data.fec_nacimiento = 'No registrado';
                                data.observacion = 'Fecha de nacimiento ' + data.observacion;
                            }
                            if (LATITUD == undefined) {
                                data.latitud = 'No registrado';
                                data.observacion = 'Latitud ' + data.observacion;
                            }
                            if (LONGITUD == undefined) {
                                data.longitud = 'No registrado';
                                data.observacion = 'Longitud ' + data.observacion;
                            }
                            if (DOMICILIO == undefined) {
                                data.domicilio = 'No registrado';
                                data.observacion = " ";
                            }
                            if (TELEFONO == undefined) {
                                data.telefono = 'No registrado';
                                data.observacion = " ";
                            }
                            if (NACIONALIDAD == undefined) {
                                data.nacionalidad = 'No registrado';
                                data.observacion = 'Nacionalidad ' + data.observacion;
                            }
                            if (USUARIO == undefined) {
                                data.usuario = 'No registrado';
                                data.observacion = 'Usuario ' + data.observacion;
                            }
                            if (CONTRASENA == undefined) {
                                data.contrasena = 'No registrado';
                                data.observacion = 'Contraseña no registrada';
                            }
                            if (ROL == undefined) {
                                data.rol = 'No registrado';
                                data.observacion = 'Rol ' + data.observacion;
                            }
                            if (CEDULA == undefined) {
                                data.cedula = 'No registrado';
                                data.observacion = 'Cédula ' + data.observacion;
                            }
                            else {
                                if (regex.test(data.cedula)) {
                                    if (data.cedula.toString().length != 10) {
                                        data.observacion = 'La cédula ingresada no es válida';
                                    }
                                    else {
                                        if (data.apellido != 'No registrado' && data.nombre != 'No registrado') {
                                            if (data.contrasena != 'No registrado') {
                                                if (!valiContra.test(data.contrasena.toString())) {
                                                    if (data.contrasena.toString().length <= 10) {
                                                        if (data.estado_civil != 'No registrado') {
                                                            if (estadoCivilArray.includes(data.estado_civil)) {
                                                                if (data.genero != 'No registrado') {
                                                                    if (tipogenero.includes(data.genero.toLowerCase())) {
                                                                        // VERIFICAR SI LA VARIABLE TIENE EL FORMATO DE FECHA CORRECTO CON moment
                                                                        if (data.fec_nacimiento != 'No registrado') {
                                                                            if ((0, moment_1.default)(FECHA_NACIMIENTO, 'YYYY-MM-DD', true).isValid()) {
                                                                                // VALIDA SI LOS DATOS DE LA COLUMNA TELEFONO SON NUMEROS.
                                                                                if (TELEFONO != undefined) {
                                                                                    //console.log(data.telefono, ' entro ', regex.test(TELEFONO));
                                                                                    if (regex.test(data.telefono.toString())) {
                                                                                        if (data.telefono.toString().length > 10 || data.telefono.toString().length < 7) {
                                                                                            //console.log('ent: ', data.telefono);
                                                                                            data.observacion = 'El teléfono ingresado no es válido';
                                                                                        }
                                                                                        else {
                                                                                            if (!regexLatitud.test(data.latitud) && !regexLongitud.test(data.longitud)) {
                                                                                                data.observacion = '3';
                                                                                            }
                                                                                            else if (!regexLatitud.test(data.latitud) || !regexLongitud.test(data.longitud)) {
                                                                                                data.observacion = 'Verificar ubicación';
                                                                                            }
                                                                                        }
                                                                                        //console.log(data.telefono);
                                                                                    }
                                                                                    else {
                                                                                        data.observacion = 'El teléfono ingresado no es válido';
                                                                                    }
                                                                                }
                                                                            }
                                                                            else {
                                                                                data.observacion = 'Formato de fecha incorrecto (YYYY-MM-DD)';
                                                                            }
                                                                        }
                                                                    }
                                                                    else {
                                                                        data.observacion = 'Género no es válido';
                                                                    }
                                                                }
                                                            }
                                                            else {
                                                                data.observacion = 'Estado civil no es válido';
                                                            }
                                                        }
                                                    }
                                                    else {
                                                        data.observacion = 'La contraseña debe tener máximo 10 caracteres';
                                                    }
                                                }
                                                else {
                                                    data.observacion = 'La contraseña ingresada no es válida';
                                                }
                                            }
                                        }
                                    }
                                }
                                else {
                                    data.observacion = 'La cédula ingresada no es válida';
                                }
                            }
                            listEmpleados.push(data);
                        }
                        data = {};
                    }));
                    // VERIFICAR EXISTENCIA DE CARPETA O ARCHIVO
                    fs_1.default.access(ruta, fs_1.default.constants.F_OK, (err) => {
                        if (err) {
                        }
                        else {
                            // ELIMINAR DEL SERVIDOR
                            fs_1.default.unlinkSync(ruta);
                        }
                    });
                    listEmpleados.forEach((valor) => __awaiter(this, void 0, void 0, function* () {
                        var VERIFICAR_CEDULA = yield database_1.default.query(`
            SELECT * FROM eu_empleados WHERE cedula = $1
            `, [valor.cedula]);
                        if (VERIFICAR_CEDULA.rows[0] != undefined && VERIFICAR_CEDULA.rows[0] != '') {
                            valor.observacion = 'Cédula ya existe en el sistema';
                        }
                        else {
                            var VERIFICAR_USUARIO = yield database_1.default.query(`
              SELECT * FROM eu_usuarios WHERE usuario = $1
              `, [valor.usuario]);
                            if (VERIFICAR_USUARIO.rows[0] != undefined && VERIFICAR_USUARIO.rows[0] != '') {
                                valor.observacion = 'Usuario ya existe en el sistema';
                            }
                            else {
                                if (valor.rol != 'No registrado') {
                                    var VERIFICAR_ROL = yield database_1.default.query(`
                  SELECT * FROM ero_cat_roles WHERE UPPER(nombre) = $1
                  `, [valor.rol.toUpperCase()]);
                                    if (VERIFICAR_ROL.rows[0] != undefined && VERIFICAR_ROL.rows[0] != '') {
                                        if (valor.nacionalidad != 'No registrado') {
                                            var VERIFICAR_NACIONALIDAD = yield database_1.default.query(`
                      SELECT * FROM e_cat_nacionalidades WHERE UPPER(nombre) = $1
                      `, [valor.nacionalidad.toUpperCase()]);
                                            if (VERIFICAR_NACIONALIDAD.rows[0] != undefined && VERIFICAR_NACIONALIDAD.rows[0] != '') {
                                                // DISCRIMINACION DE ELEMENTOS IGUALES
                                                if (duplicados1.find((p) => p.cedula === valor.cedula) == undefined) {
                                                    // DISCRIMINACIÓN DE ELEMENTOS IGUALES
                                                    if (duplicados2.find((a) => a.usuario === valor.usuario) == undefined) {
                                                        //valor.observacion = 'ok'
                                                        duplicados2.push(valor);
                                                    }
                                                    else {
                                                        valor.observacion = '2';
                                                    }
                                                    duplicados1.push(valor);
                                                }
                                                else {
                                                    valor.observacion = '1';
                                                }
                                            }
                                            else {
                                                valor.observacion = 'Nacionalidad no existe en el sistema';
                                            }
                                        }
                                    }
                                    else {
                                        valor.observacion = 'Rol no existe en el sistema';
                                    }
                                }
                            }
                        }
                    }));
                    var tiempo = 2000;
                    if (listEmpleados.length > 500 && listEmpleados.length <= 1000) {
                        tiempo = 4000;
                    }
                    else if (listEmpleados.length > 1000) {
                        tiempo = 7000;
                    }
                    setTimeout(() => {
                        listEmpleados.sort((a, b) => {
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
                        listEmpleados.forEach((item) => {
                            if (item.observacion == '1') {
                                item.observacion = 'Registro duplicado (cédula)';
                            }
                            else if (item.observacion == '2') {
                                item.observacion = 'Registro duplicado (usuario)';
                            }
                            else if (item.observacion == '3') {
                                item.observacion = 'no registrado';
                            }
                            if (item.observacion != undefined) {
                                let arrayObservacion = item.observacion.split(" ");
                                if (arrayObservacion[0] == 'no' || item.observacion == " ") {
                                    item.observacion = 'ok';
                                }
                            }
                            else {
                                item.observacion = 'Datos no registrado';
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
                        });
                        if (mensaje == 'error') {
                            listEmpleados = undefined;
                        }
                        //console.log('empleados: ', listEmpleados);
                        return res.jsonp({ message: mensaje, data: listEmpleados });
                    }, tiempo);
                }
            }
            catch (error) {
                return res.status(500).jsonp({ message: error });
            }
        });
    }
    CargarPlantilla_Automatico(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const { plantilla, user_name, ip } = req.body;
            // Expresión regular para validar la latitud y longitud
            const regexLatitud = /^-?([1-8]?\d(\.\d+)?|90(\.0+)?)$/;
            const regexLongitud = /^-?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)$/;
            const VALOR = yield database_1.default.query(`
      SELECT * FROM e_codigo
      `);
            var codigo_dato = VALOR.rows[0].valor;
            var codigo = 0;
            if (codigo_dato != null && codigo_dato != undefined && codigo_dato != '') {
                codigo = codigo_dato = parseInt(codigo_dato);
            }
            var contador = 1;
            let ocurrioError = false;
            let mensajeError = '';
            let codigoError = 0;
            for (const data of plantilla) {
                try {
                    // INICIAR TRANSACCION
                    yield database_1.default.query('BEGIN');
                    // REALIZA UN CAPITAL LETTER A LOS NOMBRES Y APELLIDOS
                    var nombreE;
                    let nombres = data.nombre.split(' ');
                    if (nombres.length > 1) {
                        let name1 = nombres[0].charAt(0).toUpperCase() + nombres[0].slice(1);
                        let name2 = nombres[1].charAt(0).toUpperCase() + nombres[1].slice(1);
                        nombreE = name1 + ' ' + name2;
                    }
                    else {
                        let name1 = nombres[0].charAt(0).toUpperCase() + nombres[0].slice(1);
                        nombreE = name1;
                    }
                    var apellidoE;
                    let apellidos = data.apellido.split(' ');
                    if (apellidos.length > 1) {
                        let lastname1 = apellidos[0].charAt(0).toUpperCase() + apellidos[0].slice(1);
                        let lastname2 = apellidos[1].charAt(0).toUpperCase() + apellidos[1].slice(1);
                        apellidoE = lastname1 + ' ' + lastname2;
                    }
                    else {
                        let lastname1 = apellidos[0].charAt(0).toUpperCase() + apellidos[0].slice(1);
                        apellidoE = lastname1;
                    }
                    // ENCRIPTAR CONTRASEÑA
                    var md5 = new ts_md5_1.Md5();
                    var contrasena = (_a = md5.appendStr(data.contrasena).end()) === null || _a === void 0 ? void 0 : _a.toString();
                    // DATOS QUE SE LEEN DE LA PLANTILLA INGRESADA
                    const { cedula, estado_civil, genero, correo, fec_nacimiento, domicilio, longitud, latitud, telefono, nacionalidad, usuario, rol } = data;
                    //OBTENER ID DEL ESTADO_CIVIL
                    var id_estado_civil = 0;
                    if (estado_civil.toUpperCase() === 'SOLTERO/A') {
                        id_estado_civil = 1;
                    }
                    else if (estado_civil.toUpperCase() === 'UNION DE HECHO') {
                        id_estado_civil = 2;
                    }
                    else if (estado_civil.toUpperCase() === 'CASADO/A') {
                        id_estado_civil = 3;
                    }
                    else if (estado_civil.toUpperCase() === 'DIVORCIADO/A') {
                        id_estado_civil = 4;
                    }
                    else if (estado_civil.toUpperCase() === 'VIUDO/A') {
                        id_estado_civil = 5;
                    }
                    //OBTENER ID DEL GENERO
                    var id_genero = 0;
                    if (genero.toUpperCase() === 'MASCULINO') {
                        id_genero = 1;
                    }
                    else if (genero.toUpperCase() === 'FEMENINO') {
                        id_genero = 2;
                    }
                    var _longitud = null;
                    if (longitud != 'No registrado') {
                        if (regexLongitud.test(data.longitud)) {
                            _longitud = longitud;
                        }
                    }
                    var _latitud = null;
                    if (latitud != 'No registrado') {
                        if (regexLatitud.test(data.latitud)) {
                            _latitud = latitud;
                        }
                    }
                    //OBTENER ID DEL ESTADO
                    var id_estado = 1;
                    var estado_user = true;
                    var app_habilita = false;
                    //OBTENER ID DE LA NACIONALIDAD
                    const id_nacionalidad = yield database_1.default.query(`
          SELECT * FROM e_cat_nacionalidades WHERE UPPER(nombre) = $1
          `, [nacionalidad.toUpperCase()]);
                    //OBTENER ID DEL ROL
                    const id_rol = yield database_1.default.query(`
          SELECT * FROM ero_cat_roles WHERE UPPER(nombre) = $1
          `, [rol.toUpperCase()]);
                    if (codigo_dato != null && codigo_dato != undefined && codigo_dato != '') {
                        // INCREMENTAR EL VALOR DEL CODIGO
                        codigo = codigo + 1;
                    }
                    else {
                        codigo = cedula;
                    }
                    /*console.log('codigo: ', codigo)
                    console.log('cedula: ', cedula, ' usuario: ', usuario, ' contrasena: ', contrasena);
                    console.log('nombre: ', nombreE, ' usuario: ', apellidoE, ' fecha nacimien: ', fec_nacimi, ' estado civil: ', id_estado_civil);
                    console.log('genero: ', id_genero, ' estado: ', id_estado, ' nacionalidad: ', id_nacionalidad.rows, ' rol: ', id_rol);
                    console.log('longitud: ', _longitud, ' latitud: ', _latitud)*/
                    // REGISTRO DE NUEVO EMPLEADO
                    const response = yield database_1.default.query(`
          INSERT INTO eu_empleados (cedula, apellido, nombre, estado_civil, genero, correo,
            fecha_nacimiento, estado, domicilio, telefono, id_nacionalidad, codigo, longitud, latitud) 
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING *
          `, [cedula, apellidoE, nombreE,
                        id_estado_civil, id_genero, correo, fec_nacimiento, id_estado,
                        domicilio, telefono, id_nacionalidad.rows[0]['id'], codigo, _longitud, _latitud]);
                    const [empleado] = response.rows;
                    // AUDITORIA
                    yield auditoriaControlador_1.default.InsertarAuditoria({
                        tabla: 'eu_empleados',
                        usuario: user_name,
                        accion: 'I',
                        datosOriginales: '',
                        datosNuevos: `{cedula: ${cedula}, apellido: ${apellidoE}, nombre: ${nombreE}, estado_civil: ${id_estado_civil}, genero: ${id_genero}, correo: ${correo}, fecha_nacimiento: ${fec_nacimiento}, estado: ${id_estado}, domicilio: ${domicilio}, telefono: ${telefono}, id_nacionalidad: ${id_nacionalidad.rows[0]['id']}, codigo: ${codigo}, longitud: ${_longitud}, latitud: ${_latitud}}`,
                        ip,
                        observacion: null
                    });
                    // OBTENER EL ID DEL EMPLEADO INGRESADO
                    const id_empleado = empleado.id;
                    //console.log('id ', id_empleado)
                    // REGISTRO DE LOS DATOS DE USUARIO
                    yield database_1.default.query(`
          INSERT INTO eu_usuarios (usuario, contrasena, estado, id_rol, id_empleado, app_habilita)
          VALUES ($1, $2, $3, $4, $5, $6)
          `, [usuario, contrasena, estado_user, id_rol.rows[0]['id'],
                        id_empleado, app_habilita]);
                    // AUDITORIA
                    yield auditoriaControlador_1.default.InsertarAuditoria({
                        tabla: 'eu_usuarios',
                        usuario: user_name,
                        accion: 'I',
                        datosOriginales: '',
                        datosNuevos: `{usuario: ${usuario}, contrasena: ${contrasena}, estado: ${estado_user}, id_rol: ${id_rol.rows[0]['id']}, id_empleado: ${id_empleado}, app_habilita: ${app_habilita}}`,
                        ip,
                        observacion: null
                    });
                    if (contador === plantilla.length) {
                        // ACTUALIZACION DEL CODIGO
                        if (codigo_dato != null && codigo_dato != undefined && codigo_dato != '') {
                            yield database_1.default.query(`
              UPDATE e_codigo SET valor = $1 WHERE id = $2
              `, [codigo, VALOR.rows[0].id]);
                            // AUDITORIA
                            yield auditoriaControlador_1.default.InsertarAuditoria({
                                tabla: 'e_codigo',
                                usuario: user_name,
                                accion: 'U',
                                datosOriginales: JSON.stringify(codigo_dato),
                                datosNuevos: `{valor: ${codigo}}`,
                                ip,
                                observacion: null
                            });
                        }
                        // FINALIZAR TRANSACCION
                        yield database_1.default.query('COMMIT');
                    }
                    contador = contador + 1;
                    contrasena = undefined;
                }
                catch (error) {
                    // REVERTIR TRANSACCION
                    yield database_1.default.query('ROLLBACK');
                    ocurrioError = true;
                    mensajeError = error;
                    codigoError = 500;
                    break;
                }
            }
            if (ocurrioError) {
                res.status(500).jsonp({ message: mensajeError });
            }
            else {
                res.jsonp({ message: 'correcto' });
            }
        });
    }
    // METODOS PARA VERIFICAR PLANTILLA CON CODIGO INGRESADO DE FORMA MANUAL 
    VerificarPlantilla_Manual(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const documento = (_a = req.file) === null || _a === void 0 ? void 0 : _a.originalname;
                let separador = path_1.default.sep;
                let ruta = (0, accesoCarpetas_2.ObtenerRutaLeerPlantillas)() + separador + documento;
                const workbook = xlsx_1.default.readFile(ruta);
                let verificador = (0, accesoCarpetas_1.ObtenerIndicePlantilla)(workbook, 'EMPLEADOS');
                if (verificador === false) {
                    return res.jsonp({ message: 'no_existe', data: undefined });
                }
                else {
                    const sheet_name_list = workbook.SheetNames;
                    const plantilla = xlsx_1.default.utils.sheet_to_json(workbook.Sheets[sheet_name_list[verificador]]);
                    let data = {
                        fila: '',
                        cedula: '',
                        apellido: '',
                        nombre: '',
                        codigo: '',
                        estado_civil: '',
                        genero: '',
                        correo: '',
                        fec_nacimiento: '',
                        latitud: '',
                        longitud: '',
                        domicilio: '',
                        telefono: '',
                        nacionalidad: '',
                        usuario: '',
                        contrasena: '',
                        rol: '',
                        observacion: '',
                    };
                    const estadoCivilArray = ['Soltero/a', 'Union de Hecho', 'Casado/a', 'Divorciado/a', 'Viudo/a'];
                    const tipogenero = ['masculino', 'femenino'];
                    // VALIDA SI LOS DATOS DE LA COLUMNA CEDULA SON NUMEROS.
                    const regex = /^[0-9]+$/;
                    const valiContra = /\s/;
                    // Expresión regular para validar la latitud y longitud
                    const regexLatitud = /^-?([1-8]?\d(\.\d+)?|90(\.0+)?)$/;
                    const regexLongitud = /^-?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)$/;
                    var listEmpleadosManual = [];
                    var duplicados = [];
                    var duplicados1 = [];
                    var duplicados2 = [];
                    var duplicados3 = [];
                    var mensaje = 'correcto';
                    plantilla.forEach((dato) => __awaiter(this, void 0, void 0, function* () {
                        // DATOS QUE SE LEEN DE LA PLANTILLA INGRESADA
                        var { ITEM, CODIGO, CEDULA, APELLIDO, NOMBRE, USUARIO, CONTRASENA, ROL, ESTADO_CIVIL, GENERO, CORREO, FECHA_NACIMIENTO, LATITUD, LONGITUD, DOMICILIO, TELEFONO, NACIONALIDAD } = dato;
                        // VERIFICAR QUE EL REGISTO NO TENGA DATOS VACIOS
                        if ((ITEM != undefined && ITEM != '') &&
                            (CEDULA != undefined) && (APELLIDO != undefined) &&
                            (NOMBRE != undefined) && (CODIGO != undefined) && (ESTADO_CIVIL != undefined) &&
                            (GENERO != undefined) && (CORREO != undefined) &&
                            (FECHA_NACIMIENTO != undefined) &&
                            (LATITUD != undefined) && (LONGITUD != undefined) &&
                            (DOMICILIO != undefined) && (TELEFONO != undefined) &&
                            (NACIONALIDAD != undefined) && (USUARIO != undefined) &&
                            (CONTRASENA != undefined) && (ROL != undefined)) {
                            data.fila = ITEM;
                            data.cedula = CEDULA;
                            data.apellido = APELLIDO;
                            data.nombre = NOMBRE;
                            data.codigo = CODIGO;
                            data.usuario = USUARIO;
                            data.contrasena = CONTRASENA;
                            data.rol = ROL;
                            data.estado_civil = ESTADO_CIVIL;
                            data.genero = GENERO;
                            data.correo = CORREO;
                            data.fec_nacimiento = FECHA_NACIMIENTO;
                            data.latitud = LATITUD;
                            data.longitud = LONGITUD;
                            data.domicilio = DOMICILIO;
                            data.telefono = TELEFONO;
                            data.nacionalidad = NACIONALIDAD;
                            data.observacion = 'no registrado';
                            if (regex.test(data.cedula)) {
                                if (data.cedula.toString().length > 10 || data.cedula.toString().length < 10) {
                                    data.observacion = 'La cédula ingresada no es válida';
                                }
                                else {
                                    if (regex.test(data.codigo)) {
                                        if (data.codigo.toString().length > 10) {
                                            data.observacion = 'El código debe tener máximo 10 caracteres';
                                        }
                                        else {
                                            //console.log(!valiContra.test(data.contrasena));
                                            if (!valiContra.test(data.contrasena.toString())) {
                                                //console.log('entro ', data.contrasena.toString().length);
                                                if (data.contrasena.toString().length > 10) {
                                                    data.observacion = 'La contraseña debe tener máximo 10 caracteres';
                                                }
                                                else {
                                                    if (estadoCivilArray.includes(data.estado_civil)) {
                                                        if (tipogenero.includes(data.genero.toLowerCase())) {
                                                            // VERIFICAR SI LA VARIABLE TIENE EL FORMATO DE FECHA CORRECTO CON moment
                                                            if ((0, moment_1.default)(FECHA_NACIMIENTO, 'YYYY-MM-DD', true).isValid()) {
                                                                // VALIDA SI LOS DATOS DE LA COLUMNA TELEFONO SON NUMEROS.
                                                                if (TELEFONO != undefined) {
                                                                    if (regex.test(data.telefono)) {
                                                                        if (data.telefono.toString().length > 10 || data.telefono.toString().length < 7) {
                                                                            data.observacion = 'El teléfono ingresado no es válido';
                                                                        }
                                                                        else {
                                                                            if (!regexLatitud.test(data.latitud) && !regexLongitud.test(data.longitud)) {
                                                                                data.observacion = '3';
                                                                            }
                                                                            else if (!regexLatitud.test(data.latitud) || !regexLongitud.test(data.longitud)) {
                                                                                data.observacion = 'Verificar ubicación';
                                                                            }
                                                                            else {
                                                                                if (duplicados.find((p) => p.cedula === dato.cedula || p.usuario === dato.usuario) == undefined) {
                                                                                    data.observacion = 'ok';
                                                                                    duplicados.push(dato);
                                                                                }
                                                                            }
                                                                        }
                                                                    }
                                                                    else {
                                                                        data.observacion = 'El teléfono ingresado no es válido';
                                                                    }
                                                                }
                                                            }
                                                            else {
                                                                data.observacion = 'Formato de fecha incorrecto (YYYY-MM-DD)';
                                                            }
                                                        }
                                                        else {
                                                            data.observacion = 'Género no es válido';
                                                        }
                                                    }
                                                    else {
                                                        data.observacion = 'Estado civil no es válido';
                                                    }
                                                }
                                            }
                                            else {
                                                data.observacion = 'La contraseña ingresada no es válida';
                                            }
                                        }
                                    }
                                    else {
                                        data.observacion = 'Formato de código incorrecto';
                                    }
                                }
                            }
                            else {
                                data.observacion = 'La cédula ingresada no es válida';
                            }
                            listEmpleadosManual.push(data);
                        }
                        else {
                            data.fila = ITEM;
                            data.cedula = CEDULA;
                            data.apellido = APELLIDO;
                            data.nombre = NOMBRE;
                            data.codigo = CODIGO;
                            data.usuario = USUARIO;
                            data.contrasena = CONTRASENA;
                            data.rol = ROL;
                            data.estado_civil = ESTADO_CIVIL;
                            data.genero = GENERO;
                            data.correo = CORREO;
                            data.fec_nacimiento = FECHA_NACIMIENTO;
                            data.latitud = LATITUD;
                            data.longitud = LONGITUD;
                            data.domicilio = DOMICILIO;
                            data.telefono = TELEFONO;
                            data.nacionalidad = NACIONALIDAD;
                            data.observacion = 'no registrado';
                            if (data.fila == '' || data.fila == undefined) {
                                data.fila = 'error';
                                mensaje = 'error';
                            }
                            if (APELLIDO == undefined) {
                                data.apellido = 'No registrado';
                                data.observacion = 'Apellido ' + data.observacion;
                            }
                            if (NOMBRE == undefined) {
                                data.nombre = 'No registrado';
                                data.observacion = 'Nombre ' + data.observacion;
                            }
                            if (CODIGO == undefined) {
                                data.codigo = 'No registrado';
                                data.observacion = 'Código ' + data.observacion;
                            }
                            if (ESTADO_CIVIL == undefined) {
                                data.estado_civil = 'No registrado';
                                data.observacion = 'Estado civil ' + data.observacion;
                            }
                            if (GENERO == undefined) {
                                data.genero = 'No registrado';
                                data.observacion = 'Género ' + data.observacion;
                            }
                            if (CORREO == undefined) {
                                data.correo = 'No registrado';
                                data.observacion = 'Correo ' + data.observacion;
                            }
                            if (FECHA_NACIMIENTO == undefined) {
                                data.fec_nacimiento = 'No registrado';
                                data.observacion = 'Fecha de nacimiento ' + data.observacion;
                            }
                            if (LATITUD == undefined) {
                                data.latitud = 'No registrado';
                            }
                            if (LONGITUD == undefined) {
                                data.longitud = 'No registrado';
                            }
                            if (DOMICILIO == undefined) {
                                data.domicilio = 'No registrado';
                                data.observacion = " ";
                            }
                            if (TELEFONO == undefined) {
                                data.telefono = 'No registrado';
                                data.observacion = " ";
                            }
                            if (NACIONALIDAD == undefined) {
                                data.nacionalidad = 'No registrado';
                                data.observacion = 'Nacionalidad ' + data.observacion;
                            }
                            if (USUARIO == undefined) {
                                data.usuario = 'No registrado';
                                data.observacion = 'Usuario ' + data.observacion;
                            }
                            if (CONTRASENA == undefined) {
                                data.contrasena = 'No registrado';
                                data.observacion = 'Contraseña no registrada';
                            }
                            if (ROL == undefined) {
                                data.rol = 'No registrado';
                                data.observacion = 'Rol ' + data.observacion;
                            }
                            if (CODIGO != undefined) {
                                if (!regex.test(data.codigo)) {
                                    data.observacion = 'Formato de código incorrecto';
                                }
                                else {
                                    if (data.codigo.toString().length > 10) {
                                        data.observacion = 'El código debe tener máximo 10 caracteres';
                                    }
                                    else {
                                        if (data.apellido != 'No registrado' && data.nombre != 'No registrado') {
                                            if (CONTRASENA != undefined) {
                                                //console.log('data: ', data.contrasena);
                                                if (!valiContra.test(data.contrasena.toString())) {
                                                    //console.log(data.contrasena, ' entro ', data.contrasena.toString().length);
                                                    if (data.contrasena.toString().length > 10) {
                                                        data.observacion = 'La contraseña debe tener máximo 10 caracteres';
                                                    }
                                                    else {
                                                        if (data.estado_civil != 'No registrado') {
                                                            if (estadoCivilArray.includes(data.estado_civil)) {
                                                                if (data.genero != 'No registrado') {
                                                                    if (tipogenero.includes(data.genero.toLowerCase())) {
                                                                        // VERIFICAR SI LA VARIABLE TIENE EL FORMATO DE FECHA CORRECTO CON moment
                                                                        if (data.fec_nacimiento != 'No registrado') {
                                                                            if ((0, moment_1.default)(FECHA_NACIMIENTO, 'YYYY-MM-DD', true).isValid()) {
                                                                                // VALIDA SI LOS DATOS DE LA COLUMNA TELEFONO SON NUMEROS.
                                                                                if (TELEFONO != undefined) {
                                                                                    const regex = /^[0-9]+$/;
                                                                                    if (regex.test(data.telefono)) {
                                                                                        if (data.telefono.toString().length > 10 || data.telefono.toString().length < 7) {
                                                                                            data.observacion = 'El teléfono ingresado no es válido';
                                                                                        }
                                                                                        else {
                                                                                            if (!regexLatitud.test(data.latitud) && !regexLongitud.test(data.longitud)) {
                                                                                                data.observacion = '4';
                                                                                            }
                                                                                            else if (!regexLatitud.test(data.latitud) || !regexLongitud.test(data.longitud)) {
                                                                                                data.observacion = 'Verificar ubicación';
                                                                                            }
                                                                                        }
                                                                                    }
                                                                                    else {
                                                                                        data.observacion = 'El teléfono ingresado no es válido';
                                                                                    }
                                                                                }
                                                                            }
                                                                            else {
                                                                                data.observacion = 'Formato de fecha incorrecto (YYYY-MM-DD)';
                                                                            }
                                                                        }
                                                                    }
                                                                    else {
                                                                        data.observacion = 'Género no es válido';
                                                                    }
                                                                }
                                                            }
                                                            else {
                                                                data.observacion = 'Estado civil no es válido';
                                                            }
                                                        }
                                                    }
                                                }
                                                else {
                                                    data.observacion = 'La contraseña ingresada no es válida';
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                            if (CEDULA == undefined) {
                                data.cedula = 'No registrado';
                                data.observacion = 'Cédula no registrada';
                            }
                            else {
                                // VALIDA SI LOS DATOS DE LA COLUMNA CEDULA SON NUMEROS.
                                const rege = /^[0-9]+$/;
                                if (rege.test(data.cedula)) {
                                    if (data.cedula.toString().length != 10) {
                                        data.observacion = 'La cédula ingresada no es válida';
                                    }
                                }
                                else {
                                    data.observacion = 'La cédula ingresada no es válida';
                                }
                            }
                            listEmpleadosManual.push(data);
                        }
                        data = {};
                    }));
                    // VERIFICAR EXISTENCIA DE CARPETA O ARCHIVO
                    fs_1.default.access(ruta, fs_1.default.constants.F_OK, (err) => {
                        if (err) {
                        }
                        else {
                            // ELIMINAR DEL SERVIDOR
                            fs_1.default.unlinkSync(ruta);
                        }
                    });
                    listEmpleadosManual.forEach((valor) => __awaiter(this, void 0, void 0, function* () {
                        var VERIFICAR_CEDULA = yield database_1.default.query(`
              SELECT * FROM eu_empleados WHERE cedula = $1
            `, [valor.cedula]);
                        if (VERIFICAR_CEDULA.rows[0] != undefined && VERIFICAR_CEDULA.rows[0] != '') {
                            valor.observacion = 'Cédula ya existe en el sistema';
                        }
                        else {
                            var VERIFICAR_CODIGO = yield database_1.default.query(`
              SELECT * FROM eu_empleados WHERE codigo = $1
              `, [valor.codigo]);
                            if (VERIFICAR_CODIGO.rows[0] != undefined && VERIFICAR_CODIGO.rows[0] != '') {
                                valor.observacion = 'Código ya existe en el sistema';
                            }
                            else {
                                var VERIFICAR_USUARIO = yield database_1.default.query(`
                SELECT * FROM eu_usuarios WHERE usuario = $1
                `, [valor.usuario]);
                                if (VERIFICAR_USUARIO.rows[0] != undefined && VERIFICAR_USUARIO.rows[0] != '') {
                                    valor.observacion = 'Usuario ya existe en el sistema';
                                }
                                else {
                                    if (valor.rol != 'No registrado') {
                                        var VERIFICAR_ROL = yield database_1.default.query(`
                    SELECT * FROM ero_cat_roles WHERE UPPER(nombre) = $1
                    `, [valor.rol.toUpperCase()]);
                                        if (VERIFICAR_ROL.rows[0] != undefined && VERIFICAR_ROL.rows[0] != '') {
                                            if (valor.nacionalidad != 'No registrado') {
                                                var VERIFICAR_NACIONALIDAD = yield database_1.default.query(`
                        SELECT * FROM e_cat_nacionalidades WHERE UPPER(nombre) = $1
                        `, [valor.nacionalidad.toUpperCase()]);
                                                if (VERIFICAR_NACIONALIDAD.rows[0] != undefined && VERIFICAR_NACIONALIDAD.rows[0] != '') {
                                                    // DISCRIMINACION DE ELEMENTOS IGUALES
                                                    if (duplicados1.find((p) => p.cedula === valor.cedula) == undefined) {
                                                        // DISCRIMINACIÓN DE ELEMENTOS IGUALES
                                                        if (duplicados3.find((c) => c.codigo === valor.codigo) == undefined) {
                                                            // DISCRIMINACION DE ELEMENTOS IGUALES
                                                            if (duplicados2.find((a) => a.usuario === valor.usuario) == undefined) {
                                                                //valor.observacion = 'ok'
                                                                duplicados2.push(valor);
                                                            }
                                                            else {
                                                                valor.observacion = '2';
                                                            }
                                                            duplicados3.push(valor);
                                                        }
                                                        else {
                                                            valor.observacion = '3';
                                                        }
                                                        duplicados1.push(valor);
                                                    }
                                                    else {
                                                        valor.observacion = '1';
                                                    }
                                                }
                                                else {
                                                    valor.observacion = 'Nacionalidad no existe en el sistema';
                                                }
                                            }
                                        }
                                        else {
                                            valor.observacion = 'Rol no existe en el sistema';
                                        }
                                    }
                                }
                            }
                        }
                    }));
                    var tiempo = 2000;
                    if (listEmpleadosManual.length > 500 && listEmpleadosManual.length <= 1000) {
                        tiempo = 4000;
                    }
                    else if (listEmpleadosManual.length > 1000) {
                        tiempo = 7000;
                    }
                    setTimeout(() => {
                        listEmpleadosManual.sort((a, b) => {
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
                        listEmpleadosManual.forEach((item) => {
                            if (item.observacion == '1') {
                                item.observacion = 'Registro duplicado (cédula)';
                            }
                            else if (item.observacion == '2') {
                                item.observacion = 'Registro duplicado (usuario)';
                            }
                            else if (item.observacion == '3') {
                                item.observacion = 'Registro duplicado (código)';
                            }
                            else if (item.observacion == '4') {
                                item.observacion = 'no registrado';
                            }
                            if (item.observacion != undefined) {
                                let arrayObservacion = item.observacion.split(" ");
                                if (arrayObservacion[0] == 'no' || item.observacion == " ") {
                                    item.observacion = 'ok';
                                }
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
                        });
                        if (mensaje == 'error') {
                            listEmpleadosManual = undefined;
                        }
                        return res.jsonp({ message: mensaje, data: listEmpleadosManual });
                    }, tiempo);
                }
            }
            catch (error) {
                return res.status(500).jsonp({ message: error });
            }
        });
    }
    CargarPlantilla_Manual(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { plantilla, user_name, ip } = req.body;
            // Expresión regular para validar la latitud y longitud
            const regexLatitud = /^-?([1-8]?\d(\.\d+)?|90(\.0+)?)$/;
            const regexLongitud = /^-?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)$/;
            var contador = 1;
            let ocurrioError = false;
            let mensajeError = '';
            let codigoError = 0;
            for (const data of plantilla) {
                try {
                    // INICIAR TRANSACCION
                    yield database_1.default.query('BEGIN');
                    // REALIZA UN CAPITAL LETTER A LOS NOMBRES Y APELLIDOS
                    var nombreE;
                    let nombres = data.nombre.split(' ');
                    if (nombres.length > 1) {
                        let name1 = nombres[0].charAt(0).toUpperCase() + nombres[0].slice(1);
                        let name2 = nombres[1].charAt(0).toUpperCase() + nombres[1].slice(1);
                        nombreE = name1 + ' ' + name2;
                    }
                    else {
                        let name1 = nombres[0].charAt(0).toUpperCase() + nombres[0].slice(1);
                        nombreE = name1;
                    }
                    var apellidoE;
                    let apellidos = data.apellido.split(' ');
                    if (apellidos.length > 1) {
                        let lastname1 = apellidos[0].charAt(0).toUpperCase() + apellidos[0].slice(1);
                        let lastname2 = apellidos[1].charAt(0).toUpperCase() + apellidos[1].slice(1);
                        apellidoE = lastname1 + ' ' + lastname2;
                    }
                    else {
                        let lastname1 = apellidos[0].charAt(0).toUpperCase() + apellidos[0].slice(1);
                        apellidoE = lastname1;
                    }
                    // ENCRIPTAR CONTRASEÑA
                    const md5 = new ts_md5_1.Md5();
                    const contrasena = md5.appendStr(data.contrasena).end();
                    // DATOS QUE SE LEEN DE LA PLANTILLA INGRESADA
                    const { cedula, codigo, estado_civil, genero, correo, fec_nacimiento, domicilio, longitud, latitud, telefono, nacionalidad, usuario, rol } = data;
                    //OBTENER ID DEL ESTADO_CIVIL
                    var id_estado_civil = 0;
                    if (estado_civil.toUpperCase() === 'SOLTERA/A') {
                        id_estado_civil = 1;
                    }
                    else if (estado_civil.toUpperCase() === 'UNION DE HECHO') {
                        id_estado_civil = 2;
                    }
                    else if (estado_civil.toUpperCase() === 'CASADO/A') {
                        id_estado_civil = 3;
                    }
                    else if (estado_civil.toUpperCase() === 'DIVORCIADO/A') {
                        id_estado_civil = 4;
                    }
                    else if (estado_civil.toUpperCase() === 'VIUDO/A') {
                        id_estado_civil = 5;
                    }
                    //OBTENER ID DEL GENERO
                    var id_genero = 0;
                    if (genero.toUpperCase() === 'MASCULINO') {
                        id_genero = 1;
                    }
                    else if (genero.toUpperCase() === 'FEMENINO') {
                        id_genero = 2;
                    }
                    var _longitud = null;
                    if (longitud != 'No registrado') {
                        if (regexLongitud.test(data.longitud)) {
                            _longitud = longitud;
                        }
                    }
                    var _latitud = null;
                    if (latitud != 'No registrado') {
                        if (!regexLatitud.test(data.latitud)) {
                            _latitud = latitud;
                        }
                    }
                    // OBTENER ID DEL ESTADO
                    var id_estado = 1;
                    var estado_user = true;
                    var app_habilita = false;
                    // OBTENER ID DE LA NACIONALIDAD
                    const id_nacionalidad = yield database_1.default.query(`
          SELECT * FROM e_cat_nacionalidades WHERE UPPER(nombre) = $1
          `, [nacionalidad.toUpperCase()]);
                    // OBTENER ID DEL ROL
                    const id_rol = yield database_1.default.query(`
          SELECT * FROM ero_cat_roles WHERE UPPER(nombre) = $1
          `, [rol.toUpperCase()]);
                    /*console.log('codigo: ', codigo)
                    console.log('cedula: ', cedula, ' usuario: ', usuario, ' contrasena: ', contrasena);
                    console.log('nombre: ', nombreE, ' usuario: ', apellidoE, ' fecha nacimien: ', fec_nacimiento, ' estado civil: ', id_estado_civil);
                    console.log('genero: ', id_genero, ' estado: ', id_estado, ' nacionalidad: ', id_nacionalidad.rows, ' rol: ', id_rol.rows);
                    console.log('longitud: ', _longitud, ' latitud: ', _latitud)*/
                    // REGISTRO DE NUEVO EMPLEADO
                    const response = yield database_1.default.query(`
          INSERT INTO eu_empleados ( cedula, apellido, nombre, estado_civil, genero, correo,
            fecha_nacimiento, estado, domicilio, telefono, id_nacionalidad, codigo, longitud, latitud) 
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING *
          `, [cedula, apellidoE, nombreE,
                        id_estado_civil, id_genero, correo, fec_nacimiento, id_estado,
                        domicilio, telefono, id_nacionalidad.rows[0]['id'], codigo, _longitud, _latitud]);
                    const [empleado] = response.rows;
                    // AUDITORIA
                    yield auditoriaControlador_1.default.InsertarAuditoria({
                        tabla: 'eu_empleados',
                        usuario: user_name,
                        accion: 'I',
                        datosOriginales: '',
                        datosNuevos: `{cedula: ${cedula}, apellido: ${apellidoE}, nombre: ${nombreE}, estado_civil: ${id_estado_civil}, genero: ${id_genero}, correo: ${correo}, fecha_nacimiento: ${fec_nacimiento}, estado: ${id_estado}, domicilio: ${domicilio}, telefono: ${telefono}, id_nacionalidad: ${id_nacionalidad.rows[0]['id']}, codigo: ${codigo}, longitud: ${_longitud}, latitud: ${_latitud}}`,
                        ip,
                        observacion: null
                    });
                    // OBTENER EL ID DEL EMPELADO
                    const id_empleado = empleado.id;
                    // REGISTRO DE LOS DATOS DE USUARIO
                    yield database_1.default.query(`
          INSERT INTO eu_usuarios (usuario, contrasena, estado, id_rol, id_empleado, app_habilita)
          VALUES ($1, $2, $3, $4, $5, $6)
          `, [usuario, contrasena, estado_user, id_rol.rows[0]['id'], id_empleado,
                        app_habilita]);
                    // AUDITORIA
                    yield auditoriaControlador_1.default.InsertarAuditoria({
                        tabla: 'eu_usuarios',
                        usuario: user_name,
                        accion: 'I',
                        datosOriginales: '',
                        datosNuevos: `{usuario: ${usuario}, contrasena: ${contrasena}, estado: ${estado_user}, id_rol: ${id_rol.rows[0]['id']}, id_empleado: ${id_empleado}, app_habilita: ${app_habilita}}`,
                        ip,
                        observacion: null
                    });
                    if (contador === plantilla.length) {
                        // ACTUALIZACION DEL CODIGO
                        yield database_1.default.query(`
            UPDATE e_codigo SET valor = null WHERE id = 1
            `);
                        // AUDITORIA
                        yield auditoriaControlador_1.default.InsertarAuditoria({
                            tabla: 'e_codigo',
                            usuario: user_name,
                            accion: 'U',
                            datosOriginales: '',
                            datosNuevos: `{valor: null}`,
                            ip,
                            observacion: null
                        });
                        // FINALIZAR TRANSACCION
                        yield database_1.default.query('COMMIT');
                        return res.jsonp({ message: 'correcto' });
                    }
                    contador = contador + 1;
                }
                catch (error) {
                    // REVERTIR TRANSACCION
                    yield database_1.default.query('ROLLBACK');
                    ocurrioError = true;
                    mensajeError = error;
                    codigoError = 500;
                    break;
                }
            }
            if (ocurrioError) {
                res.status(500).jsonp({ message: mensajeError });
            }
            else {
                res.jsonp({ message: 'correcto' });
            }
        });
    }
    /** **************************************************************************************** **
     ** **                      CREAR CARPETAS EMPLEADOS SELECCIONADOS                           **
     ** **************************************************************************************** **/
    CrearCarpetasEmpleado(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { empleados, permisos, vacaciones, horasExtras } = req.body;
            let errorOccurred = false;
            for (const e of empleados) {
                const { codigo, cedula } = e;
                if (permisos) {
                    const carpetaPermisos = yield (0, accesoCarpetas_1.ObtenerRuta)(codigo, cedula, 'permisos');
                    try {
                        yield fs_1.default.promises.access(carpetaPermisos, fs_1.default.constants.F_OK);
                    }
                    catch (error) {
                        try {
                            yield fs_1.default.promises.mkdir(carpetaPermisos, { recursive: true });
                        }
                        catch (error) {
                            errorOccurred = true;
                        }
                    }
                }
                if (vacaciones) {
                    const carpetaVacaciones = yield (0, accesoCarpetas_1.ObtenerRuta)(codigo, cedula, 'vacaciones');
                    try {
                        yield fs_1.default.promises.access(carpetaVacaciones, fs_1.default.constants.F_OK);
                    }
                    catch (error) {
                        try {
                            yield fs_1.default.promises.mkdir(carpetaVacaciones, { recursive: true });
                        }
                        catch (error) {
                            errorOccurred = true;
                        }
                    }
                }
                if (horasExtras) {
                    const carpetaHorasExtras = yield (0, accesoCarpetas_1.ObtenerRuta)(codigo, cedula, 'horasExtras');
                    try {
                        yield fs_1.default.promises.access(carpetaHorasExtras, fs_1.default.constants.F_OK);
                    }
                    catch (error) {
                        try {
                            yield fs_1.default.promises.mkdir(carpetaHorasExtras, { recursive: true });
                        }
                        catch (error) {
                            errorOccurred = true;
                        }
                    }
                }
            }
            if (errorOccurred) {
                res.status(500).jsonp({ message: 'Ups!!! se produjo un error al crear las carpetas.' });
            }
            else {
                res.jsonp({ message: 'Carpetas creadas con éxito.' });
            }
        });
    }
}
exports.EMPLEADO_CONTROLADOR = new EmpleadoControlador();
exports.default = exports.EMPLEADO_CONTROLADOR;
