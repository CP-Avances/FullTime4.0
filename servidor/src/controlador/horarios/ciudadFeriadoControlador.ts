import AUDITORIA_CONTROLADOR from '../reportes/auditoriaControlador';
import { Request, Response } from 'express';
import { QueryResult } from 'pg';
import pool from '../../database';

class CiudadFeriadoControlador {

    // METODO PARA BUSCAR CIUDADES - PROVINCIA POR NOMBRE  **USADO
    public async FiltrarCiudadesProvincia(req: Request, res: Response): Promise<any> {
        const { nombre } = req.params;
        const CIUDAD_FERIADO = await pool.query(
            `
            SELECT c.id, c.descripcion, p.nombre, p.id AS id_prov
            FROM e_ciudades c, e_provincias p 
            WHERE c.id_provincia = p.id AND p.nombre = $1
            `
            , [nombre]);
        if (CIUDAD_FERIADO.rowCount != 0) {
            return res.jsonp(CIUDAD_FERIADO.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'Registros no encontrados.' });
        }
    }

    // METODO PARA BUSCAR NOMBRES DE CIUDADES    **USADO
    public async EncontrarCiudadesFeriado(req: Request, res: Response): Promise<any> {
        const { idferiado } = req.params;
        const CIUDAD_FERIADO = await pool.query(
            `
            SELECT fe.id AS idferiado, fe.descripcion AS nombreferiado, cfe.id AS idciudad_asignada,
                c.id AS idciudad, c.descripcion AS nombreciudad, p.nombre AS provincia
            FROM ef_cat_feriados fe, ef_ciudad_feriado cfe, e_ciudades c, e_provincias AS p
            WHERE fe.id = cfe.id_feriado AND c.id = cfe.id_ciudad AND fe.id = $1 AND p.id = c.id_provincia
            `
            , [idferiado]);
        if (CIUDAD_FERIADO.rowCount != 0) {
            return res.jsonp(CIUDAD_FERIADO.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'Registros no encontrados.' });
        }
    }

    // METODO PARA ELIMINAR REGISTRO    **USADO
    public async EliminarCiudadFeriado(req: Request, res: Response): Promise<Response> {
        try {
            const { user_name, ip, ip_local } = req.body;
            const id = req.params.id;

            // INICIAR TRANSACCION
            await pool.query('BEGIN');

            // CONSULTAR DATOS ORIGINALES
            const ciudad = await pool.query(`SELECT * FROM ef_ciudad_feriado WHERE id = $1`, [id]);
            const [datosOriginales] = ciudad.rows;

            if (!datosOriginales) {
                // AUDITORIA
                await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                    tabla: 'ef_ciudad_feriado',
                    usuario: user_name,
                    accion: 'D',
                    datosOriginales: '',
                    datosNuevos: '',
                    ip: ip,
                    ip_local: ip_local,
                    observacion: `Error al eliminar la ciudad con id ${id}`
                });

                // FINALIZAR TRANSACCION
                await pool.query('COMMIT');
                return res.status(404).jsonp({ message: 'Error al eliminar el registro.' });
            }

            await pool.query(
                `
                DELETE FROM ef_ciudad_feriado WHERE id = $1
                `
                , [id]);

            // AUDITORIA
            await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                tabla: 'ef_ciudad_feriado',
                usuario: user_name,
                accion: 'D',
                datosOriginales: JSON.stringify(datosOriginales),
                datosNuevos: '',
                ip: ip,
                ip_local: ip_local,
                observacion: null
            });

            // FINALIZAR TRANSACCION
            await pool.query('COMMIT');
            return res.jsonp({ message: 'Registro eliminado.' });

        } catch (error) {
            // REVERTIR TRANSACCION
            await pool.query('ROLLBACK');
            return res.status(500).jsonp({ message: 'Error al eliminar el registro.' });
        }
    }

    // METODO PARA BUSCAR ID DE CIUDADES   **USADO
    public async ObtenerIdCiudades(req: Request, res: Response): Promise<any> {
        const { id_feriado, id_ciudad } = req.body;
        const CIUDAD_FERIADO = await pool.query(
            `
            SELECT * FROM ef_ciudad_feriado WHERE id_feriado = $1 AND id_ciudad = $2
            `
            , [id_feriado, id_ciudad]);
        if (CIUDAD_FERIADO.rowCount != 0) {
            return res.jsonp(CIUDAD_FERIADO.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'Registros no encontrados.' });
        }
    }

    // METODO PARA ASIGNAR CIUDADES A FERIADO   **USADO
    public async AsignarCiudadFeriado(req: Request, res: Response) {
        try {
            const { id_feriado, id_ciudad, user_name, ip, ip_local } = req.body;

            // INICIAR TRANSACCION
            await pool.query('BEGIN');

            const response: QueryResult = await pool.query(
                `
                INSERT INTO ef_ciudad_feriado (id_feriado, id_ciudad) VALUES ($1, $2) RETURNING *
                `
                , [id_feriado, id_ciudad]);

            const [feriado] = response.rows;

            // AUDITORIA
            await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                tabla: 'ef_ciudad_feriado',
                usuario: user_name,
                accion: 'I',
                datosOriginales: '',
                datosNuevos: JSON.stringify(feriado),
                ip: ip,
                ip_local: ip_local,
                observacion: null
            });

            // FINALIZAR TRANSACCION
            await pool.query('COMMIT');

            if (feriado) {
                return res.status(200).jsonp({ message: 'OK', reloj: feriado })
            }
            else {
                return res.status(404).jsonp({ message: 'error' })
            }

        } catch (error) {
            // REVERTIR TRANSACCION
            await pool.query('ROLLBACK');
            return res.status(500).jsonp({ message: 'error' })
        }
    }

    // METODO PARA ACTUALIZAR REGISTRO    **USADO
    public async ActualizarCiudadFeriado(req: Request, res: Response): Promise<Response> {
        try {
            const { id_feriado, id_ciudad, id, user_name, ip, ip_local } = req.body;

            // INICIAR TRANSACCION
            await pool.query('BEGIN');

            // CONSULTAR DATOS ORIGINALES
            const ciudad = await pool.query(`SELECT * FROM ef_ciudad_feriado WHERE id = $1`, [id]);
            const [datosOriginales] = ciudad.rows;

            if (!datosOriginales) {
                // AUDITORIA
                await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                    tabla: 'ef_ciudad_feriado',
                    usuario: user_name,
                    accion: 'U',
                    datosOriginales: '',
                    datosNuevos: '',
                    ip: ip,
                    ip_local: ip_local,
                    observacion: `Error al actualizar la ciudad con id ${id}. Registro no encontrado.`
                });

                // FINALIZAR TRANSACCION
                await pool.query('COMMIT');
                return res.status(404).jsonp({ message: 'Error al actualizar el registro.' });
            }

            const actualizacion = await pool.query(
                `
                UPDATE ef_ciudad_feriado SET id_feriado = $1, id_ciudad = $2 WHERE id = $3 RETURNING *
                `
                , [id_feriado, id_ciudad, id]);
            const [datosNuevos] = actualizacion.rows;

            // AUDITORIA
            await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                tabla: 'ef_ciudad_feriado',
                usuario: user_name,
                accion: 'U',
                datosOriginales: JSON.stringify(datosOriginales),
                datosNuevos: JSON.stringify(datosNuevos),
                ip: ip,
                ip_local: ip_local,
                observacion: null
            });

            // FINALIZAR TRANSACCION
            await pool.query('COMMIT');
            return res.jsonp({ message: 'Registro actualizado.' });

        } catch (error) {
            // FINALIZAR TRANSACCION
            await pool.query('ROLLBACK');
            return res.status(500).jsonp({ message: 'Error al actualizar el registro.' });
        }
    }

}

export const CIUDAD_FERIADO_CONTROLADOR = new CiudadFeriadoControlador();

export default CIUDAD_FERIADO_CONTROLADOR;