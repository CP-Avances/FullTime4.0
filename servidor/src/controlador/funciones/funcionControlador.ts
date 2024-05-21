import { Request, Response } from 'express';
import AUDITORIA_CONTROLADOR from '../auditoria/auditoriaControlador';
import pool from '../../database';

class FuncionesControlador {

    // METODO PARA LISTAR FUNCIONES DEL SISTEMA
    public async ConsultarFunciones(req: Request, res: Response) {
        const FUNCIONES = await pool.query(
            `
            SELECT * FROM e_funciones
            `
        );
        if (FUNCIONES.rowCount > 0) {
            return res.jsonp(FUNCIONES.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'No se encuentran registros.' });
        }
    }

    public async RegistrarFunciones(req: Request, res: Response): Promise<void> {
        try {
            const { id, hora_extra, accion_personal, alimentacion, permisos, user_name, ip } = req.body;

            // INICIAR TRANSACCION
            await pool.query('BEGIN');

            await pool.query(
                `
                INSERT INTO e_funciones (id, hora_extra, accion_personal, alimentacion, permisos)
                VALUES ($1, $2, $3, $4, $5)
                `
                ,
                [id, hora_extra, accion_personal, alimentacion, permisos]);
                
            // AUDITORIA
            await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                tabla: 'e_funciones',
                usuario: user_name,
                accion: 'I',
                datosOriginales: '',
                datosNuevos: `{ id: ${id}, hora_extra: ${hora_extra}, accion_personal: ${accion_personal}, alimentacion: ${alimentacion}, permisos: ${permisos} }`,
                ip,
                observacion: null
            })   
            
            // FINALIZAR TRANSACCION
            await pool.query('COMMIT');
            res.jsonp({ message: 'Funciones Registradas' });
        } catch (error) {
            // REVERTIR TRNASACCION
            await pool.query('ROLLBACK');
            res.status(500).jsonp({ message: 'Error al registrar funciones' });
        }
    }

    public async EditarFunciones(req: Request, res: Response): Promise<Response> {
        try {
            const id = req.params.id;
            const { hora_extra, accion_personal, alimentacion, permisos, user_name, ip } = req.body;

            // INICIAR TRANSACCION
            await pool.query('BEGIN');

            // CONSULTAR DATOSORIGINALES
            const FUNCIONES = await pool.query('SELECT * FROM funciones WHERE id = $1', [id]);
            const datosOriginales = FUNCIONES.rows[0];

            if (!datosOriginales) {
                await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                    tabla: 'funciones',
                    usuario: user_name,
                    accion: 'U',
                    datosOriginales: '',
                    datosNuevos: '',
                    ip,
                    observacion: `Error al actualizar funciones con id ${id}`
                });

                // FINALIZAR TRANSACCION
                await pool.query('COMMIT');
                return res.status(404).jsonp({ message: 'error' });
            }

            await pool.query(
                `
                UPDATE e_funciones SET hora_extra = $2, accion_personal = $3, alimentacion = $4, ' +
                    permisos = $5 WHERE id = $1
                `
                ,
                [id, hora_extra, accion_personal, alimentacion, permisos]);
            
            // AUDITORIA
            await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                tabla: 'funciones',
                usuario: user_name,
                accion: 'U',
                datosOriginales: JSON.stringify(datosOriginales),
                datosNuevos: `{ id: ${id}, hora_extra: ${hora_extra}, accion_personal: ${accion_personal}, alimentacion: ${alimentacion}, permisos: ${permisos} }`,
                ip,
                observacion: null
            });

            // FINALIZAR TRANSACCION
            await pool.query('COMMIT');
            return res.jsonp({ message: 'Funciones Actualizados' });
        } catch (error) {
            // REVERTIR TRNASACCION
            await pool.query('ROLLBACK');
            return res.status(500).jsonp({ message: 'Error al actualizar funciones' });
        }
    }

}

export const FUNCIONES_CONTROLADOR = new FuncionesControlador();

export default FUNCIONES_CONTROLADOR;