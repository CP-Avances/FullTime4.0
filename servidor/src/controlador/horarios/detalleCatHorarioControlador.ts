import { Request, Response } from 'express';
import { FormatearHora } from '../../libs/settingsMail';
import AUDITORIA_CONTROLADOR from '../reportes/auditoriaControlador';
import pool from '../../database';

class DetalleCatalogoHorarioControlador {

    // METODO PARA BUSCAR DETALLE DE UN HORARIO   **USADO
    public async ListarUnDetalleHorario(req: Request, res: Response): Promise<any> {
        const { id_horario } = req.params;
        const HORARIO = await pool.query(
            `
            SELECT dh.*, cg.minutos_comida
            FROM eh_detalle_horarios AS dh, eh_cat_horarios AS cg
            WHERE dh.id_horario = cg.id AND dh.id_horario = $1
            ORDER BY orden ASC
            `
            , [id_horario])
            .then((result: any) => {
                if (result.rowCount === 0) return [];

                return result.rows.map((o: any) => {
                    switch (o.tipo_accion) {
                        case 'E':
                            o.tipo_accion_show = 'Entrada';
                            o.tipo_accion = 'E';
                            break;
                        case 'I/A':
                            o.tipo_accion_show = 'Inicio alimentación';
                            o.tipo_accion = 'I/A';
                            break;
                        case 'F/A':
                            o.tipo_accion_show = 'Fin alimentación';
                            o.tipo_accion = 'F/A';
                            break;
                        case 'S':
                            o.tipo_accion_show = 'Salida';
                            o.tipo_accion = 'S';
                            break;
                        default:
                            o.tipo_accion_show = 'Desconocido';
                            o.tipo_accion = 'D';
                            break;
                    }
                    return o;
                })
            });

        if (HORARIO.length > 0) {
            return res.jsonp(HORARIO)
        }
        else {
            return res.status(404).jsonp({ text: 'No se encuentran registros.' });
        }
    }

    // METODO PARA BUSCAR DETALLE DE UN HORARIO   **USADO
    public async ListarUnDetalleTodosHorarios(req: Request, res: Response): Promise<any> {
        const { ids_horario } = req.body;
        const HORARIO = await pool.query(
            `
            SELECT dh.*, cg.minutos_comida
            FROM eh_detalle_horarios AS dh, eh_cat_horarios AS cg
            WHERE dh.id_horario = cg.id AND dh.id_horario = ANY($1)
            ORDER BY orden ASC
            `
            , [ids_horario])
            .then((result: any) => {
                if (result.rowCount === 0) return [];

                return result.rows.map((o: any) => {
                    switch (o.tipo_accion) {
                        case 'E':
                            o.tipo_accion_show = 'Entrada';
                            o.tipo_accion = 'E';
                            break;
                        case 'I/A':
                            o.tipo_accion_show = 'Inicio alimentación';
                            o.tipo_accion = 'I/A';
                            break;
                        case 'F/A':
                            o.tipo_accion_show = 'Fin alimentación';
                            o.tipo_accion = 'F/A';
                            break;
                        case 'S':
                            o.tipo_accion_show = 'Salida';
                            o.tipo_accion = 'S';
                            break;
                        default:
                            o.tipo_accion_show = 'Desconocido';
                            o.tipo_accion = 'D';
                            break;
                    }
                    return o;
                })
            });

        if (HORARIO.length > 0) {
            return res.jsonp(HORARIO)
        }
        else {
            return res.status(404).jsonp({ text: 'No se encuentran registros.' });
        }
    }


    // METODO PARA ELIMINAR REGISTRO    **USADO
    public async EliminarRegistros(req: Request, res: Response): Promise<Response> {
        try {
            const id = req.params.id;

            const { user_name, ip, ip_local } = req.body;

            // INICIAR TRANSACCION
            await pool.query('BEGIN');

            // OBTENER DATOSORIGINALES
            const consulta = await pool.query(`SELECT * FROM eh_detalle_horarios WHERE id = $1`, [id]);
            const [datosOriginales] = consulta.rows;

            if (!datosOriginales) {
                await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                    tabla: 'eh_detalle_horarios',
                    usuario: user_name,
                    accion: 'D',
                    datosOriginales: '',
                    datosNuevos: '',
                    ip: ip,
                    ip_local: ip_local,
                    observacion: `Error al eliminar registro con id ${id}`
                });

                // FINALIZAR TRANSACCION
                await pool.query('COMMIT');
                return res.status(404).jsonp({ message: 'No se encuentra el registro.' });
            }

            await pool.query(
                `
                DELETE FROM eh_detalle_horarios WHERE id = $1
                `
                , [id]);

            const horadetalle = await FormatearHora(datosOriginales.hora);
            datosOriginales.hora = horadetalle;

