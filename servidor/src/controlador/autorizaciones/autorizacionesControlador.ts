import { Request, Response } from 'express';
import { AUDITORIA_CONTROLADOR } from '../auditoria/auditoriaControlador';
import pool from '../../database';

class AutorizacionesControlador {

    // METODO PARA BUSCAR AUTORIZACIONES DE PERMISOS
    public async ObtenerAutorizacionPermiso(req: Request, res: Response) {
        const id = req.params.id_permiso
        const AUTORIZACIONES = await pool.query(
            `
            SELECT * FROM ecm_autorizaciones WHERE id_permiso = $1
            `
            , [id]);
        if (AUTORIZACIONES.rowCount != 0) {
            return res.jsonp(AUTORIZACIONES.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'No se encuentran registros.' });
        }
    }

    public async ObtenerAutorizacionByVacacion(req: Request, res: Response) {
        const id = req.params.id_vacacion
        const AUTORIZACIONES = await pool.query(
            `
            SELECT * FROM ecm_autorizaciones WHERE id_vacacion = $1
            `
            , [id]);
        if (AUTORIZACIONES.rowCount != 0) {
            return res.jsonp(AUTORIZACIONES.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'No se encuentran registros.' });
        }
    }


    public async ObtenerAutorizacionByHoraExtra(req: Request, res: Response) {
        const id = req.params.id_hora_extra
        const AUTORIZACIONES = await pool.query(
            `
            SELECT * FROM ecm_autorizaciones WHERE id_hora_extra = $1
            `
            , [id]);
        if (AUTORIZACIONES.rowCount != 0) {
            return res.jsonp(AUTORIZACIONES.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'No se encuentran registros.' });
        }
    }

    public async CrearAutorizacion(req: Request, res: Response): Promise<Response> {
        try {
            const { orden, estado, id_departamento, id_permiso, id_vacacion, id_hora_extra,
                id_plan_hora_extra, id_documento, user_name, ip } = req.body;

            // INICIAR TRANSACCION
            await pool.query('BEGIN');

            const autorizacion = await pool.query(
                `
                INSERT INTO ecm_autorizaciones (orden, estado, id_departamento, 
                    id_permiso, id_vacacion, id_hora_extra, id_plan_hora_extra, id_autoriza_estado) 
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *
                `,
                [orden, estado, id_departamento, id_permiso, id_vacacion, id_hora_extra,
                    id_plan_hora_extra, id_documento]);
            
            const [datosNuevos] = autorizacion.rows;

            // REGISTRAR AUDITORIA
            await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                tabla: 'ecm_autorizaciones',
                usuario: user_name,
                accion: 'I',
                datosOriginales: '',
                datosNuevos: JSON.stringify(datosNuevos),
                ip: ip,
                observacion: null
            });

            // FINALIZAR TRANSACCION
            await pool.query('COMMIT');
            return res.jsonp({ message: 'Autorizacion guardado.' });
        } catch (error) {
            // CANCELAR TRANSACCION
            await pool.query('ROLLBACK');
            return res.status(500).jsonp({ text: 'error' });
        }
    }

    public async ActualizarEstadoAutorizacionPermiso(req: Request, res: Response): Promise<Response> {
        try {
            const { id_documento, estado, id_permiso, user_name, ip } = req.body;

            // INICIAR TRANSACCION
            await pool.query('BEGIN');

            // CONSULTAR DATOS ANTES DE ACTUALIZAR PARA PODER REGISTRAR AUDITORIA
            const response = await pool.query('SELECT * FROM ecm_autorizaciones WHERE id_permiso = $1', [id_permiso]);
            const [datos] = response.rows;

            if (!datos) {
                await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                    tabla: 'ecm_autorizaciones',
                    usuario: user_name,
                    accion: 'U',
                    datosOriginales: '',
                    datosNuevos: '',
                    ip: ip,
                    observacion: `Error al actualizar el registro de autorizaciones con id_permiso: ${id_permiso}`
                });
            }
    
            const actualizacion = await pool.query(
                `
                UPDATE ecm_autorizaciones SET estado = $1, id_autoriza_estado = $2 WHERE id_permiso = $3 RETURNING *
                `
                ,
                [estado, id_documento, id_permiso]);

            const [datosNuevos] = actualizacion.rows;

            // REGISTRAR AUDITORIA
            await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                tabla: 'ecm_autorizaciones',
                usuario: user_name,
                accion: 'U',
                datosOriginales: JSON.stringify(datos),
                datosNuevos: JSON.stringify(datosNuevos),
                ip: ip,
                observacion: null
            });

            // FINALIZAR TRANSACCION
            await pool.query('COMMIT');
            return res.jsonp({ message: 'Autorizacion guardado' });
        } catch (error) {
            // CANCELAR TRANSACCION
            await pool.query('ROLLBACK');
            return res.status(500).jsonp({ text: 'error' });
        }
    }

    /** ***************************************************************************************************** ** 
     ** **                METODO DE CAMBIO DE ESTADO DE APROBACIONES DE SOLICITUDES                        ** ** 
     ** ***************************************************************************************************** **/

    // METODO DE APROBACION DE SOLICITUD DE PERMISO
    public async ActualizarEstadoSolicitudes(req: Request, res: Response): Promise<Response> {

        try {
            const id = req.params.id;
            const { id_documento, estado, user_name, ip } = req.body;

            // INICIAR TRANSACCION
            await pool.query('BEGIN');

            // CONSULTAR DATOS ANTES DE ACTUALIZAR PARA PODER REGISTRAR AUDITORIA
            const response = await pool.query('SELECT * FROM ecm_autorizaciones WHERE id = $1', [id]);
            const [datos] = response.rows;

            if (!datos) {
                await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                    tabla: 'ecm_autorizaciones',
                    usuario: user_name,
                    accion: 'U',
                    datosOriginales: '',
                    datosNuevos: '',
                    ip: ip,
                    observacion: `Error al actualizar el registro de autorizaciones con id: ${id}`
                });

                // FINALIZAR TRANSACCION
                await pool.query('COMMIT');
                res.status(404).jsonp({ text: 'error' });
            }
    
            const actualizacion = await pool.query(
                `
                UPDATE ecm_autorizaciones SET estado = $1, id_autoriza_estado = $2 
                WHERE id = $3
                `
                , [estado, id_documento, id]);
            
            const [datosNuevos] = actualizacion.rows;

            // REGISTRAR AUDITORIA
            await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                tabla: 'ecm_autorizaciones',
                usuario: user_name,
                accion: 'U',
                datosOriginales: JSON.stringify(datos),
                datosNuevos: JSON.stringify(datosNuevos),
                ip: ip,
                observacion: null
            });

            // FINALIZAR TRANSACCION
            await pool.query('COMMIT');
            return res.jsonp({ message: 'Registro exitoso.' });
        } catch (error) {
            // CANCELAR TRANSACCION
            await pool.query('ROLLBACK');
            return res.status(500).jsonp({ text: 'error' });
            
        }
    }
}

export const AUTORIZACION_CONTROLADOR = new AutorizacionesControlador();

export default AUTORIZACION_CONTROLADOR;