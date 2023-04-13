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
const database_1 = __importDefault(require("../../database"));
class UsuarioControlador {
    list(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield database_1.default.query('SELECT * FROM usuarios');
            res.json(user.rows);
        });
    }
    getIdByUsuario(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { usuario } = req.params;
            const unUsuario = yield database_1.default.query('SELECT id FROM usuarios WHERE usuario = $1', [usuario]);
            if (unUsuario.rowCount > 0) {
                return res.json(unUsuario.rows);
            }
            res.status(404).json({ text: 'No se ha encontrado el usuario' });
        });
    }
    // public async getIdByUsuario(req: Request, res: Response): Promise<any>{
    //   const  {id_empleado} = req.params;
    //   const unUsuario = await pool.query('SELECT * FROM usuarios WHERE id_empleado = $1', [id_empleado]);
    //   if (unUsuario.rowCount > 0) {
    //     return res.json(unUsuario.rows);
    //   }
    //   res.status(404).json({ text: 'No se ha encontrado el usuario' });
    // }
    create(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { usuario, contrasena, estado, id_rol, id_empleado, app_habilita } = req.body;
            yield database_1.default.query('INSERT INTO usuarios ( usuario, contrasena, estado, id_rol, id_empleado, app_habilita ) VALUES ($1, $2, $3, $4, $5, $6)', [usuario, contrasena, estado, id_rol, id_empleado, app_habilita]);
            console.log(req.body);
            res.json({ message: 'Usuario Guardado' });
        });
    }
}
exports.USUARIO_CONTROLADOR = new UsuarioControlador();
exports.default = exports.USUARIO_CONTROLADOR;
