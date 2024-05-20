import { Request, Response } from 'express';
import { QueryResult } from 'pg';
import pool from '../../database';
import fs from 'fs';
import path from 'path';
import excel from 'xlsx';
import { ObtenerRutaLeerPlantillas } from '../../libs/accesoCarpetas';

class DiscapacidadControlador {

    // METODO PARA LISTAR TIPO DE DISCAPACIDAD
    public async ListarDiscapacidad(req: Request, res: Response) {
        try {
            const DISCAPACIDAD = await pool.query(
                `
                SELECT * FROM e_cat_discapacidad ORDER BY nombre ASC
                `
            );
            if (DISCAPACIDAD.rowCount > 0) {
                return res.jsonp(DISCAPACIDAD.rows)
            } else {
                return res.status(404).jsonp({ text: 'No se encuentran registros.' });
            }
        } catch (error) {
            return res.status(500).jsonp({ message: error });
        }
    }

    // METODO PARA REGISTRAR UN TIPO DE DISCAPACIDAD
    public async CrearDiscapacidad(req: Request, res: Response): Promise<Response> {
        try {
            const { discapacidad } = req.body;
            var VERIFICAR_DISCAPACIDAD = await pool.query(
                `
                SELECT * FROM e_cat_discapacidad WHERE UPPER(nombre) = $1
                `
                , [discapacidad.toUpperCase()])

            if (VERIFICAR_DISCAPACIDAD.rows[0] == undefined || VERIFICAR_DISCAPACIDAD.rows[0] == '') {
                const discapacidadInsertar = discapacidad.charAt(0).toUpperCase() + discapacidad.slice(1).toLowerCase();
                const response: QueryResult = await pool.query(
                    `
                    INSERT INTO e_cat_discapacidad (nombre) VALUES ($1) RETURNING *
                    `
                    , [discapacidadInsertar]);

                const [discapacidadInsertada] = response.rows;

                if (discapacidadInsertada) {
                    return res.status(200).jsonp({ message: 'Registro guardado.', status: '200' })
                } else {
                    return res.status(404).jsonp({ message: 'Ups!!! algo salio mal.', status: '400' })
                }
            } else {
                return res.jsonp({ message: 'Tipo discapacidad ya existe en el sistema.', status: '300' })
            }
        }
        catch (error) {
            return res.status(500).jsonp({ message: 'error', status: '500' });
        }
    }

    // METODO PARA EDITAR UN TIPO DE DISCAPACIDAD
    public async EditarDiscapacidad(req: Request, res: Response): Promise<Response> {
        try {
            const { id, nombre } = req.body;
            var VERIFICAR_DISCAPACIDAD = await pool.query(
                `
                SELECT * FROM e_cat_discapacidad WHERE UPPER(nombre) = $1 AND NOT id = $2
                `
                , [nombre.toUpperCase(), id])

            if (VERIFICAR_DISCAPACIDAD.rows[0] == undefined || VERIFICAR_DISCAPACIDAD.rows[0] == '') {
                const nombreConFormato = nombre.charAt(0).toUpperCase() + nombre.slice(1).toLowerCase();
                const response: QueryResult = await pool.query(
                    `
                    UPDATE e_cat_discapacidad SET nombre = $2
                    WHERE id = $1 RETURNING *
                    `
                    , [id, nombreConFormato]);
                const [discapacidadEditada] = response.rows;
                if (discapacidadEditada) {
                    return res.status(200).jsonp({ message: 'Registro actualizado.', status: '200' })
                } else {
                    return res.status(404).jsonp({ message: 'Ups!!! algo salio mal.', status: '400' })
                }
            } else {
                return res.jsonp({ message: 'Tipo discapacidad ya existe en el sistema.', status: '300' })
            }
        }
        catch (error) {
            return res.status(500).jsonp({ message: 'error', status: '500' });
        }
    }

    // METODO PARA ELIMINAR UN TIPO DE DISCAPACIDAD
    public async EliminarRegistro(req: Request, res: Response) {
        try {
            const id = req.params.id;
            await pool.query(
                `
                DELETE FROM e_cat_discapacidad WHERE id = $1
                `
                , [id]);
            res.jsonp({ message: 'Registro eliminado.' });

        } catch (error) {
            return res.jsonp({ message: 'error' });
        }
    }

