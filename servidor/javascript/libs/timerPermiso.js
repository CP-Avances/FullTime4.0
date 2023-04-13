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
exports.conteoPermisos = void 0;
const database_1 = __importDefault(require("../database"));
function sumaDias(fecha, dias) {
    fecha.setDate(fecha.getDate() + dias);
    return fecha;
}
// funcion para contabilizar el tiempo utilizado de los permisos 
const conteoPermisos = function () {
    setInterval(() => __awaiter(this, void 0, void 0, function* () {
        var f = new Date();
        console.log(f.toLocaleDateString() + ' ' + f.toLocaleTimeString());
        let hora = parseInt(f.toLocaleTimeString().split(':')[0]);
        let fecha = f.toJSON().split('T')[0];
        console.log(hora);
        console.log(fecha);
        f.setUTCHours(hora); // le resta las 5 horas de la zona horaria
        console.log(f.toJSON());
        if (hora === 0) {
            let permiso = yield database_1.default.query('SELECT p.descripcion, p.fec_inicio, p.fec_final, p.hora_numero, p.id_peri_vacacion, e.id AS id_empleado FROM permisos p, empl_contratos con, empleados e WHERE CAST(p.fec_final AS VARCHAR) LIKE $1 || \'%\' AND p.estado like \'Aceptado\' AND con.id = p.id_empl_contrato AND con.id_empleado = e.id ORDER BY p.fec_final DESC', [fecha]);
            if (permiso.rowCount > 0) {
                console.log(permiso.rows);
                permiso.rows.forEach((obj) => __awaiter(this, void 0, void 0, function* () {
                    let timbre = yield database_1.default.query('SELECT fec_hora_timbre FROM timbres WHERE id_empleado = $1', [obj.id_empleado]);
                    console.log(timbre.rows);
                }));
            }
        }
    }), 100000);
};
exports.conteoPermisos = conteoPermisos;
/*
    console.log(date.toJSON()); // 2020-08-17T22:18:30.359Z
    console.log(date.toLocaleDateString()); // 2020-8-17
    console.log(date.toLocaleTimeString()); // 17:18:30
*/ 
