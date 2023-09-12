import { Request, Response } from 'express';
import pool from '../../database';
import { HHMMtoSegundos } from '../../libs/SubMetodosGraficas';

class ReportesControlador {

    public async ListarDatosContractoA(req: Request, res: Response) {
        const DATOS = await pool.query('SELECT * FROM datos_contrato_actual');
        if (DATOS.rowCount > 0) {
            return res.jsonp(DATOS.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'No se encuentran registros' });
        }
    }

    public async ListarDatosCargoA(req: Request, res: Response) {
        const { empleado_id } = req.params;
        const DATOS = await pool.query('SELECT * FROM datosCargoActual ($1)', [empleado_id]);
        if (DATOS.rowCount > 0) {
            return res.jsonp(DATOS.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'error' });
        }
    }

    public async ListarEntradaSalidaEmpleado(req: Request, res: Response) {
        // id_empleado hace referencia al código del empleado
        const { id_empleado } = req.params;
        const { fechaInicio, fechaFinal } = req.body;
        const DATOS = await pool.query('SELECT * FROM TimbresEntrada AS te INNER JOIN TimbresSalida AS ts ' +
            'ON te.id_empleado = ts.id_empleado AND te.fecha_inicio::date = ts.fecha_fin::date AND ' +
            'te.id_empleado = $1 AND te.fecha_inicio::date BETWEEN $2 AND $3', [id_empleado, fechaInicio, fechaFinal]);
        if (DATOS.rowCount > 0) {
            return res.jsonp(DATOS.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'error' });
        }
    }

    public async ListarPedidosEmpleado(req: Request, res: Response) {
        const { id_usua_solicita } = req.params;
        const { fechaInicio, fechaFinal } = req.body;
        const DATOS = await pool.query('SELECT * FROM hora_extr_pedidos WHERE id_usua_solicita = $1 AND fec_inicio::date BETWEEN $2 AND $3', [id_usua_solicita, fechaInicio, fechaFinal]);
        if (DATOS.rowCount > 0) {
            return res.jsonp(DATOS.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'error' });
        }
    }

    public async ListarEntradaSalidaTodos(req: Request, res: Response) {
        const { fechaInicio, fechaFinal } = req.body;
        const DATOS = await pool.query('SELECT * FROM TimbresEntrada AS te INNER JOIN TimbresSalida AS ts ' +
            'ON te.id_empleado = ts.id_empleado AND te.fecha_inicio::date = ts.fecha_fin::date AND ' +
            'te.fecha_inicio::date BETWEEN $1 AND $2', [fechaInicio, fechaFinal]);
        if (DATOS.rowCount > 0) {
            return res.jsonp(DATOS.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'error' });
        }
    }

    public async ListarPedidosTodos(req: Request, res: Response) {
        const { fechaInicio, fechaFinal } = req.body;
        const DATOS = await pool.query('SELECT * FROM hora_extr_pedidos WHERE fec_inicio::date BETWEEN $1 AND $2', [fechaInicio, fechaFinal]);
        if (DATOS.rowCount > 0) {
            return res.jsonp(DATOS.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'error' });
        }
    }

    /* public async ListarTimbres(req: Request, res: Response) {
         const { id_empleado } = req.params;
         const { fechaInicio, fechaFinal } = req.body;
         const DATOS = await pool.query('SELECT * FROM timbres WHERE NOT accion = \'HA\' AND id_empleado = $1 AND ' +
             'fec_hora_timbre::date BETWEEN $2 AND $3 ORDER BY fec_hora_timbre::date, fec_hora_timbre::time ASC', [id_empleado, fechaInicio, fechaFinal]);
         if (DATOS.rowCount > 0) {
             return res.jsonp(DATOS.rows)
         }
         else {
             return res.status(404).jsonp({ text: 'error' });
         }
     }*/

     //TODO BuscarPlan
    ////PLANIFICACION DE EMPLEADO CON FECHAS
    public async BuscarPlan(req: Request, res: Response) {
        const { id_empleado } = req.params;
        const { fechaInicio, fechaFinal } = req.body;
        const FECHAS = await pool.query('select pg.id, pg.codigo, pg.id_empl_cargo, pg.id_det_horario, pg.fec_horario, pg.fec_hora_horario, pg.tipo_entr_salida, pg.fec_hora_timbre, pg.id_horario' +
            'FROM plan_general pg ' +
            'WHERE pg.codigo = $3 and ' +
            '( pg.fec_hora_horario::date between $1 and $2 ) ' +
            'order by fec_hora_horario;',
            [fechaInicio, fechaFinal, id_empleado]);
        console.log("m: ", (FECHAS.rows));
        if (FECHAS.rowCount > 0) {
            return res.jsonp(FECHAS.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'No se encuentran registros' });
        }
    }
    //// FIN PLANIFICACION DE EMPLEADO CON FECHAS

    ////CAMBIO DE LISTAR TIMBRES COMENTAR METODO ANTIGUO
    public async ListarTimbres(req: Request, res: Response) {
        const { id_empleado } = req.params;
        const { fechaInicio, fechaFinal } = req.body;
        const DATOS = await pool.query('SELECT t.fec_hora_timbre,t.accion, t.tecl_funcion, t.observacion, ' +
            't.latitud, t.longitud, t.id, t.codigo, t.id_reloj, t.hora_timbre_diferente, ' +
            't.fec_hora_timbre_servidor, t.dispositivo_timbre, t.tipo_autenticacion ' +
            'FROM timbres t WHERE t.codigo = $1 AND NOT accion = \'HA\' AND ' +
            't.fec_hora_timbre::date BETWEEN $2 AND $3 ' +
            'GROUP BY t.fec_hora_timbre,t.accion, t.tecl_funcion, t.observacion, t.latitud, ' +
            't.longitud, t.id, t.codigo, t.id_reloj, t.hora_timbre_diferente, ' +
            't.fec_hora_timbre_servidor, t.dispositivo_timbre, t.tipo_autenticacion ' +
            'ORDER BY t.fec_hora_timbre ASC;', [id_empleado, fechaInicio, fechaFinal]);
        console.log("LT RepCont: ", (DATOS.rows));
        if (DATOS.rowCount > 0) {
            return res.jsonp(DATOS.rows);
        }
        else {
            return res.status(404).jsonp({ text: 'error' });
        }
    }
    ////FIN CAMBIO DE LISTAR TIMBRES



    //TODO ListarPermisoHorarioEmpleado
    public async ListarPermisoHorarioEmpleado(req: Request, res: Response) {
        const { id_empleado } = req.params;
        /* const DATOS = await pool.query('SELECT * FROM permisos AS p INNER JOIN ' +
             '(SELECT h.id_horarios, ch.nombre AS nom_horario, h.id_empl_cargo, ch.hora_trabajo AS horario_horas, ' +
             'cargo.hora_trabaja AS cargo_horas, cargo.cargo, ' +
             'e.id AS id_empleado, e.estado AS estado_empl, contrato.id AS id_contrato, p.fec_inicio AS fecha, p.id AS id_permiso, ' +
             'tp.id AS id_tipo_permiso, tp.descripcion AS nombre_permiso ' +
             'FROM empl_horarios AS h, empl_contratos AS contrato, empl_cargos AS cargo, empleados AS e,  ' +
             'cg_horarios AS ch, ' +
             'permisos AS p, cg_tipo_permisos AS tp ' +
             'WHERE h.id_empl_cargo = cargo.id AND e.id = contrato.id_empleado AND p.id_tipo_permiso = tp.id ' +
             'AND ch.id = h.id_horarios AND p.id_empl_contrato = contrato.id ' +
             'AND p.fec_inicio::date BETWEEN h.fec_inicio AND h.fec_final AND e.id = $1 AND e.estado = 1) AS h ' +
             'ON h.id_permiso = p.id ORDER BY p.num_permiso ASC', [id_empleado]);*/

        const DATOS = await pool.query('SELECT cp.descripcion AS tipo, p.id, p.descripcion, ' +
            'p.fec_creacion, p.fec_inicio, p.fec_final, p.dia, p.hora_numero, p.num_permiso, p.codigo, ' +
            'a.estado, a.id_documento, ec.hora_trabaja, ec.id AS id_cargo ' +
            'FROM permisos AS p, cg_tipo_permisos AS cp, autorizaciones AS a, empl_cargos AS ec ' +
            'WHERE cp.id = p.id_tipo_permiso AND a.id_permiso = p.id AND ' +
            'ec.id = (SELECT MAX(cargo_id) FROM datos_empleado_cargo WHERE codigo = $1) AND ' +
            'p.codigo = $1 ORDER BY p.num_permiso ASC', [id_empleado]);

        if (DATOS.rowCount > 0) {
            DATOS.rows.map((obj: any) => {
                if (obj.id_documento != null && obj.id_documento != '' && obj.estado != 1) {
                    var autorizaciones = obj.id_documento.split(',');
                    let empleado_id = autorizaciones[autorizaciones.length - 2].split('_')[0];
                    obj.autoriza = parseInt(empleado_id);
                }
                if (obj.estado === 1) {
                    obj.estado = 'Pendiente';
                }
                else if (obj.estado === 2) {
                    obj.estado = 'Pre-autorizado';
                }
                else if (obj.estado === 3) {
                    obj.estado = 'Autorizado';
                }
                else if (obj.estado === 4) {
                    obj.estado = 'Negado';
                }
            });
            return res.jsonp(DATOS.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'error' });
        }
    }



    public async ListarPermisoPlanificaEmpleado(req: Request, res: Response) {
        const { id_empleado } = req.params;
        const DATOS = await pool.query('SELECT * FROM permisos AS p INNER JOIN ' +
            '(SELECT ph.id AS id_plan, ph.id_cargo, dp.id_cg_horarios, ch.nombre AS nom_horario, ' +
            'ch.hora_trabajo AS horario_horas, cargo.hora_trabaja AS cargo_horas, cargo.cargo, ' +
            'e.id AS id_empleado, contrato.id AS id_contrato, p.id AS id_permiso, dp.fecha, ' +
            'tp.id AS id_tipo_permiso, tp.descripcion AS nombre_permiso ' +
            'FROM plan_horarios AS ph, empl_cargos AS cargo, empl_contratos AS contrato, empleados AS e, ' +
            'plan_hora_detalles AS dp, cg_horarios AS ch, permisos AS p, cg_tipo_permisos AS tp ' +
            'WHERE cargo.id = ph.id_cargo AND e.id = contrato.id_empleado AND e.id = $1 AND ' +
            'ch.id = dp.id_cg_horarios AND ph.id = dp.id_plan_horario AND p.id_tipo_permiso = tp.id ' +
            'AND p.id_empl_contrato = contrato.id AND p.fec_inicio::date BETWEEN ph.fec_inicio AND ' +
            'ph.fec_final AND p.fec_inicio::date = dp.fecha) AS h ' +
            'ON p.id = h.id_permiso ORDER BY p.num_permiso ASC', [id_empleado]);
        if (DATOS.rowCount > 0) {
            return res.jsonp(DATOS.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'error' });
        }
    }



    public async ListarPermisoHorarioEmpleadoFechas(req: Request, res: Response) {
        const { id_empleado } = req.params;
        const { fechaInicio, fechaFinal } = req.body;
        /* const DATOS = await pool.query('SELECT * FROM permisos AS p INNER JOIN ' +
             '(SELECT h.id_horarios, ch.nombre AS nom_horario, h.id_empl_cargo, ch.hora_trabajo AS horario_horas, ' +
             'cargo.hora_trabaja AS cargo_horas, cargo.cargo, ' +
             'e.id AS id_empleado, e.estado AS estado_empl, contrato.id AS id_contrato, p.fec_inicio AS fecha, p.id AS id_permiso, ' +
             'tp.id AS id_tipo_permiso, tp.descripcion AS nombre_permiso ' +
             'FROM empl_horarios AS h, empl_contratos AS contrato, empl_cargos AS cargo, empleados AS e,  ' +
             'cg_horarios AS ch, ' +
             'permisos AS p, cg_tipo_permisos AS tp ' +
             'WHERE h.id_empl_cargo = cargo.id AND e.id = contrato.id_empleado AND p.id_tipo_permiso = tp.id ' +
             'AND ch.id = h.id_horarios AND p.id_empl_contrato = contrato.id ' +
             'AND p.fec_inicio::date BETWEEN h.fec_inicio AND h.fec_final AND e.id = $1 AND e.estado = 1) AS h ' +
             'ON h.id_permiso = p.id AND (p.fec_inicio::date BETWEEN $2 AND $3 OR ' +
             'p.fec_final::date BETWEEN $2 AND $3) ORDER BY p.num_permiso ASC', [id_empleado, fechaInicio, fechaFinal]);*/


        const DATOS = await pool.query('SELECT cp.descripcion AS tipo, p.id, p.descripcion, ' +
            'p.fec_creacion, p.fec_inicio, p.fec_final, p.dia, p.hora_numero, p.num_permiso, ' +
            'p.codigo, a.estado, a.id_documento, ec.hora_trabaja, ec.id AS id_cargo ' +
            'FROM permisos AS p, cg_tipo_permisos AS cp, autorizaciones AS a, empl_cargos AS ec ' +
            'WHERE cp.id = p.id_tipo_permiso AND a.id_permiso = p.id AND ' +
            'ec.id = (SELECT MAX(cargo_id) FROM datos_empleado_cargo WHERE codigo = $1) AND ' +
            'p.fec_inicio::date BETWEEN $2 AND $3 AND p.codigo = $1 ' +
            'ORDER BY p.num_permiso ASC', [id_empleado, fechaInicio, fechaFinal]);


        if (DATOS.rowCount > 0) {
            DATOS.rows.map((obj: any) => {
                if (obj.id_documento != null && obj.id_documento != '' && obj.estado != 1) {
                    var autorizaciones = obj.id_documento.split(',');
                    let empleado_id = autorizaciones[autorizaciones.length - 2].split('_')[0];
                    obj.autoriza = parseInt(empleado_id);
                }
                if (obj.estado === 1) {
                    obj.estado = 'Pendiente';
                }
                else if (obj.estado === 2) {
                    obj.estado = 'Pre-autorizado';
                }
                else if (obj.estado === 3) {
                    obj.estado = 'Autorizado';
                }
                else if (obj.estado === 4) {
                    obj.estado = 'Negado';
                }
            });
            return res.jsonp(DATOS.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'error' });
        }

    }


    public async ListarPermisoPlanificaEmpleadoFechas(req: Request, res: Response) {
        const { id_empleado } = req.params;
        const { fechaInicio, fechaFinal } = req.body;
        const DATOS = await pool.query('SELECT * FROM permisos AS p INNER JOIN ' +
            '(SELECT ph.id AS id_plan, ph.id_cargo, dp.id_cg_horarios, ch.nombre AS nom_horario, ' +
            'ch.hora_trabajo AS horario_horas, cargo.hora_trabaja AS cargo_horas, cargo.cargo, ' +
            'e.id AS id_empleado, contrato.id AS id_contrato, p.id AS id_permiso, dp.fecha, ' +
            'tp.id AS id_tipo_permiso, tp.descripcion AS nombre_permiso ' +
            'FROM plan_horarios AS ph, empl_cargos AS cargo, empl_contratos AS contrato, empleados AS e, ' +
            'plan_hora_detalles AS dp, cg_horarios AS ch, permisos AS p, cg_tipo_permisos AS tp ' +
            'WHERE cargo.id = ph.id_cargo AND e.id = contrato.id_empleado AND e.id = $1 AND ' +
            'ch.id = dp.id_cg_horarios AND ph.id = dp.id_plan_horario AND p.id_tipo_permiso = tp.id ' +
            'AND p.id_empl_contrato = contrato.id AND p.fec_inicio::date BETWEEN ph.fec_inicio AND ' +
            'ph.fec_final AND p.fec_inicio::date = dp.fecha) AS h ' +
            'ON p.id = h.id_permiso AND (p.fec_inicio::date BETWEEN $2 AND $3 OR ' +
            'p.fec_final::date BETWEEN $2 AND $3) ORDER BY p.num_permiso ASC', [id_empleado, fechaInicio, fechaFinal]);
        if (DATOS.rowCount > 0) {
            return res.jsonp(DATOS.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'error' });
        }
    }




    public async ListarPermisoAutorizaEmpleado(req: Request, res: Response) {
        const { id_empleado } = req.params;
        const DATOS = await pool.query('SELECT a.id AS id_autoriza, a.estado, a.id_permiso, ' +
            'a.id_documento AS empleado_estado, p.id_empl_contrato, contrato.id_empleado ' +
            'FROM autorizaciones AS a, permisos AS p, empl_contratos AS contrato, empleados AS e ' +
            'WHERE a.id_permiso = p.id AND p.id_empl_contrato = contrato.id AND contrato.id_empleado = e.id AND e.id = $1', [id_empleado]);
        if (DATOS.rowCount > 0) {
            return res.jsonp(DATOS.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'error' });
        }
    }




    public async ListarAtrasosHorarioEmpleado(req: Request, res: Response) {
        const { id_empleado } = req.params;
        const { fechaInicio, fechaFinal } = req.body;
        let DATOS = [];

        //false sin acciones || true con acciones
        if (req.acciones_timbres === true) {
            // Resultados de timbres con 6 y 3 acciones
            DATOS = await AtrasosTimbresConAcciones(id_empleado, fechaInicio, fechaFinal);

            console.log('Atrasos Horario Con Acciones: ', DATOS);

            if (DATOS.length > 0) {
                return res.status(200).jsonp(DATOS)
            }
            else {
                return res.status(404).jsonp({ text: 'Sin registros' });
            }

        } else {
            // Resultados de timbres sin acciones
            DATOS = await AtrasosTimbresSinAcciones(id_empleado, fechaInicio, fechaFinal);

            console.log('Atrasos Horario Sin Acciones: ', DATOS);

            if (DATOS.length > 0) {
                return res.status(200).jsonp(DATOS)
            }
            else {
                return res.status(404).jsonp({ text: 'Sin registros' });
            }

        }

    }

    public async ListarAtrasosPlanificaEmpleado(req: Request, res: Response) {
        const { id_empleado } = req.params;
        const { fechaInicio, fechaFinal } = req.body;
        console.log(req.acciones_timbres);

        let DATOS;
        //false sin acciones || true con acciones
        if (req.acciones_timbres === true) {
            // Resultados de timbres con 6 y 3 acciones
            DATOS = await AtrasosTimbresPlanificadosConAcciones(id_empleado, fechaInicio, fechaFinal);

            console.log('Atrasos Planificacion Con Acciones: ', DATOS);

            if (DATOS.length > 0) {
                return res.status(200).jsonp(DATOS)
            }
            else {
                return res.status(404).jsonp({ text: 'Sin registros' });
            }

        } else {
            // Resultados de timbres sin acciones
            DATOS = await AtrasosTimbresPlanificadosSinAcciones(id_empleado, fechaInicio, fechaFinal);

            console.log('Atrasos Planificacion Sin Acciones: ', DATOS);

            if (DATOS.length > 0) {
                return res.status(200).jsonp(DATOS)
            }
            else {
                return res.status(404).jsonp({ text: 'Sin registros' });
            }

        }

    }

    public async ListarEntradaSalidaHorarioEmpleado(req: Request, res: Response) {
        const { id_empleado } = req.params;
        const { fechaInicio, fechaFinal } = req.body;
        console.log('id', id_empleado, req.body);

        let DATOS;

        //false sin acciones || true con acciones
        if (req.acciones_timbres === false) {
            // Resultados de timbres con 6 y 3 acciones
            DATOS = await EntradaSalidaHorarioConAcciones(id_empleado, fechaInicio, fechaFinal);

            //console.log('Entrada Salidas Horario Con Acciones: ', DATOS);
            if (DATOS.length > 0) {
                return res.status(200).jsonp(DATOS)
            }
            else {
                return res.status(404).jsonp({ text: 'Sin registros' });
            }

        } else {
            // Resultados de timbres sin acciones
            DATOS = await EntradaSalidaHorarioSinAcciones(id_empleado, fechaInicio, fechaFinal);

            //console.log('Entrada Salidas Horario Sin Acciones: ', DATOS);
            if (DATOS.length > 0) {
                return res.status(200).jsonp(DATOS)
            }
            else {
                return res.status(404).jsonp({ text: 'Sin registros' });
            }

        }
    }

    public async ListarEntradaSalidaPlanificaEmpleado(req: Request, res: Response) {
        const { id_empleado } = req.params;
        const { fechaInicio, fechaFinal } = req.body;

        let DATOS;

        //false sin acciones || true con acciones
        if (req.acciones_timbres === false) {
            // Resultados de timbres con 6 y 3 acciones
            DATOS = await EntradaSalidaPlanificacionConAcciones(id_empleado, fechaInicio, fechaFinal);

            console.log('Entrada Salidas Planificacion Con Acciones: ', DATOS);
            if (DATOS.length > 0) {
                return res.status(200).jsonp(DATOS)
            }
            else {
                return res.status(404).jsonp({ text: 'Sin registros' });
            }

        } else {
            // Resultados de timbres sin acciones
            DATOS = await EntradaSalidaPlanificacionSinAcciones(id_empleado, fechaInicio, fechaFinal);

            console.log('Entrada Salidas Planificacion Sin Acciones: ', DATOS);
            if (DATOS.length > 0) {
                return res.status(200).jsonp(DATOS)
            }
            else {
                return res.status(404).jsonp({ text: 'Sin registros' });
            }

        }
    }
}

