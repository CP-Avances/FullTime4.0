import { Request, Response } from 'express';
import { QueryResult } from 'pg';
import AUDITORIA_CONTROLADOR from '../../auditoria/auditoriaControlador';
import pool from '../../../database';
import fs from 'fs';

const builder = require('xmlbuilder');

class UbicacionControlador {

    /** ************************************************************************************************ **
     ** **        REGISTRO TABLA CATALOGO DE UBICACIONES - COORDENADAS (cg_ubicaciones)               ** **
     ** ************************************************************************************************ **/

    // CREAR REGISTRO DE COORDENADAS GENERALES DE UBICACIÓN
    public async RegistrarCoordenadas(req: Request, res: Response) {
        try {
            const { latitud, longitud, descripcion, user_name, ip } = req.body;

            // INICIAR TRANSACCION
            await pool.query('BEGIN');

            const response: QueryResult = await pool.query('INSERT INTO cg_ubicaciones (latitud, longitud, descripcion) ' +
                'VALUES ($1, $2, $3) RETURNING *',
                [latitud, longitud, descripcion]);
    
            const [coordenadas] = response.rows;

            // AUDITORIA
            await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                tabla: 'cg_ubicaciones',
                usuario: user_name,
                accion: 'I',
                datosOriginales: '',
                datosNuevos: `{latitud: ${latitud}, longitud: ${longitud}, descripcion: ${descripcion}}`,
                ip,
                observacion: null
            });

            // FINALIZAR TRANSACCION
            await pool.query('COMMIT');
    
