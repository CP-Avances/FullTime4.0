import AUDITORIA_CONTROLADOR from '../reportes/auditoriaControlador';
import { ObtenerRutaMensajeNotificacion } from '../../libs/accesoCarpetas';
import { Request, Response } from 'express';
import { QueryResult } from 'pg';
import { DateTime } from 'luxon';
import pool from '../../database';
import path from 'path';
import fs from 'fs';

class MensajesNotificacionesControlador {

    // METODO PARA CONSULTAR MENSAJES DE NOTIFICACIONES    **USADO
    public async MensajeEmpresa(req: Request, res: Response): Promise<any> {
        const { id_empresa } = req.params;
        const DAY = await pool.query(
            `
            SELECT * FROM e_message_notificaciones WHERE id_empresa = $1
            `
            , [id_empresa]);
        if (DAY.rowCount != 0) {
            return res.jsonp(DAY.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'No se encuentran registros.' });
        }
    }

    // METODO PARA REGISTRAR MENSAJE DE NOTIFICACIONES    **USADO
    public async CrearMensajeNotificacion(req: Request, res: Response): Promise<Response> {
        try {
            const { id_empresa, titulo, link, mensaje, user_name, ip, ip_local, tipo } = req.body;

            // INICIAR TRANSACCION
            await pool.query('BEGIN');

            const response: QueryResult = await pool.query(
                `
                    INSERT INTO e_message_notificaciones (id_empresa, asunto, mensaje, link, tipo_notificacion) 
                        VALUES ($1, $2, $3, $4, $5) RETURNING *
                `
                , [id_empresa, titulo, mensaje, link, tipo]);

            const [notificacion] = response.rows;

            // AUDITORIA
            await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                tabla: 'e_message_notificaciones',
                usuario: user_name,
                accion: 'I',
                datosOriginales: '',
                datosNuevos: `{id_empresa: ${id_empresa}, titulo: ${titulo}, mensaje: ${mensaje}, url: ${link}, tipo_notificacion: ${tipo}}`,
                ip: ip,
                ip_local: ip_local,
                observacion: null
            });

            // FINALIZAR TRANSACCION
            await pool.query('COMMIT');

            return res.jsonp([{ message: 'Registro guardado.', id: notificacion.id }]);

        } catch (error) {
            // REVERTIR TRANSACCION
            await pool.query('ROLLBACK');
            console.log('error ', error)
            return res.status(500).jsonp({ text: 'Error al guardar el registro.' });
        }
    }

    // METODO PARA CARGAR IMAGEN DE NOTIFICACION    **USADO
    public async CrearImagenNotificacion(req: Request, res: Response): Promise<Response> {
        try {
            // FECHA DEL SISTEMA
            var fecha = DateTime.now();
            var anio = fecha.toFormat('yyyy');
            var mes = fecha.toFormat('MM');
            var dia = fecha.toFormat('dd');

            let imagen = anio + '_' + mes + '_' + dia + '_' + req.file?.originalname;
            let id = req.params.id_empresa;
            let separador = path.sep;

            const { user_name, ip, ip_local } = req.body;

            // INICIAR TRANSACCION
            await pool.query('BEGIN');

            const notificacion = await pool.query(
                `
                SELECT * FROM e_message_notificaciones WHERE id = $1
                `
                , [id]);

            if (notificacion.rowCount != 0) {

                if (notificacion.rows[0].imagen != null) {

                    let ruta = ObtenerRutaMensajeNotificacion() + separador + notificacion.rows[0].imagen;
                    // VERIFICAR EXISTENCIA DE CARPETA O ARCHIVO
                    fs.access(ruta, fs.constants.F_OK, (err) => {
                        if (!err) {
                            // ELIMINAR DEL SERVIDOR
                            fs.unlinkSync(ruta);
                        }
                    });
                }

                await pool.query(
                    `
                    UPDATE e_message_notificaciones SET imagen = $2 WHERE id = $1
                    `
                    , [id, imagen]);

                // AUDITORIA
                await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                    tabla: 'e_message_notificaciones',
                    usuario: user_name,
                    accion: 'U',
                    datosOriginales: JSON.stringify(notificacion.rows[0]),
                    datosNuevos: `{id: ${id}, img: ${imagen}}`,
                    ip: ip,
                    ip_local: ip_local,
                    observacion: null
                });

                // FINALIZAR TRANSACCION
                await pool.query('COMMIT');
                return res.jsonp({ message: 'Imagen actualizada.' });
            }
            else {
                return res.jsonp({ message: 'No se encuentran resultados.' });
            }

        } catch (error) {
            // REVERTIR TRANSACCION
            await pool.query('ROLLBACK');
            return res.status(500).jsonp({ message: 'Error al actualizar la imagen.' });
        }
    }

    // METODO PARA VER IMAGENES   **USADO  FRONT
    public async ObtenerImagen(req: Request, res: Response): Promise<any> {
        const imagen = req.params.imagen;
        let separador = path.sep;
        let ruta = ObtenerRutaMensajeNotificacion() + separador + imagen;
        fs.access(ruta, fs.constants.F_OK, (err) => {
            if (err) {
            }
            else {
                res.sendFile(path.resolve(ruta));
            }
        });
    }

    // METODO PARA ACTUALIZAR MENSAJE DE NOTIFICACIONES   **USADO
    public async EditarMensajeBirthday(req: Request, res: Response): Promise<Response> {
        try {
            const { titulo, mensaje, link, user_name, ip, ip_local, tipo } = req.body;
            const { id } = req.params;

            // INICIAR TRANSACCION
            await pool.query('BEGIN');

            const response = await pool.query(`SELECT * FROM e_message_notificaciones WHERE id = $1`, [id]);
            const [datos] = response.rows;

            if (!datos) {
                await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                    tabla: 'e_message_notificaciones',
                    usuario: user_name,
                    accion: 'U',
                    datosOriginales: '',
                    datosNuevos: '',
                    ip: ip,
                    ip_local: ip_local,
                    observacion: `Error al actualizar el mensaje de ${tipo}, no se encuentra el registro con id: ${id}`
                });
                // FINALIZAR TRANSACCION
                await pool.query('COMMIT');
                return res.status(404).jsonp({ message: 'No se encuentra el registro.' });
            }

            await pool.query(
                `
                UPDATE e_message_notificaciones SET asunto = $1, mensaje = $2, link = $3 WHERE id = $4
                `
                , [titulo, mensaje, link, id]
            );

            // AUDITORIA
            await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                tabla: 'e_message_notificaciones',
                usuario: user_name,
                accion: 'U',
                datosOriginales: JSON.stringify(datos),
                datosNuevos: JSON.stringify({ titulo, mensaje, link }),
                ip: ip,
                ip_local: ip_local,
                observacion: null
            });

            // FINALIZAR TRANSACCION
            await pool.query('COMMIT');
            return res.jsonp({ message: `Mensaje de ${tipo} actualizado.` });

        } catch (error) {
            // REVERTIR TRANSACCION
            await pool.query('ROLLBACK');
            return res.status(500).jsonp({ message: `Error al actualizar el mensaje de notificación.` });
        }
    }

}

export const MENSAJES_NOTIFICACIONES_CONTROLADOR = new MensajesNotificacionesControlador();

export default MENSAJES_NOTIFICACIONES_CONTROLADOR;