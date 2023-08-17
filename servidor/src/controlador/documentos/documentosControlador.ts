import { DescargarArchivo, listaCarpetas, ListarContratos, ListarDocumentos, ListarHorarios, ListarPermisos, VerCarpeta } from '../../libs/listarArchivos';
import { Request, Response } from 'express';
import pool from '../../database';
import path from 'path';
import fs from 'fs';
export var carpeta: any;

class DocumentosControlador {

    // METODO PARA MOSTRAR LISTA DE CARPETAS DEL SERVIDOR
    public Carpetas(req: Request, res: Response) {
        let carpetas = [
            { nombre: 'Contratos', filename: 'contratos' },
            { nombre: 'Respaldos Horarios', filename: 'horarios' },
            { nombre: 'Respaldos Permisos', filename: 'permisos' },
            { nombre: 'Documentacion', filename: 'documentacion' }
        ]
        res.status(200).jsonp(carpetas)
    }

    // METODO PARA LISTAR DOCUMENTOS 
    public async ListarCarpetaDocumentos(req: Request, res: Response) {
        let nombre = req.params.nom_carpeta;
        res.status(200).jsonp(await ListarDocumentos(nombre));
    }

    // METODO PARA LISTAR ARCHIVOS DE LA CARPETA CONTRATOS
    public async ListarCarpetaContratos(req: Request, res: Response) {
        let nombre = req.params.nom_carpeta;
        res.status(200).jsonp(await ListarContratos(nombre));
    }

    // METODO PARA LISTAR ARCHIVOS DE LA CARPETA PERMISOS
    public async ListarCarpetaPermisos(req: Request, res: Response) {
        let nombre = req.params.nom_carpeta;
        res.status(200).jsonp(await ListarPermisos(nombre));
    }

    // METODO PARA LISTAR ARCHIVOS DE LA CARPETA HORARIOS
    public async ListarCarpetaHorarios(req: Request, res: Response) {
        let nombre = req.params.nom_carpeta;
        res.status(200).jsonp(await ListarHorarios(nombre));
    }

    // METODO LISTAR ARCHIVOS DE CARPETAS
    public async ListarArchivosCarpeta(req: Request, res: Response) {
        let nombre = req.params.nom_carpeta;
        res.status(200).jsonp(await listaCarpetas(nombre));
    }

    // METODO PARA DESCARGAR ARCHIVOS
    public async DownLoadFile(req: Request, res: Response) {
        let nombre = req.params.nom_carpeta;
        let filename = req.params.filename;
        const path = DescargarArchivo(nombre, filename);
        res.status(200).sendFile(path);
    }

    // METODO PARA ELIMINAR REGISTROS DE DOCUMENTACION
    public async EliminarRegistros(req: Request, res: Response): Promise<void> {
        let { id, documento } = req.params;
        await pool.query(
            `
            DELETE FROM documentacion WHERE id = $1
            `
            , [id]);

        let separador = path.sep;
        let filePath = `servidor${separador}documentacion${separador}${documento}`
        let direccionCompleta = __dirname.split("servidor")[0] + filePath;
        fs.unlinkSync(direccionCompleta);

        res.jsonp({ message: 'Registro eliminado.' });
    }

    // METODO PARA REGISTRAR UN DOCUMENTO    --**VERIFICADO
    public async CrearDocumento(req: Request, res: Response): Promise<void> {
        let documento = req.file?.originalname;
        await pool.query(
            `
            INSERT INTO documentacion (documento) VALUES ($1)
            `
            , [documento]);
        res.jsonp({ message: 'Registro guardado.' });
    }

}

export const DOCUMENTOS_CONTROLADOR = new DocumentosControlador();

export default DOCUMENTOS_CONTROLADOR;