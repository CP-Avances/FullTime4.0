import { Request, Response } from 'express';
import { QueryResult } from 'pg';
import pool from '../../database';

class ParametrosControlador {

    // METODO PARA LISTAR PARAMETROS GENERALES
    public async ListarParametros(req: Request, res: Response) {
        const PARAMETRO = await pool.query(
            `
            SELECT tp.id, tp.descripcion
            FROM ep_parametro AS tp
            `
        );
        if (PARAMETRO.rowCount > 0) {
            return res.jsonp(PARAMETRO.rows)
        }
        else {
            res.status(404).jsonp({ text: 'Registros no encontrados.' });
        }
    }

    // METODO PARA ELIMINAR TIPO PARAMETRO GENERAL
    public async EliminarTipoParametro(req: Request, res: Response): Promise<void> {
        try {
            const id = req.params.id;
            await pool.query(
                `
                DELETE FROM ep_parametro WHERE id = $1
                `
                , [id]);
            res.jsonp({ message: 'Registro eliminado.' });
        }
        catch {
            res.jsonp({ message: 'false' });
        }
    }

    // METODO PARA ACTUALIZAR TIPO PARAMETRO GENERAL
    public async ActualizarTipoParametro(req: Request, res: Response): Promise<void> {
        const { descripcion, id } = req.body;
        await pool.query(
            `
            UPDATE ep_parametro SET descripcion = $1 WHERE id = $2
            `
            , [descripcion, id]);
        res.jsonp({ message: 'Registro exitoso.' });
    }

    // METODO PARA LISTAR UN PARAMETRO GENERALES
    public async ListarUnParametro(req: Request, res: Response) {
        const { id } = req.params;
        const PARAMETRO = await pool.query(
            `
            SELECT * FROM ep_parametro WHERE id = $1
            `
            , [id]);
        if (PARAMETRO.rowCount > 0) {
            return res.jsonp(PARAMETRO.rows)
        }
        else {
            res.status(404).jsonp({ text: 'Registros no encontrados.' });
        }
    }

    // METODO PARA LISTAR DETALLE DE PARAMETROS GENERALES
    public async VerDetalleParametro(req: Request, res: Response): Promise<any> {
        const { id } = req.params;
        const PARAMETRO = await pool.query(
            `
            SELECT tp.id AS id_tipo, tp.descripcion AS tipo, dtp.id AS id_detalle, dtp.descripcion
            FROM ep_parametro AS tp, ep_detalle_parametro AS dtp
            WHERE tp.id = dtp.id_parametro AND tp.id = $1
            `
            , [id]);
        if (PARAMETRO.rowCount > 0) {
            return res.jsonp(PARAMETRO.rows)
        }
        else {
            res.status(404).jsonp({ text: 'Registro no encontrado.' });
        }
    }

    // METODO PARA ELIMINAR DETALLE TIPO PARAMETRO GENERAL
    public async EliminarDetalleParametro(req: Request, res: Response) {
        try {
            const id = req.params.id;
            await pool.query(
                `
                DELETE FROM detalle_tipo_parametro WHERE id = $1
                `
                , [id]);
            res.jsonp({ message: 'Registro eliminado.' });
        }
        catch {
            res.jsonp({ message: 'false' });
        }
    }

    // METODO PARA INGRESAR DETALLE TIPO PARAMETRO GENERAL
    public async IngresarDetalleParametro(req: Request, res: Response): Promise<any> {
        const { id_tipo, descripcion } = req.body;
        await pool.query(
            `
            INSERT INTO ep_detalle_parametro
            (id_parametro, descripcion) VALUES ($1, $2)
            `
            , [id_tipo, descripcion]);
        res.jsonp({ message: 'Registro exitoso.' });
    }

    // METODO PARA ACTUALIZAR DETALLE TIPO PARAMETRO GENERAL
    public async ActualizarDetalleParametro(req: Request, res: Response): Promise<void> {
        const { id, descripcion } = req.body;
        await pool.query(
            `
            UPDATE ep_detalle_parametro SET descripcion = $1 WHERE id = $2
            `
            , [descripcion, id]);
        res.jsonp({ message: 'Registro exitoso.' });
    }

    // METODO PARA INGRESAR TIPO PARAMETRO GENERAL
    public async IngresarTipoParametro(req: Request, res: Response): Promise<any> {
        const { descripcion } = req.body;
        const response: QueryResult = await pool.query(
            `
            INSERT INTO ep_parametro (descripcion) VALUES ($1) RETURNING *
            `
            , [descripcion]);

        const [parametro] = response.rows;

        if (parametro) {
            return res.status(200).jsonp({ message: 'OK', respuesta: parametro })
        }
        else {
            return res.status(404).jsonp({ message: 'error' })
        }
    }

    // METODO PARA COMPARAR COORDENADAS
    public async CompararCoordenadas(req: Request, res: Response): Promise<Response> {
        try {
            const { lat1, lng1, lat2, lng2, valor } = req.body;
            const VALIDACION = await pool.query(
                `
                SELECT CASE ( SELECT 1 WHERE 
                ($1::DOUBLE PRECISION  BETWEEN $3::DOUBLE PRECISION - $5 AND $3::DOUBLE PRECISION + $5) AND 
                ($2::DOUBLE PRECISION  BETWEEN $4::DOUBLE PRECISION - $5 AND $4::DOUBLE PRECISION + $5)) 
                IS null WHEN true THEN \'vacio\' ELSE \'ok\' END AS verificar
                `
                , [lat1, lng1, lat2, lng2, valor]);

            return res.jsonp(VALIDACION.rows);
        } catch (error) {
            return res.status(500)
                .jsonp({ message: 'Contactese con el Administrador del sistema (593) 2 – 252-7663 o https://casapazmino.com.ec' });
        }
    }

}

export const PARAMETROS_CONTROLADOR = new ParametrosControlador();

export default PARAMETROS_CONTROLADOR;