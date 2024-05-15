import { Request, Response } from 'express';
import { QueryResult } from 'pg';
import AUDITORIA_CONTROLADOR from '../auditoria/auditoriaControlador';
import pool from '../../database';

class ParametrosControlador {

    // METODO PARA LISTAR PARAMETROS GENERALES
    public async ListarParametros(req: Request, res: Response) {
        /**
          SELECT tp.id, tp.descripcion, dtp.descripcion AS detalle
            FROM tipo_parametro AS tp, detalle_tipo_parametro AS dtp
            WHERE tp.id = dtp.id_tipo_parametro
         */
        const PARAMETRO = await pool.query(
            `
            SELECT tp.id, tp.descripcion
            FROM tipo_parametro AS tp
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
    public async EliminarTipoParametro(req: Request, res: Response): Promise<Response> {
        try {
            const { user_name, ip } = req.body;
            const id = req.params.id;

            // INICIAR TRANSACCION
            await pool.query('BEGIN');

            // OBTENER DATOSORIGINALES
            const consulta = await pool.query(
                `
                SELECT * FROM tipo_parametro WHERE id = $1
                `
                , [id]);
            const [datosOriginales] = consulta.rows;

            if (!datosOriginales) {
                await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                    tabla: 'tipo_parametro',
                    usuario: user_name,
                    accion: 'D',
                    datosOriginales: '',
                    datosNuevos: '',
                    ip,
                    observacion: `Error al eliminar tipo parametro con id ${id}`
                });

                //FINALIZAR TRANSACCION
                await pool.query('COMMIT');
                return res.status(404).jsonp({ message: 'Registro no encontrado.' });
            }

            await pool.query(
                `
                DELETE FROM tipo_parametro WHERE id = $1
                `
                , [id]);

            // AUDITORIA
            await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                tabla: 'tipo_parametro',
                usuario: user_name,
                accion: 'D',
                datosOriginales: JSON.stringify(datosOriginales),
                datosNuevos: '',
                ip,
                observacion: null
            });

            //FINALIZAR TRANSACCION
            await pool.query('COMMIT');
            return res.jsonp({ message: 'Registro eliminado.' });
        }
        catch {
            // REVERTIR TRANSACCION
            await pool.query('ROLLBACK');
            return res.status(500).jsonp({ message: 'false' });
        }
    }

    // METODO PARA ACTUALIZAR TIPO PARAMETRO GENERAL
    public async ActualizarTipoParametro(req: Request, res: Response): Promise<Response> {
        try {
            const { descripcion, id, user_name, ip } = req.body;

            // INICIAR TRANSACCION
            await pool.query('BEGIN');

            // OBTENER DATOSORIGINALES
            const consulta = await pool.query(`SELECT descripcion FROM tipo_parametro WHERE id = $1`, [id]);
            const [datosOriginales] = consulta.rows;

            if (!datosOriginales) {
                await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                    tabla: 'tipo_parametro',
                    usuario: user_name,
                    accion: 'U',
                    datosOriginales: '',
                    datosNuevos: '',
                    ip,
                    observacion: `Error al actualizar tipo parametro con id ${id}`
                });

                //FINALIZAR TRANSACCION
                await pool.query('COMMIT');
                return res.status(404).jsonp({ message: 'Registro no encontrado.' });
            }

            await pool.query(
                `
                UPDATE tipo_parametro SET descripcion = $1 WHERE id = $2
                `
                , [descripcion, id]);

            // AUDITORIA
            await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                tabla: 'tipo_parametro',
                usuario: user_name,
                accion: 'U',
                datosOriginales: JSON.stringify(datosOriginales),
                datosNuevos: JSON.stringify({ descripcion }),
                ip,
                observacion: null
            });

            //FINALIZAR TRANSACCION
            await pool.query('COMMIT');
            return res.jsonp({ message: 'Registro exitoso.' });
        } catch (error) {
            // REVERTIR TRANSACCION
            await pool.query('ROLLBACK');
            return res.status(500).jsonp({ message: 'error' });
        }
    }

    // METODO PARA LISTAR UN PARAMETRO GENERALES
    public async ListarUnParametro(req: Request, res: Response) {
        const { id } = req.params;
        const PARAMETRO = await pool.query(
            `
            SELECT * FROM tipo_parametro WHERE id = $1
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
            FROM tipo_parametro AS tp, detalle_tipo_parametro AS dtp
            WHERE tp.id = dtp.id_tipo_parametro AND tp.id = $1
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
    public async EliminarDetalleParametro(req: Request, res: Response): Promise<Response> {
        try {
            // TODO: ANALIZAR COMO OBTENER USER_NAME E IP DESDE EL FRONT
            const { user_name, ip } = req.body;
            const id = req.params.id;

            // INICIAR TRANSACCION
            await pool.query('BEGIN');

            // OBTENER DATOSORIGINALES
            const consulta = await pool.query(`SELECT * FROM detalle_tipo_parametro WHERE id = $1`, [id]);
            const [datosOriginales] = consulta.rows;

            if (!datosOriginales) {
                await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                    tabla: 'detalle_tipo_parametro',
                    usuario: user_name,
                    accion: 'D',
                    datosOriginales: '',
                    datosNuevos: '',
                    ip,
                    observacion: `Error al eliminar detalle tipo parametro con id ${id}`
                });

                //FINALIZAR TRANSACCION
                await pool.query('COMMIT');
                return res.status(404).jsonp({ message: 'Registro no encontrado.' });
            }

            await pool.query(
                `
                DELETE FROM detalle_tipo_parametro WHERE id = $1
                `
                , [id]);

            // AUDITORIA
            await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                tabla: 'detalle_tipo_parametro',
                usuario: user_name,
                accion: 'D',
                datosOriginales: JSON.stringify(datosOriginales),
                datosNuevos: '',
                ip,
                observacion: null
            });

