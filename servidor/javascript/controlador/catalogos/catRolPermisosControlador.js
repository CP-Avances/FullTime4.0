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
            const Roles = yield database_1.default.query(`
      SELECT nombre FROM opciones_menu
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
