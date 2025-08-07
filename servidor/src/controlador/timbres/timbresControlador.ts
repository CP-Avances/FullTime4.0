import AUDITORIA_CONTROLADOR from '../reportes/auditoriaControlador';
import { FormatearFecha2, FormatearHora } from '../../libs/settingsMail';
import { Request, Response } from 'express';
import { QueryResult } from 'pg';
import { DateTime } from 'luxon';
import pool from '../../database';
import { archivoService } from '../../services/archivoService';

class TimbresControlador {

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

            if (timbres.length === 0) return res.status(400).jsonp({ message: 'Ups! no existen registros.' });

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

    // METODO DE REGISTRO DE TIMBRES PERSONALES    **USADO
    public async CrearTimbreWeb(req: Request, res: Response): Promise<any> {
        try {
            // DOCUMENTO ES NULL YA QUE ESTE USUARIO NO JUSTIFICA UN TIMBRE
            const { fec_hora_timbre, accion, tecl_funcion, observacion, latitud, longitud, id_reloj,
                ubicacion, user_name, ip, imagen, zona_dispositivo, gmt_dispositivo,
                capturar_segundos, ip_local } = req.body;

            const id_empleado = req.userIdEmpleado;
            var hora_diferente: boolean = false;
            var fecha_validada: any;

            var zona_servidor = Intl.DateTimeFormat().resolvedOptions().timeZone;
            // OBTENER EL OFFSET GMT EN MINUTOS
            const gmt_minutos = new Date().getTimezoneOffset();
            // CONVERTIR EL OFFSET A HORAS
            const gmt_horas = -gmt_minutos / 60;
            // FORMATEAR COMO GMT
            const gmt_servidor = `GMT${gmt_horas >= 0 ? '+' : ''}${gmt_horas.toString().padStart(2, '0')}`;

            // OBTENER LA FECHA Y HORA ACTUAL DEL SERVIDOR DEL APLICATIVO
            var now = DateTime.now();
            const now_ = new Date();
            // FORMATEAR LA FECHA Y HORA ACTUAL EN EL FORMATO DESEADO
            var fecha_servidor = now.toFormat('dd/MM/yyyy, hh:mm:ss a');
            fecha_validada = now.toFormat('dd/MM/yyyy, hh:mm:ss a');

            // FORMATEAR FECHA Y HORA DEL TIMBRE INGRESADO
            var fecha_timbre = DateTime.fromFormat(fec_hora_timbre, 'dd/MM/yyyy h:mm:ss a').toFormat('yyyy-MM-dd');
            var hora_timbre = DateTime.fromFormat(fec_hora_timbre, 'dd/MM/yyyy h:mm:ss a').toFormat('HH:mm:ss');

            // VERIFICAR ZONA HORARIA
            if (zona_dispositivo != zona_servidor) {
                const convertToTimeZone = (date: Date, timeZone: string): string => {
                    return DateTime.fromJSDate(date).setZone(timeZone).toFormat('yyyy-MM-dd HH:mm:ss');
                };
                var fecha_: any = convertToTimeZone(now_, zona_dispositivo)
                fecha_validada = DateTime.fromFormat(fecha_, 'yyyy-MM-dd HH:mm:ss', { zone: zona_dispositivo }).toFormat('dd/MM/yyyy, hh:mm:ss a');
                var verificar_fecha = DateTime.fromFormat(fecha_validada, 'dd/MM/yyyy, hh:mm:ss a').toFormat('yyyy-MM-dd');
                hora_diferente = ValidarZonaHoraria(verificar_fecha, fecha_timbre, fecha_validada, fec_hora_timbre);
            }
            else {
                // FORMATEAR LA FECHA Y HORA ACTUAL EN EL FORMATO DESEADO
                var verificar_fecha = DateTime.fromFormat(fecha_validada, 'dd/MM/yyyy, hh:mm:ss a').toFormat('yyyy-MM-dd');
                // VERIFICAR HORAS DEL TIMBRE Y DEL SERVIDOR
                hora_diferente = ValidarZonaHoraria(verificar_fecha, fecha_timbre, fecha_validada, fec_hora_timbre);
            }

            // METODO PARA VERIFICAR USO DE SEGUNDOS
            var fecha_servidor_final: any;
            var fecha_validada_final: any;

            if (capturar_segundos === false) {
                fecha_servidor_final = DateTime.fromFormat(fecha_servidor, 'dd/MM/yyyy, hh:mm:ss a')
                    .set({ second: 0 }).toFormat('dd/MM/yyyy, hh:mm:ss a');
                fecha_validada_final = DateTime.fromFormat(fecha_validada, 'dd/MM/yyyy, hh:mm:ss a')
                    .set({ second: 0 }).toFormat('dd/MM/yyyy, hh:mm:ss a');
            }
            else {
                fecha_servidor_final = fecha_servidor;
                fecha_validada_final = fecha_validada;
            }

            let code = await pool.query(
                `
                    SELECT codigo FROM eu_empleados WHERE id = $1
                `
                , [id_empleado]).then((result: any) => { return result.rows });

            if (code.length === 0) return { mensaje: 'El usuario no tiene un código asignado.' };

            var codigo = parseInt(code[0].codigo);

            // INICIAR TRANSACCION
            await pool.query('BEGIN');

            // CONVERTIR FECHAS A FORMATO ACEPTADO POR POSTGRESQL
            const fec_hora_timbre_sql = DateTime.fromFormat(fec_hora_timbre, 'dd/MM/yyyy h:mm:ss a').toFormat('yyyy-MM-dd HH:mm:ss');
            const fecha_servidor_sql = DateTime.fromFormat(fecha_servidor_final, 'dd/MM/yyyy, hh:mm:ss a').toFormat('yyyy-MM-dd HH:mm:ss');
            const fecha_validada_sql = DateTime.fromFormat(fecha_validada_final, 'dd/MM/yyyy, hh:mm:ss a').toFormat('yyyy-MM-dd HH:mm:ss');

            pool.query(
                `
                    SELECT * FROM public.timbres_web ($1, $2, 
                        $3::timestamp without time zone, 
                        $4::timestamp without time zone, 
                        $5::timestamp without time zone, 
                        $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
                `,
                [codigo, id_reloj, fec_hora_timbre_sql, fecha_servidor_sql, fecha_validada_sql,
                    tecl_funcion, accion, observacion, latitud, longitud, ubicacion, 'APP_WEB',
                    imagen, true, zona_servidor, gmt_servidor, zona_dispositivo, gmt_dispositivo, hora_diferente],

                async (error, results) => {

                    const fechaHora = await FormatearHora(hora_timbre);
                    const fechaTimbre = await FormatearFecha2(fecha_timbre, 'ddd');
                    let existe_imagen = false;

                    if (imagen) {
                        existe_imagen = true;
                    }

                    await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                        tabla: 'eu_timbres',
                        usuario: user_name,
                        accion: 'I',
                        datosOriginales: '',
                        datosNuevos: `{fecha_hora_timbre: ${fechaTimbre + ' ' + fechaHora}, accion: ${accion}, tecla_funcion: ${tecl_funcion}, observacion: ${observacion}, latitud: ${latitud}, longitud: ${longitud}, codigo: ${codigo}, fecha_hora_timbre_servidor: ${fecha_servidor}, fecha_hora_timbre_validado: ${fecha_validada}, id_reloj: ${id_reloj}, ubicacion: ${ubicacion}, dispositivo_timbre: 'APP_WEB', imagen: ${existe_imagen} }`,
                        ip: ip,
                        ip_local: ip_local,
                        observacion: null
                    });

                    //FINALIZAR TRANSACCION
                    await pool.query('COMMIT');
                    if (results) {
                        if (results.rows[0].timbres_web === 0) {
                            res.status(200).jsonp({ message: 'Registro duplicado.' });
                        }
                        else {
                            res.status(200).jsonp({ message: 'Registro guardado.' });
                        }
                    }
                    else {
                        res.status(200).jsonp({ message: 'Ups! algo salio mal.' });
                    }
                }
            )
        } catch (error) {
            console.log('error 500 ', error)
            // REVERTIR TRANSACCION
            await pool.query('ROLLBACK');
            res.status(500).jsonp({ message: error });
        }
    }

    // METODO PARA REGISTRAR TIMBRE ADMINISTRADOR    **USADO
    public async CrearTimbreWebAdmin(req: Request, res: Response): Promise<any> {
        const client = await pool.connect(); // OBTENER UN CLIENTE PARA LA TRANSACCION

        try {
            // DATOS REQUERIDOS PARA EL METODO
            const {
                fec_hora_timbre, accion, tecl_funcion, observacion,
                id_empleado, id_reloj, tipo, ip, user_name, documento, ip_local
            } = req.body;

            const id_empleados = Array.isArray(id_empleado) ? id_empleado : [id_empleado];

            const fecha_ = DateTime.fromISO(fec_hora_timbre);
            var hora_fecha_timbre = fecha_.toFormat('dd/MM/yyyy, hh:mm:ss a');

            const fecha_insertar = DateTime.fromISO(fec_hora_timbre);
            const hora_fecha_timbre_insertar = fecha_insertar.toFormat('yyyy-MM-dd HH:mm:ss');  // FORMATO ADECUADO PARA POSTGRESQL

            // OBTENER CODIGOS DE LOS EMPLEADOS
            const code = await client.query(
                `SELECT codigo FROM eu_empleados WHERE id = ANY($1::int[])`,
                [id_empleados]
            );

            if (code.rows.length === 0) {
                res.status(404).json({ mensaje: 'El usuario no tiene un código asignado.' });
                return;
            }

            const code_empleados = code.rows.map((empl: any) => empl.codigo);

            // INICIAR TRANSACCION
            await client.query('BEGIN');

            const timbrePromises = code_empleados.map(async (codigo) => {
                const res = await client.query(
                    `SELECT public.timbres_verificar ($1, to_timestamp($2, 'DD/MM/YYYY, HH:MI:SS pm')::timestamp without time zone)  AS resultado`,

                    [codigo, hora_fecha_timbre]
                );

                return { codigo, resultado: res.rows[0].resultado }; // RETORNA EL CODIGO Y EL RESULTADO
            });

            const timbresResultados = await Promise.all(timbrePromises); // ESPERA A QUE TODAS LAS PROMESAS SE RESUELVAN

            // FILTRA SOLO LOS CODIGOS DONDE EL RESULTADO SEA 1
            const filtrados = timbresResultados
                .filter((timbre) => timbre.resultado === 1)
                .map((timbre) => timbre.codigo); // EXTRAE SOLO LOS CODIGOS

            const batchSize = 1000; // TAMAÑO DEL LOTE (AJUSTABLE SEGÚN LA CAPACIDAD DE TU BASE DE DATOS)
            const batches = [];
            for (let i = 0; i < filtrados.length; i += batchSize) {
                batches.push(filtrados.slice(i, i + batchSize));
            }

            for (const batch of batches) {
                const valores = batch
                    .map((filtrados: any) => {
                        // VERIFICA SI ALGUNO DE LOS VALORES ES 'UNDEFINED' Y LO REEMPLAZA POR NULL O UN VALOR PREDETERMINADO
                        const documentoValue = documento === undefined ? 'NULL' : `'${documento}'`;  // REEMPLAZA UNDEFINED POR NULL
                        const horaFechaTimbre = `'${hora_fecha_timbre_insertar}'`;  // ASEGURATE DE QUE LA FECHA ESTE EN FORMATO CORRECTO
                        return `('${filtrados}', '${id_reloj}', ${horaFechaTimbre}, ${horaFechaTimbre}, '${accion}','${tecl_funcion}' , '${observacion}', 'APP_WEB', ${documentoValue}, true, ${horaFechaTimbre})`;
                    })
                    .join(', ');
                // EJECUTAR LA INSERCION EN CADA LOTE
                await pool.query(
                    `INSERT INTO eu_timbres (codigo, id_reloj, fecha_hora_timbre, fecha_hora_timbre_servidor, accion, tecla_funcion, 
		                observacion, dispositivo_timbre, documento, conexion, fecha_hora_timbre_validado) 
                    VALUES ${valores}`
                );
            }

            var fecha = fecha_.toFormat('yyyy-MM-dd');
            var hora = fecha_.toFormat('HH:mm:ss');

            const fechaHora = await FormatearHora(hora);
            const fechaTimbre = await FormatearFecha2(fecha, 'ddd');
            let existe_documento = !!documento;
            const auditoria = code_empleados.map((codigo: any) => ({
                tabla: 'eu_timbres',
                usuario: user_name,
                accion: 'I',
                datosOriginales: '',
                datosNuevos: `{fecha_hora_timbre: ${fechaTimbre + ' ' + fechaHora}, accion: ${accion}, tecla_funcion: ${tecl_funcion}, observacion: ${observacion}, codigo: ${codigo}, id_reloj: ${id_reloj}, dispositivo_timbre: 'APP_WEB', fecha_hora_timbre_servidor: ${fechaTimbre + ' ' + fechaHora}, documento: ${existe_documento}, fecha_hora_timbre_validado: ${fechaTimbre + ' ' + fechaHora} }`,
                ip: ip,
                ip_local: ip_local,
                observacion: null
            }));

            await AUDITORIA_CONTROLADOR.InsertarAuditoriaPorLotes(auditoria, user_name, ip, ip_local);

            // CONFIRMAR LA TRANSACCION
            await client.query('COMMIT');

            res.status(200).json({ message: 'Registro guardado.' });

        } catch (error) {
            console.error('Error durante la transacción:', error);

            // REVERTIR LA TRANSACCION EN CASO DE ERROR
            await client.query('ROLLBACK');

            res.status(500).json({ message: 'Error interno del servidor.' });
        } finally {
            client.release(); // LIBERAR EL CLIENTE AL FINAL
        }
    }

    // METODO PARA BUSCAR EL TIMBRE DEL EMPLEADO POR FECHA     **USADO
    public async ObtenertimbreFechaEmple(req: Request, res: Response): Promise<any> {
        try {
            let { codigo, identificacion, fecha } = req.query;
            fecha = fecha + '%';
            if (codigo === '') {
                let usuario = await pool.query(
                    `
                        SELECT * FROM informacion_general    
                        WHERE identificacion = $1
                    `
                    , [identificacion]).then((result: any) => {
                        return result.rows.map((obj: any) => {
                            codigo = obj.codigo;
                        });
                    }
                    );
            } else if (identificacion === '') {
                let usuario = await pool.query(
                    `
                        SELECT * FROM informacion_general 
                        WHERE codigo = $1
                    `
                    , [codigo]).then((result: any) => {
                        return result.rows.map((obj: any) => {
                            identificacion = obj.identificacion;
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
                        AND da.identificacion = $3
                `
                , [codigo, fecha, identificacion]).then((result: any) => {
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
            const message = 'Ups! problemas con la petición al servidor.'
            return res.status(500).jsonp({ error: err, message: message })
        }
    }

    // METODO PARA ACTUALIZAR O EDITAR EL TIMBRE DEL EMPLEADO   **USADO
    public async EditarTimbreEmpleadoFecha(req: Request, res: Response): Promise<any> {
        try {
            let { id, codigo, tecla, observacion, fecha, user_name, ip, ip_local } = req.body;

            const timbre = await pool.query(
                `
                    SELECT * FROM eu_timbres WHERE id = $1
                `
                , [id]);
            const [datosOriginales] = timbre.rows;

            if (!datosOriginales) {
                await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                    tabla: 'eu_timbres',
                    usuario: user_name,
                    accion: 'U',
                    datosOriginales: '',
                    datosNuevos: '',
                    ip: ip,
                    ip_local: ip_local,
                    observacion: `Error al actualizar timbre con id: ${id}`
                });

                // FINALIZAR TRANSACCION
                await pool.query('COMMIT');
                return res.status(404).jsonp({ message: 'Error al actualizar timbre' });
            }

            const fechaHora = await FormatearHora(datosOriginales.fecha_hora_timbre.toLocaleString().split(' ')[1]);
            const fechaTimbre = await FormatearFecha2(datosOriginales.fecha_hora_timbre, 'ddd');

            const fechaHoraServidor = await FormatearHora(datosOriginales.fecha_hora_timbre_servidor.toLocaleString().split(' ')[1]);
            const fechaTimbreServidor = await FormatearFecha2(datosOriginales.fecha_hora_timbre_servidor, 'ddd');

            const fechaHoraValidado = await FormatearHora(datosOriginales.fecha_hora_timbre_validado.toLocaleString().split(' ')[1]);
            const fechaTimbreValidado = await FormatearFecha2(datosOriginales.fecha_hora_timbre_validado, 'ddd');

            const actualizacion = await pool.query(
                `
                    SELECT * FROM modificartimbre ($1::timestamp without time zone, $2::character varying, 
                        $3::character varying, $4::integer, $5::character varying) 
                `
                , [fecha, codigo, tecla, id, observacion]);
            const [datosNuevos] = actualizacion.rows;
            let existe_imagen = false;
            if (datosOriginales.imagen) {
                existe_imagen = true
            }
            let existe_documento = false;
            if (datosOriginales.documento) {
                existe_documento = true
            }
            // AUDITORIA
            await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                tabla: 'eu_timbres',
                usuario: user_name,
                accion: 'U',
                datosOriginales: `{fecha_hora_timbre: ${fechaTimbre + ' ' + fechaHora}, accion: ${datosOriginales.accion}, tecla_funcion: ${datosOriginales.tecla_funcion}, observacion: ${datosOriginales.observacion}, latitud: ${datosOriginales.latitud}, longitud: ${datosOriginales.longitud}, codigo: ${datosOriginales.codigo}, fecha_hora_timbre_servidor: ${fechaTimbreServidor + ' ' + fechaHoraServidor}, fecha_hora_timbre_validado: ${fechaTimbreValidado + ' ' + fechaHoraValidado}, id_reloj: ${datosOriginales.id_reloj}, ubicacion: ${datosOriginales.ubicacion}, dispositivo_timbre: 'APP_WEB', imagen: ${existe_imagen}, documento:${existe_documento} }`,
                datosNuevos: `{fecha_hora_timbre: ${fechaTimbre + ' ' + fechaHora}, accion: ${datosNuevos.modificartimbre}, tecla_funcion: ${tecla}, observacion: ${observacion}, latitud: ${datosOriginales.latitud}, longitud: ${datosOriginales.longitud}, codigo: ${codigo}, fecha_hora_timbre_servidor: ${fechaTimbreServidor + ' ' + fechaHoraServidor}, fecha_hora_timbre_validado: ${fechaTimbreValidado + ' ' + fechaHoraValidado}, id_reloj: ${datosOriginales.id_reloj}, ubicacion: ${datosOriginales.ubicacion}, dispositivo_timbre: 'APP_WEB', imagen: ${existe_imagen}, documento:${existe_documento}  }`,
                ip: ip,
                ip_local: ip_local,
                observacion: null
            });

            return res.status(200).jsonp({ message: 'Registro actualizado.' });

        } catch (err) {
            console.log('timbre error ', err)
            const message = 'Ups! algo salio mal con la peticion al servidor.'
            return res.status(500).jsonp({ error: err, message: message })
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


    /** ********************************************************************************** **
     ** **                 CONSULTAS DE OPCIONES DE MARCACIONES                         ** **
     ** ********************************************************************************** **/

    // METODO PARA BUSCAR OPCIONES DE TIMBRES    **USADO
    public async BuscarOpcionesTimbre(req: Request, res: Response): Promise<any> {
        const { ids_empleados } = req.body;
        // VALIDAR QUE IDS_EMPLEADOS SEA UN ARRAY
        if (!Array.isArray(ids_empleados) || ids_empleados.length === 0) {
            return res.status(400).jsonp({ message: 'Debe proporcionar un array de IDs de empleados válido' });
        }

        const OPCIONES = await pool.query(
            `
                SELECT * FROM mrv_opciones_marcacion 
                WHERE id_empleado = ANY($1)
            `
            , [ids_empleados]);

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
            "SELECT e.nombre, e.apellido, e.identificacion, e.codigo, om.id, om.id_empleado, om.timbre_internet, " +
            "   om.timbre_foto, om.timbre_especial, om.timbre_ubicacion_desconocida, om.opcional_obligatorio " +
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

    // METODO PARA ALMACENAR CONFIGURACION DE TIMBRE     **USADO
    public async IngresarOpcionTimbre(req: Request, res: Response): Promise<void> {

        try {
            const { id_empleado, timbre_internet, timbre_foto, timbre_especial, timbre_ubicacion_desconocida,
                user_name, ip, ip_local, timbre_foto_obligatoria } = req.body;
            const batchSize = 1000; // TAMAÑO DEL LOTE (AJUSTABLE SEGUN LA CAPACIDAD DE TU BASE DE DATOS)
            const batches = [];
            for (let i = 0; i < id_empleado.length; i += batchSize) {
                batches.push(id_empleado.slice(i, i + batchSize));
            }
            for (const batch of batches) {
                const valores = batch
                    .map((id_empleado: number) => `(${id_empleado}, ${timbre_internet}, ${timbre_foto}, ${timbre_especial}, ${timbre_ubicacion_desconocida}, ${timbre_foto_obligatoria})`)
                    .join(', ');

                // EJECUTAR LA INSERCION EN CADA LOTE
                await pool.query(
                    `
                        INSERT INTO mrv_opciones_marcacion (id_empleado, timbre_internet, timbre_foto, timbre_especial,
                            timbre_ubicacion_desconocida, opcional_obligatorio ) 
                        VALUES ${valores}
                    `
                );
            }
            const auditoria = id_empleado.map((id_empleado: number) => ({
                tabla: 'mrv_opciones_marcacion',
                usuario: user_name,
                accion: 'I',
                datosOriginales: '',
                datosNuevos: `id_empleado: ${id_empleado}, timbre_internet: ${timbre_internet}, timbre_foto: ${timbre_foto}, timbre_especial: ${timbre_especial}, 
                opcional_obligatorio: ${timbre_ubicacion_desconocida}`,
                ip: ip,
                ip_local: ip_local,
                observacion: null
            }));
            await AUDITORIA_CONTROLADOR.InsertarAuditoriaPorLotes(auditoria, user_name, ip, ip_local);
            await pool.query('COMMIT');
            res.jsonp({ message: 'Sin duplicados' });
        } catch (error) {
            console.log('error ', error)
            // REVERTIR TRANSACCION
            await pool.query('ROLLBACK');
            res.status(500).jsonp({ message: 'error' });
        }
    }

    // METODO PARA ALMACENAR CONFIGURACION DE TIMBRE      **USADO
    public async ActualizarOpcionTimbre(req: Request, res: Response): Promise<Response> {

        try {
            let { id_empleado, timbre_internet, timbre_foto, timbre_especial, timbre_ubicacion_desconocida,
                user_name, ip, ip_local, timbre_foto_obligatoria } = req.body;

            // INICIAR TRANSACCION
            await pool.query('BEGIN');

            // CREAR UN OBJETO CON LOS VALORES A ACTUALIZAR
            const updateValues: { [key: string]: any } = {};

            // AGREGAR LOS PARAMETROS AL OBJETO SI NO SON NULOS
            if (timbre_internet != null) updateValues.timbre_internet = timbre_internet;
            if (timbre_foto != null) {
                updateValues.timbre_foto = timbre_foto;
                if (!timbre_foto) timbre_foto_obligatoria = false;
            }
            if (timbre_especial != null) updateValues.timbre_especial = timbre_especial;
            if (timbre_ubicacion_desconocida != null) updateValues.timbre_ubicacion_desconocida = timbre_ubicacion_desconocida;
            if (timbre_foto_obligatoria != null) updateValues.opcional_obligatorio = timbre_foto_obligatoria;

            // SI NO HAY VALORES PARA ACTUALIZAR, RETORNAR
            if (Object.keys(updateValues).length === 0) {
                console.log('No hay parámetros para actualizar');
                return res.status(404).jsonp({ message: 'error' })
            }

            // CONSTRUIR LA PARTE SET DE LA CONSULTA
            const setClause = Object.keys(updateValues)
                .map((key, index) => `${key} = $${index + 2}`)
                .join(', ');

            // CREAR LOS VALORES PARA LA CONSULTA SQL
            const queryValues = [id_empleado, ...Object.values(updateValues)];

            // EJECUTAR LA CONSULTA
            const response: QueryResult = await pool.query(
                `UPDATE mrv_opciones_marcacion SET ${setClause} WHERE id_empleado = ANY($1::int[])`,
                queryValues
            );

            // OBTENER LAS FILAS AFECTADAS
            let rowsAffected = response.rowCount ?? 0;

            const auditoria = id_empleado.map((id: number) => {
                const nuevosDatos: string[] = [`id_empleado: ${id}`];

                if (timbre_internet !== null && timbre_internet !== undefined)
                    nuevosDatos.push(`timbre_internet: ${timbre_internet}`);

                if (timbre_foto !== null && timbre_foto !== undefined)
                    nuevosDatos.push(`timbre_foto: ${timbre_foto}`);

                if (timbre_especial !== null && timbre_especial !== undefined)
                    nuevosDatos.push(`timbre_especial: ${timbre_especial}`);

                if (timbre_ubicacion_desconocida !== null && timbre_ubicacion_desconocida !== undefined)
                    nuevosDatos.push(`timbre_ubicacion_desconocida: ${timbre_ubicacion_desconocida}`);

                if (timbre_foto_obligatoria !== null && timbre_foto_obligatoria !== undefined)
                    nuevosDatos.push(`opcional_obligatorio: ${timbre_foto_obligatoria}`);

                return {
                    tabla: 'mrv_opciones_marcacion',
                    usuario: user_name,
                    accion: 'I',
                    datosOriginales: '',
                    datosNuevos: nuevosDatos.join(', '),
                    ip: ip,
                    ip_local: ip_local,
                    observacion: null
                }
            });

            await AUDITORIA_CONTROLADOR.InsertarAuditoriaPorLotes(auditoria, user_name, ip, ip_local);

            // FINALIZAR TRANSACCION
            await pool.query('COMMIT');
            if (rowsAffected > 0) {
                return res.status(200).jsonp({ message: 'Actualización exitosa', rowsAffected })

            } else {
                return res.status(404).jsonp({ message: 'error' })
            }

        } catch (error) {
            // REVERTIR TRANSACCION
            console.log("ver error de actualizar: ", error)
            await pool.query('ROLLBACK');
            return res.status(500).jsonp({ message: 'error' });
        }
    }

    // METODO PARA ELIMINAR REGISTROS    **USADO
    public async EliminarRegistros(req: Request, res: Response): Promise<Response> {
        try {
            const { user_name, ip, ids, ip_local } = req.body;

            if (!Array.isArray(ids) || ids.length === 0) {
                return res.status(400).jsonp({ message: 'Debe proporcionar un array de IDs válido.' });
            }
            // INICIAR TRANSACCION
            await pool.query('BEGIN');

            // OBTENER DATOS ORIGINALES
            const consulta = await pool.query(`SELECT * FROM mrv_opciones_marcacion WHERE id_empleado = ANY($1)`, [ids]);
            const datosOriginales = consulta.rows;
            const idsEncontrados = datosOriginales.map((row: any) => row.id_empleado);
            const idsNoEncontrados = ids.filter((id: number) => !idsEncontrados.includes(id));

            if (idsEncontrados.length === 0) {
                const auditoria = idsNoEncontrados.map((id_empleado: number) => ({
                    tabla: 'mrv_opciones_marcacion',
                    usuario: user_name,
                    accion: 'D',
                    datosOriginales: '',
                    datosNuevos: '',
                    ip: ip,
                    ip_local: ip_local,
                    observacion: `Error al eliminar registro con id ${id_empleado}`
                }));
                await AUDITORIA_CONTROLADOR.InsertarAuditoriaPorLotes(auditoria, user_name, ip, ip_local);
                await pool.query('COMMIT');
                return res.status(404).jsonp({ message: 'Ningún registro encontrado para eliminar.', idsNoEncontrados: ids });
            }
            else {
                if (idsNoEncontrados.length != 0) {
                    const auditoria = idsNoEncontrados.map((id_empleado: number) => ({
                        tabla: 'mrv_opciones_marcacion',
                        usuario: user_name,
                        accion: 'D',
                        datosOriginales: '',
                        datosNuevos: '',
                        ip: ip,
                        ip_local: ip_local,
                        observacion: `Error al eliminar registro con id ${id_empleado}`
                    }));
                    await AUDITORIA_CONTROLADOR.InsertarAuditoriaPorLotes(auditoria, user_name, ip, ip_local);
                }
                await pool.query(
                    `
                        DELETE FROM mrv_opciones_marcacion WHERE id_empleado = ANY($1)
                    `
                    , [idsEncontrados]);

                const auditoria = datosOriginales.map((item: any) => ({
                    tabla: 'mrv_opciones_marcacion',
                    usuario: user_name,
                    accion: 'D',
                    datosOriginales: JSON.stringify(item),
                    datosNuevos: '',
                    ip: ip,
                    ip_local: ip_local,
                    observacion: null
                }));

                await AUDITORIA_CONTROLADOR.InsertarAuditoriaPorLotes(auditoria, user_name, ip, ip_local);
                await pool.query('COMMIT');
                return res.jsonp({ message: 'Se ha eliminado ' + idsEncontrados.length + ' registros.' });
            }
        } catch (error) {
            // REVERTIR TRANSACCION
            await pool.query('ROLLBACK');
            return res.jsonp({ message: 'error' });
        }
    }


    /** ********************************************************************************** **
     ** **                 CONSULTAS DE OPCIONES DE MARCACIONES                         ** **
     ** ********************************************************************************** **/

    // METODO PARA BUSCAR OPCIONES DE TIMBRES DE VARIOS USUARIOS    **USADO
    public async BuscarMultipleOpcionesTimbreWeb(req: Request, res: Response): Promise<any> {
        const { id_empleado } = req.body;
        const OPCIONES = await pool.query(
            "SELECT * FROM mtv_opciones_marcacion " +
            "WHERE id_empleado IN (" + id_empleado + ") "
        );

        if (OPCIONES.rowCount != 0) {
            return res.jsonp({ message: 'OK', respuesta: OPCIONES.rows })
        }
        else {
            return res.status(404).jsonp({ message: 'vacio' });
        }
    }

    // METODO PARA BUSCAR OPCIONES DE MARCACION DE MULTIPLES USUARIOS  **USADO
    public async BuscarMultipleOpcionesTimbreWebMultiple(req: Request, res: Response): Promise<any> {
        try {
            const { ids_empleados } = req.body; // IDS_EMPLEADOS DEBE SER UN ARRAY DE IDS

            // VALIDAR QUE IDS_EMPLEADOS SEA UN ARRAY
            if (!Array.isArray(ids_empleados) || ids_empleados.length === 0) {
                return res.status(400).jsonp({ message: 'Debe proporcionar un array de IDs de empleados válido' });
            }

            const OPCIONES = await pool.query(
                "SELECT * FROM mtv_opciones_marcacion " +
                "WHERE id_empleado = ANY($1)",
                [ids_empleados] // PASAMOS EL ARRAY DIRECTAMENTE A LA CONSULTA
            );

            if (OPCIONES.rowCount !== 0) {
                return res.jsonp({ message: 'OK', respuesta: OPCIONES.rows });
            }
            else {
                return res.status(404).jsonp({ message: 'vacio' });
            }
        } catch (error) {
            console.error('Error al buscar opciones de marcación:', error);
            return res.status(500).jsonp({ message: 'Error interno del servidor' });
        }
    }

    // METODO PARA ALMACENAR CONFIGURACION DE TIMBRE     **USADO
    public async IngresarOpcionTimbreWeb(req: Request, res: Response): Promise<void> {
        try {
            const { id_empleado, timbre_foto, timbre_especial, timbre_ubicacion_desconocida, user_name, ip, ip_local, timbre_foto_obligatoria } = req.body;
            const batchSize = 1000; // TAMAÑO DEL LOTE (AJUSTABLE SEGUN LA CAPACIDAD DE TU BASE DE DATOS)
            const batches = [];
            for (let i = 0; i < id_empleado.length; i += batchSize) {
                batches.push(id_empleado.slice(i, i + batchSize));
            }
            for (const batch of batches) {
                const valores = batch
                    .map((id_empleado: number) => `(${id_empleado}, ${timbre_foto}, ${timbre_especial}, ${timbre_ubicacion_desconocida}, ${timbre_foto_obligatoria})`)
                    .join(', ');

                // EJECUTAR LA INSERCION EN CADA LOTE
                await pool.query(
                    `
                        INSERT INTO mtv_opciones_marcacion (id_empleado, timbre_foto, timbre_especial, 
                            timbre_ubicacion_desconocida, opcional_obligatorio) 
                        VALUES ${valores}
                    `
                );
            }

            const auditoria = id_empleado.map((id_empleado: number) => ({
                tabla: 'mtv_opciones_marcacion',
                usuario: user_name,
                accion: 'I',
                datosOriginales: '',
                datosNuevos: `id_empleado: ${id_empleado}, timbre_foto: ${timbre_foto}, timbre_especial: ${timbre_especial}, 
                timbre_ubicacion_desconocida: ${timbre_ubicacion_desconocida}, opcional_obligatorio: ${timbre_foto_obligatoria}`,
                ip: ip,
                ip_local: ip_local,
                observacion: null
            }));
            await AUDITORIA_CONTROLADOR.InsertarAuditoriaPorLotes(auditoria, user_name, ip, ip_local);
            await pool.query('COMMIT');
            res.jsonp({ message: 'Sin duplicados' });

        } catch (error) {
            // REVERTIR LA TRANSACCIÓN EN CASO DE ERROR
            console.log("ver el error: ", error)
            await pool.query('ROLLBACK');
            res.status(500).jsonp({ message: 'Error al guardar registros.' });
        }
    }

    // METODO PARA ALMACENAR CONFIGURACION DE TIMBRE      **USADO
    public async ActualizarOpcionTimbreWeb(req: Request, res: Response): Promise<Response> {

        try {
            let { id_empleado, timbre_foto, timbre_especial, timbre_ubicacion_desconocida, user_name, ip, ip_local, timbre_foto_obligatoria } = req.body;

            // INICIAR TRANSACCION
            await pool.query('BEGIN');

            let fields: string[] = [];
            let values: any[] = [];
            let index = 2; // $1 ES ID_EMPLEADO

            if (timbre_foto !== null && timbre_foto !== undefined) {
                fields.push(`timbre_foto = $${index++}`);
                values.push(timbre_foto);
                if (!timbre_foto) timbre_foto_obligatoria = false;
            }
            if (timbre_especial !== null && timbre_especial !== undefined) {
                fields.push(`timbre_especial = $${index++}`);
                values.push(timbre_especial);
            }
            if (timbre_ubicacion_desconocida !== null && timbre_ubicacion_desconocida !== undefined) {
                fields.push(`timbre_ubicacion_desconocida = $${index++}`);
                values.push(timbre_ubicacion_desconocida);
            }
            if (timbre_foto_obligatoria !== null && timbre_foto_obligatoria !== undefined) {
                fields.push(`opcional_obligatorio = $${index++}`);
                values.push(timbre_foto_obligatoria);
            }

            if (fields.length === 0) {
                await pool.query('ROLLBACK');
                return res.status(400).json({ message: 'No hay campos válidos para actualizar.' });
            }

            // AGREGA EL ARREGLO DE ID DE EMPLEADOS AL PRINCIPIO DE LOS VALORES
            values.unshift(id_empleado);

            const updateQuery =
                `
                    UPDATE mtv_opciones_marcacion
                        SET ${fields.join(', ')}
                    WHERE id_empleado = ANY($1::int[])
                `;

            await pool.query(updateQuery, values);

            const auditoria = id_empleado.map((id: number) => {
                const nuevosDatos: string[] = [`id_empleado: ${id}`];

                if (timbre_foto !== null && timbre_foto !== undefined)
                    nuevosDatos.push(`timbre_foto: ${timbre_foto}`);

                if (timbre_especial !== null && timbre_especial !== undefined)
                    nuevosDatos.push(`timbre_especial: ${timbre_especial}`);

                if (timbre_ubicacion_desconocida !== null && timbre_ubicacion_desconocida !== undefined)
                    nuevosDatos.push(`timbre_ubicacion_desconocida: ${timbre_ubicacion_desconocida}`);

                if (timbre_foto_obligatoria !== null && timbre_foto_obligatoria !== undefined)
                    nuevosDatos.push(`opcional_obligatorio: ${timbre_foto_obligatoria}`);

                return {
                    tabla: 'mtv_opciones_marcacion',
                    usuario: user_name,
                    accion: 'I',
                    datosOriginales: '',
                    datosNuevos: nuevosDatos.join(', '),
                    ip: ip,
                    ip_local: ip_local,
                    observacion: null
                };
            });

            await AUDITORIA_CONTROLADOR.InsertarAuditoriaPorLotes(auditoria, user_name, ip, ip_local);

            // FINALIZAR TRANSACCION
            await pool.query('COMMIT');
            return res.status(200).json({ message: 'Actualización exitosa' });

        } catch (error) {
            // REVERTIR TRANSACCION
            console.log("ver error de actualizar: ", error)
            await pool.query('ROLLBACK');
            return res.status(500).jsonp({ message: 'error' });
        }
    }

    // METODO PARA ELIMINAR REGISTROS    **USADO
    public async EliminarRegistrosWeb(req: Request, res: Response): Promise<Response> {
        try {
            const { user_name, ip, ids, ip_local } = req.body;
            // INICIAR TRANSACCION
            if (!Array.isArray(ids) || ids.length === 0) {
                return res.status(400).jsonp({ message: 'Debe proporcionar un array de IDs válido.' });
            }

            await pool.query('BEGIN');

            // OBTENER DATOS ORIGINALES
            const consulta = await pool.query(`SELECT * FROM mtv_opciones_marcacion WHERE id_empleado = ANY($1)`, [ids]);
            const datosOriginales = consulta.rows;
            // OBTENER LOS IDS ENCONTRADOS
            const idsEncontrados = datosOriginales.map((row: any) => row.id_empleado);
            const idsNoEncontrados = ids.filter((id: number) => !idsEncontrados.includes(id));
            if (idsEncontrados.length === 0) {
                const auditoria = idsNoEncontrados.map((id_empleado: number) => ({
                    tabla: 'mtv_opciones_marcacion',
                    usuario: user_name,
                    accion: 'D',
                    datosOriginales: '',
                    datosNuevos: '',
                    ip: ip,
                    ip_local: ip_local,
                    observacion: `Error al eliminar registro con id ${id_empleado}`
                }));
                await AUDITORIA_CONTROLADOR.InsertarAuditoriaPorLotes(auditoria, user_name, ip, ip_local);

                // FINALIZAR TRANSACCION
                await pool.query('COMMIT');
                return res.status(404).jsonp({ message: 'Ningún registro encontrado para eliminar.', idsNoEncontrados: ids });
            } else {
                if (idsNoEncontrados.length != 0) {
                    const auditoria = idsNoEncontrados.map((id_empleado: number) => ({
                        tabla: 'mtv_opciones_marcacion',
                        usuario: user_name,
                        accion: 'D',
                        datosOriginales: '',
                        datosNuevos: '',
                        ip: ip,
                        ip_local: ip_local,
                        observacion: `Error al eliminar registro con id ${id_empleado}`
                    }));
                    await AUDITORIA_CONTROLADOR.InsertarAuditoriaPorLotes(auditoria, user_name, ip, ip_local);
                }

                await pool.query(
                    `
                        DELETE FROM mtv_opciones_marcacion WHERE id_empleado = ANY($1)
                    `
                    , [idsEncontrados]);

                const auditoria = datosOriginales.map((item: any) => ({
                    tabla: 'mtv_opciones_marcacion',
                    usuario: user_name,
                    accion: 'D',
                    datosOriginales: JSON.stringify(item),
                    datosNuevos: '',
                    ip: ip,
                    ip_local: ip_local,
                    observacion: null
                }));

                await AUDITORIA_CONTROLADOR.InsertarAuditoriaPorLotes(auditoria, user_name, ip, ip_local);
                await pool.query('COMMIT');
                return res.jsonp({ message: 'Se ha eliminado ' + idsEncontrados.length + ' registros.' });
            }

        } catch (error) {
            // REVERTIR TRANSACCION
            await pool.query('ROLLBACK');
            return res.jsonp({ message: 'error' });
        }
    }


    /** ********************************************************************************** **
     ** **              TRATAMIENTO DE AVISOS QUE EMITE EL SISTEMA                      ** **
     ** ********************************************************************************** **/

    // RUTA DE BUSQUEDA DE UNA NOTIFICACION ESPECIFICA    **USADO
    public async ObtenerUnAviso(req: Request, res: Response): Promise<any> {
        const id = req.params.id;
        const AVISOS = await pool.query(
            `
                SELECT r.id, r.id_empleado_envia, r.id_empleado_recibe, 
                    to_char(r.fecha_hora, 'yyyy-MM-dd HH24:mi:ss') AS create_at, r.tipo, r.visto, 
                    r.id_timbre, r.descripcion, r.mensaje,
                    CASE 
                        WHEN r.id_empleado_envia = 0 THEN 'Sistema Fulltime Web'
                            ELSE COALESCE(e.nombre || ' ' || e.apellido, 'Empleado desconocido')
                        END AS empleado
                FROM ecm_realtime_timbres AS r
                LEFT JOIN eu_empleados AS e ON e.id = r.id_empleado_envia
                WHERE r.id = $1
            `,
            [id]
        );

        if (AVISOS.rowCount !== 0) {
            return res.jsonp(AVISOS.rows[0]);
        } else {
            return res.status(404).jsonp({ text: 'Registro no encontrado.' });
        }
    }

    // METODO UTILIZADO PARA ACTUALIZAR ESTADO DE LA NOTIFICACION   ** USADO
    public async ActualizarVista(req: Request, res: Response): Promise<Response> {
        try {
            const id = req.params.id_noti_timbre;
            const { visto, user_name, ip, ip_local } = req.body;

            // INICIAR TRANSACCION
            await pool.query('BEGIN');

            // CONSULTAR DATOS ORIGINALES
            const consulta = await pool.query('SELECT * FROM ecm_realtime_timbres WHERE id = $1', [id]);
            const [datosOriginales] = consulta.rows;

            if (!datosOriginales) {
                await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                    tabla: 'ecm_realtime_timbres',
                    usuario: user_name,
                    accion: 'U',
                    datosOriginales: '',
                    datosNuevos: '',
                    ip: ip,
                    ip_local: ip_local,
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
                ip: ip,
                ip_local: ip_local,
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

    // LISTA DE AVISOS    **USADO
    public async ObtenerAvisosTimbresEmpleado(req: Request, res: Response) {
        const { id_empleado } = req.params;

        try {
            const { rows: avisos } = await pool.query(
                `
                    SELECT id, id_empleado_envia, id_empleado_recibe, 
                        to_char(fecha_hora, 'yyyy-MM-dd HH24:mi:ss') AS fecha_hora, tipo, visto, 
                        id_timbre, descripcion, mensaje
                    FROM ecm_realtime_timbres
                    WHERE id_empleado_recibe = $1
                    ORDER BY fecha_hora DESC
                `,
                [id_empleado]
            );

            if (avisos.length === 0) {
                return res.status(404).jsonp({ message: 'No se encuentran registros.' });
            }

            const tim = await Promise.all(avisos.map(async (a) => {
                // NOMBRE EMPLEADO QUE ENVIA
                const { rows } = await pool.query(
                    `
                        SELECT (nombre || ' ' || apellido) AS fullname
                        FROM eu_empleados
                        WHERE id = $1
                    `,
                    [a.id_empleado_envia]
                );

                const fullname = rows[0]?.fullname || 'Sistema Fulltime Web';

                return {
                    create_at: a.fecha_hora,
                    descripcion: a.descripcion,
                    visto: a.visto,
                    id_timbre: a.id_timbre,
                    empleado_envia: fullname,
                    id: a.id,
                    mensaje: a.mensaje,
                    tipo: a.tipo || null
                };
            }));

            return res.jsonp(tim);
        } catch (error) {
            console.error('Error al obtener avisos:', error);
            return res.status(500).jsonp({ message: 'Error interno del servidor.' });
        }
    }

    // ELIMINAR NOTIFICACIONES TABLA DE AVISOS    **USADO
    public async EliminarMultiplesAvisos(req: Request, res: Response): Promise<any> {
        try {
            const { arregloAvisos, user_name, ip, ip_local } = req.body;
            let contador: number = 0;

            if (arregloAvisos.length > 0) {
                contador = 0;
                // USAMOS UN for...of PARA ESPERAR QUE LAS PROMESAS SE RESUELVAN ANTES DE CONTINUAR
                for (const obj of arregloAvisos) {
                    // INICIAR TRANSACCION
                    await pool.query('BEGIN');

                    // CONSULTAR DATOS ORIGINALES
                    const consulta = await pool.query('SELECT * FROM ecm_realtime_timbres WHERE id = $1', [obj]);
                    const [datosOriginales] = consulta.rows;

                    if (!datosOriginales) {
                        await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                            tabla: 'ecm_realtime_timbres',
                            usuario: user_name,
                            accion: 'D',
                            datosOriginales: '',
                            datosNuevos: '',
                            ip: ip,
                            ip_local: ip_local,
                            observacion: `Error al eliminar el registro con id ${obj}. Registro no encontrado.`
                        });

                        // FINALIZAR TRANSACCION
                        await pool.query('COMMIT');
                        return res.status(404).jsonp({ message: 'Registro no encontrado.' });
                    }

                    await pool.query('DELETE FROM ecm_realtime_timbres WHERE id = $1', [obj]);
                    contador++;

                    // AUDITORIA
                    await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                        tabla: 'ecm_realtime_timbres',
                        usuario: user_name,
                        accion: 'D',
                        datosOriginales: JSON.stringify(datosOriginales),
                        datosNuevos: '',
                        ip: ip,
                        ip_local: ip_local,
                        observacion: null
                    });

                    // FINALIZAR TRANSACCION
                    await pool.query('COMMIT');
                }

                // ENVIO DE RESPUESTA UNA VEZ QUE SE HAYAN ELIMINADO TODOS LOS AVISOS
                return res.jsonp({ message: 'OK', eliminados: contador });
            }
            else {
                return res.jsonp({ message: 'error' });
            }
        } catch (error) {
            // REVERTIR TRANSACCION EN CASO DE ERROR
            await pool.query('ROLLBACK');
            return res.status(500).jsonp({ message: 'error' });
        }
    }



    /** ************************************************************************************************* **
     ** **               M E T O D O S    P A R A     A P L I C A C I O N     M O V I L                ** **
     ** ************************************************************************************************* **/

    //METODO PARA CREAR TIMBRE
    public async crearTimbre(req: Request, res: Response) {
        try {
            const hoy: Date = new Date();
            const timbre: any = JSON.parse(req.body.timbre);
            await pool.query('BEGIN');
            const pad = (num: number) => num.toString().padStart(2, '0');
            timbre.fecha_hora_timbre_servidor = `${hoy.getFullYear()}-${pad(hoy.getMonth() + 1)}-${pad(hoy.getDate())} ${pad(hoy.getHours())}:${pad(hoy.getMinutes())}:${pad(hoy.getSeconds())}`;
            const fechaHoraEnZonaHorariaDispositivo = DateTime.fromJSDate(hoy)
                .setZone(timbre.zona_horaria_dispositivo)
                .toFormat('yyyy-MM-dd HH:mm:ss');
            const zonaHorariaServidor = DateTime.local().zoneName;
            const timbreRV: Date = new Date(fechaHoraEnZonaHorariaDispositivo || '');
            const timbreDispositivo: Date = new Date(timbre.fecha_hora_timbre || '');
            const restaTimbresHoras = timbreRV.getHours() - timbreDispositivo.getHours();
            const restaTimbresMinutos = timbreRV.getMinutes() - timbreDispositivo.getMinutes();
            const restaTimbresDias = timbreRV.getDate() - timbreDispositivo.getDate();

            if (restaTimbresDias != 0 || restaTimbresHoras != 0 || restaTimbresMinutos > 3 || restaTimbresMinutos < -3) {
                timbre.hora_timbre_diferente = true;
            } else {
                timbre.hora_timbre_diferente = false;
            }

            if (req.file) {
                const filePath = req.file.path;
                const archivoBinario = await archivoService.leerArchivo(filePath);

                timbre.imagen = archivoBinario;

                await archivoService.eliminarArchivo(filePath);
            } else {
                timbre.imagen = null;
            }

            const response = await pool.query(
                'INSERT INTO eu_timbres (fecha_hora_timbre, accion, tecla_funcion, ' +
                'observacion, latitud, longitud, codigo, id_reloj, tipo_autenticacion, ' +
                'dispositivo_timbre, fecha_hora_timbre_servidor, hora_timbre_diferente, ' +
                'ubicacion, conexion, fecha_subida_servidor, novedades_conexion, imagen, ' +
                'fecha_hora_timbre_validado, zona_horaria_dispositivo, zona_horaria_servidor ) ' +
                'VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $19, $18, $20);',
                [timbre.fecha_hora_timbre, timbre.accion, timbre.tecla_funcion, timbre.observacion,
                timbre.latitud, timbre.longitud, timbre.codigo, timbre.id_reloj,
                timbre.tipo_autenticacion, timbre.dispositivo_timbre, timbre.fecha_hora_timbre_servidor,
                timbre.hora_timbre_diferente, timbre.ubicacion, timbre.conexion, timbre.fecha_subida_servidor, timbre.novedades_conexion, timbre.imagen, timbre.zona_horaria_dispositivo, fechaHoraEnZonaHorariaDispositivo, zonaHorariaServidor]);

            const fechaHora = await FormatearHora(timbre.fecha_hora_timbre.toLocaleString().split(' ')[1]);
            const fechaTimbre = await FormatearFecha2(timbre.fecha_hora_timbre.toLocaleString(), 'ddd');
            const fechaHoraServidor = await FormatearHora(timbre.fecha_hora_timbre_servidor.toLocaleString().split(' ')[1]);
            const fechaTimbreServidor = await FormatearFecha2(timbre.fecha_hora_timbre_servidor.toLocaleString(), 'ddd');

            let imagen_existe = false

            if (timbre.imagen) {
                imagen_existe = true;
            }
            await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                tabla: 'eu_timbres',
                usuario: timbre.user_name,
                accion: 'I',
                datosOriginales: '',
                datosNuevos: `{fecha_hora_timbre: ${fechaTimbre + ' ' + fechaHora}, accion: ${timbre.accion}, tecla_funcion: ${timbre.tecla_funcion}, observacion: ${timbre.observacion}, latitud: ${timbre.latitud}, longitud: ${timbre.longitud}, codigo: ${timbre.codigo}, fecha_hora_timbre_servidor: ${fechaTimbreServidor + ' ' + fechaHoraServidor}, id_reloj: ${timbre.id_reloj}, ubicacion: ${timbre.ubicacion}, dispositivo_timbre: ${timbre.dispositivo_timbre}, imagen: ${imagen_existe} }`,
                ip: timbre.ip,
                ip_local: timbre.ip_local,
                observacion: null
            });

            // FINALIZAR TRANSACCION
            await pool.query('COMMIT');

            res.jsonp({
                message: 'Timbre creado con éxito.',
                respuestaBDD: response
            });
        } catch (error) {
            console.log("ver el error", error);
            return res.status(500).jsonp({ message: 'Error al crear Timbre' });
        }
    };

    // METODO PARA CREAR TIMBRE SIN CONEXION A INTERNET
    public async crearTimbreDesconectado(req: Request, res: Response) {
        try {
            const hoy: Date = new Date();
            const timbre: any = JSON.parse(req.body.timbre);
            await pool.query('BEGIN');
            console.log("ver req.body", req.body)

            const pad = (num: number) => num.toString().padStart(2, '0');
            timbre.fecha_subida_servidor = `${hoy.getFullYear()}-${pad(hoy.getMonth() + 1)}-${pad(hoy.getDate())} ${pad(hoy.getHours())}:${pad(hoy.getMinutes())}:${pad(hoy.getSeconds())}`;
            const zonaHorariaServidor = DateTime.local().zoneName;
            timbre.hora_timbre_diferente = false;

            if (req.file) {
                const filePath = req.file.path;
                const archivoBinario = await archivoService.leerArchivo(filePath);

                timbre.imagen = archivoBinario;

                await archivoService.eliminarArchivo(filePath);
            } else {
                timbre.imagen = null;
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

            const fechaHoraSubida = await FormatearHora(timbre.fecha_subida_servidor.toLocaleString().split(' ')[1]);
            const fechaTimbreSubida = await FormatearFecha2(timbre.fecha_subida_servidor.toLocaleString(), 'ddd');

            let imagen_existe = false

            if (timbre.imagen) {
                imagen_existe = true;
            }

            await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                tabla: 'eu_timbres',
                usuario: timbre.user_name,
                accion: 'I',
                datosOriginales: '',
                datosNuevos: `{fecha_hora_timbre: ${fechaTimbre + ' ' + fechaHora}, accion: ${timbre.accion}, tecla_funcion: ${timbre.tecla_funcion}, observacion: ${timbre.observacion}, latitud: ${timbre.latitud}, longitud: ${timbre.longitud}, codigo: ${timbre.codigo}, fecha_hora_timbre_servidor: ${fechaTimbre + ' ' + fechaHora}, id_reloj: ${timbre.id_reloj}, ubicacion: ${timbre.ubicacion}, dispositivo_timbre: ${timbre.dispositivo_timbre}, fecha_subida_servidor :  ${fechaTimbreSubida + ' ' + fechaHoraSubida}, imagen: ${imagen_existe} }`,
                ip: timbre.ip,
                ip_local: timbre.ip_local,
                observacion: null
            });

            // FINALIZAR TRANSACCION
            await pool.query('COMMIT');

            res.jsonp({
                message: 'Timbre creado con éxito.',
                respuestaBDD: response
            })
        } catch (error) {
            console.log(error);
            return res.status(500).jsonp({ message: 'Error al crear Timbre' });
        }

    };

    //METODO PARA CREAR TIMBRE POR EL ADMINISTRADOR
    public async crearTimbreJustificadoAdmin(req: Request, res: Response) {
        try {
            const { fec_hora_timbre, accion, tecl_funcion, observacion, latitud, longitud, codigo, id_reloj,
                user_name, ip, documento, dispositivo_timbre, conexion, hora_timbre_diferente, ip_local } = req.body
            console.log(req.body);
            await pool.query('BEGIN');
            const zonaHorariaServidor = DateTime.local().zoneName;


            const [timbre] = await pool.query('INSERT INTO eu_timbres (fecha_hora_timbre, accion, tecla_funcion, observacion, latitud, longitud, codigo, id_reloj, fecha_hora_timbre_servidor, documento, dispositivo_timbre,conexion, hora_timbre_diferente, fecha_hora_timbre_validado, zona_horaria_servidor) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $1, $14) RETURNING id',
                [fec_hora_timbre, accion, tecl_funcion, observacion, latitud, longitud, codigo, id_reloj, fec_hora_timbre, documento, dispositivo_timbre, conexion, hora_timbre_diferente, zonaHorariaServidor])
                .then(result => {
                    return result.rows;
                });
            const fechaHora = await FormatearHora(fec_hora_timbre.toLocaleString().split(' ')[1]);
            const fechaTimbre = await FormatearFecha2(fec_hora_timbre.toLocaleString(), 'ddd');

            let documento_existe = false

            if (documento) {
                documento_existe = true;
            }


            await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                tabla: 'eu_timbres',
                usuario: user_name,
                accion: 'I',
                datosOriginales: '',
                datosNuevos: `{fecha_hora_timbre: ${fechaTimbre + ' ' + fechaHora}, accion: ${accion}, tecla_funcion: ${tecl_funcion}, observacion: ${observacion}, latitud: ${latitud}, longitud: ${longitud}, codigo: ${codigo}, fecha_hora_timbre_servidor: ${fec_hora_timbre}, id_reloj: ${id_reloj}, ubicacion: 'null', dispositivo_timbre: ${dispositivo_timbre}, documento: ${documento_existe} }`,
                ip: ip,
                ip_local: ip_local,
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

    //METODO PARA LEER TIMBRES POR UN RANGO DE FECHA
    public async FiltrarTimbre(req: Request, res: Response) {
        try {
            const { fecInicio, fecFinal, codigo } = req.body
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

    //METODO PARA LEER TIMBRES POR CODIGO DEL EMPLEADO
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


















    // METODO DE BUSQUEDA DE AVISOS GENERALES POR EMPLEADO
    public async ObtenerAvisosColaborador(req: Request, res: Response): Promise<any> {
        const { id_empleado } = req.params;

        const result = await pool.query(
            `
            SELECT 
                r.id,
                to_char(r.fecha_hora, 'yyyy-MM-dd HH24:mi:ss') AS create_at,
                r.id_empleado_envia,
                r.id_empleado_recibe AS id_receives_empl,
                r.visto,
                r.descripcion,
                r.mensaje,
                r.id_timbre,
                r.tipo,
                CASE 
                    WHEN r.id_empleado_envia = 0 THEN 'Sistema Fulltime Web'
                    ELSE COALESCE(e.nombre || ' ' || e.apellido, 'Empleado desconocido')
                END AS empleado
            FROM ecm_realtime_timbres r
            LEFT JOIN eu_empleados e ON e.id = r.id_empleado_envia
            WHERE r.id_empleado_recibe = $1 
            ORDER BY (r.visto IS FALSE) DESC, r.id DESC 
            LIMIT 20
            `,
            [id_empleado]
        );

        if (result.rowCount !== 0) {
            return res.jsonp(result.rows);
        } else {
            return res.status(404).jsonp({ message: 'No se encuentran registros.' });
        }
    }

}

export const timbresControlador = new TimbresControlador;

export default timbresControlador;

// FUNCION PARA VALIDAR ZONA HORARIA DEL DISPOSITIVO Y DEL SERVIDOR    **USADO
export function ValidarZonaHoraria(fecha_valida: any, fecha_timbre: any, fecha_validada: any, fec_hora_timbre: any) {
    var hora_diferente: boolean;
    // VERIFICAR FECHAS DEBE SER LA MISMA DEL SERVIDOR
    if (fecha_valida != fecha_timbre) {
        hora_diferente = true;
    }
    else {
        // VALDAR HORAS NO DEBE SER MENOR NI MAYOR A LA HORA DEL SERVIDOR -- 1 MINUTO DE ESPERA
        var hora_valida = DateTime.fromFormat(fecha_validada, 'dd/MM/yyyy, hh:mm:ss a');
        var hora_timbre_ = DateTime.fromFormat(fec_hora_timbre, 'dd/MM/yyyy h:mm:ss a');
        var resta_hora_valida = hora_valida.minus({ minutes: 1 });

        if (hora_timbre_ > (hora_valida)) {
            hora_diferente = true;
        }
        else {
            if (hora_timbre_ >= (resta_hora_valida)) {
                hora_diferente = false;
            }
            else {
                hora_diferente = true;
            }
        }
    }

    return hora_diferente;
}