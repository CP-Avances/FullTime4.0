import { Request, Response } from 'express';
import excel from 'xlsx';
import pool from '../../../database';
import fs from 'fs';

class DetalleCatalogoHorarioControlador {

    // METODO PARA BUSCAR DETALLE DE UN HORARIO   --**VERIFICADO
    public async ListarUnDetalleHorario(req: Request, res: Response): Promise<any> {
        const { id_horario } = req.params;
        const HORARIO = await pool.query(
            `
            SELECT dh.*, cg.minutos_comida
            FROM eh_detalle_horarios AS dh, eh_cat_horarios AS cg
            WHERE dh.id_horario = cg.id AND dh.id_horario = $1
            ORDER BY orden ASC
            `
            , [id_horario])
            .then((result: any) => {
                if (result.rowCount === 0) return [];

                return result.rows.map((o: any) => {
                    switch (o.tipo_accion) {
                        case 'E':
                            o.tipo_accion_show = 'Entrada';
                            o.tipo_accion = 'E';
                            break;
                        case 'I/A':
                            o.tipo_accion_show = 'Inicio alimentación';
                            o.tipo_accion = 'I/A';
                            break;
                        case 'F/A':
                            o.tipo_accion_show = 'Fin alimentación';
                            o.tipo_accion = 'F/A';
                            break;
                        case 'S':
                            o.tipo_accion_show = 'Salida';
                            o.tipo_accion = 'S';
                            break;
                        default:
                            o.tipo_accion_show = 'Desconocido';
                            o.tipo_accion = 'D';
                            break;
                    }
                    return o;
                })
            });

        if (HORARIO.length > 0) {
            return res.jsonp(HORARIO)
        }
        else {
            return res.status(404).jsonp({ text: 'No se encuentran registros.' });
        }
    }

    // METODO PARA ELIMINAR REGISTRO
    public async EliminarRegistros(req: Request, res: Response): Promise<void> {
        const id = req.params.id;
        await pool.query(
            `
            DELETE FROM eh_detalle_horarios WHERE id = $1
            `
            , [id]);
        res.jsonp({ message: 'Registro eliminado.' });
    }

    // METODO PARA REGISTRAR DETALLES
    public async CrearDetalleHorarios(req: Request, res: Response): Promise<void> {
        const { orden, hora, minu_espera, id_horario, tipo_accion, segundo_dia, tercer_dia, min_antes, min_despues } = req.body;
        await pool.query(
            `
            INSERT INTO eh_detalle_horarios (orden, hora, tolerancia, id_horario, tipo_accion, segundo_dia, tercer_dia, 
                minutos_antes, minutos_despues) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            `
            , [orden, hora, minu_espera, id_horario, tipo_accion, segundo_dia, tercer_dia, min_antes, min_despues]);
        res.jsonp({ message: 'Registro guardado.' });
    }

    // METODO PARA ACTUALIZAR DETALLE DE HORARIO
    public async ActualizarDetalleHorarios(req: Request, res: Response): Promise<void> {
        const { orden, hora, minu_espera, id_horario, tipo_accion, segundo_dia, tercer_dia, min_antes, min_despues,
            id } = req.body;
        await pool.query(
            `
            UPDATE eh_detalle_horarios SET orden = $1, hora = $2, tolerancia = $3, id_horario = $4,
                tipo_accion = $5, segundo_dia = $6, tercer_dia = $7, minutos_antes = $8, minutos_despues= $9 
            WHERE id = $10
            `
            , [orden, hora, minu_espera, id_horario, tipo_accion, segundo_dia, tercer_dia, min_antes, min_despues, id]);
        res.jsonp({ message: 'Registro actualizado.' });

    }















    public async ListarDetalleHorarios(req: Request, res: Response) {
        const HORARIO = await pool.query(
            `
            SELECT * FROM eh_detalle_horarios
            `
        );
        if (HORARIO.rowCount > 0) {
            return res.jsonp(HORARIO.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'No se encuentran registros.' });
        }
    }

   

}

export const DETALLE_CATALOGO_HORARIO_CONTROLADOR = new DetalleCatalogoHorarioControlador();

export default DETALLE_CATALOGO_HORARIO_CONTROLADOR;