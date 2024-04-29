import AUDITORIA_CONTROLADOR from '../auditoria/auditoriaControlador';
import { Request, Response } from 'express';


import pool from '../../database';

class DepartamentoControlador {

  // REGISTRAR DEPARTAMENTO
  public async CrearDepartamento(req: Request, res: Response): Promise<Response> {
    try {
      const { nombre, id_sucursal, user_name, ip } = req.body;

      // INICIAR TRANSACCIÓN
      await pool.query('BEGIN');

      await pool.query(
        `
        INSERT INTO cg_departamentos (nombre, id_sucursal ) VALUES ($1, $2)
        `
        , [nombre, id_sucursal]);
      
      // INSERTAR AUDITORIA
      await AUDITORIA_CONTROLADOR.InsertarAuditoria({
        tabla: 'cg_departamentos',
        usuario: user_name,
        accion: 'I',
        datosOriginales: '',
        datosNuevos: `{Nombre: ${nombre}, Sucursal: ${id_sucursal}}`,
        ip: ip,
        observacion: null
      });

      // FINALIZAR TRANSACCIÓN
      await pool.query('COMMIT');

      return res.jsonp({ message: 'Registro guardado.' });
    }
    catch (error) {
      // REVERTIR TRANSACCION
      await pool.query('ROLLBACK');
      return res.status(500).jsonp({ message: 'error' });
    }
  }


  // ACTUALIZAR REGISTRO DE DEPARTAMENTO   --**VERIFICADO
  public async ActualizarDepartamento(req: Request, res: Response) {
    try {
      const { nombre, id_sucursal, user_name, ip } = req.body;
      const id = req.params.id;
      
      // INICIAR TRANSACCIÓN
      await pool.query('BEGIN');

      // OBTENER DATOS ANTES DE ACTUALIZAR
      const response = await pool.query('SELECT * FROM cg_departamentos WHERE id = $1', [id]);
      const datos = response.rows[0];

      if (!datos) {
        await AUDITORIA_CONTROLADOR.InsertarAuditoria({
          tabla: 'cg_departamentos',
          usuario: user_name,
          accion: 'U',
          datosOriginales: '',
          datosNuevos: '',
          ip: ip,
          observacion: `Error al actualizar el departamento con ID: ${id}`,
        });

        // FINALIZAR TRANSACCIÓN
        await pool.query('COMMIT');
        return res.status(404).jsonp({ message: 'error' });
      }
      
      await pool.query(
        `
        UPDATE cg_departamentos set nombre = $1, id_sucursal = $2 
        WHERE id = $3
        `
        , [nombre, id_sucursal, id]);
      
      // INSERTAR AUDITORIA
      await AUDITORIA_CONTROLADOR.InsertarAuditoria({
        tabla: 'cg_departamentos',
        usuario: user_name,
        accion: 'U',
        datosOriginales: JSON.stringify(datos),
        datosNuevos: `{Nombre: ${nombre}, Sucursal: ${id_sucursal}}`,
        ip: ip,
        observacion: null
      });

      // FINALIZAR TRANSACCIÓN
      await pool.query('COMMIT');
      return res.jsonp({ message: 'Registro actualizado.' });
    }
    catch (error) {
      // REVERTIR TRANSACCIÓN
      await pool.query('ROLLBACK');
      return res.status(500).jsonp({ message: 'error' });
    }
  }


