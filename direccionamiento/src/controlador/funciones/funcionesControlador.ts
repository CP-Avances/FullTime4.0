import { Request, Response } from 'express';
import pool from '../../database';

class FuncionesControlador {

    public async ObtenerFunciones(req: Request, res: Response){
        try{
            //consulta de empresa en base a codigo encriptado
            let { direccion } = req.body;
            let empresasRows: any = 0;
            let empresas = await pool.query(
                "SELECT emp.empresa_id as id, emp.hora_extra, emp.accion_personal, emp.alimentacion, emp.permisos, emp.geolocalizacion, emp.vacaciones, emp.app_movil, emp.timbre_web FROM empresa AS emp WHERE emp.empresa_direccion = $1", [direccion]
            ).then(
                (result: any) => {
                    empresasRows = result.rowCount;
                    if(result.rowCount > 0){
                        return res.status(200).jsonp(result.rows);
                    }
                }
            );
            
            if(empresasRows === 0){
                return res.status(404).jsonp({ text: 'No se encuentran registros.' });
            }
        }
        catch (error) {
            res.status(500).jsonp({ text: 'No se encuentran registros.' });
        }
    }
}

export const funcionesControlador = new FuncionesControlador;
export default funcionesControlador