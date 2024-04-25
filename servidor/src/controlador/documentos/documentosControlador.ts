import { DescargarArchivo, listaCarpetas, ListarContratos, ListarDocumentos, ListarHorarios, ListarPermisos, ListarDocumentosIndividuales, DescargarArchivoIndividuales } from '../../libs/listarArchivos';
import { ObtenerRutaDocumento } from '../../libs/accesoCarpetas';
import { Request, Response } from 'express';
import AUDITORIA_CONTROLADOR from '../auditoria/auditoriaControlador';
import pool from '../../database';
import path from 'path';
import fs from 'fs';
import moment from 'moment';
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
        res.jsonp(carpetas)
    }

    // METODO PARA LISTAR DOCUMENTOS 
    public async ListarCarpetaDocumentos(req: Request, res: Response) {
        let nombre = req.params.nom_carpeta;
        res.jsonp(await ListarDocumentos(nombre));
    }

    // METODO PARA LISTAR ARCHIVOS DE LA CARPETA CONTRATOS
    public async ListarCarpetaContratos(req: Request, res: Response) {
        let nombre = req.params.nom_carpeta;
        res.jsonp(await ListarContratos(nombre));
    }

    // METODO PARA LISTAR ARCHIVOS DE LA CARPETA PERMISOS
    public async ListarCarpetaPermisos(req: Request, res: Response) {
        let nombre = req.params.nom_carpeta;
        res.jsonp(await ListarPermisos(nombre));
    }

    // METODO PARA LISTAR ARCHIVOS DE LA CARPETA PERMISOS
    public async ListarArchivosIndividuales(req: Request, res: Response) {
        let nombre = req.params.nom_carpeta;
        let tipo = req.params.tipo;
        res.jsonp(await ListarDocumentosIndividuales(nombre, tipo));
    }

    // METODO PARA LISTAR ARCHIVOS DE LA CARPETA HORARIOS
    public async ListarCarpetaHorarios(req: Request, res: Response) {
        let nombre = req.params.nom_carpeta;
        res.jsonp(await ListarHorarios(nombre));
    }

    // METODO LISTAR ARCHIVOS DE CARPETAS
    public async ListarArchivosCarpeta(req: Request, res: Response) {
        let nombre = req.params.nom_carpeta;
        res.jsonp(await listaCarpetas(nombre));
    }

    // METODO PARA DESCARGAR ARCHIVOS
    public async DownLoadFile(req: Request, res: Response) {
        let nombre = req.params.nom_carpeta;
        let filename = req.params.filename;
        const path_ = DescargarArchivo(nombre, filename);
        fs.access(path_, fs.constants.F_OK, (err) => {
            if (err) {
            } else {
                res.sendFile(path.resolve(path_));
            }
        });
    }

    // METODO PARA DESCARGAR ARCHIVOS INDIVIDUALES
    public async DescargarArchivos(req: Request, res: Response) {
        let nombre = req.params.nom_carpeta;
        let filename = req.params.filename;
        let tipo = req.params.tipo;
        const path_ = DescargarArchivoIndividuales(nombre, filename, tipo);
        fs.access(path_, fs.constants.F_OK, (err) => {
            if (err) {
            } else {
                res.sendFile(path.resolve(path_));
            }
        });
    }

    // METODO PARA ELIMINAR REGISTROS DE DOCUMENTACION
    public async EliminarRegistros(req: Request, res: Response): Promise<Response> {
        try {
            // TODO ANALIZAR COMOOBTENER USER_NAME E IP DESDE EL FRONT
            const { user_name, ip } = req.body;
            let { id, documento } = req.params;

            // INICIAR TRANSACCION
            await pool.query('BEGIN');

            // CONSULTAR DATOSORIGINALES
            const doc = await pool.query('SELECT * FROM documentacion WHERE id = $1', [id]);
            const [datosOriginales] = doc.rows;

            if (!datosOriginales) {
                // AUDITORIA
                await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                    tabla: 'documentacion',
                    usuario: user_name,
                    accion: 'D',
                    datosOriginales: '',
                    datosNuevos: '',
                    ip,
                    observacion: `Error al eliminar el documento con id ${id}`
                });

                // FINALIZAR TRANSACCION
                await pool.query('COMMIT');
                return res.status(404).jsonp({ message: 'Error al eliminar el registro.' });
            }

            await pool.query(
                `
                DELETE FROM documentacion WHERE id = $1
                `
                , [id]);
            
            // AUDITORIA
            await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                tabla: 'documentacion',
                usuario: user_name,
                accion: 'D',
                datosOriginales: JSON.stringify(datosOriginales),
                datosNuevos: '',
                ip,
                observacion: null
            });

            // FINALIZAR TRANSACCION
            await pool.query('COMMIT');
    
            let separador = path.sep;
    
            let ruta = ObtenerRutaDocumento() + separador + documento;
            // VERIFICAR EXISTENCIA DE CARPETA O ARCHIVO
            fs.access(ruta, fs.constants.F_OK, (err) => {
                if (err) {
                } else {
                    // ELIMINAR DEL SERVIDOR
                    fs.unlinkSync(ruta);
                }
            });
    
            return res.jsonp({ message: 'Registro eliminado.' });
        } catch (error) {
            // REVERTIR TRANSACCION
            await pool.query('ROLLBACK');
            return res.status(404).jsonp({ message: 'Error al eliminar el registro.' });
        }
    }

    // METODO PARA REGISTRAR UN DOCUMENTO    --**VERIFICADO
    public async CrearDocumento(req: Request, res: Response): Promise<void> {
        try {
            // TODO ANALIZAR COMOOBTENER USER_NAME E IP DESDE EL FRONT
            const { user_name, ip } = req.body;

            // FECHA DEL SISTEMA
            var fecha = moment();
            var anio = fecha.format('YYYY');
            var mes = fecha.format('MM');
            var dia = fecha.format('DD');
    
            let documento = anio + '_' + mes + '_' + dia + '_' + req.file?.originalname;
    
            // INICIAR TRANSACCION
            await pool.query('BEGIN');
            
            await pool.query(
                `
                INSERT INTO documentacion (documento) VALUES ($1)
                `
                , [documento]);
            
            // AUDITORIA
            await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                tabla: 'documentacion',
                usuario: user_name,
                accion: 'I',
                datosOriginales: '',
                datosNuevos: JSON.stringify({ documento }),
                ip,
                observacion: null
            });

            // FINALIZAR TRANSACCION
            await pool.query('COMMIT');
            res.jsonp({ message: 'Registro guardado.' });
        } catch (error) {
            // REVERTIR TRANSACCION
            await pool.query('ROLLBACK');
            res.status(404).jsonp({ message: 'Error al guardar el registro.' });
        }
    }

}

export const DOCUMENTOS_CONTROLADOR = new DocumentosControlador();

export default DOCUMENTOS_CONTROLADOR;