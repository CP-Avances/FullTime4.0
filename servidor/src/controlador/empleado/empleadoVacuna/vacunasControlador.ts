import { Request, Response } from 'express';
import { ObtenerRutaVacuna } from '../../../libs/accesoCarpetas';
import { QueryResult } from 'pg';
import pool from '../../../database';
import path from 'path';
import fs from 'fs';
import moment from 'moment';

class VacunasControlador {

    // LISTAR REGISTROS DE VACUNACIÓN DEL EMPLEADO POR SU ID
    public async ListarUnRegistro(req: Request, res: Response): Promise<any> {
        const { id_empleado } = req.params;
        const VACUNA = await pool.query(
            `
            SELECT ev.id, ev.id_empleado, ev.id_tipo_vacuna, ev.carnet, ev.fecha, 
            tv.nombre, ev.descripcion
            FROM empl_vacunas AS ev, tipo_vacuna AS tv 
            WHERE ev.id_tipo_vacuna = tv.id AND ev.id_empleado = $1
            ORDER BY ev.id DESC
            `
            , [id_empleado]);
        if (VACUNA.rowCount > 0) {
            return res.jsonp(VACUNA.rows)
        }
        else {
            res.status(404).jsonp({ text: 'Registro no encontrado.' });
        }
    }

    // LISTAR REGISTRO TIPO DE VACUNA
    public async ListarTipoVacuna(req: Request, res: Response) {
        const VACUNA = await pool.query(
            `
            SELECT * FROM tipo_vacuna
            `
        );
        if (VACUNA.rowCount > 0) {
            return res.jsonp(VACUNA.rows)
        }
        else {
            res.status(404).jsonp({ text: 'Registro no encontrado.' });
        }
    }

    // CREAR REGISTRO DE VACUNACION
    public async CrearRegistro(req: Request, res: Response): Promise<Response> {
        const { id_empleado, descripcion, fecha, id_tipo_vacuna } = req.body;
        const response: QueryResult = await pool.query(
            `
            INSERT INTO empl_vacunas (id_empleado, descripcion, fecha, id_tipo_vacuna) 
            VALUES ($1, $2, $3, $4) RETURNING *
            `
            , [id_empleado, descripcion, fecha, id_tipo_vacuna]);

        const [vacuna] = response.rows;

        if (vacuna) {
            return res.status(200).jsonp(vacuna)
        }
        else {
            return res.status(404).jsonp({ message: 'error' })
        }
    }


    // REGISTRO DE CERTIFICADO O CARNET DE VACUNACION
    public async GuardarDocumento(req: Request, res: Response): Promise<void> {

        // FECHA DEL SISTEMA
        var fecha = moment();
        var anio = fecha.format('YYYY');
        var mes = fecha.format('MM');
        var dia = fecha.format('DD');

        let id = req.params.id;
        let id_empleado = req.params.id_empleado;

        const response: QueryResult = await pool.query(
            `
            SELECT codigo FROM empleados WHERE id = $1
            `
            , [id_empleado]);

        const [vacuna] = response.rows;

        let documento = vacuna.codigo + '_' + anio + '_' + mes + '_' + dia + '_' + req.file?.originalname;

        await pool.query(
            `
            UPDATE empl_vacunas SET carnet = $2 WHERE id = $1
            `
            , [id, documento]);

        res.jsonp({ message: 'Registro guardado.' });
    }

    // ACTUALIZAR REGISTRO DE VACUNACION
    public async ActualizarRegistro(req: Request, res: Response): Promise<void> {
        const { id } = req.params;
        const { id_empleado, descripcion, fecha, id_tipo_vacuna } = req.body;
        await pool.query(
            `
            UPDATE empl_vacunas SET id_empleado = $1, descripcion = $2, fecha = $3, 
            id_tipo_vacuna = $4 WHERE id = $5
            `
            , [id_empleado, descripcion, fecha, id_tipo_vacuna, id]);

        res.jsonp({ message: 'Registro actualizado.' });
    }

