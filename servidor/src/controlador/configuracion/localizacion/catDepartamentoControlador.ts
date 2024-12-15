import AUDITORIA_CONTROLADOR from '../../reportes/auditoriaControlador';
import { ObtenerIndicePlantilla, ObtenerRutaLeerPlantillas } from '../../../libs/accesoCarpetas';
import { Request, Response } from 'express';
import { QueryResult } from 'pg';
import Excel from 'exceljs';
import pool from '../../../database';
import path from 'path';
import fs from 'fs';


class DepartamentoControlador {

  // REGISTRAR DEPARTAMENTO    **USADO
  public async CrearDepartamento(req: Request, res: Response): Promise<Response> {
    try {
      const { nombre, id_sucursal, user_name, ip, ip_local } = req.body;

      // INICIAR TRANSACCION
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
        ip_local: ip_local,
        observacion: null
      });

      // FINALIZAR TRANSACCION
      await pool.query('COMMIT');
      return res.jsonp({ message: 'Registro guardado.' });
    }
    catch (error) {
      // REVERTIR TRANSACCION
      await pool.query('ROLLBACK');
      return res.status(500).jsonp({ message: 'error' });
    }
  }


  // ACTUALIZAR REGISTRO DE DEPARTAMENTO   **USADO
  public async ActualizarDepartamento(req: Request, res: Response) {
    try {
      const { nombre, id_sucursal, user_name, ip, ip_local } = req.body;
      const id = req.params.id;

      // INICIAR TRANSACCION
      await pool.query('BEGIN');

      // OBTENER DATOS ANTES DE ACTUALIZAR
      const response = await pool.query(`SELECT * FROM ed_departamentos WHERE id = $1`, [id]);
      const datos = response.rows[0];

      if (!datos) {
        await AUDITORIA_CONTROLADOR.InsertarAuditoria({
          tabla: 'ed_departamentos',
          usuario: user_name,
          accion: 'U',
          datosOriginales: '',
          datosNuevos: '',
          ip: ip,
          ip_local: ip_local,
          observacion: `Error al actualizar el departamento con ID: ${id}`,
        });

        // FINALIZAR TRANSACCION
        await pool.query('COMMIT');
        return res.status(404).jsonp({ message: 'error' });
      }

      const datosNuevos = await pool.query(
        `
        UPDATE ed_departamentos set nombre = $1, id_sucursal = $2 
        WHERE id = $3 RETURNING *
        `
        , [nombre, id_sucursal, id]);

      // INSERTAR AUDITORIA
      await AUDITORIA_CONTROLADOR.InsertarAuditoria({
        tabla: 'ed_departamentos',
        usuario: user_name,
        accion: 'U',
        datosOriginales: JSON.stringify(datos),
        datosNuevos: JSON.stringify(datosNuevos.rows[0]),
        ip: ip,
        ip_local: ip_local,
        observacion: null
      });

      // FINALIZAR TRANSACCION
      await pool.query('COMMIT');
      return res.jsonp({ message: 'Registro actualizado.' });

    }
    catch (error) {
      // REVERTIR TRANSACCION
      await pool.query('ROLLBACK');
      return res.status(500).jsonp({ message: 'error' });
    }
  }


  // METODO PARA BUSCAR LISTA DE DEPARTAMENTOS POR ID SUCURSAL   **USADO
  public async ObtenerDepartamento(req: Request, res: Response): Promise<any> {
    const { id } = req.params;
    const DEPARTAMENTO = await pool.query(
      `
      SELECT d.*, s.nombre AS sucursal
      FROM ed_departamentos AS d, e_sucursales AS s 
      WHERE d.id = $1 AND s.id = d.id_sucursal
      `
      , [id]);
    if (DEPARTAMENTO.rowCount != 0) {
      return res.jsonp(DEPARTAMENTO.rows)
    }
    res.status(404).jsonp({ text: 'El departamento no ha sido encontrado.' });
  }


  // METODO PARA BUSCAR LISTA DE DEPARTAMENTOS POR ID SUCURSAL  **USADO
  public async ObtenerDepartamentosSucursal(req: Request, res: Response): Promise<any> {
    const { id_sucursal } = req.params;
    const DEPARTAMENTO = await pool.query(
      `
      SELECT * FROM ed_departamentos WHERE id_sucursal = $1
      `
      , [id_sucursal]);
    if (DEPARTAMENTO.rowCount != 0) {
      return res.jsonp(DEPARTAMENTO.rows)
    }
    res.status(404).jsonp({ text: 'El departamento no ha sido encontrado.' });
  }

  // METODO PARA BUSCAR LISTA DE DEPARTAMENTOS POR ID SUCURSAL Y EXCLUIR DEPARTAMENTO ACTUALIZADO   **USADO
  public async ObtenerDepartamentosSucursal_(req: Request, res: Response): Promise<any> {
    const { id_sucursal, id } = req.params;
    const DEPARTAMENTO = await pool.query(
      `
      SELECT * FROM ed_departamentos WHERE id_sucursal = $1 AND NOT id = $2
      `
      , [id_sucursal, id]);
    if (DEPARTAMENTO.rowCount != 0) {
      return res.jsonp(DEPARTAMENTO.rows)
    }
    res.status(404).jsonp({ text: 'Registro no encontrado.' });
  }

  // METODO DE BUSQUEDA DE DEPARTAMENTOS   USADO
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

    if (DEPARTAMENTOS.rowCount != 0 && NIVELES.rowCount != 0) {
      NIVELES.rows.forEach((obj: any) => {
        DEPARTAMENTOS.rows.push(obj);
      });
      return res.jsonp(DEPARTAMENTOS.rows);
    }

    else if (DEPARTAMENTOS.rowCount != 0) {
      return res.jsonp(DEPARTAMENTOS.rows);
    }

    else if (NIVELES.rowCount != 0) {
      return res.jsonp(NIVELES.rows);
    }

    else {
      return res.status(404).jsonp({ text: 'No se encuentran registros.' });
    }

  }

  // METODO PARA LISTAR INFORMACION DE DEPARTAMENTOS POR ID DE SUCURSAL   **USADO
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

    if (DEPARTAMENTO.rowCount != 0 && NIVEL.rowCount != 0) {
      DEPARTAMENTO.rows.forEach((obj: any) => {
        NIVEL.rows.push(obj);
      });
      return res.jsonp(NIVEL.rows);
    }

    else if (DEPARTAMENTO.rowCount != 0) {
      return res.jsonp(DEPARTAMENTO.rows);
    }

    else if (NIVEL.rowCount != 0) {
      return res.jsonp(NIVEL.rows);
    }

    else {
      return res.status(404).jsonp({ text: 'No se encuentran registros.' });
    }

  }

  // METODO PARA ELIMINAR REGISTRO  **USADO
  public async EliminarRegistros(req: Request, res: Response): Promise<Response> {
    try {
      const id = req.params.id;
      const { user_name, ip, ip_local } = req.body;

      // INICIAR TRANSACCION
      await pool.query('BEGIN');

      // OBTENER DATOS ANTES DE ELIMINAR
      const response = await pool.query(`SELECT * FROM ed_departamentos WHERE id = $1`, [id]);
      const datos = response.rows[0];

      if (!datos) {
        await AUDITORIA_CONTROLADOR.InsertarAuditoria({
          tabla: 'ed_departamentos',
          usuario: user_name,
          accion: 'D',
          datosOriginales: '',
          datosNuevos: '',
          ip: ip,
          ip_local: ip_local,
          observacion: `Error al eliminar el departamento con ID: ${id}. Registro no encontrado.`,
        });

        // FINALIZAR TRANSACCION
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
        ip_local: ip_local,
        observacion: null
      });

      // FINALIZAR TRANSACCION
      await pool.query('COMMIT');
      return res.jsonp({ message: 'Registro eliminado.' });

    } catch (error) {
      // REVERTIR TRANSACCION
      await pool.query('ROLLBACK');
      return res.jsonp({ message: 'error' });

    }
  }

  // METODO PARA CREAR NIVELES JERARQUICOS POR DEPARTAMENTOS    **USADO
  public async CrearNivelDepa(req: Request, res: Response): Promise<any> {
    try {
      const { id_departamento, departamento, nivel, dep_nivel, dep_nivel_nombre, id_establecimiento,
        id_suc_dep_nivel, user_name, ip, ip_local } = req.body;

      // INICIAR TRANSACCION
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
        ip_local: ip_local,
        observacion: null
      });

      // FINALIZAR TRANSACCION
      await pool.query('COMMIT');
      return res.jsonp({ message: 'Registro guardado.' });

    }
    catch (error) {
      // REVERTIR TRANSACCION
      await pool.query('ROLLBACK');
      return res.status(500).jsonp({ message: 'error' });
    }
  }

  // METODO PARA BUSCAR NIVELES JERARQUICOS POR DEPARTAMENTO   **USADO
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
    if (NIVELESDEP.rowCount != 0) {
      return res.jsonp(NIVELESDEP.rows)
    }
    res.status(404).jsonp({ text: 'Registros no encontrados.' });
  }

  // ACTUALIZAR REGISTRO DE NIVEL DE DEPARTAMENTO DE TABLA NIVEL_JERARQUICO   **USADO
  public async ActualizarNivelDepa(req: Request, res: Response) {
    try {
      const { nivel, user_name, ip, ip_local } = req.body;
      const id = req.params.id;

      // INICIAR TRANSACCION
      await pool.query('BEGIN');

      // OBTENER DATOS ANTES DE ACTUALIZAR
      const response = await pool.query(`SELECT * FROM ed_niveles_departamento WHERE id = $1`, [id]);
      const datos = response.rows[0];

      if (!datos) {
        await AUDITORIA_CONTROLADOR.InsertarAuditoria({
          tabla: 'ed_niveles_departamento',
          usuario: user_name,
          accion: 'U',
          datosOriginales: '',
          datosNuevos: '',
          ip: ip,
          ip_local: ip_local,
          observacion: `Error al actualizar el nivel de departamento con ID: ${id}, Registro no encontrado.`,
        });

        // FINALIZAR TRANSACCION
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
        ip_local: ip_local,
        observacion: null
      });

      // FINALIZAR TRANSACCION
      await pool.query('COMMIT');
      return res.jsonp({ message: 'Registro actualizado.' });
    }
    catch (error) {
      // REVERTIR TRANSACCION
      await pool.query('ROLLBACK');
      return res.status(500).jsonp({ message: 'error' });
    }
  }

  // METODO PARA ELIMINAR REGISTRO DE NIVEL DE DEPARTAMENTO   **USADO
  public async EliminarRegistroNivelDepa(req: Request, res: Response): Promise<Response> {
    try {
      const id = req.params.id;
      const { user_name, ip, ip_local } = req.body;

      // INICIAR TRANSACCION
      await pool.query('BEGIN');

      // OBTENER DATOS ANTES DE ELIMINAR
      const response = await pool.query(`SELECT * FROM ed_niveles_departamento WHERE id = $1`, [id]);
      const datos = response.rows[0];

      if (!datos) {
        await AUDITORIA_CONTROLADOR.InsertarAuditoria({
          tabla: 'ed_niveles_departamento',
          usuario: user_name,
          accion: 'D',
          datosOriginales: '',
          datosNuevos: '',
          ip: ip,
          ip_local: ip_local,
          observacion: `Error al eliminar el nivel de departamento con ID: ${id}`,
        });

        // FINALIZAR TRANSACCION
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
        ip_local: ip_local,
        observacion: null
      });

      // FINALIZAR TRANSACCION
      await pool.query('COMMIT');
      return res.jsonp({ message: 'Registro eliminado.' });

    } catch (error) {
      // REVERTIR TRANSACCION
      await pool.query('ROLLBACK');
      return res.jsonp({ message: 'error' });
    }
  }

  // METODO PARA CREAR NIVELES JERARQUICOS POR DEPARTAMENTOS  **USADO
  public async ActualizarNombreNivel(req: Request, res: Response): Promise<any> {
    try {
      const { id_departamento, departamento, user_name, ip, ip_local } = req.body;

      // INICIAR TRANSACCION
      await pool.query('BEGIN');

      // OBTENER DATOS ANTES DE ACTUALIZAR
      const response1 = await pool.query(`SELECT * FROM ed_niveles_departamento WHERE id_departamento = $1`, [id_departamento]);
      const [datos1] = response1.rows;

      const response2 = await pool.query(`SELECT * FROM ed_niveles_departamento WHERE id_departamento_nivel = $1`, [id_departamento]);
      const [datos2] = response2.rows;

      if (datos1) {
        if (!datos1) {
          await AUDITORIA_CONTROLADOR.InsertarAuditoria({
            tabla: 'ed_niveles_departamento',
            usuario: user_name,
            accion: 'U',
            datosOriginales: '',
            datosNuevos: '',
            ip: ip,
            ip_local: ip_local,
            observacion: `Error al actualizar el nombre de nivel del departamento con ID: ${id_departamento}. Registro no encontrado.`,
          });

          // FINALIZAR TRANSACCION
          await pool.query('COMMIT');
          return res.status(404).jsonp({ message: 'Registro no encontrado' });
        }
        else {
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
            datosOriginales: JSON.stringify(datos1),
            datosNuevos: `{departamento: ${departamento}}`,
            ip: ip,
            ip_local: ip_local,
            observacion: null
          });
        }
      }

      if (datos2) {
        if (!datos2) {
          await AUDITORIA_CONTROLADOR.InsertarAuditoria({
            tabla: 'ed_niveles_departamento',
            usuario: user_name,
            accion: 'U',
            datosOriginales: '',
            datosNuevos: '',
            ip: ip,
            ip_local: ip_local,
            observacion: `Error al actualizar el nombre de nivel del departamento con ID: ${id_departamento}. Registro no encontrado.`,
          });

          // FINALIZAR TRANSACCION
          await pool.query('COMMIT');
          return res.status(404).jsonp({ message: 'Registro no encontrado' });
        }
        else {
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
            datosOriginales: JSON.stringify(datos2),
            datosNuevos: `{departamento_nombre_nivel: ${departamento}}`,
            ip: ip,
            ip_local: ip_local,
            observacion: null
          });
        }
      }

      // FINALIZAR TRANSACCION
      await pool.query('COMMIT');
      return res.jsonp({ message: 'Registro guardado.' });

    }
    catch (error) {
      // REVERTIR TRANSACCION
      await pool.query('ROLLBACK');
      return res.status(500).jsonp({ message: 'error' });
    }
  }

  // METODO PARA REVISAR LOS DATOS DE LA PLANTILLA DENTRO DEL SISTEMA - MENSAJES DE CADA ERROR
  public async RevisarDatos(req: Request, res: Response): Promise<any> {
    const documento = req.file?.originalname;
    let separador = path.sep;
    let ruta = ObtenerRutaLeerPlantillas() + separador + documento;
    const workbook = new Excel.Workbook();
    await workbook.xlsx.readFile(ruta);
    let verificador = ObtenerIndicePlantilla(workbook, 'DEPARTAMENTOS');
    if (verificador === false) {
      return res.jsonp({ message: 'no_existe', data: undefined });
    }
    else {
      const sheet_name_list = workbook.worksheets.map(sheet => sheet.name);
      const plantilla = workbook.getWorksheet(sheet_name_list[verificador]);
      let data: any = {
        fila: '',
        nombre: '',
        sucursal: '',
        observacion: ''
      };
      var listDepartamentos: any = [];
      var duplicados: any = [];
      var mensaje: string = 'correcto';
      if (plantilla) {
        // SUPONIENDO QUE LA PRIMERA FILA SON LAS CABECERAS
        const headerRow = plantilla.getRow(1);
        const headers: any = {};
        // CREAR UN MAPA CON LAS CABECERAS Y SUS POSICIONES, ASEGURANDO QUE LAS CLAVES ESTEN EN MAYUSCULAS
        headerRow.eachCell((cell: any, colNumber) => {
          headers[cell.value.toString().toUpperCase()] = colNumber;
        });
        // VERIFICA SI LAS CABECERAS ESENCIALES ESTAN PRESENTES
        if (!headers['ITEM'] || !headers['NOMBRE'] || !headers['SUCURSAL']) {
          return res.jsonp({ message: 'Cabeceras faltantes', data: undefined });
        }
        // LECTURA DE LOS DATOS DE LA PLANTILLA
        plantilla.eachRow((row, rowNumber) => {
          // SALTAR LA FILA DE LAS CABECERAS
          if (rowNumber === 1) return;
          // LEER LOS DATOS SEGUN LAS COLUMNAS ENCONTRADAS
          const ITEM = row.getCell(headers['ITEM']).value;
          const NOMBRE = row.getCell(headers['NOMBRE']).value;
          const SUCURSAL = row.getCell(headers['SUCURSAL']).value;
          // VERIFICAR QUE EL REGISTO NO TENGA DATOS VACIOS
          if ((ITEM != undefined && ITEM != '') &&
            (NOMBRE != undefined) && (SUCURSAL != undefined)) {
            data.fila = ITEM;
            data.nombre = NOMBRE; data.sucursal = SUCURSAL;
            data.observacion = 'no registrado';
            listDepartamentos.push(data);
          } else {
            data.fila = ITEM;
            data.nombre = NOMBRE;
            data.sucursal = SUCURSAL;
            data.observacion = 'no registrado';
            if (data.fila == '' || data.fila == undefined) {
              data.fila = 'error';
              mensaje = 'error'
            }
            if (NOMBRE == undefined) {
              data.nombre = 'No registrado';
              data.observacion = 'Departamento no registrado';
            }
            if (SUCURSAL == undefined) {
              data.sucursal = 'No registrado';
              data.observacion = 'Sucursal no registrado';
            }
            listDepartamentos.push(data);
          }
          data = {};
        });
      }
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
          // COMPARA LOS NUMEROS DE LOS OBJETOS
          if (a.fila < b.fila) {
            return -1;
          }
          if (a.fila > b.fila) {
            return 1;
          }
          return 0; // SON IGUALES
        });
        var filaDuplicada: number = 0;
        listDepartamentos.forEach((item: any) => {
          // DISCRIMINACION DE ELEMENTOS IGUALES
          item.nombre.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
          item.sucursal.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
          if (duplicados.find((p: any) => p.nombre.toLowerCase() === item.nombre.toLowerCase() && p.sucursal.toLowerCase() === item.sucursal.toLowerCase()) == undefined) {
            duplicados.push(item);
          } else {
            item.observacion = 'Registro duplicado'
          }
          // VALIDA SI LOS DATOS DE LA COLUMNA N SON NUMEROS.
          if (typeof item.fila === 'number' && !isNaN(item.fila)) {
            // CONDICION PARA VALIDAR SI EN LA NUMERACION EXISTE UN NUMERO QUE SE REPITE DARA ERROR.
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

  // METODO PARA REGISTRAR DATOS DE DEPARTAMENTOS
  public async CargarPlantilla(req: Request, res: Response) {
    const { plantilla, user_name, ip, ip_local } = req.body;
    let error: boolean = false;

    for (const data of plantilla) {
      try {
        const { nombre, sucursal } = data;

        // INICIAR TRANSACCION
        await pool.query('BEGIN');

        const id_sucursal: any = await pool.query(
          ` SELECT id FROM e_sucursales WHERE UPPER(nombre) = $1`
          , [sucursal.toUpperCase()]);

        const id = id_sucursal.rows[0].id;

        const response: QueryResult = await pool.query(
          `INSERT INTO ed_departamentos (nombre, id_sucursal) VALUES ($1, $2) RETURNING *`
          , [nombre.toUpperCase(), id]);

        const [departamento] = response.rows;

        // INSERTAR AUDITORIA
        await AUDITORIA_CONTROLADOR.InsertarAuditoria({
          tabla: 'ed_departamentos',
          usuario: user_name,
          accion: 'I',
          datosOriginales: '',
          datosNuevos: JSON.stringify(departamento),
          ip: ip,
          ip_local: ip_local,
          observacion: null
        });

        // FINALIZAR TRANSACCION
        await pool.query('COMMIT');

      } catch (error) {
        // REVERTIR TRANSACCION
        await pool.query('ROLLBACK');
        error = true;
      }
    }

    if (error) {
      return res.status(500).jsonp({ message: 'error' });
    }

    return res.status(200).jsonp({ message: 'ok' });

  }

  // METODO PARA REVISAR DATOS DE NIVELES DE DEPARTAMENTOS   **USADO
  public async RevisarDatosNivel(req: Request, res: Response) {
    try {
      const documento = req.file?.originalname;
      let separador = path.sep;
      let ruta = ObtenerRutaLeerPlantillas() + separador + documento;
      const workbook = new Excel.Workbook();
      await workbook.xlsx.readFile(ruta);

      let verificador = ObtenerIndicePlantilla(workbook, 'NIVEL_DEPARTAMENTOS');
      if (verificador === false) {
        return res.jsonp({ message: 'no_existe', data: undefined });
      }
      else {
        const sheet_name_list = workbook.worksheets.map(sheet => sheet.name);
        const plantilla = workbook.getWorksheet(sheet_name_list[verificador]);

        let data: any = {
          fila: '',
          sucursal: '',
          departamento: '',
          nivel: '',
          depa_superior: '',
          sucursal_depa_superior: '',
          observacion: '',
        }

        // EXPRESION REGULAR PARA VALIDAR EL FORMATO DE SOLO NUMEROS.
        const regex = /^[0-9]+$/;

        var listNivelesDep: any = [];
        var auxiListNivelDep: any = [];
        var duplicados: any = [];
        var mensaje: string = 'correcto';

        if (plantilla) {
          // SUPONIENDO QUE LA PRIMERA FILA SON LAS CABECERAS
          const headerRow = plantilla.getRow(1);
          const headers: any = {};
          // CREAR UN MAPA CON LAS CABECERAS Y SUS POSICIONES, ASEGURANDO QUE LAS CLAVES ESTEN EN MAYUSCULAS
          headerRow.eachCell((cell: any, colNumber) => {
            headers[cell.value.toString().toUpperCase()] = colNumber;
          });
          // VERIFICA SI LAS CABECERAS ESENCIALES ESTAN PRESENTES
          if (!headers['ITEM'] || !headers['DEPARTAMENTO'] || !headers['SUCURSAL'] ||
            !headers['NIVEL'] || !headers['DEPARTAMENTO_SUPERIOR'] || !headers['SUCURSAL_DEPARTAMENTO_SUPERIOR']
          ) {
            return res.jsonp({ message: 'Cabeceras faltantes', data: undefined });
          }
          // LECTURA DE LOS DATOS DE LA PLANTILLA
          plantilla.eachRow((row, rowNumber) => {
            // SALTAR LA FILA DE LAS CABECERAS
            if (rowNumber === 1) return;
            // LEER LOS DATOS SEGUN LAS COLUMNAS ENCONTRADAS
            const ITEM = row.getCell(headers['ITEM']).value;
            const NIVEL = row.getCell(headers['NIVEL']).value;
            const SUCURSAL = row.getCell(headers['SUCURSAL']).value;
            const DEPARTAMENTO = row.getCell(headers['DEPARTAMENTO']).value;
            const DEPARTAMENTO_SUPERIOR = row.getCell(headers['DEPARTAMENTO_SUPERIOR']).value;
            const SUCURSAL_DEPARTAMENTO_SUPERIOR = row.getCell(headers['SUCURSAL_DEPARTAMENTO_SUPERIOR']).value;

            if (ITEM != undefined && SUCURSAL != undefined &&
              DEPARTAMENTO != undefined && NIVEL != undefined &&
              DEPARTAMENTO_SUPERIOR != undefined && SUCURSAL_DEPARTAMENTO_SUPERIOR != undefined) {
              data.fila = ITEM;
              data.sucursal = SUCURSAL;
              data.departamento = DEPARTAMENTO;
              data.nivel = NIVEL;
              data.depa_superior = DEPARTAMENTO_SUPERIOR;
              data.sucursal_depa_superior = SUCURSAL_DEPARTAMENTO_SUPERIOR;
              data.observacion = 'no registrada';
              listNivelesDep.push(data);
            } else {
              data.fila = ITEM;
              data.sucursal = SUCURSAL;
              data.departamento = DEPARTAMENTO;
              data.nivel = NIVEL;
              data.depa_superior = DEPARTAMENTO_SUPERIOR;
              data.sucursal_depa_superior = SUCURSAL_DEPARTAMENTO_SUPERIOR;
              data.observacion = 'no registrada';
              if (data.fila == '' || data.fila == undefined) {
                data.fila = 'error';
                mensaje = 'error'
              }
              if (SUCURSAL == undefined) {
                data.sucursal = 'No registrado';
                data.observacion = 'Sucursal no registrada';
              }
              if (DEPARTAMENTO == undefined) {
                data.departamento = 'No registrado';
                data.observacion = 'Departamento no registrada';
              }
              if (NIVEL == undefined) {
                data.nivel = 'No registrado';
                data.observacion = 'Nivel no registrada';
              }
              if (DEPARTAMENTO_SUPERIOR == undefined) {
                data.depa_superior = 'No registrado';
                data.observacion = 'Departamento superior no registrada';
              }
              if (SUCURSAL_DEPARTAMENTO_SUPERIOR == undefined) {
                data.sucursal_depa_superior = 'No registrado';
                data.observacion = 'Sucursal superior no registrada';
              }
              listNivelesDep.push(data);
            }
            data = {};
          });
        }
        // VERIFICAR EXISTENCIA DE CARPETA O ARCHIVO
        fs.access(ruta, fs.constants.F_OK, (err) => {
          if (err) {
          } else {
            // ELIMINAR DEL SERVIDOR
            fs.unlinkSync(ruta);
          }
        });
        listNivelesDep.forEach(async (item: any) => {
          if (item.observacion == 'no registrada') {
            var validSucursal = await pool.query(
              `
              SELECT id FROM e_sucursales WHERE UPPER(nombre) = $1
              `
              , [item.sucursal.toUpperCase()])
            if (validSucursal.rows[0] != undefined && validSucursal.rows[0] != '') {
              var validDeparta = await pool.query(
                `
                SELECT * FROM ed_departamentos WHERE UPPER(nombre) = $1
                `
                , [item.departamento.toUpperCase()])
              if (validDeparta.rows[0] != undefined && validDeparta.rows[0] != '') {
                var validDepaSucu = await pool.query(
                  `
                  SELECT * FROM ed_departamentos WHERE id_sucursal = $1 and UPPER(nombre) = $2
                  `
                  , [validSucursal.rows[0].id, item.departamento.toUpperCase()])
                if (validDepaSucu.rows[0] != undefined && validDepaSucu.rows[0] != '') {
                  if (regex.test(item.nivel)) {
                    if (item.nivel > 0 && item.nivel <= 5) {
                      var validDepSuperior = await pool.query(
                        `
                        SELECT * FROM ed_departamentos WHERE UPPER(nombre) = $1
                        `
                        , [item.depa_superior.toUpperCase()])
                      if (validDepSuperior.rows[0] != undefined && validDepSuperior.rows[0] != '') {
                        var validSucSuperior = await pool.query(
                          `
                          SELECT id FROM e_sucursales WHERE UPPER(nombre) = $1
                          `
                          , [item.sucursal_depa_superior.toUpperCase()])

                        if (validSucSuperior.rows[0] != undefined && validSucSuperior.rows[0] != '') {

                          var validDepaSucuSuper = await pool.query(
                            `
                            SELECT * FROM ed_departamentos WHERE id_sucursal = $1 and UPPER(nombre) = $2
                            `
                            , [validSucSuperior.rows[0].id, item.depa_superior.toUpperCase()])

                          if (validDepaSucuSuper.rows[0] != undefined && validDepaSucuSuper.rows[0] != '') {
                            var validNivelExiste = await pool.query(
                              `
                              SELECT * FROM ed_niveles_departamento 
                              WHERE UPPER(departamento) = $1 AND nivel = $2
                              `
                              , [item.departamento.toUpperCase(), item.nivel])
                            if (validNivelExiste.rows[0] != undefined && validNivelExiste.rows[0] != '') {
                              item.observacion = 'Ya existe en el sistema';
                            } else {

                              var validaDepaSuperiorNivel = await pool.query(
                                `
                                SELECT id FROM ed_niveles_departamento 
                                WHERE UPPER(departamento) = $1 AND UPPER(departamento_nombre_nivel) = $2
                                `
                                , [item.departamento.toUpperCase(), item.depa_superior.toUpperCase()])

                              if (validaDepaSuperiorNivel.rows[0] != undefined && validaDepaSuperiorNivel.rows[0] != '') {
                                item.observacion = 'Departamento superior ya se encuentra configurado';
                              } else {

                                // DISCRIMINACION DE ELEMENTOS IGUALES
                                if (duplicados.find((p: any) => p.sucursal.toLowerCase() === item.sucursal.toLowerCase() &&
                                  p.departamento.toLowerCase() === item.departamento.toLowerCase() &&
                                  p.nivel === item.nivel) == undefined) {
                                  duplicados.push(item);
                                } else {
                                  item.observacion = '1';
                                }
                              }
                            }
                          } else {
                            item.observacion = 'Departamento superior no pertenece a la sucursal';
                          }
                        } else {
                          item.observacion = 'Sucursal superior no existe en el sistema';
                        }
                      } else {
                        item.observacion = 'Departamento superior no existe en el sistema';
                      }
                    } else {
                      item.observacion = 'El nivel no puede ser 0 ni mayor a 5';
                    }
                  } else {
                    item.observacion = 'Nivel incorrecto (solo números)';
                  }
                } else {
                  item.observacion = 'Departamento no pertenece al establecimiento';
                }
              } else {
                item.observacion = 'Departamento no existe en el sistema';
              }
            } else {
              item.observacion = 'Sucursal no existe en el sistema';
            }
          }
        });
        var tiempo = 1500;
        if (listNivelesDep.length > 500 && listNivelesDep.length <= 1000) {
          tiempo = 3000;
        } else if (listNivelesDep.length > 1000) {
          tiempo = 6000;
        }
        setTimeout(() => {
          auxiListNivelDep = [];
          listNivelesDep.sort((a: any, b: any) => {
            // COMPARA LOS NUMEROS DE LOS OBJETOS
            if (a.fila < b.fila) {
              return -1;
            }
            if (a.fila > b.fila) {
              return 1;
            }
            return 0; // SON IGUALES
          });
          var filaDuplicada: number = 0;
          // VALIDACIONES DE LOS DATOS
          listNivelesDep.forEach(async (item: any) => {
            if (item.observacion != undefined) {
              let arrayObservacion = item.observacion.split(" ");
              if (arrayObservacion[0] == 'no' || item.observacion == " ") {
                item.observacion = 'ok'
                auxiListNivelDep.push(item);
              }
            }
            if (item.observacion == '1') {
              item.observacion = 'Registro duplicado'
            }
            // VALIDA SI LOS DATOS DE LA COLUMNA N SON NUMEROS.
            if (typeof item.fila === 'number' && !isNaN(item.fila)) {
              // CONDICION PARA VALIDAR SI EN LA NUMERACION EXISTE UN NUMERO QUE SE REPITE DARA ERROR.
              if (item.fila == filaDuplicada) {
                mensaje = 'error';
              }
            } else {
              return mensaje = 'error';
            }
            filaDuplicada = item.fila;
          });

          /*****  PROCESO PARA VALIDAR EL NIVEL DEL DEPARTAMENTO EN EL SISTEMA Y DENTRO DEL DOCUMENTO *****/
          // ORDENAR POR DEPARTAMENTO Y NIVEL (NIVEL EN ORDEN ASCENDENTE)
          auxiListNivelDep.sort((a: any, b: any) => {
            if (a.departamento === b.departamento) {
              // CONVIERTE LOS NIVELES A NUMEROS CUANDO SEA POSIBLE
              const nivelA = typeof a.nivel === 'number' ? a.nivel : parseInt(a.nivel, 10);
              const nivelB = typeof b.nivel === 'number' ? b.nivel : parseInt(b.nivel, 10);
              // SI AMBOS NIVELES SON NUMEROS, LOS COMPARAMOS NUMERICAMENTE
              if (!isNaN(nivelA) && !isNaN(nivelB)) {
                return nivelA - nivelB; // ORDEN DESCENDENTE POR NIVEL NUMERICO
              }
              // MANEJO DE CASOS DONDE LOS NIVELES NO SON NUMEROS
              if (isNaN(nivelA) && isNaN(nivelB)) {
                // AMBOS NIVELES NO SON NUMEROS, COMPARARLOS COMO STRINGS
                return a.nivel.toString().localeCompare(b.nivel.toString());
              }
              // SI UNO ES NUMERO Y EL OTRO NO, EL NUMERO TIENE PRIORIDAD
              if (!isNaN(nivelA)) return -1; // A TIENE UN NIVEL NUMERICO, DEBE IR ANTES
              if (!isNaN(nivelB)) return 1;  // B TIENE UN NIVEL NUMERICO, DEBE IR ANTES
              return 0;
            }
            return a.departamento.localeCompare(b.departamento);
          });
          // DISCRIMINAMOS LOS DEPARTAMENTOS REPETIDOS PARA DEJAR SOLO UN DEPARTAMENTO CON EL NIVEL MAS ALTO
          const uniqueDepartments: any = [];
          const seenDepartments: Set<string> = new Set();
          for (const obj of auxiListNivelDep) {
            if (!seenDepartments.has(obj.departamento)) {
              uniqueDepartments.push(obj);
              seenDepartments.add(obj.departamento);
            }
          }
          uniqueDepartments.forEach(async (item: any) => {
            let ValidNiveles = await pool.query(
              `
              SELECT nivel, departamento_nombre_nivel 
              FROM ed_niveles_departamento 
              WHERE UPPER(departamento) = $1 
              ORDER BY nivel DESC
              `
              , [item.departamento.toUpperCase()])

            let objauxiliar = {
              depa_superior: '',
              nivel: 0,
            }

            if (ValidNiveles.rows[0] != undefined && ValidNiveles.rows[0] != '') {
              objauxiliar = {
                depa_superior: ValidNiveles.rows[0].departamento_nombre_nivel,
                nivel: ValidNiveles.rows[0].nivel,
              }
            }
            auxiListNivelDep.forEach((valor: any) => {
              if (item.departamento.toLowerCase() == valor.departamento.toLowerCase()) {
                if (objauxiliar.nivel + 1 == valor.nivel &&
                  objauxiliar.depa_superior.toLowerCase() != valor.depa_superior.toLowerCase()) {
                  valor.observacion = 'ok nivel ' + valor.nivel;
                  objauxiliar.nivel = valor.nivel;
                  objauxiliar.depa_superior = valor.depa_superior;
                } else {
                  if (objauxiliar.nivel + 1 < valor.nivel && objauxiliar.depa_superior != valor.depa_superior) {
                    valor.observacion = 'Faltan niveles por registrar';
                  } else if (objauxiliar.depa_superior == valor.depa_superior) {
                    valor.observacion = 'Departamento superior ya esta configurado dentro de la plantilla';
                  }
                }

              }
            });
          });
          setTimeout(() => {
            listNivelesDep.forEach((item: any) => {
              auxiListNivelDep.forEach((valor: any) => {
                if (item.fila == valor.fila) {
                  let Observacion = valor.observacion.split(" ");
                  if (Observacion[0] == 'ok') {
                    item.observacion = 'ok'
                  } else {
                    item.observacion = valor.observacion
                  }
                }
              })
            })
            if (mensaje == 'error') {
              listNivelesDep = undefined;
            }
            return res.jsonp({ message: mensaje, data: listNivelesDep });
          }, 1500);
        }, tiempo)
      }
    } catch (error) {
      return res.status(500).jsonp({ message: error });
    }
  }

  // METODO PARA REGISTRAR NIVELES DE DEPARTAMENTO  **USADO
  public async CargarPlantillaNivelesDep(req: Request, res: Response) {
    const { plantilla, user_name, ip, ip_local } = req.body;
    let error: boolean = false;

    for (const data of plantilla) {
      try {
        const { sucursal, departamento, nivel, depa_superior, sucursal_depa_superior } = data;

        // INICIAR TRANSACCION
        await pool.query('BEGIN');

        var validSucursal = await pool.query(
          `
          SELECT id FROM e_sucursales WHERE UPPER(nombre) = $1
          `
          , [sucursal.toUpperCase()])

        var validDeparta = await pool.query(
          `
          SELECT id FROM ed_departamentos WHERE UPPER(nombre) = $1
          `
          , [departamento.toUpperCase()])

        var validDepSuperior = await pool.query(
          `
          SELECT id FROM ed_departamentos WHERE UPPER(nombre) = $1
          `
          , [depa_superior.toUpperCase()])

        var validSucSuperior = await pool.query(
          `
          SELECT id FROM e_sucursales WHERE UPPER(nombre) = $1
          `
          , [sucursal_depa_superior.toUpperCase()])

        // VARIABLES DE ID DE ALMACENAMIENTO
        var id_sucursal = validSucursal.rows[0].id;
        var id_departamento = validDeparta.rows[0].id;
        var id_sucuDepSuperior = validDepSuperior.rows[0].id;
        var id_depaDepSuperior = validSucSuperior.rows[0].id;

        // REGISTRO DE LOS DATOS DE CONTRATOS
        const response: QueryResult = await pool.query(
          `INSERT INTO ed_niveles_departamento (id_sucursal, id_departamento, departamento, nivel, id_departamento_nivel, departamento_nombre_nivel, id_sucursal_departamento_nivel) 
            VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *
          `
          , [id_sucursal, id_departamento, departamento, nivel, id_sucuDepSuperior, depa_superior, id_depaDepSuperior]);

        const [depaNivel] = response.rows;

        // INSERTAR AUDITORIA
        await AUDITORIA_CONTROLADOR.InsertarAuditoria({
          tabla: 'ed_niveles_departamento',
          usuario: user_name,
          accion: 'I',
          datosOriginales: '',
          datosNuevos: JSON.stringify(depaNivel),
          ip: ip,
          ip_local: ip_local,
          observacion: null
        });

        // FINALIZAR TRANSACCION
        await pool.query('COMMIT');

      } catch (error) {
        // REVERTIR TRANSACCION
        await pool.query('ROLLBACK');
        error = true;
      }
    }

    if (error) {
      return res.status(500).jsonp({ message: error });
    }

    return res.status(200).jsonp({ message: 'ok' });
  }


  // CONSULTA PARA ACTUALIZAR DEPARTAMENTOS DE USUARIOS DE MANERA MULTIPLE  **USADO
  public async ActualizarDepartamentosUsuario(req: Request, res: Response) {
    try {
      const { idDepartamento, listaUsuarios } = req.body;
      var cont = 0;
      listaUsuarios.forEach(async (item: any) => {
        let res = await pool.query(
          `
          UPDATE eu_usuario_departamento
          SET id_departamento = $1 
          WHERE id_empleado = $2
          `
          , [idDepartamento, item.id]);

        await pool.query(
          `
          UPDATE eu_empleado_cargos
          SET id_departamento = $1 
          WHERE id_contrato = $2
          `
          , [idDepartamento, item.id_contrato]);

        if (res.rowCount != 0) {
          cont = cont + 1;
        }

      })

      setTimeout(() => {
        if (cont == listaUsuarios.length) {
          return res.jsonp({ message: 'Se ha actualizado todos los registros.' })
        } else {
          return res.status(404).jsonp({ message: 'Revisar los datos, algunos registros no se actualizaron.' });
        }
      }, 1500)


    } catch (error) {
      // FINALIZAR TRANSACCION
      await pool.query('ROLLBACK');
      return res.status(500).jsonp({ message: 'Error al actualizar el registro.' });
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
    if (departamento.rowCount != 0) {
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
    if (DEPARTAMENTOS.rowCount != 0) {
      res.jsonp(DEPARTAMENTOS.rows);
    }
    else {
      return res.status(404).jsonp({ text: 'No se encuentran registros' });
    }
  }

}

export const DEPARTAMENTO_CONTROLADOR = new DepartamentoControlador();

export default DEPARTAMENTO_CONTROLADOR;