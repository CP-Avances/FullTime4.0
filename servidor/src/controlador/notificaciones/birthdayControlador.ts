import AUDITORIA_CONTROLADOR from '../reportes/auditoriaControlador';
import { ObtenerRutaBirthday } from '../../libs/accesoCarpetas';
import { Request, Response } from 'express';
import { QueryResult } from 'pg';
import { DateTime } from 'luxon';
import pool from '../../database';
import path from 'path';
import fs from 'fs';

class BirthdayControlador {

    // METODO PARA CONSULTAR MENSAJE DE CUMPLEANIOS    **USADO
    public async MensajeEmpresa(req: Request, res: Response): Promise<any> {
        const { id_empresa } = req.params;
        const DAY = await pool.query(
            `
            SELECT * FROM e_message_birthday WHERE id_empresa = $1
            `
            , [id_empresa]);
        if (DAY.rowCount != 0) {
            return res.jsonp(DAY.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'No se encuentran registros.' });
        }
    }

    // METODO PARA REGISTRAR MENSAJE DE CUMPLEANIOS    **USADO
    public async CrearMensajeBirthday(req: Request, res: Response): Promise<Response> {
        try {
            const { id_empresa, titulo, link, mensaje, user_name, ip } = req.body;

            // INICIAR TRANSACCION
            await pool.query('BEGIN');

            const response: QueryResult = await pool.query(
                `
                INSERT INTO e_message_birthday (id_empresa, asunto, mensaje, link) VALUES ($1, $2, $3, $4) RETURNING *
                `
                , [id_empresa, titulo, mensaje, link]);

            const [cumpleanios] = response.rows;

            // AUDITORIA
            await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                tabla: 'e_message_birthday',
                usuario: user_name,
                accion: 'I',
                datosOriginales: '',
                datosNuevos: `{id_empresa: ${id_empresa}, titulo: ${titulo}, mensaje: ${mensaje}, url: ${link}}`,
                ip,
                observacion: null
            });

            // FINALIZAR TRANSACCION
            await pool.query('COMMIT');

            return res.jsonp([{ message: 'Registro guardado.', id: cumpleanios.id }]);

        } catch (error) {
            // REVERTIR TRANSACCION
            await pool.query('ROLLBACK');
            return res.status(500).jsonp({ text: 'Error al guardar el registro.' });
        }
    }

    // METODO PARA CARGAR MENSAJE DE CUMPLEANIOS    **USADO
    public async CrearImagenCumpleanios(req: Request, res: Response): Promise<Response> {
        try {
            // FECHA DEL SISTEMA
            var fecha = DateTime.now();
            var anio = fecha.toFormat('yyyy');
            var mes = fecha.toFormat('MM');
            var dia = fecha.toFormat('dd');

            let imagen = anio + '_' + mes + '_' + dia + '_' + req.file?.originalname;
            let id = req.params.id_empresa;
            let separador = path.sep;

            const { user_name, ip } = req.body;

            // INICIAR TRANSACCION
            await pool.query('BEGIN');

            const cumpleanios = await pool.query(
                `
                SELECT * FROM e_message_birthday WHERE id = $1
                `
                , [id]);

            if (cumpleanios.rowCount != 0) {

                if (cumpleanios.rows[0].imagen != null) {

                    let ruta = ObtenerRutaBirthday() + separador + cumpleanios.rows[0].imagen;
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
                    UPDATE e_message_birthday SET imagen = $2 WHERE id = $1
                    `
                    , [id, imagen]);

                // AUDITORIA
                await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                    tabla: 'e_message_birthday',
                    usuario: user_name,
                    accion: 'U',
                    datosOriginales: JSON.stringify(cumpleanios.rows[0]),
                    datosNuevos: `{id: ${id}, img: ${imagen}}`,
                    ip,
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
        let ruta = ObtenerRutaBirthday() + separador + imagen;
        fs.access(ruta, fs.constants.F_OK, (err) => {
            if (err) {
            }
            else {
                res.sendFile(path.resolve(ruta));
            }
        });
    }

    // METODO PARA ACTUALIZAR MENSAJE DE CUMPLEAÑOS   **USADO
    public async EditarMensajeBirthday(req: Request, res: Response): Promise<Response> {
        try {
            const { titulo, mensaje, link, user_name, ip } = req.body;
            const { id } = req.params;

            // INICIAR TRANSACCION
            await pool.query('BEGIN');

            const response = await pool.query(`SELECT * FROM e_message_birthday WHERE id = $1`, [id]);
            const [datos] = response.rows;

            if (!datos) {
                await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                    tabla: 'e_message_birthday',
                    usuario: user_name,
                    accion: 'U',
                    datosOriginales: '',
                    datosNuevos: '',
                    ip,
                    observacion: `Error al actualizar el mensaje de cumpleaños, no se encuentra el registro con id: ${id}`
                });
                // FINALIZAR TRANSACCION
                await pool.query('COMMIT');
                return res.status(404).jsonp({ message: 'No se encuentra el registro.' });
            }

            await pool.query(
                `
                UPDATE e_message_birthday SET asunto = $1, mensaje = $2, link = $3 WHERE id = $4
                `
                , [titulo, mensaje, link, id]
            );

            // AUDITORIA
            await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                tabla: 'e_message_birthday',
                usuario: user_name,
                accion: 'U',
                datosOriginales: JSON.stringify(datos),
                datosNuevos: JSON.stringify({ titulo, mensaje, link }),
                ip,
                observacion: null
            });

            // FINALIZAR TRANSACCION
            await pool.query('COMMIT');
            return res.jsonp({ message: 'Mensaje de cumpleaños actualizado.' });

        } catch (error) {
            // REVERTIR TRANSACCION
            await pool.query('ROLLBACK');
            return res.status(500).jsonp({ message: 'Error al actualizar el mensaje de cumpleaños.' });
        }
    }

}

export const BIRTHDAY_CONTROLADOR = new BirthdayControlador();

export default BIRTHDAY_CONTROLADOR;