export const REPORTES_CONTROLADOR = new ReportesControlador();

export default REPORTES_CONTROLADOR;

async function AtrasosTimbresConAcciones(id_empleado: string, fechaInicio: string, fechaFinal: string) {
    return await pool.query('SELECT * FROM timbres AS t INNER JOIN ' +
        '(SELECT * FROM datos_empleado_cargo AS e INNER JOIN ' +
        '(SELECT h.id_horarios, ch.nombre AS nom_horario, dh.minu_espera, dh.tipo_accion, dh.hora, ' +
        'h.fec_inicio, h.fec_final, ch.hora_trabajo ' +
        'AS horario_horas, cargo.hora_trabaja AS cargo_horas, cargo.cargo, h.id_empl_cargo AS id_cargo, ' +
        '(dh.hora + rpad((dh.minu_espera)::varchar(2),6,\' min\')::INTERVAL) AS hora_total ' +
        'FROM empl_horarios AS h, empl_cargos AS cargo, cg_horarios AS ch, deta_horarios AS dh ' +
        'WHERE h.id_empl_cargo = cargo.id AND ch.id = h.id_horarios AND dh.id_horario = h.id_horarios ' +
        'AND dh.tipo_accion = \'E\') AS h ON e.codigo = $1 AND e.estado_empl = 1 AND cargo_id = h.id_cargo) AS h ' +
        'ON t.codigo = h.codigo AND t.accion IN (\'EoS\',\'E\') AND ' +
        't.fec_hora_timbre::date BETWEEN h.fec_inicio AND h.fec_final AND ' +
        't.fec_hora_timbre::date BETWEEN $2 AND $3 AND ' +
        't.fec_hora_timbre::time > hora_total ORDER BY t.fec_hora_timbre ASC', [id_empleado, fechaInicio, fechaFinal])
        .then((result: any) => {
            return result.rows
        })
}

