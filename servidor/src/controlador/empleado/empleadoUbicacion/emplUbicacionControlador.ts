import { Request, Response } from 'express';
import { QueryResult } from 'pg';
import pool from '../../../database';
import fs from 'fs';

const builder = require('xmlbuilder');

class UbicacionControlador {

    /** ************************************************************************************************ **
     ** **        REGISTRO TABLA CATALOGO DE UBICACIONES - COORDENADAS (cg_ubicaciones)               ** **
     ** ************************************************************************************************ **/

    // CREAR REGISTRO DE COORDENADAS GENERALES DE UBICACIÓN
    public async RegistrarCoordenadas(req: Request, res: Response) {
        const { latitud, longitud, descripcion } = req.body;
        const response: QueryResult = await pool.query('INSERT INTO cg_ubicaciones (latitud, longitud, descripcion) ' +
            'VALUES ($1, $2, $3) RETURNING *',
            [latitud, longitud, descripcion]);

        const [coordenadas] = response.rows;

        if (coordenadas) {
            return res.status(200).jsonp({ message: 'OK', respuesta: coordenadas })
        }
        else {
            return res.status(404).jsonp({ message: 'error' })
        }
    }

    // ACTUALIZAR REGISTRO DE COORDENADAS GENERALES DE UBICACIÓN
    public async ActualizarCoordenadas(req: Request, res: Response): Promise<void> {
        const { latitud, longitud, descripcion, id } = req.body;
        await pool.query('UPDATE cg_ubicaciones SET latitud = $1, longitud = $2, descripcion = $3 ' +
            'WHERE id = $4',
            [latitud, longitud, descripcion, id]);
        res.jsonp({ message: 'Registro guardado.' });
    }

    // LISTAR TODOS LOS REGISTROS DE COORDENADAS GENERALES DE UBICACIÓN
    public async ListarCoordenadas(req: Request, res: Response) {
        const UBICACIONES = await pool.query('SELECT * FROM cg_ubicaciones');
        if (UBICACIONES.rowCount > 0) {
            return res.jsonp(UBICACIONES.rows)
        }
        else {
            res.status(404).jsonp({ text: 'Registro no encontrado.' });
        }
    }

    // LISTAR TODOS LOS REGISTROS DE COORDENADAS GENERALES DE UBICACIÓN CON EXCEPCIONES
    public async ListarCoordenadasDefinidas(req: Request, res: Response) {
        const id = req.params.id;
        const UBICACIONES = await pool.query('SELECT * FROM cg_ubicaciones WHERE NOT id = $1', [id]);
        if (UBICACIONES.rowCount > 0) {
            return res.jsonp(UBICACIONES.rows)
        }
        else {
            res.status(404).jsonp({ text: 'Registro no encontrado.' });
        }
    }

    // LISTAR TODOS LOS REGISTROS DE COORDENADAS GENERALES DE UBICACIÓN
    public async ListarUnaCoordenada(req: Request, res: Response) {
        const id = req.params.id;
        const UBICACIONES = await pool.query('SELECT * FROM cg_ubicaciones WHERE id = $1', [id]);
        if (UBICACIONES.rowCount > 0) {
            return res.jsonp(UBICACIONES.rows)
        }
        else {
            res.status(404).jsonp({ text: 'Registro no encontrado.' });
        }
    }

    // BUSCAR ÚLTIMO REGISTRO DE COORDENADAS GENERALES DE UBICACIÓN
    public async BuscarUltimoRegistro(req: Request, res: Response) {
        const UBICACIONES = await pool.query('SELECT MAX(id) AS id FROM cg_ubicaciones');
        if (UBICACIONES.rowCount > 0) {
            return res.jsonp(UBICACIONES.rows)
        }
        else {
            res.status(404).jsonp({ text: 'Registro no encontrado.' });
        }
    }

