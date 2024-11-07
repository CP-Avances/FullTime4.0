import DOCUMENTOS_CONTROLADOR from '../../controlador/documentos/documentosControlador';
import { ObtenerRutaDocumento } from '../../libs/accesoCarpetas';
import { TokenValidation } from '../../libs/verificarToken';
import { DateTime } from 'luxon';
import { Router } from 'express';
import multer from 'multer';

const storage = multer.diskStorage({

    destination: function (req, file, cb) {
        cb(null, ObtenerRutaDocumento())
    },
    filename: function (req, file, cb) {
        // FECHA DEL SISTEMA
        var fecha = DateTime.now();
        var anio = fecha.toFormat('yyyy');
        var mes = fecha.toFormat('MM');
        var dia = fecha.toFormat('dd');

        let documento = anio + '_' + mes + '_' + dia + '_' + file.originalname;

        cb(null, documento)
    }
})

const upload = multer({ storage: storage });


class DoumentosRutas {
    public router: Router = Router();

    constructor() {
        this.configuracion();
    }

    configuracion(): void {

        // METODO PARA REGISTRAR DOCUMENTOS   **USADO
        this.router.post('/registrar/:doc_nombre', TokenValidation, upload.single('uploads'), DOCUMENTOS_CONTROLADOR.CrearDocumento);
        // METODO PARA LISTAR CARPETAS    **USADO
        this.router.get('/carpetas/', DOCUMENTOS_CONTROLADOR.Carpetas);
        // METODO PARA LISTAR ARCHIVOS DE CARPETAS     **USADO
        this.router.get('/lista-carpetas/:nom_carpeta', DOCUMENTOS_CONTROLADOR.ListarArchivosCarpeta);
        // METODO PARA LISTAR DOCUMENTOS DE DOCUMENTACION  **USADO
        this.router.get('/documentacion/:nom_carpeta', DOCUMENTOS_CONTROLADOR.ListarCarpetaDocumentos);
        // METODO PARA LISTAR DOCUMENTOS DE CONTRATOS     **USADO
        this.router.get('/lista-contratos/:nom_carpeta', DOCUMENTOS_CONTROLADOR.ListarCarpetaContratos);
        // METODO PARA LISTAR DOCUMENTOS DE PERMISOS            **USADO
        this.router.get('/lista-permisos/:nom_carpeta', DOCUMENTOS_CONTROLADOR.ListarCarpetaPermisos);
        // METODO PARA LISTAR ARCHIVOS INDIVIDUALES     **USADO
        this.router.get('/lista-archivos-individuales/:nom_carpeta/tipo/:tipo', DOCUMENTOS_CONTROLADOR.ListarArchivosIndividuales);
        // METODO PARA LISTAR DOCUMENTOS DE HORARIOS    **USADO
        this.router.get('/lista-horarios/:nom_carpeta', DOCUMENTOS_CONTROLADOR.ListarCarpetaHorarios);
        // METODO PARA DESCARGAR ARCHIVOS     **USADO
        this.router.get('/download/files/:nom_carpeta/:filename', DOCUMENTOS_CONTROLADOR.DownLoadFile);
        // METODO PARA DESCARGAR ARCHIVOS INDIVIDUALES    **USADO
        this.router.get('/download/files/:nom_carpeta/:filename/tipo/:tipo', DOCUMENTOS_CONTROLADOR.DescargarArchivos);
        // METODO PARA ELIMINAR ARCHIVOS     **USADO
        this.router.delete('/eliminar/:id/:documento', TokenValidation, DOCUMENTOS_CONTROLADOR.EliminarRegistros);

    }

}

const DOCUMENTOS_RUTAS = new DoumentosRutas();

export default DOCUMENTOS_RUTAS.router;