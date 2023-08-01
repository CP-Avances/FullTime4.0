import { ModuloPermisosValidation } from '../../libs/Modulos/verificarPermisos'
import { TokenValidation } from '../../libs/verificarToken'
import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import pool from '../../database';
import moment from 'moment';
moment.locale('es');

import PERMISOS_CONTROLADOR from '../../controlador/permisos/permisosControlador';

// METODO DE BUSQUEDA DE RUTAS DE ALMACENAMIENTO
const ObtenerRuta = async function (codigo: any) {
    var ruta = '';
    let separador = path.sep;

    const usuario = await pool.query(
        `
        SELECT cedula FROM empleados WHERE codigo = $1
        `
        , [codigo]);

    for (var i = 0; i < __dirname.split(separador).length - 3; i++) {
        if (ruta === '') {
            ruta = __dirname.split(separador)[i];
        }
        else {
            ruta = ruta + separador + __dirname.split(separador)[i];
        }
    }

    return ruta + separador + 'permisos' + separador + codigo + '_' + usuario.rows[0].cedula;
}

const storage = multer.diskStorage({

    destination: async function (req, file, cb) {
        let { codigo } = req.params;
        var ruta = await ObtenerRuta(codigo);
        cb(null, ruta)
    },
    filename: async function (req, file, cb) {

        // FECHA DEL SISTEMA
        var fecha = moment();
        var anio = fecha.format('YYYY');
        var mes = fecha.format('MM');
        var dia = fecha.format('DD');

        // DATOS DOCUMENTO
        let { id, codigo } = req.params;

        const permiso = await pool.query(
            `
            SELECT num_permiso FROM permisos WHERE id = $1
            `
            , [id]);

        let documento = permiso.rows[0].num_permiso + '_' + codigo + '_' + anio + '_' + mes + '_' + dia + '_' + file.originalname;

        cb(null, documento)
    }
})

const upload = multer({ storage: storage });

class PermisosRutas {
    public router: Router = Router();

    constructor() {
        this.configuracion();
    }

