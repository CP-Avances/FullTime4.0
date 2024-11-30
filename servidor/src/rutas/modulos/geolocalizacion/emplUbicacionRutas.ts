import { Router } from 'express';
import { TokenValidation } from '../../../libs/verificarToken';
import UBICACION_CONTROLADOR from '../../../controlador/modulos/geolocalizacion/emplUbicacionControlador';

// ALMACENAMIENTO DEL CERTIFICADO DE VACUNACIÓN EN CARPETA
const multipart = require('connect-multiparty');
const multipartMiddleware = multipart({
    uploadDir: './carnetVacuna',
});

class UbicacionRutas {
    public router: Router = Router();

    constructor() {
        this.configuracion();
    }

    configuracion(): void {

        /** *********************************************************************************************** **
         ** **                     CONSULTAS DE COORDENADAS DE UBICACION DEL USUARIO                     ** **
         ** *********************************************************************************************** **/

        // LISTAR COORDENADAS DE UBICACION DEL USUARIO    **USADO
        this.router.get('/coordenadas-usuario/:id_empl', TokenValidation, UBICACION_CONTROLADOR.ListarRegistroUsuario);
        // METODO PARA REGISTRAR COORDENADAS DEL USUARIO    **USADO
        this.router.post('/coordenadas-usuario', TokenValidation, UBICACION_CONTROLADOR.RegistrarCoordenadasUsuario);
        // METODO PARA LISTAR DATOS DE UBICACIONES       **USADO
        this.router.get('/coordenadas-usuarios/general/:id_ubicacion', UBICACION_CONTROLADOR.ListarRegistroUsuarioU);
        // METODO PARA ELIMINAR REGISTROS   **USADO
        this.router.delete('/eliminar-coordenadas-usuario', TokenValidation, UBICACION_CONTROLADOR.EliminarCoordenadasUsuario);


        /** *********************************************************************************************** **
         ** **           RUTAS DE ACCESO A CONSULTAS DE COORDENADAS DE UBICACIÓN GENERALES               ** **
         ** *********************************************************************************************** **/
        // METODO PARA REGISTRAR UNA UBICACION   **USADO
        this.router.post('/', TokenValidation, UBICACION_CONTROLADOR.RegistrarCoordenadas);
        // METODO PARA ACTUALIZAR COORDENADAS DE UBICACION    **USADO
        this.router.put('/', TokenValidation, UBICACION_CONTROLADOR.ActualizarCoordenadas);
        // METODO PARA LISTAR COORDENADAS   **USADO
        this.router.get('/', TokenValidation, UBICACION_CONTROLADOR.ListarCoordenadas);
        // METODO PARA BUSCAR UNA UBICACIONES CON EXCEPCION    **USADO
        this.router.get('/especifico/:id', TokenValidation, UBICACION_CONTROLADOR.ListarCoordenadasDefinidas);
        // METODO PARA LISTAR DATOS DE UNA UBICACION ESPECIFICA  **USADO
        this.router.get('/determinada/:id', UBICACION_CONTROLADOR.ListarUnaCoordenada);
        // METODO PARA ELIMINAR REGISTROS    **USADO
        this.router.delete('/eliminar/:id', TokenValidation, UBICACION_CONTROLADOR.EliminarCoordenadas);
    }
}

const UBICACION_RUTAS = new UbicacionRutas();

export default UBICACION_RUTAS.router;