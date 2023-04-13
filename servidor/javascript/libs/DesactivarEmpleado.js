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
const database_1 = __importDefault(require("../database"));
const HORA_EJECUTA = 23;
const DesactivarFinContratoEmpleado = function () {
    setInterval(() => __awaiter(this, void 0, void 0, function* () {
        var f = new Date();
        console.log(f.getHours());
        var d = f.toLocaleDateString().split('-')[2];
        var m = f.toLocaleDateString().split('-')[1];
        var a = f.toLocaleDateString().split('-')[0];
        f.setUTCFullYear(parseInt(a));
        f.setUTCMonth(parseInt(m) - 1);
        f.setUTCDate(parseInt(d));
        // f.setUTCMonth(7);
        // f.setUTCDate(31);
        let hora = parseInt(f.toLocaleTimeString().split(':')[0]);
        // let hora: number = 9; // =====> solo para probar
        f.setUTCHours(hora);
        let fecha = f.toJSON().split('T')[0];
        if (hora === HORA_EJECUTA) {
            console.log(fecha);
            let idsEmpleados_FinContrato = yield database_1.default.query('SELECT DISTINCT id_empleado FROM empl_contratos WHERE CAST(fec_salida AS VARCHAR) LIKE $1 || \'%\' ORDER BY id_empleado DESC', [fecha])
                .then(result => {
                return result.rows;
            });
            console.log(idsEmpleados_FinContrato);
            if (idsEmpleados_FinContrato.length > 0) {
                idsEmpleados_FinContrato.forEach((obj) => __awaiter(this, void 0, void 0, function* () {
                    yield database_1.default.query('UPDATE empleados SET estado = 2 WHERE id = $1', [obj.id_empleado]) // 2 => desactivado o inactivo
                        .then(result => {
                        console.log(result.command, 'EMPLEADO ====>', obj.id_empleado);
                    });
                    yield database_1.default.query('UPDATE usuarios SET estado = false, app_habilita = false WHERE id_empleado = $1', [obj.id_empleado]) // false => Ya no tiene acceso
                        .then(result => {
                        console.log(result.command, 'USUARIO ====>', obj.id_empleado);
                    });
                }));
            }
        }
    }), 3600000);
};
exports.DesactivarFinContratoEmpleado = DesactivarFinContratoEmpleado;
