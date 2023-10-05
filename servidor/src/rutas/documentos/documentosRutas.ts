import moment from 'moment';
import DOCUMENTOS_CONTROLADOR from '../../controlador/documentos/documentosControlador';
import { ObtenerRutaDocumento } from '../../libs/accesoCarpetas';
import { TokenValidation } from '../../libs/verificarToken';
import { Router } from 'express';
import multer from 'multer';

const storage = multer.diskStorage({

    destination: function (req, file, cb) {
        cb(null, ObtenerRutaDocumento())
    },
    filename: function (req, file, cb) {
        // FECHA DEL SISTEMA
        var fecha = moment();
        var anio = fecha.format('YYYY');
        var mes = fecha.format('MM');
        var dia = fecha.format('DD');

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

        // METODO PARA REGISTRAR DOCUMENTOS   --**VERIFICADO
        this.router.post('/registrar/:doc_nombre', TokenValidation, upload.single('uploads'), DOCUMENTOS_CONTROLADOR.CrearDocumento);
        // METODO PARA LISTAR CARPETAS
        this.router.get('/carpetas/', DOCUMENTOS_CONTROLADOR.Carpetas);
        // METODO PARA LISTAR ARCHIVOS DE CARPETAS
        this.router.get('/lista-carpetas/:nom_carpeta', DOCUMENTOS_CONTROLADOR.ListarArchivosCarpeta);
        // METODO PARA LISTAR DOCUMENTOS DE DOCUMENTACION  --**VERIFICADO
        this.router.get('/documentacion/:nom_carpeta', DOCUMENTOS_CONTROLADOR.ListarCarpetaDocumentos);
        // METODO PARA LISTAR DOCUMENTOS DE CONTRATOS
        this.router.get('/lista-contratos/:nom_carpeta', DOCUMENTOS_CONTROLADOR.ListarCarpetaContratos);
        // METODO PARA LISTAR DOCUMENTOS DE PERMISOS
        this.router.get('/lista-permisos/:nom_carpeta', DOCUMENTOS_CONTROLADOR.ListarCarpetaPermisos);
        // METODO PARA LISTAR ARCHIVOS DE PERMISOS
        this.router.get('/lista-archivos-individuales/:nom_carpeta/tipo/:tipo', DOCUMENTOS_CONTROLADOR.ListarArchivosIndividuales);
        // METODO PARA LISTAR DOCUMENTOS DE HORARIOS
        this.router.get('/lista-horarios/:nom_carpeta', DOCUMENTOS_CONTROLADOR.ListarCarpetaHorarios);
        // METODO PARA DESCARGAR ARCHIVOS
        this.router.get('/download/files/:nom_carpeta/:filename', DOCUMENTOS_CONTROLADOR.DownLoadFile);
        // METODO PARA DESCARGAR ARCHIVOS INDIVIDUALES
        this.router.get('/download/files/:nom_carpeta/:filename/tipo/:tipo', DOCUMENTOS_CONTROLADOR.DescargarArchivos);
        // METODO PARA ELIMINAR ARCHIVOS
        this.router.delete('/eliminar/:id/:documento', TokenValidation, DOCUMENTOS_CONTROLADOR.EliminarRegistros);

    }

}

const DOCUMENTOS_RUTAS = new DoumentosRutas();

export default DOCUMENTOS_RUTAS.router;