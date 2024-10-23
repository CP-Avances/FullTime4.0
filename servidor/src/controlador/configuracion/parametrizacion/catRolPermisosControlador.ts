import { Request, Response } from 'express';
import AUDITORIA_CONTROLADOR from '../../reportes/auditoriaControlador';
import pool from '../../../database';
import { QueryResult } from 'pg';

class RolPermisosControlador {


  // METODO PARA ENLISTAR PAGINAS QUE NO SEAN MODULOS  **USADO
  public async ListarMenuRoles(req: Request, res: Response) {
    const { tipo } = req.params;
    const Roles = await pool.query(
      `
      SELECT * FROM es_paginas WHERE modulo = false AND movil = $1
      `
      , [tipo]
    );
    if (Roles.rowCount != 0) {
      return res.jsonp(Roles.rows);
    }
    else {
      return res.status(404).jsonp({ text: 'Registro no encontrado.' });
    }
  }

  // METODO PARA ENLISTAR PAGINAS SEAN MODULOS  **USADO
  public async ListarMenuModulosRoles(req: Request, res: Response) {
    const { tipo } = req.params;
    const Roles = await pool.query(
      `
      SELECT * FROM es_paginas WHERE modulo = true AND movil = $1
      `, [tipo]
    );
    if (Roles.rowCount != 0) {
      return res.jsonp(Roles.rows);
    }
    else {
      return res.status(404).jsonp({ text: 'Registro no encontrado.' });
    }
  }

  // METODO PARA ENLISTAR PAGINAS QUE SON MODULOS, CLASIFICANDOLAS POR EL NOMBRE DEL MODULO  **USADO
  public async ListarModuloPorNombre(req: Request, res: Response) {
    const { nombre_modulo, tipo } = req.body;
    const Roles = await pool.query(
      `
      SELECT * FROM es_paginas WHERE nombre_modulo = $1 AND movil = $2
      `
      , [nombre_modulo, tipo]
    );
    if (Roles.rowCount != 0) {
      return res.jsonp(Roles.rows);
    }
    else {
      return res.status(404).jsonp({ text: 'Registro no encontrado.' });
    }
  }

  // METODO PARA BUSCAR SI EXISTEN PAGINAS CON EL ID DEL ROL REGISTRADA CUANDO NO TIENE ACCION  **USADO
  public async ObtenerIdPaginas(req: Request, res: Response): Promise<any> {
    const { funcion, id_rol } = req.body;
    const PAGINA_ROL = await pool.query(
      `
      SELECT * FROM ero_rol_permisos WHERE pagina = $1 AND id_rol = $2 
      `
      , [funcion, id_rol]);
    if (PAGINA_ROL.rowCount != 0) {
      return res.jsonp(PAGINA_ROL.rows)
    }
    else {
      return res.status(404).jsonp({ text: 'Registros no encontrados.' });
    }
  }

  // METODO PARA BUSCAR SI EXISTEN PAGINAS CON EL ID DEL ROL REGISTRADA  **USADO
  public async ObtenerIdPaginasConAcciones(req: Request, res: Response): Promise<any> {
    const { funcion, id_rol, id_accion } = req.body;
    const PAGINA_ROL = await pool.query(
      `
      SELECT * FROM ero_rol_permisos WHERE pagina = $1 AND id_rol = $2 AND id_accion = $3
      `
      , [funcion, id_rol, id_accion]);
    if (PAGINA_ROL.rowCount != 0) {
      return res.jsonp(PAGINA_ROL.rows)
    }
    else {
      return res.status(404).jsonp({ text: 'Registros no encontrados.' });
    }
  }

  // METODO PARA BUSCAR LAS PAGINAS POR EL ID DEL ROL  **USADO
  public async ObtenerPaginasRol(req: Request, res: Response): Promise<any> {
    try {
      const { id_rol, tipo } = req.body;
      const PAGINA_ROL = await pool.query(
        `
        SELECT * FROM ero_rol_permisos WHERE id_rol = $1 AND movil = $2 ORDER BY 3,5
        `
        , [id_rol, tipo]);
      return res.jsonp(PAGINA_ROL.rows)
    } catch (error) {
      return res.status(404).jsonp({ text: 'Registros no encontrados.' });
    }
  }

  // METODO PARA ASIGNAR FUNCIONES AL ROL  **USADO
  public async AsignarPaginaRol(req: Request, res: Response) {
    try {
      const { funcion, link, id_rol, id_accion, movil, user_name, ip } = req.body;
      // INICIAR TRANSACCION
      await pool.query('BEGIN');

      const response: QueryResult = await pool.query(
        `
        INSERT INTO ero_rol_permisos (pagina, link, id_rol, id_accion, movil) VALUES ($1, $2, $3, $4, $5) RETURNING *
        `
        , [funcion, link, id_rol, id_accion, movil]);
      const [datosOriginales] = response.rows;
      await AUDITORIA_CONTROLADOR.InsertarAuditoria({
        tabla: 'ero_rol_permisos',
        usuario: user_name,
        accion: 'I',
        datosOriginales: '',
        datosNuevos: JSON.stringify(datosOriginales),
        ip,
        observacion: null
      });

      // FINALIZAR TRANSACCION
      await pool.query('COMMIT');

      const [rol] = response.rows;
      if (rol) {
        return res.status(200).jsonp({ message: 'OK', reloj: rol })
      }
      else {
        return res.status(404).jsonp({ message: 'error' })
      }
    } catch (error) {
      return res.status(500).jsonp({ message: 'error' })
    }
  }

