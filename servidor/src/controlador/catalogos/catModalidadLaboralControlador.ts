import { ObtenerRutaLeerPlantillas } from '../../libs/accesoCarpetas';
import { Request, Response } from 'express';
import { QueryResult } from 'pg';
import fs from 'fs';
import path from 'path';
import pool from '../../database';
import excel from 'xlsx';

class ModalidaLaboralControlador {

    public async listaModalidadLaboral(req: Request, res: Response) {
        try {
            const MODALIDAL_LABORAL = await pool.query(
                `
                SELECT * FROM e_cat_modalidad_trabajo ORDER BY descripcion ASC
                `
            );
            if (MODALIDAL_LABORAL.rowCount > 0) {
                return res.jsonp(MODALIDAL_LABORAL.rows)
            } else {
                return res.status(404).jsonp({ text: 'No se encuentran registros.' });
            }
        } catch (error) {
            return res.status(500).jsonp({ message: error });
        }
    }

    public async CrearMadalidadLaboral(req: Request, res: Response): Promise<Response> {
        try {
            const { modalidad } = req.body;
            var VERIFICAR_MODALIDAD = await pool.query(
                `
                SELECT * FROM e_cat_modalidad_trabajo WHERE UPPER(descripcion) = $1
                `
                , [modalidad.toUpperCase()])
            console.log('VERIFICAR_MODALIDAD: ', VERIFICAR_MODALIDAD.rows[0]);
            if (VERIFICAR_MODALIDAD.rows[0] == undefined || VERIFICAR_MODALIDAD.rows[0] == '') {
                // Dar formato a la palabra de modalidad
                const modali = modalidad.charAt(0).toUpperCase() + modalidad.slice(1).toLowerCase();

                const response: QueryResult = await pool.query(
                    `
                    INSERT INTO e_cat_modalidad_trabajo (descripcion) VALUES ($1) RETURNING *
                    `
                    , [modali]);

                const [modalidadLaboral] = response.rows;

                if (modalidadLaboral) {
                    return res.status(200).jsonp({ message: 'Registro guardado.', status: '200' })
                } else {
                    return res.status(404).jsonp({ message: 'No se pudo guardar', status: '400' })
                }
            } else {
                return res.jsonp({ message: 'Ya existe la modalidad laboral', status: '300' })
            }


        }
        catch (error) {
            return res.status(500).jsonp({ message: 'error', status: '500' });
        }
    }

    public async EditarModalidadLaboral(req: Request, res: Response): Promise<Response> {
        try {
            const { id, modalidad } = req.body;
            console.log('id: ', id, 'descripcion: ', modalidad);
            // Dar formato a la palabra de modalidad
            const modali = modalidad.charAt(0).toUpperCase() + modalidad.slice(1).toLowerCase();
            const response: QueryResult = await pool.query(
                `
                UPDATE e_cat_modalidad_trabajo SET descripcion = $2
                WHERE id = $1 RETURNING *
                `
                , [id, modali]);

            const [modalidadLaboral] = response.rows;

            if (modalidadLaboral) {
                return res.status(200).jsonp({ message: 'Registro actualizado.', status: '200' })
            } else {
                return res.status(404).jsonp({ message: 'No se pudo actualizar', status: '400' })
            }
        }
        catch (error) {
            return res.status(500).jsonp({ message: 'error', status: '500' });
        }
    }

    public async eliminarRegistro(req: Request, res: Response) {
        try {
            const id = req.params.id;
            console.log('id: ', id)
            await pool.query(
                `
                DELETE FROM e_cat_modalidad_trabajo WHERE id = $1
            `
                , [id]);
            res.jsonp({ message: 'Registro eliminado.' });

        } catch (error) {
            return res.jsonp({ message: 'error' });
        }
    }