            //FINALIZAR TRANSACCION
            await pool.query('COMMIT');
            return res.jsonp({ message: 'Registro eliminado.' });
        }
        catch {
            // REVERTIR TRANSACCION
            await pool.query('ROLLBACK');
            return res.jsonp({ message: 'false' });
        }
    }

    // METODO PARA INGRESAR DETALLE TIPO PARAMETRO GENERAL
    public async IngresarDetalleParametro(req: Request, res: Response): Promise<any> {
        try {
            const { id_tipo, descripcion, user_name, ip } = req.body;

            // INICIAR TRANSACCION
            await pool.query('BEGIN');

            await pool.query(
                `
                INSERT INTO detalle_tipo_parametro
                (id_tipo_parametro, descripcion) VALUES ($1, $2)
                `
                , [id_tipo, descripcion]);

            // AUDITORIA
            await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                tabla: 'detalle_tipo_parametro',
                usuario: user_name,
                accion: 'I',
                datosOriginales: '',
                datosNuevos: JSON.stringify({ id_tipo, descripcion }),
                ip,
                observacion: null
            });

            //FINALIZAR TRANSACCION
            await pool.query('COMMIT');
            res.jsonp({ message: 'Registro exitoso.' });
        } catch (error) {
            // REVERTIR TRANSACCION
            await pool.query('ROLLBACK');
            res.status(500).jsonp({ message: 'error' });
        }
    }

    // METODO PARA ACTUALIZAR DETALLE TIPO PARAMETRO GENERAL
    public async ActualizarDetalleParametro(req: Request, res: Response): Promise<Response> {
        try {
            const { id, descripcion, user_name, ip } = req.body;

            // INICIAR TRANSACCION
            await pool.query('BEGIN');

            // OBTENER DATOSORIGINALES
            const consulta = await pool.query(`SELECT descripcion FROM detalle_tipo_parametro WHERE id = $1`, [id]);
            const [datosOriginales] = consulta.rows;

            if (!datosOriginales) {
                await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                    tabla: 'detalle_tipo_parametro',
                    usuario: user_name,
                    accion: 'U',
                    datosOriginales: '',
                    datosNuevos: '',
                    ip,
                    observacion: `Error al actualizar detalle tipo parametro con id ${id}`
                });

                //FINALIZAR TRANSACCION
                await pool.query('COMMIT');
                return res.status(404).jsonp({ message: 'Registro no encontrado.' });
            }

            await pool.query(
                `
                UPDATE detalle_tipo_parametro SET descripcion = $1 WHERE id = $2
                `
                , [descripcion, id]);

            // AUDITORIA
            await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                tabla: 'detalle_tipo_parametro',
                usuario: user_name,
                accion: 'U',
                datosOriginales: JSON.stringify(datosOriginales),
                datosNuevos: `{"descripcion": "${descripcion}"}`,
                ip,
                observacion: null
            });

            //FINALIZAR TRANSACCION
            await pool.query('COMMIT');
            return res.jsonp({ message: 'Registro exitoso.' });
        } catch (error) {
            // REVERTIR TRANSACCION
            await pool.query('ROLLBACK');
            return res.status(500).jsonp({ message: 'error' });
        }
    }

    // METODO PARA INGRESAR TIPO PARAMETRO GENERAL
    public async IngresarTipoParametro(req: Request, res: Response): Promise<any> {
        try {
            const { descripcion, user_name, ip } = req.body;

            // INICIAR TRANSACCION
            await pool.query('BEGIN');

            const response: QueryResult = await pool.query(
                `
                INSERT INTO tipo_parametro (descripcion) VALUES ($1) RETURNING *
                `
                , [descripcion]);
    
            const [parametro] = response.rows;
    
            // AUDITORIA
            await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                tabla: 'tipo_parametro',
                usuario: user_name,
                accion: 'I',
                datosOriginales: '',
                datosNuevos: JSON.stringify(parametro),
                ip,
                observacion: null
            });

            //FINALIZAR TRANSACCION
            await pool.query('COMMIT');

            if (parametro) {
                return res.status(200).jsonp({ message: 'OK', respuesta: parametro })
            }
            else {
                return res.status(404).jsonp({ message: 'error' })
            }
        } catch (error) {
            // REVERTIR TRANSACCION
            await pool.query('ROLLBACK');
            return res.status(500).jsonp({ message: 'error' });
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