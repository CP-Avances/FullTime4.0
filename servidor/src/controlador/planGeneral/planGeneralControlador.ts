import { Request, Response } from 'express';
import pool from '../../database';

class PlanGeneralControlador {

    // METODO PARA REGISTRAR PLAN GENERAL   --**VERIFICADO
    public async CrearPlanificacion(req: Request, res: Response): Promise<any> {
        var errores: number = 0;
        var iterar: number = 0;
        var cont: number = 0;

        // CONTADORES INICIAN EN CERO (0)
        errores = 0;
        iterar = 0;
        cont = 0;

        for (var i = 0; i < req.body.length; i++) {

            pool.query(
                `
                INSERT INTO eu_asistencia_general (fecha_hora_horario, tolerancia, estado_timbre, id_detalle_horario,
                    fecha_horario, id_empleado_cargo, tipo_accion, codigo, id_horario, tipo_dia, salida_otro_dia,
                    minutos_antes, minutos_despues, estado_origen, minutos_alimentacion) 
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) RETURNING *
                `
                , [req.body[i].fec_hora_horario, req.body[i].tolerancia, req.body[i].estado_timbre,
                req.body[i].id_det_horario, req.body[i].fec_horario, req.body[i].id_empl_cargo,
                req.body[i].tipo_entr_salida, req.body[i].codigo, req.body[i].id_horario, req.body[i].tipo_dia,
                req.body[i].salida_otro_dia, req.body[i].min_antes, req.body[i].min_despues, req.body[i].estado_origen,
                req.body[i].min_alimentacion]
                , (error) => {

                    iterar = iterar + 1;

                    try {
                        console.log('if ', error)
                        if (error) {
                            errores = errores + 1;
                            if (iterar === req.body.length && errores > 0) {
                                return res.status(200).jsonp({ message: 'error' });
                            }
                        } else {
                            cont = cont + 1;
                            if (iterar === req.body.length && cont === req.body.length) {
                                return res.status(200).jsonp({ message: 'OK' });
                            }
                            else if (iterar === req.body.length && cont != req.body.length) {
                                return res.status(200).jsonp({ message: 'error' });
                            }
                        }

                    } catch (error) {
                        console.log('ver el error ', error)
                        return res.status(500).jsonp({ message: 'Se ha producido un error en el proceso.' });
                    }
                });
        }
    }

