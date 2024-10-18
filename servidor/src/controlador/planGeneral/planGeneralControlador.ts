import { FormatearFecha2, FormatearHora } from '../../libs/settingsMail';
import { Request, Response } from 'express';
import AUDITORIA_CONTROLADOR from '../auditoria/auditoriaControlador';
import pool from '../../database';

class PlanGeneralControlador {



    // METODO PARA REGISTRAR PLAN GENERAL          **USADO
    public async CrearPlanificacion(req: Request, res: Response): Promise<any> {
        let errores: number = 0;
        let ocurrioError = false;
        let mensajeError = '';
        let codigoError = 0;

        const { user_name, ip, plan_general } = req.body;

        for (let i = 0; i < plan_general.length; i++) {

            try {
                // INICIAR TRANSACCION
                await pool.query('BEGIN');

                const result = await pool.query(
                    `
                    INSERT INTO eu_asistencia_general (fecha_hora_horario, tolerancia, estado_timbre, id_detalle_horario,
                        fecha_horario, id_empleado_cargo, tipo_accion, id_empleado, id_horario, tipo_dia, salida_otro_dia,
                        minutos_antes, minutos_despues, estado_origen, minutos_alimentacion) 
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) RETURNING *
                    `
                    ,
                    [
                        plan_general[i].fec_hora_horario, plan_general[i].tolerancia, plan_general[i].estado_timbre,
                        plan_general[i].id_det_horario, plan_general[i].fec_horario, plan_general[i].id_empl_cargo,
                        plan_general[i].tipo_entr_salida, plan_general[i].id_empleado, plan_general[i].id_horario, plan_general[i].tipo_dia,
                        plan_general[i].salida_otro_dia, plan_general[i].min_antes, plan_general[i].min_despues, plan_general[i].estado_origen,
                        plan_general[i].min_alimentacion
                    ]
                );

                const [plan] = result.rows;

                const fecha_hora_horario1 = await FormatearHora(plan_general[i].fec_hora_horario.split(' ')[1]);
                const fecha_hora_horario = await FormatearFecha2(plan_general[i].fec_hora_horario, 'ddd');
                const fecha_horario = await FormatearFecha2(plan_general[i].fec_horario, 'ddd');

                plan.fecha_hora_horario = `${fecha_hora_horario} ${fecha_hora_horario1}`;
                plan.fecha_horario = fecha_horario;

                // AUDITORIA
                await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                    tabla: 'eu_asistencia_general',
                    usuario: user_name,
                    accion: 'I',
                    datosOriginales: '',
                    datosNuevos: JSON.stringify(plan),
                    ip,
                    observacion: null
                });

                // FINALIZAR TRANSACCION
                await pool.query('COMMIT');

            } catch (error) {
                // REVERTIR TRANSACCION
                await pool.query('ROLLBACK');
                ocurrioError = true;
                mensajeError = error.message;
                codigoError = 500;
                errores++;
                break;
            }
        }

        if (ocurrioError) {
            return res.status(codigoError).jsonp({ message: mensajeError });
        } else {
            if (errores > 0) {
                return res.status(200).jsonp({ message: 'error' });
            } else {
                return res.status(200).jsonp({ message: 'OK' });
            }
        }
    }


    public CrearPlanificacion2 = async (req: Request, res: Response): Promise<any> => {
        const { parte, user_name, ip, parteIndex, totalPartes } = req.body;

        let partesRecibidas: any = []; // Ajusta 'any' al tipo adecuado según los datos que estés manejando
        let errores: number = 0;
        let ocurrioError = false;
        let mensajeError = '';
        let codigoError = 0;

        partesRecibidas = parte;
        let contador = 0;

        for (let i = 0; i < partesRecibidas.length; i++) {
            try {
                contador += 1;
                // INICIAR TRANSACCION
                await pool.query('BEGIN');

                const result = await pool.query(
                    `
                INSERT INTO eu_asistencia_general (fecha_hora_horario, tolerancia, estado_timbre, id_detalle_horario,
                    fecha_horario, id_empleado_cargo, tipo_accion, id_empleado, id_horario, tipo_dia, salida_otro_dia,
                    minutos_antes, minutos_despues, estado_origen, minutos_alimentacion) 
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) RETURNING *
                `,
                    [
                        partesRecibidas[i].fec_hora_horario, partesRecibidas[i].tolerancia, partesRecibidas[i].estado_timbre,
                        partesRecibidas[i].id_det_horario, partesRecibidas[i].fec_horario, partesRecibidas[i].id_empl_cargo,
                        partesRecibidas[i].tipo_entr_salida, partesRecibidas[i].id_empleado, partesRecibidas[i].id_horario, partesRecibidas[i].tipo_dia,
                        partesRecibidas[i].salida_otro_dia, partesRecibidas[i].min_antes, partesRecibidas[i].min_despues, partesRecibidas[i].estado_origen,
                        partesRecibidas[i].min_alimentacion
                    ]
                );

                const [plan] = result.rows;

                const fecha_hora_horario1 = await FormatearHora(partesRecibidas[i].fec_hora_horario.split(' ')[1]);
                const fecha_hora_horario = await FormatearFecha2(partesRecibidas[i].fec_hora_horario, 'ddd');
                const fecha_horario = await FormatearFecha2(partesRecibidas[i].fec_horario, 'ddd');

                plan.fecha_hora_horario = `${fecha_hora_horario} ${fecha_hora_horario1}`;
                plan.fecha_horario = fecha_horario;

                // AUDITORIA
                await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                    tabla: 'eu_asistencia_general',
                    usuario: user_name,
                    accion: 'I',
                    datosOriginales: '',
                    datosNuevos: JSON.stringify(plan),
                    ip,
                    observacion: null
                });

                // FINALIZAR TRANSACCION
                await pool.query('COMMIT');

            } catch (error) {
                // REVERTIR TRANSACCION
                await pool.query('ROLLBACK');
                ocurrioError = true;
                mensajeError = error.message;
                codigoError = 500;
                errores++;
                break;
            }
        }

        if (ocurrioError) {
            // Si ocurrió un error, devolver el error con el mensaje adecuado
            return res.status(500).jsonp({ message: 'Error al procesar la parte', error: mensajeError });
        }

        // Respuesta final con 'OK' si todo se procesó correctamente
        return res.status(200).jsonp({ message: 'OK' });
    };

    public BuscarFechasMultiples = async (req: Request, res: Response): Promise<any> => {
        const { listaEliminar } = req.body;
        console.log("ver req body", req.body);
        let resultados: any[] = [];  // Array para almacenar todos los objetos de los resultados

        for (const item of listaEliminar) {
            console.log("ver fec_inicio e id", item.fec_inicio + ' ' + item.id_empleado)
            console.log("ver fec_final e id ", item.fec_final + ' ' + item.id_empleado)

            const FECHAS = await pool.query(
                `
                    SELECT id FROM eu_asistencia_general 
                    WHERE (fecha_horario BETWEEN $1 AND $2) AND id_horario = $3 AND id_empleado = $4
                `,
                [item.fec_inicio, item.fec_final, item.id_horario, item.id_empleado]
            );

            // Concatena los resultados obtenidos en cada iteración
            resultados = resultados.concat(FECHAS.rows);  // `rows` contiene los registros devueltos por la consulta
        }
        // Si no se encontró ningún resultado en ninguna consulta
        if (resultados.length === 0) {
            return res.status(404).jsonp({ text: 'No se encuentran registros.' });
        } else {
            return res.jsonp(resultados);  // Devuelve un único array con todos los resultados concatenados
        }
    }

    // METODO PARA BUSCAR ID POR FECHAS PLAN GENERAL   **USADO
    public async BuscarFechas(req: Request, res: Response) {
        const { fec_inicio, fec_final, id_horario, id_empleado } = req.body;
        const FECHAS = await pool.query(
            `
            SELECT id FROM eu_asistencia_general 
            WHERE (fecha_horario BETWEEN $1 AND $2) AND id_horario = $3 AND id_empleado = $4
            `
            , [fec_inicio, fec_final, id_horario, id_empleado]);
        if (FECHAS.rowCount != 0) {
            return res.jsonp(FECHAS.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'No se encuentran registros.' });
        }
    }

    // METODO PARA ELIMINAR REGISTROS    **USADO
    public async EliminarRegistros(req: Request, res: Response): Promise<Response> {
        var errores: number = 0;
        let ocurrioError = false;
        let mensajeError = '';
        let codigoError = 0;

        // CONTADORES INICIAN EN CERO (0)
        errores = 0;

        const { user_name, ip, id_plan } = req.body;

        for (const plan of id_plan) {

            try {
                // INICIAR TRANSACCION
                await pool.query('BEGIN');

                // CONSULTAR DATOSORIGINALES
                const consulta = await pool.query(`SELECT * FROM eu_asistencia_general WHERE id = $1`, [plan]);
                const [datosOriginales] = consulta.rows;

                if (!datosOriginales) {
                    await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                        tabla: 'eu_asistencia_general',
                        usuario: user_name,
                        accion: 'D',
                        datosOriginales: '',
                        datosNuevos: '',
                        ip,
                        observacion: `Error al eliminar el registro con id ${plan}. Registro no encontrado.`
                    });

                    // FINALIZAR TRANSACCION
                    await pool.query('COMMIT');
                    return res.status(404).jsonp({ message: 'error' });
                }

                await pool.query(
                    `
                    DELETE FROM eu_asistencia_general WHERE id = $1
                    `,
                    [plan]);

                const fecha_hora_horario1 = await FormatearHora(datosOriginales.fecha_hora_horario.toLocaleString().split(' ')[1]);
                const fecha_hora_horario = await FormatearFecha2(datosOriginales.fecha_hora_horario, 'ddd');
                const fecha_horario = await FormatearFecha2(datosOriginales.fecha_horario, 'ddd');

                datosOriginales.fecha_horario = fecha_horario;
                datosOriginales.fecha_hora_horario = `${fecha_hora_horario} ${fecha_hora_horario1}`;

                // AUDITORIA
                await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                    tabla: 'eu_asistencia_general',
                    usuario: user_name,
                    accion: 'D',
                    datosOriginales: JSON.stringify(datosOriginales),
                    datosNuevos: '',
                    ip,
                    observacion: null
                });


                // FINALIZAR TRANSACCION
                await pool.query('COMMIT');

            } catch (error) {
                // REVERTIR TRANSACCION
                await pool.query('ROLLBACK');
                errores++;
                ocurrioError = true;
                mensajeError = error;
                codigoError = 500;
                break;
            }
        }

        if (ocurrioError) {
            return res.status(500).jsonp({ message: mensajeError });
        } else {
            if (errores > 0) {
                return res.status(200).jsonp({ message: 'error' });
            }
            else {
                return res.status(200).jsonp({ message: 'OK' });
            }
        }
    }


    public async EliminarRegistrosMultiples(req: Request, res: Response): Promise<Response> {
        const { user_name, ip, id_plan } = req.body;
        // Iniciar transacción
        try {
            await pool.query('BEGIN');
            /*

        // CONSULTAR LOS DATOS ORIGINALES PARA TODOS LOS PLANES
        const consulta = await pool.query(
            `SELECT * FROM eu_asistencia_general WHERE id = ANY($1::int[])`,
            [id_plan]
        );

        const datosOriginales = consulta.rows;
        if (datosOriginales.length !== id_plan.length) {
            const idsEncontrados = datosOriginales.map((d: any) => d.id);
            const idsNoEncontrados = id_plan.filter((id: any) => !idsEncontrados.includes(id));
            // Registrar auditoría de errores
            for (const id of idsNoEncontrados) {
                await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                    tabla: 'eu_asistencia_general',
                    usuario: user_name,
                    accion: 'D',
                    datosOriginales: '',
                    datosNuevos: '',
                    ip,
                    observacion: `Error al eliminar el registro con id ${id}. Registro no encontrado.`,
                });
            }
 
            // Si alguno de los registros no se encontró, hacer ROLLBACK
            await pool.query('ROLLBACK');
            return res.status(404).jsonp({ message: 'Algunos registros no se encontraron.' });
        }
*/
            // ELIMINAR TODOS LOS REGISTROS DE UNA SOLA VEZ
            await pool.query(`DELETE FROM eu_asistencia_general WHERE id = ANY($1::int[])`, [id_plan]);


            // Formatear las fechas de los datos originales para la auditoría
            /*
            for (const datos of datosOriginales) {
                const fecha_hora_horario1 = await FormatearHora(datos.fecha_hora_horario.toLocaleString().split(' ')[1]);
                const fecha_hora_horario = await FormatearFecha2(datos.fecha_hora_horario, 'ddd');
                const fecha_horario = await FormatearFecha2(datos.fecha_horario, 'ddd');
    
                datos.fecha_horario = fecha_horario;
                datos.fecha_hora_horario = `${fecha_hora_horario} ${fecha_hora_horario1}`;
            }
                /*/

            // AUDITORÍA: Registrar todos los registros eliminados
            //for (const datos of datosOriginales) {
            await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                tabla: 'eu_asistencia_general',
                usuario: user_name,
                accion: 'D',
                datosOriginales: 'Identificadores de planificación horaria: ' + id_plan,
                datosNuevos: '',
                ip,
                observacion: null
            });
            // }


            // Finalizar transacción
            await pool.query('COMMIT');
            return res.status(200).jsonp({ message: 'OK' });

        } catch (error) {
            // Revertir la transacción si ocurre un error
            await pool.query('ROLLBACK');
            console.error('Error en la eliminación múltiple:', error);
            return res.status(500).jsonp({ message: 'Error en el proceso de eliminación', error });
        }
    }


    // METODO PARA BUSCAR PLANIFICACION EN UN RANGO DE FECHAS
    public async BuscarHorarioFechas(req: Request, res: Response) {
        try {
            const { id_empleado, lista_fechas } = req.body;

            const HORARIO = await pool.query(
                `
                SELECT DISTINCT (pg.fecha_horario), pg.tipo_dia, c.hora_trabaja, pg.tipo_accion, pg.id_empleado, pg.estado_origen 
                FROM eu_asistencia_general AS pg, eu_empleado_cargos AS c 
                WHERE pg.fecha_horario IN (${lista_fechas}) 
                    AND pg.id_empleado = $1 AND c.id = pg.id_empleado_cargo 
                    AND (pg.tipo_accion = 'E' OR pg.tipo_accion = 'S') 
                ORDER BY pg.fecha_horario ASC
                `
                , [id_empleado]);

            if (HORARIO.rowCount != 0) {
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

    // METODO PARA LISTAR LAS PLANIFICACIONES QUE TIENE REGISTRADAS EL USUARIO   **USADO
    public async ListarPlanificacionHoraria(req: Request, res: Response) {
        try {
            const { fecha_inicio, fecha_final, id_empleado } = req.body;
            const HORARIO = await pool.query(
                "SELECT id_e, codigo_e, nombre_e, anio, mes, " +
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
                "SELECT p_g.id_empleado AS id_e, empleado.codigo AS codigo_e, CONCAT(empleado.apellido, ' ', empleado.nombre) AS nombre_e, EXTRACT('year' FROM fecha_horario) AS anio, EXTRACT('month' FROM fecha_horario) AS mes, " +
                "EXTRACT('day' FROM fecha_horario) AS dia, " +
                "CASE WHEN ((tipo_dia = 'L' OR tipo_dia = 'FD') AND (NOT estado_origen = 'HL' AND NOT estado_origen = 'HFD')) THEN tipo_dia ELSE horario.codigo END AS codigo_dia " +
                "FROM eu_asistencia_general p_g " +
                "INNER JOIN eu_empleados empleado ON empleado.id = p_g.id_empleado AND p_g.id_empleado IN (" + id_empleado + ") " +
                "INNER JOIN eh_cat_horarios horario ON horario.id = p_g.id_horario " +
                "WHERE fecha_horario BETWEEN $1 AND $2 " +
                "GROUP BY id_e, codigo_e, nombre_e, anio, mes, dia, codigo_dia, p_g.id_horario " +
                "ORDER BY p_g.id_empleado, anio, mes , dia, p_g.id_horario " +
                ") AS datos " +
                "GROUP BY id_e, codigo_e, nombre_e, anio, mes " +
                "ORDER BY 4,5,1"
                , [fecha_inicio, fecha_final]);

            if (HORARIO.rowCount != 0) {
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


    // METODO PARA LISTAR DETALLE DE HORARIOS POR USUARIOS              **USADO
    public async ListarDetalleHorarios(req: Request, res: Response) {
        try {
            const { fecha_inicio, fecha_final, id_empleado } = req.body;

            const HORARIO = await pool.query(
                "SELECT horario.codigo AS codigo_dia, horario.nombre AS nombre, " +
                "dh.hora, dh.tipo_accion, dh.id_horario, dh.id AS detalle " +
                "FROM eu_asistencia_general p_g " +
                "INNER JOIN eu_empleados empleado ON empleado.id = p_g.id_empleado AND p_g.id_empleado IN (" + id_empleado + ") " +
                "INNER JOIN eh_cat_horarios horario ON horario.id = p_g.id_horario " +
                "INNER JOIN eh_detalle_horarios dh ON dh.id = p_g.id_detalle_horario " +
                "WHERE fecha_horario BETWEEN $1 AND $2 " +
                "GROUP BY codigo_dia, tipo_dia, horario.nombre, dh.id_horario, dh.hora, dh.tipo_accion, dh.id " +
                "ORDER BY dh.id_horario, dh.hora ASC"
                , [fecha_inicio, fecha_final]);

            if (HORARIO.rowCount != 0) {
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


    // METODO PARA LISTAR LAS PLANIFICACIONES QUE TIENE REGISTRADAS EL USUARIO  **USADO
    public async ListarHorariosUsuario(req: Request, res: Response) {
        try {
            const { fecha_inicio, fecha_final, id_empleado } = req.body;
            const HORARIO = await pool.query(
                "SELECT p_g.id_horario, horario.codigo  AS codigo_horario " +
                "FROM eu_asistencia_general p_g " +
                "INNER JOIN eu_empleados empleado ON empleado.id = p_g.id_empleado AND p_g.id_empleado IN (" + id_empleado + ") " +
                "INNER JOIN eh_cat_horarios horario ON horario.id = p_g.id_horario " +
                "WHERE fecha_horario BETWEEN $1 AND $2 " +
                "GROUP BY codigo_horario, p_g.id_horario"
                , [fecha_inicio, fecha_final]);

            if (HORARIO.rowCount != 0) {
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

    // METODO PARA BUSCAR ASISTENCIAS   **USADO
    public async BuscarAsistencia(req: Request, res: Response) {
        try {
            const { cedula, codigo, inicio, fin, nombre, apellido } = req.body;
            let ids = [];
            if (codigo !== '' && codigo !== null) {
                const empleado = await BuscarEmpleadoPorParametro('codigo', codigo);
                if (empleado.rowCount! > 0) {
                    ids = empleado.rows.map(row => row.id);
                }
            } else {
                let empleado;
                if (cedula !== '' && cedula !== null) {
                    empleado = await BuscarEmpleadoPorParametro('cedula', cedula);
                }
                else if (nombre !== '' && apellido !== '' && nombre !== null && apellido !== null) {
                    empleado = await BuscarEmpleadoPorParametro('nombre_apellido', { nombre, apellido });
                }
                else if (apellido !== '' && apellido !== null) {
                    empleado = await BuscarEmpleadoPorParametro('apellido', apellido);
                }
                else if (nombre !== '' && nombre !== null) {
                    empleado = await BuscarEmpleadoPorParametro('nombre', nombre);
                }
                if (empleado && empleado.rowCount! > 0) {
                    ids = empleado.rows.map(row => row.id);
                }
            }
            if (ids.length > 0) {
                const ASISTENCIA = await pool.query(
                    `
                    SELECT p_g.*, p_g.fecha_hora_horario::time AS hora_horario, p_g.fecha_hora_horario::date AS fecha_horarios,
                        p_g.fecha_hora_timbre::date AS fecha_timbre, p_g.fecha_hora_timbre::time AS hora_timbre,
                        empleado.cedula, empleado.nombre, empleado.apellido, empleado.id AS id_empleado, empleado.codigo
                    FROM eu_asistencia_general p_g
                    INNER JOIN eu_empleados empleado on empleado.id = p_g.id_empleado AND p_g.id_empleado = ANY($3)
                    WHERE p_g.fecha_horario BETWEEN $1 AND $2
                    ORDER BY p_g.fecha_hora_horario ASC
                    `
                    , [inicio, fin, ids]);

                if (ASISTENCIA.rowCount === 0) {
                    return res.status(404).jsonp({ message: 'vacio' });
                } else {
                    return res.jsonp({ message: 'OK', respuesta: ASISTENCIA.rows });
                }
            } else {
                return res.status(404).jsonp({ message: 'vacio' });
            }

        } catch (error) {
            return res.status(500).jsonp({ message: 'Error interno del servidor' });
        }
    }

    // METODO PARA ACTUALIZAR ASISTENCIA MANUAL   **USADO
    public async ActualizarManual(req: Request, res: Response) {
        try {
            const { codigo, fecha, id, accion, id_timbre, user_name, ip } = req.body;
            const ASIGNADO = await pool.query(
                `
                SELECT * FROM fnbuscarregistroasignado ($1, $2);
                `
                , [fecha, codigo]);

            // INICIAR TRANSACCION
            await pool.query('BEGIN');

            // CONSULTAR DATOSORIGINALES
            const consulta = await pool.query(`SELECT * FROM eu_asistencia_general WHERE id = $1`, [id]);
            const [datosOriginales] = consulta.rows;

            if (!datosOriginales) {
                await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                    tabla: 'eu_asistencia_general',
                    usuario: user_name,
                    accion: 'U',
                    datosOriginales: '',
                    datosNuevos: '',
                    ip,
                    observacion: `Error al actualizar el registro con id ${id}. Registro no encontrado.`
                });

                // FINALIZAR TRANSACCION
                await pool.query('COMMIT');
                return res.status(404).jsonp({ message: 'error' });
            }

            const PLAN = await pool.query(
                `
                UPDATE eu_asistencia_general SET fecha_hora_timbre = $1, estado_timbre = 'R' WHERE id = $2 RETURNING *
                `
                , [fecha, id]);

            var fecha_hora_horario1 = await FormatearHora(datosOriginales.fecha_hora_horario.toLocaleString().split(' ')[1])
            var fecha_hora_horario = await FormatearFecha2(datosOriginales.fecha_hora_horario, 'ddd')
            var fecha_horario = await FormatearFecha2(datosOriginales.fecha_horario, 'ddd')

            // AUDITORIA
            await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                tabla: 'eu_asistencia_general',
                usuario: user_name,
                accion: 'U',
                datosOriginales: `id: ${datosOriginales.id}
                            , id_empleado: ${datosOriginales.id_empleado}, id_empleado_cargo: ${datosOriginales.id_empleado_cargo}, id_horario: ${datosOriginales.id_horario}, id_detalle_horario: ${datosOriginales.id_detalle_horario}, fecha_horario: ${fecha_horario}, fecha_hora_horario: ${fecha_hora_horario + ' ' + fecha_hora_horario1}, fecha_hora_timbre: ${datosOriginales.fecha_hora_timbre}, estado_timbre: ${datosOriginales.estado_timbre}, tipo_accion: ${datosOriginales.tipo_accion}, tipo_dia: ${datosOriginales.tipo_dia}, salida_otro_dia: ${datosOriginales.salida_otro_dia}, tolerancia: ${datosOriginales.tolerancia}, minutos_antes: ${datosOriginales.minutos_antes}, minutos_despues: ${datosOriginales.minutos_despues}, estado_origen: ${datosOriginales.estado_origen}, minutos_alimentacion: ${datosOriginales.minutos_alimentacion}`,
                datosNuevos: `id: ${datosOriginales.id}
                            , id_empleado: ${datosOriginales.id_empleado}, id_empleado_cargo: ${datosOriginales.id_empleado_cargo}, id_horario: ${datosOriginales.id_horario}, id_detalle_horario: ${datosOriginales.id_detalle_horario}, fecha_horario: ${fecha_horario}, fecha_hora_horario: ${fecha_hora_horario + ' ' + fecha_hora_horario1}, fecha_hora_timbre: ${fecha}, estado_timbre: ${datosOriginales.estado_timbre}, tipo_accion: ${datosOriginales.tipo_accion}, tipo_dia: ${datosOriginales.tipo_dia}, salida_otro_dia: ${datosOriginales.salida_otro_dia}, tolerancia: ${datosOriginales.tolerancia}, minutos_antes: ${datosOriginales.minutos_antes}, minutos_despues: ${datosOriginales.minutos_despues}, estado_origen: ${datosOriginales.estado_origen}, minutos_alimentacion: ${datosOriginales.minutos_alimentacion}`, ip,
                observacion: null
            });

            if (PLAN.rowCount != 0) {
                const TIMBRE = await pool.query(
                    `
                    UPDATE eu_timbres SET accion = $1 WHERE id = $2
                    `
                    , [accion, id_timbre]);

                // AUDITORIA
                await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                    tabla: 'timbres',
                    usuario: user_name,
                    accion: 'U',
                    datosOriginales: '',
                    datosNuevos: JSON.stringify(TIMBRE.rows),
                    ip,
                    observacion: null
                });

                // FINALIZAR TRANSACCION
                await pool.query('COMMIT');
                return res.jsonp({ message: 'OK', respuesta: PLAN.rows });

            }
            else {
                // REVERTIR TRANSACCION
                await pool.query('ROLLBACK');
                res.status(404).jsonp({ message: 'error' });
            }
        }
        catch (error) {
            // REVERTIR TRANSACCION
            await pool.query('ROLLBACK');
            return res.jsonp({ message: 'error', error: error });
        }
    }

    public async BuscarFecha(req: Request, res: Response) {
        const { fec_inicio, id_horario, id_empleado } = req.body;
        const FECHAS = await pool.query(
            `
            SELECT id FROM eu_asistencia_general 
            WHERE fecha_horario = $1 AND id_horario = $2 AND id_empleado = $3
            `
            , [fec_inicio, id_horario, id_empleado]);
        if (FECHAS.rowCount != 0) {
            return res.jsonp(FECHAS.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'No se encuentran registros.' });
        }
    }

}

async function BuscarEmpleadoPorParametro(parametro: string, valor: string | { nombre: string; apellido: string }) {
    let query = '';
    let queryParams: any[] | undefined = [];

    switch (parametro) {
        case 'cedula':
            query = 'SELECT id FROM eu_empleados WHERE cedula = $1';
            queryParams = [valor];
            break;
        case 'nombre':
        case 'apellido':
            if (typeof valor === 'string') {
                query = `SELECT id FROM eu_empleados WHERE UPPER(${parametro}) ilike $1`;
                queryParams = [`%${valor.toUpperCase()}%`];
            }
            break;
        case 'codigo':
            query = 'SELECT id FROM eu_empleados WHERE codigo = $1';
            queryParams = [valor];
            break;
        case 'nombre_apellido':
            if (typeof valor !== 'string' && valor.nombre && valor.apellido) {
                query = `SELECT id FROM eu_empleados WHERE UPPER(nombre) ilike $1 AND UPPER(apellido) ilike $2`;
                queryParams = [`%${valor.nombre.toUpperCase()}%`, `%${valor.apellido.toUpperCase()}%`];
            }
            break;
    }

    return await pool.query(query, queryParams);
}

export const PLAN_GENERAL_CONTROLADOR = new PlanGeneralControlador();

export default PLAN_GENERAL_CONTROLADOR;