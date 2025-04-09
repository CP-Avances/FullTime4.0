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
exports.RegistrarAsistenciaByTimbres = void 0;
const database_1 = __importDefault(require("../database"));
const HORA_EJECUTA_PROCESO = 12;
function ListaTimbresDiarioToEmpleado(hoy) {
    return __awaiter(this, void 0, void 0, function* () {
        // aqui falta definir si es entrada, salida, entrada de almuerzo y salida de almuerzo === o crear mas funciones para cada uno
        return yield database_1.default.query(`
        SELECT codigo, CAST(fecha_hora_timbre AS VARCHAR) 
        FROM eu_timbres 
        WHERE CAST(fecha_hora_timbre AS VARCHAR) like $1 || \'%\'
        `, [hoy])
            .then(result => {
            return result.rows.map((obj) => {
                return {
                    codigo: obj.codigo,
                    fec_hora_timbre: obj.fecha_hora_timbre
                };
            });
        });
    });
}
/**********************************************
 *
 *      METODO PARA REGISTRAR ASISTENCIA.
 *
 ***********************************************/
const RegistrarAsistenciaByTimbres = function () {
    return __awaiter(this, void 0, void 0, function* () {
        setInterval(() => __awaiter(this, void 0, void 0, function* () {
            var f = new Date();
            let hora = f.getHours();
            console.log(f.toString());
            console.log('======================================');
            if (hora === HORA_EJECUTA_PROCESO) {
                f.setUTCHours(f.getHours());
                f.setDate(f.getDate() - 5); // para realizar pruebas
                let hoy = f.toJSON().split("T")[0];
                // let rango_dias = ObtenerRango();
                // console.log(rango_dias);
                let timbresEmpleado = yield ListaTimbresDiarioToEmpleado(hoy);
                console.log(timbresEmpleado);
            }
            console.log('======================================');
        }), 1000000);
    });
};
exports.RegistrarAsistenciaByTimbres = RegistrarAsistenciaByTimbres;
