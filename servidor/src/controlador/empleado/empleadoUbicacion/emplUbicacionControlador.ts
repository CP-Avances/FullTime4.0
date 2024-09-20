import { Request, Response } from 'express';
import { QueryResult } from 'pg';
import AUDITORIA_CONTROLADOR from '../../auditoria/auditoriaControlador';
import pool from '../../../database';

class UbicacionControlador {

    /** ************************************************************************************************ **
     ** **        REGISTRO TABLA CATALOGO DE UBICACIONES - COORDENADAS (cat_ubicaciones)               ** **
     ** ************************************************************************************************ **/

    // CREAR REGISTRO DE COORDENADAS GENERALES DE UBICACION    **USADO
    public async RegistrarCoordenadas(req: Request, res: Response) {
        try {
            const { latitud, longitud, descripcion, user_name, ip } = req.body;

            // INICIAR TRANSACCION
            await pool.query('BEGIN');

            const response: QueryResult = await pool.query(
                `
                INSERT INTO mg_cat_ubicaciones (latitud, longitud, descripcion)
                VALUES ($1, $2, $3) RETURNING *
                `
                ,
                [latitud, longitud, descripcion]);

            const [coordenadas] = response.rows;

            // AUDITORIA
            await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                tabla: 'mg_cat_ubicaciones',
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

    // ACTUALIZAR REGISTRO DE COORDENADAS GENERALES DE UBICACION   **USADO
    public async ActualizarCoordenadas(req: Request, res: Response): Promise<Response> {
        try {
            const { latitud, longitud, descripcion, id, user_name, ip } = req.body;

            // INICIAR TRANSACCION
            await pool.query('BEGIN');

            // CONSULTAR DATOSORIGINALES
            const coordenada = await pool.query(`SELECT * FROM mg_cat_ubicaciones WHERE id = $1`, [id]);
            const [datosOriginales] = coordenada.rows;

            if (!datosOriginales) {
                await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                    tabla: 'mg_cat_ubicaciones',
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

            await pool.query(
                `
                UPDATE mg_cat_ubicaciones SET latitud = $1, longitud = $2, descripcion = $3
                WHERE id = $4
                `
                , [latitud, longitud, descripcion, id]);

            // AUDITORIA
            await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                tabla: 'mg_cat_ubicaciones',
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

    // LISTAR TODOS LOS REGISTROS DE COORDENADAS GENERALES DE UBICACION    **USADO
    public async ListarCoordenadas(req: Request, res: Response) {
        const UBICACIONES = await pool.query(
            `
            SELECT * FROM mg_cat_ubicaciones
            `
        );
        if (UBICACIONES.rowCount != 0) {
            return res.jsonp(UBICACIONES.rows)
        }
        else {
            res.status(404).jsonp({ text: 'Registro no encontrado.' });
        }
    }

    // LISTAR TODOS LOS REGISTROS DE COORDENADAS GENERALES DE UBICACION CON EXCEPCIONES     **USADO
    public async ListarCoordenadasDefinidas(req: Request, res: Response) {
        const id = req.params.id;
        const UBICACIONES = await pool.query(
            `
            SELECT * FROM mg_cat_ubicaciones WHERE NOT id = $1
            `
            , [id]);
        if (UBICACIONES.rowCount != 0) {
            return res.jsonp(UBICACIONES.rows)
        }
        else {
            res.status(404).jsonp({ text: 'Registro no encontrado.' });
        }
    }

    // METODO PARA LISTAR DATOS DE UNA UBICACION ESPECIFICA  **USADO
    public async ListarUnaCoordenada(req: Request, res: Response) {
        const id = req.params.id;
        const UBICACIONES = await pool.query(
            `
            SELECT * FROM mg_cat_ubicaciones WHERE id = $1
            `
            , [id]);
        if (UBICACIONES.rowCount != 0) {
            return res.jsonp(UBICACIONES.rows)
        }
        else {
            res.status(404).jsonp({ text: 'Registro no encontrado.' });
        }
    }

    // ELIMINAR REGISTRO DE COORDENADAS GENERALES DE UBICACION      **USADO
    public async EliminarCoordenadas(req: Request, res: Response): Promise<Response> {
        try {
            const { user_name, ip } = req.body;
            const { id } = req.params;

            // INICIAR TRANSACCION
            await pool.query('BEGIN');

            // CONSULTAR DATOSORIGINALES
            const coordenada = await pool.query(`SELECT * FROM mg_cat_ubicaciones WHERE id = $1`, [id]);
            const [datosOriginales] = coordenada.rows;

            if (!datosOriginales) {
                await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                    tabla: 'mg_cat_ubicaciones',
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

            await pool.query(
                `
                DELETE FROM mg_cat_ubicaciones WHERE id = $1
                `
                , [id]);

            // AUDITORIA
            await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                tabla: 'mg_cat_ubicaciones',
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
            return res.jsonp({ message: 'false' });
        }
    }

    /** **************************************************************************************** **
     ** **        COORDENADAS DE UBICACION ASIGNADAS A UN USUARIO (empleado_ubicacion)            ** **
     ** **************************************************************************************** **/

    // LISTAR REGISTROS DE COORDENADAS GENERALES DE UBICACION DE UN USUARIO    **USADO
    public async ListarRegistroUsuario(req: Request, res: Response) {
        const { id_empl } = req.params;
        const UBICACIONES = await pool.query(
            `
            SELECT eu.id AS id_emplu, e.codigo, eu.id_ubicacion, eu.id_empleado, cu.latitud, cu.longitud, 
                cu.descripcion 
            FROM mg_empleado_ubicacion AS eu, mg_cat_ubicaciones AS cu, eu_empleados AS e 
            WHERE eu.id_ubicacion = cu.id AND eu.id_empleado = $1 AND e.id = eu.id_empleado
            `
            , [id_empl]);
        if (UBICACIONES.rowCount != 0) {
            return res.jsonp(UBICACIONES.rows)
        }
        else {
            res.status(404).jsonp({ text: 'Registro no encontrado.' });
        }
    }

    // ASIGNAR COORDENADAS GENERALES DE UBICACION A LOS USUARIOS    **USADO
    public async RegistrarCoordenadasUsuario(req: Request, res: Response): Promise<void> {
        try {
            const { id_empl, id_ubicacion, user_name, ip } = req.body;
            console.log('ubicacion ', req.body)

            const existe = await pool.query(
                `
                SELECT * FROM mg_empleado_ubicacion WHERE id_empleado = $1 AND id_ubicacion = $2
                `
                , [id_empl, id_ubicacion]);

            console.log(' existe ', existe.rows)

            if (existe.rowCount != 0) {
                res.jsonp({ message: 'error' });
            }
            else {
                // INICIAR TRANSACCION
                await pool.query('BEGIN');

                await pool.query(
                    `
                    INSERT INTO mg_empleado_ubicacion (id_empleado, id_ubicacion) 
                    VALUES ($1, $2)
                    `
                    ,
                    [id_empl, id_ubicacion]);

                // AUDITORIA
                await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                    tabla: 'mg_empleado_ubicacion',
                    usuario: user_name,
                    accion: 'I',
                    datosOriginales: '',
                    datosNuevos: `id_empleado: ${id_empl}, id_ubicacion: ${id_ubicacion}}`,
                    ip,
                    observacion: null
                });

                // FINALIZAR TRANSACCION
                await pool.query('COMMIT');
                res.jsonp({ message: 'Registro guardado.' });
            }

        } catch (error) {
            // REVERTIR TRANSACCION
            await pool.query('ROLLBACK');
            res.status(500).jsonp({ message: 'Error al guardar registro.' });
        }
    }

    // LISTAR REGISTROS DE COORDENADAS GENERALES DE UNA UBICACION   **USADO
    public async ListarRegistroUsuarioU(req: Request, res: Response) {
        const id_ubicacion = req.params.id_ubicacion;
        const UBICACIONES = await pool.query(
            `
            SELECT eu.id AS id_emplu, e.codigo, eu.id_ubicacion, eu.id_empleado, cu.latitud, cu.longitud, 
                cu.descripcion, e.nombre, e.apellido 
            FROM mg_empleado_ubicacion AS eu, mg_cat_ubicaciones AS cu, eu_empleados AS e 
            WHERE eu.id_ubicacion = cu.id AND e.id = eu.id_empleado AND cu.id = $1
            `
            , [id_ubicacion]);
        if (UBICACIONES.rowCount != 0) {
            return res.jsonp(UBICACIONES.rows)
        }
        else {
            res.status(404).jsonp({ text: 'Registro no encontrado.' });
        }
    }

    // ELIMINAR REGISTRO DE COORDENADAS GENERALES DE UBICACION    **USADO
    public async EliminarCoordenadasUsuario(req: Request, res: Response): Promise<Response> {
        try {
            const { user_name, ip } = req.body;
            const { id } = req.params;

            // INICIAR TRANSACCION
            await pool.query('BEGIN');

            // CONSULTAR DATOSORIGINALES
            const ubicacion = await pool.query(`SELECT * FROM mg_empleado_ubicacion WHERE id = $1`, [id]);
            const [datosOriginales] = ubicacion.rows;

            if (!datosOriginales) {
                await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                    tabla: 'mg_empleado_ubicacion',
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

            await pool.query(
                `
                DELETE FROM mg_empleado_ubicacion WHERE id = $1
                `
                , [id]);

            // AUDITORIA
            await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                tabla: 'mg_empleado_ubicacion',
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