    configuracion(): void {

        // METODO PARA BUSCAR NUMERO DE PERMISO
        this.router.get('/numPermiso/:id_empleado', [TokenValidation, ModuloPermisosValidation], PERMISOS_CONTROLADOR.ObtenerNumPermiso);
        // METODO PARA BUSCAR PERMISOS SOLICITADOS 
        this.router.post('/permisos-solicitados-totales', [TokenValidation, ModuloPermisosValidation], PERMISOS_CONTROLADOR.BuscarPermisosTotales);
        // METODO PARA BUSCAR PERMISOS SOLICITADOS POR DIAS
        this.router.post('/permisos-solicitados', [TokenValidation, ModuloPermisosValidation], PERMISOS_CONTROLADOR.BuscarPermisosDias);
        // METODO PARA BUSCAR PERMISOS SOLICITADOS POR HORAS
        this.router.post('/permisos-solicitados-horas', [TokenValidation, ModuloPermisosValidation], PERMISOS_CONTROLADOR.BuscarPermisosHoras);
        // METODO PARA BUSCAR PERMISOS SOLICITADOS ACTUALIZAR
        this.router.post('/permisos-solicitados-totales-editar', [TokenValidation, ModuloPermisosValidation], PERMISOS_CONTROLADOR.BuscarPermisosTotalesEditar);
        // METODO PARA BUSCAR PERMISOS SOLICITADOS POR DIAS ACTUALIZAR
        this.router.post('/permisos-solicitados-editar', [TokenValidation, ModuloPermisosValidation], PERMISOS_CONTROLADOR.BuscarPermisosDiasEditar);
        // METODO PARA BUSCAR PERMISOS SOLICITADOS POR HORAS ACTUALIZAR
        this.router.post('/permisos-solicitados-horas-editar', [TokenValidation, ModuloPermisosValidation], PERMISOS_CONTROLADOR.BuscarPermisosHorasEditar);
        // CREAR PERMISO
        this.router.post('/', [TokenValidation, ModuloPermisosValidation], PERMISOS_CONTROLADOR.CrearPermisos);
        // ACTUALIZAR PERMISO
        this.router.put('/:id/permiso-solicitado', [TokenValidation, ModuloPermisosValidation], PERMISOS_CONTROLADOR.EditarPermiso);

        // GUARDAR DOCUMENTO DE RESPALDO DE PERMISO
        this.router.put('/:id/archivo/:archivo/validar/:codigo', [TokenValidation, ModuloPermisosValidation, upload.single('uploads')], PERMISOS_CONTROLADOR.GuardarDocumentoPermiso);

        // GUARDAR DOCUMENTO DE RESPALDO DE PERMISO APLICACION MOVIL
        this.router.put('/:id/archivo/:archivo/validar/:codigo', upload.single('uploads'), PERMISOS_CONTROLADOR.GuardarDocumentoPermiso);






        // ELIMINAR DOCUMENTO
        this.router.put('/eliminar-documento', [TokenValidation, ModuloPermisosValidation], PERMISOS_CONTROLADOR.EliminarDocumentoPermiso);


        // BUSQUEDA DE PERMISOS POR ID DE EMPLEADO
        this.router.get('/permiso-usuario/:id_empleado', [TokenValidation, ModuloPermisosValidation], PERMISOS_CONTROLADOR.ObtenerPermisoEmpleado);
        // BUSCAR INFORMACION DE UN PERMISO
        this.router.get('/informe-un-permiso/:id_permiso', [TokenValidation, ModuloPermisosValidation], PERMISOS_CONTROLADOR.InformarUnPermiso);

        // ELIMINAR PERMISO
        this.router.delete('/eliminar/:id_permiso/:doc/verificar/:codigo', [TokenValidation, ModuloPermisosValidation], PERMISOS_CONTROLADOR.EliminarPermiso);

        // METODO PARA CREAR ARCHIVO XML
        this.router.post('/xmlDownload/', TokenValidation, PERMISOS_CONTROLADOR.FileXML);
        // METODO PARA DESCARGAR ARCHIVO XML
        this.router.get('/download/:nameXML', PERMISOS_CONTROLADOR.downloadXML);
        // BUSQUEDA DE RESPALDOS DE PERMISOS
        this.router.get('/documentos/:docs/visualizar/:codigo', PERMISOS_CONTROLADOR.ObtenerDocumentoPermiso);
        // ENVIAR CORREO MEDIANTE APLICACION WEB
        this.router.post('/mail-noti/', [TokenValidation, ModuloPermisosValidation], PERMISOS_CONTROLADOR.EnviarCorreoWeb);
        // ENVIAR CORREO MEDIANTE APLICACION WEB SOLICITUDES MULTIPLES
        this.router.post('/mail-noti/solicitud-multiple', [TokenValidation, ModuloPermisosValidation], PERMISOS_CONTROLADOR.EnviarCorreoWebMultiple);







        this.router.get('/', [TokenValidation, ModuloPermisosValidation], PERMISOS_CONTROLADOR.ListarPermisos);
        this.router.get('/lista/', [TokenValidation, ModuloPermisosValidation], PERMISOS_CONTROLADOR.ListarEstadosPermisos);
        this.router.get('/lista-autorizados/', [TokenValidation, ModuloPermisosValidation], PERMISOS_CONTROLADOR.ListarPermisosAutorizados);
        this.router.get('/:id', [TokenValidation, ModuloPermisosValidation], PERMISOS_CONTROLADOR.ObtenerUnPermiso);
        this.router.get('/permiso/editar/:id', [TokenValidation, ModuloPermisosValidation], PERMISOS_CONTROLADOR.ObtenerPermisoEditar);
        this.router.get('/permisoContrato/:id_empl_contrato', [TokenValidation, ModuloPermisosValidation], PERMISOS_CONTROLADOR.ObtenerPermisoContrato);
        this.router.get('/datosSolicitud/:id_emple_permiso', [TokenValidation, ModuloPermisosValidation], PERMISOS_CONTROLADOR.ObtenerDatosSolicitud);
        this.router.get('/datosAutorizacion/:id_permiso', [TokenValidation, ModuloPermisosValidation], PERMISOS_CONTROLADOR.ObtenerDatosAutorizacion);

        this.router.post('/fechas_permiso/:codigo', [TokenValidation, ModuloPermisosValidation], PERMISOS_CONTROLADOR.ObtenerFechasPermiso);



        this.router.post('/permisos-solicitados/movil', PERMISOS_CONTROLADOR.BuscarPermisosDias);



        /** ************************************************************************************************** **
         ** **                         METODOS PARA MANEJO DE PERMISOS                                      ** **
         ** ************************************************************************************************** **/



        // ACTUALIZAR ESTADO DEL PERMISO
        this.router.put('/:id/estado', [TokenValidation, ModuloPermisosValidation], PERMISOS_CONTROLADOR.ActualizarEstado);
        // BUSCAR INFORMACION DE UN PERMISO
        this.router.get('/un-permiso/:id_permiso', [TokenValidation, ModuloPermisosValidation], PERMISOS_CONTROLADOR.ListarUnPermisoInfo);

        // ELIMINAR DOCUMENTO DE PERMISO DESDE APLICACION MOVIL
        this.router.delete('/eliminar-movil/:documento/validar:codigo', PERMISOS_CONTROLADOR.EliminarPermisoMovil);





        // ENVIAR CORREO MEDIANTE APLICACION MOVIL
        this.router.post('/mail-noti-permiso-movil/:id_empresa', PERMISOS_CONTROLADOR.EnviarCorreoPermisoMovil);


    }
}

const PERMISOS_RUTAS = new PermisosRutas();

export default PERMISOS_RUTAS.router;