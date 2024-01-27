import pool from '../database';
import path from 'path';

// METODO DE BUSQUEDA DE RUTAS DE ALMACENAMIENTO DE IMAGENES DE USUARIO
export const ObtenerRutaUsuario = async function (id: any) {
    let ruta = '';
    let separador = path.sep;
    const usuario = await pool.query(
        `
        SELECT codigo, cedula FROM empleados WHERE id = $1
        `
        , [id]);

    console.log('ruta instalacion ', __dirname)
    ruta = path.join(__dirname, `..${separador}..`);
    console.log('ver ruta imagen libs ', ruta + separador + 'imagenesEmpleados' + separador + usuario.rows[0].codigo + '_' + usuario.rows[0].cedula)
    return ruta + separador + 'imagenesEmpleados' + separador + usuario.rows[0].codigo + '_' + usuario.rows[0].cedula;
}

// METODO DE BUSQUEDA DE RUTAS DE ALMACENAMIENTO DE CARNET VACUNAS
export const ObtenerRutaVacuna = async function (id: any) {
    let ruta = '';
    let separador = path.sep;
    console.log('ruta instalacion ', __dirname)
    const usuario = await pool.query(
        `
        SELECT codigo, cedula FROM empleados WHERE id = $1
        `
        , [id]);

    ruta = path.join(__dirname, `..${separador}..`);
    console.log('ver ruta imagen libs ', ruta + separador + 'carnetVacuna' + separador + usuario.rows[0].codigo + '_' + usuario.rows[0].cedula)
    return ruta + separador + 'carnetVacuna' + separador + usuario.rows[0].codigo + '_' + usuario.rows[0].cedula;
}

// METODO DE BUSQUEDA DE RUTAS DE ALMACENAMIENTO DE PERMISOS
export const ObtenerRutaPermisos = async function (codigo: any) {
    let ruta = '';
    let separador = path.sep;
    const usuario = await pool.query(
        `
        SELECT cedula FROM empleados WHERE codigo = $1
        `
        , [codigo]);

    console.log('ruta instalacion ', __dirname)
    ruta = path.join(__dirname, `..${separador}..`);
    console.log('ver ruta imagen libs ', ruta + separador + 'permisos' + separador + codigo + '_' + usuario.rows[0].cedula)
    return ruta + separador + 'permisos' + separador + codigo + '_' + usuario.rows[0].cedula;
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

// METODO DE BUSQUEDA DE RUTAS DE ALMACENAMIENTO DE IMAGENES DE CUMPLEANIO
export const ObtenerRutaBirthday = function () {
    let ruta = '';
    let separador = path.sep;
    ruta = path.join(__dirname, `..${separador}..`);
    return ruta + separador + 'cumpleanios';
}

// METODO DE BUSQUEDA DE RUTAS DE ALMACENAMIENTO DE LOGOS DE EMPRESA
export const ObtenerRutaLogos = function () {
    let ruta = '';
    let separador = path.sep;
    ruta = path.join(__dirname, `..${separador}..`);
    return ruta + separador + 'logos';
}

// METODO DE BUSQUEDA DE RUTAS DE ALMACENAMIENTO DE CONTRATOS DEL USUARIO
export const ObtenerRutaContrato = async function (id: any) {
    let ruta = '';
    let separador = path.sep;
    const usuario = await pool.query(
        `
        SELECT codigo, cedula FROM empleados WHERE id = $1
        `
        , [id]);

    ruta = path.join(__dirname, `..${separador}..`);

    return ruta + separador + 'contratos' + separador + usuario.rows[0].codigo + '_' + usuario.rows[0].cedula;
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
    return ruta + separador + 'leerPlantillas';
}