import { Request, Response } from 'express';
import AUDITORIA_CONTROLADOR from '../auditoria/auditoriaControlador';
import { QueryResult } from 'pg';
import { FormatearFecha, FormatearFecha2, FormatearHora } from '../../libs/settingsMail';
import moment from 'moment-timezone';
//import * as moment_ from 'moment-timezone';
import pool from '../../database';

class TimbresControlador {

    // ELIMINAR NOTIFICACIONES TABLA DE AVISOS --**VERIFICADO
    public async EliminarMultiplesAvisos(req: Request, res: Response): Promise<any> {
        try {
            const { arregloAvisos, user_name, ip } = req.body;
            let contador: number = 0;
            if (arregloAvisos.length > 0) {
                contador = 0;
                arregloAvisos.forEach(async (obj: number) => {
                    // INICIAR TRANSACCION
                    await pool.query('BEGIN');

                    // CONSULTAR DATOSORIGINALES
                    const consulta = await pool.query('SELECT * FROM ecm_realtime_timbres WHERE id = $1', [obj]);
                    const [datosOriginales] = consulta.rows;

                    if (!datosOriginales) {
                        await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                            tabla: 'ecm_realtime_timbres',
                            usuario: user_name,
                            accion: 'D',
                            datosOriginales: '',
                            datosNuevos: '',
                            ip,
                            observacion: `Error al eliminar el registro con id ${obj}. Registro no encontrado.`
                        });

                        //FINALIZAR TRANSACCION
                        await pool.query('COMMIT');
                        return res.status(404).jsonp({ message: 'Registro no encontrado.' });
                    }

                    await pool.query(
                        `
                        DELETE FROM ecm_realtime_timbres WHERE id = $1
                        `
                        , [obj])
                        .then(async (result: any) => {
                            contador = contador + 1;
                            // AUDITORIA
                            await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                                tabla: 'ecm_realtime_timbres',
                                usuario: user_name,
                                accion: 'D',
                                datosOriginales: JSON.stringify(datosOriginales),
                                datosNuevos: '',
                                ip,
                                observacion: null
                            });

                            //FINALIZAR TRANSACCION
                            await pool.query('COMMIT');

                            if (contador === arregloAvisos.length) {
                                return res.jsonp({ message: 'OK' });
                            }
                            console.log(result.command, 'REALTIME ELIMINADO ====>', obj);
                        });
                });
            }
            else {
                return res.jsonp({ message: 'error' });
            }
        } catch (error) {
            // REVERTIR TRANSACCION
            await pool.query('ROLLBACK');
            return res.status(500).jsonp({ message: 'error' });
        }

    }

    // METODO PARA LISTAR MARCACIONES    **USADO
    public async ObtenerTimbres(req: Request, res: Response): Promise<any> {
        try {
            const id = req.userIdEmpleado;
            let timbres = await pool.query(
                `
                SELECT CAST(t.fecha_hora_timbre_servidor AS VARCHAR), t.accion, t.tecla_funcion, t.observacion, 
                    t.latitud, t.longitud, t.codigo, t.id_reloj, t.ubicacion, t.documento, t.imagen,
                    CAST(t.fecha_hora_timbre AS VARCHAR), dispositivo_timbre, 
                    CAST(t.fecha_hora_timbre_validado AS VARCHAR)
                FROM eu_empleados AS e, eu_timbres AS t 
                WHERE e.id = $1 AND e.codigo = t.codigo 
                ORDER BY t.fecha_hora_timbre_validado DESC LIMIT 100
                `
                , [id]).then((result: any) => {
                    return result.rows
                        .map((obj: any) => {
                            switch (obj.accion) {
                                case 'EoS': obj.accion = 'Entrada o salida'; break;
                                case 'AES': obj.accion = 'Inicio o fin alimentación'; break;
                                case 'PES': obj.accion = 'Inicio o fin permiso'; break;
                                case 'E': obj.accion = 'Entrada'; break;
                                case 'S': obj.accion = 'Salida'; break;
                                case 'I/A': obj.accion = 'Inicio alimentación'; break;
                                case 'F/A': obj.accion = 'Fin alimentación'; break;
                                case 'I/P': obj.accion = 'Inicio permiso'; break;
                                case 'F/P': obj.accion = 'Fin permiso'; break;
                                case 'HA': obj.accion = 'Timbre libre'; break;
                                default: obj.accion = 'Desconocido'; break;
                            }
                            return obj
                        })
                });

            if (timbres.length === 0) return res.status(400).jsonp({ message: 'Ups!!! no existen registros.' });

            let estado_cuenta = [{
                timbres_PES: await pool.query(
                    `
                    SELECT count(*) 
                    FROM eu_empleados AS e, eu_timbres AS t 
                    WHERE e.id = $1 AND e.codigo = t.codigo 
                        AND t.accion in (\'PES\', \'E/P\', \'S/P\')
                    `
                    , [id]).then((result: any) => { return result.rows[0].count }),

                timbres_AES: await pool.query(
                    `
                    SELECT count(*) 
                    FROM eu_empleados AS e, eu_timbres AS t 
                    WHERE e.id = $1 AND e.codigo = t.codigo 
                    AND t.accion in (\'AES\', \'E/A\', \'S/A\')
                    `
                    , [id]).then((result: any) => { return result.rows[0].count }),

                timbres_EoS: await pool.query(
                    `
                    SELECT count(*) 
                    FROM eu_empleados AS e, eu_timbres AS t 
                    WHERE e.id = $1 AND e.codigo = t.codigo 
                        AND t.accion in (\'EoS\', \'E\', \'S\')
                    `
                    , [id]).then((result: any) => { return result.rows[0].count }),

                total_timbres: await pool.query(
                    `
                    SELECT count(*) 
                    FROM eu_empleados AS e, eu_timbres AS t 
                    WHERE e.id = $1 AND e.codigo = t.codigo
                    `
                    , [id]).then((result: any) => { return result.rows[0].count })
            }]

            return res.status(200).jsonp({
                timbres: timbres,
                cuenta: estado_cuenta,
                info: await pool.query(
                    `
                    SELECT ec.sueldo, tc.cargo, ec.hora_trabaja, cg.nombre AS departamento
                    FROM eu_empleado_cargos AS ec, e_cat_tipo_cargo AS tc, ed_departamentos AS cg
                    WHERE ec.id = (SELECT id_cargo FROM contrato_cargo_vigente WHERE id_empleado = $1)
                        AND tc.id = ec.id_tipo_cargo AND cg.id = ec.id_departamento
                    `
                    , [id]).then((result: any) => {
                        return result.rows
                    }),
            });
        } catch (error) {
            res.status(400).jsonp({ message: error })
        }
    }

    // METODO PARA BUSCAR EL TIMBRE DEL EMPLEADO POR FECHA     **USADO
    public async ObtenertimbreFechaEmple(req: Request, res: Response): Promise<any> {
        try {
            let { codigo, cedula, fecha } = req.query;
            fecha = fecha + '%';
            if (codigo === '') {
                let usuario = await pool.query(
                    `
                    SELECT * FROM informacion_general    
                    WHERE cedula = $1
                    `
                    , [cedula]).then((result: any) => {
                        return result.rows.map((obj: any) => {
                            codigo = obj.codigo;
                        });
                    }
                    );
            } else if (cedula === '') {
                let usuario = await pool.query(
                    `
                    SELECT * FROM informacion_general 
                    WHERE codigo = $1
                    `
                    , [codigo]).then((result: any) => {
                        return result.rows.map((obj: any) => {
                            cedula = obj.cedula;
                        });
                    }
                    );
            }

            let timbresRows: any = 0;

            let timbres = await pool.query(
                `
                SELECT (da.nombre || ' ' || da.apellido) AS empleado, da.id AS id_empleado, 
                    CAST(t.fecha_hora_timbre AS VARCHAR), t.accion, 
                    t.tecla_funcion, t.observacion, t.latitud, t.longitud, t.codigo, t.id_reloj, ubicacion, 
                    CAST(fecha_hora_timbre_servidor AS VARCHAR), dispositivo_timbre, t.id,
                    CAST(fecha_hora_timbre_validado AS VARCHAR) 
                FROM eu_timbres AS t, informacion_general AS da
                WHERE t.codigo = $1 
                    AND CAST(t.fecha_hora_timbre_validado AS VARCHAR) LIKE $2
                    AND da.codigo = t.codigo 
                    AND da.cedula = $3
                `
                , [codigo, fecha, cedula]).then((result: any) => {
                    timbresRows = result.rowCount;
                    if (result.rowCount != 0) {
                        return res.status(200).jsonp({ message: 'timbres encontrados', timbres: result.rows });
                    }
                }
                );
            if (timbresRows == 0) {
                return res.status(400).jsonp({ message: "No se encontraron registros." })
            }

        } catch (err) {
            const message = 'Ups!!! problemas con la petición al servidor.'
            return res.status(500).jsonp({ error: err, message: message })
        }
    }

    // METODO PARA ACTUALIZAR O EDITAR EL TIMBRE DEL EMPLEADO   **USADO
    public async EditarTimbreEmpleadoFecha(req: Request, res: Response): Promise<any> {
        try {
            let { id, codigo, tecla, observacion, fecha } = req.body;
            await pool.query(
                `
                SELECT * FROM modificartimbre ($1::timestamp without time zone, $2::character varying, 
                    $3::character varying, $4::integer, $5::character varying) 
                `
                , [fecha, codigo, tecla, id, observacion])
                .then((result: any) => {
                    return res.status(200).jsonp({ message: 'Registro actualizado.' });
                });

        } catch (err) {
            console.log('timbre error ', err)
            const message = 'Ups!!! algo salio mal con la peticion al servidor.'
            return res.status(500).jsonp({ error: err, message: message })
        }
    }

    // METODO DE REGISTRO DE TIMBRES PERSONALES    **USADO
    public async CrearTimbreWeb(req: Request, res: Response): Promise<any> {
        try {
            // DOCUMENTO ES NULL YA QUE ESTE USUARIO NO JUSTIFICA UN TIMBRE
            const { fec_hora_timbre, accion, tecl_funcion, observacion, latitud, longitud, id_reloj,
                ubicacion, user_name, ip, imagen, zona_dispositivo, gmt_dispositivo } = req.body;
            console.log('datos del timbre ', req.body)
            var now: any;
            var hora_diferente: boolean = false;
            var fecha_servidor: any;
            var fecha_validada: any;
            var zona_servidor = Intl.DateTimeFormat().resolvedOptions().timeZone;
            // OBTENER EL OFFSET GMT EN MINUTOS
            const gmt_minutos = new Date().getTimezoneOffset();
            // CONVERTIR EL OFFSET A HORAS
            const gmt_horas = -gmt_minutos / 60;
            // FORMATEAR COMO GMT
            const gmt_servidor = `GMT${gmt_horas >= 0 ? '+' : ''}${gmt_horas.toString().padStart(2, '0')}`;
            const id_empleado = req.userIdEmpleado;

            // OBTENER LA FECHA Y HORA ACTUAL
            now = moment();
            // FORMATEAR LA FECHA Y HORA ACTUAL EN EL FORMATO DESEADO
            fecha_servidor = now.format('DD/MM/YYYY, h:mm:ss a');
            fecha_validada = now.format('DD/MM/YYYY, h:mm:ss a');
            // FORMATEAR FECHA Y HORA DEL TIMBRE INGRESADO
            var hora_timbre = moment(fec_hora_timbre, 'DD/MM/YYYY, hh:mm:ss a').format('HH:mm:ss');
            var fecha_timbre = moment(fec_hora_timbre, 'DD/MM/YYYY, hh:mm:ss a').format('YYYY-MM-DD');

            if (zona_dispositivo != zona_servidor) {
                const now_ = new Date();
                const convertToTimeZone = (date: Date, timeZone: string): string => {
                    return moment(date).tz(timeZone).format('YYYY-MM-DD HH:mm:ss');
                };
                var fecha_: any = convertToTimeZone(now_, zona_dispositivo)
                fecha_validada = moment(fecha_).format('DD/MM/YYYY, h:mm:ss a');
            }
            else {
                // VERIFICAR HORAS DEL TIMBRE Y DEL SERVIDOR
                var fecha_valida = moment(fecha_validada, 'DD/MM/YYYY, hh:mm:ss a').format('YYYY-MM-DD');
                // VERIFICAR FECHAS DEBE SER LA MISMA DEL SERVIDOR
                if (fecha_valida != fecha_timbre) {
                    hora_diferente = true;
                }
                else {
                    // VALDAR HORAS NO DEBE SER MENOR NI MAYOR A LA HORA DEL SERVIDOR -- 1 MINUTO DE ESPERA
                    var hora_valida = moment(fecha_validada, 'DD/MM/YYYY, hh:mm:ss a');
                    var hora_timbre_ = moment(fec_hora_timbre, 'DD/MM/YYYY, hh:mm:ss a');
                    var resta_hora_valida = moment(hora_valida, 'HH:mm:ss').subtract(1, 'minutes');
                    //console.log(' hora_valida ', hora_valida)
                    //console.log('resta ', resta_hora_valida)
                    //console.log('hora_timbre.... ', hora_timbre_)
                    if (hora_timbre_.isAfter(hora_valida)) {
                        //console.log('ingresa true, hora mayor');
                        hora_diferente = true;
                    }
                    else {
                        if (hora_timbre_.isSameOrAfter(resta_hora_valida)) {
                            //console.log('ingresa false');
                            hora_diferente = false;
                        }
                        else {
                            //console.log('ingresa true, hora menor');
                            hora_diferente = true;
                        }
                    }
                }
            }
            //console.log(' hora diferente ', hora_diferente)

            let code = await pool.query(
                `
                SELECT codigo FROM eu_empleados WHERE id = $1
                `
                , [id_empleado]).then((result: any) => { return result.rows });

            if (code.length === 0) return { mensaje: 'El usuario no tiene un código asignado.' };

            var codigo = parseInt(code[0].codigo);

            // INICIAR TRANSACCION
            await pool.query('BEGIN');

            await pool.query(
                `
                SELECT * FROM public.timbres_web ($1, $2, 
                    to_timestamp($3, 'DD/MM/YYYY, HH:MI:SS pm')::timestamp without time zone, 
                    to_timestamp($4, 'DD/MM/YYYY, HH:MI:SS pm')::timestamp without time zone, 
                    to_timestamp($5, 'DD/MM/YYYY, HH:MI:SS pm')::timestamp without time zone, 
                    $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
                `
                , [codigo, id_reloj, fec_hora_timbre, fecha_servidor, fecha_validada, tecl_funcion, accion,
                    observacion, latitud, longitud, ubicacion, 'APP_WEB', imagen, true, zona_servidor, gmt_servidor,
                    zona_dispositivo, gmt_dispositivo, hora_diferente],

                async (error, results) => {
                    console.log('error ', error)
                    const fechaHora = await FormatearHora(hora_timbre);
                    const fechaTimbre = await FormatearFecha(fecha_timbre, 'ddd');

                    await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                        tabla: 'eu_timbres',
                        usuario: user_name,
                        accion: 'I',
                        datosOriginales: '',
                        datosNuevos: `{fecha_hora_timbre: ${fechaTimbre + ' ' + fechaHora}, accion: ${accion}, tecla_funcion: ${tecl_funcion}, observacion: ${observacion}, latitud: ${latitud}, longitud: ${longitud}, codigo: ${codigo}, fecha_hora_timbre_servidor: ${fecha_servidor}, fecha_hora_timbre_validado: ${fecha_validada}, id_reloj: ${id_reloj}, ubicacion: ${ubicacion}, dispositivo_timbre: 'APP_WEB', imagen: ${imagen} }`,
                        ip,
                        observacion: null
                    });

                    //FINALIZAR TRANSACCION
                    await pool.query('COMMIT');
                    res.status(200).jsonp({ message: 'Registro guardado.' });
                }
            )

        } catch (error) {
            console.log('error 500 ', error)
            // REVERTIR TRANSACCION
            await pool.query('ROLLBACK');
            res.status(500).jsonp({ message: error });
        }
    }

    // METODO PARA REGISTRAR TIMBRES ADMINISTRADOR    **USADO
    public async CrearTimbreWebAdmin(req: Request, res: Response): Promise<any> {
        try {
            // ESTE USUARIO NO TIMBRA CON UBICACION
            const { fec_hora_timbre, accion, tecl_funcion, observacion,
                id_empleado, id_reloj, tipo, ip, user_name, documento } = req.body

            //console.log('req ', req.body)
            var hora_fecha_timbre = moment(fec_hora_timbre, 'YYYY/MM/DD HH:mm:ss').format('DD/MM/YYYY, h:mm:ss a');

            // OBTENER LA FECHA Y HORA ACTUAL
            var now = moment();

            // FORMATEAR LA FECHA Y HORA ACTUAL EN EL FORMATO DESEADO
            var fecha_hora = now.format('DD/MM/YYYY, h:mm:ss a');
            let servidor: any;

            //console.log('req... ', hora_fecha_timbre)

            if (tipo === 'administrar') {
                servidor = hora_fecha_timbre;
            }
            else {
                servidor = fecha_hora;
            }

            let code = await pool.query(
                `
                SELECT codigo FROM eu_empleados WHERE id = $1
                `
                , [id_empleado]).then((result: any) => { return result.rows });

            if (code.length === 0) return { mensaje: 'El usuario no tiene un código asignado.' };

            var codigo = code[0].codigo;
            // INICIAR TRANSACCION
            await pool.query('BEGIN');

            pool.query(
                `
                SELECT * FROM public.timbres_crear ($1, $2, $3, 
                    to_timestamp($4, 'DD/MM/YYYY, HH:MI:SS pm')::timestamp without time zone, $5, $6, $7, $8, $9, $10, 
                    to_timestamp($11, 'DD/MM/YYYY, HH:MI:SS pm')::timestamp without time zone)
                `
                , [codigo, id_reloj, hora_fecha_timbre, servidor, accion, tecl_funcion,
                    observacion, 'APP_WEB', documento, true, servidor]

                , async (error, results) => {
                    //console.log('error ', error)
                    // FORMATEAR FECHAS
                    var hora = moment(fec_hora_timbre, 'YYYY/MM/DD HH:mm:ss').format('HH:mm:ss');
                    var fecha = moment(fec_hora_timbre, 'YYYY/MM/DD HH:mm:ss').format('YYYY-MM-DD');
                    const fechaHora = await FormatearHora(hora);
                    const fechaTimbre = await FormatearFecha(fecha, 'ddd');

                    await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                        tabla: 'eu_timbres',
                        usuario: user_name,
                        accion: 'I',
                        datosOriginales: '',
                        datosNuevos: `{fecha_hora_timbre: ${fechaTimbre + ' ' + fechaHora}, accion: ${accion}, tecla_funcion: ${tecl_funcion}, observacion: ${observacion}, codigo: ${codigo}, id_reloj: ${id_reloj}, dispositivo_timbre: 'APP_WEB', fecha_hora_timbre_servidor: ${servidor}, documento: ${documento} }`,
                        ip,
                        observacion: null
                    });

                    await pool.query('COMMIT');
                    res.status(200).jsonp({ message: 'Registro guardado.' });
                }
            )
        } catch (error) {
            // REVERTIR TRANSACCION
            await pool.query('ROLLBACK');
            res.status(500).jsonp({ message: error });
        }
    }


    // METODO PARA BUSCAR TIMBRES   **USADO
    public async BuscarTimbresPlanificacion(req: Request, res: Response) {

        const { codigo, fec_inicio, fec_final } = req.body;

        const TIMBRES = await pool.query(
            "SELECT * FROM eu_timbres " +
            "WHERE fecha_hora_timbre_validado BETWEEN $1 AND $2 " +
            "AND codigo IN (" + codigo + ") " +
            "ORDER BY codigo, fecha_hora_timbre_validado ASC",
            [fec_inicio, fec_final]);

        if (TIMBRES.rowCount === 0) {
            return res.status(404).jsonp({ message: 'vacio' });
        }
        else {
            var contador = 0;
            TIMBRES.rows.forEach(async obj => {
                contador = contador + 1;
                await pool.query(
                    `
                    SELECT * FROM modificartimbre ($1::timestamp without time zone, $2::character varying, 
                            $3::character varying, $4::integer, $5::character varying)  
                    `
                    , [obj.fecha_hora_timbre_validado, obj.codigo, obj.tecla_funcion, obj.id, obj.observacion]);
            })

            if (contador === TIMBRES.rowCount) {
                return res.jsonp({ message: 'OK', respuesta: TIMBRES.rows })
            }
            else {
                return res.status(404).jsonp({ message: 'error' });
            }
        }

    }

    // METODO DE BUSQUEDA DE AVISOS GENERALES POR EMPLEADO
    public async ObtenerAvisosColaborador(req: Request, res: Response) {
        const { id_empleado } = req.params

        const TIMBRES_NOTIFICACION = await pool.query(
            `
            SELECT id, to_char(fecha_hora, 'yyyy-MM-dd HH24:mi:ss') AS fecha_hora, id_empleado_envia, visto, 
                descripcion, mensaje, id_timbre, tipo, id_empleado_recibe
            FROM ecm_realtime_timbres WHERE id_empleado_recibe = $1 
            ORDER BY (visto is FALSE) DESC, id DESC LIMIT 20
            `
            , [id_empleado])
            .then(async (result: any) => {

                if (result.rowCount != 0) {
                    return await Promise.all(result.rows.map(async (obj: any): Promise<any> => {

                        let nombre = await pool.query(
                            `
                            SELECT nombre, apellido FROM eu_empleados WHERE id = $1
                            `
                            , [obj.id_empleado_envia]).then((ele: any) => {
                                return ele.rows[0].nombre + ' ' + ele.rows[0].apellido
                            })
                        return {
                            id_receives_empl: obj.id_empleado_recibe,
                            descripcion: obj.descripcion,
                            create_at: obj.fecha_hora,
                            id_timbre: obj.id_timbre,
                            empleado: nombre,
                            mensaje: obj.mensaje,
                            visto: obj.visto,
                            tipo: obj.tipo,
                            id: obj.id,
                        }
                    }));
                }
                return []
            });

        if (TIMBRES_NOTIFICACION.length != 0) {
            return res.jsonp(TIMBRES_NOTIFICACION)
        }
        else {
            return res.status(404).jsonp({ message: 'No se encuentran registros.' });
        }


    }

    // METODO DE BUSQUEDA DE UNA NOTIFICACION ESPECIFICA
    public async ObtenerUnAviso(req: Request, res: Response): Promise<any> {
        const id = req.params.id;
        const AVISOS = await pool.query(
            `
            SELECT r.id, r.id_empleado_envia, r.id_empleado_recibe, r.fecha_hora, r.tipo, r.visto, 
                r.id_timbre, r.descripcion, (e.nombre || ' ' || e.apellido) AS empleado 
            FROM ecm_realtime_timbres AS r, eu_empleados AS e 
            WHERE r.id = $1 AND e.id = r.id_empleado_envia
            `
            , [id]);
        if (AVISOS.rowCount != 0) {
            return res.jsonp(AVISOS.rows[0])
        }
        else {
            return res.status(404).jsonp({ text: 'Registro no encontrado.' });
        }
    }


    public async ObtenerAvisosTimbresEmpleado(req: Request, res: Response) {
        const { id_empleado } = req.params
        console.log(id_empleado);
        const TIMBRES_NOTIFICACION = await pool.query(
            `
            SELECT * FROM ecm_realtime_timbres WHERE id_empleado_recibe = $1 
            ORDER BY fecha_hora DESC
            `
            , [id_empleado])
            .then((result: any) => { return result.rows });

        if (TIMBRES_NOTIFICACION.length === 0) return res.status(404).jsonp({ message: 'No se encuentran registros.' });
        console.log(TIMBRES_NOTIFICACION);

        const tim = await Promise.all(TIMBRES_NOTIFICACION.map(async (obj: any): Promise<any> => {
            let [empleado] = await pool.query(
                `
                SELECT  (nombre || \' \' || apellido) AS fullname FROM eu_empleados WHERE id = $1
                `
                , [obj.id_empleado_envia]).then((ele: any) => {
                    console.log('¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨', ele.rows);
                    return ele.rows
                })
            const fullname = (empleado === undefined) ? '' : empleado.fullname;
            return {
                create_at: obj.fecha_hora,
                descripcion: obj.descripcion,
                visto: obj.visto,
                id_timbre: obj.id_timbre,
                empleado: fullname,
                id: obj.id
            }
        }));
        console.log(tim);

        if (tim.length > 0) {
            return res.jsonp(tim)
        }

    }

    public async ActualizarVista(req: Request, res: Response): Promise<Response> {
        try {
            const id = req.params.id_noti_timbre;
            const { visto, user_name, ip } = req.body;

            // INICIAR TRANSACCION
            await pool.query('BEGIN');

            // CONSULTAR DATOSORIGINALES
            const consulta = await pool.query('SELECT * FROM ecm_realtime_timbres WHERE id = $1', [id]);
            const [datosOriginales] = consulta.rows;

            if (!datosOriginales) {
                await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                    tabla: 'ecm_realtime_timbres',
                    usuario: user_name,
                    accion: 'U',
                    datosOriginales: '',
                    datosNuevos: '',
                    ip,
                    observacion: `Error al actualizar el registro con id ${id}. Registro no encontrado.`
                });

                // FINALIZAR TRANSACCION
                await pool.query('COMMIT');
                return res.status(404).jsonp({ message: 'Registro no encontrado.' });
            }

            await pool.query(
                `
                UPDATE ecm_realtime_timbres SET visto = $1 WHERE id = $2
                `
                , [visto, id]);

            // AUDITORIA
            await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                tabla: 'ecm_realtime_timbres',
                usuario: user_name,
                accion: 'U',
                datosOriginales: JSON.stringify(datosOriginales),
                datosNuevos: `{visto: ${visto}}`,
                ip,
                observacion: null
            });

            // FINALIZAR TRANSACCION
            await pool.query('COMMIT');
            return res.status(200).jsonp({ message: 'Vista actualizada' });
        } catch (error) {
            // REVERTIR TRANSACCION
            await pool.query('ROLLBACK');
            return res.status(500).jsonp({ message: 'Error al actualizar la vista.' });
        }
    }

    // METODO PARA BUSCAR TIMBRES DEL USUARIO   **USADO
    public async ObtenerTimbresEmpleado(req: Request, res: Response): Promise<any> {
        try {
            const { id } = req.params;
            let timbres = await pool.query(
                `
                SELECT CAST(t.fecha_hora_timbre AS VARCHAR), t.accion, t.tecla_funcion, 
                    t.observacion, t.latitud, t.longitud, t.codigo, t.id_reloj, t.ubicacion, t.imagen,
                    CAST(t.fecha_hora_timbre_servidor AS VARCHAR), t.documento,
                    CAST(t.fecha_hora_timbre_validado AS VARCHAR)
                FROM eu_empleados AS e, eu_timbres AS t 
                WHERE e.id = $1 AND e.codigo = t.codigo 
                ORDER BY t.fecha_hora_timbre_validado DESC LIMIT 50
                `
                , [id]).then((result: any) => {
                    return result.rows
                        .map((obj: any) => {
                            switch (obj.accion) {
                                case 'EoS': obj.accion = 'Entrada o salida'; break;
                                case 'AES': obj.accion = ' Inicio o fin alimentación'; break;
                                case 'PES': obj.accion = 'Inicio o fin permiso'; break;
                                case 'E': obj.accion = 'Entrada'; break;
                                case 'S': obj.accion = 'Salida'; break;
                                case 'I/A': obj.accion = 'Inicio alimentación'; break;
                                case 'F/A': obj.accion = 'Fin alimentación'; break;
                                case 'I/P': obj.accion = 'Inicio permiso'; break;
                                case 'F/P': obj.accion = 'Fin permiso'; break;
                                case 'HA': obj.accion = 'Timbre libre'; break;
                                default: obj.accion = 'Desconocido'; break;
                            }
                            return obj
                        })
                });
            if (timbres.length === 0) return res.status(400).jsonp({ message: 'No se encontraron registros.' });
            return res.status(200).jsonp({
                timbres: timbres,
            });
        } catch (error) {
            res.status(400).jsonp({ message: error })
        }
    }


    // METODO PARA BUSCAR TIMBRES (ASISTENCIA)    **USADO
    public async BuscarTimbresAsistencia(req: Request, res: Response): Promise<any> {

        const { fecha, funcion, codigo } = req.body;
        const TIMBRE = await pool.query(
            `
            SELECT t.*, t.fecha_hora_timbre_validado::date AS t_fec_timbre, 
                t.fecha_hora_timbre_validado::time AS t_hora_timbre 
            FROM eu_timbres AS t
            WHERE codigo = $1 AND fecha_hora_timbre_validado::date = $2 AND tecla_funcion = $3 
            ORDER BY t.fecha_hora_timbre_validado ASC;
            `
            , [codigo, fecha, funcion]);

        if (TIMBRE.rowCount != 0) {
            return res.jsonp({ message: 'OK', respuesta: TIMBRE.rows })
        }
        else {
            return res.status(404).jsonp({ message: 'vacio' });
        }
    }

    /** ************************************************************************************************* **
     ** **                CONSULTAS DE CONFIGURACION DE OPCIONES DE MARCACIONES                        ** **
     ** ************************************************************************************************* **/

    // METODO PARA ALMACENAR CONFIGURACION DE TIMBRE     **USADO
    public async IngresarOpcionTimbre(req: Request, res: Response): Promise<Response> {

        try {
            const { id_empleado, timbre_internet, timbre_foto, timbre_especial, user_name, ip } = req.body;

            // INICIAR TRANSACCION
            await pool.query('BEGIN');
            const response: QueryResult = await pool.query(
                `
                INSERT INTO mrv_opciones_marcacion (id_empleado, timbre_internet, timbre_foto, timbre_especial) 
                VALUES ($1, $2, $3, $4) RETURNING *
                `
                , [id_empleado, timbre_internet, timbre_foto, timbre_especial]);

            const [opciones] = response.rows;

            // AUDITORIA
            await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                tabla: 'mrv_opciones_marcacion',
                usuario: user_name,
                accion: 'I',
                datosOriginales: '',
                datosNuevos: JSON.stringify(opciones),
                ip,
                observacion: null
            });

            // FINALIZAR TRANSACCION
            await pool.query('COMMIT');

            if (opciones) {
                return res.status(200).jsonp(opciones)
            }
            else {
                return res.status(404).jsonp({ message: 'error' })
            }

        } catch (error) {
            console.log('error ', error)
            // REVERTIR TRANSACCION
            await pool.query('ROLLBACK');
            return res.status(500).jsonp({ message: 'error' });
        }
    }

    // METODO PARA ALMACENAR CONFIGURACION DE TIMBRE      **USADO
    public async ActualizarOpcionTimbre(req: Request, res: Response): Promise<Response> {

        try {
            const { id_empleado, timbre_internet, timbre_foto, timbre_especial, user_name, ip } = req.body;
            //console.log(req.body)

            var opciones: any;
            // INICIAR TRANSACCION
            await pool.query('BEGIN');

            if (timbre_internet != null && timbre_foto != null && timbre_especial != null) {
                //console.log('1')
                const response: QueryResult = await pool.query(
                    `
                    UPDATE mrv_opciones_marcacion SET timbre_internet = $2, timbre_foto = $3, timbre_especial = $4
                    WHERE id_empleado = $1 RETURNING *
                    `
                    , [id_empleado, timbre_internet, timbre_foto, timbre_especial]);

                [opciones] = response.rows;
            }
            else if (timbre_internet != null && timbre_foto != null) {
                //console.log('2')
                const response: QueryResult = await pool.query(
                    `
                    UPDATE mrv_opciones_marcacion SET timbre_internet = $2, timbre_foto = $3
                    WHERE id_empleado = $1 RETURNING *
                    `
                    , [id_empleado, timbre_internet, timbre_foto]);

                [opciones] = response.rows;
            }
            else if (timbre_internet != null && timbre_especial != null) {
                //console.log('3')
                const response: QueryResult = await pool.query(
                    `
                    UPDATE mrv_opciones_marcacion SET timbre_internet = $2, timbre_especial = $3
                    WHERE id_empleado = $1 RETURNING *
                    `
                    , [id_empleado, timbre_internet, timbre_especial]);

                [opciones] = response.rows;
            }
            else if (timbre_foto != null && timbre_especial != null) {
                //console.log('4')
                const response: QueryResult = await pool.query(
                    `
                    UPDATE mrv_opciones_marcacion SET timbre_foto = $2, timbre_especial = $3
                    WHERE id_empleado = $1 RETURNING *
                    `
                    , [id_empleado, timbre_foto, timbre_especial]);

                [opciones] = response.rows;
            }
            else if (timbre_internet != null) {
                //console.log('5')
                const response: QueryResult = await pool.query(
                    `
                    UPDATE mrv_opciones_marcacion SET timbre_internet = $2
                    WHERE id_empleado = $1 RETURNING *
                    `
                    , [id_empleado, timbre_internet]);

                [opciones] = response.rows;
            }
            else if (timbre_foto != null) {
                //console.log('6')
                const response: QueryResult = await pool.query(
                    `
                    UPDATE mrv_opciones_marcacion SET timbre_foto = $2
                    WHERE id_empleado = $1 RETURNING *
                    `
                    , [id_empleado, timbre_foto]);

                [opciones] = response.rows;
            }
            else if (timbre_especial != null) {
                //console.log('7')
                const response: QueryResult = await pool.query(
                    `
                    UPDATE mrv_opciones_marcacion SET timbre_especial = $2
                    WHERE id_empleado = $1 RETURNING *
                    `
                    , [id_empleado, timbre_especial]);

                [opciones] = response.rows;
            }

            // AUDITORIA
            await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                tabla: 'mrv_opciones_marcacion',
                usuario: user_name,
                accion: 'I',
                datosOriginales: '',
                datosNuevos: JSON.stringify(opciones),
                ip,
                observacion: null
            });

            // FINALIZAR TRANSACCION
            await pool.query('COMMIT');
            //console.log('opciones ', opciones)

            if (opciones) {
                return res.status(200).jsonp(opciones)
            }
            else {
                return res.status(404).jsonp({ message: 'error' })
            }

        } catch (error) {
            // REVERTIR TRANSACCION
            await pool.query('ROLLBACK');
            return res.status(500).jsonp({ message: 'error' });
        }
    }


    // METODO PARA BUSCAR OPCIONES DE TIMBRES    **USADO
    public async BuscarOpcionesTimbre(req: Request, res: Response): Promise<any> {

        const { id_empleado } = req.body;
        const OPCIONES = await pool.query(
            `
            SELECT * FROM mrv_opciones_marcacion 
            WHERE id_empleado = $1
            `
            , [id_empleado]);

        if (OPCIONES.rowCount != 0) {
            return res.jsonp({ message: 'OK', respuesta: OPCIONES.rows })
        }
        else {
            return res.status(404).jsonp({ message: 'vacio' });
        }
    }


    // METODO PARA BUSCAR OPCIONES DE TIMBRES DE VARIOS USUARIOS    **USADO
    public async BuscarMultipleOpcionesTimbre(req: Request, res: Response): Promise<any> {

        const { id_empleado } = req.body;
        const OPCIONES = await pool.query(
            "SELECT e.nombre, e.apellido, e.cedula, e.codigo, om.id, om.id_empleado, om.timbre_internet, " +
            "   om.timbre_foto, om.timbre_especial " +
            "FROM mrv_opciones_marcacion AS om, eu_empleados AS e " +
            "WHERE e.id = om.id_empleado AND om.id_empleado IN (" + id_empleado + ") "
        );

        if (OPCIONES.rowCount != 0) {
            return res.jsonp({ message: 'OK', respuesta: OPCIONES.rows })
        }
        else {
            return res.status(404).jsonp({ message: 'vacio' });
        }
    }



    /** ************************************************************************************************* **
     ** **                                 METODOS PARA APP MOVIL                                      ** **
     ** ************************************************************************************************* **/

    public async crearTimbre(req: Request, res: Response) {
        try {
            const hoy: Date = new Date();
            const timbre: any = req.body;
            await pool.query('BEGIN');

            // Verificar el contenido de req.body
            console.log('Contenido de req.body:', timbre);

            timbre.fecha_hora_timbre_servidor = hoy.getFullYear() + "-" + (hoy.getMonth() + 1) + "-" + hoy.getDate() + " " + hoy.getHours() + ":" + hoy.getMinutes() + ":" + hoy.getSeconds();
            const fechaHoraEnZonaHorariaDispositivo = moment(timbre.fecha_hora_timbre_servidor)
                .tz(timbre.zona_horaria_dispositivo)
                .format('YYYY-MM-DD HH:mm:ss');

            const zonaHorariaServidor = moment.tz.guess();
            const timbreRV: Date = new Date(timbre.fecha_hora_timbre || '');
            const restaTimbresHoras = timbreRV.getHours() - hoy.getHours();
            const restaTimbresMinutos = timbreRV.getMinutes() - hoy.getMinutes();
            const restaTimbresDias = timbreRV.getDate() - hoy.getDate();
            if (restaTimbresDias != 0 || restaTimbresHoras != 0 || restaTimbresMinutos > 3 || restaTimbresMinutos < -3) {
                timbre.hora_timbre_diferente = true;
            } else {
                timbre.hora_timbre_diferente = false;
            }

            // Verificar el valor de timbre.accion antes de la consulta
            console.log('Valor de timbre.accion:', timbre.accion);

            const response = await pool.query('INSERT INTO eu_timbres (fecha_hora_timbre, accion, tecla_funcion, ' +
                'observacion, latitud, longitud, codigo, id_reloj, tipo_autenticacion, ' +
                'dispositivo_timbre, fecha_hora_timbre_servidor, hora_timbre_diferente, ubicacion, conexion, fecha_subida_servidor, novedades_conexion, imagen, fecha_hora_timbre_validado, zona_horaria_dispositivo, zona_horaria_servidor ) ' +
                'VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $19, $18, $20);',
                [timbre.fecha_hora_timbre, timbre.accion, timbre.tecla_funcion, timbre.observacion,
                timbre.latitud, timbre.longitud, timbre.codigo, timbre.id_reloj,
                timbre.tipo_autenticacion, timbre.dispositivo_timbre, timbre.fecha_hora_timbre_servidor,
                timbre.hora_timbre_diferente, timbre.ubicacion, timbre.conexion, timbre.fecha_subida_servidor, timbre.novedades_conexion, timbre.imagen, timbre.zona_horaria_dispositivo, fechaHoraEnZonaHorariaDispositivo, zonaHorariaServidor]);


            const fechaHora = await FormatearHora(timbre.fecha_hora_timbre.toLocaleString().split(' ')[1]);
            const fechaTimbre = await FormatearFecha2(timbre.fecha_hora_timbre.toLocaleString(), 'ddd');
            const fechaHoraServidor = await FormatearHora(timbre.fecha_hora_timbre_servidor.toLocaleString().split(' ')[1]);
            const fechaTimbreServidor = await FormatearFecha2(timbre.fecha_hora_timbre_servidor.toLocaleString(), 'ddd');

            await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                tabla: 'eu_timbres',
                usuario: timbre.user_name,
                accion: 'I',
                datosOriginales: '',
                datosNuevos: `{fecha_hora_timbre: ${fechaTimbre + ' ' + fechaHora}, accion: ${timbre.accion}, tecla_funcion: ${timbre.tecla_funcion}, observacion: ${timbre.observacion}, latitud: ${timbre.latitud}, longitud: ${timbre.longitud}, codigo: ${timbre.codigo}, fecha_hora_timbre_servidor: ${fechaTimbreServidor + ' ' + fechaHoraServidor}, id_reloj: ${timbre.id_reloj}, ubicacion: ${timbre.ubicacion}, dispositivo_timbre: ${timbre.dispositivo_timbre}, imagen: ${timbre.imagen} }`,
                ip: timbre.ip,
                observacion: null
            });

            // FINALIZAR TRANSACCION
            await pool.query('COMMIT');

            res.jsonp({
                message: 'Timbre creado con éxito',
                respuestaBDD: response
            });
        } catch (error) {
            console.log("ver el error", error);
            return res.status(500).jsonp({ message: 'Error al crear Timbre' });
        }
    };


    public async crearTimbreDesconectado(req: Request, res: Response) {
        try {
            const hoy: Date = new Date();
            const timbre: any = req.body;
            await pool.query('BEGIN');
            console.log("ver req.body", req.body)

            timbre.fecha_subida_servidor = hoy.getFullYear() + "-" + (hoy.getMonth() + 1) + "-" + hoy.getDate() + " " + hoy.getHours() + ":" + hoy.getMinutes() + ":" + hoy.getSeconds();
            const fechaHoraEnZonaHorariaDispositivo = moment(timbre.fecha_hora_timbre_servidor)
                .tz(timbre.zona_horaria_dispositivo)
                .format('YYYY-MM-DD HH:mm:ss');
            const zonaHorariaServidor = moment.tz.guess();


            const timbreRV: Date = new Date(timbre.fecha_hora_timbre || '');
            const restaTimbresHoras = timbreRV.getHours() - hoy.getHours();
            const restaTimbresMinutos = timbreRV.getMinutes() - hoy.getMinutes();
            const restaTimbresDias = timbreRV.getDate() - hoy.getDate();
            if (restaTimbresDias != 0 || restaTimbresHoras != 0 || restaTimbresMinutos > 3 || restaTimbresMinutos < -3) {
                if (restaTimbresHoras == 1 && restaTimbresMinutos > 58 && restaTimbresMinutos < -58) {
                    timbre.hora_timbre_diferente = false;
                } else if (restaTimbresDias == 1 && restaTimbresHoras == 23 || restaTimbresHoras == -23 && restaTimbresMinutos > 58 && restaTimbresMinutos < -58) {
                    timbre.hora_timbre_diferente = false;
                } else {
                    timbre.hora_timbre_diferente = true;
                }
            } else {
                timbre.hora_timbre_diferente = false;
            }

            const response = await pool.query('INSERT INTO eu_timbres (fecha_hora_timbre, accion, tecla_funcion, ' +
                'observacion, latitud, longitud, codigo, id_reloj, tipo_autenticacion, ' +
                'dispositivo_timbre, fecha_hora_timbre_servidor, hora_timbre_diferente, ubicacion, conexion, fecha_subida_servidor, novedades_conexion, imagen, fecha_hora_timbre_validado, zona_horaria_servidor) ' +
                'VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19);',
                [timbre.fecha_hora_timbre, 'dd', timbre.tecla_funcion, timbre.observacion,
                timbre.latitud, timbre.longitud, timbre.codigo, timbre.id_reloj,
                timbre.tipo_autenticacion, timbre.dispositivo_timbre, timbre.fecha_hora_timbre,
                timbre.hora_timbre_diferente, timbre.ubicacion, timbre.conexion, timbre.fecha_subida_servidor, timbre.novedades_conexion, timbre.imagen, timbre.fecha_hora_timbre, zonaHorariaServidor]);

            const fechaHora = await FormatearHora(timbre.fecha_hora_timbre.toLocaleString().split(' ')[1]);
            const fechaTimbre = await FormatearFecha2(timbre.fecha_hora_timbre.toLocaleString(), 'ddd');
            await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                tabla: 'eu_timbres',
                usuario: timbre.user_name,
                accion: 'I',
                datosOriginales: '',
                datosNuevos: `{fecha_hora_timbre: ${fechaTimbre + ' ' + fechaHora}, accion: ${timbre.accion}, tecla_funcion: ${timbre.tecla_funcion}, observacion: ${timbre.observacion}, latitud: ${timbre.latitud}, longitud: ${timbre.longitud}, codigo: ${timbre.codigo}, fecha_hora_timbre_servidor: '', id_reloj: ${timbre.id_reloj}, ubicacion: ${timbre.ubicacion}, dispositivo_timbre: ${timbre.dispositivo_timbre}, id_empleado: ${timbre.id_empleado}, imagen: ${timbre.imagen} }`,
                ip: timbre.ip,
                observacion: null
            });

            // FINALIZAR TRANSACCION
            await pool.query('COMMIT');

            res.jsonp({
                message: 'Timbre creado con éxito',
                respuestaBDD: response
            })
        } catch (error) {
            console.log(error);
            return res.status(500).jsonp({ message: 'Error al crear Timbre' });
        }

    };

    public async crearTimbreJustificadoAdmin(req: Request, res: Response) {
        try {
            const { fec_hora_timbre, accion, tecl_funcion, observacion, latitud, longitud, codigo, id_reloj, user_name, ip, documento, dispositivo_timbre, conexion, hora_timbre_diferente } = req.body
            console.log(req.body);
            await pool.query('BEGIN');
            const zonaHorariaServidor = moment.tz.guess();


            const [timbre] = await pool.query('INSERT INTO eu_timbres (fecha_hora_timbre, accion, tecla_funcion, observacion, latitud, longitud, codigo, id_reloj, fecha_hora_timbre_servidor, documento, dispositivo_timbre,conexion, hora_timbre_diferente, fecha_hora_timbre_validado, zona_horaria_servidor) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $1, $14) RETURNING id',
                [fec_hora_timbre, accion, tecl_funcion, observacion, latitud, longitud, codigo, id_reloj, fec_hora_timbre, documento, dispositivo_timbre, conexion, hora_timbre_diferente, zonaHorariaServidor])
                .then(result => {
                    return result.rows;
                });
            const fechaHora = await FormatearHora(fec_hora_timbre.toLocaleString().split('T')[1]);
            const fechaTimbre = await FormatearFecha2(fec_hora_timbre.toLocaleString(), 'ddd');


            await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                tabla: 'eu_timbres',
                usuario: user_name,
                accion: 'I',
                datosOriginales: '',
                datosNuevos: `{fecha_hora_timbre: ${fechaTimbre + ' ' + fechaHora}, accion: ${accion}, tecla_funcion: ${tecl_funcion}, observacion: ${observacion}, latitud: ${latitud}, longitud: ${longitud}, codigo: ${codigo}, fecha_hora_timbre_servidor: ${fec_hora_timbre}, id_reloj: ${id_reloj}, ubicacion: 'null', dispositivo_timbre: ${dispositivo_timbre} }`,
                ip: ip,
                observacion: null
            });

            // FINALIZAR TRANSACCION
            await pool.query('COMMIT');

            if (!timbre) return res.status(400).jsonp({ message: "No se inserto timbre" });

            return res.status(200).jsonp({ message: "Tímbre creado exitosamente" });
        } catch (error) {
            console.log("ver error", error)
            return res.status(400).jsonp({ message: error });
        }
    }

    public async FiltrarTimbre(req: Request, res: Response) {
        try {
            const { fecInicio, fecFinal, codigo } = req.body
            // Convertir fechas de entrada a objetos Date

            console.log("ver body", req.body)
            let fechaDesde = new Date(fecInicio);
            let fechaHasta = new Date(fecFinal);
            const fechaDesdeStr = fechaDesde.toISOString().split('T')[0] + " 00:00:00";
            const fechaHastaStr = fechaHasta.toISOString().split('T')[0] + " 23:59:59";

            console.log(req.body);
            const response: QueryResult = await pool.query(
                `
                SELECT * FROM eu_timbres 
                WHERE codigo = $3 AND fecha_hora_timbre_validado BETWEEN $1 AND $2 
                ORDER BY fecha_hora_timbre_validado DESC
                `
                , [fechaDesdeStr, fechaHastaStr, codigo])
            const timbres = response.rows;
            return res.jsonp(timbres);
        } catch (error) {
            console.log("Error de filtro de timbre", error)
            return res.status(400).jsonp({ message: error });
        }
    }

    public async getTimbreByCodigo(req: Request, res: Response): Promise<Response> {
        try {

            const id = parseInt(req.params.idUsuario);
            // Obtener la fecha actual
            const fechaHasta = new Date();
            // Establecer la hora final del día (23:59:59)
            const fechaHastaStr = fechaHasta.toISOString().split('T')[0] + " 23:59:59";

            // Calcular la fecha de hace 2 meses
            const fechaDesde = new Date();
            fechaDesde.setMonth(fechaDesde.getMonth() - 2);
            // Establecer la hora inicial del día (00:00:00) para dos meses atrás
            const fechaDesdeStr = fechaDesde.toISOString().split('T')[0] + " 00:00:00";

            const response: QueryResult = await pool.query(
                `
                SELECT * FROM eu_timbres 
                WHERE codigo = $1 
                    AND fecha_hora_timbre_validado BETWEEN $2 AND $3
                ORDER BY fecha_hora_timbre_servidor DESC
                `
                , [id, fechaDesdeStr, fechaHastaStr]
            );
            const timbres: any[] = response.rows;
            return res.jsonp(timbres);
        } catch (error) {
            console.log(error);
            return res.status(500).jsonp({ message: 'Contactese con el Administrador del sistema (593) 2 – 252-7663 o https://casapazmino.com.ec' });
        }
    };

    public async justificarAtraso(req: Request, res: Response) {
        try {
            const { descripcion, fec_justifica, codigo, create_time, codigo_create_user, user_name, ip } = req.body;
            await pool.query('BEGIN');
            const [atraso] = await pool.query(
                'INSERT INTO eu_empleado_justificacion_atraso(descripcion, fecha_justifica, id_empleado, fecha_hora, id_empleado_justifica) ' +
                'VALUES($1, $2, $3, $4, $5) RETURNING id',
                [descripcion, fec_justifica, codigo, create_time, codigo_create_user])
                .then(res => {
                    return res.rows;
                });

            const fechaHora = await FormatearHora(create_time.toLocaleString().split('T')[1]);
            const fechaTimbre = await FormatearFecha2(create_time.toLocaleString(), 'ddd');

            const fechaHoraJustificacion = await FormatearHora(fec_justifica.toLocaleString().split('T')[1]);
            const fechaTimbreJustificacion = await FormatearFecha2(fec_justifica.toLocaleString(), 'ddd');
            await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                tabla: 'eu_empleado_justificacion_atraso',
                usuario: user_name,
                accion: 'I',
                datosOriginales: '',
                datosNuevos: `{fecha_hora: ${fechaTimbre + ' ' + fechaHora}, fecha_justifica: ${fechaTimbreJustificacion + ' ' + fechaHoraJustificacion}, descripcion: ${descripcion}, id_empleado: ${codigo}, id_empleado_justifica: ${codigo_create_user} }`,
                ip: ip,
                observacion: null
            });

            // FINALIZAR TRANSACCION
            await pool.query('COMMIT');

            if (!atraso) return res.status(400).jsonp({ message: "Atraso no insertado" });

            return res.status(200).jsonp({
                body: {
                    mensaje: "Atraso justificado",
                    response: atraso.rows
                }
            })

        } catch (error) {
            console.log(error);
            return res.status(500).jsonp({ message: 'Error al crear justificación' });
        }
    };

}

export const timbresControlador = new TimbresControlador;

export default timbresControlador