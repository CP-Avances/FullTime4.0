import { ObtenerIndicePlantilla, ObtenerRutaLeerPlantillas } from '../../../libs/accesoCarpetas';
import { Request, Response } from 'express';
import { QueryResult } from 'pg';
import AUDITORIA_CONTROLADOR from '../../reportes/auditoriaControlador';
import pool from '../../../database';
import fs from 'fs';
import path from 'path';
import Excel from 'exceljs';

class VacunaControlador {

    // METODO PARA LISTAR TIPO VACUNAS    **USADO
    public async ListaVacuna(req: Request, res: Response) {
        try {
            const VACUNA = await pool.query(
                `
                SELECT * FROM e_cat_vacuna ORDER BY nombre ASC
                `
            );
            if (VACUNA.rowCount != 0) {
                return res.jsonp(VACUNA.rows)
            } else {
                return res.status(404).jsonp({ text: 'No se encuentran registros.' });
            }
        } catch (error) {
            return res.status(500).jsonp({ message: error });
        }
    }

    // METODO PARA REGISTRAR TIPO VACUNA   **USADO
    public async CrearVacuna(req: Request, res: Response): Promise<Response> {
        try {
            const { vacuna, user_name, ip, ip_local } = req.body;
            var VERIFICAR_VACUNA = await pool.query(
                `
                SELECT * FROM e_cat_vacuna WHERE UPPER(nombre) = $1
                `
                , [vacuna.toUpperCase()])

            if (VERIFICAR_VACUNA.rows[0] == undefined || VERIFICAR_VACUNA.rows[0] == '') {

                const vacunaInsertar = vacuna.charAt(0).toUpperCase() + vacuna.slice(1).toLowerCase();

                // INICIAR TRANSACCION
                await pool.query('BEGIN');

                const response: QueryResult = await pool.query(
                    `
                    INSERT INTO e_cat_vacuna (nombre) VALUES ($1) RETURNING *
                    `
                    , [vacunaInsertar]);

                const [vacunaInsertada] = response.rows;

                // AUDITORIA
                await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                    tabla: 'e_cat_vacuna',
                    usuario: user_name,
                    accion: 'I',
                    datosOriginales: '',
                    datosNuevos: JSON.stringify(vacunaInsertada),
                    ip: ip,
                    ip_local: ip_local,
                    observacion: null
                })

                // FINALIZAR TRANSACCION
                await pool.query('COMMIT');

                if (vacunaInsertada) {
                    return res.status(200).jsonp({ message: 'Registro guardado.', status: '200' })
                } else {
                    return res.status(404).jsonp({ message: 'No se pudo guardar', status: '400' })
                }
            } else {
                return res.jsonp({ message: 'Tipo vacuna ya existe en el sistema.', status: '300' })
            }
        }
        catch (error) {
            // ROLLBACK
            await pool.query('ROLLBACK');
            return res.status(500).jsonp({ message: 'error', status: '500' });
        }
    }

    // METODO PARA EDITAR VACUNA    **USADO
    public async EditarVacuna(req: Request, res: Response): Promise<Response> {
        try {
            const { id, nombre, user_name, ip, ip_local } = req.body;

            var VERIFICAR_VACUNA = await pool.query(
                `
                SELECT * FROM e_cat_vacuna WHERE UPPER(nombre) = $1 AND NOT id = $2
                `
                , [nombre.toUpperCase(), id]);


            if (VERIFICAR_VACUNA.rows[0] == undefined || VERIFICAR_VACUNA.rows[0] == '') {
                const vacunaEditar = nombre.charAt(0).toUpperCase() + nombre.slice(1).toLowerCase();

                // INICIAR TRANSACCION
                await pool.query('BEGIN');

                const consulta = await pool.query(`SELECT * FROM e_cat_vacuna WHERE id = $1`, [id]);
                const [datosOriginales] = consulta.rows;

                if (!datosOriginales) {
                    await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                        tabla: 'e_cat_vacuna',
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

                const response: QueryResult = await pool.query(
                    `
                    UPDATE e_cat_vacuna SET nombre = $2
                    WHERE id = $1 RETURNING *
                    `
                    , [id, vacunaEditar]);

                const [vacunaActualizada] = response.rows;

                // AUDITORIA
                await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                    tabla: 'e_cat_vacuna',
                    usuario: req.body.user_name,
                    accion: 'U',
                    datosOriginales: JSON.stringify(datosOriginales),
                    datosNuevos: JSON.stringify(vacunaActualizada),
                    ip: ip,
                    ip_local: ip_local,
                    observacion: null
                });

                // FINALIZAR TRANSACCION
                await pool.query('COMMIT');

                if (vacunaActualizada) {
                    return res.status(200).jsonp({ message: 'Registro editado.', status: '200' })
                } else {
                    return res.status(404).jsonp({ message: 'Ups!!! algo salio mal.', status: '400' })
                }
            } else {
                return res.jsonp({ message: 'Tipo vacuna ya existe en el sistema.', status: '300' })
            }

        }
        catch (error) {
            // ROLLBACK
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
            const vacuna = await pool.query(
                `
                SELECT * FROM e_cat_vacuna WHERE id = $1
                `
                , [id]);

            const [datosVacuna] = vacuna.rows;

            if (!datosVacuna) {
                await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                    tabla: 'e_cat_vacuna',
                    usuario: user_name,
                    accion: 'D',
                    datosOriginales: '',
                    datosNuevos: '',
                    ip: ip,
                    ip_local: ip_local,
                    observacion: `Error al eliminar el registro con id: ${id}. Registro no encontrado.`
                });

                // FINALIZAR TRANSACCION
                await pool.query('COMMIT');
                return res.status(404).jsonp({ message: 'Registro no encontrado.' });
            }

            await pool.query(
                `
                DELETE FROM e_cat_vacuna WHERE id = $1
                `
                , [id]);

            // AUDITORIA
            await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                tabla: 'e_cat_vacuna',
                usuario: user_name,
                accion: 'D',
                datosOriginales: JSON.stringify(datosVacuna),
                datosNuevos: '',
                ip: ip,
                ip_local: ip_local,
                observacion: null
            });

            // FINALIZAR TRANSACCION
            await pool.query('COMMIT');
            res.jsonp({ message: 'Registro eliminado.' });

        } catch (error) {
            // ROLLBACK
            await pool.query('ROLLBACK');
            return res.jsonp({ message: 'error' });
        }
    }

    // METODO PARA REVISAR LOS DATOS DE LA PLANTILLA DENTRO DEL SISTEMA - MENSAJES DE CADA ERROR    **USADO
    public async RevisarDatos(req: Request, res: Response): Promise<any> {
        try {
            const documento = req.file?.originalname;
            let separador = path.sep;
            let ruta = ObtenerRutaLeerPlantillas() + separador + documento;
            const workbook = new Excel.Workbook();
            await workbook.xlsx.readFile(ruta);
            let verificador = ObtenerIndicePlantilla(workbook, 'TIPO_VACUNA');
            if (verificador === false) {
                return res.jsonp({ message: 'no_existe', data: undefined });
            }
            else {
                const sheet_name_list = workbook.worksheets.map(sheet => sheet.name);
                const plantilla = workbook.getWorksheet(sheet_name_list[verificador]);
                let data: any = {
                    fila: '',
                    vacuna: '',
                    observacion: ''
                };
                var listaVacunas: any = [];
                var duplicados: any = [];
                var mensaje: string = 'correcto';

                if (plantilla) {
                    // SUPONIENDO QUE LA PRIMERA FILA SON LAS CABECERAS
                    const headerRow = plantilla.getRow(1);
                    const headers: any = {};
                    // CREAR UN MAPA CON LAS CABECERAS Y SUS POSICIONES, ASEGURANDO QUE LAS CLAVES ESTEN EN MAYUSCULAS
                    headerRow.eachCell((cell: any, colNumber) => {
                        headers[cell.value.toString().toUpperCase()] = colNumber;
                    });
                    // VERIFICA SI LAS CABECERAS ESENCIALES ESTAN PRESENTES
                    if (!headers['ITEM'] || !headers['VACUNA']
                    ) {
                        return res.jsonp({ message: 'Cabeceras faltantes', data: undefined });
                    }

                    // LECTURA DE LOS DATOS DE LA PLANTILLA
                    plantilla.eachRow((row, rowNumber) => {
                        // SALTAR LA FILA DE LAS CABECERAS
                        if (rowNumber === 1) return;
                        // LEER LOS DATOS SEGUN LAS COLUMNAS ENCONTRADAS
                        const ITEM = row.getCell(headers['ITEM']).value;
                        const VACUNA = row.getCell(headers['VACUNA']).value;

                        // VERIFICAR QUE EL REGISTO NO TENGA DATOS VACIOS
                        if ((ITEM != undefined && ITEM != '') &&
                            (VACUNA != undefined && VACUNA != '')) {
                            data.fila = ITEM;
                            data.vacuna = VACUNA;
                            data.observacion = 'no registrada';

                             //USAMOS TRIM PARA ELIMINAR LOS ESPACIOS AL INICIO Y AL FINAL EN BLANCO.
                            data.vacuna = data.vacuna.trim();

                            listaVacunas.push(data);

                        } else {
                            data.fila = ITEM;
                            data.vacuna = VACUNA;
                            data.observacion = 'no registrada';

                            if (data.fila == '' || data.fila == undefined) {
                                data.fila = 'error';
                                mensaje = 'error'
                            }

                            if (VACUNA == undefined) {
                                data.vacuna = 'No registrado';
                                data.observacion = 'Vacuna ' + data.observacion;
                            }

                            //USAMOS TRIM PARA ELIMINAR LOS ESPACIOS AL INICIO Y AL FINAL EN BLANCO.
                            data.vacuna = data.vacuna.trim();

                            listaVacunas.push(data);
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
                // VALIDACINES DE LOS DATOS DE LA PLANTILLA
                listaVacunas.forEach(async (item: any) => {
                    if (item.observacion == 'no registrada') {
                        var VERIFICAR_VACUNA = await pool.query(
                            `
                            SELECT * FROM e_cat_vacuna WHERE UPPER(nombre) = $1
                            `
                            , [item.vacuna.toUpperCase()])
                        if (VERIFICAR_VACUNA.rows[0] == undefined || VERIFICAR_VACUNA.rows[0] == '') {
                            item.observacion = 'ok'
                        } else {
                            item.observacion = 'Ya existe en el sistema'
                        }

                        // DISCRIMINACION DE ELEMENTOS IGUALES
                        if (duplicados.find((p: any) => p.vacuna.toLowerCase() === item.vacuna.toLowerCase()) == undefined) {
                            duplicados.push(item);
                        } else {
                            item.observacion = '1';
                        }
                    }
                });

                setTimeout(() => {
                    listaVacunas.sort((a: any, b: any) => {
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

                    listaVacunas.forEach(async (item: any) => {
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
                        listaVacunas = undefined;
                    }
                    return res.jsonp({ message: mensaje, data: listaVacunas });
                }, 1000)
            }

        } catch (error) {
            return res.status(500).jsonp({ message: 'Error con el servidor método RevisarDatos.', status: '500' });
        }
    }

    // REGISTRAR PLANTILLA TIPO VACUNA    **USADO
    public async CargarPlantilla(req: Request, res: Response) {
        const { plantilla, user_name, ip, ip_local } = req.body;
        let error: boolean = false;

        for (const data of plantilla) {
            try {
                // DATOS QUE SE GUARDARAN DE LA PLANTILLA INGRESADA
                const { vacuna } = data;
                const vacu = vacuna.charAt(0).toUpperCase() + vacuna.slice(1).toLowerCase();

                // INICIAR TRANSACCION
                await pool.query('BEGIN');

                // REGISTRO DE LOS DATOS DE MODLAIDAD LABORAL
                const response: QueryResult = await pool.query(
                    `
                    INSERT INTO e_cat_vacuna (nombre) VALUES ($1) RETURNING *
                    `
                    , [vacu]);

                const [vacuna_emp] = response.rows;

                // AUDITORIA
                await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                    tabla: 'e_cat_vacuna',
                    usuario: user_name,
                    accion: 'I',
                    datosOriginales: '',
                    datosNuevos: JSON.stringify(vacuna_emp),
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

export const TIPO_VACUNAS_CONTROLADOR = new VacunaControlador();

export default TIPO_VACUNAS_CONTROLADOR;