  // METODO PARA BUSCAR LISTA DE DEPARTAMENTOS POR ID SUCURSAL
  public async ObtenerDepartamento(req: Request, res: Response): Promise<any> {
    const { id } = req.params;
    const DEPARTAMENTO = await pool.query(
      `
      SELECT d.*, s.nombre AS sucursal
      FROM cg_departamentos AS d, sucursales AS s 
      WHERE d.id = $1 AND s.id = d.id_sucursal
      `
      , [id]);
    if (DEPARTAMENTO.rowCount > 0) {
      return res.jsonp(DEPARTAMENTO.rows)
    }
    res.status(404).jsonp({ text: 'El departamento no ha sido encontrado.' });
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



  // METODO DE BUSQUEDA DE DEPARTAMENTOS   --**VERIFICAR
  public async ListarDepartamentos(req: Request, res: Response) {

    const NIVELES = await pool.query(
      `
      SELECT s.id AS id_sucursal, s.nombre AS nomsucursal, n.id_departamento AS id, 
        n.departamento AS nombre, n.nivel, n.dep_nivel_nombre AS departamento_padre
      FROM nivel_jerarquicodep AS n, sucursales AS s
      WHERE n.id_establecimiento = s.id AND 
        n.nivel = (SELECT MAX(nivel) FROM nivel_jerarquicodep WHERE id_departamento = n.id_departamento)
      ORDER BY s.nombre, n.departamento ASC
      `
    );

    const DEPARTAMENTOS = await pool.query(
      `
      SELECT s.id AS id_sucursal, s.nombre AS nomsucursal, cd.id, cd.nombre,
      0 AS NIVEL, null AS departamento_padre
      FROM cg_departamentos AS cd, sucursales AS s
      WHERE NOT cd.id IN (SELECT id_departamento FROM nivel_jerarquicodep) AND
      s.id = cd.id_sucursal
      ORDER BY s.nombre, cd.nombre ASC;
      `
    );

    if (DEPARTAMENTOS.rowCount > 0 && NIVELES.rowCount > 0) {
      NIVELES.rows.forEach((obj: any) => {
        DEPARTAMENTOS.rows.push(obj);
      });
      return res.jsonp(DEPARTAMENTOS.rows);
    }

    else if (DEPARTAMENTOS.rowCount > 0) {
      return res.jsonp(DEPARTAMENTOS.rows);
    }

    else if (NIVELES.rowCount > 0) {
      return res.jsonp(NIVELES.rows);
    }

    else {
      return res.status(404).jsonp({ text: 'No se encuentran registros.' });
    }

  }

  // METODO PARA LISTAR INFORMACION DE DEPARTAMENTOS POR ID DE SUCURSAL   --**VERIFICADO
  public async ListarDepartamentosSucursal(req: Request, res: Response) {

    const id = req.params.id_sucursal;

    const NIVEL = await pool.query(
      `
      SELECT s.id AS id_sucursal, s.nombre AS nomsucursal, n.id_departamento AS id, 
        n.departamento AS nombre, n.nivel, n.dep_nivel_nombre AS departamento_padre
      FROM nivel_jerarquicodep AS n, sucursales AS s
      WHERE n.id_establecimiento = s.id AND 
        n.nivel = (SELECT MAX(nivel) FROM nivel_jerarquicodep WHERE id_departamento = n.id_departamento)
        AND s.id = $1
      ORDER BY s.nombre, n.departamento ASC
      `
      , [id]
    );

    const DEPARTAMENTO = await pool.query(
      `
      SELECT s.id AS id_sucursal, s.nombre AS nomsucursal, cd.id, cd.nombre,
        0 AS NIVEL, null AS departamento_padre
      FROM cg_departamentos AS cd, sucursales AS s
      WHERE NOT cd.id IN (SELECT id_departamento FROM nivel_jerarquicodep) AND
        s.id = cd.id_sucursal AND s.id = $1
      ORDER BY s.nombre, cd.nombre ASC
      `
      , [id]
    );

    if (DEPARTAMENTO.rowCount > 0 && NIVEL.rowCount > 0) {
      DEPARTAMENTO.rows.forEach((obj: any) => {
        NIVEL.rows.push(obj);
      });
      return res.jsonp(NIVEL.rows);
    }

    else if (DEPARTAMENTO.rowCount > 0) {
      return res.jsonp(DEPARTAMENTO.rows);
    }

    else if (NIVEL.rowCount > 0) {
      return res.jsonp(NIVEL.rows);
    }

    else {
      return res.status(404).jsonp({ text: 'No se encuentran registros.' });
    }

  }

  // METODO PARA ELIMINAR REGISTRO
  public async EliminarRegistros(req: Request, res: Response): Promise<Response> {
    try {
      const id = req.params.id;
      const { user_name, ip } = req.body;

      // INICIAR TRANSACCIÓN
      await pool.query('BEGIN');

      // OBTENER DATOS ANTES DE ELIMINAR
      const response = await pool.query('SELECT * FROM cg_departamentos WHERE id = $1', [id]);
      const datos = response.rows[0];

      if (!datos) {
        await AUDITORIA_CONTROLADOR.InsertarAuditoria({
          tabla: 'cg_departamentos',
          usuario: user_name,
          accion: 'D',
          datosOriginales: '',
          datosNuevos: '',
          ip: ip,
          observacion: `Error al eliminar el departamento con ID: ${id}`,
        });

        // FINALIZAR TRANSACCIÓN
        await pool.query('COMMIT');
        return res.status(404).jsonp({ message: 'error' });
      }

      await pool.query(
        `
        DELETE FROM cg_departamentos WHERE id = $1
        `
        , [id]);
      
      // INSERTAR AUDITORIA
      await AUDITORIA_CONTROLADOR.InsertarAuditoria({
        tabla: 'cg_departamentos',
        usuario: user_name,
        accion: 'D',
        datosOriginales: JSON.stringify(datos),
        datosNuevos: '',
        ip: ip,
        observacion: null
      });

      // FINALIZAR TRANSACCIÓN
      await pool.query('COMMIT');
      return res.jsonp({ message: 'Registro eliminado.' });
    } catch (error) {
      // REVERTIR TRANSACCIÓN
      await pool.query('ROLLBACK');
      return res.status(500).jsonp({ message: 'error' });
    }
  }

  //METODO PARA CREAR NIVELES JERARQUICOS POR DEPARTAMENTOS  --**VERIFICADO
  public async CrearNivelDepa(req: Request, res: Response): Promise<any> {
    try {
      const { id_departamento, departamento, nivel, dep_nivel, dep_nivel_nombre, id_establecimiento,
        id_suc_dep_nivel, user_name, ip } = req.body;

      // INICIAR TRANSACCIÓN
      await pool.query('BEGIN');

      await pool.query(
        `
        INSERT INTO nivel_jerarquicodep (departamento, id_departamento, nivel, dep_nivel_nombre, id_dep_nivel, 
          id_establecimiento, id_suc_dep_nivel ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        `
        , [departamento, id_departamento, nivel, dep_nivel_nombre, dep_nivel, id_establecimiento, id_suc_dep_nivel]);

      // INSERTAR AUDITORIA
      await AUDITORIA_CONTROLADOR.InsertarAuditoria({
        tabla: 'nivel_jerarquicodep',
        usuario: user_name,
        accion: 'I',
        datosOriginales: '',
        datosNuevos: `{Departamento: ${departamento}, Nivel: ${nivel}, Departamento Nivel: ${dep_nivel_nombre}}`,
        ip: ip,
        observacion: null
      });

      // FINALIZAR TRANSACCIÓN
      await pool.query('COMMIT');

      return res.jsonp({ message: 'Registro guardado.' });

    }
    catch (error) {
      // REVERTIR TRANSACCIÓN
      await pool.query('ROLLBACK');
      return res.status(500).jsonp({ message: 'error' });
    }
  }


  //METODO PARA BUSCAR NIVELES JERARQUICOS POR DEPARTAMENTO   --**VERIFICADO
  public async ObtenerNivelesDepa(req: Request, res: Response): Promise<any> {
    const { id_departamento, id_establecimiento } = req.params;
    const NIVELESDEP = await pool.query(
      `
      SELECT n.*, s.nombre AS suc_nivel
      FROM nivel_jerarquicodep AS n, sucursales AS s
      WHERE id_departamento = $1 AND id_establecimiento = $2 
        AND s.id = n.id_suc_dep_nivel
      ORDER BY nivel DESC 
      `
      , [id_departamento, id_establecimiento]);
    if (NIVELESDEP.rowCount > 0) {
      return res.jsonp(NIVELESDEP.rows)
    }
    res.status(404).jsonp({ text: 'Registros no encontrados.' });
  }

  // ACTUALIZAR REGISTRO DE NIVEL DE DEPARTAMENTO DE TABLA NIVEL_JERARQUICO   --**VERIFICADO
  public async ActualizarNivelDepa(req: Request, res: Response) {
    try {
      const { nivel, user_name, ip } = req.body;
      const id = req.params.id;

      // INICIAR TRANSACCIÓN
      await pool.query('BEGIN');

      // OBTENER DATOS ANTES DE ACTUALIZAR
      const response = await pool.query('SELECT * FROM nivel_jerarquicodep WHERE id = $1', [id]);
      const datos = response.rows[0];

      if (!datos) {
        await AUDITORIA_CONTROLADOR.InsertarAuditoria({
          tabla: 'nivel_jerarquicodep',
          usuario: user_name,
          accion: 'U',
          datosOriginales: '',
          datosNuevos: '',
          ip: ip,
          observacion: `Error al actualizar el nivel de departamento con ID: ${id}`,
        });

        // FINALIZAR TRANSACCIÓN
        await pool.query('COMMIT');
        return res.status(404).jsonp({ message: 'error' });
      }

      await pool.query(
        `
        UPDATE nivel_jerarquicodep set nivel = $1 
        WHERE id = $2
        `
        , [nivel, id]);
      
      // INSERTAR AUDITORIA
      await AUDITORIA_CONTROLADOR.InsertarAuditoria({
        tabla: 'nivel_jerarquicodep',
        usuario: user_name,
        accion: 'U',
        datosOriginales: JSON.stringify(datos),
        datosNuevos: `{Nivel: ${nivel}}`,
        ip: ip,
        observacion: null
      });

      // FINALIZAR TRANSACCIÓN
      await pool.query('COMMIT');
      return res.jsonp({ message: 'Registro actualizado.' });
    }
    catch (error) {
      // REVERTIR TRANSACCIÓN
      await pool.query('ROLLBACK');
      return res.status(500).jsonp({ message: 'error' });
    }
  }

  // METODO PARA ELIMINAR REGISTRO DE NIVEL DE DEPARTAMENTO   --**VERIFICADO
  public async EliminarRegistroNivelDepa(req: Request, res: Response): Promise<Response> {
    try {
      const id = req.params.id;
      const { user_name, ip } = req.body;

      // INICIAR TRANSACCIÓN
      await pool.query('BEGIN');

      // OBTENER DATOS ANTES DE ELIMINAR
      const response = await pool.query('SELECT * FROM nivel_jerarquicodep WHERE id = $1', [id]);
      const datos = response.rows[0];

      if (!datos) {
        await AUDITORIA_CONTROLADOR.InsertarAuditoria({
          tabla: 'nivel_jerarquicodep',
          usuario: user_name,
          accion: 'D',
          datosOriginales: '',
          datosNuevos: '',
          ip: ip,
          observacion: `Error al eliminar el nivel de departamento con ID: ${id}`,
        });

        // FINALIZAR TRANSACCIÓN
        await pool.query('COMMIT');
        return res.status(404).jsonp({ message: 'error' });
      }

      await pool.query(
        `
        DELETE FROM nivel_jerarquicodep WHERE id = $1
        `
        , [id]);

      // INSERTAR AUDITORIA
      await AUDITORIA_CONTROLADOR.InsertarAuditoria({
        tabla: 'nivel_jerarquicodep',
        usuario: user_name,
        accion: 'D',
        datosOriginales: JSON.stringify(datos),
        datosNuevos: '',
        ip: ip,
        observacion: null
      });

      // FINALIZAR TRANSACCIÓN
      await pool.query('COMMIT');
      return res.jsonp({ message: 'Registro eliminado.' });
    } catch (error) {
      // REVERTIR TRANSACCIÓN
      await pool.query('ROLLBACK');
      return res.status(500).jsonp({ message: 'error' });
    }
  }

  //METODO PARA CREAR NIVELES JERARQUICOS POR DEPARTAMENTOS  --**VERIFICADO
  public async ActualizarNombreNivel(req: Request, res: Response): Promise<any> {
    try {
      const { id_departamento, departamento, user_name, ip } = req.body;

      // INICIAR TRANSACCIÓN
      await pool.query('BEGIN');

      // OBTENER DATOS ANTES DE ACTUALIZAR
      const response = await pool.query('SELECT * FROM nivel_jerarquicodep WHERE id_departamento = $1', [id_departamento]);
      const [datos] = response.rows;

      if (!datos) {
        await AUDITORIA_CONTROLADOR.InsertarAuditoria({
          tabla: 'nivel_jerarquicodep',
          usuario: user_name,
          accion: 'U',
          datosOriginales: '',
          datosNuevos: '',
          ip: ip,
          observacion: `Error al actualizar el nivel de departamento con ID: ${id_departamento}`,
        });

        // FINALIZAR TRANSACCIÓN
        await pool.query('COMMIT');
        return res.status(404).jsonp({ message: 'error' });
      }

      await pool.query(
        `
        UPDATE nivel_jerarquicodep SET departamento = $1
        WHERE id_departamento = $2
        `
        , [departamento, id_departamento]);
      
      // INSERTAR AUDITORIA
      await AUDITORIA_CONTROLADOR.InsertarAuditoria({
        tabla: 'nivel_jerarquicodep',
        usuario: user_name,
        accion: 'U',
        datosOriginales: JSON.stringify(datos),
        datosNuevos: `{Departamento: ${departamento}}`,
        ip: ip,
        observacion: null
      });

      await pool.query(
        `
        UPDATE nivel_jerarquicodep SET dep_nivel_nombre = $1
        WHERE id_dep_nivel = $2
        `
        , [departamento, id_departamento]);

      // INSERTAR AUDITORIA
      await AUDITORIA_CONTROLADOR.InsertarAuditoria({
        tabla: 'nivel_jerarquicodep',
        usuario: user_name,
        accion: 'U',
        datosOriginales: JSON.stringify(datos),
        datosNuevos: `{Departamento: ${departamento}}`,
        ip: ip,
        observacion: null
      });

      // FINALIZAR TRANSACCIÓN
      await pool.query('COMMIT');
      return res.jsonp({ message: 'Registro guardado.' });

    }
    catch (error) {
      // REVERTIR TRANSACCIÓN
      await pool.query('ROLLBACK');
      return res.status(500).jsonp({ message: 'error' });
    }
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