async function AtrasosTimbresSinAcciones(id_empleado: string, fechaInicio: string, fechaFinal: string) {
    let arrayModelado = await pool.query('SELECT * FROM timbres AS t INNER JOIN ' +
        '(SELECT * FROM datos_empleado_cargo AS e INNER JOIN ' +
        '(SELECT h.id_horarios, ch.nombre AS nom_horario, dh.minu_espera, dh.tipo_accion, dh.hora, ' +
        'h.fec_inicio, h.fec_final, ch.hora_trabajo ' +
        'AS horario_horas, cargo.hora_trabaja AS cargo_horas, cargo.cargo, h.id_empl_cargo AS id_cargo, ' +
        '(dh.hora + rpad((dh.minu_espera)::varchar(2),6,\' min\')::INTERVAL) AS hora_total ' +
        'FROM empl_horarios AS h, empl_cargos AS cargo, cg_horarios AS ch, deta_horarios AS dh ' +
        'WHERE h.id_empl_cargo = cargo.id AND ch.id = h.id_horarios AND dh.id_horario = h.id_horarios ' +
        'AND dh.tipo_accion = \'E\') AS h ON e.codigo = $1 AND e.estado_empl = 1 AND cargo_id = h.id_cargo) AS h ' +
        'ON t.codigo = h.codigo AND ' +
        't.fec_hora_timbre::date BETWEEN h.fec_inicio AND h.fec_final AND ' +
        't.fec_hora_timbre::date BETWEEN $2 AND $3 AND ' +
        't.fec_hora_timbre::time > hora_total ORDER BY t.fec_hora_timbre ASC', [id_empleado, fechaInicio, fechaFinal])
        .then((result: any) => {
            return result.rows
        })

    if (arrayModelado.length === 0) return []

    return arrayModelado.filter((obj: any) => {
        let h = obj.fec_hora_timbre.toJSON().split('T')[1].split('.')[0]
        // console.log(obj); console.log(h);
        let hora_timbre = HHMMtoSegundos(h) - HHMMtoSegundos('05:00:00');
        let hora_inicio = HHMMtoSegundos(obj.hora_total);
        let hora_final = hora_inicio + HHMMtoSegundos('02:00:00');
        return hora_timbre >= hora_inicio && hora_timbre <= hora_final
    })
}

