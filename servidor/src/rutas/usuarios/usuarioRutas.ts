import { Router } from 'express';
import { USUARIO_CONTROLADOR } from '../../controlador/usuarios/usuarioControlador'
import { TokenValidation } from '../../libs/verificarToken'

class UsuarioRutas {
    public router: Router = Router();

    constructor() {
        this.configuracion();
    }

    configuracion(): void {

        // CREAR REGISTRO DE USUARIOS    **USADO
        this.router.post('/', TokenValidation, USUARIO_CONTROLADOR.CrearUsuario);
        // METODO DE BUSQUEDA DE DATOS DE USUARIO   **USADO
        this.router.get('/datos/:id_empleado', TokenValidation, USUARIO_CONTROLADOR.ObtenerDatosUsuario);
        // METODO DE BUSQUEDA DE DATOS DE USUARIO POR EL TIPO DE DEPARTAMENTO
        this.router.get('/dato/:id_empleado', TokenValidation, USUARIO_CONTROLADOR.ObtenerDepartamentoUsuarios);
        // METODO PARA ACTUALIZAR DATOS DE USUARIO   **USADO
        this.router.put('/actualizarDatos', TokenValidation, USUARIO_CONTROLADOR.ActualizarUsuario);
        // METODO PARA ACTUALIZAR CONTRASEÑA    **USADO
        this.router.put('/', TokenValidation, USUARIO_CONTROLADOR.CambiarPasswordUsuario);
        // ADMINISTRACION MODULO DE ALIMENTACION
        this.router.put('/admin/comida', TokenValidation, USUARIO_CONTROLADOR.RegistrarAdminComida);
        // METODO PARA REGISTRAR FRASE DE SEGURIDAD
        this.router.put('/frase', TokenValidation, USUARIO_CONTROLADOR.ActualizarFrase);

        // METODO PARA ACTUALIZAR ESTADO DE TIMBRE WEB    **USADO
        this.router.put('/lista-web/', TokenValidation, USUARIO_CONTROLADOR.ActualizarEstadoTimbreWeb);

        // METODO PARA ACTUALIZAR ESTADO DE TIMBRE MOVIL   **USADO
        this.router.put('/lista-app-movil/', TokenValidation, USUARIO_CONTROLADOR.ActualizarEstadoTimbreMovil);
        // LISTAR DISPOSITIVOS REGISTRADOS
        this.router.get('/registro-dispositivos/', TokenValidation, USUARIO_CONTROLADOR.ListarDispositivosMoviles);
        // METODO PARA ELIMINAR REGISTROS DE DISPOSITIVOS MOVILES    **USADO
        this.router.delete('/delete-registro-dispositivos/:dispositivo', TokenValidation, USUARIO_CONTROLADOR.EliminarDispositivoMovil);
        // METODO PARA ENVIAR CORREO DE FRASE DE SEGURIDAD
        this.router.post('/frase/olvido-frase', USUARIO_CONTROLADOR.RestablecerFrase);
        // METODO PARA CAMBIAR FRASE DE SEGURIDAD
        this.router.post('/frase/restaurar-frase/nueva', USUARIO_CONTROLADOR.CambiarFrase);

        // METODO PARA BUSCAR DATOS GENERALES DE USUARIOS TIMBRE WEB    **USADO
        this.router.get('/lista-web-general/:estado/activo/:habilitado', TokenValidation, USUARIO_CONTROLADOR.BuscarUsuariosTimbreWeb);

        // METODO PARA BUSCAR DATOS GENERALES DE USUARIOS TIMBRE MOVIL    **USADO
        this.router.get('/lista-app-movil-general/:estado/activo/:habilitado', TokenValidation, USUARIO_CONTROLADOR.UsuariosTimbreMovilGeneral);
        
        // METODO PARA BUSCAR LISTA DE ID_SUCURSAL DE ASIGNACIONES USUARIO - DEPARTAMENTO
        this.router.post('/buscar-usuario-sucursal', TokenValidation, USUARIO_CONTROLADOR.BuscarUsuarioSucursal);
        // CREAR REGISTRO DE USUARIOS - DEPARTAMENTOS    **USADO
        this.router.post('/usuario-departamento', TokenValidation, USUARIO_CONTROLADOR.CrearUsuarioDepartamento);
        // METODO PARA BUSCAR DATOS DE USUARIO - DEPARTAMENTOS - ASIGNACION DE INFORMACION **USADO
        this.router.post('/buscar-usuario-departamento', TokenValidation, USUARIO_CONTROLADOR.BuscarUsuarioDepartamento);
        // METODO PARA OBTENER IDS DE USUARIO MEDIANTE DEPARTAMENTO VIGENTE **USADO
        this.router.post('/buscar-ids-usuarios-departamento', TokenValidation, USUARIO_CONTROLADOR.ObtenerIdUsuariosDepartamento);
        // METODO BUSCAR ASIGNACION DE USUARIO - DEPARTAMENTO    **USADO
        this.router.post('/buscar-asignacion-usuario-departamento', TokenValidation, USUARIO_CONTROLADOR.BuscarAsignacionUsuarioDepartamento);
        // METODO PARA ACTUALIZAR DATOS DE USUARIO - DEPARTAMENTO   **USADO
        this.router.put('/actualizar-usuario-departamento', TokenValidation, USUARIO_CONTROLADOR.ActualizarUsuarioDepartamento);
        // METODO PARA ELIMINAR REGISTRO USUARIO - DEPARTAMENTO   **USADO
        this.router.delete('/eliminar-usuario-departamento', TokenValidation, USUARIO_CONTROLADOR.EliminarUsuarioDepartamento);
        // METODO PARA REGISTRAR MULTIPLES USUARIOS - DEPARTAMENTOS    **USADO
        this.router.post('/usuario-departamento/multiple', TokenValidation, USUARIO_CONTROLADOR.RegistrarUsuarioDepartamentoMultiple);

        //--------------------------------------------------------------------------------------------------------------------------------------
        // METODOS PARA APP MOVIL
        this.router.get('/IDdispositivos/:id_empleado',TokenValidation,  USUARIO_CONTROLADOR.getidDispositivo);
        this.router.post('/dispositivo/idDispositivo',  USUARIO_CONTROLADOR.getDispositivoPorIdDispositivo);
        this.router.post('/ingresarIDdispositivo',TokenValidation, USUARIO_CONTROLADOR.ingresarIDdispositivo);
        this.router.get('/usuarioEmpresa', TokenValidation, USUARIO_CONTROLADOR.getEmpleadosActivos);
        this.router.get('/usuario/:id', TokenValidation, USUARIO_CONTROLADOR.getUserById);

    }
}

const USUARIO_RUTA = new UsuarioRutas();

export default USUARIO_RUTA.router;