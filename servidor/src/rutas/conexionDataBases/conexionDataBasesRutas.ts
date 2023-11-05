import { ModuloPermisosValidation } from '../../libs/Modulos/verificarPermisos'
import { TokenValidation } from '../../libs/verificarToken'
import { Router } from 'express';
import CONEXION_DATABASES_CONTROLADOR from '../../controlador/conexionDataBases/conexionDataBasesControlador';

class ConexionDataBasesRutas {
    public router: Router = Router();

    constructor() {
        this.configuracion();
    }

    configuracion(): void {
        // METODO PARA OPTENER EL NOMBRE DE LA BASE DE DATOS
        this.router.get('/dataBase', TokenValidation, CONEXION_DATABASES_CONTROLADOR.getDatabaseName);
    }
}

const CONEXION_DATABASES_RUTAS = new ConexionDataBasesRutas();

export default CONEXION_DATABASES_RUTAS.router;