async function AtrasosTimbresPlanificadosConAcciones(id_empleado: string, fechaInicio: string, fechaFinal: string) {
    return await pool.query('SELECT * FROM timbres AS t INNER JOIN ' +
        '(SELECT * FROM datos_empleado_cargo AS e INNER JOIN ' +
        '(SELECT ph.id AS id_plan, ph.id_cargo, ph.fec_inicio, ph.fec_final, dp.id_cg_horarios, ' +
        'ch.nombre AS nom_horario, dh.hora, dh.minu_espera, dh.id AS id_deta_horario, dh.tipo_accion, ' +
        'ch.hora_trabajo AS horario_horas, cargo.hora_trabaja AS cargo_horas, cargo.cargo, dp.fecha, ' +
        '(dh.hora + rpad((dh.minu_espera)::varchar(2),6,\' min\')::INTERVAL) AS hora_total ' +
        'FROM plan_horarios AS ph, empl_cargos AS cargo, plan_hora_detalles AS dp, cg_horarios AS ch, ' +
        'deta_horarios AS dh ' +
        'WHERE cargo.id = ph.id_cargo AND dh.id_horario = dp.id_cg_horarios AND dh.tipo_accion = \'E\' AND ' +
        'ch.id = dp.id_cg_horarios AND ph.id = dp.id_plan_horario) AS ph ' +
        'ON e.codigo = $1 AND cargo_id = ph.id_cargo) AS ph ' +
        'ON t.codigo = ph.codigo AND t.fec_hora_timbre::date BETWEEN $2 AND $3 ' +
        'AND t.accion IN (\'EoS\',\'E\') AND t.fec_hora_timbre::date BETWEEN ph.fec_inicio AND ph.fec_final ' +
        'AND t.fec_hora_timbre::date = fecha AND t.fec_hora_timbre::time > hora_total ' +
        'ORDER BY t.fec_hora_timbre ASC', [id_empleado, fechaInicio, fechaFinal])
        .then((result: any) => {
            return result.rows.map((obj: any) => {
                obj.accion = obj.tipo_accion
                return obj
            })
        })
}

