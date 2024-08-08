// IMPORTAR LIBRERIAS
import { Request, Response } from 'express';
import AUDITORIA_CONTROLADOR from '../auditoria/auditoriaControlador';
import pool from '../../database';

class RolesControlador {

  // METODO PARA LISTAR ROLES DEL SISTEMA  **USADO
  public async ListarRoles(req: Request, res: Response) {
    const ROL = await pool.query(
      `
      SELECT id, nombre FROM ero_cat_roles ORDER BY nombre ASC
      `
    );
    if (ROL.rowCount != 0) {
      return res.jsonp(ROL.rows)
    } else {
      res.status(404).jsonp({ text: 'Registro no encontrado.' });
    }
  }

  // METODO PARA ELIMINAR REGISTRO  **USADO
  public async EliminarRol(req: Request, res: Response): Promise<Response> {
    try {
      const { user_name, ip } = req.body;
      const id = req.params.id;

      // INICIAR TRANSACCION
      await pool.query('BEGIN');

      // CONSULTAR DATOSORIGINALES
      const rol = await pool.query('SELECT * FROM ero_cat_roles WHERE id = $1', [id]);
      const [datosOriginales] = rol.rows;
      
      if (!datosOriginales) {
        // AUDITORIA
        await AUDITORIA_CONTROLADOR.InsertarAuditoria({
          tabla: 'ero_cat_roles',
          usuario: user_name,
          accion: 'D',
          datosOriginales: '',
          datosNuevos: '',
          ip,
          observacion: `Error al eliminar el rol con id ${id}`
        });

        // FINALIZAR TRANSACCION
        await pool.query('COMMIT');
        return res.status(404).jsonp({ message: 'Error al eliminar el registro.' });
      }
      
      await pool.query(
        `
        DELETE FROM ero_cat_roles WHERE id = $1
        `
        , [id]);
      
      // AUDITORIA
      await AUDITORIA_CONTROLADOR.InsertarAuditoria({
        tabla: 'ero_cat_roles',
        usuario: user_name,
        accion: 'D',
        datosOriginales: JSON.stringify(datosOriginales),
        datosNuevos: '',
        ip,
        observacion: null
      });

      // FINALIZAR TRANSACCION
      await pool.query('COMMIT');
      return res.jsonp({ message: 'Registro eliminado.' });
      
    } catch (error) {
      // FINALIZAR TRANSACCION
      await pool.query('ROLLBACK');
      return res.jsonp({ message: 'error' });
    }
  }

  // METODO PARA REGISTRAR ROL
  public async CrearRol(req: Request, res: Response): Promise<void> {
    try {
      const { nombre, user_name, ip } = req.body;
      
      // INICIAR TRANSACCION
      await pool.query('BEGIN');

      const datosNuevos = await pool.query(
        `
        INSERT INTO ero_cat_roles (nombre) VALUES ($1)  RETURNING *
         `
        , [nombre]);
      
      // AUDITORIA
      await AUDITORIA_CONTROLADOR.InsertarAuditoria({
        tabla: 'ero_cat_roles',
        usuario: user_name,
        accion: 'I',
        datosOriginales: '',
        datosNuevos: JSON.stringify(datosNuevos.rows[0]),
        ip,
        observacion: null
      });

      // FINALIZAR TRANSACCION
      await pool.query('COMMIT');
      res.jsonp({ message: 'Registro guardado.' });
    } catch (error) {
      // REVERTIR TRANSACCION
      await pool.query('ROLLBACK');
      res.status(500).jsonp({ message: 'Error al guardar el registro.' });
    }

  }

  // LISTAR ROLES A EXCEPCION EL QUE SE EDITA **USADO
  public async ListarRolesActualiza(req: Request, res: Response) {
    const id = req.params.id;
    const ROL = await pool.query(
      `
      SELECT * FROM ero_cat_roles WHERE NOT id = $1
      `
      , [id]);
    if (ROL.rowCount != 0) {
      return res.jsonp(ROL.rows)
    }
    else {
      return res.status(404).jsonp({ text: 'No se encuentran registros.' });
    }
  }

