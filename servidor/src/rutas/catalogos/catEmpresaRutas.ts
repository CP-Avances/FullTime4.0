import EMPRESA_CONTROLADOR from '../../controlador/catalogos/catEmpresaControlador';
import { ObtenerRutaLogos } from '../../libs/accesoCarpetas';
import { TokenValidation } from '../../libs/verificarToken';
import { Router } from 'express';
import moment from 'moment';
import multer from 'multer';

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        var ruta = ObtenerRutaLogos();
        cb(null, ruta)
    },
    filename: function (req, file, cb) {
        // FECHA DEL SISTEMA
        var fecha = moment();
        var anio = fecha.format('YYYY');
        var mes = fecha.format('MM');
        var dia = fecha.format('DD');

        let documento = anio + '_' + mes + '_' + dia + '_' + file.originalname;

        cb(null, documento);
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

        // CONSULTA USADA EN MODULO DE ALMUERZOS
        this.router.get('/logo/codificados/:id_empresa', EMPRESA_CONTROLADOR.getImagenBase64);

    }
}

const EMPRESA_RUTAS = new DepartamentoRutas();

export default EMPRESA_RUTAS.router;