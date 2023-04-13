import { Request, Response } from 'express';
import pool from '../../database';
import fs from 'fs';
const builder = require('xmlbuilder');

class ProvinciaControlador {

  // LISTA DE PAISES DE ACUERDO AL CONTINENTE
  public async ListarPaises(req: Request, res: Response) {
    const { continente } = req.params;
    const CONTINENTE = await pool.query(
      `
      SELECT * FROM cg_paises WHERE continente = $1 ORDER BY nombre ASC
      `
      , [continente]);

    if (CONTINENTE.rowCount > 0) {
      return res.jsonp(CONTINENTE.rows)
    }
    else {
      return res.status(404).jsonp({ text: 'No se encuentran registros' });
    }
  }

  // METODO PARA BUSCAR LISTA DE CONTINENTES
  public async ListarContinentes(req: Request, res: Response) {
    const CONTINENTE = await pool.query(
      `
      SELECT continente FROM cg_paises GROUP BY continente ORDER BY continente ASC
      `);
    if (CONTINENTE.rowCount > 0) {
      return res.jsonp(CONTINENTE.rows)
    }
    else {
      return res.status(404).jsonp({ text: 'No se encuentran registros.' });
    }
  }

  // METODO PARA BUSCAR PROVINCIAS POR PAIS
  public async BuscarProvinciaPais(req: Request, res: Response): Promise<any> {
    const { id_pais } = req.params;
    const UNA_PROVINCIA = await pool.query(
      `
      SELECT * FROM cg_provincias WHERE id_pais = $1
      `
      , [id_pais]);
    if (UNA_PROVINCIA.rowCount > 0) {
      return res.jsonp(UNA_PROVINCIA.rows)
    }
    else {
      return res.status(404).jsonp({ text: 'Registros no encontrados.' });
    }
  }

  // METODO PARA BUSCAR PROVINCIAS
  public async ListarProvincia(req: Request, res: Response) {
    const PROVINCIA = await pool.query(
      `
      SELECT pro.id, pro.nombre, pro.id_pais, pa.nombre AS pais
      FROM cg_provincias pro, cg_paises pa
      WHERE pro.id_pais = pa.id;
      `
    );
    if (PROVINCIA.rowCount > 0) {
      return res.jsonp(PROVINCIA.rows)
    }
    else {
      return res.status(404).jsonp({ text: 'No se encuentran registros' });
    }
  }

  // METODO PARA ELIMINAR REGISTROS
  public async EliminarProvincia(req: Request, res: Response): Promise<void> {
    const id = req.params.id;
    await pool.query(
      `
      DELETE FROM cg_provincias WHERE id = $1
      `
      , [id]);
    res.jsonp({ message: 'Registro eliminado.' });
  }

   // METODO PARA CREAR ARCHIVO XML
   public async FileXML(req: Request, res: Response): Promise<any> {
    var xml = builder.create('root').ele(req.body).end({ pretty: true });
    let filename = "Provincias-" + req.body.userName + '-' + req.body.userId + '-' + new Date().getTime() + '.xml';
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

  // METODO PARA REGISTRAR PROVINCIA
  public async CrearProvincia(req: Request, res: Response): Promise<void> {
    const { nombre, id_pais } = req.body;
    await pool.query(
      `
      INSERT INTO cg_provincias (nombre, id_pais) VALUES ($1, $2)
      `
      , [nombre, id_pais]);
    res.jsonp({ message: 'Registro guardado.' });
  }

  // METODO PARA BUSCAR INFORMACION DE UN PAIS
  public async ObtenerPais(req: Request, res: Response): Promise<any> {
    const { id } = req.params;
    const PAIS = await pool.query(
      `
      SELECT * FROM cg_paises WHERE id = $1
      `
      , [id]);
    if (PAIS.rowCount > 0) {
      return res.jsonp(PAIS.rows)
    }
    else {
      return res.status(404).jsonp({ text: 'Registros no encontrados.' });
    }
  }

  public async ObtenerProvincia(req: Request, res: Response): Promise<any> {
    const { id } = req.params;
    const UNA_PROVINCIA = await pool.query('SELECT * FROM cg_provincias WHERE id = $1', [id]);
    if (UNA_PROVINCIA.rowCount > 0) {
      return res.jsonp(UNA_PROVINCIA.rows)
    }
    else {
      return res.status(404).jsonp({ text: 'La provincia no ha sido encontrada' });
    }
  }

  public async ObtenerIdProvincia(req: Request, res: Response): Promise<any> {
    const { nombre } = req.params;
    const UNA_PROVINCIA = await pool.query('SELECT * FROM cg_provincias WHERE nombre = $1', [nombre]);
    if (UNA_PROVINCIA.rowCount > 0) {
      return res.jsonp(UNA_PROVINCIA.rows)
    }
    else {
      return res.status(404).jsonp({ text: 'La provincia no ha sido encontrada' });
    }
  }

  public async ListarTodoPais(req: Request, res: Response) {
    const PAIS = await pool.query('SELECT *FROM cg_paises');
    if (PAIS.rowCount > 0) {
      return res.jsonp(PAIS.rows)
    }
    else {
      return res.status(404).jsonp({ text: 'No se encuentran registros' });
    }
  }

}

export const PROVINCIA_CONTROLADOR = new ProvinciaControlador();

export default PROVINCIA_CONTROLADOR;