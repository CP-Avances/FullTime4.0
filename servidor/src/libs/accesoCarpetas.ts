import pool from '../database';
import path from 'path';

// METODO PARA OBTENER RUTAS ORIGINALES
export const ObtenerRuta = async function (codigo: string, identificacion: string, directorio: string) {
    let ruta = '';
    let separador = path.sep;
    ruta = path.join(__dirname, `..${separador}..`);
    return `${ruta}${separador}${directorio}${separador}${codigo}_${identificacion}`;
}

// METODO DE BUSQUEDA DE RUTAS DE ALMACENAMIENTO DE IMAGENES DE USUARIO
export const ObtenerRutaUsuario = async function (id: any) {
    let ruta = '';
    let separador = path.sep;
    const usuario = await pool.query(
        `
        SELECT codigo, identificacion FROM eu_empleados WHERE id = $1
        `
        , [id]);
    ruta = path.join(__dirname, `..${separador}..`);
    return ruta + separador + 'imagenesEmpleados' + separador + usuario.rows[0].codigo + '_' + usuario.rows[0].identificacion;
}

// METODO DE BUSQUEDA DE RUTAS DE ALMACENAMIENTO DE CARNET VACUNAS
export const ObtenerRutaVacuna = async function (id: any) {
    let ruta = '';
    let separador = path.sep;
    const usuario = await pool.query(
        `
        SELECT codigo, identificacion FROM eu_empleados WHERE id = $1
        `
        , [id]);
    ruta = path.join(__dirname, `..${separador}..`);
    return ruta + separador + 'carnetVacuna' + separador + usuario.rows[0].codigo + '_' + usuario.rows[0].identificacion;
}

// METODO DE BUSQUEDA DE RUTAS DE ALMACENAMIENTO DE PERMISOS
export const ObtenerRutaPermisos = async function (codigo: any) {
    let ruta = '';
    let separador = path.sep;
    const usuario = await pool.query(
        `
        SELECT identificacion FROM eu_empleados WHERE codigo = $1
        `
        , [codigo]);
    ruta = path.join(__dirname, `..${separador}..`);
    return ruta + separador + 'permisos' + separador + codigo + '_' + usuario.rows[0].identificacion;
}

export const ObtenerRutaPermisosIdEmpleado = async function (id_empleado: any) {
    let ruta = '';
    let separador = path.sep;
    const usuario = await pool.query(
        `
        SELECT codigo, identificacion FROM eu_empleados WHERE id = $1
        `
        , [id_empleado]);
    ruta = path.join(__dirname, `..${separador}..`);
    const codigo = usuario.rows[0].codigo;
    const carpetaPermisos = `${ruta}${separador}permisos${separador}${codigo}_${usuario.rows[0].identificacion}`;
    return { carpetaPermisos, codigo };
}
// METODO PARA OBTENER RUTA CARPETA DE PERMISOS GENERAL
export const ObtenerRutaPermisosGeneral = async function () {
    let ruta = '';
    let separador = path.sep;
    ruta = path.join(__dirname, `..${separador}..`);
    return ruta + separador + 'permisos';
}

// METODO DE BUSQUEDA DE RUTAS DE ALMACENAMIENTO DE HORAS EXTRA
export const ObtenerRutaHorasExtraIdEmpleado = async function (id_empleado: any) {
    let ruta = '';
    let separador = path.sep;
    const usuario = await pool.query(
        `
        SELECT codigo, identificacion FROM eu_empleados WHERE id = $1
        `
        , [id_empleado]);
    ruta = path.join(__dirname, `..${separador}..`);
    const codigo = usuario.rows[0].codigo;
    const carpetaHorasExtra = `${ruta}${separador}horasExtra${separador}${codigo}_${usuario.rows[0].identificacion}`;
    return { carpetaHorasExtra, codigo };
}

// METODO PARA OBTENER RUTA CARPETA DE HORAS EXTRA GENERAL
let ruta = '';
export const ObtenerRutaHorasExtraGeneral = async function () {
    let separador = path.sep;
    ruta = path.join(__dirname, `..${separador}..`);
    return ruta + separador + 'horasExtras';
}

export const ObtenerRutaHorasExtra = async function (codigo: any) {
    let ruta = '';
    let separador = path.sep;
    const usuario = await pool.query(
        `
        SELECT identificacion FROM eu_empleados WHERE codigo = $1
        `
        , [codigo]);
    ruta = path.join(__dirname, `..${separador}..`);
    return ruta + separador + 'horasExtras' + separador + codigo + '_' + usuario.rows[0].identificacion;
}

// METODO DE BUSQUEDA DE RUTAS DE ALMACENAMIENTO DE CONTRATOS DEL USUARIO
export const ObtenerRutaContrato = async function (id: any) {
    let ruta = '';
    let separador = path.sep;
    const usuario = await pool.query(
        `
        SELECT codigo, identificacion FROM eu_empleados WHERE id = $1
        `
        , [id]);
    ruta = path.join(__dirname, `..${separador}..`);
    return ruta + separador + 'contratos' + separador + usuario.rows[0].codigo + '_' + usuario.rows[0].identificacion;
}

export const ObtenerRutaHorarios = function () {
    let ruta = '';
    let separador = path.sep;
    ruta = path.join(__dirname, `..${separador}..`);
    return ruta + separador + 'horarios';
}

// METODO DE BUSQUEDA DE RUTAS DE ALMACENAMIENTO
export const ObtenerRutaDocumento = function () {
    let ruta = '';
    let separador = path.sep;
    ruta = path.join(__dirname, `..${separador}..`);
    return ruta + separador + 'documentacion';
}

// METODO DE BUSQUEDA DE RUTAS DE ALMACENAMIENTO DE IMAGENES DE MENSAJES DE NOTIFICACIONES
export const ObtenerRutaMensajeNotificacion = function () {
    let ruta = '';
    let separador = path.sep;
    ruta = path.join(__dirname, `..${separador}..`);
    return ruta + separador + 'mensajes_notificaciones';
}

// METODO DE BUSQUEDA DE RUTAS DE ALMACENAMIENTO DE LOGOS DE EMPRESA
export const ObtenerRutaLogos = function () {
    let ruta = '';
    let separador = path.sep;
    ruta = path.join(__dirname, `..${separador}..`);
    return ruta + separador + 'logos';
}

// METODO DE BUSQUEDA DE RUTAS DE ALMACENAMIENTO
export const ObtenerRutaPlatilla = function () {
    let ruta = '';
    let separador = path.sep;
    ruta = path.join(__dirname, `..${separador}..`);
    return ruta + separador + 'plantillasRegistro';
}

// METODO DE BUSQUEDA DE RUTAS DE ALMACENAMIENTO DE ARCHIVOS DE DATOS
export const ObtenerRutaLeerPlantillas = function () {
    let ruta = '';
    let separador = path.sep;
    ruta = path.join(__dirname, `..${separador}..`);
    return ruta + separador + 'plantillasRegistro';
}

// METODO PARA OBTENER POSICION DE PLANTILLA
export const ObtenerIndicePlantilla = function (libroExcel: any, hoja: string) {
    const sheet_name_list = libroExcel.worksheets.map((sheet: any) => sheet.name);
    let indice: number = 0;
    let verificador: number = 0;
    for (var i = 0; i < sheet_name_list.length; i++) {
        if ((sheet_name_list[i]).toUpperCase() === hoja.toUpperCase()) {
            indice = i;
            verificador = 1;
            break;
        }
    }
    if (verificador === 1) {
        return indice;
    }
    else {
        return false;
    }

}
