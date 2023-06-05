// IMPORTAR LIBRERIAS
import { Request, Response } from 'express';
const builder = require('xmlbuilder');
import pool from '../../database';
import fs from 'fs';

class RolesControlador {

  // METODO PARA LISTAR ROLES DEL SISTEMA
  public async ListarRoles(req: Request, res: Response) {
    const ROL = await pool.query(
      `
      SELECT id, nombre FROM cg_roles ORDER BY nombre ASC
      `
    );
    if (ROL.rowCount > 0) {
      return res.jsonp(ROL.rows)
    } else {
      res.status(404).jsonp({ text: 'Registro no encontrado.' });
    }
  }

  // METODO PARA ELIMINAR REGISTRO
  public async EliminarRol(req: Request, res: Response): Promise<void> {
    const id = req.params.id;
    await pool.query(
      `
      DELETE FROM cg_roles WHERE id = $1
      `
      , [id]);
    res.jsonp({ message: 'Registro eliminado.' });
  }

  // METODO PARA CREAR ARCHIVO XML
  public async FileXML(req: Request, res: Response): Promise<any> {
    var xml = builder.create('root').ele(req.body).end({ pretty: true });
    console.log(req.body.userName);
    let filename = "Roles-" + req.body.userName + '-' + req.body.userId + '-' + new Date().getTime() + '.xml';
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

  // METODO PARA REGISTRAR ROL
  public async CrearRol(req: Request, res: Response): Promise<void> {
    const { nombre } = req.body;
    await pool.query(
      `
       INSERT INTO cg_roles (nombre) VALUES ($1)
       `
      , [nombre]);
    res.jsonp({ message: 'Registro guardado.' });

  }














  public async ListarRolesActualiza(req: Request, res: Response) {
    const id = req.params.id;
    const ROL = await pool.query('SELECT * FROM cg_roles WHERE NOT id = $1', [id]);
    if (ROL.rowCount > 0) {
      return res.jsonp(ROL.rows)
    }
    else {
      return res.status(404).jsonp({ text: 'No se encuentran registros.' });
    }
  }

  public async ObtnenerUnRol(req: Request, res: Response): Promise<any> {
    const { id } = req.params;
    const ROL = await pool.query('SELECT * FROM cg_roles WHERE id = $1', [id]);
    if (ROL.rowCount > 0) {
      return res.jsonp(ROL.rows)
    } else {
      res.status(404).jsonp({ text: 'Registro no encontrado.' });
    }
  }


  public async ActualizarRol(req: Request, res: Response): Promise<void> {
    const { nombre, id } = req.body;
    await pool.query('UPDATE cg_roles SET nombre = $1 WHERE id = $2', [nombre, id]);
    res.jsonp({ message: 'Registro Actualizado' });
  }




}

const ROLES_CONTROLADOR = new RolesControlador();

export default ROLES_CONTROLADOR;
