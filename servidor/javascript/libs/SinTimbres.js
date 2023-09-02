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
exports.NotificacionSinTimbres = void 0;
const database_1 = __importDefault(require("../database"));
const MINUTO_TIMER = 15;
// const MINUTO_TIMER = 5; // de prueba
const NotificacionSinTimbres = function () {
    setInterval(() => __awaiter(this, void 0, void 0, function* () {
        var f = new Date();
        // console.log(f.getMinutes());
        if (f.getMinutes() === MINUTO_TIMER) {
            console.log('FECHA:', f.toLocaleDateString(), 'HORA:', f.toLocaleTimeString());
            if (f != null) {
                var d = f.toLocaleDateString().split('-')[2];
                var m = f.toLocaleDateString().split('-')[1];
                var a = f.toLocaleDateString().split('-')[0];
                f.setUTCFullYear(parseInt(a));
                f.setUTCMonth(parseInt(m) - 1);
                f.setUTCDate(parseInt(d));
                // f.setUTCDate(19);
                console.log(f.toJSON());
                let hora = parseInt(f.toLocaleTimeString().split(':')[0]);
                // let hora: number = 9; // =====> solo para probar
                f.setUTCHours(hora);
                console.log(f.toJSON());
                console.log('Dia===', f.getDay());
                var num_dia = f.getDay();
                if (f.toJSON()) {
                    let fecha = f.toJSON().split('T')[0];
                    var h = f.toJSON().split('T')[1];
                    let horarios = yield LlamarDetalleHorario(fecha, h.split(':')[0], num_dia, f);
                    console.log(horarios);
                }
            }
        }
    }), 60000);
};
exports.NotificacionSinTimbres = NotificacionSinTimbres;
function LlamarDetalleHorario(fecha, hora, num_dia, fechaDate) {
    return __awaiter(this, void 0, void 0, function* () {
        let datoConsulta = fecha + ' ' + hora;
        console.log('FECHA ====>', datoConsulta);
        let deta_horarios = yield database_1.default.query('SELECT orden, id_horario FROM deta_horarios ' +
            'WHERE CAST(hora AS VARCHAR) like $1 || \'%\' AND orden in (1,4)', [hora])
            .then(result => {
            return result.rows;
        });
        console.log('===========', deta_horarios.length);
        if (deta_horarios.length === 0)
            return 'No hay Horario';
        deta_horarios.forEach(obj => {
            console.log(obj);
            MetodoNorificacionEntradas(obj.orden, fecha, num_dia, fechaDate);
        });
    });
}
function MetodoNorificacionEntradas(orden, fecha, num_dia, fechaDate) {
    return __awaiter(this, void 0, void 0, function* () {
        let IdsEmpleadosActivos = yield database_1.default.query('SELECT DISTINCT id FROM empleados WHERE estado = 1 ORDER BY id')
            .then(res => {
            return res.rows.map(obj => {
                return obj.id;
            });
        });
        if (orden === 1) { // Orden 1 es para las entradas. 
            let arrayIdsEmpleadosSinTimbres = yield EmpleadosSinTimbreEntrada(fecha, IdsEmpleadosActivos);
            console.log(arrayIdsEmpleadosSinTimbres);
            if (arrayIdsEmpleadosSinTimbres.length > 0) {
                var descripcion = 'Te falta timbre de entrada';
                arrayIdsEmpleadosSinTimbres.forEach((obj) => __awaiter(this, void 0, void 0, function* () {
                    yield RegistrarNotificacion(obj, num_dia, fechaDate, descripcion);
                }));
            }
            return 'Proceso terminado Entradas';
        }
        else if (orden === 4) { // Orden 4 es para las salidas
            let arrayIdsEmpleadosSinTimbres = yield EmpleadosSinTimbreSalida(fecha, IdsEmpleadosActivos);
            console.log(arrayIdsEmpleadosSinTimbres);
            if (arrayIdsEmpleadosSinTimbres.length > 0) {
                var descripcion = 'Te falta timbre de salida';
                arrayIdsEmpleadosSinTimbres.forEach((obj) => __awaiter(this, void 0, void 0, function* () {
                    yield RegistrarNotificacion(obj, num_dia, fechaDate, descripcion);
                }));
            }
            return 'Proceso terminado salidas';
        }
        return 'Proceso terminado';
    });
}
function EmpleadosSinTimbreEntrada(fecha, arrayIdsEmpleadosActivos) {
    return __awaiter(this, void 0, void 0, function* () {
        let IdsEmpleadosConTimbres = yield database_1.default.query(`
        SELECT DISTINCT e.id FROM empleados AS e, timbres AS t 
        WHERE e.codigo::int = t.id_empleado AND e.estado = 1 AND CAST(t.fec_hora_timbre AS VARCHAR) LIKE $1 || 
        '%' AND accion in ('E', 'EoS') ORDER BY id
        `, [fecha])
            .then(result => {
            return result.rows.map(obj => {
                return obj.id;
            });
        });
        IdsEmpleadosConTimbres.forEach(obj => {
            let pop = arrayIdsEmpleadosActivos.indexOf(obj);
            arrayIdsEmpleadosActivos.splice(pop, 1);
        });
        return arrayIdsEmpleadosActivos;
    });
}
function EmpleadosSinTimbreSalida(fecha, arrayIdsEmpleadosActivos) {
    return __awaiter(this, void 0, void 0, function* () {
        let IdsEmpleadosConTimbres = yield database_1.default.query(`
        SELECT DISTINCT e.id FROM empleados AS e, timbres AS t 
        WHERE e.codigo::int = t.id_empleado AND e.estado = 1 AND 
            CAST(t.fec_hora_timbre AS VARCHAR) LIKE $1 || '%' AND accion in ('S', 'EoS') ORDER BY id
        `, [fecha])
            .then(result => {
            return result.rows.map(obj => {
                return obj.id;
            });
        });
        IdsEmpleadosConTimbres.forEach(obj => {
            let pop = arrayIdsEmpleadosActivos.indexOf(obj);
            arrayIdsEmpleadosActivos.splice(pop, 1);
        });
        return arrayIdsEmpleadosActivos;
    });
}
function RegistrarNotificacion(id_empleado, num_dia, fechaDate, descripcion) {
    return __awaiter(this, void 0, void 0, function* () {
        let IdUltimoCargo = yield database_1.default.query('SELECT ca.id AS id_cargo FROM empl_contratos AS co, empl_cargos AS ca WHERE co.id_empleado = $1 AND ca.id_empl_contrato = co.id ORDER BY co.fec_ingreso DESC , ca.fec_inicio DESC LIMIT 1', [id_empleado])
            .then(result => { return result.rows[0]; });
        if (IdUltimoCargo === undefined)
            return 'Sin cargo';
        let horario;
        /*
        switch (num_dia) {
            case 0: //DOMINGO
                horario = await pool.query('SELECT domingo FROM empl_horarios WHERE id_empl_cargo = $1 AND estado = 1 ORDER BY fec_inicio DESC LIMIT 1', [IdUltimoCargo.id_cargo])
                    .then(result => {
                        return result.rows.map(obj => {
                            var dias_Horario = [];
                            dias_Horario.push(obj.domingo);
                            return dias_Horario
                        })[0];
                    });
                break;
            case 1: //LUNES
                horario = await pool.query('SELECT lunes FROM empl_horarios WHERE id_empl_cargo = $1 AND estado = 1 ORDER BY fec_inicio DESC LIMIT 1', [IdUltimoCargo.id_cargo])
                    .then(result => {
                        return result.rows.map(obj => {
                            var dias_Horario = [];
                            dias_Horario.push(obj.lunes);
                            return dias_Horario
                        })[0];
                    });
                break;
            case 2: //MARTES
                horario = await pool.query('SELECT martes FROM empl_horarios WHERE id_empl_cargo = $1 AND estado = 1 ORDER BY fec_inicio DESC LIMIT 1', [IdUltimoCargo.id_cargo])
                    .then(result => {
                        return result.rows.map(obj => {
                            var dias_Horario = [];
                            dias_Horario.push(obj.martes);
                            return dias_Horario
                        })[0];
                    });
                break;
            case 3: //MIERCOLES
                horario = await pool.query('SELECT miercoles FROM empl_horarios WHERE id_empl_cargo = $1 AND estado = 1 ORDER BY fec_inicio DESC LIMIT 1', [IdUltimoCargo.id_cargo])
                    .then(result => {
                        return result.rows.map(obj => {
                            var dias_Horario = [];
                            dias_Horario.push(obj.miercoles);
                            return dias_Horario
                        })[0];
                    });
                break;
            case 4: //JUEVES
                horario = await pool.query('SELECT jueves FROM empl_horarios WHERE id_empl_cargo = $1 AND estado = 1 ORDER BY fec_inicio DESC LIMIT 1', [IdUltimoCargo.id_cargo])
                    .then(result => {
                        return result.rows.map(obj => {
                            var dias_Horario = [];
                            dias_Horario.push(obj.jueves);
                            return dias_Horario
                        })[0];
                    });
                break;
            case 5: //VIERNES
                horario = await pool.query('SELECT viernes FROM empl_horarios WHERE id_empl_cargo = $1 AND estado = 1 ORDER BY fec_inicio DESC LIMIT 1', [IdUltimoCargo.id_cargo])
                    .then(result => {
                        return result.rows.map(obj => {
                            var dias_Horario = [];
                            dias_Horario.push(obj.viernes);
                            return dias_Horario
                        })[0];
                    });
                break;
            default: //SABADO
                horario = await pool.query('SELECT sabado FROM empl_horarios WHERE id_empl_cargo = $1 AND estado = 1 ORDER BY fec_inicio DESC LIMIT 1', [IdUltimoCargo.id_cargo])
                    .then(result => {
                        return result.rows.map(obj => {
                            var dias_Horario = [];
                            dias_Horario.push(obj.sabado);
                            return dias_Horario
                        })[0];
                    });
                    
        }*/
        if (horario === undefined)
            return 'Sin Horario';
        console.log(horario, '====', id_empleado);
        if (horario[0] === false) {
            yield database_1.default.query('INSERT INTO realtime_timbres(create_at, id_send_empl, id_receives_empl, descripcion) VALUES($1, $2, $3, $4)', [fechaDate, id_empleado, id_empleado, descripcion])
                .then(res => {
                console.log(res.command, '=====', id_empleado);
            });
            return 0;
        }
        return 0;
    });
}
// let o = await pool.query('SELECT id_empl_cargo, lunes, martes, miercoles, jueves, viernes, sabado, domingo FROM empl_horarios WHERE id_empl_cargo = $1 ORDER BY fec_inicio DESC LIMIT 1',[IdUltimoCargo.id_cargo])
// .then(result => { 
//     return result.rows.map(obj => {
//         var dias_Horario = [];
//         dias_Horario.push(obj.domingo);
//         dias_Horario.push(obj.lunes);
//         dias_Horario.push(obj.martes);
//         dias_Horario.push(obj.miercoles);
//         dias_Horario.push(obj.jueves);
//         dias_Horario.push(obj.viernes);
//         dias_Horario.push(obj.sabado);
//         return dias_Horario
//     })[0];
// });
// console.log(o);
