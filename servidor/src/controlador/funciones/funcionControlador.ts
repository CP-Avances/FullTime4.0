import { Request, Response } from 'express';
import pool from '../../database';

class FuncionesControlador {

    // METODO PARA LISTAR FUNCIONES DEL SISTEMA
    public async ConsultarFunciones(req: Request, res: Response) {
        const FUNCIONES = await pool.query(
            `
            SELECT * FROM funciones
            `
        );
        if (FUNCIONES.rowCount > 0) {
            return res.jsonp(FUNCIONES.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'No se encuentran registros.' });
        }
    }





    public async RegistrarFunciones(req: Request, res: Response): Promise<void> {
        const { id, hora_extra, accion_personal, alimentacion, permisos } = req.body;
        await pool.query('INSERT INTO funciones ( id, hora_extra, accion_personal, alimentacion, permisos ) ' +
            'VALUES ($1, $2, $3, $4, $5)',
            [id, hora_extra, accion_personal, alimentacion, permisos]);
        res.jsonp({ message: 'Funciones Registradas' });
    }

    public async EditarFunciones(req: Request, res: Response) {
        const id = req.params.id;
        const { hora_extra, accion_personal, alimentacion, permisos } = req.body;
        await pool.query('UPDATE funciones SET hora_extra = $2, accion_personal = $3, alimentacion = $4, ' +
            'permisos = $5 WHERE id = $1 ',
            [id, hora_extra, accion_personal, alimentacion, permisos]);
        res.jsonp({ message: 'Funciones Actualizados' });
    }

}

export const FUNCIONES_CONTROLADOR = new FuncionesControlador();

export default FUNCIONES_CONTROLADOR;