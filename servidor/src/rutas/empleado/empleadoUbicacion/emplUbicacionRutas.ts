import { Router } from 'express';
import { TokenValidation } from '../../../libs/verificarToken';
import UBICACION_CONTROLADOR from '../../../controlador/empleado/empleadoUbicacion/emplUbicacionControlador';

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
         
        // LISTAR COORDENADAS DE UBICACION DEL USUARIO
        this.router.get('/coordenadas-usuario/:id_empl', TokenValidation, UBICACION_CONTROLADOR.ListarRegistroUsuario);
       
        this.router.post('/coordenadas-usuario', TokenValidation, UBICACION_CONTROLADOR.RegistrarCoordenadasUsuario);
        this.router.get('/coordenadas-usuarios/general/:id_ubicacion', UBICACION_CONTROLADOR.ListarRegistroUsuarioU);
        this.router.delete('/eliminar-coordenadas-usuario/:id', TokenValidation, UBICACION_CONTROLADOR.EliminarCoordenadasUsuario);


        /** *********************************************************************************************** **
         ** **           RUTAS DE ACCESO A CONSULTAS DE COORDENADAS DE UBICACIÓN GENERALES               ** **
         ** *********************************************************************************************** **/

        this.router.post('/', TokenValidation, UBICACION_CONTROLADOR.RegistrarCoordenadas);
        this.router.put('/', TokenValidation, UBICACION_CONTROLADOR.ActualizarCoordenadas);
        this.router.get('/', TokenValidation, UBICACION_CONTROLADOR.ListarCoordenadas);
        this.router.get('/especifico/:id', TokenValidation, UBICACION_CONTROLADOR.ListarCoordenadasDefinidas);
        this.router.get('/determinada/:id', UBICACION_CONTROLADOR.ListarUnaCoordenada);
        this.router.get('/ultimo-registro', UBICACION_CONTROLADOR.BuscarUltimoRegistro);
        this.router.delete('/eliminar/:id', TokenValidation, UBICACION_CONTROLADOR.EliminarCoordenadas);
    }
}

const UBICACION_RUTAS = new UbicacionRutas();

export default UBICACION_RUTAS.router;