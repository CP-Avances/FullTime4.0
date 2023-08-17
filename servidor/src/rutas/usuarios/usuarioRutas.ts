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
        // METODO PARA REGISTRAR ACCESOS AL SISTEMA
        this.router.post('/acceso', USUARIO_CONTROLADOR.AuditarAcceso);
        // METODO PARA ACTUALIZAR CONTRASEÑA
        this.router.put('/', TokenValidation, USUARIO_CONTROLADOR.CambiarPasswordUsuario);
        // ADMINISTRACION MODULO DE ALIMENTACION
        this.router.put('/admin/comida', TokenValidation, USUARIO_CONTROLADOR.RegistrarAdminComida);
        // METODO PARA REGISTRAR FRASE DE SEGURIDAD
        this.router.put('/frase', TokenValidation, USUARIO_CONTROLADOR.ActualizarFrase);
        // METODO PARA BUSCAR DATOS DE USUARIOS Y CARGOS TIMBRE WEB
        this.router.get('/lista-web-cargos/:estado/activo/:habilitado', TokenValidation, USUARIO_CONTROLADOR.UsuariosTimbreWebCargos);
        // METODO PARA BUSCAR DATOS DE USUARIOS TIMBRE WEB
        this.router.get('/lista-web/:estado/activo/:habilitado', TokenValidation, USUARIO_CONTROLADOR.UsuariosTimbreWeb);
        // METODO PARA ACTUALIZAR ESTADO DE TIMBRE WEB
        this.router.put('/lista-web/', TokenValidation, USUARIO_CONTROLADOR.ActualizarEstadoTimbreWeb);
        // METODO PARA BUSCAR DATOS DE USUARIOS TIMBRE MOVIL
        this.router.get('/lista-app-movil/:estado/activo/:habilitado', TokenValidation, USUARIO_CONTROLADOR.UsuariosTimbreMovil);
        // METODO PARA BUSCAR DATOS DE USUARIOS TIMBRE MOVIL
        this.router.get('/lista-app-movil-cargos/:estado/activo/:habilitado', TokenValidation, USUARIO_CONTROLADOR.UsuariosTimbreMovilCargos);
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









        this.router.get('/', TokenValidation, USUARIO_CONTROLADOR.list);
        this.router.get('/busqueda/:usuario', TokenValidation, USUARIO_CONTROLADOR.getIdByUsuario);
        this.router.get('/noEnrolados', TokenValidation, USUARIO_CONTROLADOR.ListarUsuriosNoEnrolados);

    }
}

const USUARIO_RUTA = new UsuarioRutas();

export default USUARIO_RUTA.router;