async function AtrasosTimbresPlanificadosSinAcciones(id_empleado: string, fechaInicio: string, fechaFinal: string) {
    let arrayModelado = await pool.query('SELECT * FROM timbres AS t INNER JOIN ' +
        '(SELECT * FROM datos_empleado_cargo AS e INNER JOIN ' +
        '(SELECT ph.id AS id_plan, ph.id_cargo, ph.fec_inicio, ph.fec_final, dp.id_cg_horarios, ' +
        'ch.nombre AS nom_horario, dh.hora, dh.minu_espera, dh.id AS id_deta_horario, dh.tipo_accion, ' +
        'ch.hora_trabajo AS horario_horas, cargo.hora_trabaja AS cargo_horas, cargo.cargo, dp.fecha, ' +
        '(dh.hora + rpad((dh.minu_espera)::varchar(2),6,\' min\')::INTERVAL) AS hora_total ' +
        'FROM plan_horarios AS ph, empl_cargos AS cargo, plan_hora_detalles AS dp, cg_horarios AS ch, ' +
        'deta_horarios AS dh ' +
        'WHERE cargo.id = ph.id_cargo AND dh.id_horario = dp.id_cg_horarios AND dh.tipo_accion = \'E\' AND ' +
        'ch.id = dp.id_cg_horarios AND ph.id = dp.id_plan_horario) AS ph ' +
        'ON e.codigo = $1::varchar(15) AND cargo_id = ph.id_cargo) AS ph ' +
        'ON t.codigo::varchar(15) = ph.codigo AND t.fec_hora_timbre::date BETWEEN $2 AND $3 ' +
        'AND t.accion IN (\'EoS\',\'E\') AND t.fec_hora_timbre::date BETWEEN ph.fec_inicio AND ph.fec_final ' +
        'AND t.fec_hora_timbre::date = fecha AND t.fec_hora_timbre::time > hora_total ' +
        'ORDER BY t.fec_hora_timbre ASC', [id_empleado, fechaInicio, fechaFinal])
        .then((result: any) => {
            return result.rows
        })

    if (arrayModelado.length === 0) return []

    return arrayModelado.filter((obj: any) => {
        let h = obj.fec_hora_timbre.toJSON().split('T')[1].split('.')[0]
        // console.log(obj); console.log(h);
        let hora_timbre = HHMMtoSegundos(h) - HHMMtoSegundos('05:00:00');
        let hora_inicio = HHMMtoSegundos(obj.hora_total);
        let hora_final = hora_inicio + HHMMtoSegundos('02:00:00');
        return hora_timbre >= hora_inicio && hora_timbre <= hora_final
    }).map((obj: any) => {
        obj.accion = obj.tipo_accion
        return obj
    })
}