            if (coordenadas) {
                return res.status(200).jsonp({ message: 'OK', respuesta: coordenadas })
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

    // ACTUALIZAR REGISTRO DE COORDENADAS GENERALES DE UBICACIÓN
    public async ActualizarCoordenadas(req: Request, res: Response): Promise<Response> {
        try {
            const { latitud, longitud, descripcion, id, user_name, ip } = req.body;

            // INICIAR TRANSACCION
            await pool.query('BEGIN');

            // CONSULTAR DATOSORIGINALES
            const coordenada = await pool.query('SELECT * FROM cg_ubicaciones WHERE id = $1', [id]);
            const [datosOriginales] = coordenada.rows;

            if (!datosOriginales) {
                await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                    tabla: 'cg_ubicaciones',
                    usuario: user_name,
                    accion: 'U',
                    datosOriginales: '',
                    datosNuevos: '',
                    ip,
                    observacion: `Error al actualizar coordenada con id: ${id}`
                });

                // FINALIZAR TRANSACCION
                await pool.query('COMMIT');
                return res.status(404).jsonp({ message: 'Error al actualizar coordenada' });
            }

            await pool.query('UPDATE cg_ubicaciones SET latitud = $1, longitud = $2, descripcion = $3 ' +
                'WHERE id = $4',
                [latitud, longitud, descripcion, id]);
            
            // AUDITORIA
            await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                tabla: 'cg_ubicaciones',
                usuario: user_name,
                accion: 'U',
                datosOriginales: JSON.stringify(datosOriginales),
                datosNuevos: `{latitud: ${latitud}, longitud: ${longitud}, descripcion: ${descripcion}}`,
                ip,
                observacion: null
            });

            // FINALIZAR TRANSACCION
            await pool.query('COMMIT');
            return res.jsonp({ message: 'Registro guardado.' });
        } catch (error) {
            // REVERTIR TRANSACCION
            await pool.query('ROLLBACK');
            return res.status(500).jsonp({ message: 'Error al guardar registro.' });
        }
    }

    // LISTAR TODOS LOS REGISTROS DE COORDENADAS GENERALES DE UBICACIÓN
    public async ListarCoordenadas(req: Request, res: Response) {
        const UBICACIONES = await pool.query('SELECT * FROM cg_ubicaciones');
        if (UBICACIONES.rowCount > 0) {
            return res.jsonp(UBICACIONES.rows)
        }
        else {
            res.status(404).jsonp({ text: 'Registro no encontrado.' });
        }
    }

    // LISTAR TODOS LOS REGISTROS DE COORDENADAS GENERALES DE UBICACIÓN CON EXCEPCIONES
    public async ListarCoordenadasDefinidas(req: Request, res: Response) {
        const id = req.params.id;
        const UBICACIONES = await pool.query('SELECT * FROM cg_ubicaciones WHERE NOT id = $1', [id]);
        if (UBICACIONES.rowCount > 0) {
            return res.jsonp(UBICACIONES.rows)
        }
        else {
            res.status(404).jsonp({ text: 'Registro no encontrado.' });
        }
    }

    // LISTAR TODOS LOS REGISTROS DE COORDENADAS GENERALES DE UBICACIÓN
    public async ListarUnaCoordenada(req: Request, res: Response) {
        const id = req.params.id;
        const UBICACIONES = await pool.query('SELECT * FROM cg_ubicaciones WHERE id = $1', [id]);
        if (UBICACIONES.rowCount > 0) {
            return res.jsonp(UBICACIONES.rows)
        }
        else {
            res.status(404).jsonp({ text: 'Registro no encontrado.' });
        }
    }

    // BUSCAR ÚLTIMO REGISTRO DE COORDENADAS GENERALES DE UBICACIÓN
    public async BuscarUltimoRegistro(req: Request, res: Response) {
        const UBICACIONES = await pool.query('SELECT MAX(id) AS id FROM cg_ubicaciones');
        if (UBICACIONES.rowCount > 0) {
            return res.jsonp(UBICACIONES.rows)
        }
        else {
            res.status(404).jsonp({ text: 'Registro no encontrado.' });
        }
    }

    // ELIMINAR REGISTRO DE COORDENADAS GENERALES DE UBICACIÓN
    public async EliminarCoordenadas(req: Request, res: Response): Promise<Response> {
        try {
            // TODO ANALIZAE COMO OBTERNER USER_NAME E IP DESDE EL FRONT
            const { user_name, ip } = req.body;
            const { id } = req.params;

            // INICIAR TRANSACCION
            await pool.query('BEGIN');

            // CONSULTAR DATOSORIGINALES
            const coordenada = await pool.query('SELECT * FROM cg_ubicaciones WHERE id = $1', [id]);
            const [datosOriginales] = coordenada.rows;

            if (!datosOriginales) {
                await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                    tabla: 'cg_ubicaciones',
                    usuario: user_name,
                    accion: 'D',
                    datosOriginales: '',
                    datosNuevos: '',
                    ip,
                    observacion: `Error al eliminar coordenada con id: ${id}`
                });

                // FINALIZAR TRANSACCION
                await pool.query('COMMIT');
                return res.status(404).jsonp({ message: 'Registro no encontrado.' });
            }

            await pool.query('DELETE FROM cg_ubicaciones WHERE id = $1', [id]);

            // AUDITORIA
            await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                tabla: 'cg_ubicaciones',
                usuario: user_name,
                accion: 'D',
                datosOriginales: JSON.stringify(datosOriginales),
                datosNuevos: '',
                ip,
                observacion: null
            });

            // FINALIZAR TRANSACCION
            await pool.query('COMMIT');
            return res.jsonp({ message: 'Registro eliminado.' });
        }
        catch {
            // REVERTIR TRANSACCION
            await pool.query('ROLLBACK');
            return res.status(500).jsonp({ message: 'false' });
        }
    }

    /** **************************************************************************************** **
     ** **        COORDENADAS DE UBICACION ASIGNADAS A UN USUARIO (empl_ubicacion)            ** **
     ** **************************************************************************************** **/

    // LISTAR REGISTROS DE COORDENADAS GENERALES DE UBICACION DE UN USUARIO
    public async ListarRegistroUsuario(req: Request, res: Response) {
        const { id_empl } = req.params;
        const UBICACIONES = await pool.query(
            `
            SELECT eu.id AS id_emplu, eu.codigo, eu.id_ubicacion, eu.id_empl, cu.latitud, cu.longitud, 
                cu.descripcion 
            FROM empl_ubicacion AS eu, cg_ubicaciones AS cu 
            WHERE eu.id_ubicacion = cu.id AND eu.id_empl = $1
            `
            , [id_empl]);
        if (UBICACIONES.rowCount > 0) {
            return res.jsonp(UBICACIONES.rows)
        }
        else {
            res.status(404).jsonp({ text: 'Registro no encontrado.' });
        }
    }

    // ASIGNAR COORDENADAS GENERALES DE UBICACIÓN A LOS USUARIOS
    public async RegistrarCoordenadasUsuario(req: Request, res: Response): Promise<void> {
        try {
            const { codigo, id_empl, id_ubicacion, user_name, ip } = req.body;

            // INICIAR TRANSACCION
            await pool.query('BEGIN');

            await pool.query('INSERT INTO empl_ubicacion (codigo, id_empl, id_ubicacion) ' +
                'VALUES ($1, $2, $3)',
                [codigo, id_empl, id_ubicacion]);

            // AUDITORIA
            await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                tabla: 'empl_ubicacion',
                usuario: user_name,
                accion: 'I',
                datosOriginales: '',
                datosNuevos: `{codigo: ${codigo}, id_empl: ${id_empl}, id_ubicacion: ${id_ubicacion}}`,
                ip,
                observacion: null
            });

            // FINALIZAR TRANSACCION
            await pool.query('COMMIT');
            res.jsonp({ message: 'Registro guardado.' });
        } catch (error) {
            // REVERTIR TRANSACCION
            await pool.query('ROLLBACK');
            res.status(500).jsonp({ message: 'Error al guardar registro.' });
        }
    }

    // LISTAR REGISTROS DE COORDENADAS GENERALES DE UNA UBICACIÓN 
    public async ListarRegistroUsuarioU(req: Request, res: Response) {
        const id_ubicacion = req.params.id_ubicacion;
        const UBICACIONES = await pool.query('SELECT eu.id AS id_emplu, eu.codigo, eu.id_ubicacion, eu.id_empl, ' +
            'cu.latitud, cu.longitud, cu.descripcion, e.nombre, e.apellido ' +
            'FROM empl_ubicacion AS eu, cg_ubicaciones AS cu, empleados AS e ' +
            'WHERE eu.id_ubicacion = cu.id AND e.codigo = eu.codigo AND cu.id = $1',
            [id_ubicacion]);
        if (UBICACIONES.rowCount > 0) {
            return res.jsonp(UBICACIONES.rows)
        }
        else {
            res.status(404).jsonp({ text: 'Registro no encontrado.' });
        }
    }

    // ELIMINAR REGISTRO DE COORDENADAS GENERALES DE UBICACIÓN
    public async EliminarCoordenadasUsuario(req: Request, res: Response): Promise<Response> {
        try {
            // TODO ANALIZAR COMO OBTENER USER_NAME E IP DESDE EL FRONT
            const { user_name, ip } = req.body;
            const { id } = req.params;

            // INICIAR TRANSACCION
            await pool.query('BEGIN');

            // CONSULTAR DATOSORIGINALES
            const ubicacion = await pool.query('SELECT * FROM empl_ubicacion WHERE id = $1', [id]);
            const [datosOriginales] = ubicacion.rows;

            if (!datosOriginales) {
                await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                    tabla: 'empl_ubicacion',
                    usuario: user_name,
                    accion: 'D',
                    datosOriginales: '',
                    datosNuevos: '',
                    ip,
                    observacion: `Error al eliminar ubicación con id: ${id}`
                });

                // FINALIZAR TRANSACCION
                await pool.query('COMMIT');
                return res.status(404).jsonp({ message: 'Registro no encontrado.' });
            }

            await pool.query('DELETE FROM empl_ubicacion WHERE id = $1', [id]);

            // AUDITORIA
            await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                tabla: 'empl_ubicacion',
                usuario: user_name,
                accion: 'D',
                datosOriginales: JSON.stringify(datosOriginales),
                datosNuevos: '',
                ip,
                observacion: null
            });

            // FINALIZAR TRANSACCION
            await pool.query('COMMIT');
            return res.jsonp({ message: 'Registro eliminado.' });
        } catch (error) {
            // REVERTIR TRANSACCION
            await pool.query('ROLLBACK');
            return res.status(500).jsonp({ message: 'Error al eliminar registro.' });
        }
    }

}

export const UBICACION_CONTROLADOR = new UbicacionControlador();

export default UBICACION_CONTROLADOR;