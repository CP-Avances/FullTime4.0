import { ReporteAlimentacion } from "../../class/Alimentacion";
import { Request, Response } from 'express';
import pool from '../../database';

class AlimentacionControlador {

    public async ListarPlanificadosConsumidos(req: Request, res: Response) {
        const { fec_inicio, fec_final } = req.body;
        const DATOS = await pool.query(
            `
            SELECT tc.nombre AS comida_tipo, ctc.id_comida AS id_comida, 
                ctc.nombre AS menu, dm.nombre AS plato, dm.valor, dm.observacion, COUNT(dm.nombre) AS cantidad, 
                (COUNT(dm.nombre) * dm.valor) AS total 
            FROM e_cat_tipo_comida AS tc, ma_horario_comidas AS ctc, ma_detalle_comida AS dm, ma_detalle_plan_comida AS pc, 
                ma_empleado_plan_comida_general AS pce 
            WHERE tc.id = ctc.id_comida AND dm.id_horario_comida = ctc.id AND pc.id_detalle_comida = dm.id 
                AND pc.extra = false AND pce.consumido = true AND pce.id_detalle_plan = pc.id AND 
                pce.fecha BETWEEN $1 AND $2 
            GROUP BY tc.nombre, ctc.id_comida, ctc.nombre, dm.nombre, dm.valor, dm.observacion
            `
            , [fec_inicio, fec_final]);
        if (DATOS.rowCount != 0) {
            return res.jsonp(DATOS.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'No se encuentran registros.' });
        }
    }

    public async ListarSolicitadosConsumidos(req: Request, res: Response) {
        const { fec_inicio, fec_final } = req.body;
        const DATOS = await pool.query(
            `
            SELECT tc.nombre AS comida_tipo, ctc.id_comida AS id_comida, 
                ctc.nombre AS menu, dm.nombre AS plato, dm.valor, dm.observacion, COUNT(dm.nombre) AS cantidad, 
                (COUNT(dm.nombre) * dm.valor) AS total 
            FROM e_cat_tipo_comida AS tc, ma_horario_comidas AS ctc, ma_detalle_comida AS dm, ma_solicitud_comida AS sc, 
                ma_empleado_plan_comida_general AS pce 
            WHERE tc.id = ctc.id_comida AND dm.id_horario_comida = ctc.id AND sc.id_detalle_comida = dm.id 
                AND sc.extra = false AND pce.consumido = true AND sc.fecha_comida BETWEEN $1 AND $2 AND 
                pce.id_solicitud_comida = sc.id 
            GROUP BY tc.nombre, ctc.id_comida, ctc.nombre, dm.nombre, dm.valor, dm.observacion
            `
            , [fec_inicio, fec_final]);
        if (DATOS.rowCount != 0) {
            return res.jsonp(DATOS.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'error' });
        }
    }

    public async ListarExtrasPlanConsumidos(req: Request, res: Response) {
        const { fec_inicio, fec_final } = req.body;
        const DATOS = await pool.query(
            `
            SELECT tc.nombre AS comida_tipo, ctc.id_comida AS id_comida, 
                ctc.nombre AS menu, dm.nombre AS plato, dm.valor, dm.observacion, COUNT(dm.nombre) AS cantidad, 
                (COUNT(dm.nombre) * dm.valor) AS total 
            FROM e_cat_tipo_comida AS tc, ma_horario_comidas AS ctc, ma_detalle_comida AS dm, ma_detalle_plan_comida AS pc, 
                ma_empleado_plan_comida_general AS pce 
            WHERE tc.id = ctc.id_comida AND dm.id_horario_comida = ctc.id AND pc.id_detalle_comida = dm.id 
                AND pc.extra = true AND pce.consumido = true AND pce.id_detalle_plan = pc.id AND 
                pc.fecha BETWEEN $1 AND $2 
            GROUP BY tc.nombre, ctc.id_comida, ctc.nombre, dm.nombre, dm.valor, dm.observacion
            `
            , [fec_inicio, fec_final]);
        if (DATOS.rowCount != 0) {
            return res.jsonp(DATOS.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'error' });
        }
    }

    public async ListarExtrasSolConsumidos(req: Request, res: Response) {
        const { fec_inicio, fec_final } = req.body;
        const DATOS = await pool.query(
            `
            SELECT tc.nombre AS comida_tipo, ctc.id_comida AS id_comida, 
                ctc.nombre AS menu, dm.nombre AS plato, dm.valor, dm.observacion, COUNT(dm.nombre) AS cantidad,
                (COUNT(dm.nombre) * dm.valor) AS total 
            FROM e_cat_tipo_comida AS tc, ma_horario_comidas AS ctc, ma_detalle_comida AS dm, ma_solicitud_comida AS sc, 
                ma_empleado_plan_comida_general AS pce 
            WHERE tc.id = ctc.id_comida AND dm.id_horario_comida = ctc.id AND sc.id_detalle_comida = dm.id 
                AND sc.extra = true AND pce.consumido = true AND sc.fecha_comida BETWEEN $1 AND $2 AND 
                pce.id_solicitud_comida = sc.id 
            GROUP BY tc.nombre, ctc.id_comida, ctc.nombre, dm.nombre, dm.valor, dm.observacion
            `
            , [fec_inicio, fec_final]);
        if (DATOS.rowCount != 0) {
            return res.jsonp(DATOS.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'error' });
        }
    }

    public async DetallarPlanificadosConsumidos(req: Request, res: Response) {
        const { fec_inicio, fec_final } = req.body;
        const DATOS = await pool.query(
            `
            SELECT e.nombre, e.apellido, e.cedula, e.codigo, 
                tc.nombre AS comida_tipo, ctc.id_comida AS id_comida, 
                ctc.nombre AS menu, dm.nombre AS plato, dm.valor, dm.observacion, COUNT(dm.nombre) AS cantidad, 
                (COUNT(dm.nombre) * dm.valor) AS total 
            FROM e_cat_tipo_comida AS tc, ma_horario_comidas AS ctc, ma_detalle_comida AS dm, ma_detalle_plan_comida AS pc, 
                eu_empleados AS e, ma_empleado_plan_comida_general AS pce 
            WHERE tc.id = ctc.id_comida AND dm.id_horario_comida = ctc.id AND pc.id_detalle_comida = dm.id 
                AND pc.extra = false AND pce.consumido = true AND e.id = pce.id_empleado AND 
                pc.id = pce.id_detalle_plan AND pc.fecha BETWEEN $1 AND $2 
            GROUP BY tc.nombre, ctc.id_comida, ctc.nombre, dm.nombre, dm.valor, dm.observacion, e.nombre, 
                e.apellido, e.cedula, e.codigo ORDER BY e.apellido ASC
            `
            , [fec_inicio, fec_final]);
        if (DATOS.rowCount != 0) {
            return res.jsonp(DATOS.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'No se encuentran registros.' });
        }
    }

    public async DetallarSolicitudConsumidos(req: Request, res: Response) {
        const { fec_inicio, fec_final } = req.body;
        const DATOS = await pool.query(
            `
            SELECT e.nombre, e.apellido, e.cedula, e.codigo,
                tc.nombre AS comida_tipo, ctc.id_comida AS id_comida, 
                ctc.nombre AS menu, dm.nombre AS plato, dm.valor, dm.observacion, COUNT(dm.nombre) AS cantidad, 
                (COUNT(dm.nombre) * dm.valor) AS total 
            FROM e_cat_tipo_comida AS tc, ma_horario_comidas AS ctc, ma_detalle_comida AS dm, ma_solicitud_comida AS sc, 
                ma_empleado_plan_comida_general AS pce, eu_empleados AS e 
            WHERE tc.id = ctc.id_comida AND dm.id_horario_comida = ctc.id AND sc.id_detalle_comida = dm.id 
                AND sc.extra = false AND pce.consumido = true AND e.id = sc.id_empleado AND 
                sc.fecha_comida BETWEEN $1 AND $2  AND pce.id_solicitud_comida = sc.id 
            GROUP BY tc.nombre, ctc.id_comida, ctc.nombre, dm.nombre, dm.valor, dm.observacion, e.nombre, 
                e.apellido, e.cedula, e.codigo 
            ORDER BY e.apellido ASC
            `
            , [fec_inicio, fec_final]);
        if (DATOS.rowCount != 0) {
            return res.jsonp(DATOS.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'No se encuentran registros.' });
        }
    }

    public async DetallarExtrasPlanConsumidos(req: Request, res: Response) {
        const { fec_inicio, fec_final } = req.body;
        const DATOS = await pool.query(
            `
            SELECT e.nombre, e.apellido, e.cedula, e.codigo, 
                tc.nombre AS comida_tipo, ctc.id_comida AS id_comida, 
                ctc.nombre AS menu, dm.nombre AS plato, dm.valor, dm.observacion, COUNT(dm.nombre) AS cantidad, 
                (COUNT(dm.nombre) * dm.valor) AS total 
            FROM e_cat_tipo_comida AS tc, ma_horario_comidas AS ctc, ma_detalle_comida AS dm, ma_detalle_plan_comida AS pc, 
                eu_empleados AS e, ma_empleado_plan_comida_general AS pce 
            WHERE tc.id = ctc.id_comida AND dm.id_horario_comida = ctc.id AND pc.id_detalle_comida = dm.id 
                AND pc.extra = true AND pce.consumido = true AND e.id = pce.id_empleado AND 
                pc.id = pce.id_detalle_plan AND pc.fecha BETWEEN $1 AND $2 
            GROUP BY tc.nombre, ctc.id_comida, ctc.nombre, dm.nombre, dm.valor, dm.observacion, e.nombre, 
                e.apellido, e.cedula, e.codigo 
            ORDER BY e.apellido ASC
            `
            , [fec_inicio, fec_final]);
        if (DATOS.rowCount != 0) {
            return res.jsonp(DATOS.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'error' });
        }
    }

    public async DetallarExtrasSolConsumidos(req: Request, res: Response) {
        const { fec_inicio, fec_final } = req.body;
        const DATOS = await pool.query(
            `
            SELECT e.nombre, e.apellido, e.cedula, e.codigo,
                tc.nombre AS comida_tipo, ctc.id_comida AS id_comida, 
                ctc.nombre AS menu, dm.nombre AS plato, dm.valor, dm.observacion, COUNT(dm.nombre) AS cantidad, 
                (COUNT(dm.nombre) * dm.valor) AS total 
            FROM e_cat_tipo_comida AS tc, ma_horario_comidas AS ctc, ma_detalle_comida AS dm, ma_solicitud_comida AS sc, 
                ma_empleado_plan_comida_general AS pce, eu_empleados AS e 
            WHERE tc.id = ctc.id_comida AND dm.id_horario_comida = ctc.id AND sc.id_detalle_comida = dm.id 
                AND sc.extra = true AND pce.consumido = true AND e.id = sc.id_empleado AND 
                sc.fecha_comida BETWEEN $1 AND $2  AND pce.id_solicitud_comida = sc.id 
            GROUP BY tc.nombre, ctc.id_comida, ctc.nombre, dm.nombre, dm.valor, dm.observacion, e.nombre, 
                e.apellido, e.cedula, e.codigo 
            ORDER BY e.apellido ASC
            `
            , [fec_inicio, fec_final]);
        if (DATOS.rowCount != 0) {
            return res.jsonp(DATOS.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'error' });
        }
    }


    public async DetallarServiciosInvitados(req: Request, res: Response) {
        const { fec_inicio, fec_final } = req.body;
        const DATOS = await pool.query(
            `
            SELECT ci.nombre_invitado, ci.apellido_invitado, ci.cedula_invitado,
                tc.nombre AS comida_tipo, ctc.id_comida AS id_comida, ci.ticket, 
                ctc.nombre AS menu, dm.nombre AS plato, dm.valor, dm.observacion, COUNT(dm.nombre) AS cantidad, 
                (COUNT(dm.nombre) * dm.valor) AS total 
            FROM e_cat_tipo_comida AS tc, ma_horario_comidas AS ctc, ma_detalle_comida AS dm, ma_invitados_comida AS ci 
            WHERE tc.id = ctc.id_comida AND dm.id_horario_comida = ctc.id AND ci.id_detalle_comida = dm.id 
                AND ci.fecha BETWEEN $1 AND $2 
            GROUP BY tc.nombre, ctc.id_comida, ctc.nombre, dm.nombre, dm.valor, dm.observacion, 
                ci.nombre_invitado, ci.apellido_invitado, ci.cedula_invitado, ci.ticket
            `
            , [fec_inicio, fec_final]);
        if (DATOS.rowCount != 0) {
            return res.jsonp(DATOS.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'error' });
        }
    }

    // METODO PARA BUSCAR DATOS DE ALIMENTACION   **USADO
    public async ReporteTimbresAlimentacion(req: Request, res: Response) {
        let { desde, hasta } = req.params;
        let datos: any[] = req.body;
        let n: Array<any> = await Promise.all(datos.map(async (obj: any) => {
            obj.empleados = await Promise.all(obj.empleados.map(async (o: any) => {
                const listaTimbres = await BuscarAlimentacion(desde, hasta, o.id);
                o.alimentacion = await AgruparTimbres(listaTimbres);
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

// FUNCION PARA BUSCAR DATOS DE ALIMENTACION
const BuscarAlimentacion = async function (fec_inicio: string, fec_final: string, id_empleado: string | number) {
    return await pool.query(
        `
        SELECT CAST(fecha_horario AS VARCHAR), CAST(fecha_hora_horario AS VARCHAR), CAST(fecha_hora_timbre AS VARCHAR),
            id_empleado, estado_timbre, tipo_accion AS accion, minutos_alimentacion 
        FROM eu_asistencia_general 
        WHERE CAST(fecha_hora_horario AS VARCHAR) BETWEEN $1 || '%' 
            AND ($2::timestamp + '1 DAY') || '%' AND id_empleado = $3 
            AND tipo_accion IN ('I/A', 'F/A') 
        ORDER BY id_empleado, fecha_hora_horario ASC
        `
        , [fec_inicio, fec_final, id_empleado])
        .then(res => {
            return res.rows;
        })
}

// METODO PARA AGRUPAR TIMBRES
const AgruparTimbres = async function (listaTimbres: any) {
    const timbresAgrupados: any[] = [];
    for (let i = 0; i < listaTimbres.length; i += 2) {
        timbresAgrupados.push({
            inicioAlimentacion: listaTimbres[i],
            finAlimentacion: i + 1 < listaTimbres.length ? listaTimbres[i + 1] : null
        });
    }
    return timbresAgrupados;
}