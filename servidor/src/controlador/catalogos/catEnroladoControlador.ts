import { Request, Response } from 'express';
import pool from '../../database';
import excel from 'xlsx';
import fs from 'fs';
const builder = require('xmlbuilder');

class EnroladoControlador {

  public async ListarEnrolados(req: Request, res: Response) {
    const ENROLADOS = await pool.query('SELECT * FROM cg_enrolados');
    if (ENROLADOS.rowCount > 0) {
      return res.jsonp(ENROLADOS.rows)
    }
    else {
      return res.status(404).jsonp({ text: 'No se encuentran registros' });
    }
  }

  public async ObtenerUnEnrolado(req: Request, res: Response): Promise<any> {
    const { id } = req.params;
    const ENROLADOS = await pool.query('SELECT * FROM cg_enrolados WHERE id = $1', [id]);
    if (ENROLADOS.rowCount > 0) {
      return res.jsonp(ENROLADOS.rows)
    }
    else {
      return res.status(404).jsonp({ text: 'No se encuentran registros' });
    }
  }

  public async CrearEnrolado(req: Request, res: Response): Promise<void> {
    const { id_usuario, nombre, contrasenia, activo, finger, data_finger, codigo } = req.body;
    await pool.query('INSERT INTO cg_enrolados (id_usuario, nombre, contrasenia, activo, finger, data_finger, codigo) VALUES ($1, $2,$3, $4, $5, $6, $7)', [id_usuario, nombre, contrasenia, activo, finger, data_finger, codigo]);
    res.jsonp({ message: 'Se ha añadido correctamente al catálogo enrolados' });
  }

  public async ObtenerRegistroEnrolado(req: Request, res: Response): Promise<any> {
    const { id_usuario } = req.params;
    const ENROLADOS = await pool.query('SELECT id FROM cg_enrolados WHERE id_usuario = $1', [id_usuario]);
    if (ENROLADOS.rowCount > 0) {
      return res.jsonp(ENROLADOS.rows);
    }
    else {
      return res.status(404).jsonp({ text: 'No se ha encontrado en el catálogo enrolados' });
    }
  }

  public async ObtenerUltimoId(req: Request, res: Response) {
    const ENROLADOS = await pool.query('SELECT MAX(id) FROM cg_enrolados');
    if (ENROLADOS.rowCount > 0) {
      return res.jsonp(ENROLADOS.rows)
    }
    else {
      return res.status(404).jsonp({ text: 'No se encuentran registros' });
    }
  }

  public async ActualizarEnrolado(req: Request, res: Response): Promise<void> {
    const { id_usuario, nombre, contrasenia, activo, finger, data_finger, codigo, id } = req.body;
    await pool.query('UPDATE cg_enrolados SET id_usuario = $1, nombre = $2, contrasenia = $3, activo = $4, finger = $5, data_finger = $6, codigo = $7 WHERE id = $8', [id_usuario, nombre, contrasenia, activo, finger, data_finger, codigo, id]);
    res.jsonp({ message: 'Usuario Enrolado actualizado exitosamente' });
  }

  public async EliminarEnrolado(req: Request, res: Response): Promise<void> {
    const id = req.params.id;
    await pool.query('DELETE FROM cg_enrolados WHERE id = $1', [id]);
    res.jsonp({ message: 'Registro eliminado.' });
  }

  public async CargaPlantillaEnrolado(req: Request, res: Response): Promise<void> {
    let list: any = req.files;
    let cadena = list.uploads[0].path;
    let filename = cadena.split("\\")[1];
    var filePath = `./plantillas/${filename}`

    const workbook = excel.readFile(filePath);
    const sheet_name_list = workbook.SheetNames;
    const plantilla = excel.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);

    plantilla.forEach(async (data: any) => {
      const { cedula, contrasenia, finger, data_finger } = data;

      //Nombre, Apellido, Código e id_usuario del empleado
      const datosEmpleado = await pool.query('SELECT id, nombre, apellido, codigo, estado FROM empleados WHERE cedula = $1', [cedula]);
      let nombre = datosEmpleado.rows[0]['nombre'] + ' ' + datosEmpleado.rows[0]['apellido'];
      let codigo = parseInt(datosEmpleado.rows[0]['codigo']);
      if (datosEmpleado.rows[0]['estado'] === 1) {
        var activo = true;
      } else {
        activo = false;
      }

      const id_usuario = await pool.query('SELECT id FROM usuarios WHERE id_empleado = $1', [datosEmpleado.rows[0]['id']]);

      if (cedula != undefined) {
        await pool.query('INSERT INTO cg_enrolados (id_usuario, nombre, contrasenia, activo, finger, data_finger, codigo) VALUES ($1, $2,$3, $4, $5, $6, $7)', [id_usuario.rows[0]['id'], nombre, contrasenia, activo, finger, data_finger, codigo]);
      } else {
        res.jsonp({ error: 'plantilla equivocada' });
      }
    });

    res.jsonp({ message: 'La plantilla a sido receptada' });
    fs.unlinkSync(filePath);
  }

  public async FileXML(req: Request, res: Response): Promise<any> {
    var xml = builder.create('root').ele(req.body).end({ pretty: true });
    console.log(req.body.userName);
    let filename = "Enrolados-" + req.body.userName + '-' + req.body.userId + '-' + new Date().getTime() + '.xml';
    fs.writeFile(`xmlDownload/${filename}`, xml, function (err) {
      if (err) {
        return console.log(err);
      }
      console.log("Archivo guardado");
    });
    res.jsonp({ text: 'XML creado', name: filename });
  }

  public async downloadXML(req: Request, res: Response): Promise<any> {
    const name = req.params.nameXML;
    let filePath = `servidor\\xmlDownload\\${name}`
    res.sendFile(__dirname.split("servidor")[0] + filePath);
  }

  public async ObtenerDatosEmpleado(req: Request, res: Response): Promise<any> {
    const { usuario } = req.params;
    const ENROLADOS = await pool.query('SELECT e.id, e.nombre, e.apellido, e.cedula, e.codigo, e.estado, u.id FROM empleados AS e, usuarios AS u WHERE e.id = u.id_empleado AND u.usuario = $1', [usuario]);
    if (ENROLADOS.rowCount > 0) {
      return res.jsonp(ENROLADOS.rows);
    }
    else {
      return res.status(404).jsonp({ text: 'No se ha encontrado registros' });
    }
  }

}

export const ENROLADOS_CONTROLADOR = new EnroladoControlador();

export default ENROLADOS_CONTROLADOR;