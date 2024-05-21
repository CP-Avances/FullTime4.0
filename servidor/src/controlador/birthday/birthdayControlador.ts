import { ObtenerRutaBirthday } from '../../libs/accesoCarpetas';
import AUDITORIA_CONTROLADOR from '../auditoria/auditoriaControlador';
import { Request, Response } from 'express';
import moment from 'moment';
import pool from '../../database';
import path from 'path';
import fs from 'fs';

class BirthdayControlador {

    // METODO PARA CONSULTAR MENSAJE DE CUMPLEANIOS
    public async MensajeEmpresa(req: Request, res: Response): Promise<any> {
        const { id_empresa } = req.params;
        const DAY = await pool.query(
            `
            SELECT * FROM e_message_birthday WHERE id_empresa = $1
            `
            , [id_empresa]);
        if (DAY.rowCount > 0) {
            return res.jsonp(DAY.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'No se encuentran registros.' });
        }
    }

    // METODO PARA REGISTRAR MENSAJE DE CUMPLEANIOS
    public async CrearMensajeBirthday(req: Request, res: Response): Promise<Response> {
        try {
            const { id_empresa, titulo, link, mensaje, user_name, ip } = req.body;

            // INICIAR TRANSACCION
            await pool.query('BEGIN');

            await pool.query(
                `
                INSERT INTO e_message_birthday (id_empresa, titulo, mensaje, url) VALUES ($1, $2, $3, $4)
                `
                , [id_empresa, titulo, mensaje, link]);
            
            // AUDITORIA
            AUDITORIA_CONTROLADOR.InsertarAuditoria({
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

            const oneMessage = await pool.query(
                `
                SELECT id FROM e_message_birthday WHERE id_empresa = $1
                `
                , [id_empresa]);
            const idMessageGuardado = oneMessage.rows[0].id;
            return res.jsonp([{ message: 'Registro guardado.', id: idMessageGuardado }]);
        } catch (error) {
            // REVERTIR TRANSACCION
            await pool.query('ROLLBACK');
            return res.status(500).jsonp({ text: 'Error al guardar el registro.' });
        }
    }

    // METODO PARA CARGAR MENSAJE DE CUMPLEANIOS    --**VERIFICADO
    public async CrearImagenEmpleado(req: Request, res: Response): Promise<Response> {
        try {
            // FECHA DEL SISTEMA
            var fecha = moment();
            var anio = fecha.format('YYYY');
            var mes = fecha.format('MM');
            var dia = fecha.format('DD');
    
            let imagen = anio + '_' + mes + '_' + dia + '_' + req.file?.originalname;
            let id = req.params.id_empresa;
            let separador = path.sep;

            const { user_name, ip } = req.body;
    
            const unEmpleado = await pool.query(
                `
                SELECT * FROM e_message_birthday WHERE id = $1
                `
                , [id]);  
            if (unEmpleado.rowCount > 0) {
                unEmpleado.rows.map(async (obj: any) => {
                    if (obj.img != null) {
                        let ruta = ObtenerRutaBirthday() + separador + obj.img;

                        // VERIFICAR EXISTENCIA DE CARPETA O ARCHIVO
                        fs.access(ruta, fs.constants.F_OK, (err) => {
                            if (!err) {
                                // ELIMINAR DEL SERVIDOR
                                fs.unlinkSync(ruta);
                            }
                        });
                    }

                    try {
                        // INICIAR TRANSACCION
                        await pool.query('BEGIN');


                        await pool.query(
                            `
                            UPDATE e_message_birthday SET img = $2 WHERE id = $1
                            `
                            , [id, imagen]);
                        
                        // AUDITORIA
                        AUDITORIA_CONTROLADOR.InsertarAuditoria({
                            tabla: 'e_message_birthday',
                            usuario: user_name,
                            accion: 'U',
                            datosOriginales: JSON.stringify(obj),
                            datosNuevos: `{id: ${id}, img: ${imagen}}`,
                            ip,
                            observacion: null
                        });

                        // FINALIZAR TRANSACCION
                        await pool.query('COMMIT');
                    } catch (error) {
                        // REVERTIR TRANSACCION
                        await pool.query('ROLLBACK');
                        throw error;
                        
                    }
                });
                return res.jsonp({ message: 'Imagen actualizada.' });
            }

            await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                tabla: 'e_message_birthday',
                usuario: user_name,
                accion: 'U',
                datosOriginales: '',
                datosNuevos: '',
                ip,
                observacion: 'Error al actualizar la imagen, no se encuentra el registro.'
            });

            return res.status(404).jsonp({ message: 'No se encuentra el registro.' });
            
        } catch (error) {
            return res.status(500).jsonp({ message: 'Error al actualizar la imagen.' });
            
        }    
        
    }


    // METODO PARA VER IMAGENES
    public async getImagen(req: Request, res: Response): Promise<any> {
        const imagen = req.params.imagen;
        let separador = path.sep;
        let ruta = ObtenerRutaBirthday() + separador + imagen;
        fs.access(ruta, fs.constants.F_OK, (err) => {
            if (err) {
            } else {
                res.sendFile(path.resolve(ruta));
            }
        });
    }


    public async EditarMensajeBirthday(req: Request, res: Response): Promise<Response> {
        try {
            const { titulo, mensaje, link, user_name, ip } = req.body;
            const { id_mensaje } = req.params;
    
            // INICIAR TRANSACCION
            await pool.query('BEGIN');
    
            const response = await pool.query(`SELECT * FROM e_message_birthday WHERE id = $1`
                , [id_mensaje]);
            const [datos] = response.rows;
    
            if (!datos) {
                await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                    tabla: 'e_message_birthday',
                    usuario: user_name,
                    accion: 'U',
                    datosOriginales: '',
                    datosNuevos: '',
                    ip,
                    observacion: `Error al actualizar el mensaje de cumpleaños, no se encuentra el registro con id: ${id_mensaje}`
                });
                // FINALIZAR TRANSACCION
                await pool.query('COMMIT');
                return res.status(404).jsonp({ message: 'No se encuentra el registro.' });
            }
    
            await pool.query(
                `
                UPDATE e_message_birthday SET titulo = $1, mensaje = $2, url = $3 WHERE id = $4
                `
                , [titulo, mensaje, link, id_mensaje]);
            
            // AUDITORIA
            AUDITORIA_CONTROLADOR.InsertarAuditoria({
                tabla: 'e_message_birthday',
                usuario: user_name,
                accion: 'U',
                datosOriginales: JSON.stringify(datos),
                datosNuevos: `{titulo: ${titulo}, mensaje: ${mensaje}, url: ${link}}`,
                ip,
                observacion: null
            });
    
            // FINALIZAR TRANSACCION|
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