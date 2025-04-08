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

    public async CrearTipoAccion(req: Request, res: Response) {
        try {
            const { descripcion, user_name, ip, ip_local } = req.body;

            // INICIAR TRANSACCION
            await pool.query('BEGIN');

            const response: QueryResult = await pool.query(
                `
                INSERT INTO map_tipo_accion_personal (descripcion) VALUES($1) RETURNING *
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
                return res.status(500).jsonp({ message: 'error' })
            }
        } catch (error) {
            await pool.query('ROLLBACK');
            return res.status(500).jsonp({ message: 'error' })
        }
    }


    public async CrearTipoAccionPersonal(req: Request, res: Response): Promise<Response> {

        try {
            const { id_tipo, descripcion, base_legal, user_name, ip, ip_local } = req.body;

            // INICIAR TRANSACCION
            await pool.query('BEGIN');

            const response: QueryResult = await pool.query(
                `
                INSERT INTO map_detalle_tipo_accion_personal (id_tipo_accion_personal, descripcion, base_legal) VALUES($1, $2, $3) RETURNING*
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
                        `
                    ,
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


    // TABLA TIPO_ACCION_PERSONAL 
    public async ListarTipoAccionPersonal(req: Request, res: Response) {
        const ACCION = await pool.query(
            `
            SELECT dtap.id, dtap.id_tipo_accion_personal, dtap.descripcion, dtap.base_legal, tap.descripcion AS nombre 
            FROM map_detalle_tipo_accion_personal AS dtap, map_tipo_accion_personal AS tap 
            WHERE tap.id = dtap.id_tipo_accion_personal
            `
        );
        if (ACCION.rowCount != 0) {
            return res.jsonp(ACCION.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'No se encuentran registros.' });
        }
    }

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

    // TABLA SOLICITUD ACCION PERSONAL

    public async CrearPedidoAccionPersonal(req: Request, res: Response): Promise<Response> {
        try {
            const { id_empleado, fec_creacion, fec_rige_desde, fec_rige_hasta, identi_accion_p, num_partida,
                decre_acue_resol, abrev_empl_uno, firma_empl_uno, abrev_empl_dos, firma_empl_dos, adicion_legal,
                tipo_accion, cargo_propuesto, proceso_propuesto, num_partida_propuesta,
                salario_propuesto, id_ciudad, id_empl_responsable, num_partida_individual, act_final_concurso,
                fec_act_final_concurso, nombre_reemp, puesto_reemp, funciones_reemp, num_accion_reemp,
                primera_fecha_reemp, posesion_notificacion, descripcion_pose_noti, user_name, ip, ip_local } = req.body;

            let datosNuevos = req.body;

            // INICIAR TRANSACCION
            await pool.query('BEGIN');

            await pool.query(
                `
                INSERT INTO map_solicitud_accion_personal (id_empleado, fecha_creacion, fecha_rige_desde, 
                    fecha_rige_hasta, identificacion_accion_personal, numero_partida_empresa, id_contexto_legal, 
                    titulo_empleado_uno, firma_empleado_uno, titulo_empleado_dos, firma_empleado_dos, adicion_legal, 
                    id_detalle_tipo_accion_personal, id_cargo_propuesto, id_proceso_propuesto, numero_partida_propuesta, 
                    salario_propuesto, id_ciudad, id_empleado_responsable, numero_partida_individual, acta_final_concurso, 
                    fecha_acta_final_concurso, nombre_reemplazo, puesto_reemplazo, funciones_reemplazo, 
                    numero_accion_reemplazo,primera_fecha_reemplazo, posesion_notificacion, 
                    descripcion_posesion_notificacion) 
                VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, 
                    $20, $21, $22, $23, $24, $25, $26, $27, $28, $29)
                `
                , [id_empleado, fec_creacion, fec_rige_desde, fec_rige_hasta, identi_accion_p, num_partida,
                    decre_acue_resol, abrev_empl_uno, firma_empl_uno, abrev_empl_dos, firma_empl_dos, adicion_legal,
                    tipo_accion, cargo_propuesto, proceso_propuesto, num_partida_propuesta, salario_propuesto, id_ciudad,
                    id_empl_responsable, num_partida_individual, act_final_concurso, fec_act_final_concurso, nombre_reemp,
                    puesto_reemp, funciones_reemp, num_accion_reemp, primera_fecha_reemp, posesion_notificacion,
                    descripcion_pose_noti]);

            delete datosNuevos.user_name;
            delete datosNuevos.ip;

            var fechaCreacionN = await FormatearFecha2(fec_creacion, 'ddd');
            var fecha_rige_desdeN = await FormatearFecha2(fec_rige_desde, 'ddd');
            var fecha_rige_hastaN = await FormatearFecha2(fec_rige_hasta, 'ddd');
            var primera_fecha_reemplazoN = await FormatearFecha2(primera_fecha_reemp, 'ddd');
            var fecha_acta_final_concurso = await FormatearFecha2(fec_act_final_concurso, 'ddd');

            // INSERTAR REGISTRO DE AUDITORIA
            await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                tabla: 'map_solicitud_accion_personal',
                usuario: user_name,
                accion: 'I',
                datosOriginales: '',

                datosNuevos: `{id_empleado: ${id_empleado}, fecha_creacion: ${fechaCreacionN}, fecha_rige_desde: ${fecha_rige_desdeN}, 
                    fecha_rige_hasta: ${fecha_rige_hastaN}, identificacion_accion_personal: ${identi_accion_p}, numero_partida_empresa: ${num_partida}, id_contexto_legal: ${decre_acue_resol}, 
                    titulo_empleado_uno: ${abrev_empl_uno}, firma_empleado_uno: ${firma_empl_uno}, titulo_empleado_dos: ${abrev_empl_dos}, firma_empleado_dos: ${firma_empl_dos}, adicion_legal: ${adicion_legal}, 
                    id_detalle_tipo_accion_personal: ${tipo_accion}, id_cargo_propuesto: ${cargo_propuesto}, id_proceso_propuesto: ${proceso_propuesto}, numero_partida_propuesta: ${num_partida_propuesta}, 
                    salario_propuesto: ${salario_propuesto}, id_ciudad: ${id_ciudad}, id_empleado_responsable: ${id_empl_responsable}, numero_partida_individual: ${num_partida_individual}, acta_final_concurso: ${act_final_concurso}, 
                    fecha_acta_final_concurso: ${fecha_acta_final_concurso}, nombre_reemplazo: ${nombre_reemp}, puesto_reemplazo: ${puesto_reemp}, funciones_reemplazo: ${funciones_reemp}, 
                    numero_accion_reemplazo: ${num_accion_reemp},primera_fecha_reemplazo: ${primera_fecha_reemplazoN}, posesion_notificacion: ${posesion_notificacion}, 
                    descripcion_posesion_notificacion: ${descripcion_pose_noti}}`,
                ip: ip,
                ip_local: ip_local,
                observacion: null
            });

            // FINALIZAR TRANSACCION
            await pool.query('COMMIT');
            return res.jsonp({ message: 'Registro realizado con éxito.' });
        } catch (error) {
            await pool.query('ROLLBACK');
            return res.status(500).jsonp({ message: 'error' });
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

    public async verLogoMinisterio(req: Request, res: Response): Promise<any> {
        const file_name = 'ministerio_trabajo.png';
        let separador = path.sep;
        let ruta = ObtenerRutaLogos() + separador + file_name;
        //console.log( 'solo ruta ', ruta)
        const codificado = await ConvertirImagenBase64(ruta);
        if (codificado === 0) {
            res.send({ imagen: 0 })
        } else {
            res.send({ imagen: codificado })
        }
    }

    // CONSULTAS GENERACIÓN DE PDF
    public async EncontrarDatosEmpleados(req: Request, res: Response) {
        const { id } = req.params;
        const EMPLEADO = await pool.query(
            `
            SELECT d.id, d.nombre, d.apellido, d.cedula, d.codigo, d.id_cargo, 
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
            SELECT ap.id, ap.id_empleado, ap.fecha_creacion, ap.fecha_rige_desde, 
                ap.fecha_rige_hasta, ap.identificacion_accion_personal, ap.numero_partida_empresa, ap.id_contexto_legal,
                ap.titulo_empleado_uno, ap.firma_empleado_uno, ap.titulo_empleado_dos, ap.firma_empleado_dos, 
                ap.adicion_legal, ap.id_detalle_tipo_accion_personal, ap.id_cargo_propuesto, ap.id_proceso_propuesto, 
                ap.numero_partida_propuesta, ap.salario_propuesto, ap.id_ciudad, ap.id_empleado_responsable, 
                ap.numero_partida_individual, ap.acta_final_concurso, ap.fecha_acta_final_concurso, ap.nombre_reemplazo, 
                ap.puesto_reemplazo, ap.funciones_reemplazo, ap.numero_accion_reemplazo, ap.primera_fecha_reemplazo, 
                ap.posesion_notificacion, ap.descripcion_posesion_notificacion, tap.base_legal, tap.id_tipo_accion_personal, 
                ta.descripcion AS tipo 
            FROM map_solicitud_accion_personal AS ap, map_detalle_tipo_accion_personal AS tap, map_tipo_accion_personal AS ta 
            WHERE ap.id_detalle_tipo_accion_personal = tap.id AND ap.id = $1 AND ta.id = tap.id_tipo_accion_personal
            `
            , [id]);
        if (ACCION.rowCount != 0) {
            return res.jsonp(ACCION.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'No se encuentran registros' });
        }
    }

    public async ListarPedidoAccion(req: Request, res: Response) {
        const ACCION = await pool.query(
            `
            SELECT ap.id, ap.id_empleado, ap.fecha_creacion, ap.fecha_rige_desde,
                ap.fecha_rige_hasta, ap.identificacion_accion_personal, ap.numero_partida_empresa, ap.id_contexto_legal, 
                ap.titulo_empleado_uno, ap.firma_empleado_uno, ap.titulo_empleado_dos, ap.firma_empleado_dos, 
                ap.adicion_legal, ap.id_detalle_tipo_accion_personal, ap.id_cargo_propuesto, ap.id_proceso_propuesto, 
                ap.numero_partida_propuesta, ap.salario_propuesto, ap.id_ciudad, ap.id_empleado_responsable, 
                ap.numero_partida_individual, ap.acta_final_concurso, ap.fecha_acta_final_concurso, ap.nombre_reemplazo, 
                ap.puesto_reemplazo, ap.funciones_reemplazo, ap.numero_accion_reemplazo, ap.primera_fecha_reemplazo, 
                ap.posesion_notificacion, ap.descripcion_posesion_notificacion, tap.base_legal, tap.id_tipo_accion_personal,
                e.codigo, e.cedula, e.nombre, e.apellido 
            FROM map_solicitud_accion_personal AS ap, map_detalle_tipo_accion_personal AS tap, eu_empleados AS e 
            WHERE ap.id_detalle_tipo_accion_personal = tap.id AND e.id = ap.id_empleado
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
                        (BASE_LEGAL != undefined && BASE_LEGAL != '') ) {

                        data.fila = ITEM;
                        data.tipo_accion_personal = TIPO_ACCION_PERSONAL;
                        data.descripcion = DESCRIPCION;
                        data.base_legal = BASE_LEGAL;
                        data.observacion = 'no registrado';

                        listaAccionPersonal.push(data);

                    } else {
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
                          data.base_legal= '-';
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
                    item.observacion = 'No existe el tipo de acción de personal en el sistema'
                  }else{

                    // const VERIFICAR_ACCION = await pool.query(
                    //     `
                    //     SELECT * FROM map_detalle_tipo_accion_personal
                    //     WHERE id_tipo_accion_personal = $1
                    //     `
                    //     , [VERIFICAR_TIPO_ACCION.rows[0].id]);
                       
                    // if (VERIFICAR_ACCION.rowCount === 0) {
                        
                    //     // DISCRIMINACION DE ELEMENTOS IGUALES
                    //     if (duplicados.find((p: any) => (p.tipo_accion_personal.toLowerCase() === item.tipo_accion_personal.toLowerCase()) ) == undefined) {
                    //         duplicados.push(item);
                    //     } else {
                    //         item.observacion = '1';
                    //     }
                    // }else{
                    //     item.observacion = 'Ya existe en el sistema'  
                    // }
  
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
                    }else if(item.observacion == 'no registrado'){
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
    var listaProcesosInsertados: any = [];

    for(const item of plantilla){
        const { tipo_accion_personal, descripcion, base_legal } = item;
        console.log('items: ',item)

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
    
            console.log('response: ',response)

              // INICIAR TRANSACCION
        await pool.query('BEGIN');

        const response_accion: QueryResult = await pool.query(
          `
          INSERT INTO map_detalle_tipo_accion_personal (id_tipo_accion_personal, descripcion, base_legal) VALUES ($1, $2, $3) RETURNING *
          `
          , [response.rows[0].id, descripcion, base_legal ]);
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

}

export const ACCION_PERSONAL_CONTROLADOR = new AccionPersonalControlador();

export default ACCION_PERSONAL_CONTROLADOR;