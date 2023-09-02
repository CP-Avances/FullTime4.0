import DOCUMENTOS_CONTROLADOR from '../../controlador/documentos/documentosControlador';
import { TokenValidation } from '../../libs/verificarToken';
import { Router } from 'express';
import multer from 'multer';
import path from 'path';

const multipart = require('connect-multiparty');


const multipartMiddleware = multipart({
    uploadDir: './documentacion',
});

// METODO DE BUSQUEDA DE RUTAS DE ALMACENAMIENTO
const ObtenerRuta = function () {
    var ruta = '';
    let separador = path.sep;
    for (var i = 0; i < __dirname.split(separador).length - 3; i++) {
        if (ruta === '') {
            ruta = __dirname.split(separador)[i];
        }
        else {
            ruta = ruta + separador + __dirname.split(separador)[i];
        }
    }
    return ruta + separador + 'documentacion';
}

const storage = multer.diskStorage({

    destination: function (req, file, cb) {
        cb(null, ObtenerRuta())
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
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
        // METODO PARA LISTAR DOCUMENTOS DE HORARIOS
        this.router.get('/lista-horarios/:nom_carpeta', DOCUMENTOS_CONTROLADOR.ListarCarpetaHorarios);
        // METODO PARA DESCARGAR ARCHIVOS
        this.router.get('/download/files/:nom_carpeta/:filename', DOCUMENTOS_CONTROLADOR.DownLoadFile);
        // METODO PARA ELIMINAR ARCHIVOS
        this.router.delete('/eliminar/:id/:documento', TokenValidation, DOCUMENTOS_CONTROLADOR.EliminarRegistros);
  
    }

}

const DOCUMENTOS_RUTAS = new DoumentosRutas();

export default DOCUMENTOS_RUTAS.router;