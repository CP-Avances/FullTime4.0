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
exports.rolPermisosControlador = void 0;
const database_1 = __importDefault(require("../../database"));
class RolPermisosControlador {
    list(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const rolPermisos = yield database_1.default.query('SELECT * FROM cg_rol_permisos');
            res.jsonp(rolPermisos.rows);
        });
    }
    getOne(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const unRolPermiso = yield database_1.default.query('SELECT * FROM cg_rol_permisos WHERE id = $1', [id]);
            if (unRolPermiso.rowCount > 0) {
                return res.jsonp(unRolPermiso.rows);
            }
            res.status(404).jsonp({ text: 'Rol permiso no encontrado' });
        });
    }
    create(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { funcion, link, etiqueta } = req.body;
            yield database_1.default.query('INSERT INTO cg_rol_permisos ( funcion, link, etiqueta ) VALUES ($1, $2, $3)', [funcion, link, etiqueta]);
            console.log(req.body);
            const rolPermisos = yield database_1.default.query('SELECT id FROM cg_rol_permisos');
            const ultimoDato = rolPermisos.rows.length - 1;
            const idRespuesta = rolPermisos.rows[ultimoDato].id;
            res.jsonp({ message: 'Rol permiso Guardado', id: idRespuesta });
        });
    }
    createPermisoDenegado(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id_rol, id_permiso } = req.body;
            yield database_1.default.query('INSERT INTO rol_perm_denegado ( id_rol, id_permiso ) VALUES ($1, $2)', [id_rol, id_permiso]);
            console.log(req.body);
            res.jsonp({ message: 'Permiso denegado Guardado' });
        });
    }
    getPermisosUsuario(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const unRolPermiso = yield database_1.default.query('SELECT * FROM VistaPermisoRoles WHERE id_rol = $1', [id]);
            if (unRolPermiso.rowCount > 0) {
                console.log(unRolPermiso.rows);
                return res.jsonp(unRolPermiso.rows);
            }
            res.status(404).jsonp({ text: 'El rol no tiene permisos' });
        });
    }
    //METODO PARA ENLISTAR LINKS 
    ListarMenuRoles(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const Roles = yield database_1.default.query(`SELECT * FROM opciones_menu`);
            if (Roles.rowCount > 0) {
                return res.jsonp(Roles.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'Registro no encontrado.' });
            }
        });
    }
    // METODO PARA BUSCAR ID DE PAGINAS
    ObtenerIdPaginas(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { funcion, id_rol } = req.body;
            const PAGINA_ROL = yield database_1.default.query(`
          SELECT * FROM cg_rol_permisos WHERE funcion = $1  AND id_rol = $2 
          `, [funcion, id_rol]);
            if (PAGINA_ROL.rowCount > 0) {
                return res.jsonp(PAGINA_ROL.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'Registros no encontrados.' });
            }
        });
    }
    // METODO PARA BUSCAR ID DE PAGINAS
    ObtenerIdPaginasConAcciones(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { funcion, id_rol, id_accion } = req.body;
            const PAGINA_ROL = yield database_1.default.query(`
            SELECT * FROM cg_rol_permisos WHERE funcion = $1  AND id_rol = $2 AND id_accion = $3
            `, [funcion, id_rol, id_accion]);
            if (PAGINA_ROL.rowCount > 0) {
                return res.jsonp(PAGINA_ROL.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'Registros no encontrados.' });
            }
        });
    }
    // METODO PARA BUSCAR ID DE PAGINAS
    ObtenerPaginasRol(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id_rol } = req.body;
            const PAGINA_ROL = yield database_1.default.query(`
          SELECT * FROM cg_rol_permisos WHERE id_rol = $1 
          `, [id_rol]);
            if (PAGINA_ROL.rowCount > 0) {
                return res.jsonp(PAGINA_ROL.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'Registros no encontrados.' });
            }
        });
    }
    // METODO PARA ASIGNAR CIUDADES A FERIADO
    AsignarPaginaRol(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { funcion, link, id_rol, id_accion } = req.body;
                const response = yield database_1.default.query(`
            INSERT INTO cg_rol_permisos (funcion, link, id_rol, id_accion) VALUES ($1, $2, $3, $4) RETURNING *
            `, [funcion, link, id_rol, id_accion]);
                const [rol] = response.rows;
                if (rol) {
                    return res.status(200).jsonp({ message: 'OK', reloj: rol });
                }
                else {
                    return res.status(404).jsonp({ message: 'error' });
                }
            }
            catch (error) {
                return res.status(500).jsonp({ message: 'error' });
            }
        });
    }
    // METODO PARA ELIMINAR REGISTRO
    EliminarPaginaRol(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { funcion, id_rol, id_accion } = req.body;
            console.log(funcion);
            console.log(id_rol);
            yield database_1.default.query(`
        DELETE FROM cg_rol_permisos WHERE funcion = $1 AND id_rol = $2 AND id_accion = $3
        `, [funcion, id_rol, id_accion]);
            res.jsonp({ message: 'Registro eliminado.' });
        });
    }
    EliminarPaginaRolSinAccion(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { funcion, id_rol } = req.body;
            console.log(funcion);
            console.log(id_rol);
            yield database_1.default.query(`
        DELETE FROM cg_rol_permisos WHERE funcion = $1 AND id_rol = $2
        `, [funcion, id_rol]);
            res.jsonp({ message: 'Registro eliminado.' });
        });
    }
    // METODO PARA Buscar las acciones de cada pagina
    ObtenerAccionesPaginas(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id_funcion } = req.body;
            const PAGINA_ROL = yield database_1.default.query(`
          SELECT * FROM cg_acciones_roles WHERE id_funcion = $1 
          `, [id_funcion]);
            if (PAGINA_ROL.rowCount > 0) {
                return res.jsonp(PAGINA_ROL.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'Registros no encontrados.' });
            }
        });
    }
    ObtenerAccionPorId(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.body;
            const PAGINA_ROL = yield database_1.default.query(`
          SELECT * FROM cg_acciones_roles WHERE id = $1 
          `, [id]);
            if (PAGINA_ROL.rowCount > 0) {
                return res.jsonp(PAGINA_ROL.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'Registros no encontrados.' });
            }
        });
    }
    //METODO PARA ENLISTAR ACCIONES 
    ListarAcciones(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const Roles = yield database_1.default.query(`SELECT * FROM cg_acciones_roles`);
            if (Roles.rowCount > 0) {
                return res.jsonp(Roles.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'Registro no encontrado.' });
            }
        });
    }
}
exports.rolPermisosControlador = new RolPermisosControlador();
exports.default = exports.rolPermisosControlador;
