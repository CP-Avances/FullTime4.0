import { ReporteAlimentacion } from "../../class/Alimentacion";
import { Request, Response } from 'express';
import pool from '../../database';

class AlimentacionControlador {

    public async ListarPlanificadosConsumidos(req: Request, res: Response) {
        const { fec_inicio, fec_final } = req.body;
        const DATOS = await pool.query('SELECT tc.nombre AS comida_tipo, ctc.tipo_comida AS id_comida, ' +
            'ctc.nombre AS menu, dm.nombre AS plato, dm.valor, dm.observacion, COUNT(dm.nombre) AS cantidad, ' +
            '(COUNT(dm.nombre) * dm.valor) AS total ' +
            'FROM tipo_comida AS tc, cg_tipo_comidas AS ctc, detalle_menu AS dm, plan_comidas AS pc, ' +
            'plan_comida_empleado AS pce ' +
            'WHERE tc.id = ctc.tipo_comida AND dm.id_menu = ctc.id AND pc.id_comida = dm.id ' +
            'AND pc.extra = false AND pce.consumido = true AND pce.id_plan_comida = pc.id AND ' +
            'pce.fecha BETWEEN $1 AND $2 ' +
            'GROUP BY tc.nombre, ctc.tipo_comida, ctc.nombre, dm.nombre, dm.valor, dm.observacion',
            [fec_inicio, fec_final]);
        if (DATOS.rowCount > 0) {
            return res.jsonp(DATOS.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'No se encuentran registros' });
        }
    }

    public async ListarSolicitadosConsumidos(req: Request, res: Response) {
        const { fec_inicio, fec_final } = req.body;
        const DATOS = await pool.query('SELECT tc.nombre AS comida_tipo, ctc.tipo_comida AS id_comida, ' +
            'ctc.nombre AS menu, dm.nombre AS plato, dm.valor, dm.observacion, COUNT(dm.nombre) AS cantidad, ' +
            '(COUNT(dm.nombre) * dm.valor) AS total ' +
            'FROM tipo_comida AS tc, cg_tipo_comidas AS ctc, detalle_menu AS dm, solicita_comidas AS sc, ' +
            'plan_comida_empleado AS pce ' +
            'WHERE tc.id = ctc.tipo_comida AND dm.id_menu = ctc.id AND sc.id_comida = dm.id ' +
            'AND sc.extra = false AND pce.consumido = true AND sc.fec_comida BETWEEN $1 AND $2 AND ' +
            'pce.id_sol_comida = sc.id ' +
            'GROUP BY tc.nombre, ctc.tipo_comida, ctc.nombre, dm.nombre, dm.valor, dm.observacion',
            [fec_inicio, fec_final]);
        if (DATOS.rowCount > 0) {
            return res.jsonp(DATOS.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'error' });
        }
    }

    public async ListarExtrasPlanConsumidos(req: Request, res: Response) {
        const { fec_inicio, fec_final } = req.body;
        const DATOS = await pool.query('SELECT tc.nombre AS comida_tipo, ctc.tipo_comida AS id_comida, ' +
            'ctc.nombre AS menu, dm.nombre AS plato, dm.valor, dm.observacion, COUNT(dm.nombre) AS cantidad, ' +
            '(COUNT(dm.nombre) * dm.valor) AS total ' +
            'FROM tipo_comida AS tc, cg_tipo_comidas AS ctc, detalle_menu AS dm, plan_comidas AS pc, ' +
            'plan_comida_empleado AS pce ' +
            'WHERE tc.id = ctc.tipo_comida AND dm.id_menu = ctc.id AND pc.id_comida = dm.id ' +
            'AND pc.extra = true AND pce.consumido = true AND pce.id_plan_comida = pc.id AND ' +
            'pc.fecha BETWEEN $1 AND $2 ' +
            'GROUP BY tc.nombre, ctc.tipo_comida, ctc.nombre, dm.nombre, dm.valor, dm.observacion',
            [fec_inicio, fec_final]);
        if (DATOS.rowCount > 0) {
            return res.jsonp(DATOS.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'error' });
        }
    }

    public async ListarExtrasSolConsumidos(req: Request, res: Response) {
        const { fec_inicio, fec_final } = req.body;
        const DATOS = await pool.query('SELECT tc.nombre AS comida_tipo, ctc.tipo_comida AS id_comida, ' +
            'ctc.nombre AS menu, dm.nombre AS plato, dm.valor, dm.observacion, COUNT(dm.nombre) AS cantidad, ' +
            '(COUNT(dm.nombre) * dm.valor) AS total ' +
            'FROM tipo_comida AS tc, cg_tipo_comidas AS ctc, detalle_menu AS dm, solicita_comidas AS sc, ' +
            'plan_comida_empleado AS pce ' +
            'WHERE tc.id = ctc.tipo_comida AND dm.id_menu = ctc.id AND sc.id_comida = dm.id ' +
            'AND sc.extra = true AND pce.consumido = true AND sc.fec_comida BETWEEN $1 AND $2 AND ' +
            'pce.id_sol_comida = sc.id ' +
            'GROUP BY tc.nombre, ctc.tipo_comida, ctc.nombre, dm.nombre, dm.valor, dm.observacion',
            [fec_inicio, fec_final]);
        if (DATOS.rowCount > 0) {
            return res.jsonp(DATOS.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'error' });
        }
    }

    public async DetallarPlanificadosConsumidos(req: Request, res: Response) {
        const { fec_inicio, fec_final } = req.body;
        const DATOS = await pool.query('SELECT e.nombre, e.apellido, e.cedula, e.codigo, ' +
            'tc.nombre AS comida_tipo, ctc.tipo_comida AS id_comida, ' +
            'ctc.nombre AS menu, dm.nombre AS plato, dm.valor, dm.observacion, COUNT(dm.nombre) AS cantidad, ' +
            '(COUNT(dm.nombre) * dm.valor) AS total ' +
            'FROM tipo_comida AS tc, cg_tipo_comidas AS ctc, detalle_menu AS dm, plan_comidas AS pc, ' +
            'empleados AS e, plan_comida_empleado AS pce ' +
            'WHERE tc.id = ctc.tipo_comida AND dm.id_menu = ctc.id AND pc.id_comida = dm.id ' +
            'AND pc.extra = false AND pce.consumido = true AND e.id = pce.id_empleado AND ' +
            'pc.id = pce.id_plan_comida AND pc.fecha BETWEEN $1 AND $2 ' +
            'GROUP BY tc.nombre, ctc.tipo_comida, ctc.nombre, dm.nombre, dm.valor, dm.observacion, e.nombre, ' +
            'e.apellido, e.cedula, e.codigo ORDER BY e.apellido ASC',
            [fec_inicio, fec_final]);
        if (DATOS.rowCount > 0) {
            return res.jsonp(DATOS.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'No se encuentran registros' });
        }
    }

    public async DetallarSolicitudConsumidos(req: Request, res: Response) {
        const { fec_inicio, fec_final } = req.body;
        const DATOS = await pool.query('SELECT e.nombre, e.apellido, e.cedula, e.codigo, ' +
            'tc.nombre AS comida_tipo, ctc.tipo_comida AS id_comida, ' +
            'ctc.nombre AS menu, dm.nombre AS plato, dm.valor, dm.observacion, COUNT(dm.nombre) AS cantidad, ' +
            '(COUNT(dm.nombre) * dm.valor) AS total ' +
            'FROM tipo_comida AS tc, cg_tipo_comidas AS ctc, detalle_menu AS dm, solicita_comidas AS sc, ' +
            'plan_comida_empleado AS pce, empleados AS e ' +
            'WHERE tc.id = ctc.tipo_comida AND dm.id_menu = ctc.id AND sc.id_comida = dm.id ' +
            'AND sc.extra = false AND pce.consumido = true AND e.id = sc.id_empleado AND ' +
            'sc.fec_comida BETWEEN $1 AND $2  AND pce.id_sol_comida = sc.id ' +
            'GROUP BY tc.nombre, ctc.tipo_comida, ctc.nombre, dm.nombre, dm.valor, dm.observacion, e.nombre, ' +
            'e.apellido, e.cedula, e.codigo ORDER BY e.apellido ASC',
            [fec_inicio, fec_final]);
        if (DATOS.rowCount > 0) {
            return res.jsonp(DATOS.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'No se encuentran registros' });
        }
    }

    public async DetallarExtrasPlanConsumidos(req: Request, res: Response) {
        const { fec_inicio, fec_final } = req.body;
        const DATOS = await pool.query('SELECT e.nombre, e.apellido, e.cedula, e.codigo, ' +
            'tc.nombre AS comida_tipo, ctc.tipo_comida AS id_comida, ' +
            'ctc.nombre AS menu, dm.nombre AS plato, dm.valor, dm.observacion, COUNT(dm.nombre) AS cantidad, ' +
            '(COUNT(dm.nombre) * dm.valor) AS total ' +
            'FROM tipo_comida AS tc, cg_tipo_comidas AS ctc, detalle_menu AS dm, plan_comidas AS pc, ' +
            'empleados AS e, plan_comida_empleado AS pce ' +
            'WHERE tc.id = ctc.tipo_comida AND dm.id_menu = ctc.id AND pc.id_comida = dm.id ' +
            'AND pc.extra = true AND pce.consumido = true AND e.id = pce.id_empleado AND ' +
            'pc.id = pce.id_plan_comida AND pc.fecha BETWEEN $1 AND $2 ' +
            'GROUP BY tc.nombre, ctc.tipo_comida, ctc.nombre, dm.nombre, dm.valor, dm.observacion, e.nombre, ' +
            'e.apellido, e.cedula, e.codigo ORDER BY e.apellido ASC',
            [fec_inicio, fec_final]);
        if (DATOS.rowCount > 0) {
            return res.jsonp(DATOS.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'error' });
        }
    }

    public async DetallarExtrasSolConsumidos(req: Request, res: Response) {
        const { fec_inicio, fec_final } = req.body;
        const DATOS = await pool.query('SELECT e.nombre, e.apellido, e.cedula, e.codigo, ' +
            'tc.nombre AS comida_tipo, ctc.tipo_comida AS id_comida, ' +
            'ctc.nombre AS menu, dm.nombre AS plato, dm.valor, dm.observacion, COUNT(dm.nombre) AS cantidad, ' +
            '(COUNT(dm.nombre) * dm.valor) AS total ' +
            'FROM tipo_comida AS tc, cg_tipo_comidas AS ctc, detalle_menu AS dm, solicita_comidas AS sc, ' +
            'plan_comida_empleado AS pce, empleados AS e ' +
            'WHERE tc.id = ctc.tipo_comida AND dm.id_menu = ctc.id AND sc.id_comida = dm.id ' +
            'AND sc.extra = true AND pce.consumido = true AND e.id = sc.id_empleado AND ' +
            'sc.fec_comida BETWEEN $1 AND $2  AND pce.id_sol_comida = sc.id ' +
            'GROUP BY tc.nombre, ctc.tipo_comida, ctc.nombre, dm.nombre, dm.valor, dm.observacion, e.nombre, ' +
            'e.apellido, e.cedula, e.codigo ORDER BY e.apellido ASC',
            [fec_inicio, fec_final]);
        if (DATOS.rowCount > 0) {
            return res.jsonp(DATOS.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'error' });
        }
    }


    public async DetallarServiciosInvitados(req: Request, res: Response) {
        const { fec_inicio, fec_final } = req.body;
        const DATOS = await pool.query('SELECT ci.nombre_invitado, ci.apellido_invitado, ci.cedula_invitado, ' +
            'tc.nombre AS comida_tipo, ctc.tipo_comida AS id_comida, ci.ticket, ' +
            'ctc.nombre AS menu, dm.nombre AS plato, dm.valor, dm.observacion, COUNT(dm.nombre) AS cantidad, ' +
            '(COUNT(dm.nombre) * dm.valor) AS total ' +
            'FROM tipo_comida AS tc, cg_tipo_comidas AS ctc, detalle_menu AS dm, comida_invitados AS ci ' +
            'WHERE tc.id = ctc.tipo_comida AND dm.id_menu = ctc.id AND ci.id_detalle_menu = dm.id ' +
            'AND ci.fecha BETWEEN $1 AND $2 ' +
            'GROUP BY tc.nombre, ctc.tipo_comida, ctc.nombre, dm.nombre, dm.valor, dm.observacion, ' +
            'ci.nombre_invitado, ci.apellido_invitado, ci.cedula_invitado, ci.ticket',
            [fec_inicio, fec_final]);
        if (DATOS.rowCount > 0) {
            return res.jsonp(DATOS.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'error' });
        }
    }

    public async ReporteTimbresAlimentacion(req: Request, res: Response) {
        console.log('datos recibidos', req.body)
        let { desde, hasta } = req.params
        let datos: any[] = req.body;

        let n: Array<any> = await Promise.all(datos.map(async (obj: ReporteAlimentacion) => {
            obj.departamentos = await Promise.all(obj.departamentos.map(async (ele) => {
                ele.empleado = await Promise.all(ele.empleado.map(async (o) => {
                    const listaTimbres = await BuscarAlimentacion(desde, hasta, o.codigo);
                    o.timbres = await agruparTimbres(listaTimbres);
                    console.log('timbres:-------------------- ', o);
                    return o
                })
                )
                return ele
            })
            )
            return obj
        })
        )

        let nuevo = n.map((obj: ReporteAlimentacion) => {
            obj.departamentos = obj.departamentos.map((e) => {
                e.empleado = e.empleado.filter((v: any) => { return v.timbres.length > 0 })
                return e
            }).filter((e: any) => { return e.empleado.length > 0 })
            return obj

        }).filter(obj => { return obj.departamentos.length > 0 })

        if (nuevo.length === 0) return res.status(400).jsonp({ message: 'No se ha encontrado registro de faltas.' })

        return res.status(200).jsonp(nuevo)

    }

    public async ReporteTimbresAlimentacionRegimenCargo(req: Request, res: Response) {
        console.log('datos recibidos', req.body)
        let { desde, hasta } = req.params;
        let datos: any[] = req.body;
        let n: Array<any> = await Promise.all(datos.map(async (obj: any) => {      
            obj.empleados = await Promise.all(obj.empleados.map(async (o:any) => {
                const listaTimbres = await BuscarAlimentacion(desde, hasta, o.codigo);
                o.timbres = await agruparTimbres(listaTimbres);
                console.log('Timbres: ', o);
                return o;
            }));    
            return obj;
        }));

        let nuevo = n.map((e: any) => {
            e.empleados = e.empleados.filter((t: any) => { return t.timbres.length > 0 })
            return e
        }).filter(e => { return e.empleados.length > 0 })

        if (nuevo.length === 0) return res.status(400).jsonp({ message: 'No se ha encontrado registro de faltas.' })

        return res.status(200).jsonp(nuevo)

    }


}

