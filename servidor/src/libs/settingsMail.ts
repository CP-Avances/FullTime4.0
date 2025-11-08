import nodemailer from 'nodemailer'
import pool from '../database';
import { DateTime } from 'luxon';

// METODO DE BUSQUEDA DE CREDENCIALES DEL SERVIDOR DE CORREO
export const Credenciales = async function (id_empresa: number) {
  let credenciales = [];
  credenciales = await DatosCorreo(id_empresa);
  return credenciales;
}

// BUSQUEDA DE DATOS DEL SERVIDOR DE CORREO
async function DatosCorreo(id_empresa: number): Promise<any> {

  let credenciales = await pool.query(
    `
    SELECT correo, password_correo, nombre, logo, pie_firma, cabecera_firma, servidor, puerto
    FROM e_empresa 
    WHERE id = $1
    `
    , [id_empresa])
    .then(result => {
      return result.rows;
    })
  if (credenciales.length === 0) {
    return { message: 'error' }
  }
  else {

    var pie_firma = credenciales[0].pie_firma;
    var cabecera_firma = credenciales[0].cabecera_firma;

    if (cabecera_firma === null || cabecera_firma === '') {
      cabecera_firma = 'cabecera_firma.png';
    }

    if (pie_firma === null || pie_firma === '') {
      pie_firma = 'pie_firma.png';
    }

    let informacion = {
      email: credenciales[0].correo,
      pass: credenciales[0].password_correo,
      nombre: credenciales[0].nombre,
      logo_: credenciales[0].logo,
      servidor: credenciales[0].servidor,
      puerto: credenciales[0].puerto,
      pie_firma: pie_firma,
      cabecera_firma: cabecera_firma,
    };
    return { message: 'ok', informacion }
  }
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
    maxMessages: Infinity,
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
  const f = DateTime.now();
  // OBTENER EL DIA DE LA SEMANA EN ESPAÑOL Y CAPITALIZAR LA PRIMERA LETRA
  const dia = f.setLocale('es').toFormat('cccc').charAt(0).toUpperCase() + f.setLocale('es').toFormat('cccc').slice(1);
  const tiempo = {
    fecha_formato: f.toFormat('yyyy-MM-dd'),
    fecha: f.toFormat('dd/MM/yyyy'),
    hora: f.toFormat('HH:mm:ss'),
    dia: dia
  };

  return tiempo;
}

export const dia_abreviado: string = 'ddd';
export const dia_completo: string = 'dddd';

export const FormatearFecha = async function (fecha: string, dia: string) {
  const formato = await BuscarFecha();
  console.log(' fecha ', fecha);
  const fechaLuxon = DateTime.fromISO(fecha);
  console.log("ver fechaLuxon", fechaLuxon)

  let diaFormateado = '';
  if (dia == "dddd") {
    diaFormateado = fechaLuxon.toFormat("EEEE", { locale: 'es' })
    diaFormateado = diaFormateado.replace('.', '');
    // ASEGURAR DE QUE LA PRIMERA LETRA ESTE EN MAYUSCULA
    diaFormateado = diaFormateado.charAt(0).toUpperCase() + diaFormateado.slice(1);
  } else {
    diaFormateado = fechaLuxon.toFormat("EEE", { locale: 'es' })
    diaFormateado = diaFormateado.replace('.', '');
    // ASEGURAR DE QUE LA PRIMERA LETRA ESTE EN MAYUSCULA
    diaFormateado = diaFormateado.charAt(0).toUpperCase() + diaFormateado.slice(1);
  }
  const fechaFormateada = fechaLuxon.toFormat(formato.fecha);
  const valor = `${diaFormateado}, ${fechaFormateada}`;
  return valor;
}

export const FormatearFechaPlanificacion = async function (fecha: string, dia: string) {
  const formato = await BuscarFecha();
  const fechaLuxon = DateTime.fromJSDate(new Date(fecha));
  let diaFormateado = '';
  if (dia == "dddd") {
    diaFormateado = fechaLuxon.toFormat("EEEE", { locale: 'es' })
    diaFormateado = diaFormateado.replace('.', '');
    // ASEGURATE DE QUE LA PRIMERA LETRA ESTE EN MAYUSCULA
    diaFormateado = diaFormateado.charAt(0).toUpperCase() + diaFormateado.slice(1);
  } else {
    diaFormateado = fechaLuxon.toFormat("EEE", { locale: 'es' })
    diaFormateado = diaFormateado.replace('.', '');
    // ASEGURAR DE QUE LA PRIMERA LETRA ESTE EN MAYUSCULA
    diaFormateado = diaFormateado.charAt(0).toUpperCase() + diaFormateado.slice(1);
  }
  const fechaFormateada = fechaLuxon.toFormat(formato.fecha);

  const valor = `${diaFormateado}, ${fechaFormateada}`;

  return valor;
}


