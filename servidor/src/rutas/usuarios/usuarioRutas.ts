import { Router } from 'express';
import { USUARIO_CONTROLADOR } from '../../controlador/usuarios/usuarioControlador'
import { TokenValidation } from '../../libs/verificarToken'

class UsuarioRutas {
    public router: Router = Router();

    constructor() {
        this.configuracion();
    }

    configuracion(): void {

        // CREAR REGISTRO DE USUARIOS
        this.router.post('/', TokenValidation, USUARIO_CONTROLADOR.CrearUsuario);
        // METODO DE BUSQUEDA DE DATOS DE USUARIO
        this.router.get('/datos/:id_empleado', TokenValidation, USUARIO_CONTROLADOR.ObtenerDatosUsuario);
        // METODO DE BUSQUEDA DE DATOS DE USUARIO POR EL TIPO DE DEPARTAMENTO
        this.router.get('/dato/:id_empleado', TokenValidation, USUARIO_CONTROLADOR.ObtenerDepartamentoUsuarios);
        // METODO PARA ACTUALIZAR DATOS DE USUARIO
        this.router.put('/actualizarDatos', TokenValidation, USUARIO_CONTROLADOR.ActualizarUsuario);
        // METODO PARA ACTUALIZAR CONTRASEÑA
        this.router.put('/', TokenValidation, USUARIO_CONTROLADOR.CambiarPasswordUsuario);
        // ADMINISTRACION MODULO DE ALIMENTACION
        this.router.put('/admin/comida', TokenValidation, USUARIO_CONTROLADOR.RegistrarAdminComida);
        // METODO PARA REGISTRAR FRASE DE SEGURIDAD
        this.router.put('/frase', TokenValidation, USUARIO_CONTROLADOR.ActualizarFrase);

        // METODO PARA ACTUALIZAR ESTADO DE TIMBRE WEB
        this.router.put('/lista-web/', TokenValidation, USUARIO_CONTROLADOR.ActualizarEstadoTimbreWeb);

        // METODO PARA ACTUALIZAR ESTADO DE TIMBRE MOVIL
        this.router.put('/lista-app-movil/', TokenValidation, USUARIO_CONTROLADOR.ActualizarEstadoTimbreMovil);
        // LISTAR DISPOSITIVOS REGISTRADOS
        this.router.get('/registro-dispositivos/', TokenValidation, USUARIO_CONTROLADOR.ListarDispositivosMoviles);
        // METODO PARA ELIMINAR REGISTROS DE DISPOSITIVOS MOVILES
        this.router.delete('/delete-registro-dispositivos/:dispositivo', TokenValidation, USUARIO_CONTROLADOR.EliminarDispositivoMovil);
        // METODO PARA ENVIAR CORREO DE FRASE DE SEGURIDAD
        this.router.post('/frase/olvido-frase', USUARIO_CONTROLADOR.RestablecerFrase);
        // METODO PARA CAMBIAR FRASE DE SEGURIDAD
        this.router.post('/frase/restaurar-frase/nueva', USUARIO_CONTROLADOR.CambiarFrase);

        // METODO PARA BUSCAR DATOS DE USUARIOS TIMBRE WEB SUPERADMINISTRADOR
        this.router.get('/lista-web-superior/:estado/activo/:habilitado', TokenValidation, USUARIO_CONTROLADOR.UsuariosTimbreWeb_SUPERADMIN);
        // METODO PARA BUSCAR DATOS DE USUARIOS TIMBRE WEB ADMINISTRADOR
        this.router.post('/lista-web-general/:estado/activo/:habilitado', TokenValidation, USUARIO_CONTROLADOR.UsuariosTimbreWeb_ADMIN);
        // METODO PARA BUSCAR DATOS DE USUARIOS TIMBRE WEB ADMINISTRADOR JEFE
        this.router.post('/lista-web-jefe/:estado/activo/:habilitado', TokenValidation, USUARIO_CONTROLADOR.UsuariosTimbreWeb_JEFE);


        // METODO PARA BUSCAR DATOS DE USUARIOS TIMBRE MOVIL SUPERADMINISTRADOR
        this.router.get('/lista-app-movil-superior/:estado/activo/:habilitado', TokenValidation, USUARIO_CONTROLADOR.UsuariosTimbreMovil_SUPERADMIN);
        // METODO PARA BUSCAR DATOS DE USUARIOS TIMBRE MOVIL ADMINISTRADOR
        this.router.post('/lista-app-movil-general/:estado/activo/:habilitado', TokenValidation, USUARIO_CONTROLADOR.UsuariosTimbreMovil_ADMIN);
        // METODO PARA BUSCAR DATOS DE USUARIOS TIMBRE MOVIL SUPER ADMINISTRADOR
        this.router.post('/lista-app-movil-jefe/:estado/activo/:habilitado', TokenValidation, USUARIO_CONTROLADOR.UsuariosTimbreMovil_JEFE);



        // METODO PARA BUSCAR LISTA DE ID_SUCURSAL DE ASIGNACIONES USUARIO - DEPARTAMENTO
        this.router.post('/buscar-usuario-sucursal', TokenValidation, USUARIO_CONTROLADOR.BuscarUsuarioSucursal);
        // CREAR REGISTRO DE USUARIOS - DEPARTAMENTOS
        this.router.post('/usuario-departamento', TokenValidation, USUARIO_CONTROLADOR.CrearUsuarioDepartamento);
        // METODO PARA BUSCAR DATOS DE USUARIO - DEPARTAMENTOS
        this.router.post('/buscar-usuario-departamento', TokenValidation, USUARIO_CONTROLADOR.BuscarUsuarioDepartamento);
        // METODO PARA OBTENER IDS DE USUARIOS - DEPARTAMENTOS
        this.router.post('/buscar-ids-usuarios-departamento', TokenValidation, USUARIO_CONTROLADOR.ObtenerIdUsuariosDepartamento);
        // METODO BUSCAR ASIGNACION DE USUARIO - DEPARTAMENTO
        this.router.post('/buscar-asignacion-usuario-departamento', TokenValidation, USUARIO_CONTROLADOR.BuscarAsignacionUsuarioDepartamento);
        // METODO PARA ACTUALIZAR DATOS DE USUARIO - DEPARTAMENTO
        this.router.put('/actualizar-usuario-departamento', TokenValidation, USUARIO_CONTROLADOR.ActualizarUsuarioDepartamento);
        // METODO PARA ELIMINAR REGISTRO USUARIO - DEPARTAMENTO
        this.router.delete('/eliminar-usuario-departamento', TokenValidation, USUARIO_CONTROLADOR.EliminarUsuarioDepartamento);

    }
}

const USUARIO_RUTA = new UsuarioRutas();

export default USUARIO_RUTA.router;