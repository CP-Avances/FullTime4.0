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
exports.ValidarCedula = ValidarCedula;
exports.validarEmpleadoCompleto = validarEmpleadoCompleto;
exports.validarEmpleadoIncompleto = validarEmpleadoIncompleto;
// SECCION LIBRERIAS
const auditoriaControlador_1 = __importDefault(require("../../reportes/auditoriaControlador"));
const rsa_keys_service_1 = __importDefault(require("../../../controlador/llaves/rsa-keys.service"));
const accesoCarpetas_1 = require("../../../libs/accesoCarpetas");
const accesoCarpetas_2 = require("../../../libs/accesoCarpetas");
const ImagenCodificacion_1 = require("../../../libs/ImagenCodificacion");
const settingsMail_1 = require("../../../libs/settingsMail");
const luxon_1 = require("luxon");
const exceljs_1 = __importDefault(require("exceljs"));
const database_1 = __importDefault(require("../../../database"));
const path_1 = __importDefault(require("path"));
const sharp_1 = __importDefault(require("sharp"));
const fs_1 = __importDefault(require("fs"));
class EmpleadoControlador {
    /** ** ********************************************************************************************* **
     ** ** **                        MANEJO DE CODIGOS DE USUARIOS                                    ** **
     ** ** ********************************************************************************************* **/
    // BUSQUEDA DE CODIGO DEL EMPLEADO   **USADO
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
    // CREAR CODIGO DE EMPLEADO    **USADO
    CrearCodigo(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id, valor, automatico, manual, user_name, ip, ip_local } = req.body;
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
                    ip: ip,
                    ip_local: ip_local,
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
    // BUSQUEDA DEL ULTIMO CODIGO REGISTRADO EN EL SISTEMA   **USADO
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
                return res.status(404).jsonp({ text: 'Error al obtener código máximo.' });
            }
        });
    }
    // METODO PARA ACTUALIZAR INFORMACION DE CODIGOS   **USADO
    ActualizarCodigoTotal(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { valor, automatico, manual, identificacion, id, user_name, ip, ip_local } = req.body;
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
                        ip: ip,
                        ip_local: ip_local,
                        observacion: `Error al actualizar código con id: ${id}`
                    });
                    //FINALIZAR TRANSACCION
                    yield database_1.default.query('COMMIT');
                    return res.status(404).jsonp({ message: 'Error al actualizar código' });
                }
                const datosNuevos = yield database_1.default.query(`
        UPDATE e_codigo SET valor = $1, automatico = $2, manual = $3 , cedula = $4 WHERE id = $5 RETURNING *
        `, [valor, automatico, manual, identificacion, id]);
                // AUDITORIA
                yield auditoriaControlador_1.default.InsertarAuditoria({
                    tabla: 'e_codigo',
                    usuario: user_name,
                    accion: 'U',
                    datosOriginales: JSON.stringify(datosOriginales),
                    datosNuevos: JSON.stringify(datosNuevos.rows[0]),
                    ip: ip,
                    ip_local: ip_local,
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
    // METODO PARA ACTUALIZAR CODIGO DE EMPLEADO   **USADO
    ActualizarCodigo(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { valor, id, user_name, ip, ip_local } = req.body;
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
                        ip: ip,
                        ip_local: ip_local,
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
                    ip: ip,
                    ip_local: ip_local,
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
    /** ********************************************************************************************* **
     ** **                         MANEJO DE DATOS DE EMPLEADO                                     ** **
     ** ********************************************************************************************* **/
    // BUSQUEDA DE UN SOLO EMPLEADO  **USADO
    BuscarEmpleado(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const EMPLEADO = yield database_1.default.query(`
        SELECT e.*, r.nombre AS rol FROM eu_empleados e
        INNER JOIN eu_usuarios u ON e.id = u.id_empleado 
        INNER JOIN ero_cat_roles r ON u.id_rol = r.id
        WHERE e.id = $1
      `, [id]);
            if (EMPLEADO.rowCount != 0) {
                return res.jsonp(EMPLEADO.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'Registro no encontrado.' });
            }
        });
    }
    // INGRESAR REGISTRO DE EMPLEADO EN BASE DE DATOS    **USADO
    InsertarEmpleado(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { identificacion, apellido, nombre, esta_civil, genero, correo, fec_nacimiento, estado, domicilio, telefono, id_nacionalidad, codigo, tipo_identificacion, user_name, ip, ip_local, numero_partida_individual } = req.body;
                const numero_partida_individual_final = numero_partida_individual === '' ? null : numero_partida_individual;
                // INICIAR TRANSACCION
                yield database_1.default.query('BEGIN');
                const response = yield database_1.default.query(`
        INSERT INTO eu_empleados (identificacion, apellido, nombre, estado_civil, genero, correo, 
          fecha_nacimiento, estado, domicilio, telefono, id_nacionalidad, codigo, tipo_identificacion, numero_partida_individual) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING *
        `, [identificacion, apellido, nombre, esta_civil, genero, correo, fec_nacimiento, estado, domicilio,
                    telefono, id_nacionalidad, codigo, tipo_identificacion, numero_partida_individual_final]);
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
                    ip: ip,
                    ip_local: ip_local,
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
    // ACTUALIZAR INFORMACION EL EMPLEADO    **USADO
    EditarEmpleado(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = req.params.id;
                const { identificacion, apellido, nombre, esta_civil, genero, correo, fec_nacimiento, estado, domicilio, telefono, id_nacionalidad, codigo, user_name, ip, ip_local, numero_partida_individual, tipo_identificacion } = req.body;
                const partidaFinal = numero_partida_individual === '' ? null : numero_partida_individual;
                // INICIAR TRANSACCION
                yield database_1.default.query('BEGIN');
                // CONSULTAR DATOSORIGINALES
                const empleado = yield database_1.default.query(`
          SELECT * FROM eu_empleados WHERE id = $1
        `, [id]);
                const [datosOriginales] = empleado.rows;
                const codigoAnterior = datosOriginales.codigo;
                const cedulaAnterior = datosOriginales.identificacion;
                if (!datosOriginales) {
                    yield auditoriaControlador_1.default.InsertarAuditoria({
                        tabla: 'eu_empleados',
                        usuario: user_name,
                        accion: 'U',
                        datosOriginales: '',
                        datosNuevos: '',
                        ip: ip,
                        ip_local: ip_local,
                        observacion: `Error al actualizar empleado con id: ${id}`
                    });
                    // FINALIZAR TRANSACCION
                    yield database_1.default.query('COMMIT');
                    return res.status(404).jsonp({ message: 'Error al actualizar empleado' });
                }
                const datosNuevos = yield database_1.default.query(`
        UPDATE eu_empleados SET identificacion = $2, apellido = $3, nombre = $4, estado_civil = $5, 
          genero = $6, correo = $7, fecha_nacimiento = $8, estado = $9, domicilio = $10, 
          telefono = $11, id_nacionalidad = $12, codigo = $13, numero_partida_individual = $14, tipo_identificacion = $15
        WHERE id = $1 RETURNING *
        `, [id, identificacion, apellido, nombre, esta_civil, genero, correo, fec_nacimiento, estado,
                    domicilio, telefono, id_nacionalidad, codigo, partidaFinal, tipo_identificacion]);
                const fechaNacimientoO = yield (0, settingsMail_1.FormatearFecha2)(datosOriginales.fecha_nacimiento, 'ddd');
                const fechaNacimientoN = yield (0, settingsMail_1.FormatearFecha2)(datosNuevos.rows[0].fecha_nacimiento, 'ddd');
                datosOriginales.fecha_nacimiento = fechaNacimientoO;
                datosNuevos.rows[0].fecha_nacimiento = fechaNacimientoN;
                // AUDITORIA
                yield auditoriaControlador_1.default.InsertarAuditoria({
                    tabla: 'eu_empleados',
                    usuario: user_name,
                    accion: 'U',
                    datosOriginales: JSON.stringify(datosOriginales),
                    datosNuevos: JSON.stringify(datosNuevos.rows[0]),
                    ip: ip,
                    ip_local: ip_local,
                    observacion: null
                });
                // VARIABLES PARA VERIFICAR RENOBRAMIENTO DE CARPETAS
                // 0 => CORRECTO 1 => ERROR
                let verificar_permisos = 0;
                let verificar_imagen = 0;
                let verificar_vacunas = 0;
                let verificar_contrato = 0;
                if (codigoAnterior !== codigo || cedulaAnterior !== identificacion) {
                    // RUTA DE LA CARPETA PERMISOS DEL USUARIO
                    const carpetaPermisosAnterior = yield (0, accesoCarpetas_1.ObtenerRuta)(codigoAnterior, cedulaAnterior, 'permisos');
                    const carpetaPermisos = yield (0, accesoCarpetas_1.ObtenerRutaPermisos)(codigo);
                    // VERIFICACION DE EXISTENCIA CARPETA PERMISOS DE USUARIO
                    fs_1.default.access(carpetaPermisosAnterior, fs_1.default.constants.F_OK, (err) => {
                        if (err) {
                            // SI NO EXISTE LA CARPETA CON EL CODIGO ANTERIOR, NO HACER NADA
                        }
                        else {
                            // SI EXISTE LA CARPETA CON EL CODIGO ANTERIOR, RENOMBRARLA CON LA RUTA DEL CODIGO NUEVO
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
                            // SI NO EXISTE LA CARPETA CON EL CODIGO ANTERIOR, NO HACER NADA
                        }
                        else {
                            // SI EXISTE LA CARPETA CON EL CODIGO ANTERIOR, RENOMBRARLA CON LA RUTA DEL CODIGO NUEVO
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
                            // SI NO EXISTE LA CARPETA CON EL CODIGO ANTERIOR, NO HACER NADA
                        }
                        else {
                            // SI EXISTE LA CARPETA CON EL CODIGO ANTERIOR, RENOMBRARLA CON LA RUTA DEL CODIGO NUEVO
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
                            // SI NO EXISTE LA CARPETA CON EL CODIGO ANTERIOR, NO HACER NADA
                        }
                        else {
                            // SI EXISTE LA CARPETA CON EL CODIGO ANTERIOR, RENOMBRARLA CON LA RUTA DEL CODIGO NUEVO
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
                    return res.status(500).jsonp({ message: `Ups! no fue posible modificar el directorio de ${mensajesError.join(', ')} del usuario.` });
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
    // LISTAR EMPLEADOS ACTIVOS EN EL SISTEMA    **USADO
    Listar(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const empleado = yield database_1.default.query(`
        SELECT * FROM eu_empleados WHERE estado = 1 ORDER BY id
      `);
            return res.jsonp(empleado.rows);
        });
    }
    // METODO QUE LISTA EMPLEADOS INHABILITADOS   **USADO
    ListarEmpleadosDesactivados(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const empleado = yield database_1.default.query(`
      SELECT * FROM eu_empleados WHERE estado = 2 ORDER BY id
      `);
            res.jsonp(empleado.rows);
        });
    }
    // METODO PARA INHABILITAR USUARIOS EN EL SISTEMA   **USADO
    DesactivarMultiplesEmpleados(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { arrayIdsEmpleados, user_name, ip, ip_local } = req.body;
            if (arrayIdsEmpleados.length > 0) {
                for (const obj of arrayIdsEmpleados) {
                    try {
                        // INICIAR TRANSACCION
                        yield database_1.default.query('BEGIN');
                        // CONSULTAR DATOSORIGINALES
                        const empleado = yield database_1.default.query(`SELECT * FROM eu_empleados WHERE id = $1`, [obj]);
                        const [datosOriginales] = empleado.rows;
                        const usuario = yield database_1.default.query(`SELECT * FROM eu_usuarios WHERE id_empleado = $1`, [obj]);
                        const [datosOriginalesUsuario] = usuario.rows;
                        if (!datosOriginales || !datosOriginalesUsuario) {
                            yield auditoriaControlador_1.default.InsertarAuditoria({
                                tabla: 'eu_empleados',
                                usuario: user_name,
                                accion: 'U',
                                datosOriginales: '',
                                datosNuevos: '',
                                ip: ip,
                                ip_local: ip_local,
                                observacion: `Error al inhabilitar empleado con id: ${obj}`
                            });
                            yield auditoriaControlador_1.default.InsertarAuditoria({
                                tabla: 'eu_usuarios',
                                usuario: user_name,
                                accion: 'U',
                                datosOriginales: '',
                                datosNuevos: '',
                                ip: ip,
                                ip_local: ip_local,
                                observacion: `Error al inhabilitar usuario con id_empleado: ${obj}`
                            });
                            // FINALIZAR TRANSACCION
                            yield database_1.default.query('COMMIT');
                            throw new Error('Error al inhabilitar empleado con id: ' + obj);
                        }
                        // 2 => DESACTIVADO O INACTIVO
                        yield database_1.default.query(`UPDATE eu_empleados SET estado = 2 WHERE id = $1`, [obj]);
                        const fechaNacimientoO = yield (0, settingsMail_1.FormatearFecha2)(datosOriginales.fecha_nacimiento, 'ddd');
                        // AUDITORIA
                        yield auditoriaControlador_1.default.InsertarAuditoria({
                            tabla: 'eu_empleados',
                            usuario: user_name,
                            accion: 'U',
                            datosOriginales: `{id: ${datosOriginales.id}, identificacion: ${datosOriginales.identificacion}, codigo: ${datosOriginales.codigo}, apellido: ${datosOriginales.apellido}, nombre: ${datosOriginales.nombre}, fecha_nacimiento: ${fechaNacimientoO}, estado_civil: ${datosOriginales.estado_civil}, genero: ${datosOriginales.genero}, correo: ${datosOriginales.correo}, mail_alternativo: ${datosOriginales.mail_alternativo}, estado: ${datosOriginales.estado}, domicilio: ${datosOriginales.domicilio}, telefono: ${datosOriginales.telefono}, id_nacionalidad: ${datosOriginales.id_nacionalidad}, imagen: ${datosOriginales.imagen}, longitud: ${datosOriginales.longitud}, latitud: ${datosOriginales.latitud}, web_access: ${datosOriginales.web_access}}`,
                            datosNuevos: `{id: ${datosOriginales.id}, identificacion: ${datosOriginales.identificacion}, codigo: ${datosOriginales.codigo}, apellido: ${datosOriginales.apellido}, nombre: ${datosOriginales.nombre}, fecha_nacimiento: ${fechaNacimientoO}, estado_civil: ${datosOriginales.estado_civil}, genero: ${datosOriginales.genero}, correo: ${datosOriginales.correo}, mail_alternativo: ${datosOriginales.mail_alternativo}, estado: 2, domicilio: ${datosOriginales.domicilio}, telefono: ${datosOriginales.telefono}, id_nacionalidad: ${datosOriginales.id_nacionalidad}, imagen: ${datosOriginales.imagen}, longitud: ${datosOriginales.longitud}, latitud: ${datosOriginales.latitud}, web_access: ${datosOriginales.web_access}}`,
                            ip: ip,
                            ip_local: ip_local,
                            observacion: null
                        });
                        // FALSE => YA NO TIENE ACCESO
                        yield database_1.default.query(`UPDATE eu_usuarios SET estado = false, app_habilita = false WHERE id_empleado = $1`, [obj]);
                        // AUDITORIA
                        yield auditoriaControlador_1.default.InsertarAuditoria({
                            tabla: 'eu_usuarios',
                            usuario: user_name,
                            accion: 'U',
                            datosOriginales: JSON.stringify(datosOriginalesUsuario),
                            datosNuevos: `{estado: false, app_habilita: false}`,
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
                        console.log('error deshabilitar', error);
                    }
                }
                return res.jsonp({ message: 'Usuarios inhabilitados exitosamente.' });
            }
            return res.jsonp({ message: 'Upss!!! ocurrio un error.' });
        });
    }
    // METODO PARA HABILITAR EMPLEADOS    *USADO
    ActivarMultiplesEmpleados(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { arrayIdsEmpleados, user_name, ip, ip_local } = req.body;
            if (arrayIdsEmpleados.length > 0) {
                for (const obj of arrayIdsEmpleados) {
                    try {
                        // INICIAR TRANSACCION
                        yield database_1.default.query('BEGIN');
                        // CONSULTAR DATOS ORIGINALES
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
                                ip: ip,
                                ip_local: ip_local,
                                observacion: `Error al activar empleado con id: ${obj}`
                            });
                            yield auditoriaControlador_1.default.InsertarAuditoria({
                                tabla: 'eu_usuarios',
                                usuario: user_name,
                                accion: 'U',
                                datosOriginales: '',
                                datosNuevos: '',
                                ip: ip,
                                ip_local: ip_local,
                                observacion: `Error al activar usuario con id_empleado: ${obj}`
                            });
                            // FINALIZAR TRANSACCION
                            yield database_1.default.query('COMMIT');
                            throw new Error('Error al activar empleado con id: ' + obj);
                        }
                        // 1 => ACTIVADO
                        yield database_1.default.query(`
              UPDATE eu_empleados SET estado = 1 WHERE id = $1
            `, [obj]);
                        const fechaNacimientoO = yield (0, settingsMail_1.FormatearFecha2)(datosOriginales.fecha_nacimiento, 'ddd');
                        // AUDITORIA
                        yield auditoriaControlador_1.default.InsertarAuditoria({
                            tabla: 'eu_empleados',
                            usuario: user_name,
                            accion: 'U',
                            datosOriginales: `{id: ${datosOriginales.id}, identificacion: ${datosOriginales.identificacion}, codigo: ${datosOriginales.codigo}, apellido: ${datosOriginales.apellido}, nombre: ${datosOriginales.nombre}, fecha_nacimiento: ${fechaNacimientoO}, estado_civil: ${datosOriginales.estado_civil}, genero: ${datosOriginales.genero}, correo: ${datosOriginales.correo}, mail_alternativo: ${datosOriginales.mail_alternativo}, estado: ${datosOriginales.estado}, domicilio: ${datosOriginales.domicilio}, telefono: ${datosOriginales.telefono}, id_nacionalidad: ${datosOriginales.id_nacionalidad}, imagen: ${datosOriginales.imagen}, longitud: ${datosOriginales.longitud}, latitud: ${datosOriginales.latitud}, web_access: ${datosOriginales.web_access}}`,
                            datosNuevos: `{id: ${datosOriginales.id}, identificacion: ${datosOriginales.identificacion}, codigo: ${datosOriginales.codigo}, apellido: ${datosOriginales.apellido}, nombre: ${datosOriginales.nombre}, fecha_nacimiento: ${fechaNacimientoO}, estado_civil: ${datosOriginales.estado_civil}, genero: ${datosOriginales.genero}, correo: ${datosOriginales.correo}, mail_alternativo: ${datosOriginales.mail_alternativo}, estado: 1, domicilio: ${datosOriginales.domicilio}, telefono: ${datosOriginales.telefono}, id_nacionalidad: ${datosOriginales.id_nacionalidad}, imagen: ${datosOriginales.imagen}, longitud: ${datosOriginales.longitud}, latitud: ${datosOriginales.latitud}, web_access: ${datosOriginales.web_access}}`,
                            ip: ip,
                            ip_local: ip_local,
                            observacion: null
                        });
                        // TRUE => TIENE ACCESO
                        yield database_1.default.query(`
              UPDATE eu_usuarios SET estado = true, app_habilita = true WHERE id_empleado = $1
            `, [obj]);
                        // AUDITORIA
                        yield auditoriaControlador_1.default.InsertarAuditoria({
                            tabla: 'eu_usuarios',
                            usuario: user_name,
                            accion: 'U',
                            datosOriginales: JSON.stringify(datosOriginalesUsuario),
                            datosNuevos: `{estado: true, app_habilita: true}`,
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
                        console.log('error activar', error);
                    }
                }
                return res.jsonp({ message: 'Usuarios habilitados exitosamente.' });
            }
            return res.jsonp({ message: 'Upss!!! ocurrio un error.' });
        });
    }
    // CARGAR IMAGEN DE EMPLEADO   **USADO
    CrearImagenEmpleado(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            sharp_1.default.cache(false);
            try {
                // FECHA DEL SISTEMA
                const fecha = luxon_1.DateTime.now();
                const anio = fecha.toFormat('yyyy');
                const mes = fecha.toFormat('MM');
                const dia = fecha.toFormat('dd');
                const id = req.params.id_empleado;
                const separador = path_1.default.sep;
                const { user_name, ip, ip_local } = req.body;
                const unEmpleado = yield database_1.default.query(`
          SELECT * FROM eu_empleados WHERE id = $1
        `, [id]);
                let ruta_temporal = (0, accesoCarpetas_2.ObtenerRutaLeerPlantillas)() + separador + ((_a = req.file) === null || _a === void 0 ? void 0 : _a.originalname);
                console.log('ruta_temporal_', ruta_temporal);
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
                        fs_1.default.access(ruta_temporal, fs_1.default.constants.F_OK, (err) => {
                            if (!err) {
                                (0, sharp_1.default)(ruta_temporal)
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
                                ip: ip,
                                ip_local: ip_local,
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
                            datosOriginales: `{id: ${datosOriginales.id}, identificacion: ${datosOriginales.identificacion}, codigo: ${datosOriginales.codigo}, apellido: ${datosOriginales.apellido}, nombre: ${datosOriginales.nombre}, fecha_nacimiento: ${fechaNacimientoO}, estado_civil: ${datosOriginales.estado_civil}, genero: ${datosOriginales.genero}, correo: ${datosOriginales.correo}, mail_alternativo: ${datosOriginales.mail_alternativo}, estado: ${datosOriginales.estado}, domicilio: ${datosOriginales.domicilio}, telefono: ${datosOriginales.telefono}, id_nacionalidad: ${datosOriginales.id_nacionalidad}, imagen: ${datosOriginales.imagen}, longitud: ${datosOriginales.longitud}, latitud: ${datosOriginales.latitud}, web_access: ${datosOriginales.web_access}}`,
                            datosNuevos: `{id: ${datosOriginales.id}, identificacion: ${datosOriginales.identificacion}, codigo: ${datosOriginales.codigo}, apellido: ${datosOriginales.apellido}, nombre: ${datosOriginales.nombre}, fecha_nacimiento: ${fechaNacimientoO}, estado_civil: ${datosOriginales.estado_civil}, genero: ${datosOriginales.genero}, correo: ${datosOriginales.correo}, mail_alternativo: ${datosOriginales.mail_alternativo}, estado: ${datosOriginales.estado}, domicilio: ${datosOriginales.domicilio}, telefono: ${datosOriginales.telefono}, id_nacionalidad: ${datosOriginales.id_nacionalidad}, imagen: ${imagen}, longitud: ${datosOriginales.longitud}, latitud: ${datosOriginales.latitud}, web_access: ${datosOriginales.web_access}}`,
                            ip: ip,
                            ip_local: ip_local,
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
    // METODO PARA CONVERTIR IMAGEN EN BASE64 **USADO
    CodificarImagenBase64(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const imagen = req.params.imagen;
            const id = req.params.id;
            let separador = path_1.default.sep;
            let ruta = (yield (0, accesoCarpetas_1.ObtenerRutaUsuario)(id)) + separador + imagen;
            let verificador = 0;
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
    // METODO PARA ELIMINAR REGISTROS    **USADO
    EliminarEmpleado(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { empleados, user_name, ip, ip_local } = req.body;
            let empleadosRegistrados = false;
            let errorEliminar = false;
            for (const e of empleados) {
                try {
                    // INICIAR TRANSACCION
                    yield database_1.default.query('BEGIN');
                    // CONSULTAR DATOS ORIGINALES
                    const usuario = yield database_1.default.query(`SELECT * FROM eu_usuarios WHERE id_empleado = $1`, [e.id]);
                    const [datosOriginalesUsuarios] = usuario.rows;
                    const empleado = yield database_1.default.query(`SELECT * FROM eu_empleados WHERE id = $1`, [e.id]);
                    const [datosOriginalesEmpleado] = empleado.rows;
                    if (!datosOriginalesUsuarios || !datosOriginalesEmpleado) {
                        yield auditoriaControlador_1.default.InsertarAuditoria({
                            tabla: 'eu_usuarios',
                            usuario: user_name,
                            accion: 'D',
                            datosOriginales: '',
                            datosNuevos: '',
                            ip: ip,
                            ip_local: ip_local,
                            observacion: `Error al eliminar usuario con id: ${e.id}. Registro no encontrado.`
                        });
                        yield auditoriaControlador_1.default.InsertarAuditoria({
                            tabla: 'eu_empleados',
                            usuario: user_name,
                            accion: 'D',
                            datosOriginales: '',
                            datosNuevos: '',
                            ip: ip,
                            ip_local: ip_local,
                            observacion: `Error al eliminar empleado con id: ${e.id}. Registro no encontrado.`
                        });
                        errorEliminar = true;
                        yield database_1.default.query('COMMIT');
                        continue;
                    }
                    const datosActuales = yield database_1.default.query(`SELECT * FROM informacion_general WHERE id = $1`, [e.id]);
                    const [datosActualesEmpleado] = datosActuales.rows;
                    const contratos = yield database_1.default.query(`SELECT * FROM eu_empleado_contratos WHERE id_empleado = $1`, [e.id]);
                    const [datosContratos] = contratos.rows;
                    const titulos = yield database_1.default.query(`SELECT * FROM eu_empleado_titulos WHERE id_empleado = $1`, [e.id]);
                    const [datosTitulos] = titulos.rows;
                    const discapacidad = yield database_1.default.query(`SELECT * FROM eu_empleado_discapacidad WHERE id_empleado = $1`, [e.id]);
                    const [datosDiscapacidad] = discapacidad.rows;
                    const vacunas = yield database_1.default.query(`SELECT * FROM eu_empleado_vacunas WHERE id_empleado = $1`, [e.id]);
                    const [datosVacunas] = vacunas.rows;
                    if (datosActualesEmpleado || datosContratos || datosTitulos || datosDiscapacidad || datosVacunas) {
                        empleadosRegistrados = true;
                        continue;
                    }
                    // ELIMINAR USUARIO
                    yield database_1.default.query(`DELETE FROM eu_usuarios WHERE id_empleado = $1`, [e.id]);
                    // AUDITORIA
                    yield auditoriaControlador_1.default.InsertarAuditoria({
                        tabla: 'eu_usuarios',
                        usuario: user_name,
                        accion: 'D',
                        datosOriginales: JSON.stringify(datosOriginalesUsuarios),
                        datosNuevos: '',
                        ip: ip,
                        ip_local: ip_local,
                        observacion: null
                    });
                    // ELIMINAR EMPLEADO
                    yield database_1.default.query(`DELETE FROM eu_empleados WHERE id = $1`, [e.id]);
                    const fechaNacimientoO = yield (0, settingsMail_1.FormatearFecha2)(datosOriginalesEmpleado.fecha_nacimiento, 'ddd');
                    datosOriginalesEmpleado.fecha_nacimiento = fechaNacimientoO;
                    // AUDITORIA
                    yield auditoriaControlador_1.default.InsertarAuditoria({
                        tabla: 'eu_empleados',
                        usuario: user_name,
                        accion: 'D',
                        datosOriginales: JSON.stringify(datosOriginalesEmpleado),
                        datosNuevos: '',
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
    // BUSQUEDA DE DATOS DE EMPLEADO INGRESANDO EL NOMBRE
    BuscarEmpleadoNombre(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { informacion } = req.body;
            const EMPLEADO = yield database_1.default.query(`
        SELECT * FROM informacion_general WHERE
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
    // METODO PARA CREAR CARPETAS DE ALMACENAMIENTO    **USADO
    CrearCarpetasEmpleado(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { empleados, permisos, vacaciones, horasExtras } = req.body;
            let errorOccurred = false;
            for (const e of empleados) {
                const { codigo, identificacion } = e;
                if (permisos) {
                    const carpetaPermisos = yield (0, accesoCarpetas_1.ObtenerRuta)(codigo, identificacion, 'permisos');
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
                    const carpetaVacaciones = yield (0, accesoCarpetas_1.ObtenerRuta)(codigo, identificacion, 'vacaciones');
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
                    const carpetaHorasExtras = yield (0, accesoCarpetas_1.ObtenerRuta)(codigo, identificacion, 'horasExtras');
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
                res.status(500).jsonp({ message: 'Ups! se produjo un error al crear las carpetas.' });
            }
            else {
                res.jsonp({ message: 'Carpetas creadas con éxito.' });
            }
        });
    }
    // METODO PARA CONSULTAR INFORMACION DE CONTRATOS   **USADO
    getContratosCargos(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id_empleado } = req.body;
            try {
                var listaCargos = [];
                var listaContratos = [];
                const contratos = yield database_1.default.query(`
        SELECT 
	        emC.id, emC.id_empleado as id_empleado, emC.id_modalidad_laboral, 
          moda.descripcion, emC.fecha_ingreso, emC.fecha_salida, emC.controlar_vacacion, 
          emC.controlar_asistencia,  reg.descripcion as regimen
        FROM eu_empleado_contratos AS emC, e_cat_modalidad_trabajo AS moda, ere_cat_regimenes AS reg
        WHERE 
	        emc.id_empleado = $1 AND
	        moda.id = emC.id_modalidad_laboral AND
			    reg.id = emc.id_regimen
        `, [id_empleado]);
                listaContratos = contratos.rows;
                listaContratos.forEach((item) => __awaiter(this, void 0, void 0, function* () {
                    const cargos = yield database_1.default.query(`
          SELECT 
            emC.id, emC.id_contrato as contrato, emC.id_departamento, ed.nombre, su.nombre as sucursal, 
            emC.id_tipo_cargo, carg.cargo, emC.fecha_inicio, emC.fecha_final, emC.sueldo, emC.hora_trabaja,
            emC.jefe, emC.estado
          FROM 
            eu_empleado_cargos AS emC, ed_departamentos AS ed, 
            e_sucursales AS su, e_cat_tipo_cargo AS carg
          WHERE 
            emc.id_contrato = $1 AND
            ed.id = emC.id_departamento AND
            su.id = ed.id_sucursal AND
            carg.id = emC.id_tipo_cargo
          `, [item.id]);
                    const Cargos = cargos.rows;
                    Cargos.forEach((item) => {
                        listaCargos.push(item);
                    });
                }));
                setTimeout(() => {
                    return res.status(200).jsonp({ listacontratos: listaContratos, listacargos: listaCargos });
                }, 2000);
            }
            catch (error) {
                console.log(error);
                return res.status(500).jsonp({ message: 'Contactese con el Administrador del sistema (593) 2 – 252-7663 o https://casapazmino.com.ec' });
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
            fs_1.default.access(ruta, fs_1.default.constants.F_OK, (err) => {
                if (err) {
                }
                else {
                    res.sendFile(path_1.default.resolve(ruta));
                }
            });
        });
    }
    /** **************************************************************************************** **
     ** **                      CARGAR INFORMACION MEDIANTE PLANTILLA                            **
     ** **************************************************************************************** **/
    // METODO PARA VERIFICAR PLANTILLA CODIGO AUTOMATICO    **USADO
    VerificarPlantilla_Automatica(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s;
            try {
                const documento = (_a = req.file) === null || _a === void 0 ? void 0 : _a.originalname;
                let separador = path_1.default.sep;
                let ruta = (0, accesoCarpetas_2.ObtenerRutaLeerPlantillas)() + separador + documento;
                const workbook = new exceljs_1.default.Workbook();
                yield workbook.xlsx.readFile(ruta);
                let verificador = (0, accesoCarpetas_1.ObtenerIndicePlantilla)(workbook, 'EMPLEADOS');
                const modoCodigo = req.body.modoCodigo || 'automatico';
                if (verificador === false) {
                    return res.jsonp({ message: 'no_existe', data: undefined });
                }
                else {
                    const sheet_name_list = workbook.worksheets.map(sheet => sheet.name);
                    const plantilla = workbook.getWorksheet(sheet_name_list[verificador]);
                    let data = {
                        fila: '',
                        identificacion: '',
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
                        tipo_identificacion: '',
                        numero_partida_individual: '',
                    };
                    //OBTIENE DATOS DE LA BASE PARA VALIDACIONES
                    var ARREGLO_ESTADO_CIVIL = yield database_1.default.query(`SELECT * FROM e_estado_civil`);
                    let lista_estados = ARREGLO_ESTADO_CIVIL.rows;
                    const estadoCivilArray = lista_estados.map(item => item.estado_civil.toUpperCase());
                    var ARREGLO_GENERO = yield database_1.default.query(`SELECT * FROM e_genero`);
                    let lista_generos = ARREGLO_GENERO.rows;
                    const tipogenero = lista_generos.map(item => item.genero.toUpperCase());
                    // VALIDA SI LOS DATOS DE LA COLUMNA CEDULA SON NUMEROS.
                    const regex = /^[0-9]+$/;
                    // VALIDA EL FORMATO DEL CORREO: XXXXXXX@XXXXXXXXX.XXX
                    const regexCorreo = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
                    const valiContra = /\s/;
                    // Expresión regular para validar la latitud y longitud
                    const regexLatitud = /^-?([1-8]?\d(\.\d+)?|90(\.0+)?)$/;
                    const regexLongitud = /^-?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)$/;
                    var listEmpleados = [];
                    var duplicados1 = [];
                    var duplicados2 = [];
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
                        if (!headers['ITEM'] || !headers['IDENTIFICACION'] || !headers['APELLIDO'] ||
                            !headers['NOMBRE'] || !headers['USUARIO'] || !headers['CONTRASENA'] ||
                            !headers['ROL'] || !headers['ESTADO_CIVIL'] || !headers['GENERO'] ||
                            !headers['CORREO'] || !headers['FECHA_NACIMIENTO'] || !headers['LATITUD'] ||
                            !headers['DOMICILIO'] || !headers['TELEFONO'] ||
                            !headers['LONGITUD'] || !headers['NACIONALIDAD'] || !headers['TIPO_IDENTIFICACION'] || !headers['NUMERO_PARTIDA_INDIVIDUAL']) {
                            return res.jsonp({ message: 'Cabeceras faltantes', data: undefined });
                        }
                        for (let rowNumber = 2; rowNumber <= plantilla.rowCount; rowNumber++) {
                            const row = plantilla.getRow(rowNumber);
                            if (!row || row.hasValues === false)
                                continue;
                            // SALTAR LA FILA DE LAS CABECERAS
                            if (rowNumber === 1)
                                return;
                            // LEER LOS DATOS SEGUN LAS COLUMNAS ENCONTRADAS
                            const ITEM = row.getCell(headers['ITEM']).value;
                            const IDENTIFICACION = (_b = row.getCell(headers['IDENTIFICACION']).value) === null || _b === void 0 ? void 0 : _b.toString();
                            const APELLIDO = (_c = row.getCell(headers['APELLIDO']).value) === null || _c === void 0 ? void 0 : _c.toString();
                            const NOMBRE = (_d = row.getCell(headers['NOMBRE']).value) === null || _d === void 0 ? void 0 : _d.toString();
                            const USUARIO = (_e = row.getCell(headers['USUARIO']).value) === null || _e === void 0 ? void 0 : _e.toString();
                            const CONTRASENA = (_f = row.getCell(headers['CONTRASENA']).value) === null || _f === void 0 ? void 0 : _f.toString();
                            const ROL = (_g = row.getCell(headers['ROL']).value) === null || _g === void 0 ? void 0 : _g.toString();
                            const ESTADO_CIVIL = (_h = row.getCell(headers['ESTADO_CIVIL']).value) === null || _h === void 0 ? void 0 : _h.toString();
                            const GENERO = (_j = row.getCell(headers['GENERO']).value) === null || _j === void 0 ? void 0 : _j.toString();
                            const FECHA_NACIMIENTO = (_k = row.getCell(headers['FECHA_NACIMIENTO']).value) === null || _k === void 0 ? void 0 : _k.toString();
                            const LATITUD = (_l = row.getCell(headers['LATITUD']).value) === null || _l === void 0 ? void 0 : _l.toString();
                            const LONGITUD = (_m = row.getCell(headers['LONGITUD']).value) === null || _m === void 0 ? void 0 : _m.toString();
                            const DOMICILIO = (_o = row.getCell(headers['DOMICILIO']).value) === null || _o === void 0 ? void 0 : _o.toString();
                            const TELEFONO = (_p = row.getCell(headers['TELEFONO']).value) === null || _p === void 0 ? void 0 : _p.toString();
                            const NACIONALIDAD = (_q = row.getCell(headers['NACIONALIDAD']).value) === null || _q === void 0 ? void 0 : _q.toString();
                            const TIPO_IDENTIFICACION = (_r = row.getCell(headers['TIPO_IDENTIFICACION']).value) === null || _r === void 0 ? void 0 : _r.toString();
                            const NUMERO_PARTIDA_INDIVIDUAL = (_s = row.getCell(headers['NUMERO_PARTIDA_INDIVIDUAL']).value) === null || _s === void 0 ? void 0 : _s.toString();
                            let CORREO = row.getCell(headers['CORREO']).value;
                            if (typeof CORREO === 'object' && CORREO !== null) {
                                if ('text' in CORREO) {
                                    CORREO = CORREO.text;
                                }
                                else {
                                    CORREO = '';
                                }
                            }
                            CORREO = CORREO === null || CORREO === void 0 ? void 0 : CORREO.toString();
                            // VERIFICAR QUE EL REGISTO NO TENGA DATOS VACIOS
                            if (ITEM != undefined && ITEM != '' &&
                                IDENTIFICACION != undefined && APELLIDO != undefined &&
                                NOMBRE != undefined && ESTADO_CIVIL != undefined &&
                                GENERO != undefined && CORREO != undefined &&
                                FECHA_NACIMIENTO != undefined && LATITUD != undefined &&
                                LONGITUD != undefined && DOMICILIO != undefined &&
                                TELEFONO != undefined && NACIONALIDAD != undefined &&
                                USUARIO != undefined && CONTRASENA != undefined &&
                                ROL != undefined && TIPO_IDENTIFICACION != undefined &&
                                NUMERO_PARTIDA_INDIVIDUAL != undefined) {
                                data.fila = ITEM;
                                data.identificacion = IDENTIFICACION;
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
                                data.tipo_identificacion = TIPO_IDENTIFICACION === null || TIPO_IDENTIFICACION === void 0 ? void 0 : TIPO_IDENTIFICACION.trim();
                                data.numero_partida_individual = NUMERO_PARTIDA_INDIVIDUAL.trim();
                                data.observacion = 'no registrado';
                                //METODO QUE VALIDA LOS DATOS CUANDO LA FILA TIENE LOS DATOS COMPLETOS
                                yield validarEmpleadoCompleto(data, regex, regexCorreo, valiContra, regexLatitud, regexLongitud, estadoCivilArray, tipogenero, TIPO_IDENTIFICACION !== null && TIPO_IDENTIFICACION !== void 0 ? TIPO_IDENTIFICACION : 'No registrado', database_1.default, TELEFONO !== null && TELEFONO !== void 0 ? TELEFONO : '', LONGITUD !== null && LONGITUD !== void 0 ? LONGITUD : '', LATITUD !== null && LATITUD !== void 0 ? LATITUD : '', ValidarCedula, modoCodigo);
                                listEmpleados.push(data);
                            }
                            else {
                                //METODO QUE VALIDA LOS DATOS CUANDO LA FILA TIENE LOS DATOS INCOMPLETOS
                                yield validarEmpleadoIncompleto(data, ITEM, IDENTIFICACION, APELLIDO, NOMBRE, ESTADO_CIVIL, GENERO, CORREO, FECHA_NACIMIENTO, LATITUD, LONGITUD, DOMICILIO, TELEFONO, NACIONALIDAD, USUARIO, CONTRASENA, ROL, TIPO_IDENTIFICACION, NUMERO_PARTIDA_INDIVIDUAL, regex, regexCorreo, valiContra, regexLatitud, regexLongitud, estadoCivilArray, tipogenero, database_1.default, ValidarCedula, modoCodigo);
                                listEmpleados.push(data);
                            }
                            data = {};
                        }
                        ;
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
                    ///VALIDACION DE COLUMNAS EN BASE SI EXISTEN O NO (VALIDACION CON COLUMNAS FALTANTES)
                    listEmpleados.forEach((valor) => __awaiter(this, void 0, void 0, function* () {
                        var VERIFICAR_CEDULA = yield database_1.default.query(`SELECT * FROM eu_empleados WHERE identificacion = $1`, [valor.identificacion]);
                        if (VERIFICAR_CEDULA.rows[0] != undefined && VERIFICAR_CEDULA.rows[0] != '') {
                            valor.observacion = 'Identificación ya existe en el sistema';
                        }
                        else {
                            var VERIFICAR_USUARIO = yield database_1.default.query(`SELECT * FROM eu_usuarios WHERE usuario = $1`, [valor.usuario]);
                            if (VERIFICAR_USUARIO.rows[0] != undefined && VERIFICAR_USUARIO.rows[0] != '') {
                                valor.observacion = 'Usuario ya existe en el sistema';
                            }
                            else {
                                if (valor.rol != 'No registrado') {
                                    var VERIFICAR_ROL = yield database_1.default.query(`SELECT * FROM ero_cat_roles WHERE UPPER(nombre) = $1`, [valor.rol.toUpperCase()]);
                                    if (VERIFICAR_ROL.rows[0] != undefined && VERIFICAR_ROL.rows[0] != '') {
                                        if (valor.nacionalidad != 'No registrado') {
                                            var VERIFICAR_NACIONALIDAD = yield database_1.default.query(`SELECT * FROM e_cat_nacionalidades WHERE UPPER(nombre) = $1`, [valor.nacionalidad.toUpperCase()]);
                                            if (VERIFICAR_NACIONALIDAD.rows[0] != undefined && VERIFICAR_NACIONALIDAD.rows[0] != '') {
                                                if (valor.estado_civil != 'No registrado') {
                                                    var VERIFICAR_ESTADO_CIVIL = yield database_1.default.query(`SELECT * FROM e_estado_civil WHERE UPPER(estado_civil) = $1`, [valor.estado_civil.toUpperCase()]);
                                                    if (VERIFICAR_ESTADO_CIVIL.rows[0] != undefined && VERIFICAR_ESTADO_CIVIL.rows[0] != '') {
                                                        if (valor.genero != 'No registrado') {
                                                            var VERIFICAR_GENERO = yield database_1.default.query(`SELECT * FROM e_genero WHERE UPPER(genero) = $1`, [valor.genero.toUpperCase()]);
                                                            if (VERIFICAR_GENERO.rows[0] != undefined && VERIFICAR_GENERO.rows[0] != '') {
                                                                // DISCRIMINACIÓN DE ELEMENTOS IGUALES
                                                                if (duplicados1.find((p) => p.identificacion === valor.identificacion) == undefined) {
                                                                    if (duplicados2.find((a) => a.usuario === valor.usuario) == undefined) {
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
                                                                valor.observacion = 'Género no existe en el sistema';
                                                            }
                                                        }
                                                    }
                                                    else {
                                                        valor.observacion = 'Estado civil no existe en el sistema';
                                                    }
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
                                item.observacion = 'Registro duplicado (identificación)';
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
                        return res.jsonp({ message: mensaje, data: listEmpleados });
                    }, tiempo);
                }
            }
            catch (error) {
                console.log("ver el error: ", error);
                return res.status(500).jsonp({ message: error });
            }
        });
    }
    // METODO PARA REGISTRAR DATOS DE PLANTILLA CODIGO AUTOMATICO   **USADO
    CargarPlantilla_Automatico(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { plantilla, user_name, ip, ip_local } = req.body;
            const VALOR = yield database_1.default.query(`SELECT * FROM e_codigo`);
            var codigo_dato = VALOR.rows[0].valor;
            var codigo = 0;
            if (codigo_dato != null && codigo_dato != undefined && codigo_dato != '') {
                codigo = codigo_dato = parseInt(codigo_dato);
            }
            // VERIFICAR SI EL CODIGO ESTA DESACTUALZIADO
            const MAX_CODIGO = yield database_1.default.query(`SELECT MAX(codigo::BIGINT) AS codigo FROM eu_empleados`);
            const max_real = parseInt(MAX_CODIGO.rows[0].codigo) || 0;
            // SI HAY UN CODIGO MAS ALTO, LO ACTUALIZA
            if (max_real > codigo) {
                codigo = max_real;
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
                    //TODO: ACA SE REALIZA LA ENCRIPTACION
                    console.log(' encriptando');
                    // ENCRIPTAR CONTRASEÑA
                    let contrasena = rsa_keys_service_1.default.encriptarLogin(data.contrasena.toString());
                    console.log('contraseña plantilla automatico: ', contrasena);
                    // DATOS QUE SE LEEN DE LA PLANTILLA INGRESADA
                    const { identificacion, tipo_identificacion, numero_partida_individual, estado_civil, genero, correo, fec_nacimiento, domicilio, longitud, latitud, telefono, nacionalidad, usuario, rol } = data;
                    //OBTENER ID DEL ESTADO_CIVIL 
                    let id_estado_civil = 0;
                    const estadoCivilDB = yield database_1.default.query(`SELECT id FROM e_estado_civil WHERE UPPER(estado_civil) = $1 LIMIT 1`, [estado_civil.toUpperCase()]);
                    if (estadoCivilDB.rows.length > 0) {
                        id_estado_civil = estadoCivilDB.rows[0].id;
                    }
                    else {
                        throw new Error(`Estado civil no registrado: ${estado_civil}`);
                    }
                    //OBTENER ID DEL GENERO
                    let id_genero = 0;
                    const generoDB = yield database_1.default.query(`SELECT id FROM e_genero WHERE UPPER(genero) = $1 LIMIT 1`, [genero === null || genero === void 0 ? void 0 : genero.toUpperCase().trim()]);
                    if (generoDB.rows.length > 0) {
                        id_genero = generoDB.rows[0].id;
                    }
                    else {
                        throw new Error(`Género no registrado: ${genero}`);
                    }
                    var _longitud = null;
                    if (longitud != 'No registrado') {
                        _longitud = longitud;
                    }
                    var _latitud = null;
                    if (latitud != 'No registrado') {
                        _latitud = latitud;
                    }
                    var _telefono = null;
                    if (telefono != 'No registrado') {
                        _telefono = telefono;
                    }
                    var _domicilio = null;
                    if (domicilio != 'No registrado') {
                        _domicilio = domicilio;
                    }
                    //OBTENER ID DEL ESTADO
                    var id_estado = 1;
                    var estado_user = true;
                    var app_habilita = false;
                    //OBTENER ID DE LA NACIONALIDAD
                    const id_nacionalidad = yield database_1.default.query(`SELECT * FROM e_cat_nacionalidades WHERE UPPER(nombre) = $1`, [nacionalidad.toUpperCase()]);
                    //OBTENER ID DEL ROL
                    const id_rol = yield database_1.default.query(`SELECT * FROM ero_cat_roles WHERE UPPER(nombre) = $1`, [rol.toUpperCase()]);
                    if (codigo_dato != null && codigo_dato != undefined && codigo_dato != '') {
                        // INCREMENTAR EL VALOR DEL CODIGO
                        codigo = codigo + 1;
                    }
                    else {
                        codigo = identificacion;
                    }
                    let id_tipo_identificacion = 0;
                    if (tipo_identificacion.toUpperCase() === 'CÉDULA') {
                        id_tipo_identificacion = 1;
                    }
                    else if (tipo_identificacion.toUpperCase() === 'PASAPORTE') {
                        id_tipo_identificacion = 2;
                    }
                    // REGISTRO DE NUEVO EMPLEADO
                    const response = yield database_1.default.query(`
          INSERT INTO eu_empleados (tipo_identificacion, identificacion, apellido, nombre, estado_civil, genero, correo,
            fecha_nacimiento, estado, domicilio, telefono, id_nacionalidad, codigo, longitud, latitud, numero_partida_individual) 
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16) RETURNING *
          `, [id_tipo_identificacion, identificacion, apellidoE, nombreE,
                        id_estado_civil, id_genero, correo, fec_nacimiento, id_estado,
                        _domicilio, _telefono, id_nacionalidad.rows[0]['id'], codigo, _longitud, _latitud, numero_partida_individual]);
                    const [empleado] = response.rows;
                    // AUDITORIA
                    yield auditoriaControlador_1.default.InsertarAuditoria({
                        tabla: 'eu_empleados',
                        usuario: user_name,
                        accion: 'I',
                        datosOriginales: '',
                        datosNuevos: `{tipo_identificacion: ${id_tipo_identificacion},identificacion: ${identificacion}, apellido: ${apellidoE}, nombre: ${nombreE}, estado_civil: ${id_estado_civil}, genero: ${id_genero}, correo: ${correo}, fecha_nacimiento: ${fec_nacimiento}, estado: ${id_estado}, domicilio: ${domicilio}, telefono: ${telefono}, id_nacionalidad: ${id_nacionalidad.rows[0]['id']}, codigo: ${codigo}, longitud: ${_longitud}, latitud: ${_latitud}, numero_partida_individual: ${numero_partida_individual}}`,
                        ip: ip,
                        ip_local: ip_local,
                        observacion: null
                    });
                    // OBTENER EL ID DEL EMPLEADO INGRESADO
                    const id_empleado = empleado.id;
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
                        ip: ip,
                        ip_local: ip_local,
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
                                ip: ip,
                                ip_local: ip_local,
                                observacion: null
                            });
                        }
                        // FINALIZAR TRANSACCION
                        yield database_1.default.query('COMMIT');
                    }
                    contador = contador + 1;
                    contrasena = '';
                }
                catch (error) {
                    // REVERTIR TRANSACCION
                    yield database_1.default.query('ROLLBACK');
                    console.error("Error en CargarPlantilla_Automatica:", error);
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
    // METODOS PARA VERIFICAR PLANTILLA CON CODIGO INGRESADO DE FORMA MANUAL    **USADO
    VerificarPlantilla_Manual(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t;
            try {
                const documento = (_a = req.file) === null || _a === void 0 ? void 0 : _a.originalname;
                let separador = path_1.default.sep;
                let ruta = (0, accesoCarpetas_2.ObtenerRutaLeerPlantillas)() + separador + documento;
                const workbook = new exceljs_1.default.Workbook();
                yield workbook.xlsx.readFile(ruta);
                let verificador = (0, accesoCarpetas_1.ObtenerIndicePlantilla)(workbook, 'EMPLEADOS');
                const modoCodigo = req.body.modoCodigo || 'manual';
                if (verificador === false) {
                    return res.jsonp({ message: 'no_existe', data: undefined });
                }
                else {
                    const sheet_name_list = workbook.worksheets.map(sheet => sheet.name);
                    const plantilla = workbook.getWorksheet(sheet_name_list[verificador]);
                    let data = {
                        fila: '',
                        identificacion: '',
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
                        tipo_identificacion: '',
                        numero_partida_individual: '',
                    };
                    //ARREGLO DE ESTADOS CIVILES EN BD
                    const estadoCivilDB = yield database_1.default.query(`SELECT estado_civil FROM e_estado_civil`);
                    const estadoCivilArray = estadoCivilDB.rows.map(item => item.estado_civil.toUpperCase());
                    //ARREGLO DE GENEROS EN BD
                    const generoDB = yield database_1.default.query(`SELECT genero FROM e_genero`);
                    const tipogenero = generoDB.rows.map(item => item.genero.toUpperCase());
                    // VALIDA SI LOS DATOS DE LA COLUMNA CEDULA SON NUMEROS.
                    const regex = /^[0-9]+$/;
                    // VALIDA EL FORMATO DEL CORREO: XXXXXXX@XXXXXXXXX.XXX
                    const regexCorreo = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
                    const valiContra = /\s/;
                    // EXPRESION REGULAR PARA VALIDAR LA LATITUD Y LONGITUD
                    const regexLatitud = /^-?([1-8]?\d(\.\d+)?|90(\.0+)?)$/;
                    const regexLongitud = /^-?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)$/;
                    var listEmpleadosManual = [];
                    var duplicados1 = [];
                    var duplicados2 = [];
                    var duplicados3 = [];
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
                        if (!headers['ITEM'] || !headers['CODIGO'] || !headers['IDENTIFICACION'] ||
                            !headers['APELLIDO'] || !headers['NOMBRE'] || !headers['USUARIO'] ||
                            !headers['CONTRASENA'] || !headers['ROL'] || !headers['ESTADO_CIVIL'] ||
                            !headers['GENERO'] || !headers['CORREO'] || !headers['FECHA_NACIMIENTO'] ||
                            !headers['LATITUD'] || !headers['LONGITUD'] || !headers['DOMICILIO'] ||
                            !headers['TELEFONO'] || !headers['NACIONALIDAD'] || !headers['TIPO_IDENTIFICACION'] || !headers['NUMERO_PARTIDA_INDIVIDUAL']) {
                            return res.jsonp({ message: 'Cabeceras faltantes', data: undefined });
                        }
                        for (let rowNumber = 2; rowNumber <= plantilla.rowCount; rowNumber++) {
                            const row = plantilla.getRow(rowNumber);
                            if (!row || row.hasValues === false)
                                continue;
                            // SALTAR LA FILA DE LAS CABECERAS
                            if (rowNumber === 1)
                                return;
                            // LEER LOS DATOS SEGUN LAS COLUMNAS ENCONTRADAS
                            const ITEM = row.getCell(headers['ITEM']).value;
                            const CODIGO = (_b = row.getCell(headers['CODIGO']).value) === null || _b === void 0 ? void 0 : _b.toString();
                            const IDENTIFICACION = (_c = row.getCell(headers['IDENTIFICACION']).value) === null || _c === void 0 ? void 0 : _c.toString();
                            const APELLIDO = (_d = row.getCell(headers['APELLIDO']).value) === null || _d === void 0 ? void 0 : _d.toString();
                            const NOMBRE = (_e = row.getCell(headers['NOMBRE']).value) === null || _e === void 0 ? void 0 : _e.toString();
                            const USUARIO = (_f = row.getCell(headers['USUARIO']).value) === null || _f === void 0 ? void 0 : _f.toString();
                            const CONTRASENA = (_g = row.getCell(headers['CONTRASENA']).value) === null || _g === void 0 ? void 0 : _g.toString();
                            const ROL = (_h = row.getCell(headers['ROL']).value) === null || _h === void 0 ? void 0 : _h.toString();
                            const ESTADO_CIVIL = (_j = row.getCell(headers['ESTADO_CIVIL']).value) === null || _j === void 0 ? void 0 : _j.toString();
                            const GENERO = (_k = row.getCell(headers['GENERO']).value) === null || _k === void 0 ? void 0 : _k.toString();
                            const FECHA_NACIMIENTO = (_l = row.getCell(headers['FECHA_NACIMIENTO']).value) === null || _l === void 0 ? void 0 : _l.toString();
                            const LATITUD = (_m = row.getCell(headers['LATITUD']).value) === null || _m === void 0 ? void 0 : _m.toString();
                            const LONGITUD = (_o = row.getCell(headers['LONGITUD']).value) === null || _o === void 0 ? void 0 : _o.toString();
                            const DOMICILIO = (_p = row.getCell(headers['DOMICILIO']).value) === null || _p === void 0 ? void 0 : _p.toString();
                            const TELEFONO = (_q = row.getCell(headers['TELEFONO']).value) === null || _q === void 0 ? void 0 : _q.toString();
                            const NACIONALIDAD = (_r = row.getCell(headers['NACIONALIDAD']).value) === null || _r === void 0 ? void 0 : _r.toString();
                            const TIPO_IDENTIFICACION = (_s = row.getCell(headers['TIPO_IDENTIFICACION']).value) === null || _s === void 0 ? void 0 : _s.toString();
                            const NUMERO_PARTIDA_INDIVIDUAL = (_t = row.getCell(headers['NUMERO_PARTIDA_INDIVIDUAL']).value) === null || _t === void 0 ? void 0 : _t.toString();
                            let CORREO = row.getCell(headers['CORREO']).value;
                            if (typeof CORREO === 'object' && CORREO !== null) {
                                if ('text' in CORREO) {
                                    CORREO = CORREO.text;
                                }
                                else {
                                    CORREO = '';
                                }
                            }
                            CORREO = CORREO === null || CORREO === void 0 ? void 0 : CORREO.toString();
                            // VERIFICAR QUE EL REGISTO NO TENGA DATOS VACIOS
                            if (ITEM != undefined && ITEM != '' &&
                                IDENTIFICACION != undefined && APELLIDO != undefined &&
                                NOMBRE != undefined && CODIGO != undefined && ESTADO_CIVIL != undefined &&
                                GENERO != undefined && CORREO != undefined && FECHA_NACIMIENTO != undefined &&
                                LATITUD != undefined && LONGITUD != undefined && DOMICILIO != undefined &&
                                TELEFONO != undefined && NACIONALIDAD != undefined && USUARIO != undefined &&
                                CONTRASENA != undefined && ROL != undefined && TIPO_IDENTIFICACION != undefined &&
                                NUMERO_PARTIDA_INDIVIDUAL != undefined) {
                                data.fila = ITEM;
                                data.identificacion = IDENTIFICACION === null || IDENTIFICACION === void 0 ? void 0 : IDENTIFICACION.trim();
                                data.apellido = APELLIDO === null || APELLIDO === void 0 ? void 0 : APELLIDO.trim();
                                data.nombre = NOMBRE === null || NOMBRE === void 0 ? void 0 : NOMBRE.trim();
                                data.codigo = CODIGO === null || CODIGO === void 0 ? void 0 : CODIGO.trim();
                                data.usuario = USUARIO === null || USUARIO === void 0 ? void 0 : USUARIO.trim();
                                data.contrasena = CONTRASENA === null || CONTRASENA === void 0 ? void 0 : CONTRASENA.trim();
                                data.rol = ROL === null || ROL === void 0 ? void 0 : ROL.trim();
                                data.estado_civil = ESTADO_CIVIL === null || ESTADO_CIVIL === void 0 ? void 0 : ESTADO_CIVIL.trim();
                                data.genero = GENERO === null || GENERO === void 0 ? void 0 : GENERO.trim();
                                data.correo = CORREO === null || CORREO === void 0 ? void 0 : CORREO.trim();
                                data.fec_nacimiento = FECHA_NACIMIENTO === null || FECHA_NACIMIENTO === void 0 ? void 0 : FECHA_NACIMIENTO.trim();
                                data.latitud = LATITUD === null || LATITUD === void 0 ? void 0 : LATITUD.trim();
                                data.longitud = LONGITUD === null || LONGITUD === void 0 ? void 0 : LONGITUD.trim();
                                data.domicilio = DOMICILIO === null || DOMICILIO === void 0 ? void 0 : DOMICILIO.trim();
                                data.telefono = TELEFONO === null || TELEFONO === void 0 ? void 0 : TELEFONO.trim();
                                data.nacionalidad = NACIONALIDAD === null || NACIONALIDAD === void 0 ? void 0 : NACIONALIDAD.trim();
                                data.tipo_identificacion = TIPO_IDENTIFICACION === null || TIPO_IDENTIFICACION === void 0 ? void 0 : TIPO_IDENTIFICACION.trim();
                                data.numero_partida_individual = NUMERO_PARTIDA_INDIVIDUAL === null || NUMERO_PARTIDA_INDIVIDUAL === void 0 ? void 0 : NUMERO_PARTIDA_INDIVIDUAL.trim();
                                data.observacion = 'no registrado';
                                //METODO QUE VALIDA LOS DATOS CUANDO LA FILA TIENE LOS DATOS COMPLETOS
                                yield validarEmpleadoCompleto(data, regex, regexCorreo, valiContra, regexLatitud, regexLongitud, estadoCivilArray, tipogenero, TIPO_IDENTIFICACION !== null && TIPO_IDENTIFICACION !== void 0 ? TIPO_IDENTIFICACION : 'No registrado', database_1.default, TELEFONO !== null && TELEFONO !== void 0 ? TELEFONO : '', LONGITUD !== null && LONGITUD !== void 0 ? LONGITUD : '', LATITUD !== null && LATITUD !== void 0 ? LATITUD : '', ValidarCedula, modoCodigo);
                                listEmpleadosManual.push(data);
                            }
                            else {
                                data.fila = ITEM;
                                data.identificacion = IDENTIFICACION === null || IDENTIFICACION === void 0 ? void 0 : IDENTIFICACION.trim();
                                data.apellido = APELLIDO === null || APELLIDO === void 0 ? void 0 : APELLIDO.trim();
                                data.nombre = NOMBRE === null || NOMBRE === void 0 ? void 0 : NOMBRE.trim();
                                data.codigo = CODIGO === null || CODIGO === void 0 ? void 0 : CODIGO.trim();
                                data.usuario = USUARIO === null || USUARIO === void 0 ? void 0 : USUARIO.trim();
                                data.contrasena = CONTRASENA === null || CONTRASENA === void 0 ? void 0 : CONTRASENA.trim();
                                data.rol = ROL === null || ROL === void 0 ? void 0 : ROL.trim();
                                data.estado_civil = ESTADO_CIVIL === null || ESTADO_CIVIL === void 0 ? void 0 : ESTADO_CIVIL.trim();
                                data.genero = GENERO === null || GENERO === void 0 ? void 0 : GENERO.trim();
                                data.correo = CORREO === null || CORREO === void 0 ? void 0 : CORREO.trim();
                                data.fec_nacimiento = FECHA_NACIMIENTO === null || FECHA_NACIMIENTO === void 0 ? void 0 : FECHA_NACIMIENTO.trim();
                                data.latitud = LATITUD === null || LATITUD === void 0 ? void 0 : LATITUD.trim();
                                data.longitud = LONGITUD === null || LONGITUD === void 0 ? void 0 : LONGITUD.trim();
                                data.domicilio = DOMICILIO === null || DOMICILIO === void 0 ? void 0 : DOMICILIO.trim();
                                data.telefono = TELEFONO === null || TELEFONO === void 0 ? void 0 : TELEFONO.trim();
                                data.nacionalidad = NACIONALIDAD === null || NACIONALIDAD === void 0 ? void 0 : NACIONALIDAD.trim();
                                data.tipo_identificacion = TIPO_IDENTIFICACION === null || TIPO_IDENTIFICACION === void 0 ? void 0 : TIPO_IDENTIFICACION.trim();
                                data.numero_partida_individual = NUMERO_PARTIDA_INDIVIDUAL === null || NUMERO_PARTIDA_INDIVIDUAL === void 0 ? void 0 : NUMERO_PARTIDA_INDIVIDUAL.trim();
                                data.observacion = 'no registrado';
                                //METODO QUE VALIDA LOS DATOS CUANDO LA FILA TIENE LOS DATOS INCOMPLETOS
                                yield validarEmpleadoIncompleto(data, ITEM, IDENTIFICACION, APELLIDO, NOMBRE, ESTADO_CIVIL, GENERO, CORREO, FECHA_NACIMIENTO, LATITUD, LONGITUD, DOMICILIO, TELEFONO, NACIONALIDAD, USUARIO, CONTRASENA, ROL, TIPO_IDENTIFICACION, NUMERO_PARTIDA_INDIVIDUAL, regex, regexCorreo, valiContra, regexLatitud, regexLongitud, estadoCivilArray, tipogenero, database_1.default, ValidarCedula, modoCodigo);
                                listEmpleadosManual.push(data);
                            }
                            data = {};
                        }
                        ;
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
                    listEmpleadosManual.forEach((valor) => __awaiter(this, void 0, void 0, function* () {
                        if (valor.observacion == 'no registrado' || valor.observacion == ' ') {
                            var VERIFICAR_CEDULA = yield database_1.default.query(`SELECT * FROM eu_empleados WHERE identificacion = $1`, [valor.identificacion]);
                            if (VERIFICAR_CEDULA.rows[0] != undefined && VERIFICAR_CEDULA.rows[0] != '') {
                                valor.observacion = 'Identificación ya existe en el sistema';
                            }
                            else {
                                var VERIFICAR_CODIGO = yield database_1.default.query(`SELECT * FROM eu_empleados WHERE codigo = $1`, [valor.codigo]);
                                if (VERIFICAR_CODIGO.rows[0] != undefined && VERIFICAR_CODIGO.rows[0] != '') {
                                    valor.observacion = 'Código ya existe en el sistema';
                                }
                                else {
                                    var VERIFICAR_USUARIO = yield database_1.default.query(`SELECT * FROM eu_usuarios WHERE usuario = $1`, [valor.usuario]);
                                    if (VERIFICAR_USUARIO.rows[0] != undefined && VERIFICAR_USUARIO.rows[0] != '') {
                                        valor.observacion = 'Usuario ya existe en el sistema';
                                    }
                                    else {
                                        if (valor.rol != 'No registrado') {
                                            var VERIFICAR_ROL = yield database_1.default.query(`SELECT * FROM ero_cat_roles WHERE UPPER(nombre) = $1`, [valor.rol.toUpperCase()]);
                                            if (VERIFICAR_ROL.rows[0] != undefined && VERIFICAR_ROL.rows[0] != '') {
                                                if (valor.nacionalidad != 'No registrado') {
                                                    var VERIFICAR_NACIONALIDAD = yield database_1.default.query(`SELECT * FROM e_cat_nacionalidades WHERE UPPER(nombre) = $1`, [valor.nacionalidad.toUpperCase()]);
                                                    if (VERIFICAR_NACIONALIDAD.rows[0] != undefined && VERIFICAR_NACIONALIDAD.rows[0] != '') {
                                                        if (valor.estado_civil != 'No registrado') {
                                                            var VERIFICAR_ESTADO_CIVIL = yield database_1.default.query(`SELECT * FROM e_estado_civil WHERE UPPER(estado_civil) = $1`, [valor.estado_civil.toUpperCase()]);
                                                            if (VERIFICAR_ESTADO_CIVIL.rows[0] != undefined && VERIFICAR_ESTADO_CIVIL.rows[0] != '') {
                                                                if (valor.genero != 'No registrado') {
                                                                    var VERIFICAR_GENERO = yield database_1.default.query(`SELECT * FROM e_genero WHERE UPPER(genero) = $1`, [valor.genero.toUpperCase()]);
                                                                    if (VERIFICAR_GENERO.rows[0] != undefined && VERIFICAR_GENERO.rows[0] != '') {
                                                                        // DISCRIMINACIÓN DE ELEMENTOS IGUALES
                                                                        if (duplicados1.find((p) => p.identificacion === valor.identificacion) == undefined) {
                                                                            if (duplicados3.find((c) => c.codigo === valor.codigo) == undefined) {
                                                                                if (duplicados2.find((a) => a.usuario === valor.usuario) == undefined) {
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
                                                                        valor.observacion = 'Género no existe en el sistema';
                                                                    }
                                                                }
                                                            }
                                                            else {
                                                                valor.observacion = 'Estado civil no existe en el sistema';
                                                            }
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
                                item.observacion = 'Registro duplicado (identificación)';
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
    // METODO PARA REGISTRAR DATOS DE LA PLANTILLA CODIGO MANUAL   **USADO
    CargarPlantilla_Manual(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { plantilla, user_name, ip, ip_local } = req.body;
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
                    //TODO: ACA SE REALIZA LA ENCRIPTACION
                    // ENCRIPTAR CONTRASEÑA
                    let contrasena = rsa_keys_service_1.default.encriptarLogin(data.contrasena.toString());
                    console.log('contraseña plantilla manual: ', contrasena);
                    // DATOS QUE SE LEEN DE LA PLANTILLA INGRESADA
                    const { identificacion, tipo_identificacion, numero_partida_individual, codigo, estado_civil, genero, correo, fec_nacimiento, domicilio, longitud, latitud, telefono, nacionalidad, usuario, rol, } = data;
                    // OBTENER ID DEL ESTADO_CIVIL 
                    let id_estado_civil = 0;
                    const estadoCivilDB = yield database_1.default.query(`SELECT id FROM e_estado_civil WHERE UPPER(estado_civil) = $1 LIMIT 1`, [estado_civil === null || estado_civil === void 0 ? void 0 : estado_civil.toUpperCase()]);
                    if (estadoCivilDB.rows.length > 0) {
                        id_estado_civil = estadoCivilDB.rows[0].id;
                    }
                    else {
                        throw new Error(`Estado civil no registrado: ${estado_civil}`);
                    }
                    //OBTENER ID DEL GENERO
                    let id_genero = 0;
                    const generoDB = yield database_1.default.query(`SELECT id FROM e_genero WHERE UPPER(genero) = $1 LIMIT 1`, [genero === null || genero === void 0 ? void 0 : genero.toUpperCase()]);
                    if (generoDB.rows.length > 0) {
                        id_genero = generoDB.rows[0].id;
                    }
                    else {
                        throw new Error(`Género no registrado: ${genero}`);
                    }
                    var _longitud = null;
                    if (longitud != 'No registrado') {
                        _longitud = longitud;
                    }
                    var _latitud = null;
                    if (latitud != 'No registrado') {
                        _latitud = latitud;
                    }
                    var _telefono = null;
                    if (telefono != 'No registrado') {
                        _telefono = telefono;
                    }
                    var _domicilio = null;
                    if (domicilio != 'No registrado') {
                        _domicilio = domicilio;
                    }
                    // OBTENER ID DEL ESTADO
                    var id_estado = 1;
                    var estado_user = true;
                    var app_habilita = false;
                    // OBTENER ID DE LA NACIONALIDAD
                    const id_nacionalidad = yield database_1.default.query(`SELECT * FROM e_cat_nacionalidades WHERE UPPER(nombre) = $1`, [nacionalidad.toUpperCase()]);
                    // OBTENER ID DEL ROL
                    const id_rol = yield database_1.default.query(`SELECT * FROM ero_cat_roles WHERE UPPER(nombre) = $1`, [rol.toUpperCase()]);
                    // REGISTRO DE NUEVO EMPLEADO
                    let id_tipo_identificacion = 0;
                    if (tipo_identificacion.toUpperCase() === 'CÉDULA') {
                        id_tipo_identificacion = 1;
                    }
                    else if (tipo_identificacion.toUpperCase() === 'PASAPORTE') {
                        id_tipo_identificacion = 2;
                    }
                    const response = yield database_1.default.query(`
          INSERT INTO eu_empleados (tipo_identificacion,identificacion, apellido, nombre, estado_civil, genero, correo,
            fecha_nacimiento, estado, domicilio, telefono, id_nacionalidad, codigo, longitud, latitud, numero_partida_individual) 
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16) RETURNING *
          `, [id_tipo_identificacion, identificacion, apellidoE, nombreE,
                        id_estado_civil, id_genero, correo, fec_nacimiento, id_estado,
                        _domicilio, _telefono, id_nacionalidad.rows[0]['id'], codigo, _longitud, _latitud, numero_partida_individual]);
                    const [empleado] = response.rows;
                    // AUDITORIA
                    yield auditoriaControlador_1.default.InsertarAuditoria({
                        tabla: 'eu_empleados',
                        usuario: user_name,
                        accion: 'I',
                        datosOriginales: '',
                        datosNuevos: `{tipo_identificacion: ${id_tipo_identificacion} ,identificacion: ${identificacion}, apellido: ${apellidoE}, nombre: ${nombreE}, estado_civil: ${id_estado_civil}, genero: ${id_genero}, correo: ${correo}, fecha_nacimiento: ${fec_nacimiento}, estado: ${id_estado}, domicilio: ${domicilio}, telefono: ${telefono}, id_nacionalidad: ${id_nacionalidad.rows[0]['id']}, codigo: ${codigo}, longitud: ${_longitud}, latitud: ${_latitud}, numero_partida_individual: ${numero_partida_individual}}`,
                        ip: ip,
                        ip_local: ip_local,
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
                        ip: ip,
                        ip_local: ip_local,
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
                            ip: ip,
                            ip_local: ip_local,
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
    /** ********************************************************************************************* **
     ** **               CONSULTAS DE GEOLOCALIZACION DEL USUARIO                                  ** **
     ** ********************************************************************************************* **/
    // METODO PARA BUSCAR DATOS DE COORDENADAS DE DOMICILIO    **USADO
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
    // METODO PARA TOMAR DATOS DE LA UBICACION DEL DOMICILIO DEL EMPLEADO   **USADO
    GeolocalizacionCrokis(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let id = req.params.id;
            let { lat, lng, user_name, ip, ip_local } = req.body;
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
                        ip: ip,
                        ip_local: ip_local,
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
                    ip: ip,
                    ip_local: ip_local,
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
    // BUSQUEDA DE TITULOS PROFESIONALES DEL EMPLEADO   **USADO
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
    // INGRESAR TITULO PROFESIONAL DEL EMPLEADO   **USADO
    CrearEmpleadoTitulos(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { observacion, id_empleado, id_titulo, user_name, ip, ip_local } = req.body;
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
                    ip: ip,
                    ip_local: ip_local,
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
    // METODO PARA BUSCAR TITULO ESPECIFICO DEL EMPLEADO   **USADO
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
    // ACTUALIZAR TITULO PROFESIONAL DEL EMPLEADO   **USADO
    EditarTituloEmpleado(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = req.params.id_empleado_titulo;
                const { observacion, id_titulo, user_name, ip, ip_local } = req.body;
                // INICIAR TRANSACCION
                yield database_1.default.query('BEGIN');
                // CONSULTAR DATOSORIGINALES
                const empleado = yield database_1.default.query(`SELECT * FROM eu_empleado_titulos WHERE id = $1`, [id]);
                const [datosOriginales] = empleado.rows;
                if (!datosOriginales) {
                    yield auditoriaControlador_1.default.InsertarAuditoria({
                        tabla: 'eu_empleado_titulos',
                        usuario: user_name,
                        accion: 'U',
                        datosOriginales: '',
                        datosNuevos: '',
                        ip: ip,
                        ip_local: ip_local,
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
                    ip: ip,
                    ip_local: ip_local,
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
    // METODO PARA ELIMINAR TITULO PROFESIONAL DEL EMPLEADO   **USADO
    EliminarTituloEmpleado(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { user_name, ip, ip_local } = req.body;
                const id = req.params.id_empleado_titulo;
                // INICIAR TRANSACCION
                yield database_1.default.query('BEGIN');
                // CONSULTAR DATOSORIGINALES
                const empleado = yield database_1.default.query(`SELECT * FROM eu_empleado_titulos WHERE id = $1`, [id]);
                const [datosOriginales] = empleado.rows;
                if (!datosOriginales) {
                    yield auditoriaControlador_1.default.InsertarAuditoria({
                        tabla: 'eu_empleado_titulos',
                        usuario: user_name,
                        accion: 'D',
                        datosOriginales: '',
                        datosNuevos: '',
                        ip: ip,
                        ip_local: ip_local,
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
                    ip: ip,
                    ip_local: ip_local,
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
    /** ******************************************************************************************** **
     ** **      M E T O D O S   U S A D O S    E N    L A    A P L I C A C I O N    M O V I L     ** **
     ** ******************************************************************************************** **/
    getHorariosEmpleadoByCodigo(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { codigo, fecha_inicio } = req.query;
                const response = yield database_1.default.query(`
            SELECT id, id_empleado AS empl_codigo, id_empleado_cargo, id_horario,
                fecha_horario AS fecha, fecha_hora_horario::time AS horario,
                tipo_dia, tipo_accion AS tipo_hora, id_detalle_horario
            FROM eu_asistencia_general
            WHERE id_empleado = $1
                AND fecha_horario BETWEEN $2 AND $2 
            ORDER BY horario ASC`, [codigo, fecha_inicio]);
                const horarios = response.rows;
                if (horarios.length === 0)
                    return res.status(200).jsonp([]);
                return res.status(200).jsonp(horarios);
            }
            catch (error) {
                console.log(error);
                return res.status(500).jsonp({ message: 'Contactese con el Administrador del sistema (593) 2 – 252-7663 o https://casapazmino.com.ec' });
            }
        });
    }
    ;
    getListaEmpleados(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield database_1.default.query('SELECT id, identificacion, codigo,  (nombre || \' \' || apellido) as fullname, name_cargo as cargo, name_suc as sucursal, name_dep as departamento, name_regimen as regimen  FROM informacion_general ORDER BY fullname ASC');
                const empleados = response.rows;
                console.log(empleados);
                return res.status(200).jsonp(empleados);
            }
            catch (error) {
                console.log(error);
                return res.status(500).jsonp({ message: 'Contactese con el Administrador del sistema (593) 2 – 252-7663 o https://casapazmino.com.ec' });
            }
        });
    }
    ;
    getPlanificacionMesesCodigoEmple(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { codigo } = req.query;
                const HORARIO = yield database_1.default.query("SELECT codigo_e, nombre_e, anio, mes, " +
                    "CASE WHEN STRING_AGG(CASE WHEN dia = 1 THEN codigo_dia end,', ') IS NOT NULL THEN STRING_AGG(CASE WHEN dia = 1 THEN codigo_dia end,', ') ELSE '-' END AS dia1, " +
                    "CASE WHEN STRING_AGG(CASE WHEN dia = 2 THEN codigo_dia end,', ') IS NOT NULL THEN STRING_AGG(CASE WHEN dia = 2 THEN codigo_dia end,', ') ELSE '-' END AS dia2, " +
                    "CASE WHEN STRING_AGG(CASE WHEN dia = 3 THEN codigo_dia end,', ') IS NOT NULL THEN STRING_AGG(CASE WHEN dia = 3 THEN codigo_dia end,', ') ELSE '-' END AS dia3, " +
                    "CASE WHEN STRING_AGG(CASE WHEN dia = 4 THEN codigo_dia end,', ') IS NOT NULL THEN STRING_AGG(CASE WHEN dia = 4 THEN codigo_dia end,', ') ELSE '-' END AS dia4, " +
                    "CASE WHEN STRING_AGG(CASE WHEN dia = 5 THEN codigo_dia end,', ') IS NOT NULL THEN STRING_AGG(CASE WHEN dia = 5 THEN codigo_dia end,', ') ELSE '-' END AS dia5, " +
                    "CASE WHEN STRING_AGG(CASE WHEN dia = 6 THEN codigo_dia end,', ') IS NOT NULL THEN STRING_AGG(CASE WHEN dia = 6 THEN codigo_dia end,', ') ELSE '-' END AS dia6, " +
                    "CASE WHEN STRING_AGG(CASE WHEN dia = 7 THEN codigo_dia end,', ') IS NOT NULL THEN STRING_AGG(CASE WHEN dia = 7 THEN codigo_dia end,', ') ELSE '-' END AS dia7, " +
                    "CASE WHEN STRING_AGG(CASE WHEN dia = 8 THEN codigo_dia end,', ') IS NOT NULL THEN STRING_AGG(CASE WHEN dia = 8 THEN codigo_dia end,', ') ELSE '-' END AS dia8, " +
                    "CASE WHEN STRING_AGG(CASE WHEN dia = 9 THEN codigo_dia end,', ') IS NOT NULL THEN STRING_AGG(CASE WHEN dia = 9 THEN codigo_dia end,', ') ELSE '-' END AS dia9, " +
                    "CASE WHEN STRING_AGG(CASE WHEN dia = 10 THEN codigo_dia end,', ') IS NOT NULL THEN STRING_AGG(CASE WHEN dia = 10 THEN codigo_dia end,', ') ELSE '-' END AS dia10, " +
                    "CASE WHEN STRING_AGG(CASE WHEN dia = 11 THEN codigo_dia end,', ') IS NOT NULL THEN STRING_AGG(CASE WHEN dia = 11 THEN codigo_dia end,', ') ELSE '-' END AS dia11, " +
                    "CASE WHEN STRING_AGG(CASE WHEN dia = 12 THEN codigo_dia end,', ') IS NOT NULL THEN STRING_AGG(CASE WHEN dia = 12 THEN codigo_dia end,', ') ELSE '-' END AS dia12, " +
                    "CASE WHEN STRING_AGG(CASE WHEN dia = 13 THEN codigo_dia end,', ') IS NOT NULL THEN STRING_AGG(CASE WHEN dia = 13 THEN codigo_dia end,', ') ELSE '-' END AS dia13, " +
                    "CASE WHEN STRING_AGG(CASE WHEN dia = 14 THEN codigo_dia end,', ') IS NOT NULL THEN STRING_AGG(CASE WHEN dia = 14 THEN codigo_dia end,', ') ELSE '-' END AS dia14, " +
                    "CASE WHEN STRING_AGG(CASE WHEN dia = 15 THEN codigo_dia end,', ') IS NOT NULL THEN STRING_AGG(CASE WHEN dia = 15 THEN codigo_dia end,', ') ELSE '-' END AS dia15, " +
                    "CASE WHEN STRING_AGG(CASE WHEN dia = 16 THEN codigo_dia end,', ') IS NOT NULL THEN STRING_AGG(CASE WHEN dia = 16 THEN codigo_dia end,', ') ELSE '-' END AS dia16, " +
                    "CASE WHEN STRING_AGG(CASE WHEN dia = 17 THEN codigo_dia end,', ') IS NOT NULL THEN STRING_AGG(CASE WHEN dia = 17 THEN codigo_dia end,', ') ELSE '-' END AS dia17, " +
                    "CASE WHEN STRING_AGG(CASE WHEN dia = 18 THEN codigo_dia end,', ') IS NOT NULL THEN STRING_AGG(CASE WHEN dia = 18 THEN codigo_dia end,', ') ELSE '-' END AS dia18, " +
                    "CASE WHEN STRING_AGG(CASE WHEN dia = 19 THEN codigo_dia end,', ') IS NOT NULL THEN STRING_AGG(CASE WHEN dia = 19 THEN codigo_dia end,', ') ELSE '-' END AS dia19, " +
                    "CASE WHEN STRING_AGG(CASE WHEN dia = 20 THEN codigo_dia end,', ') IS NOT NULL THEN STRING_AGG(CASE WHEN dia = 20 THEN codigo_dia end,', ') ELSE '-' END AS dia20, " +
                    "CASE WHEN STRING_AGG(CASE WHEN dia = 21 THEN codigo_dia end,', ') IS NOT NULL THEN STRING_AGG(CASE WHEN dia = 21 THEN codigo_dia end,', ') ELSE '-' END AS dia21, " +
                    "CASE WHEN STRING_AGG(CASE WHEN dia = 22 THEN codigo_dia end,', ') IS NOT NULL THEN STRING_AGG(CASE WHEN dia = 22 THEN codigo_dia end,', ') ELSE '-' END AS dia22, " +
                    "CASE WHEN STRING_AGG(CASE WHEN dia = 23 THEN codigo_dia end,', ') IS NOT NULL THEN STRING_AGG(CASE WHEN dia = 23 THEN codigo_dia end,', ') ELSE '-' END AS dia23, " +
                    "CASE WHEN STRING_AGG(CASE WHEN dia = 24 THEN codigo_dia end,', ') IS NOT NULL THEN STRING_AGG(CASE WHEN dia = 24 THEN codigo_dia end,', ') ELSE '-' END AS dia24, " +
                    "CASE WHEN STRING_AGG(CASE WHEN dia = 25 THEN codigo_dia end,', ') IS NOT NULL THEN STRING_AGG(CASE WHEN dia = 25 THEN codigo_dia end,', ') ELSE '-' END AS dia25, " +
                    "CASE WHEN STRING_AGG(CASE WHEN dia = 26 THEN codigo_dia end,', ') IS NOT NULL THEN STRING_AGG(CASE WHEN dia = 26 THEN codigo_dia end,', ') ELSE '-' END AS dia26, " +
                    "CASE WHEN STRING_AGG(CASE WHEN dia = 27 THEN codigo_dia end,', ') IS NOT NULL THEN STRING_AGG(CASE WHEN dia = 27 THEN codigo_dia end,', ') ELSE '-' END AS dia27, " +
                    "CASE WHEN STRING_AGG(CASE WHEN dia = 28 THEN codigo_dia end,', ') IS NOT NULL THEN STRING_AGG(CASE WHEN dia = 28 THEN codigo_dia end,', ') ELSE '-' END AS dia28, " +
                    "CASE WHEN STRING_AGG(CASE WHEN dia = 29 THEN codigo_dia end,', ') IS NOT NULL THEN STRING_AGG(CASE WHEN dia = 29 THEN codigo_dia end,', ') ELSE '-' END AS dia29, " +
                    "CASE WHEN STRING_AGG(CASE WHEN dia = 30 THEN codigo_dia end,', ') IS NOT NULL THEN STRING_AGG(CASE WHEN dia = 30 THEN codigo_dia end,', ') ELSE '-' END AS dia30, " +
                    "CASE WHEN STRING_AGG(CASE WHEN dia = 31 THEN codigo_dia end,', ') IS NOT NULL THEN STRING_AGG(CASE WHEN dia = 31 THEN codigo_dia end,', ') ELSE '-' END AS dia31 " +
                    "FROM ( " +
                    "SELECT p_g.id_empleado AS codigo_e, CONCAT(empleado.apellido, ' ', empleado.nombre) AS nombre_e, EXTRACT('year' FROM fecha_horario) AS anio, EXTRACT('month' FROM fecha_horario) AS mes, " +
                    "EXTRACT('day' FROM fecha_horario) AS dia, CASE WHEN tipo_dia = 'L' THEN tipo_dia ELSE horario.codigo END AS codigo_dia " +
                    "FROM eu_asistencia_general p_g " +
                    "INNER JOIN eu_empleados empleado ON empleado.id = p_g.id_empleado AND p_g.id_empleado IN ($1) " +
                    "INNER JOIN eh_cat_horarios horario ON horario.id = p_g.id_horario " +
                    "GROUP BY codigo_e, nombre_e, anio, mes, dia, codigo_dia, p_g.id_horario " +
                    "ORDER BY p_g.id_empleado,anio, mes , dia, p_g.id_horario " +
                    ") AS datos " +
                    "GROUP BY codigo_e, nombre_e, anio, mes " +
                    "ORDER BY 1,3,4", [codigo]);
                if (HORARIO.rowCount != 0) {
                    return res.jsonp(HORARIO.rows);
                }
                else {
                    return res.status(404).jsonp({ text: 'Registros no encontrados.' });
                }
            }
            catch (error) {
                console.log(error);
                return res.status(500).jsonp({ message: 'Contactese con el Administrador del sistema (593) 2 – 252-7663 o https://casapazmino.com.ec' });
            }
        });
    }
    ;
}
exports.EMPLEADO_CONTROLADOR = new EmpleadoControlador();
exports.default = exports.EMPLEADO_CONTROLADOR;
// METODO PARA VALIDAR NUMERO DE CEDULA ECUATORIANA   **USADO
function ValidarCedula(cedula) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        const result = yield database_1.default.query(`
      SELECT descripcion 
      FROM ep_detalle_parametro 
      WHERE id_parametro = 36 
      LIMIT 1
    `);
        const activarValidacion = ((_b = (_a = result.rows[0]) === null || _a === void 0 ? void 0 : _a.descripcion) === null || _b === void 0 ? void 0 : _b.toLowerCase().trim()) === 'si';
        if (!activarValidacion) {
            return true;
        }
        const cad = cedula.toString().trim();
        if (cad === "" || cad.length !== 10 || isNaN(Number(cad))) {
            return false;
        }
        let total = 0;
        for (let i = 0; i < 9; i++) {
            let num = parseInt(cad.charAt(i), 10);
            if (isNaN(num))
                return false;
            if (i % 2 === 0) {
                num *= 2;
                if (num > 9)
                    num -= 9;
            }
            total += num;
        }
        const verificador = parseInt(cad.charAt(9), 10);
        const resultado = total % 10 ? 10 - (total % 10) : 0;
        if (verificador === resultado) {
            return true;
        }
        else {
            return false;
        }
    });
}
// METODO QUE VALIDA LA FILA DE PLANTILLA DE REGISTRO DE USUARIO, SI ES QUE ESTA COMPLETA    **USADO 
function validarEmpleadoCompleto(data, regex, regexCorreo, valiContra, regexLatitud, regexLongitud, estadoCivilArray, tipogenero, TIPO_IDENTIFICACION, pool, TELEFONO, LONGITUD, LATITUD, ValidarCedula, modoCodigo) {
    return __awaiter(this, void 0, void 0, function* () {
        if (data.identificacion.toString().length != 0) {
            if (TIPO_IDENTIFICACION == 'Pasaporte') {
                if (data.identificacion.toString().length == 0 || data.identificacion.toString().length > 10) {
                    data.observacion = 'La identificación ingresada no es válida';
                    return;
                }
            }
            else {
                if (regex.test(data.identificacion)) {
                    const cedulaValida = yield ValidarCedula(data.identificacion);
                    if (data.identificacion.toString().length != 10 || !cedulaValida) {
                        data.observacion = 'La identificación ingresada no es válida';
                        return;
                    }
                }
                else {
                    data.observacion = 'La identificación ingresada no es válida';
                    return;
                }
            }
        }
        else {
            data.observacion = 'La identificación ingresada no es válida';
            return;
        }
        if (modoCodigo === 'manual') {
            if (!regex.test(data.codigo)) {
                data.observacion = 'Formato de código incorrecto';
                return;
            }
        }
        if (!valiContra.test(data.contrasena.toString())) {
            if (data.contrasena.toString().length <= 10) {
                if (data.correo == undefined || !regexCorreo.test(data.correo)) {
                    data.observacion = 'Verificar correo';
                    return;
                }
                if (luxon_1.DateTime.fromFormat(data.fec_nacimiento, 'yyyy-MM-dd').isValid) {
                    if (LONGITUD != undefined || LATITUD != undefined) {
                        if (!regexLatitud.test(data.latitud) || !regexLongitud.test(data.longitud)) {
                            data.observacion = 'Verificar ubicación';
                            return;
                        }
                    }
                    else if (LONGITUD == undefined || LATITUD == undefined) {
                        data.observacion = 'Verificar ubicación';
                        return;
                    }
                    if (TELEFONO != undefined) {
                        if (regex.test(data.telefono.toString())) {
                            if (data.telefono.toString().length > 10 || data.telefono.toString().length < 7) {
                                data.observacion = 'El teléfono ingresado no es válido';
                                return;
                            }
                        }
                        else {
                            data.observacion = 'El teléfono ingresado no es válido';
                            return;
                        }
                    }
                }
                else {
                    data.observacion = 'Formato de fecha incorrecto (YYYY-MM-DD)';
                    return;
                }
            }
            else {
                data.observacion = 'La contraseña debe tener máximo 10 caracteres';
                return;
            }
        }
        else {
            data.observacion = 'La contraseña ingresada no es válida';
            return;
        }
        data.identificacion = data.identificacion.trim();
        data.apellido = data.apellido.trim();
        data.nombre = data.nombre.trim();
        data.estado_civil = data.estado_civil.trim();
        data.genero = data.genero.trim();
        data.correo = data.correo.trim();
        data.fec_nacimiento = data.fec_nacimiento.trim();
        data.latitud = data.latitud.trim();
        data.longitud = data.longitud.trim();
        data.domicilio = data.domicilio.trim();
        data.telefono = data.telefono.trim();
        data.nacionalidad = data.nacionalidad.trim();
        data.usuario = data.usuario.trim();
        data.contrasena = data.contrasena.trim();
        data.rol = data.rol.trim();
        data.tipo_identificacion = data.tipo_identificacion.trim();
        data.numero_partida_individual = data.numero_partida_individual.trim();
        const VERIFICAR_CEDULA = yield pool.query(`SELECT * FROM eu_empleados WHERE identificacion = $1`, [data.identificacion]);
        if (VERIFICAR_CEDULA.rows[0] != undefined && VERIFICAR_CEDULA.rows[0] != '') {
            data.observacion = 'Identificación ya existe en el sistema';
            return;
        }
        if (modoCodigo === 'cedula') {
            const VERIFICAR_CODIGO = yield pool.query(`SELECT * FROM eu_empleados WHERE codigo = $1`, [data.identificacion]);
            if (VERIFICAR_CODIGO.rows[0] != undefined && VERIFICAR_CODIGO.rows[0] != '') {
                data.observacion = 'Código ya existe en el sistema';
                return;
            }
        }
        const VERIFICAR_USUARIO = yield pool.query(`SELECT * FROM eu_usuarios WHERE usuario = $1`, [data.usuario]);
        if (VERIFICAR_USUARIO.rows[0] != undefined && VERIFICAR_USUARIO.rows[0] != '') {
            data.observacion = 'Usuario ya existe en el sistema';
            return;
        }
        if (data.rol != 'No registrado') {
            const VERIFICAR_ROL = yield pool.query(`SELECT * FROM ero_cat_roles WHERE UPPER(nombre) = $1`, [data.rol.toUpperCase()]);
            if (VERIFICAR_ROL.rows[0] == undefined || VERIFICAR_ROL.rows[0] == '') {
                data.observacion = 'Rol no existe en el sistema';
                return;
            }
        }
        if (data.nacionalidad != 'No registrado') {
            const VERIFICAR_NACIONALIDAD = yield pool.query(`SELECT * FROM e_cat_nacionalidades WHERE UPPER(nombre) = $1`, [data.nacionalidad.toUpperCase()]);
            if (VERIFICAR_NACIONALIDAD.rows[0] == undefined || VERIFICAR_NACIONALIDAD.rows[0] == '') {
                data.observacion = 'Nacionalidad no existe en el sistema';
                return;
            }
        }
        if (data.estado_civil != 'No registrado') {
            const VERIFICAR_ESTADO_CIVIL = yield pool.query(`SELECT * FROM e_estado_civil WHERE UPPER(estado_civil) = $1`, [data.estado_civil.toUpperCase()]);
            if (VERIFICAR_ESTADO_CIVIL.rows[0] == undefined || VERIFICAR_ESTADO_CIVIL.rows[0] == '') {
                data.observacion = 'Estado civil no existe en el sistema';
                return;
            }
        }
        if (data.genero != 'No registrado') {
            const VERIFICAR_GENERO = yield pool.query(`SELECT * FROM e_genero WHERE UPPER(genero) = $1`, [data.genero.toUpperCase()]);
            if (VERIFICAR_GENERO.rows[0] == undefined || VERIFICAR_GENERO.rows[0] == '') {
                data.observacion = 'Género no existe en el sistema';
                return;
            }
        }
        data.observacion = 'no registrado';
    });
}
// METODO QUE VALIDA LA FILA DE PLANTILLA DE REGISTRO DE USUARIO, SI ES QUE ESTA INCOMPLETA   **USADO
function validarEmpleadoIncompleto(data, ITEM, IDENTIFICACION, APELLIDO, NOMBRE, ESTADO_CIVIL, GENERO, CORREO, FECHA_NACIMIENTO, LATITUD, LONGITUD, DOMICILIO, TELEFONO, NACIONALIDAD, USUARIO, CONTRASENA, ROL, TIPO_IDENTIFICACION, NUMERO_PARTIDA_INDIVIDUAL, regex, regexCorreo, valiContra, regexLatitud, regexLongitud, estadoCivilArray, tipogenero, pool, ValidarCedula, modoCodigo) {
    return __awaiter(this, void 0, void 0, function* () {
        data.fila = ITEM;
        data.identificacion = IDENTIFICACION;
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
        data.tipo_identificacion = TIPO_IDENTIFICACION;
        data.numero_partida_individual = NUMERO_PARTIDA_INDIVIDUAL;
        data.observacion = 'no registrado';
        let hayDatosFaltantes = false;
        if (data.fila == '' || data.fila == undefined) {
            data.fila = 'error';
            hayDatosFaltantes = true;
        }
        if (APELLIDO == undefined) {
            data.apellido = 'No registrado';
            data.observacion = 'Apellido no registrado';
            hayDatosFaltantes = true;
        }
        if (NOMBRE == undefined) {
            data.nombre = 'No registrado';
            data.observacion = 'Nombre no registrado';
            hayDatosFaltantes = true;
        }
        if (modoCodigo === 'manual' && (data.codigo == undefined || data.codigo == '')) {
            data.codigo = 'No registrado';
            data.observacion = 'Código no registrado';
            hayDatosFaltantes = true;
        }
        if (ESTADO_CIVIL == undefined) {
            data.estado_civil = 'No registrado';
            data.observacion = 'Estado civil no registrado';
            hayDatosFaltantes = true;
        }
        if (GENERO == undefined) {
            data.genero = 'No registrado';
            data.observacion = 'Género no registrado';
            hayDatosFaltantes = true;
        }
        if (CORREO == undefined) {
            data.correo = 'No registrado';
            data.observacion = 'Correo no registrado';
            hayDatosFaltantes = true;
        }
        if (FECHA_NACIMIENTO == undefined) {
            data.fec_nacimiento = 'No registrado';
            data.observacion = 'Fecha de nacimiento no registrado';
            hayDatosFaltantes = true;
        }
        if (DOMICILIO == undefined) {
            data.domicilio = 'No registrado';
            if (!data.observacion || data.observacion.trim() === '') {
                data.observacion = " ";
            }
        }
        if (TELEFONO == undefined) {
            data.telefono = 'No registrado';
            if (!data.observacion || data.observacion.trim() === '') {
                data.observacion = " ";
            }
        }
        if ((!LATITUD || LATITUD === undefined) && (!LONGITUD || LONGITUD === undefined)) {
            data.latitud = 'No registrado';
            data.longitud = 'No registrado';
            data.observacion = " ";
            hayDatosFaltantes = true;
        }
        else {
            if (!LATITUD || LATITUD === undefined) {
                data.latitud = 'No registrado';
                data.observacion = 'Verificar ubicación';
            }
            if (!LONGITUD || LONGITUD === undefined) {
                data.longitud = 'No registrado';
                data.observacion = 'Verificar ubicación';
            }
        }
        if (NACIONALIDAD == undefined) {
            data.nacionalidad = 'No registrado';
            data.observacion = 'Nacionalidad no registrado';
            hayDatosFaltantes = true;
        }
        if (USUARIO == undefined) {
            data.usuario = 'No registrado';
            data.observacion = 'Usuario no registrado';
            hayDatosFaltantes = true;
        }
        if (CONTRASENA == undefined) {
            data.contrasena = 'No registrado';
            data.observacion = 'Contraseña no registrada';
            hayDatosFaltantes = true;
        }
        if (ROL == undefined) {
            data.rol = 'No registrado';
            data.observacion = 'Rol no registrado';
            hayDatosFaltantes = true;
        }
        if (IDENTIFICACION == undefined) {
            data.identificacion = 'No registrado';
            data.observacion = 'Identificación no registrada';
            hayDatosFaltantes = true;
        }
        if (TIPO_IDENTIFICACION == undefined) {
            data.tipo_identificacion = 'No registrado';
            data.observacion = 'Tipo identificación no registrado';
            hayDatosFaltantes = true;
        }
        if (!hayDatosFaltantes) {
            data.identificacion = data.identificacion.trim();
            data.apellido = data.apellido.trim();
            data.nombre = data.nombre.trim();
            data.estado_civil = data.estado_civil.trim();
            data.genero = data.genero.trim();
            data.correo = data.correo.trim();
            data.fec_nacimiento = data.fec_nacimiento.trim();
            data.latitud = data.latitud.trim();
            data.longitud = data.longitud.trim();
            data.domicilio = data.domicilio.trim();
            data.telefono = data.telefono.trim();
            data.nacionalidad = data.nacionalidad.trim();
            data.usuario = data.usuario.trim();
            data.contrasena = data.contrasena.trim();
            data.rol = data.rol.trim();
            if (modoCodigo === 'manual') {
                if (!regex.test(data.codigo)) {
                    data.observacion = 'Formato de código incorrecto';
                    return;
                }
            }
            if (TIPO_IDENTIFICACION == 'Pasaporte') {
                if (data.identificacion.toString().length == 0 || data.identificacion.toString().length > 10) {
                    data.observacion = 'La identificación ingresada no es válida';
                }
                else {
                    if (data.apellido != 'No registrado' && data.nombre != 'No registrado') {
                        if (data.contrasena != 'No registrado') {
                            if (!valiContra.test(data.contrasena.toString())) {
                                if (data.contrasena.toString().length <= 10) {
                                    if (data.estado_civil != 'No registrado') {
                                        if (estadoCivilArray.includes(data.estado_civil.toUpperCase())) {
                                            if (data.genero != 'No registrado') {
                                                if (tipogenero.includes(data.genero.toUpperCase())) {
                                                    if (data.correo == undefined || !regexCorreo.test(data.correo)) {
                                                        data.observacion = 'Verificar correo';
                                                    }
                                                    if (data.fec_nacimiento != 'No registrado') {
                                                        if (luxon_1.DateTime.fromFormat(data.fec_nacimiento, 'yyyy-MM-dd').isValid) {
                                                            if (LONGITUD != undefined && LATITUD != undefined) {
                                                                if (!regexLatitud.test(data.latitud) || !regexLongitud.test(data.longitud)) {
                                                                    data.observacion = 'Verificar ubicación';
                                                                }
                                                            }
                                                            else if (LONGITUD == undefined || LATITUD == undefined) {
                                                                data.observacion = 'Verificar ubicación';
                                                            }
                                                            if (TELEFONO != undefined) {
                                                                if (regex.test(data.telefono.toString())) {
                                                                    if (data.telefono.toString().length > 10 || data.telefono.toString().length < 7) {
                                                                        data.observacion = 'El teléfono ingresado no es válido';
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
                if (regex.test(data.identificacion)) {
                    const cedulaValida = yield ValidarCedula(data.identificacion);
                    if (data.identificacion.toString().length != 10 || !cedulaValida) {
                        data.observacion = 'La identificación ingresada no es válida';
                    }
                    else {
                        if (data.apellido != 'No registrado' && data.nombre != 'No registrado') {
                            if (data.contrasena != 'No registrado') {
                                if (!valiContra.test(data.contrasena.toString())) {
                                    if (data.contrasena.toString().length <= 10) {
                                        if (data.estado_civil != 'No registrado') {
                                            if (estadoCivilArray.includes(data.estado_civil.toUpperCase())) {
                                                if (data.genero != 'No registrado') {
                                                    if (tipogenero.includes(data.genero.toUpperCase())) {
                                                        if (data.correo == undefined || !regexCorreo.test(data.correo)) {
                                                            data.observacion = 'Verificar correo';
                                                        }
                                                        if (data.fec_nacimiento != 'No registrado') {
                                                            if (luxon_1.DateTime.fromFormat(data.fec_nacimiento, 'yyyy-MM-dd').isValid) {
                                                                if (LONGITUD != undefined && LATITUD != undefined) {
                                                                    if (!regexLatitud.test(data.latitud) || !regexLongitud.test(data.longitud)) {
                                                                        data.observacion = 'Verificar ubicación';
                                                                    }
                                                                }
                                                                else if (LONGITUD == undefined || LATITUD == undefined) {
                                                                    data.observacion = 'Verificar ubicación';
                                                                }
                                                                if (TELEFONO != undefined) {
                                                                    if (regex.test(data.telefono.toString())) {
                                                                        if (data.telefono.toString().length > 10 || data.telefono.toString().length < 7) {
                                                                            data.observacion = 'El teléfono ingresado no es válido';
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
                    data.observacion = 'La identificación ingresada no es válida';
                }
            }
        }
        const VERIFICAR_CEDULA = yield pool.query(`SELECT * FROM eu_empleados WHERE identificacion = $1`, [data.identificacion]);
        if (VERIFICAR_CEDULA.rows[0] != undefined && VERIFICAR_CEDULA.rows[0] != '') {
            data.observacion = 'Identificación ya existe en el sistema';
            return;
        }
        if (modoCodigo === 'cedula') {
            const VERIFICAR_CODIGO = yield pool.query(`SELECT * FROM eu_empleados WHERE codigo = $1`, [data.identificacion]);
            if (VERIFICAR_CODIGO.rows[0] != undefined && VERIFICAR_CODIGO.rows[0] != '') {
                data.observacion = 'Código ya existe en el sistema';
                return;
            }
        }
        const VERIFICAR_USUARIO = yield pool.query(`SELECT * FROM eu_usuarios WHERE usuario = $1`, [data.usuario]);
        if (VERIFICAR_USUARIO.rows[0] != undefined && VERIFICAR_USUARIO.rows[0] != '') {
            data.observacion = 'Usuario ya existe en el sistema';
            return;
        }
        if (data.rol != 'No registrado') {
            const VERIFICAR_ROL = yield pool.query(`SELECT * FROM ero_cat_roles WHERE UPPER(nombre) = $1`, [data.rol.toUpperCase()]);
            if (VERIFICAR_ROL.rows[0] == undefined || VERIFICAR_ROL.rows[0] == '') {
                data.observacion = 'Rol no existe en el sistema';
                return;
            }
        }
        if (data.nacionalidad != 'No registrado') {
            const VERIFICAR_NACIONALIDAD = yield pool.query(`SELECT * FROM e_cat_nacionalidades WHERE UPPER(nombre) = $1`, [data.nacionalidad.toUpperCase()]);
            if (VERIFICAR_NACIONALIDAD.rows[0] == undefined || VERIFICAR_NACIONALIDAD.rows[0] == '') {
                data.observacion = 'Nacionalidad no existe en el sistema';
                return;
            }
        }
        if (data.estado_civil != 'No registrado') {
            const VERIFICAR_ESTADO_CIVIL = yield pool.query(`SELECT * FROM e_estado_civil WHERE UPPER(estado_civil) = $1`, [data.estado_civil.toUpperCase()]);
            if (VERIFICAR_ESTADO_CIVIL.rows[0] == undefined || VERIFICAR_ESTADO_CIVIL.rows[0] == '') {
                data.observacion = 'Estado civil no existe en el sistema';
                return;
            }
        }
        if (data.genero != 'No registrado') {
            const VERIFICAR_GENERO = yield pool.query(`SELECT * FROM e_genero WHERE UPPER(genero) = $1`, [data.genero.toUpperCase()]);
            if (VERIFICAR_GENERO.rows[0] == undefined || VERIFICAR_GENERO.rows[0] == '') {
                data.observacion = 'Género no existe en el sistema';
                return;
            }
        }
    });
}
