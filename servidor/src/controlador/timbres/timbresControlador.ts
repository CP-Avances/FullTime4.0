import { Request, Response } from 'express';
import pool from '../../database';

class TimbresControlador {

    // METODO PARA LISTAR MARCACIONES
    public async ObtenerTimbres(req: Request, res: Response): Promise<any> {
        try {
            const id = req.userIdEmpleado;
            let timbres = await pool.query(
                `
                SELECT CAST(t.fec_hora_timbre AS VARCHAR), t.accion, t.tecl_funcion, t.observacion, 
                    t.latitud, t.longitud, t.id_empleado, t.id_reloj, ubicacion, 
                    CAST(fec_hora_timbre_servidor AS VARCHAR), dispositivo_timbre 
                FROM empleados AS e, timbres AS t 
                WHERE e.id = $1 AND CAST(e.codigo AS integer) = t.id_empleado 
                ORDER BY t.fec_hora_timbre DESC LIMIT 100
                `
                , [id]).then((result: any) => {
                    return result.rows
                        .map((obj: any) => {
                            switch (obj.accion) {
                                case 'EoS': obj.accion = 'Entrada o Salida'; break;
                                case 'AES': obj.accion = 'Entrada o Salida Alimentación'; break;
                                case 'PES': obj.accion = 'Entrada o Salida Permiso'; break;
                                case 'E': obj.accion = 'Entrada o Salida'; break;
                                case 'S': obj.accion = 'Entrada o Salida'; break;
                                case 'F/A': obj.accion = 'Entrada o Salida Alimentación'; break;
                                case 'I/A': obj.accion = 'Entrada o Salida Alimentación'; break;
                                case 'E/P': obj.accion = 'Entrada o Salida Permiso'; break;
                                case 'S/P': obj.accion = 'Entrada o Salida Permiso'; break;
                                case 'HA': obj.accion = 'Horario Abierto'; break;
                                default: obj.accion = 'codigo 99'; break;
                            }
                            return obj
                        })
                });

            if (timbres.length === 0) return res.status(400).jsonp({ message: 'Ups!!! no existen registros.' });

            let estado_cuenta = [{
                timbres_PES: await pool.query(
                    `
                    SELECT count(*) 
                    FROM empleados AS e, timbres AS t 
                    WHERE e.id = $1 AND CAST(e.codigo AS integer) = t.id_empleado 
                        AND t.accion in (\'PES\', \'E/P\', \'S/P\')
                    `
                    , [id]).then((result: any) => { return result.rows[0].count }),

                timbres_AES: await pool.query(
                    `
                    SELECT count(*) 
                    FROM empleados AS e, timbres AS t 
                    WHERE e.id = $1 AND CAST(e.codigo AS integer) = t.id_empleado 
                    AND t.accion in (\'AES\', \'E/A\', \'S/A\')
                    `
                    , [id]).then((result: any) => { return result.rows[0].count }),

                timbres_EoS: await pool.query(
                    `
                    SELECT count(*) 
                    FROM empleados AS e, timbres AS t 
                    WHERE e.id = $1 AND CAST(e.codigo AS integer) = t.id_empleado 
                        AND t.accion in (\'EoS\', \'E\', \'S\')
                    `
                    , [id]).then((result: any) => { return result.rows[0].count }),

                total_timbres: await pool.query(
                    `
                    SELECT count(*) 
                    FROM empleados AS e, timbres AS t 
                    WHERE e.id = $1 AND CAST(e.codigo AS integer) = t.id_empleado
                    `
                    , [id]).then((result: any) => { return result.rows[0].count })
            }]

            return res.status(200).jsonp({
                timbres: timbres,
                cuenta: estado_cuenta,
                info: await pool.query(
                    `
                    SELECT tc.cargo, ca.sueldo, ca.hora_trabaja, eh.fec_inicio, eh.fec_final 
                    FROM empl_contratos AS co, empl_cargos AS ca, empl_horarios AS eh, tipo_cargo AS tc
                    WHERE co.id_empleado = $1 AND ca.id_empl_contrato = co.id AND eh.id_empl_cargo = ca.id 
                        AND tc.id = ca.cargo ORDER BY eh.fec_inicio DESC LIMIT 1
                    `
                    , [id]).then((result: any) => {
                        return result.rows
                    }),
            });
        } catch (error) {
            res.status(400).jsonp({ message: error })
        }
    }

