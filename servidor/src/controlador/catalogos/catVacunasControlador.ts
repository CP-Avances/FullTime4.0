import { Request, Response } from 'express';
import { QueryResult } from 'pg';
import pool from '../../database';

class VacunaControlador {

    // METODO PARA LISTAR TIPO VACUNAS
    public async ListaVacuna(req: Request, res: Response) {
        try {
            const VACUNA = await pool.query(
                `
                SELECT * FROM e_cat_vacuna ORDER BY nombre ASC
                `
            );
            if (VACUNA.rowCount > 0) {
                return res.jsonp(VACUNA.rows)
            } else {
                return res.status(404).jsonp({ text: 'No se encuentran registros.' });
            }
        } catch (error) {
            return res.status(500).jsonp({ message: error });
        }
    }


    // METODO PARA EDITAR VACUNA
    public async EditarVacuna(req: Request, res: Response): Promise<Response> {
        try {
            const { id, nombre } = req.body;

            var VERIFICAR_VACUNA = await pool.query(
                `
                SELECT * FROM e_cat_vacuna WHERE UPPER(nombre) = $1 AND NOT id = $2
                `
                , [nombre.toUpperCase(), id])


            if (VERIFICAR_VACUNA.rows[0] == undefined || VERIFICAR_VACUNA.rows[0] == '') {
                const vacunaEditar = nombre.charAt(0).toUpperCase() + nombre.slice(1).toLowerCase();

                const response: QueryResult = await pool.query(
                    `
                UPDATE e_cat_vacuna SET nombre = $2
                WHERE id = $1 RETURNING *
                `
                    , [id, vacunaEditar]);

                const [vacunaInsertada] = response.rows;
                if (vacunaInsertada) {
                    return res.status(200).jsonp({ message: 'Registro editado.', status: '200' })
                } else {
                    return res.status(404).jsonp({ message: 'Ups!!! algo salio mal.', status: '400' })
                }
            } else {
                return res.jsonp({ message: 'Tipo vacuna ya existe en el sistema.', status: '300' })
            }

        }
        catch (error) {
            return res.status(500).jsonp({ message: 'error', status: '500' });
        }
    }

    // METODO PARA ELIMINAR REGISTRO
    public async EliminarRegistro(req: Request, res: Response) {
        try {
            const id = req.params.id;
            await pool.query(
                `
                DELETE FROM e_cat_vacuna WHERE id = $1
                `
                , [id]);
            res.jsonp({ message: 'Registro eliminado.' });

        } catch (error) {
            return res.jsonp({ message: 'error' });
        }
    }

}

export const TIPO_VACUNAS_CONTROLADOR = new VacunaControlador();

export default TIPO_VACUNAS_CONTROLADOR;