import { Request, Response } from 'express';
import { QueryResult } from 'pg';
import fs from 'fs';
const builder = require('xmlbuilder');

import pool from '../../database';

class TipoComidasControlador {

    public async ListarTipoComidas(req: Request, res: Response) {
        const TIPO_COMIDAS = await pool.query('SELECT ctc.id, ctc.nombre, ctc.tipo_comida, ctc.hora_inicio, ' +
            'ctc.hora_fin, tc.nombre AS tipo FROM cg_tipo_comidas AS ctc, tipo_comida AS tc ' +
            'WHERE ctc.tipo_comida = tc.id ORDER BY tc.nombre ASC, ctc.id ASC');
        if (TIPO_COMIDAS.rowCount > 0) {
            return res.jsonp(TIPO_COMIDAS.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'No se encuentran registros' });
        }
    }

    public async ListarTipoComidasDetalles(req: Request, res: Response) {
        const TIPO_COMIDAS = await pool.query('SELECT ctc.id, ctc.nombre, ctc.tipo_comida, ctc.hora_inicio, ' +
            'ctc.hora_fin, tc.nombre AS tipo, dm.nombre AS nombre_plato, dm.valor, dm.observacion ' +
            'FROM cg_tipo_comidas AS ctc, tipo_comida AS tc, detalle_menu AS dm ' +
            'WHERE ctc.tipo_comida = tc.id AND dm.id_menu = ctc.id ORDER BY tc.nombre ASC, ctc.id ASC');
        if (TIPO_COMIDAS.rowCount > 0) {
            return res.jsonp(TIPO_COMIDAS.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'No se encuentran registros' });
        }
    }

    public async VerUnMenu(req: Request, res: Response): Promise<any> {
        const { id } = req.params;
        const TIPO_COMIDAS = await pool.query('SELECT ctc.id, ctc.nombre, ctc.tipo_comida, ctc.hora_inicio, ' +
            'ctc.hora_fin, tc.nombre AS tipo FROM cg_tipo_comidas AS ctc, tipo_comida AS tc ' +
            'WHERE ctc.tipo_comida = tc.id AND ctc.id = $1', [id]);
        if (TIPO_COMIDAS.rowCount > 0) {
            return res.jsonp(TIPO_COMIDAS.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'No se encuentran registros' });
        }
    }

    public async ListarUnTipoComida(req: Request, res: Response): Promise<any> {
        const { id } = req.params;
        const TIPO_COMIDAS = await pool.query('SELECT ctc.id, ctc.nombre, ctc.tipo_comida, ctc.hora_inicio, ' +
            'ctc.hora_fin, tc.nombre AS tipo FROM cg_tipo_comidas AS ctc, tipo_comida AS tc ' +
            ' WHERE ctc.tipo_comida = tc.id AND tc.id = $1 ORDER BY tc.nombre ASC', [id]);
        if (TIPO_COMIDAS.rowCount > 0) {
            return res.jsonp(TIPO_COMIDAS.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'No se encuentran registros' });
        }
    }

    public async CrearTipoComidas(req: Request, res: Response) {

        const { nombre, tipo_comida, hora_inicio, hora_fin } = req.body;

        const response: QueryResult = await pool.query(
            `
            INSERT INTO cg_tipo_comidas (nombre, tipo_comida, hora_inicio, hora_fin)
            VALUES ($1, $2, $3, $4) RETURNING *
            `
            , [nombre, tipo_comida, hora_inicio, hora_fin]);

        const [tipos_comida] = response.rows;

        if (!tipos_comida) {
            return res.status(404).jsonp({ message: 'error' })
        }
        else {
            return res.status(200).jsonp({ message: 'OK', info: tipos_comida });
        }
    }

    public async ActualizarComida(req: Request, res: Response): Promise<void> {
        const { nombre, tipo_comida, hora_inicio, hora_fin, id } = req.body;
        await pool.query('UPDATE cg_tipo_comidas SET nombre = $1, tipo_comida = $2, hora_inicio = $3, hora_fin = $4 ' +
            'WHERE id = $5', [nombre, tipo_comida, hora_inicio, hora_fin, id]);
        res.jsonp({ message: 'Registro actualizado exitosamente' });
    }

    public async FileXML(req: Request, res: Response): Promise<any> {
        var xml = builder.create('root').ele(req.body).end({ pretty: true });
        console.log(req.body.userName);
        let filename = "Comidas-" + req.body.userName + '-' + req.body.userId + '-' + new Date().getTime() + '.xml';
        fs.writeFile(`xmlDownload/${filename}`, xml, function (err) {
            if (err) {
                return console.log(err);
            }
            console.log("Archivo guardado");
        });
        res.jsonp({ text: 'XML creado', name: filename });
    }

    public async downloadXML(req: Request, res: Response): Promise<any> {
        const name = req.params.nameXML;
        let filePath = `servidor\\xmlDownload\\${name}`
        res.sendFile(__dirname.split("servidor")[0] + filePath);
    }

    public async EliminarRegistros(req: Request, res: Response): Promise<void> {
        const id = req.params.id;
        await pool.query('DELETE FROM cg_tipo_comidas WHERE id = $1', [id]);
        res.jsonp({ message: 'Registro eliminado.' });
    }

    public async VerUltimoRegistro(req: Request, res: Response) {
        const TIPO_COMIDAS = await pool.query('SELECT MAX (id) FROM cg_tipo_comidas');
        if (TIPO_COMIDAS.rowCount > 0) {
            return res.jsonp(TIPO_COMIDAS.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'No se encuentran registros' });
        }
    }


    // Registro de detalle de menú - desglose de platos
    public async CrearDetalleMenu(req: Request, res: Response): Promise<void> {
        const { nombre, valor, observacion, id_menu } = req.body;
        await pool.query('INSERT INTO detalle_menu (nombre, valor, observacion, id_menu) ' +
            'VALUES ($1, $2, $3, $4)',
            [nombre, valor, observacion, id_menu]);
        res.jsonp({ message: 'Detalle de menú registrada' });
    }

    public async VerUnDetalleMenu(req: Request, res: Response): Promise<any> {
        const { id } = req.params;
        const TIPO_COMIDAS = await pool.query('SELECT tc.id AS id_servicio, tc.nombre AS servicio, ' +
            'menu.id AS id_menu, menu.nombre AS menu, dm.id AS id_detalle, dm.nombre AS plato, dm.valor, ' +
            'dm.observacion, menu.hora_inicio, menu.hora_fin ' +
            'FROM tipo_comida AS tc, cg_tipo_comidas AS menu, detalle_menu AS dm ' +
            'WHERE tc.id = menu.tipo_comida AND dm.id_menu = menu.id AND menu.id = $1', [id]);
        if (TIPO_COMIDAS.rowCount > 0) {
            return res.jsonp(TIPO_COMIDAS.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'No se encuentran registros' });
        }
    }

    public async ActualizarDetalleMenu(req: Request, res: Response): Promise<void> {
        const { nombre, valor, observacion, id } = req.body;
        await pool.query('UPDATE detalle_menu SET nombre = $1, valor = $2, observacion = $3 ' +
            'WHERE id = $4',
            [nombre, valor, observacion, id]);
        res.jsonp({ message: 'Detalle de menú actualizado' });
    }

    public async EliminarDetalle(req: Request, res: Response): Promise<void> {
        const id = req.params.id;
        await pool.query('DELETE FROM detalle_menu WHERE id = $1', [id]);
        res.jsonp({ message: 'Registro eliminado.' });
    }

}

const TIPO_COMIDAS_CONTROLADOR = new TipoComidasControlador();

export default TIPO_COMIDAS_CONTROLADOR;
