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
const accesoCarpetas_1 = require("../../../libs/accesoCarpetas");
const auditoriaControlador_1 = __importDefault(require("../../reportes/auditoriaControlador"));
const accesoCarpetas_2 = require("../../../libs/accesoCarpetas");
const ImagenCodificacion_1 = require("../../../libs/ImagenCodificacion");
const settingsMail_1 = require("../../../libs/settingsMail");
const ts_md5_1 = require("ts-md5");
const exceljs_1 = __importDefault(require("exceljs"));
const database_1 = __importDefault(require("../../../database"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const luxon_1 = require("luxon");
const sharp = require('sharp');
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
    // METODO PARA ACTUALIZAR CODIGO DE EMPLEADO   **USADO
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
    // INGRESAR REGISTRO DE EMPLEADO EN BASE DE DATOS    **USADO
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
    // ACTUALIZAR INFORMACION EL EMPLEADO    **USADO
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
    // LISTAR EMPLEADOS ACTIVOS EN EL SISTEMA    **USADO
    Listar(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const empleado = yield database_1.default.query(`
      SELECT * FROM eu_empleados WHERE estado = 1 ORDER BY id
      `);
            console.log('empleado', empleado.rowCount);
            return res.jsonp(empleado.rows);
        });
    }
    // METODO QUE LISTA EMPLEADOS INHABILITADOS   **USADO
    ListarEmpleadosDesactivados(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const empleado = yield database_1.default.query(`
      SELECT * FROM eu_empleados WHERE estado = 2 ORDER BY id
      `);
            console.log('empleado desactivado', empleado.rowCount);
            res.jsonp(empleado.rows);
        });
    }
    // METODO PARA INHABILITAR USUARIOS EN EL SISTEMA   **USADO
    DesactivarMultiplesEmpleados(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { arrayIdsEmpleados, user_name, ip } = req.body;
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
                        yield database_1.default.query(`UPDATE eu_empleados SET estado = 2 WHERE id = $1`, [obj]);
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
                        yield database_1.default.query(`UPDATE eu_usuarios SET estado = false, app_habilita = false WHERE id_empleado = $1`, [obj]);
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
            const { arrayIdsEmpleados, user_name, ip } = req.body;
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
            `, [obj]);
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
            `, [obj]);
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
                        console.log('error activar', error);
                    }
                }
                return res.jsonp({ message: 'Usuarios habilitados exitosamente.' });
            }
            return res.jsonp({ message: 'Upss!!! ocurrio un error.' });
        });
    }
    // METODO PARA HABILITAR TODA LA INFORMACION DEL EMPLEADO    **USADO VERIFICAR FUNCIONAMIENTO
    ReactivarMultiplesEmpleados(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { arrayIdsEmpleados, user_name, ip } = req.body;
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
            `, [obj]);
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
            `, [obj]);
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
                }
                return res.jsonp({ message: 'Usuarios habilitados exitosamente.' });
            }
            return res.jsonp({ message: 'Upps!!! ocurrio un error.' });
        });
    }
    // CARGAR IMAGEN DE EMPLEADO   **USADO
    CrearImagenEmpleado(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            sharp.cache(false);
            try {
                // FECHA DEL SISTEMA
                const fecha = luxon_1.DateTime.now();
                const anio = fecha.toFormat('yyyy');
                const mes = fecha.toFormat('MM');
                const dia = fecha.toFormat('dd');
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
    // METODO PARA TOMAR DATOS DE LA UBICACION DEL DOMICILIO DEL EMPLEADO   **USADO
    GeolocalizacionCrokis(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let id = req.params.id;
            let { lat, lng, user_name, ip } = req.body;
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
    // INGRESAR TITULO PROFESIONAL DEL EMPLEADO   **USADO
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
    // ACTUALIZAR TITULO PROFESIONAL DEL EMPLEADO   **USADO
    EditarTituloEmpleado(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = req.params.id_empleado_titulo;
                const { observacion, id_titulo, user_name, ip } = req.body;
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
    // METODO PARA ELIMINAR TITULO PROFESIONAL DEL EMPLEADO   **USADO
    EliminarTituloEmpleado(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { user_name, ip } = req.body;
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
    // METODO PARA ELIMINAR REGISTROS    **USADO
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
                        ip,
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
    // METODO PARA VERIFICAR PLANTILLA CODIGO AUTOMATICO    **USADO
    VerificarPlantilla_Automatica(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const documento = (_a = req.file) === null || _a === void 0 ? void 0 : _a.originalname;
                let separador = path_1.default.sep;
                let ruta = (0, accesoCarpetas_2.ObtenerRutaLeerPlantillas)() + separador + documento;
                const workbook = new exceljs_1.default.Workbook();
                yield workbook.xlsx.readFile(ruta);
                let verificador = (0, accesoCarpetas_1.ObtenerIndicePlantilla)(workbook, 'EMPLEADOS');
                if (verificador === false) {
                    return res.jsonp({ message: 'no_existe', data: undefined });
                }
                else {
                    const sheet_name_list = workbook.worksheets.map(sheet => sheet.name);
                    const plantilla = workbook.getWorksheet(sheet_name_list[verificador]);
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
                        if (!headers['ITEM'] || !headers['CEDULA'] || !headers['APELLIDO'] ||
                            !headers['NOMBRE'] || !headers['USUARIO'] || !headers['CONTRASENA'] ||
                            !headers['ROL'] || !headers['ESTADO_CIVIL'] || !headers['GENERO'] ||
                            !headers['CORREO'] || !headers['FECHA_NACIMIENTO'] || !headers['LATITUD'] ||
                            !headers['DOMICILIO'] || !headers['TELEFONO'] ||
                            !headers['LONGITUD'] || !headers['NACIONALIDAD']) {
                            return res.jsonp({ message: 'Cabeceras faltantes', data: undefined });
                        }
                        plantilla.eachRow((row, rowNumber) => {
                            // SALTAR LA FILA DE LAS CABECERAS
                            if (rowNumber === 1)
                                return;
                            // LEER LOS DATOS SEGUN LAS COLUMNAS ENCONTRADAS
                            const ITEM = row.getCell(headers['ITEM']).value;
                            const CEDULA = row.getCell(headers['CEDULA']).value;
                            const APELLIDO = row.getCell(headers['APELLIDO']).value;
                            const NOMBRE = row.getCell(headers['NOMBRE']).value;
                            const USUARIO = row.getCell(headers['USUARIO']).value;
                            const CONTRASENA = row.getCell(headers['CONTRASENA']).value;
                            const ROL = row.getCell(headers['ROL']).value;
                            const ESTADO_CIVIL = row.getCell(headers['ESTADO_CIVIL']).value;
                            const GENERO = row.getCell(headers['GENERO']).value;
                            const CORREO = row.getCell(headers['CORREO']).value;
                            const FECHA_NACIMIENTO = row.getCell(headers['FECHA_NACIMIENTO']).value;
                            const LATITUD = row.getCell(headers['LATITUD']).value;
                            const LONGITUD = row.getCell(headers['LONGITUD']).value;
                            const DOMICILIO = row.getCell(headers['DOMICILIO']).value;
                            const TELEFONO = row.getCell(headers['TELEFONO']).value;
                            const NACIONALIDAD = row.getCell(headers['NACIONALIDAD']).value;
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
                                            if (data.contrasena.toString().length <= 10) {
                                                if (estadoCivilArray.includes(data.estado_civil)) {
                                                    if (tipogenero.includes(data.genero.toLowerCase())) {
                                                        // VERIFICAR SI LA VARIABLE TIENE EL FORMATO DE FECHA CORRECTO
                                                        if (luxon_1.DateTime.fromFormat(data.fec_nacimiento, 'yyyy-MM-dd').isValid) {
                                                            // VALIDA SI LOS DATOS DE LAS COLUMNAS LONGITUD Y LATITUD SON CORRECTAS.
                                                            if (LONGITUD != undefined || LATITUD != undefined) {
                                                                if (!regexLatitud.test(data.latitud) || !regexLongitud.test(data.longitud)) {
                                                                    data.observacion = 'Verificar ubicación';
                                                                }
                                                            }
                                                            else if (LONGITUD == undefined || LATITUD == undefined) {
                                                                data.observacion = 'Verificar ubicación';
                                                            }
                                                            // VALIDA SI LOS DATOS DE LA COLUMNA TELEFONO SON NUMEROS
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
                                    data.observacion = 'Apellido no registrado';
                                }
                                if (NOMBRE == undefined) {
                                    data.nombre = 'No registrado';
                                    data.observacion = 'Nombre no registrado';
                                }
                                if (ESTADO_CIVIL == undefined) {
                                    data.estado_civil = 'No registrado';
                                    data.observacion = 'Estado civil no registrado';
                                }
                                if (GENERO == undefined) {
                                    data.genero = 'No registrado';
                                    data.observacion = 'Género no registrado';
                                }
                                if (CORREO == undefined) {
                                    data.correo = 'No registrado';
                                    data.observacion = 'Correo no registrado';
                                }
                                if (FECHA_NACIMIENTO == undefined) {
                                    data.fec_nacimiento = 'No registrado';
                                    data.observacion = 'Fecha de nacimiento no registrado';
                                }
                                if (LATITUD == undefined) {
                                    data.latitud = 'No registrado';
                                    data.observacion = 'Latitud no registrado';
                                }
                                if (LONGITUD == undefined) {
                                    data.longitud = 'No registrado';
                                    data.observacion = 'Longitud no registrado';
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
                                    data.observacion = 'Nacionalidad no registrado';
                                }
                                if (USUARIO == undefined) {
                                    data.usuario = 'No registrado';
                                    data.observacion = 'Usuario no registrado';
                                }
                                if (CONTRASENA == undefined) {
                                    data.contrasena = 'No registrado';
                                    data.observacion = 'Contraseña no registrada';
                                }
                                if (ROL == undefined) {
                                    data.rol = 'No registrado';
                                    data.observacion = 'Rol no registrado';
                                }
                                if (CEDULA == undefined) {
                                    data.cedula = 'No registrado';
                                    data.observacion = 'Cédula no registrado';
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
                                                                            // VERIFICAR SI LA VARIABLE TIENE EL FORMATO DE FECHA CORRECTO
                                                                            if (data.fec_nacimiento != 'No registrado') {
                                                                                if (luxon_1.DateTime.fromFormat(data.fec_nacimiento, 'yyyy-MM-dd').isValid) {
                                                                                    // VALIDA SI LOS DATOS DE LAS COLUMNAS LONGITUD Y LATITUD SON CORRECTAS.
                                                                                    if (LONGITUD != undefined && LATITUD != undefined) {
                                                                                        if (!regexLatitud.test(data.latitud) || !regexLongitud.test(data.longitud)) {
                                                                                            data.observacion = 'Verificar ubicación';
                                                                                        }
                                                                                    }
                                                                                    else if (LONGITUD == undefined || LATITUD == undefined) {
                                                                                        data.observacion = 'Verificar ubicación';
                                                                                    }
                                                                                    // VALIDA SI LOS DATOS DE LA COLUMNA TELEFONO SON NUMEROS.
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
                                        data.observacion = 'La cédula ingresada no es válida';
                                    }
                                }
                                listEmpleados.push(data);
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
                        return res.jsonp({ message: mensaje, data: listEmpleados });
                    }, tiempo);
                }
            }
            catch (error) {
                return res.status(500).jsonp({ message: error });
            }
        });
    }
    // METODO PARA REGISTRAR DATOS DE PLANTILLA CODIGO AUTOMATICO   **USADO
    CargarPlantilla_Automatico(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const { plantilla, user_name, ip } = req.body;
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
                    else if (estado_civil.toUpperCase() === 'CASADO/A') {
                        id_estado_civil = 2;
                    }
                    else if (estado_civil.toUpperCase() === 'VIUDO/A') {
                        id_estado_civil = 3;
                    }
                    else if (estado_civil.toUpperCase() === 'DIVORCIADO/A') {
                        id_estado_civil = 4;
                    }
                    else if (estado_civil.toUpperCase() === 'UNION DE HECHO') {
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
                    console.log('Estado civil: ', id_estado_civil);
                    // REGISTRO DE NUEVO EMPLEADO
                    const response = yield database_1.default.query(`
          INSERT INTO eu_empleados (cedula, apellido, nombre, estado_civil, genero, correo,
            fecha_nacimiento, estado, domicilio, telefono, id_nacionalidad, codigo, longitud, latitud) 
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING *
          `, [cedula, apellidoE, nombreE,
                        id_estado_civil, id_genero, correo, fec_nacimiento, id_estado,
                        _domicilio, _telefono, id_nacionalidad.rows[0]['id'], codigo, _longitud, _latitud]);
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
    // METODOS PARA VERIFICAR PLANTILLA CON CODIGO INGRESADO DE FORMA MANUAL    **USADO
    VerificarPlantilla_Manual(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const documento = (_a = req.file) === null || _a === void 0 ? void 0 : _a.originalname;
                let separador = path_1.default.sep;
                let ruta = (0, accesoCarpetas_2.ObtenerRutaLeerPlantillas)() + separador + documento;
                const workbook = new exceljs_1.default.Workbook();
                yield workbook.xlsx.readFile(ruta);
                let verificador = (0, accesoCarpetas_1.ObtenerIndicePlantilla)(workbook, 'EMPLEADOS');
                if (verificador === false) {
                    return res.jsonp({ message: 'no_existe', data: undefined });
                }
                else {
                    const sheet_name_list = workbook.worksheets.map(sheet => sheet.name);
                    const plantilla = workbook.getWorksheet(sheet_name_list[verificador]);
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
                    const estadoCivilArray = ['Soltero/a', 'Casado/a', 'Viudo/a', 'Divorciado/a', 'Union de Hecho'];
                    const tipogenero = ['masculino', 'femenino'];
                    // VALIDA SI LOS DATOS DE LA COLUMNA CEDULA SON NUMEROS.
                    const regex = /^[0-9]+$/;
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
                        if (!headers['ITEM'] || !headers['CODIGO'] || !headers['CEDULA'] ||
                            !headers['APELLIDO'] || !headers['NOMBRE'] || !headers['USUARIO'] ||
                            !headers['CONTRASENA'] || !headers['ROL'] || !headers['ESTADO_CIVIL'] ||
                            !headers['GENERO'] || !headers['CORREO'] || !headers['FECHA_NACIMIENTO'] ||
                            !headers['LATITUD'] || !headers['LONGITUD'] || !headers['DOMICILIO'] ||
                            !headers['TELEFONO'] || !headers['NACIONALIDAD']) {
                            return res.jsonp({ message: 'Cabeceras faltantes', data: undefined });
                        }
                        plantilla.eachRow((row, rowNumber) => {
                            // SALTAR LA FILA DE LAS CABECERAS
                            if (rowNumber === 1)
                                return;
                            // LEER LOS DATOS SEGUN LAS COLUMNAS ENCONTRADAS
                            const ITEM = row.getCell(headers['ITEM']).value;
                            const CODIGO = row.getCell(headers['CODIGO']).value;
                            const CEDULA = row.getCell(headers['CEDULA']).value;
                            const APELLIDO = row.getCell(headers['APELLIDO']).value;
                            const NOMBRE = row.getCell(headers['NOMBRE']).value;
                            const USUARIO = row.getCell(headers['USUARIO']).value;
                            const CONTRASENA = row.getCell(headers['CONTRASENA']).value;
                            const ROL = row.getCell(headers['ROL']).value;
                            const ESTADO_CIVIL = row.getCell(headers['ESTADO_CIVIL']).value;
                            const GENERO = row.getCell(headers['GENERO']).value;
                            const CORREO = row.getCell(headers['CORREO']).value;
                            const FECHA_NACIMIENTO = row.getCell(headers['FECHA_NACIMIENTO']).value;
                            const LATITUD = row.getCell(headers['LATITUD']).value;
                            const LONGITUD = row.getCell(headers['LONGITUD']).value;
                            const DOMICILIO = row.getCell(headers['DOMICILIO']).value;
                            const TELEFONO = row.getCell(headers['TELEFONO']).value;
                            const NACIONALIDAD = row.getCell(headers['NACIONALIDAD']).value;
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
                                                if (!valiContra.test(data.contrasena.toString())) {
                                                    if (data.contrasena.toString().length > 10) {
                                                        data.observacion = 'La contraseña debe tener máximo 10 caracteres';
                                                    }
                                                    else {
                                                        if (estadoCivilArray.includes(data.estado_civil)) {
                                                            if (tipogenero.includes(data.genero.toLowerCase())) {
                                                                // VERIFICAR SI LA VARIABLE TIENE EL FORMATO DE FECHA CORRECTO
                                                                if (luxon_1.DateTime.fromFormat(data.fec_nacimiento, 'yyyy-MM-dd').isValid) {
                                                                    // VALIDA SI LOS DATOS DE LAS COLUMNAS LONGITUD Y LATITUD SON CORRECTAS.
                                                                    if (LONGITUD != undefined || LATITUD != undefined) {
                                                                        if (!regexLatitud.test(data.latitud) || !regexLongitud.test(data.longitud)) {
                                                                            data.observacion = 'Verificar ubicación';
                                                                        }
                                                                    }
                                                                    else if (LONGITUD == undefined || LATITUD == undefined) {
                                                                        data.observacion = 'Verificar ubicación';
                                                                    }
                                                                    // VALIDA SI LOS DATOS DE LA COLUMNA TELEFONO SON NUMEROS.
                                                                    if (TELEFONO != undefined) {
                                                                        if (regex.test(data.telefono)) {
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
                                    data.observacion = 'Apellido no registrado';
                                }
                                if (NOMBRE == undefined) {
                                    data.nombre = 'No registrado';
                                    data.observacion = 'Nombre no registrado';
                                }
                                if (CODIGO == undefined) {
                                    data.codigo = 'No registrado';
                                    data.observacion = 'Código no registrado';
                                }
                                if (ESTADO_CIVIL == undefined) {
                                    data.estado_civil = 'No registrado';
                                    data.observacion = 'Estado civil no registrado';
                                }
                                if (GENERO == undefined) {
                                    data.genero = 'No registrado';
                                    data.observacion = 'Género no registrado';
                                }
                                if (CORREO == undefined) {
                                    data.correo = 'No registrado';
                                    data.observacion = 'Correo no registrado';
                                }
                                if (FECHA_NACIMIENTO == undefined) {
                                    data.fec_nacimiento = 'No registrado';
                                    data.observacion = 'Fecha de nacimiento no registrado';
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
                                    data.observacion = 'Nacionalidad no registrado';
                                }
                                if (USUARIO == undefined) {
                                    data.usuario = 'No registrado';
                                    data.observacion = 'Usuario no registrado';
                                }
                                if (CONTRASENA == undefined) {
                                    data.contrasena = 'No registrado';
                                    data.observacion = 'Contraseña no registrada';
                                }
                                if (ROL == undefined) {
                                    data.rol = 'No registrado';
                                    data.observacion = 'Rol no registrado';
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
                                                                            // VERIFICAR SI LA VARIABLE TIENE EL FORMATO DE FECHA CORRECTO 
                                                                            if (data.fec_nacimiento != 'No registrado') {
                                                                                if (luxon_1.DateTime.fromFormat(data.fec_nacimiento, 'yyyy-MM-dd').isValid) {
                                                                                    // VALIDA SI LOS DATOS DE LAS COLUMNAS LONGITUD Y LATITUD SON CORRECTAS.
                                                                                    if (LONGITUD != undefined && LATITUD != undefined) {
                                                                                        if (!regexLatitud.test(data.latitud) || !regexLongitud.test(data.longitud)) {
                                                                                            data.observacion = 'Verificar ubicación';
                                                                                        }
                                                                                    }
                                                                                    else if (LONGITUD == undefined || LATITUD == undefined) {
                                                                                        data.observacion = 'Verificar ubicación';
                                                                                    }
                                                                                    // VALIDA SI LOS DATOS DE LA COLUMNA TELEFONO SON NUMEROS.
                                                                                    if (TELEFONO != undefined) {
                                                                                        const regex = /^[0-9]+$/;
                                                                                        if (regex.test(data.telefono)) {
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
                    listEmpleadosManual.forEach((valor) => __awaiter(this, void 0, void 0, function* () {
                        if (valor.observacion == 'no registrado' || valor.observacion == ' ') {
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
    // METODO PARA REGISTRAR DATOS DE LA PLANTILLA CODIGO MANUAL   **USADO
    CargarPlantilla_Manual(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { plantilla, user_name, ip } = req.body;
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
                    // OBTENER ID DEL ESTADO_CIVIL
                    var id_estado_civil = 0;
                    if (estado_civil.toUpperCase() === 'SOLTERO/A') {
                        id_estado_civil = 1;
                    }
                    else if (estado_civil.toUpperCase() === 'CASADO/A') {
                        id_estado_civil = 2;
                    }
                    else if (estado_civil.toUpperCase() === 'VIUDO/A') {
                        id_estado_civil = 3;
                    }
                    else if (estado_civil.toUpperCase() === 'DIVORCIADO/A') {
                        id_estado_civil = 4;
                    }
                    else if (estado_civil.toUpperCase() === 'UNION DE HECHO') {
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
                    const id_nacionalidad = yield database_1.default.query(`
          SELECT * FROM e_cat_nacionalidades WHERE UPPER(nombre) = $1
          `, [nacionalidad.toUpperCase()]);
                    // OBTENER ID DEL ROL
                    const id_rol = yield database_1.default.query(`
          SELECT * FROM ero_cat_roles WHERE UPPER(nombre) = $1
          `, [rol.toUpperCase()]);
                    console.log('Estado civil manual: ', id_estado_civil);
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
                        _domicilio, _telefono, id_nacionalidad.rows[0]['id'], codigo, _longitud, _latitud]);
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
    // METODO PARA CREAR CARPETAS DE ALMACENAMIENTO    **USADO
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
    //------------------------------ Metodos de APP MOVIL -----------------------------------------------------------------------------
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
                const response = yield database_1.default.query('SELECT id, cedula, codigo,  (nombre || \' \' || apellido) as fullname, name_cargo as cargo, name_suc as sucursal, name_dep as departamento, name_regimen as regimen  FROM informacion_general ORDER BY fullname ASC');
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
    /** **************************************************************************************** **
    ** **              OPTIENE LA INFORMACION DE CONTRATOS Y CARGOS POR EMPLEADO                **
    ** **************************************************************************************** **/
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
}
exports.EMPLEADO_CONTROLADOR = new EmpleadoControlador();
exports.default = exports.EMPLEADO_CONTROLADOR;