  public async ObtnenerUnRol(req: Request, res: Response): Promise<any> {
    const { id } = req.params;
    const ROL = await pool.query(
      `
      SELECT * FROM ero_cat_roles WHERE id = $1
      `
      , [id]);
    if (ROL.rowCount != 0) {
      return res.jsonp(ROL.rows)
    } else {
      res.status(404).jsonp({ text: 'Registro no encontrado.' });
    }
  }

// METODO PARA ACTUALIZAR ROLES  **USADO
  public async ActualizarRol(req: Request, res: Response): Promise<Response> {
    try {
      const { nombre, id, user_name, ip } = req.body;

      // INICIAR TRANSACCION
      await pool.query('BEGIN');

      // CONSULTAR DATOS ORIGINALES
      const rol = await pool.query('SELECT * FROM ero_cat_roles WHERE id = $1', [id]);
      const [datosOriginales] = rol.rows;

      if (!datosOriginales) {
        // AUDITORIA
        await AUDITORIA_CONTROLADOR.InsertarAuditoria({
          tabla: 'ero_cat_roles',
          usuario: user_name,
          accion: 'U',
          datosOriginales: '',
          datosNuevos: '',
          ip,
          observacion: `Error al actualizar el rol con id ${id}`
        });

        // FINALIZAR TRANSACCION
        await pool.query('COMMIT');
        return res.status(404).jsonp({ message: 'Error al actualizar el registro.' });
      }

      const datosNuevos = await pool.query('UPDATE ero_cat_roles SET nombre = $1 WHERE id = $2 RETURNING *'
        , [nombre, id]);
      
      // AUDITORIA
      await AUDITORIA_CONTROLADOR.InsertarAuditoria({
        tabla: 'ero_cat_roles',
        usuario: user_name,
        accion: 'U',
        datosOriginales: JSON.stringify(datosOriginales),
        datosNuevos: JSON.stringify(datosNuevos.rows[0]),
        ip,
        observacion: null
      });

      // FINALIZAR TRANSACCION
      await pool.query('COMMIT');
      return res.jsonp({ message: 'Registro Actualizado' });
    } catch (error) {
      // FINALIZAR TRANSACCION
      await pool.query('ROLLBACK');
      return res.status(500).jsonp({ message: 'Error al actualizar el registro.' });
    }
  }


  //CONSULTA PARA OPTENER LOS USUARIOS CON NO SON JEFES Y ADMINISTRAR UN DEPARTAMENTO
  public async ListarRolesUsuario(req: Request, res: Response){
    console.log('entro en el controlador :)')
    try{
      
      const ROL = await pool.query(
        `
        SELECT data_empl.codigo, data_empl.cedula, CONCAT(TRIM(data_empl.nombre), ' ',TRIM(data_empl.apellido)) AS nombre, 
	            data_empl.id_rol, rol.nombre AS rol, empl_car.id_departamento, depa.nombre AS departamento,
	            empl_car.id_sucursal, sucu.nombre AS sucursal, empl_car.id_tipo_cargo, cargo.cargo 
        FROM eu_usuario_departamento AS usu_dep, eu_empleado_cargos AS empl_car, informacion_general AS data_empl,
	          ed_departamentos AS depa, e_sucursales AS sucu, e_cat_tipo_cargo AS cargo, ero_cat_roles AS rol
        WHERE usu_dep.id_empleado = data_empl.id AND usu_dep.principal = true AND usu_dep.personal = true AND 
	          usu_dep.administra = false AND empl_car.id = data_empl.id_cargo AND empl_car.jefe = false AND
	          depa.id = empl_car.id_departamento AND sucu.id = empl_car.id_sucursal AND cargo.id = empl_car.id_tipo_cargo AND
	          data_empl.id_rol != 1 AND rol.id = data_empl.id_rol order by nombre ASC
        `
      );
      if (ROL.rowCount != 0) {
        return res.jsonp({message: 'Registros encontrados', lista: ROL.rows})
      } else {
        return res.status(404).jsonp({ message: 'Registros no encontrados.' });
      }

    } catch (error) {
      // FINALIZAR TRANSACCION
      await pool.query('ROLLBACK');
      return res.status(500).jsonp({ message: 'Error al actualizar el registro.' });
    }
  }

  //CONSULTA PARA actualizar roles a varios usuarios **USADO
  public async UpdateRoles(req: Request, res: Response){
    try{

      const { idRol, listaUsuarios} = req.body;
      var cont = 0;
      listaUsuarios.forEach(async (item: any) => {
        let res = await pool.query(`
          UPDATE eu_usuarios
          SET id_rol = $1 
          WHERE id = $2
        `, [idRol, item.id]);

        if(res.rowCount != 0){
          cont = cont + 1;
        }
      })

      
      setTimeout(() => {
        if (cont == listaUsuarios.length) {
          return res.status(200).jsonp({message: 'Se a actualizado todos los usuarios', status: 200})
        } else {
          return res.status(404).jsonp({ message: 'Revisar los datos, algunos usuarios no se actualizaron', status: 404 });
        }
      }, 1500)
      

    } catch (error) {
      // FINALIZAR TRANSACCION
      await pool.query('ROLLBACK');
      return res.status(500).jsonp({ message: 'Error al actualizar el registro.', status:500 });
    }
  }


}

const ROLES_CONTROLADOR = new RolesControlador();

export default ROLES_CONTROLADOR;
