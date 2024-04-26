import { Request, Response } from 'express';
import pool from '../../database';

class EmpleadoControlador {

    //Servicio con datos por defecto
    public async ObtenerEmpleado(req: Request, res: Response): Promise<any> {
        try {
            const empleado = await pool.query(
                `
                SELECT 0 AS id, 'Ejecucion' AS nombre, 'Inicial' AS apellido
                `
            ).then((result: any) => {
                return result.rows.map((obj: any) => {
                    return {
                        id: obj.id,
                        empleado: obj.apellido + ' ' + obj.nombre
                    }
                })
            });

            res.jsonp(empleado);
        }
        catch (error) {
            res.status(500).jsonp({ message: 'error' });
        }
    }
}

export const empleadoControlador = new EmpleadoControlador;
export default empleadoControlador;