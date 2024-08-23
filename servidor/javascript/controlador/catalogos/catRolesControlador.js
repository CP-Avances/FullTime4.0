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
const auditoriaControlador_1 = __importDefault(require("../auditoria/auditoriaControlador"));
const database_1 = __importDefault(require("../../database"));
class RolesControlador {
    // METODO PARA LISTAR ROLES DEL SISTEMA  **USADO
    ListarRoles(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const ROL = yield database_1.default.query(`
      SELECT id, nombre FROM ero_cat_roles ORDER BY nombre ASC
      `);
            if (ROL.rowCount != 0) {
                return res.jsonp(ROL.rows);
            }
            else {
                res.status(404).jsonp({ text: 'Registro no encontrado.' });
            }
        });
    }
    // METODO PARA ELIMINAR REGISTRO  **USADO
    EliminarRol(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { user_name, ip } = req.body;
                const id = req.params.id;
                // INICIAR TRANSACCION
                yield database_1.default.query('BEGIN');
                // CONSULTAR DATOSORIGINALES
                const rol = yield database_1.default.query('SELECT * FROM ero_cat_roles WHERE id = $1', [id]);
                const [datosOriginales] = rol.rows;
                if (!datosOriginales) {
                    // AUDITORIA
                    yield auditoriaControlador_1.default.InsertarAuditoria({
                        tabla: 'ero_cat_roles',
                        usuario: user_name,
                        accion: 'D',
                        datosOriginales: '',
                        datosNuevos: '',
                        ip,
                        observacion: `Error al eliminar el rol con id ${id}`
                    });
                    // FINALIZAR TRANSACCION
                    yield database_1.default.query('COMMIT');
                    return res.status(404).jsonp({ message: 'Error al eliminar el registro.' });
                }
                yield database_1.default.query(`
        DELETE FROM ero_cat_roles WHERE id = $1
        `, [id]);
                // AUDITORIA
                yield auditoriaControlador_1.default.InsertarAuditoria({
                    tabla: 'ero_cat_roles',
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
                // FINALIZAR TRANSACCION
                yield database_1.default.query('ROLLBACK');
                return res.jsonp({ message: 'error' });
            }
        });
    }
    // METODO PARA REGISTRAR ROL
    CrearRol(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { nombre, user_name, ip } = req.body;
                // INICIAR TRANSACCION
                yield database_1.default.query('BEGIN');
                const datosNuevos = yield database_1.default.query(`
        INSERT INTO ero_cat_roles (nombre) VALUES ($1)  RETURNING *
         `, [nombre]);
                // AUDITORIA
                yield auditoriaControlador_1.default.InsertarAuditoria({
                    tabla: 'ero_cat_roles',
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
                res.status(500).jsonp({ message: 'Error al guardar el registro.' });
            }
        });
    }
    // LISTAR ROLES A EXCEPCION EL QUE SE EDITA **USADO
    ListarRolesActualiza(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id;
            const ROL = yield database_1.default.query(`
      SELECT * FROM ero_cat_roles WHERE NOT id = $1
      `, [id]);
            if (ROL.rowCount != 0) {
                return res.jsonp(ROL.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros.' });
            }
        });
    }
    // METODO PARA LISTAR INFORMACION DEL ROL **USADO
    ObtenerUnRol(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const ROL = yield database_1.default.query(`
      SELECT * FROM ero_cat_roles WHERE id = $1
      `, [id]);
            if (ROL.rowCount != 0) {
                return res.jsonp(ROL.rows);
            }
            else {
                res.status(404).jsonp({ text: 'Registro no encontrado.' });
            }
        });
    }
    // METODO PARA ACTUALIZAR ROLES  **USADO
    ActualizarRol(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { nombre, id, user_name, ip } = req.body;
                // INICIAR TRANSACCION
                yield database_1.default.query('BEGIN');
                // CONSULTAR DATOS ORIGINALES
                const rol = yield database_1.default.query('SELECT * FROM ero_cat_roles WHERE id = $1', [id]);
                const [datosOriginales] = rol.rows;
                if (!datosOriginales) {
                    // AUDITORIA
                    yield auditoriaControlador_1.default.InsertarAuditoria({
                        tabla: 'ero_cat_roles',
                        usuario: user_name,
                        accion: 'U',
                        datosOriginales: '',
                        datosNuevos: '',
                        ip,
                        observacion: `Error al actualizar el rol con id ${id}`
                    });
                    // FINALIZAR TRANSACCION
                    yield database_1.default.query('COMMIT');
                    return res.status(404).jsonp({ message: 'Error al actualizar el registro.' });
                }
                const datosNuevos = yield database_1.default.query('UPDATE ero_cat_roles SET nombre = $1 WHERE id = $2 RETURNING *', [nombre, id]);
                // AUDITORIA
                yield auditoriaControlador_1.default.InsertarAuditoria({
                    tabla: 'ero_cat_roles',
                    usuario: user_name,
                    accion: 'U',
                    datosOriginales: JSON.stringify(datosOriginales),
                    datosNuevos: JSON.stringify(datosNuevos.rows[0]),
                    ip,
                    observacion: null
                });
                // FINALIZAR TRANSACCION
                yield database_1.default.query('COMMIT');
                return res.jsonp({ message: 'Registro Actualizado' });
            }
            catch (error) {
                // FINALIZAR TRANSACCION
                yield database_1.default.query('ROLLBACK');
                return res.status(500).jsonp({ message: 'Error al actualizar el registro.' });
            }
        });
    }
    //CONSULTA PARA OPTENER LOS USUARIOS CON NO SON JEFES Y ADMINISTRAR UN DEPARTAMENTO
    ListarRolesUsuario(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('entro en el controlador :)');
            try {
                const ROL = yield database_1.default.query(`
        SELECT data_empl.codigo, data_empl.cedula, CONCAT(TRIM(data_empl.nombre), ' ',TRIM(data_empl.apellido)) AS nombre, 
	            data_empl.id_rol, rol.nombre AS rol, empl_car.id_departamento, depa.nombre AS departamento,
	            empl_car.id_sucursal, sucu.nombre AS sucursal, empl_car.id_tipo_cargo, cargo.cargo 
        FROM eu_usuario_departamento AS usu_dep, eu_empleado_cargos AS empl_car, informacion_general AS data_empl,
	          ed_departamentos AS depa, e_sucursales AS sucu, e_cat_tipo_cargo AS cargo, ero_cat_roles AS rol
        WHERE usu_dep.id_empleado = data_empl.id AND usu_dep.principal = true AND usu_dep.personal = true AND 
	          usu_dep.administra = false AND empl_car.id = data_empl.id_cargo AND empl_car.jefe = false AND
	          depa.id = empl_car.id_departamento AND sucu.id = empl_car.id_sucursal AND cargo.id = empl_car.id_tipo_cargo AND
	          data_empl.id_rol != 1 AND rol.id = data_empl.id_rol order by nombre ASC
        `);
                if (ROL.rowCount != 0) {
                    return res.jsonp({ message: 'Registros encontrados', lista: ROL.rows });
                }
                else {
                    return res.status(404).jsonp({ message: 'Registros no encontrados.' });
                }
            }
            catch (error) {
                // FINALIZAR TRANSACCION
                yield database_1.default.query('ROLLBACK');
                return res.status(500).jsonp({ message: 'Error al actualizar el registro.' });
            }
        });
    }
    // CONSULTA PARA ACTUALIZAR ROLES A VARIOS USUARIOS **USADO
    ActualizarRolUusuario(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { idRol, listaUsuarios } = req.body;
                var cont = 0;
                listaUsuarios.forEach((item) => __awaiter(this, void 0, void 0, function* () {
                    let res = yield database_1.default.query(`
          UPDATE eu_usuarios
          SET id_rol = $1 
          WHERE id = $2
          `, [idRol, item.id]);
                    if (res.rowCount != 0) {
                        cont = cont + 1;
                    }
                }));
                setTimeout(() => {
                    if (cont == listaUsuarios.length) {
                        return res.status(200).jsonp({ message: 'Se ha actualizado todos los registros.', status: 200 });
                    }
                    else {
                        return res.status(404).jsonp({ message: 'Revisar los datos, algunos registros no se actualizaron.', status: 404 });
                    }
                }, 1500);
            }
            catch (error) {
                // FINALIZAR TRANSACCION
                yield database_1.default.query('ROLLBACK');
                return res.status(500).jsonp({ message: 'Error al actualizar el registro.', status: 500 });
            }
        });
    }
}
const ROLES_CONTROLADOR = new RolesControlador();
exports.default = ROLES_CONTROLADOR;