    // METODO DE REGISTRO DE TIMBRES PERSONALES
    public async CrearTimbreWeb(req: Request, res: Response): Promise<any> {
        try {
            // OBTENCION DE DIRECCION IP
            var ip_cliente = '';
            var requestIp = require('request-ip');
            var clientIp = requestIp.getClientIp(req);
            if (clientIp != null && clientIp != '' && clientIp != undefined) {
                ip_cliente = clientIp.split(':')[3];
            }

            const { fec_hora_timbre, accion, tecl_funcion, observacion, latitud, longitud, id_reloj,
                ubicacion } = req.body;

            let f = new Date();
            const id_empleado = req.userIdEmpleado;

            let code = await pool.query(
                `
                SELECT codigo FROM empleados WHERE id = $1
                `
                , [id_empleado]).then((result: any)=> { return result.rows });

            if (code.length === 0) return { mensaje: 'El usuario no tiene un código asignado.' };

            var codigo = parseInt(code[0].codigo);

            const [timbre] = await pool.query(
                `
                INSERT INTO timbres (fec_hora_timbre, accion, tecl_funcion, observacion, latitud, longitud, 
                    id_empleado, fec_hora_timbre_servidor, id_reloj, ubicacion, dispositivo_timbre)
                VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING id
                `
                , [fec_hora_timbre, accion, tecl_funcion, observacion, latitud, longitud, codigo,
                    f.toLocaleString(), id_reloj, ubicacion, ip_cliente])
                .then((result: any) => {
                    return result.rows
                }).catch((err: any) => {
                    return err
                })

            if (timbre) {
                return res.status(200).jsonp({ message: 'Registro guardado.' });
            }

            return res.status(400).jsonp({ message: 'Ups!!! algo ha salido mal.' });

        } catch (error) {
            res.status(400).jsonp({ message: error });
        }
    }

    // METODO PARA REGISTRAR TIMBRES ADMINISTRADOR
    public async CrearTimbreWebAdmin(req: Request, res: Response): Promise<any> {
        try {

            // OBTENCION DE DIRECCION IP
            var ip_cliente = '';
            var requestIp = require('request-ip');
            var clientIp = requestIp.getClientIp(req);
            if (clientIp != null && clientIp != '' && clientIp != undefined) {
                ip_cliente = clientIp.split(':')[3];
            }

            const { fec_hora_timbre, accion, tecl_funcion, observacion, latitud, longitud,
                id_empleado, id_reloj } = req.body

            let f = new Date();

            let code = await pool.query(
                `
                SELECT codigo FROM empleados WHERE id = $1
                `
                , [id_empleado]).then((result: any) => { return result.rows });

            if (code.length === 0) return { mensaje: 'El usuario no tiene un código asignado.' };

            var codigo = parseInt(code[0].codigo);

            await pool.query(
                `
                INSERT INTO timbres (fec_hora_timbre, accion, tecl_funcion, observacion, latitud, 
                    longitud, id_empleado, id_reloj, dispositivo_timbre, fec_hora_timbre_servidor) 
                VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                `
                , [fec_hora_timbre, accion, tecl_funcion, observacion, latitud, longitud, codigo,
                    id_reloj, ip_cliente, f.toLocaleString()])
                .then((result: any) => {
                    res.status(200).jsonp({ message: 'Registro guardado.' });
                }).catch((err: any) => {
                    res.status(400).jsonp({ message: err });
                })
        } catch (error) {
            res.status(400).jsonp({ message: error });
        }
    }













