"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const usuarioControlador_1 = require("../../../controlador/empleado/usuarios/usuarioControlador");
const verificarToken_1 = require("../../../libs/verificarToken");
const express_1 = require("express");
class UsuarioRutas {
    constructor() {
        this.router = (0, express_1.Router)();
        this.configuracion();
    }
    configuracion() {
        // CREAR REGISTRO DE USUARIOS    **USADO
        this.router.post('/', verificarToken_1.TokenValidation, usuarioControlador_1.USUARIO_CONTROLADOR.CrearUsuario);
        // METODO DE BUSQUEDA DE DATOS DE USUARIO   **USADO
        this.router.get('/datos/:id_empleado', verificarToken_1.TokenValidation, usuarioControlador_1.USUARIO_CONTROLADOR.ObtenerDatosUsuario);
        // METODO PARA OBTENER IDS DE USUARIO MEDIANTE DEPARTAMENTO VIGENTE **USADO
        this.router.post('/buscar-ids-usuarios-departamento', verificarToken_1.TokenValidation, usuarioControlador_1.USUARIO_CONTROLADOR.ObtenerIdUsuariosDepartamento);
        // METODO PARA ACTUALIZAR DATOS DE USUARIO   **USADO
        this.router.put('/actualizarDatos', verificarToken_1.TokenValidation, usuarioControlador_1.USUARIO_CONTROLADOR.ActualizarUsuario);
        // METODO PARA ACTUALIZAR CONTRASEÑA    **USADO
        this.router.put('/', verificarToken_1.TokenValidation, usuarioControlador_1.USUARIO_CONTROLADOR.CambiarPasswordUsuario);
        // METODO PARA REGISTRAR FRASE DE SEGURIDAD
        this.router.put('/frase', verificarToken_1.TokenValidation, usuarioControlador_1.USUARIO_CONTROLADOR.ActualizarFrase);
        // METODO PARA ENVIAR CORREO DE FRASE DE SEGURIDAD
        this.router.post('/frase/olvido-frase', usuarioControlador_1.USUARIO_CONTROLADOR.RestablecerFrase);
        // METODO PARA CAMBIAR FRASE DE SEGURIDAD
        this.router.post('/frase/restaurar-frase/nueva', usuarioControlador_1.USUARIO_CONTROLADOR.CambiarFrase);
        // LISTAR DISPOSITIVOS REGISTRADOS
        this.router.get('/registro-dispositivos/', verificarToken_1.TokenValidation, usuarioControlador_1.USUARIO_CONTROLADOR.ListarDispositivosMoviles);
        // METODO PARA ELIMINAR REGISTROS DE DISPOSITIVOS MOVILES    **USADO
        this.router.delete('/delete-registro-dispositivos/:dispositivo', verificarToken_1.TokenValidation, usuarioControlador_1.USUARIO_CONTROLADOR.EliminarDispositivoMovil);
        //METODO PARA DEVOLVER LOS DATOS DEL EMPLEADO PARA LA ASIGNACION DE ACCION PERSONAL **USADO
        this.router.get('/infoEmpleado/:id_empleado', verificarToken_1.TokenValidation, usuarioControlador_1.USUARIO_CONTROLADOR.ObtenerInformacionUsuario);
        /** *********************************************************************************************** **
         ** **                       SERVICIOS USUARIOS QUE USAN TIMBRE WEB                              ** **
         ** *********************************************************************************************** */
        // METODO PARA BUSCAR DATOS GENERALES DE USUARIOS TIMBRE WEB    **USADO
        this.router.get('/lista-web-general/:estado/activo/:habilitado', verificarToken_1.TokenValidation, usuarioControlador_1.USUARIO_CONTROLADOR.BuscarUsuariosTimbreWeb);
        // METODO PARA BUSCAR DATOS GENERALES DE USUARIOS TIMBRE MOVIL    **USADO
        this.router.get('/lista-app-movil-general/:estado/activo/:habilitado', verificarToken_1.TokenValidation, usuarioControlador_1.USUARIO_CONTROLADOR.UsuariosTimbreMovilGeneral);
        // METODO PARA ACTUALIZAR ESTADO DE TIMBRE WEB    **USADO
        this.router.put('/lista-web/', verificarToken_1.TokenValidation, usuarioControlador_1.USUARIO_CONTROLADOR.ActualizarEstadoTimbreWeb);
        // METODO PARA ACTUALIZAR ESTADO DE TIMBRE MOVIL   **USADO
        this.router.put('/lista-app-movil/', verificarToken_1.TokenValidation, usuarioControlador_1.USUARIO_CONTROLADOR.ActualizarEstadoTimbreMovil);
        /** *********************************************************************************************** **
         ** **                     SERVICIOS DE USUARIO - SUCURSAL - DEPARTAMENTO                        ** **
         ** *********************************************************************************************** */
        // CREAR REGISTRO DE USUARIOS - DEPARTAMENTOS    **USADO
        this.router.post('/usuario-departamento', verificarToken_1.TokenValidation, usuarioControlador_1.USUARIO_CONTROLADOR.CrearUsuarioDepartamento);
        // METODO PARA BUSCAR DATOS DE USUARIO - DEPARTAMENTOS - ASIGNACION DE INFORMACION **USADO
        this.router.post('/buscar-usuario-departamento', verificarToken_1.TokenValidation, usuarioControlador_1.USUARIO_CONTROLADOR.BuscarUsuarioDepartamento);
        // METODO BUSCAR TODAS LAS ASIGNACIONES DE USUARIO - DEPARTAMENTO    **USADO    
        this.router.post('/buscar-todas-asignacion-usuario-departamento', verificarToken_1.TokenValidation, usuarioControlador_1.USUARIO_CONTROLADOR.BuscarAsignacionesUsuario);
        // METODO PARA ACTUALIZAR DATOS DE USUARIO - DEPARTAMENTO   **USADO
        this.router.put('/actualizar-usuario-departamento', verificarToken_1.TokenValidation, usuarioControlador_1.USUARIO_CONTROLADOR.ActualizarUsuarioDepartamento);
        // METODO PARA ELIMINAR REGISTRO USUARIO - DEPARTAMENTO   **USADO
        this.router.delete('/eliminar-usuario-departamento', verificarToken_1.TokenValidation, usuarioControlador_1.USUARIO_CONTROLADOR.EliminarUsuarioDepartamento);
        // METODO PARA REGISTRAR MULTIPLES USUARIOS - DEPARTAMENTOS    **USADO
        this.router.post('/usuario-departamento/multiple', verificarToken_1.TokenValidation, usuarioControlador_1.USUARIO_CONTROLADOR.RegistrarUsuarioDepartamentoMultiple);
        /** ************************************************************************************************************************ **
         ** **                 M E T O D O S    U S A D O S    E N    L A    A P L I C A C I O N    M O V I L                     ** **
         ** ************************************************************************************************************************ **/
        this.router.get('/IDdispositivos/:id_empleado', verificarToken_1.TokenValidation, usuarioControlador_1.USUARIO_CONTROLADOR.getidDispositivo);
        this.router.post('/dispositivo/idDispositivo', usuarioControlador_1.USUARIO_CONTROLADOR.getDispositivoPorIdDispositivo);
        this.router.post('/ingresarIDdispositivo', verificarToken_1.TokenValidation, usuarioControlador_1.USUARIO_CONTROLADOR.ingresarIDdispositivo);
        this.router.get('/usuarioEmpresa', verificarToken_1.TokenValidation, usuarioControlador_1.USUARIO_CONTROLADOR.getEmpleadosActivos);
        this.router.get('/usuario/:id', verificarToken_1.TokenValidation, usuarioControlador_1.USUARIO_CONTROLADOR.getUserById);
    }
}
const USUARIO_RUTA = new UsuarioRutas();
exports.default = USUARIO_RUTA.router;