    // METODO PARA BUSCAR ID POR FECHAS PLAN GENERAL   --**VERIFICADO
    public async BuscarFechas(req: Request, res: Response) {
        const { fec_inicio, fec_final, id_horario, codigo } = req.body;
        const FECHAS = await pool.query(
            `
            SELECT id FROM eu_asistencia_general 
            WHERE (fecha_horario BETWEEN $1 AND $2) AND id_horario = $3 AND codigo = $4
            `
            , [fec_inicio, fec_final, id_horario, codigo]);
        if (FECHAS.rowCount > 0) {
            return res.jsonp(FECHAS.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'No se encuentran registros.' });
        }
    }

    // METODO PARA ELIMINAR REGISTROS    --**VERIFICADO
    public async EliminarRegistros(req: Request, res: Response): Promise<void> {

        var errores: number = 0;
        var iterar: number = 0;
        var cont: number = 0;

        // CONTADORES INICIAN EN CERO (0)
        errores = 0;
        iterar = 0;
        cont = 0;

        for (var i = 0; i < req.body.length; i++) {

            pool.query(
                `
                DELETE FROM eu_asistencia_general WHERE id = $1
                `
                , [req.body[i].id]
                , (error) => {

                    iterar = iterar + 1;

                    try {
                        if (error) {
                            errores = errores + 1;
                            if (iterar === req.body.length && errores > 0) {
                                return res.status(200).jsonp({ message: 'error' });
                            }
                        } else {
                            cont = cont + 1;
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
            const { codigo, lista_fechas } = req.body;

            const HORARIO = await pool.query(
                `
                SELECT DISTINCT (pg.fecha_horario), pg.tipo_dia, c.hora_trabaja, pg.tipo_accion, pg.codigo, pg.estado_origen 
                FROM eu_asistencia_general AS pg, eu_empleado_cargos AS c 
                WHERE pg.fecha_horario IN (${lista_fechas}) 
                    AND pg.codigo = $1 AND c.id = pg.id_empleado_cargo 
                    AND (pg.tipo_accion = 'E' OR pg.tipo_accion = 'S') 
                ORDER BY pg.fecha_horario ASC
                `
                , [codigo]);

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

    // METODO PARA LISTAR LAS PLANIFICACIONES QUE TIENE REGISTRADAS EL USUARIO   --**VERIFICADO
    public async ListarPlanificacionHoraria(req: Request, res: Response) {
        try {
            const { fecha_inicio, fecha_final, codigo } = req.body;
            const HORARIO = await pool.query(
                "SELECT codigo_e, nombre_e, anio, mes, " +
                "CASE WHEN STRING_AGG(CASE WHEN dia = 1 THEN codigo_dia end,', ') IS NOT NULL THEN STRING_AGG(CASE WHEN dia = 1 THEN codigo_dia end,', ') ELSE '-' END AS dia1, " +
                "CASE WHEN STRING_AGG(CASE WHEN dia = 2 THEN codigo_dia end,', ') IS NOT NULL THEN STRING_AGG(CASE WHEN dia = 2 THEN codigo_dia end,', ') ELSE '-' END AS dia2, " +
                "CASE WHEN STRING_AGG(CASE WHEN dia = 3 THEN codigo_dia end,', ') IS NOT NULL THEN STRING_AGG(CASE WHEN dia = 3 THEN codigo_dia end,', ') ELSE '-' END AS dia3, " +
                "CASE WHEN STRING_AGG(CASE WHEN dia = 4 THEN codigo_dia end,', ') IS NOT NULL THEN STRING_AGG(CASE WHEN dia = 4 THEN codigo_dia end,', ') ELSE '-' END AS dia4, " +
                "CASE WHEN STRING_AGG(CASE WHEN dia = 5 THEN codigo_dia end,', ') IS NOT NULL THEN STRING_AGG(CASE WHEN dia = 5 THEN codigo_dia end,', ') ELSE '-' END AS dia5, " +
                "CASE WHEN STRING_AGG(CASE WHEN dia = 6 THEN codigo_dia end,', ') IS NOT NULL THEN STRING_AGG(CASE WHEN dia = 6 THEN codigo_dia end,', ') ELSE '-' END AS dia6, " +
                "CASE WHEN STRING_AGG(CASE WHEN dia = 7 THEN codigo_dia end,', ') IS NOT NULL THEN STRING_AGG(CASE WHEN dia = 7 THEN codigo_dia end,', ') ELSE '-' END AS dia7, " +
                "CASE WHEN STRING_AGG(CASE WHEN dia = 8 THEN codigo_dia end,', ') IS NOT NULL THEN STRING_AGG(CASE WHEN dia = 8 THEN codigo_dia end,', ') ELSE '-' END AS dia8, " +
                "CASE WHEN STRING_AGG(CASE WHEN dia = 9 THEN codigo_dia end,', ') IS NOT NULL THEN STRING_AGG(CASE WHEN dia = 9 THEN codigo_dia end,', ') ELSE '-' END AS dia9, " +
                "CASE WHEN STRING_AGG(CASE WHEN dia = 10 THEN codigo_dia end,', ') IS NOT NULL THEN STRING_AGG(CASE WHEN dia = 10 THEN codigo_dia end,', ') ELSE '-' END AS dia10, " +
                "CASE WHEN STRING_AGG(CASE WHEN dia = 11 THEN codigo_dia end,', ') IS NOT NULL THEN STRING_AGG(CASE WHEN dia = 11 THEN codigo_dia end,', ') ELSE '-' END AS dia11, " +
                "CASE WHEN STRING_AGG(CASE WHEN dia = 12 THEN codigo_dia end,', ') IS NOT NULL THEN STRING_AGG(CASE WHEN dia = 12 THEN codigo_dia end,', ') ELSE '-' END AS dia12, " +
                "CASE WHEN STRING_AGG(CASE WHEN dia = 13 THEN codigo_dia end,', ') IS NOT NULL THEN STRING_AGG(CASE WHEN dia = 13 THEN codigo_dia end,', ') ELSE '-' END AS dia13, " +
                "CASE WHEN STRING_AGG(CASE WHEN dia = 14 THEN codigo_dia end,', ') IS NOT NULL THEN STRING_AGG(CASE WHEN dia = 14 THEN codigo_dia end,', ') ELSE '-' END AS dia14, " +
                "CASE WHEN STRING_AGG(CASE WHEN dia = 15 THEN codigo_dia end,', ') IS NOT NULL THEN STRING_AGG(CASE WHEN dia = 15 THEN codigo_dia end,', ') ELSE '-' END AS dia15, " +
                "CASE WHEN STRING_AGG(CASE WHEN dia = 16 THEN codigo_dia end,', ') IS NOT NULL THEN STRING_AGG(CASE WHEN dia = 16 THEN codigo_dia end,', ') ELSE '-' END AS dia16, " +
                "CASE WHEN STRING_AGG(CASE WHEN dia = 17 THEN codigo_dia end,', ') IS NOT NULL THEN STRING_AGG(CASE WHEN dia = 17 THEN codigo_dia end,', ') ELSE '-' END AS dia17, " +
                "CASE WHEN STRING_AGG(CASE WHEN dia = 18 THEN codigo_dia end,', ') IS NOT NULL THEN STRING_AGG(CASE WHEN dia = 18 THEN codigo_dia end,', ') ELSE '-' END AS dia18, " +
                "CASE WHEN STRING_AGG(CASE WHEN dia = 19 THEN codigo_dia end,', ') IS NOT NULL THEN STRING_AGG(CASE WHEN dia = 19 THEN codigo_dia end,', ') ELSE '-' END AS dia19, " +
                "CASE WHEN STRING_AGG(CASE WHEN dia = 20 THEN codigo_dia end,', ') IS NOT NULL THEN STRING_AGG(CASE WHEN dia = 20 THEN codigo_dia end,', ') ELSE '-' END AS dia20, " +
                "CASE WHEN STRING_AGG(CASE WHEN dia = 21 THEN codigo_dia end,', ') IS NOT NULL THEN STRING_AGG(CASE WHEN dia = 21 THEN codigo_dia end,', ') ELSE '-' END AS dia21, " +
                "CASE WHEN STRING_AGG(CASE WHEN dia = 22 THEN codigo_dia end,', ') IS NOT NULL THEN STRING_AGG(CASE WHEN dia = 22 THEN codigo_dia end,', ') ELSE '-' END AS dia22, " +
                "CASE WHEN STRING_AGG(CASE WHEN dia = 23 THEN codigo_dia end,', ') IS NOT NULL THEN STRING_AGG(CASE WHEN dia = 23 THEN codigo_dia end,', ') ELSE '-' END AS dia23, " +
                "CASE WHEN STRING_AGG(CASE WHEN dia = 24 THEN codigo_dia end,', ') IS NOT NULL THEN STRING_AGG(CASE WHEN dia = 24 THEN codigo_dia end,', ') ELSE '-' END AS dia24, " +
                "CASE WHEN STRING_AGG(CASE WHEN dia = 25 THEN codigo_dia end,', ') IS NOT NULL THEN STRING_AGG(CASE WHEN dia = 25 THEN codigo_dia end,', ') ELSE '-' END AS dia25, " +
                "CASE WHEN STRING_AGG(CASE WHEN dia = 26 THEN codigo_dia end,', ') IS NOT NULL THEN STRING_AGG(CASE WHEN dia = 26 THEN codigo_dia end,', ') ELSE '-' END AS dia26, " +
                "CASE WHEN STRING_AGG(CASE WHEN dia = 27 THEN codigo_dia end,', ') IS NOT NULL THEN STRING_AGG(CASE WHEN dia = 27 THEN codigo_dia end,', ') ELSE '-' END AS dia27, " +
                "CASE WHEN STRING_AGG(CASE WHEN dia = 28 THEN codigo_dia end,', ') IS NOT NULL THEN STRING_AGG(CASE WHEN dia = 28 THEN codigo_dia end,', ') ELSE '-' END AS dia28, " +
                "CASE WHEN STRING_AGG(CASE WHEN dia = 29 THEN codigo_dia end,', ') IS NOT NULL THEN STRING_AGG(CASE WHEN dia = 29 THEN codigo_dia end,', ') ELSE '-' END AS dia29, " +
                "CASE WHEN STRING_AGG(CASE WHEN dia = 30 THEN codigo_dia end,', ') IS NOT NULL THEN STRING_AGG(CASE WHEN dia = 30 THEN codigo_dia end,', ') ELSE '-' END AS dia30, " +
                "CASE WHEN STRING_AGG(CASE WHEN dia = 31 THEN codigo_dia end,', ') IS NOT NULL THEN STRING_AGG(CASE WHEN dia = 31 THEN codigo_dia end,', ') ELSE '-' END AS dia31 " +
                "FROM ( " +
                "SELECT p_g.codigo AS codigo_e, CONCAT(empleado.apellido, ' ', empleado.nombre) AS nombre_e, EXTRACT('year' FROM fecha_horario) AS anio, EXTRACT('month' FROM fecha_horario) AS mes, " +
                "EXTRACT('day' FROM fecha_horario) AS dia, " +
                "CASE WHEN ((tipo_dia = 'L' OR tipo_dia = 'FD') AND (NOT estado_origen = 'HL' AND NOT estado_origen = 'HFD')) THEN tipo_dia ELSE horario.codigo END AS codigo_dia " +
                "FROM eu_asistencia_general p_g " +
                "INNER JOIN eu_empleados empleado ON empleado.codigo = p_g.codigo AND p_g.codigo IN (" + codigo + ") " +
                "INNER JOIN eh_cat_horarios horario ON horario.id = p_g.id_horario " +
                "WHERE fecha_horario BETWEEN $1 AND $2 " +
                "GROUP BY codigo_e, nombre_e, anio, mes, dia, codigo_dia, p_g.id_horario " +
                "ORDER BY p_g.codigo,anio, mes , dia, p_g.id_horario " +
                ") AS datos " +
                "GROUP BY codigo_e, nombre_e, anio, mes " +
                "ORDER BY 3,4,1"
                , [fecha_inicio, fecha_final]);

            if (HORARIO.rowCount > 0) {
                return res.jsonp({ message: 'OK', data: HORARIO.rows })
            }
            else {
                return res.jsonp({ message: 'vacio', data: HORARIO.rows });
            }
        }
        catch (error) {
            return res.jsonp({ message: 'error', error: error });
        }
    }


    // METODO PARA LISTAR DETALLE DE HORARIOS POR USUARIOS              --**VERIFICADO
    public async ListarDetalleHorarios(req: Request, res: Response) {
        try {
            const { fecha_inicio, fecha_final, codigo } = req.body;

            const HORARIO = await pool.query(
                "SELECT horario.codigo AS codigo_dia, horario.nombre AS nombre, " +
                "dh.hora, dh.tipo_accion, dh.id_horario, dh.id AS detalle " +
                "FROM eu_asistencia_general p_g " +
                "INNER JOIN eu_empleados empleado ON empleado.codigo = p_g.codigo AND p_g.codigo IN (" + codigo + ") " +
                "INNER JOIN eh_cat_horarios horario ON horario.id = p_g.id_horario " +
                "INNER JOIN eh_detalle_horarios dh ON dh.id = p_g.id_detalle_horario " +
                "WHERE fecha_horario BETWEEN $1 AND $2 " +
                "GROUP BY codigo_dia, tipo_dia, horario.nombre, dh.id_horario, dh.hora, dh.tipo_accion, dh.id " +
                "ORDER BY dh.id_horario, dh.hora ASC"
                , [fecha_inicio, fecha_final]);

            if (HORARIO.rowCount > 0) {
                return res.jsonp({ message: 'OK', data: HORARIO.rows })
            }
            else {
                return res.jsonp({ message: 'vacio' });
            }
        }
        catch (error) {
            return res.jsonp({ message: 'error', error: error });
        }
    }


    // METODO PARA LISTAR LAS PLANIFICACIONES QUE TIENE REGISTRADAS EL USUARIO   --**VERIFICADO
    public async ListarHorariosUsuario(req: Request, res: Response) {
        try {
            const { fecha_inicio, fecha_final, codigo } = req.body;
            const HORARIO = await pool.query(
                "SELECT p_g.id_horario, horario.codigo  AS codigo_horario " +
                "FROM eu_asistencia_general p_g " +
                "INNER JOIN eu_empleados empleado ON empleado.codigo = p_g.codigo AND p_g.codigo IN (" + codigo + ") " +
                "INNER JOIN eh_cat_horarios horario ON horario.id = p_g.id_horario " +
                "WHERE fecha_horario BETWEEN $1 AND $2 " +
                "GROUP BY codigo_horario, p_g.id_horario"
                , [fecha_inicio, fecha_final]);

            if (HORARIO.rowCount > 0) {
                return res.jsonp({ message: 'OK', data: HORARIO.rows })
            }
            else {
                return res.jsonp({ message: 'vacio', data: HORARIO.rows });
            }
        }
        catch (error) {
            return res.jsonp({ message: 'error', error: error });
        }
    }

    // METODO PARA LISTAR PLANIFICACIONES DE DIAS LIBRES Y FERIADOS   --**VERIFICADO
    public async ListarHorariosDescanso(req: Request, res: Response) {
        try {
            const { fecha_inicio, fecha_final, codigo } = req.body;
            const HORARIO = await pool.query(
                "SELECT p_g.id_horario, horario.codigo  AS codigo_horario, horario.default " +
                "FROM eu_asistencia_general p_g " +
                "INNER JOIN eu_empleados empleado ON empleado.codigo = p_g.codigo AND p_g.codigo IN (" + codigo + ") " +
                "INNER JOIN eh_cat_horarios horario ON horario.id = p_g.id_horario " +
                "WHERE fecha_horario BETWEEN $1 AND $2 AND (horario.default = 'FD' OR horario.default = 'L') " +
                "GROUP BY codigo_horario, p_g.id_horario, horario.default"
                , [fecha_inicio, fecha_final]);

            if (HORARIO.rowCount > 0) {
                return res.jsonp({ message: 'OK', data: HORARIO.rows })
            }
            else {
                return res.jsonp({ message: 'vacio', data: HORARIO.rows });
            }
        }
        catch (error) {
            return res.jsonp({ message: 'error', error: error });
        }
    }

    // METODO PARA BUSCAR ASISTENCIAS
    public async BuscarAsistencia(req: Request, res: Response) {

        var verificador = 0;
        var codigos = '';

        var EMPLEADO: any;

        const { cedula, codigo, inicio, fin, nombre, apellido } = req.body;

        if (codigo === '') {
            // BUSCAR CODIGO POR CEDULA DEL USUARIO
            EMPLEADO = await pool.query(
                `
                SELECT codigo FROM eu_empleados WHERE cedula = $1
                `
                , [cedula]);

            if (EMPLEADO.rowCount === 0) {
                // BUSCAR CODIGO POR NOMBRE DEL USUARIO
                EMPLEADO = await pool.query(
                    `
                    SELECT codigo FROM eu_empleados WHERE UPPER(nombre) ilike '%${nombre}%'
                    `
                );

                if (EMPLEADO.rowCount === 0) {
                    // BUSCAR CODIGO POR APELLIDO DEL USUARIO
                    EMPLEADO = await pool.query(
                        `
                        SELECT codigo FROM eu_empleados WHERE UPPER(apellido) ilike '%${apellido}%'
                        `
                    );

                    if (EMPLEADO.rowCount != 0) {
                        // TRATAMIENTO DE CODIGOS
                        var datos: any = [];
                        datos = EMPLEADO.rows;

                        datos.forEach((obj: any) => {
                            //console.log('ver codigos ', obj.codigo)
                            if (codigos === '') {
                                codigos = '\'' + obj.codigo + '\''
                            }
                            else {
                                codigos = codigos + ', \'' + obj.codigo + '\''
                            }
                        })
                    }
                    else {
                        verificador = 1;
                    }
                }
            }
        }
        else {
            codigos = '\'' + codigo + '\''
        }

        if (verificador === 0) {
            const ASISTENCIA = await pool.query(
                "SELECT p_g.*, p_g.fecha_hora_horario::time AS hora_horario, p_g.fecha_hora_horario::date AS fecha_horarios, " +
                "p_g.fecha_hora_timbre::date AS fecha_timbre, p_g.fecha_hora_timbre::time AS hora_timbre, " +
                "empleado.cedula, empleado.nombre, empleado.apellido " +
                "FROM eu_asistencia_general p_g " +
                "INNER JOIN eu_empleados empleado on empleado.codigo = p_g.codigo AND p_g.codigo IN (" + codigos + ")" +
                "WHERE p_g.fecha_horario BETWEEN $1 AND $2 " +
                "ORDER BY p_g.fecha_hora_horario ASC",
                [inicio, fin]);

            if (ASISTENCIA.rowCount === 0) {
                return res.status(404).jsonp({ message: 'vacio' });
            }
            else {
                return res.jsonp({ message: 'OK', respuesta: ASISTENCIA.rows })
            }

        }
        else {
            return res.status(404).jsonp({ message: 'vacio' });
        }

    }

    // METODO PARA ACTUALIZAR ASISTENCIA MANUAL
    public async ActualizarManual(req: Request, res: Response) {
        try {
            const { codigo, fecha, id, accion, id_timbre } = req.body;
            console.log('ver datos ', codigo, ' ', fecha, ' ', id)
            const ASIGNADO = await pool.query(
                `
                SELECT * FROM fnbuscarregistroasignado ($1, $2::character varying);
                `
                , [fecha, codigo]);
            //console.log('ver asignado ', ASIGNADO)

            const PLAN = await pool.query(
                `
                UPDATE eu_asistencia_general SET fecha_hora_timbre = $1, estado_timbre = 'R' WHERE id = $2 RETURNING *
                `
                , [fecha, id]);


            if (PLAN.rowCount > 0) {

                const TIMBRE = await pool.query(
                    `
                    UPDATE eu_timbres SET accion = $1 WHERE id = $2
                    `
                    , [accion, id_timbre]);

                return res.jsonp({ message: 'OK', respuesta: PLAN.rows })
            }
            else {
                res.status(404).jsonp({ message: 'error' });
            }
        }
        catch (error) {
            return res.jsonp({ message: 'error', error: error });
        }
    }

































    public async BuscarFecha(req: Request, res: Response) {
        const { fec_inicio, id_horario, codigo } = req.body;
        const FECHAS = await pool.query(
            `
            SELECT id FROM eu_asistencia_general 
            WHERE fecha_horario = $1 AND id_horario = $2 AND codigo = $3
            `
            , [fec_inicio, id_horario, codigo]);
        if (FECHAS.rowCount > 0) {
            return res.jsonp(FECHAS.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'No se encuentran registros.' });
        }
    }

}

export const PLAN_GENERAL_CONTROLADOR = new PlanGeneralControlador();

export default PLAN_GENERAL_CONTROLADOR;