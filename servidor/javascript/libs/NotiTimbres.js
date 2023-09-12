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
exports.NotificacionTimbreAutomatica = void 0;
const database_1 = __importDefault(require("../database"));
const MINUTO_TIMER = 59;
// const MINUTO_TIMER = 4; // de prueba
const NotificacionTimbreAutomatica = function () {
    setInterval(() => __awaiter(this, void 0, void 0, function* () {
        var f = new Date();
        // console.log(f.getMinutes());
        if (f.getMinutes() === MINUTO_TIMER) {
            console.log('FECHA:', f.toLocaleDateString(), 'HORA:', f.toLocaleTimeString(), ' F ', f);
            if (f != null) {
                var d = f.toLocaleDateString().split('/')[1];
                var m = f.toLocaleDateString().split('/')[0];
                var a = f.toLocaleDateString().split('/')[2];
                f.setUTCDate(parseInt(d));
                // f.setUTCDate(15);
                f.setUTCMonth(parseInt(m) - 1);
                f.setUTCFullYear(parseInt(a));
                console.log('-----6 ', f.toJSON());
                // let hora: number = parseInt(f.toLocaleTimeString().split(':')[0]);
                let hora = 9; // =====> solo para probar
                f.setUTCHours(hora);
                console.log('----7 ', f.toJSON());
                if (f != null && f.toJSON() != null) {
                    var fecha = f.toJSON().split('T')[0];
                    var h = f.toJSON().split('T')[1];
                    let retorno = yield CalcularHoras(fecha, h.split(':')[0]);
                    console.log('Retorno final:', retorno);
                }
                //let retorno = await CalcularHoras(fecha, h.split(':')[0]);
                //console.log('Retorno final:', retorno);
            }
        }
    }), 60000);
};
exports.NotificacionTimbreAutomatica = NotificacionTimbreAutomatica;
function CalcularHoras(fecha, hora) {
    return __awaiter(this, void 0, void 0, function* () {
        let datoConsulta = fecha + ' ' + hora;
        console.log('FECHA ====>', datoConsulta);
        let timbres = yield database_1.default.query('SELECT CAST(fec_hora_timbre AS VARCHAR), accion, codigo, id FROM timbres WHERE CAST(fec_hora_timbre AS VARCHAR) LIKE $1 || \'%\'', [datoConsulta])
            .then((result) => { return result.rows; });
        console.log(timbres);
        if (timbres.length > 0) {
            for (let i = 0; i < timbres.length; i++) {
                const { fec_hora_timbre, accion, id_empleado, id } = timbres[i];
                const fecha = fec_hora_timbre.split(' ')[0];
                const time = fec_hora_timbre.split(' ')[1];
                let h = tiempoToSegundos(time.split('.')[0]);
                // console.log(time);
                // console.log(h);
                let tiempo_horario;
                let estado;
                switch (accion) {
                    case 'E':
                        tiempo_horario = yield HorarioEmpleado(id_empleado, 1, fecha);
                        if (!tiempo_horario.err) {
                            estado = Atrasos(tiempo_horario.tiempo, h);
                        }
                        break;
                    case 'I/A':
                        tiempo_horario = yield HorarioEmpleado(id_empleado, 2, fecha);
                        if (!tiempo_horario.err) {
                            estado = SalidasAntesAlmuerzo(tiempo_horario.tiempo, h);
                        }
                        break;
                    case 'F/A':
                        tiempo_horario = yield HorarioEmpleado(id_empleado, 3, fecha);
                        if (!tiempo_horario.err) {
                            estado = AtrasosAlmuerzo(tiempo_horario.tiempo, h);
                        }
                        break;
                    case 'S':
                        tiempo_horario = yield HorarioEmpleado(id_empleado, 4, fecha);
                        if (!tiempo_horario.err) {
                            estado = SalidasAntes(tiempo_horario.tiempo, h);
                        }
                        break;
                    // case 'EoS':
                    //     tiempo_horario = await HorarioEmpleado(id_empleado, 4);
                    //     estado = SalidasAntes(tiempo_horario.tiempo, h)
                    // break;
                    // case 'AES':
                    //     tiempo_horario = await HorarioEmpleado(id_empleado, 4);
                    //     estado = SalidasAntes(tiempo_horario.tiempo, h)
                    // break;
                    default:
                        let text = "El timbre es permiso";
                        break;
                }
                console.log('Tiempo Horario =======>>>>>>>>>>>>>>', tiempo_horario);
                console.log('Estado =======>>>>>>>>>>>>>>', estado);
                if ((estado === null || estado === void 0 ? void 0 : estado.bool) === true) { //es atraso
                    if ((tiempo_horario === null || tiempo_horario === void 0 ? void 0 : tiempo_horario.arrayJefes) !== undefined) {
                        const mensaje = estado === null || estado === void 0 ? void 0 : estado.message;
                        tiempo_horario === null || tiempo_horario === void 0 ? void 0 : tiempo_horario.arrayJefes.forEach((element) => __awaiter(this, void 0, void 0, function* () {
                            try {
                                yield database_1.default.query('INSERT INTO realtime_timbres(create_at, id_send_empl, id_receives_empl, descripcion, id_timbre) VALUES($1,$2,$3,$4,$5)', [fec_hora_timbre, id_empleado, element.empleado, mensaje, id])
                                    .then((result) => {
                                    console.log('notificacion enviada');
                                });
                            }
                            catch (error) {
                                return { err: error.toString() };
                            }
                        }));
                    }
                }
            }
            return 0;
        }
        return 0;
    });
}
function HorarioEmpleado(codigo, orden, fecha) {
    return __awaiter(this, void 0, void 0, function* () {
        /*
            let [IdCgHorario] = await pool.query('SELECT id_horarios, id_empl_cargo FROM empl_horarios WHERE codigo = $1 AND estado = 1 AND fec_inicio <= $2 AND fec_final >= $2 ORDER BY fec_inicio DESC LIMIT 1', [codigo, fecha])
                .then((result: any) => { return result.rows })
        
            console.log('id Catalogo Horario ===>', IdCgHorario);
            if (IdCgHorario === undefined) return { err: 'No hay horarios en esa fecha' }
        
            let [hora_detalle] = await pool.query('SELECT hora, minu_espera FROM deta_horarios WHERE id_horario = $1 AND orden = $2', [IdCgHorario.id_horarios, orden])
                .then((result: any) => {
                    return result.rows.map((obj: any) => {
                        return SegundosTotal(obj.hora, obj.minu_espera)
                    })
                })
        
            console.log('Hora detalle ===>', hora_detalle);
            if (hora_detalle === undefined) return { err: 'No hay detalle horario' }
        
        
            let JefesDepartamentos = await pool.query('SELECT da.estado, cg.id AS id_dep, cg.depa_padre, cg.nivel, s.id AS id_suc, e.id AS empleado ' +
                'FROM depa_autorizaciones AS da, empl_cargos AS ecr, cg_departamentos AS cg, sucursales AS s, empl_contratos AS ecn, empleados AS e ' +
                'WHERE da.estado = true AND ecr.id = $1 AND cg.id = ecr.id_departamento AND da.id_empl_cargo = ecr.id AND da.id_departamento = cg.id ' +
                'AND cg.id_sucursal = s.id AND ecr.id_empl_contrato = ecn.id AND ecn.id_empleado = e.id ', [IdCgHorario.id_empl_cargo])
                .then((result: any) => { return result.rows });
        
            if (JefesDepartamentos.length === 0) return { err: 'No hay jefes de departamentos.' }
        
            let depa_padre = JefesDepartamentos[0].depa_padre;
            let JefeDepaPadre;
        
            if (depa_padre !== null) {
                console.log('ID PADRE >>>>>>>>>>>>>>>>>>>', depa_padre);
                do {
                    JefeDepaPadre = await pool.query('SELECT da.estado, cg.id AS id_dep, cg.depa_padre, cg.nivel, s.id AS id_suc, e.id AS empleado FROM depa_autorizaciones AS da, empl_cargos AS ecr, cg_departamentos AS cg, sucursales AS s, empl_contratos AS ecn, empleados AS e WHERE da.estado = true AND da.id_departamento = $1 AND da.id_empl_cargo = ecr.id AND da.id_departamento = cg.id AND cg.id_sucursal = s.id AND ecr.id_empl_contrato = ecn.id AND ecn.id_empleado = e.id', [depa_padre])
                        .then((result: any) => { return result.rows });
        
                    if (JefeDepaPadre.length > 0) {
                        depa_padre = JefeDepaPadre[0].depa_padre;
                        JefesDepartamentos.push(JefeDepaPadre[0]);
                    } else {
                        depa_padre = null
                    }
                } while (depa_padre !== null || JefeDepaPadre.length !== 0);
            }
        
            console.log('************************* jefes *****************');
            console.log(JefesDepartamentos);
            console.log('**********************************************************');
        
        
            return {
                tiempo: hora_detalle,
                arrayJefes: JefesDepartamentos
            };
            */
        return {};
    });
}
function SegundosTotal(hora, minu_espera) {
    let total = tiempoToSegundos(hora) + (minu_espera * 60);
    return total;
}
function tiempoToSegundos(tiempo) {
    let h = parseInt(tiempo.split(':')[0]) * 3600;
    let m = parseInt(tiempo.split(':')[1]) * 60;
    let s = parseInt(tiempo.split(':')[2]);
    return h + m + s;
}
function Atrasos(hora, segundos_timbre) {
    console.log('**************************', hora, '===', segundos_timbre);
    if (hora === undefined)
        return { err: 'No se encontro hora' };
    if (segundos_timbre > hora) {
        return { bool: true, message: 'Llego atrasado al trabajo' };
    }
    return { bool: false, message: 'Llego a tiempo' };
}
function SalidasAntes(hora, hora_timbre) {
    console.log('**************************', hora, '===', hora_timbre);
    if (hora === undefined)
        return { err: 'No se encontro hora' };
    if (hora_timbre < hora) {
        return { bool: true, message: 'Salio antes del trabajo' };
    }
    return { bool: false, message: 'Salio despues' };
}
function SalidasAntesAlmuerzo(hora, hora_timbre) {
    console.log('**************************', hora, '===', hora_timbre);
    if (hora === undefined)
        return { err: 'No se encontro hora' };
    if (hora_timbre < hora) {
        return { bool: true, message: 'Salio antes al almuerzo' };
    }
    return { bool: false, message: 'Salio despues' };
}
function AtrasosAlmuerzo(hora, hora_timbre) {
    console.log('**************************', hora, '===', hora_timbre);
    if (hora === undefined)
        return { err: 'No se encontro hora' };
    if (hora_timbre > hora) {
        return { bool: true, message: 'Se tomo mucho tiempo de almuerzo' };
    }
    return { bool: false, message: 'Llego a tiempo' };
}
