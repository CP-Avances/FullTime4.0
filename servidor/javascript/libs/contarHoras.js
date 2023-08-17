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
exports.ContarHorasByCargoSinAcciones = exports.RegistrarAsistenciaByTimbres = exports.ContarHorasByCargo = void 0;
const database_1 = __importDefault(require("../database"));
const moment_1 = __importDefault(require("moment"));
const HORA_EJECUTA_PROCESO = 12;
function sumaDias(fecha, dias) {
    fecha.setUTCHours(fecha.getHours());
    fecha.setDate(fecha.getDate() + dias);
    return fecha;
}
function restaDias(fecha, dias) {
    fecha.setUTCHours(fecha.getHours());
    fecha.setDate(fecha.getDate() - dias);
    return fecha;
}
function CalcularEntradaAlmuerzo(hora, tiempo_almuerzo) {
    //console.log('LLEGO A CALCULO DE ENTRADA ALMUERZO', hora, '=======>', tiempo_almuerzo);
    let hora_string;
    var x = tiempo_almuerzo / 60; //min a hora
    let h = hora.split(':'); //hora
    var a = parseInt(h[1]) / 60; //min a hora  
    var resultado = parseInt(h[0]) + parseInt(a.toString().split('.')[0]) + x;
    var z = resultado - parseInt(resultado.toString());
    if (resultado <= 9) {
        hora_string = '0' + parseInt(resultado.toString()) + ':' + (z * 60);
    }
    else {
        hora_string = parseInt(resultado.toString()) + ':' + (z * 60);
    }
    return hora_string;
}
function ListaTimbresDiarioToEmpleado(hoy) {
    return __awaiter(this, void 0, void 0, function* () {
        // aqui falta definir si es entrada, salida, entrada de almuerzo y salida de almuerzo === o crear mas funciones para cada uno
        return yield database_1.default.query('SELECT id_empleado, CAST(fec_hora_timbre AS VARCHAR) FROM timbres WHERE CAST(fec_hora_timbre AS VARCHAR) like $1 || \'%\'', [hoy])
            .then(result => {
            return result.rows.map(obj => {
                return {
                    codigo: obj.id_empleado,
                    fec_hora_timbre: obj.fec_hora_timbre
                };
            });
        });
    });
}
function GenerarHorarioEmpleado(id_cargo, inicio, final) {
    return __awaiter(this, void 0, void 0, function* () {
        /*let horarioAnual = await pool.query('SELECT id_horarios, fec_inicio, fec_final, domingo, lunes, martes, miercoles, jueves, viernes, sabado ' +
            'FROM empl_horarios WHERE estado = 1 AND id_empl_cargo = $1 AND CAST(fec_inicio AS VARCHAR) like $2 || \'%\' ORDER BY fec_inicio ASC',
            [id_cargo, inicio.toJSON().split('-')[0]])
            .then(result => {
                return result.rows
            });*/
        //console.log('ver datos anual', id_cargo, inicio.toJSON().split('T')[0], final);
        /* let horarioAnual = await pool.query('SELECT id_horarios, fec_inicio, fec_final, domingo, lunes, ' +
             'martes, miercoles, jueves, viernes, sabado ' +
             'FROM empl_horarios WHERE estado = 1 AND id_empl_cargo = $1 ' +
             'AND $2 BETWEEN CAST(fec_inicio AS VARCHAR) AND CAST(fec_final AS VARCHAR) ' +
             'ORDER BY fec_inicio ASC',
             [id_cargo, inicio.toJSON().split('T')[0]])
             .then(result => {
                 console.log('ver horario anual', result.rows);
                 return result.rows
             });
     */
        /*
        
        
          let horarioAnual = await pool.query('SELECT id_horarios, fec_inicio, fec_final, domingo, lunes, ' +
                'martes, miercoles, jueves, viernes, sabado ' +
                'FROM empl_horarios WHERE estado = 1 AND id_empl_cargo = $1 ' +
                'AND (CAST(fec_inicio AS VARCHAR) BETWEEN $2 AND $3 ' +
                'OR CAST(fec_final AS VARCHAR) BETWEEN $2 AND $3) ' +
                'ORDER BY fec_inicio ASC',
                [id_cargo, inicio.toJSON().split('T')[0], final.toJSON().split('T')[0]])
                .then(result => {
                    console.log('ver horario anual', result.rows);
                    return result.rows
                });
        
        
            console.log('ver tamaño horario --------------------------********************', horarioAnual.length);
        
            // console.log(horarioAnual);
            if (horarioAnual.length === 0) return { message: 'No tienen asignado horario' }
            */
        /* if (horarioAnual.length === 1) { // referencia a horario anual
     
             console.log('enttra a revisar horario anual');
     
             var fecha1 = moment(horarioAnual[0].fec_inicio.toJSON().split("T")[0]);
             var fecha2 = moment(horarioAnual[0].fec_final.toJSON().split("T")[0]);
     
             var diasHorario = fecha2.diff(fecha1, 'days');
     
             console.log('ver tamaño horario', diasHorario);
             if (diasHorario > 300) { // compruebo si es realmente horario anual
                // if (diasHorario > 10) { // compruebo si es realmente horario anual
                 console.log('*************************');
                 console.log('LLEGO A HORARIO ANUAL');
                 console.log('*************************');
                 return HorarioConEstado(horarioAnual, inicio, final)
             }
         }*/
        /*
   
       let horarioMensual = horarioAnual.filter(obj => {
           console.log('entra a revisar mensual 1', obj.fec_inicio.toJSON().split('T')[0], ' ', inicio.toJSON().split('T')[0] + ' ' + final.toJSON().split('T')[0])
           console.log('entra a revisar mensual 2', obj.fec_final.toJSON().split('T')[0], ' ')
           //return (obj.fec_inicio.toJSON().split('T')[0] <= inicio.toJSON().split('T')[0] || obj.fec_final.toJSON().split('T')[0] >= final.toJSON().split('T')[0])
           return (obj.fec_inicio.toJSON().split('T')[0])
       });
       console.log(' ver mensual resultado .....................', horarioMensual);
   
       if (horarioMensual.length === 0) return { message: 'No tiene asignado horario' }
   
       */
        /*  if (horarioMensual.length === 1) { //referencia a un horario mensual
              var fecha1 = moment(horarioMensual[0].fec_inicio.toJSON().split("T")[0]);
              var fecha2 = moment(horarioMensual[0].fec_final.toJSON().split("T")[0]);
      
              var diasHorario = fecha2.diff(fecha1, 'days');
              if (diasHorario > 25) { // compruevo si es realmente horario mensual
                  console.log('*************************');
                  console.log('LLEGO A HORARIO MENSUAL');
                  console.log('*************************');
                  return HorarioConEstado(horarioMensual, inicio, final)
              }
          }*/
        /*   console.log('*************************');
           console.log('LLEGO A SEMANAL');
           console.log('*************************');
           let EstadosHorarioSemanal: any = [];
           horarioMensual.forEach(obj => {
               let arr = HorarioConEstado([obj], obj.fec_inicio, obj.fec_final)
               arr.forEach((ele: any) => {
                   EstadosHorarioSemanal.push(ele)
               });
           });
           // console.log(EstadosHorarioSemanal);
           return EstadosHorarioSemanal.filter((obj: any) => {
               var fecha = new Date(obj.fec_iterada);
               return (fecha >= inicio && fecha <= final)
           });
       */
        return [];
    });
}
function HorarioConEstado(estados, inicio, final) {
    var fecha1 = (0, moment_1.default)(inicio.toJSON().split("T")[0]);
    var fecha2 = (0, moment_1.default)(final.toJSON().split("T")[0]);
    // console.log('ESTADOSSSSSSSS',estados);
    var diasHorario = fecha2.diff(fecha1, 'days');
    let horarioSemanalEstados = [];
    estados.forEach((obj) => {
        horarioSemanalEstados.push(obj.domingo);
        horarioSemanalEstados.push(obj.lunes);
        horarioSemanalEstados.push(obj.martes);
        horarioSemanalEstados.push(obj.miercoles);
        horarioSemanalEstados.push(obj.jueves);
        horarioSemanalEstados.push(obj.viernes);
        horarioSemanalEstados.push(obj.sabado);
    });
    console.log(horarioSemanalEstados);
    let arrayRespuesta = [];
    for (let i = 0; i <= diasHorario; i++) {
        // console.log(inicio.toJSON(),'Dia de la semana',inicio.getUTCDay());
        let objeto = {
            fec_iterada: inicio.toJSON().split('T')[0],
            boolena_fecha: horarioSemanalEstados[inicio.getUTCDay()],
            id_horarios: estados[0].id_horarios
        };
        arrayRespuesta.push(objeto);
        // console.log(inicio.toJSON(),'Dia de la seman: ', inicio.getDay());
        inicio.setDate(inicio.getDate() + 1);
    }
    return arrayRespuesta;
}
function UltimoCargoContrato(id_empleado, desde, hasta) {
    return __awaiter(this, void 0, void 0, function* () {
        /*  let horarios = await pool.query('SELECT ho.id_empl_cargo AS id_cargo, CAST(ho.fec_inicio AS VARCHAR), CAST(ho.fec_final AS VARCHAR), ho.id_horarios, ho.codigo FROM empl_contratos AS co, empl_cargos AS ca, empl_horarios AS ho ' +
              'WHERE co.id_empleado = $1 AND ca.id_empl_contrato = co.id AND ca.id = ho.id_empl_cargo ' +
              'AND CAST(ho.fec_inicio AS VARCHAR) LIKE $2 || \'%\' ORDER BY ho.fec_inicio ASC', [id_empleado, desde.toJSON().split('-')[0]])
              .then(result => {
                  return result.rows;
              })*/
        // console.log('recibimos', id_empleado, desde)
        /*let horarios = await pool.query('SELECT ho.id_empl_cargo AS id_cargo, CAST(ho.fec_inicio AS VARCHAR), ' +
            'CAST(ho.fec_final AS VARCHAR), ho.id_horarios, ho.codigo ' +
            'FROM empl_contratos AS co, empl_cargos AS ca, empl_horarios AS ho ' +
            'WHERE co.id_empleado = $1 AND ca.id_empl_contrato = co.id AND ca.id = ho.id_empl_cargo ' +
            'AND $2 BETWEEN CAST(ho.fec_inicio AS VARCHAR) AND CAST(ho.fec_final AS VARCHAR) ' +
            'ORDER BY ho.fec_inicio ASC', [id_empleado, desde.toJSON().split('T')[0],
            hasta.toJSON().split('T')[0]])
            .then(result => {
                return result.rows;
            })*/
        /*
            let horarios = await pool.query('SELECT ho.id_empl_cargo AS id_cargo, CAST(ho.fec_inicio AS VARCHAR), ' +
                'CAST(ho.fec_final AS VARCHAR), ho.id_horarios, ho.codigo ' +
                'FROM empl_contratos AS co, empl_cargos AS ca, empl_horarios AS ho ' +
                'WHERE co.id_empleado = $1 AND ca.id_empl_contrato = co.id AND ca.id = ho.id_empl_cargo ' +
                'AND (CAST(ho.fec_inicio AS VARCHAR) BETWEEN $2 AND $3 ' +
                'OR CAST(ho.fec_final AS VARCHAR) BETWEEN $2 AND $3)  ' +
                'ORDER BY ho.fec_inicio ASC', [id_empleado, desde.toJSON().split('T')[0],
                hasta.toJSON().split('T')[0]])
                .then(result => {
                    return result.rows;
                })
        
            if (horarios.length === 0) return { message: 'No tienen horarios' }
        
            let set = new Set(horarios.map(obj => { return JSON.stringify(obj) }))
            let arrSinDuplicaciones = Array.from(set).map(obj => { return JSON.parse(obj) });
        
            //console.log('ver resultado', arrSinDuplicaciones)
            return arrSinDuplicaciones
            */
    });
}
function ListaTimbresDiario(hoy, codigo, bool, id_horarios, IhorarioLaboral, empleado) {
    return __awaiter(this, void 0, void 0, function* () {
        let timbres = yield database_1.default.query('SELECT CAST(fec_hora_timbre AS VARCHAR), accion, tecl_funcion FROM timbres ' +
            'WHERE id_empleado = $2 AND CAST(fec_hora_timbre AS VARCHAR) like $1 || \'%\' ' +
            'ORDER BY fec_hora_timbre ASC', [hoy, codigo])
            .then(result => { return result.rows; });
        // console.log('ES EL TIMBRE: ', timbres);
        if (timbres.length === 0) {
            let feriados = yield database_1.default.query('SELECT f.id, f.fecha FROM cg_feriados AS f, ciud_feriados  AS cf, ' +
                'ciudades AS c WHERE cf.id_feriado = f.id AND c.id = cf.id_ciudad AND ' +
                'UPPER(c.descripcion) = $2 AND f.fecha = $1', [hoy, (empleado[0].descripcion).toUpperCase()])
                .then(result => { return result.rows; });
            //console.log('FERIADO **************************** ', feriados);
            if (feriados.length === 0) {
                var dia = 'L';
            }
            else {
                dia = 'F';
            }
            return [{
                    fec_hora_timbre: hoy,
                    accion: dia,
                    tecl_funcion: 0,
                    labora: bool,
                    id_horarios: id_horarios,
                    orden: 0
                }];
        }
        let nuevo = timbres.map(obj => {
            //console.log('****************************************', obj)
            return {
                fec_hora_timbre: obj.fec_hora_timbre,
                accion: obj.accion,
                tecl_funcion: obj.tecl_funcion,
                labora: bool,
                id_horarios: id_horarios,
                orden: IhorarioLaboral.map((mapping1) => {
                    return mapping1.datos.filter(o => {
                        const seg_hora_horario = HHMMtoSegundos(o.hora.slice(0, 5));
                        let seg_med_i = 0;
                        let seg_med_f = 0;
                        if (bool === true) {
                            //console.log('HORARIO LIBRE**********************************')
                            seg_med_i = HHMMtoSegundos('01:30');
                            seg_med_f = HHMMtoSegundos('01:40');
                        }
                        else {
                            seg_med_i = HHMMtoSegundos('00:19');
                            seg_med_f = HHMMtoSegundos('00:22');
                        }
                        let fi_hora = seg_hora_horario - seg_med_i;
                        let ff_hora = seg_hora_horario + seg_med_f;
                        let hora_timbre = HHMMtoSegundos(obj.fec_hora_timbre.split(' ')[1].slice(0, 5));
                        return (hora_timbre >= fi_hora && hora_timbre <= ff_hora);
                    }).map(mapping2 => {
                        return mapping2.orden;
                    })[0];
                })[0]
            };
        });
        // console.log('ES MODELADO NUEVO: ',nuevo);
        return nuevo;
    });
}
function DiaEspaniol(dia) {
    //let nom_dia = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb']
    let nom_dia = ['Domingo.', 'Lunes.', 'Martes.', 'Miércoles.', 'Jueves.', 'Viernes.', 'Sábado.'];
    return nom_dia[dia.getUTCDay()];
}
function CalcularCamposFaltantes(obj, labora, accion) {
    //console.log('ver fer 5555555555555555555555555555555555555', accion)
    // var x = new Date(obj.fecha);
    // console.log(obj.fecha, '===========' , x.getDay(), '=========', labora);
    if (obj.E.hora_timbre === '' && labora === false && accion != 'F') { //false => son dias normales
        obj.E.descripcion = 'FT';
    }
    if (obj.S_A.hora_timbre === '' && labora === false && accion != 'F') {
        obj.S_A.descripcion = 'FT';
    }
    if (obj.E_A.hora_timbre === '' && labora === false && accion != 'F') {
        obj.E_A.descripcion = 'FT';
    }
    if (obj.S.hora_timbre === '' && labora === false && accion != 'F') {
        obj.S.descripcion = 'FT';
    }
    if (labora === true) { //true => son dias libres
        obj.E.descripcion = 'L';
        obj.S_A.descripcion = 'L';
        obj.E_A.descripcion = 'L';
        obj.S.descripcion = 'L';
    }
    if (obj.E.hora_timbre === '' && labora === false && accion === 'F') { //false => son dias normales
        obj.E.descripcion = 'F';
    }
    if (obj.S_A.hora_timbre === '' && labora === false && accion === 'F') {
        obj.S_A.descripcion = 'F';
    }
    if (obj.E_A.hora_timbre === '' && labora === false && accion === 'F') {
        obj.E_A.descripcion = 'F';
    }
    if (obj.S.hora_timbre === '' && labora === false && accion === 'F') {
        obj.S.descripcion = 'F';
    }
    if (obj.E.hora_timbre != '' && labora === false) { //false => son dias normales
        obj.E.descripcion = 'R';
    }
    if (obj.S_A.hora_timbre != '' && labora === false) {
        obj.S_A.descripcion = 'R';
    }
    if (obj.E_A.hora_timbre != '' && labora === false) {
        obj.E_A.descripcion = 'R';
    }
    if (obj.S.hora_timbre != '' && labora === false) {
        obj.S.descripcion = 'R';
    }
    return obj;
}
function HHMMtoSegundos(dato) {
    if (dato === '')
        return 0;
    if (dato === null)
        return 0;
    // if (dato === 0) return 0
    // console.log(dato);
    var h = parseInt(dato.split(':')[0]) * 3600;
    var m = parseInt(dato.split(':')[1]) * 60;
    return h + m;
}
function SegundosToHHMM(dato) {
    // console.log('Hora decimal a HHMM ======>',dato);
    var h = Math.floor(dato / 3600);
    var m = Math.floor((dato % 3600) / 60);
    if (h <= -1) {
        return '00:00';
    }
    let hora = (h >= 10) ? h : '0' + h;
    let min = (m >= 10) ? m : '0' + m;
    return hora + ':' + min;
}
function CalcularSalidasAntes(S_almuerzo, S_labor) {
    if (S_almuerzo.hora_timbre === '' && S_labor.hora_timbre === '')
        return '00:00';
    let al_def;
    let al_tim;
    let la_def;
    let la_tim;
    al_def = HHMMtoSegundos(S_almuerzo.hora_default);
    al_tim = HHMMtoSegundos(S_almuerzo.hora_timbre);
    la_def = HHMMtoSegundos(S_labor.hora_default);
    la_tim = HHMMtoSegundos(S_labor.hora_timbre);
    if (S_almuerzo.hora_timbre === '') {
        al_def = 0;
    }
    if (S_labor.hora_timbre === '') {
        la_def = 0;
    }
    let sum1 = (la_def > la_tim) ? la_def - la_tim : 0;
    let sum2 = (al_def > al_tim) ? al_def - al_tim : 0;
    var t = SegundosToHHMM(sum1 + sum2);
    return t;
}
function CalcularAlmuerzo(S_almuerzo, E_almuerzo) {
    var _s = HHMMtoSegundos(S_almuerzo.hora_default);
    var _e = HHMMtoSegundos(E_almuerzo.hora_default);
    if (S_almuerzo.hora_timbre === '' || E_almuerzo.hora_timbre === '')
        return SegundosToHHMM(_e - _s);
    let s_tim = HHMMtoSegundos(S_almuerzo.hora_timbre);
    let e_tim = HHMMtoSegundos(E_almuerzo.hora_timbre);
    return SegundosToHHMM(e_tim - s_tim);
}
function CalcularAtraso(h_default, h_timbre, minu_espera) {
    if (h_default === '')
        return '00:00';
    if (h_timbre === '')
        return '00:00';
    // if (minu_espera === 0) {
    //     minu_espera = '00:00'
    // } 
    // console.log('Horas',h_default, h_timbre, minu_espera);
    var def = parseInt(h_default.split(':')[0]) + (parseInt(h_default.split(':')[1]) / 60);
    var espera = (minu_espera / 60) + (def);
    var timbre = parseInt(h_timbre.split(':')[0]) + (parseInt(h_timbre.split(':')[1]) / 60);
    if (timbre < espera) {
        return '00:00';
    }
    var x = timbre - espera;
    var y = parseInt(x.toString());
    var a = x * 60;
    var z = parseInt(a.toString());
    let hora;
    let min;
    if (y < 10 && z < 10) {
        hora = '0' + y;
        min = '0' + z;
    }
    else if (y < 10 && z >= 10) {
        hora = '0' + y;
        min = z;
    }
    else if (y >= 10 && z < 10) {
        hora = y;
        min = '0' + z;
    }
    else if (y >= 10 && z >= 10) {
        hora = y;
        min = z;
    }
    // console.log(hora + ':' + min)
    return hora + ':' + min;
}
function CalcularHorasTrabaja(entrada, salida, atraso, salida_antes, almuerzo) {
    // console.log(entrada, salida, atraso, salida_antes, almuerzo);    
    if (entrada.descripcion === 'L' && salida.descripcion === 'L' &&
        entrada.hora_timbre === '' && salida.hora_timbre === '')
        return '00:00';
    if (entrada.descripcion === 'F' && salida.descripcion === 'F' &&
        entrada.hora_timbre === '' && salida.hora_timbre === '')
        return '00:00';
    if (entrada.hora_timbre === '' && salida.hora_timbre === '') {
        var _e = HHMMtoSegundos(entrada.hora_default);
        let _s = HHMMtoSegundos(salida.hora_default);
        var _a = HHMMtoSegundos(almuerzo);
        // console.log(_s -_e - _a);
        if (_s > _e) {
            return SegundosToHHMM(_s - _e - _a);
        }
        else if (_e > _s) {
            _e = 24 - _e;
            return SegundosToHHMM((_s + _e) - _a);
        }
    }
    var _e = HHMMtoSegundos(entrada.hora_timbre);
    var _s = HHMMtoSegundos(salida.hora_timbre);
    var _a = HHMMtoSegundos(almuerzo);
    let _res;
    if (_s > _e) {
        _res = SegundosToHHMM(_s - _e - _a);
    }
    else if (_e > _s) {
        _e = 24 - _e;
        _res = SegundosToHHMM((_s + _e) - _a);
    }
    return _res;
}
function AsistenciaDetalleConsolidado(arr, IhorarioLaboral, id_cargo) {
    console.log('Metodo asistencia detalle consolidado:', IhorarioLaboral);
    let AsistenciaArray = [];
    // let salidaGeneral = CalculoHoraSalida(IhorarioLaboral);
    arr.forEach((result) => {
        // console.log(result);
        let detalleAsistencia = {
            fecha: '',
            fecha_mostrar: '',
            E: {
                hora_default: '',
                hora_timbre: '',
                descripcion: ''
            },
            S_A: {
                hora_default: '',
                hora_timbre: '',
                descripcion: ''
            },
            E_A: {
                hora_default: '',
                hora_timbre: '',
                descripcion: ''
            },
            S: {
                hora_default: '',
                hora_timbre: '',
                descripcion: ''
            },
            atraso: null || '',
            sal_antes: null || '',
            almuerzo: null || '',
            hora_trab: null || '',
            hora_supl: null || '',
            hora_ex_L_V: null || '',
            hora_ex_S_D: null || ''
        };
        let contador = 0;
        result.forEach((obj) => {
            //console.log('ver data f ++++++++++++++++++++++++++++++++++++++++++', obj);
            IhorarioLaboral.filter((ele_filtro) => { return (obj.id_horarios === ele_filtro.id_horario); })
                .map((ele_map) => {
                //console.log('LENGTH DE ELE_MAP:', ele_map);
                let entrada_default = ele_map.datos[0].hora.slice(0, 5);
                let salida_almuerzo_default = ele_map.datos[1].hora.slice(0, 5);
                let entrada_almuerzo_default = ele_map.datos[2].hora.slice(0, 5);
                let salida_default = ele_map.datos[3].hora.slice(0, 5);
                // Fecha
                detalleAsistencia.fecha = obj.fec_hora_timbre;
                detalleAsistencia.fecha_mostrar = DiaEspaniol(new Date(obj.fec_hora_timbre.split(' ')[0])) + ' ' + obj.fec_hora_timbre.split(' ')[0];
                switch (obj.orden) {
                    case 1:
                        detalleAsistencia.E.hora_timbre = obj.fec_hora_timbre.split(' ')[1].slice(0, 5);
                        break;
                    case 2:
                        detalleAsistencia.S_A.hora_timbre = obj.fec_hora_timbre.split(' ')[1].slice(0, 5);
                        break;
                    case 3:
                        detalleAsistencia.E_A.hora_timbre = obj.fec_hora_timbre.split(' ')[1].slice(0, 5);
                        break;
                    case 4:
                        detalleAsistencia.S.hora_timbre = obj.fec_hora_timbre.split(' ')[1].slice(0, 5);
                        break;
                    default:
                        break;
                }
                //console.log('ver infor datos ---------------------************', obj);
                if (obj.accion === 'L' || obj.accion === 'F') {
                    // var f = new Date(obj.fec_hora_timbre)
                    //console.log('ENTRA 1************', obj);
                    detalleAsistencia.fecha = obj.fec_hora_timbre;
                    detalleAsistencia.fecha_mostrar = DiaEspaniol(new Date(obj.fec_hora_timbre)) + ' ' + obj.fec_hora_timbre;
                    detalleAsistencia.E.hora_default = entrada_default;
                    detalleAsistencia.S_A.hora_default = salida_almuerzo_default;
                    detalleAsistencia.E_A.hora_default = entrada_almuerzo_default;
                    detalleAsistencia.S.hora_default = salida_default;
                    // detalleAsistencia.E_A.hora_default = CalcularEntradaAlmuerzo('13:00', tlaboral.min_almuerzo)
                    // detalleAsistencia.S.hora_default = salidaGeneral
                }
                contador = contador + 1;
                if (result.length === contador && obj.accion != 'L') {
                    //console.log('ENTRA 2 ************', obj);
                    detalleAsistencia.E.hora_default = entrada_default;
                    detalleAsistencia.S_A.hora_default = salida_almuerzo_default;
                    detalleAsistencia.E_A.hora_default = (detalleAsistencia.S_A.hora_timbre === '') ? CalcularEntradaAlmuerzo(detalleAsistencia.S_A.hora_default, ele_map.min_almuerzo) : CalcularEntradaAlmuerzo(detalleAsistencia.S_A.hora_timbre, ele_map.min_almuerzo);
                    detalleAsistencia.S.hora_default = salida_default;
                    // detalleAsistencia.S.hora_default = salidaGeneral
                }
                if (result.length === contador) {
                    // atraso
                    detalleAsistencia.atraso = CalcularAtraso(detalleAsistencia.E.hora_default, detalleAsistencia.E.hora_timbre, ele_map.datos[0].minu_espera);
                    // Tiempo salidas antes
                    detalleAsistencia.sal_antes = CalcularSalidasAntes(detalleAsistencia.S_A, detalleAsistencia.S);
                    // almuerzo
                    detalleAsistencia.almuerzo = CalcularAlmuerzo(detalleAsistencia.S_A, detalleAsistencia.E_A);
                    // 
                    // detalleAsistencia.hora_trab = '';
                    // detalleAsistencia.hora_ex_L_V = '';
                    // detalleAsistencia.hora_ex_S_D = '';
                    // Calculos Faltantes
                    let calculados = CalcularCamposFaltantes(detalleAsistencia, obj.labora, obj.accion);
                    // horas trabaja
                    calculados.hora_trab = CalcularHorasTrabaja(calculados.E, calculados.S, calculados.atraso, calculados.sal_antes, calculados.almuerzo) || '08:00';
                    calculados.hora_supl = '00:00';
                    calculados.hora_ex_L_V = '00:00';
                    calculados.hora_ex_S_D = '00:00';
                    AsistenciaArray.push(calculados);
                }
            });
        });
    });
    //console.log(AsistenciaArray.length);
    // AsistenciaArray.forEach((ele:any) => {
    //     console.log(ele);    
    // });    
    return AsistenciaArray;
}
function MetodoModelarDetalleAsistencia(codigo, desde, hasta, IhorarioLaboral, id_cargo, empleado) {
    return __awaiter(this, void 0, void 0, function* () {
        let horarios = yield GenerarHorarioEmpleado(id_cargo, desde, hasta);
        // console.log('horarios===***************************************************************',horarios);
        //if (horarios.message) return horarios;
        let arr = yield Promise.all(horarios.map((obj) => __awaiter(this, void 0, void 0, function* () {
            return yield ListaTimbresDiario(obj.fec_iterada, codigo, obj.boolena_fecha, obj.id_horarios, IhorarioLaboral, empleado);
        })));
        // console.log('########################################################');
        // console.log(arr);
        // console.log('########################################################');
        let AsistenciaArray = AsistenciaDetalleConsolidado(arr, IhorarioLaboral, id_cargo);
        return AsistenciaArray;
    });
}
function DetalleHorario(id_horarios) {
    return __awaiter(this, void 0, void 0, function* () {
        return {
            id_horario: id_horarios,
            min_almuerzo: yield database_1.default.query('SELECT min_almuerzo FROM cg_horarios WHERE id = $1', [id_horarios])
                .then(result => {
                return result.rows[0].min_almuerzo;
            }),
            datos: yield database_1.default.query('SELECT orden, hora, tipo_accion, minu_espera ' +
                'FROM deta_horarios WHERE id_horario = $1 ORDER BY orden ASC', [id_horarios])
                .then(result => {
                return result.rows;
            })
        };
    });
}
const ContarHorasByCargo = function (id_empleado, desde, hasta) {
    return __awaiter(this, void 0, void 0, function* () {
        let ids = yield UltimoCargoContrato(id_empleado, desde, hasta); //devuelve los IDs de contrato y cargo, ademas del horarios o los horarios que el usuario ingreso.
        if (ids.message)
            return ids;
        // console.log('entra en contar horas ------------------------', ids);
        let horaIngresoEmpl = yield Promise.all(ids.map((obj) => __awaiter(this, void 0, void 0, function* () {
            //console.log('revisar id horario',   obj);
            return yield DetalleHorario(obj.id_horarios).then(result => {
                //console.log('entra hora ingresa', result);
                return result;
            });
        })));
        console.log('IhorarioLaboral===', horaIngresoEmpl);
        // horaIngresoEmpl.forEach(obj => {
        //     console.log(obj);
        // })
        const empleado = yield ObtenerInformacionEmpleado(id_empleado);
        //console.log('ver empleado ******************************************** ', empleado)
        const DetalleConsolidado = yield MetodoModelarDetalleAsistencia(ids[0].codigo, desde, hasta, horaIngresoEmpl, ids[0].id_cargo, empleado);
        // console.log('Mensaje de Detalle Horario',DetalleConsolidado);
        if (DetalleConsolidado.message)
            return DetalleConsolidado; // Retorna en caso de tener el mensaje de error en los horarios no encontrados;
        const total = yield CalcularTotal(DetalleConsolidado);
        // console.log(total);
        let ReporteConsolidadoJsop = {
            empleado: empleado,
            detalle: DetalleConsolidado,
            operaciones: total
        };
        return ReporteConsolidadoJsop;
    });
};
exports.ContarHorasByCargo = ContarHorasByCargo;
function CalcularTotal(arr) {
    return __awaiter(this, void 0, void 0, function* () {
        let dataDecimal = {
            atraso: null || 0,
            sal_antes: null || 0,
            almuerzo: null || 0,
            hora_trab: null || 0,
            hora_supl: null || 0,
            hora_ex_L_V: null || 0,
            hora_ex_S_D: null || 0
        };
        arr.forEach((obj) => {
            if ((obj.E.descripcion === 'L' || obj.E.descripcion === 'F') && obj.E.hora_timbre === '') {
                obj.almuerzo = '00:00';
            }
            if (obj.E.descripcion === 'L' || obj.E.descripcion === 'F') {
                obj.atraso = '00:00';
                obj.sal_antes = '00:00';
            }
            //console.log('entra calcular ......................................', obj.hora_trab);
            dataDecimal.atraso = HHMMtoSegundos(obj.atraso) + dataDecimal.atraso;
            dataDecimal.sal_antes = HHMMtoSegundos(obj.sal_antes) + dataDecimal.sal_antes;
            dataDecimal.almuerzo = HHMMtoSegundos(obj.almuerzo) + dataDecimal.almuerzo;
            dataDecimal.hora_trab = HHMMtoSegundos(obj.hora_trab) + dataDecimal.hora_trab;
            dataDecimal.hora_supl = HHMMtoSegundos(obj.hora_supl) + dataDecimal.hora_supl;
            dataDecimal.hora_ex_L_V = HHMMtoSegundos(obj.hora_ex_L_V) + dataDecimal.hora_ex_L_V;
            dataDecimal.hora_ex_S_D = HHMMtoSegundos(obj.hora_ex_S_D) + dataDecimal.hora_ex_S_D;
        });
        let dataHHMM = {
            atraso: SegundosToHHMM(dataDecimal.atraso),
            sal_antes: SegundosToHHMM(dataDecimal.sal_antes),
            almuerzo: SegundosToHHMM(dataDecimal.almuerzo),
            hora_trab: SegundosToHHMM(dataDecimal.hora_trab),
            hora_supl: SegundosToHHMM(dataDecimal.hora_supl),
            hora_ex_L_V: SegundosToHHMM(dataDecimal.hora_ex_L_V),
            hora_ex_S_D: SegundosToHHMM(dataDecimal.hora_ex_S_D)
        };
        // console.log(dataDecimal);
        // console.log(dataHHMM);
        return [{
                decimal: {
                    atraso: dataDecimal.atraso / 3600,
                    sal_antes: dataDecimal.sal_antes / 3600,
                    almuerzo: dataDecimal.almuerzo / 3600,
                    hora_trab: dataDecimal.hora_trab / 3600,
                    hora_supl: dataDecimal.hora_supl / 3600,
                    hora_ex_L_V: dataDecimal.hora_ex_L_V / 3600,
                    hora_ex_S_D: dataDecimal.hora_ex_S_D / 3600
                },
                HHMM: dataHHMM
            }];
    });
}
function ObtenerInformacionEmpleado(id_empleado) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield database_1.default.query('SELECT CONCAT(e.nombre, \' \', e.apellido) AS nombre, e.cedula, e.codigo, ' +
            'c.descripcion FROM empleados AS e, empl_contratos AS co, empl_cargos AS ca, sucursales AS s, ' +
            'ciudades AS c WHERE e.id = $1 AND e.id = co.id_empleado AND ca.id_empl_contrato = co.id AND ' +
            's.id = ca.id_sucursal AND s.id_ciudad = c.id ORDER BY co.fec_ingreso DESC LIMIT 1', [id_empleado])
            .then(result => {
            return result.rows;
        });
    });
}
// function tipoHorario(inicio: Date, final: Date) {
//     var fecha1 = moment(inicio.toJSON().split("T")[0]);
//     var fecha2 = moment(final.toJSON().split("T")[0]);
//     var diasHorario = fecha2.diff(fecha1, 'days');
//     if (diasHorario >= 1 && diasHorario <= 7) return 'semanal'
//     if (diasHorario >= 25 && diasHorario <= 35) return 'mensual'
//     return 'anual'
// }
/**
 * semana = 6 (mayor a 1 menor a 7),
 * mensual (mayor a 25 y menor a 35)
 * anual = 365 (Hacer que sea mayor 40 y menor a 370)
 */
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
/**********************************************************************
 *
 *      METODOS PARA MODELAR REPORTES DE TIMBRES SIN ACCIONES
 *
 **********************************************************************/
