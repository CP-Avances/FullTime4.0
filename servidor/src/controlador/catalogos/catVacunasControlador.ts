import { ObtenerRutaLeerPlantillas } from '../../libs/accesoCarpetas';
import { Request, Response } from 'express';
import { QueryResult } from 'pg';
import fs from 'fs';
import path from 'path';
import pool from '../../database';
import excel from 'xlsx';

class VacunaControlador {

    public async listaVacuna(req: Request, res: Response) {
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

    public async CrearVacuna(req: Request, res: Response): Promise<Response> {
        try {
            const { vacuna } = req.body;
            var VERIFICAR_VACUNA = await pool.query(
                `
                SELECT * FROM e_cat_vacuna WHERE UPPER(nombre) = $1
                `, [vacuna.toUpperCase()])
            console.log('VERIFICAR_VACUNA: ', VERIFICAR_VACUNA.rows[0]);
            if (VERIFICAR_VACUNA.rows[0] == undefined || VERIFICAR_VACUNA.rows[0] == '') {
                // Dar formato a la palabra de vacuna
                const vacunaInsertar = vacuna.charAt(0).toUpperCase() + vacuna.slice(1).toLowerCase();

                const response: QueryResult = await pool.query(
                    `
                    INSERT INTO e_cat_vacuna (nombre) VALUES ($1) RETURNING *
                    `
                    , [vacunaInsertar]);

                const [vacunaInsertada] = response.rows;

                if (vacunaInsertada) {
                    return res.status(200).jsonp({ message: 'Registro guardado.', status: '200' })
                } else {
                    return res.status(404).jsonp({ message: 'No se pudo guardar', status: '400' })
                }
            } else {
                return res.jsonp({ message: 'Ya existe la vacuna ', status: '300' })
            }
        }
        catch (error) {
            return res.status(500).jsonp({ message: 'error', status: '500' });
        }
    }

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
                return res.jsonp({ message: 'Tipo vacuna registrada ya existe en el sistema.', status: '300' })
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
                DELETE FROM e_cat_vacuna WHERE id = $1
            `
                , [id]);
            res.jsonp({ message: 'Registro eliminado.' });

        } catch (error) {
            return res.jsonp({ message: 'error' });
        }
    }

}

export const vacunaControlador = new VacunaControlador();

export default vacunaControlador;