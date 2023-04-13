import { Request, Response } from 'express';
import pool from '../../database';

class CiudadFeriadoControlador {

    // METODO PARA BUSCAR CIUDADES - PROVINCIA POR NOMBRE
    public async FiltrarCiudadesProvincia(req: Request, res: Response): Promise<any> {
        const { nombre } = req.params;
        const CIUDAD_FERIADO = await pool.query(
            `
            SELECT c.id, c.descripcion, p.nombre, p.id AS id_prov
            FROM ciudades c, cg_provincias p 
            WHERE c.id_provincia = p.id AND p.nombre = $1
            `
            , [nombre]);
        if (CIUDAD_FERIADO.rowCount > 0) {
            return res.jsonp(CIUDAD_FERIADO.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'Registros no encontrados.' });
        }
    }

    // METODO PARA BUSCAR NOMBRES DE CIUDADES
    public async EncontrarCiudadesFeriado(req: Request, res: Response): Promise<any> {
        const { idferiado } = req.params;
        const CIUDAD_FERIADO = await pool.query(
            `
            SELECT fe.id AS idferiado, fe.descripcion AS nombreferiado, cfe.id AS idciudad_asignada,
                c.id AS idciudad, c.descripcion AS nombreciudad
            FROM cg_feriados fe, ciud_feriados cfe, ciudades c
            WHERE fe.id = cfe.id_feriado AND c.id = cfe.id_ciudad AND fe.id = $1
            `
            , [idferiado]);
        if (CIUDAD_FERIADO.rowCount > 0) {
            return res.jsonp(CIUDAD_FERIADO.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'Registros no encontrados.' });
        }
    }

    // METODO PARA ELIMINAR REGISTRO
    public async EliminarCiudadFeriado(req: Request, res: Response): Promise<void> {
        const id = req.params.id;
        await pool.query(
            `
            DELETE FROM ciud_feriados WHERE id = $1
            `
            , [id]);
        res.jsonp({ message: 'Registro eliminado.' });
    }

    // METODO PARA BUSCAR ID DE CIUDADES
    public async ObtenerIdCiudades(req: Request, res: Response): Promise<any> {
        const { id_feriado, id_ciudad } = req.body;
        const CIUDAD_FERIADO = await pool.query(
            `
            SELECT * FROM ciud_feriados WHERE id_feriado = $1 AND id_ciudad = $2
            `
            , [id_feriado, id_ciudad]);
        if (CIUDAD_FERIADO.rowCount > 0) {
            return res.jsonp(CIUDAD_FERIADO.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'Registros no encontrados.' });
        }
    }

    // METODO PARA ASIGNAR CIUDADES A FERIADO
    public async AsignarCiudadFeriado(req: Request, res: Response): Promise<void> {
        const { id_feriado, id_ciudad } = req.body;
        await pool.query(
            `
            INSERT INTO ciud_feriados (id_feriado, id_ciudad) VALUES ($1, $2)
            `
            , [id_feriado, id_ciudad]);
        res.jsonp({ message: 'Ciudad asignada a feriado' });
    }

    // METODO PARA ACTUALIZAR REGISTRO
    public async ActualizarCiudadFeriado(req: Request, res: Response): Promise<void> {
        const { id_feriado, id_ciudad, id } = req.body;
        await pool.query(
            `
            UPDATE ciud_feriados SET id_feriado = $1, id_ciudad = $2 WHERE id = $3
            `
            , [id_feriado, id_ciudad, id]);
        res.jsonp({ message: 'Registro actualizado.' });
    }















    public async ObtenerFeriadosCiudad(req: Request, res: Response): Promise<any> {
        const id_ciudad = req.params.id_ciudad;
        const CIUDAD_FERIADO = await pool.query('SELECT * FROM ciud_feriados WHERE id_ciudad = $1', [id_ciudad]);
        if (CIUDAD_FERIADO.rowCount > 0) {
            return res.jsonp(CIUDAD_FERIADO.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'Registros no encontrados' });
        }
    }



}

export const CIUDAD_FERIADO_CONTROLADOR = new CiudadFeriadoControlador();

export default CIUDAD_FERIADO_CONTROLADOR;