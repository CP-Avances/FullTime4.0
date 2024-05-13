import { ObtenerRutaLeerPlantillas } from '../../libs/accesoCarpetas';
import { Request, Response } from 'express';
import { QueryResult } from 'pg';
import fs from 'fs';
import path from 'path';
import pool from '../../database';
import excel from 'xlsx';

class DiscapacidadControlador {

    public async listaDiscapacidad(req: Request, res: Response) {
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

    public async CrearDiscapacidad(req: Request, res: Response): Promise<Response> {
        try {
            const { discapacidad } = req.body;
            var VERIFICAR_DISCAPACIDAD = await pool.query(
                `
                SELECT * FROM e_cat_discapacidad WHERE UPPER(nombre) = $1
                `, [discapacidad.toUpperCase()])
            console.log('VERIFICAR_DISCAPACIDAD: ', VERIFICAR_DISCAPACIDAD.rows[0]);
            if (VERIFICAR_DISCAPACIDAD.rows[0] == undefined || VERIFICAR_DISCAPACIDAD.rows[0] == '') {
                // Dar formato a la palabra de discapacidad
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
                    return res.status(404).jsonp({ message: 'No se pudo guardar', status: '400' })
                }
            } else {
                return res.jsonp({ message: 'Ya existe la discapacidad ', status: '300' })
            }
        }
        catch (error) {
            return res.status(500).jsonp({ message: 'error', status: '500' });
        }
    }

    public async EditarDiscapacidad(req: Request, res: Response): Promise<Response> {
        try {
            const { id, nombre } = req.body;
            console.log('id: ', id, 'nombre: ', nombre);
            // Dar formato a la palabra de discapacidad
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
                return res.status(404).jsonp({ message: 'No se pudo actualizar', status: '400' })
            }
        }
        catch (error) {
            return res.status(500).jsonp({ message: 'error', status: '500' });
        }
    }

    public async eliminarRegistro(req: Request, res: Response) {
        try {
            const id = req.params.id;
            console.log('id: ', id)
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

export const discapacidadControlador = new DiscapacidadControlador();

export default discapacidadControlador;