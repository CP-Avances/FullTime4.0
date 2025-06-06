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

  // METODO PARA ASIGNAR FUNCIONES AL ROL
  public async AsignarPaginaRol(req: Request, res: Response) {
    try {
      const { funcion, link, id_rol, id_accion, movil, user_name, ip, ip_local } = req.body;
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
        ip: ip,
        ip_local: ip_local,
        observacion: null
      });

      // FINALIZAR TRANSACCION
      await pool.query('COMMIT');

      const [rol] = response.rows;
      if (rol) {
        return res.status(200).jsonp({ message: 'OK', reloj: rol })
      }
      else {
        return res.jsonp({ message: 'error' })
      }
    } catch (error) {
      console.log('rol permisos ', error)
      return res.status(500).jsonp({ message: 'error' })
    }
  }

  // METODO PARA ASIGNAR ACCIONES AL ROL
  public async AsignarAccionesRol(req: Request, res: Response) {
    const arrayAccionesSeleccionadas: any[] = req.body.acciones;
    console.log('asignar acciones rol ', arrayAccionesSeleccionadas);

    if (!Array.isArray(arrayAccionesSeleccionadas) || arrayAccionesSeleccionadas.length === 0) {
      return res.status(400).jsonp({ message: 'No se proporcionaron acciones para asignar.' });
    }

    try {
      // Filtrar las acciones seleccionadas que no existen en la base de datos
      const accionesNoExistentes = await filtrarAccionesSeleccionadasNoExistentes(arrayAccionesSeleccionadas);
      if (accionesNoExistentes.length === 0) {
        console.log('Todas las acciones ya existen.');
        return res.status(200).jsonp({ message: 'Todas las acciones ya existen.' });
      }

      console.log('Acciones no existentes:', accionesNoExistentes);

      // Insertar las acciones seleccionadas que no existen
      await insertarAccionesSeleccionadas(accionesNoExistentes);

      return res.status(200).jsonp({ message: 'Acciones asignadas correctamente.' });
    } catch (error) {
      console.error('Error al asignar acciones:', error);
      return res.status(500).jsonp({ message: 'Error al asignar acciones.' });
    }
  }

  // METODO PARA ELIMINAR REGISTRO  **USADO
  public async EliminarPaginaRol(req: Request, res: Response): Promise<any> {
    try {
      const { id, user_name, ip, ip_local } = req.body

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
          ip: ip,
          ip_local: ip_local,
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
        ip: ip,
        ip_local: ip_local,
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

async function filtrarAccionesSeleccionadasNoExistentes(arrayAccionesSeleccionadas: any[]): Promise<any[]> {
  if (arrayAccionesSeleccionadas.length === 0) return [];
  // Construimos filtros dinámicos
  const conditions: string[] = [];
  const values: any[] = [];
  let i = 1;

  for (const accion of arrayAccionesSeleccionadas) {
    const { id_rol, id_accion, funcion } = accion;
    if (id_accion) {
      conditions.push(`(pagina = $${i++} AND id_rol = $${i++} AND id_accion = $${i++})`);
      values.push(funcion, id_rol, id_accion);
    } else {
      conditions.push(`(pagina = $${i++} AND id_rol = $${i++})`);
      values.push(funcion, id_rol);
    }
  }

  const query = `
    SELECT pagina, id_rol, id_accion FROM ero_rol_permisos
    WHERE ${conditions.join(' OR ')}
  `;

  const result = await pool.query(query, values);

  // Convertimos los registros existentes a un set de claves para comparar rápido
  const clavesExistentes = new Set(
    result.rows.map(r =>
      `${r.pagina}|${r.id_rol}|${r.id_accion ?? 'null'}`
    )
  );
  // Filtramos solo los que NO existen
  return arrayAccionesSeleccionadas.filter(({ funcion, id_rol, id_accion }) => {
    const clave = `${funcion}|${id_rol}|${id_accion ?? 'null'}`;
    return !clavesExistentes.has(clave);
  });
}

async function insertarAccionesSeleccionadas(arrayAccionesSeleccionadas: any[]) {
  if (arrayAccionesSeleccionadas.length === 0) return;
  // Construimos la consulta de inserción
  const values: string[] = [];
  const params: any[] = [];
  let i = 1;  

  const valuesAuditoria: string[] = [];
  const paramsAuditoria: any[] = [];
  let j = 1;

  for (const accion of arrayAccionesSeleccionadas) {
    const { funcion, link, id_rol, id_accion, movil, user_name, ip, ip_local } = accion;
    if (id_accion) {
      values.push(`($${i++}, $${i++}, $${i++}, $${i++}, $${i++})`);
      params.push(funcion, link, id_rol, id_accion, movil);
    } else {
      values.push(`($${i++}, $${i++}, $${i++}, NULL, $${i++})`);
      params.push(funcion, link, id_rol, movil);
    }
    // Preparar datos para auditoría
    valuesAuditoria.push(
      `($${j++}, $${j++}, $${j++}, $${j++}, $${j++}, $${j++}, $${j++}, $${j++}, $${j++}, $${j++})`
    );
    paramsAuditoria.push(
      "APLICACION WEB", // Asumiendo que la plataforma es siempre "APLICACION WEB",
      'ero_rol_permisos',
      user_name,
      'now()', // Fecha y hora actual
      'I', // Acción de inserción
      '', // Datos originales vacíos  
      JSON.stringify({ pagina: funcion, link, id_rol, id_accion, movil }), // Datos nuevos
      ip,
      null, // Observación puede ser nulo o un mensaje específico
      ip_local
    );
  }


  const query = `
    INSERT INTO ero_rol_permisos (pagina, link, id_rol, id_accion, movil)
    VALUES ${values.join(', ')}
  `;

  const queryAuditoria = `
    INSERT INTO audit.auditoria (plataforma, table_name, user_name, fecha_hora,
        action, original_data, new_data, ip_address, observacion, ip_address_local)
    VALUES ${valuesAuditoria.join(', ')}
  `;

  // añadir transacción
  await pool.query('BEGIN');

  await pool 
    .query(query, params)
    .catch(error => {
      console.error('Error al insertar acciones seleccionadas:', error);
      // Revertir transacción en caso de error
      return pool.query('ROLLBACK')
        .then(() => {
          throw new Error('Error al insertar acciones seleccionadas: ' + error.message);
        });
    });

  await pool
    .query(queryAuditoria, paramsAuditoria)
    .catch(error => {
      console.error('Error al insertar auditoría de acciones seleccionadas:', error);
      // Revertir transacción en caso de error
      return pool.query('ROLLBACK')
        .then(() => { 
          throw new Error('Error al insertar auditoría de acciones seleccionadas: ' + error.message);
        });

  });

  // Finalizar transacción
  await pool.query('COMMIT');
  console.log('Acciones seleccionadas insertadas correctamente.');
}



export const rolPermisosControlador = new RolPermisosControlador();
export default rolPermisosControlador;