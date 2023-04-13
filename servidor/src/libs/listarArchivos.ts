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
        SELECT * FROM documentacion ORDER BY id
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
                        nombre: doc.doc_nombre
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

    let archivos: any = [];

    const ruta = path.resolve(nombre_carpeta)

    let Lista_Archivos: any = fs.readdirSync(ruta);

    console.log('contratos.. ', Lista_Archivos)

    // CONSULTA DE BUSQUEDA DE DOCUMENTOS
    let documentos = await pool.query(
        `
        SELECT * FROM empl_contratos WHERE documento NOTNULL ORDER BY id
        `
    ).then(result => { return result.rows });

    console.log('contratos base .. ', documentos)

    if (documentos.length != 0) {
        documentos.forEach((doc: any) => {
            Lista_Archivos.forEach((obj: any) => {
                if (doc.documento === obj) {
                    let datos = {
                        id: doc.id,
                        file: obj,
                        extencion: obj.split('.')[1],
                        nombre: doc.doc_nombre
                    }
                    archivos = archivos.concat(datos);
                }
            })
        })
    }
    return archivos
}

// LISTAR ARCHIVOS DE PERMISOS
export const ListarPermisos = async function (nombre_carpeta: string) {

    let archivos: any = [];

    const ruta = path.resolve(nombre_carpeta)

    let Lista_Archivos: any = fs.readdirSync(ruta);

    console.log('permisos.. ', Lista_Archivos)

    // CONSULTA DE BUSQUEDA DE DOCUMENTOS
    let documentos = await pool.query(
        `
        SELECT * FROM permisos WHERE documento NOTNULL ORDER BY id
        `
    ).then(result => { return result.rows });

    console.log('permisos base .. ', documentos)

    if (documentos.length != 0) {
        documentos.forEach((doc: any) => {
            Lista_Archivos.forEach((obj: any) => {
                if (doc.documento === obj) {
                    let datos = {
                        id: doc.id,
                        file: obj,
                        extencion: obj.split('.')[1],
                        nombre: doc.docu_nombre
                    }
                    archivos = archivos.concat(datos);
                }
            })
        })
    }
    return archivos
}

// LISTAR ARCHIVOS DE PERMISOS
export const ListarHorarios = async function (nombre_carpeta: string) {

    let archivos: any = [];

    const ruta = path.resolve(nombre_carpeta)

    let Lista_Archivos: any = fs.readdirSync(ruta);

    console.log('horarios.. ', Lista_Archivos)

    // CONSULTA DE BUSQUEDA DE DOCUMENTOS
    let documentos = await pool.query(
        `
        SELECT * FROM cg_horarios WHERE documento NOTNULL ORDER BY id
        `
    ).then(result => { return result.rows });

    console.log('horarios base .. ', documentos)

    if (documentos.length != 0) {
        documentos.forEach((doc: any) => {
            Lista_Archivos.forEach((obj: any) => {
                if (doc.documento === obj) {
                    let datos = {
                        id: doc.id,
                        file: obj,
                        extencion: obj.split('.')[1],
                        nombre: doc.doc_nombre
                    }
                    archivos = archivos.concat(datos);
                }
            })
        })
    }
    return archivos
}

export const DescargarArchivo = function (dir: string, filename: string) {
    const ruta = path.resolve(dir);
    return ruta + '\\' + filename
}
















// LISTAR ARCHIVOS DE CONTRATOS
export const VerCarpeta = async function () {
    let carpeta = 'casa_pazmino'
    // CONSULTA DE BUSQUEDA DE DOCUMENTOS
    let documentos = await pool.query(
        `
         SELECT * FROM documentacion ORDER BY id
         `
    ).then(result => { return result.rows });

    if (documentos.length != 0) {
        documentos.forEach((doc: any) => {

        })
    }

    return carpeta
}

