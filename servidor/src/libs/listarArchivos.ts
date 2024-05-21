import fs from 'fs';
import path from 'path';
import pool from '../database';


export const listaCarpetas = function (nombre_carpeta: string) {

    const ruta = path.resolve(nombre_carpeta)

    let Lista_Archivos: any = fs.readdirSync(ruta);

    return Lista_Archivos.map((obj: any) => {
        return {
            file: obj,
            extencion: obj.split('.')[1]
        }
    })
}


// LISTAR ARCHIVOS DE DOCUMENTACION
export const ListarDocumentos = async function (nombre_carpeta: string) {

    let archivos: any = [];

    const ruta = path.resolve(nombre_carpeta)

    let Lista_Archivos: any = fs.readdirSync(ruta);

    // CONSULTA DE BUSQUEDA DE DOCUMENTOS
    let documentos = await pool.query(
        `
        SELECT * FROM e_documentacion ORDER BY id
        `
    ).then(result => { return result.rows });

    if (documentos.length != 0) {
        documentos.forEach((doc: any) => {
            Lista_Archivos.forEach((obj: any) => {
                if (doc.documento === obj) {
                    let datos = {
                        id: doc.id,
                        file: obj,
                        extencion: obj.split('.')[1],
                        nombre: doc.documento
                    }
                    archivos = archivos.concat(datos);
                }
            })
        })
    }
    return archivos
}

// LISTAR ARCHIVOS DE CONTRATOS
export const ListarContratos = async function (nombre_carpeta: string) {

    const ruta = path.resolve(nombre_carpeta)

    let Lista_Archivos: any = fs.readdirSync(ruta);

    return Lista_Archivos
}

// LISTAR ARCHIVOS DE PERMISOS
export const ListarPermisos = async function (nombre_carpeta: string) {

    const ruta = path.resolve(nombre_carpeta)

    let Lista_Archivos: any = fs.readdirSync(ruta);

    return Lista_Archivos
}

// LISTAR ARCHIVOS DE PERMISOS
export const ListarDocumentosIndividuales = async function (nombre_carpeta: string, tipo: string) {

    let archivos: any = [];
    let separador = path.sep;
    let direccion = tipo + separador + nombre_carpeta

    const ruta = path.resolve(direccion)

    let Lista_Archivos: any = fs.readdirSync(ruta);

    Lista_Archivos.forEach((obj: any) => {
        let datos = {
            file: obj,
            extencion: obj.split('.')[1],
            nombre: obj
        }
        archivos = archivos.concat(datos);
    })

    return archivos
}

// LISTAR ARCHIVOS DE PERMISOS
export const ListarHorarios = async function (nombre_carpeta: string) {

    let archivos: any = [];

    const ruta = path.resolve(nombre_carpeta)

    let Lista_Archivos: any = fs.readdirSync(ruta);

    // CONSULTA DE BUSQUEDA DE DOCUMENTOS
    let documentos = await pool.query(
        `
        SELECT * FROM eh_cat_horarios WHERE documento NOTNULL ORDER BY id
        `
    ).then(result => { return result.rows });

    if (documentos.length != 0) {
        documentos.forEach((doc: any) => {
            Lista_Archivos.forEach((obj: any) => {
                if (doc.documento === obj) {
                    let datos = {
                        id: doc.id,
                        file: obj,
                        extencion: obj.split('.')[1],
                        nombre: doc.documento
                    }
                    archivos = archivos.concat(datos);
                }
            })
        })
    }
    return archivos
}

export const DescargarArchivo = function (dir: string, filename: string) {
    let separador = path.sep;
    const ruta = path.resolve(dir);
    return ruta + separador + filename
}

export const DescargarArchivoIndividuales = function (dir: string, filename: string, tipo: any) {
    let separador = path.sep;
    const ruta = path.resolve(dir);
    return ruta + separador + tipo + separador + filename
}














// LISTAR ARCHIVOS DE CONTRATOS
export const VerCarpeta = async function () {
    let carpeta = 'casa_pazmino'
    // CONSULTA DE BUSQUEDA DE DOCUMENTOS
    let documentos = await pool.query(
        `
         SELECT * FROM e_documentacion ORDER BY id
         `
    ).then(result => { return result.rows });

    if (documentos.length != 0) {
        documentos.forEach((doc: any) => {

        })
    }

    return carpeta
}

