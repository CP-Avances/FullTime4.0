import { Request, Response } from 'express';
import { QueryResult } from 'pg';
import pool from '../../../database';

class EmpleadoCargosControlador {

  // METODO BUSQUEDA DATOS DEL CARGO DE UN USUARIO
  public async ObtenerCargoID(req: Request, res: Response): Promise<any> {
    const { id } = req.params;
    const unEmplCargp = await pool.query(
      `
      SELECT ec.id, ec.id_empl_contrato, ec.cargo, ec.fec_inicio, ec.fec_final, ec.jefe, ec.sueldo, 
      ec.hora_trabaja, ec.id_sucursal, s.nombre AS sucursal, ec.id_departamento, 
      d.nombre AS departamento, e.id AS id_empresa, e.nombre AS empresa, tc.cargo AS nombre_cargo 
      FROM empl_cargos AS ec, sucursales AS s, cg_departamentos AS d, cg_empresa AS e, 
      tipo_cargo AS tc 
      WHERE ec.id = $1 AND ec.id_sucursal = s.id AND ec.id_departamento = d.id AND 
      s.id_empresa = e.id AND ec.cargo = tc.id 
      ORDER BY ec.id
      `
      , [id]);
    if (unEmplCargp.rowCount > 0) {
      return res.jsonp(unEmplCargp.rows)
    }
    else {
      return res.status(404).jsonp({ text: 'Cargo del empleado no encontrado' });
    }

  }

  // METODO DE REGISTRO DE CARGO
  public async Crear(req: Request, res: Response): Promise<void> {
    const { id_empl_contrato, id_departamento, fec_inicio, fec_final, id_sucursal, sueldo, hora_trabaja, cargo,
      jefe } = req.body;
    await pool.query(
      `
      INSERT INTO empl_cargos (id_empl_contrato, id_departamento, fec_inicio, fec_final, id_sucursal,
         sueldo, hora_trabaja, cargo, jefe) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `
      , [id_empl_contrato, id_departamento, fec_inicio, fec_final, id_sucursal, sueldo, hora_trabaja, cargo, jefe]);

    res.jsonp({ message: 'Registro guardado.' });
  }

  // METODO PARA ACTUALIZAR REGISTRO
  public async EditarCargo(req: Request, res: Response): Promise<any> {
    const { id_empl_contrato, id } = req.params;
    const { id_departamento, fec_inicio, fec_final, id_sucursal, sueldo, hora_trabaja, cargo, jefe } = req.body;

    await pool.query(
      `
      UPDATE empl_cargos SET id_departamento = $1, fec_inicio = $2, fec_final = $3, id_sucursal = $4, 
        sueldo = $5, hora_trabaja = $6, cargo = $7, jefe = $8  
      WHERE id_empl_contrato = $9 AND id = $10
      `
      , [id_departamento, fec_inicio, fec_final, id_sucursal, sueldo, hora_trabaja, cargo, jefe,
        id_empl_contrato, id]);
    res.jsonp({ message: 'Registro actualizado exitosamente.' });
  }

  // METODO PARA BUSCAR DATOS DE CARGO POR ID CONTRATO
  public async EncontrarCargoIDContrato(req: Request, res: Response): Promise<any> {
    const { id_empl_contrato } = req.params;
    const unEmplCargp = await pool.query(
      `
      SELECT ec.id, ec.cargo, ec.fec_inicio, ec.fec_final, ec.sueldo, ec.hora_trabaja, 
      s.nombre AS sucursal, d.nombre AS departamento 
      FROM empl_cargos AS ec, sucursales AS s, cg_departamentos AS d 
      WHERE ec.id_empl_contrato = $1 AND ec.id_sucursal = s.id AND ec.id_departamento = d.id
      `
      , [id_empl_contrato]);
    if (unEmplCargp.rowCount > 0) {
      return res.jsonp(unEmplCargp.rows)
    }
    else {
      return res.status(404).jsonp({ message: 'error' });
    }
  }











  public async list(req: Request, res: Response) {
    const Cargos = await pool.query('SELECT * FROM empl_cargos');
    if (Cargos.rowCount > 0) {
      return res.jsonp(Cargos.rows);
    }
    else {
      return res.status(404).jsonp({ text: 'Registro no encontrado' });
    }
  }

  public async ListarCargoEmpleado(req: Request, res: Response) {
    const empleadoCargos = await pool.query('SELECT cg.nombre AS departamento, s.nombre AS sucursal, ecr.id AS cargo, e.id AS empleado, e.nombre, e.apellido FROM depa_autorizaciones AS da, empl_cargos AS ecr, cg_departamentos AS cg, sucursales AS s, empl_contratos AS ecn, empleados AS e WHERE da.id_empl_cargo = ecr.id AND da.id_departamento = cg.id AND cg.id_sucursal = s.id AND ecr.id_empl_contrato = ecn.id AND ecn.id_empleado = e.id ORDER BY nombre ASC');
    if (empleadoCargos.rowCount > 0) {
      return res.jsonp(empleadoCargos.rows);
    }
    else {
      return res.status(404).jsonp({ text: 'Registro no encontrado' });
    }
  }