    // METODO PARA REVISAR LOS DATOS DE LA PLANTILLA DENTRO DEL SISTEMA - MENSAJES DE CADA ERROR
    public async RevisarDatos(req: Request, res: Response): Promise<any> {
        try{
            const documento = req.file?.originalname;
            let separador = path.sep;
            let ruta = ObtenerRutaLeerPlantillas() + separador + documento;

            const workbook = excel.readFile(ruta);
            const sheet_name_list = workbook.SheetNames;
            const plantilla = excel.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);

            let data: any = {
                fila: '',
                discapacidad: '',
                observacion: ''
            };

            var listaDiscapacidad: any = [];
            var duplicados: any = [];
            var mensaje: string = 'correcto';

            // LECTURA DE LOS DATOS DE LA PLANTILLA
            plantilla.forEach(async (dato: any, indice: any, array: any) => {
                var { item, discapacidad } = dato;
                // VERIFICAR QUE EL REGISTO NO TENGA DATOS VACIOS
                if ((item != undefined && item != '') &&
                    (discapacidad != undefined && discapacidad != '')) {
                    data.fila = item;
                    data.discapacidad = discapacidad;
                    data.observacion = 'no registrada';

                    listaDiscapacidad.push(data);

                } else {
                    data.fila = item;
                    data.discapacidad = discapacidad;
                    data.observacion = 'no registrada';

                    if (data.fila == '' || data.fila == undefined) {
                        data.fila = 'error';
                        mensaje = 'error'
                    }

                    if (discapacidad == undefined) {
                        data.discapacidad = 'No registrado';
                        data.observacion = 'Discapacidad ' + data.observacion;
                    }

                    listaDiscapacidad.push(data);
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

            // VALIDACINES DE LOS DATOS DE LA PLANTILLA
            listaDiscapacidad.forEach(async (item: any) => {
                if (item.observacion == 'no registrada') {
                    var VERIFICAR_DISCAPACIDAD = await pool.query(
                        `
                        SELECT * FROM e_cat_discapacidad WHERE UPPER(nombre) = $1
                        `
                        , [item.discapacidad.toUpperCase()])
                    if (VERIFICAR_DISCAPACIDAD.rows[0] == undefined || VERIFICAR_DISCAPACIDAD.rows[0] == '') {
                        item.observacion = 'ok'
                    } else {
                        item.observacion = 'Ya existe en el sistema'
                    }

                    // Discriminación de elementos iguales
                    if (duplicados.find((p: any) => p.discapacidad.toLowerCase() === item.discapacidad.toLowerCase()) == undefined) {
                        duplicados.push(item);
                    } else {
                        item.observacion = '1';
                    }
                }
            });

            setTimeout(() => {
                listaDiscapacidad.sort((a: any, b: any) => {
                    // COMPARA LOS NUMEROS DE LOS OBJETOS
                    if (a.fila < b.fila) {
                        return -1;
                    }
                    if (a.fila > b.fila) {
                        return 1;
                    }
                    return 0; // SON IGUALES
                });

                var filaDuplicada: number = 0;

                listaDiscapacidad.forEach(async (item: any) => {
                    if (item.observacion == '1') {
                        item.observacion = 'Registro duplicado'
                    }

                    // VALIDA SI LOS DATOS DE LA COLUMNA N SON NUMEROS.
                    if (typeof item.fila === 'number' && !isNaN(item.fila)) {
                        // CONDICION PARA VALIDAR SI EN LA NUMERACION EXISTE UN NUMERO QUE SE REPITE DARA ERROR.
                        if (item.fila == filaDuplicada) {
                            mensaje = 'error';
                        }
                    } else {
                        return mensaje = 'error';
                    }

                    filaDuplicada = item.fila;

                });

                if (mensaje == 'error') {
                    listaDiscapacidad = undefined;
                }
                return res.jsonp({ message: mensaje, data: listaDiscapacidad });
            }, 1000)


        }catch(error){
            return res.status(500).jsonp({ message: 'Error con el servidor metodo revisar datos', status: '500' });
        }
    }

     // REGISTRAR PLANTILLA MODALIDAD_CARGO 
     public async CargarPlantilla(req: Request, res: Response) {
        try {
            const plantilla = req.body;
            console.log('datos Discapacidad: ', plantilla);
            var contador = 1;
            var respuesta: any

            plantilla.forEach(async (data: any) => {
                // DATOS QUE SE GUARDARAN DE LA PLANTILLA INGRESADA
                const { item, discapacidad, observacion } = data;
                const disca = discapacidad.charAt(0).toUpperCase() + discapacidad.slice(1).toLowerCase();

                // REGISTRO DE LOS DATOS DE MODLAIDAD LABORAL
                const response: QueryResult = await pool.query(
                    `
                    INSERT INTO e_cat_discapacidad (nombre) VALUES ($1) RETURNING *
                    `
                    , [disca]);

                const [discapacidad_emp] = response.rows;

                if (contador === plantilla.length) {
                    if (discapacidad_emp) {
                        return respuesta = res.status(200).jsonp({ message: 'ok', status: '200'})
                    } else {
                        return respuesta = res.status(404).jsonp({ message: 'error', status: '400' })
                    }
                }

                contador = contador + 1;
            
            });

        }catch(error){
            return res.status(500).jsonp({message: 'Error con el servidor metodo CargarPlantilla', status: '500'});
        }
     }

        

}

export const DISCAPACIDADCONTROLADOR = new DiscapacidadControlador();

export default DISCAPACIDADCONTROLADOR;