async function EntradaSalidaHorarioConAcciones(id_empleado: string, fechaInicio: string, fechaFinal: string): Promise<any[]> {

    // const timbres = 

    return await pool.query('SELECT * FROM timbres AS t INNER JOIN ' +
        '(SELECT * FROM datos_empleado_cargo AS e INNER JOIN ' +
        '(SELECT h.id_horarios, ch.nombre AS nom_horario, dh.minu_espera, dh.tipo_accion, dh.hora, ' +
        'h.fec_inicio, h.fec_final, ch.hora_trabajo AS horario_horas, cargo.hora_trabaja AS cargo_horas, ' +
        'cargo.cargo, h.id_empl_cargo AS id_cargo, ' +
        '(dh.hora + rpad((dh.minu_espera)::varchar(2),6,\' min\')::INTERVAL) AS hora_total ' +
        'FROM empl_horarios AS h, empl_cargos AS cargo, cg_horarios AS ch, deta_horarios AS dh ' +
        'WHERE h.id_empl_cargo = cargo.id AND ch.id = h.id_horarios AND dh.id_horario = h.id_horarios ) AS h ' +
        'ON e.codigo = $1 AND e.estado_empl = 1 AND cargo_id = h.id_cargo) AS h ' +
        'ON t.codigo::varchar(15) = h.codigo AND t.fec_hora_timbre::date BETWEEN $2 AND $3 AND ' +
        't.fec_hora_timbre::date BETWEEN h.fec_inicio AND h.fec_final ' +
        'AND t.accion = h.tipo_accion ' +
        'ORDER BY t.fec_hora_timbre ASC', [id_empleado, fechaInicio, fechaFinal])
        .then((result: any) => {
            return result.rows.map((obj: any) => {
                console.log(obj);

                obj.accion = obj.tipo_accion
                return obj
            })
        })
}

