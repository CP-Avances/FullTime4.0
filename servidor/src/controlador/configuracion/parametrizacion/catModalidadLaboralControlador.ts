import AUDITORIA_CONTROLADOR from '../../reportes/auditoriaControlador';
import { ObtenerIndicePlantilla, ObtenerRutaLeerPlantillas } from '../../../libs/accesoCarpetas';
import { Request, Response } from 'express';
import { QueryResult } from 'pg';
import fs from 'fs';
import path from 'path';
import pool from '../../../database';
import Excel from 'exceljs';

class ModalidaLaboralControlador {

    // METODO PARA LISTAR REGISTROS DE MODALIDAD LABORAL   ** USADO
    public async ListaModalidadLaboral(req: Request, res: Response) {
        try {
            const MODALIDAL_LABORAL = await pool.query(
                `
                    SELECT * FROM e_cat_modalidad_trabajo ORDER BY descripcion ASC
                `
            );
            if (MODALIDAL_LABORAL.rowCount != 0) {
                return res.jsonp(MODALIDAL_LABORAL.rows)
            } else {
                return res.status(404).jsonp({ text: 'No se encuentran registros.' });
            }
        } catch (error) {
            return res.status(500).jsonp({ message: error });
        }
    }

    // METODO PARA REGISTRAR MODALIDAD LABORAL   **USADO
    public async CrearModalidadLaboral(req: Request, res: Response): Promise<Response> {
        try {
            const { modalidad, user_name, ip, ip_local } = req.body;
            var VERIFICAR_MODALIDAD = await pool.query(
                `
                SELECT * FROM e_cat_modalidad_trabajo WHERE UPPER(descripcion) = $1
                `
                , [modalidad.toUpperCase()])

            if (VERIFICAR_MODALIDAD.rows[0] == undefined || VERIFICAR_MODALIDAD.rows[0] == '') {

                const modali = modalidad.charAt(0).toUpperCase() + modalidad.slice(1).toLowerCase();

                // INICIAR TRANSACCION
                await pool.query('BEGIN');

                const response: QueryResult = await pool.query(
                    `
                    INSERT INTO e_cat_modalidad_trabajo (descripcion) VALUES ($1) RETURNING *
                    `
                    , [modali]);

                const [modalidadLaboral] = response.rows;

                // REGISTRAR AUDITORIA
                await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                    tabla: 'e_cat_modalidad_trabajo',
                    usuario: user_name,
                    accion: 'I',
                    datosOriginales: '',
                    datosNuevos: JSON.stringify(modalidadLaboral),
                    ip: ip,
                    ip_local: ip_local,
                    observacion: null
                });

                // FINALIZAR TRANSACCION
                await pool.query('COMMIT');


                if (modalidadLaboral) {
                    return res.status(200).jsonp({ message: 'Registro guardado.', status: '200' })
                } else {
                    return res.status(404).jsonp({ message: 'No se pudo guardar', status: '400' })
                }
            } else {
                return res.jsonp({ message: 'Modalidad Laboral ya existe en el sistema.', status: '300' })
            }
        }
        catch (error) {
            // ROLLBACK SI HAY ERROR
            await pool.query('ROLLBACK');
            return res.status(500).jsonp({ message: 'error', status: '500' });
        }
    }

    // METODO PARA EDITAR MODALIDAD LABORAL    **USADO
    public async EditarModalidadLaboral(req: Request, res: Response): Promise<Response> {
        try {
            const { id, modalidad, user_name, ip, ip_local } = req.body;
            const modali = modalidad.charAt(0).toUpperCase() + modalidad.slice(1).toLowerCase();

            const modalExiste = await pool.query(
                `
                    SELECT * FROM e_cat_modalidad_trabajo WHERE UPPER(descripcion) = $1 AND NOT id = $2
                `
                , [modali.toUpperCase(), id]);

            const consulta = await pool.query(
                `
                    SELECT * FROM e_cat_modalidad_trabajo WHERE id = $1
                `
                , [id]);

            const [datosOriginales] = consulta.rows;
            if (!datosOriginales) {
                await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                    tabla: 'e_cat_modalidad_trabajo',
                    usuario: user_name,
                    accion: 'U',
                    datosOriginales: '',
                    datosNuevos: '',
                    ip: ip,
                    ip_local: ip_local,
                    observacion: `Error al actualizar el registro con id ${id}. No existe el registro en la base de datos.`
                });

                // FINALIZAR TRANSACCION
                await pool.query('COMMIT');
                return res.status(404).jsonp({ message: 'Registro no encontrado.' });
            }

            if (modalExiste.rows[0] != undefined && modalExiste.rows[0].descripcion != '' && modalExiste.rows[0].descripcion != null) {
                return res.status(200).jsonp({ message: 'Modalidad Laboral ya esiste en el sistema.', status: '300' })

            }
            else {
                // INICIAR TRANSACCION
                await pool.query('BEGIN');

                const response: QueryResult = await pool.query(
                    `
                        UPDATE e_cat_modalidad_trabajo SET descripcion = $2
                        WHERE id = $1 RETURNING *
                    `
                    , [id, modali]);

                const [modalidadLaboral] = response.rows;

                // REGISTRAR AUDITORIA
                await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                    tabla: 'e_cat_modalidad_trabajo',
                    usuario: user_name,
                    accion: 'U',
                    datosOriginales: JSON.stringify(datosOriginales),
                    datosNuevos: JSON.stringify(modalidadLaboral),
                    ip: ip,
                    ip_local: ip_local,
                    observacion: null
                });

                // FINALIZAR TRANSACCION
                await pool.query('COMMIT');

                if (modalidadLaboral) {
                    return res.status(200).jsonp({ message: 'Registro actualizado.', status: '200' })
                } else {
                    return res.status(404).jsonp({ message: 'Ups! algo slaio mal.', status: '400' })
                }
            }
        }
        catch (error) {
            // ROLLBACK SI HAY ERROR
            await pool.query('ROLLBACK');
            return res.status(500).jsonp({ message: 'error', status: '500' });
        }
    }

    // METODO PARA ELIMINAR REGISTRO    **USADO
    public async EliminarRegistro(req: Request, res: Response) {
        try {
            const id = req.params.id;
            const { user_name, ip, ip_local } = req.body;

            // INICIAR TRANSACCION
            await pool.query('BEGIN');

            // CONSULTAR DATOS ANTES DE ELIMINAR
            const modalidad = await pool.query(
                `
                SELECT * FROM e_cat_modalidad_trabajo WHERE id = $1
                `
                , [id]);

            const [modalidadLaboral] = modalidad.rows;

            if (!modalidadLaboral) {
                await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                    tabla: 'e_cat_modalidad_trabajo',
                    usuario: user_name,
                    accion: 'D',
                    datosOriginales: '',
                    datosNuevos: '',
                    ip: ip,
                    ip_local: ip_local,
                    observacion: `Error al eliminar el registro con id: ${id}, no se encuentra el registro.`
                });

                // FINALIZAR TRANSACCION
                await pool.query('COMMIT');
                return res.status(404).jsonp({ message: 'No se encuentra el registro.' });
            }

            await pool.query(
                `
                DELETE FROM e_cat_modalidad_trabajo WHERE id = $1
                `
                , [id]);

            // REGISTRAR AUDITORIA
            await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                tabla: 'e_cat_modalidad_trabajo',
                usuario: user_name,
                accion: 'D',
                datosOriginales: JSON.stringify(modalidadLaboral),
                datosNuevos: '',
                ip: ip,
                ip_local: ip_local,
                observacion: null
            });

            // FINALIZAR TRANSACCION
            await pool.query('COMMIT');
            res.jsonp({ message: 'Registro eliminado.' });

        } catch (error) {
            // ROLLBACK SI HAY ERROR
            await pool.query('ROLLBACK');
            return res.jsonp({ message: 'error' });
        }
    }

    // LECTURA DE LOS DATOS DE LA PLATILLA MODALIDAD_CARGO    **USADO
    public async VerfificarPlantillaModalidadLaboral(req: Request, res: Response) {
        try {
            const documento = req.file?.originalname;
            let separador = path.sep;
            let ruta = ObtenerRutaLeerPlantillas() + separador + documento;
            const workbook = new Excel.Workbook();
            await workbook.xlsx.readFile(ruta);
            let verificador = ObtenerIndicePlantilla(workbook, 'MODALIDAD_LABORAL');
            if (verificador === false) {
                return res.jsonp({ message: 'no_existe', data: undefined });
            }
            else {
                const sheet_name_list = workbook.worksheets.map(sheet => sheet.name);
                const plantilla_modalidad_laboral = workbook.getWorksheet(sheet_name_list[verificador]);
                let data: any = {
                    fila: '',
                    modalida_laboral: '',
                    observacion: ''
                };
                var listModalidad: any = [];
                var duplicados: any = [];
                var mensaje: string = 'correcto';
                if (plantilla_modalidad_laboral) {
                    // SUPONIENDO QUE LA PRIMERA FILA SON LAS CABECERAS
                    const headerRow = plantilla_modalidad_laboral.getRow(1);
                    const headers: any = {};
                    // CREAR UN MAPA CON LAS CABECERAS Y SUS POSICIONES, ASEGURANDO QUE LAS CLAVES ESTEN EN MAYUSCULAS
                    headerRow.eachCell((cell: any, colNumber) => {
                        headers[cell.value.toString().toUpperCase()] = colNumber;
                    });
                    // VERIFICA SI LAS CABECERAS ESENCIALES ESTAN PRESENTES
                    if (!headers['ITEM'] || !headers['MODALIDAD_LABORAL']) {
                        return res.jsonp({ message: 'Cabeceras faltantes', data: undefined });
                    }
                    // LECTURA DE LOS DATOS DE LA PLANTILLA
                    plantilla_modalidad_laboral.eachRow((row, rowNumber) => {
                        // SALTAR LA FILA DE LAS CABECERAS
                        if (rowNumber === 1) return;

                        // LEER LOS DATOS SEGUN LAS COLUMNAS ENCONTRADAS
                        let ITEM = row.getCell(headers['ITEM']).value;
                        let MODALIDAD_LABORAL = row.getCell(headers['MODALIDAD_LABORAL']).value;

                        // VERIFICAR QUE EL REGISTO NO TENGA DATOS VACIOS
                        if ((ITEM != undefined && ITEM != '') &&
                            (MODALIDAD_LABORAL != undefined && MODALIDAD_LABORAL != '')) {

                            data.fila = ITEM;
                            data.modalida_laboral = MODALIDAD_LABORAL;
                            data.observacion = 'no registrada';

                            //USAMOS TRIM PARA ELIMINAR LOS ESPACIOS AL INICIO Y AL FINAL EN BLANCO.
                            data.modalida_laboral = data.modalida_laboral.trim();
                            data.observacion = data.observacion.trim();

                            listModalidad.push(data);
                        } else {
                            data.fila = ITEM;
                            data.modalida_laboral = MODALIDAD_LABORAL;
                            data.observacion = 'no registrada';

                            if (data.fila == '' || data.fila == undefined) {
                                data.fila = 'error';
                                mensaje = 'error'
                            }

                            if (MODALIDAD_LABORAL == undefined) {
                                data.modalida_laboral = 'No registrado';
                                data.observacion = 'Modalidad Laboral ' + data.observacion;
                            }


                            //USAMOS TRIM PARA ELIMINAR LOS ESPACIOS AL INICIO Y AL FINAL EN BLANCO.
                            data.modalida_laboral = data.modalida_laboral.trim();
                            data.observacion = data.observacion.trim();

                            listModalidad.push(data);
                        }
                        data = {};
                    });
                }
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

                        // DISCRIMINACIÓN DE ELEMENTOS IGUALES
                        if (duplicados.find((p: any) => p.modalida_laboral.toLowerCase() === item.modalida_laboral.toLowerCase()) == undefined) {
                            duplicados.push(item);
                        } else {
                            item.observacion = '1';
                        }
                    }
                });

                setTimeout(() => {
                    listModalidad.sort((a: any, b: any) => {
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

                    listModalidad.forEach(async (item: any) => {
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
                        listModalidad = undefined;
                    }
                    return res.jsonp({ message: mensaje, data: listModalidad });
                }, 1000)
            }
        } catch (error) {
            return res.status(500).jsonp({ message: error });
        }
    }

    // REGISTRAR PLANTILLA MODALIDAD_LABORAL    **USADO
    public async CargarPlantilla(req: Request, res: Response) {
        const { plantilla, user_name, ip, ip_local } = req.body;
        let error: boolean = false;

        for (const data of plantilla) {
            try {
                // DATOS QUE SE GUARDARAN DE LA PLANTILLA INGRESADA
                const { modalida_laboral } = data;
                const modalidad = modalida_laboral.charAt(0).toUpperCase() + modalida_laboral.slice(1).toLowerCase();

                // INICIO DE TRANSACCION
                await pool.query('BEGIN');

                // REGISTRO DE LOS DATOS DE MODLAIDAD LABORAL
                const response: QueryResult = await pool.query(
                    `
                    INSERT INTO e_cat_modalidad_trabajo (descripcion) VALUES ($1) RETURNING *
                    `
                    , [modalidad]);

                const [modalidad_la] = response.rows;

                // REGISTRAR AUDITORIA
                await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                    tabla: 'e_cat_modalidad_trabajo',
                    usuario: user_name,
                    accion: 'I',
                    datosOriginales: '',
                    datosNuevos: JSON.stringify(modalidad_la),
                    ip: ip,
                    ip_local: ip_local,
                    observacion: null
                });

                // FINALIZAR TRANSACCION
                await pool.query('COMMIT');

            } catch (error) {
                // REVERTIR TRANSACCION
                await pool.query('ROLLBACK');
                error = true;
            }
        }

        if (error) {
            return res.status(500).jsonp({ message: 'error' });
        }

        return res.status(200).jsonp({ message: 'ok' });
    }

}

export const modalidaLaboralControlador = new ModalidaLaboralControlador();

export default modalidaLaboralControlador;