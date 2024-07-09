import { Request, Response } from 'express';
import AUDITORIA_CONTROLADOR from '../auditoria/auditoriaControlador';
import pool from '../../database';
import { FormatearFecha, FormatearFecha2, FormatearHora } from '../../libs/settingsMail';
import moment from 'moment';


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

    // METODO PARA LISTAR MARCACIONES
    public async ObtenerTimbres(req: Request, res: Response): Promise<any> {
        try {
            const id = req.userIdEmpleado;
            let timbres = await pool.query(
                `
                SELECT CAST(t.fecha_hora_timbre AS VARCHAR), t.accion, t.tecla_funcion, t.observacion, 
                    t.latitud, t.longitud, t.codigo, t.id_reloj, ubicacion, 
                    CAST(fecha_hora_timbre_servidor AS VARCHAR), dispositivo_timbre 
                FROM eu_empleados AS e, eu_timbres AS t 
                WHERE e.id = $1 AND e.codigo = t.codigo 
                ORDER BY t.fecha_hora_timbre DESC LIMIT 100
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
                    WHERE ec.id = (SELECT MAX(cargo_id) AS cargo_id FROM datos_empleado_cargo
                                    WHERE empl_id = $1)
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

    //METODO PARA BUSCAR EL TIMBRE DEL EMPLEADO POR FECHA // COLOCAR ESTADO
    public async ObtenertimbreFechaEmple(req: Request, res: Response): Promise<any> {
        try {
            let { codigo, cedula, fecha } = req.query;
            fecha = fecha + '%';
            if (codigo === '') {
                let usuario = await pool.query(
                    `
                    SELECT * FROM datos_actuales_empleado    
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
                    SELECT * FROM datos_actuales_empleado 
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
                SELECT (da.nombre || ' ' || da.apellido) AS empleado, da.id AS id_empleado, CAST(t.fecha_hora_timbre AS VARCHAR), t.accion, 
                    t.tecla_funcion, t.observacion, t.latitud, t.longitud, t.codigo, t.id_reloj, ubicacion, 
                    CAST(fecha_hora_timbre_servidor AS VARCHAR), dispositivo_timbre, t.id 
                FROM eu_timbres AS t, datos_actuales_empleado AS da
                WHERE t.codigo = $1 
                    AND CAST(t.fecha_hora_timbre AS VARCHAR) LIKE $2
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
            //console.log('respuesta: ', timbresRows)
            //generarTimbres('35', '2024-01-01', '2024-01-06');

            if (timbresRows == 0) {
                return res.status(400).jsonp({ message: "No se encontraron registros." })
            }

        } catch (err) {
            const message = 'Ups!!! problemas con la petición al servidor.'
            return res.status(500).jsonp({ error: err, message: message })
        }
    }

    // METODO PARA ACTUALIZAR O EDITAR EL TIMBRE DEL EMPLEADO
    public async EditarTimbreEmpleadoFecha(req: Request, res: Response): Promise<any> {
        try {
            let { id, codigo, accion, tecla, observacion, fecha } = req.body;
            console.log('id: ', id);
            console.log('codigo: ', codigo);
            console.log('accion: ', accion);
            console.log('tecla: ', tecla);
            console.log('observacion: ', observacion);
            console.log('fecha: ', fecha);

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
            const message = 'Ups!!! algo salio mal con la peticion al servidor.'
            console.log('error ----- ', err)
            return res.status(500).jsonp({ error: err, message: message })
        }
    }

    // METODO DE REGISTRO DE TIMBRES PERSONALES
    public async CrearTimbreWeb(req: Request, res: Response): Promise<any> {
        console.log('ingresa aqui timbre personal')
        try {
            const { fec_hora_timbre, accion, tecl_funcion, observacion, latitud, longitud, id_reloj,
                ubicacion, user_name, ip } = req.body;

            // Obtener la fecha y hora actual
            var now = moment();

            // Formatear la fecha y hora actual en el formato deseado
            var fecha_hora = now.format('DD/MM/YYYY, h:mm:ss a');

            const id_empleado = req.userIdEmpleado;

            let code = await pool.query(
                `
                SELECT codigo FROM eu_empleados WHERE id = $1
                `
                , [id_empleado]).then((result: any) => { return result.rows });

            if (code.length === 0) return { mensaje: 'El usuario no tiene un código asignado.' };

            var codigo = parseInt(code[0].codigo);

            console.log('codigo ', codigo)
            // INICIAR TRANSACCION
            await pool.query('BEGIN');

            pool.query(
                `
                INSERT INTO eu_timbres (fecha_hora_timbre, accion, tecla_funcion, observacion, latitud, longitud, 
                    codigo, fecha_hora_timbre_servidor, id_reloj, ubicacion, dispositivo_timbre)
                VALUES(to_timestamp($1, 'DD/MM/YYYY, HH:MI:SS pm')::timestamp without time zone, $2, $3, $4, $5, $6, $7, to_timestamp($8, 'DD/MM/YYYY, HH:MI:SS pm')::timestamp without time zone, $9, $10, $11) RETURNING id
                `,
                [fec_hora_timbre, accion, tecl_funcion, observacion, latitud, longitud, codigo,
                    fecha_hora, id_reloj, ubicacion, 'APP_WEB'],

                async (error, results) => {
                    const fechaHora = await FormatearHora(fec_hora_timbre.split('T')[1]);
                    const fechaTimbre = await FormatearFecha(fec_hora_timbre.toLocaleString(), 'ddd');

                    await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                        tabla: 'eu_timbres',
                        usuario: user_name,
                        accion: 'I',
                        datosOriginales: '',
                        datosNuevos: `{fecha_hora_timbre: ${fechaTimbre + ' ' + fechaHora}, accion: ${accion}, tecla_funcion: ${tecl_funcion}, observacion: ${observacion}, latitud: ${latitud}, longitud: ${longitud}, codigo: ${codigo}, fecha_hora_timbre_servidor: ${fecha_hora}, id_reloj: ${id_reloj}, ubicacion: ${ubicacion}, dispositivo_timbre: 'APP_WEB'}`,
                        ip,
                        observacion: null
                    });

                    //FINALIZAR TRANSACCION
                    await pool.query('COMMIT');
                    res.status(200).jsonp({ message: 'Registro guardado.' });

                }
            )

        } catch (error) {
            console.log('error ------- ', error)
            // REVERTIR TRANSACCION
            await pool.query('ROLLBACK');
            res.status(500).jsonp({ message: error });
        }
    }

    // METODO PARA REGISTRAR TIMBRES ADMINISTRADOR

    public async CrearTimbreWebAdmin(req: Request, res: Response): Promise<any> {
        try {
            const { fec_hora_timbre, accion, tecl_funcion, observacion, latitud, longitud,
                id_empleado, id_reloj, tipo, ip, user_name } = req.body

            // Obtener la fecha y hora actual
            var now = moment();

            // Formatear la fecha y hora actual en el formato deseado
            var fecha_hora = now.format('DD/MM/YYYY, h:mm:ss a');
            let servidor: any;

            if (tipo === 'administrar') {
                servidor = fec_hora_timbre;
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

            // var codigo = parseInt(code[0].codigo);
            var codigo = code[0].codigo;

            // INICIAR TRANSACCION
            await pool.query('BEGIN');

            await pool.query(
                `
                INSERT INTO eu_timbres (fecha_hora_timbre, accion, tecla_funcion, observacion, latitud, 
                    longitud, codigo, id_reloj, dispositivo_timbre, fecha_hora_timbre_servidor) 
                VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, 
                to_timestamp($10, 'DD/MM/YYYY, HH:MI:SS pm')::timestamp without time zone)
                `
                , [fec_hora_timbre, accion, tecl_funcion, observacion, latitud, longitud, codigo,
                    id_reloj, 'APP_WEB', servidor]

                , async (error, results) => {

                    console.log("ver fecha", fec_hora_timbre)
                    const fechaHora = await FormatearHora(fec_hora_timbre.split('T')[1])
                    const fechaTimbre = await FormatearFecha2(fec_hora_timbre, 'ddd')


                    await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                        tabla: 'eu_timbres',
                        usuario: user_name,
                        accion: 'I',
                        datosOriginales: '',
                        datosNuevos: `{fecha_hora_timbre: ${fechaTimbre + ' ' + fechaHora}, accion: ${accion}, tecla_funcion: ${tecl_funcion}, observacion: ${observacion}, latitud: ${latitud}, longitud: ${longitud}, codigo: ${codigo}, id_reloj: ${id_reloj}, dispositivo_timbre: 'APP_WEB', fecha_hora_timbre_servidor: ${servidor}}`,
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


    // METODO PARA BUSCAR TIMBRES
    public async BuscarTimbresPlanificacion(req: Request, res: Response) {

        const { codigo, fec_inicio, fec_final } = req.body;
        console.log('ver datos timbres ', codigo, fec_inicio, fec_final)

        const TIMBRES = await pool.query(
            "SELECT * FROM eu_timbres " +
            "WHERE fecha_hora_timbre_servidor BETWEEN $1 AND $2 " +
            "AND codigo IN (" + codigo + ") " +
            "ORDER BY codigo, fecha_hora_timbre_servidor ASC",
            [fec_inicio, fec_final]);

        if (TIMBRES.rowCount === 0) {
            return res.status(404).jsonp({ message: 'vacio' });
        }
        else {
            var contador = 0;
            TIMBRES.rows.forEach(async obj => {
                console.log('fecha ', obj.fecha_hora_timbre_servidor)
                console.log('codigo ', obj.codigo)
                console.log('funcion ', obj.tecla_funcion)
                console.log('id ', obj.id)
                console.log('observacion ', obj.observacion)
                contador = contador + 1;
                // fecha_hora_servidor, codigo, tecla_funcion, id_timbre, observcaion
                await pool.query(
                    `
                    SELECT * FROM modificartimbre ($1::timestamp without time zone, $2::character varying, 
                            $3::character varying, $4::integer, $5::character varying)  
                    `
                    , [obj.fecha_hora_timbre_servidor, obj.codigo, obj.tecla_funcion, obj.id, obj.observacion]);
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
<<<<<<< HEAD
                descripcion, id_timbre, tipo, id_empleado_recibe 
=======
                descripcion, mensaje, id_timbre, tipo, id_empleado_recibe
>>>>>>> e573d965ed2f36f42426a3a3b1cdfc5688c011ea
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




    public async ObtenerTimbresEmpleado(req: Request, res: Response): Promise<any> {
        try {
            const { id } = req.params;
            let timbres = await pool.query(
                `
                SELECT CAST(t.fecha_hora_timbre AS VARCHAR), t.accion, t.tecla_funcion, 
                    t.observacion, t.latitud, t.longitud, t.codigo, t.id_reloj 
                FROM eu_empleados AS e, eu_timbres AS t 
                WHERE e.id = $1 AND e.codigo = t.codigo 
                ORDER BY t.fecha_hora_timbre DESC LIMIT 50
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


    // METODO PARA BUSCAR TIMBRES (ASISTENCIA)
    public async BuscarTimbresAsistencia(req: Request, res: Response): Promise<any> {

        const { fecha, funcion, codigo } = req.body;
        const TIMBRE = await pool.query(
            `
            SELECT t.*, t.fecha_hora_timbre_servidor::date AS t_fec_timbre, 
                t.fecha_hora_timbre_servidor::time AS t_hora_timbre 
            FROM eu_timbres AS t
            WHERE codigo = $1 AND fecha_hora_timbre_servidor::date = $2 AND tecla_funcion = $3 
            ORDER BY t.fecha_hora_timbre_servidor ASC;
            `
            , [codigo, fecha, funcion]);

        if (TIMBRE.rowCount != 0) {
            return res.jsonp({ message: 'OK', respuesta: TIMBRE.rows })
        }
        else {
            return res.status(404).jsonp({ message: 'vacio' });
        }
    }

}

export const timbresControlador = new TimbresControlador;

export default timbresControlador