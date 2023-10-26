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
exports.ASISTENCIA_CONTROLADOR = void 0;
const database_1 = __importDefault(require("../../database"));
class AsistenciaControlador {
    BuscarAsistencia(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var verificador = 0;
            var codigos = '';
            var EMPLEADO;
            const { cedula, codigo, inicio, fin, nombre, apellido } = req.body;
            if (codigo === '') {
                // BUSCAR CODIGO POR CEDULA DEL USUARIO
                EMPLEADO = yield database_1.default.query(`
                SELECT codigo FROM empleados WHERE cedula = $1
                `, [cedula]);
                if (EMPLEADO.rowCount === 0) {
                    // BUSCAR CODIGO POR NOMBRE DEL USUARIO
                    EMPLEADO = yield database_1.default.query(`
                    SELECT codigo FROM empleados WHERE UPPER(nombre) ilike '%${nombre}%'
                    `);
                    if (EMPLEADO.rowCount === 0) {
                        // BUSCAR CODIGO POR APELLIDO DEL USUARIO
                        EMPLEADO = yield database_1.default.query(`
                        SELECT codigo FROM empleados WHERE UPPER(apellido) ilike '%${apellido}%'
                        `);
                        if (EMPLEADO.rowCount != 0) {
                            // TRATAMIENTO DE CODIGOS
                            var datos = [];
                            datos = EMPLEADO.rows;
                            datos.forEach((obj) => {
                                //console.log('ver codigos ', obj.codigo)
                                if (codigos === '') {
                                    codigos = '\'' + obj.codigo + '\'';
                                }
                                else {
                                    codigos = codigos + ', \'' + obj.codigo + '\'';
                                }
                            });
                        }
                        else {
                            verificador = 1;
                        }
                    }
                }
            }
            else {
                codigos = '\'' + codigo + '\'';
            }
            //console.log('ver codigo1 ', codigos)
            //console.log('ver empleados 1 ', EMPLEADO.rows)
            if (verificador === 0) {
                //console.log('ver codigo ', codigos)
                const ASISTENCIA = yield database_1.default.query("SELECT p_g.*, p_g.fec_hora_horario::time AS hora_horario, p_g.fec_hora_horario::date AS fecha_horario, " +
                    "p_g.fec_hora_timbre::date AS fecha_timbre, p_g.fec_hora_timbre::time AS hora_timbre, " +
                    "empleado.cedula, empleado.nombre, empleado.apellido " +
                    "FROM plan_general p_g " +
                    "INNER JOIN empleados empleado on empleado.codigo = p_g.codigo AND p_g.codigo IN (" + codigos + ")" +
                    "WHERE p_g.fec_horario BETWEEN $1 AND $2 " +
                    "ORDER BY p_g.fec_hora_horario ASC", [inicio, fin]);
                if (ASISTENCIA.rowCount === 0) {
                    return res.status(404).jsonp({ message: 'vacio' });
                }
                else {
                    return res.jsonp({ message: 'OK', respuesta: ASISTENCIA.rows });
                }
            }
            else {
                return res.status(404).jsonp({ message: 'vacio' });
            }
        });
    }
}
exports.ASISTENCIA_CONTROLADOR = new AsistenciaControlador();
exports.default = exports.ASISTENCIA_CONTROLADOR;
