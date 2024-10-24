import { Request, Response } from 'express';
import pool from '../../database';

class EmpleadoHorariosControlador {

    // METODO PARA BUSCAR HORARIOS DEL EMPLEADO EN DETERMINADA FECHA  **USADO
    public async VerificarHorariosExistentes(req: Request, res: Response): Promise<any> {
        const { fechaInicio, fechaFinal } = req.body;

        console.log(" ver body", req.body);
        const { id_empleado } = req.params;
        const HORARIO = await pool.query(
            `
            SELECT DISTINCT pg.id_horario, ch.hora_trabajo, ch.codigo, ch.default_  
            FROM eu_asistencia_general AS pg, eh_cat_horarios AS ch
            WHERE pg.id_empleado = $3 AND pg.id_horario = ch.id AND
                (fecha_horario BETWEEN $1 AND $2)
            `
            , [fechaInicio, fechaFinal, id_empleado]);
        if (HORARIO.rowCount != 0) {
            return res.jsonp(HORARIO.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'Registros no encontrados.' });
        }
    }

    // METODO PARA BUSCAR HORARIOS DEL EMPLEADO EN DETERMINADA FECHA  **USADO
    public async VerificarHorariosExistentes2(req: Request, res: Response): Promise<any> {
        const { fechaInicio, fechaFinal, ids } = req.body;
        console.log("ver body", req.body);
        const HORARIO = await pool.query(
            `
            SELECT DISTINCT pg.id_horario, ch.hora_trabajo, ch.codigo, ch.default_, pg.id_empleado
            FROM eu_asistencia_general AS pg, eh_cat_horarios AS ch
            WHERE pg.id_empleado = ANY($3) AND pg.id_horario = ch.id AND
                (fecha_horario BETWEEN $1 AND $2)
            `
            , [fechaInicio, fechaFinal, ids]);
        if (HORARIO.rowCount != 0) {
            return res.jsonp(HORARIO.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'Registros no encontrados.' });
        }
    }



    // METODO PARA CONSULTAR HORARIO DEL USUARIO POR DIAS-HORAS Y NUMERO DE HORAS DE TRABAJO EN EL MISMO DIA (MD)
    public async ObtenerHorarioHorasMD(req: Request, res: Response) {
        let { codigo, fecha_inicio, hora_inicio, hora_final } = req.body;

        // CONSULTA DE HORARIO DEL USUARIO INGRESO = SALIDA
        let CASO_1 = await pool.query(
            `
            SELECT * FROM vista_horario_entrada AS he
            JOIN vista_horario_salida AS hs ON he.codigo = hs.codigo AND he.fecha_entrada = hs.fecha_salida 
                AND he.id_horario = hs.id_horario AND salida_otro_dia = 0 AND he.codigo = $1
				AND he.fecha_entrada = $2
                AND (($3 BETWEEN hora_inicio AND hora_final) AND ($4 BETWEEN hora_inicio AND hora_final))
            `
            , [codigo, fecha_inicio, hora_inicio, hora_final])
            .then((result: any) => { return result.rows });

        if (CASO_1.length === 0) {

            // CONSULTA DE HORARIO DEL USUARIO INGRESO != SALIDA (SEGUNDO DIA)
            let CASO_2 = await pool.query(
                `
                SELECT * FROM vista_horario_entrada AS he
                JOIN vista_horario_salida AS hs ON he.codigo = hs.codigo 
                    AND hs.fecha_salida = (he.fecha_entrada + interval '1 day')
                    AND he.id_horario = hs.id_horario AND salida_otro_dia = 1 AND he.codigo = $1
                    AND ($2 = he.fecha_entrada OR $2 = hs.fecha_salida)
                `
                , [codigo, fecha_inicio])
                .then((result: any) => { return result.rows });

            if (CASO_2.length === 0) {

                // CONSULTA DE HORARIO DEL USUARIO INGRESO != SALIDA (TERCER DIA)
                let CASO_3 = await pool.query(
                    `
                    SELECT * FROM vista_horario_entrada AS he
                    JOIN vista_horario_salida AS hs ON he.codigo = hs.codigo 
			            AND hs.fecha_salida = (he.fecha_entrada + interval '2 day')
                        AND he.id_horario = hs.id_horario AND salida_otro_dia = 2 AND he.codigo = $1
                        AND ($2 = he.fecha_entrada OR $2 = hs.fecha_salida OR $2= (he.fecha_entrada + interval '1 day'))
                `
                    , [codigo, fecha_inicio])
                    .then((result: any) => { return result.rows });

                if (CASO_3.length === 0) {
                    return res.status(404).jsonp({ message: 'No se han encontrado registros.' });
                }
                else {
                    return res.status(200).jsonp({ message: 'CASO_3', respuesta: CASO_3 });
                }

            }
            else {
                return res.status(200).jsonp({ message: 'CASO_2', respuesta: CASO_2 });
            }
        }
        else {
            return res.status(200).jsonp({ message: 'CASO_1', respuesta: CASO_1 });
        }
    }

    // METODO PARA CONSULTAR HORARIO DEL USUARIO POR DIAS-HORAS Y NUMERO DE HORAS DE TRABAJO EN DIAS DIFERENTES (DD)
    public async ObtenerHorarioHorasDD(req: Request, res: Response) {
        let { codigo, fecha_inicio, fecha_final } = req.body;

        // CONSULTA DE HORARIO DEL USUARIO INGRESO = SALIDA
        let CASO_4 = await pool.query(
            `
            SELECT * FROM vista_horario_entrada AS he
            JOIN vista_horario_salida AS hs ON he.codigo = hs.codigo 
			    AND hs.fecha_salida = (he.fecha_entrada + interval '1 day')
                AND he.id_horario = hs.id_horario AND salida_otro_dia = 1 AND he.codigo = $1
				AND $2 = he.fecha_entrada AND $3 = hs.fecha_salida
            `
            , [codigo, fecha_inicio, fecha_final])
            .then((result: any) => { return result.rows });

        if (CASO_4.length === 0) {

            // CONSULTA DE HORARIOS MAYORES O IGUALES A 48 HORAS
            let CASO_5 = await pool.query(
                `
                SELECT * FROM vista_horario_entrada AS he
                JOIN vista_horario_salida AS hs ON he.codigo = hs.codigo 
			        AND hs.fecha_salida = (he.fecha_entrada + interval '2 day')
                    AND he.id_horario = hs.id_horario AND salida_otro_dia = 2 AND he.codigo = $1
                    AND ($2 = he.fecha_entrada OR $2 = (he.fecha_entrada + interval '1 day')) 
                    AND ($3 = hs.fecha_salida OR $3 = (he.fecha_entrada + interval '1 day'))
                `
                , [codigo, fecha_inicio, fecha_final])
                .then((result: any) => { return result.rows });

            if (CASO_5.length === 0) {
                return res.status(404).jsonp({ message: 'No se han encontrado registros.' });
            }
            else {
                return res.status(200).jsonp({ message: 'CASO_5', respuesta: CASO_5 });
            }
        }
        else {
            return res.status(200).jsonp({ message: 'CASO_4', respuesta: CASO_4 });
        }
    }

    // METODO PARA BUSCAR HORAS DE ALIMENTACION EN EL MISMO DIA (MD)
    public async ObtenerComidaHorarioHorasMD(req: Request, res: Response) {
        let { codigo, fecha_inicio, hora_inicio, hora_final } = req.body;

        // CONSULTA DE HORARIO DEL USUARIO INGRESO = SALIDA
        let CASO_1 = await pool.query(
            `
            SELECT * FROM vista_comida_inicio AS ci
            JOIN vista_comida_fin AS cf ON ci.codigo = cf.codigo AND ci.fecha_entrada = cf.fecha_salida 
                AND ci.id_horario = cf.id_horario AND salida_otro_dia = 0 AND ci.codigo = $1
                AND ci.fecha_entrada = $2
                AND (($3 BETWEEN hora_inicio AND hora_final) OR ($4 BETWEEN hora_inicio AND hora_final))
            `
            , [codigo, fecha_inicio, hora_inicio, hora_final])
            .then((result: any) => { return result.rows });

        if (CASO_1.length === 0) {

            // CONSULTA DE HORARIO DEL USUARIO INGRESO != SALIDA (SEGUNDO DIA)
            let CASO_2 = await pool.query(
                `
                SELECT * FROM vista_comida_inicio AS ci
                JOIN vista_comida_fin AS cf ON ci.codigo = cf.codigo 
                    AND cf.fecha_salida = (ci.fecha_entrada + interval '1 day')
                    AND ci.id_horario = cf.id_horario AND salida_otro_dia = 1 AND ci.codigo = $1
                    AND ($2 = ci.fecha_entrada OR $2 = cf.fecha_salida)
                `
                , [codigo, fecha_inicio])
                .then((result: any) => { return result.rows });

            if (CASO_2.length === 0) {
                return res.status(404).jsonp({ message: 'No se han encontrado registros.' });
            }
            else {
                return res.status(200).jsonp({ message: 'CASO_2', respuesta: CASO_2 });
            }
        }
        else {
            return res.status(200).jsonp({ message: 'CASO_1', respuesta: CASO_1 });
        }
    }

    // METODO PARA CONSULTAR MINUTOS DE ALIMENTACION EN DIAS DIFERENTES (DD)
    public async ObtenerComidaHorarioHorasDD(req: Request, res: Response) {
        let { codigo, fecha_inicio, fecha_final } = req.body;

        // CONSULTA DE HORARIO DEL USUARIO INGRESO != SALIDA
        let CASO_4 = await pool.query(
            `
            SELECT * FROM vista_comida_inicio AS ci
            JOIN vista_comida_fin AS cf ON ci.codigo = cf.codigo 
                AND cf.fecha_salida = (ci.fecha_entrada + interval '1 day')
                AND ci.id_horario = cf.id_horario AND salida_otro_dia = 1 AND ci.codigo = $1
                AND $2 = ci.fecha_entrada AND $3 = cf.fecha_salida
            `
            , [codigo, fecha_inicio, fecha_final])
            .then((result: any) => { return result.rows });

        if (CASO_4.length === 0) {
            return res.status(404).jsonp({ message: 'No se han encontrado registros.' });
        }
        else {
            return res.status(200).jsonp({ message: 'CASO_4', respuesta: CASO_4 });
        }
    }
    // VERIFICAR EXISTENCIA DE PLANIFICACION PARA VARIOS EMPLEADOS
    public async VerificarFechasHorario(req: Request, res: Response): Promise<any> {
        const { fechaInicio, fechaFinal, id_horario, ids } = req.body; // 'ids' es un array de id_empleado

        console.log("ver req.body: ", req.body );
        // Consulta para verificar planificaciones duplicadas
        const HORARIOS = await pool.query(
            `
        SELECT DISTINCT id_empleado FROM eu_asistencia_general 
        WHERE id_empleado = ANY($3) AND id_horario = $4 AND
            (fecha_horario BETWEEN $1 AND $2)
        `
            , [fechaInicio, fechaFinal, ids, id_horario]);

        if (HORARIOS.rowCount != 0) {
            // Devolver solo los id_empleado que tienen registros duplicados
            const duplicados = HORARIOS.rows.map((row: any) => row.id_empleado);
            return res.jsonp({ duplicados });
        } else {
            return res.status(404).jsonp({ text: 'Registros no encontrados' });
        }
    }


    public async BuscarFechasMultiples(req: Request, res: Response): Promise<any> {
        const { usuarios_validos, eliminar_horarios, fec_inicio, fec_final } = req.body;

        // Obtener listas de IDs de empleados y horarios
        const ids_empleados = usuarios_validos.map((obj: any) => obj.id);
        const ids_horarios = eliminar_horarios.map((eh: any) => eh.id_horario);

        try {
            console.log('Iniciando búsqueda de fechas...'); // Inicio del proceso

            // Hacer una sola consulta utilizando ANY para buscar múltiples IDs
            const FECHAS = await pool.query(
                `
                SELECT id FROM eu_asistencia_general
                WHERE (fecha_horario BETWEEN $1 AND $2)
                AND id_horario = ANY($3::int[])
                AND id_empleado = ANY($4::int[])
                `,
                [fec_inicio, fec_final, ids_horarios, ids_empleados]
            );

            console.log('Consulta completada, procesando resultados...'); // Consulta finalizada

            // Obtener las filas y eliminar los IDs duplicados usando Set
            const resultados = FECHAS.rows.map((row: any) => row.id);
            //const ids_unicos = Array.from(new Set(resultados)); // Eliminar duplicados

            console.log(`Total de IDs encontrados: ${resultados.length}`);
            //console.log(`Total de IDs únicos después de eliminar duplicados: ${ids_unicos.length}`);

            return res.jsonp(resultados);

        } catch (error) {
            console.error('Error en la consulta:', error);
            return res.status(500).jsonp({ error: 'Error en la consulta de base de datos' });
        }
    }

}

export const EMPLEADO_HORARIOS_CONTROLADOR = new EmpleadoHorariosControlador();

export default EMPLEADO_HORARIOS_CONTROLADOR;
