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
exports.GRUPO_OCUPACIONAL_CONTROLADOR = void 0;
const auditoriaControlador_1 = __importDefault(require("../../reportes/auditoriaControlador"));
const database_1 = __importDefault(require("../../../database"));
class GrupoOcupacionalControlador {
    // METODO PARA BUSCAR LISTA DE GRADOS
    listaGrupoOcupacional(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const GRUPO_OCUPACIONAL = yield database_1.default.query(`
        SELECT gp.id, gp.descripcion, gp.numero_partida FROM map_cat_grupo_ocupacional AS gp 
        ORDER BY gp.id DESC
        `);
                res.jsonp(GRUPO_OCUPACIONAL.rows);
            }
            catch (error) {
                // REVERTIR TRANSACCION
                yield database_1.default.query('ROLLBACK');
                res.status(500).jsonp({ message: 'Error al optener los grupos ocupacionales' });
            }
        });
    }
    // METODO PARA INSERTAR EL GRADO
    IngresarGrupoOcupacional(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { grupo, numero_partida, user_name, ip, ip_local } = req.body;
            try {
                const GRUPO = yield database_1.default.query(`
          SELECT gp.id, gp.descripcion, gp.numero_partida FROM map_cat_grupo_ocupacional AS gp
          WHERE UPPER(gp.descripcion) = UPPER($1)
          `, [grupo]);
                if (GRUPO.rows[0] != '' && GRUPO.rows[0] != null, GRUPO.rows[0] != undefined) {
                    res.jsonp({ message: 'Ya existe un grupo ocupacional con ese nombre', codigo: 300 });
                }
                else {
                    // INICIAR TRANSACCION
                    yield database_1.default.query('BEGIN');
                    const response = yield database_1.default.query(`
            INSERT INTO map_cat_grupo_ocupacional (descripcion, numero_partida) VALUES ($1, $2) RETURNING * 
            `, [grupo, numero_partida]);
                    const [grupo_ocupacional] = response.rows;
                    // AUDITORIA
                    yield auditoriaControlador_1.default.InsertarAuditoria({
                        tabla: 'map_cat_grupo_ocupacional',
                        usuario: user_name,
                        accion: 'I',
                        datosOriginales: '',
                        datosNuevos: JSON.stringify(grupo_ocupacional),
                        ip: ip,
                        ip_local: ip_local,
                        observacion: null
                    });
                    // FINALIZAR TRANSACCION
                    yield database_1.default.query('COMMIT');
                    res.jsonp({ message: 'El grupo ocupacional ha sido guardado con éxito', codigo: 200 });
                }
            }
            catch (error) {
                // REVERTIR TRANSACCION
                yield database_1.default.query('ROLLBACK');
                res.status(500).jsonp({ message: 'Error al guardar el grupo ocupacional' });
            }
        });
    }
    // METODO PARA EDITAR EL GRADO
    EditarGrupoOcupacional(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id_grupo, grupo, numero_partida, user_name, ip, ip_local } = req.body;
            try {
                // INICIAR TRANSACCION
                yield database_1.default.query('BEGIN');
                yield database_1.default.query(`
            UPDATE map_cat_grupo_ocupacional SET descripcion = $2, numero_partida = $3 WHERE id = $1
          `, [id_grupo, grupo, numero_partida]);
                // AUDITORIA
                yield auditoriaControlador_1.default.InsertarAuditoria({
                    tabla: 'map_cat_procesos',
                    usuario: user_name,
                    accion: 'I',
                    datosOriginales: '',
                    datosNuevos: `{"id": "${id_grupo}"}, {"descripcion": "${grupo}"}, {"numero_partida": "${numero_partida}"}`,
                    ip: ip,
                    ip_local: ip_local,
                    observacion: null
                });
                // FINALIZAR TRANSACCION
                yield database_1.default.query('COMMIT');
                res.status(200).jsonp({ message: 'El grupo ocupacional se ha actualizado con éxito', codigo: 200 });
            }
            catch (error) {
                // REVERTIR TRANSACCION
                yield database_1.default.query('ROLLBACK');
                res.status(500).jsonp({ message: 'Error al actualizar el grupo ocupacional' });
            }
        });
    }
    // METODO PARA ELIMINAR EL GRADO
    EliminarGrupoOcupacional(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id_grupo, user_name, ip, ip_local } = req.body;
            try {
                // INICIAR TRANSACCION
                yield database_1.default.query('BEGIN');
                yield database_1.default.query(`
            DELETE FROM map_cat_grupo_ocupacional WHERE id = $1
          `, [id_grupo]);
                // AUDITORIA
                yield auditoriaControlador_1.default.InsertarAuditoria({
                    tabla: 'map_cat_grupo_ocupacional',
                    usuario: user_name,
                    accion: 'I',
                    datosOriginales: '',
                    datosNuevos: `{"id": "${id_grupo}"}`,
                    ip: ip,
                    ip_local: ip_local,
                    observacion: null
                });
                // FINALIZAR TRANSACCION
                yield database_1.default.query('COMMIT');
                res.status(200).jsonp({ message: 'El grado se ha eliminado con éxito', codigo: 200 });
            }
            catch (error) {
                // REVERTIR TRANSACCION
                yield database_1.default.query('ROLLBACK');
                res.status(500).jsonp({ message: 'Error al eliminar el grado' });
            }
        });
    }
}
exports.GRUPO_OCUPACIONAL_CONTROLADOR = new GrupoOcupacionalControlador();
exports.default = exports.GRUPO_OCUPACIONAL_CONTROLADOR;