    // METODO DE BUSQUEDA DE AVISOS GENERALES POR EMPLEADO
    public async ObtenerAvisosColaborador(req: Request, res: Response) {
        const { id_empleado } = req.params

        const TIMBRES_NOTIFICACION = await pool.query(
            `
            SELECT id, to_char(create_at, 'yyyy-MM-dd HH24:mi:ss') AS create_at, id_send_empl, visto, 
            descripcion, id_timbre, tipo, id_receives_empl
            FROM realtime_timbres WHERE id_receives_empl = $1 
            ORDER BY (visto is FALSE) DESC, id DESC LIMIT 20
            `
            , [id_empleado])
            .then(async (result: any) => {

                if (result.rowCount > 0) {
                    return await Promise.all(result.rows.map(async (obj: any): Promise<any> => {

                        let nombre = await pool.query(
                            `
                            SELECT nombre, apellido FROM empleados WHERE id = $1
                            `
                            , [obj.id_send_empl]).then((ele: any) => {
                                return ele.rows[0].nombre + ' ' + ele.rows[0].apellido
                            })
                        return {
                            create_at: obj.create_at,
                            descripcion: obj.descripcion,
                            id_receives_empl: obj.id_receives_empl,
                            visto: obj.visto,
                            id_timbre: obj.id_timbre,
                            empleado: nombre,
                            id: obj.id,
                            tipo: obj.tipo
                        }
                    }));
                }
                return []
            });

        if (TIMBRES_NOTIFICACION.length > 0) {
            return res.jsonp(TIMBRES_NOTIFICACION)
        }

        return res.status(404).jsonp({ message: 'No se encuentran registros' });
    }

    // METODO DE BUSQUEDA DE UNA NOTIFICACION ESPECIFICA
    public async ObtenerUnAviso(req: Request, res: Response): Promise<any> {
        const id = req.params.id;
        const AVISOS = await pool.query(
            `
            SELECT r.id, r.id_send_empl, r.id_receives_empl, r.create_at, r.tipo, r.visto, 
            r.id_timbre, r.descripcion, (e.nombre || ' ' || e.apellido) AS empleado 
            FROM realtime_timbres AS r, empleados AS e 
            WHERE r.id = $1 AND e.id = r.id_send_empl
            `
            , [id]);
        if (AVISOS.rowCount > 0) {
            return res.jsonp(AVISOS.rows[0])
        }
        else {
            return res.status(404).jsonp({ text: 'Registro no encontrado' });
        }
    }


