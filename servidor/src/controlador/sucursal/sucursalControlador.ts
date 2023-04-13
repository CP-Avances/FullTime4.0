import { Request, Response } from 'express';
import { QueryResult } from 'pg';
import pool from '../../database';
import fs from 'fs';
const builder = require('xmlbuilder');


class SucursalControlador {

  // BUSCAR SUCURSALES POR EL NOMBRE
  public async BuscarNombreSucursal(req: Request, res: Response) {
    const { nombre } = req.body;
    const SUCURSAL = await pool.query(
      `
      SELECT * FROM sucursales WHERE UPPER(nombre) = $1
      `
      , [nombre]);

    if (SUCURSAL.rowCount > 0) {
      return res.jsonp(SUCURSAL.rows)
    }
    else {
      return res.status(404).jsonp({ text: 'No se encuentran registros' });
    }
  }

  // GUARDAR REGISTRO DE SUCURSAL
  public async CrearSucursal(req: Request, res: Response): Promise<Response> {
    const { nombre, id_ciudad, id_empresa } = req.body;
    const response: QueryResult = await pool.query(
      `
      INSERT INTO sucursales (nombre, id_ciudad, id_empresa) VALUES ($1, $2, $3) RETURNING *
      `
      , [nombre, id_ciudad, id_empresa]);

    const [regimen] = response.rows;

    if (regimen) {
      return res.status(200).jsonp(regimen)
    }
    else {
      return res.status(404).jsonp({ message: 'mal_registro' })
    }
  }

  // ACTUALIZAR REGISTRO DE ESTABLECIMIENTO
  public async ActualizarSucursal(req: Request, res: Response): Promise<void> {
    const { nombre, id_ciudad, id } = req.body;
    await pool.query(
      `
      UPDATE sucursales SET nombre = $1, id_ciudad = $2 WHERE id = $3
      `
      , [nombre, id_ciudad, id]);

    res.jsonp({ message: 'Registro actualizado.' });
  }

  // BUSCAR SUCURSAL POR ID DE EMPRESA
  public async ObtenerSucursalEmpresa(req: Request, res: Response): Promise<any> {
    const { id_empresa } = req.params;
    const SUCURSAL = await pool.query(
      `
      SELECT * FROM sucursales WHERE id_empresa = $1
      `
      , [id_empresa]);
    if (SUCURSAL.rowCount > 0) {
      return res.jsonp(SUCURSAL.rows)
    }
    else {
      return res.status(404).jsonp({ text: 'No se encuentran registros.' });
    }
  }

  // METODO DE BUSQUEDA DE SUCURSALES
  public async ListarSucursales(req: Request, res: Response) {
    const SUCURSAL = await pool.query(
      `
      SELECT s.id, s.nombre, s.id_ciudad, c.descripcion, s.id_empresa, ce.nombre AS nomempresa
      FROM sucursales s, ciudades c, cg_empresa ce
      WHERE s.id_ciudad = c.id AND s.id_empresa = ce.id
      ORDER BY s.id
      `
    );
    if (SUCURSAL.rowCount > 0) {
      return res.jsonp(SUCURSAL.rows)
    }
    else {
      return res.status(404).jsonp({ text: 'No se encuentran registros.' });
    }
  }

  // METODO PARA ELIMINAR REGISTRO
  public async EliminarRegistros(req: Request, res: Response): Promise<void> {
    const id = req.params.id;
    await pool.query(
      `
      DELETE FROM sucursales WHERE id = $1
      `
      , [id]);
    res.jsonp({ message: 'Registro eliminado.' });
  }

  // METODO PARA CREAR ARCHIVO XML
  public async FileXML(req: Request, res: Response): Promise<any> {
    var xml = builder.create('root').ele(req.body).end({ pretty: true });
    let filename = "Sucursales-" + req.body.userName + '-' + req.body.userId + '-' + new Date().getTime() + '.xml';
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

  // METODO PARA BUSCAR DATOS DE UNA SUCURSAL
  public async ObtenerUnaSucursal(req: Request, res: Response): Promise<any> {
    const { id } = req.params;
    const SUCURSAL = await pool.query(
      `
      SELECT s.id, s.nombre, s.id_ciudad, c.descripcion, s.id_empresa, ce.nombre AS nomempresa
      FROM sucursales s, ciudades c, cg_empresa ce
      WHERE s.id_ciudad = c.id AND s.id_empresa = ce.id AND s.id = $1
      `
      , [id]);
    if (SUCURSAL.rowCount > 0) {
      return res.jsonp(SUCURSAL.rows)
    }
    else {
      return res.status(404).jsonp({ text: 'No se encuentran registros.' });
    }
  }

}

export const SUCURSAL_CONTROLADOR = new SucursalControlador();

export default SUCURSAL_CONTROLADOR;