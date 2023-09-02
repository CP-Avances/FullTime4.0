import { TokenValidation } from '../../libs/verificarToken';
import { Router } from 'express';
import multer from 'multer';
import EMPRESA_CONTROLADOR from '../../controlador/catalogos/catEmpresaControlador';

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'logos')
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
})

const upload = multer({ storage: storage });

class DepartamentoRutas {
    public router: Router = Router();

    constructor() {
        this.configuracion();
    }

    configuracion(): void {

        // CADENA DE NAVEGACION
        this.router.get('/navegar', EMPRESA_CONTROLADOR.BuscarCadena);
        // BUSQUEDA DE LOGO 
        this.router.get('/logo/codificado/:id_empresa', TokenValidation, EMPRESA_CONTROLADOR.getImagenBase64);
        // METODO PARA EDITAR LOGO DE EMPRESA
        this.router.put('/logo/:id_empresa/uploadImage', [TokenValidation, upload.single('image')], EMPRESA_CONTROLADOR.ActualizarLogoEmpresa);
        // BUSCAR DATOS GENERALES DE EMPRESA
        this.router.get('/buscar/datos/:id', TokenValidation, EMPRESA_CONTROLADOR.ListarEmpresaId);
        // ACTUALIZAR DATOS DE EMPRESA
        this.router.put('/', TokenValidation, EMPRESA_CONTROLADOR.ActualizarEmpresa);
        // ACTUALIZAR DATOS DE COLORES DE REPORTES
        this.router.put('/colores', [TokenValidation], EMPRESA_CONTROLADOR.ActualizarColores);
        // ACTUALIZAR DATOS DE MARCA DE AGUA DE REPORTE
        this.router.put('/reporte/marca', TokenValidation, EMPRESA_CONTROLADOR.ActualizarMarcaAgua);
        // METODO PARA ACTUALIZAR NIVEL DE SEGURIDAD DE EMPRESA
        this.router.put('/doble/seguridad', TokenValidation, EMPRESA_CONTROLADOR.ActualizarSeguridad);
        // METODO PARA ACTUALIZAR LOGO CABECERA DE CORREO
        this.router.put('/cabecera/:id_empresa/uploadImage', [TokenValidation, upload.single('image')], EMPRESA_CONTROLADOR.ActualizarCabeceraCorreo);
        // METODO PARA BUSCAR LOGO CABECERA DE CORREO
        this.router.get('/cabecera/codificado/:id_empresa', TokenValidation, EMPRESA_CONTROLADOR.VerCabeceraCorreo);
        // METODO PARA ACTUALIZAR LOGO PIE DE FIRMA CORREO
        this.router.put('/pie-firma/:id_empresa/uploadImage', [TokenValidation, upload.single('image')], EMPRESA_CONTROLADOR.ActualizarPieCorreo);
        // METODO PARA BUSCAR LOGO PIE DE FIRMA DE CORREO
        this.router.get('/pie-firma/codificado/:id_empresa', TokenValidation, EMPRESA_CONTROLADOR.VerPieCorreo);
        // METODO PARA ACTUALIZAR DATOS DE CORREO
        this.router.put('/credenciales/:id_empresa', TokenValidation, EMPRESA_CONTROLADOR.EditarPassword);
        // METODO PARA ACTUALIZAR USO DE ACCIONES
        this.router.put('/acciones-timbre', TokenValidation, EMPRESA_CONTROLADOR.ActualizarAccionesTimbres);













        this.router.get('/', TokenValidation, EMPRESA_CONTROLADOR.ListarEmpresa);
        this.router.get('/buscar/:nombre', TokenValidation, EMPRESA_CONTROLADOR.ListarUnaEmpresa);
        this.router.post('/', TokenValidation, EMPRESA_CONTROLADOR.CrearEmpresa);

        this.router.post('/xmlDownload/', TokenValidation, EMPRESA_CONTROLADOR.FileXML);
        this.router.get('/download/:nameXML', EMPRESA_CONTROLADOR.downloadXML);
        this.router.delete('/eliminar/:id', TokenValidation, EMPRESA_CONTROLADOR.EliminarRegistros);






        // CONSULTA USADA EN MÓDULO DE ALMUERZOS
        this.router.get('/logo/codificados/:id_empresa', EMPRESA_CONTROLADOR.getImagenBase64);









    }
}

const EMPRESA_RUTAS = new DepartamentoRutas();

export default EMPRESA_RUTAS.router;