            // AUDITORIA
            await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                tabla: 'eh_detalle_horarios',
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
            return res.jsonp({ message: 'Registro eliminado.' });

        } catch (error) {
            // REVERTIR TRANSACCION
            await pool.query('ROLLBACK');
            return res.jsonp({ message: 'error' });

        }
    }

    // METODO PARA REGISTRAR DETALLES    **USADO
    public async CrearDetalleHorarios(req: Request, res: Response): Promise<void> {
        try {
            const { orden, hora, minu_espera, id_horario, tipo_accion, segundo_dia, tercer_dia, min_antes,
                min_despues, user_name, ip, ip_local } = req.body;

            // INICIAR TRANSACCION
            await pool.query('BEGIN');

            const registro = await pool.query(
                `
                INSERT INTO eh_detalle_horarios (orden, hora, tolerancia, id_horario, tipo_accion, segundo_dia, tercer_dia, 
                    minutos_antes, minutos_despues) 
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *
                `
                , [orden, hora, minu_espera, id_horario, tipo_accion, segundo_dia, tercer_dia, min_antes, min_despues]);

            const [datosNuevos] = registro.rows;

            const horadetalle = await FormatearHora(hora);
            datosNuevos.hora = horadetalle;

            // AUDITORIA

            await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                tabla: 'eh_detalle_horarios',
                usuario: user_name,
                accion: 'I',
                datosOriginales: '',
                datosNuevos: JSON.stringify(datosNuevos),
                ip: ip,
                ip_local: ip_local,
                observacion: null
            });

            // FINALIZAR TRANSACCION
            await pool.query('COMMIT');
            res.jsonp({ message: 'Registro guardado.' });

        } catch (error) {
            // REVERTIR TRANSACCION
            await pool.query('ROLLBACK');
            res.status(500).jsonp({ message: 'Error al guardar registro.' });
        }
    }

    // METODO PARA ACTUALIZAR DETALLE DE HORARIO    **USADO
    public async ActualizarDetalleHorarios(req: Request, res: Response): Promise<Response> {
        try {
            const { orden, hora, minu_espera, id_horario, tipo_accion, segundo_dia, tercer_dia, min_antes, min_despues,
                id, user_name, ip, ip_local } = req.body;

            // INICIAR TRANSACCION
            await pool.query('BEGIN');

            // OBTENER DATOSORIGINALES
            const consulta = await pool.query('SELECT * FROM eh_detalle_horarios WHERE id = $1', [id]);
            const [datosOriginales] = consulta.rows;

            if (!datosOriginales) {
                await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                    tabla: 'eh_detalle_horarios',
                    usuario: user_name,
                    accion: 'U',
                    datosOriginales: '',
                    datosNuevos: '',
                    ip: ip,
                    ip_local: ip_local,
                    observacion: `Error al actualizar registro con id ${id}`
                });

                // FINALIZAR TRANSACCION
                await pool.query('COMMIT');
                return res.status(404).jsonp({ message: 'No se encuentra el registro.' });
            }

            const actualizacion = await pool.query(
                `
                UPDATE eh_detalle_horarios SET orden = $1, hora = $2, tolerancia = $3, id_horario = $4,
                    tipo_accion = $5, segundo_dia = $6, tercer_dia = $7, minutos_antes = $8, minutos_despues= $9 
                WHERE id = $10 RETURNING *
                `
                , [orden, hora, minu_espera, id_horario, tipo_accion, segundo_dia, tercer_dia, min_antes, min_despues, id]);

            const [datosNuevos] = actualizacion.rows;

            const horadetalle = await FormatearHora(hora);
            const horadetalleO = await FormatearHora(datosOriginales.hora);

            datosNuevos.hora = horadetalle;
            datosOriginales.hora = horadetalleO;


            // AUDITORIA
            await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                tabla: 'eh_detalle_horarios',
                usuario: user_name,
                accion: 'U',
                datosOriginales: JSON.stringify(datosOriginales),
                datosNuevos: JSON.stringify(datosNuevos),
                ip: ip,
                ip_local: ip_local,
                observacion: null
            });

            // FINALIZAR TRANSACCION
            await pool.query('COMMIT');
            return res.jsonp({ message: 'Registro actualizado.' });

        } catch (error) {
            // REVERTIR TRANSACCION
            await pool.query('ROLLBACK');
            return res.status(500).jsonp({ message: 'Error al actualizar registro.' });
        }
    }

    // METODO PARA BUSCAR DETALLES DE VARIOS HORARIOS    **USADO
    public async ListarDetalleHorarios(req: Request, res: Response) {
        const HORARIO = await pool.query(
            `
            SELECT * FROM eh_detalle_horarios
            ORDER BY id_horario ASC, orden ASC
            `
        );

        if (HORARIO.rowCount != 0) {
            const detallesHorarios = HORARIO.rows.map((detalle: any) => {
                switch (detalle.tipo_accion) {
                    case 'E':
                        detalle.tipo_accion_show = 'Entrada';
                        break;
                    case 'I/A':
                        detalle.tipo_accion_show = 'Inicio alimentación';
                        break;
                    case 'F/A':
                        detalle.tipo_accion_show = 'Fin alimentación';
                        break;
                    case 'S':
                        detalle.tipo_accion_show = 'Salida';
                        break;
                    default:
                        detalle.tipo_accion_show = 'Desconocido';
                        break;
                }
                return detalle;
            });

            return res.jsonp(detallesHorarios);
        } else {
            return res.status(404).jsonp({ text: 'No se encuentran registros.' });
        }
    }
}

export const DETALLE_CATALOGO_HORARIO_CONTROLADOR = new DetalleCatalogoHorarioControlador();

export default DETALLE_CATALOGO_HORARIO_CONTROLADOR;