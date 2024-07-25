import { Request, Response } from 'express';
import AUDITORIA_CONTROLADOR from '../auditoria/auditoriaControlador';
import pool from '../../database';
import { QueryResult } from 'pg';

class RolPermisosControlador {


  //METODO PARA ENLISTAR PAGINAS QUE NO SEAN MODULOS
  public async ListarMenuRoles(req: Request, res: Response) {
    const Roles = await pool.query(
      `
      SELECT * FROM es_paginas WHERE modulo = false
      `
    );
    if (Roles.rowCount != 0) {
      return res.jsonp(Roles.rows);
    }
    else {
      return res.status(404).jsonp({ text: 'Registro no encontrado.' });
    }
  }

  //METODO PARA ENLISTAR PAGINAS SEAN MODULOS
  public async ListarMenuModulosRoles(req: Request, res: Response) {
    const Roles = await pool.query(
      `
      SELECT * FROM es_paginas WHERE modulo = true
      `
    );
    if (Roles.rowCount != 0) {
      return res.jsonp(Roles.rows);
    }
    else {
      return res.status(404).jsonp({ text: 'Registro no encontrado.' });
    }
  }

  //METODO PARA ENLISTAR PAGINAS QUE SON MODULOS, CLASIFICANDOLAS POR EL NOMBRE DEL MODULO
  public async ListarModuloPorNombre(req: Request, res: Response) {
    const { nombre_modulo } = req.body;
    const Roles = await pool.query(
      `
      SELECT * FROM es_paginas WHERE nombre_modulo = $1
      `
      , [nombre_modulo]
    );
    if (Roles.rowCount != 0) {
      return res.jsonp(Roles.rows);
    }
    else {
      return res.status(404).jsonp({ text: 'Registro no encontrado.' });
    }
  }

  // METODO PARA BUSCAR SI EXISTEN PAGINAS CON EL ID DEL ROL REGISTRADA CUANDO NO TIENE ACCION
  public async ObtenerIdPaginas(req: Request, res: Response): Promise<any> {
    const { funcion, id_rol } = req.body;
    const PAGINA_ROL = await pool.query(
      `
      SELECT * FROM ero_rol_permisos WHERE pagina = $1  AND id_rol = $2 
      `
      , [funcion, id_rol]);
    if (PAGINA_ROL.rowCount != 0) {
      return res.jsonp(PAGINA_ROL.rows)
    }
    else {
      return res.status(404).jsonp({ text: 'Registros no encontrados.' });
    }
  }

  // METODO PARA BUSCAR SI EXISTEN PAGINAS CON EL ID DEL ROL REGISTRADA
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

  // METODO PARA BUSCAR LAS PAGINAS POR EL ID DEL ROL
  public async ObtenerPaginasRol(req: Request, res: Response): Promise<any> {
    try {
      const { id_rol } = req.body;
      const PAGINA_ROL = await pool.query(
        `
      SELECT * FROM ero_rol_permisos WHERE id_rol = $1 order by 3,5
      `, [id_rol]);
      return res.jsonp(PAGINA_ROL.rows)
    } catch (error) {
      return res.status(404).jsonp({ text: 'Registros no encontrados.' });
    }
  }

  //FIXME SQL
  // METODO PARA BUSCAR ID DE PAGINAS Y MENU LATERAL
  public async ObtenerPaginasMenuRol(req: Request, res: Response): Promise<any> {
    const { id_rol } = req.body;
    const PAGINA_ROL = await pool.query(
      `
        SELECT ero_rol_permisos.id, ero_rol_permisos.pagina as funcion, ero_rol_permisos.link, ero_rol_permisos.id_rol, ero_rol_permisos.id_accion, es_acciones_paginas.id_pagina as id_funcion, es_acciones_paginas.accion  
        FROM ero_rol_permisos ero_rol_permisos 
        LEFT JOIN es_acciones_paginas es_acciones_paginas ON es_acciones_paginas.id = ero_rol_permisos.id_accion 
        WHERE ero_rol_permisos.id_rol = $1 
        ORDER BY 6, 5
      `
      , [id_rol]);
    if (PAGINA_ROL.rowCount != 0) {
      return res.jsonp(PAGINA_ROL.rows)
    }
    else {
      return res.status(404).jsonp({ text: 'Registros no encontrados.' });
    }
  }

  // METODO PARA ASIGNAR CIUDADES A FERIADO
  // METODO PARA ASIGNAR FUNCIONES AL ROL
  public async AsignarPaginaRol(req: Request, res: Response) {
    try {
      const { funcion, link, id_rol, id_accion, user_name, ip } = req.body;
      // INICIAR TRANSACCION
      await pool.query('BEGIN');

      const response: QueryResult = await pool.query(
        `
        INSERT INTO ero_rol_permisos (pagina, link, id_rol, id_accion) VALUES ($1, $2, $3, $4) RETURNING *
        `, [funcion, link, id_rol, id_accion]);
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

  // METODO PARA ELIMINAR REGISTRO
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

  // METODO PARA BUSCAR LAS ACCIONES POR CADA PAGINA
  public async ObtenerAccionesPaginas(req: Request, res: Response): Promise<any> {
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
      return res.jsonp([])
    }
  }

  // METODO PARA ENLISTAR ACCIONES SEGUN LA PAGINA 
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

  //METODO PARA ENLISTAR ACCIONES 
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
}

export const rolPermisosControlador = new RolPermisosControlador();
export default rolPermisosControlador;