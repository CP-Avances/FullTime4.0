import { Request, Response } from 'express';
import { QueryResult } from 'pg';
import pool from '../../database';
import fs from 'fs';
const builder = require('xmlbuilder');

class NivelTituloControlador {

  // METODO PARA LISTAR NIVELES DE TITULO PROFESIONAL
  public async ListarNivel(req: Request, res: Response) {
    const titulo = await pool.query(
      `
      SELECT * FROM nivel_titulo ORDER BY nombre ASC
      `
    );
    if (titulo.rowCount > 0) {
      return res.jsonp(titulo.rows)
    }
    else {
      res.status(404).jsonp({ text: 'Registro no encontrado.' });
    }
  }

  // METODO PARA ELIMINAR REGISTROS
  public async EliminarNivelTitulo(req: Request, res: Response): Promise<void> {
    const id = req.params.id;
    await pool.query(
      `
      DELETE FROM nivel_titulo WHERE id = $1
      `
      , [id]);
    res.jsonp({ message: 'Registro eliminado.' });
  }

  // METODO PARA CREAR ARCHIVO XML
  public async FileXML(req: Request, res: Response): Promise<any> {
    var xml = builder.create('root').ele(req.body).end({ pretty: true });
    let filename = "NvelTitulos-" + req.body.userName + '-' + req.body.userId + '-' + new Date().getTime() + '.xml';
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

  // METODO PARA REGISTRAR NIVEL DE TITULO
  public async CrearNivel(req: Request, res: Response): Promise<Response> {
    const { nombre } = req.body;
    const response: QueryResult = await pool.query(
      `
      INSERT INTO nivel_titulo (nombre) VALUES ($1) RETURNING *
      `
      , [nombre]);

    const [nivel] = response.rows;

    if (nivel) {
      return res.status(200).jsonp(nivel)
    }
    else {
      return res.status(404).jsonp({ message: 'error' })
    }
  }

  // METODO PARA ACTUALIZAR REGISTRO DE NIVEL DE TITULO
  public async ActualizarNivelTitulo(req: Request, res: Response): Promise<void> {
    const { nombre, id } = req.body;
    await pool.query(
      `
      UPDATE nivel_titulo SET nombre = $1 WHERE id = $2
      `
      , [nombre, id]);
    res.jsonp({ message: 'Registro actualizado.' });
  }

  // METODO PARA BUSCAR TITULO POR SU NOMBRE
  public async ObtenerNivelNombre(req: Request, res: Response): Promise<any> {
    const { nombre } = req.params;
    const unNivelTitulo = await pool.query(
      `
      SELECT * FROM nivel_titulo WHERE nombre = $1
      `
      , [nombre]);

    if (unNivelTitulo.rowCount > 0) {
      return res.jsonp(unNivelTitulo.rows)
    }
    else {
      res.status(404).jsonp({ text: 'Registro no encontrado' });
    }
  }









  public async getOne(req: Request, res: Response): Promise<any> {
    const { id } = req.params;
    const unNivelTitulo = await pool.query('SELECT * FROM nivel_titulo WHERE id = $1', [id]);
    if (unNivelTitulo.rowCount > 0) {
      return res.jsonp(unNivelTitulo.rows)
    }
    else {
      res.status(404).jsonp({ text: 'Registro no encontrado' });
    }

  }



}

export const NIVEL_TITULO_CONTROLADOR = new NivelTituloControlador();

export default NIVEL_TITULO_CONTROLADOR;