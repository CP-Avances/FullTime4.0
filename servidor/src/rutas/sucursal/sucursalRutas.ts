import { Router } from 'express';
import { TokenValidation } from '../../libs/verificarToken'
import SUCURSAL_CONTROLADOR from '../../controlador/sucursal/sucursalControlador';

class SucursalRutas {
    public router: Router = Router();

    constructor() {
        this.configuracion();
    }

    configuracion(): void {

        // CREAR REGISTRO DE ESTABLECIMIENTO
        this.router.post('/', TokenValidation, SUCURSAL_CONTROLADOR.CrearSucursal);
        // BUSCAR REGISTROS DE ESTABLECIMIENTO POR SU NOMBRE
        this.router.post('/nombre-sucursal', TokenValidation, SUCURSAL_CONTROLADOR.BuscarNombreSucursal);
        // ACTUALIZAR REGISTRO DE ESTABLECIMIENTO
        this.router.put('/', TokenValidation, SUCURSAL_CONTROLADOR.ActualizarSucursal);
        // LISTA DE SUCURSALES POR ID DE EMPRESA
        this.router.get('/empresa-sucursal/:id_empresa', TokenValidation, SUCURSAL_CONTROLADOR.ObtenerSucursalEmpresa);
        // LISTAR SUCURSALES
        this.router.get('/', TokenValidation, SUCURSAL_CONTROLADOR.ListarSucursales);
        // ELIMINAR REGISTRO
        this.router.delete('/eliminar/:id', TokenValidation, SUCURSAL_CONTROLADOR.EliminarRegistros);
        // METODO PARA CREAR ARCHIVO XML
        this.router.post('/xmlDownload/', TokenValidation, SUCURSAL_CONTROLADOR.FileXML);
        // METODO PARA DESCARGAR ARCHIVO XML
        this.router.get('/download/:nameXML', SUCURSAL_CONTROLADOR.downloadXML);
        // METODO PARA BUSCAR DATOS DE UNA SUCURSAL
        this.router.get('/unaSucursal/:id', TokenValidation, SUCURSAL_CONTROLADOR.ObtenerUnaSucursal);

    }
}

const SUCURSAL_RUTAS = new SucursalRutas();

export default SUCURSAL_RUTAS.router;