    // ELIMINAR DOCUMENTO CARNET DE VACUNACION DEL SERVIDOR
    public async EliminarDocumentoServidor(req: Request, res: Response): Promise<void> {
        let { documento, id } = req.body;
        let separador = path.sep;

        if (documento != 'null' && documento != '' && documento != null) {
            let ruta = await ObtenerRutaVacuna(id) + separador + documento;
            //console.log('vacuna ruta ', ruta)
            fs.unlinkSync(ruta);
        }
        res.jsonp({ message: 'Documento actualizado.' });
    }

    // ELIMINAR DOCUMENTO CARNET DE VACUNACION
    public async EliminarDocumento(req: Request, res: Response): Promise<void> {
        let separador = path.sep;
        let { documento, id } = req.body;

        const response: QueryResult = await pool.query(
            `
            UPDATE empl_vacunas SET carnet = null WHERE id = $1 RETURNING *
            `
            , [id]);

        const [vacuna] = response.rows;

        if (documento != 'null' && documento != '' && documento != null) {
            let ruta = await ObtenerRutaVacuna(vacuna.id_empleado) + separador + documento;
            //console.log('vacuna ruta ', ruta)
            fs.unlinkSync(ruta);
        }

        res.jsonp({ message: 'Documento eliminado.' });
    }

    // ELIMINAR REGISTRO DE VACUNACION
    public async EliminarRegistro(req: Request, res: Response): Promise<void> {
        let separador = path.sep;
        const { id, documento } = req.params;
        const response: QueryResult = await pool.query(
            `
            DELETE FROM empl_vacunas WHERE id = $1 RETURNING *
            `
            , [id]);

        const [vacuna] = response.rows;

        if (documento != 'null' && documento != '' && documento != null) {
            let ruta = await ObtenerRutaVacuna(vacuna.id_empleado) + separador + documento;
            //console.log('vacuna ruta ', ruta)
            fs.unlinkSync(ruta);
        }
        res.jsonp({ message: 'Registro eliminado.' });
    }

    // CREAR REGISTRO DE TIPO DE VACUNA
    public async CrearTipoVacuna(req: Request, res: Response): Promise<Response> {
        try {
            const { nombre } = req.body;

            const response: QueryResult = await pool.query(
                `
                INSERT INTO tipo_vacuna (nombre) VALUES ($1) RETURNING *
                `
                , [nombre]);

            const [vacunas] = response.rows;

            if (vacunas) {
                return res.status(200).jsonp(vacunas)
            }
            else {
                return res.status(404).jsonp({ message: 'error' })
            }

        } catch (error) {
            return res.jsonp({ message: 'error' });
        }
    }

    // OBTENER CERTIFICADO DE VACUNACION
    public async ObtenerDocumento(req: Request, res: Response): Promise<any> {
        const docs = req.params.docs;
        const id = req.params.id;
        // TRATAMIENTO DE RUTAS
        let separador = path.sep;
        let ruta = await ObtenerRutaVacuna(id) + separador + docs;
        res.sendFile(path.resolve(ruta));
    }























    // LISTAR TODOS LOS REGISTROS DE VACUNACIÓN
    public async ListarRegistro(req: Request, res: Response) {
        const VACUNA = await pool.query(
            `
            SELECT ev.id, ev.id_empleado, ev.id_tipo_vacuna, ev.carnet, ev.fecha, 
            tv.nombre, ev.descripcion
            FROM empl_vacunas AS ev, tipo_vacuna AS tv 
            WHERE ev.id_tipo_vacuna = tv.id
            ORDER BY ev.id DESC
            `
        );
        if (VACUNA.rowCount > 0) {
            return res.jsonp(VACUNA.rows)
        }
        else {
            res.status(404).jsonp({ text: 'Registro no encontrado.' });
        }
    }

}

export const VACUNAS_CONTROLADOR = new VacunasControlador();

export default VACUNAS_CONTROLADOR;