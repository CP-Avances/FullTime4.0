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
exports.DesactivarFinContratoEmpleado = void 0;
const moment_1 = __importDefault(require("moment"));
const database_1 = __importDefault(require("../database"));
const HORA_EJECUTA = 23;
// METODO PARA CAMBIAR EL ESTADO DE ACCESO DE USUARIOS SEGUN FECHA DE FINALIZACION DE CONTRATO
const DesactivarFinContratoEmpleado = function () {
    setInterval(() => __awaiter(this, void 0, void 0, function* () {
        var f = (0, moment_1.default)();
        let hora = parseInt((0, moment_1.default)(f).format('HH'));
        let fecha = (0, moment_1.default)(f).format('YYYY-MM-DD');
        if (hora === HORA_EJECUTA) {
            let idsEmpleados_FinContrato = yield database_1.default.query(`
                SELECT DISTINCT id_empleado FROM empl_contratos WHERE CAST(fec_salida AS VARCHAR) LIKE $1 || \'%\' 
                ORDER BY id_empleado DESC
                `, [fecha])
                .then(result => {
                return result.rows;
            });
            if (idsEmpleados_FinContrato.length > 0) {
                idsEmpleados_FinContrato.forEach((obj) => __awaiter(this, void 0, void 0, function* () {
                    yield database_1.default.query(`
                        UPDATE empleados SET estado = 2 WHERE id = $1
                        `, [obj.id_empleado]) // 2 => DESACTIVADO O INACTIVO
                        .then(result => { });
                    yield database_1.default.query(`
                        UPDATE usuarios SET estado = false, app_habilita = false WHERE id_empleado = $1
                        `, [obj.id_empleado]) // false => YA NO TIENE ACCESO
                        .then(result => { });
                }));
            }
        }
    }), 3600000);
};
exports.DesactivarFinContratoEmpleado = DesactivarFinContratoEmpleado;
