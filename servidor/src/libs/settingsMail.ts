import nodemailer from 'nodemailer'
import pool from '../database';

import moment from 'moment';
moment.locale('es');

export let email: string = process.env.EMAIL || '';
let pass: string = process.env.PASSWORD || '';
export let nombre: string = process.env.NOMBRE || '';
export let logo_: string = process.env.LOGO || '';
export let pie_firma: string = process.env.PIEF || '';
export let cabecera_firma: string = process.env.CABECERA || '';
export let servidor: string = process.env.SERVIDOR || '';
export let puerto: string = process.env.PUERTO || '';

export const Credenciales =
  async function (id_empresa: number, correo = process.env.EMAIL!,
    password = process.env.PASSWORD!, empresa = process.env.NOMBRE!,
    img = process.env.LOGO!, img_pie = process.env.PIEF!,
    img_cabecera = process.env.CABECERA!, port = process.env.PUERTO!,
    host = process.env.SERVIDOR!) {
    let credenciales = [];
    credenciales = await DatosCorreo(id_empresa);

    return credenciales.message;

  }


async function DatosCorreo(id_empresa: number): Promise<any> {

  let credenciales = await pool.query('SELECT correo, password_correo, nombre, logo, pie_firma, cabecera_firma, servidor, puerto ' +
    'FROM cg_empresa WHERE id = $1', [id_empresa])
    .then(result => {
      return result.rows;
    })
  console.log('correo... ', credenciales)
  if (credenciales.length === 0) {
    return { message: 'error' }
  }
  else {
    email = credenciales[0].correo;
    pass = credenciales[0].password_correo;
    nombre = credenciales[0].nombre;
    logo_ = credenciales[0].logo;
    pie_firma = credenciales[0].pie_firma;
    cabecera_firma = credenciales[0].cabecera_firma;
    servidor = credenciales[0].servidor;
    puerto = credenciales[0].puerto;

    if (cabecera_firma === null || cabecera_firma === '') {
      cabecera_firma = 'cabecera_firma.png';
    }

    if (pie_firma === null || pie_firma === '') {
      pie_firma = 'pie_firma.png';
    }
    return { message: 'ok' }
  }

}

export const enviarMail = function (servidor: any, puerto: number) {
  var seguridad: boolean = false;
  if (puerto === 465) {
    seguridad = true;
  } else {
    seguridad = false;
  }

  const transporter = nodemailer.createTransport({
    //pool: true,
    host: servidor,
    port: puerto,
    secure: seguridad,
    auth: {
      user: email,
      pass: pass
    },
  });

  return transporter;
}

export const enviarCorreos = function (servidor: any, puerto: number, email: string, pass: string) {
  var seguridad: boolean = false;
  if (puerto === 465) {
    seguridad = true;
  } else {
    seguridad = false;
  }

  const transporter = nodemailer.createTransport({
    pool: true,
    //maxConnections: 2,
    maxMessages: Infinity,
    //rateLimit: 14, // 14 emails/second max
    //rateDelta: 1000,
    host: servidor,
    port: puerto,
    secure: seguridad,
    auth: {
      user: email,
      pass: pass
    },
  });

  return transporter;
}

export const fechaHora = function () {
  var f = moment();
  var dia = moment.weekdays(moment(f.format('YYYY-MM-DD')).day()).charAt(0).toUpperCase()
    + moment.weekdays(moment(f.format('YYYY-MM-DD')).day()).slice(1);
  var tiempo = {
    fecha_formato: f.format('YYYY-MM-DD'),
    fecha: f.format('DD/MM/YYYY'),
    hora: f.format('HH:mm:ss'),
    dia: dia
  }
  return tiempo;
}

export const dia_abreviado: string = 'ddd';
export const dia_completo: string = 'dddd';

export const FormatearFecha = async function (fecha: string, dia: string) {
  let formato = await BuscarFecha();
  let valor = moment(fecha).format(dia).charAt(0).toUpperCase() +
    moment(fecha).format(dia).slice(1) +
    ', ' + moment(fecha).format(formato.fecha);
  return valor;
}

export const FormatearHora = async function (hora: string) {
  let formato = await BuscarHora();
  let valor = moment(hora, 'HH:mm:ss').format(formato.hora);
  return valor;
}

export const BuscarFecha = async function () {
  return {
    fecha: await pool.query(
      `SELECT descripcion FROM detalle_tipo_parametro WHERE id_tipo_parametro = 25`
    ).then(result => {
      if (result.rowCount != 0) {
        return result.rows[0].descripcion;
      }
      else {
        return 'DD/MM/YYYY';
      }
    })
  }
}

export const BuscarHora = async function () {
  return {
    hora: await pool.query(
      `SELECT descripcion FROM detalle_tipo_parametro WHERE id_tipo_parametro = 26`
    ).then(result => {
      if (result.rowCount != 0) {
        return result.rows[0].descripcion;
      }
      else {
        return 'HH:mm:ss';
      }
    })
  }
}
