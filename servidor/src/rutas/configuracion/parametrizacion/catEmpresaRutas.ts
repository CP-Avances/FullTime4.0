import EMPRESA_CONTROLADOR from '../../../controlador/configuracion/parametrizacion/catEmpresaControlador';
import { ObtenerRutaLeerPlantillas } from '../../../libs/accesoCarpetas';
import { TokenValidation } from '../../../libs/verificarToken';
import { Router } from 'express';
import multer from 'multer';

const storage = multer.diskStorage({

    destination: function (req, file, cb) {
        cb(null, ObtenerRutaLeerPlantillas())
    },
    filename: function (req, file, cb) {
        let documento = file.originalname;

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

        // CADENA DE NAVEGACION   **USADO
        this.router.get('/navegar', EMPRESA_CONTROLADOR.BuscarCadena);
        // BUSCAR DATOS GENERALES DE EMPRESA  **USADO
        this.router.get('/buscar/datos/:id', TokenValidation, EMPRESA_CONTROLADOR.ListarEmpresaId);
        // ACTUALIZAR DATOS DE EMPRESA **USADO
        this.router.put('/', TokenValidation, EMPRESA_CONTROLADOR.ActualizarEmpresa);
        // ACTUALIZAR DATOS DE COLORES DE REPORTES **USADO
        this.router.put('/colores', [TokenValidation], EMPRESA_CONTROLADOR.ActualizarColores);
        // ACTUALIZAR DATOS DE MARCA DE AGUA DE REPORTE **USADO
        this.router.put('/reporte/marca', TokenValidation, EMPRESA_CONTROLADOR.ActualizarMarcaAgua);
        // METODO PARA ACTUALIZAR NIVEL DE SEGURIDAD DE EMPRESA **USADO
        this.router.put('/doble/seguridad', TokenValidation, EMPRESA_CONTROLADOR.ActualizarSeguridad);
        // BUSQUEDA DE LOGO **USADO
        this.router.get('/logo/codificado/:id_empresa', TokenValidation, EMPRESA_CONTROLADOR.ConvertirImagenBase64_);
        // METODO PARA EDITAR LOGO DE EMPRESA **USADO
        this.router.put('/logo/:id_empresa/uploadImage', [TokenValidation, upload.single('image')], EMPRESA_CONTROLADOR.ActualizarLogoEmpresa);
        // METODO PARA ACTUALIZAR LOGO CABECERA DE CORREO **USADO
        this.router.put('/cabecera/:id_empresa/uploadImage', [TokenValidation, upload.single('image')], EMPRESA_CONTROLADOR.ActualizarCabeceraCorreo);
        // METODO PARA BUSCAR LOGO CABECERA DE CORREO  **USADO
        this.router.get('/cabecera/codificado/:id_empresa', TokenValidation, EMPRESA_CONTROLADOR.VerCabeceraCorreo);
        // METODO PARA ACTUALIZAR LOGO PIE DE FIRMA CORREO  **USADO
        this.router.put('/pie-firma/:id_empresa/uploadImage', [TokenValidation, upload.single('image')], EMPRESA_CONTROLADOR.ActualizarPieCorreo);
        // METODO PARA BUSCAR LOGO PIE DE FIRMA DE CORREO **USADO
        this.router.get('/pie-firma/codificado/:id_empresa', TokenValidation, EMPRESA_CONTROLADOR.VerPieCorreo);
        // METODO PARA ACTUALIZAR DATOS DE CORREO  **USADO
        this.router.put('/credenciales/:id_empresa', TokenValidation, EMPRESA_CONTROLADOR.EditarPassword);
        // METODO PARA BUSCAR DATOS DE EMPRESA
        this.router.get('/', TokenValidation, EMPRESA_CONTROLADOR.ListarEmpresa);


        // CONSULTA USADA EN MODULO DE ALMUERZOS 
        this.router.get('/logo/codificados/:id_empresa', EMPRESA_CONTROLADOR.ConvertirImagenBase64_);

    }
}

const EMPRESA_RUTAS = new DepartamentoRutas();

export default EMPRESA_RUTAS.router;