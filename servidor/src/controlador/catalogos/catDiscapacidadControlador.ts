import { Request, Response } from 'express';
import { QueryResult } from 'pg';
import pool from '../../database';

class DiscapacidadControlador {

    // METODO PARA LISTAR TIPO DE DISCAPACIDAD
    public async ListarDiscapacidad(req: Request, res: Response) {
        try {
            const DISCAPACIDAD = await pool.query(
                `
                SELECT * FROM e_cat_discapacidad ORDER BY nombre ASC
                `
            );
            if (DISCAPACIDAD.rowCount > 0) {
                return res.jsonp(DISCAPACIDAD.rows)
            } else {
                return res.status(404).jsonp({ text: 'No se encuentran registros.' });
            }
        } catch (error) {
            return res.status(500).jsonp({ message: error });
        }
    }

    // METODO PARA REGISTRAR UN TIPO DE DISCAPACIDAD
    public async CrearDiscapacidad(req: Request, res: Response): Promise<Response> {
        try {
            const { discapacidad } = req.body;
            var VERIFICAR_DISCAPACIDAD = await pool.query(
                `
                SELECT * FROM e_cat_discapacidad WHERE UPPER(nombre) = $1
                `
                , [discapacidad.toUpperCase()])

            if (VERIFICAR_DISCAPACIDAD.rows[0] == undefined || VERIFICAR_DISCAPACIDAD.rows[0] == '') {
                const discapacidadInsertar = discapacidad.charAt(0).toUpperCase() + discapacidad.slice(1).toLowerCase();
                const response: QueryResult = await pool.query(
                    `
                    INSERT INTO e_cat_discapacidad (nombre) VALUES ($1) RETURNING *
                    `
                    , [discapacidadInsertar]);

                const [discapacidadInsertada] = response.rows;

                if (discapacidadInsertada) {
                    return res.status(200).jsonp({ message: 'Registro guardado.', status: '200' })
                } else {
                    return res.status(404).jsonp({ message: 'Ups!!! algo salio mal.', status: '400' })
                }
            } else {
                return res.jsonp({ message: 'Tipo discapacidad registrada ya existe en el sistema.', status: '300' })
            }
        }
        catch (error) {
            return res.status(500).jsonp({ message: 'error', status: '500' });
        }
    }

    // METODO PARA EDITAR UN TIPO DE DISCAPACIDAD
    public async EditarDiscapacidad(req: Request, res: Response): Promise<Response> {
        try {
            const { id, nombre } = req.body;
            const nombreConFormato = nombre.charAt(0).toUpperCase() + nombre.slice(1).toLowerCase();
            const response: QueryResult = await pool.query(
                `
                UPDATE e_cat_discapacidad SET nombre = $2
                WHERE id = $1 RETURNING *
                `
                , [id, nombreConFormato]);
            const [discapacidadEditada] = response.rows;
            if (discapacidadEditada) {
                return res.status(200).jsonp({ message: 'Registro actualizado.', status: '200' })
            } else {
                return res.status(404).jsonp({ message: 'Ups!!! algo salio mal.', status: '400' })
            }
        }
        catch (error) {
            return res.status(500).jsonp({ message: 'error', status: '500' });
        }
    }

    // METODO PARA ELIMINAR UN TIPO DE DISCAPACIDAD
    public async eliminarRegistro(req: Request, res: Response) {
        try {
            const id = req.params.id;
            await pool.query(
                `
                DELETE FROM e_cat_discapacidad WHERE id = $1
                `
                , [id]);
            res.jsonp({ message: 'Registro eliminado.' });

        } catch (error) {
            return res.jsonp({ message: 'error' });
        }
    }

}

export const DISCAPACIDADCONTROLADOR = new DiscapacidadControlador();

export default DISCAPACIDADCONTROLADOR;