    public async ObtenerAvisosTimbresEmpleado(req: Request, res: Response) {
        const { id_empleado } = req.params
        console.log(id_empleado);
        const TIMBRES_NOTIFICACION = await pool.query('SELECT * FROM realtime_timbres WHERE id_receives_empl = $1 ORDER BY create_at DESC', [id_empleado])
            .then((result: any) => { return result.rows });

        if (TIMBRES_NOTIFICACION.length === 0) return res.status(404).jsonp({ message: 'No se encuentran registros' });
        console.log(TIMBRES_NOTIFICACION);

        const tim = await Promise.all(TIMBRES_NOTIFICACION.map(async (obj: any): Promise<any> => {
            let [empleado] = await pool.query('SELECT  (nombre || \' \' || apellido) AS fullname FROM empleados WHERE id = $1', [obj.id_send_empl]).then((ele: any) => {
                console.log('¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨', ele.rows);
                return ele.rows
            })
            const fullname = (empleado === undefined) ? '' : empleado.fullname;
            return {
                create_at: obj.create_at,
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

    public async ActualizarVista(req: Request, res: Response): Promise<void> {
        const id = req.params.id_noti_timbre;
        const { visto } = req.body;
        console.log(id, visto);
        await pool.query('UPDATE realtime_timbres SET visto = $1 WHERE id = $2', [visto, id])
            .then((result: any) => {
                res.jsonp({ message: 'Vista Actualizada' });
            });
    }

    public async EliminarMultiplesAvisos(req: Request, res: Response): Promise<any> {
        const arrayIdsRealtimeTimbres = req.body;
        console.log(arrayIdsRealtimeTimbres);

        if (arrayIdsRealtimeTimbres.length > 0) {
            arrayIdsRealtimeTimbres.forEach(async (obj: number) => {
                await pool.query('DELETE FROM realtime_timbres WHERE id = $1', [obj])
                    .then((result: any) => {
                        console.log(result.command, 'REALTIME ELIMINADO ====>', obj);
                    });
            });
            return res.jsonp({ message: 'Todos las notificaciones han sido eliminadas' });
        }
        return res.jsonp({ message: 'No seleccionó ningún timbre' });
    }





    public async ObtenerUltimoTimbreEmpleado(req: Request, res: Response): Promise<any> {
        try {
            const codigo = req.userCodigo
            let timbre = await pool.query('SELECT CAST(fec_hora_timbre AS VARCHAR) as timbre, accion FROM timbres WHERE id_empleado = $1 ORDER BY fec_hora_timbre DESC LIMIT 1', [codigo])
                .then((result: any) => {
                    return result.rows.map((obj: any) => {
                        switch (obj.accion) {
                            case 'EoS': obj.accion = 'Entrada o Salida'; break;
                            case 'AES': obj.accion = 'Entrada o Salida Almuerzo'; break;
                            case 'PES': obj.accion = 'Entrada o Salida Permiso'; break;
                            case 'E': obj.accion = 'Entrada o Salida'; break;
                            case 'S': obj.accion = 'Entrada o Salida'; break;
                            case 'F/A': obj.accion = 'Entrada o Salida Almuerzo'; break;
                            case 'I/A': obj.accion = 'Entrada o Salida Almuerzo'; break;
                            case 'E/P': obj.accion = 'Entrada o Salida Permiso'; break;
                            case 'S/P': obj.accion = 'Entrada o Salida Permiso'; break;
                            case 'HA': obj.accion = 'Horario Abierto'; break;
                            default: obj.accion = 'codigo 99'; break;
                        }
                        return obj
                    })
                });
            if (timbre.length === 0) return res.status(400).jsonp({ mensaje: 'No ha timbrado.' });
            return res.status(200).jsonp(timbre[0]);
        } catch (error) {
            return res.status(400).jsonp({ message: error });
        }
    }



    public async ObtenerTimbresEmpleado(req: Request, res: Response): Promise<any> {
        try {
            const { id } = req.params;
            let timbres = await pool.query('SELECT CAST(t.fec_hora_timbre AS VARCHAR), t.accion, t.tecl_funcion, ' +
                't.observacion, t.latitud, t.longitud, t.id_empleado, t.id_reloj ' +
                'FROM empleados AS e, timbres AS t WHERE e.id = $1 AND CAST(e.codigo AS integer) = t.id_empleado ' +
                'ORDER BY t.fec_hora_timbre DESC LIMIT 50', [id]).then((result: any) => {
                    return result.rows
                        .map((obj: any) => {
                            switch (obj.accion) {
                                case 'EoS': obj.accion = 'Entrada o Salida'; break;
                                case 'AES': obj.accion = '  Inicio o Fin Comida'; break;
                                case 'PES': obj.accion = 'Inicio o Fin Permiso'; break;
                                case 'E': obj.accion = 'Entrada'; break;
                                case 'S': obj.accion = 'Salida'; break;
                                case 'F/A': obj.accion = 'Fin Comida'; break;
                                case 'I/A': obj.accion = 'Inicio Comida'; break;
                                case 'E/P': obj.accion = 'Fin Permiso'; break;
                                case 'S/P': obj.accion = 'Inicio Permiso'; break;
                                case 'HA': obj.accion = 'Horario Abierto'; break;
                                default: obj.accion = 'codigo 99'; break;
                            }
                            return obj
                        })
                });
            if (timbres.length === 0) return res.status(400).jsonp({ message: 'No se encontraron registros de timbres.' });
            return res.status(200).jsonp({
                timbres: timbres,
            });
        } catch (error) {
            res.status(400).jsonp({ message: error })
        }
    }

}

export const timbresControlador = new TimbresControlador;
export default timbresControlador