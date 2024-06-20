import { Credenciales, fechaHora, FormatearFecha, FormatearHora, dia_completo } from '../../libs/settingsMail';
import { Request, Response } from 'express';
import pool from '../../database';
import path from 'path';

class AutorizacionesControlador {

    // METODO PARA BUSCAR AUTORIZACIONES DE PERMISOS
    public async ObtenerAutorizacionPermiso(req: Request, res: Response) {
        const id = req.params.id_permiso
        const AUTORIZACIONES = await pool.query(
            `
            SELECT * FROM ecm_autorizaciones WHERE id_permiso = $1
            `
            , [id]);
        if (AUTORIZACIONES.rowCount != 0) {
            return res.jsonp(AUTORIZACIONES.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'No se encuentran registros.' });
        }
    }


    public async ListarAutorizaciones(req: Request, res: Response) {
        const AUTORIZACIONES = await pool.query(
            `
            SELECT * FROM ecm_autorizaciones ORDER BY id
            `
        );
        if (AUTORIZACIONES.rowCount != 0) {
            return res.jsonp(AUTORIZACIONES.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'No se encuentran registros.' });
        }
    }


    public async ObtenerAutorizacionByVacacion(req: Request, res: Response) {
        const id = req.params.id_vacacion
        const AUTORIZACIONES = await pool.query(
            `
            SELECT * FROM ecm_autorizaciones WHERE id_vacacion = $1
            `
            , [id]);
        if (AUTORIZACIONES.rowCount != 0) {
            return res.jsonp(AUTORIZACIONES.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'No se encuentran registros.' });
        }
    }


    public async ObtenerAutorizacionByHoraExtra(req: Request, res: Response) {
        const id = req.params.id_hora_extra
        const AUTORIZACIONES = await pool.query(
            `
            SELECT * FROM ecm_autorizaciones WHERE id_hora_extra = $1
            `
            , [id]);
        if (AUTORIZACIONES.rowCount != 0) {
            return res.jsonp(AUTORIZACIONES.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'No se encuentran registros.' });
        }
    }

    public async CrearAutorizacion(req: Request, res: Response): Promise<any> {
        const { orden, estado, id_departamento, id_permiso, id_vacacion, id_hora_extra,
            id_plan_hora_extra, id_documento } = req.body;
        await pool.query(
            `
            INSERT INTO ecm_autorizaciones (orden, estado, id_departamento, 
                id_permiso, id_vacacion, id_hora_extra, id_plan_hora_extra, id_autoriza_estado) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            `
            , [orden, estado, id_departamento, id_permiso, id_vacacion, id_hora_extra,
            id_plan_hora_extra, id_documento]);
        res.jsonp({ message: 'Autorización guardada.' });
    }






    public async ActualizarEstadoAutorizacionPermiso(req: Request, res: Response): Promise<void> {
        const { id_documento, estado, id_permiso } = req.body;

        await pool.query(
            `
            UPDATE ecm_autorizaciones SET estado = $1, id_autoriza_estado = $2 WHERE id_permiso = $3
            `
            , [estado, id_documento, id_permiso]);
        res.jsonp({ message: 'Autorización guardada.' });
    }



    public async ActualizarEstadoPlanificacion(req: Request, res: Response): Promise<void> {

        var tiempo = fechaHora();
        var fecha = await FormatearFecha(tiempo.fecha_formato, dia_completo);
        var hora = await FormatearHora(tiempo.hora);

        const path_folder = path.resolve('logos');

        var datos = await Credenciales(parseInt(req.params.id_empresa));

        if (datos === 'ok') {
            // IMPLEMENTAR ENVIO DE CORREO
            const id = req.params.id_plan_hora_extra;
            const { id_documento, estado } = req.body;
            await pool.query(
                `
                UPDATE ecm_autorizaciones SET estado = $1, id_autoriza_estado = $2 
                WHERE id_plan_hora_extra = $3
                `
                , [estado, id_documento, id]);
            res.jsonp({ message: 'Autorización guardada.' });
        }
        else {
            res.jsonp({ message: 'Ups!!! algo salio mal. No fue posible enviar correo electrónico.' });
        }
    }


    /** ***************************************************************************************************** ** 
     ** **                METODO DE CAMBIO DE ESTADO DE APROBACIONES DE SOLICITUDES                        ** ** 
     ** ***************************************************************************************************** **/

    // METODO DE APROBACION DE SOLICITUD DE PERMISO
    public async ActualizarEstadoSolicitudes(req: Request, res: Response): Promise<void> {

        const id = req.params.id;
        const { id_documento, estado } = req.body;

        await pool.query(
            `
            UPDATE ecm_autorizaciones SET estado = $1, id_autoriza_estado = $2 
            WHERE id = $3
            `
            , [estado, id_documento, id]);

        res.jsonp({ message: 'Registro exitoso.' });
    }
}

export const AUTORIZACION_CONTROLADOR = new AutorizacionesControlador();

export default AUTORIZACION_CONTROLADOR;