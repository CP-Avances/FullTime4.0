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
exports.TIPO_PERMISOS_CONTROLADOR = void 0;
const database_1 = __importDefault(require("../../database"));
class TipoPermisosControlador {
    // METODO PARA BUSCAR TIPO DE PERMISOS
    Listar(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const rolPermisos = yield database_1.default.query(`
      SELECT * FROM mp_cat_tipo_permisos ORDER BY descripcion ASC
      `);
            if (rolPermisos.rowCount > 0) {
                return res.jsonp(rolPermisos.rows);
            }
            else {
                res.status(404).jsonp({ text: 'Registros no encontrados.' });
            }
        });
    }
    // METODO PARA ELIMINAR REGISTROS
    EliminarRegistros(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id;
            yield database_1.default.query(`
      DELETE FROM mp_cat_tipo_permisos WHERE id = $1
      `, [id]);
            res.jsonp({ message: 'Registro eliminado.' });
        });
    }
    // METODO PARA LISTAR DATOS DE UN TIPO DE PERMISO
    BuscarUnTipoPermiso(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const unTipoPermiso = yield database_1.default.query(`
      SELECT * FROM mp_cat_tipo_permisos WHERE id = $1
      `, [id]);
            if (unTipoPermiso.rowCount > 0) {
                return res.jsonp(unTipoPermiso.rows);
            }
            res.status(404).jsonp({ text: 'Registro no encontrado.' });
        });
    }
    // METODO PARA EDITAR REGISTRO
    Editar(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id;
            const { descripcion, tipo_descuento, num_dia_maximo, num_dia_anticipo, gene_justificacion, fec_validar, acce_empleado, legalizar, almu_incluir, num_dia_justifica, num_hora_maximo, fecha_inicio, documento, contar_feriados, correo_crear, correo_editar, correo_eliminar, correo_preautorizar, correo_autorizar, correo_negar, correo_legalizar, fecha_fin, num_dia_anterior } = req.body;
            yield database_1.default.query(`
      UPDATE mp_cat_tipo_permisos SET descripcion = $1, tipo_descuento = $2, dias_maximo_permiso = $3, 
        dias_anticipar_permiso = $4, justificar = $5, fecha_restriccion = $6, solicita_empleado = $7, legalizar = $8, 
        incluir_minutos_comida = $9, dias_justificar = $10, horas_maximo_permiso = $11, fecha_inicio = $12, documento = $13, 
        contar_feriados = $14, correo_crear = $15, correo_editar = $16, correo_eliminar = $17, correo_preautorizar = $18, 
        correo_autorizar = $19, correo_negar = $20, correo_legalizar = $21, fecha_fin = $22, crear_dias_anteriores = $23
      WHERE id = $24
      `, [descripcion, tipo_descuento, num_dia_maximo, num_dia_anticipo, gene_justificacion, fec_validar, acce_empleado,
                legalizar, almu_incluir, num_dia_justifica, num_hora_maximo, fecha_inicio, documento, contar_feriados, correo_crear,
                correo_editar, correo_eliminar, correo_preautorizar, correo_autorizar, correo_negar, correo_legalizar, fecha_fin,
                num_dia_anterior, id]);
            res.jsonp({ message: 'Registro actualizado.' });
        });
    }
    // METODO PARA CREAR REGISTRO DE TIPO DE PERMISO
    Crear(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { descripcion, tipo_descuento, num_dia_maximo, num_dia_anticipo, gene_justificacion, fec_validar, acce_empleado, legalizar, almu_incluir, num_dia_justifica, num_hora_maximo, fecha_inicio, documento, contar_feriados, correo_crear, correo_editar, correo_eliminar, correo_preautorizar, correo_autorizar, correo_negar, correo_legalizar, fecha_fin, num_dia_anterior } = req.body;
                const response = yield database_1.default.query(`
        INSERT INTO mp_cat_tipo_permisos (descripcion, tipo_descuento, dias_maximo_permiso, dias_anticipar_permiso, 
          justificar, fecha_restriccion, solicita_empleado, legalizar, incluir_minutos_comida, dias_justificar, 
          hora_maximo_permiso, fecha_inicio, documento, contar_feriados, correo_crear, correo_editar, correo_eliminar, 
          correo_preautorizar, correo_autorizar, correo_negar, correo_legalizar, fecha_fin, crear_dias_anteriores)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21,
           $22, $23) RETURNING *
        `, [descripcion, tipo_descuento, num_dia_maximo, num_dia_anticipo, gene_justificacion, fec_validar,
                    acce_empleado, legalizar, almu_incluir, num_dia_justifica, num_hora_maximo, fecha_inicio, documento, contar_feriados,
                    correo_crear, correo_editar, correo_eliminar, correo_preautorizar, correo_autorizar, correo_negar, correo_legalizar,
                    fecha_fin, num_dia_anterior]);
                const [tipo] = response.rows;
                if (tipo) {
                    return res.status(200).jsonp(tipo);
                }
                else {
                    return res.status(404).jsonp({ message: 'error' });
                }
            }
            catch (error) {
                console.log(error);
                return res.jsonp({ message: 'error' });
            }
        });
    }
    // METODO PARA LISTAR TIPO DE PERMISOS DE ACUERDO AL ROL
    ListarTipoPermisoRol(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const acce_empleado = req.params.acce_empleado;
            const rolPermisos = yield database_1.default.query(`
      SELECT * FROM mp_cat_tipo_permisos WHERE solicita_empleado = $1 ORDER BY descripcion
      `, [acce_empleado]);
            res.json(rolPermisos.rows);
        });
    }
}
exports.TIPO_PERMISOS_CONTROLADOR = new TipoPermisosControlador();
exports.default = exports.TIPO_PERMISOS_CONTROLADOR;
