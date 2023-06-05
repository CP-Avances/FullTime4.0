import { Request, Response } from 'express';
import pool from '../../database';

class PlanGeneralControlador {

    // METODO PARA REGISTRAR PLAN GENERAL
    public async CrearPlanificacion(req: Request, res: Response): Promise<any> {
        var errores: number = 0;
        var iterar: number = 0;
        var cont: number = 0;

        errores = 0;
        iterar = 0;
        cont = 0;

        for (var i = 0; i < req.body.length; i++) {

            pool.query(
                `
                INSERT INTO plan_general (fec_hora_horario, tolerancia, estado_timbre, id_det_horario,
                    fec_horario, id_empl_cargo, tipo_entr_salida, codigo, id_horario, tipo_dia, salida_otro_dia,
                    min_antes, min_despues) 
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *
                `,
                [req.body[i].fec_hora_horario, req.body[i].tolerancia, req.body[i].estado_timbre,
                req.body[i].id_det_horario, req.body[i].fec_horario, req.body[i].id_empl_cargo,
                req.body[i].tipo_entr_salida, req.body[i].codigo, req.body[i].id_horario, req.body[i].tipo_dia,
                req.body[i].salida_otro_dia, req.body[i].min_antes, req.body[i].min_despues]
                , (error) => {

                    iterar = iterar + 1;

                    try {
                        if (error) {
                            errores = errores + 1;
                            console.log("contador errores" + errores);
                            if (iterar === req.body.length && errores > 0) {
                                return res.status(200).jsonp({ message: 'error' });
                            }
                        } else {
                            cont = cont + 1;
                            //console.log("Rows " + JSON.stringify(results.rows));
                            console.log("contador " + cont);
                            if (iterar === req.body.length && cont === req.body.length) {
                                return res.status(200).jsonp({ message: 'OK' });
                            }
                            else if (iterar === req.body.length && cont != req.body.length) {
                                return res.status(200).jsonp({ message: 'error' });
                            }
                        }

                    } catch (error) {
                        return res.status(500).jsonp({ message: 'Se ha producido un error en el proceso.' });
                    }
                });
        }
    }

    // METODO PARA BUSCAR ID POR FECHAS PLAN GENERAL
    public async BuscarFechas(req: Request, res: Response) {
        const { fec_inicio, fec_final, id_horario, codigo } = req.body;

        console.log('imgresa con ', req.body)
        
        const FECHAS = await pool.query(
            `
            SELECT id FROM plan_general WHERE 
            (fec_horario BETWEEN $1 AND $2) AND id_horario = $3 AND codigo = $4
            `
            , [fec_inicio, fec_final, id_horario, codigo]);
        if (FECHAS.rowCount > 0) {
            return res.jsonp(FECHAS.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'No se encuentran registros.' });
        }
    }

    // METODO PARA ELIMINAR REGISTROS
    public async EliminarRegistros(req: Request, res: Response): Promise<void> {
        
        var errores: number = 0;
        var iterar: number = 0;
        var cont: number = 0;

        errores = 0;
        iterar = 0;
        cont = 0;

        console.log('entra ', req.body.length)

        for (var i = 0; i < req.body.length; i++) {

            pool.query(
                `
                DELETE FROM plan_general WHERE id = $1
                `,
                [req.body[i].id]
                , (error) => {

                    iterar = iterar + 1;

                    try {
                        if (error) {
                            errores = errores + 1;
                            console.log("contador errores" + errores);
                            if (iterar === req.body.length && errores > 0) {
                                return res.status(200).jsonp({ message: 'error' });
                            }
                        } else {
                            cont = cont + 1;
                            //console.log("Rows " + JSON.stringify(results.rows));
                            console.log("contador " + cont);
                            if (iterar === req.body.length && cont === req.body.length) {
                                return res.status(200).jsonp({ message: 'OK' });
                            }
                            else if (iterar === req.body.length && cont != req.body.length) {
                                return res.status(200).jsonp({ message: 'error' });
                            }
                        }

                    } catch (error) {
                        return res.status(500).jsonp({ message: 'Se ha producido un error en el proceso.' });
                    }
                });
        }

    }

    // METODO PARA BUSCAR PLANIFICACION EN UN RANGO DE FECHAS
    public async BuscarHorarioFechas(req: Request, res: Response) {
        try {
            const { fecha_inicio, fecha_final, codigo } = req.body;
            const HORARIO = await pool.query(
                `
                SELECT DISTINCT (fec_horario), tipo_dia
                FROM plan_general 
                WHERE codigo::varchar = $3 AND fec_horario BETWEEN $1 AND $2
                ORDER BY fec_horario ASC
                `
                , [fecha_inicio, fecha_final, codigo]);

            if (HORARIO.rowCount > 0) {
                return res.jsonp(HORARIO.rows)
            }
            else {
                res.status(404).jsonp({ text: 'Registros no encontrados.' });
            }
        }
        catch (error) {
            return res.jsonp({ message: 'error' });
        }
    }











    public async BuscarFecha(req: Request, res: Response) {
        const { fec_inicio, id_horario, codigo } = req.body;
        const FECHAS = await pool.query('SELECT id FROM plan_general WHERE fec_horario = $1 AND ' +
            'id_horario = $2 AND codigo = $3',
            [fec_inicio, id_horario, codigo]);
        if (FECHAS.rowCount > 0) {
            return res.jsonp(FECHAS.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'No se encuentran registros' });
        }
    }

}

export const PLAN_GENERAL_CONTROLADOR = new PlanGeneralControlador();

export default PLAN_GENERAL_CONTROLADOR;