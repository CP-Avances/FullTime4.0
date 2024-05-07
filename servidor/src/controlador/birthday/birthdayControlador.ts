import { ObtenerRutaBirthday } from '../../libs/accesoCarpetas';
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
    public async CrearMensajeBirthday(req: Request, res: Response): Promise<void> {
        const { id_empresa, titulo, link, mensaje } = req.body;
        await pool.query(
            `
            INSERT INTO e_message_birthday (id_empresa, asunto, mensaje, link) VALUES ($1, $2, $3, $4)
            `
            , [id_empresa, titulo, mensaje, link]);

        const oneMessage = await pool.query(
            `
            SELECT id FROM message_birthday WHERE id_empresa = $1
            `
            , [id_empresa]);

        const idMessageGuardado = oneMessage.rows[0].id;
        res.jsonp([{ message: 'Registro guardado.', id: idMessageGuardado }]);
    }

    // METODO PARA CARGAR MENSAJE DE CUMPLEANIOS    --**VERIFICADO
    public async CrearImagenEmpleado(req: Request, res: Response): Promise<void> {
        // FECHA DEL SISTEMA
        var fecha = moment();
        var anio = fecha.format('YYYY');
        var mes = fecha.format('MM');
        var dia = fecha.format('DD');

        let imagen = anio + '_' + mes + '_' + dia + '_' + req.file?.originalname;
        let id = req.params.id_empresa;
        let separador = path.sep;

        const unEmpleado = await pool.query(
            `
            SELECT * FROM e_message_birthday WHERE id = $1
            `
            , [id]);
        if (unEmpleado.rowCount > 0) {
            unEmpleado.rows.map(async (obj: any) => {
                if (obj.img != null) {

                    try {

                        let ruta = ObtenerRutaBirthday() + separador + obj.img;

                        // VERIFICAR EXISTENCIA DE CARPETA O ARCHIVO
                        fs.access(ruta, fs.constants.F_OK, (err) => {
                            if (err) {
                            } else {
                                // ELIMINAR DEL SERVIDOR
                                fs.unlinkSync(ruta);
                            }
                        });
                        await pool.query(
                            `
                            UPDATE e_message_birthday SET imagen = $2 WHERE id = $1
                            `
                            , [id, imagen]);
                        res.jsonp({ message: 'Imagen actualizada.' });

                    } catch (error) {
                        await pool.query(
                            `
                            UPDATE e_message_birthday SET imagen = $2 WHERE id = $1
                            `
                            , [id, imagen]);
                        res.jsonp({ message: 'Imagen actualizada.' });
                    }

                } else {
                    await pool.query(
                        `
                        UPDATE e_message_birthday SET imagen = $2 WHERE id = $1
                        `
                        , [id, imagen]);
                    res.jsonp({ message: 'Imagen actualizada.' });
                }
            });
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


    public async EditarMensajeBirthday(req: Request, res: Response): Promise<void> {
        const { titulo, mensaje, link } = req.body;
        const { id_mensaje } = req.params;
        await pool.query(
            `
            UPDATE e_message_birthday SET asunto = $1, mensaje = $2, link = $3 WHERE id = $4
            `
            , [titulo, mensaje, link, id_mensaje]);
        res.jsonp({ message: 'Mensaje de cumpleaños actualizado.' });
    }

}

export const BIRTHDAY_CONTROLADOR = new BirthdayControlador();

export default BIRTHDAY_CONTROLADOR;