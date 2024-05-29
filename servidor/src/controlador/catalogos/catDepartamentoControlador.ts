import AUDITORIA_CONTROLADOR from '../auditoria/auditoriaControlador';
import { Request, Response } from 'express';
import { QueryResult } from 'pg';
import { ObtenerIndicePlantilla, ObtenerRutaLeerPlantillas } from '../../libs/accesoCarpetas';
import excel from 'xlsx';
import pool from '../../database';
import path from 'path';
import fs from 'fs';


class DepartamentoControlador {

  // REGISTRAR DEPARTAMENTO
  public async CrearDepartamento(req: Request, res: Response): Promise<Response> {
    try {
      const { nombre, id_sucursal, user_name, ip } = req.body;

      // INICIAR TRANSACCIÓN
      await pool.query('BEGIN');

      await pool.query(
        `
        INSERT INTO ed_departamentos (nombre, id_sucursal ) VALUES ($1, $2)
        `
        , [nombre, id_sucursal]);

      // INSERTAR AUDITORIA
      await AUDITORIA_CONTROLADOR.InsertarAuditoria({
        tabla: 'ed_departamentos',
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
      const response = await pool.query('SELECT * FROM ed_departamentos WHERE id = $1', [id]);
      const datos = response.rows[0];

      if (!datos) {
        await AUDITORIA_CONTROLADOR.InsertarAuditoria({
          tabla: 'ed_departamentos',
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
        UPDATE ed_departamentos set nombre = $1, id_sucursal = $2 
        WHERE id = $3
        `
        , [nombre, id_sucursal, id]);

      // INSERTAR AUDITORIA
      await AUDITORIA_CONTROLADOR.InsertarAuditoria({
        tabla: 'ed_departamentos',
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
      FROM ed_departamentos AS d, e_sucursales AS s 
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
      SELECT * FROM ed_departamentos WHERE id_sucursal = $1
      `
      , [id_sucursal]);
    if (DEPARTAMENTO.rowCount > 0) {
      return res.jsonp(DEPARTAMENTO.rows)
    }
    res.status(404).jsonp({ text: 'El departamento no ha sido encontrado.' });
  }

  // METODO PARA BUSCAR LISTA DE DEPARTAMENTOS POR ID SUCURSAL Y EXCLUIR DEPARTAMENTO ACTUALIZADO
  public async ObtenerDepartamentosSucursal_(req: Request, res: Response): Promise<any> {
    const { id_sucursal, id } = req.params;
    const DEPARTAMENTO = await pool.query(
      `
      SELECT * FROM ed_departamentos WHERE id_sucursal = $1 AND NOT id = $2
      `
      , [id_sucursal, id]);
    if (DEPARTAMENTO.rowCount > 0) {
      return res.jsonp(DEPARTAMENTO.rows)
    }
    res.status(404).jsonp({ text: 'Registro no encontrado.' });
  }



  // METODO DE BUSQUEDA DE DEPARTAMENTOS   --**VERIFICAR
  public async ListarDepartamentos(req: Request, res: Response) {

    const NIVELES = await pool.query(
      `
      SELECT s.id AS id_sucursal, s.nombre AS nomsucursal, n.id_departamento AS id, 
        n.departamento AS nombre, n.nivel, n.departamento_nombre_nivel AS departamento_padre
      FROM ed_niveles_departamento AS n, e_sucursales AS s
      WHERE n.id_sucursal = s.id AND 
        n.nivel = (SELECT MAX(nivel) FROM ed_niveles_departamento WHERE id_departamento = n.id_departamento)
      ORDER BY s.nombre, n.departamento ASC
      `
    );

    const DEPARTAMENTOS = await pool.query(
      `
      SELECT s.id AS id_sucursal, s.nombre AS nomsucursal, cd.id, cd.nombre,
        0 AS NIVEL, null AS departamento_padre
      FROM ed_departamentos AS cd, e_sucursales AS s
      WHERE NOT cd.id IN (SELECT id_departamento FROM ed_niveles_departamento) AND
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
        n.departamento AS nombre, n.nivel, n.departamento_nombre_nivel AS departamento_padre
      FROM ed_niveles_departamento AS n, e_sucursales AS s
      WHERE n.id_sucursal = s.id AND 
        n.nivel = (SELECT MAX(nivel) FROM ed_niveles_departamento WHERE id_departamento = n.id_departamento)
        AND s.id = $1
      ORDER BY s.nombre, n.departamento ASC
      `
      , [id]
    );

    const DEPARTAMENTO = await pool.query(
      `
      SELECT s.id AS id_sucursal, s.nombre AS nomsucursal, cd.id, cd.nombre,
        0 AS NIVEL, null AS departamento_padre
      FROM ed_departamentos AS cd, e_sucursales AS s
      WHERE NOT cd.id IN (SELECT id_departamento FROM ed_niveles_departamento) AND
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
      const response = await pool.query('SELECT * FROM ed_departamentos WHERE id = $1', [id]);
      const datos = response.rows[0];

      if (!datos) {
        await AUDITORIA_CONTROLADOR.InsertarAuditoria({
          tabla: 'ed_departamentos',
          usuario: user_name,
          accion: 'D',
          datosOriginales: '',
          datosNuevos: '',
          ip: ip,
          observacion: `Error al eliminar el departamento con ID: ${id}. Registro no encontrado.`,
        });

        // FINALIZAR TRANSACCIÓN
        await pool.query('COMMIT');
        return res.status(404).jsonp({ message: 'error' });
      }

      await pool.query(
        `
        DELETE FROM ed_departamentos WHERE id = $1
        `
        , [id]);

      // INSERTAR AUDITORIA
      await AUDITORIA_CONTROLADOR.InsertarAuditoria({
        tabla: 'ed_departamentos',
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
      //return res.status(500).jsonp({ message: 'error' });
      return res.jsonp({ message: 'error' });

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
        INSERT INTO ed_niveles_departamento (departamento, id_departamento, nivel, departamento_nombre_nivel, 
          id_departamento_nivel, id_sucursal, id_sucursal_departamento_nivel ) 
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        `
        , [departamento, id_departamento, nivel, dep_nivel_nombre, dep_nivel, id_establecimiento, id_suc_dep_nivel]);

      // INSERTAR AUDITORIA
      await AUDITORIA_CONTROLADOR.InsertarAuditoria({
        tabla: 'ed_niveles_departamento',
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
      FROM ed_niveles_departamento AS n, e_sucursales AS s
      WHERE id_departamento = $1 AND id_sucursal = $2 
        AND s.id = n.id_sucursal_departamento_nivel
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
      const response = await pool.query('SELECT * FROM ed_niveles_departamento WHERE id = $1', [id]);
      const datos = response.rows[0];

      if (!datos) {
        await AUDITORIA_CONTROLADOR.InsertarAuditoria({
          tabla: 'ed_niveles_departamento',
          usuario: user_name,
          accion: 'U',
          datosOriginales: '',
          datosNuevos: '',
          ip: ip,
          observacion: `Error al actualizar el nivel de departamento con ID: ${id}, Registro no encontrado.`,
        });

        // FINALIZAR TRANSACCIÓN
        await pool.query('COMMIT');
        return res.status(404).jsonp({ message: 'Registro no encontrado' });
      }

      await pool.query(
        `
        UPDATE ed_niveles_departamento set nivel = $1 
        WHERE id = $2
        `
        , [nivel, id]);

      // INSERTAR AUDITORIA
      await AUDITORIA_CONTROLADOR.InsertarAuditoria({
        tabla: 'ed_niveles_departamento',
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
      const response = await pool.query('SELECT * FROM ed_niveles_departamento WHERE id = $1', [id]);
      const datos = response.rows[0];

      if (!datos) {
        await AUDITORIA_CONTROLADOR.InsertarAuditoria({
          tabla: 'ed_niveles_departamento',
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
        DELETE FROM ed_niveles_departamento WHERE id = $1
        `
        , [id]);

      // INSERTAR AUDITORIA
      await AUDITORIA_CONTROLADOR.InsertarAuditoria({
        tabla: 'ed_niveles_departamento',
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
      //return res.status(500).jsonp({ message: 'error' });
      return res.jsonp({ message: 'error' });

    }
  }

  //METODO PARA CREAR NIVELES JERARQUICOS POR DEPARTAMENTOS  --**VERIFICADO
  public async ActualizarNombreNivel(req: Request, res: Response): Promise<any> {
    try {
      const { id_departamento, departamento, user_name, ip } = req.body;

      // INICIAR TRANSACCIÓN
      await pool.query('BEGIN');

      // OBTENER DATOS ANTES DE ACTUALIZAR
      const response = await pool.query('SELECT * FROM ed_niveles_departamento WHERE id_departamento = $1', [id_departamento]);
      const [datos] = response.rows;

      if (!datos) {
        await AUDITORIA_CONTROLADOR.InsertarAuditoria({
          tabla: 'ed_niveles_departamento',
          usuario: user_name,
          accion: 'U',
          datosOriginales: '',
          datosNuevos: '',
          ip: ip,
          observacion: `Error al actualizar el nombre de nivel del departamento con ID: ${id_departamento}. Registro no encontrado.`,
        });

        // FINALIZAR TRANSACCIÓN
        await pool.query('COMMIT');
        return res.status(404).jsonp({ message: 'Registro no encontrado' });
      }

      await pool.query(
        `
        UPDATE ed_niveles_departamento SET departamento = $1
        WHERE id_departamento = $2
        `
        , [departamento, id_departamento]);

      // INSERTAR AUDITORIA
      await AUDITORIA_CONTROLADOR.InsertarAuditoria({
        tabla: 'ed_niveles_departamento',
        usuario: user_name,
        accion: 'U',
        datosOriginales: JSON.stringify(datos),
        datosNuevos: `{departamento: ${departamento}}`,
        ip: ip,
        observacion: null
      });

      await pool.query(
        `
        UPDATE ed_niveles_departamento SET departamento_nombre_nivel = $1
        WHERE id_departamento_nivel = $2
        `
        , [departamento, id_departamento]);

      // INSERTAR AUDITORIA
      await AUDITORIA_CONTROLADOR.InsertarAuditoria({
        tabla: 'ed_niveles_departamento',
        usuario: user_name,
        accion: 'U',
        datosOriginales: JSON.stringify(datos),
        datosNuevos: `{departamento_nombre_nivel: ${departamento}}`,
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


  /* 
    * Metodo para revisar
    */
  // METODO PARA REVISAR LOS DATOS DE LA PLANTILLA DENTRO DEL SISTEMA - MENSAJES DE CADA ERROR
  public async RevisarDatos(req: Request, res: Response): Promise<any> {
    const documento = req.file?.originalname;
    let separador = path.sep;
    let ruta = ObtenerRutaLeerPlantillas() + separador + documento;
    const workbook = excel.readFile(ruta);

    let verificador = ObtenerIndicePlantilla(workbook, 'DEPARTAMENTOS');
    if (verificador === false) {
      return res.jsonp({ message: 'no_existe', data: undefined });
    }
    else {
      const sheet_name_list = workbook.SheetNames;
      const plantilla = excel.utils.sheet_to_json(workbook.Sheets[sheet_name_list[verificador]]);
      let data: any = {
        fila: '',
        nombre: '',
        sucursal: '',
        observacion: ''
      };

      var listDepartamentos: any = [];
      var duplicados: any = [];
      var mensaje: string = 'correcto';

      // LECTURA DE LOS DATOS DE LA PLANTILLA
      plantilla.forEach(async (dato: any, indice: any, array: any) => {
        var { ITEM, NOMBRE, SUCURSAL } = dato;
        //Verificar que el registo no tenga datos vacios
        if ((ITEM != undefined && ITEM != '') &&
          (NOMBRE != undefined) && (SUCURSAL != undefined)) {
          data.fila = ITEM;
          data.nombre = NOMBRE; data.sucursal = SUCURSAL;
          data.observacion = 'no registrado';

          listDepartamentos.push(data);
        } else {
          data.fila = ITEM;
          data.nombre = NOMBRE; data.sucursal = SUCURSAL;
          data.observacion = 'no registrado';

          if (data.fila == '' || data.fila == undefined) {
            data.fila = 'error';
            mensaje = 'error'
          }

          if (NOMBRE == undefined) {
            data.nombre = 'No registrado';
            data.observacion = 'Departamento ' + data.observacion;
          }
          if (SUCURSAL == undefined) {
            data.sucursal = 'No registrado';
            data.observacion = 'Sucursal ' + data.observacion;
          }

          listDepartamentos.push(data);

        }

        data = {};

      });

      // VERIFICAR EXISTENCIA DE CARPETA O ARCHIVO
      fs.access(ruta, fs.constants.F_OK, (err) => {
        if (err) {
        } else {
          // ELIMINAR DEL SERVIDOR
          fs.unlinkSync(ruta);
        }
      });

      listDepartamentos.forEach(async (item: any) => {
        if (item.observacion == 'no registrado') {
          var VERIFICAR_SUCURSAL = await pool.query(
            `
            SELECT * FROM e_sucursales WHERE UPPER(nombre) = $1
            `
            , [item.sucursal.toUpperCase()]);
          if (VERIFICAR_SUCURSAL.rows[0] != undefined && VERIFICAR_SUCURSAL.rows[0] != '') {
            var VERIFICAR_DEPARTAMENTO = await pool.query(
              `
              SELECT * FROM ed_departamentos WHERE id_sucursal = $1 AND UPPER(nombre) = $2
              `
              , [VERIFICAR_SUCURSAL.rows[0].id, item.nombre.toUpperCase()])
            if (VERIFICAR_DEPARTAMENTO.rows[0] == undefined || VERIFICAR_DEPARTAMENTO.rows[0] == '') {
              item.observacion = 'ok'
            } else {
              item.observacion = 'Ya existe en el sistema'
            }
          } else {
            item.observacion = 'Sucursal no existe en el sistema'
          }
        }
      });

      setTimeout(() => {
        listDepartamentos.sort((a: any, b: any) => {
          // Compara los números de los objetos
          if (a.fila < b.fila) {
            return -1;
          }
          if (a.fila > b.fila) {
            return 1;
          }
          return 0; // Son iguales
        });

        var filaDuplicada: number = 0;

        listDepartamentos.forEach((item: any) => {

          // Discriminación de elementos iguales
          item.nombre.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
          item.sucursal.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
          if (duplicados.find((p: any) => p.nombre.toLowerCase() === item.nombre.toLowerCase() && p.sucursal.toLowerCase() === item.sucursal.toLowerCase()) == undefined) {
            duplicados.push(item);
          } else {
            item.observacion = 'Registro duplicado'
          }

          //Valida si los datos de la columna N son numeros.
          if (typeof item.fila === 'number' && !isNaN(item.fila)) {
            //Condicion para validar si en la numeracion existe un numero que se repite dara error.
            if (item.fila == filaDuplicada) {
              mensaje = 'error';
            }
          } else {
            return mensaje = 'error';
          }

          filaDuplicada = item.fila;

        });

        if (mensaje == 'error') {
          listDepartamentos = undefined;
        }

        return res.jsonp({ message: mensaje, data: listDepartamentos });

      }, 1000)
    }
  }

  public async CargarPlantilla(req: Request, res: Response) {
    try {
      const plantilla = req.body;
      console.log('datos departamento: ', plantilla);
      var contador = 1;
      var respuesta: any

      plantilla.forEach(async (data: any) => {
        console.log('data: ', data);
        // Datos que se guardaran de la plantilla ingresada
        const { item, nombre, sucursal } = data;
        const ID_SUCURSAL: any = await pool.query(
          `
          SELECT id FROM e_sucursales WHERE UPPER(nombre) = $1
          `
          , [sucursal.toUpperCase()]);

        var nivel = 0;
        var id_sucursal = ID_SUCURSAL.rows[0].id;

        // Registro de los datos de contratos
        const response: QueryResult = await pool.query(
          `INSERT INTO ed_departamentos (nombre, id_sucursal) VALUES ($1, $2) RETURNING *
          `
          , [nombre.toUpperCase(), id_sucursal]);

        const [departamento] = response.rows;

        if (contador === plantilla.length) {
          if (departamento) {
            return respuesta = res.status(200).jsonp({ message: 'ok' })
          } else {
            return respuesta = res.status(404).jsonp({ message: 'error' })
          }
        }

        contador = contador + 1;

      });

    } catch (error) {
      return res.status(500).jsonp({ message: error });
    }

  }




  public async BuscarDepartamentoPorCargo(req: Request, res: Response) {
    const id = req.params.id_cargo
    const departamento = await pool.query(
      `
      SELECT ec.id_departamento, d.nombre, ec.id AS cargo
      FROM eu_empleado_cargos AS ec, ed_departamentos AS d 
      WHERE d.id = ec.id_departamento AND ec.id = $1
      ORDER BY cargo DESC
      `
      , [id]);
    if (departamento.rowCount > 0) {
      return res.json([departamento.rows[0]]);
    } else {
      return res.status(404).json({ text: 'No se encuentran registros' });
    }
  }

  public async ListarDepartamentosRegimen(req: Request, res: Response) {
    const id = req.params.id;
    const DEPARTAMENTOS = await pool.query(
      `
      SELECT d.id, d.nombre 
      FROM ere_cat_regimenes AS r, eu_empleado_cargos AS ec, eu_empleado_contratos AS c, ed_departamentos AS d 
      WHERE c.id_regimen = r.id AND c.id = ec.id_contrato AND ec.id_departamento = d.id AND r.id = $1 
      GROUP BY d.id, d.nombre
      `
      , [id]);
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