const ContarHorasByCargoSinAcciones = function (id_empleado, desde, hasta) {
    return __awaiter(this, void 0, void 0, function* () {
        let ids = yield UltimoCargoContrato(id_empleado, desde, hasta); //devuelve los IDs de contrato y cargo, ademas del horarios o los horarios que el usuario ingreso.
        console.log(ids);
        if (ids.message)
            return ids;
        let horaIngresoEmpl = yield Promise.all(ids.map((obj) => __awaiter(this, void 0, void 0, function* () {
            // console.log(obj);
            return yield DetalleHorario(obj.id_horarios).then(result => {
                return result;
            });
        })));
        // horaIngresoEmpl.forEach(obj => {
        //     console.log(obj);
        // })
        const empleado = yield ObtenerInformacionEmpleado(id_empleado);
        if (empleado.length === 0)
            return { message: 'El empleado no existe' };
        const DetalleConsolidadoArr = yield Promise.all(ids.map((obj) => {
            return MetodoModelarDetalleAsistenciaSinAccion(obj.codigo, new Date(obj.fec_inicio), new Date(obj.fec_final), horaIngresoEmpl, obj.id_cargo);
        }));
        let DetalleConsolidado = [];
        DetalleConsolidadoArr.forEach((obj) => {
            obj.forEach((o) => {
                DetalleConsolidado.push(o);
            });
        });
        // console.log('Mensaje de Detalle Horario',DetalleConsolidado);
        // return {message: 'llego'}
        // if (DetalleConsolidado.message) return DetalleConsolidado; // Retorna en caso de tener el mensaje de error en los horarios no encontrados;
        const total = yield CalcularTotal(DetalleConsolidado);
        // console.log(total);
        let ReporteConsolidadoJsop = {
            empleado: empleado,
            detalle: DetalleConsolidado,
            operaciones: total
        };
        return ReporteConsolidadoJsop;
    });
};
exports.ContarHorasByCargoSinAcciones = ContarHorasByCargoSinAcciones;
function MetodoModelarDetalleAsistenciaSinAccion(codigo, desde, hasta, IhorarioLaboral, id_cargo) {
    return __awaiter(this, void 0, void 0, function* () {
        // console.log(codigo, desde, hasta, IhorarioLaboral, id_cargo);
        let horarios = yield GenerarHorarioEmpleado(id_cargo, desde, hasta);
        // console.log('horarios===',horarios);
        //if (horarios.message) return horarios;
        let arr = yield Promise.all(horarios.map((obj) => __awaiter(this, void 0, void 0, function* () {
            return yield ListaTimbresDiario(obj.fec_iterada, codigo, obj.boolena_fecha, obj.id_horarios, IhorarioLaboral, 9);
        })));
        // console.log('########################################################');
        // console.log(arr);
        // console.log('########################################################');
        let AsistenciaArray = AsistenciaDetalleConsolidadoSinAcciones(arr, IhorarioLaboral, id_cargo);
        return AsistenciaArray;
    });
}
function AsistenciaDetalleConsolidadoSinAcciones(arr, IhorarioLaboral, id_cargo) {
    // console.log('Metodo asistencia detalle consolidado:', IhorarioLaboral);
    let AsistenciaArray = [];
    // let salidaGeneral = CalculoHoraSalida(IhorarioLaboral);
    arr.forEach((result) => {
        // console.log(result);
        let detalleAsistencia = {
            fecha: '',
            fecha_mostrar: '',
            E: {
                hora_default: '',
                hora_timbre: '',
                descripcion: ''
            },
            S_A: {
                hora_default: '',
                hora_timbre: '',
                descripcion: ''
            },
            E_A: {
                hora_default: '',
                hora_timbre: '',
                descripcion: ''
            },
            S: {
                hora_default: '',
                hora_timbre: '',
                descripcion: ''
            },
            atraso: null || '',
            sal_antes: null || '',
            almuerzo: null || '',
            hora_trab: null || '',
            hora_supl: null || '',
            hora_ex_L_V: null || '',
            hora_ex_S_D: null || ''
        };
        let contador = 0;
        result.forEach((obj) => {
            // console.log(obj);
            IhorarioLaboral.filter((ele_filtro) => { return (obj.id_horarios === ele_filtro.id_horario); })
                .map((ele_map) => {
                // console.log('LENGTH DE ELE_MAP:', ele_map);
                let entrada_default = ele_map.datos[0].hora.slice(0, 5);
                let salida_almuerzo_default = ele_map.datos[1].hora.slice(0, 5);
                let entrada_almuerzo_default = ele_map.datos[2].hora.slice(0, 5);
                let salida_default = ele_map.datos[3].hora.slice(0, 5);
                // Fecha
                detalleAsistencia.fecha = obj.fec_hora_timbre;
                detalleAsistencia.fecha_mostrar = DiaEspaniol(new Date(obj.fec_hora_timbre.split(' ')[0])) + ' ' + obj.fec_hora_timbre.split(' ')[0];
                switch (obj.orden) {
                    case 1:
                        detalleAsistencia.E.hora_timbre = obj.fec_hora_timbre.split(' ')[1].slice(0, 5);
                        break;
                    case 2:
                        detalleAsistencia.S_A.hora_timbre = obj.fec_hora_timbre.split(' ')[1].slice(0, 5);
                        break;
                    case 3:
                        detalleAsistencia.E_A.hora_timbre = obj.fec_hora_timbre.split(' ')[1].slice(0, 5);
                        break;
                    case 4:
                        detalleAsistencia.S.hora_timbre = obj.fec_hora_timbre.split(' ')[1].slice(0, 5);
                        break;
                    default:
                        break;
                }
                if (obj.accion === 'L') {
                    // var f = new Date(obj.fec_hora_timbre)
                    detalleAsistencia.fecha = obj.fec_hora_timbre;
                    detalleAsistencia.fecha_mostrar = DiaEspaniol(new Date(obj.fec_hora_timbre)) + ' ' + obj.fec_hora_timbre;
                    detalleAsistencia.E.hora_default = entrada_default;
                    detalleAsistencia.S_A.hora_default = salida_almuerzo_default;
                    detalleAsistencia.E_A.hora_default = entrada_almuerzo_default;
                    detalleAsistencia.S.hora_default = salida_default;
                    // detalleAsistencia.E_A.hora_default = CalcularEntradaAlmuerzo('13:00', tlaboral.min_almuerzo)
                    // detalleAsistencia.S.hora_default = salidaGeneral
                }
                contador = contador + 1;
                if (result.length === contador && obj.accion != 'L') {
                    detalleAsistencia.E.hora_default = entrada_default;
                    detalleAsistencia.S_A.hora_default = salida_almuerzo_default;
                    detalleAsistencia.E_A.hora_default = (detalleAsistencia.S_A.hora_timbre === '') ? CalcularEntradaAlmuerzo(detalleAsistencia.S_A.hora_default, ele_map.min_almuerzo) : CalcularEntradaAlmuerzo(detalleAsistencia.S_A.hora_timbre, ele_map.min_almuerzo);
                    detalleAsistencia.S.hora_default = salida_default;
                    // detalleAsistencia.S.hora_default = salidaGeneral
                }
                if (result.length === contador) {
                    // atraso
                    detalleAsistencia.atraso = CalcularAtraso(detalleAsistencia.E.hora_default, detalleAsistencia.E.hora_timbre, ele_map.datos[0].minu_espera);
                    // Tiempo salidas antes
                    detalleAsistencia.sal_antes = CalcularSalidasAntes(detalleAsistencia.S_A, detalleAsistencia.S);
                    // almuerzo
                    detalleAsistencia.almuerzo = CalcularAlmuerzo(detalleAsistencia.S_A, detalleAsistencia.E_A);
                    // 
                    // detalleAsistencia.hora_trab = '';
                    // detalleAsistencia.hora_ex_L_V = '';
                    // detalleAsistencia.hora_ex_S_D = '';
                    // Calculos Faltantes
                    let calculados = CalcularCamposFaltantes(detalleAsistencia, obj.labora, obj.accion);
                    // horas trabaja
                    calculados.hora_trab = CalcularHorasTrabaja(calculados.E, calculados.S, calculados.atraso, calculados.sal_antes, calculados.almuerzo) || '08:00';
                    calculados.hora_supl = '00:00';
                    calculados.hora_ex_L_V = '00:00';
                    calculados.hora_ex_S_D = '00:00';
                    AsistenciaArray.push(calculados);
                }
            });
        });
    });
    console.log(AsistenciaArray.length);
    // AsistenciaArray.forEach((ele:any) => {
    //     console.log(ele);    
    // });    
    return AsistenciaArray;
}
