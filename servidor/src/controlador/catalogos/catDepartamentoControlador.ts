import { Request, Response } from 'express';
import fs from 'fs';
const builder = require('xmlbuilder');

import pool from '../../database';

class DepartamentoControlador {

  // REGISTRAR DEPARTAMENTO
  public async CrearDepartamento(req: Request, res: Response) {
    try {
      const { nombre, depa_padre, nivel, id_sucursal } = req.body;
      await pool.query(
        `
        INSERT INTO cg_departamentos (nombre, depa_padre, nivel, id_sucursal ) VALUES ($1, $2, $3, $4)
        `
        , [nombre, depa_padre, nivel, id_sucursal]);

      res.jsonp({ message: 'Registro guardado.' });
    }
    catch (error) {
      return res.jsonp({ message: 'error' });
    }
  }

  // METODO PARA BUSCAR LISTA DE DEPARTAMENTOS POR ID SUCURSAL
  public async ObtenerDepartamento(req: Request, res: Response): Promise<any> {
    const { id } = req.params;
    const DEPARTAMENTO = await pool.query(
      `
      SELECT * FROM cg_departamentos WHERE id = $1
      `
      , [id]);
    if (DEPARTAMENTO.rowCount > 0) {
      return res.jsonp(DEPARTAMENTO.rows)
    }
    res.status(404).jsonp({ text: 'El departamento no ha sido encontrado' });
  }


  // METODO PARA BUSCAR LISTA DE DEPARTAMENTOS POR ID SUCURSAL
  public async ObtenerDepartamentosSucursal(req: Request, res: Response): Promise<any> {
    const { id_sucursal } = req.params;
    const DEPARTAMENTO = await pool.query(
      `
      SELECT * FROM cg_departamentos WHERE id_sucursal = $1
      `
      , [id_sucursal]);
    if (DEPARTAMENTO.rowCount > 0) {
      return res.jsonp(DEPARTAMENTO.rows)
    }
    res.status(404).jsonp({ text: 'El departamento no ha sido encontrado' });
  }

  // METODO PARA BUSCAR LISTA DE DEPARTAMENTOS POR ID SUCURSAL Y EXCLUIR DEPARTAMENTO ACTUALIZADO
  public async ObtenerDepartamentosSucursal_(req: Request, res: Response): Promise<any> {
    const { id_sucursal, id } = req.params;
    const DEPARTAMENTO = await pool.query(
      `
        SELECT * FROM cg_departamentos WHERE id_sucursal = $1 AND NOT id = $2
        `
      , [id_sucursal, id]);
    if (DEPARTAMENTO.rowCount > 0) {
      return res.jsonp(DEPARTAMENTO.rows)
    }
    res.status(404).jsonp({ text: 'El departamento no ha sido encontrado' });
  }

  // ACTUALIZAR REGISTRO DE DEPARTAMENTO
  public async ActualizarDepartamento(req: Request, res: Response) {
    try {
      const { nombre, depa_padre, nivel, id_sucursal } = req.body;
      const id = req.params.id;
      console.log(id);
      await pool.query(
        `
        UPDATE cg_departamentos set nombre = $1, depa_padre = $2, nivel = $3 , id_sucursal = $4 
        WHERE id = $5
        `
        , [nombre, depa_padre, nivel, id_sucursal, id]);
      res.jsonp({ message: 'Registro actualizado.' });
    }
    catch (error) {
      return res.jsonp({ message: 'error' });
    }
  }

  // METODO DE BUSQUEDA DE DEPARTAMENTOS
  public async ListarDepartamentos(req: Request, res: Response) {

    const CON_DEPA_PADRE = await pool.query(
      `
      SELECT d.id, d.nombre, d.nivel, nom_d.nombre AS departamento_padre, d.id_sucursal, 
        s.nombre AS nomsucursal, e.id AS id_empresa, e.nombre AS nomempresa 
      FROM cg_departamentos AS d, nombredepartamento AS nom_d, sucursales AS s, cg_empresa AS e 
      WHERE d.depa_padre = nom_d.id AND d.id_sucursal = s.id AND e.id = s.id_empresa 
      ORDER BY nombre ASC
      `
    );

    const SIN_DEPA_PADRE = await pool.query(
      `
      SELECT d.id, d.nombre, d.nivel, d.depa_padre AS departamento_padre, d.id_sucursal, 
        s.nombre AS nomsucursal, e.id AS id_empresa, e.nombre AS nomempresa 
      FROM cg_departamentos AS d, sucursales AS s, cg_empresa AS e 
      WHERE d.id_sucursal = s.id AND e.id = s.id_empresa AND d.depa_padre IS NULL 
      ORDER BY nombre ASC
      `
    );

    if (SIN_DEPA_PADRE.rowCount > 0 && CON_DEPA_PADRE.rowCount > 0) {
      SIN_DEPA_PADRE.rows.forEach((obj: any) => {
        CON_DEPA_PADRE.rows.push(obj);
      });
      return res.jsonp(CON_DEPA_PADRE.rows);
    }

    else if (SIN_DEPA_PADRE.rowCount > 0) {
      return res.jsonp(SIN_DEPA_PADRE.rows);
    }

    else if (CON_DEPA_PADRE.rowCount > 0) {
      return res.jsonp(CON_DEPA_PADRE.rows);
    }

    else {
      return res.status(404).jsonp({ text: 'No se encuentran registros.' });
    }

  }

