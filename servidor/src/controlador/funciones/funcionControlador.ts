import { Request, Response } from 'express';
import AUDITORIA_CONTROLADOR from '../auditoria/auditoriaControlador';
import pool from '../../database';

class FuncionesControlador {

    // METODO PARA LISTAR FUNCIONES DEL SISTEMA
    public async ConsultarFunciones(req: Request, res: Response) {
        const FUNCIONES = await pool.query(
            `
            SELECT * FROM e_funciones
            `
        );
        if (FUNCIONES.rowCount != 0) {
            return res.jsonp(FUNCIONES.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'No se encuentran registros.' });
        }
    }


}

export const FUNCIONES_CONTROLADOR = new FuncionesControlador();

export default FUNCIONES_CONTROLADOR;