  // METODO PARA ELIMINAR REGISTRO  **USADO
  public async EliminarPaginaRol(req: Request, res: Response): Promise<any> {
    try {
      const { id, user_name, ip } = req.body

      // INICIAR TRANSACCION
      await pool.query('BEGIN');

      // CONSULTAR DATOSORIGINALES
      const rol = await pool.query('SELECT * FROM ero_rol_permisos WHERE id = $1', [id]);
      const [datosOriginales] = rol.rows;


      if (!datosOriginales) {
        // AUDITORIA
        await AUDITORIA_CONTROLADOR.InsertarAuditoria({
          tabla: 'ero_rol_permisos',
          usuario: user_name,
          accion: 'D',
          datosOriginales: '',
          datosNuevos: '',
          ip,
          observacion: `Error al eliminar el tipo de permiso con id ${id}. Registro no encontrado.`
        });

        // FINALIZAR TRANSACCION
        await pool.query('COMMIT');
        return res.status(404).jsonp({ message: 'Error al eliminar el registro.' });
      }

      await pool.query(
        `
      DELETE FROM ero_rol_permisos WHERE id = $1
      `
        , [id]);

      await AUDITORIA_CONTROLADOR.InsertarAuditoria({
        tabla: 'ero_rol_permisos',
        usuario: user_name,
        accion: 'D',
        datosOriginales: JSON.stringify(datosOriginales),
        datosNuevos: '',
        ip,
        observacion: null
      });

      // FINALIZAR TRANSACCION
      await pool.query('COMMIT');
      res.jsonp({ message: 'Registro eliminado.' });
    } catch (error) {
      return res.jsonp({ message: 'error' });
    }
  }

  // METODO PARA BUSCAR LAS ACCIONES POR CADA PAGINA  **USADO
  public async ObtenerAccionesPaginas(req: Request, res: Response): Promise<any> {
    const { id_funcion, tipo } = req.body;
    const PAGINA_ROL = await pool.query(
      `
      SELECT * FROM es_acciones_paginas AS ap, es_paginas AS p 
      WHERE ap.id_pagina = $1 AND p.id = ap.id_pagina AND p.movil = $2
      `
      , [id_funcion, tipo]);
    if (PAGINA_ROL.rowCount != 0) {
      return res.jsonp(PAGINA_ROL.rows)
    }
    else {
      return res.jsonp([])
    }
  }

  // METODO PARA ENLISTAR ACCIONES SEGUN LA PAGINA  **USADO
  public async ObtenerAccionesPaginasExistentes(req: Request, res: Response): Promise<any> {
    const { id_funcion } = req.body;
    const PAGINA_ROL = await pool.query(
      `
          SELECT * FROM es_acciones_paginas WHERE id_pagina = $1 
          `
      , [id_funcion]);
    if (PAGINA_ROL.rowCount != 0) {
      return res.jsonp(PAGINA_ROL.rows)
    }
    else {
      return res.status(404).jsonp({ text: 'Registros no encontrados.' });
    }
  }

  // METODO PARA ENLISTAR ACCIONES  **USADO
  public async ListarAcciones(req: Request, res: Response) {
    const Roles = await pool.query(
      `
      SELECT * FROM es_acciones_paginas
      `
    );
    if (Roles.rowCount != 0) {
      return res.jsonp(Roles.rows);
    }
    else {
      return res.status(404).jsonp({ text: 'Registro no encontrado.' });
    }
  }


  // METODO PARA LISTAR ROLES DEL SISTEMA  **USADO
  public async BuscarFuncionesRoles(req: Request, res: Response) {
    const CON_ACCIONES = await pool.query(
      `
      SELECT pr.id_rol, p.id AS id_pagina, pr.pagina, a.accion, pr.movil, p.nombre_modulo
      FROM ero_rol_permisos AS pr
      JOIN es_acciones_paginas AS a ON a.id = pr.id_accion
      JOIN es_paginas AS p ON p.nombre = pr.pagina
      `
    );
    console.log('con acciones ', CON_ACCIONES.rowCount)

    const SIN_ACCIONES = await pool.query(
      `
      SELECT pr.id_rol, p.id AS id_pagina, pr.pagina, pr.id_accion AS accion, pr.movil, p.nombre_modulo
      FROM ero_rol_permisos AS pr
      JOIN es_paginas AS p ON p.nombre = pr.pagina AND pr.id_accion IS NULL
      `
    );
    console.log('sin acciones ', SIN_ACCIONES.rowCount)

    var respuesta: any = [];

    if (SIN_ACCIONES.rowCount != 0 && CON_ACCIONES.rowCount != 0) {
      SIN_ACCIONES.rows.forEach((obj: any) => {
        CON_ACCIONES.rows.push(obj);
      })
      respuesta = CON_ACCIONES.rows;
    }
    else if (CON_ACCIONES.rowCount != 0) {
      respuesta = CON_ACCIONES.rows;
    } 
    else if (SIN_ACCIONES.rowCount != 0) {
      respuesta = SIN_ACCIONES.rows;
    }

    console.log('respuesta ', respuesta.length)

    if (respuesta.length != 0) {
      return res.jsonp(respuesta)
    } else {
      res.status(404).jsonp({ text: 'Registros no encontrados.' });
    }
  }
}

export const rolPermisosControlador = new RolPermisosControlador();
export default rolPermisosControlador;