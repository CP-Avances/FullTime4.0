import { Request, Response } from 'express';
import pool from '../../database';

class LicenciaControlador {

    public async ObtenerLicencia(req: Request, res: Response){
        try {
            //CONSULTA DE LICENCIA EN BASE A PUBLIC_KEY DE EMPRESA
            let { public_key } = req.body;
            let licenciasRows: any = 0;
            let licencias = await pool.query(
                `
                SELECT 
                    llave_publica, 
                    fecha_activacion, 
                    fecha_desactivacion 
                FROM empresa_licencia empresa_licencia
                WHERE llave_publica = $1
                `, [public_key]
            ).then(
                (result: any) => {
                    licenciasRows = result.rowCount;
                    if(result.rowCount > 0){
                        return res.status(200).jsonp(result.rows);
                    }
                }
            );
            
            if(licenciasRows === 0){
                return res.status(404).jsonp({ text: 'No se encuentran registros.' });
            }
        } catch (error) {
            res.status(500).jsonp({ text: 'No se encuentran registros.' });
        }
    }

}

export const licenciaControlador = new LicenciaControlador;
export default licenciaControlador