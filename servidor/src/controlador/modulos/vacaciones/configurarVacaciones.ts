import { Request, Response } from 'express';
import AUDITORIA_CONTROLADOR from '../../reportes/auditoriaControlador';
import pool from '../../../database';

class ConfigurarVacacioneControlador {

    // REGISTRAR CONFIGURACION DE VACACIONES  **USADO
    public async RegistrarConfiguracion(req: Request, res: Response): Promise<void> {
        try {
            const { descripcion, permitir_horas, minimo_horas, minimo_dias, documento, estado, incluir_feriados,
                user_name, ip, ip_local } = req.body;

            // INICIAR TRANSACCION
            await pool.query('BEGIN');

            const datosNuevos = await pool.query(
                `
                    INSERT INTO mv_configurar_vacaciones 
                        (descripcion, permite_horas, minimo_horas, minimo_dias, documento, estado, incluir_feriados) 
                        VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *
                `
                , [descripcion, permitir_horas, minimo_horas, minimo_dias, documento, estado, incluir_feriados]);

            // AUDITORIA
            await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                tabla: 'mv_configurar_vacaciones',
                usuario: user_name,
                accion: 'I',
                datosOriginales: '',
                datosNuevos: JSON.stringify(datosNuevos.rows[0]),
                ip: ip,
                ip_local: ip_local,
                observacion: null
            });

            // FINALIZAR TRANSACCION
            await pool.query('COMMIT');
            res.jsonp({ message: 'Registro guardado.', estado: 'OK', id: datosNuevos.rows[0].id });

        } catch (error) {
            console.log('error ', error)
            // FINALIZAR TRANSACCION
            await pool.query('ROLLBACK');
            res.status(500).jsonp({ message: 'Error al guardar el registro.' });
        }
    }

    // ACTUALIZAR REGISTRO DE CONFIGURACION DE VACACIONES  **USADO
    public async ActualizarConfiguracion(req: Request, res: Response): Promise<Response> {
        try {
            const { descripcion, permite_horas, minimo_horas, minimo_dias, documento, estado, incluir_feriados,
                id, user_name, ip, ip_local } = req.body;

            // INICIAR TRANSACCION
            await pool.query('BEGIN');

            // CONSULTAR DATOS ORIGINALES
            const consulta = await pool.query(`SELECT * FROM mv_configurar_vacaciones WHERE id = $1`, [id]);
            const [datosOriginales] = consulta.rows;

            if (!datosOriginales) {
                await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                    tabla: 'mv_configurar_vacaciones',
                    usuario: user_name,
                    accion: 'U',
                    datosOriginales: '',
                    datosNuevos: '',
                    ip: ip,
                    ip_local: ip_local,
                    observacion: `Error al actualizar el registro con id: ${id}. Registro no encontrado.`
                });

                // FINALIZAR TRANSACCION
                await pool.query('COMMIT');
                return res.status(404).jsonp({ message: 'Registro no encontrado.' });
            }

            await pool.query(
                `
                    UPDATE mv_configurar_vacaciones SET descripcion = $1, permite_horas = $2 
                        minimo_horas = $3, minimo_dias = $4, documento = $5, estado = $6,
                        incluir_feriados = $7    
                    WHERE id = $8
                `
                , [descripcion, permite_horas, minimo_horas, minimo_dias, documento, estado, incluir_feriados, id]);

            // AUDITORIA
            await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                tabla: 'mv_configurar_vacaciones',
                usuario: user_name,
                accion: 'U',
                datosOriginales: JSON.stringify(datosOriginales),
                datosNuevos: `{ "descripcion": "${descripcion}", "permite_horas": "${permite_horas}", 
                    "minimo_horas": "${minimo_horas}", "minimo_dias":"${minimo_dias}", "estado":"${estado}", 
                    "documento":"${documento}", "incluir_feriados": "${incluir_feriados}" }`,
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
            return res.status(500).jsonp({ message: 'error' });
        }
    }

    // LISTAR REGISTROS DE CONFIGURACION DE VACACIONES  **USADO
    public async ListarConfiguraciones(req: Request, res: Response) {
        const CONFIGURCAION = await pool.query(
            `
                SELECT * FROM mv_configurar_vacaciones;
            `
        );
        if (CONFIGURCAION.rowCount != 0) {
            return res.jsonp(CONFIGURCAION.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'No se encuentran registros.' });
        }
    }

    // METODO PARA ELIMINAR REGISTRO  **USADO
    public async EliminarConfiguracion(req: Request, res: Response): Promise<Response> {
        try {
            const { user_name, ip, ip_local } = req.body;
            const id = req.params.id;

            // INICIAR TRANSACCION
            await pool.query('BEGIN');

            // CONSULTAR DATOS ORIGINALES
            const CONFIGURAR = await pool.query(`SELECT * FROM mv_configurar_vacaciones WHERE id = $1`, [id]);
            const [datosOriginales] = CONFIGURAR.rows;

            if (!datosOriginales) {
                // AUDITORIA
                await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                    tabla: 'mv_configurar_vacaciones',
                    usuario: user_name,
                    accion: 'D',
                    datosOriginales: '',
                    datosNuevos: '',
                    ip: ip,
                    ip_local: ip_local,
                    observacion: `Error al eliminar la configuración con id ${id}. Registro no encontrado.`
                });

                // FINALIZAR TRANSACCION
                await pool.query('COMMIT');
                return res.status(404).jsonp({ message: 'Error al eliminar el registro.' });
            }

            await pool.query(
                `
                    DELETE FROM mv_configurar_vacaciones WHERE id = $1
                `
                , [id]);

            // AUDITORIA
            await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                tabla: 'mv_configurar_vacaciones',
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

    // METODO PARA VER UNA CONFIGURACION DE VACACIONES   **USADO
    public async ConsultarUnaConfiguracion(req: Request, res: Response): Promise<any> {
        const { id } = req.params;
        const CONFIGURACION = await pool.query(
            `
                SELECT * FROM mv_configurar_vacaciones WHERE id = $1
            `
            , [id]);
        if (CONFIGURACION.rowCount != 0) {
            return res.jsonp(CONFIGURACION.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'No se encuentran registros.' });
        }
    }

}

export const CONFIGURAR_VACACIONES_CONTROLADOR = new ConfigurarVacacioneControlador();

export default CONFIGURAR_VACACIONES_CONTROLADOR;