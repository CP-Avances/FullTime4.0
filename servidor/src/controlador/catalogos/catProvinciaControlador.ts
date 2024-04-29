import { Request, Response } from 'express';
import pool from '../../database';
import AUDITORIA_CONTROLADOR from '../auditoria/auditoriaControlador';

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
  public async EliminarProvincia(req: Request, res: Response): Promise<Response> {
    try {
      // TODO ANALIZAR COMO OBTENER DESDE EL FRONT EL USERNAME Y LA IP
      const { user_name, ip } = req.body;
      const id = req.params.id;

      // INICIAR TRANSACCION
      await pool.query('BEGIN');

      // CONSULTAR DATOSORIGINALES
      const provincia = await pool.query('SELECT * FROM cg_provincias WHERE id = $1', [id]);
      const [datosOriginales] = provincia.rows;

      if (!datosOriginales) {
        // AUDITORIA
        await AUDITORIA_CONTROLADOR.InsertarAuditoria({
          tabla: 'cg_provincias',
          usuario: user_name,
          accion: 'D',
          datosOriginales: '',
          datosNuevos: '',
          ip: ip,
          observacion: `Error al eliminar el registro con id: ${id}.`
        });

        // FINALIZAR TRANSACCION
        await pool.query('COMMIT');
        return res.status(404).jsonp({ message: 'Registro no encontrado.' });
      }

      await pool.query(
        `
        DELETE FROM cg_provincias WHERE id = $1
        `
        , [id]);
      
      // AUDITORIA
      await AUDITORIA_CONTROLADOR.InsertarAuditoria({
        tabla: 'cg_provincias',
        usuario: user_name,
        accion: 'D',
        datosOriginales: JSON.stringify(datosOriginales),
        datosNuevos: '',
        ip: ip,
        observacion: null
      });

      // FINALIZAR TRANSACCION
      await pool.query('COMMIT');
      return res.jsonp({ message: 'Registro eliminado.' });
    } catch (error) {
      // REVERTIR TRANSACCION
      await pool.query('ROLLBACK');
      return res.status(500).jsonp({ message: error });
    }
  }

  // METODO PARA REGISTRAR PROVINCIA
  public async CrearProvincia(req: Request, res: Response): Promise<void> {
    try {
      const { nombre, id_pais, user_name, ip } = req.body;

      // INICIAR TRANSACCION
      await pool.query('BEGIN');

      await pool.query(
        `
        INSERT INTO cg_provincias (nombre, id_pais) VALUES ($1, $2)
        `
        , [nombre, id_pais]);
      
      // AUDITORIA
      await AUDITORIA_CONTROLADOR.InsertarAuditoria({
        tabla: 'cg_provincias',
        usuario: user_name,
        accion: 'I',
        datosOriginales: '',
        datosNuevos: `{"nombre": "${nombre}", "id_pais": "${id_pais}"}`,
        ip: ip,
        observacion: null
      });

      // FINALIZAR TRANSACCION
      await pool.query('COMMIT');
      res.jsonp({ message: 'Registro guardado.' });
    } catch (error) {
      // REVERTIR TRANSACCION
      await pool.query('ROLLBACK');
      res.status(500).jsonp({ message: error });
    }
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