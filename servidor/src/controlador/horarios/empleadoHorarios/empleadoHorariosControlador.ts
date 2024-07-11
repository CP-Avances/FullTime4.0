import AUDITORIA_CONTROLADOR from '../../auditoria/auditoriaControlador';
import { Request, Response } from 'express';
import pool from '../../../database';
import excel from 'xlsx';
import fs from 'fs';
import moment from 'moment';

class EmpleadoHorariosControlador {

    // METODO PARA BUSCAR HORARIOS DEL EMPLEADO EN DETERMINADA FECHA  --**VERIFICADO
    public async VerificarHorariosExistentes(req: Request, res: Response): Promise<any> {
        const { fechaInicio, fechaFinal } = req.body;
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

    // VERIFICAR EXISTENCIA DE PLANIFICACION   --**VERIFICADO
    public async VerificarFechasHorario(req: Request, res: Response): Promise<any> {
        const { fechaInicio, fechaFinal, id_horario } = req.body;
        const { id_empleado } = req.params;
        const HORARIO = await pool.query(
            `
            SELECT id FROM eu_asistencia_general 
            WHERE id_empleado = $3 AND id_horario = $4 AND
                (fecha_horario BETWEEN $1 AND $2) LIMIT 4
            `
            , [fechaInicio, fechaFinal, id_empleado, id_horario]);
        if (HORARIO.rowCount != 0) {
            return res.jsonp(HORARIO.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'Registros no encontrados' });
        }
    }


}

export const EMPLEADO_HORARIOS_CONTROLADOR = new EmpleadoHorariosControlador();

export default EMPLEADO_HORARIOS_CONTROLADOR;