  public async ListarEmpleadoAutoriza(req: Request, res: Response) {
    const { id } = req.params;
    const empleadoCargos = await pool.query('SELECT * FROM Lista_empleados_autoriza WHERE id_notificacion = $1', [id]);
    if (empleadoCargos.rowCount > 0) {
      return res.jsonp(empleadoCargos.rows);
    }
    else {
      return res.status(404).jsonp({ text: 'Registro no encontrado' });
    }
  }





  public async EncontrarIdCargo(req: Request, res: Response): Promise<any> {
    const { id_empleado } = req.params;
    const CARGO = await pool.query(
      `
      SELECT ec.id 
      FROM empl_cargos AS ec, empl_contratos AS ce, empleados AS e 
      WHERE ce.id_empleado = e.id AND ec.id_empl_contrato = ce.id AND e.id = $1
      `
      , [id_empleado]);
    if (CARGO.rowCount > 0) {
      return res.jsonp(CARGO.rows)
    }
    else {
      return res.status(404).jsonp({ text: 'Registro no encontrado' });
    }
  }

  public async EncontrarIdCargoActual(req: Request, res: Response): Promise<any> {
    const { id_empleado } = req.params;
    const CARGO = await pool.query('SELECT ec.id AS max, ec.hora_trabaja ' +
      'FROM datos_actuales_empleado AS da, empl_cargos AS ec ' +
      'WHERE ec.id = da.id_cargo AND da.id = $1',
      [id_empleado]);
    if (CARGO.rowCount > 0 && CARGO.rows[0]['max'] != null) {
      return res.jsonp(CARGO.rows)
    }
    else {
      return res.status(404).jsonp({ text: 'Registro no encontrado' });
    }
  }








  public async BuscarUnTipo(req: Request, res: Response) {
    const id = req.params.id;
    const Cargos = await pool.query('SELECT *FROM tipo_cargo WHERE id = $1', [id]);
    if (Cargos.rowCount > 0) {
      return res.jsonp(Cargos.rows);
    }
    else {
      return res.status(404).jsonp({ text: 'Registro no encontrado' });
    }
  }

  public async BuscarTipoDepartamento(req: Request, res: Response) {
    const id = req.params.id;
    const Cargos = await pool.query('SELECT tc.id, tc.cargo FROM tipo_cargo AS tc, empl_cargos AS ec ' +
      'WHERE tc.id = ec.cargo AND id_departamento = $1 GROUP BY tc.cargo, tc.id', [id]);
    if (Cargos.rowCount > 0) {
      return res.jsonp(Cargos.rows);
    }
    else {
      return res.status(404).jsonp({ text: 'Registro no encontrado' });
    }
  }

  public async BuscarTipoSucursal(req: Request, res: Response) {
    const id = req.params.id;
    const Cargos = await pool.query('SELECT tc.id, tc.cargo FROM tipo_cargo AS tc, empl_cargos AS ec ' +
      'WHERE tc.id = ec.cargo AND id_sucursal = $1 GROUP BY tc.cargo, tc.id', [id]);
    if (Cargos.rowCount > 0) {
      return res.jsonp(Cargos.rows);
    }
    else {
      return res.status(404).jsonp({ text: 'Registro no encontrado' });
    }
  }

  public async BuscarTipoRegimen(req: Request, res: Response) {
    const id = req.params.id;
    const Cargos = await pool.query('SELECT tc.id, tc.cargo FROM cg_regimenes AS r, empl_cargos AS ec, ' +
      'empl_contratos AS c, tipo_cargo AS tc WHERE c.id_regimen = r.id AND c.id = ec.id_empl_contrato AND ' +
      'ec.cargo = tc.id AND r.id = $1 GROUP BY tc.id, tc.cargo', [id]);
    if (Cargos.rowCount > 0) {
      return res.jsonp(Cargos.rows);
    }
    else {
      return res.status(404).jsonp({ text: 'Registro no encontrado' });
    }
  }








  /** **************************************************************************************** **
   ** **                  METODOS DE CONSULTA DE TIPOS DE CARGOS                            ** ** 
   ** **************************************************************************************** **/

  // METODO DE BUSQUEDA DE TIPO DE CARGOS
  public async ListarTiposCargo(req: Request, res: Response) {
    const Cargos = await pool.query(
      `
      SELECT * FROM tipo_cargo
      `
    );
    if (Cargos.rowCount > 0) {
      return res.jsonp(Cargos.rows);
    }
    else {
      return res.status(404).jsonp({ text: 'Registro no encontrado.' });
    }
  }

  // METODO DE REGISTRO DE TIPO DE CARGO
  public async CrearTipoCargo(req: Request, res: Response): Promise<Response> {
    const { cargo } = req.body;
    const response: QueryResult = await pool.query(
      `
      INSERT INTO tipo_cargo (cargo) VALUES ($1) RETURNING *
      `
      , [cargo]);

    const [tipo_cargo] = response.rows;

    if (tipo_cargo) {
      return res.status(200).jsonp(tipo_cargo)
    }
    else {
      return res.status(404).jsonp({ message: 'error' })
    }
  }

}

export const EMPLEADO_CARGO_CONTROLADOR = new EmpleadoCargosControlador();

export default EMPLEADO_CARGO_CONTROLADOR;