async function EntradaSalidaHorarioSinAcciones(id_empleado: string, fechaInicio: string, fechaFinal: string): Promise<any[]> {
    const arrayModelado = await pool.query('SELECT * FROM timbres AS t INNER JOIN ' +
        '(SELECT * FROM datos_empleado_cargo AS e INNER JOIN ' +
        '(SELECT h.id_horarios, ch.nombre AS nom_horario, dh.minu_espera, dh.tipo_accion, dh.hora, ' +
        'h.fec_inicio, h.fec_final, ch.hora_trabajo AS horario_horas, cargo.hora_trabaja AS cargo_horas, ' +
        'cargo.cargo, h.id_empl_cargo AS id_cargo, ' +
        '(dh.hora + rpad((dh.minu_espera)::varchar(2),6,\' min\')::INTERVAL) AS hora_total ' +
        'FROM empl_horarios AS h, empl_cargos AS cargo, cg_horarios AS ch, deta_horarios AS dh ' +
        'WHERE h.id_empl_cargo = cargo.id AND ch.id = h.id_horarios AND dh.id_horario = h.id_horarios ) AS h ' +
        'ON e.codigo = $1 AND e.estado_empl = 1 AND cargo_id = h.id_cargo) AS h ' +
        'ON t.codigo::varchar(15) = h.codigo AND t.fec_hora_timbre::date BETWEEN $2 AND $3 AND ' +
        't.fec_hora_timbre::date BETWEEN h.fec_inicio AND h.fec_final ' +
        'ORDER BY t.fec_hora_timbre ASC', [id_empleado, fechaInicio, fechaFinal])
        .then((result: any) => {
            return result.rows
        });

    const arrayModelado1 = await pool.query('SELECT t.fec_hora_timbre::date AS fecha, ' +
        't.fec_hora_timbre::time AS hora, t.accion FROM timbres AS t WHERE t.codigo = $1 AND ' +
        't.fec_hora_timbre BETWEEN $2 AND $3 ORDER BY t.fec_hora_timbre ASC'
        , [id_empleado, fechaInicio, fechaFinal])
        .then((result: any) => {
            return result.rows
        });

    //console.log('ver timbres', arrayModelado1)

    if (arrayModelado.length === 0) return []

    return arrayModelado.filter((obj: any) => {
        let h = obj.fec_hora_timbre.toJSON().split('T')[1].split('.')[0]
        //let h = obj.hora;
        // console.log(obj); console.log(h);
        /* let hora_timbre = HHMMtoSegundos(h) - HHMMtoSegundos('01:00:00');
         let hora_inicio = HHMMtoSegundos(obj.hora);
         let hora_final = hora_inicio + HHMMtoSegundos('01:00:00');
 */
        let hora_timbre = HHMMtoSegundos(h);
        let hora_inicio = HHMMtoSegundos(obj.hora) - HHMMtoSegundos('03:00:00');
        let hora_final = HHMMtoSegundos(obj.hora) + HHMMtoSegundos('04:00:00');


        //console.log('ver horas -------------- ', h + ' ' + hora_timbre + ' ' + hora_inicio + ' ' +
        //    hora_final + ' ' + obj.hora);


        return hora_timbre >= hora_inicio && hora_timbre <= hora_final
    }).map((obj: any) => {
        //obj.accion = obj.tipo_accion

        console.log('ver informacion ************************************** ', obj)

        return obj;

    })
}

