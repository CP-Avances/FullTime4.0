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
            const rolPermisos = yield database_1.default.query(`
      SELECT * FROM ero_rol_permisos
      `);
            res.jsonp(rolPermisos.rows);
        });
    }
    getOne(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const unRolPermiso = yield database_1.default.query(`
      SELECT * FROM ero_rol_permisos WHERE id = $1
      `, [id]);
            if (unRolPermiso.rowCount > 0) {
                return res.jsonp(unRolPermiso.rows);
            }
            res.status(404).jsonp({ text: 'Registro no encontrado.' });
        });
    }
    //METODO PARA ENLISTAR PAGINAS QUE NO SEAN MODULOS
    ListarMenuRoles(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const Roles = yield database_1.default.query(`
      SELECT * FROM es_paginas WHERE modulo = false
      `);
            if (Roles.rowCount > 0) {
                return res.jsonp(Roles.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'Registro no encontrado.' });
            }
        });
    }
    //METODO PARA ENLISTAR PAGINAS QUE NO SEAN MODULOS
    ListarMenuModulosRoles(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const Roles = yield database_1.default.query(`
      SELECT * FROM es_paginas WHERE modulo = true
      `);
            if (Roles.rowCount > 0) {
                return res.jsonp(Roles.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'Registro no encontrado.' });
            }
        });
    }
    //METODO PARA ENLISTAR PAGINAS QUE SON MODULOS, CLASIFICANDOLAS POR EL NOMBRE DEL MODULO
    //METODO PARA ENLISTAR PAGINAS QUE NO SEAN MODULOS
    ListarMenuRolesModulos(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { nombre_modulo } = req.body;
            const Roles = yield database_1.default.query(`
      SELECT * FROM es_paginas WHERE nombre_modulo = $1
      `, [nombre_modulo]);
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
      SELECT * FROM ero_rol_permisos WHERE pagina = $1  AND id_rol = $2 
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
      SELECT * FROM ero_rol_permisos WHERE pagina = $1 AND id_rol = $2 AND id_accion = $3
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
      SELECT * FROM ero_rol_permisos WHERE id_rol = $1 
      `, [id_rol]);
            if (PAGINA_ROL.rowCount > 0) {
                return res.jsonp(PAGINA_ROL.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'Registros no encontrados.' });
            }
        });
    }
    // METODO PARA ASIGNAR PERMISOS AL ROL
    AsignarPaginaRol(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { funcion, link, id_rol, id_accion } = req.body;
                const response = yield database_1.default.query(`
        INSERT INTO ero_rol_permisos (pagina, link, id_rol, id_accion) VALUES ($1, $2, $3, $4) RETURNING *
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
            const { id } = req.body;
            //console.log(funcion);
            //console.log(id_rol);
            yield database_1.default.query(`
      DELETE FROM ero_rol_permisos WHERE id = $1
      `, [id]);
            res.jsonp({ message: 'Registro eliminado.' });
        });
    }
    EliminarPaginaRolSinAccion(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.body;
            yield database_1.default.query(`
      DELETE FROM ero_rol_permisos WHERE id = $1 
      `, [id]);
            res.jsonp({ message: 'Registro eliminado.' });
        });
    }
    // METODO PARA GUARDAR TODAS LAS ACCIONES EXISTENTES EN UN OBJETO
    // METODO PARA Buscar las acciones de cada pagina
    ObtenerAccionesPaginas(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id_funcion } = req.body;
            const PAGINA_ROL = yield database_1.default.query(`
      SELECT * FROM es_acciones_paginas WHERE id_pagina = $1 
      `, [id_funcion]);
            if (PAGINA_ROL.rowCount > 0) {
                return res.jsonp(PAGINA_ROL.rows);
            }
            else {
                return res.jsonp([]);
                // return res.status(404).jsonp({ text: 'Registros no encontrados.' });
            }
        });
    }
    ObtenerAccionesPaginasExistentes(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id_funcion } = req.body;
            const PAGINA_ROL = yield database_1.default.query(`
          SELECT * FROM es_acciones_paginas WHERE id_pagina = $1 
          `, [id_funcion]);
            if (PAGINA_ROL.rowCount > 0) {
                return res.jsonp(PAGINA_ROL.rows);
            }
            else {
                //return res.jsonp([])
                return res.status(404).jsonp({ text: 'Registros no encontrados.' });
            }
        });
    }
    ObtenerAccionPorId(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.body;
            const PAGINA_ROL = yield database_1.default.query(`
      SELECT * FROM es_acciones_paginas WHERE id = $1 
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
            const Roles = yield database_1.default.query(`
      SELECT * FROM es_acciones_paginas
      `);
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
