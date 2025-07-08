import AUDITORIA_CONTROLADOR from '../../reportes/auditoriaControlador';
import { ObtenerIndicePlantilla, ObtenerRutaLeerPlantillas } from '../../../libs/accesoCarpetas';
import { ConvertirImagenBase64 } from '../../../libs/ImagenCodificacion';
import { Request, Response } from 'express';
import { ObtenerRutaLogos } from '../../../libs/accesoCarpetas';
import { FormatearFecha2 } from '../../../libs/settingsMail';
import { QueryResult } from 'pg';
import pool from '../../../database';
import path from 'path';
import Excel from 'exceljs';
import fs from 'fs';

class AccionPersonalControlador {

    // METODO PARA LISTAR DETALLES TIPOS DE ACCION DE PERSONAL   **USADO
    public async ListarTipoAccionPersonal(req: Request, res: Response) {
        const ACCION = await pool.query(
            `
                SELECT 
                    dtap.id, dtap.id_tipo_accion_personal, dtap.descripcion, dtap.base_legal, 
                    tap.descripcion AS nombre 
                FROM 
                    map_detalle_tipo_accion_personal AS dtap, 
                    map_tipo_accion_personal AS tap 
                WHERE 
                    tap.id = dtap.id_tipo_accion_personal
            `
        );
        if (ACCION.rowCount != 0) {
            return res.jsonp(ACCION.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'No se encuentran registros.' });
        }
    }

    // METODO PARA REGISTRAR DETALLE DE TIPOS DE ACCIONES DE PERSONAL   **USADO
    public async CrearTipoAccionPersonal(req: Request, res: Response): Promise<Response> {

        try {
            const { id_tipo, descripcion, base_legal, user_name, ip, ip_local } = req.body;

            // INICIAR TRANSACCION
            await pool.query('BEGIN');

            const response: QueryResult = await pool.query(
                `
                    INSERT INTO map_detalle_tipo_accion_personal 
                        (id_tipo_accion_personal, descripcion, base_legal) 
                        VALUES($1, $2, $3) RETURNING*
                `
                , [id_tipo, descripcion, base_legal]);

            const [datos] = response.rows;

            if (datos) {
                // INSERTAR REGISTRO DE AUDITORIA
                await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                    tabla: 'map_detalle_tipo_accion_personal',
                    usuario: user_name,
                    accion: 'I',
                    datosOriginales: '',
                    datosNuevos:
                        `
                            {
                            "id_tipo": "${id_tipo}", "descripcion": "${descripcion}", "base_legal": "${base_legal}",                      
                            }
                        `,
                    ip: ip,
                    ip_local: ip_local,
                    observacion: null
                });

                // FINALIZAR TRANSACCION
                await pool.query('COMMIT');
                return res.status(200).jsonp(datos)
            }
            else {
                await pool.query('ROLLBACK');
                return res.status(500).jsonp({ message: 'error' })
            }
        } catch (error) {
            await pool.query('ROLLBACK');
            return res.status(500).jsonp({ message: 'error' })
        }
    }

    // METODO DE ACTUALIZACION DEL DETALLE DE LA ACCION DE PERSONAL    **USADO
    public async ActualizarTipoAccionPersonal(req: Request, res: Response): Promise<Response> {
        try {
            const { id_tipo, descripcion, base_legal, id, user_name, ip, ip_local } = req.body;

            // INICIAR TRANSACCION
            await pool.query('BEGIN');

            // CONSULTAR DATOS ANTES DE ACTUALIZAR PARA PODER REALIZAR EL REGISTRO EN AUDITORIA
            const response = await pool.query(
                `
                SELECT * FROM map_detalle_tipo_accion_personal WHERE id = $1
                `
                , [id]);
            const [datos] = response.rows;

            if (!datos) {
                await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                    tabla: 'map_detalle_tipo_accion_personal',
                    usuario: user_name,
                    accion: 'U',
                    datosOriginales: '',
                    datosNuevos: '',
                    ip: ip,
                    ip_local: ip_local,
                    observacion: `Error al actualizar el registro con id: ${id}`
                });
                // FINALIZAR TRANSACCION
                await pool.query('COMMIT');
                return res.status(404).jsonp({ message: 'error' });
            }

            await pool.query(
                `
                    UPDATE map_detalle_tipo_accion_personal SET id_tipo_accion_personal = $1, descripcion = $2, base_legal = $3 
                    WHERE id = $4
                `
                , [id_tipo, descripcion, base_legal, id]);

            // INSERTAR REGISTRO DE AUDITORIA
            await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                tabla: 'map_detalle_tipo_accion_personal',
                usuario: user_name,
                accion: 'U',
                datosOriginales: JSON.stringify(datos),
                datosNuevos:
                    `
                    {
                        "id_tipo": "${id_tipo}", "descripcion": "${descripcion}", "base_legal": "${base_legal}"
                    }
                    `
                ,
                ip: ip,
                ip_local: ip_local,
                observacion: null
            });

            // FINALIZAR TRANSACCION
            await pool.query('COMMIT');
            return res.status(200).jsonp({ message: 'Registro actualizado.' });

        } catch (error) {
            await pool.query('ROLLBACK');
            return res.status(500).jsonp({ message: 'error' });
        }
    }

    // METODO PARA ELIMINAR REGISTROS DE DETALLES DE TIPO DE ACCION DE PERSONAL  *USADO
    public async EliminarTipoAccionPersonal(req: Request, res: Response): Promise<Response> {
        try {
            const id = req.params.id;
            const { user_name, ip, ip_local } = req.body;

            // INICIAR TRANSACCION
            await pool.query('BEGIN');

            // CONSULTAR DATOS ANTES DE ELIMINAR PARA PODER REALIZAR EL REGISTRO EN AUDITORIA
            const response = await pool.query(
                `
                    SELECT * FROM map_detalle_tipo_accion_personal WHERE id = $1
                `
                , [id]);
            const [datos] = response.rows;

            if (!datos) {
                await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                    tabla: 'map_detalle_tipo_accion_personal',
                    usuario: user_name,
                    accion: 'D',
                    datosOriginales: '',
                    datosNuevos: '',
                    ip: ip,
                    ip_local: ip_local,
                    observacion: `Error al eliminar el registro con id: ${id}`
                });
                // FINALIZAR TRANSACCION
                await pool.query('COMMIT');
                return res.status(404).jsonp({ message: 'error' });
            }

            await pool.query(
                `
                    DELETE FROM map_detalle_tipo_accion_personal WHERE id = $1
                `
                , [id]);

            // INSERTAR REGISTRO DE AUDITORIA
            await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                tabla: 'map_detalle_tipo_accion_personal',
                usuario: user_name,
                accion: 'D',
                datosOriginales: JSON.stringify(datos),
                datosNuevos: '',
                ip: ip,
                ip_local: ip_local,
                observacion: null
            });

            // FINALIZAR TRANSACCION
            await pool.query('COMMIT');
            return res.status(200).jsonp({ message: 'Registro eliminado.' });
        } catch (error) {
            await pool.query('ROLLBACK');
            return res.status(500).jsonp({ message: 'error' });

        }
    }

    // METODO PARA ELIMINAR LOS TIPOS DE ACCION PERSONAL DE MANERA MULTIPLE   **USADO
    public async EliminarTipoAccionMultiple(req: Request, res: Response): Promise<any> {
        const { listaEliminar, user_name, ip, ip_local } = req.body;
        let error: boolean = false;
        var count = 0;
        var count_no = 0;
        var list_tipoAccionPersonal: any = [];

        try {

            for (const item of listaEliminar) {
                // INICIAR TRANSACCION
                await pool.query('BEGIN');
                const resultado = await pool.query(
                    `
                        SELECT id FROM map_detalle_tipo_accion_personal WHERE id = $1
                    `,
                    [item.id]);
                const [existe_datos] = resultado.rows;
                if (!existe_datos) {
                    // AUDITORIA
                    await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                        tabla: 'map_detalle_tipo_accion_personal',
                        usuario: user_name,
                        accion: 'D',
                        datosOriginales: '',
                        datosNuevos: '',
                        ip: ip,
                        ip_local: ip_local,
                        observacion: `Error al eliminar el detalle de tipo de accion personal con id: ${item.id}. Registro no encontrado.`
                    });
                }
                // FINALIZAR TRANSACCION
                await pool.query('COMMIT');

                if (existe_datos) {
                    // INICIAR TRANSACCION
                    await pool.query('BEGIN');
                    const resultado = await pool.query(
                        `
                            SELECT id FROM map_documento_accion_personal WHERE id_detalle_tipo_accion = $1
                        `
                        , [item.id]);

                    const [existe_detalle] = resultado.rows

                    // FINALIZAR TRANSACCION
                    await pool.query('COMMIT');

                    if (!existe_detalle) {
                        // INICIAR TRANSACCION
                        await pool.query('BEGIN');
                        const res = await pool.query(
                            `
                                DELETE FROM map_detalle_tipo_accion_personal WHERE id = $1
                            `, [item.id]);

                        // AUDITORIA
                        await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                            tabla: 'map_detalle_tipo_accion_personal',
                            usuario: user_name,
                            accion: 'D',
                            datosOriginales: '',
                            datosNuevos: JSON.stringify(existe_datos),
                            ip: ip,
                            ip_local: ip_local,
                            observacion: null
                        });
                        // FINALIZAR TRANSACCION
                        await pool.query('COMMIT');
                        count += 1;
                    } else {
                        list_tipoAccionPersonal.push(item.nombre)
                        count_no += 1;
                    }
                }
            }
            var meCount = "registro eliminado"
            if (count > 1) {
                meCount = "registros eliminados"
            }
            return res.status(200).jsonp({ message: count.toString() + ' ' + meCount + ' con éxito.', ms2: 'Existen datos relacionados con ', codigo: 200, eliminados: count, relacionados: count_no, listaNoEliminados: list_tipoAccionPersonal });

        } catch (err) {
            // REVERTIR TRANSACCION
            await pool.query('ROLLBACK');
            error = true;
            if (error) {
                if (err.table == 'map_cat_procesos' || err.table == 'map_empleado_procesos') {
                    if (count <= 1) {
                        return res.status(300).jsonp({
                            message: 'Se ha eliminado ' + count + ' registro.', ms2: 'Existen datos relacionados con ', eliminados: count,
                            relacionados: count_no, listaNoEliminados: list_tipoAccionPersonal
                        });
                    } else if (count > 1) {
                        return res.status(300).jsonp({
                            message: 'Se han eliminado ' + count + ' registros.', ms2: 'Existen datos relacionados con ', eliminados: count,
                            relacionados: count_no, listaNoEliminados: list_tipoAccionPersonal
                        });
                    }
                } else {
                    return res.status(500).jsonp({ message: 'No se puedo completar la operacion' });
                }
            }
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
            let verificador = ObtenerIndicePlantilla(workbook, 'DETALLE_TIPO_ACCION_PERSONAL');
            if (verificador === false) {
                return res.jsonp({ message: 'no_existe', data: undefined });
            }
            else {
                const sheet_name_list = workbook.worksheets.map(sheet => sheet.name);
                const plantilla = workbook.getWorksheet(sheet_name_list[verificador]);

                let data: any = {
                    fila: '',
                    tipo_accion_personal: '',
                    descripcion: '',
                    base_legal: '',
                    observacion: ''
                };

                var listaAccionPersonal: any = [];
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
                    if (!headers['ITEM'] || !headers['TIPO_ACCION_PERSONAL'] || !headers['DESCRIPCION'] || !headers['BASE_LEGAL']
                    ) {
                        return res.jsonp({ message: 'Cabeceras faltantes', data: undefined });
                    }

                    // LECTURA DE LOS DATOS DE LA PLANTILLA
                    plantilla.eachRow((row, rowNumber) => {
                        // SALTAR LA FILA DE LAS CABECERAS
                        if (rowNumber === 1) return;
                        // LEER LOS DATOS SEGUN LAS COLUMNAS ENCONTRADAS
                        const ITEM = row.getCell(headers['ITEM']).value;
                        const TIPO_ACCION_PERSONAL = row.getCell(headers['TIPO_ACCION_PERSONAL']).value?.toString().trim();
                        const DESCRIPCION = row.getCell(headers['DESCRIPCION']).value?.toString().trim();
                        const BASE_LEGAL = row.getCell(headers['BASE_LEGAL']).value?.toString().trim();

                        // VERIFICAR QUE EL REGISTO NO TENGA DATOS VACIOS
                        if ((ITEM != undefined && ITEM != '') &&
                            (TIPO_ACCION_PERSONAL != undefined && TIPO_ACCION_PERSONAL != '') &&
                            (DESCRIPCION != undefined && DESCRIPCION != '') &&
                            (BASE_LEGAL != undefined && BASE_LEGAL != '')) {

                            data.fila = ITEM;
                            data.tipo_accion_personal = TIPO_ACCION_PERSONAL;
                            data.descripcion = DESCRIPCION;
                            data.base_legal = BASE_LEGAL;
                            data.observacion = 'no registrado';
                            listaAccionPersonal.push(data);

                        }
                        else {
                            data.fila = ITEM;
                            data.tipo_accion_personal = TIPO_ACCION_PERSONAL;
                            data.descripcion = DESCRIPCION;
                            data.base_legal = BASE_LEGAL;
                            data.observacion = 'no registrado';

                            if (data.fila == '' || data.fila == undefined) {
                                data.fila = 'error';
                                mensaje = 'error'
                            }

                            if (TIPO_ACCION_PERSONAL == undefined) {
                                data.tipo_accion_personal = 'No registrado';
                                data.observacion = 'Tipo de acción de personal ' + data.observacion;
                            }

                            if (DESCRIPCION == undefined) {
                                data.descripcion = 'No registrado';
                                data.observacion = 'Descripción ' + data.observacion;
                            }

                            if (BASE_LEGAL == undefined) {
                                data.base_legal = '-';
                            }

                            listaAccionPersonal.push(data);
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
                listaAccionPersonal.forEach(async (item: any, index: number) => {
                    if (item.observacion == 'no registrado') {
                        const VERIFICAR_TIPO_ACCION = await pool.query(
                            `
                                SELECT * FROM map_tipo_accion_personal 
                                WHERE UPPER(descripcion) = UPPER($1)
                            `
                            , [item.tipo_accion_personal]);

                        if (VERIFICAR_TIPO_ACCION.rowCount === 0) {
                            item.observacion = 'No existe el tipo de acción de personal en el sistema';
                        }
                    }
                });

                setTimeout(() => {
                    listaAccionPersonal.sort((a: any, b: any) => {
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

                    listaAccionPersonal.forEach(async (item: any) => {
                        if (item.observacion == '1') {
                            item.observacion = 'Registro duplicado'
                        } else if (item.observacion == 'no registrado') {
                            item.observacion = 'ok'
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
                        listaAccionPersonal = undefined;
                    }
                    return res.jsonp({ message: mensaje, data: listaAccionPersonal });
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
        for (const item of plantilla) {
            const { tipo_accion_personal, descripcion, base_legal } = item;
            try {

                // INICIAR TRANSACCION
                await pool.query('BEGIN');

                const response: QueryResult = await pool.query(
                    `
                        SELECT * FROM map_tipo_accion_personal 
                         WHERE UPPER(descripcion) = UPPER($1)
                    `
                    , [tipo_accion_personal]);

                const [tipo_acciones] = response.rows;

                // INICIAR TRANSACCION
                await pool.query('BEGIN');

                const response_accion: QueryResult = await pool.query(
                    `
                        INSERT INTO map_detalle_tipo_accion_personal (id_tipo_accion_personal, descripcion, base_legal) VALUES ($1, $2, $3) RETURNING *
                    `
                    , [response.rows[0].id, descripcion, base_legal]);
                const [detalleAccion] = response_accion.rows;

                // AUDITORIA
                await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                    tabla: 'map_detalle_tipo_accion_personal',
                    usuario: user_name,
                    accion: 'I',
                    datosOriginales: '',
                    datosNuevos: JSON.stringify(detalleAccion),
                    ip: ip,
                    ip_local: ip_local,
                    observacion: null
                });

                // FINALIZAR TRANSACCION
                await pool.query('COMMIT');

                // AUDITORIA
                await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                    tabla: 'map_tipo_accion_personal',
                    usuario: user_name,
                    accion: 'I',
                    datosOriginales: '',
                    datosNuevos: JSON.stringify(tipo_acciones),
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


    /**  *************************************************************************************** **
     **  **                      TABLA DE TIPOS DE ACCION DE PERSONAL                         ** **                     
     **  *************************************************************************************** **/

    // METODO PARA CONSULTAR TIPOS DE ACCION PERSONAL   **USADO
    public async ListarTipoAccion(req: Request, res: Response) {
        const ACCION = await pool.query(
            `
                SELECT * FROM map_tipo_accion_personal
            `
        );
        if (ACCION.rowCount != 0) {
            return res.jsonp(ACCION.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'No se encuentran registros.' });
        }
    }

    // METODO PARA REGISTRAR UNA ACCION DE PERSONAL   **USADO
    public async CrearTipoAccion(req: Request, res: Response) {
        try {
            const { descripcion, user_name, ip, ip_local } = req.body;

            // INICIAR TRANSACCION
            await pool.query('BEGIN');
            const response: QueryResult = await pool.query(
                `
                    INSERT INTO map_tipo_accion_personal (descripcion) VALUES ($1) RETURNING *
                `
                , [descripcion]);

            const [datos] = response.rows;

            if (datos) {
                // INSERTAR REGISTRO DE AUDITORIA
                await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                    tabla: 'map_tipo_accion_personal',
                    usuario: user_name,
                    accion: 'I',
                    datosOriginales: '',
                    datosNuevos: `{"descripcion": "${descripcion}"}`,
                    ip: ip,
                    ip_local: ip_local,
                    observacion: null
                });

                // FINALIZAR TRANSACCION
                await pool.query('COMMIT');
                return res.status(200).jsonp(datos)
            }
            else {
                await pool.query('ROLLBACK');
                return res.status(300).jsonp({ message: 'error, no se insertaron los datos' })
            }
        } catch (error) {
            await pool.query('ROLLBACK');
            return res.status(500).jsonp({ message: error })
        }
    }

    // METODO PARA BUSCAR UN DETALLE DE TIPO DE ACCION DE PERSONAL POR ID    **USADO
    public async EncontrarTipoAccionPersonalId(req: Request, res: Response) {
        const { id } = req.params;
        const ACCION = await pool.query(
            `
                SELECT dtap.id, dtap.id_tipo_accion_personal, dtap.descripcion, dtap.base_legal, tap.descripcion AS nombre 
                FROM map_detalle_tipo_accion_personal AS dtap, map_tipo_accion_personal AS tap 
                WHERE dtap.id = $1 AND tap.id = dtap.id_tipo_accion_personal
            `
            , [id]);
        if (ACCION.rowCount != 0) {
            return res.jsonp(ACCION.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'No se encuentran registros.' });
        }
    }

    // METODO PARA BUSCAR DATOS DEL DETALLE DE ACCION DE PERSONAL PARA EDICION   **USADO
    public async ListarTipoAccionEdicion(req: Request, res: Response) {
        const { id } = req.params;
        const ACCION = await pool.query(
            `
            SELECT * FROM map_detalle_tipo_accion_personal WHERE NOT id_tipo_accion_personal = $1
            `
            , [id]);
        if (ACCION.rowCount != 0) {
            return res.jsonp(ACCION.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'No se encuentran registros.' });
        }
    }

    // VER LOGO DE MINISTERIO TRABAJO     **USADO
    public async verLogoMinisterio(req: Request, res: Response): Promise<any> {
        const file_name = 'ministerio_trabajo.png';
        let separador = path.sep;
        let ruta = ObtenerRutaLogos() + separador + file_name;
        const codificado = await ConvertirImagenBase64(ruta);
        if (codificado === 0) {
            res.send({ imagen: 0 })
        } else {
            res.send({ imagen: codificado })
        }
    }


    /**  *************************************************************************************** **
     **  **                      TABLA DE DOCUMENTOS DE ACCION DE PERSONAL                    ** **                     
     **  *************************************************************************************** **/

    // TABLA SOLICITUD ACCION PERSONAL
    public async CrearPedidoAccionPersonal(req: Request, res: Response): Promise<Response> {
        try {
            const { formulario1, formulario2, formulario3, formulario4, formulario5, formulario6, user_name, ip, ip_local } = req.body;
            let datosNuevos = req.body;
            const fechaActual = new Date();
            let id_empleado_comunicacion = null;
            let id_empleado_comunica_cargo = null;

            if (formulario6.firma_Resp_Notificacion != '' && formulario6.firma_Resp_Notificacion != null) {

                // INICIAR TRANSACCION
                await pool.query('BEGIN');

                const response: QueryResult = await pool.query(
                    `
                        SELECT * FROM informacion_general WHERE
                        (UPPER (apellido) || \' \' || UPPER (nombre)) = $1
                    `
                    , [formulario6.firma_Resp_Notificacion.trim().toUpperCase()]);

                id_empleado_comunicacion = response.rows[0].id;
                id_empleado_comunica_cargo = response.rows[0].id_cargo;

                // FINALIZAR TRANSACCION
                await pool.query('COMMIT');

            }

            // INICIAR TRANSACCION
            await pool.query('BEGIN');

            const response_accion: QueryResult = await pool.query(
                `
                INSERT INTO map_documento_accion_personal (
                    numero_accion_personal, fecha_elaboracion, hora_elaboracion, id_empleado_personal, fecha_rige_desde, fecha_rige_hasta, id_tipo_accion_personal, id_detalle_tipo_accion, detalle_otro, especificacion, 
                    declaracion_jurada, adicion_base_legal, observacion, 
                    id_proceso_actual, id_nivel_gestion_actual, id_unidad_administrativa, id_sucursal_actual, id_lugar_trabajo_actual, id_tipo_cargo_actual, id_grupo_ocupacional_actual, 
                    id_grado_actual, remuneracion_actual, partida_individual_actual, 
                    id_proceso_propuesto, id_sucursal_propuesta, id_nivel_gestion_propuesto, id_unidad_adminsitrativa_propuesta, id_lugar_trabajo_propuesto,id_tipo_cargo_propuesto, 
                    id_grupo_ocupacional_propuesto, id_grado_propuesto, remuneracion_propuesta, partida_individual_propuesta, 
                    lugar_posesion, fecha_posesion, numero_acta_final, fecha_acta_final, id_empleado_director, id_tipo_cargo_director, id_empleado_autoridad_delegado, 
                    id_tipo_cargo_autoridad_delegado, id_empleado_testigo, fecha_testigo, id_empleado_elaboracion, id_tipo_cargo_elaboracion, id_empleado_revision, id_tipo_cargo_revision, id_empleado_control, id_tipo_cargo_control, comunicacion_electronica,
                    fecha_comunicacion, hora_comunicacion, medio_comunicacion, id_empleado_comunicacion, id_tipo_cargo_comunicacion, fecha_registro, fecha_actualizacion, proceso, id_vacacion) 
                VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 
                    $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, 
                    $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, 
                    $31, $32, $33, $34, $35, $36, $37, $38, $39, $40, 
                    $41, $42, $43, $44, $45, $46, $47, $48, $49, $50, 
                    $51, $52, $53, $54, $55, $56, $57, $58, $59) RETURNING *
                `
                , [formulario1.numero_accion_personal, formulario1.fecha_elaboracion, formulario1.hora_elaboracion, formulario1.id_empleado_personal, formulario1.fecha_rige_desde, formulario1.fecha_rige_hasta,
                formulario2.id_tipo_accion_personal, formulario2.id_detalle_accion, formulario2.detalle_otro, formulario2.especificacion, formulario2.declaracion_jurada, formulario2.adicion_base_legal, formulario2.observacion,
                formulario3.id_proceso_actual, formulario3.id_nivel_gestion_actual, formulario3.id_unidad_administrativa, formulario3.id_sucursal_actual, formulario3.id_lugar_trabajo_actual, formulario3.id_tipo_cargo_actual,
                formulario3.id_grupo_ocupacional_actual, formulario3.id_grado_actual, formulario3.remuneracion_actual, formulario3.partida_individual_actual,

                formulario3.id_proceso_propuesto, formulario3.id_sucursal_propuesta, formulario3.id_nivel_gestion_propuesto, formulario3.id_unidad_administrativa_propuesta, formulario3.id_lugar_trabajo_propuesto,
                formulario3.id_tipo_cargo_propuesto, formulario3.id_grupo_ocupacional_propuesto, formulario3.id_grado_propuesto, formulario3.remuneracion_propuesta, formulario3.partida_individual_propuesta,

                formulario4.lugar_posesion, formulario4.fecha_posesion, formulario4.actaFinal, formulario4.fechaActa,

                formulario5.firma_talentoHumano, formulario5.cargo_talentoHumano, formulario5.firma_delegado, formulario5.cargo_delegado, formulario5.firma_servidorPublico, formulario5.fecha_servidorPublico,
                formulario5.firma_RespElaboracion, formulario5.cargo_RespElaboracion, formulario5.firma_RespRevision, formulario5.cargo_RespRevision, formulario5.firma_RespRegistro_control, formulario5.cargo_RespRegistro_control,

                formulario6.ComunicacionElect, formulario6.fechaComunicacion, formulario6.horaComunicado, formulario6.medioComunicacionForm, id_empleado_comunicacion,
                    id_empleado_comunica_cargo, fechaActual, null, null, null
                ]);

            delete datosNuevos.user_name;
            delete datosNuevos.ip;

            // INSERTAR REGISTRO DE AUDITORIA
            await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                tabla: 'map_documento_accion_personal',
                usuario: user_name,
                accion: 'I',
                datosOriginales: '',
                datosNuevos: `{id: ${response_accion.rows[0].id}, numero_accion_personal: ${response_accion.rows[0].numero_accion_personal}, fecha_elaboracion: ${response_accion.rows[0].fecha_elaboracion}, 
                    hora_elaboracion: ${response_accion.rows[0].hora_elaboracion}, id_empleado_personal: ${response_accion.rows[0].id_empleado_personal}, fecha_rige_desde: ${response_accion.rows[0].fecha_rige_desde}, 
                    fecha_rige_hasta: ${response_accion.rows[0].fecha_rige_hasta}, id_tipo_accion_personal: ${response_accion.rows[0].id_tipo_accion_personal}, id_detalle_tipo_accion: ${response_accion.rows[0].id_detalle_tipo_accion}, detalle_otro: ${response_accion.rows[0].detalle_otro}, 
                    especificacion: ${response_accion.rows[0].especificacion}, declaracion_jurada: ${response_accion.rows[0].declaracion_jurada}, adicion_base_legal: ${response_accion.rows[0].adicion_base_legal}, observacion: ${response_accion.rows[0].observacion}, 
                    id_proceso_actual: ${response_accion.rows[0].id_proceso_actual}, id_nivel_gestion_actual: ${response_accion.rows[0].id_nivel_gestion_actual}, id_unidad_administrativa: ${response_accion.rows[0].id_unidad_administrativa}, id_sucursal_actual: ${response_accion.rows[0].id_sucursal_actual}, 
                    id_lugar_trabajo_actual: ${response_accion.rows[0].lugar_trabajo_actual}, id_tipo_cargo_actual: ${response_accion.rows[0].id_tipo_cargo_actual}, id_grupo_ocupacional_actual: ${response_accion.rows[0].id_grupo_ocupacional_actual}, 
                    id_grado_actual: ${response_accion.rows[0].id_grado_actual}, remuneracion_actual: ${response_accion.rows[0].remuneracion_actual}, partida_individual_actual: ${response_accion.rows[0].partida_individual_actual}, 
                    id_proceso_propuesto: ${response_accion.rows[0].id_proceso_propuesto}, id_sucursal_propuesta: ${response_accion.rows[0].id_sucursal_propuesta}, id_nivel_gestion_propuesto: ${response_accion.rows[0].id_nivel_gestion_propuesto}, id_unidad_adminsitrativa_propuesta: ${response_accion.rows[0].id_unidad_administrativa_propuesta}, 
                    id_lugar_trabajo_propuesto: ${response_accion.rows[0].id_lugar_trabajo_propuesto},id_tipo_cargo_propuesto: ${response_accion.rows[0].id_tipo_cargo_propuesto}, id_grupo_ocupacional_propuesto: ${response_accion.rows[0].id_grupo_ocupacional_propuesto}, id_grado_propuesto: ${response_accion.rows[0].id_grado_propuesto}, 
                    remuneracion_propuesta: ${response_accion.rows[0].remuneracion_propuesta}, partida_individual_propuesta: ${response_accion.rows[0].partida_individual_propuesta}, lugar_posesion: ${response_accion.rows[0].lugar_posesion}, fecha_posesion: ${response_accion.rows[0].fecha_posesion}, numero_acta_final: ${response_accion.rows[0].numero_acta_final}, fecha_acta_final: ${response_accion.rows[0].fecha_acta_final},
                    id_empleado_director: ${response_accion.rows[0].id_empleado_director}, id_tipo_cargo_director: ${response_accion.rows[0].id_tipo_cargo_director}, id_empleado_autoridad_delegado: ${response_accion.rows[0].id_empleado_autoridad_delegado}, id_tipo_cargo_autoridad_delegado: ${response_accion.rows[0].id_tipo_cargo_autoridad_delegado}, 
                    id_empleado_testigo: ${response_accion.rows[0].id_empleado_testigo}, fecha_testigo: ${response_accion.rows[0].fecha_testigo}, id_empleado_elaboracion: ${response_accion.rows[0].id_empleado_elaboracion}, id_tipo_cargo_elaboracion: ${response_accion.rows[0].id_tipo_cargo_elaboracion}, id_empleado_revision: ${response_accion.rows[0].id_empleado_revision}, 
                    id_tipo_cargo_revisio: ${response_accion.rows[0].id_tipo_cargo_revisio}n, id_empleado_control: ${response_accion.rows[0].id_empleado_control}, id_tipo_cargo_control: ${response_accion.rows[0].id_tipo_cargo_control}, comunicacion_electronica: ${response_accion.rows[0].comunicacion_electronica},
                    fecha_comunicacion: ${response_accion.rows[0].fecha_comunicacion}, hora_comunicacion: ${response_accion.rows[0].hora_comunicacion}, medio_comunicacion: ${response_accion.rows[0].medio_comunicacion}, id_empleado_comunicacion: ${response_accion.rows[0].id_empleado_comunicacion}, id_tipo_cargo_comunicacion: ${response_accion.rows[0].id_tipo_cargo_comunicacion}, 
                    fecha_registro: ${response_accion.rows[0].fecha_registro}, fecha_actualizacion: ${response_accion.rows[0].fecha_actualizacion}, proceso: ${response_accion.rows[0].proceso}, id_vacacion: ${response_accion.rows[0].id_vacacion}}`,
                ip: ip,
                ip_local: ip_local,
                observacion: null
            });

            // FINALIZAR TRANSACCION
            await pool.query('COMMIT');
            return res.jsonp({ message: 'Registro realizado con éxito.' });

        } catch (error) {
            console.log('response_accion: ', error)
            await pool.query('ROLLBACK');
            return res.status(500).jsonp({ message: error });
        }
    }

    // TABLA INFORMACION DE ACCION PERSONAL POR EMPLEADO
    public async pedidoAccionPersonal(req: Request, res: Response): Promise<Response>{
        try {
            const { id } = req.body;

            // CONSULTAR PARA OPTENER LOS DATOS DEL PEDIDO
            // INICIAR TRANSACCION
            await pool.query('BEGIN');
            const response = await pool.query(
            `
                

            `, [id]);

            const [datos] = response.rows;
            // FINALIZAR TRANSACCION
            await pool.query('COMMIT');


            return res.status(404).jsonp({ message: 'error' });

        } catch (error) {
            console.log('response_accion: ', error)
            await pool.query('ROLLBACK');
            return res.status(500).jsonp({ message: error });
        }
    }














    
    public async ActualizarPedidoAccionPersonal(req: Request, res: Response): Promise<Response> {
        try {
            const { id_empleado, fec_creacion, fec_rige_desde, fec_rige_hasta, identi_accion_p, num_partida,
                decre_acue_resol, abrev_empl_uno, firma_empl_uno, abrev_empl_dos, firma_empl_dos, adicion_legal,
                tipo_accion, cargo_propuesto, proceso_propuesto, num_partida_propuesta,
                salario_propuesto, id_ciudad, id_empl_responsable, num_partida_individual, act_final_concurso,
                fec_act_final_concurso, nombre_reemp, puesto_reemp, funciones_reemp, num_accion_reemp,
                primera_fecha_reemp, posesion_notificacion, descripcion_pose_noti, id, user_name, ip, ip_local } = req.body;

            let datosNuevos = req.body;

            // INICIAR TRANSACCION
            await pool.query('BEGIN');

            // CONSULTAR DATOS ANTES DE ACTUALIZAR PARA PODER REALIZAR EL REGISTRO EN AUDITORIA
            const response = await pool.query(
                `
                SELECT * FROM map_solicitud_accion_personal WHERE id = $1
                `
                , [id]);
            const [datos] = response.rows;

            if (!datos) {
                await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                    tabla: 'map_solicitud_accion_personal',
                    usuario: user_name,
                    accion: 'U',
                    datosOriginales: '',
                    datosNuevos: '',
                    ip: ip,
                    ip_local: ip_local,
                    observacion: `Error al actualizar el registro con id: ${id}`
                });
                // FINALIZAR TRANSACCION
                await pool.query('COMMIT');
                return res.status(404).jsonp({ message: 'error' });
            }

            await pool.query(
                `
                UPDATE map_solicitud_accion_personal SET id_empleado = $1, fecha_creacion = $2, fecha_rige_desde = $3, 
                    fecha_rige_hasta = $4, identificacion_accion_personal = $5, numero_partida_empresa = $6, 
                    id_contexto_legal = $7, titulo_empleado_uno = $8, firma_empleado_uno = $9, titulo_empleado_dos = $10, 
                    firma_empleado_dos = $11, adicion_legal = $12, id_detalle_tipo_accion_personal = $13, 
                    id_cargo_propuesto = $14, id_proceso_propuesto = $15, numero_partida_propuesta = $16, 
                    salario_propuesto = $17, id_ciudad = $18, id_empleado_responsable = $19, numero_partida_individual = $20,
                    acta_final_concurso = $21, fecha_acta_final_concurso = $22, nombre_reemplazo = $23, 
                    puesto_reemplazo = $24, funciones_reemplazo = $25, numero_accion_reemplazo = $26, 
                    primera_fecha_reemplazo = $27, posesion_notificacion = $28, descripcion_posesion_notificacion = $29 
                WHERE id = $30
                `
                , [id_empleado, fec_creacion, fec_rige_desde, fec_rige_hasta, identi_accion_p, num_partida,
                    decre_acue_resol, abrev_empl_uno, firma_empl_uno, abrev_empl_dos, firma_empl_dos, adicion_legal,
                    tipo_accion, cargo_propuesto, proceso_propuesto, num_partida_propuesta,
                    salario_propuesto, id_ciudad, id_empl_responsable, num_partida_individual, act_final_concurso,
                    fec_act_final_concurso, nombre_reemp, puesto_reemp, funciones_reemp, num_accion_reemp,
                    primera_fecha_reemp, posesion_notificacion, descripcion_pose_noti, id]);

            delete datosNuevos.user_name;
            delete datosNuevos.ip;
            var fechaCreacionN = await FormatearFecha2(fec_creacion, 'ddd');
            var fecha_rige_desdeN = await FormatearFecha2(fec_rige_desde, 'ddd');
            var fecha_rige_hastaN = await FormatearFecha2(fec_rige_hasta, 'ddd');
            var primera_fecha_reemplazoN = await FormatearFecha2(primera_fecha_reemp, 'ddd');
            var fecha_acta_final_concursoN = await FormatearFecha2(fec_act_final_concurso, 'ddd');
            var fechaCreacionO = await FormatearFecha2(datos.fecha_creacion, 'ddd');
            var fecha_rige_desdeO = await FormatearFecha2(datos.fecha_rige_desde, 'ddd');
            var fecha_rige_hastaO = await FormatearFecha2(datos.fecha_rige_hasta, 'ddd');
            var primera_fecha_reemplazoO = await FormatearFecha2(datos.primera_fecha_reemplazo, 'ddd');
            var fecha_acta_final_concursoO = await FormatearFecha2(datos.fecha_acta_final_concurso, 'ddd');

            // INSERTAR REGISTRO DE AUDITORIA
            await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                tabla: 'map_solicitud_accion_personal',
                usuario: user_name,
                accion: 'U',
                datosOriginales: `{id_empleado: ${datos.id_empleado}, fecha_creacion: ${fechaCreacionO}, fecha_rige_desde: ${fecha_rige_desdeO}, 
                fecha_rige_hasta: ${fecha_rige_hastaO}, identificacion_accion_personal: ${datos.identificacion_accion_personal}, numero_partida_empresa: ${datos.numero_partida_empresa}, id_contexto_legal: ${datos.id_contexto_legal}, 
                titulo_empleado_uno: ${datos.titulo_empleado_uno}, firma_empleado_uno: ${datos.firma_empleado_uno}, titulo_empleado_dos: ${datos.titulo_empleado_dos}, firma_empleado_dos: ${datos.firma_empleado_dos}, adicion_legal: ${datos.adicion_legal}, 
                id_detalle_tipo_accion_personal: ${datos.id_detalle_tipo_accion_personal}, id_cargo_propuesto: ${datos.id_cargo_propuesto}, id_proceso_propuesto: ${datos.id_proceso_propuesto}, numero_partida_propuesta: ${datos.numero_partida_propuesta}, 
                salario_propuesto: ${datos.salario_propuesto}, id_ciudad: ${datos.id_ciudad}, id_empleado_responsable: ${datos.id_empleado_responsable}, numero_partida_individual: ${datos.numero_partida_individual}, acta_final_concurso: ${datos.acta_final_concurso}, 
                fecha_acta_final_concurso: ${fecha_acta_final_concursoO}, nombre_reemplazo: ${datos.nombre_reemplazo}, puesto_reemplazo: ${datos.puesto_reemplazo}, funciones_reemplazo: ${datos.funciones_reemplazo}, 
                numero_accion_reemplazo: ${datos.numero_accion_reemplazo},primera_fecha_reemplazo: ${primera_fecha_reemplazoO}, posesion_notificacion: ${datos.posesion_notificacion}, 
                descripcion_posesion_notificacion: ${datos.descripcion_posesion_notificacion}}`,
                datosNuevos: `{id_empleado: ${id_empleado}, fecha_creacion: ${fechaCreacionN}, fecha_rige_desde: ${fecha_rige_desdeN}, 
                fecha_rige_hasta: ${fecha_rige_hastaN}, identificacion_accion_personal: ${identi_accion_p}, numero_partida_empresa: ${num_partida}, id_contexto_legal: ${decre_acue_resol}, 
                titulo_empleado_uno: ${abrev_empl_uno}, firma_empleado_uno: ${firma_empl_uno}, titulo_empleado_dos: ${abrev_empl_dos}, firma_empleado_dos: ${firma_empl_dos}, adicion_legal: ${adicion_legal}, 
                id_detalle_tipo_accion_personal: ${tipo_accion}, id_cargo_propuesto: ${cargo_propuesto}, id_proceso_propuesto: ${proceso_propuesto}, numero_partida_propuesta: ${num_partida_propuesta}, 
                salario_propuesto: ${salario_propuesto}, id_ciudad: ${id_ciudad}, id_empleado_responsable: ${id_empl_responsable}, numero_partida_individual: ${num_partida_individual}, acta_final_concurso: ${act_final_concurso}, 
                fecha_acta_final_concurso: ${fecha_acta_final_concursoN}, nombre_reemplazo: ${nombre_reemp}, puesto_reemplazo: ${puesto_reemp}, funciones_reemplazo: ${funciones_reemp}, 
                numero_accion_reemplazo: ${num_accion_reemp},primera_fecha_reemplazo: ${primera_fecha_reemplazoN}, posesion_notificacion: ${posesion_notificacion}, 
                descripcion_posesion_notificacion: ${descripcion_pose_noti}}`,
                ip: ip,
                ip_local: ip_local,
                observacion: null
            });

            // FINALIZAR TRANSACCION
            await pool.query('COMMIT');
            return res.jsonp({ message: 'Registro actualizado.' });
        } catch (error) {
            await pool.query('ROLLBACK');
            return res.status(500).jsonp({ message: 'error' });

        }
    }





    // CONSULTAS GENERACIÓN DE PDF
    public async EncontrarDatosEmpleados(req: Request, res: Response) {
        const { id } = req.params;
        const EMPLEADO = await pool.query(
            `
            SELECT d.id, d.nombre, d.apellido, d.identificacion, d.codigo, d.id_cargo, 
                ec.sueldo, d.name_cargo AS cargo, d.name_dep AS departamento 
            FROM informacion_general AS d, eu_empleado_cargos AS ec
            WHERE d.id_cargo = ec.id AND d.id = $1
            `
            , [id]);
        if (EMPLEADO.rowCount != 0) {
            return res.jsonp(EMPLEADO.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'No se encuentran registros.' });
        }
    }

    public async EncontrarDatosCiudades(req: Request, res: Response) {
        const { id } = req.params;
        const CIUDAD = await pool.query(
            `
            SELECT * FROM e_ciudades where id = $1
            `
            , [id]);
        if (CIUDAD.rowCount != 0) {
            return res.json(CIUDAD.rows)
        } else {
            return res.status(404).jsonp({ text: 'No se encuentran registros.' });
        }
    }

    public async EncontrarPedidoAccion(req: Request, res: Response) {
        const { id } = req.params;
        const ACCION = await pool.query(
            `
            SELECT 
                    ap.id, 
					ap.numero_accion_personal, 
					ap.fecha_elaboracion, 
                    ap.hora_elaboracion,
                    CONCAT(inf.nombre, ' ', inf.apellido) AS nombres, 
                    ap.fecha_rige_desde, ap.fecha_rige_hasta, 
                    ap.id_tipo_accion_personal, 
					tp.descripcion AS accion_personal, 
                    ap.id_detalle_tipo_accion, dtp.descripcion, ap.detalle_otro,
                    ap.especificacion, ap.declaracion_jurada, ap.adicion_base_legal, 
                    ap.observacion, ap.id_proceso_actual, ps.nombre AS proceso_actual,
                    inf.identificacion As cedula_empleado,
                    -- NIVEL DE GESTION ACTUAL
                    ap.id_nivel_gestion_actual,
                    (SELECT nombre FROM ed_departamentos WHERE id = ap.id_nivel_gestion_actual) AS nivel_gestion_actual,
                    -- UNIDAD ADMINISTRATIVA ACTUAL
                    ap.id_unidad_administrativa,
                    (SELECT nombre FROM ed_departamentos WHERE id = ap.id_unidad_administrativa) AS unidad_administrativa,
                    -- SUCURSAL ACTUAL
                    ap.id_sucursal_actual,
                    (SELECT nombre FROM e_sucursales WHERE id = ap.id_sucursal_actual) AS sucursal_actual,
                    -- TRABAJO ACTUAL
                    ap.id_lugar_trabajo_actual,
                    (SELECT descripcion FROM e_ciudades WHERE id = ap.id_lugar_trabajo_actual) AS lugar_trabajo_actual,

                    ap.id_tipo_cargo_actual, inf.name_cargo AS cargo_actual,
                    -- GRUPO OCUPACIONAL ACTUAL
                    ap.id_grupo_ocupacional_actual,
                    (SELECT descripcion FROM map_cat_grupo_ocupacional WHERE id = ap.id_grupo_ocupacional_actual) AS grupo_ocupacional_actual,
                    -- GRADO ACTUAL
                    ap.id_grado_actual,
                    (SELECT descripcion FROM map_cat_grado WHERE id = ap.id_grado_actual) AS grado_actual,
                    ap.remuneracion_actual, ap.partida_individual_actual,
                    -- PROCESO PROPUESTO
                    ap.id_proceso_propuesto,
                    (SELECT nombre FROM map_cat_procesos WHERE id = ap.id_proceso_propuesto) AS proceso_propuesto,
                    -- NIVEL DE GESTIO PROPUESTA
                    ap.id_nivel_gestion_propuesto,
                    (SELECT nombre FROM ed_departamentos WHERE id = ap.id_nivel_gestion_propuesto) AS nivel_gestion_propuesto,
                    -- UNIDAD ADMINISTRATIVA PROPUESTA
                    ap.id_unidad_adminsitrativa_propuesta,
                    (SELECT nombre FROM ed_departamentos WHERE id = ap.id_unidad_adminsitrativa_propuesta) AS unidad_administrativa_propuesta,
                    -- SUCURSAL PROPUESTA
                    ap.id_sucursal_propuesta,
                    (SELECT nombre FROM e_sucursales WHERE id = ap.id_sucursal_propuesta) AS sucursal_propuesto,
                    -- LUGAR DE TRABAJO PROPUESTA
                    ap.id_lugar_trabajo_propuesto,
                    (SELECT descripcion FROM e_ciudades WHERE id = ap.id_lugar_trabajo_propuesto) AS lugar_trabajo_propuesto,
                    -- CARGO PROPUESTO
                    ap.id_tipo_cargo_propuesto,
                    (SELECT cargo FROM e_cat_tipo_cargo WHERE id = ap.id_tipo_cargo_propuesto) AS cargo_propuesto,
                    -- GRUPO OCUPACIONAL PROPUESTO
                    ap.id_grupo_ocupacional_propuesto,
                    (SELECT descripcion FROM map_cat_grupo_ocupacional WHERE id = ap.id_grupo_ocupacional_propuesto) AS grupo_ocupacional_propuesto,
                    -- GRADO PROPUESTO
                    ap.id_grado_propuesto,
                    (SELECT descripcion FROM map_cat_grado WHERE id = ap.id_grado_propuesto) AS grado_propuesto,
                
                    ap.remuneracion_propuesta, ap.partida_individual_propuesta,
                    -- POSESION DEL PUESTO
                    ap.lugar_posesion,
                    (SELECT descripcion FROM e_ciudades WHERE id = ap.lugar_posesion) AS descripcion_lugar_posesion,
                    ap.fecha_posesion, ap.numero_acta_final, ap.fecha_acta_final,

                    ap.id_empleado_director,
                    (SELECT CONCAT(nombre, ' ', apellido) FROM informacion_general WHERE id = ap.id_empleado_director) AS empleado_director,
                    ap.id_tipo_cargo_director,
                    (SELECT cargo FROM e_cat_tipo_cargo WHERE id = ap.id_tipo_cargo_director) AS cargo_director,

                    ap.id_empleado_autoridad_delegado,
                    (SELECT CONCAT(nombre, ' ', apellido) FROM informacion_general WHERE id = ap.id_empleado_autoridad_delegado) AS empleado_autoridad_delegado,
                    ap.id_tipo_cargo_autoridad_delegado,
                    (SELECT cargo FROM e_cat_tipo_cargo WHERE id = ap.id_tipo_cargo_autoridad_delegado) AS cargo_autoridad_delegado,

                    ap.id_empleado_testigo,
                    (SELECT CONCAT(nombre, ' ', apellido) FROM informacion_general WHERE id = ap.id_empleado_testigo) AS empleado_testigo,
                    ap.fecha_testigo,

                    ap.id_empleado_elaboracion,
                    (SELECT CONCAT(nombre, ' ', apellido) FROM informacion_general WHERE id = ap.id_empleado_elaboracion) AS empleado_elaboracion,
                    ap.id_tipo_cargo_elaboracion,
                    (SELECT cargo FROM e_cat_tipo_cargo WHERE id = ap.id_tipo_cargo_elaboracion) AS tipo_cargo_elaboracion,

                    ap.id_empleado_revision,
                    (SELECT CONCAT(nombre, ' ', apellido) FROM informacion_general WHERE id = ap.id_empleado_revision) AS empleado_revision,
                    ap.id_tipo_cargo_revision,
                    (SELECT cargo FROM e_cat_tipo_cargo WHERE id = ap.id_tipo_cargo_revision) AS tipo_cargo_revision,

                    ap.id_empleado_control,
                    (SELECT CONCAT(nombre, ' ', apellido) FROM informacion_general WHERE id = ap.id_empleado_control) AS empleado_control,
                    ap.id_tipo_cargo_control,
                    (SELECT cargo FROM e_cat_tipo_cargo WHERE id = ap.id_tipo_cargo_control) AS tipo_cargo_control,

                    ap.comunicacion_electronica, ap.fecha_comunicacion, ap.hora_comunicacion, 
                    ap.medio_comunicacion, ap.id_empleado_comunicacion,
                    (SELECT CONCAT(nombre, ' ', apellido) FROM informacion_general WHERE id = ap.id_empleado_comunicacion) AS empleado_comunicacion,
                    ap.id_tipo_cargo_comunicacion,
                    (SELECT cargo FROM e_cat_tipo_cargo WHERE id = ap.id_tipo_cargo_comunicacion) AS cargo_comunicacion,

                    ap.fecha_registro, ap.fecha_actualizacion, ap.proceso, ap.id_vacacion

                FROM map_documento_accion_personal AS ap
                    INNER JOIN informacion_general AS inf ON inf.id = ap.id_empleado_personal
                    INNER JOIN map_tipo_accion_personal AS tp ON tp.id = ap.id_tipo_accion_personal
                    INNER JOIN map_detalle_tipo_accion_personal AS dtp ON dtp.id = ap.id_detalle_tipo_accion
                    INNER JOIN map_cat_procesos AS ps ON ps.id = ap.id_proceso_actual

                WHERE ap.id = $1`
            , [id]);
        if (ACCION.rowCount != 0) {
            return res.jsonp(ACCION.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'No se encuentran registros' });
        }
    }

    // METODO PARA BUSCAR PEDIDOS DE ACCION DE PERSONAL  **USADO
    public async ListarPedidoAccion(req: Request, res: Response) {
        const ACCION = await pool.query(
            `
                SELECT 
                    ap.id, 
	                ap.numero_accion_personal, 
	                ap.fecha_elaboracion, 
                    CONCAT(inf.nombre, ' ', inf.apellido) AS nombres, 
                    ap.fecha_rige_desde, ap.fecha_rige_hasta, 
                    ap.id_tipo_accion_personal, 
	                tp.descripcion AS accion_personal, 
                    ap.id_detalle_tipo_accion, 
	                dtp.descripcion, 
	                ap.proceso, 
	                ap.id_vacacion
                FROM map_documento_accion_personal AS ap
                    INNER JOIN informacion_general AS inf ON inf.id = ap.id_empleado_personal
                    INNER JOIN map_tipo_accion_personal AS tp ON tp.id = ap.id_tipo_accion_personal
                    INNER JOIN map_detalle_tipo_accion_personal AS dtp ON dtp.id = ap.id_detalle_tipo_accion
            `
        );
        if (ACCION.rowCount != 0) {
            return res.jsonp(ACCION.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'No se encuentran registros' });
        }
    }

    public async EncontrarProcesosRecursivos(req: Request, res: Response) {
        const { id } = req.params;
        const ACCION = await pool.query(
            `
            WITH RECURSIVE procesos AS 
            ( 
            SELECT id, nombre, proceso_padre, 1 AS numero FROM map_cat_procesos WHERE id = $1 
            UNION ALL 
            SELECT cg.id, cg.nombre, cg.proceso_padre, procesos.numero + 1 AS numero FROM map_cat_procesos cg 
            JOIN procesos ON cg.id = procesos.proceso_padre 
            ) 
            SELECT UPPER(nombre) AS nombre, numero FROM procesos ORDER BY numero DESC
            `
            , [id]);
        if (ACCION.rowCount != 0) {
            return res.jsonp(ACCION.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'No se encuentran registros' });
        }
    }


}

export const ACCION_PERSONAL_CONTROLADOR = new AccionPersonalControlador();

export default ACCION_PERSONAL_CONTROLADOR;