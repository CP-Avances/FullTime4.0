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
exports.AUTORIZA_DEPARTAMENTO_CONTROLADOR = void 0;
const auditoriaControlador_1 = __importDefault(require("../auditoria/auditoriaControlador"));
const database_1 = __importDefault(require("../../database"));
class AutorizaDepartamentoControlador {
    // METODO PARA BUSCAR USUARIO AUTORIZA
    EncontrarAutorizacionEmple(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id_empleado } = req.params;
            const AUTORIZA = yield database_1.default.query(`
            SELECT da.id, da.id_departamento, da.id_empleado_cargo, da.estado, da.autorizar, da.preautorizar, 
                cd.nombre AS nom_depar, ce.id AS id_empresa, ce.nombre AS nom_empresa, s.id AS id_sucursal, 
                s.nombre AS nom_sucursal
            FROM ed_autoriza_departamento AS da, ed_departamentos AS cd, e_empresa AS ce, 
                e_sucursales AS s
            WHERE da.id_departamento = cd.id AND cd.id_sucursal = s.id AND ce.id = s.id_empresa
                AND da.id_empleado = $1
            `, [id_empleado]);
            if (AUTORIZA.rowCount != 0) {
                return res.jsonp(AUTORIZA.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros.' });
            }
        });
    }
    // METODO PARA BUSCAR USUARIO AUTORIZA
    EncontrarAutorizacionUsuario(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id_empleado } = req.params;
            const AUTORIZA = yield database_1.default.query(`
            SELECT cd.id AS id_depa_confi, n.id_departamento, n.departamento AS depa_autoriza, n.nivel, da.estado, 
                da.autorizar, da.preautorizar, da.id_empleado_cargo, e.id_contrato, e.id_departamento AS depa_pertenece, 
                cd.nombre, ce.id AS id_empresa, ce.nombre AS nom_empresa, s.id AS id_sucursal, s.nombre AS nom_sucursal 
            FROM ed_autoriza_departamento AS da, ed_departamentos AS cd, e_empresa AS ce, 
                e_sucursales AS s, contrato_cargo_vigente AS e, ed_niveles_departamento AS n 
            WHERE da.id_departamento = cd.id 
                AND cd.id_sucursal = s.id 
                AND ce.id = s.id_empresa 
                AND da.id_empleado = $1 
                AND e.id_cargo = da.id_empleado_cargo
                AND n.id_departamento_nivel = cd.id
            `, [id_empleado]);
            if (AUTORIZA.rowCount != 0) {
                return res.jsonp(AUTORIZA.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros.' });
            }
        });
    }
    // METODO PARA REGISTRAR AUTORIZACION
    CrearAutorizaDepartamento(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id_departamento, id_empl_cargo, estado, id_empleado, autorizar, preautorizar, user_name, ip } = req.body;
                // INICIAR TRANSACCION
                yield database_1.default.query('BEGIN');
                const respuesta = yield database_1.default.query(`
                INSERT INTO ed_autoriza_departamento (id_departamento, id_empleado_cargo, estado, id_empleado, autorizar, preautorizar)
                VALUES ($1, $2, $3, $4, $5, $6) RETURNING *
                `, [id_departamento, id_empl_cargo, estado, id_empleado, autorizar, preautorizar]);
                const [datosNuevos] = respuesta.rows;
                // INSERTAR REGISTRO DE AUDITORIA
                yield auditoriaControlador_1.default.InsertarAuditoria({
                    tabla: 'ed_autoriza_departamento',
                    usuario: user_name,
                    accion: 'I',
                    datosOriginales: '',
                    datosNuevos: JSON.stringify(datosNuevos),
                    ip,
                    observacion: null
                });
                // FINALIZAR TRANSACCION
                yield database_1.default.query('COMMIT');
                return res.jsonp({ message: 'Registro guardado.' });
            }
            catch (error) {
                // REVERTIR TRANSACCION
                yield database_1.default.query('ROLLBACK');
                return res.status(500).jsonp({ message: 'Error al guardar registro.' });
            }
        });
    }
    // METODO PARA ACTUALIZAR REGISTRO
    ActualizarAutorizaDepartamento(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id_departamento, id_empl_cargo, estado, id, autorizar, preautorizar, user_name, ip } = req.body;
                // INICIAR TRANSACCION
                yield database_1.default.query('BEGIN');
                // OBTENER DATOS ANTES DE ACTUALIZAR
                const response = yield database_1.default.query('SELECT * FROM ed_autoriza_departamento WHERE id = $1', [id]);
                const [datos] = response.rows;
                if (!datos) {
                    yield auditoriaControlador_1.default.InsertarAuditoria({
                        tabla: 'ed_autoriza_departamento',
                        usuario: user_name,
                        accion: 'U',
                        datosOriginales: '',
                        datosNuevos: '',
                        ip,
                        observacion: `Error al actualizar registro con id: ${id}`
                    });
                    // FINALIZAR TRANSACCION
                    yield database_1.default.query('COMMIT');
                    return res.status(404).jsonp({ message: 'Registro no encontrado.' });
                }
                const actualizacion = yield database_1.default.query(`
                UPDATE ed_autoriza_departamento SET id_departamento = $1, id_empleado_cargo = $2, estado = $3, autorizar = $5, 
                    preautorizar = $6
                WHERE id = $4 RETURNING *
                `, [id_departamento, id_empl_cargo, estado, id, autorizar, preautorizar]);
                const [datosNuevos] = actualizacion.rows;
                // INSERTAR REGISTRO DE AUDITORIA
                yield auditoriaControlador_1.default.InsertarAuditoria({
                    tabla: 'ed_autoriza_departamento',
                    usuario: user_name,
                    accion: 'U',
                    datosOriginales: JSON.stringify(datos),
                    datosNuevos: JSON.stringify(datosNuevos),
                    ip,
                    observacion: null
                });
                // FINALIZAR TRANSACCION
                yield database_1.default.query('COMMIT');
                return res.jsonp({ message: 'Registro actualizado.' });
            }
            catch (error) {
                // CANCELAR TRANSACCION
                yield database_1.default.query('ROLLBACK');
                return res.status(500).jsonp({ message: 'Error al actualizar registro.' });
            }
        });
    }
    // METODO PARA ELIMINAR REGISTROS
    EliminarAutorizacionDepartamento(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = req.params.id;
                const { user_name, ip } = req.body;
                // INICIAR TRANSACCION
                yield database_1.default.query('BEGIN');
                // OBTENER DATOS ANTES DE ELIMINAR
                const response = yield database_1.default.query('SELECT * FROM ed_autoriza_departamento WHERE id = $1', [id]);
                const [datos] = response.rows;
                if (!datos) {
                    yield auditoriaControlador_1.default.InsertarAuditoria({
                        tabla: 'ed_autoriza_departamento',
                        usuario: user_name,
                        accion: 'D',
                        datosOriginales: '',
                        datosNuevos: '',
                        ip,
                        observacion: `Error al eliminar registro con id: ${id}`
                    });
                    // FINALIZAR TRANSACCION
                    yield database_1.default.query('COMMIT');
                    return res.status(404).jsonp({ message: 'Registro no encontrado.' });
                }
                yield database_1.default.query(`
                DELETE FROM ed_autoriza_departamento WHERE id = $1
                `, [id]);
                // INSERTAR REGISTRO DE AUDITORIA
                yield auditoriaControlador_1.default.InsertarAuditoria({
                    tabla: 'ed_autoriza_departamento',
                    usuario: user_name,
                    accion: 'D',
                    datosOriginales: JSON.stringify(datos),
                    datosNuevos: '',
                    ip,
                    observacion: null
                });
                // FINALIZAR TRANSACCION
                yield database_1.default.query('COMMIT');
                return res.jsonp({ message: 'Registro eliminado.' });
            }
            catch (error) {
                // CANCELAR TRANSACCION
                yield database_1.default.query('ROLLBACK');
                return res.status(500).jsonp({ message: 'Error al eliminar registro.' });
            }
        });
    }
    // METODO PARA OBTENER LISTA DE USUARIOS QUE APRUEBAN SOLICITUDES     **USADO
    ObtenerListaEmpleadosAutorizan(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id_depa } = req.params;
            const EMPLEADOS = yield database_1.default.query(`
            SELECT * FROM informacionpersonalautoriza ia WHERE ia.id_depar = 9
            `, [id_depa]);
            if (EMPLEADOS.rowCount != 0) {
                return res.jsonp(EMPLEADOS.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'Registros no encontrados' });
            }
        });
    }
    ObtenerQuienesAutorizan(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id_depar } = req.params;
            const EMPLEADOS = yield database_1.default.query(`
            SELECT * FROM informacionpersonalautoriza WHERE id_depar = $1
            `, [id_depar]);
            if (EMPLEADOS.rowCount != 0) {
                return res.jsonp(EMPLEADOS.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'Registros no encontrados' });
            }
        });
    }
    ObtenerListaAutorizaDepa(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id_depar } = req.params;
            const { estado } = req.body;
            const EMPLEADOS = yield database_1.default.query(`
            SELECT n.id_departamento, cg.nombre, n.id_departamento_nivel, n.departamento_nombre_nivel, n.nivel,
                da.estado, dae.id_contrato, da.id_empleado_cargo, da.id_empleado, 
                (dae.nombre || ' ' || dae.apellido) as fullname, dae.cedula, dae.correo, c.permiso_mail, 
                c.permiso_notificacion, c.vacacion_mail, c.vacacion_notificacion, c.hora_extra_mail, 
                c.hora_extra_notificacion  
            FROM ed_niveles_departamento AS n, ed_autoriza_departamento AS da, informacion_general AS dae, 
                eu_configurar_alertas AS c, ed_departamentos AS cg 
            WHERE n.id_departamento = $1
                AND da.id_departamento = n.id_departamento_nivel 
                AND dae.id_cargo = da.id_empleado_cargo 
                AND dae.id_contrato = c.id_empleado 
                AND cg.id = $1
                AND dae.estado = $2
            ORDER BY nivel ASC
            `, [id_depar, estado]);
            if (EMPLEADOS.rowCount != 0) {
                return res.jsonp(EMPLEADOS.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'Registros no encontrados' });
            }
        });
    }
}
exports.AUTORIZA_DEPARTAMENTO_CONTROLADOR = new AutorizaDepartamentoControlador();
exports.default = exports.AUTORIZA_DEPARTAMENTO_CONTROLADOR;
