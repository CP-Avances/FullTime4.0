import { Router } from 'express';

import TIPO_PERMISOS_CONTROLADOR from '../../../controlador/modulos/permisos/catTipoPermisosControlador';
import { TokenValidation } from '../../../libs/verificarToken';

class TipoPermisosRutas {
    public router: Router = Router();

    constructor() {
        this.configuracion();
    }

    configuracion(): void {

        // METODO PARA BUSCAR TIPOS DE PERMISOS
        this.router.get('/', TokenValidation, TIPO_PERMISOS_CONTROLADOR.Listar);
        // METODO PARA ELIMINAR REGISTROS
        this.router.delete('/eliminar/:id', TokenValidation, TIPO_PERMISOS_CONTROLADOR.EliminarRegistros);
        // METODO PARA BUSCAR DATOS DE UN TIPO DE PERMISO
        this.router.get('/:id', TokenValidation, TIPO_PERMISOS_CONTROLADOR.BuscarUnTipoPermiso);
        // METODO PARA REGISTRAR TIPO DE PERMISO
        this.router.post('/', TokenValidation, TIPO_PERMISOS_CONTROLADOR.Crear);
        // METODO PARA EDITAR REGISTRO
        this.router.put('/editar/:id', TokenValidation, TIPO_PERMISOS_CONTROLADOR.Editar);
        // METODO PARA LISTAR TIPO DE PERMISOS DE ACUERDO AL ROL
        this.router.get('/acceso/:acce_empleado', TokenValidation, TIPO_PERMISOS_CONTROLADOR.ListarTipoPermisoRol);

    }
}

const TIPO_PERMISOS_RUTAS = new TipoPermisosRutas();

export default TIPO_PERMISOS_RUTAS.router;