export const FormatearFecha2 = async function (fecha: string, dia: string) {

  const regex = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;
  const regexSinHora = /^\d{4}-\d{2}-\d{2}/;

  const formato = await BuscarFecha();
  if (!regex.test(fecha) && !regexSinHora.test(fecha)) {
    console
    const date = new Date(fecha);
    // OBTENER LAS PARTES DE LA FECHA Y FORMATEARLAS CON DOS DÍGITOS
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    const hours = String(date.getUTCHours()).padStart(2, '0');
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');
    const seconds = String(date.getUTCSeconds()).padStart(2, '0');

    // DEVOLVER LA FECHA FORMATEADA
    fecha = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }
  const fechaObj = DateTime.fromSQL(fecha); // UTILIZA fromSQL PARA UNA CADENA EN FORMATO 'YYYY-MM-DD HH:mm:ss' 
  // FORMATEAR EL DÍA
  if (dia == "ddd") {
    let diaFormateado = fechaObj.toFormat("EEE", { locale: 'es' });
    // LIMPIA EL DÍA FORMATEADO DE PUNTOS NO DESEADOS
    diaFormateado = diaFormateado.replace('.', '');
    // ASEGURAR DE QUE LA PRIMERA LETRA ESTE EN MAYUSCULA
    diaFormateado = diaFormateado.charAt(0).toUpperCase() + diaFormateado.slice(1);
    // FORMATEAR LA FECHA
    const fechaFormateada = fechaObj.toFormat(formato.fecha);
    let valor = `${diaFormateado}, ${fechaFormateada}`;

    return valor;
  } else if (dia == "dddd") {
    let diaFormateado = fechaObj.toFormat("EEEE", { locale: 'es' });
    // LIMPIA EL DÍA FORMATEADO DE PUNTOS NO DESEADOS
    diaFormateado = diaFormateado.replace('.', '');
    // ASEGURAR DE QUE LA PRIMERA LETRA ESTE EN MAYUSCULA
    diaFormateado = diaFormateado.charAt(0).toUpperCase() + diaFormateado.slice(1);
    // FORMATEAR LA FECHA
    const fechaFormateada = fechaObj.toFormat(formato.fecha);
    let valor = `${diaFormateado}, ${fechaFormateada}`;
    return valor;
  }
}


export const FormatearFechaBase = async function (fecha: any, dia: string) {
  const formato = await BuscarFecha();
  const fechaISO = transformDate(fecha); // CONVERTIR A ISO USANDO transformDate
  const fechaLuxon = DateTime.fromISO(fechaISO);

  // FORMATEAR EL DIA DE LA SEMANA Y LIMPIAR LOS PUNTOS
  let diaFormateado = fechaLuxon.setLocale('es').toFormat(dia).replace('.', '');
  // PRIMERA LETRA EN MAYUSCULA
  diaFormateado = diaFormateado.charAt(0).toUpperCase() + diaFormateado.slice(1);

  // FORMATEA LA FECHA SEGUN EL FORMATO OBTENIDO
  const fechaFormateada = fechaLuxon.toFormat(formato.fecha);

  const valor = `${diaFormateado}, ${fechaFormateada}`;
  return valor;
}

// FUNCION TRANSFORMDATE USANDO LUXON PARA AJUSTAR ZONAS HORARIAS Y FORMATO
function transformDate(date: any): any {
  const f = date.toString();
  let fechaSinZona = f.split(' (')[0]; // ELIMINAR LA ZONA HORARIA Y EL TEXTO ADICIONAL

  const partesFecha = fechaSinZona.split(' ');
  const mesTexto = partesFecha[1]; // MES EN FORMATO DE TEXTO ("DEC")
  const meses = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const numeroMes = meses.indexOf(mesTexto) + 1; // CONVERTIR MES A NUMERO (1-12)

  const fechaFormateada = `${partesFecha[3]}-${('0' + numeroMes).slice(-2)}-${partesFecha[2]}T${partesFecha[4]}`;
  const fechaLuxon = DateTime.fromISO(fechaFormateada, { zone: 'utc' });

  // AJUSTA LA ZONA HORARIA
  const zonaHoraria = partesFecha[5]; // "GMT-0500"
  const offset = parseInt(zonaHoraria.replace('GMT', ''));
  const fechaConZona = fechaLuxon.plus({ hours: offset });

  // DEVUELVE LA FECHA EN FORMATO ISO 8601 UTC
  return fechaConZona.toUTC().toISO();
}

export const FormatearHora = async function (hora: string) {
  console.log("ver hora: ", hora)
  const formato = await BuscarHora(); // OBTENEMOS EL FORMATO DESEADO DESDE LA FUNCIÓN
  const horaConSegundos = hora.length === 5 ? `${hora}:00` : hora;

  const horaFormateada = horaConSegundos.length === 7 ? `0${horaConSegundos}` : horaConSegundos;

  const valor = DateTime.fromFormat(horaFormateada, 'HH:mm:ss').toFormat(formato.hora);
  return valor;
};

// METODO PARA BUSCAR PARAMETRO FECHA (1)
export const BuscarFecha = async function () {
  return {
    fecha: await pool.query(
      `
      SELECT descripcion FROM ep_detalle_parametro WHERE id_parametro = 1
      `
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

// METODO PARA BUSCAR PARAMETRO HORA (2)
export const BuscarHora = async function () {
  return {
    hora: await pool.query(
      `
      SELECT descripcion FROM ep_detalle_parametro WHERE id_parametro = 2
      `
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