    // ELIMINAR REGISTRO DE COORDENADAS GENERALES DE UBICACIÓN
    public async EliminarCoordenadas(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            await pool.query('DELETE FROM cg_ubicaciones WHERE id = $1', [id]);
            res.jsonp({ message: 'Registro eliminado.' });
        }
        catch {
            res.jsonp({ message: 'false' });
        }
    }

    /** **************************************************************************************** **
     ** **        COORDENADAS DE UBICACION ASIGNADAS A UN USUARIO (empl_ubicacion)            ** **
     ** **************************************************************************************** **/

    // LISTAR REGISTROS DE COORDENADAS GENERALES DE UBICACION DE UN USUARIO
    public async ListarRegistroUsuario(req: Request, res: Response) {
        const { id_empl } = req.params;
        const UBICACIONES = await pool.query(
            `
            SELECT eu.id AS id_emplu, eu.codigo, eu.id_ubicacion, eu.id_empl, cu.latitud, cu.longitud, 
                cu.descripcion 
            FROM empl_ubicacion AS eu, cg_ubicaciones AS cu 
            WHERE eu.id_ubicacion = cu.id AND eu.id_empl = $1
            `
            , [id_empl]);
        if (UBICACIONES.rowCount > 0) {
            return res.jsonp(UBICACIONES.rows)
        }
        else {
            res.status(404).jsonp({ text: 'Registro no encontrado.' });
        }
    }







    // ASIGNAR COORDENADAS GENERALES DE UBICACIÓN A LOS USUARIOS
    public async RegistrarCoordenadasUsuario(req: Request, res: Response): Promise<void> {
        const { codigo, id_empl, id_ubicacion } = req.body;
        await pool.query('INSERT INTO empl_ubicacion (codigo, id_empl, id_ubicacion) ' +
            'VALUES ($1, $2, $3)',
            [codigo, id_empl, id_ubicacion]);
        res.jsonp({ message: 'Registro guardado.' });
    }



    // LISTAR REGISTROS DE COORDENADAS GENERALES DE UNA UBICACIÓN 
    public async ListarRegistroUsuarioU(req: Request, res: Response) {
        const id_ubicacion = req.params.id_ubicacion;
        const UBICACIONES = await pool.query('SELECT eu.id AS id_emplu, eu.codigo, eu.id_ubicacion, eu.id_empl, ' +
            'cu.latitud, cu.longitud, cu.descripcion, e.nombre, e.apellido ' +
            'FROM empl_ubicacion AS eu, cg_ubicaciones AS cu, empleados AS e ' +
            'WHERE eu.id_ubicacion = cu.id AND e.codigo = eu.codigo AND cu.id = $1',
            [id_ubicacion]);
        if (UBICACIONES.rowCount > 0) {
            return res.jsonp(UBICACIONES.rows)
        }
        else {
            res.status(404).jsonp({ text: 'Registro no encontrado.' });
        }
    }

    // ELIMINAR REGISTRO DE COORDENADAS GENERALES DE UBICACIÓN
    public async EliminarCoordenadasUsuario(req: Request, res: Response): Promise<void> {
        const { id } = req.params;
        await pool.query('DELETE FROM empl_ubicacion WHERE id = $1', [id]);
        res.jsonp({ message: 'Registro eliminado.' });
    }

    // METODO PARA CREAR ARCHIVO XML
    public async FileXML(req: Request, res: Response): Promise<any> {
        var xml = builder.create('root').ele(req.body).end({ pretty: true });
        console.log(req.body.userName);
        let filename = "CoordenadasGeograficas-" + req.body.userName + '-' + req.body.userId + '-' + new Date().getTime() + '.xml';
        fs.writeFile(`xmlDownload/${filename}`, xml, function (err) {
        });
        res.jsonp({ text: 'XML creado', name: filename });
    }

    // METODO PARA DESCARGAR ARCHIVO XML
    public async downloadXML(req: Request, res: Response): Promise<any> {
        const name = req.params.nameXML;
        let filePath = `servidor\\xmlDownload\\${name}`
        res.sendFile(__dirname.split("servidor")[0] + filePath);
    }

}

export const UBICACION_CONTROLADOR = new UbicacionControlador();

export default UBICACION_CONTROLADOR;