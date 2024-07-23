import AUDITORIA_CONTROLADOR from '../../auditoria/auditoriaControlador';
import { ObtenerIndicePlantilla, ObtenerRutaLeerPlantillas } from '../../../libs/accesoCarpetas';
import { ObtenerRutaContrato } from '../../../libs/accesoCarpetas';
import { Request, Response } from 'express';
import { FormatearFecha2 } from '../../../libs/settingsMail';
import { QueryResult } from 'pg';
import moment from 'moment';
import excel from 'xlsx';
import pool from '../../../database';
import path from 'path';
import fs from 'fs';

class ContratoEmpleadoControlador {

    // REGISTRAR CONTRATOS
    public async CrearContrato(req: Request, res: Response): Promise<Response> {

        const { id_empleado, fec_ingreso, fec_salida, vaca_controla, asis_controla,
            id_regimen, id_tipo_contrato, user_name, ip, subir_documento } = req.body;

        let verificar_contrato = 0;

        // CREAR CARPETA DE CONTRATOS
        if (subir_documento === true) {
            // RUTA DE LA CARPETA CONTRATOS DEL USUARIO
            const carpetaContratos = await ObtenerRutaContrato(id_empleado);

            // VERIFICACION DE EXISTENCIA CARPETA CONTRATOS DE USUARIO
            fs.access(carpetaContratos, fs.constants.F_OK, (err) => {
                if (err) {
                    // METODO MKDIR PARA CREAR LA CARPETA
                    fs.mkdir(carpetaContratos, { recursive: true }, (err: any) => {
                        if (err) {
                            verificar_contrato = 1;
                        } else {
                            verificar_contrato = 0;
                        }
                    });
                } else {
                    verificar_contrato = 0
                }
            });
        }

        if (verificar_contrato === 0) {
            try {
                // INICIAR TRANSACCION
                await pool.query('BEGIN');

                const response: QueryResult = await pool.query(
                    `
                    INSERT INTO eu_empleado_contratos (id_empleado, fecha_ingreso, fecha_salida, controlar_vacacion, 
                        controlar_asistencia, id_regimen, id_modalidad_laboral) 
                    VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *
                    `,
                    [id_empleado, fec_ingreso, fec_salida, vaca_controla, asis_controla, id_regimen,
                        id_tipo_contrato]);

                const [contrato] = response.rows;

                // AUDITORIA
                const fechaIngresoN = await FormatearFecha2(fec_ingreso, 'ddd');
                const fechaSalidaN = await FormatearFecha2(fec_salida, 'ddd');

                contrato.fecha_ingreso = fechaIngresoN;
                contrato.fecha_salida = fechaSalidaN;

                // AUDITORIA
                await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                    tabla: 'eu_empleado_contratos',
                    usuario: user_name,
                    accion: 'I',
                    datosOriginales: '',
                    datosNuevos: JSON.stringify(contrato),
                    ip,
                    observacion: null
                });

                // FINALIZAR TRANSACCION
                await pool.query('COMMIT');

                if (contrato) {
                    return res.status(200).jsonp(contrato)
                }
                else {
                    return res.status(404).jsonp({ message: 'error' })
                }
            } catch (error) {
                // REVERTIR TRANSACCION
                await pool.query('ROLLBACK');
                return res.status(500).jsonp({ message: 'Error al guardar el registro.' });
            }
        }
        else {
            return res.jsonp({ message: 'error_carpeta' })
        }
    }

    // METODO PARA GUARDAR DOCUMENTO
    public async GuardarDocumentoContrato(req: Request, res: Response): Promise<Response> {
        try {
            // FECHA DEL SISTEMA
            var fecha = moment();
            var anio = fecha.format('YYYY');
            var mes = fecha.format('MM');
            var dia = fecha.format('DD');

            const { user_name, ip } = req.body;

            let id = req.params.id;

            // INICIAR TRANSACCION
            await pool.query('BEGIN');

            const response: QueryResult = await pool.query(
                `
                SELECT * FROM eu_empleados AS e, eu_empleado_contratos AS c WHERE c.id = $1 AND c.id_empleado = e.id
                `
                , [id]);

            const [empleado] = response.rows;

            let documento = empleado.codigo + '_' + anio + '_' + mes + '_' + dia + '_' + req.file?.originalname;

            if (!empleado) {
                // AUDITORIA
                await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                    tabla: 'eu_empleado_contratos',
                    usuario: user_name,
                    accion: 'U',
                    datosOriginales: '',
                    datosNuevos: '',
                    ip,
                    observacion: `Error al actualizar el documento del contrato con id ${id}. Registro no encontrado.`
                });

                // FINALIZAR TRANSACCION
                await pool.query('COMMIT');
                return res.status(404).jsonp({ message: 'Error al guardar el documento.' });
            }

            await pool.query(
                `
                UPDATE eu_empleado_contratos SET documento = $2 WHERE id = $1 RETURNING *
                `
                , [id, documento]);

            var fechaIngresoO = await FormatearFecha2(empleado.fecha_ingreso, 'ddd');
            var fechaSalidaO = await FormatearFecha2(empleado.fecha_salida, 'ddd');
            // AUDITORIA
            await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                tabla: 'eu_empleado_contratos',
                usuario: user_name,
                accion: 'U',
                datosOriginales: `{id: ${empleado.id}, id_empleado: ${empleado.id_empleado}, id_regimen: ${empleado.id_regimen}, id_modalidad_laboral: ${empleado.id_modalidad_laboral}, fecha_ingreso: ${fechaIngresoO}, fecha_salida: ${fechaSalidaO}, controlar_vacacion: ${empleado.controlar_vacacion}, controlar_asistencia: ${empleado.controlar_asistencia}, documento: ${empleado.documento}}`,
                datosNuevos: `{id: ${empleado.id}, id_empleado: ${empleado.id_empleado}, id_regimen: ${empleado.id_regimen}, id_modalidad_laboral: ${empleado.id_modalidad_laboral}, fecha_ingreso: ${fechaIngresoO}, fecha_salida: ${fechaSalidaO}, controlar_vacacion: ${empleado.controlar_vacacion}, controlar_asistencia: ${empleado.controlar_asistencia}, documento: ${documento}}`,
                ip,
                observacion: null
            });

            // FINALIZAR TRANSACCION
            await pool.query('COMMIT');
            return res.jsonp({ message: 'Documento actualizado.' });
        } catch (error) {
            // REVERTIR TRANSACCION
            await pool.query('ROLLBACK');
            return res.status(500).jsonp({ message: 'Error al guardar el documento.' });
        }
    }

    // METODO PARA VER DOCUMENTO
    public async ObtenerDocumento(req: Request, res: Response): Promise<any> {
        const docs = req.params.docs;
        const id = req.params.id;
        let separador = path.sep;
        let ruta = await ObtenerRutaContrato(id) + separador + docs;
        fs.access(ruta, fs.constants.F_OK, (err) => {
            if (err) {
            } else {
                res.sendFile(path.resolve(ruta));
            }
        });
    }


    // METODO PARA LISTAR CONTRATOS POR ID DE EMPLEADO
    public async BuscarContratoEmpleado(req: Request, res: Response): Promise<any> {
        const { id_empleado } = req.params;
        const CONTRATO_EMPLEADO = await pool.query(
            `
            SELECT ec.id, ec.fecha_ingreso, ec.fecha_salida 
            FROM eu_empleado_contratos AS ec
            WHERE ec.id_empleado = $1 ORDER BY ec.id ASC
            `
            , [id_empleado]);
        if (CONTRATO_EMPLEADO.rowCount != 0) {
            return res.jsonp(CONTRATO_EMPLEADO.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'Registro no encontrado.' });
        }
    }

    // METODO PARA CONSULTAR CONTRATOS A EXCEPCION DEL QUE SE ESTA EDITANDO
    public async BuscarContratoEmpleadoEditar(req: Request, res: Response): Promise<any> {
        const { id_empleado, id_contrato } = req.body;
        const CONTRATO_EMPLEADO = await pool.query(
            `
                SELECT ec.id, ec.fecha_ingreso, ec.fecha_salida 
                FROM eu_empleado_contratos AS ec
                WHERE ec.id_empleado = $1 AND NOT ec.id = $2 
                ORDER BY ec.id ASC
                `
            , [id_empleado, id_contrato]);
        if (CONTRATO_EMPLEADO.rowCount != 0) {
            return res.jsonp(CONTRATO_EMPLEADO.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'Registro no encontrado.' });
        }
    }

    // EDITAR DATOS DE CONTRATO
    public async EditarContrato(req: Request, res: Response): Promise<Response> {

        const { id } = req.params;
        const { fec_ingreso, fec_salida, vaca_controla, asis_controla, id_regimen,
            id_tipo_contrato, user_name, ip, subir_documento, id_empleado } = req.body;

        let verificar_contrato = 0;

        // CREAR CARPETA DE CONTRATOS
        if (subir_documento === true) {
            // RUTA DE LA CARPETA CONTRATOS DEL USUARIO
            const carpetaContratos = await ObtenerRutaContrato(id_empleado);

            // VERIFICACION DE EXISTENCIA CARPETA CONTRATOS DE USUARIO
            fs.access(carpetaContratos, fs.constants.F_OK, (err) => {
                if (err) {
                    // METODO MKDIR PARA CREAR LA CARPETA
                    fs.mkdir(carpetaContratos, { recursive: true }, (err: any) => {
                        if (err) {
                            verificar_contrato = 1;
                        } else {
                            verificar_contrato = 0;
                        }
                    });
                } else {
                    verificar_contrato = 0
                }
            });
        }

        if (verificar_contrato === 0) {
            try {
                // INICIAR TRANSACCION
                await pool.query('BEGIN');

                // CONSULTAR DATOS ORIGINALES
                const contrato = await pool.query(
                    `
                    SELECT * FROM eu_empleado_contratos WHERE id = $1
                    `
                    , [id]);
                const [datosOriginales] = contrato.rows;

                if (!datosOriginales) {
                    // AUDITORIA
                    await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                        tabla: 'eu_empleado_contratos',
                        usuario: user_name,
                        accion: 'U',
                        datosOriginales: '',
                        datosNuevos: '',
                        ip,
                        observacion: `Error al actualizar el contrato con id ${id}. Registro no encontrado.`
                    });

                    // FINALIZAR TRANSACCION
                    await pool.query('COMMIT');
                    return res.status(404).jsonp({ message: 'Error al actualizar el registro.' });
                }

                await pool.query(
                    `
                    UPDATE eu_empleado_contratos SET fecha_ingreso = $1, fecha_salida = $2, controlar_vacacion = $3,
                        controlar_asistencia = $4, id_regimen = $5, id_modalidad_laboral = $6 
                    WHERE id = $7
                    `
                    , [fec_ingreso, fec_salida, vaca_controla, asis_controla, id_regimen,
                        id_tipo_contrato, id]);

                var fechaIngresoO = await FormatearFecha2(datosOriginales.fecha_ingreso, 'ddd');
                var fechaSalidaO = await FormatearFecha2(datosOriginales.fecha_salida, 'ddd');
                // AUDITORIA

                var fechaIngresoN = await FormatearFecha2(fec_ingreso, 'ddd');
                var fechaSalidaN = await FormatearFecha2(fec_salida, 'ddd');
                // AUDITORIA
                await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                    tabla: 'eu_empleado_contratos',
                    usuario: user_name,
                    accion: 'U',
                    datosOriginales: `{id: ${datosOriginales.id}, id_empleado: ${datosOriginales.id_empleado}, id_regimen: ${datosOriginales.id_regimen}, id_modalidad_laboral: ${datosOriginales.id_modalidad_laboral}, fecha_ingreso: ${fechaIngresoO}, fecha_salida: ${fechaSalidaO}, controlar_vacacion: ${datosOriginales.controlar_vacacion}, controlar_asistencia: ${datosOriginales.controlar_asistencia}, documento: ${datosOriginales.documento}}`,
                    datosNuevos: `{id: ${datosOriginales.id}, id_empleado: ${datosOriginales.id_empleado}, id_regimen: ${id_regimen}, id_modalidad_laboral: ${id_tipo_contrato}, fecha_ingreso: ${fechaIngresoN}, fecha_salida: ${fechaSalidaN}, controlar_vacacion: ${vaca_controla}, controlar_asistencia: ${asis_controla}, documento: ${datosOriginales.documento}}`,
                    ip,
                    observacion: null
                });

                // FINALIZAR TRANSACCION
                await pool.query('COMMIT');
                return res.jsonp({ message: 'Registro actualizado exitosamente.' });

            } catch (error) {
                // REVERTIR TRANSACCION
                await pool.query('ROLLBACK');
                return res.status(500).jsonp({ message: 'Error al actualizar el registro.' });
            }
        }
        else {
            return res.jsonp({ message: 'error' });
        }
    }

    // ELIMINAR DOCUMENTO CONTRATO BASE DE DATOS - SERVIDOR
    public async EliminarDocumento(req: Request, res: Response): Promise<Response> {
        try {
            let { documento, id, user_name, ip } = req.body;
            let separador = path.sep;

            // INICIAR TRANSACCION
            await pool.query('BEGIN');

            // CONSULTAR DATOS ORIGINALES
            const contratoConsulta = await pool.query('SELECT * FROM eu_empleado_contratos WHERE id = $1', [id]);
            const [datosOriginales] = contratoConsulta.rows;

            if (!datosOriginales) {
                // AUDITORIA
                await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                    tabla: 'eu_empleado_contratos',
                    usuario: user_name,
                    accion: 'U',
                    datosOriginales: '',
                    datosNuevos: '',
                    ip,
                    observacion: `Error al eliminar el documento del contrato con id ${id}`
                });

                // FINALIZAR TRANSACCION
                await pool.query('COMMIT');
                return res.status(404).jsonp({ message: 'Error al eliminar el documento.' });
            }

            const response: QueryResult = await pool.query(
                `
                UPDATE eu_empleado_contratos SET documento = null WHERE id = $1 RETURNING *
                `
                , [id]);

            const [contrato] = response.rows;
            var fechaIngresoO = await FormatearFecha2(datosOriginales.fecha_ingreso, 'ddd');
            var fechaSalidaO = await FormatearFecha2(datosOriginales.fecha_salida, 'ddd');

            // AUDITORIA
            await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                tabla: 'eu_empleado_contratos',
                usuario: user_name,
                accion: 'U',
                datosOriginales: `{id: ${datosOriginales.id}, id_empleado: ${datosOriginales.id_empleado}, id_regimen: ${datosOriginales.id_regimen}, id_modalidad_laboral: ${datosOriginales.id_modalidad_laboral}, fecha_ingreso: ${fechaIngresoO}, fecha_salida: ${fechaSalidaO}, controlar_vacacion: ${datosOriginales.controlar_vacacion}, controlar_asistencia: ${datosOriginales.controlar_asistencia}, documento: ${datosOriginales.documento}}`,
                datosNuevos: `{id: ${datosOriginales.id}, id_empleado: ${datosOriginales.id_empleado}, id_regimen: ${datosOriginales.id_regimen}, id_modalidad_laboral: ${datosOriginales.id_modalidad_laboral}, fecha_ingreso: ${fechaIngresoO}, fecha_salida: ${fechaSalidaO}, controlar_vacacion: ${datosOriginales.controlar_vacacion}, controlar_asistencia: ${datosOriginales.controlar_asistencia}, documento: null}`,
                ip,
                observacion: null
            });

            // FINALIZAR TRANSACCION
            await pool.query('COMMIT');

            if (documento != 'null' && documento != '' && documento != null) {
                let ruta = await ObtenerRutaContrato(contrato.id_empleado) + separador + documento;
                // VERIFICAR EXISTENCIA DE CARPETA O ARCHIVO
                fs.access(ruta, fs.constants.F_OK, (err) => {
                    if (err) {
                    } else {
                        // ELIMINAR DEL SERVIDOR
                        fs.unlinkSync(ruta);
                    }
                });
            }

            return res.jsonp({ message: 'Documento actualizado.' });
        } catch (error) {
            // REVERTIR TRANSACCION
            await pool.query('ROLLBACK');
            return res.status(500).jsonp({ message: 'Error al eliminar el documento.' });
        }
    }

    // ELIMINAR DOCUMENTO CONTRATO DEL SERVIDOR
    public async EliminarDocumentoServidor(req: Request, res: Response): Promise<void> {
        let { documento, id } = req.body;
        let separador = path.sep;
        if (documento != 'null' && documento != '' && documento != null) {
            let ruta = await ObtenerRutaContrato(id) + separador + documento;
            // VERIFICAR EXISTENCIA DE CARPETA O ARCHIVO
            fs.access(ruta, fs.constants.F_OK, (err) => {
                if (err) {
                } else {
                    // ELIMINAR DEL SERVIDOR
                    fs.unlinkSync(ruta);
                }
            });;
        }
        res.jsonp({ message: 'Documento actualizado.' });
    }

    // METODO PARA BUSCAR ID ACTUAL
    public async EncontrarIdContratoActual(req: Request, res: Response): Promise<any> {
        const { id_empleado } = req.params;
        const CONTRATO = await pool.query(
            `
            SELECT MAX(ec.id) FROM eu_empleado_contratos AS ec, eu_empleados AS e 
            WHERE ec.id_empleado = e.id AND e.id = $1
            `
            , [id_empleado]);
        if (CONTRATO.rowCount != 0) {
            if (CONTRATO.rows[0]['max'] != null) {
                return res.jsonp(CONTRATO.rows)
            }
            else {
                return res.status(404).jsonp({ text: 'Registro no encontrado.' });
            }
        }
        else {
            return res.status(404).jsonp({ text: 'Registro no encontrado.' });
        }
    }

    // METODO PARA BUSCAR DATOS DE CONTRATO POR ID 
    public async EncontrarDatosUltimoContrato(req: Request, res: Response): Promise<any> {
        const { id } = req.params;
        const CONTRATO = await pool.query(
            `
            SELECT ec.id, ec.id_empleado, ec.id_regimen, ec.fecha_ingreso, ec.fecha_salida, ec.controlar_vacacion,
                ec.controlar_asistencia, ec.documento, ec.id_modalidad_laboral, cr.descripcion,
                cr.mes_periodo, mt.descripcion AS nombre_contrato 
            FROM eu_empleado_contratos AS ec, ere_cat_regimenes AS cr, e_cat_modalidad_trabajo AS mt 
            WHERE ec.id = $1 AND ec.id_regimen = cr.id AND mt.id = ec.id_modalidad_laboral
            `
            , [id]);
        if (CONTRATO.rowCount != 0) {
            return res.jsonp(CONTRATO.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'Registro no encontrado.' });
        }
    }

    // METODO PARA BUSCAR FECHAS DE CONTRATOS    --**VERIFICADO
    public async EncontrarFechaContrato(req: Request, res: Response): Promise<any> {
        const { id_empleado } = req.body;
        const FECHA = await pool.query(
            `
            SELECT ca.id_contrato, ec.fecha_ingreso, ec.fecha_salida
            FROM datos_contrato_actual AS ca, eu_empleado_contratos AS ec
            WHERE ca.id = $1 AND ec.id = ca.id_contrato
            `
            , [id_empleado]);
        if (FECHA.rowCount != 0) {
            return res.jsonp(FECHA.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'Registro no encontrado.' });
        }
    }


    /** **************************************************************************** ** 
     ** **          METODOS PARA LA TABLA MODALIDAD_TRABAJO O TIPO DE CONTRATOS       ** **
     ** **************************************************************************** **/

    // LISTAR TIPOS DE MODALIDAD DE TRABAJO
    public async ListarTiposContratos(req: Request, res: Response) {
        const CONTRATOS = await pool.query(
            `
            SELECT * FROM e_cat_modalidad_trabajo
            `
        );
        if (CONTRATOS.rowCount != 0) {
            return res.jsonp(CONTRATOS.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'No se encuentran registros.' });
        }
    }

    // REGISTRAR MODALIDAD DE TRABAJO
    public async CrearTipoContrato(req: Request, res: Response): Promise<Response> {
        try {
            const { descripcion, user_name, ip } = req.body;

            // INICIAR TRANSACCION
            await pool.query('BEGIN');

            const response: QueryResult = await pool.query(
                `
                INSERT INTO e_cat_modalidad_trabajo (descripcion) VALUES ($1) RETURNING *
                `,
                [descripcion]);


            const [contrato] = response.rows;

            // AUDITORIA
            await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                tabla: 'e_cat_modalidad_trabajo',
                usuario: user_name,
                accion: 'I',
                datosOriginales: '',
                datosNuevos: JSON.stringify(contrato),
                ip,
                observacion: null
            });

            if (contrato) {
                return res.status(200).jsonp(contrato)
            }
            else {
                return res.status(404).jsonp({ message: 'error' })
            }
        } catch (error) {
            // REVERTIR TRANSACCION
            await pool.query('ROLLBACK');
            return res.status(500).jsonp({ message: 'Error al guardar el registro.' });
        }

    }

    // METODO PARA BUSCAR MODALIDAD LABORAL POR NOMBRE
    public async BuscarModalidadLaboralNombre(req: Request, res: Response) {
        const { nombre } = req.body;
        const CONTRATOS = await pool.query(
            `
            SELECT * FROM e_cat_modalidad_trabajo WHERE UPPER(descripcion) = $1
            `
            , [nombre]
        );
        if (CONTRATOS.rowCount != 0) {
            return res.jsonp(CONTRATOS.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'No se encuentran registros.' });
        }
    }

    public async EncontrarFechaContratoId(req: Request, res: Response): Promise<any> {
        const { id_contrato } = req.body;
        const FECHA = await pool.query(
            `
            SELECT contrato.fecha_ingreso FROM eu_empleado_contratos AS contrato
            WHERE contrato.id = $1
            `
            , [id_contrato]);
        if (FECHA.rowCount != 0) {
            return res.jsonp(FECHA.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'Registro no encontrado.' });
        }
    }

    // METODO PARA REVISAR LOS DATOS DE LA PLANTILLA DENTRO DEL SISTEMA - MENSAJES DE CADA ERROR
    public async RevisarDatos(req: Request, res: Response): Promise<any> {
        const documento = req.file?.originalname;
        let separador = path.sep;
        let ruta = ObtenerRutaLeerPlantillas() + separador + documento;
        const workbook = excel.readFile(ruta);
        let verificador = ObtenerIndicePlantilla(workbook, 'EMPLEADOS_CONTRATOS');
        if (verificador === false) {
            return res.jsonp({ message: 'no_existe', data: undefined });
        }
        else {
            const sheet_name_list = workbook.SheetNames;
            const plantilla = excel.utils.sheet_to_json(workbook.Sheets[sheet_name_list[verificador]]);
            let data: any = {
                fila: '',
                cedula: '',
                pais: '',
                regimen_la: '',
                modalida_la: '',
                fecha_desde: '',
                fecha_hasta: '',
                control_asis: '',
                control_vaca: '',
                observacion: ''
            };

            var listContratos: any = [];
            var duplicados: any = [];
            var mensaje: string = 'correcto';


            // LECTURA DE LOS DATOS DE LA PLANTILLA
            plantilla.forEach(async (dato: any) => {
                var { ITEM, CEDULA, PAIS, REGIMEN_LABORAL, MODALIDAD_LABORAL, FECHA_DESDE, FECHA_HASTA,
                    CONTROLAR_ASISTENCIA, CONTROLAR_VACACIONES, TIPO_CARGO } = dato;

                //Verificar que el registo no tenga datos vacios
                if ((ITEM != undefined && ITEM != '') && (CEDULA != undefined) && (PAIS != undefined) &&
                    (REGIMEN_LABORAL != undefined) && (MODALIDAD_LABORAL != undefined) && (FECHA_DESDE != undefined) &&
                    (FECHA_HASTA != undefined) && (CONTROLAR_ASISTENCIA != undefined) && (CONTROLAR_VACACIONES != undefined) &&
                    (TIPO_CARGO != undefined)) {
                    data.fila = ITEM;
                    data.cedula = CEDULA; data.pais = PAIS;
                    data.regimen_la = REGIMEN_LABORAL; data.modalida_la = MODALIDAD_LABORAL;
                    data.fecha_desde = FECHA_DESDE; data.fecha_hasta = FECHA_HASTA;
                    data.control_asis = CONTROLAR_ASISTENCIA; data.control_vaca = CONTROLAR_VACACIONES;

                    data.observacion = 'no registrado';

                    //Valida si los datos de la columna cedula son numeros.
                    const rege = /^[0-9]+$/;
                    if (rege.test(data.cedula)) {
                        if (data.cedula.toString().length != 10) {
                            data.observacion = 'La cédula ingresada no es válida';
                        } else {
                            // Verificar si la variable tiene el formato de fecha correcto con moment
                            if (moment(FECHA_DESDE, 'YYYY-MM-DD', true).isValid()) {
                                // Verificar si la variable tiene el formato de fecha correcto con moment
                                if (moment(FECHA_HASTA, 'YYYY-MM-DD', true).isValid()) { } else {
                                    data.observacion = 'Formato de fecha hasta incorrecta (YYYY-MM-DD)';
                                }
                            } else {
                                data.observacion = 'Formato de fecha desde incorrecta (YYYY-MM-DD)';
                            }


                        }
                    } else {
                        data.observacion = 'La cédula ingresada no es válida';
                    }

                    listContratos.push(data);

                } else {
                    data.fila = ITEM;
                    data.cedula = CEDULA; data.pais = PAIS;
                    data.regimen_la = REGIMEN_LABORAL; data.modalida_la = MODALIDAD_LABORAL;
                    data.fecha_desde = FECHA_DESDE; data.fecha_hasta = FECHA_HASTA;
                    data.control_asis = CONTROLAR_ASISTENCIA; data.control_vaca = CONTROLAR_VACACIONES;

                    data.observacion = 'no registrado';

                    if (data.fila == '' || data.fila == undefined) {
                        data.fila = 'error';
                        mensaje = 'error'
                    }
                    if (PAIS == undefined) {
                        data.pais = 'No registrado';
                        data.observacion = 'Pais ' + data.observacion;
                    }
                    if (REGIMEN_LABORAL == undefined) {
                        data.regimen_la = 'No registrado';
                        data.observacion = 'Régimen laboral ' + data.observacion;
                    }
                    if (MODALIDAD_LABORAL == undefined) {
                        data.modalida_la = 'No registrado';
                        data.observacion = 'Modalidad laboral ' + data.observacion;
                    }
                    if (FECHA_DESDE == undefined) {
                        data.fecha_desde = 'No registrado';
                        data.observacion = 'Fecha desde ' + data.observacion;
                    }
                    if (FECHA_HASTA == undefined) {
                        data.fecha_hasta = 'No registrado';
                        data.observacion = 'Fecha hasta ' + data.observacion;
                    }
                    if (CONTROLAR_ASISTENCIA == undefined) {
                        data.control_asis = 'No registrado';
                        data.observacion = 'Control asistencia ' + data.observacion;
                    }
                    if (CONTROLAR_VACACIONES == undefined) {
                        data.control_vaca = 'No registrado';
                        data.observacion = 'Control vacaciones ' + data.observacion;
                    }

                    if (CEDULA == undefined) {
                        data.cedula = 'No registrado'
                        data.observacion = 'Cédula ' + data.observacion;
                    } else {
                        //Valida si los datos de la columna cedula son numeros.
                        const rege = /^[0-9]+$/;
                        if (rege.test(data.cedula)) {
                            if (data.cedula.toString().length != 10) {
                                data.observacion = 'La cédula ingresada no es válida';
                            } else {
                                // Verificar si la variable tiene el formato de fecha correcto con moment
                                if (data.fecha_desde != 'No registrado') {
                                    if (moment(FECHA_DESDE, 'YYYY-MM-DD', true).isValid()) {
                                        // Verificar si la variable tiene el formato de fecha correcto con moment
                                        if (data.fecha_hasta != 'No registrado') {
                                            if (moment(FECHA_HASTA, 'YYYY-MM-DD', true).isValid()) {
                                                if (data.control_vaca != 'No registrado') {
                                                    if (data.control_vaca.toUpperCase() != 'NO' && data.control_vaca.toUpperCase() != 'SI') {
                                                        data.observacion = 'Control de vacaciones es incorrecto'
                                                    } else {
                                                        if (data.control_asis != 'No registrado') {
                                                            if (data.control_asis.toUpperCase() != 'NO' && data.control_asis.toUpperCase() != 'SI') {
                                                                data.observacion = 'Control de asistencia es incorrecto'
                                                            }
                                                        }
                                                    }
                                                }
                                            } else {
                                                data.observacion = 'Formato de fecha hasta incorrecto (YYYY-MM-DD)';
                                            }
                                        }
                                    } else {
                                        data.observacion = 'Formato de fecha desde incorrecta (YYYY-MM-DD)';
                                    }
                                }
                            }
                        } else {
                            data.observacion = 'La cédula ingresada no es válida';
                        }

                    }

                    listContratos.push(data);


                }

                data = {}

            });

            // VERIFICAR EXISTENCIA DE CARPETA O ARCHIVO
            fs.access(ruta, fs.constants.F_OK, (err) => {
                if (err) {
                } else {
                    // ELIMINAR DEL SERVIDOR
                    fs.unlinkSync(ruta);
                }
            });

            listContratos.forEach(async (valor: any) => {
                if (valor.observacion == 'no registrado') {
                    var VERIFICAR_CEDULA = await pool.query(
                        `
                    SELECT * FROM eu_empleados WHERE cedula = $1
                    `
                        , [valor.cedula]);
                    if (VERIFICAR_CEDULA.rows[0] != undefined && VERIFICAR_CEDULA.rows[0] != '') {

                        if (valor.cedula != 'No registrado' && valor.pais != 'No registrado' && valor.pais != '') {
                            const fechaRango: any = await pool.query(
                                `
                            SELECT * FROM eu_empleado_contratos 
                            WHERE id_empleado = $1 AND 
                                ($2 BETWEEN fecha_ingreso and fecha_salida OR $3 BETWEEN fecha_ingreso AND fecha_salida OR 
                                fecha_ingreso BETWEEN $2 AND $3)
                            `
                                , [VERIFICAR_CEDULA.rows[0].id, valor.fecha_desde, valor.fecha_hasta])

                            if (fechaRango.rows[0] != undefined && fechaRango.rows[0] != '') {
                                valor.observacion = 'Existe un contrato vigente en esas fechas'
                            } else {
                                var VERIFICAR_PAISES = await pool.query(
                                    `
                                SELECT * FROM e_cat_paises WHERE UPPER(nombre) = $1
                                `
                                    , [valor.pais.toUpperCase()]);
                                if (VERIFICAR_PAISES.rows[0] != undefined && VERIFICAR_PAISES.rows[0] != '') {
                                    var id_pais = VERIFICAR_PAISES.rows[0].id
                                    if (valor.regimen_la != 'No registrado' && valor.regimen_la != '') {
                                        var VERIFICAR_REGIMENES = await pool.query(
                                            `
                                        SELECT * FROM ere_cat_regimenes WHERE UPPER(descripcion) = $1
                                        `
                                            , [valor.regimen_la.toUpperCase()])
                                        if (VERIFICAR_REGIMENES.rows[0] != undefined && VERIFICAR_REGIMENES.rows[0] != '') {
                                            if (id_pais == VERIFICAR_REGIMENES.rows[0].id_pais) {
                                                if (valor.modalida_la != 'No registrado' && valor.modalida_la != '') {
                                                    var VERIFICAR_MODALIDAD = await pool.query(
                                                        `
                                                    SELECT * FROM e_cat_modalidad_trabajo WHERE UPPER(descripcion) = $1
                                                    `
                                                        , [valor.modalida_la.toUpperCase()])
                                                    if (VERIFICAR_MODALIDAD.rows[0] != undefined && VERIFICAR_MODALIDAD.rows[0] != '') {
                                                        if (moment(valor.fecha_desde).format('YYYY-MM-DD') >= moment(valor.fecha_hasta).format('YYYY-MM-DD')) {
                                                            valor.observacion = 'La fecha desde no puede ser mayor o igual a la fecha hasta'
                                                        }
                                                    } else {
                                                        valor.observacion = 'Modalidad Laboral no existe en el sistema'
                                                    }
                                                }

                                            } else {
                                                valor.observacion = 'País no corresponde con el Régimen Laboral'
                                            }

                                        } else {
                                            valor.observacion = 'Régimen Laboral no existe en el sistema'
                                        }
                                    }
                                } else {
                                    valor.observacion = 'País no existe en el sistema'
                                }
                            }
                        }

                        // Discriminación de elementos iguales
                        if (duplicados.find((p: any) => p.cedula === valor.cedula) == undefined) {
                            duplicados.push(valor);
                        } else {
                            valor.observacion = '1';
                        }

                    } else {
                        valor.observacion = 'Cédula no existe en el sistema'
                    }
                }
            });

            var tiempo = 2000;
            if (listContratos.length > 500 && listContratos.length <= 1000) {
                tiempo = 4000;
            } else if (listContratos.length > 1000) {
                tiempo = 7000;
            }

            setTimeout(() => {

                listContratos.sort((a: any, b: any) => {
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

                listContratos.forEach((item: any) => {
                    if (item.observacion == '1') {
                        item.observacion = 'Registro duplicado (cédula)'
                    }

                    if (item.observacion != undefined) {
                        let arrayObservacion = item.observacion.split(" ");
                        if (arrayObservacion[0] == 'no') {
                            item.observacion = 'ok'
                        }
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
                    listContratos = undefined;
                }

                console.log('listContratos: ', listContratos);

                return res.jsonp({ message: mensaje, data: listContratos });

            }, tiempo)
        }

    }

    public async CargarPlantilla_contrato(req: Request, res: Response): Promise<any> {
        const { plantilla, user_name, ip } = req.body;
        let error: boolean = false;

        for (const data of plantilla) {
            try {

                const { item, cedula, pais, regimen_la, modalida_la, fecha_desde, fecha_hasta,
                    control_asis, control_vaca } = data;

                // INICIAR TRANSACCION
                await pool.query('BEGIN');

                const ID_EMPLEADO: any = await pool.query(
                    `
                SELECT id FROM eu_empleados WHERE UPPER(cedula) = $1
                `
                    , [cedula]);
                const ID_REGIMEN: any = await pool.query(
                    `
                SELECT id FROM ere_cat_regimenes WHERE UPPER(descripcion) = $1
                `
                    , [regimen_la.toUpperCase()]);
                const ID_TIPO_CONTRATO: any = await pool.query(
                    `
                SELECT id FROM e_cat_modalidad_trabajo WHERE UPPER(descripcion) = $1
                `
                    , [modalida_la.toUpperCase()]);

                //Transformar el string en booleano
                let vaca_controla: any;
                if (control_vaca.toUpperCase() === 'SI') {
                    vaca_controla = true;
                } else {
                    vaca_controla = false;
                }

                let asis_controla: any;
                if (control_asis.toUpperCase() === 'SI') {
                    asis_controla = true;
                } else {
                    asis_controla = false;
                }

                const id_empleado = ID_EMPLEADO.rows[0].id;
                const id_regimen = ID_REGIMEN.rows[0].id;
                const id_tipo_contrato = ID_TIPO_CONTRATO.rows[0].id;

                const response: QueryResult = await pool.query(
                    `
                INSERT INTO eu_empleado_contratos (id_empleado, fecha_ingreso, fecha_salida, controlar_vacacion, 
                    controlar_asistencia, id_regimen, id_modalidad_laboral) 
                VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *
                `
                    , [id_empleado, fecha_desde, fecha_hasta, vaca_controla, asis_controla, id_regimen,
                        id_tipo_contrato]);

                const [contrato] = response.rows;

                // AUDITORIA
                await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                    tabla: 'eu_empleado_contratos',
                    usuario: user_name,
                    accion: 'I',
                    datosOriginales: '',
                    datosNuevos: JSON.stringify(contrato),
                    ip,
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

const CONTRATO_EMPLEADO_CONTROLADOR = new ContratoEmpleadoControlador();

export default CONTRATO_EMPLEADO_CONTROLADOR;