  // METODO PARA LISTAR INFORMACION DE DEPARTAMENTOS POR ID DE SUCURSAL
  public async ListarDepartamentosSucursal(req: Request, res: Response) {

    const id = req.params.id_sucursal;

    const CON_DEPA_PADRE = await pool.query(
      `
      SELECT d.id, d.nombre, d.nivel, nom_d.nombre AS departamento_padre, d.id_sucursal, 
        s.nombre AS nomsucursal, e.id AS id_empresa, e.nombre AS nomempresa 
      FROM cg_departamentos AS d, nombredepartamento AS nom_d, sucursales AS s, cg_empresa AS e 
      WHERE d.depa_padre = nom_d.id AND d.id_sucursal = s.id AND e.id = s.id_empresa AND id_sucursal = $1
      ORDER BY nombre ASC
      `
      , [id]
    );

    const SIN_DEPA_PADRE = await pool.query(
      `
      SELECT d.id, d.nombre, d.nivel, d.depa_padre AS departamento_padre, d.id_sucursal, 
        s.nombre AS nomsucursal, e.id AS id_empresa, e.nombre AS nomempresa 
      FROM cg_departamentos AS d, sucursales AS s, cg_empresa AS e 
      WHERE d.id_sucursal = s.id AND e.id = s.id_empresa AND d.depa_padre IS NULL AND id_sucursal = $1
      ORDER BY nombre ASC
      `
      , [id]
    );

    if (SIN_DEPA_PADRE.rowCount > 0 && CON_DEPA_PADRE.rowCount > 0) {
      SIN_DEPA_PADRE.rows.forEach((obj: any) => {
        CON_DEPA_PADRE.rows.push(obj);
      });
      return res.jsonp(CON_DEPA_PADRE.rows);
    }

    else if (SIN_DEPA_PADRE.rowCount > 0) {
      return res.jsonp(SIN_DEPA_PADRE.rows);
    }

    else if (CON_DEPA_PADRE.rowCount > 0) {
      return res.jsonp(CON_DEPA_PADRE.rows);
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
      DELETE FROM cg_departamentos WHERE id = $1
      `
      , [id]);
    res.jsonp({ message: 'Registro eliminado.' });
  }

  // METODO PARA CREAR ARCHIVO XML
  public async FileXML(req: Request, res: Response): Promise<any> {
    var xml = builder.create('root').ele(req.body).end({ pretty: true });
    let filename = "Departamentos-" + req.body.userName + '-' + req.body.userId + '-' + new Date().getTime() + '.xml';
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

  //METODO PARA CREAR NIVELES JERARQUICOS POR DEPARTAMENTOS
  public async crearNivelDepa(req: Request, res: Response): Promise<any>{
    try {
      const { id_departamento, departamento, nivel, dep_nivel, dep_nivel_nombre, id_establecimiento } = req.body;
      await pool.query(
        `
        INSERT INTO nivel_jerarquicodep (departamento, id_departamento, nivel, dep_nivel_nombre, id_dep_nivel, id_establecimiento ) VALUES ($1, $2, $3, $4, $5, $6)
        `
        , [departamento, id_departamento, nivel, dep_nivel_nombre, dep_nivel, id_establecimiento]);

      res.jsonp({ message: 'Registro guardado.' });
    }
    catch (error) {
      return res.jsonp({ message: 'error' });
    }
  }


  //METODO PARA BUSCAR NIVELES JERARQUICOS POR DEPARTAMENTO
  public async ObtenerNivelesDepa(req: Request, res: Response): Promise<any>{
    const { id_departamento, id_establecimiento } = req.params;
    const NIVELESDEP = await pool.query(
    `
    SELECT * FROM nivel_jerarquicodep WHERE id_departamento = $1 AND id_establecimiento = $2 ORDER BY nivel DESC 
    `
    , [id_departamento, id_establecimiento]);
      if (NIVELESDEP.rowCount > 0) {
      return res.jsonp(NIVELESDEP.rows)
    }
    res.status(404).jsonp({ text: 'El departamento no ha sido encontrado' });
  }

  // ACTUALIZAR REGISTRO DE NIVEL DE DEPARTAMENTO DE TABLA NIVEL_JERARQUICO
  public async ActualizarNivelDepa(req: Request, res: Response) {
    try {
      console.log('nivel: ',req);
      const {nivel} = req.body;
      const id = req.params.id;

      console.log('nivel: ',nivel);
      console.log('id: ',id);
      await pool.query(
        `
        UPDATE nivel_jerarquicodep set nivel = $1 
        WHERE id = $2
        `
        , [nivel, id]);
      res.jsonp({ message: 'Registro actualizado.' });
    }
    catch (error) {
      return res.jsonp({ message: 'error' });
    }
  }

  // ACTUALIZAR REGISTRO  DE NIVEL DE DEPARTAMENTO
  public async ActualizarNivelDepartamento(req: Request, res: Response) {
    try {
      const { depa_padre, nivel} = req.body;
      const id = req.params.id;
      await pool.query(
        `
        UPDATE cg_departamentos set depa_padre = $1, nivel = $2 
        WHERE id = $3
        `
        , [depa_padre, nivel, id]);
      res.jsonp({ message: 'Registro actualizado.' });
    }
    catch (error) {
      return res.jsonp({ message: 'error' });
    }
  }

  // METODO PARA ELIMINAR REGISTRO DE NIVEL DE DEPARTAMENTO
  public async EliminarRegistroNivelDepa(req: Request, res: Response): Promise<void> {
    const id = req.params.id;
    console.log('datos eliminar: ',id);
    await pool.query(
      `
      DELETE FROM nivel_jerarquicodep WHERE id = $1
      `
      , [id]);
    res.jsonp({ message: 'Registro eliminado.' });
  }










  public async ListarNombreDepartamentos(req: Request, res: Response) {
    const DEPARTAMENTOS = await pool.query('SELECT * FROM cg_departamentos');
    if (DEPARTAMENTOS.rowCount > 0) {
      return res.jsonp(DEPARTAMENTOS.rows)
    }
    else {
      return res.status(404).jsonp({ text: 'No se encuentran registros' });
    }
  }

  public async ListarIdDepartamentoNombre(req: Request, res: Response): Promise<any> {
    const { nombre } = req.params;
    const DEPARTAMENTOS = await pool.query('SELECT * FROM cg_departamentos WHERE nombre = $1', [nombre]);
    if (DEPARTAMENTOS.rowCount > 0) {
      return res.jsonp(DEPARTAMENTOS.rows)
    }
    else {
      return res.status(404).jsonp({ text: 'No se encuentran registros' });
    }
  }

  public async ObtenerIdDepartamento(req: Request, res: Response): Promise<any> {
    const { nombre } = req.params;
    const DEPARTAMENTO = await pool.query('SELECT id FROM cg_departamentos WHERE nombre = $1', [nombre]);
    if (DEPARTAMENTO.rowCount > 0) {
      return res.jsonp(DEPARTAMENTO.rows);
    }
    res.status(404).jsonp({ text: 'El departamento no ha sido encontrado' });
  }

  public async ObtenerUnDepartamento(req: Request, res: Response): Promise<any> {
    const { id } = req.params;
    const DEPARTAMENTO = await pool.query('SELECT * FROM cg_departamentos WHERE id = $1', [id]);
    if (DEPARTAMENTO.rowCount > 0) {
      return res.jsonp(DEPARTAMENTO.rows[0])
    }
    res.status(404).jsonp({ text: 'El departamento no ha sido encontrado' });
  }








  public async BuscarDepartamentoPorCargo(req: Request, res: Response) {
    const id = req.params.id_cargo
    const departamento = await pool.query('SELECT ec.id_departamento, d.nombre, ec.id AS cargo ' +
      'FROM empl_cargos AS ec, cg_departamentos AS d WHERE d.id = ec.id_departamento AND ec.id = $1 ' +
      'ORDER BY cargo DESC', [id]);
    if (departamento.rowCount > 0) {
      return res.json([departamento.rows[0]]);
    } else {
      return res.status(404).json({ text: 'No se encuentran registros' });
    }
  }





  public async ListarDepartamentosRegimen(req: Request, res: Response) {
    const id = req.params.id;
    const DEPARTAMENTOS = await pool.query('SELECT d.id, d.nombre FROM cg_regimenes AS r, empl_cargos AS ec, ' +
      'empl_contratos AS c, cg_departamentos AS d WHERE c.id_regimen = r.id AND c.id = ec.id_empl_contrato AND ' +
      'ec.id_departamento = d.id AND r.id = $1 GROUP BY d.id, d.nombre', [id]);
    if (DEPARTAMENTOS.rowCount > 0) {
      res.jsonp(DEPARTAMENTOS.rows);
    }
    else {
      return res.status(404).jsonp({ text: 'No se encuentran registros' });
    }
  }

}

export const DEPARTAMENTO_CONTROLADOR = new DepartamentoControlador();

export default DEPARTAMENTO_CONTROLADOR;