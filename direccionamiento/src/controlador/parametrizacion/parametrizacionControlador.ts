import { Request, Response } from 'express';
import { QueryResult } from 'pg';
import pool from '../../database';

const builder = require('xmlbuilder');

class ParametrizacionControlador {

    //Servicio con datos por defecto
    public async ObtenerParametrizacion(req: Request, res: Response): Promise<any>{
        try{
            const { id } = req.params;
            const PARAMETRO = await pool.query(
                `
                SELECT 999 AS id_tipo, 'ejecucion_inicial' AS tipo, 999 AS id_detalle, CASE WHEN $1 = 25 THEN 'DD/MM/YYYY' WHEN $1 = 26 THEN 'hh:mm:ss A' END AS descripcion
                `
                , [id]);

            if (PARAMETRO.rowCount != null) {
                if(PARAMETRO.rowCount > 0){
                    return res.jsonp(PARAMETRO.rows);
                }
            }else{
                res.status(404).jsonp({ text: 'Registro no encontrado.' });
            }
        }catch (error) {
            res.status(500).jsonp({ text: 'error' });
        }
        
    }
}

export const parametrizacionControlador = new ParametrizacionControlador;
export default parametrizacionControlador;