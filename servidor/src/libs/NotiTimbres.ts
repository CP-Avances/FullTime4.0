import pool from '../database'

const MINUTO_TIMER = 59;

// const MINUTO_TIMER = 4; // de prueba

export const NotificacionTimbreAutomatica = function () {

    setInterval(async () => {

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
                let hora: number = 9; // =====> solo para probar
                f.setUTCHours(hora);
                console.log('----7 ', f.toJSON());

                if (f != null && f.toJSON() != null) {
                    var fecha: string = f.toJSON().split('T')[0];
                    var h = f.toJSON().split('T')[1];
                    let retorno = await CalcularHoras(fecha, h.split(':')[0]);
                    console.log('Retorno final:', retorno);
                }

                //let retorno = await CalcularHoras(fecha, h.split(':')[0]);
                //console.log('Retorno final:', retorno);
            }
        }

    }, 60000);

}

async function CalcularHoras(fecha: string, hora: string) {
    let datoConsulta = fecha + ' ' + hora;
    console.log('FECHA ====>', datoConsulta);
    let timbres = await pool.query('SELECT CAST(fec_hora_timbre AS VARCHAR), accion, id_empleado, id FROM timbres WHERE CAST(fec_hora_timbre AS VARCHAR) LIKE $1 || \'%\'', [datoConsulta])
        .then((result: any) => { return result.rows });

    console.log(timbres);

    if (timbres.length > 0) {
        for (let i = 0; i < timbres.length; i++) {
            const { fec_hora_timbre, accion, id_empleado, id } = timbres[i];

            const fecha = fec_hora_timbre.split(' ')[0];
            const time = fec_hora_timbre.split(' ')[1];
            let h = tiempoToSegundos(time.split('.')[0])
            // console.log(time);
            // console.log(h);
            let tiempo_horario;
            let estado;
            switch (accion) {
                case 'E':
                    tiempo_horario = await HorarioEmpleado(id_empleado, 1, fecha);
                    if (!tiempo_horario.err) {
                        estado = Atrasos(tiempo_horario.tiempo, h)
                    }
                    break;
                case 'I/A':
                    tiempo_horario = await HorarioEmpleado(id_empleado, 2, fecha);
                    if (!tiempo_horario.err) {
                        estado = SalidasAntesAlmuerzo(tiempo_horario.tiempo, h)
                    }
                    break;
                case 'F/A':
                    tiempo_horario = await HorarioEmpleado(id_empleado, 3, fecha);
                    if (!tiempo_horario.err) {
                        estado = AtrasosAlmuerzo(tiempo_horario.tiempo, h)
                    }
                    break;
                case 'S':
                    tiempo_horario = await HorarioEmpleado(id_empleado, 4, fecha);
                    if (!tiempo_horario.err) {
                        estado = SalidasAntes(tiempo_horario.tiempo, h)
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
                    let text = "El timbre es permiso"
                    break;
            }
            console.log('Tiempo Horario =======>>>>>>>>>>>>>>', tiempo_horario);
            console.log('Estado =======>>>>>>>>>>>>>>', estado);

            if (estado?.bool === true) { //es atraso
                if (tiempo_horario?.arrayJefes !== undefined) {
                    const mensaje = estado?.message;
                    tiempo_horario?.arrayJefes.forEach(async (element) => {
                        try {
                            await pool.query('INSERT INTO realtime_timbres(create_at, id_send_empl, id_receives_empl, descripcion, id_timbre) VALUES($1,$2,$3,$4,$5)', [fec_hora_timbre, id_empleado, element.empleado, mensaje, id])
                                .then((result: any) => {
                                    console.log('notificacion enviada');
                                });
                        } catch (error) {
                            return { err: error.toString() }
                        }
                    })
                }
            }
        }
        return 0
    }
    return 0
}

interface horarioEmpleado {
    err?: string,
    tiempo?: number,
    arrayJefes?: Array<InfoDepaJefe>
}

interface InfoDepaJefe {
    estado: boolean,
    id_dep: string | number,
    depa_padre: string | number,
    nivel: string | number,
    id_suc: string | number,
    empleado: string | number
}

async function HorarioEmpleado(codigo: number, orden: number, fecha: string): Promise<horarioEmpleado> {

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
}

function SegundosTotal(hora: string, minu_espera: number) {
    let total = tiempoToSegundos(hora) + (minu_espera * 60);
    return total
}

function tiempoToSegundos(tiempo: string) {
    let h = parseInt(tiempo.split(':')[0]) * 3600;
    let m = parseInt(tiempo.split(':')[1]) * 60;
    let s = parseInt(tiempo.split(':')[2]);

    return h + m + s
}

function Atrasos(hora: number | undefined, segundos_timbre: number) {
    console.log('**************************', hora, '===', segundos_timbre);
    if (hora === undefined) return { err: 'No se encontro hora' }
    if (segundos_timbre > hora) {
        return { bool: true, message: 'Llego atrasado al trabajo' }
    }
    return { bool: false, message: 'Llego a tiempo' }
}

function SalidasAntes(hora: number | undefined, hora_timbre: number) {
    console.log('**************************', hora, '===', hora_timbre);
    if (hora === undefined) return { err: 'No se encontro hora' }

    if (hora_timbre < hora) {
        return { bool: true, message: 'Salio antes del trabajo' }
    }
    return { bool: false, message: 'Salio despues' }
}

function SalidasAntesAlmuerzo(hora: number | undefined, hora_timbre: number) {
    console.log('**************************', hora, '===', hora_timbre);
    if (hora === undefined) return { err: 'No se encontro hora' }

    if (hora_timbre < hora) {
        return { bool: true, message: 'Salio antes al almuerzo' }
    }
    return { bool: false, message: 'Salio despues' }
}

function AtrasosAlmuerzo(hora: number | undefined, hora_timbre: number) {
    console.log('**************************', hora, '===', hora_timbre);
    if (hora === undefined) return { err: 'No se encontro hora' }

    if (hora_timbre > hora) {
        return { bool: true, message: 'Se tomo mucho tiempo de almuerzo' }
    }
    return { bool: false, message: 'Llego a tiempo' }
}