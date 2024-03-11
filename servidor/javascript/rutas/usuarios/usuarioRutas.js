"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const usuarioControlador_1 = require("../../controlador/usuarios/usuarioControlador");
const verificarToken_1 = require("../../libs/verificarToken");
class UsuarioRutas {
    constructor() {
        this.router = (0, express_1.Router)();
        this.configuracion();
    }
    configuracion() {
        // CREAR REGISTRO DE USUARIOS
        this.router.post('/', verificarToken_1.TokenValidation, usuarioControlador_1.USUARIO_CONTROLADOR.CrearUsuario);
        // METODO DE BUSQUEDA DE DATOS DE USUARIO
        this.router.get('/datos/:id_empleado', verificarToken_1.TokenValidation, usuarioControlador_1.USUARIO_CONTROLADOR.ObtenerDatosUsuario);
        // METODO DE BUSQUEDA DE DATOS DE USUARIO POR EL TIPO DE DEPARTAMENTO
        this.router.get('/dato/:id_empleado', verificarToken_1.TokenValidation, usuarioControlador_1.USUARIO_CONTROLADOR.ObtenerDepartamentoUsuarios);
        // METODO PARA ACTUALIZAR DATOS DE USUARIO
        this.router.put('/actualizarDatos', verificarToken_1.TokenValidation, usuarioControlador_1.USUARIO_CONTROLADOR.ActualizarUsuario);
        // METODO PARA REGISTRAR ACCESOS AL SISTEMA
        this.router.post('/acceso', usuarioControlador_1.USUARIO_CONTROLADOR.AuditarAcceso);
        // METODO PARA ACTUALIZAR CONTRASEÑA
        this.router.put('/', verificarToken_1.TokenValidation, usuarioControlador_1.USUARIO_CONTROLADOR.CambiarPasswordUsuario);
        // ADMINISTRACION MODULO DE ALIMENTACION
        this.router.put('/admin/comida', verificarToken_1.TokenValidation, usuarioControlador_1.USUARIO_CONTROLADOR.RegistrarAdminComida);
        // METODO PARA REGISTRAR FRASE DE SEGURIDAD
        this.router.put('/frase', verificarToken_1.TokenValidation, usuarioControlador_1.USUARIO_CONTROLADOR.ActualizarFrase);
        // METODO PARA ACTUALIZAR ESTADO DE TIMBRE WEB
        this.router.put('/lista-web/', verificarToken_1.TokenValidation, usuarioControlador_1.USUARIO_CONTROLADOR.ActualizarEstadoTimbreWeb);
        // METODO PARA BUSCAR DATOS DE USUARIOS TIMBRE MOVIL
        this.router.get('/lista-app-movil/:estado/activo/:habilitado', verificarToken_1.TokenValidation, usuarioControlador_1.USUARIO_CONTROLADOR.UsuariosTimbreMovil);
        // METODO PARA BUSCAR DATOS DE USUARIOS TIMBRE MOVIL
        this.router.get('/lista-app-movil-cargos/:estado/activo/:habilitado', verificarToken_1.TokenValidation, usuarioControlador_1.USUARIO_CONTROLADOR.UsuariosTimbreMovilCargos);
        // METODO PARA ACTUALIZAR ESTADO DE TIMBRE MOVIL
        this.router.put('/lista-app-movil/', verificarToken_1.TokenValidation, usuarioControlador_1.USUARIO_CONTROLADOR.ActualizarEstadoTimbreMovil);
        // LISTAR DISPOSITIVOS REGISTRADOS
        this.router.get('/registro-dispositivos/', verificarToken_1.TokenValidation, usuarioControlador_1.USUARIO_CONTROLADOR.ListarDispositivosMoviles);
        // METODO PARA ELIMINAR REGISTROS DE DISPOSITIVOS MOVILES
        this.router.delete('/delete-registro-dispositivos/:dispositivo', verificarToken_1.TokenValidation, usuarioControlador_1.USUARIO_CONTROLADOR.EliminarDispositivoMovil);
        // METODO PARA ENVIAR CORREO DE FRASE DE SEGURIDAD
        this.router.post('/frase/olvido-frase', usuarioControlador_1.USUARIO_CONTROLADOR.RestablecerFrase);
        // METODO PARA CAMBIAR FRASE DE SEGURIDAD
        this.router.post('/frase/restaurar-frase/nueva', usuarioControlador_1.USUARIO_CONTROLADOR.CambiarFrase);
        // METODO PARA BUSCAR DATOS DE USUARIOS TIMBRE WEB SUPERADMINISTRADOR
        this.router.get('/lista-web-superior/:estado/activo/:habilitado', verificarToken_1.TokenValidation, usuarioControlador_1.USUARIO_CONTROLADOR.UsuariosTimbreWeb_SUPERADMIN);
        // METODO PARA BUSCAR DATOS DE USUARIOS TIMBRE WEB ADMINISTRADOR
        this.router.post('/lista-web-general/:estado/activo/:habilitado', verificarToken_1.TokenValidation, usuarioControlador_1.USUARIO_CONTROLADOR.UsuariosTimbreWeb_ADMIN);
        // METODO PARA BUSCAR DATOS DE USUARIOS TIMBRE WEB ADMINISTRADOR JEFE
        this.router.post('/lista-web-jefe/:estado/activo/:habilitado', verificarToken_1.TokenValidation, usuarioControlador_1.USUARIO_CONTROLADOR.UsuariosTimbreWeb_JEFE);
        // METODO PARA BUSCAR DATOS DE USUARIOS Y SUCURSALES
        this.router.post('/buscar-usuario-sucursal', verificarToken_1.TokenValidation, usuarioControlador_1.USUARIO_CONTROLADOR.BuscarUsuarioSucursal);
        // CREAR REGISTRO DE USUARIOS - SUCURSAL
        this.router.post('/usuario-sucursal', verificarToken_1.TokenValidation, usuarioControlador_1.USUARIO_CONTROLADOR.CrearUsuarioSucursal);
        // METODO PARA BUSCAR DATOS DE USUARIO SUCURSAL PRINCIPAL (TRUE)
        this.router.post('/principal-usuario-sucursal', verificarToken_1.TokenValidation, usuarioControlador_1.USUARIO_CONTROLADOR.BuscarUsuarioSucursalPrincipal);
        // METODO PARA ACTUALIZAR DATOS DE USUARIO - SUCURSAL
        this.router.put('/actualizar-usuario-sucursal', verificarToken_1.TokenValidation, usuarioControlador_1.USUARIO_CONTROLADOR.ActualizarUsuarioSucursalPrincipal);
        // METODO PARA ELIMINAR REGISTRO USUARIO - SUCURSAL
        this.router.delete('/eliminar-usuario-sucursal/:id', verificarToken_1.TokenValidation, usuarioControlador_1.USUARIO_CONTROLADOR.EliminarUsuarioSucursal);
        this.router.get('/', verificarToken_1.TokenValidation, usuarioControlador_1.USUARIO_CONTROLADOR.list);
        this.router.get('/busqueda/:usuario', verificarToken_1.TokenValidation, usuarioControlador_1.USUARIO_CONTROLADOR.getIdByUsuario);
    }
}
const USUARIO_RUTA = new UsuarioRutas();
exports.default = USUARIO_RUTA.router;
