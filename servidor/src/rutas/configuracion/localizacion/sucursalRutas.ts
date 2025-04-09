import { Router } from 'express';
import { TokenValidation } from '../../../libs/verificarToken'
import SUCURSAL_CONTROLADOR from '../../../controlador/configuracion/localizacion/sucursalControlador';

import multer from 'multer';
import { ObtenerRutaLeerPlantillas } from '../../../libs/accesoCarpetas';

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



class SucursalRutas {
    public router: Router = Router();

    constructor() {
        this.configuracion();
    }

    configuracion(): void {

        // CREAR REGISTRO DE ESTABLECIMIENTO  **USADO
        this.router.post('/', TokenValidation, SUCURSAL_CONTROLADOR.CrearSucursal);
        // BUSCAR REGISTROS DE ESTABLECIMIENTO POR SU NOMBRE  **USADO
        this.router.post('/nombre-sucursal', TokenValidation, SUCURSAL_CONTROLADOR.BuscarNombreSucursal);
        // ACTUALIZAR REGISTRO DE ESTABLECIMIENTO  **USADO
        this.router.put('/', TokenValidation, SUCURSAL_CONTROLADOR.ActualizarSucursal);
        // LISTA DE SUCURSALES POR ID DE EMPRESA  **USADO
        this.router.get('/empresa-sucursal/:id_empresa', TokenValidation, SUCURSAL_CONTROLADOR.ObtenerSucursalEmpresa);
        // LISTAR SUCURSALES **USADO
        this.router.get('/', TokenValidation, SUCURSAL_CONTROLADOR.ListarSucursales);
        // ELIMINAR REGISTRO **USADO
        this.router.delete('/eliminar/:id', TokenValidation, SUCURSAL_CONTROLADOR.EliminarRegistros);
        // METODO PARA BUSCAR DATOS DE UNA SUCURSAL  **USADO
        this.router.get('/unaSucursal/:id', TokenValidation, SUCURSAL_CONTROLADOR.ObtenerUnaSucursal);

        // METODO PARA VERIIFCAR DATOS DE LA PLANTILLA  **USADO
        this.router.post('/upload/revision', [TokenValidation, upload.single('uploads')], SUCURSAL_CONTROLADOR.RevisarDatos);

        // METODO PARA REGISTRAR SUCURSALES DE PLANTILLA   **USADO
        this.router.post('/registraSucursales', TokenValidation, SUCURSAL_CONTROLADOR.RegistrarSucursales);
    }
}

const SUCURSAL_RUTAS = new SucursalRutas();

export default SUCURSAL_RUTAS.router;