    /** Lectura de los datos de la platilla Modalidad_cargo */
    public async VerfificarPlantillaModalidadLaboral(req: Request, res: Response) {
        try {
            const documento = req.file?.originalname;
            let separador = path.sep;
            let ruta = ObtenerRutaLeerPlantillas() + separador + documento;

            const workbook = excel.readFile(ruta);
            const sheet_name_list = workbook.SheetNames;
            const plantilla_modalidad_laboral = excel.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);
            //const plantilla_cargo = excel.utils.sheet_to_json(workbook.Sheets[sheet_name_list[1]]);

            let data: any = {
                fila: '',
                modalida_laboral: '',
                observacion: ''
            };

            var listModalidad: any = [];
            var duplicados: any = [];
            var mensaje: string = 'correcto';

            // LECTURA DE LOS DATOS DE LA PLANTILLA
            plantilla_modalidad_laboral.forEach(async (dato: any, indice: any, array: any) => {
                var { item, modalida_laboral } = dato;
                //Verificar que el registo no tenga datos vacios
                if ((item != undefined && item != '') &&
                    (modalida_laboral != undefined && modalida_laboral != '')) {
                    data.fila = item;
                    data.modalida_laboral = modalida_laboral;
                    data.observacion = 'no registrada';

                    listModalidad.push(data);
                } else {
                    data.fila = item;
                    data.modalida_laboral = modalida_laboral;
                    data.observacion = 'no registrada';

                    if (data.fila == '' || data.fila == undefined) {
                        data.fila = 'error';
                        mensaje = 'error'
                    }

                    if (modalida_laboral == undefined) {
                        data.modalida_laboral = 'No registrado';
                        data.observacion = 'Modalidad Laboral ' + data.observacion;
                    }



                    listModalidad.push(data);
                }
                data = {};


            });

            // VERIFICAR EXISTENCIA DE CARPETA O ARCHIVO
            fs.access(ruta, fs.constants.F_OK, (err) => {
                if (err) {
                } else {
                    // ELIMINAR DEL SERVIDOR
                    fs.unlinkSync(ruta);
                }
            });


            listModalidad.forEach(async (item: any) => {
                if (item.observacion == 'no registrada') {
                    var VERIFICAR_MODALIDAD = await pool.query(
                        `
                        SELECT * FROM e_cat_modalidad_trabajo WHERE UPPER(descripcion) = $1
                        `
                        , [item.modalida_laboral.toUpperCase()])
                    if (VERIFICAR_MODALIDAD.rows[0] == undefined || VERIFICAR_MODALIDAD.rows[0] == '') {
                        item.observacion = 'ok'
                    } else {
                        item.observacion = 'Ya existe en el sistema'
                    }

                    // Discriminación de elementos iguales
                    if (duplicados.find((p: any) => p.modalida_laboral.toLowerCase() === item.modalida_laboral.toLowerCase()) == undefined) {
                        duplicados.push(item);
                    } else {
                        item.observacion = '1';
                    }

                }

            });

            setTimeout(() => {
                listModalidad.sort((a: any, b: any) => {
                    // Compara los números de los objetos
                    if (a.fila < b.fila) {
                        return -1;
                    }
                    if (a.fila > b.fila) {
                        return 1;
                    }
                    return 0; // Son iguales
                });

                var filaDuplicada: number = 0;

                listModalidad.forEach(async (item: any) => {
                    if (item.observacion == '1') {
                        item.observacion = 'Registro duplicado'
                    }

                    //Valida si los datos de la columna N son numeros.
                    if (typeof item.fila === 'number' && !isNaN(item.fila)) {
                        //Condicion para validar si en la numeracion existe un numero que se repite dara error.
                        if (item.fila == filaDuplicada) {
                            mensaje = 'error';
                        }
                    } else {
                        return mensaje = 'error';
                    }

                    filaDuplicada = item.fila;

                });

                if (mensaje == 'error') {
                    listModalidad = undefined;
                }

                return res.jsonp({ message: mensaje, data: listModalidad });

            }, 1000)

        } catch (error) {
            return res.status(500).jsonp({ message: error });
        }
    }

    /** Registrar plantilla Modalidad_cargo **/
    public async CargarPlantilla(req: Request, res: Response) {
        try {
            const plantilla = req.body;
            console.log('datos Modalidad laboral: ', plantilla);
            var contador = 1;
            var respuesta: any

            plantilla.forEach(async (data: any) => {
                // Datos que se guardaran de la plantilla ingresada
                const { item, modalida_laboral, observacion } = data;
                const modalidad = modalida_laboral.charAt(0).toUpperCase() + modalida_laboral.slice(1).toLowerCase();

                // Registro de los datos de contratos
                const response: QueryResult = await pool.query(
                    `
                    INSERT INTO e_cat_modalidad_trabajo (descripcion) VALUES ($1) RETURNING *
                    `
                    , [modalidad]);

                const [modalidad_la] = response.rows;

                if (contador === plantilla.length) {
                    if (modalidad_la) {
                        return respuesta = res.status(200).jsonp({ message: 'ok' })
                    } else {
                        return respuesta = res.status(404).jsonp({ message: 'error' })
                    }
                }

                contador = contador + 1;

            });


        } catch (error) {
            return res.status(500).jsonp({ message: error });
        }
    }

}

export const modalidaLaboralControlador = new ModalidaLaboralControlador();

export default modalidaLaboralControlador;