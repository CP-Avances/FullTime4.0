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
const fs_1 = require("fs");
const accesoCarpetas_2 = require("../../../libs/accesoCarpetas");
const ts_md5_1 = require("ts-md5");
const auditoriaControlador_1 = __importDefault(require("../../auditoria/auditoriaControlador"));
const database_1 = __importDefault(require("../../../database"));
const moment_1 = __importDefault(require("moment"));
const xlsx_1 = __importDefault(require("xlsx"));
const path_1 = __importDefault(require("path"));
const fs_2 = __importDefault(require("fs"));
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
            if (VALOR.rowCount > 0) {
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
                yield database_1.default.query(`
        INSERT INTO e_codigo (id, valor, automatico, manual) VALUES ($1, $2, $3, $4)
        `, [id, valor, automatico, manual]);
                // AUDITORIA
                yield auditoriaControlador_1.default.InsertarAuditoria({
                    tabla: 'e_codigo',
                    usuario: user_name,
                    accion: 'I',
                    datosOriginales: '',
                    datosNuevos: `{id: ${id}, valor: ${valor}, automatico: ${automatico}, manual: ${manual}}`,
                    ip,
                    observacion: null
                });
                // FINALIZAR TRANSACCION
                yield database_1.default.query('COMMIT');
                res.jsonp({ message: 'Registro guardado.' });
            }
            catch (error) {
                console.log('error ---- ', error);
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
                if (VALOR.rowCount > 0) {
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
                console.log('***** ', req.body);
                // INICIAR TRANSACCION
                yield database_1.default.query('BEGIN');
                // CONSULTAR DATOSORIGINALES
                const codigo = yield database_1.default.query('SELECT * FROM e_codigo WHERE id = $1', [id]);
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
                yield database_1.default.query(`
        UPDATE e_codigo SET valor = $1, automatico = $2, manual = $3 , cedula = $4 WHERE id = $5
        `, [valor, automatico, manual, cedula, id]);
                // AUDITORIA
                yield auditoriaControlador_1.default.InsertarAuditoria({
                    tabla: 'e_codigo',
                    usuario: user_name,
                    accion: 'U',
                    datosOriginales: JSON.stringify(datosOriginales),
                    datosNuevos: `{valor: ${valor}, automatico: ${automatico}, manual: ${manual}, cedula: ${cedula}}`,
                    ip,
                    observacion: null
                });
                //FINALIZAR TRANSACCION
                yield database_1.default.query('COMMIT');
                return res.jsonp({ message: 'Registro actualizado.' });
            }
            catch (error) {
                console.log('error ---- ', error);
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
                const codigo = yield database_1.default.query('SELECT * FROM e_codigo WHERE id = $1', [id]);
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
                yield database_1.default.query(`
        UPDATE e_codigo SET valor = $1 WHERE id = $2
        `, [valor, id]);
                // AUDITORIA
                yield auditoriaControlador_1.default.InsertarAuditoria({
                    tabla: 'e_codigo',
                    usuario: user_name,
                    accion: 'U',
                    datosOriginales: JSON.stringify(datosOriginales),
                    datosNuevos: `{valor: ${valor}}`,
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
                    let verificar = 0;
                    // RUTA DE LA CARPETA PRINCIPAL PERMISOS
                    const carpetaPermisos = yield (0, accesoCarpetas_1.ObtenerRutaPermisos)(codigo);
                    // METODO MKDIR PARA CREAR LA CARPETA
                    fs_2.default.mkdir(carpetaPermisos, { recursive: true }, (err) => {
                        if (err) {
                            verificar = 1;
                        }
                        else {
                            verificar = 0;
                        }
                    });
                    // RUTA DE LA CARPETA PRINCIPAL IMAGENES
                    const carpetaImagenes = yield (0, accesoCarpetas_1.ObtenerRutaUsuario)(empleado.id);
                    // METODO MKDIR PARA CREAR LA CARPETA
                    fs_2.default.mkdir(carpetaImagenes, { recursive: true }, (err) => {
                        if (err) {
                            verificar = 1;
                        }
                        else {
                            verificar = 0;
                        }
                    });
                    // RUTA DE LA CARPETA DE ALMACENAMIENTO DE VACUNAS
                    const carpetaVacunas = yield (0, accesoCarpetas_1.ObtenerRutaVacuna)(empleado.id);
                    // METODO MKDIR PARA CREAR LA CARPETA
                    fs_2.default.mkdir(carpetaVacunas, { recursive: true }, (err) => {
                        if (err) {
                            verificar = 1;
                        }
                        else {
                            verificar = 0;
                        }
                    });
                    // RUTA DE LA CARPETA DE ALMACENAMIENTO DE CONTRATOS
                    const carpetaContratos = yield (0, accesoCarpetas_1.ObtenerRutaContrato)(empleado.id);
                    // METODO MKDIR PARA CREAR LA CARPETA
                    fs_2.default.mkdir(carpetaContratos, { recursive: true }, (err) => {
                        if (err) {
                            verificar = 1;
                        }
                        else {
                            verificar = 0;
                        }
                    });
                    // METODO DE VERIFICACION DE CREACION DE DIRECTORIOS
                    if (verificar === 1) {
                        console.error('Error al crear las carpetas.');
                    }
                    else {
                        return res.status(200).jsonp(empleado);
                    }
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
                const empleado = yield database_1.default.query('SELECT * FROM eu_empleados WHERE id = $1', [id]);
                const [datosOriginales] = empleado.rows;
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
                yield database_1.default.query(`
        UPDATE eu_empleados SET cedula = $2, apellido = $3, nombre = $4, estado_civil = $5, 
          genero = $6, correo = $7, fecha_nacimiento = $8, estado = $9, domicilio = $10, 
          telefono = $11, id_nacionalidad = $12, codigo = $13 
        WHERE id = $1 
        `, [id, cedula, apellido, nombre, esta_civil, genero, correo, fec_nacimiento, estado,
                    domicilio, telefono, id_nacionalidad, codigo]);
                // AUDITORIA
                yield auditoriaControlador_1.default.InsertarAuditoria({
                    tabla: 'eu_empleados',
                    usuario: user_name,
                    accion: 'U',
                    datosOriginales: JSON.stringify(datosOriginales),
                    datosNuevos: `{cedula: ${cedula}, apellido: ${apellido}, nombre: ${nombre}, estado_civil: ${esta_civil}, genero: ${genero}, correo: ${correo}, fecha_nacimiento: ${fec_nacimiento}, estado: ${estado}, domicilio: ${domicilio}, telefono: ${telefono}, id_nacionalidad: ${id_nacionalidad}, codigo: ${codigo}}`,
                    ip,
                    observacion: null
                });
                // FINALIZAR TRANSACCION
                yield database_1.default.query('COMMIT');
                let verificar_permisos = 0;
                // RUTA DE LA CARPETA PERMISOS DEL USUARIO
                const carpetaPermisos = yield (0, accesoCarpetas_1.ObtenerRutaPermisos)(codigo);
                // VERIFICACION DE EXISTENCIA CARPETA PERMISOS DE USUARIO
                fs_2.default.access(carpetaPermisos, fs_2.default.constants.F_OK, (err) => {
                    if (err) {
                        // METODO MKDIR PARA CREAR LA CARPETA
                        fs_2.default.mkdir(carpetaPermisos, { recursive: true }, (err) => {
                            if (err) {
                                verificar_permisos = 1;
                            }
                            else {
                                verificar_permisos = 0;
                            }
                        });
                    }
                    else {
                        verificar_permisos = 0;
                    }
                });
                let verificar_imagen = 0;
                // RUTA DE LA CARPETA IMAGENES DEL USUARIO
                const carpetaImagenes = yield (0, accesoCarpetas_1.ObtenerRutaUsuario)(id);
                // VERIFICACION DE EXISTENCIA CARPETA IMAGENES DE USUARIO
                fs_2.default.access(carpetaImagenes, fs_2.default.constants.F_OK, (err) => {
                    if (err) {
                        // METODO MKDIR PARA CREAR LA CARPETA
                        fs_2.default.mkdir(carpetaImagenes, { recursive: true }, (err) => {
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
                let verificar_vacunas = 0;
                // RUTA DE LA CARPETA VACUNAS DEL USUARIO
                const carpetaVacunas = yield (0, accesoCarpetas_1.ObtenerRutaVacuna)(id);
                // VERIFICACION DE EXISTENCIA CARPETA PERMISOS DE USUARIO
                fs_2.default.access(carpetaVacunas, fs_2.default.constants.F_OK, (err) => {
                    if (err) {
                        // METODO MKDIR PARA CREAR LA CARPETA
                        fs_2.default.mkdir(carpetaVacunas, { recursive: true }, (err) => {
                            if (err) {
                                verificar_vacunas = 1;
                            }
                            else {
                                verificar_vacunas = 0;
                            }
                        });
                    }
                    else {
                        verificar_vacunas = 0;
                    }
                });
                let verificar_contrato = 0;
                // RUTA DE LA CARPETA CONTRATOS DEL USUARIO
                const carpetaContratos = yield (0, accesoCarpetas_1.ObtenerRutaContrato)(id);
                // VERIFICACION DE EXISTENCIA CARPETA CONTRATOS DE USUARIO
                fs_2.default.access(carpetaContratos, fs_2.default.constants.F_OK, (err) => {
                    if (err) {
                        // METODO MKDIR PARA CREAR LA CARPETA
                        fs_2.default.mkdir(carpetaContratos, { recursive: true }, (err) => {
                            if (err) {
                                verificar_contrato = 1;
                            }
                            else {
                                verificar_contrato = 0;
                            }
                        });
                    }
                    else {
                        verificar_contrato = 0;
                    }
                });
                // METODO DE VERIFICACION DE CREACION DE DIRECTORIOS
                if (verificar_permisos === 1 && verificar_imagen === 1 && verificar_vacunas === 1 && verificar_contrato === 1) {
                    res.jsonp({ message: 'Ups!!! no fue posible crear el directorio de contratos, permisos, imagenes y vacunación del usuario.' });
                }
                else if (verificar_permisos === 1 && verificar_imagen === 0 && verificar_vacunas === 0 && verificar_contrato === 0) {
                    res.jsonp({ message: 'Ups!!! no fue posible crear el directorio de permisos del usuario.' });
                }
                else if (verificar_permisos === 0 && verificar_imagen === 1 && verificar_vacunas === 0 && verificar_contrato === 0) {
                    res.jsonp({ message: 'Ups!!! no fue posible crear el directorio de imagenes del usuario.' });
                }
                else if (verificar_permisos === 0 && verificar_imagen === 0 && verificar_vacunas === 1 && verificar_contrato === 0) {
                    res.jsonp({ message: 'Ups!!! no fue posible crear el directorio de vacunación del usuario.' });
                }
                else if (verificar_permisos === 0 && verificar_imagen === 0 && verificar_vacunas === 1 && verificar_contrato === 1) {
                    res.jsonp({ message: 'Ups!!! no fue posible crear el directorio de contratos del usuario.' });
                }
                else {
                    res.jsonp({ message: 'Registro actualizado.' });
                }
            }
            catch (error) {
                console.log('error ', error);
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
            if (EMPLEADO.rowCount > 0) {
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
                        const empleado = yield database_1.default.query('SELECT * FROM eu_empleados WHERE id = $1', [obj]);
                        const [datosOriginales] = empleado.rows;
                        const usuario = yield database_1.default.query('SELECT * FROM eu_usuarios WHERE id_empleado = $1', [obj]);
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
                        // AUDITORIA
                        yield auditoriaControlador_1.default.InsertarAuditoria({
                            tabla: 'eu_empleados',
                            usuario: user_name,
                            accion: 'U',
                            datosOriginales: JSON.stringify(datosOriginales),
                            datosNuevos: `{estado: 2}`,
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
                        const empleado = yield database_1.default.query('SELECT * FROM eu_empleados WHERE id = $1', [obj]);
                        const [datosOriginales] = empleado.rows;
                        const usuario = yield database_1.default.query('SELECT * FROM eu_usuarios WHERE id_empleado = $1', [obj]);
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
                        const empleado = yield database_1.default.query('SELECT * FROM eu_empleados WHERE id = $1', [obj]);
                        const [datosOriginales] = empleado.rows;
                        const usuario = yield database_1.default.query('SELECT * FROM eu_usuarios WHERE id_empleado = $1', [obj]);
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
            // FECHA DEL SISTEMA
            const fecha = (0, moment_1.default)();
            const anio = fecha.format('YYYY');
            const mes = fecha.format('MM');
            const dia = fecha.format('DD');
            const id = req.params.id_empleado;
            const separador = path_1.default.sep;
            const { user_name, ip } = req.body;
            const unEmpleado = yield database_1.default.query('SELECT * FROM eu_empleados WHERE id = $1', [id]);
            if (unEmpleado.rowCount > 0) {
                const promises = unEmpleado.rows.map((obj) => __awaiter(this, void 0, void 0, function* () {
                    var _a;
                    try {
                        const imagen = `${obj.codigo}_${anio}_${mes}_${dia}_${(_a = req.file) === null || _a === void 0 ? void 0 : _a.originalname}`;
                        console.log("imagen ", imagen);
                        if (obj.imagen && obj.imagen !== 'null') {
                            console.log("a ver si imprime obj.id ", obj.id);
                            console.log("a ver si imprime obj.imagen ", obj.imagen);
                            const ruta = (yield (0, accesoCarpetas_1.ObtenerRutaUsuario)(obj.id)) + separador + obj.imagen;
                            fs_2.default.access(ruta, fs_2.default.constants.F_OK, (err) => {
                                if (!err) {
                                    fs_2.default.unlinkSync(ruta);
                                }
                            });
                        }
                        else {
                            console.log("prueba 3");
                        }
                        // INICIAR TRANSACCION
                        yield database_1.default.query('BEGIN');
                        // CONSULTAR DATOSORIGINALES
                        const empleado = yield database_1.default.query('SELECT * FROM eu_empleados WHERE id = $1', [id]);
                        const [datosOriginales] = empleado.rows;
                        if (!datosOriginales) {
                            yield auditoriaControlador_1.default.InsertarAuditoria({
                                tabla: 'eu_empleados',
                                usuario: user_name,
                                accion: 'U',
                                datosOriginales: '',
                                datosNuevos: '',
                                ip,
                                observacion: `Error al actualizar imagen de empleado con id: ${id}. Registro no encontrado.`
                            });
                            // FINALIZAR TRANSACCION
                            yield database_1.default.query('COMMIT');
                            throw new Error('Error al actualizar imagen de empleado con id: ' + id);
                        }
                        yield database_1.default.query('UPDATE eu_empleados SET imagen = $2 WHERE id = $1', [id, imagen]);
                        // AUDITORIA
                        yield auditoriaControlador_1.default.InsertarAuditoria({
                            tabla: 'eu_empleados',
                            usuario: user_name,
                            accion: 'U',
                            datosOriginales: JSON.stringify(datosOriginales),
                            datosNuevos: `{imagen: ${imagen}}`,
                            ip,
                            observacion: null
                        });
                        // FINALIZAR TRANSACCION
                        yield database_1.default.query('COMMIT');
                    }
                    catch (error) {
                        // REVERTIR TRANSACCION
                        yield database_1.default.query('ROLLBACK');
                        res.status(500).jsonp({ message: 'Error al actualizar imagen de empleado.' });
                    }
                }));
                yield Promise.all(promises);
                res.jsonp({ message: 'Imagen actualizada.' });
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
                const empleado = yield database_1.default.query('SELECT * FROM empleados WHERE id = $1', [id]);
                const [datosOriginales] = empleado.rows;
                if (!datosOriginales) {
                    yield auditoriaControlador_1.default.InsertarAuditoria({
                        tabla: 'empleados',
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
                yield database_1.default.query(`
        UPDATE eu_empleados SET latitud = $1, longitud = $2 WHERE id = $3
        `, [lat, lng, id])
                    .then((result) => { });
                // AUDITORIA
                yield auditoriaControlador_1.default.InsertarAuditoria({
                    tabla: 'empleados',
                    usuario: user_name,
                    accion: 'U',
                    datosOriginales: JSON.stringify(datosOriginales),
                    datosNuevos: `{latitud: ${lat}, longitud: ${lng}}`,
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
            if (unEmpleadoTitulo.rowCount > 0) {
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
            if (unEmpleadoTitulo.rowCount > 0) {
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
                yield database_1.default.query(`
        INSERT INTO eu_empleado_titulos (observacion, id_empleado, id_titulo) VALUES ($1, $2, $3)
        `, [observacion, id_empleado, id_titulo]);
                // AUDITORIA
                yield auditoriaControlador_1.default.InsertarAuditoria({
                    tabla: 'eu_empleado_titulos',
                    usuario: user_name,
                    accion: 'I',
                    datosOriginales: '',
                    datosNuevos: `{observacion: ${observacion}, id_empleado: ${id_empleado}, id_titulo: ${id_titulo}}`,
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
                yield database_1.default.query(`
        UPDATE eu_empleado_titulos SET observacion = $1, id_titulo = $2 WHERE id = $3
        `, [observacion, id_titulo, id]);
                // AUDITORIA
                yield auditoriaControlador_1.default.InsertarAuditoria({
                    tabla: 'eu_empleado_titulos',
                    usuario: user_name,
                    accion: 'U',
                    datosOriginales: JSON.stringify(datosOriginales),
                    datosNuevos: `{observacion: ${observacion}, id_titulo: ${id_titulo}}`,
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
            if (UBICACION.rowCount > 0) {
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
            if (EMPLEADO.rowCount > 0) {
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
            fs_2.default.access(ruta, fs_2.default.constants.F_OK, (err) => {
                if (err) {
                }
                else {
                    res.sendFile(path_1.default.resolve(ruta));
                }
            });
        });
    }
    getImagenBase64(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const imagen = req.params.imagen;
            const id = req.params.id;
            let separador = path_1.default.sep;
            let ruta = (yield (0, accesoCarpetas_1.ObtenerRutaUsuario)(id)) + separador + imagen;
            fs_2.default.access(ruta, fs_2.default.constants.F_OK, (err) => {
                if (err) {
                    res.status(200).jsonp({ imagen: 0 });
                }
                else {
                    let path_file = path_1.default.resolve(ruta);
                    let data = fs_2.default.readFileSync(path_file);
                    let codificado = data.toString('base64');
                    if (codificado === null) {
                        res.status(200).jsonp({ imagen: 0 });
                    }
                    else {
                        res.status(200).jsonp({ imagen: codificado });
                    }
                }
            });
        });
    }
    // BUSQUEDA INFORMACIÓN DEPARTAMENTOS EMPLEADO
    ObtenerDepartamentoEmpleado(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id_emple, id_cargo } = req.body;
            const DEPARTAMENTO = yield database_1.default.query(`
      SELECT * FROM VistaDepartamentoEmpleado WHERE id_emple = $1 AND
      id_cargo = $2
      `, [id_emple, id_cargo]);
            if (DEPARTAMENTO.rowCount > 0) {
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
            try {
                const id = req.params.id;
                const { user_name, ip } = req.body;
                // INICIAR TRANSACCION
                yield database_1.default.query('BEGIN');
                // CONSULTAR DATOSORIGINALES
                const empleado = yield database_1.default.query('SELECT * FROM eu_empleados WHERE id = $1', [id]);
                const [datosOriginales] = empleado.rows;
                if (!datosOriginales) {
                    yield auditoriaControlador_1.default.InsertarAuditoria({
                        tabla: 'eu_empleados',
                        usuario: user_name,
                        accion: 'D',
                        datosOriginales: '',
                        datosNuevos: '',
                        ip,
                        observacion: `Error al eliminar empleado con id: ${id}. Registro no encontrado.`
                    });
                    // FINALIZAR TRANSACCION
                    yield database_1.default.query('COMMIT');
                    return res.status(404).jsonp({ message: 'Error al eliminar empleado.' });
                }
                yield database_1.default.query(`
        DELETE FROM eu_empleados WHERE id = $1
        `, [id]);
                // AUDITORIA
                yield auditoriaControlador_1.default.InsertarAuditoria({
                    tabla: 'eu_empleados',
                    usuario: user_name,
                    accion: 'D',
                    datosOriginales: JSON.stringify(datosOriginales),
                    datosNuevos: '',
                    ip,
                    observacion: null
                });
                // FINALIZAR TRANSACCION
                yield database_1.default.query('COMMIT');
                res.jsonp({ message: 'Registro eliminado.' });
            }
            catch (error) {
                // REVERTIR TRANSACCION
                yield database_1.default.query('ROLLBACK');
                return res.jsonp({ message: 'error' });
            }
        });
    }
    /** **************************************************************************************** **
     ** **                      CARGAR INFORMACIÓN MEDIANTE PLANTILLA                            **
     ** **************************************************************************************** **/
    VerificarPlantilla_Automatica(req, res) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const documento = (_a = req.file) === null || _a === void 0 ? void 0 : _a.originalname;
            let separador = path_1.default.sep;
            let ruta = (0, accesoCarpetas_2.ObtenerRutaLeerPlantillas)() + separador + documento;
            const workbook = xlsx_1.default.readFile(ruta);
            const sheet_name_list = workbook.SheetNames;
            const plantilla = xlsx_1.default.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);
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
            var listEmpleados = [];
            var duplicados = [];
            var duplicados1 = [];
            var duplicados2 = [];
            var mensaje = 'correcto';
            plantilla.forEach((dato, indice, array) => __awaiter(this, void 0, void 0, function* () {
                // Datos que se leen de la plantilla ingresada
                var { item, cedula, apellido, nombre, estado_civil, genero, correo, fec_nacimiento, latitud, longitud, domicilio, telefono, nacionalidad, usuario, contrasena, rol } = dato;
                //Verificar que el registo no tenga datos vacios
                if ((item != undefined && item != '') &&
                    (cedula != undefined) && (apellido != undefined) &&
                    (nombre != undefined) && (estado_civil != undefined) &&
                    (genero != undefined) && (correo != undefined) &&
                    (fec_nacimiento != undefined) &&
                    (latitud != undefined) && (longitud != undefined) &&
                    (domicilio != undefined) && (telefono != undefined) &&
                    (nacionalidad != undefined) && (usuario != undefined) &&
                    (contrasena != undefined) && (rol != undefined)) {
                    data.fila = item;
                    data.cedula = cedula;
                    data.nombre = nombre;
                    data.apellido = apellido;
                    data.usuario = usuario;
                    data.contrasena = contrasena;
                    data.rol = rol;
                    data.estado_civil = estado_civil;
                    data.genero = genero;
                    data.correo = correo;
                    data.fec_nacimiento = fec_nacimiento;
                    data.latitud = latitud;
                    data.longitud = longitud;
                    data.domicilio = domicilio;
                    data.telefono = telefono;
                    data.nacionalidad = nacionalidad;
                    //Valida si los datos de la columna cedula son numeros.
                    const regex = /^[0-9]+$/;
                    const valiContra = /\s/;
                    if (regex.test(data.cedula)) {
                        if (data.cedula.toString().length != 10) {
                            data.observacion = 'La cédula ingresada no es válida';
                        }
                        else {
                            if (!valiContra.test(data.contrasena.toString())) {
                                data.observacion = 'La contraseña ingresada no es válida';
                            }
                            else {
                                console.log('entro ', data.contraseña.length);
                                if (data.contraseña.toString().length < 10) {
                                    // Verificar si la variable tiene el formato de fecha correcto con moment
                                    if ((0, moment_1.default)(fec_nacimiento, 'YYYY-MM-DD', true).isValid()) {
                                        //Valida si los datos de la columna telefono son numeros.
                                        if (telefono != undefined) {
                                            if (regex.test(data.telefono)) {
                                                if (data.telefono.toString().length > 10 || data.telefono.toString().length < 7) {
                                                    data.observacion = 'El teléfono ingresada no es válido';
                                                }
                                                else {
                                                    if (duplicados.find((p) => p.cedula === dato.cedula || p.usuario === dato.usuario) == undefined) {
                                                        data.observacion = 'ok';
                                                        duplicados.push(dato);
                                                    }
                                                }
                                            }
                                            else {
                                                data.observacion = 'El teléfono ingresada no es válido';
                                            }
                                        }
                                    }
                                    else {
                                        data.observacion = 'Formato de fecha incorrecto (YYYY-MM-DD)';
                                    }
                                }
                                else {
                                    data.observacion = 'La contraseña debe ser maximo de 10 caracteres';
                                }
                            }
                        }
                    }
                    else {
                        data.observacion = 'La cédula ingresada no es válida';
                    }
                    listEmpleados.push(data);
                }
                else {
                    data.fila = item;
                    data.cedula = cedula;
                    data.nombre = nombre;
                    data.apellido = apellido;
                    data.usuario = usuario;
                    data.contrasena = contrasena;
                    data.rol = rol;
                    data.estado_civil = estado_civil;
                    data.genero = genero;
                    data.correo = correo;
                    data.fec_nacimiento = fec_nacimiento;
                    data.latitud = latitud;
                    data.longitud = longitud;
                    data.domicilio = domicilio;
                    data.telefono = telefono;
                    data.nacionalidad = nacionalidad;
                    data.observacion = 'no registrado';
                    if (data.fila == '' || data.fila == undefined) {
                        data.fila = 'error';
                        mensaje = 'error';
                    }
                    if (apellido == undefined) {
                        data.apellido = 'No registrado';
                        data.observacion = 'Apellido ' + data.observacion;
                    }
                    if (nombre == undefined) {
                        data.nombre = 'No registrado';
                        data.observacion = 'Nombre ' + data.observacion;
                    }
                    if (estado_civil == undefined) {
                        data.estado_civil = 'No registrado';
                        data.observacion = 'Estado civil ' + data.observacion;
                    }
                    if (genero == undefined) {
                        data.genero = 'No registrado';
                        data.observacion = 'Género ' + data.observacion;
                    }
                    if (correo == undefined) {
                        data.correo = 'No registrado';
                        data.observacion = 'Correo ' + data.observacion;
                    }
                    if (fec_nacimiento == undefined) {
                        data.fec_nacimiento = 'No registrado';
                        data.observacion = 'Fecha de nacimiento ' + data.observacion;
                    }
                    if (latitud == undefined) {
                        data.latitud = 'No registrado';
                    }
                    if (longitud == undefined) {
                        data.longitud = 'No registrado';
                    }
                    if (domicilio == undefined) {
                        data.domicilio = 'No registrado';
                        data.observacion = 'Domicilio ' + data.observacion;
                    }
                    if (telefono == undefined) {
                        data.telefono = 'No registrado';
                        data.observacion = 'Teléfono ' + data.observacion;
                    }
                    if (nacionalidad == undefined) {
                        data.nacionalidad = 'No registrado';
                        data.observacion = 'Nacionalidad ' + data.observacion;
                    }
                    if (usuario == undefined) {
                        data.usuario = 'No registrado';
                        data.observacion = 'Usuario ' + data.observacion;
                    }
                    if (contrasena == undefined) {
                        data.contrasena = 'No registrado';
                        data.observacion = 'Contraseña ' + data.observacion;
                    }
                    if (rol == undefined) {
                        data.rol = 'No registrado';
                        data.observacion = 'Rol ' + data.observacion;
                    }
                    if (cedula == undefined) {
                        data.cedula = 'No registrado';
                        data.observacion = 'Cédula ' + data.observacion;
                    }
                    else {
                        //Valida si los datos de la columna cedula son numeros.
                        const rege = /^[0-9]+$/;
                        const valiContra = /\s/;
                        if (rege.test(data.cedula)) {
                            if (data.cedula.toString().length != 10) {
                                data.observacion = 'La cédula ingresada no es válida';
                            }
                            else {
                                if (data.contrasena != 'No registrado') {
                                    if (!valiContra.test(data.contrasena.toString())) {
                                        data.observacion = 'La contraseña ingresada no es válida';
                                    }
                                    else {
                                        console.log('entro ', data.contraseña.length);
                                        if (data.contraseña.toString().length < 10) {
                                            // Verificar si la variable tiene el formato de fecha correcto con moment
                                            if (data.fec_nacimiento != 'No registrado') {
                                                if ((0, moment_1.default)(fec_nacimiento, 'YYYY-MM-DD', true).isValid()) { }
                                                else {
                                                    data.observacion = 'Formato de fecha incorrecto (YYYY-MM-DD)';
                                                }
                                            }
                                            else {
                                                //Valida si los datos de la columna telefono son numeros.
                                                if (telefono != undefined) {
                                                    const regex = /^[0-9]+$/;
                                                    if (regex.test(telefono)) {
                                                        if (data.telefono.toString().length > 10 || data.telefono.toString().length < 7) {
                                                            data.observacion = 'El teléfono ingresado no es válido';
                                                        }
                                                    }
                                                    else {
                                                        data.observacion = 'El teléfono ingresado no es válido';
                                                    }
                                                }
                                            }
                                        }
                                        else {
                                            data.observacion = 'La contraseña debe ser maximo de 10 caracteres';
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
            fs_2.default.access(ruta, fs_2.default.constants.F_OK, (err) => {
                if (err) {
                }
                else {
                    // ELIMINAR DEL SERVIDOR
                    fs_2.default.unlinkSync(ruta);
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
                                        // Discriminación de elementos iguales
                                        if (duplicados1.find((p) => p.cedula === valor.cedula) == undefined) {
                                            // Discriminación de elementos iguales
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
            setTimeout(() => {
                listEmpleados.sort((a, b) => {
                    // Compara los números de los objetos
                    if (a.fila < b.fila) {
                        return -1;
                    }
                    if (a.fila > b.fila) {
                        return 1;
                    }
                    return 0; // Son iguales
                });
                var filaDuplicada = 0;
                listEmpleados.forEach((item) => {
                    if (item.observacion == '1') {
                        item.observacion = 'Registro duplicado (cédula)';
                    }
                    else if (item.observacion == '2') {
                        item.observacion = 'Registro duplicado (usuario)';
                    }
                    if (item.observacion != undefined) {
                        let arrayObservacion = item.observacion.split(" ");
                        if (arrayObservacion[0] == 'no') {
                            item.observacion = 'ok';
                        }
                    }
                    else {
                        item.observacion = 'Datos no registrado';
                    }
                    //Valida si los datos de la columna N son numeros.
                    if (typeof item.fila === 'number' && !isNaN(item.fila)) {
                        //Condicion para validar si en la numeracion existe un numero que se repite dara error.
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
            }, 1500);
        });
    }
    VerificarPlantilla_DatosAutomatico(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let list = req.files;
            let separador = path_1.default.sep;
            let ruta = (0, accesoCarpetas_2.ObtenerRutaLeerPlantillas)() + separador + list;
            //const workbook = excel.readFile(filePath);
            const workbook = xlsx_1.default.readFile(ruta);
            const sheet_name_list = workbook.SheetNames;
            const plantilla = xlsx_1.default.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);
            console.log('plantilla1: ', plantilla);
        });
    }
    CargarPlantilla_Automatico(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { plantilla, user_name, ip } = req.body;
            const VALOR = yield database_1.default.query('SELECT * FROM codigo');
            var codigo_dato = VALOR.rows[0].valor;
            var codigo = 0;
            if (codigo_dato != null && codigo_dato != undefined && codigo_dato != '') {
                codigo = codigo_dato = parseInt(codigo_dato);
            }
            var contador = 1;
            plantilla.forEach((data) => __awaiter(this, void 0, void 0, function* () {
                var _a;
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
                        _longitud = longitud;
                    }
                    var _latitud = null;
                    if (latitud != 'No registrado') {
                        _latitud = latitud;
                    }
                    //OBTENER ID DEL ESTADO
                    var id_estado = 1;
                    var estado_user = true;
                    var app_habilita = false;
                    //OBTENER ID DE LA NACIONALIDAD
                    const id_nacionalidad = yield database_1.default.query('SELECT * FROM e_cat_nacionalidades WHERE UPPER(nombre) = $1', [nacionalidad.toUpperCase()]);
                    //OBTENER ID DEL ROL
                    const id_rol = yield database_1.default.query(`
          SELECT * FROM ero_cat_roles WHERE UPPER(nombre) = $1
          `, [rol.toUpperCase()]);
                    if (codigo_dato != null && codigo_dato != undefined && codigo_dato != '') {
                        // INCREMENTAR EL VALOR DEL CÓDIGO
                        codigo = codigo + 1;
                    }
                    else {
                        codigo = cedula;
                    }
                    var fec_nacimi = new Date((0, moment_1.default)(fec_nacimiento).format('YYYY-MM-DD'));
                    console.log('codigo: ', codigo);
                    console.log('cedula: ', cedula, ' usuario: ', usuario, ' contrasena: ', contrasena);
                    console.log('nombre: ', nombreE, ' usuario: ', apellidoE, ' fecha nacimien: ', fec_nacimi, ' estado civil: ', id_estado_civil);
                    console.log('genero: ', id_genero, ' estado: ', id_estado, ' nacionalidad: ', id_nacionalidad.rows, ' rol: ', id_rol);
                    console.log('longitud: ', _longitud, ' latitud: ', _latitud);
                    // REGISTRO DE NUEVO EMPLEADO
                    yield database_1.default.query(`
          INSERT INTO eu_empleados (cedula, apellido, nombre, estado_civil, genero, correo,
            fecha_nacimiento, estado, domicilio, telefono, id_nacionalidad, codigo, longitud, latitud) 
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
          `, [cedula, apellidoE, nombreE,
                        id_estado_civil, id_genero, correo, fec_nacimiento, id_estado,
                        domicilio, telefono, id_nacionalidad.rows[0]['id'], codigo, _longitud, _latitud]);
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
                    const oneEmpley = yield database_1.default.query('SELECT id FROM eu_empleados WHERE cedula = $1', [cedula]);
                    const id_empleado = oneEmpley.rows[0].id;
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
                        // ACTUALIZACIÓN DEL CÓDIGO
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
                    }
                    // FINALIZAR TRANSACCION
                    yield database_1.default.query('COMMIT');
                    contador = contador + 1;
                    contrasena = undefined;
                }
                catch (error) {
                    // REVERTIR TRANSACCION
                    yield database_1.default.query('ROLLBACK');
                    return res.status(500).jsonp({ message: error });
                }
            }));
            setTimeout(() => {
                return res.jsonp({ message: 'correcto' });
            }, 1500);
        });
    }
    /** METODOS PARA VERIFICAR PLANTILLA CON CÓDIGO INGRESADO DE FORMA MANUAL */
    VerificarPlantilla_Manual(req, res) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const documento = (_a = req.file) === null || _a === void 0 ? void 0 : _a.originalname;
            let separador = path_1.default.sep;
            let ruta = (0, accesoCarpetas_2.ObtenerRutaLeerPlantillas)() + separador + documento;
            const workbook = xlsx_1.default.readFile(ruta);
            const sheet_name_list = workbook.SheetNames;
            const plantilla = xlsx_1.default.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);
            let listEmpleadosManual = [];
            let duplicados = [];
            let duplicados1 = [];
            let duplicados2 = [];
            let duplicados3 = [];
            let mensaje = 'correcto';
            plantilla.forEach((dato) => {
                let { item, cedula, apellido, nombre, codigo, estado_civil, genero, correo, fec_nacimiento, latitud, longitud, domicilio, telefono, nacionalidad, usuario, contrasena, rol } = dato;
                let observacion = 'ok';
                if (!item || !cedula || !apellido || !nombre || !codigo || !estado_civil || !genero ||
                    !correo || !fec_nacimiento || !latitud || !longitud || !domicilio || !telefono ||
                    !nacionalidad || !usuario || !contrasena || !rol) {
                    observacion = 'Datos incompletos';
                }
                const rege = /^[0-9]+$/;
                const valiContra = /\s/;
                if (rege.test(cedula) && cedula.toString().length === 10) {
                    if (rege.test(codigo)) {
                        if (!valiContra.test(contrasena) && contrasena.length <= 10) {
                            if ((0, moment_1.default)(fec_nacimiento, 'YYYY-MM-DD', true).isValid()) {
                                if (telefono === undefined || (rege.test(telefono) && telefono.toString().length >= 7 && telefono.toString().length <= 10)) {
                                    if (!duplicados.find((p) => p.cedula === cedula || p.usuario === usuario)) {
                                        duplicados.push(dato);
                                    }
                                    else {
                                        observacion = 'Registro duplicado';
                                    }
                                }
                                else {
                                    observacion = 'El teléfono ingresado no es válido';
                                }
                            }
                            else {
                                observacion = 'Formato de fecha incorrecto (YYYY-MM-DD)';
                            }
                        }
                        else {
                            observacion = 'La contraseña debe ser máxima de 10 caracteres y no contener espacios';
                        }
                    }
                    else {
                        observacion = 'Formato de código incorrecto';
                    }
                }
                else {
                    observacion = 'La cédula ingresada no es válida';
                }
                listEmpleadosManual.push({
                    fila: item, cedula, apellido, nombre, codigo, estado_civil, genero,
                    correo, fec_nacimiento, latitud, longitud, domicilio, telefono,
                    nacionalidad, usuario, contrasena, rol, observacion
                });
            });
            fs_2.default.access(ruta, fs_2.default.constants.F_OK, (err) => {
                if (!err) {
                    fs_2.default.unlinkSync(ruta);
                }
            });
            for (const valor of listEmpleadosManual) {
                const VERIFICAR_CEDULA = yield database_1.default.query(`SELECT * FROM eu_empleados WHERE cedula = $1`, [valor.cedula]);
                if (VERIFICAR_CEDULA.rows.length > 0) {
                    valor.observacion = 'Cédula ya existe en el sistema';
                }
                else {
                    const VERIFICAR_CODIGO = yield database_1.default.query(`SELECT * FROM eu_empleados WHERE codigo = $1`, [valor.codigo]);
                    if (VERIFICAR_CODIGO.rows.length > 0) {
                        valor.observacion = 'Código ya existe en el sistema';
                    }
                    else {
                        const VERIFICAR_USUARIO = yield database_1.default.query(`SELECT * FROM eu_usuarios WHERE usuario = $1`, [valor.usuario]);
                        if (VERIFICAR_USUARIO.rows.length > 0) {
                            valor.observacion = 'Usuario ya existe en el sistema';
                        }
                        else {
                            if (valor.rol !== 'No registrado') {
                                const VERIFICAR_ROL = yield database_1.default.query(`SELECT * FROM ero_cat_roles WHERE UPPER(nombre) = $1`, [valor.rol.toUpperCase()]);
                                if (VERIFICAR_ROL.rows.length === 0) {
                                    valor.observacion = 'Rol no existe en el sistema';
                                }
                                if (valor.nacionalidad !== 'No registrado') {
                                    const VERIFICAR_NACIONALIDAD = yield database_1.default.query(`SELECT * FROM e_cat_nacionalidades WHERE UPPER(nombre) = $1`, [valor.nacionalidad.toUpperCase()]);
                                    if (VERIFICAR_NACIONALIDAD.rows.length === 0) {
                                        valor.observacion = 'Nacionalidad no existe en el sistema';
                                    }
                                }
                            }
                        }
                    }
                }
                if (valor.observacion === 'ok') {
                    if (duplicados1.find((p) => p.cedula === valor.cedula) !== undefined) {
                        valor.observacion = 'Registro duplicado (cédula)';
                    }
                    else {
                        duplicados1.push(valor);
                    }
                    if (duplicados2.find((p) => p.usuario === valor.usuario) !== undefined) {
                        valor.observacion = 'Registro duplicado (usuario)';
                    }
                    else {
                        duplicados2.push(valor);
                    }
                    if (duplicados3.find((p) => p.codigo === valor.codigo) !== undefined) {
                        valor.observacion = 'Registro duplicado (código)';
                    }
                    else {
                        duplicados3.push(valor);
                    }
                }
            }
            listEmpleadosManual.sort((a, b) => (a.fila < b.fila ? -1 : a.fila > b.fila ? 1 : 0));
            let filaDuplicada = 0;
            for (const item of listEmpleadosManual) {
                if (typeof item.fila === 'number' && !isNaN(item.fila)) {
                    if (item.fila === filaDuplicada) {
                        mensaje = 'error';
                    }
                }
                else {
                    mensaje = 'error';
                }
                filaDuplicada = item.fila;
                if (item.observacion.startsWith('no ')) {
                    item.observacion = 'ok';
                }
            }
            if (mensaje === 'error') {
                return res.jsonp({ message: mensaje, data: undefined });
            }
            return res.jsonp({ message: mensaje, data: listEmpleadosManual });
        });
    }
    VerificarPlantilla_DatosManual(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let list = req.files;
            let cadena = list.uploads[0].path;
            let filename = cadena.split("\\")[1];
            var filePath = `./plantillas/${filename}`;
            const workbook = xlsx_1.default.readFile(filePath);
            const sheet_name_list = workbook.SheetNames;
            const plantilla = xlsx_1.default.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);
            var contarCedulaData = 0;
            var contarUsuarioData = 0;
            var contarCodigoData = 0;
            var contador_arreglo = 1;
            var arreglos_datos = [];
            //LEER LA PLANTILLA PARA LLENAR UN ARRAY CON LOS DATOS CEDULA Y USUARIO PARA VERIFICAR QUE NO SEAN DUPLICADOs
            plantilla.forEach((data) => __awaiter(this, void 0, void 0, function* () {
                // DATOS QUE SE LEEN DE LA PLANTILLA INGRESADA
                const { cedula, codigo, estado_civil, genero, correo, fec_nacimiento, estado, domicilio, telefono, nacionalidad, usuario, estado_user, rol, app_habilita } = data;
                let datos_array = {
                    cedula: cedula,
                    usuario: usuario,
                    codigo: codigo
                };
                arreglos_datos.push(datos_array);
            }));
            // VAMOS A VERIFICAR DENTRO DE ARREGLO_DATOS QUE NO SE ENCUENTREN DATOS DUPLICADos
            for (var i = 0; i <= arreglos_datos.length - 1; i++) {
                for (var j = 0; j <= arreglos_datos.length - 1; j++) {
                    if (arreglos_datos[i].cedula === arreglos_datos[j].cedula) {
                        contarCedulaData = contarCedulaData + 1;
                    }
                    if (arreglos_datos[i].usuario === arreglos_datos[j].usuario) {
                        contarUsuarioData = contarUsuarioData + 1;
                    }
                    if (arreglos_datos[i].codigo === arreglos_datos[j].codigo) {
                        contarCodigoData = contarCodigoData + 1;
                    }
                }
                contador_arreglo = contador_arreglo + 1;
            }
            // CUANDO TODOS LOS DATOS HAN SIDO LEIDOS VERIFICAMOS SI TODOS LOS DATOS SON CORRECTOS
            console.log('cedula_data', contarCedulaData, plantilla.length, contador_arreglo);
            console.log('usuario_data', contarUsuarioData, plantilla.length, contador_arreglo);
            console.log('codigo_data', contarCodigoData, plantilla.length, contador_arreglo);
            if ((contador_arreglo - 1) === plantilla.length) {
                if (contarCedulaData === plantilla.length && contarUsuarioData === plantilla.length &&
                    contarCodigoData === plantilla.length) {
                    return res.jsonp({ message: 'correcto' });
                }
                else {
                    return res.jsonp({ message: 'error' });
                }
            }
            // VERIFICAR EXISTENCIA DE CARPETA O ARCHIVO
            fs_2.default.access(filePath, fs_2.default.constants.F_OK, (err) => {
                if (err) {
                }
                else {
                    // ELIMINAR DEL SERVIDOR
                    fs_2.default.unlinkSync(filePath);
                }
            });
        });
    }
    CargarPlantilla_Manual(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { plantilla, user_name, ip } = req.body;
            var contador = 1;
            plantilla.forEach((data) => __awaiter(this, void 0, void 0, function* () {
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
                    const { cedula, codigo, estado_civil, genero, correo, fec_nacimiento, estado, domicilio, longitud, latitud, telefono, nacionalidad, usuario, rol } = data;
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
                        _longitud = longitud;
                    }
                    var _latitud = null;
                    if (latitud != 'No registrado') {
                        _latitud = latitud;
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
                    // REGISTRO DE NUEVO EMPLEADO
                    yield database_1.default.query(`
        INSERT INTO eu_empleados ( cedula, apellido, nombre, estado_civil, genero, correo,
          fecha_nacimiento, estado, domicilio, telefono, id_nacionalidad, codigo, longitud, latitud) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        `, [cedula, apellidoE, nombreE,
                        id_estado_civil, id_genero, correo, fec_nacimiento, id_estado,
                        domicilio, telefono, id_nacionalidad.rows[0]['id'], codigo, _longitud, _latitud]);
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
                    const oneEmpley = yield database_1.default.query('SELECT id FROM eu_empleados WHERE cedula = $1', [cedula]);
                    const id_empleado = oneEmpley.rows[0].id;
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
                        // ACTUALIZACIÓN DEL CÓDIGO
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
                    // FINALIZAR TRANSACCION
                    yield database_1.default.query('COMMIT');
                }
                catch (error) {
                    // REVERTIR TRANSACCION
                    yield database_1.default.query('ROLLBACK');
                    return res.status(500).jsonp({ message: error });
                }
            }));
        });
    }
    /** **************************************************************************************** **
     ** **                      CREAR CARPETAS EMPLEADOS SELECCIONADOS                           **
     ** **************************************************************************************** **/
    CrearCarpetasEmpleado(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id, codigo } = req.body;
            let verificar_permisos = 0;
            let verificar_imagen = 0;
            let verificar_vacunas = 0;
            let verificar_contrato = 0;
            try {
                const carpetaPermisos = yield (0, accesoCarpetas_1.ObtenerRutaPermisos)(codigo);
                try {
                    yield fs_1.promises.access(carpetaPermisos, fs_2.default.constants.F_OK);
                    verificar_permisos = 2; // La carpeta ya existe
                }
                catch (_a) {
                    try {
                        yield fs_1.promises.mkdir(carpetaPermisos, { recursive: true });
                        verificar_permisos = 0; // Carpeta creada con éxito
                    }
                    catch (_b) {
                        verificar_permisos = 1; // Error al crear la carpeta
                    }
                }
                const carpetaImagenes = yield (0, accesoCarpetas_1.ObtenerRutaUsuario)(id);
                try {
                    yield fs_1.promises.access(carpetaImagenes, fs_2.default.constants.F_OK);
                    verificar_imagen = 2; // La carpeta ya existe
                }
                catch (_c) {
                    try {
                        yield fs_1.promises.mkdir(carpetaImagenes, { recursive: true });
                        verificar_imagen = 0; // Carpeta creada con éxito
                    }
                    catch (_d) {
                        verificar_imagen = 1; // Error al crear la carpeta
                    }
                }
                const carpetaVacunas = yield (0, accesoCarpetas_1.ObtenerRutaVacuna)(id);
                try {
                    yield fs_1.promises.access(carpetaVacunas, fs_2.default.constants.F_OK);
                    verificar_vacunas = 2; // La carpeta ya existe
                }
                catch (_e) {
                    try {
                        yield fs_1.promises.mkdir(carpetaVacunas, { recursive: true });
                        verificar_vacunas = 0; // Carpeta creada con éxito
                    }
                    catch (_f) {
                        verificar_vacunas = 1; // Error al crear la carpeta
                    }
                }
                const carpetaContratos = yield (0, accesoCarpetas_1.ObtenerRutaContrato)(id);
                try {
                    yield fs_1.promises.access(carpetaContratos, fs_2.default.constants.F_OK);
                    verificar_contrato = 2; // La carpeta ya existe
                }
                catch (_g) {
                    try {
                        yield fs_1.promises.mkdir(carpetaContratos, { recursive: true });
                        verificar_contrato = 0; // Carpeta creada con éxito
                    }
                    catch (_h) {
                        verificar_contrato = 1; // Error al crear la carpeta
                    }
                }
                // METODO DE VERIFICACION DE CREACION DE DIRECTORIOS
                if (verificar_permisos === 1 && verificar_imagen === 1 && verificar_vacunas === 1 && verificar_contrato === 1) {
                    res.jsonp({ message: 'Ups!!! no fue posible crear el directorio de contratos, permisos, imagenes y vacunación del usuario.' });
                }
                else if (verificar_permisos === 1 && verificar_imagen === 0 && verificar_vacunas === 0 && verificar_contrato === 0) {
                    res.jsonp({ message: 'Ups!!! no fue posible crear el directorio de permisos del usuario.' });
                }
                else if (verificar_permisos === 0 && verificar_imagen === 1 && verificar_vacunas === 0 && verificar_contrato === 0) {
                    res.jsonp({ message: 'Ups!!! no fue posible crear el directorio de imagenes del usuario.' });
                }
                else if (verificar_permisos === 0 && verificar_imagen === 0 && verificar_vacunas === 1 && verificar_contrato === 0) {
                    res.jsonp({ message: 'Ups!!! no fue posible crear el directorio de vacunación del usuario.' });
                }
                else if (verificar_permisos === 0 && verificar_imagen === 0 && verificar_vacunas === 1 && verificar_contrato === 1) {
                    res.jsonp({ message: 'Ups!!! no fue posible crear el directorio de contratos del usuario.' });
                }
                else if (verificar_permisos === 2 && verificar_imagen === 2 && verificar_vacunas === 2 && verificar_contrato === 2) {
                    res.jsonp({ message: 'Ya existen carpetas creadas de ' + codigo });
                }
                else {
                    res.jsonp({ message: 'Carpetas creadas con exito.' });
                }
            }
            catch (error) {
                res.status(500).json({ message: 'Error al procesar la solicitud.', error: error.message });
            }
        });
    }
}
exports.EMPLEADO_CONTROLADOR = new EmpleadoControlador();
exports.default = exports.EMPLEADO_CONTROLADOR;