async function EntradaSalidaPlanificacionConAcciones(id_empleado: string, fechaInicio: string, fechaFinal: string): Promise<any[]> {
    return await pool.query('SELECT * FROM timbres AS t INNER JOIN ' +
        '(SELECT * FROM datos_empleado_cargo AS e INNER JOIN ' +
        '(SELECT ph.id AS id_plan, ph.id_cargo, ph.fec_inicio, ph.fec_final, dp.id_cg_horarios,' +
        'ch.nombre AS nom_horario, dh.hora, dh.minu_espera, dh.id AS id_deta_horario, dh.tipo_accion, ' +
        'ch.hora_trabajo AS horario_horas, cargo.hora_trabaja AS cargo_horas, cargo.cargo, dp.fecha, ' +
        '(dh.hora + rpad((dh.minu_espera)::varchar(2),6,\' min\')::INTERVAL) AS hora_total ' +
        'FROM plan_horarios AS ph, empl_cargos AS cargo, plan_hora_detalles AS dp, cg_horarios AS ch, ' +
        'deta_horarios AS dh ' +
        'WHERE cargo.id = ph.id_cargo AND dh.id_horario = dp.id_cg_horarios AND ' +
        'ch.id = dp.id_cg_horarios AND ph.id = dp.id_plan_horario) AS ph ' +
        'ON e.codigo = $1 AND cargo_id = ph.id_cargo) AS ph ' +
        'ON t.codigo::varchar(15) = ph.codigo AND t.fec_hora_timbre::date BETWEEN $2 AND $3 ' +
        'AND t.fec_hora_timbre::date BETWEEN ph.fec_inicio AND ph.fec_final ' +
        'AND t.fec_hora_timbre::date = fecha AND ph.tipo_accion = t.accion ' +
        'ORDER BY t.fec_hora_timbre ASC', [id_empleado, fechaInicio, fechaFinal])
        .then((result: any) => {
            return result.rows
        })
}

async function EntradaSalidaPlanificacionSinAcciones(id_empleado: string, fechaInicio: string, fechaFinal: string): Promise<any[]> {
    const arrayModelado = await pool.query('SELECT * FROM timbres AS t INNER JOIN ' +
        '(SELECT * FROM datos_empleado_cargo AS e INNER JOIN ' +
        '(SELECT ph.id AS id_plan, ph.id_cargo, ph.fec_inicio, ph.fec_final, dp.id_cg_horarios,' +
        'ch.nombre AS nom_horario, dh.hora, dh.minu_espera, dh.id AS id_deta_horario, dh.tipo_accion, ' +
        'ch.hora_trabajo AS horario_horas, cargo.hora_trabaja AS cargo_horas, cargo.cargo, dp.fecha, ' +
        '(dh.hora + rpad((dh.minu_espera)::varchar(2),6,\' min\')::INTERVAL) AS hora_total ' +
        'FROM plan_horarios AS ph, empl_cargos AS cargo, plan_hora_detalles AS dp, cg_horarios AS ch, ' +
        'deta_horarios AS dh ' +
        'WHERE cargo.id = ph.id_cargo AND dh.id_horario = dp.id_cg_horarios AND ' +
        'ch.id = dp.id_cg_horarios AND ph.id = dp.id_plan_horario) AS ph ' +
        'ON e.codigo = $1 AND cargo_id = ph.id_cargo) AS ph ' +
        'ON t.codigo::varchar(15) = ph.codigo AND t.fec_hora_timbre::date BETWEEN $2 AND $3 ' +
        'AND t.fec_hora_timbre::date BETWEEN ph.fec_inicio AND ph.fec_final ' +
        'AND t.fec_hora_timbre::date = fecha ' +
        'ORDER BY t.fec_hora_timbre ASC', [id_empleado, fechaInicio, fechaFinal])
        .then((result: any) => {
            return result.rows
        });

    if (arrayModelado.length === 0) return []

    return arrayModelado.filter((obj: any) => {
        let h = obj.fec_hora_timbre.toJSON().split('T')[1].split('.')[0]
        // console.log(obj); console.log(h);
        let hora_timbre = HHMMtoSegundos(h) - HHMMtoSegundos('05:00:00');
        let hora_inicio = HHMMtoSegundos(obj.hora_total);
        let hora_final = hora_inicio + HHMMtoSegundos('02:00:00');
        return hora_timbre >= hora_inicio && hora_timbre <= hora_final
    }).map((obj: any) => {
        obj.accion = obj.tipo_accion
        return obj
    })
}
