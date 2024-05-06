import { Request, Response } from 'express';
import pool from '../../database';

class CiudadControlador {

    // BUSCAR DATOS RELACIONADOS A LA CIUDAD
    public async ListarInformacionCiudad(req: Request, res: Response) {
        const { id_ciudad } = req.params;
        const CIUDAD = await pool.query(
            `
            SELECT p.continente, p.nombre AS pais, p.id AS id_pais, pro.nombre AS provincia
            FROM e_cat_paises AS p, e_provincias AS pro, e_ciudades AS c
            WHERE c.id = $1 AND c.id_provincia = pro.id AND p.id = pro.id_pais
            `
            , [id_ciudad]
        );
        if (CIUDAD.rowCount > 0) {
            return res.jsonp(CIUDAD.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'No se encuentran registros.' });
        }
    }

    // BUSCAR LISTA DE CIUDADES
    public async ListarCiudades(req: Request, res: Response) {
        const CIUDAD = await pool.query(
            `
            SELECT * FROM e_ciudades
            `
        );
        if (CIUDAD.rowCount > 0) {
            return res.jsonp(CIUDAD.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'No se encuentran registros.' });
        }
    }

    // BUSCAR LISTA DE CIUDADES PROVINCIA
    public async ListarCiudadesProvincia(req: Request, res: Response) {

        const { id_provincia } = req.params;

        const CIUDAD = await pool.query(
            `
            SELECT * FROM e_ciudades WHERE id_provincia = $1
            `
            , [id_provincia]);

        if (CIUDAD.rowCount > 0) {
            return res.jsonp(CIUDAD.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'No se encuentran registros.' });
        }
    }

    // REGISTRAR CIUDAD
    public async CrearCiudad(req: Request, res: Response): Promise<void> {
        const { id_provincia, descripcion } = req.body;
        await pool.query(
            `
            INSERT INTO e_ciudades (id_provincia, descripcion) VALUES ($1, $2)
            `
            , [id_provincia, descripcion]);
        res.jsonp({ message: 'Registro guardado.' });
    }

    // METODO PARA LISTAR NOMBRE DE CIUDADES - PROVINCIAS
    public async ListarNombreCiudad(req: Request, res: Response) {
        const CIUDAD = await pool.query(
            `
            SELECT c.id, c.descripcion AS nombre, p.nombre AS provincia, p.id AS id_prov
            FROM e_ciudades c, e_provincias p
            WHERE c.id_provincia = p.id
            ORDER BY provincia, nombre ASC
            `
        );
        if (CIUDAD.rowCount > 0) {
            return res.jsonp(CIUDAD.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'No se encuentran registros' });
        }
    }

    // METODO PARA ELIMINAR REGISTRO
    public async EliminarCiudad(req: Request, res: Response) {

        try {
            const id = req.params.id;
            await pool.query(
                `
                DELETE FROM e_ciudades WHERE id = $1
                `
                , [id]);
            res.jsonp({ message: 'Registro eliminado.' });

        } catch {

            return res.jsonp({ message: 'error' });

        }

    }

    // METODO PARA CONSULTAR DATOS DE UNA CIUDAD
    public async ConsultarUnaCiudad(req: Request, res: Response): Promise<any> {
        const { id } = req.params;
        const CIUDAD = await pool.query(
            `
            SELECT * FROM e_ciudades WHERE id = $1
            `
            , [id]);
        if (CIUDAD.rowCount > 0) {
            return res.jsonp(CIUDAD.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'No se encuentran registros.' });
        }
    }

}

export const CIUDAD_CONTROLADOR = new CiudadControlador();

export default CIUDAD_CONTROLADOR;