export const ALIMENTACION_CONTROLADOR = new AlimentacionControlador();

export default ALIMENTACION_CONTROLADOR;


const BuscarAlimentacion = async function (fec_inicio: string, fec_final: string, codigo: string | number) {
    return await pool.query('SELECT CAST(fec_horario AS VARCHAR), CAST(fec_hora_horario AS VARCHAR), CAST(fec_hora_timbre AS VARCHAR), ' +
    'codigo, estado_timbre, tipo_entr_salida AS accion, min_alimentacion ' +
    'FROM plan_general WHERE CAST(fec_hora_horario AS VARCHAR) BETWEEN $1 || \'%\' ' +
    'AND ($2::timestamp + \'1 DAY\') || \'%\' AND codigo = $3 ' +
    'AND tipo_dia NOT IN (\'L\', \'FD\') ' +
    'AND tipo_entr_salida IN (\'I/A\', \'F/A\') ' +
    'ORDER BY codigo, fec_hora_horario ASC', [fec_inicio, fec_final, codigo])
        .then(res => {
            return res.rows;
        })
}


const agruparTimbres = async function(listaTimbres: any) {
    console.log('en agrupar');
    const timbresAgrupados: any[] = [];
    for (let i = 0; i < listaTimbres.length; i += 2) {
        timbresAgrupados.push({
            inicioAlimentacion: listaTimbres[i],
            finAlimentacion: i + 1 < listaTimbres.length ? listaTimbres[i + 1] : null
        });
    }
    return timbresAgrupados;
}